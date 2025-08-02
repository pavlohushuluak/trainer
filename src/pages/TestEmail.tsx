
import { TestEmailButton } from '@/components/admin/TestEmailButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from '@/hooks/useTranslations';

export default function TestEmail() {
  const { t } = useTranslations();

  return (
    <div className="container mx-auto p-6 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>{t('testEmail.title')}</CardTitle>
          <CardDescription>
            {t('testEmail.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TestEmailButton recipientEmail="gl@cooper-ads.com" />
        </CardContent>
      </Card>
    </div>
  );
}
