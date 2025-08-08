/**
 * MCP Tool: Bounded Cache Management
 * Provides cache creation, management, and analytics
 * Enhanced with Node.js 22+ error handling, context tracking, and abort support
 */

import { debounce } from 'perfect-debounce';
import type { MCPToolResponse } from '../types/mcp';
import { AbortableToolArgs, throwIfAborted } from '../utils/abort-support';
import { CleanupResult, globalCacheRegistry } from '../utils/cache';
import { runWithContext } from '../utils/context';
import { createEnhancedMCPErrorResponse } from '../utils/error-handling';
import { ok, runTool } from '../utils/tool-helpers';
// WeakRef-based cache for large objects to prevent memory pressure
const largeCacheEntryRefs = new Map<string, WeakRef<any>>();
const cacheFinalizationRegistry = new FinalizationRegistry((key: string) => {
  largeCacheEntryRefs.delete(key);
  console.debug(`Large cache entry ${key} was garbage collected`);
});

export interface CreateBoundedCacheArgs extends AbortableToolArgs {
  name: string;
  maxSize?: number;
  ttl?: number;
  enableAnalytics?: boolean;
  useStructuredClone?: boolean;
  deepCopy?: boolean;
}

export interface CacheOperationArgs extends AbortableToolArgs {
  cacheName: string;
  operation: 'get' | 'set' | 'delete' | 'clear' | 'has' | 'size' | 'keys';
  key?: string;
  value?: unknown;
}

export interface CacheAnalyticsArgs extends AbortableToolArgs {
  cacheName?: string;
}

export interface CacheCleanupArgs extends AbortableToolArgs {
  cacheName?: string;
  force?: boolean;
}

export const createBoundedCacheTool = {
  name: 'create_bounded_cache',
  description: 'Create a bounded cache with LRU eviction, TTL, and analytics',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Unique name for the cache',
      },
      maxSize: {
        type: 'number',
        description: 'Maximum number of entries in the cache',
        default: 100,
      },
      ttl: {
        type: 'number',
        description: 'Time to live for cache entries in milliseconds',
        default: 1800000,
      },
      enableAnalytics: {
        type: 'boolean',
        description: 'Whether to enable analytics tracking',
        default: true,
      },
      useStructuredClone: {
        type: 'boolean',
        description: 'Use structured clone for better performance',
        default: true,
      },
      deepCopy: {
        type: 'boolean',
        description: 'Whether to deep copy cached values',
        default: true,
      },
      signal: {
        description: 'AbortSignal for cancelling the operation',
      },
    },
    required: ['name'],
  },

  async execute(args: CreateBoundedCacheArgs): Promise<MCPToolResponse> {
    return runTool('create_bounded_cache', 'create', async () => {
      const {
        name,
        maxSize = 100,
        ttl = 1800000,
        enableAnalytics = true,
        useStructuredClone = true,
        deepCopy = true,
        signal,
      } = args;

      // Check for abort signal at start
      throwIfAborted(signal);

      return runWithContext(
        {
          toolName: 'create_bounded_cache',
          metadata: { name, maxSize, ttl, enableAnalytics },
        },
        async () => {
          // Resource management wrapper for cache cleanup
          class CacheResource implements Disposable {
            constructor(
              public readonly cache: any,
              public readonly cacheName: string,
            ) {}

            [Symbol.dispose]() {
              // Ensure cache gets cleaned up properly
              try {
                this.cache.cleanup(true);
              } catch (error) {
                console.warn(`Cache cleanup warning for ${this.cacheName}: ${error}`);
              }
            }
          }

          const cache = globalCacheRegistry.create(name, {
            maxSize,
            ttl,
            enableAnalytics,
            useStructuredClone,
            deepCopy,
          });

          using cacheResource = new CacheResource(cache, name);

          return ok({
            success: true,
            cacheName: name,
            config: {
              maxSize,
              ttl,
              enableAnalytics,
              useStructuredClone,
              deepCopy,
            },
          });
        },
      );
    });
  },
};

export const cacheOperationTool = {
  name: 'cache_operation',
  description: 'Perform operations on a bounded cache (get, set, delete, clear)',
  inputSchema: {
    type: 'object',
    properties: {
      cacheName: {
        type: 'string',
        description: 'Name of the cache to operate on',
      },
      operation: {
        type: 'string',
        description: 'Operation to perform',
        enum: ['get', 'set', 'delete', 'clear', 'has', 'size', 'keys'],
      },
      key: {
        type: 'string',
        description: 'Key for get/set/delete/has operations',
      },
      value: {
        description: 'Value for set operation',
      },
      signal: {
        description: 'AbortSignal for cancelling the operation',
      },
    },
    required: ['cacheName', 'operation'],
  },

  async execute(args: CacheOperationArgs): Promise<MCPToolResponse> {
    try {
      const { cacheName, operation, key, value, signal } = args;

      // Check for abort signal at start
      throwIfAborted(signal);

      return runWithContext(
        {
          toolName: 'cache_operation',
          metadata: { cacheName, operation, key },
        },
        async () => {
          const cache = globalCacheRegistry.get(cacheName);
          if (!cache) {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: false,
                    error: `Cache '${cacheName}' not found`,
                  }),
                },
              ],
              isError: true,
            };
          }

          let result: unknown;

          switch (operation) {
            case 'get':
              if (!key) throw new Error('Key required for get operation');
              result = cache.get(key);
              break;
            case 'set':
              if (!key) throw new Error('Key required for set operation');

              // Use WeakRef for large objects to prevent memory pressure
              if (value && typeof value === 'object') {
                const stringifiedSize = JSON.stringify(value).length;
                if (stringifiedSize > 10000) {
                  // 10KB threshold
                  const weakRef = new WeakRef(value);
                  largeCacheEntryRefs.set(`${cacheName}:${key}`, weakRef);
                  cacheFinalizationRegistry.register(value, `${cacheName}:${key}`);
                }
              }

              cache.set(key, value);
              result = true;
              break;
            case 'delete':
              if (!key) throw new Error('Key required for delete operation');
              result = cache.delete(key);
              break;
            case 'clear':
              cache.clear();
              result = true;
              break;
            case 'has':
              if (!key) throw new Error('Key required for has operation');
              result = cache.has(key);
              break;
            case 'size':
              result = cache.size();
              break;
            case 'keys':
              result = cache.keys();
              break;
            default:
              throw new Error(`Unknown operation: ${operation}`);
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  operation,
                  result,
                }),
              },
            ],
          };
        },
      );
    } catch (error) {
      // Handle abort errors specially
      if (error instanceof Error && error.message.includes('aborted')) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: false, aborted: true }),
            },
          ],
          isError: true,
        };
      }

      return createEnhancedMCPErrorResponse(error, 'cache_operation', {
        contextInfo: 'Cache Operation',
      });
    }
  },
};

