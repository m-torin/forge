/**
 * AI SDK Logging Middleware
 * Provides structured logging for AI operations with performance tracking
 */

import { logError, logInfo, logWarn } from '@repo/observability';

export interface LoggingConfig {
  enabled: boolean;
  logRequests: boolean;
  logResponses: boolean;
  logPerformance: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface AIOperationLog {
  operation: string;
  model: string;
  timestamp: string;
  duration?: number;
  tokens?: {
    input: number;
    output: number;
  };
  success: boolean;
  error?: string;
}

/**
 * Default logging configuration
 */
export const DEFAULT_LOGGING_CONFIG: LoggingConfig = {
  enabled: process.env.AI_LOGGING_ENABLED === 'true',
  logRequests: process.env.AI_LOG_REQUESTS === 'true',
  logResponses: process.env.AI_LOG_RESPONSES === 'true',
  logPerformance: process.env.AI_LOG_PERFORMANCE === 'true',
  logLevel: (process.env.AI_LOG_LEVEL as LoggingConfig['logLevel']) || 'info',
};

/**
 * Create logging middleware for AI operations
 */
export function createLoggingMiddleware(config: Partial<LoggingConfig> = {}) {
  const finalConfig = { ...DEFAULT_LOGGING_CONFIG, ...config };

  return {
    logOperation: (log: AIOperationLog) => {
      if (!finalConfig.enabled) return;

      const logData = {
        ...log,
        config: finalConfig.logRequests || finalConfig.logResponses ? finalConfig : undefined,
      };

      if (log.success) {
        logInfo('AI operation completed', logData);
      } else {
        logWarn('AI operation failed', logData);
      }
    },

    logError: (operation: string, error: Error) => {
      if (!finalConfig.enabled) return;

      logError('AI operation error', {
        operation,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
    },

    logPerformance: (
      operation: string,
      duration: number,
      tokens?: { input: number; output: number },
    ) => {
      if (!finalConfig.enabled || !finalConfig.logPerformance) return;

      logInfo('AI operation performance', {
        operation,
        duration,
        tokens,
        timestamp: new Date().toISOString(),
      });
    },
  };
}

/**
 * Default logging instance
 */
export const aiLogger = createLoggingMiddleware();
