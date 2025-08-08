/**
 * Shared utilities for Claude agents that provide standardized:
 * - MCP tool wrappers with error handling
 * - Logging setup and management
 * - Caching layer for expensive operations
 * - Standard agent structure and patterns
 * - Memory management and optimization
 * - Parallel processing capabilities
 */

import {
  globalCacheRegistry,
  globalLoggerRegistry,
  createEntityName as mcpCreateEntityName,
  extractObservation as mcpExtractObservation,
  safeStringify as mcpSafeStringify,
} from '@repo/mcp-utils';
import { logError, logInfo, logWarn } from '@repo/observability';

// Types for agent utilities
export interface AgentLogger {
  info: (message: string, data?: Record<string, any>) => Promise<void>;
  warn: (message: string, data?: Record<string, any>) => Promise<void>;
  error: (message: string, data?: Record<string, any>) => Promise<void>;
  debug: (message: string, data?: Record<string, any>) => Promise<void>;
}

export interface AgentCache {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any, ttl?: number) => Promise<void>;
  has: (key: string) => Promise<boolean>;
  delete: (key: string) => Promise<boolean>;
  clear: () => Promise<void>;
  size: () => Promise<number>;
}

export interface AgentTools {
  logger: AgentLogger;
  cache: AgentCache;
  stringify: (obj: any, maxLength?: number) => Promise<string>;
  extractObservation: (entity: any, key: string) => Promise<string | null>;
  createEntityName: (entityType: string, identifier: string) => Promise<string>;
  processInParallel: <T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize?: number,
  ) => Promise<R[]>;
  retryOperation: <T>(operation: () => Promise<T>, maxRetries?: number) => Promise<T>;
}

export interface StandardAgentConfig {
  name: string;
  cacheSize?: number;
  cacheTtl?: number;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  enableAnalytics?: boolean;
  maxParallelOperations?: number;
}

/**
 * Create a standardized logger for agents that wraps MCP logging tools
 */
export async function createAgentLogger(
  name: string,
  level: string = 'info',
): Promise<AgentLogger> {
  const prefix = `[${name}]`;

  return {
    async info(message: string, data?: Record<string, any>) {
      try {
        let logger = globalLoggerRegistry.get(name);
        if (!logger) {
          logger = globalLoggerRegistry.create(name, { logLevel: 'info' });
          await logger.init();
        }
        logger.info(`${message} ${data ? JSON.stringify(data) : ''}`);
      } catch (error) {
        logInfo(`${prefix} ${message}`, data);
      }
    },

    async warn(message: string, data?: Record<string, any>) {
      try {
        let logger = globalLoggerRegistry.get(name);
        if (!logger) {
          logger = globalLoggerRegistry.create(name, { logLevel: 'warn' });
          await logger.init();
        }
        logger.warn(`${message} ${data ? JSON.stringify(data) : ''}`);
      } catch (error) {
        logWarn(`${prefix} ${message}`, data);
      }
    },

    async error(message: string, data?: Record<string, any>) {
      try {
        let logger = globalLoggerRegistry.get(name);
        if (!logger) {
          logger = globalLoggerRegistry.create(name, { logLevel: 'error' });
          await logger.init();
        }
        logger.error(`${message} ${data ? JSON.stringify(data) : ''}`);
      } catch (error) {
        logError(`${prefix} ${message}`, data);
      }
    },

    async debug(message: string, data?: Record<string, any>) {
      if (level === 'debug') {
        try {
          let logger = globalLoggerRegistry.get(name);
          if (!logger) {
            logger = globalLoggerRegistry.create(name, { logLevel: 'debug' });
            await logger.init();
          }
          logger.debug(`${message} ${data ? JSON.stringify(data) : ''}`);
        } catch (error) {
          logInfo(`${prefix} ${message}`, data);
        }
      }
    },
  };
}

/**
 * Create a smart caching layer with TTL and MCP integration
 */
