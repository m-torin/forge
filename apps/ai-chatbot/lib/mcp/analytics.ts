/**
 * MCP Analytics and Telemetry System
 * Production-grade monitoring for MCP operations with observability integration
 */

import { logError, logInfo, logWarn } from '@repo/observability';
import type { FeatureFlagContext } from '../feature-flags/config';

/**
 * MCP Operation Types for analytics tracking
 */
export type McpOperationType =
  | 'tool_execution'
  | 'connection_established'
  | 'connection_failed'
  | 'stream_lifecycle'
  | 'error_recovery'
  | 'feature_flag_evaluation'
  | 'configuration_update'
  | 'health_check'
  | 'fallback_activated';

/**
 * MCP Analytics Event Interface
 */
export interface McpAnalyticsEvent {
  operationType: McpOperationType;
  timestamp: number;
  userId?: string;
  sessionId?: string;
  clientType: 'enhanced' | 'demo' | 'mock';
  metadata: {
    toolName?: string;
    executionTime?: number;
    success: boolean;
    errorType?: string;
    errorMessage?: string;
    featureFlags?: Record<string, boolean>;
    connectionId?: string;
    streamId?: string;
    recoveryAttempts?: number;
    contextSize?: number;
    [key: string]: any;
  };
}

/**
 * MCP Usage Metrics Interface
 */
export interface McpUsageMetrics {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageExecutionTime: number;
  toolUsageCount: Record<string, number>;
  errorsByType: Record<string, number>;
  clientTypeDistribution: Record<string, number>;
  featureFlagUsage: Record<string, number>;
  connectionHealth: {
    activeConnections: number;
    failedConnections: number;
    recoverySuccessRate: number;
  };
  performanceMetrics: {
    p50ExecutionTime: number;
    p95ExecutionTime: number;
    p99ExecutionTime: number;
    slowestOperations: Array<{
      operation: string;
      duration: number;
      timestamp: number;
    }>;
  };
}

/**
 * Analytics Configuration
 */
export interface McpAnalyticsConfig {
  enableTelemetry: boolean;
  batchSize: number;
  flushInterval: number; // milliseconds
  retentionPeriod: number; // days
  enablePerformanceTracking: boolean;
  enableErrorTracking: boolean;
  sensitiveDataFilters: string[];
}

/**
 * Default analytics configuration
 */
const DEFAULT_ANALYTICS_CONFIG: McpAnalyticsConfig = {
  enableTelemetry: true,
  batchSize: 50,
  flushInterval: 30000, // 30 seconds
  retentionPeriod: 30, // 30 days
  enablePerformanceTracking: true,
  enableErrorTracking: true,
  sensitiveDataFilters: ['password', 'token', 'key', 'secret', 'auth', 'credential'],
};

/**
 * MCP Analytics Service
 */
export class McpAnalyticsService {
  private events: McpAnalyticsEvent[] = [];
  private metrics: Partial<McpUsageMetrics> = {};
  private flushTimer: NodeJS.Timeout | null = null;
  private executionTimes: number[] = [];

  constructor(private config: McpAnalyticsConfig = DEFAULT_ANALYTICS_CONFIG) {
    if (this.config.enableTelemetry) {
      this.startFlushTimer();
    }
  }