// Create debounced analytics function factory to prevent memory leaks
function createDebouncedGetAnalytics() {
  return debounce(
    async (cacheName?: string) => {
      if (cacheName) {
        const cache = globalCacheRegistry.get(cacheName);
        if (!cache) {
          throw new Error(`Cache '${cacheName}' not found`);
        }
        return cache.getAnalytics();
      } else {
        return globalCacheRegistry.getGlobalAnalytics();
      }
    },
    100, // 100ms debounce
    { leading: true },
  );
}

// Global debounced function with cleanup capability
let debouncedGetAnalytics = createDebouncedGetAnalytics();

// Cleanup function for memory management
export function cleanupBoundedCacheDebounce() {
  // Try to dispose the old debounced function if it has a dispose method
  const oldDebounced = debouncedGetAnalytics as any;
  if (typeof oldDebounced.dispose === 'function') {
    try {
      oldDebounced.dispose();
    } catch (error) {
      // Ignore disposal errors but log them
      console.warn('Failed to dispose debounced function:', error);
    }
  }

  // Create new debounced function
  debouncedGetAnalytics = createDebouncedGetAnalytics();
}

export const cacheAnalyticsTool = {
  name: 'cache_analytics',
  description: 'Get analytics and performance metrics for caches',
  inputSchema: {
    type: 'object',
    properties: {
      cacheName: {
        type: 'string',
        description: 'Name of specific cache (omit for global analytics)',
      },
      signal: {
        description: 'AbortSignal for cancelling the operation',
      },
    },
  },

  async execute(args: CacheAnalyticsArgs): Promise<MCPToolResponse> {
    try {
      const { cacheName, signal } = args;

      // Check for abort signal at start
      throwIfAborted(signal);

      return runWithContext(
        {
          toolName: 'cache_analytics',
          metadata: { cacheName },
        },
        async () => {
          // Use debounced analytics function
          const analytics = await debouncedGetAnalytics(cacheName);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  analytics,
                }),
              },
            ],
          };
        },
      );
    } catch (error) {
      // Handle abort errors specially
      if (error instanceof Error && error.message.includes('aborted')) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: false, aborted: true }),
            },
          ],
          isError: true,
        };
      }

      return createEnhancedMCPErrorResponse(error, 'cache_analytics', {
        contextInfo: 'Cache Analytics',
      });
    }
  },
};

export const cacheCleanupTool = {
  name: 'cache_cleanup',
  description: 'Perform memory cleanup on caches',
  inputSchema: {
    type: 'object',
    properties: {
      cacheName: {
        type: 'string',
        description: 'Name of specific cache (omit for global cleanup)',
      },
      force: {
        type: 'boolean',
        description: 'Force cleanup regardless of memory pressure',
        default: false,
      },
      signal: {
        description: 'AbortSignal for cancelling the operation',
      },
    },
  },

  async execute(args: CacheCleanupArgs): Promise<MCPToolResponse> {
    try {
      const { cacheName, force = false, signal } = args;

      // Check for abort signal at start
      throwIfAborted(signal);

      return runWithContext(
        {
          toolName: 'cache_cleanup',
          metadata: { cacheName, force },
        },
        async () => {
          let result: CleanupResult | Record<string, CleanupResult>;

          if (cacheName) {
            const cache = globalCacheRegistry.get(cacheName);
            if (!cache) {
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify({
                      success: false,
                      error: `Cache '${cacheName}' not found`,
                    }),
                  },
                ],
                isError: true,
              };
            }
            result = cache.cleanup(force);
          } else {
            result = globalCacheRegistry.cleanupAll();
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  cleanup: result,
                }),
              },
            ],
          };
        },
      );
    } catch (error) {
      // Handle abort errors specially
      if (error instanceof Error && error.message.includes('aborted')) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: false, aborted: true }),
            },
          ],
          isError: true,
        };
      }

      return createEnhancedMCPErrorResponse(error, 'cache_cleanup', {
        contextInfo: 'Cache Cleanup',
      });
    }
  },
};
