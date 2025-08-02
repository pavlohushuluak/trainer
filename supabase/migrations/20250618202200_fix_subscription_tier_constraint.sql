
-- Drop the existing constraint if it exists
ALTER TABLE public.subscribers DROP CONSTRAINT IF EXISTS subscribers_subscription_tier_check;

-- Add the updated constraint with all valid subscription tier values
ALTER TABLE public.subscribers ADD CONSTRAINT subscribers_subscription_tier_check 
CHECK (subscription_tier IS NULL OR subscription_tier IN (
  '1-tier', 
  '2-tier', 
  '3-4-tier', 
  '5-8-tier', 
  'unlimited-tier',
  'Basic',
  'Premium', 
  'Enterprise'
));
