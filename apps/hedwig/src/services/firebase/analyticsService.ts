import { usePathname } from 'expo-router';
import {
  type Analytics,
  type EventParams,
  getAnalytics,
  isSupported,
  logEvent,
  setAnalyticsCollectionEnabled,
  setCurrentScreen,
  setUserId,
  setUserProperties,
} from 'firebase/analytics';
// React hooks
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { app } from '../../config/firebase';
import { SentryService } from '../sentryService';

import { FirebaseAuthService } from './authService';

// Custom event types for Hedwig app
export interface HedwigAnalyticsEvents {
  scan_completed: {
    barcode: string;
    barcode_type: string;
    duration_ms: number;
    success: boolean;
  };
  scan_error: {
    error_type: string;
    error_message: string;
  };
  // Scanner events
  scan_started: {
    source: 'camera' | 'image' | 'manual';
  };

  product_not_found: {
    barcode: string;
    search_type: 'local' | 'api';
  };
  product_shared: {
    product_id: string;
    method: 'link' | 'image' | 'text';
  };
  // Product events
  product_viewed: {
    product_id: string;
    product_name?: string;
    barcode: string;
    source: 'scan' | 'search' | 'history';
  };

  // Search events
  search_performed: {
    query: string;
    results_count: number;
    search_type: 'product' | 'barcode';
  };

  history_cleared: {
    items_count: number;
  };
  history_item_clicked: {
    product_id: string;
    position: number;
  };
  // History events
  history_viewed: {
    items_count: number;
  };

  user_profile_updated: {
    fields_updated: string[];
  };
  user_signed_in: {
    method: 'email' | 'google' | 'apple' | 'anonymous';
  };
  user_signed_out: {};
  // User events
  user_signed_up: {
    method: 'email' | 'google' | 'apple' | 'anonymous';
  };

  // Settings events
  settings_changed: {
    setting_name: string;
    old_value: any;
    new_value: any;
  };
  theme_changed: {
    theme: 'light' | 'dark' | 'system';
  };

  permission_denied: {
    permission_type: 'camera' | 'notifications' | 'location';
  };
  permission_granted: {
    permission_type: 'camera' | 'notifications' | 'location';
  };
  // Permission events
  permission_requested: {
    permission_type: 'camera' | 'notifications' | 'location';
  };

  // Network events
  offline_mode_activated: {};
  offline_mode_deactivated: {};
  sync_completed: {
    items_count: number;
    duration_ms: number;
  };
  sync_started: {
    items_count: number;
  };

  // Feature usage
  feature_used: {
    feature_name: string;
    feature_category: string;
  };
}

export class FirebaseAnalyticsService {
  private static analytics: Analytics | null = null;
  private static isEnabled = true;
  private static currentScreen: string | null = null;
  private static sessionStartTime: number = Date.now();

  /**
   * Initialize analytics
   */
  static async initialize(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        const supported = await isSupported();
        if (supported) {
          this.analytics = getAnalytics(app);
          console.log('Firebase Analytics initialized');
        } else {
          console.log('Firebase Analytics not supported in this environment');
        }
      } else {
        // For React Native, we would use @react-native-firebase/analytics
        // For now, we'll just log events locally
        console.log('Firebase Analytics not available for React Native in web SDK');
      }

