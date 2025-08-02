-- Fix badge thresholds in update_user_rewards function
CREATE OR REPLACE FUNCTION update_user_rewards(user_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  completed_steps_count INTEGER;
  total_points_earned INTEGER;
  today_date DATE := CURRENT_DATE;
  last_activity_date DATE;
  new_streak INTEGER;
BEGIN
  -- Zähle abgeschlossene Schritte
  SELECT COUNT(*) INTO completed_steps_count
  FROM training_steps ts
  JOIN training_plans tp ON ts.training_plan_id = tp.id
  WHERE tp.user_id = user_id_param AND ts.is_completed = true;

  -- Berechne Gesamtpunkte
  SELECT COALESCE(SUM(ts.points_reward), 0) INTO total_points_earned
  FROM training_steps ts
  JOIN training_plans tp ON ts.training_plan_id = tp.id
  WHERE tp.user_id = user_id_param AND ts.is_completed = true;

  -- Hole letzte Aktivität
  SELECT last_activity INTO last_activity_date
  FROM user_rewards
  WHERE user_id = user_id_param;

  -- Berechne neue Streak
  IF last_activity_date IS NULL THEN
    new_streak := 1;
  ELSIF last_activity_date = today_date - INTERVAL '1 day' THEN
    -- Konsekutiver Tag
    SELECT current_streak + 1 INTO new_streak
    FROM user_rewards
    WHERE user_id = user_id_param;
  ELSIF last_activity_date = today_date THEN
    -- Gleicher Tag, Streak bleibt
    SELECT current_streak INTO new_streak
    FROM user_rewards
    WHERE user_id = user_id_param;
  ELSE
    -- Streak unterbrochen
    new_streak := 1;
  END IF;

  -- Update oder Insert Belohnungsdaten mit neuen Badge-Schwellen
  INSERT INTO user_rewards (
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
    GREATEST(new_streak, COALESCE((SELECT longest_streak FROM user_rewards WHERE user_id = user_id_param), 0)),
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
$$;