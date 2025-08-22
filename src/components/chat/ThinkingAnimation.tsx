import React from 'react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/useTranslations';

interface ThinkingAnimationProps {
  trainerName: string;
  className?: string;
}

export const ThinkingAnimation: React.FC<ThinkingAnimationProps> = ({
  trainerName,
  className
}) => {
  const { t } = useTranslations();
  return (
    <div className={cn(
      "flex items-center gap-2",
      className
    )}>
      {/* Simple thinking text like normal chat message */}
      <span className="text-xs sm:text-sm text-muted-foreground">
        {`💭 ${trainerName} ${t('chat.thinking')}`}
      </span>

      {/* Professional animated dots */}
      <div className="flex items-center gap-1">
        <div className="w-1 h-1 bg-muted-foreground rounded-full opacity-60 animate-thinking-bounce"></div>
        <div className="w-1 h-1 bg-muted-foreground rounded-full opacity-60 animate-thinking-bounce" style={{ animationDelay: '160ms' }}></div>
        <div className="w-1 h-1 bg-muted-foreground rounded-full opacity-60 animate-thinking-bounce" style={{ animationDelay: '320ms' }}></div>
      </div>
    </div>
  );
};
