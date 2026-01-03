-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('run', 'ride', 'swim', 'other')),
  distance DECIMAL NOT NULL, -- in meters
  duration INTEGER NOT NULL, -- in seconds
  elevation_gain DECIMAL, -- in meters
  average_speed DECIMAL, -- in m/s
  max_speed DECIMAL, -- in m/s
  average_heart_rate DECIMAL,
  max_heart_rate DECIMAL,
  calories INTEGER,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  polyline TEXT, -- encoded polyline for route
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create segments table
CREATE TABLE IF NOT EXISTS public.segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('run', 'ride', 'swim', 'other')),
  distance DECIMAL NOT NULL, -- in meters
  elevation_gain DECIMAL, -- in meters
  polyline TEXT NOT NULL,
  start_lat DECIMAL NOT NULL,
  start_lng DECIMAL NOT NULL,
  end_lat DECIMAL NOT NULL,
  end_lng DECIMAL NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create segment efforts table
CREATE TABLE IF NOT EXISTS public.segment_efforts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_id UUID NOT NULL REFERENCES public.segments(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  elapsed_time INTEGER NOT NULL, -- in seconds
  average_heart_rate DECIMAL,
  max_heart_rate DECIMAL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create routes table
CREATE TABLE IF NOT EXISTS public.routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('run', 'ride', 'swim', 'other')),
  distance DECIMAL NOT NULL, -- in meters
  elevation_gain DECIMAL, -- in meters
  polyline TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create training plans table
CREATE TABLE IF NOT EXISTS public.training_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('distance', 'time', 'race')),
  goal_value DECIMAL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create training plan workouts table
CREATE TABLE IF NOT EXISTS public.training_plan_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_plan_id UUID NOT NULL REFERENCES public.training_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('run', 'ride', 'swim', 'rest', 'cross_training')),
  scheduled_date DATE NOT NULL,
  target_distance DECIMAL, -- in meters
  target_duration INTEGER, -- in seconds
  is_completed BOOLEAN DEFAULT false,
  completed_activity_id UUID REFERENCES public.activities(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create goals table
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('distance', 'activities', 'time')),
  target_value DECIMAL NOT NULL,
  current_value DECIMAL DEFAULT 0,
  period TEXT NOT NULL CHECK (period IN ('weekly', 'monthly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.segment_efforts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_plan_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for activities
CREATE POLICY "Users can view their own activities" ON public.activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own activities" ON public.activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own activities" ON public.activities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own activities" ON public.activities FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for segments
CREATE POLICY "Everyone can view segments" ON public.segments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create segments" ON public.segments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for segment efforts
CREATE POLICY "Users can view all segment efforts" ON public.segment_efforts FOR SELECT USING (true);
CREATE POLICY "Users can insert their own segment efforts" ON public.segment_efforts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own segment efforts" ON public.segment_efforts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own segment efforts" ON public.segment_efforts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for routes
CREATE POLICY "Users can view public routes and their own" ON public.routes FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can insert their own routes" ON public.routes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own routes" ON public.routes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own routes" ON public.routes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for training plans
CREATE POLICY "Users can view their own training plans" ON public.training_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own training plans" ON public.training_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own training plans" ON public.training_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own training plans" ON public.training_plans FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for training plan workouts
CREATE POLICY "Users can view their own workouts" ON public.training_plan_workouts 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.training_plans 
      WHERE training_plans.id = training_plan_workouts.training_plan_id 
      AND training_plans.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert workouts for their plans" ON public.training_plan_workouts 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.training_plans 
      WHERE training_plans.id = training_plan_workouts.training_plan_id 
      AND training_plans.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update their own workouts" ON public.training_plan_workouts 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.training_plans 
      WHERE training_plans.id = training_plan_workouts.training_plan_id 
      AND training_plans.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete their own workouts" ON public.training_plan_workouts 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.training_plans 
      WHERE training_plans.id = training_plan_workouts.training_plan_id 
      AND training_plans.user_id = auth.uid()
    )
  );

-- RLS Policies for goals
CREATE POLICY "Users can view their own goals" ON public.goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own goals" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goals" ON public.goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own goals" ON public.goals FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_activities_user_id ON public.activities(user_id);
CREATE INDEX idx_activities_start_date ON public.activities(start_date DESC);
CREATE INDEX idx_segment_efforts_segment_id ON public.segment_efforts(segment_id);
CREATE INDEX idx_segment_efforts_user_id ON public.segment_efforts(user_id);
CREATE INDEX idx_segment_efforts_elapsed_time ON public.segment_efforts(elapsed_time);
CREATE INDEX idx_routes_user_id ON public.routes(user_id);
CREATE INDEX idx_training_plans_user_id ON public.training_plans(user_id);
CREATE INDEX idx_training_plan_workouts_plan_id ON public.training_plan_workouts(training_plan_id);
CREATE INDEX idx_goals_user_id ON public.goals(user_id);
