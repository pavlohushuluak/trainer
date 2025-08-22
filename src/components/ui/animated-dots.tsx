import React, { useState, useEffect } from 'react';

interface AnimatedDotsProps {
  text: string;
  className?: string;
}

export const AnimatedDots: React.FC<AnimatedDotsProps> = ({ text, className = '' }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className={className}>
      {text}{dots}
    </span>
  );
};
