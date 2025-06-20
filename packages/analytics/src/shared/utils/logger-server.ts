/**
 * Analytics Logger for Server Environments
 *
 * This file provides logging functionality for analytics operations in server
 * environments with full observability integration.
 *
 * Uses the observability package for comprehensive logging and monitoring.
 */

import { createServerObservability } from '@repo/observability/shared-env';
import { keys } from '../../../keys';

import type { ObservabilityManager } from '@repo/observability/server';

let observabilityInstance: ObservabilityManager | null = null;

export interface AnalyticsLogContext {
  provider?: string;
  operation?: string;
  event?: string;
  userId?: string;
  duration?: number;
  properties?: Record<string, any>;
  metadata?: Record<string, any>;
  error?: Error;
  timestamp?: string;
}

export class AnalyticsLogger {
  private static instance?: AnalyticsLogger;

  private constructor() {
    // Private constructor for singleton pattern
  }

  static getInstance(): AnalyticsLogger {
    AnalyticsLogger.instance ??= new AnalyticsLogger();
    return AnalyticsLogger.instance;
  }

  async logError(error: Error, context: Partial<AnalyticsLogContext> = {}): Promise<void> {
    try {
      const observability = await getObservability();

      void observability.captureException(error, {
        extra: {
          event: context.event,
          userId: context.userId,
          properties: context.properties,
          metadata: context.metadata,
          timestamp: context.timestamp ?? new Date().toISOString(),
        },
        tags: {
          component: 'analytics',
          provider: context.provider ?? 'unknown',
          operation: context.operation ?? 'unknown',
        },
      });
    } catch (logError: any) {
      // Fallback to console
      console.error('Failed to log analytics error:', logError);
      console.error('Original error:', error);
    }
  }

  async logWarning(message: string, context: Partial<AnalyticsLogContext> = {}): Promise<void> {
    try {
      const observability = await getObservability();

      const logData = {
        provider: context.provider,
        operation: context.operation,
        event: context.event,
        userId: context.userId,
        properties: context.properties,
        metadata: context.metadata,
        timestamp: context.timestamp ?? new Date().toISOString(),
      };

      void observability.log('warn', message, logData);
    } catch (logError: any) {
      // Fallback to console
      console.warn('Failed to log analytics warning:', logError);
      console.warn('Original message:', message);
    }
  }

  async logInfo(message: string, context: Partial<AnalyticsLogContext> = {}): Promise<void> {
    try {
      const observability = await getObservability();

      const logData = {
        provider: context.provider,
        operation: context.operation,
        event: context.event,
        userId: context.userId,
        duration: context.duration,
        properties: context.properties,
        metadata: context.metadata,
        timestamp: context.timestamp ?? new Date().toISOString(),
      };

      void observability.log('info', message, logData);
    } catch (logError: any) {
      // Fallback to console
      console.info('Failed to log analytics info:', logError);
      console.info('Original message:', message);
    }
  }

  async logDebug(message: string, context: Partial<AnalyticsLogContext> = {}): Promise<void> {
    try {
      const observability = await getObservability();

      const logData = {
        provider: context.provider,
        operation: context.operation,
        event: context.event,
        userId: context.userId,
        properties: context.properties,
        metadata: context.metadata,
        timestamp: context.timestamp ?? new Date().toISOString(),
      };

      void observability.log('debug', message, logData);
    } catch (logError: any) {
      // Fallback to console
      console.debug('Failed to log analytics debug:', logError);
      console.debug('Original message:', message);
    }
  }

  async logPerformance(context: AnalyticsLogContext): Promise<void> {
    if (!context.duration) {
      return;
    }

    try {
      const observability = await getObservability();

      const performanceData = {
        provider: context.provider,
        operation: context.operation,
        event: context.event,
        userId: context.userId,
        duration: context.duration,
        performance: {
          moderate: context.duration > 500, // 500ms
          slow: context.duration > 1000, // 1 second
        },
        timestamp: context.timestamp ?? new Date().toISOString(),
      };

      const logLevel = context.duration > 1000 ? 'warn' : 'info';
      void observability.log(logLevel, 'Analytics Performance', performanceData);
    } catch (error: any) {
      // Fallback to console
      console.warn('Failed to log analytics performance:', error);
    }
  }
}

async function getObservability(): Promise<ObservabilityManager> {
  if (!observabilityInstance) {
    const config = keys();

    observabilityInstance = await createServerObservability({
      providers: {
        [config.ANALYTICS_LOG_PROVIDER]: {},
      },
    });
  }

  return observabilityInstance;
}

export const analyticsLogger = AnalyticsLogger.getInstance();
