-- Create daily_progress table for daily tracking
CREATE TABLE public.daily_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  steps_completed INTEGER NOT NULL DEFAULT 0,
  points_earned INTEGER NOT NULL DEFAULT 0,
  daily_goal_met BOOLEAN NOT NULL DEFAULT false,
  streak_day BOOLEAN NOT NULL DEFAULT false,
  daily_goal_target INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.daily_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own daily progress" 
ON public.daily_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily progress" 
ON public.daily_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily progress" 
ON public.daily_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_daily_progress_updated_at
BEFORE UPDATE ON public.daily_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update daily progress
CREATE OR REPLACE FUNCTION public.update_daily_progress(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  today_steps INTEGER;
  today_points INTEGER;
  goal_target INTEGER;
  goal_met BOOLEAN;
BEGIN
  -- Get today's completed steps and points for the user
  SELECT 
    COUNT(*) as steps,
    COALESCE(SUM(ts.points_reward), 0) as points
  INTO today_steps, today_points
  FROM training_steps ts
  JOIN training_plans tp ON ts.training_plan_id = tp.id
  WHERE tp.user_id = user_id_param 
    AND ts.is_completed = true 
    AND DATE(ts.completed_at) = today_date;

  -- Get user's daily goal (default 2 if not set)
  SELECT COALESCE(dp.daily_goal_target, 2) INTO goal_target
  FROM daily_progress dp
  WHERE dp.user_id = user_id_param AND dp.date = today_date
  LIMIT 1;

  -- If no record exists, use default goal
  IF goal_target IS NULL THEN
    goal_target := 2;
  END IF;

  -- Check if goal is met
  goal_met := today_steps >= goal_target;

  -- Update or insert daily progress
  INSERT INTO daily_progress (
    user_id, 
    date, 
    steps_completed, 
    points_earned, 
    daily_goal_met,
    streak_day,
    daily_goal_target
  )
  VALUES (
    user_id_param,
    today_date,
    today_steps,
    today_points,
    goal_met,
    goal_met, -- streak_day is true if goal is met
    goal_target
  )
  ON CONFLICT (user_id, date) DO UPDATE SET
    steps_completed = EXCLUDED.steps_completed,
    points_earned = EXCLUDED.points_earned,
    daily_goal_met = EXCLUDED.daily_goal_met,
    streak_day = EXCLUDED.streak_day,
    updated_at = now();
END;
$$;

-- Create trigger to update daily progress when training steps are completed
CREATE OR REPLACE FUNCTION public.trigger_update_daily_progress()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Find user_id through training_plan and update daily progress
  PERFORM update_daily_progress(
    (SELECT tp.user_id FROM training_plans tp WHERE tp.id = NEW.training_plan_id)
  );
  RETURN NEW;
END;
$$;

-- Create trigger on training_steps completion
CREATE TRIGGER on_training_step_completed
  AFTER UPDATE ON public.training_steps
  FOR EACH ROW
  WHEN (NEW.is_completed = true AND OLD.is_completed = false)
  EXECUTE FUNCTION public.trigger_update_daily_progress();