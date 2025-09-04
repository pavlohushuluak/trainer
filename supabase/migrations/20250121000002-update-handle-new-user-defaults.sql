-- Update handle_new_user function to set correct default values for new users
-- This migration ensures new users get tier_limit = 1 and image_analysis_num = 0

-- Update handle_new_user function to include tier_limit and image_analysis_num
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  
  -- Create subscriber record with correct defaults
  INSERT INTO public.subscribers (
    user_id, 
    email, 
    subscribed, 
    subscription_tier, 
    subscription_status,
    tier_limit,
    image_analysis_num,
    questions_num,
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    false, -- Not subscribed to paid plan
    'free', -- Free tier for new users
    'inactive', -- No active subscription
    1, -- tier_limit = 1 (allows 1 pet)
    0, -- image_analysis_num = 0 (no image analysis used yet)
    0, -- questions_num = 0 (no chat questions used yet)
    now(),
    now()
  );
  
  RETURN NEW;
END;
$function$;

-- Update existing users who don't have tier_limit or image_analysis_num set
UPDATE public.subscribers 
SET 
  tier_limit = COALESCE(tier_limit, 1),
  image_analysis_num = COALESCE(image_analysis_num, 0),
  questions_num = COALESCE(questions_num, 0)
WHERE tier_limit IS NULL OR image_analysis_num IS NULL OR questions_num IS NULL;

-- Add comment explaining the function
COMMENT ON FUNCTION public.handle_new_user() IS 'Creates profile and subscriber records for new users with tier_limit=1 and image_analysis_num=0';
