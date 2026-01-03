"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Target, Trash2, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Goal {
  id: string
  title: string
  description: string | null
  goal_type: string
  target_value: number
  current_value: number
  period: string
  start_date: string
  end_date: string
  is_active: boolean
}

interface GoalsListProps {
  goals: Goal[]
  userId: string
}

export function GoalsList({ goals }: GoalsListProps) {
  const router = useRouter()

  const handleDelete = async (goalId: string) => {
    const supabase = createClient()
    await supabase.from("goals").delete().eq("id", goalId)
    router.refresh()
  }

  if (goals.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[200px]">
          <div className="text-center text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No active goals</p>
            <p className="text-sm">Set your first goal to start tracking</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {goals.map((goal) => {
        const progress = (Number(goal.current_value) / Number(goal.target_value)) * 100
        const daysRemaining = Math.ceil(
          (new Date(goal.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
        )

        return (
          <Card key={goal.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-chart-1" />
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="capitalize text-xs">
                    {goal.period}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(goal.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {goal.description && <p className="text-sm text-muted-foreground">{goal.description}</p>}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Progress</p>
                  <p className="text-sm text-muted-foreground">{progress.toFixed(0)}%</p>
                </div>
                <Progress value={progress} className="h-3" />
                <p className="text-xs text-muted-foreground mt-2">
                  {goal.current_value} / {goal.target_value}{" "}
                  {goal.goal_type === "distance" ? "km" : goal.goal_type === "time" ? "hours" : "activities"}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{daysRemaining > 0 ? `${daysRemaining} days remaining` : "Goal period ended"}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
