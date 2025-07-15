import { type DatabaseLogContext, databaseLogger } from './logger';

import { Prisma } from '../../../../prisma-generated/client';

export function createLogConfiguration(): Prisma.LogDefinition[] {
  const config = [
    { emit: 'event' as const, level: 'error' as const },
    { emit: 'stdout' as const, level: 'warn' as const },
  ];

  // Add query logging only if enabled
  const { PRISMA_LOG_QUERIES } = process.env;
  if (PRISMA_LOG_QUERIES === 'true') {
    config.push({ emit: 'stdout' as const, level: 'warn' as const });
  }

  return config;
}

export function createQueryMiddleware(): Prisma.Middleware {
  return async (params: any, next: any) => {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    const context: DatabaseLogContext = {
      args: params.args,
      model: params.model,
      operation: params.action,
      timestamp,
    };

    try {
      const result = await next(params);
      const duration = Date.now() - startTime;

      const logContext = {
        ...context,
        duration,
        result: result ? { count: Array.isArray(result) ? result.length : 1 } : null,
      };

      await Promise.all([
        databaseLogger.logQuery(logContext),
        databaseLogger.logPerformance(logContext),
      ]);

      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;

      await Promise.all([
        databaseLogger.logError(error instanceof Error ? error : new Error(String(error)), {
          ...context,
          duration,
        }),
        databaseLogger.logPerformance({ ...context, duration }),
      ]);

      throw error;
    }
  };
}

export function setupEventListeners(prisma: any): void {
  const config = process.env;

  // Listen to error events
  prisma.$on('error', async (event: Prisma.LogEvent) => {
    const context: DatabaseLogContext = {
      error: new Error(event.message),
      operation: 'unknown',
      timestamp: new Date(event.timestamp).toISOString(),
    };

    if (context.error) {
      await databaseLogger.logError(context.error, context);
    }
  });

  // Listen to query events if enabled
  if (config.PRISMA_LOG_QUERIES === 'true') {
    prisma.$on('query', async (event: Prisma.QueryEvent) => {
      const context: DatabaseLogContext = {
        duration: event.duration,
        operation: 'query',
        params: event.params,
        query: event.query,
        timestamp: new Date(event.timestamp).toISOString(),
      };

      await Promise.all([databaseLogger.logQuery(context), databaseLogger.logPerformance(context)]);
    });
  }
}
