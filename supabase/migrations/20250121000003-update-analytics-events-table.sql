-- Update analytics_events table to new structure
-- Drop existing analytics_events table and recreate with new structure

-- Drop existing table and recreate with new structure
DROP TABLE IF EXISTS public.analytics_events CASCADE;

-- Create new analytics_events table with the updated structure
CREATE TABLE public.analytics_events (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  mainpage_view BIGINT NOT NULL DEFAULT 0,
  homepage_view BIGINT NOT NULL DEFAULT 0,
  page_view BIGINT NOT NULL DEFAULT 0,
  view_user TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create unique index on date to ensure only one record per day
CREATE UNIQUE INDEX idx_analytics_events_date ON public.analytics_events(date);

-- Create index on date for faster queries
CREATE INDEX idx_analytics_events_date_created ON public.analytics_events(date, created_at);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics_events
-- Allow service role to manage all analytics
CREATE POLICY "Service can manage all analytics" ON public.analytics_events FOR ALL USING (true);

-- Allow authenticated users to insert analytics (for tracking their own views)
CREATE POLICY "Authenticated users can insert analytics" ON public.analytics_events FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow service role to read all analytics
CREATE POLICY "Service can read all analytics" ON public.analytics_events FOR SELECT USING (true);

-- Create function to handle page view tracking
CREATE OR REPLACE FUNCTION public.track_page_view(
  p_page_path TEXT,
  p_user_email TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  existing_record RECORD;
BEGIN
  -- Check if record exists for today
  SELECT * INTO existing_record 
  FROM public.analytics_events 
  WHERE date = today_date;
  
  IF existing_record IS NULL THEN
    -- Create new record for today
    INSERT INTO public.analytics_events (
      date,
      mainpage_view,
      homepage_view,
      page_view,
      view_user
    ) VALUES (
      today_date,
      CASE WHEN p_page_path = '/mein-tiertraining' THEN 1 ELSE 0 END,
      CASE WHEN p_page_path = '/' THEN 1 ELSE 0 END,
      CASE WHEN p_page_path NOT IN ('/', '/mein-tiertraining') THEN 1 ELSE 0 END,
      CASE WHEN p_user_email IS NOT NULL THEN ARRAY[p_user_email] ELSE '{}' END
    );
  ELSE
    -- Update existing record
    UPDATE public.analytics_events 
    SET 
      mainpage_view = CASE 
        WHEN p_page_path = '/mein-tiertraining' THEN mainpage_view + 1 
        ELSE mainpage_view 
      END,
      homepage_view = CASE 
        WHEN p_page_path = '/' THEN homepage_view + 1 
        ELSE homepage_view 
      END,
      page_view = CASE 
        WHEN p_page_path NOT IN ('/', '/mein-tiertraining') THEN page_view + 1 
        ELSE page_view 
      END,
      view_user = CASE 
        WHEN p_user_email IS NOT NULL AND NOT (p_user_email = ANY(view_user)) 
        THEN array_append(view_user, p_user_email)
        ELSE view_user
      END,
      updated_at = now()
    WHERE date = today_date;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.track_page_view(TEXT, TEXT) TO authenticated;
