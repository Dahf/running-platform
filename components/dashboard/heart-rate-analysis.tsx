"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Heart } from "lucide-react"

interface Activity {
  id: string
  average_heart_rate: number | null
  max_heart_rate: number | null
  start_date: string
}

interface HeartRateAnalysisProps {
  userId: string
  activities: Activity[]
}

export function HeartRateAnalysis({ activities }: HeartRateAnalysisProps) {
  const activitiesWithHR = activities.filter((a) => a.average_heart_rate && a.max_heart_rate)

  const chartData = activitiesWithHR
    .slice(0, 10)
    .reverse()
    .map((activity) => ({
      date: new Date(activity.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      avg: activity.average_heart_rate,
      max: activity.max_heart_rate,
    }))

  const avgHR = activitiesWithHR.length
    ? Math.round(activitiesWithHR.reduce((sum, a) => sum + (a.average_heart_rate || 0), 0) / activitiesWithHR.length)
    : 0

  const maxHR = activitiesWithHR.length ? Math.max(...activitiesWithHR.map((a) => a.max_heart_rate || 0)) : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Heart Rate Analysis</CardTitle>
            <CardDescription>Monitor your cardiovascular performance</CardDescription>
          </div>
          <Heart className="h-5 w-5 text-chart-1" />
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-accent rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Average HR</p>
                <p className="text-2xl font-bold text-foreground">{avgHR} bpm</p>
              </div>
              <div className="bg-accent rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Peak HR</p>
                <p className="text-2xl font-bold text-foreground">{maxHR} bpm</p>
              </div>
            </div>
            <ChartContainer
              config={{
                avg: {
                  label: "Average HR",
                  color: "hsl(var(--chart-1))",
                },
                max: {
                  label: "Max HR",
                  color: "hsl(var(--chart-4))",
                },
              }}
              className="h-[180px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="avg" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="max" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </>
        ) : (
          <div className="flex items-center justify-center h-[260px] text-muted-foreground">
            <p>No heart rate data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
