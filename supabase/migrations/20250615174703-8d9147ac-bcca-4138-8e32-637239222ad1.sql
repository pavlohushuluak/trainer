
-- RLS Policies für Admin-Zugriff auf Nutzer-Daten
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all subscribers" 
  ON public.subscribers 
  FOR SELECT 
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update subscribers" 
  ON public.subscribers 
  FOR UPDATE 
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert subscribers" 
  ON public.subscribers 
  FOR INSERT 
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete subscribers" 
  ON public.subscribers 
  FOR DELETE 
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- RLS Policies für user_notes (Admin-Notizen)
CREATE POLICY "Admins can view all user notes" 
  ON public.user_notes 
  FOR SELECT 
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can create user notes" 
  ON public.user_notes 
  FOR INSERT 
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- RLS Policies für admin_activity_log
CREATE POLICY "Admins can view activity log" 
  ON public.admin_activity_log 
  FOR SELECT 
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can create activity log entries" 
  ON public.admin_activity_log 
  FOR INSERT 
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- Spalte für Testnutzer in subscribers hinzufügen
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS is_test_user boolean DEFAULT false;

-- Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id ON public.subscribers(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
