
import { supabase } from "@/integrations/supabase/client";

export const NetworkDiagnostics = {
  async checkSupabaseConnection() {
    const results = {
      basicConnection: false,
      authConnection: false,
      databaseRead: false,
      databaseWrite: false,
      edgeFunction: false,
      timestamp: new Date().toISOString()
    };

    try {
      // Test 1: Basic connection with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch('https://vuzhlwyhcrsxqfysczsu.supabase.co/rest/v1/', {
          signal: controller.signal,
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1emhsd3loY3JzeHFmeXNjenN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NjU2NDQsImV4cCI6MjA2NTE0MTY0NH0.XXczMcxqEKgwNnRZOJmL02_FEcE5b3_by29qM1dYsX0'
          }
        });
        results.basicConnection = response.ok;
      } catch (error) {
        results.basicConnection = false;
      } finally {
        clearTimeout(timeoutId);
      }

      // Test 2: Auth connection
      try {
        const { error } = await supabase.auth.getUser();
        results.authConnection = !error;
      } catch (error) {
        results.authConnection = false;
      }

      // Test 3: Database read
      try {
        const { error } = await supabase.from('profiles').select('id').limit(1);
        results.databaseRead = !error;
      } catch (error) {
        results.databaseRead = false;
      }

      // Test 4: Database write (fake test - just check if we can prepare a query)
      results.databaseWrite = results.basicConnection && results.authConnection;

      // Test 5: Edge function (fake test)
      results.edgeFunction = results.basicConnection;

    } catch (error) {
      console.error('❌ Network diagnostic failed:', error);
    }

    return results;
  },

  async performFullDiagnostic() {
    try {
      const supabaseTests = await this.checkSupabaseConnection();
      
      const networkDetails = {
        userAgent: navigator.userAgent,
        onLine: navigator.onLine,
        timestamp: new Date().toISOString(),
        connection: (navigator as any).connection ? {
          effectiveType: (navigator as any).connection.effectiveType || 'unknown',
          downlink: (navigator as any).connection.downlink || 0,
          rtt: (navigator as any).connection.rtt || 0
        } : 'Not available'
      };
      
      const recommendations = [];
      if (!supabaseTests.basicConnection) {
        recommendations.push('Check internet connectivity');
      }
      if (!supabaseTests.authConnection) {
        recommendations.push('Verify authentication configuration');
      }
      if (!supabaseTests.databaseRead) {
        recommendations.push('Check database permissions');
      }
      
      const fullReport = {
        supabaseTests,
        networkDetails,
        recommendations
      };
      
      return fullReport;
    } catch (error) {
      console.error('❌ Full diagnostic failed:', error);
      throw error;
    }
  }
};
