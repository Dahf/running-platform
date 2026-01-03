import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Use service role client for webhook processing (bypasses RLS)
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Supabase admin client env vars missing")
  return createClient(url, key)
}

// Webhook secret for authentication (set this in n8n and your env vars)
const WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET || "your-webhook-secret"

interface StravaActivity {
  id: number
  name: string
  type: string
  distance: number
  moving_time: number
  elapsed_time: number
  total_elevation_gain: number
  start_date: string
  average_speed: number
  max_speed: number
  average_heartrate?: number
  max_heartrate?: number
  calories?: number
  map?: {
    summary_polyline: string
  }
}

interface WebhookPayload {
  type: "activity_sync" | "segment_sync" | "full_sync" | "connection_update"
  user_id: string
  strava_athlete_id?: number
  data?: StravaActivity | StravaActivity[] | Record<string, unknown>
  access_token?: string
  refresh_token?: string
  token_expires_at?: string
}

interface StravaUpdatePayload {
  type: "update"
  owner_id?: number
  object_id?: number
  object_type?: string
  updates?: Record<string, unknown>
  object_data?: Partial<StravaActivity> & { map?: { polyline?: string; summary_polyline?: string } }
}

// Validate webhook request
function validateWebhook(request: NextRequest): boolean {
  const authHeader = request.headers.get("x-webhook-secret")
  return authHeader === WEBHOOK_SECRET
}

// Map Strava activity type to our types
function mapActivityType(stravaType: string): "run" | "ride" | "swim" | "other" {
  const typeMap: Record<string, "run" | "ride" | "swim" | "other"> = {
    Run: "run",
    Ride: "ride",
    Swim: "swim",
    Walk: "run",
    Hike: "run",
    VirtualRide: "ride",
    VirtualRun: "run",
  }
  return typeMap[stravaType] || "other"
}

