
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SatisfactionRequestProps {
  onFeedback: (isHelpful: boolean) => void;
}

export const SatisfactionRequest = ({ onFeedback }: SatisfactionRequestProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex justify-center">
      <Card className="max-w-md">
        <CardContent className="p-4 text-center">
          <p className="text-sm mb-3">
            {t('support.satisfactionRequest.question')} 🤔
          </p>
          <div className="flex gap-2 justify-center">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onFeedback(true)}
              className="flex items-center gap-1"
            >
              <ThumbsUp className="h-4 w-4" />
              {t('support.satisfactionRequest.yes')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onFeedback(false)}
              className="flex items-center gap-1"
            >
              <ThumbsDown className="h-4 w-4" />
              {t('support.satisfactionRequest.no')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
