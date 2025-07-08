// API testing hook
import { useState } from 'react';
import { apiService } from '@/services/api.service';
import { API_ENDPOINTS } from '@/constants/api';
import { TestResult } from '@/types';

export function useApiTesting() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Backend Health Check', status: 'pending', message: 'Not tested yet' },
    { name: 'CORS Configuration', status: 'pending', message: 'Not tested yet' },
    { name: 'Auth Signup', status: 'pending', message: 'Not tested yet' },
    { name: 'Auth Signin', status: 'pending', message: 'Not tested yet' },
    { name: 'Profile Access', status: 'pending', message: 'Not tested yet' },
    { name: 'Database Connection', status: 'pending', message: 'Not tested yet' }
  ]);
  
  const [isRunning, setIsRunning] = useState(false);
  const [testUser, setTestUser] = useState<any>(null);

  const updateTest = (index: number, status: 'success' | 'error', message: string, details?: any) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { 
        ...test, 
        status, 
        message, 
        details,
        timestamp: new Date().toLocaleTimeString()
      } : test
    ));
  };

  const runHealthCheck = async () => {
    try {
      const healthResponse = await apiService.get(API_ENDPOINTS.HEALTH);
      updateTest(0, 'success', `✅ Backend is running: ${healthResponse.service || 'Flask API'}`, healthResponse);
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      updateTest(0, 'error', `❌ Backend not accessible: ${errorMsg}`);
      return false;
    }
  };

  const runCorsCheck = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://5616-106-215-170-8.ngrok-free.app'}/health`, {
        method: 'OPTIONS',
        mode: 'cors',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization',
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (response.ok || response.status === 200 || response.status === 204) {
        updateTest(1, 'success', '✅ CORS is properly configured');
        return true;
      } else {
        updateTest(1, 'error', `❌ CORS issue: ${response.status} ${response.statusText}`);
        return false;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      updateTest(1, 'error', `❌ CORS test failed: ${errorMsg}`);
      return false;
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    
    // Reset all tests
    setTests(prev => prev.map(test => ({ ...test, status: 'pending' as const, message: 'Testing...' })));

    try {
      // Test 1: Health Check
      const healthOk = await runHealthCheck();
      if (!healthOk) {
        // Skip remaining tests if health check fails
        for (let i = 1; i < tests.length; i++) {
          updateTest(i, 'error', '❌ Skipped - Backend not accessible');
        }
        return;
      }

      // Test 2: CORS Check
      await runCorsCheck();

      // Test 3: Auth Signup
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = 'TestPassword123!';
      const testName = 'Test User';
      
      try {
        const signupResponse = await apiService.post(API_ENDPOINTS.AUTH.SIGNUP, {
          email: testEmail,
          password: testPassword,
          name: testName
        });
        
        setTestUser({ email: testEmail, password: testPassword, data: signupResponse });
        updateTest(2, 'success', '✅ User signup successful', signupResponse);

        // Test 4: Auth Signin
        try {
          const signinResponse = await apiService.post(API_ENDPOINTS.AUTH.SIGNIN, {
            email: testEmail,
            password: testPassword
          });
          
          if (signinResponse.session?.access_token) {
            localStorage.setItem('test_token', signinResponse.session.access_token);
            updateTest(3, 'success', '✅ User signin successful', signinResponse);

            // Test 5: Profile Access
            try {
              const profileResponse = await apiService.get(API_ENDPOINTS.PROFILE);
              updateTest(4, 'success', '✅ Profile access successful', profileResponse);
              
              // Test 6: Database Connection
              if (profileResponse.profile && profileResponse.profile.id) {
                updateTest(5, 'success', '✅ Database connection working - Profile found in Supabase', profileResponse.profile);
              } else {
                updateTest(5, 'error', '❌ Database issue - No profile data found', profileResponse);
              }
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : 'Unknown error';
              updateTest(4, 'error', `❌ Profile access failed: ${errorMsg}`);
              updateTest(5, 'error', '❌ Database test failed - Could not access profile');
            }
          } else {
            updateTest(3, 'error', '❌ Signin successful but no access token received', signinResponse);
            updateTest(4, 'error', '❌ Skipped - No access token');
            updateTest(5, 'error', '❌ Skipped - No access token');
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          updateTest(3, 'error', `❌ Signin failed: ${errorMsg}`);
          updateTest(4, 'error', '❌ Skipped - Signin failed');
          updateTest(5, 'error', '❌ Skipped - Signin failed');
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        updateTest(2, 'error', `❌ Signup failed: ${errorMsg}`);
        updateTest(3, 'error', '❌ Skipped - Signup failed');
        updateTest(4, 'error', '❌ Skipped - Signup failed');
        updateTest(5, 'error', '❌ Skipped - Signup failed');
      }

    } catch (error) {
      console.error('Test suite error:', error);
    } finally {
      setIsRunning(false);
      // Clean up test token
      localStorage.removeItem('test_token');
    }
  };

  return {
    tests,
    isRunning,
    testUser,
    runAllTests,
    runHealthCheck,
    runCorsCheck,
  };
}