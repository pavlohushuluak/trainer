
-- First, let's see what values are actually being rejected and fix the constraint properly
-- Drop the existing constraint
ALTER TABLE public.subscribers DROP CONSTRAINT IF EXISTS subscribers_subscription_tier_check;

-- Add a more permissive constraint that includes all the values we actually use
ALTER TABLE public.subscribers ADD CONSTRAINT subscribers_subscription_tier_check 
CHECK (subscription_tier IS NULL OR subscription_tier IN (
  'Basic',
  'Premium', 
  'Enterprise',
  'free',
  'trial',
  'premium',
  'basic',
  '1-tier', 
  '2-tier', 
  '3-4-tier', 
  '5-8-tier', 
  'unlimited-tier'
));

-- Update any existing rows that might have invalid values
UPDATE public.subscribers 
SET subscription_tier = 'Basic' 
WHERE subscription_tier IS NOT NULL 
AND subscription_tier NOT IN ('Basic', 'Premium', 'Enterprise', 'free', 'trial', 'premium', 'basic', '1-tier', '2-tier', '3-4-tier', '5-8-tier', 'unlimited-tier');
