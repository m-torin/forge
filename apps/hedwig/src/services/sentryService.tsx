import React, { type ErrorInfo } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import * as Sentry from 'sentry-expo';

import { ConstantsService } from './constantsService';

export class SentryService {
  private static isInitialized = false;

  /**
   * Initialize Sentry error tracking
   */
  static initialize(dsn?: string): void {
    if (this.isInitialized) return;
    
    const isDevelopment = ConstantsService.isDevelopment();
    const appInfo = ConstantsService.getAppInfo();
    const deviceInfo = ConstantsService.getDeviceInfo();

    Sentry.init({
      beforeSend: (event, _hint) => {
        // Filter out development errors if needed
        if (isDevelopment && event.exception) {
          console.log('Sentry Event:', event);
        }
        
        // Add custom context
        event.contexts = {
          ...event.contexts,
          app: {
            bundle_id: appInfo.bundleIdentifier,
            app_name: appInfo.name,
            app_build: appInfo.buildVersion,
            app_version: appInfo.version,
            expo_version: appInfo.expoVersion,
            sdk_version: appInfo.sdkVersion,
          },
          device: {
            os_name: deviceInfo.osName,
            brand: deviceInfo.brand,
            memory: deviceInfo.totalMemory,
            model: deviceInfo.modelName,
            os_version: deviceInfo.osVersion,
            year_class: deviceInfo.deviceYearClass,
          },
        };
        
        return event;
      },
      debug: isDevelopment,
      dist: appInfo.buildVersion,
      dsn: dsn || process.env.SENTRY_DSN || 'YOUR_SENTRY_DSN',
      enableInExpoDevelopment: true,
      environment: isDevelopment ? 'development' : 'production',
      integrations: [
        new Sentry.Native.ReactNativeTracing({
          routingInstrumentation: new Sentry.Native.ReactNavigationInstrumentation(),
          tracingOrigins: ['localhost', 'hedwig-app.com', /^\//],
        }),
      ],
      release: `${appInfo.name}@${appInfo.version}+${appInfo.buildVersion}`,
      tracesSampleRate: isDevelopment ? 1.0 : 0.1,
    });

    this.isInitialized = true;
    console.log('Sentry initialized');
  }

  /**
   * Capture exception
   */
  static captureException(error: Error, context?: Record<string, any>): void {
    if (!this.isInitialized) {
      console.error('Sentry not initialized:', error);
      return;
    }

    Sentry.Native.captureException(error, {
      contexts: context,
      tags: {
        source: 'manual',
      },
    });
  }

  /**
   * Capture message
   */
  static captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
    if (!this.isInitialized) {
      console.log('Sentry not initialized:', message);
      return;
    }

    Sentry.Native.captureMessage(message, level);
  }

  /**
   * Add breadcrumb
   */
  static addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
    if (!this.isInitialized) return;
    
    Sentry.Native.addBreadcrumb(breadcrumb);
  }

  /**
   * Set user context
   */
  static setUser(user: Sentry.User | null): void {
    if (!this.isInitialized) return;
    
    Sentry.Native.setUser(user);
  }

  /**
   * Set tags
   */
  static setTags(tags: Record<string, string>): void {
    if (!this.isInitialized) return;
    
    Sentry.Native.setTags(tags);
  }

  /**
   * Set context
   */
  static setContext(key: string, context: Record<string, any> | null): void {
    if (!this.isInitialized) return;
    
    Sentry.Native.setContext(key, context);
  }

  /**
   * Start transaction
   */
  static startTransaction(
    name: string,
    operation: string
  ): Sentry.Transaction | undefined {
    if (!this.isInitialized) return;
    
    return Sentry.Native.startTransaction({
      name,
      op: operation,
    });
  }

  /**
   * Wrap async function with Sentry
   */
  static async withSentry<T>(
    fn: () => Promise<T>,
    operation: string,
    description?: string
  ): Promise<T> {
    const transaction = this.startTransaction(operation, description || operation);
    
    try {
      const result = await fn();
      transaction?.setStatus('ok');
      return result;
    } catch (error) {
      transaction?.setStatus('internal_error');
      this.captureException(error as Error);
      throw error;
    } finally {
      transaction?.finish();
    }
  }

  // Scanner-specific error tracking

  /**
   * Track scan error
   */
  static trackScanError(error: Error, barcode?: string): void {
    this.captureException(error, {
      scan: {
        barcode,
        timestamp: new Date().toISOString(),
      },
    });
    
    this.addBreadcrumb({
      category: 'scanner',
      data: { barcode },
      level: 'error',
      message: 'Scan failed',
    });
  }

  /**
   * Track product lookup error
   */
  static trackProductLookupError(error: Error, barcode: string): void {
    this.captureException(error, {
      product_lookup: {
        barcode,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Track permission error
   */
  static trackPermissionError(permission: string, error?: Error): void {
    const message = `Permission denied: ${permission}`;
    
    if (error) {
      this.captureException(error, {
        permission: {
          type: permission,
          timestamp: new Date().toISOString(),
        },
      });
    } else {
      this.captureMessage(message, 'warning');
    }
  }

  /**
   * Track network error
   */
  static trackNetworkError(error: Error, endpoint?: string): void {
    this.captureException(error, {
      network: {
        endpoint,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Track app crash
   */
  static trackCrash(error: Error): void {
    this.captureException(error, {
      crash: {
        fatal: true,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Performance monitoring
   */
  static measurePerformance(
    operation: string,
    fn: () => void | Promise<void>
  ): void {
    const transaction = this.startTransaction(operation, 'performance');
    const span = transaction?.startChild({
      description: operation,
      op: 'function',
    });

    const start = Date.now();
    
    Promise.resolve(fn())
      .then(() => {
        const duration = Date.now() - start;
        span?.setData('duration', duration);
        span?.setStatus('ok');
      })
      .catch((error) => {
        span?.setStatus('internal_error');
        this.captureException(error);
      })
      .finally(() => {
        span?.finish();
        transaction?.finish();
      });
  }

  /**
   * Clear user data (on logout)
   */
  static clearUser(): void {
    this.setUser(null);
    this.setContext('user', null);
  }

  /**
   * Test Sentry connection
   */
  static testConnection(): void {
    this.captureMessage('Sentry test message from Hedwig', 'info');
    
    // Test error
    try {
      throw new Error('Sentry test error');
    } catch (error) {
      this.captureException(error as Error, {
        test: {
          purpose: 'connection_test',
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
}

// Export Sentry types
export { Breadcrumb, SeverityLevel, Transaction, User } from 'sentry-expo';

// React Error Boundary with Sentry

interface ErrorBoundaryState {
  error: Error | null;
  hasError: boolean;
}

export class SentryErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error; reset: () => void }> },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { error: null, hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error, hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    SentryService.captureException(error, {
      errorBoundary: {
        componentStack: errorInfo.componentStack,
        props: this.props,
      },
    });
  }

  resetError = () => {
    this.setState({ error: null, hasError: false });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} reset={this.resetError} />;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Oops! Something went wrong</Text>
          <Text style={styles.message}>{this.state.error.message}</Text>
          <Button onPress={this.resetError} title="Try Again" />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  message: {
    color: '#666',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});