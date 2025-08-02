-- Fix the daily session target calculation to be more realistic
-- Instead of summing ALL active plans, use a reasonable default or average

CREATE OR REPLACE FUNCTION public.update_daily_progress_with_sessions(user_id_param uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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

  -- Use a more realistic session target: 3-5 sessions per day regardless of plan count
  -- This encourages consistent daily practice without being overwhelming
  session_target := 5;

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
$function$