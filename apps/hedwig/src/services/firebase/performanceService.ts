import {
  getPerformance,
  isSupported,
  type Performance,
  trace,
  type Trace,
} from 'firebase/performance';
// React hooks
import { useCallback, useRef } from 'react';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { app } from '../../config/firebase';
import { SentryService } from '../sentryService';

export interface PerformanceTrace {
  attributes: Record<string, string>;
  metrics: Record<string, number>;
  name: string;
  startTime: number;
}

export class FirebasePerformanceService {
  private static performance: Performance | null = null;
  private static traces = new Map<string, Trace>();
  private static customTraces = new Map<string, PerformanceTrace>();
  private static isInitialized = false;

  /**
   * Initialize Performance Monitoring
   */
  static async initialize(): Promise<void> {
    try {
      if (Platform.OS !== 'web') {
        console.log('Firebase Performance not available for React Native in web SDK');
        this.isInitialized = true;
        return;
      }

      const supported = await isSupported();
      if (supported) {
        this.performance = getPerformance(app);
        this.isInitialized = true;
        console.log('Firebase Performance Monitoring initialized');
      } else {
        console.log('Firebase Performance not supported in this environment');
      }
    } catch (error) {
      SentryService.captureException(error as Error);
      console.error('Failed to initialize Performance Monitoring:', error);
    }
  }

  /**
   * Start a trace
   */
  static startTrace(traceName: string): void {
    if (!this.isInitialized) return;

    try {
      if (this.performance) {
        // Firebase Performance trace
        const firebaseTrace = trace(this.performance, traceName);
        firebaseTrace.start();
        this.traces.set(traceName, firebaseTrace);
      } else {
        // Custom trace for React Native
        this.customTraces.set(traceName, {
          name: traceName,
          attributes: {},
          metrics: {},
          startTime: performance.now(),
        });
      }
    } catch (error) {
      console.error(`Failed to start trace ${traceName}:`, error);
    }
  }

  /**
   * Stop a trace
   */
  static stopTrace(traceName: string): void {
    if (!this.isInitialized) return;

    try {
      if (this.performance) {
        // Firebase Performance trace
        const firebaseTrace = this.traces.get(traceName);
        if (firebaseTrace) {
          firebaseTrace.stop();
          this.traces.delete(traceName);
        }
      } else {
        // Custom trace
        const customTrace = this.customTraces.get(traceName);
        if (customTrace) {
          const duration = performance.now() - customTrace.startTime;
          
          // Log to Sentry
          SentryService.measurePerformance(traceName, () => {
            console.log(`Trace ${traceName} completed in ${duration}ms`);
          });
          
          this.customTraces.delete(traceName);
        }
      }
    } catch (error) {
      console.error(`Failed to stop trace ${traceName}:`, error);
    }
  }

  /**
   * Record a trace with automatic timing
   */
  static async recordTrace<T>(
    traceName: string,
    operation: () => T | Promise<T>
  ): Promise<T> {
    this.startTrace(traceName);
    
    try {
      const result = await operation();
      return result;
    } finally {
      this.stopTrace(traceName);
    }
  }

  /**
   * Set trace attribute
   */
  static setTraceAttribute(
    traceName: string,
    attributeName: string,
    value: string
  ): void {
    if (!this.isInitialized) return;

    try {
      if (this.performance) {
        const firebaseTrace = this.traces.get(traceName);
        if (firebaseTrace) {
          firebaseTrace.putAttribute(attributeName, value);
        }
      } else {
        const customTrace = this.customTraces.get(traceName);
        if (customTrace) {
          customTrace.attributes[attributeName] = value;
        }
      }
    } catch (error) {
      console.error(`Failed to set attribute for trace ${traceName}:`, error);
    }
  }

  /**
   * Set trace metric
   */
  static setTraceMetric(
    traceName: string,
    metricName: string,
    value: number
  ): void {
    if (!this.isInitialized) return;

    try {
      if (this.performance) {
        const firebaseTrace = this.traces.get(traceName);
        if (firebaseTrace) {
          firebaseTrace.putMetric(metricName, value);
        }
      } else {
        const customTrace = this.customTraces.get(traceName);
        if (customTrace) {
          customTrace.metrics[metricName] = value;
        }
      }
    } catch (error) {
      console.error(`Failed to set metric for trace ${traceName}:`, error);
    }
  }

  /**
   * Increment trace metric
   */
  static incrementTraceMetric(
    traceName: string,
    metricName: string,
    value = 1
  ): void {
    if (!this.isInitialized) return;

    try {
      if (this.performance) {
        const firebaseTrace = this.traces.get(traceName);
        if (firebaseTrace) {
          firebaseTrace.incrementMetric(metricName, value);
        }
      } else {
        const customTrace = this.customTraces.get(traceName);
        if (customTrace) {
          customTrace.metrics[metricName] = 
            (customTrace.metrics[metricName] || 0) + value;
        }
      }
    } catch (error) {
      console.error(`Failed to increment metric for trace ${traceName}:`, error);
    }
  }

  // Predefined traces for Hedwig app

