/**
 * Language Model Middleware as Tools - AI SDK v5
 *
 * Implements the stable middleware pattern from AI SDK v5 as tools
 * for guardrails, caching, logging, and other cross-cutting concerns.
 */

import { logDebug, logError, logInfo, logWarn } from '@repo/observability';
import { tool as aiTool, type Tool } from 'ai';

/**
 * Middleware types
 */
export type MiddlewareType =
  | 'content-filter'
  | 'rate-limiter'
  | 'cache'
  | 'logger'
  | 'validator'
  | 'transformer'
  | 'guardrail';

/**
 * Middleware configuration
 */
export interface MiddlewareConfig {
  type: MiddlewareType;
  name: string;
  enabled: boolean;
  config: Record<string, any>;
  priority: number; // Lower numbers run first
}

/**
 * Middleware execution context
 */
export interface MiddlewareContext {
  input: any;
  metadata: Record<string, any>;
  timestamp: number;
  toolName?: string;
  stepNumber?: number;
}

/**
 * Middleware execution result
 */
export interface MiddlewareResult {
  allowed: boolean;
  transformed?: any;
  metadata?: Record<string, any>;
  warning?: string;
  error?: string;
  cached?: boolean;
  fromCache?: boolean;
}

/**
 * Content filtering middleware implementations
 */
export const contentFilters = {
  /**
   * Basic profanity filter
   */
  profanity: {
    name: 'Profanity Filter',
    execute: async (input: string, config: any): Promise<MiddlewareResult> => {
      const profanityWords = config.blockedWords || ['spam', 'abuse', 'harmful'];
      const lowerInput = input.toLowerCase();

      const hasProfanity = profanityWords.some((word: string) =>
        lowerInput.includes(word.toLowerCase()),
      );

      if (hasProfanity) {
        return {
          allowed: false,
          error: 'Content contains blocked words',
          metadata: { filteredReason: 'profanity' },
        };
      }

      return { allowed: true };
    },
  },

  /**
   * Content length limiter
   */
  lengthLimit: {
    name: 'Content Length Limiter',
    execute: async (input: string, config: any): Promise<MiddlewareResult> => {
      const maxLength = config.maxLength || 1000;

      if (input.length > maxLength) {
        const truncated = input.slice(0, maxLength) + '...';
        return {
          allowed: true,
          transformed: truncated,
          warning: `Content truncated to ${maxLength} characters`,
          metadata: { originalLength: input.length, truncated: true },
        };
      }

      return { allowed: true };
    },
  },

  /**
   * Sensitive data detector
   */
  sensitiveData: {
    name: 'Sensitive Data Filter',
    execute: async (input: string, config: any): Promise<MiddlewareResult> => {
      const patterns = {
        email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        phone: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
        ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
        creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
      };

      const detected: string[] = [];
      let sanitized = input;

      for (const [type, pattern] of Object.entries(patterns)) {
        if (pattern.test(input)) {
          detected.push(type);
          sanitized = sanitized.replace(pattern, `[${type.toUpperCase()}_REDACTED]`);
        }
      }

      if (detected.length > 0) {
        return {
          allowed: config.allowWithRedaction !== false,
          transformed: sanitized,
          warning: `Sensitive data detected and redacted: ${detected.join(', ')}`,
          metadata: { detectedTypes: detected, redacted: true },
        };
      }

      return { allowed: true };
    },
  },
};

/**
 * Rate limiting middleware
 */
export const rateLimiters = {
  /**
   * Simple token bucket rate limiter
   */
  tokenBucket: {
    name: 'Token Bucket Rate Limiter',
    buckets: new Map<string, { tokens: number; lastRefill: number }>(),

    execute: async function (context: MiddlewareContext, config: any): Promise<MiddlewareResult> {
      const key = config.keyGenerator?.(context) || 'default';
      const maxTokens = config.maxTokens || 10;
      const refillRate = config.refillRate || 1; // tokens per second
      const now = Date.now();

      let bucket = this.buckets.get(key);
      if (!bucket) {
        bucket = { tokens: maxTokens, lastRefill: now };
        this.buckets.set(key, bucket);
      }

      // Refill tokens
      const timePassed = (now - bucket.lastRefill) / 1000;
      bucket.tokens = Math.min(maxTokens, bucket.tokens + timePassed * refillRate);
      bucket.lastRefill = now;

      if (bucket.tokens >= 1) {
        bucket.tokens -= 1;
        return {
          allowed: true,
          metadata: { remainingTokens: Math.floor(bucket.tokens) },
        };
      }

      return {
        allowed: false,
        error: 'Rate limit exceeded',
        metadata: {
          rateLimited: true,
          retryAfter: Math.ceil((1 - bucket.tokens) / refillRate),
        },
      };
    },
  },
};

/**
 * Caching middleware
 */
