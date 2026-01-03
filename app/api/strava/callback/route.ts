import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"

import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const clientId = process.env.STRAVA_CLIENT_ID
  const clientSecret = process.env.STRAVA_CLIENT_SECRET
  const url = new URL(request.url)
  const origin = `${url.protocol}//${url.host}`
  const redirectUri = process.env.STRAVA_REDIRECT_URI || `${origin}/api/strava/callback`

  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const errorParam = url.searchParams.get("error")

  if (errorParam) {
    return redirectWithMessage(url.searchParams.get("redirect") || "/dashboard", `strava_error=${errorParam}`)
  }
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 })
  }
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Strava client env missing" }, { status: 500 })
  }

  const cookieStore = await cookies()
  const storedState = cookieStore.get("strava_oauth_state")?.value
  if (!state || state !== storedState) {
    return redirectWithMessage("/dashboard", "strava_error=invalid_state")
  }
  cookieStore.delete("strava_oauth_state")

  const redirectAfter = cookieStore.get("strava_post_connect_redirect")?.value || "/dashboard"
  cookieStore.delete("strava_post_connect_redirect")

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return redirectWithMessage("/auth/login", "strava_error=not_authenticated")
  }

  const tokenRes = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  })

  if (!tokenRes.ok) {
    return redirectWithMessage(redirectAfter, "strava_error=token_exchange_failed")
  }

  const tokenJson = await tokenRes.json()
  const athleteId = tokenJson?.athlete?.id
  const accessToken = tokenJson?.access_token
  const refreshToken = tokenJson?.refresh_token
  const expiresAt = tokenJson?.expires_at

  if (!athleteId || !accessToken) {
    return redirectWithMessage(redirectAfter, "strava_error=invalid_token_response")
  }

  const { error: upsertError } = await supabase.from("strava_connections").upsert(
    {
      user_id: user.id,
      strava_athlete_id: athleteId,
      access_token: accessToken,
      refresh_token: refreshToken,
      token_expires_at: expiresAt ? new Date(expiresAt * 1000).toISOString() : null,
      is_active: true,
      connected_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  )

  if (upsertError) {
    return redirectWithMessage(redirectAfter, "strava_error=upsert_failed")
  }

  return redirectWithMessage(redirectAfter, "strava=connected")
}

function redirectWithMessage(path: string, query: string) {
  // Ensure absolute URL for Next redirect
  const urlObj = new URL(path, process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
  if (query) {
    const [key, value] = query.split("=")
    if (key && value) {
      urlObj.searchParams.set(key, value)
    }
  }
  return NextResponse.redirect(urlObj.toString())
}
