// logging/middleware.ts
import {
  Middleware,
  MiddlewareContext,
  createMiddleware,
} from '../base';
import { LogLevel, LogEntry, Logger, LoggerOptions } from './types';
import { logInfo, logError, logWarn, logDebug } from '@repo/observability';

export class ConsoleLogger implements Logger {
  constructor(private options: LoggerOptions = {}) {}

  log(entry: LogEntry): void {
    const formatted = this.options.formatter?.(entry) ?? entry;
    switch (entry.level) {
      case LogLevel.ERROR:
        logError(typeof formatted === 'string' ? formatted : 'Log entry', { entry: formatted });
        break;
      case LogLevel.WARN:
        logWarn(typeof formatted === 'string' ? formatted : 'Log entry', { entry: formatted });
        break;
      case LogLevel.INFO:
        logInfo(typeof formatted === 'string' ? formatted : 'Log entry', { entry: formatted });
        break;
      case LogLevel.DEBUG:
        logDebug(typeof formatted === 'string' ? formatted : 'Log entry', { entry: formatted });
        break;
    }
  }

  isEnabled(level: LogLevel): boolean {
    const levels = Object.values(LogLevel);
    const configLevel = this.options.level ?? LogLevel.INFO;
    return levels.indexOf(level) >= levels.indexOf(configLevel);
  }
}

export const createLoggingMiddleware = (
  logger: Logger = new ConsoleLogger(),
  options: LoggerOptions = {},
): Middleware => {
  return createMiddleware(
    async (context: MiddlewareContext, next) => {
      const startTime = Date.now();

      // Log operation start
      if (logger.isEnabled(LogLevel.INFO)) {
        logger.log({
          level: LogLevel.INFO,
          message: `Operation started: ${context.operation}`,
          timestamp: startTime,
          operation: context.operation,
          metadata: redactSensitive(context.metadata, options.redactKeys),
        });
      }

      try {
        // Execute next middleware
        const result = await next();

        // Log successful completion
        if (logger.isEnabled(LogLevel.INFO)) {
          logger.log({
            level: LogLevel.INFO,
            message: `Operation completed: ${context.operation}`,
            timestamp: Date.now(),
            duration: Date.now() - startTime,
            operation: context.operation,
            metadata: redactSensitive(
              {
                ...context.metadata,
                ...result.metadata,
              },
              options.redactKeys,
            ),
          });
        }

        return result;
      } catch (error) {
        // Log error
        if (logger.isEnabled(LogLevel.ERROR)) {
          logger.log({
            level: LogLevel.ERROR,
            message: `Operation failed: ${context.operation}`,
            timestamp: Date.now(),
            duration: Date.now() - startTime,
            operation: context.operation,
            error: error as Error,
            metadata: redactSensitive(context.metadata, options.redactKeys),
          });
        }

        throw error;
      }
    },
    { enabled: options.enabled !== false },
  );
};

const redactSensitive = (
  obj: Record<string, unknown>,
  keys: string[] = [],
): Record<string, unknown> => {
  if (!keys.length) return obj;

  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      acc[key] = keys.includes(key.toLowerCase()) ? '[REDACTED]' : value;
      return acc;
    },
    {} as Record<string, unknown>,
  );
};
