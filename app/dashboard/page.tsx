import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { OverviewStats } from "@/components/dashboard/overview-stats"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { PerformanceChart } from "@/components/dashboard/performance-chart"
import { HeartRateAnalysis } from "@/components/dashboard/heart-rate-analysis"
import { FitnessFreshness } from "@/components/dashboard/fitness-freshness"
import { StravaConnectButton } from "@/components/strava/strava-connect-button"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch recent activities
  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .eq("user_id", user.id)
    .order("start_date", { ascending: false })
    .limit(10)

  // Fetch active goals
  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={profile} />
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Welcome back, {profile?.full_name}</h1>
            <p className="text-muted-foreground">Track your progress and optimize your training</p>
          </div>
          <StravaConnectButton />
        </div>

        <OverviewStats userId={user.id} />

        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <PerformanceChart userId={user.id} activities={activities || []} />
          <HeartRateAnalysis userId={user.id} activities={activities || []} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <ActivityFeed activities={activities || []} />
          </div>
          <div>
            <FitnessFreshness userId={user.id} goals={goals || []} />
          </div>
        </div>
      </main>
    </div>
  )
}
