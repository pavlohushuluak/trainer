-- Add personalized content tracking fields to training plans and steps
-- This allows us to distinguish between template-based and personalized content

-- Add is_ai_generated field to training_plans table
ALTER TABLE public.training_plans 
ADD COLUMN is_ai_generated BOOLEAN DEFAULT false;

-- Add is_ai_generated field to training_steps table  
ALTER TABLE public.training_steps 
ADD COLUMN is_ai_generated BOOLEAN DEFAULT false;

-- Add index for better query performance when filtering personalized content
CREATE INDEX idx_training_plans_ai_generated ON public.training_plans(is_ai_generated);
CREATE INDEX idx_training_steps_ai_generated ON public.training_steps(is_ai_generated);

-- Add comment to document the purpose of these fields
COMMENT ON COLUMN public.training_plans.is_ai_generated IS 'Indicates if this training plan was personalized rather than using a template';
COMMENT ON COLUMN public.training_steps.is_ai_generated IS 'Indicates if this training step was personalized rather than using a template';
