import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ActivityMap } from "@/components/dashboard/activity-map"
import { ArrowLeft, Clock, TrendingUp, Heart, Flame, Zap } from "lucide-react"
import Link from "next/link"

export default async function ActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: activity } = await supabase.from("activities").select("*").eq("id", id).eq("user_id", user.id).single()

  if (!activity) {
    notFound()
  }

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`
    return `${mins}m ${secs}s`
  }

  const formatPace = (speedMs: number, type: string) => {
    if (type === "ride") {
      return `${(speedMs * 3.6).toFixed(1)} km/h`
    }
    const paceMinKm = 1000 / speedMs / 60
    const mins = Math.floor(paceMinKm)
    const secs = Math.round((paceMinKm - mins) * 60)
    return `${mins}:${secs.toString().padStart(2, "0")} /km`
  }

  const activityIcons: Record<string, string> = {
    run: "🏃",
    ride: "🚴",
    swim: "🏊",
    other: "🏋️",
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={profile} />
      <main className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{activityIcons[activity.activity_type]}</span>
            <h1 className="text-4xl font-bold text-foreground">{activity.title}</h1>
            {activity.external_source === "strava" && <Badge className="bg-[#FC4C02]">Strava</Badge>}
          </div>
          <p className="text-muted-foreground">
            {new Date(activity.start_date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {activity.polyline && <ActivityMap polyline={activity.polyline} className="h-[400px]" />}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">Distance</span>
                  </div>
                  <p className="text-2xl font-bold">{(activity.distance / 1000).toFixed(2)} km</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Duration</span>
                  </div>
                  <p className="text-2xl font-bold">{formatDuration(activity.duration)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Zap className="h-4 w-4" />
                    <span className="text-sm">Pace</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {activity.average_speed ? formatPace(activity.average_speed, activity.activity_type) : "—"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">Elevation</span>
                  </div>
                  <p className="text-2xl font-bold">{activity.elevation_gain?.toFixed(0) || "—"} m</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Heart Rate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Average</span>
                  <span className="text-xl font-bold">{activity.average_heart_rate || "—"} bpm</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Max</span>
                  <span className="text-xl font-bold">{activity.max_heart_rate || "—"} bpm</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  Calories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{activity.calories || "—"} kcal</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Speed Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Avg Speed</span>
                  <span className="font-semibold">
                    {activity.average_speed ? `${(activity.average_speed * 3.6).toFixed(1)} km/h` : "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Max Speed</span>
                  <span className="font-semibold">
                    {activity.max_speed ? `${(activity.max_speed * 3.6).toFixed(1)} km/h` : "—"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
