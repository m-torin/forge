/**
 * Simplified Lifecycle Monitoring for AI Operations
 * Basic monitoring without complex lifecycle hooks
 */

import { logError, logInfo } from '@repo/observability';

// Simple performance tracking
const performanceMetrics = new Map<
  string,
  {
    startTime: number;
    endTime?: number;
    duration?: number;
    status: 'running' | 'completed' | 'error';
  }
>();

export interface MonitoringOptions {
  operationId: string;
  operationType: 'generation' | 'tool-call' | 'completion';
  metadata?: Record<string, any>;
}

// Simple lifecycle monitoring functions
export const lifecycleMonitoring = {
  start: (options: MonitoringOptions) => {
    const { operationId, operationType, metadata } = options;
    performanceMetrics.set(operationId, {
      startTime: Date.now(),
      status: 'running',
    });

    logInfo(`Started ${operationType}`, { operationId, metadata });
  },

  complete: (operationId: string, result?: any) => {
    const metric = performanceMetrics.get(operationId);
    if (metric) {
      const endTime = Date.now();
      metric.endTime = endTime;
      metric.duration = endTime - metric.startTime;
      metric.status = 'completed';

      logInfo('Operation completed', {
        operationId,
        duration: metric.duration,
        result: result ? 'success' : 'no-result',
      });
    }
  },

  error: (operationId: string, error: Error) => {
    const metric = performanceMetrics.get(operationId);
    if (metric) {
      metric.endTime = Date.now();
      metric.duration = metric.endTime - metric.startTime;
      metric.status = 'error';
    }

    logError('Operation failed', { operationId, error });
  },

  getMetrics: (operationId: string) => {
    return performanceMetrics.get(operationId);
  },

  getAllMetrics: () => {
    return Array.from(performanceMetrics.entries()).map(([id, metric]) => ({
      operationId: id,
      ...metric,
    }));
  },

  cleanup: (operationId: string) => {
    performanceMetrics.delete(operationId);
  },
};

// Simple hook-like functions for AI operations
export const createSimpleMonitor = (operationType: MonitoringOptions['operationType']) => {
  return {
    start: (operationId: string, metadata?: Record<string, any>) => {
      lifecycleMonitoring.start({ operationId, operationType, metadata });
    },
    complete: (operationId: string, result?: any) => {
      lifecycleMonitoring.complete(operationId, result);
    },
    error: (operationId: string, error: Error) => {
      lifecycleMonitoring.error(operationId, error);
    },
  };
};

// Export specific monitors for different AI operations
export const generationMonitor = createSimpleMonitor('generation');
export const toolCallMonitor = createSimpleMonitor('tool-call');
export const completionMonitor = createSimpleMonitor('completion');

// Export analytics functionality for compatibility
export const LifecycleAnalytics = {
  getMetrics: lifecycleMonitoring.getAllMetrics,
  getMetric: lifecycleMonitoring.getMetrics,
  reset: () => {
    performanceMetrics.clear();
  },
  getInstance: () => ({
    getMetrics: lifecycleMonitoring.getAllMetrics,
    getMetric: lifecycleMonitoring.getMetrics,
    reset: () => performanceMetrics.clear(),
  }),
};
