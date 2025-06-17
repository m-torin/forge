import { createServerObservability } from '@repo/observability/server';

import { keys } from '../../keys';

let observabilityInstance: Awaited<ReturnType<typeof createServerObservability>> | null = null;

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
      const observability = await getObservability();

      void observability.captureException(error, {
        extra: {
          args: context.args,
          timestamp: context.timestamp ?? new Date().toISOString(),
        },
        tags: {
          component: 'database',
          model: context.model ?? 'unknown',
          operation: context.operation ?? 'unknown',
        },
      });
    } catch (logError: any) {
      // eslint-disable-next-line no-console
      console.error('Failed to log database error:', logError);
      // eslint-disable-next-line no-console
      console.error('Original error: ', error);
    }
  }

  async logPerformance(context: DatabaseLogContext): Promise<void> {
    const config = keys();

    if (!config.PRISMA_LOG_PERFORMANCE || !context.duration) {
      return;
    }

    try {
      const observability = await getObservability();

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

      const logLevel = context.duration > 1000 ? 'warn' : 'info';
      void observability.log(logLevel, 'Database Performance', performanceData);
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.warn('Failed to log database performance: ', error);
    }
  }

  async logQuery(context: DatabaseLogContext): Promise<void> {
    const config = keys();

    if (!config.PRISMA_LOG_QUERIES) {
      return;
    }

    try {
      const observability = await getObservability();

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

      void observability.log('info', 'Database Query', logData);
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.warn('Failed to log database query: ', error);
    }
  }
}

export async function getObservability() {
  if (!observabilityInstance) {
    const config = keys();

    observabilityInstance = await createServerObservability({
      providers: {
        [config.PRISMA_LOG_PROVIDER]: {},
      },
    });
  }

  return observabilityInstance;
}

export const databaseLogger = DatabaseLogger.getInstance();
