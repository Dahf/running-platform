"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface Activity {
  id: string
  distance: number
  duration: number
  start_date: string
  average_speed: number
}

interface PerformanceChartProps {
  userId: string
  activities: Activity[]
}

export function PerformanceChart({ activities }: PerformanceChartProps) {
  const chartData = activities
    .slice(0, 10)
    .reverse()
    .map((activity) => ({
      date: new Date(activity.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      distance: Number((activity.distance / 1000).toFixed(1)),
      pace: activity.average_speed ? Number((1000 / (activity.average_speed * 60)).toFixed(2)) : 0,
    }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Trends</CardTitle>
        <CardDescription>Distance and pace over your last 10 activities</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            distance: {
              label: "Distance (km)",
              color: "hsl(var(--chart-1))",
            },
            pace: {
              label: "Pace (min/km)",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis yAxisId="left" className="text-xs" />
              <YAxis yAxisId="right" orientation="right" className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="distance"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-1))" }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="pace"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-2))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
