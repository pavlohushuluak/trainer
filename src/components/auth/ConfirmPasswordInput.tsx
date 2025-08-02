import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/useTranslations';

interface ConfirmPasswordInputProps {
  id: string;
  placeholder?: string;
  value: string;
  password: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

export const ConfirmPasswordInput: React.FC<ConfirmPasswordInputProps> = ({
  id,
  placeholder,
  value,
  password,
  onChange,
  required = false,
  className
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslations();

  const validation = useMemo(() => {
    if (!value) {
      return {
        isValid: false,
        message: '',
        icon: null
      };
    }

    if (value !== password) {
      return {
        isValid: false,
        message: t('auth.confirmPassword.passwordsDontMatch'),
        icon: <XCircle className="h-4 w-4 text-red-500" />
      };
    }

    return {
      isValid: true,
      message: t('auth.confirmPassword.passwordsMatch'),
      icon: <CheckCircle className="h-4 w-4 text-green-500" />
    };
  }, [value, password, t]);

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="text-sm font-medium">
        {t('auth.confirmPassword.label')}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder || t('auth.confirmPassword.placeholder')}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className={cn(
            "pr-10",
            value && !validation.isValid && "border-red-500 focus:border-red-500 focus:ring-red-500",
            value && validation.isValid && "border-green-500 focus:border-green-500 focus:ring-green-500"
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

      {value && (
        <div className={cn(
          "flex items-center gap-2 text-sm",
          validation.isValid ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
        )}>
          {validation.icon}
          <span>{validation.message}</span>
        </div>
      )}
    </div>
  );
}; 