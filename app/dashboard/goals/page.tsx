import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { GoalsList } from "@/components/goals/goals-list"
import { CreateGoal } from "@/components/goals/create-goal"
import { GoalProgress } from "@/components/goals/goal-progress"

export default async function GoalsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Goals & Milestones</h1>
          <p className="text-muted-foreground">Set targets and track your progress over time</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <GoalProgress goals={goals || []} />
          </div>
          <div>
            <CreateGoal userId={user.id} />
          </div>
        </div>

        <GoalsList goals={goals || []} userId={user.id} />
      </main>
    </div>
  )
}
