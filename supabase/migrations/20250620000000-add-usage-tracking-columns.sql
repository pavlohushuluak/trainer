-- Add usage tracking columns to subscribers table for free users
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS questions_num INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS image_analysis_num INTEGER DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN public.subscribers.questions_num IS 'Number of chat questions used by free users (limit: 10)';
COMMENT ON COLUMN public.subscribers.image_analysis_num IS 'Number of image analyses used by free users (limit: 3)';

-- Create index for better performance on usage queries
CREATE INDEX IF NOT EXISTS idx_subscribers_usage_tracking 
ON public.subscribers(user_id, questions_num, image_analysis_num);

-- Update existing free users to have 0 usage
UPDATE public.subscribers 
SET questions_num = 0, image_analysis_num = 0 
WHERE subscribed = false OR subscription_status = 'inactive'; 