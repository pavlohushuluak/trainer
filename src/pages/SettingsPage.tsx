import { Settings, User, Bell, Shield, Palette, Globe } from 'lucide-react';
import MainNavigation from '@/components/layout/MainNavigation';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useThemeContext } from '@/hooks/ThemeProvider';
import { useTranslations } from '@/hooks/useTranslations';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SettingsPage = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useThemeContext();
  const { t, changeLanguage, currentLanguage } = useTranslations();

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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t('settings.profile.title')}
              </CardTitle>
              <CardDescription>
                {t('settings.profile.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">{t('settings.profile.email')}</label>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <Button variant="outline" size="sm">
                  {t('settings.profile.editProfile')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t('settings.language.title')}
              </CardTitle>
              <CardDescription>
                {t('settings.language.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">{t('settings.language.currentLanguage')}</label>
                  <Select value={currentLanguage} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-full max-w-xs">
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
                <p className="text-xs text-muted-foreground">
                  {t('settings.language.note')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
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
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('settings.security.title')}
              </CardTitle>
              <CardDescription>
                {t('settings.security.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t('settings.security.comingSoon')}
                </p>
                <Button variant="outline" size="sm" disabled>
                  {t('settings.security.changePassword')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                {t('settings.appearance.title')}
              </CardTitle>
              <CardDescription>
                {t('settings.appearance.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{t('settings.appearance.currentTheme')}</p>
                    <p className="text-xs text-muted-foreground">
                      {theme === 'dark' ? t('settings.appearance.darkTheme') : t('settings.appearance.lightTheme')}
                    </p>
                  </div>
                  <ThemeToggle variant="outline" size="sm" showLabel={true} />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant={theme === 'light' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setTheme('light')}
                  >
                    {t('settings.appearance.light')}
                  </Button>
                  <Button 
                    variant={theme === 'dark' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setTheme('dark')}
                  >
                    {t('settings.appearance.dark')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;