import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Bike, Waves } from "lucide-react"

interface ActivityData {
  id: string
  title: string
  activity_type: string
  distance: number
  duration: number
  start_date: string
}

interface ActivityFeedProps {
  activities: ActivityData[]
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <div
                  className={`h-10 w-10 rounded-lg ${getActivityColor(activity.activity_type)} flex items-center justify-center`}
                >
                  {getActivityIcon(activity.activity_type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{activity.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(activity.start_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{(activity.distance / 1000).toFixed(2)} km</p>
                  <p className="text-sm text-muted-foreground">
                    {Math.floor(activity.duration / 60)}:{String(activity.duration % 60).padStart(2, "0")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            <p>No activities yet. Start training to see your progress!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
