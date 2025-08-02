
import { supabase } from "@/integrations/supabase/client";

export interface SystemCheckResult {
  component: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

export const SystemCheck = {
  async runFullSystemCheck(): Promise<SystemCheckResult[]> {
    const results: SystemCheckResult[] = [];
    
    // Test 1: Basic connectivity (simplified)
    try {
      const startTime = Date.now();
      
      // Use a simple HEAD request to avoid parsing JSON
      const response = await fetch('https://vuzhlwyhcrsxqfysczsu.supabase.co/rest/v1/', {
        method: 'HEAD',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1emhsd3loY3JzeHFmeXNjenN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NjU2NDQsImV4cCI6MjA2NTE0MTY0NH0.XXczMcxqEKgwNnRZOJmL02_FEcE5b3_by29qM1dYsX0'
        }
      });
      
      const responseTime = Date.now() - startTime;
      
      results.push({
        component: 'Basic Connectivity',
        status: response.ok ? 'pass' : 'fail',
        message: response.ok ? `Connection successful (${responseTime}ms)` : `HTTP ${response.status}`,
        details: { responseTime, status: response.status }
      });
      
    } catch (error) {
      console.error('❌ Basic connectivity failed:', error);
      results.push({
        component: 'Basic Connectivity',
        status: 'fail',
        message: 'Connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 2: Auth status (simplified)
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        results.push({
          component: 'Authentication',
          status: 'fail',
          message: 'Auth error',
          details: error.message
        });
      } else if (user) {
        results.push({
          component: 'Authentication',
          status: 'pass',
          message: `Authenticated as ${user.email}`,
          details: { userId: user.id, email: user.email }
        });
      } else {
        results.push({
          component: 'Authentication',
          status: 'warning',
          message: 'No user authenticated'
        });
      }
    } catch (error) {
      console.error('❌ Auth test failed:', error);
      results.push({
        component: 'Authentication',
        status: 'fail',
        message: 'Auth check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 3: Simple database test (avoid problematic queries)
    try {
      // Use the simplest possible query that shouldn't trigger analytics
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(0); // Don't actually fetch data, just test the connection
      
      if (error) {
        results.push({
          component: 'Database Access',
          status: 'fail',
          message: 'Database query failed',
          details: error.message
        });
      } else {
        results.push({
          component: 'Database Access',
          status: 'pass',
          message: 'Database connection working',
          details: { queryType: 'connection_test' }
        });
      }
    } catch (error) {
      console.error('❌ Database test failed:', error);
      results.push({
        component: 'Database Access',
        status: 'fail',
        message: 'Database test error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    return results;
  },

  logResults(results: SystemCheckResult[]) {
    // Logging functionality removed
  }
};
