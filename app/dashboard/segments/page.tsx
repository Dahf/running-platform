import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { SegmentGrid } from "@/components/segments/segment-grid"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default async function SegmentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch all segments
  const { data: segments } = await supabase.from("segments").select("*").order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={profile} />
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Segment Leaderboards</h1>
          <p className="text-muted-foreground">Compete on popular segments and track your best efforts</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input placeholder="Search segments..." className="md:max-w-sm" />
          <Select defaultValue="all">
            <SelectTrigger className="md:w-[180px]">
              <SelectValue placeholder="Activity type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="run">Running</SelectItem>
              <SelectItem value="ride">Cycling</SelectItem>
              <SelectItem value="swim">Swimming</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="popular">
            <SelectTrigger className="md:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="distance">Distance</SelectItem>
              <SelectItem value="elevation">Elevation Gain</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <SegmentGrid segments={segments || []} userId={user.id} />
      </main>
    </div>
  )
}
