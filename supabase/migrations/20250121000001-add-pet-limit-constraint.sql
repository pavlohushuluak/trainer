-- Add pet limit constraint to enforce subscription-based limits
-- This migration adds a function and constraint to prevent users from exceeding their pet limits

-- Create function to check pet limits
CREATE OR REPLACE FUNCTION public.check_pet_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_pet_count INTEGER;
  max_pets_allowed INTEGER;
  user_subscription RECORD;
BEGIN
  -- Get current pet count for the user
  SELECT COUNT(*) INTO current_pet_count
  FROM public.pet_profiles
  WHERE user_id = NEW.user_id;
  
  -- Get user's subscription information
  SELECT subscribed, subscription_tier, tier_limit
  INTO user_subscription
  FROM public.subscribers
  WHERE user_id = NEW.user_id;
  
  -- Calculate pet limit based on subscription
  IF NOT FOUND OR NOT user_subscription.subscribed THEN
    -- Free tier gets 1 pet
    max_pets_allowed := 1;
  ELSIF user_subscription.tier_limit IS NOT NULL AND user_subscription.tier_limit > 0 THEN
    -- Use tier_limit from database if available
    max_pets_allowed := user_subscription.tier_limit;
  ELSIF user_subscription.subscription_tier THEN
    -- Fallback to subscription tier mapping
    CASE user_subscription.subscription_tier
      WHEN 'plan1' THEN max_pets_allowed := 1;
      WHEN 'plan2' THEN max_pets_allowed := 2;
      WHEN 'plan3' THEN max_pets_allowed := 4;
      WHEN 'plan4' THEN max_pets_allowed := 8;
      WHEN 'plan5' THEN max_pets_allowed := 999; -- Unlimited
      WHEN '1-tier' THEN max_pets_allowed := 1;
      WHEN '2-tier' THEN max_pets_allowed := 2;
      WHEN '3-4-tier' THEN max_pets_allowed := 4;
      WHEN '5-8-tier' THEN max_pets_allowed := 8;
      WHEN 'unlimited-tier' THEN max_pets_allowed := 999; -- Unlimited
      ELSE
        -- For any legacy tiers, default to 1 for free users
        max_pets_allowed := 1;
    END CASE;
  ELSE
    -- No subscription tier specified, default to 1 pet
    max_pets_allowed := 1;
  END IF;
  
  -- Check if adding this pet would exceed the limit
  IF current_pet_count >= max_pets_allowed THEN
    RAISE EXCEPTION 'Pet limit exceeded. Current: %, Maximum: %. Please upgrade your plan to add more pets.', 
      current_pet_count, max_pets_allowed;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to enforce pet limits on INSERT
DROP TRIGGER IF EXISTS enforce_pet_limit ON public.pet_profiles;
CREATE TRIGGER enforce_pet_limit
  BEFORE INSERT ON public.pet_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_pet_limit();

-- Add comment explaining the constraint
COMMENT ON FUNCTION public.check_pet_limit() IS 'Enforces pet limits based on user subscription tier before allowing new pet creation';
COMMENT ON TRIGGER enforce_pet_limit ON public.pet_profiles IS 'Prevents users from exceeding their subscription-based pet limits';
