
-- Tabelle für Bildanalyse-Nutzung erstellen
CREATE TABLE public.image_analysis_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analyses_used INTEGER NOT NULL DEFAULT 0,
  last_analysis_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- RLS aktivieren
ALTER TABLE public.image_analysis_usage ENABLE ROW LEVEL SECURITY;

-- Policy: Nutzer können nur ihre eigenen Daten sehen
CREATE POLICY "Users can view their own analysis usage" 
  ON public.image_analysis_usage 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy: Nutzer können nur ihre eigenen Daten einfügen
CREATE POLICY "Users can insert their own analysis usage" 
  ON public.image_analysis_usage 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy: Nutzer können nur ihre eigenen Daten aktualisieren
CREATE POLICY "Users can update their own analysis usage" 
  ON public.image_analysis_usage 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Trigger für updated_at
CREATE TRIGGER update_image_analysis_usage_updated_at
  BEFORE UPDATE ON public.image_analysis_usage
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
