import { useEffect } from 'react';

export const useScrollbarPreservation = (isOpen: boolean) => {
  useEffect(() => {
    if (isOpen) {
      // Store original overflow values
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      
      // Force scrollbar to remain visible
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
      
      // Add a class to prevent Radix UI from hiding scrollbar
      document.body.classList.add('scrollbar-preserved');
      
      return () => {
        // Restore original overflow settings
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.classList.remove('scrollbar-preserved');
      };
    }
  }, [isOpen]);
}; 