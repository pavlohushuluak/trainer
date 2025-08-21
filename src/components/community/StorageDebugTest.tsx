import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Loader2, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DebugResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: any;
  solution?: string;
}

export const StorageDebugTest = () => {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DebugResult[]>([]);

  const runDebugTests = async () => {
    setIsRunning(true);
    setResults([]);

    const debugResults: DebugResult[] = [];

    // Test 1: Check Supabase client configuration
    debugResults.push({
      name: 'Supabase Client',
      status: 'pending',
      message: 'Checking Supabase client configuration...'
    });
    setResults([...debugResults]);

    try {
      // Test basic Supabase connection
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        debugResults[0] = {
          name: 'Supabase Client',
          status: 'error',
          message: 'Supabase client authentication failed',
          details: authError,
          solution: 'Check your Supabase URL and API key configuration'
        };
      } else {
        debugResults[0] = {
          name: 'Supabase Client',
          status: 'success',
          message: 'Supabase client is properly configured',
          details: { 
            url: supabase.supabaseUrl,
            hasKey: !!supabase.supabaseKey,
            authUser: authUser?.id 
          }
        };
      }
    } catch (error: any) {
      debugResults[0] = {
        name: 'Supabase Client',
        status: 'error',
        message: 'Supabase client test failed',
        details: error.message,
        solution: 'Verify your Supabase configuration in src/integrations/supabase/client.ts'
      };
    }
    setResults([...debugResults]);

    // Test 2: Check storage service availability
    debugResults.push({
      name: 'Storage Service',
      status: 'pending',
      message: 'Checking storage service availability...'
    });
    setResults([...debugResults]);

    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        debugResults[1] = {
          name: 'Storage Service',
          status: 'error',
          message: 'Storage service is not available',
          details: error,
          solution: 'Enable storage service in your Supabase dashboard: Settings > Storage'
        };
      } else {
        debugResults[1] = {
          name: 'Storage Service',
          status: 'success',
          message: `Storage service is available. Found ${buckets?.length || 0} buckets`,
          details: { 
            buckets: buckets?.map(b => ({ name: b.name, public: b.public })) || []
          }
        };
      }
    } catch (error: any) {
      debugResults[1] = {
        name: 'Storage Service',
        status: 'error',
        message: 'Storage service test failed',
        details: error.message,
        solution: 'Check if storage service is enabled in Supabase dashboard'
      };
    }
    setResults([...debugResults]);

    // Test 3: Check specific bucket existence
    debugResults.push({
      name: 'Community Videos Bucket',
      status: 'pending',
      message: 'Checking community-videos bucket...'
    });
    setResults([...debugResults]);

    try {
      const { data: bucket, error } = await supabase.storage.getBucket('community-videos');
      
      if (error) {
        debugResults[2] = {
          name: 'Community Videos Bucket',
          status: 'error',
          message: 'community-videos bucket does not exist',
          details: error,
          solution: 'Create the bucket in Supabase dashboard: Storage > New Bucket > Name: community-videos, Public: true'
        };
      } else {
        debugResults[2] = {
          name: 'Community Videos Bucket',
          status: 'success',
          message: 'community-videos bucket exists and is accessible',
          details: { 
            name: bucket.name,
            public: bucket.public,
            fileSizeLimit: bucket.file_size_limit
          }
        };
      }
    } catch (error: any) {
      debugResults[2] = {
        name: 'Community Videos Bucket',
        status: 'error',
        message: 'Failed to check bucket',
        details: error.message,
        solution: 'Create the community-videos bucket in Supabase dashboard'
      };
    }
    setResults([...debugResults]);

    // Test 4: Check RLS policies
    debugResults.push({
      name: 'RLS Policies',
      status: 'pending',
      message: 'Checking Row Level Security policies...'
    });
    setResults([...debugResults]);

    if (!user) {
      debugResults[3] = {
        name: 'RLS Policies',
        status: 'warning',
        message: 'Cannot test RLS policies - user not authenticated',
        solution: 'Log in to test RLS policies'
      };
    } else {
      try {
        // Try to list files in user's folder to test RLS
        const { data: files, error } = await supabase.storage
          .from('community-videos')
          .list(`${user.id}/`, { limit: 1 });
        
        if (error) {
          debugResults[3] = {
            name: 'RLS Policies',
            status: 'error',
            message: 'RLS policies may be blocking access',
            details: error,
            solution: `Run these SQL commands in Supabase SQL editor:
            1. ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
            2. CREATE POLICY "Allow authenticated users to upload videos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'community-videos' AND auth.uid()::text = (storage.foldername(name))[1]);
            3. CREATE POLICY "Allow public access to view videos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'community-videos');`
          };
        } else {
          debugResults[3] = {
            name: 'RLS Policies',
            status: 'success',
            message: 'RLS policies are configured correctly',
            details: { filesFound: files?.length || 0 }
          };
        }
      } catch (error: any) {
        debugResults[3] = {
          name: 'RLS Policies',
          status: 'warning',
          message: 'RLS policy test failed (this might be normal)',
          details: error.message,
          solution: 'Check RLS policies in Supabase dashboard: Storage > Policies'
        };
      }
    }
    setResults([...debugResults]);

    // Test 5: Check user authentication for storage
    debugResults.push({
      name: 'User Storage Auth',
      status: 'pending',
      message: 'Checking user authentication for storage...'
    });
    setResults([...debugResults]);

    if (!user) {
      debugResults[4] = {
        name: 'User Storage Auth',
        status: 'error',
        message: 'User is not authenticated',
        solution: 'Log in to your account to test storage access'
      };
    } else {
      try {
        // Test if user can access storage with their session
        const { data: session, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session.session) {
          debugResults[4] = {
            name: 'User Storage Auth',
            status: 'error',
            message: 'User session is invalid',
            details: sessionError,
            solution: 'Log out and log back in to refresh your session'
          };
        } else {
          debugResults[4] = {
            name: 'User Storage Auth',
            status: 'success',
            message: 'User is properly authenticated for storage access',
            details: { 
              userId: user.id,
              sessionValid: !!session.session
            }
          };
        }
      } catch (error: any) {
        debugResults[4] = {
          name: 'User Storage Auth',
          status: 'error',
          message: 'Authentication test failed',
          details: error.message,
          solution: 'Try logging out and logging back in'
        };
      }
    }
    setResults([...debugResults]);

    setIsRunning(false);
  };

  const getStatusIcon = (status: DebugResult['status']) => {
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

  const getStatusBadge = (status: DebugResult['status']) => {
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
          <Info className="h-5 w-5 text-blue-500" />
          Storage Debug Test
          {isRunning && <Loader2 className="h-4 w-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            This component performs detailed diagnostics to identify and fix storage access issues.
          </p>
          <Button 
            onClick={runDebugTests} 
            disabled={isRunning}
            variant="outline"
            size="sm"
          >
            {isRunning ? 'Running Debug...' : 'Run Debug Tests'}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Debug Results:</h4>
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
                {result.solution && (
                  <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-xs">
                    <strong className="text-blue-700 dark:text-blue-300">Solution:</strong>
                    <pre className="mt-1 text-blue-600 dark:text-blue-400 whitespace-pre-wrap">
                      {result.solution}
                    </pre>
                  </div>
                )}
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
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
            <h5 className="font-medium mb-2 text-amber-800 dark:text-amber-200">Quick Fix Steps:</h5>
            <ol className="text-sm text-amber-700 dark:text-amber-300 space-y-1 list-decimal list-inside">
              <li>Go to your Supabase dashboard</li>
              <li>Navigate to Storage section</li>
              <li>Create a bucket named "community-videos" (if it doesn't exist)</li>
              <li>Set the bucket to "Public"</li>
              <li>Go to SQL Editor and run the RLS policy commands</li>
              <li>Test the upload functionality again</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
