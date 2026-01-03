import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { SegmentLeaderboard } from "@/components/segments/segment-leaderboard"
import { SegmentStats } from "@/components/segments/segment-stats"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Bike, Waves, MapPin, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface SegmentPageProps {
  params: Promise<{ id: string }>
}

export default async function SegmentPage({ params }: SegmentPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch segment details
  const { data: segment } = await supabase.from("segments").select("*").eq("id", id).single()

  if (!segment) {
    redirect("/dashboard/segments")
  }

  // Fetch all segment efforts with user profiles
  const { data: efforts } = await supabase
    .from("segment_efforts")
    .select("*, profiles(full_name, avatar_url)")
    .eq("segment_id", id)
    .order("elapsed_time", { ascending: true })

  // Get user's best effort
  const { data: userEffort } = await supabase
    .from("segment_efforts")
    .select("*")
    .eq("segment_id", id)
    .eq("user_id", user.id)
    .order("elapsed_time", { ascending: true })
    .limit(1)
    .single()

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "ride":
        return Bike
      case "swim":
        return Waves
      default:
        return Activity
    }
  }

  const Icon = getActivityIcon(segment.activity_type)

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={profile} />
      <main className="container mx-auto px-6 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/dashboard/segments">← Back to Segments</Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{segment.name}</CardTitle>
                    <p className="text-sm text-muted-foreground capitalize">{segment.activity_type}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-chart-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Distance</p>
                    <p className="text-lg font-bold">{(segment.distance / 1000).toFixed(2)} km</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-chart-3" />
                  <div>
                    <p className="text-sm text-muted-foreground">Elevation</p>
                    <p className="text-lg font-bold">{segment.elevation_gain?.toFixed(0) || 0} m</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-chart-2" />
                  <div>
                    <p className="text-sm text-muted-foreground">Attempts</p>
                    <p className="text-lg font-bold">{efforts?.length || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-chart-4" />
                  <div>
                    <p className="text-sm text-muted-foreground">Your Rank</p>
                    <p className="text-lg font-bold">
                      {userEffort ? efforts?.findIndex((e) => e.user_id === user.id) + 1 || "-" : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <SegmentStats userEffort={userEffort} totalEfforts={efforts?.length || 0} />
        </div>

        <SegmentLeaderboard efforts={efforts || []} userId={user.id} />
      </main>
    </div>
  )
}
