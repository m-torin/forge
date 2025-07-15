import { createServerObservability } from '@repo/observability/shared-env';
import { safeEnv } from '../../../../env';

import type { ObservabilityManager } from '@repo/observability/server';

let observabilityInstance: ObservabilityManager | null = null;

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
      throw new Error(`Failed to log database error: ${logError}`);
    }
  }

  async logPerformance(context: DatabaseLogContext): Promise<void> {
    const config = safeEnv();

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
      throw new Error(`Failed to log database performance: ${error}`);
    }
  }

  async logQuery(context: DatabaseLogContext): Promise<void> {
    const config = safeEnv();

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
      throw new Error(`Failed to log database query: ${error}`);
    }
  }
}

export async function getObservability(): Promise<ObservabilityManager> {
  if (!observabilityInstance) {
    const config = safeEnv();

    observabilityInstance = await createServerObservability({
      providers: {
        [config.PRISMA_LOG_PROVIDER || 'console']: {},
      },
    });
  }

  return observabilityInstance;
}

export const databaseLogger = DatabaseLogger.getInstance();
