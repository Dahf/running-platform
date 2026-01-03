"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Target, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface TrainingPlan {
  id: string
  name: string
  description: string | null
  start_date: string
  end_date: string
  goal_type: string
  goal_value: number | null
  is_active: boolean
}

interface TrainingPlanListProps {
  plans: TrainingPlan[]
  userId: string
}

export function TrainingPlanList({ plans }: TrainingPlanListProps) {
  const router = useRouter()

  const handleDelete = async (planId: string) => {
    const supabase = createClient()
    await supabase.from("training_plans").delete().eq("id", planId)
    router.refresh()
  }

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const today = new Date()
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  if (plans.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No training plans yet</p>
            <p className="text-sm">Create your first plan to start structured training</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {plans.map((plan) => {
        const daysRemaining = getDaysRemaining(plan.end_date)
        const isCompleted = daysRemaining < 0

        return (
          <Card key={plan.id} className={isCompleted ? "opacity-60" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    {plan.is_active && !isCompleted && (
                      <Badge variant="default" className="bg-chart-1">
                        Active
                      </Badge>
                    )}
                    {isCompleted && <Badge variant="secondary">Completed</Badge>}
                  </div>
                  {plan.description && <CardDescription>{plan.description}</CardDescription>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(plan.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <p className="text-sm font-medium">
                      {new Date(plan.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">End Date</p>
                    <p className="text-sm font-medium">
                      {new Date(plan.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Goal</p>
                    <p className="text-sm font-medium capitalize">{plan.goal_type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Days Remaining</p>
                    <p className="text-sm font-medium">{isCompleted ? "Finished" : daysRemaining}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
