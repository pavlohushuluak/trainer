import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
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

  const getRequirementIcon = (met: boolean) => {
    return met ? (
      <CheckCircle className="h-3 w-3 text-green-500" />
    ) : (
      <XCircle className="h-3 w-3 text-red-400" />
    );
  };

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
                  <div className="space-y-3">
            {/* Strength Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{t('validation.passwordStrength')}</span>
                <span className={cn("font-medium", passwordStrength.color)}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    passwordStrength.bgColor
                  )}
                  style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Requirements */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">{t('validation.requirements')}</p>
              <div className="grid grid-cols-1 gap-1 text-xs">
                <div className="flex items-center gap-2">
                  {getRequirementIcon(passwordStrength.requirements.minLength)}
                  <span className={passwordStrength.requirements.minLength ? "text-foreground" : "text-muted-foreground"}>
                    {t('validation.minCharacters', { min: minLength })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getRequirementIcon(passwordStrength.requirements.hasUppercase)}
                  <span className={passwordStrength.requirements.hasUppercase ? "text-foreground" : "text-muted-foreground"}>
                    {t('validation.uppercaseRequired')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getRequirementIcon(passwordStrength.requirements.hasLowercase)}
                  <span className={passwordStrength.requirements.hasLowercase ? "text-foreground" : "text-muted-foreground"}>
                    {t('validation.lowercaseRequired')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getRequirementIcon(passwordStrength.requirements.hasNumber)}
                  <span className={passwordStrength.requirements.hasNumber ? "text-foreground" : "text-muted-foreground"}>
                    {t('validation.numberRequired')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getRequirementIcon(passwordStrength.requirements.hasSpecial)}
                  <span className={passwordStrength.requirements.hasSpecial ? "text-foreground" : "text-muted-foreground"}>
                    {t('validation.specialRequired')}
                  </span>
                </div>
              </div>
            </div>
          </div>
      )}
    </div>
  );
}; 