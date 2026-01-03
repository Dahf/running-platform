import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { TrainingPlanList } from "@/components/training/training-plan-list"
import { CreateTrainingPlan } from "@/components/training/create-training-plan"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { WorkoutCalendar } from "@/components/training/workout-calendar"

export default async function TrainingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: trainingPlans } = await supabase
    .from("training_plans")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const { data: upcomingWorkouts } = await supabase
    .from("training_plan_workouts")
    .select("*, training_plans(name)")
    .in("training_plan_id", trainingPlans?.map((p) => p.id) || [])
    .gte("scheduled_date", new Date().toISOString().split("T")[0])
    .eq("is_completed", false)
    .order("scheduled_date", { ascending: true })
    .limit(10)

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={profile} />
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Training Plans</h1>
          <p className="text-muted-foreground">Structure your training with personalized workout plans</p>
        </div>

        <Tabs defaultValue="plans" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="plans">My Plans</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="create">Create Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="plans">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TrainingPlanList plans={trainingPlans || []} userId={user.id} />
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Workouts</CardTitle>
                    <CardDescription>Your next scheduled sessions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {upcomingWorkouts && upcomingWorkouts.length > 0 ? (
                      <div className="space-y-3">
                        {upcomingWorkouts.slice(0, 5).map((workout: any) => (
                          <div key={workout.id} className="p-3 rounded-lg border border-border">
                            <p className="font-semibold text-sm text-foreground">{workout.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(workout.scheduled_date).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 capitalize">
                              {workout.training_plans?.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">No upcoming workouts scheduled</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="calendar">
            <WorkoutCalendar userId={user.id} trainingPlans={trainingPlans || []} />
          </TabsContent>

          <TabsContent value="create">
            <CreateTrainingPlan userId={user.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
