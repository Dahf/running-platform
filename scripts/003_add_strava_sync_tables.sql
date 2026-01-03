-- Strava connection table to store user's Strava account link
CREATE TABLE IF NOT EXISTS public.strava_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  strava_athlete_id BIGINT NOT NULL UNIQUE,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Webhook logs table to track incoming n8n requests
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('received', 'processing', 'completed', 'failed')),
  error_message TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sync history table
CREATE TABLE IF NOT EXISTS public.sync_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL CHECK (sync_type IN ('activities', 'segments', 'routes', 'full')),
  items_synced INTEGER DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add strava_id to activities for deduplication
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS strava_id BIGINT UNIQUE;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS external_source TEXT DEFAULT 'manual';

-- Enable RLS
ALTER TABLE public.strava_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for strava_connections
CREATE POLICY "Users can view their own strava connection" ON public.strava_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own strava connection" ON public.strava_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own strava connection" ON public.strava_connections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own strava connection" ON public.strava_connections FOR DELETE USING (auth.uid() = user_id);

-- Service role can manage webhook logs (for API routes)
CREATE POLICY "Service role can manage webhook logs" ON public.webhook_logs FOR ALL USING (true);

-- RLS Policies for sync_history
CREATE POLICY "Users can view their own sync history" ON public.sync_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage sync history" ON public.sync_history FOR ALL USING (true);

-- Indexes
CREATE INDEX idx_strava_connections_user_id ON public.strava_connections(user_id);
CREATE INDEX idx_strava_connections_athlete_id ON public.strava_connections(strava_athlete_id);
CREATE INDEX idx_webhook_logs_created_at ON public.webhook_logs(created_at DESC);
CREATE INDEX idx_webhook_logs_status ON public.webhook_logs(status);
CREATE INDEX idx_sync_history_user_id ON public.sync_history(user_id);
CREATE INDEX idx_activities_strava_id ON public.activities(strava_id);
