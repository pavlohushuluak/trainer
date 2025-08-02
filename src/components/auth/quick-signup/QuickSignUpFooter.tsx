
import { Zap, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const QuickSignUpFooter = () => {
  const { t } = useTranslation();
  return (
    <div className="mt-6 p-4 bg-accent/50 rounded-lg">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <Zap className="h-4 w-4 text-green-600" />
            {t('auth.quickSignup.footer.freeTrial')}
          </span>
          <span className="flex items-center gap-1">
            <UserPlus className="h-4 w-4 text-blue-600" />
            {t('auth.quickSignup.footer.price')}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {t('auth.quickSignup.footer.features')}
        </p>
      </div>
    </div>
  );
};
