import React from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useThemeContext } from '@/hooks/ThemeProvider';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/useTranslations';

interface ThemeToggleProps {
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className,
  variant = 'ghost',
  size = 'default',
  showLabel = false,
}) => {
  const { theme, resolvedTheme, toggleTheme } = useThemeContext();
  const { t } = useTranslations();

  const getIcon = () => {
    return resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />;
  };

  const getLabel = () => {
    return resolvedTheme === 'dark' ? t('settings.appearance.light') : t('settings.appearance.dark');
  };

  const getTooltip = () => {
    return resolvedTheme === 'dark' 
      ? t('settings.appearance.switchToLight', 'Switch to light mode') 
      : t('settings.appearance.switchToDark', 'Switch to dark mode');
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={cn(
        'transition-all duration-200 hover:scale-105 active:scale-95',
        'relative overflow-hidden group',
        className
      )}
      title={getTooltip()}
    >
      <div className="flex items-center gap-2">
        <div className="relative">
          {getIcon()}
          {/* Animated background effect */}
          <div className="absolute inset-0 bg-primary/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-200" />
        </div>
        {showLabel && (
          <span className="text-sm font-medium">
            {getLabel()}
          </span>
        )}
      </div>
    </Button>
  );
}; 