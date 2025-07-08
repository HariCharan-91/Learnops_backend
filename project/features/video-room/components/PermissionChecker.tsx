'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Video, 
  Mic, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle 
} from 'lucide-react';
import { useMediaPermissions } from '../hooks/useMediaPermissions';

interface PermissionCheckerProps {
  onPermissionsGranted: () => void;
}

export function PermissionChecker({ onPermissionsGranted }: PermissionCheckerProps) {
  const {
    permissionStatus,
    isRequesting,
    allPermissionsGranted,
    requestPermissions,
  } = useMediaPermissions();

  // Auto-proceed when permissions are granted
  useEffect(() => {
    if (allPermissionsGranted) {
      console.log('✅ All permissions granted, proceeding to room...');
      // Add a small delay to show the success state
      const timer = setTimeout(() => {
        onPermissionsGranted();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [allPermissionsGranted, onPermissionsGranted]);

  const handleRequestPermissions = async () => {
    const granted = await requestPermissions();
    if (granted) {
      console.log('✅ Permissions granted via button click');
      // The useEffect above will handle the transition
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'granted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'denied':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default:
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'granted':
        return 'Granted';
      case 'denied':
        return 'Denied';
      case 'error':
        return 'Error';
      default:
        return 'Checking...';
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <Card className="p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <Video className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-2">Camera & Microphone Access</h2>
          <p className="text-muted-foreground">
            We need access to your camera and microphone for the video session
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Video className="h-5 w-5" />
              <span>Camera</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(permissionStatus.camera)}
              <span className="text-sm">{getStatusText(permissionStatus.camera)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Mic className="h-5 w-5" />
              <span>Microphone</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(permissionStatus.microphone)}
              <span className="text-sm">{getStatusText(permissionStatus.microphone)}</span>
            </div>
          </div>
        </div>

        {!allPermissionsGranted && (
          <div className="space-y-4">
            {(permissionStatus.camera === 'denied' || permissionStatus.microphone === 'denied') && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Permissions Denied:</strong> Please click the camera/microphone icon in your browser's address bar and allow access, then refresh the page.
                </AlertDescription>
              </Alert>
            )}

            {(permissionStatus.camera === 'error' || permissionStatus.microphone === 'error') && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Device Error:</strong> Please check that your camera and microphone are connected and not being used by another application.
                </AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={handleRequestPermissions} 
              disabled={isRequesting}
              className="w-full"
              size="lg"
            >
              {isRequesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Requesting Access...
                </>
              ) : (
                'Grant Permissions'
              )}
            </Button>
          </div>
        )}

        {allPermissionsGranted && (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Ready!</strong> Permissions granted. Joining your session...
              </AlertDescription>
            </Alert>
            
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span className="text-sm text-muted-foreground">Connecting to video room...</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}