  /**
   * Trace barcode scanning performance
   */
  static async traceBarcodeScanning<T>(
    operation: () => T | Promise<T>,
    attributes?: {
      scanType?: 'camera' | 'image';
      barcodeType?: string;
    }
  ): Promise<T> {
    const traceName = 'barcode_scanning';
    this.startTrace(traceName);
    
    if (attributes?.scanType) {
      this.setTraceAttribute(traceName, 'scan_type', attributes.scanType);
    }
    if (attributes?.barcodeType) {
      this.setTraceAttribute(traceName, 'barcode_type', attributes.barcodeType);
    }
    
    try {
      const result = await operation();
      this.setTraceAttribute(traceName, 'success', 'true');
      return result;
    } catch (error) {
      this.setTraceAttribute(traceName, 'success', 'false');
      throw error;
    } finally {
      this.stopTrace(traceName);
    }
  }

  /**
   * Trace product lookup performance
   */
  static async traceProductLookup<T>(
    operation: () => T | Promise<T>,
    attributes?: {
      barcode?: string;
      source?: 'cache' | 'api';
    }
  ): Promise<T> {
    const traceName = 'product_lookup';
    this.startTrace(traceName);
    
    if (attributes?.barcode) {
      this.setTraceAttribute(traceName, 'barcode', attributes.barcode);
    }
    if (attributes?.source) {
      this.setTraceAttribute(traceName, 'source', attributes.source);
    }
    
    try {
      const result = await operation();
      this.setTraceAttribute(traceName, 'found', 'true');
      return result;
    } catch (error) {
      this.setTraceAttribute(traceName, 'found', 'false');
      throw error;
    } finally {
      this.stopTrace(traceName);
    }
  }

  /**
   * Trace image processing performance
   */
  static async traceImageProcessing<T>(
    operation: () => T | Promise<T>,
    attributes?: {
      imageSize?: number;
      operation?: string;
    }
  ): Promise<T> {
    const traceName = 'image_processing';
    this.startTrace(traceName);
    
    if (attributes?.imageSize) {
      this.setTraceMetric(traceName, 'image_size_bytes', attributes.imageSize);
    }
    if (attributes?.operation) {
      this.setTraceAttribute(traceName, 'operation', attributes.operation);
    }
    
    return this.recordTrace(traceName, operation);
  }

  /**
   * Trace database operation
   */
  static async traceDatabaseOperation<T>(
    operation: () => T | Promise<T>,
    operationType: 'read' | 'write' | 'query',
    collection?: string
  ): Promise<T> {
    const traceName = `db_${operationType}`;
    this.startTrace(traceName);
    
    this.setTraceAttribute(traceName, 'operation_type', operationType);
    if (collection) {
      this.setTraceAttribute(traceName, 'collection', collection);
    }
    
    try {
      const result = await operation();
      return result;
    } finally {
      this.stopTrace(traceName);
    }
  }

  /**
   * Trace network request
   */
  static async traceNetworkRequest<T>(
    operation: () => T | Promise<T>,
    attributes?: {
      url?: string;
      method?: string;
      responseSize?: number;
    }
  ): Promise<T> {
    const traceName = 'network_request';
    this.startTrace(traceName);
    
    if (attributes?.url) {
      this.setTraceAttribute(traceName, 'url', attributes.url);
    }
    if (attributes?.method) {
      this.setTraceAttribute(traceName, 'method', attributes.method);
    }
    
    try {
      const result = await operation();
      
      if (attributes?.responseSize) {
        this.setTraceMetric(traceName, 'response_size_bytes', attributes.responseSize);
      }
      
      return result;
    } finally {
      this.stopTrace(traceName);
    }
  }

  /**
   * Trace app startup
   */
  static traceAppStartup(): void {
    this.startTrace('app_startup');
  }

  /**
   * Complete app startup trace
   */
  static completeAppStartup(): void {
    this.stopTrace('app_startup');
  }

  /**
   * Trace screen render
   */
  static async traceScreenRender<T>(
    screenName: string,
    operation: () => T | Promise<T>
  ): Promise<T> {
    const traceName = `screen_render_${screenName}`;
    return this.recordTrace(traceName, operation);
  }
}

export function usePerformanceTrace(traceName: string) {
  const isTracing = useRef(false);

  const startTrace = useCallback(() => {
    if (!isTracing.current) {
      FirebasePerformanceService.startTrace(traceName);
      isTracing.current = true;
    }
  }, [traceName]);

  const stopTrace = useCallback(() => {
    if (isTracing.current) {
      FirebasePerformanceService.stopTrace(traceName);
      isTracing.current = false;
    }
  }, [traceName]);

  const setAttribute = useCallback((name: string, value: string) => {
    FirebasePerformanceService.setTraceAttribute(traceName, name, value);
  }, [traceName]);

  const setMetric = useCallback((name: string, value: number) => {
    FirebasePerformanceService.setTraceMetric(traceName, name, value);
  }, [traceName]);

  const incrementMetric = useCallback((name: string, value = 1) => {
    FirebasePerformanceService.incrementTraceMetric(traceName, name, value);
  }, [traceName]);

  // Auto-stop on unmount
  useEffect(() => {
    return () => {
      if (isTracing.current) {
        stopTrace();
      }
    };
  }, [stopTrace]);

  return {
    incrementMetric,
    setAttribute,
    setMetric,
    startTrace,
    stopTrace,
  };
}

export function useAutoTrace(traceName: string, dependencies: React.DependencyList = []) {
  const trace = usePerformanceTrace(traceName);

  useEffect(() => {
    trace.startTrace();
    return trace.stopTrace;
  }, dependencies);

  return trace;
}