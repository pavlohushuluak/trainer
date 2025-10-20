-- Add trial_confirm column to subscribers table
-- This tracks whether user has been notified about trial expiration and confirmed viewing subscription plans
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS trial_confirm BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN public.subscribers.trial_confirm IS 'Whether user has viewed subscription plans after trial expiration notification (default: false)';

-- Create index for better performance on queries filtering by trial_confirm
CREATE INDEX IF NOT EXISTS idx_subscribers_trial_confirm 
ON public.subscribers(trial_confirm) 
WHERE trial_confirm = false;

-- Update existing rows to default trial_confirm to false
UPDATE public.subscribers 
SET trial_confirm = false 
WHERE trial_confirm IS NULL;

