"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, Bike, Waves, TrendingUp, MapPin, Trash2, Eye } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Route {
  id: string
  name: string
  description: string | null
  activity_type: string
  distance: number
  elevation_gain: number | null
  is_public: boolean
  created_at: string
  profiles?: { full_name: string }
}

interface RouteListProps {
  routes: Route[]
  userId: string
  showActions: boolean
}

export function RouteList({ routes, userId, showActions }: RouteListProps) {
  const router = useRouter()

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "ride":
        return <Bike className="h-4 w-4" />
      case "swim":
        return <Waves className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "ride":
        return "bg-chart-2 text-white"
      case "swim":
        return "bg-chart-3 text-white"
      default:
        return "bg-chart-1 text-white"
    }
  }

  const handleDelete = async (routeId: string) => {
    const supabase = createClient()
    await supabase.from("routes").delete().eq("id", routeId)
    router.refresh()
  }

  if (routes.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="text-center text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No routes found</p>
            <p className="text-sm">Create your first route to get started</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {routes.map((route) => (
        <Card key={route.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-lg ${getActivityColor(route.activity_type)} flex items-center justify-center`}
                >
                  {getActivityIcon(route.activity_type)}
                </div>
                <div>
                  <CardTitle className="text-lg">{route.name}</CardTitle>
                  {route.profiles && <p className="text-xs text-muted-foreground">by {route.profiles.full_name}</p>}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {route.description && <p className="text-sm text-muted-foreground line-clamp-2">{route.description}</p>}

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{(route.distance / 1000).toFixed(1)} km</span>
              </div>
              {route.elevation_gain && (
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{route.elevation_gain.toFixed(0)} m</span>
                </div>
              )}
            </div>

            {showActions && (
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(route.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
