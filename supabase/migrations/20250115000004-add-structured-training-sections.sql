-- Add structured training section columns to training_steps table
-- This allows us to store each section separately for better organization and display

-- Add new columns for structured training sections
ALTER TABLE public.training_steps 
ADD COLUMN exercise_goal TEXT,
ADD COLUMN step_by_step_guide TEXT,
ADD COLUMN repetition_duration TEXT,
ADD COLUMN required_tools TEXT,
ADD COLUMN learning_tips TEXT,
ADD COLUMN common_mistakes TEXT;

-- Add English versions for multi-language support
ALTER TABLE public.training_steps 
ADD COLUMN exercise_goal_en TEXT,
ADD COLUMN step_by_step_guide_en TEXT,
ADD COLUMN repetition_duration_en TEXT,
ADD COLUMN required_tools_en TEXT,
ADD COLUMN learning_tips_en TEXT,
ADD COLUMN common_mistakes_en TEXT;

-- Add indexes for better query performance
CREATE INDEX idx_training_steps_exercise_goal ON public.training_steps(exercise_goal);
CREATE INDEX idx_training_steps_step_by_step_guide ON public.training_steps(step_by_step_guide);
CREATE INDEX idx_training_steps_repetition_duration ON public.training_steps(repetition_duration);

-- Add comments to document the purpose of these fields
COMMENT ON COLUMN public.training_steps.exercise_goal IS 'The specific goal or objective for this training step';
COMMENT ON COLUMN public.training_steps.step_by_step_guide IS 'Detailed step-by-step instructions for the training';
COMMENT ON COLUMN public.training_steps.repetition_duration IS 'Repetition schedule and duration information';
COMMENT ON COLUMN public.training_steps.required_tools IS 'Required equipment and tools for this training step';
COMMENT ON COLUMN public.training_steps.learning_tips IS 'Tips and motivation for successful training';
COMMENT ON COLUMN public.training_steps.common_mistakes IS 'Common mistakes to avoid during training';
COMMENT ON COLUMN public.training_steps.exercise_goal_en IS 'English version of exercise goal';
COMMENT ON COLUMN public.training_steps.step_by_step_guide_en IS 'English version of step-by-step guide';
COMMENT ON COLUMN public.training_steps.repetition_duration_en IS 'English version of repetition and duration';
COMMENT ON COLUMN public.training_steps.required_tools_en IS 'English version of required tools';
COMMENT ON COLUMN public.training_steps.learning_tips_en IS 'English version of learning tips';
COMMENT ON COLUMN public.training_steps.common_mistakes_en IS 'English version of common mistakes';
