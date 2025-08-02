
import { EmailValidationButton } from './test-buttons/EmailValidationButton';
import { SimpleEmailValidationButton } from './test-buttons/SimpleEmailValidationButton';
import { ComprehensiveFunctionTestButton } from './test-buttons/ComprehensiveFunctionTestButton';
import { ConnectionTestButton } from './test-buttons/ConnectionTestButton';
import { SpecificEmailTestButtons } from './test-buttons/SpecificEmailTestButtons';
import { LiveTestEmailButton } from './test-buttons/LiveTestEmailButton';
import { useTranslation } from 'react-i18next';

export const EmailTestButtons = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <div className="font-medium">{t('adminEmail.testButtons.title')}</div>
      
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">{t('adminEmail.testButtons.liveTest.title')}</div>
        <LiveTestEmailButton />
      </div>
      
      <SimpleEmailValidationButton />
      
      <EmailValidationButton />
      
      <ComprehensiveFunctionTestButton />
      
      <ConnectionTestButton />
      
      <SpecificEmailTestButtons />
      
      <div className="text-xs text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700">
        {t('adminEmail.testButtons.info')}
      </div>
    </div>
  );
};
