-- Remove the problematic analytics_events_event_type_check constraint
-- This constraint is causing database flooding and making the app unusable
ALTER TABLE public.analytics_events DROP CONSTRAINT IF EXISTS analytics_events_event_type_check;