import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { storageUtils, STORAGE_CONFIG } from '@/integrations/supabase/storage';
import { useAuth } from '@/hooks/useAuth';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export const StorageConfigTest = () => {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);

    const testResults: TestResult[] = [];

    // Test 1: Check if user is authenticated
    testResults.push({
      name: 'User Authentication',
      status: 'pending',
      message: 'Checking user authentication...'
    });
    setResults([...testResults]);

    if (!user) {
      testResults[0] = {
        name: 'User Authentication',
        status: 'error',
        message: 'User is not authenticated. Please log in first.'
      };
      setResults([...testResults]);
      setIsRunning(false);
      return;
    }

    testResults[0] = {
      name: 'User Authentication',
      status: 'success',
      message: `Authenticated as ${user.email}`,
      details: { userId: user.id }
    };
    setResults([...testResults]);

    // Test 2: Check storage access
    testResults.push({
      name: 'Storage Access',
      status: 'pending',
      message: 'Checking storage access...'
    });
    setResults([...testResults]);

    try {
      const accessCheck = await storageUtils.checkStorageAccess();
      if (accessCheck.accessible) {
        testResults[1] = {
          name: 'Storage Access',
          status: 'success',
          message: 'Storage is accessible',
          details: accessCheck
        };
      } else {
        testResults[1] = {
          name: 'Storage Access',
          status: 'error',
          message: 'Storage is not accessible',
          details: accessCheck.error
        };
      }
    } catch (error: any) {
      testResults[1] = {
        name: 'Storage Access',
        status: 'error',
        message: 'Failed to check storage access',
        details: error.message
      };
    }
    setResults([...testResults]);

    // Test 3: Check bucket info
    testResults.push({
      name: 'Bucket Configuration',
      status: 'pending',
      message: 'Checking bucket configuration...'
    });
    setResults([...testResults]);

    try {
      const bucketInfo = await storageUtils.getBucketInfo();
      if (bucketInfo.bucket) {
        testResults[2] = {
          name: 'Bucket Configuration',
          status: 'success',
          message: `Bucket "${STORAGE_CONFIG.BUCKET_NAME}" is configured`,
          details: {
            name: bucketInfo.bucket.name,
            public: bucketInfo.bucket.public,
            fileSizeLimit: bucketInfo.bucket.file_size_limit
          }
        };
      } else {
        testResults[2] = {
          name: 'Bucket Configuration',
          status: 'error',
          message: `Bucket "${STORAGE_CONFIG.BUCKET_NAME}" not found`,
          details: bucketInfo.error
        };
      }
    } catch (error: any) {
      testResults[2] = {
        name: 'Bucket Configuration',
        status: 'error',
        message: 'Failed to get bucket info',
        details: error.message
      };
    }
    setResults([...testResults]);

    // Test 4: Check upload permissions
    testResults.push({
      name: 'Upload Permissions',
      status: 'pending',
      message: 'Checking upload permissions...'
    });
    setResults([...testResults]);

    try {
      const permissionCheck = await storageUtils.testUploadPermissions(user.id);
      if (permissionCheck.hasPermission) {
        testResults[3] = {
          name: 'Upload Permissions',
          status: 'success',
          message: 'Upload permissions verified'
        };
      } else {
        testResults[3] = {
          name: 'Upload Permissions',
          status: 'warning',
          message: 'Upload permission test failed (this might be normal)',
          details: permissionCheck.error
        };
      }
    } catch (error: any) {
      testResults[3] = {
        name: 'Upload Permissions',
        status: 'warning',
        message: 'Upload permission test failed (this might be normal)',
        details: error.message
      };
    }
    setResults([...testResults]);

    // Test 5: Configuration summary
    testResults.push({
      name: 'Configuration Summary',
      status: 'success',
      message: 'Storage configuration check completed',
      details: {
        bucketName: STORAGE_CONFIG.BUCKET_NAME,
        maxFileSize: `${STORAGE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`,
        compressionThreshold: `${STORAGE_CONFIG.COMPRESSION_THRESHOLD / (1024 * 1024)}MB`,
        allowedTypes: STORAGE_CONFIG.ALLOWED_VIDEO_TYPES
      }
    });
    setResults([...testResults]);

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      success: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      error: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      pending: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    };

    return (
      <Badge className={`text-xs ${variants[status]}`}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Storage Configuration Test
          {isRunning && <Loader2 className="h-4 w-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            This component tests your Supabase storage configuration to ensure video uploads will work correctly.
          </p>
          <Button 
            onClick={runTests} 
            disabled={isRunning}
            variant="outline"
            size="sm"
          >
            {isRunning ? 'Running Tests...' : 'Run Tests'}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Test Results:</h4>
            {results.map((result, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.name}</span>
                  </div>
                  {getStatusBadge(result.status)}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {result.message}
                </p>
                {result.details && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      View Details
                    </summary>
                    <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}

        {!isRunning && results.length > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <h5 className="font-medium mb-2">Next Steps:</h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• If all tests pass, your storage is configured correctly</li>
              <li>• If any tests fail, check the Supabase dashboard and RLS policies</li>
              <li>• Use the VideoUploadTest component to test actual file uploads</li>
              <li>• Check the browser console for detailed error messages</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
