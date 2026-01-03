import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp } from "lucide-react"

interface Goal {
  id: string
  title: string
  goal_type: string
  target_value: number
  current_value: number
}

interface FitnessFreshnessProps {
  userId: string
  goals: Goal[]
}

export function FitnessFreshness({ goals }: FitnessFreshnessProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Active Goals</CardTitle>
            <CardDescription>Track your progress</CardDescription>
          </div>
          <TrendingUp className="h-5 w-5 text-chart-1" />
        </div>
      </CardHeader>
      <CardContent>
        {goals.length > 0 ? (
          <div className="space-y-6">
            {goals.map((goal) => {
              const progress = (Number(goal.current_value) / Number(goal.target_value)) * 100
              return (
                <div key={goal.id}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm text-foreground">{goal.title}</p>
                    <p className="text-sm text-muted-foreground">{progress.toFixed(0)}%</p>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {goal.current_value} / {goal.target_value}{" "}
                    {goal.goal_type === "distance" ? "km" : goal.goal_type === "time" ? "hours" : "activities"}
                  </p>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground text-center">
            <p>Set your first goal to start tracking progress</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
