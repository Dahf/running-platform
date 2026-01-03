import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Target, Award } from "lucide-react"

interface Goal {
  id: string
  title: string
  goal_type: string
  target_value: number
  current_value: number
  period: string
}

interface GoalProgressProps {
  goals: Goal[]
}

export function GoalProgress({ goals }: GoalProgressProps) {
  const totalGoals = goals.length
  const completedGoals = goals.filter((g) => g.current_value >= g.target_value).length
  const averageProgress =
    goals.length > 0 ? goals.reduce((sum, g) => sum + (g.current_value / g.target_value) * 100, 0) / goals.length : 0

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
          <Target className="h-4 w-4 text-chart-1" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalGoals}</div>
          <p className="text-xs text-muted-foreground mt-1">Total goals being tracked</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <Award className="h-4 w-4 text-chart-3" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{completedGoals}</div>
          <p className="text-xs text-muted-foreground mt-1">Goals achieved</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
          <TrendingUp className="h-4 w-4 text-chart-2" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{averageProgress.toFixed(0)}%</div>
          <Progress value={averageProgress} className="h-2 mt-2" />
        </CardContent>
      </Card>
    </div>
  )
}
