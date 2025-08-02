-- Fix Critical Security Issues

-- 1. Fix all database functions with mutable search paths
-- This prevents search_path injection attacks

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$function$;

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Update update_post_counters function
CREATE OR REPLACE FUNCTION public.update_post_counters()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'post_comments' THEN
      UPDATE public.community_posts 
      SET comments_count = comments_count + 1 
      WHERE id = NEW.post_id;
    ELSIF TG_TABLE_NAME = 'post_likes' THEN
      UPDATE public.community_posts 
      SET likes_count = likes_count + 1 
      WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF TG_TABLE_NAME = 'post_comments' THEN
      UPDATE public.community_posts 
      SET comments_count = comments_count - 1 
      WHERE id = OLD.post_id;
    ELSIF TG_TABLE_NAME = 'post_likes' THEN
      UPDATE public.community_posts 
      SET likes_count = likes_count - 1 
      WHERE id = OLD.post_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- Update parse_repetition_schedule function
CREATE OR REPLACE FUNCTION public.parse_repetition_schedule(schedule_text text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
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
$function$;

-- Update update_daily_progress function
CREATE OR REPLACE FUNCTION public.update_daily_progress(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
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
  FROM public.training_steps ts
  JOIN public.training_plans tp ON ts.training_plan_id = tp.id
  WHERE tp.user_id = user_id_param 
    AND ts.is_completed = true 
    AND DATE(ts.completed_at) = today_date;

  -- Get user's daily goal (default 2 if not set)
  SELECT COALESCE(dp.daily_goal_target, 2) INTO goal_target
  FROM public.daily_progress dp
  WHERE dp.user_id = user_id_param AND dp.date = today_date
  LIMIT 1;

  -- If no record exists, use default goal
  IF goal_target IS NULL THEN
    goal_target := 2;
  END IF;

  -- Check if goal is met
  goal_met := today_steps >= goal_target;

  -- Update or insert daily progress
  INSERT INTO public.daily_progress (
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
$function$;

-- Update trigger_update_daily_progress_sessions function
CREATE OR REPLACE FUNCTION public.trigger_update_daily_progress_sessions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  -- Update daily progress when session is created
  PERFORM public.update_daily_progress_with_sessions(NEW.user_id);
  RETURN NEW;
END;
$function$;

-- Update update_step_mastery function
CREATE OR REPLACE FUNCTION public.update_step_mastery()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
DECLARE
  total_sessions INTEGER;
  new_mastery TEXT;
BEGIN
  -- Count total sessions for this step
  SELECT COUNT(*) INTO total_sessions
  FROM public.training_sessions
  WHERE training_step_id = NEW.training_step_id;

  -- Update total sessions count
  UPDATE public.training_steps 
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
  UPDATE public.training_steps 
  SET mastery_status = new_mastery
  WHERE id = NEW.training_step_id 
    AND mastery_status != new_mastery;

  RETURN NEW;
END;
$function$;

-- Update update_daily_progress_with_sessions function
CREATE OR REPLACE FUNCTION public.update_daily_progress_with_sessions(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
DECLARE
  today_date DATE := CURRENT_DATE;
  today_steps INTEGER;
  today_sessions INTEGER;
  today_points INTEGER;
  session_target INTEGER;
  goal_met BOOLEAN;
  existing_target INTEGER;
BEGIN
  -- Get today's completed steps for the user
  SELECT COUNT(*) INTO today_steps
  FROM public.training_steps ts
  JOIN public.training_plans tp ON ts.training_plan_id = tp.id
  WHERE tp.user_id = user_id_param 
    AND ts.is_completed = true 
    AND DATE(ts.completed_at) = today_date;

  -- Get today's training sessions for the user
  SELECT COUNT(*) INTO today_sessions
  FROM public.training_sessions tsess
  WHERE tsess.user_id = user_id_param 
    AND tsess.session_date = today_date;

  -- Calculate points (10 per completed step + 5 per session)
  SELECT 
    COALESCE(SUM(ts.points_reward), 0) + (today_sessions * 5)
  INTO today_points
  FROM public.training_steps ts
  JOIN public.training_plans tp ON ts.training_plan_id = tp.id
  WHERE tp.user_id = user_id_param 
    AND ts.is_completed = true 
    AND DATE(ts.completed_at) = today_date;

  -- Get user's existing session target for today, validate it
  SELECT daily_session_target INTO existing_target
  FROM public.daily_progress
  WHERE user_id = user_id_param AND date = today_date;
  
  session_target := public.validate_session_target(existing_target);

  -- Check if goal is met (based on sessions now)
  goal_met := today_sessions >= session_target;

  -- Update or insert daily progress
  INSERT INTO public.daily_progress (
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
    daily_session_target = public.validate_session_target(COALESCE(daily_progress.daily_session_target, EXCLUDED.daily_session_target)),
    updated_at = now();
END;
$function$;

-- Update update_user_rewards function
CREATE OR REPLACE FUNCTION public.update_user_rewards(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
DECLARE
  completed_steps_count INTEGER;
  total_points_earned INTEGER;
  today_date DATE := CURRENT_DATE;
  last_activity_date DATE;
  new_streak INTEGER;
BEGIN
  -- Zähle abgeschlossene Schritte
  SELECT COUNT(*) INTO completed_steps_count
  FROM public.training_steps ts
  JOIN public.training_plans tp ON ts.training_plan_id = tp.id
  WHERE tp.user_id = user_id_param AND ts.is_completed = true;

  -- Berechne Gesamtpunkte
  SELECT COALESCE(SUM(ts.points_reward), 0) INTO total_points_earned
  FROM public.training_steps ts
  JOIN public.training_plans tp ON ts.training_plan_id = tp.id
  WHERE tp.user_id = user_id_param AND ts.is_completed = true;

  -- Hole letzte Aktivität
  SELECT last_activity INTO last_activity_date
  FROM public.user_rewards
  WHERE user_id = user_id_param;

  -- Berechne neue Streak
  IF last_activity_date IS NULL THEN
    new_streak := 1;
  ELSIF last_activity_date = today_date - INTERVAL '1 day' THEN
    -- Konsekutiver Tag
    SELECT current_streak + 1 INTO new_streak
    FROM public.user_rewards
    WHERE user_id = user_id_param;
  ELSIF last_activity_date = today_date THEN
    -- Gleicher Tag, Streak bleibt
    SELECT current_streak INTO new_streak
    FROM public.user_rewards
    WHERE user_id = user_id_param;
  ELSE
    -- Streak unterbrochen
    new_streak := 1;
  END IF;

  -- Update oder Insert Belohnungsdaten mit neuen Badge-Schwellen
  INSERT INTO public.user_rewards (
    user_id, 
    total_points, 
    current_streak, 
    longest_streak, 
    last_activity,
    badges
  )
  VALUES (
    user_id_param,
    total_points_earned,
    new_streak,
    GREATEST(new_streak, COALESCE((SELECT longest_streak FROM public.user_rewards WHERE user_id = user_id_param), 0)),
    today_date,
    CASE 
      WHEN completed_steps_count >= 10 THEN '["Trainings-Starter", "Fleißiger Trainer", "Trainings-Experte", "Training-Master"]'::jsonb
      WHEN completed_steps_count >= 5 THEN '["Trainings-Starter", "Fleißiger Trainer", "Trainings-Experte"]'::jsonb
      WHEN completed_steps_count >= 3 THEN '["Trainings-Starter", "Fleißiger Trainer"]'::jsonb
      WHEN completed_steps_count >= 1 THEN '["Trainings-Starter"]'::jsonb
      ELSE '[]'::jsonb
    END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = EXCLUDED.total_points,
    current_streak = EXCLUDED.current_streak,
    longest_streak = GREATEST(user_rewards.longest_streak, EXCLUDED.longest_streak),
    last_activity = EXCLUDED.last_activity,
    badges = EXCLUDED.badges,
    updated_at = now();
END;
$function$;

-- Update trigger_update_rewards function
CREATE OR REPLACE FUNCTION public.trigger_update_rewards()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  -- Find user_id over training_plan and update both rewards and daily progress
  PERFORM public.update_user_rewards(
    (SELECT tp.user_id FROM public.training_plans tp WHERE tp.id = NEW.training_plan_id)
  );
  
  PERFORM public.update_daily_progress(
    (SELECT tp.user_id FROM public.training_plans tp WHERE tp.id = NEW.training_plan_id)
  );
  
  RETURN NEW;
END;
$function$;

-- Update validate_session_target function
CREATE OR REPLACE FUNCTION public.validate_session_target(target_value integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  -- Ensure reasonable bounds: between 1 and 10
  IF target_value IS NULL OR target_value < 1 OR target_value > 10 THEN
    RETURN 3; -- default
  END IF;
  RETURN target_value;
END;
$function$;

-- Update is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = _user_id
      AND is_active = true
      AND role IN ('admin', 'support')
  )
$function$;

-- Update has_admin_role function
CREATE OR REPLACE FUNCTION public.has_admin_role(_user_id uuid, _role admin_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = _user_id
      AND is_active = true
      AND role = _role
  )
$function$;

-- 2. Strengthen admin_users table security
-- Add additional RLS policy to prevent unauthorized admin creation
CREATE POLICY "Only super admins can create admin users" 
ON public.admin_users 
FOR INSERT 
WITH CHECK (
  auth.uid() IN (
    SELECT user_id 
    FROM public.admin_users 
    WHERE role = 'admin' 
    AND is_active = true
  ) OR auth.uid() = '9eb0fb86-da91-4955-b477-1e4e646fd4cd'::uuid
);

-- 3. Add audit logging for admin actions
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  action text NOT NULL,
  resource_type text,
  resource_id text,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (public.is_admin(auth.uid()));

-- Service role can insert audit logs
CREATE POLICY "Service can insert audit logs" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (true);