
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const AdminAuthForm = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Erst normal anmelden
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error(t('adminAuth.toasts.loginFailed'));
      }

      // Dann prüfen ob Admin-Berechtigung vorhanden
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('role, is_active')
        .eq('user_id', authData.user.id)
        .eq('is_active', true)
        .single();

      if (adminError || !adminData) {
        // Bei fehlendem Admin-Zugang wieder abmelden
        await supabase.auth.signOut();
        throw new Error(t('adminAuth.toasts.noPermission'));
      }

      // Admin-Login protokollieren
      await supabase
        .from('admin_activity_log')
        .insert({
          admin_id: authData.user.id,
          action: 'admin_login',
          details: { role: adminData.role }
        });

      // Last login aktualisieren
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('user_id', authData.user.id);

      toast({
        title: t('adminAuth.toasts.loginSuccess'),
        description: t('adminAuth.toasts.welcomeMessage', { role: adminData.role })
      });

    } catch (error: any) {
      console.error('Admin login error:', error);
      toast({
        variant: "destructive",
        title: t('adminAuth.toasts.loginFailed'),
        description: error.message || t('adminAuth.toasts.unknownError')
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">{t('adminAuth.title')}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t('adminAuth.subtitle')}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdminSignIn} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                {t('adminAuth.email')}
              </label>
              <Input
                id="email"
                type="email"
                placeholder={t('adminAuth.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                {t('adminAuth.password')}
              </label>
              <Input
                id="password"
                type="password"
                placeholder={t('adminAuth.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('adminAuth.loginButton')}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              {t('adminAuth.footer.authorized')} 
              <br />
              {t('adminAuth.footer.contactAdmin')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
