import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/useTranslations';

interface PasswordInputProps {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  minLength?: number;
  showStrength?: boolean;
  className?: string;
  error?: string;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  bgColor: string;
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  required = false,
  minLength = 6,
  showStrength = false,
  className,
  error
}) => {
  const { t } = useTranslations();
  const [showPassword, setShowPassword] = useState(false);
  const [showAdvancedTips, setShowAdvancedTips] = useState(false);
  
  const defaultPlaceholder = t('validation.passwordPlaceholder');

  const passwordStrength = useMemo((): PasswordStrength => {
    if (!value) {
      return {
        score: 0,
        label: t('validation.veryWeak'),
        color: 'text-red-500',
        bgColor: 'bg-red-100',
        requirements: {
          minLength: false,
          hasUppercase: false,
          hasLowercase: false,
          hasNumber: false,
          hasSpecial: false
        }
      };
    }

    const requirements = {
      minLength: value.length >= minLength,
      hasUppercase: /[A-Z]/.test(value),
      hasLowercase: /[a-z]/.test(value),
      hasNumber: /\d/.test(value),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(value)
    };

    const score = Object.values(requirements).filter(Boolean).length;

    let strengthLabel = '';
    let strengthColor = '';
    let strengthBgColor = '';

    if (score <= 1) {
      strengthLabel = t('validation.veryWeak');
      strengthColor = 'text-red-500';
      strengthBgColor = 'bg-red-100';
    } else if (score === 2) {
      strengthLabel = t('validation.weak');
      strengthColor = 'text-orange-500';
      strengthBgColor = 'bg-orange-100';
    } else if (score === 3) {
      strengthLabel = t('validation.medium');
      strengthColor = 'text-yellow-500';
      strengthBgColor = 'bg-yellow-100';
    } else if (score === 4) {
      strengthLabel = t('validation.strong');
      strengthColor = 'text-blue-500';
      strengthBgColor = 'bg-blue-100';
    } else {
      strengthLabel = t('validation.veryStrong');
      strengthColor = 'text-green-500';
      strengthBgColor = 'bg-green-100';
    }

    return {
      score,
      label: strengthLabel,
      color: strengthColor,
      bgColor: strengthBgColor,
      requirements
    };
  }, [value, minLength]);



  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder || defaultPlaceholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          minLength={minLength}
          className={cn(
            "pr-10",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500"
          )}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {showStrength && value && (
        <div className="space-y-2">
          {/* Secret Strength Indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-muted-foreground/30"></div>
              <span className="text-xs text-muted-foreground/70">{t('validation.secretStrength')}</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all duration-300",
                    i < passwordStrength.score 
                      ? passwordStrength.color.replace('text-', 'bg-').replace('-500', '-400')
                      : "bg-muted-foreground/20"
                  )}
                />
              ))}
            </div>
          </div>
          
          {/* Subtle strength hint */}
          <div className="text-xs text-muted-foreground/50 italic">
            {passwordStrength.score <= 2 && t('validation.strengthTip.weak')}
            {passwordStrength.score === 3 && t('validation.strengthTip.good')}
            {passwordStrength.score >= 4 && t('validation.strengthTip.excellent')}
          </div>
          
          {/* Success message for strong passwords */}
          {passwordStrength.score >= 4 && (
            <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
              <div className="text-xs text-green-700 dark:text-green-300 font-medium">
                {t('validation.passwordSuccess.title')}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                {t('validation.passwordSuccess.description')}
              </div>
            </div>
          )}
          
          {/* Professional password tips */}
          {passwordStrength.score <= 3 && (
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
              <div className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">
                {t('validation.passwordTips.title')}
              </div>
              <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-0.5">
                <li>• {t('validation.passwordTips.length')}</li>
                <li>• {t('validation.passwordTips.mix')}</li>
                <li>• {t('validation.passwordTips.avoid')}</li>
                <li>• {t('validation.passwordTips.unique')}</li>
              </ul>
              
              {/* Advanced tips toggle */}
              <button
                type="button"
                onClick={() => setShowAdvancedTips(!showAdvancedTips)}
                className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline"
              >
                {showAdvancedTips ? t('validation.passwordTips.hideAdvanced') : t('validation.passwordTips.showAdvanced')}
              </button>
              
              {/* Advanced tips */}
              {showAdvancedTips && (
                <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                  <div className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">
                    {t('validation.passwordTips.advancedTitle')}
                  </div>
                  <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-0.5">
                    <li>• {t('validation.passwordTips.passphrase')}</li>
                    <li>• {t('validation.passwordTips.substitution')}</li>
                    <li>• {t('validation.passwordTips.random')}</li>
                    <li>• {t('validation.passwordTips.manager')}</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 