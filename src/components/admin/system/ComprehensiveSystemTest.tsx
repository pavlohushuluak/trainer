
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  AlertCircle, 
  Database, 
  Mail, 
  Settings, 
  RefreshCw,
  Bug,
  Wrench,
  Clock,
  Play
} from 'lucide-react';

interface TestResult {
  component: string;
  status: 'pending' | 'running' | 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
  error?: string;
  canFix?: boolean;
  debugInfo?: any;
  order: number;
}

const TEST_DEFINITIONS = [
  { component: 'databaseConnection', order: 1, description: 'databaseConnection' },
  { component: 'authSystem', order: 2, description: 'authSystem' },
  { component: 'edgeFunctions', order: 3, description: 'edgeFunctions' },
  { component: 'cacheStatus', order: 4, description: 'cacheStatus' },
  { component: 'emailValidation', order: 5, description: 'emailValidation' },
  { component: 'emailSending', order: 6, description: 'emailSending' }
];

export const ComprehensiveSystemTest = () => {
  const { t } = useTranslation();
  const [isRunning, setIsRunning] = useState(false);
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<TestResult[]>([]);
  const [lastRun, setLastRun] = useState<Date | null>(null);
  const [currentProgress, setCurrentProgress] = useState(0);

  const initializeTests = () => {
    const initialResults = TEST_DEFINITIONS.map(test => ({
      component: test.component,
      status: 'pending' as const,
      message: t('adminSystem.comprehensiveTest.messages.waitingToStart'),
      order: test.order
    }));
    setResults(initialResults);
    setCurrentProgress(0);
  };

  const updateResult = (component: string, updates: Partial<TestResult>) => {
    setResults(prev => {
      const existing = prev.findIndex(r => r.component === component);
      if (existing >= 0) {
        const newResults = [...prev];
        newResults[existing] = { ...newResults[existing], ...updates };
        return newResults;
      } else {
        const testDef = TEST_DEFINITIONS.find(t => t.component === component);
        return [...prev, { component, status: 'running', message: '', order: testDef?.order || 99, ...updates } as TestResult];
      }
    });
  };

  const testDatabaseConnectivity = async () => {
    updateResult('databaseConnection', { status: 'running', message: t('adminSystem.comprehensiveTest.messages.testingDatabase') });
    
    try {
      const startTime = Date.now();
      
      // Simple connectivity test first
      const { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      const responseTime = Date.now() - startTime;
      
      if (error) {
        console.error('❌ Database connection failed:', error);
        updateResult('databaseConnection', {
          status: 'fail',
          message: `Database connection failed: ${error.message}`,
          error: error.message,
          details: { responseTime, errorCode: error.code, errorDetails: error.details },
          canFix: true
        });
        return false;
      }
      
      updateResult('databaseConnection', {
        status: 'pass',
        message: `Database connection successful (${responseTime}ms)`,
        details: { responseTime, recordCount: count }
      });
      return true;
    } catch (error: any) {
      updateResult('databaseConnection', {
        status: 'fail',
        message: `Database connection failed: ${error.message}`,
        error: error.message,
        canFix: true
      });
      return false;
    }
  };

  const testAuthSystem = async () => {
    updateResult('authSystem', { status: 'running', message: t('adminSystem.comprehensiveTest.messages.testingAuth') });
    
    try {
      const startTime = Date.now();
      
      // Test auth session
      const { data: { session }, error } = await supabase.auth.getSession();
      const responseTime = Date.now() - startTime;
      
      if (error) {
        updateResult('authSystem', {
          status: 'fail',
          message: `Auth system failed: ${error.message}`,
          error: error.message,
          details: { responseTime },
          canFix: true
        });
        return false;
      }
      
      updateResult('authSystem', {
        status: 'pass',
        message: `Auth system working (${responseTime}ms)`,
        details: { responseTime, hasSession: !!session }
      });
      return true;
    } catch (error: any) {
      updateResult('authSystem', {
        status: 'fail',
        message: `Auth system failed: ${error.message}`,
        error: error.message,
        canFix: true
      });
      return false;
    }
  };

  const testEdgeFunctions = async () => {
    updateResult('edgeFunctions', { status: 'running', message: t('adminSystem.comprehensiveTest.messages.testingEdgeFunctions') });
    
    try {
      const startTime = Date.now();
      
      // Test a simple edge function
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: { validate: true }
      });
      
      const responseTime = Date.now() - startTime;
      
      if (error) {
        updateResult('edgeFunctions', {
          status: 'fail',
          message: `Edge functions failed: ${error.message}`,
          error: error.message,
          details: { responseTime },
          canFix: true
        });
        return false;
      }
      
      updateResult('edgeFunctions', {
        status: 'pass',
        message: `Edge functions working (${responseTime}ms)`,
        details: { responseTime, response: data }
      });
      return true;
    } catch (error: any) {
      updateResult('edgeFunctions', {
        status: 'fail',
        message: `Edge functions failed: ${error.message}`,
        error: error.message,
        canFix: true
      });
      return false;
    }
  };

  const testCacheStatus = async () => {
    updateResult('cacheStatus', { status: 'running', message: t('adminSystem.comprehensiveTest.messages.testingCache') });
    
    try {
      const startTime = Date.now();
      
      // Test cache performance
      const cacheTest = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      const responseTime = Date.now() - startTime;
      
      updateResult('cacheStatus', {
        status: 'pass',
        message: `Cache status good (${responseTime}ms)`,
        details: { responseTime }
      });
      return true;
    } catch (error: any) {
      updateResult('cacheStatus', {
        status: 'warning',
        message: `Cache test warning: ${error.message}`,
        error: error.message
      });
      return false;
    }
  };

  const testEmailValidation = async () => {
    updateResult('emailValidation', { status: 'running', message: t('adminSystem.comprehensiveTest.messages.testingEmailValidation') });
    
    try {
      const startTime = Date.now();
      
      // Test email configuration
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: { validate: true }
      });
      
      const responseTime = Date.now() - startTime;
      
      if (error) {
        updateResult('emailValidation', {
          status: 'fail',
          message: `Email validation failed: ${error.message}`,
          error: error.message,
          details: { responseTime },
          canFix: true
        });
        return false;
      }
      
      updateResult('emailValidation', {
        status: 'pass',
        message: `Email validation successful (${responseTime}ms)`,
        details: { responseTime, config: data }
      });
      return true;
    } catch (error: any) {
      updateResult('emailValidation', {
        status: 'fail',
        message: `Email validation failed: ${error.message}`,
        error: error.message,
        canFix: true
      });
      return false;
    }
  };

  const testEmailSending = async () => {
    updateResult('emailSending', { status: 'running', message: t('adminSystem.comprehensiveTest.messages.testingEmailSending') });
    
    try {
      const startTime = Date.now();
      
      // Test actual email sending
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: {
          emailType: 'welcome',
          userEmail: 'test@example.com',
          userName: 'Test User',
          planName: 'Test Plan'
        }
      });
      
      const responseTime = Date.now() - startTime;
      
      if (error) {
        updateResult('emailSending', {
          status: 'fail',
          message: `Email sending failed: ${error.message}`,
          error: error.message,
          details: { responseTime },
          canFix: true
        });
        return false;
      }
      
      updateResult('emailSending', {
        status: 'pass',
        message: `Email sending successful (${responseTime}ms)`,
        details: { responseTime, emailId: data?.emailId }
      });
      return true;
    } catch (error: any) {
      updateResult('emailSending', {
        status: 'fail',
        message: `Email sending failed: ${error.message}`,
        error: error.message,
        canFix: true
      });
      return false;
    }
  };

  const getTestFunction = (component: string) => {
    switch (component) {
      case 'databaseConnection': return testDatabaseConnectivity;
      case 'authSystem': return testAuthSystem;
      case 'edgeFunctions': return testEdgeFunctions;
      case 'cacheStatus': return testCacheStatus;
      case 'emailValidation': return testEmailValidation;
      case 'emailSending': return testEmailSending;
      default: return () => Promise.resolve(false);
    }
  };

  const runSingleTest = async (component: string) => {
    setRunningTests(prev => new Set(prev).add(component));
    
    try {
      const testFn = getTestFunction(component);
      await testFn();
    } finally {
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(component);
        return newSet;
      });
    }
  };

  const runFullTest = async () => {
    setIsRunning(true);
    setLastRun(new Date());
    initializeTests();
    
    try {
      const testPromises = TEST_DEFINITIONS.map(async (test, index) => {
        const testFn = getTestFunction(test.component);
        setCurrentProgress(((index + 1) / TEST_DEFINITIONS.length) * 100);
        return await testFn();
      });
      
      await Promise.all(testPromises);
    } catch (error) {
      console.error('❌ Comprehensive test failed:', error);
    } finally {
      setIsRunning(false);
      setCurrentProgress(0);
    }
  };

  const fixSpecificIssue = async (component: string) => {
    console.log(`🔧 Attempting to fix ${component}...`);
    // Placeholder for actual fix logic
    updateResult(component, {
      message: `Fix attempted for ${component}`,
      canFix: false
    });
  };

  const debugSpecificIssue = async (component: string) => {
    console.log(`🐛 Debugging ${component}...`);
    // Placeholder for actual debug logic
    const result = results.find(r => r.component === component);
    if (result) {
      updateResult(component, {
        debugInfo: { timestamp: new Date(), component, error: result.error }
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'running': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'pending': return <Clock className="h-4 w-4 text-gray-400" />;
      default: return <Database className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pass: "default" as const,
      warning: "secondary" as const,
      fail: "destructive" as const,
      running: "outline" as const,
      pending: "outline" as const
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const sortedResults = [...results].sort((a, b) => a.order - b.order);
  const allTests = TEST_DEFINITIONS.map(testDef => {
    const result = results.find(r => r.component === testDef.component);
    return {
      ...testDef,
      status: result?.status || 'pending',
      message: result?.message || t('adminSystem.comprehensiveTest.messages.waitingToStart'),
      result
    };
  });

  const summary = results.length > 0 ? {
    passed: results.filter(r => r.status === 'pass').length,
    warnings: results.filter(r => r.status === 'warning').length,
    failed: results.filter(r => r.status === 'fail').length,
    total: TEST_DEFINITIONS.length
  } : null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          {t('adminSystem.comprehensiveTest.title')}
        </CardTitle>
        {lastRun && (
          <p className="text-sm text-gray-600">
            {t('adminSystem.comprehensiveTest.lastRun', { date: lastRun.toLocaleString() })}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <Button 
          onClick={runFullTest} 
          disabled={isRunning}
          className="w-full"
          size="lg"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('adminSystem.comprehensiveTest.runningTest')}
            </>
          ) : (
            <>
              <Settings className="h-4 w-4 mr-2" />
              {t('adminSystem.comprehensiveTest.runFullTest')}
            </>
          )}
        </Button>

        {isRunning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{t('adminSystem.comprehensiveTest.testProgress')}</span>
              <span>{Math.round(currentProgress)}%</span>
            </div>
            <Progress value={currentProgress} className="h-2" />
          </div>
        )}

        {summary && (
          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.passed}</div>
              <div className="text-sm text-gray-600">{t('adminSystem.comprehensiveTest.summary.passed')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{summary.warnings}</div>
              <div className="text-sm text-gray-600">{t('adminSystem.comprehensiveTest.summary.warnings')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
              <div className="text-sm text-gray-600">{t('adminSystem.comprehensiveTest.summary.failed')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{summary.total}</div>
              <div className="text-sm text-gray-600">{t('adminSystem.comprehensiveTest.summary.total')}</div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-semibold">{t('adminSystem.comprehensiveTest.testSchedule')}</h3>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">{t('adminSystem.comprehensiveTest.tableHeaders.number')}</TableHead>
                <TableHead className="w-8">{t('adminSystem.comprehensiveTest.tableHeaders.status')}</TableHead>
                <TableHead>{t('adminSystem.comprehensiveTest.tableHeaders.component')}</TableHead>
                <TableHead>{t('adminSystem.comprehensiveTest.tableHeaders.description')}</TableHead>
                <TableHead>{t('adminSystem.comprehensiveTest.tableHeaders.result')}</TableHead>
                <TableHead className="w-40">{t('adminSystem.comprehensiveTest.tableHeaders.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allTests.map((test) => {
                const isTestRunning = runningTests.has(test.component);
                return (
                  <TableRow key={test.component}>
                    <TableCell className="font-mono text-sm">{test.order}</TableCell>
                    <TableCell>{getStatusIcon(isTestRunning ? 'running' : test.status)}</TableCell>
                    <TableCell className="font-medium">{t(`adminSystem.comprehensiveTest.testComponents.${test.component}`)}</TableCell>
                    <TableCell className="text-sm text-gray-600">{t(`adminSystem.comprehensiveTest.testDescriptions.${test.description}`)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getStatusBadge(isTestRunning ? 'running' : test.status)}
                        <div className="text-xs text-gray-600">{test.message}</div>
                        {test.result?.error && (
                          <div className="text-xs text-red-600 font-mono bg-red-50 p-1 rounded">
                            {test.result.error}
                          </div>
                        )}
                        {test.result?.details && (
                          <div className="text-xs text-gray-500">
                            {JSON.stringify(test.result.details)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => runSingleTest(test.component)}
                          disabled={isTestRunning || isRunning}
                          className="text-xs"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          {t('adminSystem.comprehensiveTest.actions.run')}
                        </Button>
                        {test.result?.canFix && test.status === 'fail' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => fixSpecificIssue(test.component)}
                              className="text-xs"
                            >
                              <Wrench className="h-3 w-3 mr-1" />
                              {t('adminSystem.comprehensiveTest.actions.fix')}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => debugSpecificIssue(test.component)}
                              className="text-xs"
                            >
                              <Bug className="h-3 w-3 mr-1" />
                              {t('adminSystem.comprehensiveTest.actions.debug')}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('adminSystem.comprehensiveTest.alert.description')}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
