"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, Bike, Waves, TrendingUp, MapPin, Trophy } from "lucide-react"

interface Segment {
  id: string
  name: string
  activity_type: string
  distance: number
  elevation_gain: number | null
}

interface SegmentGridProps {
  segments: Segment[]
  userId: string
}

export function SegmentGrid({ segments }: SegmentGridProps) {
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

  if (segments.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="text-center text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No segments found</p>
            <p className="text-sm">Segments will appear as you complete activities</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {segments.map((segment) => (
        <Card key={segment.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-lg ${getActivityColor(segment.activity_type)} flex items-center justify-center`}
                >
                  {getActivityIcon(segment.activity_type)}
                </div>
                <div>
                  <CardTitle className="text-lg">{segment.name}</CardTitle>
                  <p className="text-xs text-muted-foreground capitalize">{segment.activity_type}</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{(segment.distance / 1000).toFixed(2)} km</span>
              </div>
              {segment.elevation_gain && (
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{segment.elevation_gain.toFixed(0)} m</span>
                </div>
              )}
            </div>

            <Link href={`/dashboard/segments/${segment.id}`}>
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                <Trophy className="h-4 w-4 mr-2" />
                View Leaderboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
