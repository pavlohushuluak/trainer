/**
 * @fileoverview ScrollToTop - Automatically scrolls to top on route changes
 * Ensures consistent scroll behavior when navigating between pages
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that scrolls the window to the top on route changes
 * Should be placed inside BrowserRouter but outside Routes
 * 
 * Features:
 * - Scrolls to top on route change (pathname change)
 * - Handles hash navigation (e.g., /#pricing)
 * - Works with browser back/forward buttons
 * - Safari compatible
 * - Prevents scroll on initial load if hash exists
 */
export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  const prevPathnameRef = useRef<string>('');

  useEffect(() => {
    // Store previous pathname
    const prevPathname = prevPathnameRef.current;
    prevPathnameRef.current = pathname;

    // Skip scroll on initial load
    if (prevPathname === '' && pathname === '/') {
      return;
    }

    // If there's a hash, let the browser handle the scroll to anchor
    if (hash) {
      console.log('📜 ScrollToTop: Hash detected, skipping scroll. Hash:', hash);
      // Allow browser to scroll to hash anchor
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          console.log('📜 ScrollToTop: Scrolled to hash element:', hash);
        }
      }, 100);
      return;
    }

    // Only scroll to top if pathname actually changed
    if (prevPathname !== pathname) {
      // Use requestAnimationFrame for better performance and timing
      requestAnimationFrame(() => {
        // Scroll to top immediately when route changes
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant' // Use 'instant' for immediate scroll
        });

        // Also reset document scroll position (for Safari compatibility)
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        console.log('📜 ScrollToTop: Scrolled to top for route:', pathname);
      });
    }
  }, [pathname, hash]);

  return null; // This component doesn't render anything
};

