-- Update handle_new_user function to create subscriber record with free tier
-- and add 'free' to subscription_tier constraint

-- First, add 'free' to the subscription_tier constraint if it's not already there
DO $$
BEGIN
  -- Check if 'free' is already in the constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'subscribers_subscription_tier_check' 
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%free%'
  ) THEN
    -- Drop existing constraint and recreate with 'free' included
    ALTER TABLE public.subscribers DROP CONSTRAINT IF EXISTS subscribers_subscription_tier_check;
    ALTER TABLE public.subscribers ADD CONSTRAINT subscribers_subscription_tier_check 
    CHECK (subscription_tier IS NULL OR subscription_tier IN (
      'free', 'plan1', 'plan2', 'plan3', 'plan4', 'plan5'
    ));
  END IF;
END $$;

-- Update handle_new_user function to create subscriber record with free tier
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
  
  -- Create subscriber record with free tier
  INSERT INTO public.subscribers (
    user_id, 
    email, 
    subscribed, 
    subscription_tier, 
    subscription_status,
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    false, -- Not subscribed to paid plan
    'free', -- Free tier for new users
    'inactive', -- No active subscription
    now(),
    now()
  );
  
  RETURN NEW;
END;
$function$;

-- Create subscriber records for existing users who don't have them
INSERT INTO public.subscribers (user_id, email, subscribed, subscription_tier, subscription_status, created_at, updated_at)
SELECT 
  p.id,
  p.email,
  false,
  'free',
  'inactive',
  p.created_at,
  now()
FROM public.profiles p
LEFT JOIN public.subscribers s ON p.id = s.user_id
WHERE s.user_id IS NULL
ON CONFLICT (email) DO NOTHING;