export async function POST(request: NextRequest) {
  // Log the webhook receipt
  let webhookLogId: string | null = null

  try {
    // Validate webhook secret
    if (!validateWebhook(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload: Partial<WebhookPayload | StravaUpdatePayload> = await request.json()

    // Basic payload validation
    const allowedTypes = ["connection_update", "activity_sync", "segment_sync", "full_sync", "update"] as const
    if (!payload.type || !allowedTypes.includes(payload.type as (typeof allowedTypes)[number])) {
      return NextResponse.json({ error: "Invalid webhook type", received: payload.type ?? null }, { status: 400 })
    }

    // Create webhook log entry
    const supabaseAdmin = getSupabaseAdmin()

    const { data: logData } = await supabaseAdmin
      .from("webhook_logs")
      .insert({
        webhook_type: payload.type,
        payload: payload,
        status: "received",
      })
      .select("id")
      .single()

    webhookLogId = logData?.id || null

    // Update status to processing
    if (webhookLogId) {
      await supabaseAdmin.from("webhook_logs").update({ status: "processing" }).eq("id", webhookLogId)
    }

    // Handle different webhook types
    switch (payload.type) {
      case "connection_update":
        await handleConnectionUpdate(payload)
        break

      case "activity_sync":
        await handleActivitySync(payload)
        break

      case "update": // compatibility alias -> treat as activity_sync
        await handleStravaUpdate(payload as StravaUpdatePayload)
        break

      case "segment_sync":
        await handleSegmentSync(payload)
        break

      case "full_sync":
        await handleFullSync(payload)
        break

      default:
        throw new Error(`Unknown webhook type: ${payload.type}`)
    }

    // Mark webhook as completed
    if (webhookLogId) {
      await supabaseAdmin
        .from("webhook_logs")
        .update({ status: "completed", processed_at: new Date().toISOString() })
        .eq("id", webhookLogId)
    }

    return NextResponse.json({ success: true, message: "Webhook processed successfully" })
  } catch (error) {
    console.error("Webhook processing error:", error)

    // Log the error
    if (webhookLogId) {
      const supabaseAdmin = getSupabaseAdmin()
      await supabaseAdmin
        .from("webhook_logs")
        .update({
          status: "failed",
          error_message: error instanceof Error ? error.message : "Unknown error",
          processed_at: new Date().toISOString(),
        })
        .eq("id", webhookLogId)
    }

    return NextResponse.json(
      { error: "Webhook processing failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// Handle Strava connection updates (tokens, etc.)
async function handleConnectionUpdate(payload: WebhookPayload) {
  if (!payload.user_id || !payload.strava_athlete_id) {
    throw new Error("Missing user_id or strava_athlete_id")
  }

  const supabaseAdmin = getSupabaseAdmin()

  const { error } = await supabaseAdmin.from("strava_connections").upsert(
    {
      user_id: payload.user_id,
      strava_athlete_id: payload.strava_athlete_id,
      access_token: payload.access_token,
      refresh_token: payload.refresh_token,
      token_expires_at: payload.token_expires_at,
      is_active: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  )

  if (error) throw error
}

// Handle Strava "update" webhook with object_data
async function handleStravaUpdate(payload: StravaUpdatePayload) {
  if (payload.object_type !== "activity") {
    throw new Error(`Unsupported object_type for update: ${payload.object_type ?? "unknown"}`)
  }
  if (!payload.owner_id) {
    throw new Error("Missing owner_id on update payload")
  }

  const supabaseAdmin = getSupabaseAdmin()

  // Lookup user by athlete id
  const { data: connection } = await supabaseAdmin
    .from("strava_connections")
    .select("user_id")
    .eq("strava_athlete_id", payload.owner_id)
    .single()

  if (!connection) {
    throw new Error(`No user mapping for strava athlete ${payload.owner_id}`)
  }

  const activityData = payload.object_data
  const stravaId = activityData?.id ?? payload.object_id

  if (!activityData || !stravaId) {
    throw new Error("Missing activity data or object_id on update payload")
  }

  const mappedType = mapActivityType(activityData.type || activityData.sport_type || "")
  const polyline = activityData.map?.summary_polyline ?? activityData.map?.polyline
  const title = (payload.updates?.title as string | undefined) || activityData.name

  const updateFields = {
    title,
    activity_type: mappedType,
    distance: activityData.distance,
    duration: activityData.moving_time,
    elevation_gain: activityData.total_elevation_gain,
    average_speed: activityData.average_speed,
    max_speed: activityData.max_speed,
    average_heart_rate: activityData.average_heartrate,
    max_heart_rate: activityData.max_heartrate,
    calories: activityData.calories,
    start_date: activityData.start_date,
    polyline,
  }

  // Upsert activity
  const { data: existing } = await supabaseAdmin
    .from("activities")
    .select("id")
    .eq("strava_id", stravaId)
    .single()

  if (existing) {
    await supabaseAdmin.from("activities").update(updateFields).eq("strava_id", stravaId)
  } else {
    await supabaseAdmin.from("activities").insert({
      user_id: connection.user_id,
      strava_id: stravaId,
      external_source: "strava",
      ...updateFields,
    })
  }
}

// Handle activity sync from Strava
async function handleActivitySync(payload: WebhookPayload) {
  if (!payload.user_id || !payload.data) {
    throw new Error("Missing user_id or activity data")
  }

  // Create sync history entry
  const supabaseAdmin = getSupabaseAdmin()

  const { data: syncHistory } = await supabaseAdmin
    .from("sync_history")
    .insert({
      user_id: payload.user_id,
      sync_type: "activities",
      status: "in_progress",
    })
    .select("id")
    .single()

  try {
    const activities = Array.isArray(payload.data) ? payload.data : [payload.data]
    let syncedCount = 0

    for (const activity of activities as StravaActivity[]) {
      // Check if activity already exists
      const { data: existing } = await supabaseAdmin
        .from("activities")
        .select("id")
        .eq("strava_id", activity.id)
        .single()

      if (existing) {
        // Update existing activity
        await supabaseAdmin
          .from("activities")
          .update({
            title: activity.name,
            activity_type: mapActivityType(activity.type),
            distance: activity.distance,
            duration: activity.moving_time,
            elevation_gain: activity.total_elevation_gain,
            average_speed: activity.average_speed,
            max_speed: activity.max_speed,
            average_heart_rate: activity.average_heartrate,
            max_heart_rate: activity.max_heartrate,
            calories: activity.calories,
            polyline: activity.map?.summary_polyline,
          })
          .eq("strava_id", activity.id)
      } else {
        // Insert new activity
        await supabaseAdmin.from("activities").insert({
          user_id: payload.user_id,
          strava_id: activity.id,
          title: activity.name,
          activity_type: mapActivityType(activity.type),
          distance: activity.distance,
          duration: activity.moving_time,
          elevation_gain: activity.total_elevation_gain,
          average_speed: activity.average_speed,
          max_speed: activity.max_speed,
          average_heart_rate: activity.average_heartrate,
          max_heart_rate: activity.max_heartrate,
          calories: activity.calories,
          start_date: activity.start_date,
          polyline: activity.map?.summary_polyline,
          external_source: "strava",
        })
      }
      syncedCount++
    }

    // Update sync history
    if (syncHistory?.id) {
      await supabaseAdmin
        .from("sync_history")
        .update({
          items_synced: syncedCount,
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", syncHistory.id)
    }

    // Update last sync time on connection
    await supabaseAdmin
      .from("strava_connections")
      .update({ last_sync_at: new Date().toISOString() })
      .eq("user_id", payload.user_id)
  } catch (error) {
    // Update sync history with error
    if (syncHistory?.id) {
      await supabaseAdmin
        .from("sync_history")
        .update({
          status: "failed",
          error_message: error instanceof Error ? error.message : "Unknown error",
          completed_at: new Date().toISOString(),
        })
        .eq("id", syncHistory.id)
    }
    throw error
  }
}

// Handle segment sync
async function handleSegmentSync(payload: WebhookPayload) {
  // Similar implementation for segments
  console.log("Segment sync not yet implemented", payload)
}

// Handle full sync (activities + segments + routes)
async function handleFullSync(payload: WebhookPayload) {
  await handleActivitySync(payload)
  // Add more sync operations as needed
}

// GET endpoint to verify webhook is working
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "n8n webhook endpoint is active",
    endpoints: {
      activity_sync: "POST with type: 'activity_sync'",
      connection_update: "POST with type: 'connection_update'",
      segment_sync: "POST with type: 'segment_sync'",
      full_sync: "POST with type: 'full_sync'",
    },
  })
}
