import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Timer, TrendingUp } from "lucide-react"

interface SegmentStatsProps {
  userEffort: {
    elapsed_time: number
    average_heart_rate: number | null
    max_heart_rate: number | null
  } | null
  totalEfforts: number
}

export function SegmentStats({ userEffort, totalEfforts }: SegmentStatsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${String(secs).padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-chart-1" />
            Your Best Effort
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userEffort ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Time</p>
                <p className="text-4xl font-bold text-foreground">{formatTime(userEffort.elapsed_time)}</p>
              </div>
              {userEffort.average_heart_rate && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Avg HR</p>
                    <p className="text-xl font-semibold">{userEffort.average_heart_rate} bpm</p>
                  </div>
                  {userEffort.max_heart_rate && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Max HR</p>
                      <p className="text-xl font-semibold">{userEffort.max_heart_rate} bpm</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">You haven't attempted this segment yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-chart-3" />
            Segment Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Attempts</p>
              <p className="text-3xl font-bold text-foreground">{totalEfforts}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Popularity</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2"
                    style={{ width: `${Math.min((totalEfforts / 100) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-sm font-medium">
                  {totalEfforts > 50 ? "High" : totalEfforts > 20 ? "Medium" : "Low"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
