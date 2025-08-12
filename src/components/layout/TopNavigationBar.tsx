
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Settings, User, LogOut, Shield, Menu, X, HelpCircle, PawPrint, TrendingUp, Camera, CreditCard, Loader2, Target, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useStickyHeader } from '@/hooks/useStickyHeader';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ThemeLogo } from '@/components/ui/theme-logo';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslations } from '@/hooks/useTranslations';

interface PetProfile {
  id: string;
  name: string;
  species: string;
}

interface TopNavigationBarProps {
  primaryPet?: PetProfile;
  isAdmin?: boolean;
  showAdminAccess?: boolean;
  showSettings?: boolean;
  onLogout: () => void;
  isAuthenticated?: boolean;
}

export const TopNavigationBar = ({
  primaryPet,
  isAdmin = false,
  showAdminAccess = false,
  showSettings = false,
  onLogout,
  isAuthenticated = false
}: TopNavigationBarProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { isScrolled } = useStickyHeader();
  const { t } = useTranslations();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Debug logging for admin status
  useEffect(() => {
    console.log('🔐 TopNavigationBar: Admin status:', {
      isAdmin,
      showAdminAccess,
      isAuthenticated
    });
  }, [isAdmin, showAdminAccess, isAuthenticated]);

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

  const handleMenuClick = (action: () => void) => {
    action();
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setIsMobileMenuOpen(false);
    try {
      await onLogout();
    } finally {
      // Reset loading state (though page will reload)
      setIsLoggingOut(false);
    }
  };

  const getMenuItems = () => {
    if (isAuthenticated) {
      // Menu items for logged-in users
      return [
        {
          icon: Target,
          label: t('navigation.myTraining'),
          action: () => navigate('/mein-tiertraining')
        },
        {
          icon: Users,
          label: t('navigation.community'),
          action: () => navigate('/community')
        },
        {
          icon: HelpCircle,
          label: t('navigation.help'),
          action: () => navigate('/support')
        },
        // {
        //   icon: Camera,
        //   label: t('navigation.imageAnalysis'),
        //   action: () => navigate('/image-analysis')
        // },
        // {
        //   icon: MessageCircle,
        //   label: t('navigation.trainerChat'),
        //   action: () => navigate('/chat')
        // },
        {
          icon: Settings,
          label: t('navigation.settings'),
          action: () => navigate('/settings')
        },
        ...(showAdminAccess ? [{
          icon: Shield,
          label: t('navigation.admin'),
          action: () => {
            console.log('🔐 Admin button clicked, navigating to /admin');
            console.log('🔐 Current location:', window.location.pathname);
            navigate('/admin/users');
          }
        }] : []),
        {
          icon: LogOut,
          label: isLoggingOut ? t('navigation.loggingOut') : t('navigation.logout'),
          action: handleLogout
        }
      ];
    } else {
      // Menu items for non-authenticated users (landing page)
      return [
        {
          icon: User,
          label: t('navigation.login'),
          action: () => navigate('/login')
        }
      ];
    }
  };

  const MenuItems = getMenuItems();

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-[40] border-b border-border backdrop-blur-md',
        'transform translate-3d will-change-transform transition-all duration-200',
        isScrolled ? 'bg-background/95 shadow-sm' : 'bg-background/90',
        'mb-[50px]'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <div className="flex items-center gap-4">
            <ThemeLogo
              className="h-8 w-auto"
              onClick={() => navigate('/')}
            />
          </div>

          {/* Navigation Actions */}
          {isMobile ? (
            /* Mobile Navigation with Hamburger Menu */
            <div className="relative" ref={menuRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
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
                    <div className="px-4 py-3 border-b border-border">
                      <ThemeToggle
                        variant="ghost"
                        size="sm"
                        showLabel={true}
                        className="w-full justify-start"
                      />
                    </div>
                    <LanguageSwitcher />
                    {MenuItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleMenuClick(item.action)}
                        disabled={item.label.includes('Wird abgemeldet') || isLoggingOut}
                        className="w-full px-4 py-3 text-left hover:bg-accent flex items-center gap-3 text-sm transition-colors border-b border-border last:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {item.label.includes('Wird abgemeldet') ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <item.icon className="h-4 w-4" />
                        )}
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Desktop Navigation */
            <div className="flex items-center gap-2">
              <ThemeToggle
                variant="ghost"
                size="sm"
                className="mr-2"
              />
              <LanguageSwitcher />
              {MenuItems.map((item, index) => (
                <Button
                  key={`desktop-${item.label}-${index}`}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMenuClick(item.action)}
                  disabled={item.label.includes(t('navigation.loggingOut')) || isLoggingOut}
                  className="flex items-center gap-3 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <item.icon className="h-4 w-4" />

                  {
                    item.icon === LogOut ? (
                      null
                    ) : (
                      <span className="hidden xl:block">{item.label}</span>
                    )
                  }
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div >
  );
};
