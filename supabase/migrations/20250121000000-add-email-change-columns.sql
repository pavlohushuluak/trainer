-- Add email change columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS pending_email TEXT,
ADD COLUMN IF NOT EXISTS email_change_requested_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_change_token TEXT;

-- Add index on email_change_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email_change_token ON public.profiles(email_change_token);

-- Add index on pending_email for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_pending_email ON public.profiles(pending_email);

-- Add comment explaining the purpose of these columns
COMMENT ON COLUMN public.profiles.pending_email IS 'Email address that user wants to change to (pending confirmation)';
COMMENT ON COLUMN public.profiles.email_change_requested_at IS 'Timestamp when email change was requested';
COMMENT ON COLUMN public.profiles.email_change_token IS 'Unique token for confirming email change';
