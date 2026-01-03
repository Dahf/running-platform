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

interface CreateGoalProps {
  userId: string
}

export function CreateGoal({ userId }: CreateGoalProps) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [goalType, setGoalType] = useState("distance")
  const [targetValue, setTargetValue] = useState("")
  const [period, setPeriod] = useState("weekly")
  const [isLoading, setIsLoading] = useState(false)

  const handleCreate = async () => {
    if (!title || !targetValue) return

    setIsLoading(true)
    const supabase = createClient()

    // Calculate start and end dates based on period
    const startDate = new Date()
    const endDate = new Date()

    switch (period) {
      case "weekly":
        endDate.setDate(endDate.getDate() + 7)
        break
      case "monthly":
        endDate.setMonth(endDate.getMonth() + 1)
        break
      case "yearly":
        endDate.setFullYear(endDate.getFullYear() + 1)
        break
    }

    try {
      const { error } = await supabase.from("goals").insert({
        user_id: userId,
        title,
        description: description || null,
        goal_type: goalType,
        target_value: Number(targetValue),
        current_value: 0,
        period,
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
        is_active: true,
      })

      if (error) throw error

      setTitle("")
      setDescription("")
      setTargetValue("")
      router.refresh()
    } catch (error) {
      console.error("Error creating goal:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Goal</CardTitle>
        <CardDescription>Set a target to track your progress</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="goal-title">Goal Title</Label>
          <Input id="goal-title" placeholder="Run 100km" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="goal-description">Description</Label>
          <Textarea
            id="goal-description"
            placeholder="Focus on building endurance..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="goal-type">Goal Type</Label>
          <Select value={goalType} onValueChange={setGoalType}>
            <SelectTrigger id="goal-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="distance">Distance (km)</SelectItem>
              <SelectItem value="activities">Number of Activities</SelectItem>
              <SelectItem value="time">Time (hours)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="target-value">Target Value</Label>
          <Input
            id="target-value"
            type="number"
            step="0.1"
            placeholder="100"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="period">Time Period</Label>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger id="period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleCreate} disabled={isLoading || !title || !targetValue} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          {isLoading ? "Creating..." : "Create Goal"}
        </Button>
      </CardContent>
    </Card>
  )
}
