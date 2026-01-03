"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

interface CreateTrainingPlanProps {
  userId: string
}

export function CreateTrainingPlan({ userId }: CreateTrainingPlanProps) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [goalType, setGoalType] = useState("distance")
  const [goalValue, setGoalValue] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleCreate = async () => {
    if (!name || !startDate || !endDate) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("training_plans").insert({
        user_id: userId,
        name,
        description: description || null,
        start_date: startDate,
        end_date: endDate,
        goal_type: goalType,
        goal_value: goalValue ? Number(goalValue) : null,
        is_active: true,
      })

      if (error) throw error

      setName("")
      setDescription("")
      setGoalValue("")
      setStartDate("")
      setEndDate("")
      router.refresh()
    } catch (error) {
      console.error("Error creating training plan:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Training Plan</CardTitle>
        <CardDescription>Set up a structured training schedule</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="plan-name">Plan Name</Label>
          <Input
            id="plan-name"
            placeholder="Marathon Training"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="plan-description">Description</Label>
          <Textarea
            id="plan-description"
            placeholder="12-week marathon preparation..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="goal-type">Goal Type</Label>
          <Select value={goalType} onValueChange={setGoalType}>
            <SelectTrigger id="goal-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="distance">Distance</SelectItem>
              <SelectItem value="time">Time</SelectItem>
              <SelectItem value="race">Race Event</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {goalType !== "race" && (
          <div className="space-y-2">
            <Label htmlFor="goal-value">Target {goalType === "distance" ? "Distance (km)" : "Time (hours)"}</Label>
            <Input
              id="goal-value"
              type="number"
              step="0.1"
              placeholder={goalType === "distance" ? "42.2" : "100"}
              value={goalValue}
              onChange={(e) => setGoalValue(e.target.value)}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        <Button onClick={handleCreate} disabled={isLoading || !name || !startDate || !endDate} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          {isLoading ? "Creating..." : "Create Plan"}
        </Button>
      </CardContent>
    </Card>
  )
}
