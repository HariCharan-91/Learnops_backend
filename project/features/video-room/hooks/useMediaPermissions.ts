// Media permissions hook
import { useState, useEffect } from 'react';

interface PermissionStatus {
  camera: 'checking' | 'granted' | 'denied' | 'error';
  microphone: 'checking' | 'granted' | 'denied' | 'error';
}

export function useMediaPermissions() {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>({
    camera: 'checking',
    microphone: 'checking'
  });
  const [isRequesting, setIsRequesting] = useState(false);

  const checkPermissions = async (): Promise<boolean> => {
    try {
      console.log('🔍 Checking media permissions...');
      
      if (navigator.permissions) {
        try {
          const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
          const microphonePermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          
          const cameraGranted = cameraPermission.state === 'granted';
          const micGranted = microphonePermission.state === 'granted';
          
          setPermissionStatus({
            camera: cameraGranted ? 'granted' : 'denied',
            microphone: micGranted ? 'granted' : 'denied'
          });
          
          if (cameraGranted && micGranted) {
            console.log('✅ Permissions already granted');
            return true;
          }
        } catch (error) {
          console.log('⚠️ Permission API not fully supported, will request directly');
        }
      }
      
      // Try to access media directly to check if permissions are already granted
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        console.log('✅ Media access successful - permissions already granted');
        stream.getTracks().forEach(track => track.stop());
        
        setPermissionStatus({
          camera: 'granted',
          microphone: 'granted'
        });
        
        return true;
      } catch (error) {
        console.log('❌ Media access failed, permissions needed');
        setPermissionStatus({
          camera: 'denied',
          microphone: 'denied'
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Permission check failed:', error);
      setPermissionStatus({
        camera: 'error',
        microphone: 'error'
      });
      return false;
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    setIsRequesting(true);
    
    try {
      console.log('🎥 Requesting media permissions...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      console.log('✅ Media permissions granted');
      
      // Stop the stream immediately as we just needed to check permissions
      stream.getTracks().forEach(track => track.stop());
      
      setPermissionStatus({
        camera: 'granted',
        microphone: 'granted'
      });
      
      return true;
    } catch (error) {
      console.error('❌ Media permission request failed:', error);
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setPermissionStatus({
            camera: 'denied',
            microphone: 'denied'
          });
        } else if (error.name === 'NotFoundError') {
          setPermissionStatus({
            camera: 'error',
            microphone: 'error'
          });
        } else {
          setPermissionStatus({
            camera: 'error',
            microphone: 'error'
          });
        }
      }
      return false;
    } finally {
      setIsRequesting(false);
    }
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  const allPermissionsGranted = permissionStatus.camera === 'granted' && permissionStatus.microphone === 'granted';

  return {
    permissionStatus,
    isRequesting,
    allPermissionsGranted,
    checkPermissions,
    requestPermissions,
  };
}