import type { PrismaClient } from '../../generated/client/client';
import type {
  BatchOptions,
  BatchResult,
  ConnectionConfig,
  CursorPaginatedResult,
  CursorPaginationOptions,
  HealthCheckResult,
  PaginatedResult,
  PaginationOptions,
  QueryMetrics,
} from './types';

// ==================== ERROR HANDLING UTILITIES ====================

/**
 * Handle Prisma errors with proper error mapping
 */
export function handlePrismaError(error: unknown): Error {
  // Check if it's a known Prisma error with code property
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; message: string };
    switch (prismaError.code) {
      case 'P2002':
        return new Error('Unique constraint violation');
      case 'P2025':
        return new Error('Record not found');
      case 'P2003':
        return new Error('Foreign key constraint violation');
      default:
        return new Error(`Database error: ${prismaError.message}`);
    }
  }

  // For other Prisma errors, check constructor name
  if (error && typeof error === 'object' && 'message' in error) {
    const errorObj = error as Error;
    const errorName = errorObj.constructor.name;

    if (errorName.includes('PrismaClient')) {
      return new Error(`Prisma error: ${errorObj.message}`);
    }
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error('Unknown error occurred');
}

// ==================== PAGINATION UTILITIES ====================

/**
 * Pagination utilities for Prisma queries
 */
export const pagination = {
  /**
   * Calculate offset and limit from page-based pagination
   */
  getOffsetLimit(options: PaginationOptions) {
    const page = Math.max(1, options.page || 1);
    const pageSize = Math.min(100, Math.max(1, options.pageSize || 20));
    const skip = (page - 1) * pageSize;

    return { skip, take: pageSize, page, pageSize };
  },

  /**
   * Create paginated result with metadata
   */
  createPaginatedResult<T>(
    data: T[],
    total: number,
    options: PaginationOptions,
  ): PaginatedResult<T> {
    const { page, pageSize } = this.getOffsetLimit(options);
    const totalPages = Math.ceil(total / pageSize);

    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  },

  /**
   * Create cursor-based pagination result
   */
  createCursorResult<T extends { id: string }>(
    data: T[],
    options: CursorPaginationOptions,
  ): CursorPaginatedResult<T> {
    const take = options.take || 20;
    const hasNext = data.length === take + 1; // We query for take + 1 to check if there's more

    if (hasNext) data.pop(); // Remove the extra item

    return {
      data,
      pagination: {
        nextCursor: hasNext && data.length > 0 ? data[data.length - 1].id : undefined,
        previousCursor: options.cursor,
        hasNext,
        hasPrevious: !!options.cursor,
        count: data.length,
      },
    };
  },
} as const;

// ==================== BATCH OPERATIONS ====================

/**
 * Batch operation utilities
 */
export const batch = {
  /**
   * Process items in batches with error handling
   */
  async process<T, R>(
    items: T[],
    processor: (batch: T[]) => Promise<R[]>,
    options: BatchOptions = {},
  ): Promise<BatchResult & { results: R[] }> {
    const batchSize = options.batchSize || 100;
    const continueOnError = options.continueOnError || false;

    const results: R[] = [];
    const errors: Error[] = [];
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      try {
        const batchResults = await processor(batch);
        results.push(...batchResults);
        successful += batchResults.length;
      } catch (error) {
        failed += batch.length;
        errors.push(error instanceof Error ? error : new Error(String(error)));

        if (!continueOnError) {
          break;
        }
      }
    }

    return { results, successful, failed, errors };
  },
} as const;

// ==================== PERFORMANCE MONITORING ====================

/**
 * Connection monitoring class
 */
export class ConnectionMonitor {
  private queryLog: QueryMetrics[] = [];
  private readonly maxLogSize: number;

  constructor(maxLogSize: number = 1000) {
    this.maxLogSize = maxLogSize;
  }

  logQuery(metrics: QueryMetrics): void {
    this.queryLog.push(metrics);
    if (this.queryLog.length > this.maxLogSize) {
      this.queryLog = this.queryLog.slice(-this.maxLogSize);
    }
  }

