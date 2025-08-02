import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SystemCheck, SystemCheckResult } from '@/utils/systemCheck';
import { Activity, CheckCircle, AlertCircle, XCircle, RefreshCw, Bug, Shield } from 'lucide-react';

export const SystemHealthCheck = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<SystemCheckResult[]>([]);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [failureCount, setFailureCount] = useState(0);

  const runSystemCheck = async () => {
    // Circuit breaker: prevent repeated attempts if we've failed too many times
    if (failureCount >= 3) {
      setError('System check disabled after multiple failures. Please refresh the page to try again.');
      return;
    }

    setIsRunning(true);
    setError(null);
    setResults([]);
    
    // Set a timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      setIsRunning(false);
      setError('System check timed out after 10 seconds');
      setFailureCount(prev => prev + 1);
    }, 10000);
    
    try {
      const checkResults = await SystemCheck.runFullSystemCheck();
      clearTimeout(timeoutId);
      
      setResults(checkResults);
      setLastCheck(new Date());
      setFailureCount(0); // Reset failure count on success
      SystemCheck.logResults(checkResults);
      
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      setFailureCount(prev => prev + 1);
      
      let errorMessage = 'System check failed';
      
      if (error?.message?.includes('403') || error?.status === 403) {
        errorMessage = 'Access denied (403). You need admin permissions to run system checks.';
      } else if (error?.message?.includes('401') || error?.status === 401) {
        errorMessage = 'Authentication required (401). Please refresh the page and log in again.';
      } else if (error?.message?.includes('Network') || error?.name === 'NetworkError') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error instanceof Error) {
        errorMessage = `System check failed: ${error.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setIsRunning(false);
    }
  };

  const runDebugTest = async () => {
    setError(null);
    
    const testResult = {
      component: 'Debug Test',
      status: 'pass' as const,
      message: 'Debug test completed successfully',
      details: {
        timestamp: new Date().toISOString(),
        online: navigator.onLine,
        userAgent: navigator.userAgent.substring(0, 50) + '...',
        currentPath: window.location.pathname,
        permissions: 'Basic client-side checks only'
      }
    };
    
    setResults([testResult]);
    setLastCheck(new Date());
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pass: "default" as const,
      warning: "secondary" as const,
      fail: "destructive" as const
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const summary = results.length > 0 ? {
    passed: results.filter(r => r.status === 'pass').length,
    warnings: results.filter(r => r.status === 'warning').length,
    failed: results.filter(r => r.status === 'fail').length
  } : null;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          System Health Check
          {failureCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {failureCount} failures
            </Badge>
          )}
        </CardTitle>
        {lastCheck && (
          <p className="text-sm text-gray-600">
            Last check: {lastCheck.toLocaleString()}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runSystemCheck} 
            disabled={isRunning || failureCount >= 3}
            className="flex-1"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Running System Check...
              </>
            ) : failureCount >= 3 ? (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                System Check Disabled
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Run System Check
              </>
            )}
          </Button>
          
          <Button 
            onClick={runDebugTest} 
            disabled={isRunning}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Bug className="h-4 w-4" />
            Debug Test
          </Button>
        </div>

        {failureCount >= 3 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              System check has been disabled after multiple failures. Please refresh the page to reset and try again.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {summary && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.passed}</div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{summary.warnings}</div>
              <div className="text-sm text-gray-600">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
          </div>
        )}

        {results.length === 0 && !isRunning && !error && (
          <div className="text-center py-8 text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No system check results yet. Click "Run System Check" to begin.</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">System Components ({results.length} checked)</h3>
            {results.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="font-medium">{result.component}</div>
                    <div className="text-sm text-gray-600">{result.message}</div>
                    {result.details && (
                      <div className="text-xs text-gray-500 mt-1">
                        Details: {typeof result.details === 'string' 
                          ? result.details 
                          : JSON.stringify(result.details)}
                      </div>
                    )}
                  </div>
                </div>
                {getStatusBadge(result.status)}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
