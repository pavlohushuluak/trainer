
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Summary - Mobile Responsive */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
            {t('adminSystem.comprehensiveMonitor.title')}
            {overallStatus === 'critical' && <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {/* Control Buttons - Mobile Responsive */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-2">
            <Button 
              onClick={runAllTests} 
              disabled={isRunningAll}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              {isRunningAll ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-xs sm:text-sm">{t('adminSystem.comprehensiveMonitor.runningTests')}</span>
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">{t('adminSystem.comprehensiveMonitor.runAllTests', { count: summary.total })}</span>
                </>
              )}
            </Button>
            
            <Button 
              onClick={runCriticalTests} 
              disabled={isRunningAll}
              variant="outline"
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs sm:text-sm">{t('adminSystem.comprehensiveMonitor.runCriticalTests', { count: summary.critical })}</span>
            </Button>
            
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="text-xs sm:text-sm">{t('adminSystem.comprehensiveMonitor.reset')}</span>
            </Button>
          </div>

          {/* Progress Bar - Mobile Responsive */}
          {(summary.running > 0 || overallProgress > 0) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span>{t('adminSystem.comprehensiveMonitor.testProgress')}</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="w-full" />
              {summary.running > 0 && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t('adminSystem.comprehensiveMonitor.testsRunning', { 
                    count: summary.running, 
                    plural: summary.running > 1 ? 's' : '' 
                  })}
                </p>
              )}
            </div>
          )}

          {/* Summary Stats - Mobile Responsive Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-4">
            <div className="text-center p-2 sm:p-0">
              <div className="text-lg sm:text-2xl font-bold text-blue-600">{summary.total}</div>
              <div className="text-xs sm:text-sm text-gray-600">{t('adminSystem.comprehensiveMonitor.summary.total')}</div>
            </div>
            <div className="text-center p-2 sm:p-0">
              <div className="text-lg sm:text-2xl font-bold text-green-600">{summary.passed}</div>
              <div className="text-xs sm:text-sm text-gray-600">{t('adminSystem.comprehensiveMonitor.summary.passed')}</div>
            </div>
            <div className="text-center p-2 sm:p-0">
              <div className="text-lg sm:text-2xl font-bold text-red-600">{summary.failed}</div>
              <div className="text-xs sm:text-sm text-gray-600">{t('adminSystem.comprehensiveMonitor.summary.failed')}</div>
            </div>
            <div className="text-center p-2 sm:p-0">
              <div className="text-lg sm:text-2xl font-bold text-yellow-600">{summary.warnings}</div>
              <div className="text-xs sm:text-sm text-gray-600">{t('adminSystem.comprehensiveMonitor.summary.warnings')}</div>
            </div>
            <div className="text-center p-2 sm:p-0">
              <div className="text-lg sm:text-2xl font-bold text-blue-500">{summary.running}</div>
              <div className="text-xs sm:text-sm text-gray-600">{t('adminSystem.comprehensiveMonitor.summary.running')}</div>
            </div>
            <div className="text-center p-2 sm:p-0">
              <div className="text-lg sm:text-2xl font-bold text-orange-600">{summary.critical}</div>
              <div className="text-xs sm:text-sm text-gray-600">{t('adminSystem.comprehensiveMonitor.summary.critical')}</div>
            </div>
            <div className="text-center p-2 sm:p-0">
              <div className={`text-lg sm:text-2xl font-bold ${
                overallStatus === 'healthy' ? 'text-green-600' : 
                overallStatus === 'critical' ? 'text-red-600' : 
                'text-yellow-600'
              }`}>
                {overallStatus === 'healthy' ? '✓' : 
                 overallStatus === 'critical' ? '✗' : '⚠'}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">{t('adminSystem.comprehensiveMonitor.summary.status')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Categories and Results - Mobile Responsive */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 h-auto sm:h-10 overflow-x-auto">
          <TabsTrigger value="all" className="text-xs sm:text-sm py-2 sm:py-1.5">
            {t('adminSystem.comprehensiveMonitor.categories.all')}
          </TabsTrigger>
          <TabsTrigger value="connectivity" className="text-xs sm:text-sm py-2 sm:py-1.5">
            {t('adminSystem.comprehensiveMonitor.categories.connectivity')}
          </TabsTrigger>
          <TabsTrigger value="database" className="text-xs sm:text-sm py-2 sm:py-1.5">
            {t('adminSystem.comprehensiveMonitor.categories.database')}
          </TabsTrigger>
          <TabsTrigger value="auth" className="text-xs sm:text-sm py-2 sm:py-1.5">
            {t('adminSystem.comprehensiveMonitor.categories.auth')}
          </TabsTrigger>
          <TabsTrigger value="email" className="text-xs sm:text-sm py-2 sm:py-1.5">
            {t('adminSystem.comprehensiveMonitor.categories.email')}
          </TabsTrigger>
          <TabsTrigger value="functions" className="text-xs sm:text-sm py-2 sm:py-1.5">
            {t('adminSystem.comprehensiveMonitor.categories.functions')}
          </TabsTrigger>
          <TabsTrigger value="performance" className="text-xs sm:text-sm py-2 sm:py-1.5">
            {t('adminSystem.comprehensiveMonitor.categories.performance')}
          </TabsTrigger>
          <TabsTrigger value="critical" className="text-xs sm:text-sm py-2 sm:py-1.5">
            {t('adminSystem.comprehensiveMonitor.categories.critical')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={selectedCategory} className="mt-3 sm:mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  {selectedCategory !== 'all' && getCategoryIcon(selectedCategory)}
                  <span className="text-sm sm:text-base">
                    {selectedCategory === 'all' ? t('adminSystem.comprehensiveMonitor.categories.all') : 
                     t(`adminSystem.comprehensiveMonitor.categories.${selectedCategory}`)} Tests
                  </span>
                  <Badge variant="outline" className="text-xs sm:text-sm">{filteredResults.length}</Badge>
                </CardTitle>
                
                {selectedCategory !== 'all' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => runCategoryTests(selectedCategory)}
                    disabled={isRunningAll}
                    className="flex items-center gap-1 w-full sm:w-auto text-xs sm:text-sm"
                  >
                    <Play className="h-3 w-3" />
                    {t('adminSystem.comprehensiveMonitor.statusLabels.runCategory')}
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Mobile Responsive Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8 text-xs sm:text-sm">{t('adminSystem.comprehensiveMonitor.tableHeaders.status')}</TableHead>
                      <TableHead className="text-xs sm:text-sm">{t('adminSystem.comprehensiveMonitor.tableHeaders.test')}</TableHead>
                      <TableHead className="hidden sm:table-cell text-xs sm:text-sm">{t('adminSystem.comprehensiveMonitor.tableHeaders.category')}</TableHead>
                      <TableHead className="text-xs sm:text-sm">{t('adminSystem.comprehensiveMonitor.tableHeaders.result')}</TableHead>
                      <TableHead className="hidden lg:table-cell text-xs sm:text-sm">{t('adminSystem.comprehensiveMonitor.tableHeaders.duration')}</TableHead>
                      <TableHead className="hidden md:table-cell text-xs sm:text-sm">{t('adminSystem.comprehensiveMonitor.tableHeaders.critical')}</TableHead>
                      <TableHead className="w-16 sm:w-20 text-xs sm:text-sm">{t('adminSystem.comprehensiveMonitor.tableHeaders.action')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResults.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell className="text-xs sm:text-sm">{getStatusIcon(result.status)}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-xs sm:text-sm">{result.name}</div>
                            <div className="text-xs text-gray-500 hidden sm:block">
                              {testRunner.getTestSuites()
                                .flatMap(suite => suite.tests)
                                .find(test => test.id === result.id)?.description}
                            </div>
                            {/* Mobile: Show category inline */}
                            <div className="flex items-center gap-1 sm:hidden mt-1">
                              {getCategoryIcon(result.category)}
                              <span className="text-xs text-gray-500 capitalize">{result.category}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center gap-1">
                            {getCategoryIcon(result.category)}
                            <span className="capitalize text-xs sm:text-sm">{result.category}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {getStatusBadge(result.status)}
                            <div className="text-xs text-gray-600 line-clamp-2">{result.message}</div>
                            {result.details && (
                              <details className="text-xs text-gray-500">
                                <summary className="cursor-pointer">{t('adminSystem.comprehensiveMonitor.statusLabels.details')}</summary>
                                <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-32">
                                  {JSON.stringify(result.details, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs text-gray-500">
                          {result.duration ? `${result.duration}ms` : '-'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
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
                            className="text-xs w-full sm:w-auto"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">{t('adminSystem.comprehensiveMonitor.statusLabels.run')}</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {filteredResults.length === 0 && (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <Activity className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                  <p className="text-sm sm:text-base">{t('adminSystem.comprehensiveMonitor.emptyState')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
