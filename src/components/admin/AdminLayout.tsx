
import { Link, useLocation } from 'react-router-dom';
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
  X
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
    { name: t('adminLayout.settings'), href: 'settings', icon: Settings },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Sidebar */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex items-center justify-between h-16 border-b border-border px-4">
            <Link to="/" className="flex items-center" onClick={closeSidebar}>
              <ThemeLogo 
                className="h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                alt="TierTrainer24 Admin"
              />
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeSidebar}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname.endsWith(item.href) || 
                              (item.href === 'analytics' && location.pathname.endsWith('/admin/analytics'));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={closeSidebar}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent"
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => signOut()}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('adminLayout.logout')}
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <ThemeLogo 
              className="h-6 w-auto"
              alt="TierTrainer24 Admin"
            />
            <div className="w-10" /> {/* Spacer for centering */}
          </div>

          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>

      {/* Debug panel for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black text-white p-2 rounded text-xs z-50 max-w-xs">
          <div>Admin Layout Debug:</div>
          <div>Path: {location.pathname}</div>
          <div>User: {user?.email || 'None'}</div>
          <div>Auth Loading: {authLoading ? 'Yes' : 'No'}</div>
          <div>Sidebar: {sidebarOpen ? 'Open' : 'Closed'}</div>
          <div>Load Time: {pageLoadTime ? Date.now() - pageLoadTime + 'ms' : 'N/A'}</div>
        </div>
      )}
    </div>
  );
};
