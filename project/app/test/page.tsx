'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Server, 
  Database,
  RefreshCw,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useApiTesting } from '@/features/testing/hooks/useApiTesting';
import { API_CONFIG } from '@/constants/api';

export default function TestPage() {
  const { tests, isRunning, runAllTests, runHealthCheck } = useApiTesting();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-300" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Backend Connection Test</h1>
          <p className="text-muted-foreground">
            Test your Flask backend with Supabase integration through ngrok tunnel.
          </p>
        </div>

        <div className="mb-6">
          <Alert>
            <Server className="h-4 w-4" />
            <AlertDescription>
              <strong>Testing Backend:</strong> {API_CONFIG.BASE_URL}
              <br />
              Make sure both your Flask server and ngrok tunnel are running.
            </AlertDescription>
          </Alert>
        </div>

        {/* Environment Check */}
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Environment Check
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>API URL from .env:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded">{process.env.NEXT_PUBLIC_API_URL || 'Not set'}</code>
                </div>
                <div className="flex justify-between">
                  <span>Current URL being used:</span>
                  <code className="bg-blue-100 px-2 py-1 rounded font-semibold">{API_CONFIG.BASE_URL}</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mb-8">
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            size="lg"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Run All Tests
              </>
            )}
          </Button>
          
          <Button 
            onClick={runHealthCheck} 
            disabled={isRunning}
            variant="outline"
          >
            Quick Health Check
          </Button>
        </div>

        <div className="grid gap-4">
          {tests.map((test, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <CardTitle className="text-lg">{test.name}</CardTitle>
                      <CardDescription>{test.message}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {test.timestamp && (
                      <span className="text-xs text-muted-foreground">{test.timestamp}</span>
                    )}
                    {getStatusBadge(test.status)}
                  </div>
                </div>
              </CardHeader>
              {test.details && (
                <CardContent>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <pre className="text-sm overflow-auto max-h-40">
                      {JSON.stringify(test.details, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Test Results Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {tests.filter(t => t.status === 'success').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Passed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {tests.filter(t => t.status === 'error').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-600">
                    {tests.filter(t => t.status === 'pending').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Common Issues & Solutions:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Backend not accessible:</strong> Make sure Flask is running on port 5000</li>
                <li><strong>ngrok not working:</strong> Restart ngrok with: <code>ngrok http 5000</code></li>
                <li><strong>CORS errors:</strong> Check if Flask-CORS is properly configured</li>
                <li><strong>Auth errors:</strong> Verify Supabase credentials in your Flask .env file</li>
                <li><strong>Database errors:</strong> Check Supabase connection and table setup</li>
                <li><strong>Timeout errors:</strong> Backend might be slow or overloaded</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}