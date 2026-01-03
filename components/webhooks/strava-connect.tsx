"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Link2, Unlink, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"
import { StravaConnectButton } from "@/components/strava/strava-connect-button"

interface StravaConnection {
  id: string
  strava_athlete_id: number
  is_active: boolean
  connected_at: string
  last_sync_at?: string
}

interface StravaConnectProps {
  userId: string
  connection: StravaConnection | null
}

export function StravaConnect({ userId, connection }: StravaConnectProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect your Strava account?")) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      await supabase.from("strava_connections").delete().eq("user_id", userId)
      router.refresh()
    } catch (error) {
      console.error("Error disconnecting:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualSync = async () => {
    setIsLoading(true)
    // In production, this would trigger an n8n workflow
    // For now, we'll just show that it was triggered
    setTimeout(() => {
      setIsLoading(false)
      alert("Sync request sent to n8n. Check your webhook logs for status.")
    }, 1000)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-[#FC4C02] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
              </svg>
            </div>
            <div>
              <CardTitle>Strava Connection</CardTitle>
              <CardDescription>
                {connection ? "Your account is connected" : "Connect to sync activities"}
              </CardDescription>
            </div>
          </div>
          {connection ? (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge variant="secondary">
              <AlertCircle className="h-3 w-3 mr-1" />
              Not Connected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {connection ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg border border-border p-3">
                <p className="text-muted-foreground">Athlete ID</p>
                <p className="font-semibold">{connection.strava_athlete_id}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-muted-foreground">Connected</p>
                <p className="font-semibold">{new Date(connection.connected_at).toLocaleDateString()}</p>
              </div>
              <div className="rounded-lg border border-border p-3 col-span-2">
                <p className="text-muted-foreground">Last Sync</p>
                <p className="font-semibold">
                  {connection.last_sync_at ? new Date(connection.last_sync_at).toLocaleString() : "Never"}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={handleManualSync}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Sync Now
              </Button>
              <Button variant="destructive" onClick={handleDisconnect} disabled={isLoading}>
                <Unlink className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Activities are synced automatically via n8n when new data is available from Strava.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-dashed border-border p-6 text-center space-y-3">
              <Link2 className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="font-medium">Strava verbinden</p>
              <p className="text-sm text-muted-foreground">
                Öffnet das Strava-OAuth-Fenster und legt das Mapping in deinem Konto an.
              </p>
              <div className="flex justify-center">
                <StravaConnectButton redirectTo="/dashboard/webhooks" />
              </div>
            </div>

            <div className="rounded-lg border border-border p-4 bg-muted/50">
              <h4 className="font-medium mb-2">Hinweis zu n8n (optional)</h4>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Falls du n8n nutzt, kannst du Tokens auch darüber erzeugen.</li>
                <li>Sende dann ein <code>connection_update</code> an <code>/api/webhooks/n8n</code>.</li>
                <li>Der Button oben nutzt direkt Strava OAuth ohne n8n.</li>
              </ol>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
