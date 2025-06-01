import { Camera } from 'expo-camera';
import * as Device from 'expo-device';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

interface CameraPermissionHook {
  error: string | null;
  isLoading: boolean;
  isSimulator: boolean;
  requestPermission: () => Promise<void>;
  status: PermissionStatus | null;
}

export function useCameraPermission(): CameraPermissionHook {
  const [status, setStatus] = useState<PermissionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSimulator, setIsSimulator] = useState(false);

  useEffect(() => {
    checkInitialPermission();
    checkIfSimulator();
  }, []);

  const checkIfSimulator = async () => {
    if (Platform.OS === 'ios') {
      // Check if running on iOS simulator
      const isDevice = Device.isDevice;
      setIsSimulator(!isDevice);
    }
  };

  const checkInitialPermission = async () => {
    try {
      setIsLoading(true);
      const { status: existingStatus } = await Camera.getCameraPermissionsAsync();
      setStatus(existingStatus as PermissionStatus);
    } catch (err) {
      setError('Failed to check camera permission');
      console.error('Permission check error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermission = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Special handling for iOS
      if (Platform.OS === 'ios') {
        const { status: newStatus } = await Camera.requestCameraPermissionsAsync();
        setStatus(newStatus as PermissionStatus);

        if (newStatus !== 'granted') {
          setError('Camera permission is required to scan barcodes. Please enable it in Settings.');
        }
      } else {
        // Android
        const { status: newStatus } = await Camera.requestCameraPermissionsAsync();
        setStatus(newStatus as PermissionStatus);

        if (newStatus !== 'granted') {
          setError('Camera permission denied');
        }
      }
    } catch (err) {
      setError('Failed to request camera permission');
      console.error('Permission request error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    error,
    isLoading,
    isSimulator,
    requestPermission,
    status,
  };
}