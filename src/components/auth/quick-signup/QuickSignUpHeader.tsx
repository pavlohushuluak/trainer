
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface QuickSignUpHeaderProps {
  onClose: () => void;
}

export const QuickSignUpHeader = ({ onClose }: QuickSignUpHeaderProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex justify-between items-center p-6 border-b">
      <div>
        <h2 className="text-2xl font-bold">{t('auth.quickSignup.header.title')}</h2>
        <p className="text-muted-foreground text-sm">{t('auth.quickSignup.header.subtitle')}</p>
      </div>
      <Button variant="ghost" size="sm" onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
