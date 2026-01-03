"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Webhook, Copy, CheckCircle2, XCircle, Clock, RefreshCw, Code, ExternalLink } from "lucide-react"

interface WebhookLog {
  id: string
  webhook_type: string
  payload: Record<string, unknown>
  status: string
  error_message?: string
  created_at: string
  processed_at?: string
}

interface WebhookManagerProps {
  webhooks: WebhookLog[]
  userId: string
}

export function WebhookManager({ webhooks, userId }: WebhookManagerProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const webhookUrl = typeof window !== "undefined" ? `${window.location.origin}/api/webhooks/n8n` : "/api/webhooks/n8n"

  const stravaWebhookUrl =
    typeof window !== "undefined" ? `${window.location.origin}/api/webhooks/strava` : "/api/webhooks/strava"

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "processing":
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      failed: "destructive",
      processing: "secondary",
      received: "outline",
    }
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>
  }

  const samplePayloads = {
    activity_sync: {
      type: "activity_sync",
      user_id: userId,
      data: {
        id: 123456789,
        name: "Morning Run",
        type: "Run",
        distance: 5000,
        moving_time: 1800,
        total_elevation_gain: 50,
        start_date: new Date().toISOString(),
        average_speed: 2.78,
        max_speed: 3.5,
        average_heartrate: 145,
        max_heartrate: 175,
      },
    },
    connection_update: {
      type: "connection_update",
      user_id: userId,
      strava_athlete_id: 12345678,
      access_token: "your_access_token",
      refresh_token: "your_refresh_token",
      token_expires_at: new Date(Date.now() + 21600000).toISOString(),
    },
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Webhook className="h-5 w-5 text-chart-1" />
          <CardTitle>Webhook Manager</CardTitle>
        </div>
        <CardDescription>Configure and monitor your n8n webhook integrations</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="config" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="logs">Logs ({webhooks.length})</TabsTrigger>
            <TabsTrigger value="docs">API Docs</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>n8n Webhook URL</Label>
                <div className="flex gap-2">
                  <Input value={webhookUrl} readOnly className="font-mono text-sm" />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(webhookUrl, "n8n")}>
                    {copied === "n8n" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Use this URL in your n8n workflow to send activity data</p>
              </div>

              <div className="space-y-2">
                <Label>Strava Webhook URL</Label>
                <div className="flex gap-2">
                  <Input value={stravaWebhookUrl} readOnly className="font-mono text-sm" />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(stravaWebhookUrl, "strava")}>
                    {copied === "strava" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Register this URL with Strava for real-time activity updates
                </p>
              </div>

              <div className="rounded-lg border border-border p-4 bg-muted/50">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Required Headers
                </h4>
                <div className="space-y-2 text-sm font-mono">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">x-webhook-secret:</span>
                    <span>{"<your-secret>"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Content-Type:</span>
                    <span>application/json</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            {webhooks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Webhook className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No webhook logs yet</p>
                <p className="text-sm">Logs will appear here when webhooks are received</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {webhooks.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {getStatusIcon(log.status)}
                      <div>
                        <p className="font-medium text-sm">{log.webhook_type}</p>
                        <p className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</p>
                        {log.error_message && <p className="text-xs text-red-500 mt-1">{log.error_message}</p>}
                      </div>
                    </div>
                    {getStatusBadge(log.status)}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="docs" className="space-y-4">
            <div className="space-y-4">
              <div className="rounded-lg border border-border p-4">
                <h4 className="font-medium mb-2">Activity Sync Payload</h4>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                  {JSON.stringify(samplePayloads.activity_sync, null, 2)}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 bg-transparent"
                  onClick={() => copyToClipboard(JSON.stringify(samplePayloads.activity_sync, null, 2), "activity")}
                >
                  {copied === "activity" ? (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  Copy
                </Button>
              </div>

              <div className="rounded-lg border border-border p-4">
                <h4 className="font-medium mb-2">Connection Update Payload</h4>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                  {JSON.stringify(samplePayloads.connection_update, null, 2)}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 bg-transparent"
                  onClick={() =>
                    copyToClipboard(JSON.stringify(samplePayloads.connection_update, null, 2), "connection")
                  }
                >
                  {copied === "connection" ? (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  Copy
                </Button>
              </div>

              <Button variant="outline" className="w-full bg-transparent" asChild>
                <a href="https://developers.strava.com/docs/webhooks/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Strava Webhook Documentation
                </a>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
