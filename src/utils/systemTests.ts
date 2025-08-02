
import { supabase } from "@/integrations/supabase/client";

export interface SystemTestResult {
  id: string;
  name: string;
  category: 'connectivity' | 'database' | 'auth' | 'email' | 'functions' | 'performance';
  status: 'idle' | 'running' | 'pass' | 'fail' | 'warning';
  message: string;
  duration?: number;
  startTime?: number;
  details?: any;
  critical: boolean;
}

export interface SystemTestSuite {
  id: string;
  name: string;
  description: string;
  tests: SystemTest[];
}

export interface SystemTest {
  id: string;
  name: string;
  description: string;
  category: SystemTestResult['category'];
  critical: boolean;
  execute: () => Promise<Omit<SystemTestResult, 'id' | 'name' | 'category' | 'critical'>>;
}

export class SystemTestRunner {
  private tests: SystemTest[] = [];
  private results: Map<string, SystemTestResult> = new Map();
  private listeners: ((results: SystemTestResult[]) => void)[] = [];

  constructor() {
    this.initializeTests();
  }

  private initializeTests() {
    this.tests = [
      // Connectivity Tests
      {
        id: 'basic-connectivity',
        name: 'Basic Connectivity',
        description: 'Test basic network connectivity to Supabase',
        category: 'connectivity',
        critical: true,
        execute: this.testBasicConnectivity
      },
      {
        id: 'api-response-time',
        name: 'API Response Time',
        description: 'Measure API response performance',
        category: 'performance',
        critical: false,
        execute: this.testAPIResponseTime
      },
      
      // Database Tests
      {
        id: 'database-read',
        name: 'Database Read Access',
        description: 'Test database read operations',
        category: 'database',
        critical: true,
        execute: this.testDatabaseRead
      },
      {
        id: 'database-write',
        name: 'Database Write Access',
        description: 'Test database write operations',
        category: 'database',
        critical: true,
        execute: this.testDatabaseWrite
      },
      {
        id: 'database-performance',
        name: 'Database Performance',
        description: 'Test database query performance',
        category: 'performance',
        critical: false,
        execute: this.testDatabasePerformance
      },

      // Authentication Tests
      {
        id: 'auth-status',
        name: 'Authentication Status',
        description: 'Check current authentication state',
        category: 'auth',
        critical: true,
        execute: this.testAuthStatus
      },
      {
        id: 'auth-permissions',
        name: 'Admin Permissions',
        description: 'Verify admin access permissions',
        category: 'auth',
        critical: true,
        execute: this.testAdminPermissions
      },

      // Email System Tests
      {
        id: 'email-config',
        name: 'Email Configuration',
        description: 'Validate email system configuration',
        category: 'email',
        critical: true,
        execute: this.testEmailConfig
      },
      {
        id: 'email-delivery',
        name: 'Email Delivery',
        description: 'Test actual email sending capability',
        category: 'email',
        critical: false,
        execute: this.testEmailDelivery
      },

      // Edge Functions Tests
      {
        id: 'edge-functions',
        name: 'Edge Functions',
        description: 'Test edge function availability',
        category: 'functions',
        critical: false,
        execute: this.testEdgeFunctions
      },
      {
        id: 'function-performance',
        name: 'Function Performance',
        description: 'Test edge function response times',
        category: 'performance',
        critical: false,
        execute: this.testFunctionPerformance
      }
    ];

    // Initialize results
    this.tests.forEach(test => {
      this.results.set(test.id, {
        id: test.id,
        name: test.name,
        category: test.category,
        status: 'idle',
        message: 'Ready to run',
        critical: test.critical
      });
    });
  }

