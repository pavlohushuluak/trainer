
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TestUserFormProps {
  testEmail: string;
  setTestEmail: (email: string) => void;
  onCreateTestUser: () => void;
  onGenerateMagicLink: () => void;
  isCreatingUser: boolean;
  isGeneratingLink: boolean;
}

export const TestUserForm = ({
  testEmail,
  setTestEmail,
  onCreateTestUser,
  onGenerateMagicLink,
  isCreatingUser,
  isGeneratingLink
}: TestUserFormProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 sm:grid sm:grid-cols-1 md:grid-cols-3 sm:gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">{t('adminTestUser.form.emailLabel')}</label>
        <Input
          type="email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          placeholder={t('adminTestUser.form.emailPlaceholder')}
          className="w-full"
        />
      </div>
      
      <div className="flex flex-col justify-end">
        <Button
          onClick={onCreateTestUser}
          disabled={isCreatingUser || !testEmail}
          className="w-full"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">
            {isCreatingUser ? t('adminTestUser.form.creatingButton') : t('adminTestUser.form.activateButton')}
          </span>
          <span className="sm:hidden">
            {isCreatingUser ? t('adminTestUser.form.creatingButton') : t('adminTestUser.form.activateButton')}
          </span>
        </Button>
      </div>
      
      <div className="flex flex-col justify-end">
        <Button
          variant="outline"
          onClick={onGenerateMagicLink}
          disabled={isGeneratingLink || !testEmail}
          className="w-full"
          size="sm"
        >
          <User className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">
            {isGeneratingLink ? t('adminTestUser.form.sendingButton') : t('adminTestUser.form.magicLinkButton')}
          </span>
          <span className="sm:hidden">
            {isGeneratingLink ? t('adminTestUser.form.sendingButton') : t('adminTestUser.form.magicLinkButton')}
          </span>
        </Button>
      </div>
    </div>
  );
};
