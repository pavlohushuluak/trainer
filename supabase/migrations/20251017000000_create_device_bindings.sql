-- Create device_bindings table to enforce one account per device
CREATE TABLE IF NOT EXISTS public.device_bindings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_fingerprint TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  device_info JSONB,
  is_locked BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for fast lookups
CREATE INDEX IF NOT EXISTS idx_device_bindings_fingerprint ON public.device_bindings(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_device_bindings_user_id ON public.device_bindings(user_id);
CREATE INDEX IF NOT EXISTS idx_device_bindings_email ON public.device_bindings(email);

-- Enable RLS
ALTER TABLE public.device_bindings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only view their own device bindings
CREATE POLICY "Users can view own device bindings" 
  ON public.device_bindings FOR SELECT 
  USING (auth.uid() = user_id);

-- Service role can manage all device bindings
CREATE POLICY "Service role can manage device bindings" 
  ON public.device_bindings FOR ALL 
  USING (auth.jwt()->>'role' = 'service_role');

-- Add comments for documentation
COMMENT ON TABLE public.device_bindings IS 'Stores device-to-account bindings to enforce one account per device';
COMMENT ON COLUMN public.device_bindings.device_fingerprint IS 'Unique device identifier generated from browser/device characteristics';
COMMENT ON COLUMN public.device_bindings.user_id IS 'User ID bound to this device';
COMMENT ON COLUMN public.device_bindings.email IS 'Email bound to this device for quick reference';
COMMENT ON COLUMN public.device_bindings.first_login_at IS 'When this device was first used';
COMMENT ON COLUMN public.device_bindings.last_login_at IS 'Last time this account logged in from this device';
COMMENT ON COLUMN public.device_bindings.device_info IS 'Additional device information (user agent, platform, etc.)';
COMMENT ON COLUMN public.device_bindings.is_locked IS 'Whether this binding is enforced (true = locked to account)';

