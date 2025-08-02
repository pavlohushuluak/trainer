
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from 'react-i18next';

interface LegalCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const LegalCheckbox = ({ checked, onCheckedChange }: LegalCheckboxProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-start space-x-2">
      <Checkbox
        id="terms"
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="mt-1"
      />
      <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
        {t('auth.legal.acceptTerms')}{' '}
        <Link to="/agb" className="text-primary hover:underline">
          {t('auth.legal.terms')}
        </Link>{' '}
        {t('auth.legal.and')}{' '}
        <Link to="/datenschutz" className="text-primary hover:underline">
          {t('auth.legal.privacy')}
        </Link>
      </label>
    </div>
  );
};
