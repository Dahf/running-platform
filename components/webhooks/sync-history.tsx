"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History, CheckCircle2, XCircle, Clock, RefreshCw } from "lucide-react"

interface SyncRecord {
  id: string
  sync_type: string
  items_synced: number
  status: string
  error_message?: string
  started_at: string
  completed_at?: string
}

interface SyncHistoryProps {
  history: SyncRecord[]
}

export function SyncHistory({ history }: SyncHistoryProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "in_progress":
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      failed: "destructive",
      in_progress: "secondary",
      pending: "outline",
    }
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>
  }

  const formatDuration = (start: string, end?: string) => {
    if (!end) return "In progress..."
    const duration = new Date(end).getTime() - new Date(start).getTime()
    if (duration < 1000) return `${duration}ms`
    return `${(duration / 1000).toFixed(1)}s`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-chart-3" />
          <CardTitle>Sync History</CardTitle>
        </div>
        <CardDescription>Recent synchronization activity</CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No sync history yet</p>
            <p className="text-sm">Your sync operations will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((record) => (
              <div
                key={record.id}
                className="flex items-start justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {getStatusIcon(record.status)}
                  <div>
                    <p className="font-medium text-sm capitalize">{record.sync_type.replace("_", " ")} Sync</p>
                    <p className="text-xs text-muted-foreground">{new Date(record.started_at).toLocaleString()}</p>
                    {record.status === "completed" && (
                      <p className="text-xs text-green-600">
                        {record.items_synced} items synced in {formatDuration(record.started_at, record.completed_at)}
                      </p>
                    )}
                    {record.error_message && <p className="text-xs text-red-500 mt-1">{record.error_message}</p>}
                  </div>
                </div>
                {getStatusBadge(record.status)}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
