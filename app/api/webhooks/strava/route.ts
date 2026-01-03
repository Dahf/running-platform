import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Strava webhook verification
const STRAVA_VERIFY_TOKEN = process.env.STRAVA_VERIFY_TOKEN || "STRAVA_VERIFY"

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Supabase admin client env vars missing")
  return createClient(url, key)
}

// Strava webhook subscription verification (GET)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  if (mode === "subscribe" && token === STRAVA_VERIFY_TOKEN) {
    console.log("Strava webhook verified")
    return NextResponse.json({ "hub.challenge": challenge })
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 })
}

// Strava webhook events (POST)
export async function POST(request: NextRequest) {
  try {
    const event = await request.json()

    const supabaseAdmin = getSupabaseAdmin()

    // Log the webhook
    await supabaseAdmin.from("webhook_logs").insert({
      webhook_type: `strava_${event.aspect_type}_${event.object_type}`,
      payload: event,
      status: "received",
    })

    // Handle different event types
    if (event.object_type === "activity") {
      if (event.aspect_type === "create" || event.aspect_type === "update") {
        // Find the user with this Strava athlete ID
        const { data: connection } = await supabaseAdmin
          .from("strava_connections")
          .select("user_id, access_token")
          .eq("strava_athlete_id", event.owner_id)
          .single()

        if (connection) {
          // Queue the activity for sync (in production, you'd use a job queue)
          // For now, we'll just log it - n8n can handle the actual sync
          console.log(`Activity ${event.object_id} needs sync for user ${connection.user_id}`)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Strava webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
