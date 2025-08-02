-- Create training_sessions table for granular session tracking
CREATE TABLE public.training_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  training_step_id UUID NOT NULL,
  user_id UUID NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  session_duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add new columns to training_steps for mastery tracking
ALTER TABLE public.training_steps 
ADD COLUMN mastery_status TEXT DEFAULT 'in_training' CHECK (mastery_status IN ('in_training', 'partially_mastered', 'fully_mastered')),
ADD COLUMN target_sessions_daily INTEGER DEFAULT 1,
ADD COLUMN total_sessions_completed INTEGER DEFAULT 0,
ADD COLUMN template_repetition_schedule JSONB;

-- Add new columns to daily_progress for session tracking
ALTER TABLE public.daily_progress
ADD COLUMN sessions_completed INTEGER DEFAULT 0,
ADD COLUMN daily_session_target INTEGER DEFAULT 3;

-- Enable Row Level Security for training_sessions
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for training_sessions
CREATE POLICY "Users can view their own training sessions" 
ON public.training_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own training sessions" 
ON public.training_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own training sessions" 
ON public.training_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own training sessions" 
ON public.training_sessions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on training_sessions
CREATE TRIGGER update_training_sessions_updated_at
BEFORE UPDATE ON public.training_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to parse repetition schedule from template
CREATE OR REPLACE FUNCTION public.parse_repetition_schedule(schedule_text text)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  sessions_per_day integer := 1;
BEGIN
  -- Extract numbers from text like "2-4× pro Tag" or "3-5 Minuten je Session"
  IF schedule_text ~* '(\d+)-(\d+).*pro tag|(\d+)-(\d+).*per day|(\d+)-(\d+).*times' THEN
    -- Take the average of the range for daily sessions
    sessions_per_day := (
      (regexp_replace(schedule_text, '.*?(\d+)-(\d+).*', '\1')::integer +
       regexp_replace(schedule_text, '.*?(\d+)-(\d+).*', '\2')::integer) / 2
    );
  ELSIF schedule_text ~* '(\d+).*pro tag|(\d+).*per day|(\d+).*times' THEN
    -- Extract single number
    sessions_per_day := regexp_replace(schedule_text, '.*?(\d+).*', '\1')::integer;
  END IF;
  
  -- Ensure reasonable bounds
  RETURN GREATEST(1, LEAST(sessions_per_day, 8));
END;
$$;

-- Create enhanced function to update daily progress with sessions
CREATE OR REPLACE FUNCTION public.update_daily_progress_with_sessions(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  today_steps INTEGER;
  today_sessions INTEGER;
  today_points INTEGER;
  session_target INTEGER;
  goal_met BOOLEAN;
BEGIN
  -- Get today's completed steps for the user
  SELECT COUNT(*) INTO today_steps
  FROM training_steps ts
  JOIN training_plans tp ON ts.training_plan_id = tp.id
  WHERE tp.user_id = user_id_param 
    AND ts.is_completed = true 
    AND DATE(ts.completed_at) = today_date;

  -- Get today's training sessions for the user
  SELECT COUNT(*) INTO today_sessions
  FROM training_sessions tsess
  WHERE tsess.user_id = user_id_param 
    AND tsess.session_date = today_date;

  -- Calculate points (10 per completed step + 5 per session)
  SELECT 
    COALESCE(SUM(ts.points_reward), 0) + (today_sessions * 5)
  INTO today_points
  FROM training_steps ts
  JOIN training_plans tp ON ts.training_plan_id = tp.id
  WHERE tp.user_id = user_id_param 
    AND ts.is_completed = true 
    AND DATE(ts.completed_at) = today_date;

  -- Calculate dynamic session target based on active training steps
  SELECT 
    COALESCE(SUM(ts.target_sessions_daily), 3)
  INTO session_target
  FROM training_steps ts
  JOIN training_plans tp ON ts.training_plan_id = tp.id
  WHERE tp.user_id = user_id_param 
    AND tp.status = 'in_progress'
    AND ts.mastery_status != 'fully_mastered';

  -- Ensure minimum target
  session_target := GREATEST(session_target, 3);

  -- Check if goal is met (based on sessions now)
  goal_met := today_sessions >= session_target;

  -- Update or insert daily progress
  INSERT INTO daily_progress (
    user_id, 
    date, 
    steps_completed, 
    sessions_completed,
    points_earned, 
    daily_goal_met,
    streak_day,
    daily_goal_target,
    daily_session_target
  )
  VALUES (
    user_id_param,
    today_date,
    today_steps,
    today_sessions,
    today_points,
    goal_met,
    goal_met,
    2, -- keep step target as fallback
    session_target
  )
  ON CONFLICT (user_id, date) DO UPDATE SET
    steps_completed = EXCLUDED.steps_completed,
    sessions_completed = EXCLUDED.sessions_completed,
    points_earned = EXCLUDED.points_earned,
    daily_goal_met = EXCLUDED.daily_goal_met,
    streak_day = EXCLUDED.streak_day,
    daily_session_target = EXCLUDED.daily_session_target,
    updated_at = now();
END;
$$;

-- Create trigger to update daily progress when sessions are added
CREATE OR REPLACE FUNCTION public.trigger_update_daily_progress_sessions()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update daily progress when session is created
  PERFORM update_daily_progress_with_sessions(NEW.user_id);
  RETURN NEW;
END;
$$;

-- Create trigger on training_sessions insert
CREATE TRIGGER on_training_session_created
  AFTER INSERT ON public.training_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_daily_progress_sessions();

-- Update mastery status based on session count
CREATE OR REPLACE FUNCTION public.update_step_mastery()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  total_sessions INTEGER;
  new_mastery TEXT;
BEGIN
  -- Count total sessions for this step
  SELECT COUNT(*) INTO total_sessions
  FROM training_sessions
  WHERE training_step_id = NEW.training_step_id;

  -- Update total sessions count
  UPDATE training_steps 
  SET total_sessions_completed = total_sessions
  WHERE id = NEW.training_step_id;

  -- Determine mastery status based on session count
  IF total_sessions >= 10 THEN
    new_mastery := 'fully_mastered';
  ELSIF total_sessions >= 5 THEN
    new_mastery := 'partially_mastered';
  ELSE
    new_mastery := 'in_training';
  END IF;

  -- Update mastery status if changed
  UPDATE training_steps 
  SET mastery_status = new_mastery
  WHERE id = NEW.training_step_id 
    AND mastery_status != new_mastery;

  RETURN NEW;
END;
$$;

-- Create trigger for mastery updates
CREATE TRIGGER update_step_mastery_on_session
  AFTER INSERT ON public.training_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_step_mastery();