  getQueryStats(): {
    totalQueries: number;
    averageDuration: number;
    slowestQuery: QueryMetrics | null;
    fastestQuery: QueryMetrics | null;
    recentQueries: QueryMetrics[];
  } {
    if (this.queryLog.length === 0) {
      return {
        totalQueries: 0,
        averageDuration: 0,
        slowestQuery: null,
        fastestQuery: null,
        recentQueries: [],
      };
    }

    const durations = this.queryLog.map(q => q.duration);
    const totalDuration = durations.reduce((sum, d) => sum + d, 0);

    return {
      totalQueries: this.queryLog.length,
      averageDuration: totalDuration / this.queryLog.length,
      slowestQuery: this.queryLog.reduce((prev, current) =>
        prev.duration > current.duration ? prev : current,
      ),
      fastestQuery: this.queryLog.reduce((prev, current) =>
        prev.duration < current.duration ? prev : current,
      ),
      recentQueries: this.queryLog.slice(-10),
    };
  }

  clearLog(): void {
    this.queryLog = [];
  }
  getSlowQueries(thresholdMs: number = 1000): QueryMetrics[] {
    return this.queryLog.filter(q => q.duration > thresholdMs);
  }
}

/**
 * Performance monitoring utilities
 */
export const monitoring = {
  /**
   * Time a query execution with detailed metrics
   */
  async timeQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>,
    monitor?: ConnectionMonitor,
  ): Promise<{ result: T; metrics: QueryMetrics }> {
    const startTime = performance.now();

    try {
      const result = await queryFn();
      const duration = Math.round(performance.now() - startTime);

      const metrics: QueryMetrics = {
        query: queryName,
        duration,
        timestamp: new Date(),
        affectedRows:
          typeof result === 'object' && result !== null && 'count' in result
            ? (result as any).count
            : undefined,
      };

      monitor?.logQuery(metrics);
      return { result, metrics };
    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      const metrics: QueryMetrics = {
        query: queryName,
        duration,
        timestamp: new Date(),
      };

      monitor?.logQuery(metrics);
      throw Object.assign(error as object, { queryMetrics: metrics });
    }
  },

  /**
   * Comprehensive health check
   */
  async healthCheck(prisma: PrismaClient, config?: ConnectionConfig): Promise<HealthCheckResult> {
    const startTime = performance.now();

    try {
      await prisma.$queryRaw`SELECT 1`;
      const responseTime = Math.round(performance.now() - startTime);

      const status =
        responseTime < (config?.connectionTimeout || 1000)
          ? 'healthy'
          : responseTime < (config?.connectionTimeout || 1000) * 2
            ? 'degraded'
            : 'unhealthy';

      return {
        status,
        responseTime,
        connections: {
          totalConnections: 0, // Would need actual pool metrics
          activeConnections: 0,
          idleConnections: 0,
          waitingConnections: 0,
        },
        lastCheck: new Date(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Math.round(performance.now() - startTime),
        connections: {
          totalConnections: 0,
          activeConnections: 0,
          idleConnections: 0,
          waitingConnections: 0,
        },
        lastCheck: new Date(),
      };
    }
  },
} as const;

// ==================== VALIDATION UTILITIES ====================

/**
 * Validation utilities
 */
