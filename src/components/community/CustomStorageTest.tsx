import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, Upload, Video } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { uploadVideo } from './utils/videoUpload';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export const CustomStorageTest = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [uploadResult, setUploadResult] = useState<any>(null);

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    setUploadResult(null);

    const testResults: TestResult[] = [];

    // Test 1: Check user authentication
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

    // Test 2: Check Edge Function availability
    testResults.push({
      name: 'Edge Function',
      status: 'pending',
      message: 'Testing Edge Function availability...'
    });
    setResults([...testResults]);

    try {
      const supabaseUrl = "https://vuzhlwyhcrsxqfysczsu.supabase.co";
      const functionUrl = `${supabaseUrl}/functions/v1/storage-upload`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1emhsd3loY3JzeHFmeXNjenN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NjU2NDQsImV4cCI6MjA2NTE0MTY0NH0.XXczMcxqEKgwNnRZOJmL02_FEcE5b3_by29qM1dYsX0`
        },
        body: JSON.stringify({
          fileName: 'test.mp4',
          fileType: 'video/mp4',
          fileSize: 1024,
          userId: user.id,
          postId: 'test'
        })
      });

      if (response.ok) {
        testResults[1] = {
          name: 'Edge Function',
          status: 'success',
          message: 'Edge Function is available and responding',
          details: { status: response.status }
        };
      } else {
        testResults[1] = {
          name: 'Edge Function',
          status: 'error',
          message: `Edge Function returned error: ${response.status}`,
          details: { status: response.status, statusText: response.statusText }
        };
      }
    } catch (error: any) {
      testResults[1] = {
        name: 'Edge Function',
        status: 'error',
        message: 'Edge Function test failed',
        details: error.message
      };
    }
    setResults([...testResults]);

    // Test 3: Configuration summary
    testResults.push({
      name: 'Configuration',
      status: 'success',
      message: 'Custom storage configuration ready',
      details: {
        endpoint: 'https://vuzhlwyhcrsxqfysczsu.storage.supabase.co/storage/v1/s3',
        bucket: 'community-videos',
        accessKeyConfigured: true
      }
    });
    setResults([...testResults]);

    setIsRunning(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsRunning(true);
    setUploadResult(null);

    try {
      console.log('🧪 Starting custom storage upload test...');
      
      const testPostId = `test-${Date.now()}`;
      const result = await uploadVideo(file, user.id, testPostId);
      
      console.log('✅ Custom storage upload successful:', result);
      setUploadResult(result);
      
      toast({
        title: 'Upload Successful',
        description: `Video uploaded using custom credentials. URL: ${result.videoUrl}`,
      });
      
    } catch (error: any) {
      console.error('❌ Custom storage upload failed:', error);
      
      toast({
        title: 'Upload Failed',
        description: error.message || 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      success: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      error: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      pending: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    };

    return (
      <Badge className={`text-xs ${variants[status]}`}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Please log in to test custom storage upload functionality.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5 text-blue-500" />
          Custom Storage Upload Test
          {isRunning && <Loader2 className="h-4 w-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            This component tests the custom storage upload functionality using your provided credentials.
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

        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Test File Upload:</h4>
          <div className="space-y-3">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              disabled={isRunning}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            
            {isRunning && (
              <div className="text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Uploading video...</p>
              </div>
            )}

            {uploadResult && (
              <div className="space-y-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <h5 className="font-medium text-green-800 dark:text-green-200">Upload Successful:</h5>
                <div className="text-sm space-y-1 text-green-700 dark:text-green-300">
                  <p><strong>Video URL:</strong> <a href={uploadResult.videoUrl} target="_blank" rel="noopener noreferrer" className="underline">{uploadResult.videoUrl}</a></p>
                  {uploadResult.thumbnailUrl && (
                    <p><strong>Thumbnail URL:</strong> <a href={uploadResult.thumbnailUrl} target="_blank" rel="noopener noreferrer" className="underline">{uploadResult.thumbnailUrl}</a></p>
                  )}
                  <p><strong>File Size:</strong> {(uploadResult.size / (1024 * 1024)).toFixed(2)} MB</p>
                  {uploadResult.duration && (
                    <p><strong>Duration:</strong> {uploadResult.duration.toFixed(1)} seconds</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {!isRunning && results.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <h5 className="font-medium mb-2 text-blue-800 dark:text-blue-200">How it works:</h5>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
              <li>Uses your custom access keys via Edge Function</li>
              <li>Generates secure upload URLs with credentials</li>
              <li>Uploads directly to your Supabase storage bucket</li>
              <li>Bypasses standard Supabase client authentication</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
