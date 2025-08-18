
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

interface SatisfactionRequestProps {
  onFeedback: (isHelpful: boolean) => void;
  disabled?: boolean;
}

export const SatisfactionRequest = ({ onFeedback, disabled = false }: SatisfactionRequestProps) => {
  const { t } = useTranslations();
  
  return (
    <div className="flex justify-center">
      <Card className="max-w-md">
        <CardContent className="p-4 text-center">
          <p className="text-sm mb-3">
            {disabled ? t('support.satisfactionRequest.submitting') : t('support.satisfactionRequest.question')} {disabled ? '⏳' : '🤔'}
          </p>
          <div className="flex gap-2 justify-center">
            {disabled && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('support.satisfactionRequest.processing')}
              </div>
            )}
            {!disabled && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onFeedback(true)}
                  disabled={disabled}
                  className="flex items-center gap-1"
                >
                  <ThumbsUp className="h-4 w-4" />
                  {t('support.satisfactionRequest.yes')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onFeedback(false)}
                  disabled={disabled}
                  className="flex items-center gap-1"
                >
                  <ThumbsDown className="h-4 w-4" />
                  {t('support.satisfactionRequest.no')}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