export const validation = {
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  sanitizeText(text: string): string {
    return text.trim().replace(/\s+/g, ' ');
  },

  /**
   * Generic input sanitization for database operations
   */
  sanitizeInput(data: any): any {
    if (data === null || data === undefined) return data;

    if (typeof data === 'string') {
      return this.sanitizeText(data);
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeInput(item));
    }

    if (typeof data === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }

    return data;
  },

  validateUserInput(data: { email: string; name?: string }): {
    success: boolean;
    sanitized?: { email: string; name?: string };
    errors: string[];
  } {
    const errors: string[] = [];

    if (!data.email) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(data.email)) {
      errors.push('Invalid email format');
    }

    if (data.name && data.name.length > 100) {
      errors.push('Name must be 100 characters or less');
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return {
      success: true,
      sanitized: {
        email: data.email.toLowerCase().trim(),
        name: data.name ? this.sanitizeText(data.name) : undefined,
      },
      errors: [],
    };
  },

  validatePostInput(data: { title: string; content?: string }): {
    success: boolean;
    sanitized?: { title: string; content?: string };
    errors: string[];
  } {
    const errors: string[] = [];

    if (!data.title) {
      errors.push('Title is required');
    } else if (data.title.length > 200) {
      errors.push('Title must be 200 characters or less');
    }

    if (data.content && data.content.length > 10000) {
      errors.push('Content must be 10,000 characters or less');
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return {
      success: true,
      sanitized: {
        title: this.sanitizeText(data.title),
        content: data.content ? this.sanitizeText(data.content) : undefined,
      },
      errors: [],
    };
  },
} as const;

// ==================== TRANSACTION UTILITIES ====================

/**
 * Transaction utilities
 */
export const transactions = {
  /**
   * Execute with retry logic
   */
  async withRetry<T>(
    prisma: PrismaClient,
    operation: (
      tx: Omit<
        PrismaClient,
        '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
      >,
    ) => Promise<T>,
    maxRetries: number = 3,
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await prisma.$transaction(operation, {
          maxWait: 5000,
          timeout: 10000,
        });
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry constraint violations
        if (
          error instanceof Error &&
          (error.message.includes('Unique constraint') ||
            error.message.includes('Foreign key constraint'))
        ) {
          throw lastError;
        }

        if (attempt === maxRetries) throw lastError;

        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
      }
    }

    throw lastError!;
  },
} as const;

// ==================== QUERY UTILITIES ====================

/**
 * Query builder utilities
 */
export const query = {
  /**
   * Combine where conditions with AND
   */
  combineWhere<T>(...conditions: (T | undefined)[]): T | undefined {
    const validConditions = conditions.filter((c): c is T => c !== undefined);

    if (validConditions.length === 0) return undefined;
    if (validConditions.length === 1) return validConditions[0];

    return { AND: validConditions } as T;
  },

  /**
   * Create OR condition
   */
  createOr<T>(conditions: T[]): { OR: T[] } | undefined {
    return conditions.length > 0 ? { OR: conditions } : undefined;
  },

  /**
   * Build search where clause
   */
  buildSearchWhere(query: string, fields: string[]): any {
    if (!query.trim()) return undefined;

    const searchTerm = `%${query.trim()}%`;
    const conditions = fields.map(field => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive' as const,
      },
    }));

    return { OR: conditions };
  },
} as const;

// ==================== ADVANCED UTILITIES ====================

/**
 * Advanced cursor pagination for any model
 */
export async function findManyCursor<T extends { id: string }>(
  queryFn: (options: { cursor?: { id: string }; take: number; skip?: number }) => Promise<T[]>,
  options?: CursorPaginationOptions,
): Promise<CursorPaginatedResult<T>> {
  const take = Math.min(options?.take || 20, 100) + 1;

  const results = await queryFn({
    cursor: options?.cursor ? { id: options.cursor } : undefined,
    take,
    skip: options?.cursor ? 1 : options?.skip,
  });

  return pagination.createCursorResult(results, options || {});
}

/**
 * Create a monitoring instance
 */
export function createMonitor(config?: { maxLogSize?: number; enableMetrics?: boolean }): {
  monitor: ConnectionMonitor;
  timeQuery: typeof monitoring.timeQuery;
  healthCheck: (prisma: PrismaClient) => Promise<HealthCheckResult>;
} {
  const monitor = new ConnectionMonitor(config?.maxLogSize);

  return {
    monitor,
    timeQuery: (queryName: string, queryFn: () => Promise<any>) =>
      monitoring.timeQuery(queryName, queryFn, monitor),
    healthCheck: (prisma: PrismaClient) => monitoring.healthCheck(prisma),
  };
}
