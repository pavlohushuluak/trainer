import { useState, useEffect } from 'react';

export const useStickyHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || window.pageYOffset;
      setIsScrolled(scrollTop > 10);
    };

    // Add scroll event listener with better mobile support
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Also listen for touch events on mobile
    if ('ontouchstart' in window) {
      window.addEventListener('touchmove', handleScroll, { passive: true });
    }

    // Initial check
    handleScroll();

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if ('ontouchstart' in window) {
        window.removeEventListener('touchmove', handleScroll);
      }
    };
  }, []);

  return { isScrolled };
}; 