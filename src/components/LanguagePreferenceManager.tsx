import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../hooks/auth/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '../hooks/use-toast';
import { saveUserLanguageSupport, getUserLanguageSupport } from '@/utils/languageSupport';

interface LanguagePreferenceManagerProps {
  className?: string;
}

export const LanguagePreferenceManager: React.FC<LanguagePreferenceManagerProps> = ({ className }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [currentLanguage, setCurrentLanguage] = useState<string>('de');
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load current language preference from database
  useEffect(() => {
    const loadLanguagePreference = async () => {
      if (!user?.email) return;

      try {
        setIsLoading(true);
        const userLanguage = await getUserLanguageSupport(user.email);
        setCurrentLanguage(userLanguage);
        
        // Update i18n language if different
        if (i18n.language !== userLanguage) {
          i18n.changeLanguage(userLanguage);
        }
      } catch (error) {
        console.error('Exception loading language preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguagePreference();
  }, [user?.email, i18n]);

  // Update language preference
  const updateLanguagePreference = async (newLanguage: string) => {
    if (!user?.email) return;

    try {
      setIsUpdating(true);
      
      // Update database using utility function
      const result = await saveUserLanguageSupport(user.email, newLanguage);

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to save language preference');
      }

      // Update local state
      setCurrentLanguage(newLanguage);
      
      // Update i18n language
      i18n.changeLanguage(newLanguage);
      
      // Store in localStorage for persistence
      localStorage.setItem('i18nextLng', newLanguage);

      toast({
        title: t('languagePreference.updated'),
        description: t('languagePreference.updatedDescription'),
      });
    } catch (error) {
      console.error('Error updating language preference:', error);
      toast({
        title: t('languagePreference.error'),
        description: t('languagePreference.errorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLanguageChange = (value: string) => {
    updateLanguagePreference(value);
  };

  if (!user) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t('languagePreference.title')}</CardTitle>
        <CardDescription>
          {t('languagePreference.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <label htmlFor="language-select" className="text-sm font-medium">
              {t('languagePreference.selectLanguage')}
            </label>
            <Select
              value={currentLanguage}
              onValueChange={handleLanguageChange}
              disabled={isLoading || isUpdating}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t('languagePreference.selectPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="de">
                  🇩🇪 Deutsch
                </SelectItem>
                <SelectItem value="en">
                  🇺🇸 English
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isUpdating && (
            <div className="text-sm text-muted-foreground">
              {t('languagePreference.updating')}
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p>{t('languagePreference.note')}</p>
            <ul className="mt-2 space-y-1">
              <li>• {t('languagePreference.noteEmails')}</li>
              <li>• {t('languagePreference.noteInterface')}</li>
              <li>• {t('languagePreference.noteSupport')}</li>
            </ul>
          </div>

          <div className="pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              disabled={isLoading || isUpdating}
            >
              {t('languagePreference.refreshPage')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 