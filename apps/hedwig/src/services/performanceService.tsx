import React, { useCallback, useEffect, useRef, useState } from 'react';
import { InteractionManager, Platform } from 'react-native';

export interface PerformanceMetrics {
  cpuUsage: number;
  frameRate: number;
  jsFrameRate: number;
  memoryUsage: number;
  renderTime: number;
}

export interface PerformanceOptions {
  enableProfiling?: boolean;
  maxSamples?: number;
  sampleRate?: number;
}

export class PerformanceService {
  private static isMonitoring = false;
  private static metrics: PerformanceMetrics[] = [];
  private static frameCallbackId: number | null = null;
  private static lastFrameTime = 0;
  private static frameCount = 0;
  private static startTime = 0;
  
  // Performance thresholds
  private static readonly FRAME_RATE_THRESHOLD = 55; // Below 55 FPS is considered poor
  private static readonly MEMORY_THRESHOLD = 100; // 100MB
  private static readonly RENDER_TIME_THRESHOLD = 16.67; // 60 FPS target

  /**
   * Start performance monitoring
   */
  static startMonitoring(options: PerformanceOptions = {}): void {
    if (this.isMonitoring || Platform.OS !== 'ios') return;

    this.isMonitoring = true;
    this.startTime = performance.now();
    this.lastFrameTime = this.startTime;

    // Monitor frame rate
    this.monitorFrameRate();

    console.log('Performance monitoring started');
  }

  /**
   * Stop performance monitoring
   */
  static stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;

    if (this.frameCallbackId !== null) {
      cancelAnimationFrame(this.frameCallbackId);
      this.frameCallbackId = null;
    }

    console.log('Performance monitoring stopped');
  }

  /**
   * Monitor frame rate
   */
  private static monitorFrameRate(): void {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    
    this.frameCount++;

    // Calculate FPS every second
    if (currentTime - this.startTime >= 1000) {
      const fps = (this.frameCount * 1000) / (currentTime - this.startTime);
      
      // Store metrics
      this.metrics.push({
        cpuUsage: 0, // CPU usage not directly available
        frameRate: fps,
        jsFrameRate: fps, // In React Native, JS and UI frame rates are coupled
        memoryUsage: this.getMemoryUsage(),
        renderTime: deltaTime,
      });

      // Reset counters
      this.frameCount = 0;
      this.startTime = currentTime;

      // Check performance issues
      if (fps < this.FRAME_RATE_THRESHOLD) {
        console.warn(`Low frame rate detected: ${fps.toFixed(2)} FPS`);
      }
    }

    this.lastFrameTime = currentTime;

    // Continue monitoring
    this.frameCallbackId = requestAnimationFrame(() => this.monitorFrameRate());
  }

  /**
   * Get memory usage (approximation)
   */
  private static getMemoryUsage(): number {
    // In React Native, we can't directly access memory usage
    // This is a placeholder that would need native module implementation
    return 0;
  }

  /**
   * Get latest metrics
   */
  static getLatestMetrics(): PerformanceMetrics | null {
    return this.metrics[this.metrics.length - 1] || null;
  }

  /**
   * Get average metrics
   */
  static getAverageMetrics(): PerformanceMetrics | null {
    if (this.metrics.length === 0) return null;

    const sum = this.metrics.reduce(
      (acc, metric) => ({
        cpuUsage: acc.cpuUsage + metric.cpuUsage,
        frameRate: acc.frameRate + metric.frameRate,
        jsFrameRate: acc.jsFrameRate + metric.jsFrameRate,
        memoryUsage: acc.memoryUsage + metric.memoryUsage,
        renderTime: acc.renderTime + metric.renderTime,
      }),
      {
        cpuUsage: 0,
        frameRate: 0,
        jsFrameRate: 0,
        memoryUsage: 0,
        renderTime: 0,
      }
    );

    const count = this.metrics.length;
    return {
      cpuUsage: sum.cpuUsage / count,
      frameRate: sum.frameRate / count,
      jsFrameRate: sum.jsFrameRate / count,
      memoryUsage: sum.memoryUsage / count,
      renderTime: sum.renderTime / count,
    };
  }

  /**
   * Clear metrics
   */
  static clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Run after interactions
   */
  static runAfterInteractions(callback: () => void): void {
    InteractionManager.runAfterInteractions(callback);
  }

  /**
   * Create interaction handle
   */
  static createInteractionHandle(): any {
    return InteractionManager.createInteractionHandle();
  }

  /**
   * Clear interaction handle
   */
  static clearInteractionHandle(handle: any): void {
    InteractionManager.clearInteractionHandle(handle);
  }

  /**
   * Schedule high priority work
   */
  static scheduleWork(callback: () => void, priority: 'immediate' | 'high' | 'normal' | 'low' = 'normal'): void {
    switch (priority) {
      case 'immediate':
        callback();
        break;
      case 'high':
        setImmediate(callback);
        break;
      case 'normal':
        setTimeout(callback, 0);
        break;
      case 'low':
        InteractionManager.runAfterInteractions(callback);
        break;
    }
  }

  /**
   * Batch updates
   */
  static batchUpdates<T>(updates: (() => void)[]): void {
    InteractionManager.runAfterInteractions(() => {
      updates.forEach(update => update());
    });
  }

  /**
   * Defer expensive operation
   */
  static defer<T>(operation: () => T): Promise<T> {
    return new Promise((resolve) => {
      InteractionManager.runAfterInteractions(() => {
        resolve(operation());
      });
    });
  }

  /**
   * Performance-optimized setState
   */
  static optimizedSetState<T>(
    setState: React.Dispatch<React.SetStateAction<T>>,
    newState: T | ((prevState: T) => T)
  ): void {
    InteractionManager.runAfterInteractions(() => {
      setState(newState);
    });
  }
}

