import * as Font from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import { LinkingService } from '../src/services/linkingService';
import { NotificationService } from '../src/services/notificationService';
import { UpdateService } from '../src/services/updateService';
import { WebBrowserService } from '../src/services/webBrowserService';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [_fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadResources = async () => {
      try {
        // Load custom fonts
        await Font.loadAsync({
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
        });
      } catch (error) {
        console.warn('Font loading failed:', error);
      }

      try {
        // Setup notifications
        await NotificationService.setupNotificationCategories();
        await NotificationService.registerForPushNotifications();
        
        // Initialize updates
        await UpdateService.initializeUpdates();
        
        // Initialize deep linking
        const cleanupLinking = LinkingService.initialize();
        
        // Warm up WebBrowser for faster loading
        await WebBrowserService.warmUp();
        
        // Store cleanup function for component unmount
        return cleanupLinking;
      } catch (error) {
        console.warn('App initialization failed:', error);
      } finally {
        setFontsLoaded(true);
        await SplashScreen.hideAsync();
      }
    };

    loadResources();
    
    // Cleanup on unmount
    return () => {
      // Cool down WebBrowser
      WebBrowserService.coolDown();
    };
  }, []);

  return (
    <>
      <Stack>
        <Stack.Screen options={{ title: 'Hedwig Home' }} name="index" />
        <Stack.Screen options={{ title: 'Barcode Scanner' }} name="scanner" />
        <Stack.Screen options={{ title: 'Scan History' }} name="history" />
        <Stack.Screen options={{ title: 'Dashboard' }} name="dashboard" />
        <Stack.Screen options={{ title: 'AI Search' }} name="search" />
        <Stack.Screen options={{ title: 'Product Management' }} name="pim" />
        <Stack.Screen options={{ title: 'Content Management' }} name="cms" />
        <Stack.Screen options={{ title: 'System Monitoring' }} name="monitoring" />
        <Stack.Screen options={{ title: 'Demo Features' }} name="demo" />
        <Stack.Screen options={{ title: 'WebBrowser Demo' }} name="web-browser-demo" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}