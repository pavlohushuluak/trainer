import { Settings, User, Bell, Shield, Palette, Globe } from 'lucide-react';
import MainNavigation from '@/components/layout/MainNavigation';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useThemeContext } from '@/hooks/ThemeProvider';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguagePersistence } from '@/hooks/useLanguagePersistence';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProfileEditModal } from '@/components/settings/ProfileEditModal';
import { PasswordChangeModal } from '@/components/settings/PasswordChangeModal';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SettingsPage = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useThemeContext();
  const { t } = useTranslations();
  const { changeLanguage, currentLanguage } = useLanguagePersistence();
  const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false);
  const [isPasswordChangeModalOpen, setIsPasswordChangeModalOpen] = useState(false);

  // Refresh user data when component mounts to ensure we have the latest email
  useEffect(() => {
    const refreshUserData = async () => {
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error refreshing user data:', error);
          return;
        }
        if (currentUser && currentUser.email !== user?.email) {
          console.log('Email updated detected, refreshing page...');
          // Force a page refresh to get the latest user data
          window.location.reload();
        }
      } catch (error) {
        console.error('Error in refreshUserData:', error);
      }
    };

    refreshUserData();
  }, [user?.email]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('settings.page.loginRequired.title')}</h1>
          <p className="text-muted-foreground">{t('settings.page.loginRequired.description')}</p>
        </div>
      </div>
    );
  }

  const languages = [
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  const handleLanguageChange = (languageCode: "de" | "en") => {
    changeLanguage(languageCode);
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation user={user} />
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <Settings className="h-8 w-8 text-primary" />
            {t('settings.page.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('settings.page.subtitle')}
          </p>
        </div>

        <div className="grid gap-6">
          <Card className="hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                {t('settings.profile.title')}
              </CardTitle>
              <CardDescription className="text-blue-600 dark:text-blue-400">
                {t('settings.profile.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-blue-100/50 dark:bg-blue-900/20 rounded-lg">
                  <label className="text-sm font-medium text-blue-800 dark:text-blue-200">{t('settings.profile.email')}</label>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">{user.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsProfileEditModalOpen(true)}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/20 dark:hover:text-blue-200"
                  >
                    {t('settings.profile.editProfile')}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.reload()}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/20 dark:hover:text-blue-200"
                  >
                    🔄 Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                {t('settings.language.title')}
              </CardTitle>
              <CardDescription className="text-green-600 dark:text-green-400">
                {t('settings.language.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-green-100/50 dark:bg-green-900/20 rounded-lg">
                  <label className="text-sm font-medium text-green-800 dark:text-green-200">{t('settings.language.currentLanguage')}</label>
                  <Select value={currentLanguage} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-full max-w-xs border-green-200 dark:border-green-800">
                      <SelectValue placeholder={t('settings.language.selectLanguage')} />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((language) => (
                        <SelectItem key={language.code} value={language.code}>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{language.flag}</span>
                            <span>{language.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 p-2 bg-green-50/50 dark:bg-green-900/10 rounded">
                  {t('settings.language.note')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {t('settings.notifications.title')}
              </CardTitle>
              <CardDescription>
                {t('settings.notifications.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t('settings.notifications.comingSoon')}
                </p>
                <Button variant="outline" size="sm" disabled>
                  {t('settings.notifications.manageNotifications')}
                </Button>
              </div>
            </CardContent>
          </Card> */}

          <Card className="hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                {t('settings.security.title')}
              </CardTitle>
              <CardDescription className="text-red-600 dark:text-red-400">
                {t('settings.security.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-red-100/50 dark:bg-red-900/20 rounded-lg">
                    <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800 dark:text-red-200">
                        {t('settings.security.passwordSecurity')}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {t('settings.security.passwordSecurityDescription')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-orange-100/50 dark:bg-orange-900/20 rounded-lg">
                    <Shield className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                        {t('settings.security.accountProtection')}
                      </p>
                      <p className="text-xs text-orange-600 dark:text-orange-400">
                        {t('settings.security.accountProtectionDescription')}
                      </p>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsPasswordChangeModalOpen(true)}
                  className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20 dark:hover:text-red-200"
                >
                  {t('settings.security.changePassword')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                {t('settings.appearance.title')}
              </CardTitle>
              <CardDescription className="text-purple-600 dark:text-purple-400">
                {t('settings.appearance.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-purple-100/50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-purple-800 dark:text-purple-200">{t('settings.appearance.currentTheme')}</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400">
                        {theme === 'dark' ? t('settings.appearance.darkTheme') : t('settings.appearance.lightTheme')}
                      </p>
                    </div>
                    <ThemeToggle variant="outline" size="sm" showLabel={true} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isProfileEditModalOpen}
        onClose={() => setIsProfileEditModalOpen(false)}
      />

      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={isPasswordChangeModalOpen}
        onClose={() => setIsPasswordChangeModalOpen(false)}
      />
    </div>
  );
};

export default SettingsPage;