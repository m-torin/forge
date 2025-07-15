/**
 * Step Factory Performance Monitoring Module
 *
 * Handles performance tracking, metrics collection, and progress reporting
 * for workflow step execution.
 */

import { createServerObservability } from '@repo/observability/shared-env';
import { ProgressState, StepPerformanceData } from './step-types';

/**
 * Add a custom metric to performance data
 */
export function addCustomMetric(
  performance: StepPerformanceData,
  name: string,
  value: number,
): void {
  if (performance.customMetrics instanceof Map) {
    (performance.customMetrics as Map<string, number>).set(name, value);
  }
}

/**
 * Calculate performance statistics from performance data
 */
export function calculatePerformanceStats(performance: StepPerformanceData): {
  cpuSystemDelta?: number;
  cpuUserDelta?: number;
  duration: number;
  memoryDelta?: number;
} {
  const stats: any = {
    duration: performance.duration || 0,
  };

  // Memory statistics
  if (performance.memoryUsage?.before && performance.memoryUsage.after) {
    stats.memoryDelta =
      performance.memoryUsage.after.heapUsed - performance.memoryUsage.before.heapUsed;
  }

  // CPU statistics
  if (performance.cpuUsage?.after) {
    stats.cpuUserDelta = performance.cpuUsage.after.user;
    stats.cpuSystemDelta = performance.cpuUsage.after.system;
  }

  return stats;
}

/**
 * Create a progress reporter function
 */
export function createProgressReporter(
  performance: StepPerformanceData,
  stepId: string,
  enableDetailedLogging = false,
): (current: number, total: number, details?: string) => Promise<void> {
  return async (current: number, total: number, details?: string) => {
    if (performance.progress) {
      performance.progress = {
        current,
        details,
        state: 'in_progress' as ProgressState,
        total,
      };
    }

    if (enableDetailedLogging) {
      // Fire and forget logging
      (async () => {
        try {
          const logger = await createServerObservability({
            providers: {
              console: { enabled: true },
            },
          });
          logger.log('info', `[${stepId}] Progress: ${current}/${total} ${details ?? ''}`);
        } catch {
          // Fallback to console if logger fails
        }
      })();
    }
  };
}

/**
 * Format performance data for logging
 */
export function formatPerformanceData(
  performance: StepPerformanceData,
  includeDetails = false,
): string {
  const stats = calculatePerformanceStats(performance);
  let result = `Duration: ${stats.duration}ms`;

  if (includeDetails) {
    if (stats.memoryDelta !== undefined) {
      const memoryMB = (stats.memoryDelta / 1024 / 1024).toFixed(2);
      result += `, Memory: ${stats.memoryDelta > 0 ? '+' : ''}${memoryMB}MB`;
    }

    if (stats.cpuUserDelta !== undefined && stats.cpuSystemDelta !== undefined) {
      result += `, CPU: ${(stats.cpuUserDelta / 1000).toFixed(1)}ms user, ${(stats.cpuSystemDelta / 1000).toFixed(1)}ms system`;
    }

    if (performance.customMetrics && performance.customMetrics.size > 0) {
      const metrics = Array.from(performance.customMetrics.entries())
        .map(([name, value]: any) => `${name}: ${value}`)
        .join(', ');
      result += `, Metrics: {${metrics}}`;
    }
  }

  return result;
}

/**
 * Initialize performance monitoring data
 */
export function initializePerformanceData(enableMonitoring = true): StepPerformanceData {
  const startTime = Date.now();

  return {
    cpuUsage: enableMonitoring ? { before: process.cpuUsage() } : undefined,
    customMetrics: new Map(),
    memoryUsage: enableMonitoring ? { before: process.memoryUsage() } : undefined,
    progress: {
      current: 0,
      state: 'pending' as ProgressState,
      total: 100,
    },
    startTime,
  };
}

/**
 * Update performance monitoring data with end metrics
 */
export function updatePerformanceData(
  performance: StepPerformanceData,
  enableMonitoring = true,
): void {
  if (!enableMonitoring) return;

  performance.endTime = Date.now();
  performance.duration = performance.endTime - performance.startTime;

  // Update memory usage metrics
  if (performance.memoryUsage?.before) {
    performance.memoryUsage.after = process.memoryUsage();
    performance.memoryUsage.peak = Math.max(
      performance.memoryUsage.before.heapUsed,
      performance.memoryUsage.after.heapUsed,
    );
  }

  // Update CPU usage metrics
  if (performance.cpuUsage?.before) {
    performance.cpuUsage.after = process.cpuUsage(performance.cpuUsage.before);
  }

  // Update progress to completed
  if (performance.progress) {
    performance.progress.state = 'completed';
    performance.progress.current = performance.progress.total;
  }
}

/**
 * Create a performance monitor instance
 */
export function createPerformanceMonitor() {
  return {
    startTime: Date.now(),
    metrics: new Map<string, number>(),
    
    record(name: string, value: number) {
      this.metrics.set(name, value);
    },
    
    getMetrics() {
      return Object.fromEntries(this.metrics);
    },
    
    reset() {
      this.startTime = Date.now();
      this.metrics.clear();
    }
  };
}

/**
 * Measure step execution with performance tracking
 */
export function measureStepExecution<T = any>(
  stepFn: () => Promise<T> | T,
  options?: { enableMonitoring?: boolean; stepId?: string }
): Promise<{ result: T; performance: StepPerformanceData }> {
  return new Promise(async (resolve, reject) => {
    const performance = initializePerformanceData(options?.enableMonitoring);
    
    try {
      const result = await stepFn();
      updatePerformanceData(performance, options?.enableMonitoring);
      resolve({ result, performance });
    } catch (error) {
      updatePerformanceData(performance, options?.enableMonitoring);
      reject(error);
    }
  });
}

/**
 * Get performance metrics for a step
 */
export function getPerformanceMetrics(performance: StepPerformanceData) {
  return {
    duration: performance.duration || 0,
    memoryDelta: performance.memoryUsage?.after && performance.memoryUsage?.before
      ? performance.memoryUsage.after.heapUsed - performance.memoryUsage.before.heapUsed
      : 0,
    cpuUser: performance.cpuUsage?.after?.user || 0,
    cpuSystem: performance.cpuUsage?.after?.system || 0,
    customMetrics: performance.customMetrics ? Object.fromEntries(performance.customMetrics) : {},
    progress: performance.progress || { current: 0, total: 100, state: 'pending' as ProgressState }
  };
}
