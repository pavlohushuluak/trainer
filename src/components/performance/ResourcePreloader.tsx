
import { useEffect } from 'react';

interface PreloadResource {
  href: string;
  as: 'image' | 'font' | 'script' | 'style' | 'fetch';
  type?: string;
  crossorigin?: 'anonymous' | 'use-credentials';
  priority?: 'high' | 'low' | 'auto';
  media?: string;
}

interface ResourcePreloaderProps {
  resources: PreloadResource[];
  enableDNSPrefetch?: boolean;
  enablePreconnect?: boolean;
}

export const ResourcePreloader = ({ 
  resources, 
  enableDNSPrefetch = true,
  enablePreconnect = true 
}: ResourcePreloaderProps) => {
  useEffect(() => {
    // DNS Prefetch for external domains
    if (enableDNSPrefetch) {
      const externalDomains = [
        'fonts.googleapis.com',
        'fonts.gstatic.com',
        'static.cloudflareinsights.com'
      ];
      
      externalDomains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = `//${domain}`;
        if (!document.querySelector(`link[href="//${domain}"]`)) {
          document.head.appendChild(link);
        }
      });
    }

    // Preconnect to external domains
    if (enablePreconnect) {
      const preconnectDomains = [
        { href: 'https://fonts.googleapis.com', crossorigin: true },
        { href: 'https://fonts.gstatic.com', crossorigin: true }
      ];
      
      preconnectDomains.forEach(({ href, crossorigin }) => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = href;
        if (crossorigin) link.crossOrigin = 'anonymous';
        if (!document.querySelector(`link[href="${href}"][rel="preconnect"]`)) {
          document.head.appendChild(link);
        }
      });
    }

    // Preload critical resources with enhanced attributes
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      
      if (resource.type) {
        link.type = resource.type;
      }
      
      if (resource.crossorigin) {
        link.crossOrigin = resource.crossorigin;
      }

      if (resource.priority && 'fetchPriority' in link) {
        (link as any).fetchPriority = resource.priority;
      }

      if (resource.media) {
        link.media = resource.media;
      }

      // Add to head if not already present
      const existingSelector = `link[href="${resource.href}"][rel="preload"]`;
      if (!document.querySelector(existingSelector)) {
        document.head.appendChild(link);
      }
    });

    // Prefetch non-critical resources after page load
    if (document.readyState === 'complete') {
      prefetchNonCriticalResources();
    } else {
      window.addEventListener('load', prefetchNonCriticalResources);
    }

    // Cleanup function
    return () => {
      resources.forEach(resource => {
        const existingLink = document.querySelector(`link[href="${resource.href}"][rel="preload"]`);
        if (existingLink) {
          existingLink.remove();
        }
      });
      window.removeEventListener('load', prefetchNonCriticalResources);
    };
  }, [resources, enableDNSPrefetch, enablePreconnect]);

  const prefetchNonCriticalResources = () => {
    // Prefetch routes that users are likely to visit
    const likelyRoutes = ['/mein-tiertraining', '/support'];
    
    likelyRoutes.forEach(route => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      if (!document.querySelector(`link[href="${route}"][rel="prefetch"]`)) {
        document.head.appendChild(link);
      }
    });
  };

  return null;
};
