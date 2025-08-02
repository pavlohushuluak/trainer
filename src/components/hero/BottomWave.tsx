
import { useThemeContext } from '@/hooks/ThemeProvider';

export const BottomWave = () => {
  const { resolvedTheme } = useThemeContext();
  
  const waveColor = resolvedTheme === 'dark' ? '#0f0f23' : '#ffffff';
  
  return (
    <div className="absolute bottom-0 left-0 right-0">
      <svg viewBox="0 0 1440 120" className="w-full h-20 sm:h-24">
        <path 
          fill={waveColor} 
          d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
        />
      </svg>
    </div>
  );
};
