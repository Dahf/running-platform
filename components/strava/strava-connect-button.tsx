"use client"

import { Button } from "@/components/ui/button"

type Props = {
  redirectTo?: string
}

export function StravaConnectButton({ redirectTo = "/dashboard" }: Props) {
  const href = `/api/strava/auth?redirect=${encodeURIComponent(redirectTo)}`

  return (
    <Button asChild variant="secondary">
      <a href={href}>Mit Strava verbinden</a>
    </Button>
  )
}
