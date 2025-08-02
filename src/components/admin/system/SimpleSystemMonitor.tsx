
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  AlertCircle,
  Play,
  Mail,
  Database,
  Settings
} from 'lucide-react';

interface SystemTest {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'pass' | 'fail' | 'warning';
  message: string;
  lastRun?: Date;
  duration?: number;
}

export const SimpleSystemMonitor = () => {
  const { t } = useTranslation();
  const [tests, setTests] = useState<SystemTest[]>([
    {
      id: 'database',
      name: t('adminSystem.simpleMonitor.tests.database.name'),
      description: t('adminSystem.simpleMonitor.tests.database.description'),
      status: 'idle',
      message: t('adminSystem.simpleMonitor.tests.database.message')
    },
    {
      id: 'auth',
      name: t('adminSystem.simpleMonitor.tests.auth.name'),
      description: t('adminSystem.simpleMonitor.tests.auth.description'),
      status: 'idle',
      message: t('adminSystem.simpleMonitor.tests.auth.message')
    },
    {
      id: 'email-config',
      name: t('adminSystem.simpleMonitor.tests.emailConfig.name'),
      description: t('adminSystem.simpleMonitor.tests.emailConfig.description'),
      status: 'idle',
      message: t('adminSystem.simpleMonitor.tests.emailConfig.message')
    },
    {
      id: 'email-send',
      name: t('adminSystem.simpleMonitor.tests.emailSend.name'),
      description: t('adminSystem.simpleMonitor.tests.emailSend.description'),
      status: 'idle',
      message: t('adminSystem.simpleMonitor.tests.emailSend.message')
    }
  ]);

  const [isRunningAll, setIsRunningAll] = useState(false);

  const updateTest = (id: string, updates: Partial<SystemTest>) => {
    setTests(prev => prev.map(test => 
      test.id === id 
        ? { ...test, ...updates, lastRun: new Date() }
        : test
    ));
  };

  const testDatabase = async () => {
    updateTest('database', { status: 'running', message: t('adminSystem.simpleMonitor.tests.database.testing') });
    const startTime = Date.now();
    
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      const duration = Date.now() - startTime;
      
      if (error) {
        updateTest('database', {
          status: 'fail',
          message: t('adminSystem.simpleMonitor.tests.database.failure', { error: error.message }),
          duration
        });
        return false;
      }
      
      updateTest('database', {
        status: 'pass',
        message: t('adminSystem.simpleMonitor.tests.database.success', { duration }),
        duration
      });
      return true;
    } catch (error: any) {
      updateTest('database', {
        status: 'fail',
        message: t('adminSystem.simpleMonitor.tests.database.networkError', { error: error.message }),
        duration: Date.now() - startTime
      });
      return false;
    }
  };

  const testAuth = async () => {
    updateTest('auth', { status: 'running', message: t('adminSystem.simpleMonitor.tests.auth.testing') });
    const startTime = Date.now();
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      const duration = Date.now() - startTime;
      
      if (error) {
        updateTest('auth', {
          status: 'fail',
          message: t('adminSystem.simpleMonitor.tests.auth.failure', { error: error.message }),
          duration
        });
        return false;
      }
      
      updateTest('auth', {
        status: 'pass',
        message: t('adminSystem.simpleMonitor.tests.auth.success', { duration }),
        duration
      });
      return true;
    } catch (error: any) {
      updateTest('auth', {
        status: 'fail',
        message: t('adminSystem.simpleMonitor.tests.auth.networkError', { error: error.message }),
        duration: Date.now() - startTime
      });
      return false;
    }
  };

  const testEmailConfig = async () => {
    updateTest('email-config', { status: 'running', message: t('adminSystem.simpleMonitor.tests.emailConfig.testing') });
    const startTime = Date.now();
    
    try {
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: { validate: true }
      });
      const duration = Date.now() - startTime;
      
      if (error) {
        updateTest('email-config', {
          status: 'fail',
          message: t('adminSystem.simpleMonitor.tests.emailConfig.failure', { error: error.message }),
          duration
        });
        return false;
      }
      
      updateTest('email-config', {
        status: 'pass',
        message: t('adminSystem.simpleMonitor.tests.emailConfig.success', { duration }),
        duration
      });
      return true;
    } catch (error: any) {
      updateTest('email-config', {
        status: 'fail',
        message: t('adminSystem.simpleMonitor.tests.emailConfig.networkError', { error: error.message }),
        duration: Date.now() - startTime
      });
      return false;
    }
  };

  const testEmailSend = async () => {
    updateTest('email-send', { status: 'running', message: t('adminSystem.simpleMonitor.tests.emailSend.testing') });
    const startTime = Date.now();
    
    try {
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: {
          emailType: 'welcome',
          userEmail: 'test@example.com',
          userName: 'Test User',
          planName: 'Test Plan'
        }
      });
      const duration = Date.now() - startTime;
      
      if (error) {
        updateTest('email-send', {
          status: 'fail',
          message: t('adminSystem.simpleMonitor.tests.emailSend.failure', { error: error.message }),
          duration
        });
        return false;
      }
      
      updateTest('email-send', {
        status: 'pass',
        message: t('adminSystem.simpleMonitor.tests.emailSend.success', { duration }),
        duration
      });
      return true;
    } catch (error: any) {
      updateTest('email-send', {
        status: 'fail',
        message: t('adminSystem.simpleMonitor.tests.emailSend.networkError', { error: error.message }),
        duration: Date.now() - startTime
      });
      return false;
    }
  };

  const runSingleTest = async (testId: string) => {
    switch (testId) {
      case 'database':
        await testDatabase();
        break;
      case 'auth':
        await testAuth();
        break;
      case 'email-config':
        await testEmailConfig();
        break;
      case 'email-send':
        await testEmailSend();
        break;
    }
  };

  const runAllTests = async () => {
    setIsRunningAll(true);
    
    try {
      await Promise.all([
        testDatabase(),
        testAuth(),
        testEmailConfig(),
        testEmailSend()
      ]);
    } catch (error) {
      console.error('❌ System tests failed:', error);
    } finally {
      setIsRunningAll(false);
    }
  };

  const sendDailyReport = async () => {
    try {
      const { error } = await supabase.functions.invoke('send-daily-system-report', {
        body: { tests: tests.map(t => ({ id: t.id, status: t.status, message: t.message })) }
      });
      
      if (error) {
        console.error('❌ Failed to send daily report:', error);
      } else {
        console.log('✅ Daily report sent successfully');
      }
    } catch (error) {
      console.error('❌ Daily report error:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'running': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pass: "default" as const,
      warning: "secondary" as const,
      fail: "destructive" as const,
      running: "outline" as const,
      idle: "outline" as const
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const summary = {
    passed: tests.filter(t => t.status === 'pass').length,
    failed: tests.filter(t => t.status === 'fail').length,
    warnings: tests.filter(t => t.status === 'warning').length,
    total: tests.length
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          {t('adminSystem.simpleMonitor.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4">
          <Button 
            onClick={runAllTests} 
            disabled={isRunningAll}
            className="flex items-center gap-2"
          >
            {isRunningAll ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('adminSystem.simpleMonitor.runningTests')}
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                {t('adminSystem.simpleMonitor.runAllTests')}
              </>
            )}
          </Button>
          
          <Button 
            onClick={sendDailyReport} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            {t('adminSystem.simpleMonitor.sendReport')}
          </Button>
        </div>

        {summary.total > 0 && (
          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.passed}</div>
              <div className="text-sm text-gray-600">{t('adminSystem.simpleMonitor.summary.passed')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{summary.warnings}</div>
              <div className="text-sm text-gray-600">{t('adminSystem.simpleMonitor.summary.warnings')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
              <div className="text-sm text-gray-600">{t('adminSystem.simpleMonitor.summary.failed')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{summary.total}</div>
              <div className="text-sm text-gray-600">{t('adminSystem.simpleMonitor.summary.total')}</div>
            </div>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">{t('adminSystem.simpleMonitor.tableHeaders.status')}</TableHead>
              <TableHead>{t('adminSystem.simpleMonitor.tableHeaders.test')}</TableHead>
              <TableHead>{t('adminSystem.simpleMonitor.tableHeaders.description')}</TableHead>
              <TableHead>{t('adminSystem.simpleMonitor.tableHeaders.result')}</TableHead>
              <TableHead>{t('adminSystem.simpleMonitor.tableHeaders.duration')}</TableHead>
              <TableHead>{t('adminSystem.simpleMonitor.tableHeaders.lastRun')}</TableHead>
              <TableHead className="w-20">{t('adminSystem.simpleMonitor.tableHeaders.action')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tests.map((test) => (
              <TableRow key={test.id}>
                <TableCell>{getStatusIcon(test.status)}</TableCell>
                <TableCell className="font-medium">{test.name}</TableCell>
                <TableCell className="text-sm text-gray-600">{test.description}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {getStatusBadge(test.status)}
                    <div className="text-xs text-gray-600">{test.message}</div>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-gray-500">
                  {test.duration ? `${test.duration}ms` : '-'}
                </TableCell>
                <TableCell className="text-xs text-gray-500">
                  {test.lastRun ? test.lastRun.toLocaleTimeString() : t('adminSystem.simpleMonitor.timeLabels.never')}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => runSingleTest(test.id)}
                    disabled={test.status === 'running' || isRunningAll}
                    className="text-xs"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    {t('adminSystem.simpleMonitor.actions.run')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
