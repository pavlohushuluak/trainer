-- Create table for image analysis history
CREATE TABLE public.image_analysis_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES public.pet_profiles(id) ON DELETE SET NULL,
  image_url TEXT,
  analysis_result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.image_analysis_history ENABLE ROW LEVEL SECURITY;

-- Create policies for image_analysis_history
CREATE POLICY "Users can view their own image analysis history" 
  ON public.image_analysis_history 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own image analysis history" 
  ON public.image_analysis_history 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own image analysis history" 
  ON public.image_analysis_history 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own image analysis history" 
  ON public.image_analysis_history 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add trigger to update updated_at column
CREATE TRIGGER update_image_analysis_history_updated_at 
    BEFORE UPDATE ON public.image_analysis_history 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_image_analysis_history_user_id ON public.image_analysis_history(user_id);
CREATE INDEX idx_image_analysis_history_pet_id ON public.image_analysis_history(pet_id);
CREATE INDEX idx_image_analysis_history_created_at ON public.image_analysis_history(created_at DESC); 