"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Calendar } from "lucide-react"

interface WorkoutCalendarProps {
  userId: string
  trainingPlans: any[]
}

export function WorkoutCalendar({ trainingPlans }: WorkoutCalendarProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workout Calendar</CardTitle>
        <CardDescription>View all your scheduled training sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
          <div className="text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="font-medium">Interactive Calendar Coming Soon</p>
            <p className="text-sm">
              {trainingPlans.length > 0
                ? `${trainingPlans.length} training plan${trainingPlans.length > 1 ? "s" : ""} active`
                : "Create a training plan to see scheduled workouts"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
