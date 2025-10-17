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
import { useState } from 'react';
import { useGTM } from '@/hooks/useGTM';

const SettingsPage = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useThemeContext();
  const { t } = useTranslations();
  const { changeLanguage, currentLanguage } = useLanguagePersistence();
  const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false);
  const [isPasswordChangeModalOpen, setIsPasswordChangeModalOpen] = useState(false);
  const { trackChangeLanguage, trackChangeDark } = useGTM();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-3 sm:p-4">
        <div className="text-center max-w-md">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4">{t('settings.page.loginRequired.title')}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">{t('settings.page.loginRequired.description')}</p>
        </div>
      </div>
    );
  }

  const languages = [
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  const handleLanguageChange = (languageCode: "de" | "en") => {
    const previousLanguage = currentLanguage;
    changeLanguage(languageCode);
    
    // Track language change
    trackChangeLanguage(previousLanguage, languageCode);
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation user={user} />
      
      <div className="max-w-4xl mx-auto p-3 sm:p-4 lg:p-6">
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2 sm:gap-2.5 lg:gap-3 mb-1.5 sm:mb-2">
            <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-primary/10 flex-shrink-0">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary" />
            </div>
            <span className="truncate">{t('settings.page.title')}</span>
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-muted-foreground leading-relaxed pl-11 sm:pl-12 lg:pl-14">
            {t('settings.page.subtitle')}
          </p>
        </div>

        <div className="grid gap-3 sm:gap-4 lg:gap-6">
          <Card className="hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardHeader className="px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
              <CardTitle className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 text-blue-700 dark:text-blue-300 text-base sm:text-lg lg:text-xl">
                <div className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 sm:h-4.5 sm:w-4.5 lg:h-5 lg:w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="truncate">{t('settings.profile.title')}</span>
              </CardTitle>
              <CardDescription className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm mt-1.5 sm:mt-2">
                {t('settings.profile.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4 lg:px-6 lg:pb-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="p-2.5 sm:p-3 lg:p-4 bg-blue-100/50 dark:bg-blue-900/20 rounded-lg">
                  <label className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-200">{t('settings.profile.email')}</label>
                  <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 mt-1 truncate">{user.email}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsProfileEditModalOpen(true)}
                  className="w-full sm:w-auto min-h-[44px] sm:min-h-[40px] text-xs sm:text-sm border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/20 dark:hover:text-blue-200 touch-manipulation"
                >
                  {t('settings.profile.editProfile')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardHeader className="px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
              <CardTitle className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 text-green-700 dark:text-green-300 text-base sm:text-lg lg:text-xl">
                <div className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <Globe className="h-4 w-4 sm:h-4.5 sm:w-4.5 lg:h-5 lg:w-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="truncate">{t('settings.language.title')}</span>
              </CardTitle>
              <CardDescription className="text-green-600 dark:text-green-400 text-xs sm:text-sm mt-1.5 sm:mt-2">
                {t('settings.language.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4 lg:px-6 lg:pb-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="p-2.5 sm:p-3 lg:p-4 bg-green-100/50 dark:bg-green-900/20 rounded-lg">
                  <label className="text-xs sm:text-sm font-medium text-green-800 dark:text-green-200 block mb-2 sm:mb-2.5">{t('settings.language.currentLanguage')}</label>
                  <Select value={currentLanguage} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-full border-green-200 dark:border-green-800 min-h-[44px] sm:min-h-[40px] text-xs sm:text-sm">
                      <SelectValue placeholder={t('settings.language.selectLanguage')} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[60vh] sm:max-h-80">
                      {languages.map((language) => (
                        <SelectItem key={language.code} value={language.code} className="cursor-pointer">
                          <div className="flex items-center gap-2 sm:gap-2.5 py-1">
                            <span className="text-base sm:text-lg">{language.flag}</span>
                            <span className="text-xs sm:text-sm lg:text-base">{language.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-400 p-2 sm:p-2.5 bg-green-50/50 dark:bg-green-900/10 rounded leading-relaxed">
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
            <CardHeader className="px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
              <CardTitle className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 text-red-700 dark:text-red-300 text-base sm:text-lg lg:text-xl">
                <div className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-4 w-4 sm:h-4.5 sm:w-4.5 lg:h-5 lg:w-5 text-red-600 dark:text-red-400" />
                </div>
                <span className="truncate">{t('settings.security.title')}</span>
              </CardTitle>
              <CardDescription className="text-red-600 dark:text-red-400 text-xs sm:text-sm mt-1.5 sm:mt-2">
                {t('settings.security.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4 lg:px-6 lg:pb-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-2 sm:space-y-2.5 lg:space-y-3">
                  <div className="flex items-start gap-2 sm:gap-2.5 lg:gap-3 p-2.5 sm:p-3 lg:p-4 bg-red-100/50 dark:bg-red-900/20 rounded-lg">
                    <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-red-800 dark:text-red-200">
                        {t('settings.security.passwordSecurity')}
                      </p>
                      <p className="text-[10px] sm:text-xs text-red-600 dark:text-red-400 mt-0.5 sm:mt-1 leading-relaxed">
                        {t('settings.security.passwordSecurityDescription')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-2.5 lg:gap-3 p-2.5 sm:p-3 lg:p-4 bg-orange-100/50 dark:bg-orange-900/20 rounded-lg">
                    <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-orange-800 dark:text-orange-200">
                        {t('settings.security.accountProtection')}
                      </p>
                      <p className="text-[10px] sm:text-xs text-orange-600 dark:text-orange-400 mt-0.5 sm:mt-1 leading-relaxed">
                        {t('settings.security.accountProtectionDescription')}
                      </p>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsPasswordChangeModalOpen(true)}
                  className="w-full sm:w-auto min-h-[44px] sm:min-h-[40px] text-xs sm:text-sm border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20 dark:hover:text-red-200 touch-manipulation"
                >
                  {t('settings.security.changePassword')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <CardHeader className="px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
              <CardTitle className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 text-purple-700 dark:text-purple-300 text-base sm:text-lg lg:text-xl">
                <div className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                  <Palette className="h-4 w-4 sm:h-4.5 sm:w-4.5 lg:h-5 lg:w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="truncate">{t('settings.appearance.title')}</span>
              </CardTitle>
              <CardDescription className="text-purple-600 dark:text-purple-400 text-xs sm:text-sm mt-1.5 sm:mt-2">
                {t('settings.appearance.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4 lg:px-6 lg:pb-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="p-2.5 sm:p-3 lg:p-4 bg-purple-100/50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="space-y-0.5 sm:space-y-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-purple-800 dark:text-purple-200">{t('settings.appearance.currentTheme')}</p>
                      <p className="text-[10px] sm:text-xs text-purple-600 dark:text-purple-400">
                        {theme === 'dark' ? t('settings.appearance.darkTheme') : t('settings.appearance.lightTheme')}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <ThemeToggle variant="outline" size="sm" showLabel={true} />
                    </div>
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