// React hooks

/**
 * Hook for deferred value (similar to React 18's useDeferredValue)
 */
export function useDeferredValue<T>(value: T, delay = 200): T {
  const [deferredValue, setDeferredValue] = useState(value);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDeferredValue(value);
    }, delay);

    return () => clearTimeout(handle);
  }, [value, delay]);

  return deferredValue;
}

/**
 * Hook for performance monitoring
 */
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    PerformanceService.startMonitoring();

    intervalRef.current = setInterval(() => {
      const latestMetrics = PerformanceService.getLatestMetrics();
      if (latestMetrics) {
        setMetrics(latestMetrics);
      }
    }, 1000);

    return () => {
      PerformanceService.stopMonitoring();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return metrics;
}

/**
 * Hook for interaction management
 */
export function useInteractionManager() {
  const [isReady, setIsReady] = useState(false);
  const handleRef = useRef<any>(null);

  useEffect(() => {
    const runAfterInteractions = InteractionManager.runAfterInteractions(() => {
      setIsReady(true);
    });

    return () => runAfterInteractions.cancel();
  }, []);

  const createHandle = useCallback(() => {
    if (handleRef.current) {
      InteractionManager.clearInteractionHandle(handleRef.current);
    }
    handleRef.current = InteractionManager.createInteractionHandle();
    setIsReady(false);
  }, []);

  const clearHandle = useCallback(() => {
    if (handleRef.current) {
      InteractionManager.clearInteractionHandle(handleRef.current);
      handleRef.current = null;
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (handleRef.current) {
        InteractionManager.clearInteractionHandle(handleRef.current);
      }
    };
  }, []);

  return {
    clearHandle,
    createHandle,
    isReady,
  };
}

/**
 * Hook for expensive operations
 */
export function useExpensiveOperation<T>(
  operation: () => T,
  dependencies: React.DependencyList = []
): { result: T | null; isLoading: boolean } {
  const [result, setResult] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
    const handle = InteractionManager.runAfterInteractions(async () => {
      try {
        const res = await Promise.resolve(operation());
        setResult(res);
      } finally {
        setIsLoading(false);
      }
    });

    return () => handle.cancel();
  }, dependencies);

  return { isLoading, result };
}

/**
 * Hook for batched updates
 */
export function useBatchedUpdates() {
  const updatesRef = useRef<(() => void)[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const batchUpdate = useCallback((update: () => void) => {
    updatesRef.current.push(update);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      InteractionManager.runAfterInteractions(() => {
        const updates = [...updatesRef.current];
        updatesRef.current = [];
        updates.forEach(update => update());
      });
    }, 0);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return batchUpdate;
}

/**
 * HOC for performance optimization
 */
export function withPerformanceOptimization<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    deferRender?: boolean;
    monitorPerformance?: boolean;
  }
): React.ComponentType<P> {
  return (props: P) => {
    const { isReady } = useInteractionManager();
    const metrics = options?.monitorPerformance ? usePerformanceMonitor() : null;

    if (options?.deferRender && !isReady) {
      return null; // Or a loading placeholder
    }

    if (metrics && metrics.frameRate < PerformanceService['FRAME_RATE_THRESHOLD']) {
      console.warn('Poor performance detected in component');
    }

    return <Component {...props} />;
  };
}

// Optimized list rendering helper
export interface OptimizedListProps<T> {
  batchSize?: number;
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => React.ReactElement;
}

export function OptimizedList<T>({
  batchSize = 10,
  data,
  keyExtractor,
  renderItem,
}: OptimizedListProps<T>) {
  const [visibleItems, setVisibleItems] = useState<T[]>([]);
  const [currentBatch, setCurrentBatch] = useState(0);

  useEffect(() => {
    const loadBatch = () => {
      const start = currentBatch * batchSize;
      const end = Math.min(start + batchSize, data.length);
      const newItems = data.slice(0, end);
      setVisibleItems(newItems);

      if (end < data.length) {
        InteractionManager.runAfterInteractions(() => {
          setCurrentBatch(currentBatch + 1);
        });
      }
    };

    loadBatch();
  }, [data, currentBatch, batchSize]);

  return (
    <>
      {visibleItems.map((item, index) => (
        <React.Fragment key={keyExtractor(item, index)}>
          {renderItem(item, index)}
        </React.Fragment>
      ))}
    </>
  );
}

