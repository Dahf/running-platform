import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, TrendingUp, Timer, Zap } from "lucide-react"

interface OverviewStatsProps {
  userId: string
}

export async function OverviewStats({ userId }: OverviewStatsProps) {
  const supabase = await createClient()

  // Get stats for the last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: activities } = await supabase
    .from("activities")
    .select("distance, duration, elevation_gain, calories")
    .eq("user_id", userId)
    .gte("start_date", thirtyDaysAgo.toISOString())

  const totalDistance = activities?.reduce((sum, a) => sum + Number(a.distance), 0) || 0
  const totalDuration = activities?.reduce((sum, a) => sum + Number(a.duration), 0) || 0
  const totalElevation = activities?.reduce((sum, a) => sum + Number(a.elevation_gain || 0), 0) || 0
  const totalCalories = activities?.reduce((sum, a) => sum + Number(a.calories || 0), 0) || 0

  const stats = [
    {
      title: "Distance",
      value: `${(totalDistance / 1000).toFixed(1)} km`,
      description: "Last 30 days",
      icon: Activity,
      color: "text-chart-1",
    },
    {
      title: "Time",
      value: `${Math.floor(totalDuration / 3600)}h ${Math.floor((totalDuration % 3600) / 60)}m`,
      description: "Training time",
      icon: Timer,
      color: "text-chart-2",
    },
    {
      title: "Elevation",
      value: `${totalElevation.toFixed(0)} m`,
      description: "Total climbing",
      icon: TrendingUp,
      color: "text-chart-3",
    },
    {
      title: "Calories",
      value: totalCalories.toLocaleString(),
      description: "Energy burned",
      icon: Zap,
      color: "text-chart-4",
    },
  ]

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
