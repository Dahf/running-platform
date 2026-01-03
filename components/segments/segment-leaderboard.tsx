"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award } from "lucide-react"

interface SegmentEffort {
  id: string
  user_id: string
  elapsed_time: number
  average_heart_rate: number | null
  max_heart_rate: number | null
  start_date: string
  profiles: {
    full_name: string
    avatar_url: string | null
  }
}

interface SegmentLeaderboardProps {
  efforts: SegmentEffort[]
  userId: string
}

export function SegmentLeaderboard({ efforts, userId }: SegmentLeaderboardProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${String(secs).padStart(2, "0")}`
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex items-center gap-1 text-amber-500">
            <Trophy className="h-5 w-5" />
            <span className="font-bold">1st</span>
          </div>
        )
      case 2:
        return (
          <div className="flex items-center gap-1 text-slate-400">
            <Medal className="h-5 w-5" />
            <span className="font-bold">2nd</span>
          </div>
        )
      case 3:
        return (
          <div className="flex items-center gap-1 text-amber-600">
            <Award className="h-5 w-5" />
            <span className="font-bold">3rd</span>
          </div>
        )
      default:
        return <span className="font-semibold text-muted-foreground">{rank}</span>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
        <CardDescription>Top athletes ranked by fastest time</CardDescription>
      </CardHeader>
      <CardContent>
        {efforts.length > 0 ? (
          <div className="space-y-3">
            {efforts.map((effort, index) => {
              const isCurrentUser = effort.user_id === userId
              return (
                <div
                  key={effort.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border ${
                    isCurrentUser ? "border-primary bg-accent" : "border-border"
                  } transition-colors`}
                >
                  <div className="w-12 text-center">{getRankBadge(index + 1)}</div>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {effort.profiles.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      {effort.profiles.full_name}
                      {isCurrentUser && (
                        <Badge variant="secondary" className="ml-2">
                          You
                        </Badge>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(effort.start_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">{formatTime(effort.elapsed_time)}</p>
                    {effort.average_heart_rate && (
                      <p className="text-sm text-muted-foreground">{effort.average_heart_rate} bpm avg</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            <p>No efforts recorded yet. Be the first!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
