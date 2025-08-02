
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmailStatistics } from './email/EmailStatistics';
import { EmailModeToggle } from './email/EmailModeToggle';
import { EmailTestButtons } from './email/EmailTestButtons';
import { EmailConfigurationInfo } from './email/EmailConfigurationInfo';
import { useTranslation } from 'react-i18next';

export const EmailTestToggle = () => {
  const { t } = useTranslation();
  const [testMode, setTestMode] = useState(true);
  const [updating, setUpdating] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('adminEmailTestToggle.title')}</CardTitle>
        <CardDescription>
          {t('adminEmailTestToggle.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <EmailModeToggle 
          testMode={testMode}
          setTestMode={setTestMode}
          updating={updating}
          setUpdating={setUpdating}
        />

        <EmailStatistics />

        <EmailTestButtons />

        <EmailConfigurationInfo testMode={testMode} />
      </CardContent>
    </Card>
  );
};
