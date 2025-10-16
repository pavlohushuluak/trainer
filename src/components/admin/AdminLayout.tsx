import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, 
  CreditCard, 
  HeadphonesIcon, 
  Monitor, 
  Settings,
  BarChart3,
  LogOut,
  MessageCircle,
  Menu,
  X,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { ThemeLogo } from '@/components/ui/theme-logo';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { signOut, user, loading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageLoadTime, setPageLoadTime] = useState<number>(0);
  const navigate = useNavigate();
  // Track page load time for debugging
  useEffect(() => {
    const startTime = Date.now();
    setPageLoadTime(startTime);
    
    return () => {
      const loadTime = Date.now() - startTime;
      console.log('🔍 AdminLayout: Page load time:', loadTime + 'ms');
    };
  }, [location.pathname]);

  console.log('🔍 AdminLayout: Render state:', {
    pathname: location.pathname,
    user: !!user,
    authLoading,
    sidebarOpen,
    pageLoadTime
  });

  const navigation = [
    { name: t('adminLayout.analytics'), href: 'analytics', icon: BarChart3 },
    { name: t('adminLayout.users'), href: 'users', icon: Users },
    { name: t('adminLayout.chats'), href: 'chats', icon: MessageCircle },
    // { name: t('adminLayout.payments'), href: 'payments', icon: CreditCard },
    { name: t('adminLayout.support'), href: 'support', icon: HeadphonesIcon },
    { name: t('adminLayout.system'), href: 'system', icon: Monitor },
    { name: t('adminLayout.finance'), href: 'finance', icon: Wallet },
    { name: t('adminLayout.settings'), href: 'settings', icon: Settings },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="bg-background">
      <div className="flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Sidebar */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 sm:w-72 lg:w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex items-center justify-between h-14 sm:h-16 border-b border-border px-3 sm:px-4 shrink-0">
            <Link to="/" className="flex items-center min-w-0" onClick={closeSidebar}>
              <ThemeLogo 
                className="h-7 sm:h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                alt="TierTrainer24 Admin"
              />
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeSidebar}
              className="lg:hidden h-8 w-8 p-0 flex-shrink-0 touch-manipulation"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <nav className="flex-1 p-3 sm:p-4 space-y-1.5 sm:space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname.endsWith(item.href) || 
                              (item.href === 'analytics' && location.pathname.endsWith('/admin/analytics'));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={closeSidebar}
                  className={cn(
                    "flex items-center px-3 py-2.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors min-h-[44px] sm:min-h-[40px] touch-manipulation",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2.5 sm:mr-3 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-3 sm:p-4 border-t border-border shrink-0">
            <Button
              variant="outline"
              className="w-full justify-start text-xs sm:text-sm min-h-[44px] sm:min-h-[40px] px-3 touch-manipulation"
              onClick={() => signOut()}
            >
              <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{t('adminLayout.logout')}</span>
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-between px-3 py-3 sm:px-4 sm:py-4 border-b border-border bg-card shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="h-9 w-9 p-0 flex-shrink-0 touch-manipulation hover:bg-accent"
            >
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <ThemeLogo 
              className="h-6 sm:h-7 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              alt="TierTrainer24 Admin"
              onClick={() => navigate('/')}
            />
            <div className="w-9 flex-shrink-0" /> {/* Spacer for centering */}
          </div>

          <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>

      {/* Debug panel for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-3 sm:bottom-4 left-3 sm:left-4 bg-black/90 text-white p-2 sm:p-3 rounded-md text-[10px] sm:text-xs z-50 max-w-[250px] sm:max-w-xs backdrop-blur-sm">
          <div className="font-semibold mb-1">Admin Layout Debug:</div>
          <div className="truncate">Path: {location.pathname}</div>
          <div className="truncate">User: {user?.email || 'None'}</div>
          <div>Auth Loading: {authLoading ? 'Yes' : 'No'}</div>
          <div>Sidebar: {sidebarOpen ? 'Open' : 'Closed'}</div>
          <div>Load Time: {pageLoadTime ? Date.now() - pageLoadTime + 'ms' : 'N/A'}</div>
        </div>
      )}
    </div>
  );
};
