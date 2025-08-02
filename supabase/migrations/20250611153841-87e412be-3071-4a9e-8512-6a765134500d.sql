
-- Einen Admin-Benutzer zur admin_users Tabelle hinzufügen
-- Ersetzen Sie 'ihre-email@example.com' mit Ihrer tatsächlichen E-Mail-Adresse
INSERT INTO public.admin_users (user_id, email, role, is_active)
SELECT id, email, 'admin', true
FROM auth.users 
WHERE email = 'ihre-email@example.com'
ON CONFLICT (user_id) DO UPDATE SET
  role = 'admin',
  is_active = true;
