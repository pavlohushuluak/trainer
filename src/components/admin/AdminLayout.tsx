
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  CreditCard, 
  HeadphonesIcon, 
  Monitor, 
  Settings,
  BarChart3,
  LogOut,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { ThemeLogo } from '@/components/ui/theme-logo';
import { useTranslation } from 'react-i18next';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { signOut } = useAuth();

  const navigation = [
    { name: t('adminLayout.analytics'), href: '/admin/analytics', icon: BarChart3 },
    { name: t('adminLayout.users'), href: '/admin/users', icon: Users },
    { name: t('adminLayout.chats'), href: '/admin/chats', icon: MessageCircle },
    { name: t('adminLayout.payments'), href: '/admin/payments', icon: CreditCard },
    { name: t('adminLayout.support'), href: '/admin/support', icon: HeadphonesIcon },
    { name: t('adminLayout.system'), href: '/admin/system', icon: Monitor },
    { name: t('adminLayout.settings'), href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="flex flex-col w-64 bg-card border-r border-border">
          <div className="flex items-center justify-center h-16 border-b border-border px-4">
            <ThemeLogo 
              className="h-8 w-auto"
              alt="TierTrainer24 Admin"
            />
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
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
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
