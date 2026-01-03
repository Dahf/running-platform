import crypto from "node:crypto"

import { NextResponse, type NextRequest } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const clientId = process.env.STRAVA_CLIENT_ID
  const url = new URL(request.url)
  const origin = `${url.protocol}//${url.host}`
  const redirectUri = process.env.STRAVA_REDIRECT_URI || `${origin}/api/strava/callback`

  if (!clientId) {
    return NextResponse.json({ error: "STRAVA_CLIENT_ID not configured" }, { status: 500 })
  }

  const redirectTo = url.searchParams.get("redirect") || "/dashboard"

  const state = crypto.randomBytes(16).toString("hex")
  const cookieStore = await cookies()
  cookieStore.set("strava_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 5,
  })
  cookieStore.set("strava_post_connect_redirect", redirectTo, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 5,
  })

  const authUrl = new URL("https://www.strava.com/oauth/authorize")
  authUrl.searchParams.set("client_id", clientId)
  authUrl.searchParams.set("response_type", "code")
  authUrl.searchParams.set("redirect_uri", redirectUri)
  authUrl.searchParams.set("approval_prompt", "auto")
  authUrl.searchParams.set("scope", "read,activity:read_all,profile:read_all")
  authUrl.searchParams.set("state", state)

  return NextResponse.redirect(authUrl.toString())
}