  /**
   * Track an MCP operation event
   */
  trackEvent(event: Omit<McpAnalyticsEvent, 'timestamp'>): void {
    if (!this.config.enableTelemetry) {
      return;
    }

    const sanitizedEvent: McpAnalyticsEvent = {
      ...event,
      timestamp: Date.now(),
      metadata: this.sanitizeMetadata(event.metadata),
    };

    this.events.push(sanitizedEvent);
    this.updateMetrics(sanitizedEvent);

    // Log significant events immediately
    if (!sanitizedEvent.metadata.success || sanitizedEvent.operationType === 'connection_failed') {
      this.logEventImmediately(sanitizedEvent);
    }

    // Flush if batch size reached
    if (this.events.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * Track tool execution with performance metrics
   */
  trackToolExecution(data: {
    toolName: string;
    executionTime: number;
    success: boolean;
    userId?: string;
    sessionId?: string;
    clientType: 'enhanced' | 'demo' | 'mock';
    error?: Error;
    contextSize?: number;
    streamId?: string;
  }): void {
    this.trackEvent({
      operationType: 'tool_execution',
      userId: data.userId,
      sessionId: data.sessionId,
      clientType: data.clientType,
      metadata: {
        toolName: data.toolName,
        executionTime: data.executionTime,
        success: data.success,
        errorType: data.error?.name,
        errorMessage: data.error?.message,
        contextSize: data.contextSize,
        streamId: data.streamId,
      },
    });

    // Track execution times for performance metrics
    if (this.config.enablePerformanceTracking && data.success) {
      this.executionTimes.push(data.executionTime);
      // Keep only last 1000 execution times for performance calculations
      if (this.executionTimes.length > 1000) {
        this.executionTimes = this.executionTimes.slice(-1000);
      }
    }
  }

  /**
   * Track connection events
   */
  trackConnection(data: {
    success: boolean;
    connectionId: string;
    clientType: 'enhanced' | 'demo' | 'mock';
    userId?: string;
    error?: Error;
    executionTime?: number;
  }): void {
    this.trackEvent({
      operationType: data.success ? 'connection_established' : 'connection_failed',
      userId: data.userId,
      clientType: data.clientType,
      metadata: {
        connectionId: data.connectionId,
        success: data.success,
        executionTime: data.executionTime,
        errorType: data.error?.name,
        errorMessage: data.error?.message,
      },
    });
  }

  /**
   * Track stream lifecycle events
   */
  trackStreamLifecycle(data: {
    streamId: string;
    phase: 'started' | 'chunk_received' | 'error' | 'completed';
    userId?: string;
    clientType: 'enhanced' | 'demo' | 'mock';
    duration?: number;
    chunksCount?: number;
    toolCallsCount?: number;
    error?: Error;
  }): void {
    this.trackEvent({
      operationType: 'stream_lifecycle',
      userId: data.userId,
      clientType: data.clientType,
      metadata: {
        streamId: data.streamId,
        phase: data.phase,
        success: data.phase !== 'error',
        duration: data.duration,
        chunksCount: data.chunksCount,
        toolCallsCount: data.toolCallsCount,
        errorType: data.error?.name,
        errorMessage: data.error?.message,
      },
    });
  }

  /**
   * Track error recovery attempts
   */
  trackErrorRecovery(data: {
    operationType: string;
    recoveryAttempts: number;
    success: boolean;
    userId?: string;
    clientType: 'enhanced' | 'demo' | 'mock';
    originalError: Error;
    recoveryStrategy?: string;
  }): void {
    this.trackEvent({
      operationType: 'error_recovery',
      userId: data.userId,
      clientType: data.clientType,
      metadata: {
        originalOperation: data.operationType,
        recoveryAttempts: data.recoveryAttempts,
        success: data.success,
        errorType: data.originalError.name,
        errorMessage: data.originalError.message,
        recoveryStrategy: data.recoveryStrategy,
      },
    });
  }

  /**
   * Track feature flag evaluations
   */
  trackFeatureFlagEvaluation(data: {
    flagKey: string;
    result: boolean;
    userId?: string;
    context?: FeatureFlagContext;
    evaluationTime?: number;
  }): void {
    this.trackEvent({
      operationType: 'feature_flag_evaluation',
      userId: data.userId,
      clientType: data.result ? 'enhanced' : 'mock', // Simplified mapping
      metadata: {
        flagKey: data.flagKey,
        result: data.result,
        success: true,
        evaluationTime: data.evaluationTime,
        contextKeys: data.context ? Object.keys(data.context) : [],
      },
    });
  }

  /**
   * Get current usage metrics
   */
  getUsageMetrics(): McpUsageMetrics {
    const totalOperations = this.events.length;
    const successfulOperations = this.events.filter(e => e.metadata.success).length;
    const failedOperations = totalOperations - successfulOperations;

    // Calculate execution times
    const executionTimes = this.events
      .filter(e => e.metadata.executionTime !== undefined)
      .map(e => e.metadata.executionTime as number)
      .sort((a, b) => a - b);

    const averageExecutionTime =
      executionTimes.length > 0
        ? executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length
        : 0;

    // Performance percentiles
    const p50ExecutionTime = executionTimes[Math.floor(executionTimes.length * 0.5)] || 0;
    const p95ExecutionTime = executionTimes[Math.floor(executionTimes.length * 0.95)] || 0;
    const p99ExecutionTime = executionTimes[Math.floor(executionTimes.length * 0.99)] || 0;

    // Tool usage count
    const toolUsageCount: Record<string, number> = {};
    this.events.forEach(event => {
      if (event.operationType === 'tool_execution' && event.metadata.toolName) {
        toolUsageCount[event.metadata.toolName] =
          (toolUsageCount[event.metadata.toolName] || 0) + 1;
      }
    });

    // Errors by type
    const errorsByType: Record<string, number> = {};
    this.events
      .filter(e => !e.metadata.success && e.metadata.errorType)
      .forEach(event => {
        const errorType = event.metadata.errorType as string;
        errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
      });

    // Client type distribution
    const clientTypeDistribution: Record<string, number> = {};
    this.events.forEach(event => {
      clientTypeDistribution[event.clientType] =
        (clientTypeDistribution[event.clientType] || 0) + 1;
    });

    // Feature flag usage
    const featureFlagUsage: Record<string, number> = {};
    this.events
      .filter(e => e.operationType === 'feature_flag_evaluation')
      .forEach(event => {
        const flagKey = event.metadata.flagKey as string;
        if (flagKey) {
          featureFlagUsage[flagKey] = (featureFlagUsage[flagKey] || 0) + 1;
        }
      });

    // Connection health
    const connectionEvents = this.events.filter(
      e => e.operationType === 'connection_established' || e.operationType === 'connection_failed',
    );
    const activeConnections = connectionEvents.filter(
      e => e.operationType === 'connection_established',
    ).length;
    const failedConnections = connectionEvents.filter(
      e => e.operationType === 'connection_failed',
    ).length;

    const recoveryEvents = this.events.filter(e => e.operationType === 'error_recovery');
    const successfulRecoveries = recoveryEvents.filter(e => e.metadata.success).length;
    const recoverySuccessRate =
      recoveryEvents.length > 0 ? successfulRecoveries / recoveryEvents.length : 1;

    // Slowest operations
    const slowestOperations = this.events
      .filter(e => e.metadata.executionTime !== undefined)
      .sort((a, b) => (b.metadata.executionTime as number) - (a.metadata.executionTime as number))
      .slice(0, 10)
      .map(e => ({
        operation: e.operationType,
        duration: e.metadata.executionTime as number,
        timestamp: e.timestamp,
      }));

    return {
      totalOperations,
      successfulOperations,
      failedOperations,
      averageExecutionTime,
      toolUsageCount,
      errorsByType,
      clientTypeDistribution,
      featureFlagUsage,
      connectionHealth: {
        activeConnections,
        failedConnections,
        recoverySuccessRate,
      },
      performanceMetrics: {
        p50ExecutionTime,
        p95ExecutionTime,
        p99ExecutionTime,
        slowestOperations,
      },
    };
  }

  /**
   * Export analytics data for external analysis
   */
  exportAnalyticsData(options?: {
    startDate?: Date;
    endDate?: Date;
    operationTypes?: McpOperationType[];
    clientTypes?: string[];
  }): {
    events: McpAnalyticsEvent[];
    metrics: McpUsageMetrics;
    exportTimestamp: number;
  } {
    let filteredEvents = [...this.events];

    if (options?.startDate) {
      const startTime = options.startDate.getTime();
      filteredEvents = filteredEvents.filter(e => e.timestamp >= startTime);
    }

    if (options?.endDate) {
      const endTime = options.endDate.getTime();
      filteredEvents = filteredEvents.filter(e => e.timestamp <= endTime);
    }

    if (options?.operationTypes) {
      const operationTypes = options.operationTypes;
      filteredEvents = filteredEvents.filter(e => operationTypes.includes(e.operationType));
    }

    if (options?.clientTypes) {
      const clientTypes = options.clientTypes;
      filteredEvents = filteredEvents.filter(e => clientTypes.includes(e.clientType));
    }

    return {
      events: filteredEvents,
      metrics: this.getUsageMetrics(),
      exportTimestamp: Date.now(),
    };
  }

  /**
   * Clear old events based on retention policy
   */
  cleanupOldEvents(): void {
    const cutoffTime = Date.now() - this.config.retentionPeriod * 24 * 60 * 60 * 1000;
    const originalLength = this.events.length;
    this.events = this.events.filter(event => event.timestamp > cutoffTime);

    const removedCount = originalLength - this.events.length;
    if (removedCount > 0) {
      logInfo('MCP Analytics: Cleaned up old events', {
        operation: 'analytics_cleanup',
        metadata: {
          removedEvents: removedCount,
          remainingEvents: this.events.length,
          cutoffTime: new Date(cutoffTime).toISOString(),
        },
      });
    }
  }

  /**
   * Destroy the analytics service and cleanup resources
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush(); // Final flush before destruction
  }

  /**
   * Start the automatic flush timer
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
      this.cleanupOldEvents();
    }, this.config.flushInterval);
  }

  /**
   * Flush accumulated events to observability system
   */
  private flush(): void {
    if (this.events.length === 0) return;

    const batchEvents = this.events.splice(0, this.config.batchSize);
    const metrics = this.getUsageMetrics();

    logInfo('MCP Analytics: Batch flush', {
      operation: 'analytics_batch_flush',
      metadata: {
        eventCount: batchEvents.length,
        totalOperations: metrics.totalOperations,
        successRate:
          metrics.totalOperations > 0 ? metrics.successfulOperations / metrics.totalOperations : 1,
        averageExecutionTime: metrics.averageExecutionTime,
        topTools: Object.entries(metrics.toolUsageCount)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([name, count]) => ({ name, count })),
      },
    });

    // Send critical errors immediately
    batchEvents
      .filter(e => !e.metadata.success)
      .forEach(event => {
        logError('MCP Operation Failed', {
          operation: `mcp_${event.operationType}_failed`,
          metadata: {
            operationType: event.operationType,
            clientType: event.clientType,
            errorType: event.metadata.errorType,
            errorMessage: event.metadata.errorMessage,
            userId: event.userId,
          },
          error: new Error(event.metadata.errorMessage || 'Unknown MCP error'),
        });
      });
  }

  /**
   * Sanitize metadata to remove sensitive information
   */
  private sanitizeMetadata(metadata: McpAnalyticsEvent['metadata']): McpAnalyticsEvent['metadata'] {
    const sanitized = { ...metadata };

    // Remove sensitive fields
    this.config.sensitiveDataFilters.forEach(filter => {
      Object.keys(sanitized).forEach(key => {
        if (key.toLowerCase().includes(filter.toLowerCase())) {
          sanitized[key] = '[FILTERED]';
        }
      });
    });

    // Truncate long strings
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string' && sanitized[key].length > 500) {
        sanitized[key] = sanitized[key].substring(0, 500) + '[TRUNCATED]';
      }
    });

    return sanitized;
  }

  /**
   * Update internal metrics cache
   */
  private updateMetrics(_event: McpAnalyticsEvent): void {
    // This is handled dynamically in getUsageMetrics()
    // but could be optimized with incremental updates if needed
  }

  /**
   * Log significant events immediately
   */
  private logEventImmediately(event: McpAnalyticsEvent): void {
    if (event.metadata.success) {
      return; // Only log failures and important events immediately
    }

    const logLevel = event.operationType === 'connection_failed' ? logError : logWarn;

    logLevel('MCP Analytics: Significant event', {
      operation: `mcp_${event.operationType}`,
      metadata: {
        operationType: event.operationType,
        clientType: event.clientType,
        success: event.metadata.success,
        errorType: event.metadata.errorType,
        errorMessage: event.metadata.errorMessage,
        userId: event.userId,
        timestamp: new Date(event.timestamp).toISOString(),
      },
    });
  }
}

