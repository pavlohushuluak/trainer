import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Home, Star, CreditCard, MessageCircle, HelpCircle, User } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useStickyHeader } from '@/hooks/useStickyHeader';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ThemeLogo } from '@/components/ui/theme-logo';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslations } from '@/hooks/useTranslations';
import { useNavigate } from 'react-router-dom';

export const HomepageHeader = () => {
  const { t } = useTranslations();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { isScrolled } = useStickyHeader();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMobileMenuOpen]);

  const handleMenuClick = (sectionId: string) => {
    // Close mobile menu
    setIsMobileMenuOpen(false);

    // Smooth scroll to section
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartFree = () => {
    navigate('/login');
  };

  const menuItems = [
    {
      icon: Home,
      label: t('navigation.home'),
      action: () => scrollToTop(),
      sectionId: 'hero'
    },
    {
      icon: Star,
      label: t('navigation.benefits'),
      action: () => handleMenuClick('benefits'),
      sectionId: 'benefits'
    },
    {
      icon: CreditCard,
      label: t('navigation.pricing'),
      action: () => handleMenuClick('pricing'),
      sectionId: 'pricing'
    },
    {
      icon: MessageCircle,
      label: t('navigation.testimonials'),
      action: () => handleMenuClick('testimonials'),
      sectionId: 'testimonials'
    },
    {
      icon: HelpCircle,
      label: t('navigation.faq'),
      action: () => handleMenuClick('faq'),
      sectionId: 'faq'
    }
  ];

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-[40] border-b border-border backdrop-blur-md',
        'transform translate-3d will-change-transform transition-all duration-200',
        isScrolled ? 'bg-background/95 shadow-sm' : 'bg-background/90'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}

          {/* Navigation Actions */}
          {isMobile ? (
            /* Mobile Navigation with Hamburger Menu */
            <div className="flex justify-between items-center w-full mx-8" ref={menuRef}>
              <div className="flex items-center gap-4">
                <ThemeLogo
                  className="h-8 w-auto cursor-pointer"
                  onClick={scrollToTop}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>

              {/* Mobile Dropdown Menu */}
              {isMobileMenuOpen && (
                <div className="absolute right-0 top-0 mt-2 w-64 bg-card shadow-lg border rounded-lg z-[9999] animate-fade-in">
                  <div className="py-2">
                    {/* Theme Toggle and Language Switcher for Mobile */}
                    <div className="px-4 border-b border-border">
                      <ThemeToggle
                        variant="ghost"
                        size="sm"
                        showLabel={true}
                        className="w-full justify-start"
                      />
                    </div>
                    <LanguageSwitcher />
                    {menuItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={item.action}
                        className="w-full px-4 py-3 text-left hover:bg-accent flex items-center gap-3 text-sm transition-colors border-b border-border"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                    <div className="px-4 py-3 border-t border-border">
                      <Button
                        onClick={handleStartFree}
                        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium py-3 transition-all duration-200 hover:scale-105"
                      >
                        <User className="h-4 w-4 mr-2" />
                        {t('navigation.startFree')}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Desktop Navigation */
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <ThemeLogo
                  className="h-8 w-auto cursor-pointer"
                  onClick={scrollToTop}
                />
              </div>
              <div className="flex items-center gap-2">
                {menuItems.map((item, index) => (
                  <Button
                    key={`desktop-${item.label}-${index}`}
                    variant="ghost"
                    size="sm"
                    onClick={item.action}
                    className="flex items-center gap-3 text-sm transition-colors"
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="hidden xl:block">{item.label}</span>
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle
                  variant="ghost"
                  size="sm"
                  className="mr-2"
                />
                <LanguageSwitcher />
                <div className="border-border">
                  <Button
                    onClick={handleStartFree}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium px-4 py-2 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                  >
                    <User className="h-4 w-4 mr-2" />
                    {t('navigation.startFree')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
