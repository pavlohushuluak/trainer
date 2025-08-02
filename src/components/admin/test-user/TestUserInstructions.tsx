
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const TestUserInstructions = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">{t('adminTestUser.instructions.usageTitle')}</h4>
        <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>{t('adminTestUser.instructions.usageSteps.step1')}</li>
          <li>{t('adminTestUser.instructions.usageSteps.step2')}</li>
          <li>{t('adminTestUser.instructions.usageSteps.step3')}</li>
          <li>{t('adminTestUser.instructions.usageSteps.step4')}</li>
        </ol>
      </div>
      
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
        <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">{t('adminTestUser.instructions.emailSetupTitle')}</h4>
        <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
          <li dangerouslySetInnerHTML={{ __html: t('adminTestUser.instructions.emailSetupItems.domain') }}></li>
          <li dangerouslySetInnerHTML={{ __html: t('adminTestUser.instructions.emailSetupItems.magicLinks') }}></li>
          <li dangerouslySetInnerHTML={{ __html: t('adminTestUser.instructions.emailSetupItems.sender') }}></li>
          <li dangerouslySetInnerHTML={{ __html: t('adminTestUser.instructions.emailSetupItems.resend') }}></li>
        </ul>
      </div>
      
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <h4 className="font-medium text-yellow-900 dark:text-yellow-200 mb-2 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {t('adminTestUser.instructions.nextStepsTitle')}
        </h4>
        <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
          <li dangerouslySetInnerHTML={{ __html: t('adminTestUser.instructions.nextStepsItems.verifyDomain') }}></li>
          <li dangerouslySetInnerHTML={{ __html: t('adminTestUser.instructions.nextStepsItems.dnsRecords') }}></li>
          <li dangerouslySetInnerHTML={{ __html: t('adminTestUser.instructions.nextStepsItems.alternative') }}></li>
        </ul>
      </div>
      
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
        <h4 className="font-medium text-red-900 dark:text-red-200 mb-2">{t('adminTestUser.instructions.supabaseTitle')}</h4>
        <ul className="text-sm text-red-800 dark:text-red-300 space-y-1">
          <li dangerouslySetInnerHTML={{ __html: t('adminTestUser.instructions.supabaseItems.siteUrl') }}></li>
          <li dangerouslySetInnerHTML={{ __html: t('adminTestUser.instructions.supabaseItems.redirectUrls') }}></li>
          <li dangerouslySetInnerHTML={{ __html: t('adminTestUser.instructions.supabaseItems.emailTemplates') }}></li>
        </ul>
      </div>
    </>
  );
};
