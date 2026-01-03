import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { WebhookManager } from "@/components/webhooks/webhook-manager"
import { StravaConnect } from "@/components/webhooks/strava-connect"
import { SyncHistory } from "@/components/webhooks/sync-history"

export default async function WebhooksPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: stravaConnection } = await supabase
    .from("strava_connections")
    .select("*")
    .eq("user_id", user.id)
    .single()

  const { data: syncHistory } = await supabase
    .from("sync_history")
    .select("*")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })
    .limit(10)

  const { data: recentWebhooks } = await supabase
    .from("webhook_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={profile} />
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Integrations & Webhooks</h1>
          <p className="text-muted-foreground">Connect your Strava account and manage n8n webhook integrations</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <StravaConnect userId={user.id} connection={stravaConnection} />
            <SyncHistory history={syncHistory || []} />
          </div>
          <WebhookManager webhooks={recentWebhooks || []} userId={user.id} />
        </div>
      </main>
    </div>
  )
}
