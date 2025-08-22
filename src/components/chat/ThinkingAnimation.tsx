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
      {/* Simple text with jumping dots */}
      <span className="text-xs sm:text-sm text-muted-foreground">
        {`💭 ${t('chat.thinking')}`}
      </span>

      {/* Animated Dots */}
      <div className="flex items-center gap-1">
        <div className="w-1 h-1 bg-muted-foreground rounded-full"
          style={{
            animation: 'thinkingDot 1.6s ease-in-out infinite',
            animationDelay: '0ms'
          }}></div>
        <div className="w-1 h-1 bg-muted-foreground rounded-full"
          style={{
            animation: 'thinkingDot 1.6s ease-in-out infinite',
            animationDelay: '200ms'
          }}></div>
        <div className="w-1 h-1 bg-muted-foreground rounded-full"
          style={{
            animation: 'thinkingDot 1.6s ease-in-out infinite',
            animationDelay: '400ms'
          }}></div>
      </div>
    </div>
  );
};
