import { useTranslation } from 'react-i18next';

export const EmailConfigurationInfo = ({ testMode }: { testMode: boolean }) => {
  const { t } = useTranslation();

  return (
    <>
      {!testMode && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            {t('adminEmail.configuration.productionChecklist')}
          </div>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>{t('adminEmail.configuration.checklistItems.domainVerified')}</li>
            <li>{t('adminEmail.configuration.checklistItems.spfDkimConfigured')}</li>
            <li>{t('adminEmail.configuration.checklistItems.templatesTested')}</li>
            <li>{t('adminEmail.configuration.checklistItems.bounceHandling')}</li>
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="font-medium text-foreground">{t('adminEmail.configuration.implementedEmails')}</div>
          <ul className="text-gray-600 dark:text-gray-400 mt-1 space-y-1">
            <li>{t('adminEmail.configuration.emailTypes.welcomeRegistration')}</li>
            <li>{t('adminEmail.configuration.emailTypes.checkoutConfirmation')}</li>
            <li>{t('adminEmail.configuration.emailTypes.cancellationConfirmation')}</li>
            <li>{t('adminEmail.configuration.emailTypes.supportNotifications')}</li>
            <li>{t('adminEmail.configuration.emailTypes.paymentIssues')}</li>
          </ul>
        </div>
        <div>
          <div className="font-medium text-foreground">{t('adminEmail.configuration.pendingEmails')}</div>
          <ul className="text-gray-600 dark:text-gray-400 mt-1 space-y-1">
            <li>{t('adminEmail.configuration.pendingTypes.loginSecurityAlerts')}</li>
            <li>{t('adminEmail.configuration.pendingTypes.doubleOptIn')}</li>
            <li>{t('adminEmail.configuration.pendingTypes.newsletterSystem')}</li>
            <li>{t('adminEmail.configuration.pendingTypes.inactivityReminders')}</li>
          </ul>
        </div>
      </div>
    </>
  );
};