/**
 * Global analytics service instance
 */
export const mcpAnalytics = new McpAnalyticsService();

/**
 * Convenience functions for common tracking operations
 */
export const trackMcpOperation = {
  toolExecution: (data: Parameters<McpAnalyticsService['trackToolExecution']>[0]) =>
    mcpAnalytics.trackToolExecution(data),

  connection: (data: Parameters<McpAnalyticsService['trackConnection']>[0]) =>
    mcpAnalytics.trackConnection(data),

  streamLifecycle: (data: Parameters<McpAnalyticsService['trackStreamLifecycle']>[0]) =>
    mcpAnalytics.trackStreamLifecycle(data),

  errorRecovery: (data: Parameters<McpAnalyticsService['trackErrorRecovery']>[0]) =>
    mcpAnalytics.trackErrorRecovery(data),

  featureFlag: (data: Parameters<McpAnalyticsService['trackFeatureFlagEvaluation']>[0]) =>
    mcpAnalytics.trackFeatureFlagEvaluation(data),
};

/**
 * Utility function to create performance tracking wrapper
 */
export function withMcpPerformanceTracking<T extends (...args: any[]) => Promise<any>>(
  operationName: string,
  fn: T,
  metadata?: Partial<McpAnalyticsEvent['metadata']>,
): T {
  return (async (...args: Parameters<T>) => {
    const startTime = Date.now();
    let success = false;
    let error: Error | undefined;

    try {
      const result = await fn(...args);
      success = true;
      return result;
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err));
      throw error;
    } finally {
      const executionTime = Date.now() - startTime;

      mcpAnalytics.trackEvent({
        operationType: 'tool_execution',
        clientType: 'enhanced', // Default, should be determined contextually
        metadata: {
          ...metadata,
          toolName: operationName,
          executionTime,
          success,
          errorType: error?.name,
          errorMessage: error?.message,
        },
      });
    }
  }) as T;
}
