import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { RouteList } from "@/components/routes/route-list"
import { RouteBuilder } from "@/components/routes/route-builder"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function RoutesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: myRoutes } = await supabase
    .from("routes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const { data: publicRoutes } = await supabase
    .from("routes")
    .select("*, profiles(full_name)")
    .eq("is_public", true)
    .neq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={profile} />
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Route Planning</h1>
          <p className="text-muted-foreground">Create custom routes and explore community favorites</p>
        </div>

        <Tabs defaultValue="builder" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="builder">Route Builder</TabsTrigger>
            <TabsTrigger value="my-routes">My Routes</TabsTrigger>
            <TabsTrigger value="explore">Explore</TabsTrigger>
          </TabsList>

          <TabsContent value="builder">
            <RouteBuilder userId={user.id} />
          </TabsContent>

          <TabsContent value="my-routes">
            <RouteList routes={myRoutes || []} userId={user.id} showActions />
          </TabsContent>

          <TabsContent value="explore">
            <RouteList routes={publicRoutes || []} userId={user.id} showActions={false} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
