import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/useTranslations';

interface VerificationCodeInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  required?: boolean;
  className?: string;
  error?: string;
  loading?: boolean;
  resendLoading?: boolean;
  email?: string;
}

export const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({
  id,
  label,
  value,
  onChange,
  onVerify,
  onResend,
  required = false,
  className,
  error,
  loading = false,
  resendLoading = false,
  email
}) => {
  const { t } = useTranslations();
  const [isValid, setIsValid] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-verify when 6 digits are entered
  useEffect(() => {
    if (value.length === 6 && !loading) {
      setIsValid(true);
      onVerify(value);
    } else {
      setIsValid(false);
    }
  }, [value, loading, onVerify]);

  const handleInputChange = (index: number, inputValue: string) => {
    // Only allow digits
    if (!/^\d*$/.test(inputValue)) return;

    // Update the value
    const newValue = value.split('');
    newValue[index] = inputValue;
    const updatedValue = newValue.join('').slice(0, 6);
    onChange(updatedValue);

    // Move to next input if current input has a value
    if (inputValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pastedData);
    
    // Focus the next empty input or the last input
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {/* 6-digit input fields */}
      <div className="flex gap-2 justify-center">
        {[...Array(6)].map((_, index) => (
          <Input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={cn(
              "w-12 h-12 text-center text-lg font-semibold border-2",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500",
              isValid && !error && "border-green-500 focus:border-green-500 focus:ring-green-500",
              !error && !isValid && "border-border focus:border-primary focus:ring-primary"
            )}
            disabled={loading}
          />
        ))}
      </div>

      {/* Status messages */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {isValid && !error && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="h-4 w-4" />
          {t('auth.verificationCode.validating')}
        </div>
      )}

      {/* Instructions */}
      <div className="text-center text-xs text-muted-foreground">
        {t('auth.verificationCode.instructions')}
      </div>

      {/* Resend code button */}
      <div className="text-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onResend}
          disabled={resendLoading}
          className="text-xs text-primary hover:text-primary/80 hover:underline"
        >
          {resendLoading ? (
            <>
              <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin mr-1" />
              {t('auth.verificationCode.resending')}
            </>
          ) : (
            t('auth.verificationCode.resend')
          )}
        </Button>
      </div>

      {/* Email display */}
      {email && (
        <div className="text-center text-xs text-muted-foreground">
          {t('auth.verificationCode.sentTo')} <span className="font-medium">{email}</span>
        </div>
      )}
    </div>
  );
};