export async function createSmartCache(
  name: string,
  maxSize: number = 100,
  ttl: number = 3600000,
): Promise<AgentCache> {
  let mcpCache: any = null;
  let fallbackCache: Map<string, { value: any; expires: number }> = new Map();

  // Try to use MCP bounded cache if available
  try {
    mcpCache = globalCacheRegistry.get(name) || globalCacheRegistry.create(name, { maxSize, ttl });
  } catch (error) {
    // Fall back to in-memory cache
  }

  return {
    async get(key: string) {
      try {
        if (mcpCache) {
          return await mcpCache.get(key);
        } else {
          const item = fallbackCache.get(key);
          if (item && item.expires > Date.now()) {
            return item.value;
          } else if (item) {
            fallbackCache.delete(key);
          }
          return null;
        }
      } catch (error) {
        return null;
      }
    },

    async set(key: string, value: any, customTtl?: number) {
      try {
        if (mcpCache) {
          await mcpCache.set(key, value, customTtl);
        } else {
          const expires = Date.now() + (customTtl || ttl);
          fallbackCache.set(key, { value, expires });

          // Clean up expired entries if cache is getting large
          if (fallbackCache.size > maxSize) {
            const now = Date.now();
            for (const [k, item] of fallbackCache.entries()) {
              if (item.expires <= now) {
                fallbackCache.delete(k);
              }
            }
          }
        }
      } catch (error) {
        // Silent fail for cache operations
      }
    },

    async has(key: string) {
      try {
        if (mcpCache) {
          return await mcpCache.has(key);
        } else {
          const item = fallbackCache.get(key);
          return item ? item.expires > Date.now() : false;
        }
      } catch (error) {
        return false;
      }
    },

    async delete(key: string) {
      try {
        if (mcpCache) {
          return await mcpCache.delete(key);
        } else {
          return fallbackCache.delete(key);
        }
      } catch (error) {
        return false;
      }
    },

    async clear() {
      try {
        if (mcpCache) {
          await mcpCache.clear();
        } else {
          fallbackCache.clear();
        }
      } catch (error) {
        // Silent fail
      }
    },

    async size() {
      try {
        if (mcpCache) {
          return await mcpCache.size();
        } else {
          return fallbackCache.size;
        }
      } catch (error) {
        return 0;
      }
    },
  };
}

/**
 * Safe JSON stringification with MCP fallback
 */
export async function safeStringify(obj: any, maxLength: number = 75000): Promise<string> {
  try {
    return mcpSafeStringify(obj, maxLength);
  } catch (error) {
    // Fall back to regular JSON.stringify
    try {
      const json = JSON.stringify(obj, null, 0);
      return json.length > maxLength ? json.substring(0, maxLength) + '...[truncated]' : json;
    } catch (error) {
      return `[JSON Error: ${(error as Error).message}]`;
    }
  }
}

/**
 * Extract observation from entity with MCP fallback
 */
export async function extractObservation(entity: any, key: string): Promise<string | null> {
  try {
    return mcpExtractObservation(entity, key);
  } catch (error) {
    // Manual fallback
    if (!entity?.observations) return null;
    for (const obs of entity.observations) {
      if (obs.startsWith(`${key}:`)) {
        return obs.substring(key.length + 1);
      }
    }
    return null;
  }
}

/**
 * Create entity name with MCP fallback
 */
export async function createEntityName(entityType: string, identifier: string): Promise<string> {
  try {
    return mcpCreateEntityName(entityType as any, identifier, []);
  } catch (error) {
    // Fall back to simple concatenation
    return `${entityType}:${identifier}`;
  }
}

/**
 * Process items in parallel with controlled concurrency
 */
export async function processInParallel<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 5,
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async item => {
        try {
          return await processor(item);
        } catch (error) {
          logWarn(`Failed to process item in batch:`, { error });
          return null;
        }
      }),
    );

    // Filter out null results from failed processing
    results.push(...(batchResults.filter(result => result !== null) as R[]));
  }

  return results;
}

/**
 * Retry operation with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
): Promise<T> {
  let lastError: Error = new Error('Operation failed after retries');
  let delay = 100;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }

  throw lastError;
}

/**
 * Create a standard agent with all utilities configured
 */
