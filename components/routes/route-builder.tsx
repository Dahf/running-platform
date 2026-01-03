"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { Plus, TrendingUp, Flame } from "lucide-react"
import { useRouter } from "next/navigation"
import { InteractiveMap } from "./interactive-map"

interface RouteBuilderProps {
  userId: string
}

interface LatLng {
  lat: number
  lng: number
}

export function RouteBuilder({ userId }: RouteBuilderProps) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [activityType, setActivityType] = useState("run")
  const [elevation, setElevation] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showHeatmap, setShowHeatmap] = useState(false)

  const [routeData, setRouteData] = useState<{
    waypoints: LatLng[]
    distance: number
    polyline: string
  }>({ waypoints: [], distance: 0, polyline: "" })

  const handleRouteChange = useCallback((waypoints: LatLng[], distance: number, polyline: string) => {
    setRouteData({ waypoints, distance, polyline })
  }, [])

  const handleCreateRoute = async () => {
    if (!name || routeData.distance === 0) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("routes").insert({
        user_id: userId,
        name,
        description,
        activity_type: activityType,
        distance: routeData.distance,
        elevation_gain: elevation ? Number(elevation) : null,
        polyline: routeData.polyline,
        is_public: isPublic,
      })

      if (error) throw error

      setName("")
      setDescription("")
      setElevation("")
      setRouteData({ waypoints: [], distance: 0, polyline: "" })
      router.refresh()
    } catch (error) {
      console.error("Error creating route:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Route</CardTitle>
            <CardDescription>Design your perfect training route with custom waypoints</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Route Name</Label>
              <Input id="name" placeholder="Morning Loop" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Scenic route through the park..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="activity-type">Activity Type</Label>
                <Select value={activityType} onValueChange={setActivityType}>
                  <SelectTrigger id="activity-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="run">Running</SelectItem>
                    <SelectItem value="ride">Cycling</SelectItem>
                    <SelectItem value="swim">Swimming</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Distance</Label>
                <Input value={`${(routeData.distance / 1000).toFixed(2)} km`} disabled className="bg-muted" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="elevation">Elevation Gain (m)</Label>
              <Input
                id="elevation"
                type="number"
                placeholder="150"
                value={elevation}
                onChange={(e) => setElevation(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="public">Make route public</Label>
                <p className="text-sm text-muted-foreground">Share this route with the community</p>
              </div>
              <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
            </div>

            <Button
              onClick={handleCreateRoute}
              disabled={isLoading || !name || routeData.distance === 0}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isLoading ? "Creating..." : "Create Route"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-chart-3" />
              <CardTitle>Popular Routes Nearby</CardTitle>
            </div>
            <CardDescription>Top community routes based on activity heatmaps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Riverside Trail", distance: "12.5 km", elevation: "180 m", type: "run" },
                { name: "Mountain Loop", distance: "35.0 km", elevation: "850 m", type: "ride" },
                { name: "City Circuit", distance: "8.2 km", elevation: "45 m", type: "run" },
              ].map((route, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer"
                >
                  <div>
                    <p className="font-medium text-foreground">{route.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {route.distance} • {route.elevation} elevation
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-end gap-2">
          <Label htmlFor="heatmap" className="text-sm flex items-center gap-2">
            <Flame className="h-4 w-4 text-chart-1" />
            Show Activity Heatmap
          </Label>
          <Switch id="heatmap" checked={showHeatmap} onCheckedChange={setShowHeatmap} />
        </div>

        <InteractiveMap onRouteChange={handleRouteChange} showHeatmap={showHeatmap} />
      </div>
    </div>
  )
}
