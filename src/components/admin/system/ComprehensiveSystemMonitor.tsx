
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  AlertCircle,
  Play,
  PlayCircle,
  RefreshCw,
  Clock,
  Activity,
  Database,
  Shield,
  Mail,
  Zap,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { SystemTestRunner, SystemTestResult, SystemTestSuite } from '@/utils/systemTests';

export const ComprehensiveSystemMonitor = () => {
  const { t } = useTranslation();
  const [testRunner] = useState(new SystemTestRunner());
  const [results, setResults] = useState<SystemTestResult[]>([]);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [testSuites, setTestSuites] = useState<SystemTestSuite[]>([]);

  useEffect(() => {
    setTestSuites(testRunner.getTestSuites());
    setResults(testRunner.getResults());
    
    const unsubscribe = testRunner.subscribe(setResults);
    return unsubscribe;
  }, [testRunner]);

  const runAllTests = useCallback(async () => {
    setIsRunningAll(true);
    
    try {
      await testRunner.runAllTests();
    } catch (error) {
      console.error('❌ System tests failed:', error);
    } finally {
      setIsRunningAll(false);
    }
  }, [testRunner]);

  const runCriticalTests = useCallback(async () => {
    setIsRunningAll(true);
    
    try {
      const criticalResults = await Promise.all(
        testRunner.getTestSuites()
          .find(suite => suite.id === 'critical')
          ?.tests.map(test => testRunner.runTest(test.id)) || []
      );
    } catch (error) {
      console.error('❌ Critical tests failed:', error);
    } finally {
      setIsRunningAll(false);
    }
  }, [testRunner]);

  const runCategoryTests = useCallback(async (category: string) => {
    
    try {
      const suite = testSuites.find(s => s.id === category);
      if (suite) {
        await Promise.all(
          suite.tests.map(test => testRunner.runTest(test.id))
        );
      }
    } catch (error) {
      console.error(`❌ ${category} tests failed:`, error);
    }
  }, [testRunner, testSuites]);

  const runSingleTest = useCallback(async (testId: string) => {
    try {
      await testRunner.runTest(testId);
    } catch (error) {
      console.error(`❌ Test ${testId} failed:`, error);
    }
  }, [testRunner]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'running': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'connectivity': return <Activity className="h-4 w-4" />;
      case 'database': return <Database className="h-4 w-4" />;
      case 'auth': return <Shield className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'functions': return <Zap className="h-4 w-4" />;
      case 'performance': return <TrendingUp className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const summary = testRunner.getSummary();
  const filteredResults = selectedCategory === 'all' 
    ? results 
    : results.filter(r => r.category === selectedCategory);

  const overallProgress = summary.total > 0 
    ? ((summary.passed + summary.failed + summary.warnings) / summary.total) * 100 
    : 0;

  const overallStatus = summary.criticalFailed > 0 ? 'critical' : 
                       summary.failed > 0 ? 'issues' : 
                       summary.warnings > 0 ? 'warnings' : 
                       summary.passed === summary.total ? 'healthy' : 'unknown';

  return (
    <div className="space-y-6">
      {/* Header with Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {t('adminSystem.comprehensiveMonitor.title')}
            {overallStatus === 'critical' && <AlertTriangle className="h-5 w-5 text-red-500" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Control Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={runAllTests} 
              disabled={isRunningAll}
              className="flex items-center gap-2"
            >
              {isRunningAll ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('adminSystem.comprehensiveMonitor.runningTests')}
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4" />
                  {t('adminSystem.comprehensiveMonitor.runAllTests', { count: summary.total })}
                </>
              )}
            </Button>
            
            <Button 
              onClick={runCriticalTests} 
              disabled={isRunningAll}
              variant="outline"
              className="flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              {t('adminSystem.comprehensiveMonitor.runCriticalTests', { count: summary.critical })}
            </Button>
            
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {t('adminSystem.comprehensiveMonitor.reset')}
            </Button>
          </div>

          {/* Progress Bar */}
          {(summary.running > 0 || overallProgress > 0) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{t('adminSystem.comprehensiveMonitor.testProgress')}</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="w-full" />
              {summary.running > 0 && (
                <p className="text-sm text-muted-foreground">
                  {t('adminSystem.comprehensiveMonitor.testsRunning', { 
                    count: summary.running, 
                    plural: summary.running > 1 ? 's' : '' 
                  })}
                </p>
              )}
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{summary.total}</div>
              <div className="text-sm text-gray-600">{t('adminSystem.comprehensiveMonitor.summary.total')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.passed}</div>
              <div className="text-sm text-gray-600">{t('adminSystem.comprehensiveMonitor.summary.passed')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
              <div className="text-sm text-gray-600">{t('adminSystem.comprehensiveMonitor.summary.failed')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{summary.warnings}</div>
              <div className="text-sm text-gray-600">{t('adminSystem.comprehensiveMonitor.summary.warnings')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{summary.running}</div>
              <div className="text-sm text-gray-600">{t('adminSystem.comprehensiveMonitor.summary.running')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{summary.critical}</div>
              <div className="text-sm text-gray-600">{t('adminSystem.comprehensiveMonitor.summary.critical')}</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                overallStatus === 'healthy' ? 'text-green-600' : 
                overallStatus === 'critical' ? 'text-red-600' : 
                'text-yellow-600'
              }`}>
                {overallStatus === 'healthy' ? '✓' : 
                 overallStatus === 'critical' ? '✗' : '⚠'}
              </div>
              <div className="text-sm text-gray-600">{t('adminSystem.comprehensiveMonitor.summary.status')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Categories and Results */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="all">{t('adminSystem.comprehensiveMonitor.categories.all')}</TabsTrigger>
          <TabsTrigger value="connectivity">{t('adminSystem.comprehensiveMonitor.categories.connectivity')}</TabsTrigger>
          <TabsTrigger value="database">{t('adminSystem.comprehensiveMonitor.categories.database')}</TabsTrigger>
          <TabsTrigger value="auth">{t('adminSystem.comprehensiveMonitor.categories.auth')}</TabsTrigger>
          <TabsTrigger value="email">{t('adminSystem.comprehensiveMonitor.categories.email')}</TabsTrigger>
          <TabsTrigger value="functions">{t('adminSystem.comprehensiveMonitor.categories.functions')}</TabsTrigger>
          <TabsTrigger value="performance">{t('adminSystem.comprehensiveMonitor.categories.performance')}</TabsTrigger>
          <TabsTrigger value="critical">{t('adminSystem.comprehensiveMonitor.categories.critical')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value={selectedCategory} className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {selectedCategory !== 'all' && getCategoryIcon(selectedCategory)}
                  {selectedCategory === 'all' ? t('adminSystem.comprehensiveMonitor.categories.all') : 
                   t(`adminSystem.comprehensiveMonitor.categories.${selectedCategory}`)} Tests
                  <Badge variant="outline">{filteredResults.length}</Badge>
                </CardTitle>
                
                {selectedCategory !== 'all' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => runCategoryTests(selectedCategory)}
                    disabled={isRunningAll}
                    className="flex items-center gap-1"
                  >
                    <Play className="h-3 w-3" />
                    {t('adminSystem.comprehensiveMonitor.statusLabels.runCategory')}
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">{t('adminSystem.comprehensiveMonitor.tableHeaders.status')}</TableHead>
                    <TableHead>{t('adminSystem.comprehensiveMonitor.tableHeaders.test')}</TableHead>
                    <TableHead>{t('adminSystem.comprehensiveMonitor.tableHeaders.category')}</TableHead>
                    <TableHead>{t('adminSystem.comprehensiveMonitor.tableHeaders.result')}</TableHead>
                    <TableHead>{t('adminSystem.comprehensiveMonitor.tableHeaders.duration')}</TableHead>
                    <TableHead>{t('adminSystem.comprehensiveMonitor.tableHeaders.critical')}</TableHead>
                    <TableHead className="w-20">{t('adminSystem.comprehensiveMonitor.tableHeaders.action')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell>{getStatusIcon(result.status)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{result.name}</div>
                          <div className="text-xs text-gray-500">
                            {testRunner.getTestSuites()
                              .flatMap(suite => suite.tests)
                              .find(test => test.id === result.id)?.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getCategoryIcon(result.category)}
                          <span className="capitalize">{result.category}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getStatusBadge(result.status)}
                          <div className="text-xs text-gray-600">{result.message}</div>
                          {result.details && (
                            <details className="text-xs text-gray-500">
                              <summary className="cursor-pointer">{t('adminSystem.comprehensiveMonitor.statusLabels.details')}</summary>
                              <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-auto">
                                {JSON.stringify(result.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">
                        {result.duration ? `${result.duration}ms` : '-'}
                      </TableCell>
                      <TableCell>
                        {result.critical ? (
                          <Badge variant="destructive" className="text-xs">{t('adminSystem.comprehensiveMonitor.statusLabels.critical')}</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">{t('adminSystem.comprehensiveMonitor.statusLabels.normal')}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => runSingleTest(result.id)}
                          disabled={result.status === 'running' || isRunningAll}
                          className="text-xs"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          {t('adminSystem.comprehensiveMonitor.statusLabels.run')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredResults.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('adminSystem.comprehensiveMonitor.emptyState')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
