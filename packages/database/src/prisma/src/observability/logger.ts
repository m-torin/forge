import { logError, logError as logErrorObs, logInfo, logWarn } from '@repo/observability';
import { safeEnv } from '../../../../env';

export interface DatabaseLogContext {
  args?: unknown;
  duration?: number;
  error?: Error;
  model?: string;
  operation: string;
  params?: unknown;
  query?: string;
  result?: unknown;
  timestamp: string;
}

export class DatabaseLogger {
  private static instance?: DatabaseLogger;

  private constructor() {
    // Private constructor for singleton pattern
  }

  static getInstance(): DatabaseLogger {
    DatabaseLogger.instance ??= new DatabaseLogger();
    return DatabaseLogger.instance;
  }

  async logError(error: Error, context: Partial<DatabaseLogContext>): Promise<void> {
    try {
      const errorData = {
        error: error.message,
        stack: error.stack,
        args: context.args,
        timestamp: context.timestamp ?? new Date().toISOString(),
        component: 'database',
        model: context.model ?? 'unknown',
        operation: context.operation ?? 'unknown',
      };

      void logErrorObs(error, errorData);
    } catch (logErr: any) {
      logError(`Failed to log database error: ${logErr}`);
    }
  }

  async logPerformance(context: DatabaseLogContext): Promise<void> {
    const config = safeEnv();

    if (!config.PRISMA_LOG_PERFORMANCE || !context.duration) {
      return;
    }

    try {
      const performanceData = {
        duration: context.duration,
        model: context.model,
        operation: context.operation,
        performance: {
          moderate: context.duration > 500,
          slow: context.duration > 1000,
        },
        timestamp: context.timestamp,
      };

      // Use specific logger functions instead of generic log method
      if (context.duration > 1000) {
        void logWarn('Database Performance', performanceData);
      } else {
        void logInfo('Database Performance', performanceData);
      }
    } catch (err: any) {
      logError(`Failed to log database performance: ${err}`);
    }
  }

  async logQuery(context: DatabaseLogContext): Promise<void> {
    const config = safeEnv();

    if (!config.PRISMA_LOG_QUERIES) {
      return;
    }

    try {
      const logData = {
        duration: context.duration,
        model: context.model,
        operation: context.operation,
        timestamp: context.timestamp,
        ...(config.PRISMA_LOG_LEVEL === 'query' && {
          params: context.params,
          query: context.query,
        }),
      };

      // Use specific logger function instead of generic log method
      void logInfo('Database Query', logData);
    } catch (err: any) {
      logError(`Failed to log database query: ${err}`);
    }
  }
}

export const databaseLogger = DatabaseLogger.getInstance();