export const caches = {
  /**
   * In-memory LRU cache
   */
  memory: {
    name: 'Memory Cache',
    cache: new Map<string, { value: any; timestamp: number; hits: number }>(),

    execute: async function (context: MiddlewareContext, config: any): Promise<MiddlewareResult> {
      const ttl = config.ttl || 300000; // 5 minutes default
      const maxSize = config.maxSize || 1000;
      const keyGenerator =
        config.keyGenerator ||
        ((ctx: MiddlewareContext) => JSON.stringify({ input: ctx.input, tool: ctx.toolName }));

      const key = keyGenerator(context);
      const now = Date.now();

      // Check if cached
      const cached = this.cache.get(key);
      if (cached && now - cached.timestamp < ttl) {
        cached.hits++;
        return {
          allowed: true,
          transformed: cached.value,
          cached: true,
          fromCache: true,
          metadata: {
            cacheHit: true,
            age: now - cached.timestamp,
            hits: cached.hits,
          },
        };
      }

      // Clean up old entries if cache is full
      if (this.cache.size >= maxSize) {
        const entries = Array.from(this.cache.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        const toDelete = entries.slice(0, Math.floor(maxSize * 0.1));
        toDelete.forEach(([key]) => this.cache.delete(key));
      }

      return {
        allowed: true,
        metadata: { cacheHit: false },
      };
    },

    store: function (key: string, value: any) {
      this.cache.set(key, {
        value,
        timestamp: Date.now(),
        hits: 0,
      });
    },
  },
};

/**
 * Logging middleware
 */
export const loggers = {
  /**
   * Structured console logger
   */
  console: {
    name: 'Console Logger',
    execute: async (context: MiddlewareContext, config: any): Promise<MiddlewareResult> => {
      const level = config.level || 'info';
      const includeInput = config.includeInput !== false;
      const includeMetadata = config.includeMetadata !== false;

      const logEntry = {
        timestamp: new Date().toISOString(),
        toolName: context.toolName,
        stepNumber: context.stepNumber,
        ...(includeInput && { input: context.input }),
        ...(includeMetadata && { metadata: context.metadata }),
      };

      switch (level) {
        case 'debug':
          logDebug('🔍 Tool Execution:', logEntry);
          break;
        case 'info':
          logInfo('ℹ️ Tool Execution:', logEntry);
          break;
        case 'warn':
          logWarn('⚠️ Tool Execution:', logEntry);
          break;
        case 'error':
          logError('❌ Tool Execution:', logEntry);
          break;
      }

      return {
        allowed: true,
        metadata: { logged: true, logLevel: level },
      };
    },
  },

  /**
   * Performance logger
   */
  performance: {
    name: 'Performance Logger',
    execute: async (context: MiddlewareContext, config: any): Promise<MiddlewareResult> => {
      const startTime = context.metadata.startTime || Date.now();
      const threshold = config.slowThreshold || 1000; // ms

      return {
        allowed: true,
        metadata: {
          performanceTracking: true,
          startTime,
          threshold,
        },
      };
    },

    logEnd: (context: MiddlewareContext, duration: number, config: any) => {
      const threshold = config.slowThreshold || 1000;

      if (duration > threshold) {
        logWarn(`⚠️ Slow Tool Execution: ${context.toolName} took ${duration}ms`);
      } else if (config.logAll) {
        logInfo(`⚡ Tool Execution: ${context.toolName} completed in ${duration}ms`);
      }
    },
  },
};

/**
 * Create middleware tool that applies middleware to other tools
 */
export function createMiddlewareTool(config: {
  description: string;
  middlewares: MiddlewareConfig[];
  targetTool: Tool;
}): Tool {
  const sortedMiddlewares = [...config.middlewares].sort((a, b) => a.priority - b.priority);

  return aiTool({
    description: `${config.description} (with middleware)`,
    parameters: (config.targetTool as any).parameters || (config.targetTool as any).inputSchema,
    execute: async (input: any, options: any) => {
      const context: MiddlewareContext = {
        input,
        metadata: { startTime: Date.now() },
        timestamp: Date.now(),
        toolName: config.description,
        stepNumber: options?.stepNumber,
      };

      let processedInput = input;
      let middlewareMetadata: Record<string, any> = {};

      // Apply pre-execution middleware
      for (const middleware of sortedMiddlewares.filter(m => m.enabled)) {
        let result: MiddlewareResult;

        switch (middleware.type) {
          case 'content-filter':
            if (typeof processedInput === 'string') {
              const filter = contentFilters.profanity; // Default to profanity filter
              result = await filter.execute(processedInput, middleware.config);
            } else {
              result = { allowed: true };
            }
            break;

          case 'rate-limiter':
            result = await rateLimiters.tokenBucket.execute(context, middleware.config);
            break;

          case 'cache':
            result = await caches.memory.execute(context, middleware.config);
            if (result.fromCache) {
              return result.transformed;
            }
            break;

          case 'logger':
            result = await loggers.console.execute(context, middleware.config);
            break;

          default:
            result = { allowed: true };
        }

        if (!result.allowed) {
          throw new Error(result.error || `Middleware ${middleware.name} blocked execution`);
        }

        if (result.transformed !== undefined) {
          processedInput = result.transformed;
        }

        if (result.metadata) {
          middlewareMetadata[middleware.name] = result.metadata;
        }
      }

      // Execute the actual tool
      const startTime = Date.now();
      let toolResult;

      try {
        toolResult = await config.targetTool.execute?.(processedInput, options);
      } catch (error) {
        // Log error if logger middleware is enabled
        const errorLogger = sortedMiddlewares.find(m => m.type === 'logger' && m.enabled);
        if (errorLogger) {
          logError('Tool execution failed', {
            tool: config.description,
            error: error instanceof Error ? error.message : error,
            input: processedInput,
          });
        }
        throw error;
      }

      const duration = Date.now() - startTime;

      // Apply post-execution middleware
      const performanceLogger = sortedMiddlewares.find(
        m => m.type === 'logger' && m.name === 'Performance Logger',
      );
      if (performanceLogger?.enabled) {
        loggers.performance.logEnd(context, duration, performanceLogger.config);
      }

      // Store in cache if cache middleware is enabled
      const cacheMiddleware = sortedMiddlewares.find(m => m.type === 'cache' && m.enabled);
      if (cacheMiddleware) {
        const keyGenerator =
          cacheMiddleware.config.keyGenerator ||
          ((ctx: MiddlewareContext) => JSON.stringify({ input: ctx.input, tool: ctx.toolName }));
        const key = keyGenerator(context);
        caches.memory.store(key, toolResult);
      }

      return {
        ...toolResult,
        _middleware: {
          applied: sortedMiddlewares.map(m => m.name),
          metadata: middlewareMetadata,
          duration,
        },
      };
    },
  });
}

/**
 * Predefined middleware configurations
 */
export const middlewarePresets = {
  /**
   * Basic content filtering and logging
   */
  basic: [
    {
      type: 'content-filter' as MiddlewareType,
      name: 'Basic Content Filter',
      enabled: true,
      priority: 1,
      config: { blockedWords: ['spam', 'abuse'] },
    },
    {
      type: 'logger' as MiddlewareType,
      name: 'Console Logger',
      enabled: true,
      priority: 10,
      config: { level: 'info' },
    },
  ],

  /**
   * Production-ready middleware stack
   */
  production: [
    {
      type: 'rate-limiter' as MiddlewareType,
      name: 'Rate Limiter',
      enabled: true,
      priority: 1,
      config: { maxTokens: 100, refillRate: 10 },
    },
    {
      type: 'content-filter' as MiddlewareType,
      name: 'Sensitive Data Filter',
      enabled: true,
      priority: 2,
      config: { allowWithRedaction: true },
    },
    {
      type: 'cache' as MiddlewareType,
      name: 'Memory Cache',
      enabled: true,
      priority: 3,
      config: { ttl: 300000, maxSize: 1000 },
    },
    {
      type: 'logger' as MiddlewareType,
      name: 'Performance Logger',
      enabled: true,
      priority: 10,
      config: { slowThreshold: 2000, logAll: false },
    },
  ],

  /**
   * Development middleware with verbose logging
   */
  development: [
    {
      type: 'logger' as MiddlewareType,
      name: 'Console Logger',
      enabled: true,
      priority: 1,
      config: { level: 'debug', includeInput: true, includeMetadata: true },
    },
    {
      type: 'logger' as MiddlewareType,
      name: 'Performance Logger',
      enabled: true,
      priority: 2,
      config: { slowThreshold: 500, logAll: true },
    },
  ],
};

/**
 * Helper functions to create tools with common middleware patterns
 */
export const middlewareTools = {
  /**
   * Add basic middleware (content filtering + logging)
   */
  withBasicMiddleware: (tool: Tool) =>
    createMiddlewareTool({
      description: tool.description || 'Tool with Basic Middleware',
      middlewares: middlewarePresets.basic,
      targetTool: tool,
    }),

  /**
   * Add production middleware (rate limiting + caching + filtering + logging)
   */
  withProductionMiddleware: (tool: Tool) =>
    createMiddlewareTool({
      description: tool.description || 'Tool with Production Middleware',
      middlewares: middlewarePresets.production,
      targetTool: tool,
    }),

  /**
   * Add development middleware (verbose logging)
   */
  withDevelopmentMiddleware: (tool: Tool) =>
    createMiddlewareTool({
      description: tool.description || 'Tool with Development Middleware',
      middlewares: middlewarePresets.development,
      targetTool: tool,
    }),

  /**
   * Add custom middleware
   */
  withCustomMiddleware: (tool: Tool, middlewares: MiddlewareConfig[]) =>
    createMiddlewareTool({
      description: tool.description || 'Tool with Custom Middleware',
      middlewares,
      targetTool: tool,
    }),
};
