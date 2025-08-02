import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/useTranslations';

interface EmailInputProps {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  error?: string;
}

export const EmailInput: React.FC<EmailInputProps> = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  required = false,
  className,
  error
}) => {
  const { t } = useTranslations();
  const [isFocused, setIsFocused] = useState(false);
  
  const defaultPlaceholder = t('validation.emailPlaceholder');

  const emailValidation = useMemo(() => {
    if (!value) {
      return {
        isValid: false,
        message: '',
        icon: null
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(value);

    if (isValid) {
      return {
        isValid: true,
        message: t('validation.validEmail'),
        icon: <CheckCircle className="h-4 w-4 text-green-500" />
      };
    } else {
      return {
        isValid: false,
        message: t('validation.invalidEmail'),
        icon: <XCircle className="h-4 w-4 text-red-500" />
      };
    }
  }, [value, isFocused]);

  const showValidation = value && isFocused;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <Input
        id={id}
        type="email"
        placeholder={placeholder || defaultPlaceholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        required={required}
        className={cn(
          showValidation && !emailValidation.isValid && "border-red-500 focus:border-red-500 focus:ring-red-500",
          showValidation && emailValidation.isValid && "border-green-500 focus:border-green-500 focus:ring-green-500"
        )}
      />

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {showValidation && !error && (
        <div className={cn(
          "flex items-center gap-2 text-sm",
          emailValidation.isValid ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
        )}>
          {emailValidation.icon}
          <span>{emailValidation.message}</span>
        </div>
      )}
    </div>
  );
}; 