      // Set initial user properties
      this.updateUserProperties();
    } catch (error) {
      SentryService.captureException(error as Error);
      console.error('Failed to initialize analytics:', error);
    }
  }

  /**
   * Log custom event
   */
  static logEvent<T extends keyof HedwigAnalyticsEvents>(
    eventName: T,
    eventParams?: HedwigAnalyticsEvents[T]
  ): void {
    if (!this.isEnabled) return;

    try {
      // Log to console in development
      if (__DEV__) {
        console.log(`Analytics Event: ${eventName}`, eventParams);
      }

      // Log to Firebase Analytics if available
      if (this.analytics) {
        logEvent(this.analytics, eventName as string, eventParams as EventParams);
      }

      // Also send to Sentry as breadcrumb
      SentryService.addBreadcrumb({
        category: 'analytics',
        data: eventParams as any,
        level: 'info',
        message: `Analytics: ${eventName}`,
      });
    } catch (error) {
      console.error('Failed to log event:', error);
    }
  }

  /**
   * Log standard Firebase event
   */
  static logStandardEvent(
    eventName: string,
    eventParams?: EventParams
  ): void {
    if (!this.isEnabled || !this.analytics) return;

    try {
      logEvent(this.analytics, eventName, eventParams);
    } catch (error) {
      console.error('Failed to log standard event:', error);
    }
  }

  /**
   * Set current screen
   */
  static setScreen(screenName: string, screenClass?: string): void {
    if (!this.isEnabled) return;

    try {
      this.currentScreen = screenName;

      if (this.analytics) {
        setCurrentScreen(this.analytics, screenName);
        
        // Log screen view event
        logEvent(this.analytics, 'screen_view', {
          screen_name: screenName,
          screen_class: screenClass || screenName,
        });
      }

      // Log to console in development
      if (__DEV__) {
        console.log(`Screen View: ${screenName}`);
      }
    } catch (error) {
      console.error('Failed to set screen:', error);
    }
  }

  /**
   * Set user ID
   */
  static setUserId(userId: string | null): void {
    if (!this.analytics) return;

    try {
      setUserId(this.analytics, userId);
    } catch (error) {
      console.error('Failed to set user ID:', error);
    }
  }

  /**
   * Set user properties
   */
  static setUserProperties(properties: Record<string, any>): void {
    if (!this.analytics) return;

    try {
      setUserProperties(this.analytics, properties);
    } catch (error) {
      console.error('Failed to set user properties:', error);
    }
  }

  /**
   * Update user properties based on auth state
   */
  private static updateUserProperties(): void {
    const user = FirebaseAuthService.getCurrentUser();
    
    if (user) {
      this.setUserId(user.uid);
      this.setUserProperties({
        auth_provider: user.isAnonymous ? 'anonymous' : 'email', // You'd need to track this
        user_type: user.isAnonymous ? 'anonymous' : 'registered',
        email_verified: user.emailVerified,
      });
    } else {
      this.setUserId(null);
    }
  }

  /**
   * Enable/disable analytics collection
   */
  static async setEnabled(enabled: boolean): Promise<void> {
    this.isEnabled = enabled;
    
    if (this.analytics) {
      await setAnalyticsCollectionEnabled(this.analytics, enabled);
    }
  }

  /**
   * Log timing event
   */
  static logTiming(
    category: string,
    variable: string,
    value: number,
    label?: string
  ): void {
    this.logStandardEvent('timing_complete', {
      name: `${category}_${variable}`,
      event_category: category,
      event_label: label,
      value,
    });
  }

  /**
   * Log purchase event
   */
  static logPurchase(
    value: number,
    currency: string,
    items: {
      item_id: string;
      item_name: string;
      price: number;
      quantity: number;
    }[]
  ): void {
    this.logStandardEvent('purchase', {
      currency,
      items,
      value,
    });
  }

  /**
   * Log share event
   */
  static logShare(
    contentType: string,
    itemId: string,
    method: string
  ): void {
    this.logStandardEvent('share', {
      item_id: itemId,
      content_type: contentType,
      method,
    });
  }

  /**
   * Log search event
   */
  static logSearch(searchTerm: string): void {
    this.logStandardEvent('search', {
      search_term: searchTerm,
    });
  }

  /**
   * Log app open
   */
  static logAppOpen(): void {
    this.logStandardEvent('app_open', {
      session_start_time: this.sessionStartTime,
    });
  }

  /**
   * Log session end
   */
  static logSessionEnd(): void {
    const sessionDuration = Date.now() - this.sessionStartTime;
    
    this.logStandardEvent('session_end', {
      screens_viewed: this.currentScreen,
      session_duration: sessionDuration,
    });
  }

  // Convenience methods for common Hedwig events

  static logScanStarted(source: 'camera' | 'image' | 'manual'): void {
    this.logEvent('scan_started', { source });
  }

  static logScanCompleted(
    barcode: string,
    barcodeType: string,
    duration: number,
    success: boolean
  ): void {
    this.logEvent('scan_completed', {
      barcode_type: barcodeType,
      barcode,
      duration_ms: duration,
      success,
    });
  }

  static logProductViewed(
    productId: string,
    barcode: string,
    source: 'scan' | 'search' | 'history',
    productName?: string
  ): void {
    this.logEvent('product_viewed', {
      product_id: productId,
      product_name: productName,
      barcode,
      source,
    });
  }

  static logProductNotFound(barcode: string, searchType: 'local' | 'api'): void {
    this.logEvent('product_not_found', {
      search_type: searchType,
      barcode,
    });
  }

  static logPermissionRequest(type: 'camera' | 'notifications' | 'location'): void {
    this.logEvent('permission_requested', {
      permission_type: type,
    });
  }

  static logPermissionResult(
    type: 'camera' | 'notifications' | 'location',
    granted: boolean
  ): void {
    if (granted) {
      this.logEvent('permission_granted', { permission_type: type });
    } else {
      this.logEvent('permission_denied', { permission_type: type });
    }
  }

  static logFeatureUsed(featureName: string, category: string): void {
    this.logEvent('feature_used', {
      feature_name: featureName,
      feature_category: category,
    });
  }
}

export function useAnalyticsScreen(screenName?: string) {
  const pathname = usePathname();
  const screen = screenName || pathname;

  useEffect(() => {
    if (screen) {
      FirebaseAnalyticsService.setScreen(screen);
    }
  }, [screen]);
}

export function useAnalytics() {
  return {
    logEvent: FirebaseAnalyticsService.logEvent.bind(FirebaseAnalyticsService),
    logFeatureUsed: FirebaseAnalyticsService.logFeatureUsed.bind(FirebaseAnalyticsService),
    logPermissionRequest: FirebaseAnalyticsService.logPermissionRequest.bind(FirebaseAnalyticsService),
    logPermissionResult: FirebaseAnalyticsService.logPermissionResult.bind(FirebaseAnalyticsService),
    logProductNotFound: FirebaseAnalyticsService.logProductNotFound.bind(FirebaseAnalyticsService),
    logProductViewed: FirebaseAnalyticsService.logProductViewed.bind(FirebaseAnalyticsService),
    logScanCompleted: FirebaseAnalyticsService.logScanCompleted.bind(FirebaseAnalyticsService),
    logScanStarted: FirebaseAnalyticsService.logScanStarted.bind(FirebaseAnalyticsService),
    setScreen: FirebaseAnalyticsService.setScreen.bind(FirebaseAnalyticsService),
  };
}