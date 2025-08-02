import React from 'react';
import { useThemeContext } from '@/hooks/ThemeProvider';
import { cn } from '@/lib/utils';

interface ThemeLogoProps {
  className?: string;
  onClick?: () => void;
  alt?: string;
}

export const ThemeLogo: React.FC<ThemeLogoProps> = ({ 
  className, 
  onClick, 
  alt = "TierTrainer24" 
}) => {
  const { resolvedTheme } = useThemeContext();
  
  const logoSrc = resolvedTheme === 'dark' 
    ? '/logos/logo_dark.png' 
    : '/logos/logo_white.png';

  return (
    <img
      src={logoSrc}
      alt={alt}
      className={cn(
        'h-auto cursor-pointer transition-all duration-200',
        onClick && 'hover:scale-105',
        className
      )}
      onClick={onClick}
    />
  );
}; 