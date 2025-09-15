import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/useTranslations';

interface PasswordInputProps {
  id: string;
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  minLength?: number;
  showStrength?: boolean;
  showHint?: boolean;
  className?: string;
  error?: string;
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
  showHint = true,
  className,
  error
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslations();
  
  // Use translations for default values
  const defaultLabel = label || t('auth.password');
  const defaultPlaceholder = placeholder || t('validation.passwordPlaceholder');



  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="text-sm font-medium">
        {defaultLabel}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={defaultPlaceholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          minLength={minLength}
          aria-describedby={error ? `${id}-error` : showHint ? `${id}-hint` : undefined}
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
          aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <div id={`${id}-error`} className="flex items-center gap-2 text-xs text-red-500" role="alert">
          <AlertCircle className="h-3 w-3" />
          <span>{error}</span>
        </div>
      )}

      {/* Simple password requirement hint - only show when showHint is true and no error */}
      {showHint && !error && (
        <div id={`${id}-hint`} className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-1 h-1 rounded-full bg-blue-500"></div>
          <span>{t('validation.passwordMinLengthHint')}</span>
        </div>
      )}
    </div>
  );
}; 