export async function createStandardAgent(config: StandardAgentConfig): Promise<AgentTools> {
  const {
    name,
    cacheSize = 100,
    cacheTtl = 3600000, // 1 hour
    logLevel = 'info',
    maxParallelOperations = 5,
  } = config;

  const logger = await createAgentLogger(name, logLevel);
  const cache = await createSmartCache(`${name}-cache`, cacheSize, cacheTtl);

  await logger.info(`🚀 Initializing ${name} agent with standard utilities`);

  return {
    logger,
    cache,
    stringify: safeStringify,
    extractObservation,
    createEntityName,
    processInParallel: <T, R>(items: T[], processor: (item: T) => Promise<R>, batchSize?: number) =>
      processInParallel(items, processor, batchSize || maxParallelOperations),
    retryOperation,
  };
}

/**
 * Standard error handler for agents
 */
export function createStandardErrorHandler(logger: AgentLogger) {
  return async (error: Error, context?: string) => {
    await logger.error(`${context ? `${context}: ` : ''}${error.message}`, {
      stack: error.stack,
      name: error.name,
    });

    return {
      status: 'error',
      error: error.message,
      timestamp: Date.now(),
    };
  };
}

/**
 * Standard request parser for agents
 */
export function parseAgentRequest(userMessage: string): any {
  try {
    // Try to extract JSON from various patterns
    const patterns = [/REQUEST:\s*({[\s\S]+})/, /ANALYSIS_REQUEST:\s*({[\s\S]+})/, /\{[\s\S]+\}/];

    for (const pattern of patterns) {
      const match = userMessage.match(pattern);
      if (match) {
        return JSON.parse(match[1] || match[0]);
      }
    }

    // If no JSON found, try to parse the entire message
    return JSON.parse(userMessage);
  } catch (error) {
    throw new Error(
      `Invalid request format. Expected JSON but got: ${userMessage.substring(0, 200)}...`,
    );
  }
}

/**
 * Standard success response for agents
 */
export function createSuccessResponse(data: any) {
  return {
    status: 'success',
    timestamp: Date.now(),
    ...data,
  };
}

/**
 * Standard error response for agents
 */
export function createErrorResponse(error: string | Error, details?: any) {
  return {
    status: 'error',
    error: typeof error === 'string' ? error : error.message,
    timestamp: Date.now(),
    ...(details && { details }),
  };
}

/**
 * Memory optimization utilities
 */
export const MemoryUtils = {
  /**
   * Create a reference-based observation instead of storing full data
   */
  createReference(entityType: string, id: string, metadata?: Record<string, any>): string {
    const ref = { type: 'reference', entityType, id, metadata };
    return `ref:${JSON.stringify(ref)}`;
  },

  /**
   * Check if an observation is a reference
   */
  isReference(observation: string): boolean {
    return observation.startsWith('ref:');
  },

  /**
   * Parse a reference observation
   */
  parseReference(observation: string): any {
    if (!this.isReference(observation)) return null;
    try {
      return JSON.parse(observation.substring(4));
    } catch {
      return null;
    }
  },

  /**
   * Store only essential data in observations
   */
  createMinimalObservation(key: string, value: any): string {
    // For large objects, store only essential metadata
    if (typeof value === 'object' && value !== null) {
      const essential = {
        type: value.constructor.name,
        size: Array.isArray(value) ? value.length : Object.keys(value).length,
        timestamp: Date.now(),
      };
      return `${key}:${JSON.stringify(essential)}`;
    }
    return `${key}:${String(value)}`;
  },
};

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private timers: Map<string, number> = new Map();
  private logger: AgentLogger;

  constructor(logger: AgentLogger) {
    this.logger = logger;
  }

  start(operation: string): void {
    this.timers.set(operation, Date.now());
  }

  async end(operation: string, metadata?: Record<string, any>): Promise<number> {
    const startTime = this.timers.get(operation);
    if (!startTime) {
      await this.logger.warn(`Timer not found for operation: ${operation}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(operation);

    await this.logger.info(`⏱️ ${operation} completed in ${duration}ms`, metadata);
    return duration;
  }

  async measure<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    this.start(operation);
    try {
      const result = await fn();
      await this.end(operation);
      return result;
    } catch (error) {
      await this.end(operation, { error: (error as Error).message });
      throw error;
    }
  }
}