  // Test Implementations
  private testBasicConnectivity = async (): Promise<Omit<SystemTestResult, 'id' | 'name' | 'category' | 'critical'>> => {
    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://vuzhlwyhcrsxqfysczsu.supabase.co/rest/v1/', {
        signal: controller.signal,
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1emhsd3loY3JzeHFmeXNjenN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NjU2NDQsImV4cCI6MjA2NTE0MTY0NH0.XXczMcxqEKgwNnRZOJmL02_FEcE5b3_by29qM1dYsX0'
        }
      });
      
      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;
      
      return {
        status: response.ok ? 'pass' : 'fail',
        message: response.ok ? `Connected successfully (${duration}ms)` : `HTTP ${response.status}`,
        duration,
        details: { statusCode: response.status, responseTime: duration }
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      return {
        status: 'fail',
        message: error.name === 'AbortError' ? 'Connection timeout' : 'Connection failed',
        duration,
        details: { error: error.message, timeout: error.name === 'AbortError' }
      };
    }
  };

  private testAPIResponseTime = async (): Promise<Omit<SystemTestResult, 'id' | 'name' | 'category' | 'critical'>> => {
    const startTime = Date.now();
    try {
      const response = await fetch('https://vuzhlwyhcrsxqfysczsu.supabase.co/rest/v1/', {
        method: 'HEAD',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1emhsd3loY3JzeHFmeXNjenN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NjU2NDQsImV4cCI6MjA2NTE0MTY0NH0.XXczMcxqEKgwNnRZOJmL02_FEcE5b3_by29qM1dYsX0'
        }
      });
      
      const duration = Date.now() - startTime;
      const status: 'pass' | 'warning' | 'fail' = duration < 500 ? 'pass' : duration < 1000 ? 'warning' : 'fail';
      
      return {
        status,
        message: `Response time: ${duration}ms`,
        duration,
        details: { responseTime: duration, threshold: duration < 500 ? 'excellent' : duration < 1000 ? 'acceptable' : 'slow' }
      };
    } catch (error: any) {
      return {
        status: 'fail',
        message: 'Failed to measure response time',
        duration: Date.now() - startTime,
        details: { error: error.message }
      };
    }
  };

  private testDatabaseRead = async (): Promise<Omit<SystemTestResult, 'id' | 'name' | 'category' | 'critical'>> => {
    const startTime = Date.now();
    try {
      // Use a simple, lightweight query that doesn't trigger analytics
      const { data, error, count } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .limit(1);
      
      const duration = Date.now() - startTime;
      
      if (error) {
        return {
          status: 'fail',
          message: `Database read failed: ${error.message}`,
          duration,
          details: { error: error.message, code: error.code }
        };
      }
      
      return {
        status: 'pass',
        message: `Database read successful (${duration}ms)`,
        duration,
        details: { queryTime: duration, recordsAvailable: count || 0 }
      };
    } catch (error: any) {
      return {
        status: 'fail',
        message: `Database read error: ${error.message}`,
        duration: Date.now() - startTime,
        details: { error: error.message }
      };
    }
  };

  private testDatabaseWrite = async (): Promise<Omit<SystemTestResult, 'id' | 'name' | 'category' | 'critical'>> => {
    const startTime = Date.now();
    try {
      // Test write with a system notification (safe test)
      const testData = {
        type: 'system_test',
        title: 'System Health Check',
        message: `Database write test at ${new Date().toISOString()}`,
        status: 'sent'
      };
      
      const { error } = await supabase
        .from('system_notifications')
        .insert(testData);
      
      const duration = Date.now() - startTime;
      
      if (error) {
        return {
          status: 'fail',
          message: `Write failed: ${error.message}`,
          duration,
          details: { error: error.message, code: error.code }
        };
      }
      
      return {
        status: 'pass',
        message: `Database write successful (${duration}ms)`,
        duration,
        details: { writeTime: duration }
      };
    } catch (error: any) {
      return {
        status: 'fail',
        message: 'Database write error',
        duration: Date.now() - startTime,
        details: { error: error.message }
      };
    }
  };

  private testDatabasePerformance = async (): Promise<Omit<SystemTestResult, 'id' | 'name' | 'category' | 'critical'>> => {
    const startTime = Date.now();
    try {
      // Test multiple concurrent queries
      const promises = [
        supabase.from('profiles').select('count', { count: 'exact', head: true }),
        supabase.from('subscribers').select('count', { count: 'exact', head: true }),
        supabase.from('pet_profiles').select('count', { count: 'exact', head: true })
      ];
      
      const results = await Promise.all(promises);
      const duration = Date.now() - startTime;
      
      const hasErrors = results.some(result => result.error);
      if (hasErrors) {
        return {
          status: 'fail',
          message: 'Performance test failed due to query errors',
          duration,
          details: { errors: results.filter(r => r.error).map(r => r.error) }
        };
      }
      
      const status: 'pass' | 'warning' | 'fail' = duration < 200 ? 'pass' : duration < 500 ? 'warning' : 'fail';
      
      return {
        status,
        message: `Concurrent queries completed in ${duration}ms`,
        duration,
        details: { concurrentQueries: 3, totalTime: duration, avgTime: duration / 3 }
      };
    } catch (error: any) {
      return {
        status: 'fail',
        message: 'Database performance test error',
        duration: Date.now() - startTime,
        details: { error: error.message }
      };
    }
  };

  private testAuthStatus = async (): Promise<Omit<SystemTestResult, 'id' | 'name' | 'category' | 'critical'>> => {
    const startTime = Date.now();
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      const duration = Date.now() - startTime;
      
      if (error) {
        return {
          status: 'fail',
          message: `Auth error: ${error.message}`,
          duration,
          details: { error: error.message }
        };
      }
      
      if (!user) {
        return {
          status: 'warning',
          message: 'No authenticated user',
          duration,
          details: { authenticated: false }
        };
      }
      
      return {
        status: 'pass',
        message: `Authenticated as ${user.email}`,
        duration,
        details: { userId: user.id, email: user.email, authenticated: true }
      };
    } catch (error: any) {
      return {
        status: 'fail',
        message: 'Auth check failed',
        duration: Date.now() - startTime,
        details: { error: error.message }
      };
    }
  };

  private testAdminPermissions = async (): Promise<Omit<SystemTestResult, 'id' | 'name' | 'category' | 'critical'>> => {
    const startTime = Date.now();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          status: 'fail',
          message: 'No user authenticated for permission check',
          duration: Date.now() - startTime,
          details: { authenticated: false }
        };
      }
      
      const { data, error } = await supabase
        .from('admin_users')
        .select('role, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();
      
      const duration = Date.now() - startTime;
      
      if (error) {
        return {
          status: 'fail',
          message: `Permission check failed: ${error.message}`,
          duration,
          details: { error: error.message, code: error.code }
        };
      }
      
      const hasAdminAccess = data && (data.role === 'admin' || data.role === 'support');
      
      return {
        status: hasAdminAccess ? 'pass' : 'fail',
        message: hasAdminAccess ? `Admin access confirmed (${data.role})` : 'No admin permissions',
        duration,
        details: { role: data?.role, isActive: data?.is_active, hasAccess: hasAdminAccess }
      };
    } catch (error: any) {
      return {
        status: 'fail',
        message: 'Admin permission check error',
        duration: Date.now() - startTime,
        details: { error: error.message }
      };
    }
  };

  private testEmailConfig = async (): Promise<Omit<SystemTestResult, 'id' | 'name' | 'category' | 'critical'>> => {
    const startTime = Date.now();
    try {
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: { validate: true }
      });
      
      const duration = Date.now() - startTime;
      
      if (error) {
        return {
          status: 'fail',
          message: `Email config validation failed: ${error.message}`,
          duration,
          details: { error: error.message }
        };
      }
      
      if (data?.valid) {
        return {
          status: 'pass',
          message: 'Email configuration is valid',
          duration,
          details: data.details || { validated: true }
        };
      }
      
      return {
        status: 'fail',
        message: data?.error || 'Email configuration invalid',
        duration,
        details: data?.details || { valid: false }
      };
    } catch (error: any) {
      return {
        status: 'fail',
        message: 'Email config test error',
        duration: Date.now() - startTime,
        details: { error: error.message }
      };
    }
  };

  private testEmailDelivery = async (): Promise<Omit<SystemTestResult, 'id' | 'name' | 'category' | 'critical'>> => {
    const startTime = Date.now();
    try {
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: {
          emailType: 'test-user-welcome',
          userEmail: 'system-test@tiertrainer24.com',
          userName: 'System Test'
        }
      });
      
      const duration = Date.now() - startTime;
      
      if (error) {
        return {
          status: 'fail',
          message: `Email delivery failed: ${error.message}`,
          duration,
          details: { error: error.message }
        };
      }
      
      if (data?.success) {
        return {
          status: 'pass',
          message: `Test email sent successfully`,
          duration,
          details: { emailId: data.emailId, testMode: data.testMode }
        };
      }
      
      return {
        status: 'fail',
        message: data?.error || 'Email delivery failed',
        duration,
        details: data
      };
    } catch (error: any) {
      return {
        status: 'fail',
        message: 'Email delivery test error',
        duration: Date.now() - startTime,
        details: { error: error.message }
      };
    }
  };

  private testEdgeFunctions = async (): Promise<Omit<SystemTestResult, 'id' | 'name' | 'category' | 'critical'>> => {
    const startTime = Date.now();
    try {
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: { test: true }
      });
      
      const duration = Date.now() - startTime;
      
      if (error) {
        return {
          status: 'fail',
          message: `Edge function failed: ${error.message}`,
          duration,
          details: { error: error.message }
        };
      }
      
      return {
        status: 'pass',
        message: `Edge functions operational (${duration}ms)`,
        duration,
        details: { functionResponse: data, responseTime: duration }
      };
    } catch (error: any) {
      return {
        status: 'fail',
        message: 'Edge function test error',
        duration: Date.now() - startTime,
        details: { error: error.message }
      };
    }
  };

  private testFunctionPerformance = async (): Promise<Omit<SystemTestResult, 'id' | 'name' | 'category' | 'critical'>> => {
    const startTime = Date.now();
    try {
      // Test multiple function calls
      const promises = Array(3).fill(0).map(() => 
        supabase.functions.invoke('send-welcome-email', {
          body: { test: true }
        })
      );
      
      const results = await Promise.all(promises);
      const duration = Date.now() - startTime;
      
      const hasErrors = results.some(result => result.error);
      if (hasErrors) {
        return {
          status: 'fail',
          message: 'Function performance test failed',
          duration,
          details: { errors: results.filter(r => r.error).map(r => r.error) }
        };
      }
      
      const avgTime = duration / 3;
      const status: 'pass' | 'warning' | 'fail' = avgTime < 1000 ? 'pass' : avgTime < 2000 ? 'warning' : 'fail';
      
      return {
        status,
        message: `Function performance: ${avgTime.toFixed(0)}ms avg`,
        duration,
        details: { totalTime: duration, avgTime, concurrentCalls: 3 }
      };
    } catch (error: any) {
      return {
        status: 'fail',
        message: 'Function performance test error',
        duration: Date.now() - startTime,
        details: { error: error.message }
      };
    }
  };

  // Public Methods
  subscribe(callback: (results: SystemTestResult[]) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners() {
    const results = Array.from(this.results.values());
    this.listeners.forEach(callback => callback(results));
  }

  async runTest(testId: string): Promise<SystemTestResult> {
    const test = this.tests.find(t => t.id === testId);
    if (!test) {
      throw new Error(`Test ${testId} not found`);
    }

    // Update status to running
    const runningResult: SystemTestResult = {
      id: test.id,
      name: test.name,
      category: test.category,
      status: 'running',
      message: 'Running...',
      critical: test.critical,
      startTime: Date.now()
    };
    
    this.results.set(testId, runningResult);
    this.notifyListeners();

    try {
      const result = await test.execute();
      const finalResult: SystemTestResult = {
        id: test.id,
        name: test.name,
        category: test.category,
        critical: test.critical,
        ...result
      };
      
      this.results.set(testId, finalResult);
      this.notifyListeners();
      
      return finalResult;
    } catch (error: any) {
      const errorResult: SystemTestResult = {
        id: test.id,
        name: test.name,
        category: test.category,
        status: 'fail',
        message: `Test execution failed: ${error.message}`,
        critical: test.critical,
        details: { error: error.message }
      };
      
      this.results.set(testId, errorResult);
      this.notifyListeners();
      
      return errorResult;
    }
  }

  async runAllTests(): Promise<SystemTestResult[]> {
    // Run critical tests first, then non-critical
    const criticalTests = this.tests.filter(t => t.critical);
    const nonCriticalTests = this.tests.filter(t => !t.critical);
    
    // Run critical tests sequentially
    for (const test of criticalTests) {
      await this.runTest(test.id);
    }
    
    // Run non-critical tests concurrently
    await Promise.all(
      nonCriticalTests.map(test => this.runTest(test.id))
    );
    
    return Array.from(this.results.values());
  }

  async runTestsByCategory(category: SystemTestResult['category']): Promise<SystemTestResult[]> {
    const categoryTests = this.tests.filter(t => t.category === category);
    
    await Promise.all(
      categoryTests.map(test => this.runTest(test.id))
    );
    
    return categoryTests.map(test => this.results.get(test.id)!);
  }

  getResults(): SystemTestResult[] {
    return Array.from(this.results.values());
  }

  getTestSuites(): SystemTestSuite[] {
    const suites: SystemTestSuite[] = [
      {
        id: 'critical',
        name: 'Critical System Tests',
        description: 'Essential tests that must pass for system functionality',
        tests: this.tests.filter(t => t.critical)
      },
      {
        id: 'connectivity',
        name: 'Connectivity Tests',
        description: 'Network and API connectivity tests',
        tests: this.tests.filter(t => t.category === 'connectivity')
      },
      {
        id: 'database',
        name: 'Database Tests',
        description: 'Database functionality and performance tests',
        tests: this.tests.filter(t => t.category === 'database')
      },
      {
        id: 'authentication',
        name: 'Authentication Tests',
        description: 'User authentication and authorization tests',
        tests: this.tests.filter(t => t.category === 'auth')
      },
      {
        id: 'email',
        name: 'Email System Tests',
        description: 'Email configuration and delivery tests',
        tests: this.tests.filter(t => t.category === 'email')
      },
      {
        id: 'functions',
        name: 'Edge Functions Tests',
        description: 'Edge function availability and performance tests',
        tests: this.tests.filter(t => t.category === 'functions')
      },
      {
        id: 'performance',
        name: 'Performance Tests',
        description: 'System performance and response time tests',
        tests: this.tests.filter(t => t.category === 'performance')
      }
    ];
    
    return suites;
  }

  getSummary() {
    const results = Array.from(this.results.values());
    return {
      total: results.length,
      passed: results.filter(r => r.status === 'pass').length,
      failed: results.filter(r => r.status === 'fail').length,
      warnings: results.filter(r => r.status === 'warning').length,
      running: results.filter(r => r.status === 'running').length,
      idle: results.filter(r => r.status === 'idle').length,
      critical: results.filter(r => r.critical).length,
      criticalPassed: results.filter(r => r.critical && r.status === 'pass').length,
      criticalFailed: results.filter(r => r.critical && r.status === 'fail').length
    };
  }
}
