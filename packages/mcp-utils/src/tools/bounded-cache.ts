/**
 * MCP Tool: Bounded Cache Management
 * Provides cache creation, management, and analytics
 */

import { globalCacheRegistry, BoundedCacheOptions, CleanupResult } from '../utils/cache';

export interface MCPToolResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError?: boolean;
}

export interface CreateBoundedCacheArgs {
  name: string;
  maxSize?: number;
  ttl?: number;
  enableAnalytics?: boolean;
}

export interface CacheOperationArgs {
  cacheName: string;
  operation: 'get' | 'set' | 'delete' | 'clear' | 'has' | 'size' | 'keys';
  key?: string;
  value?: any;
}

export interface CacheAnalyticsArgs {
  cacheName?: string;
}

export interface CacheCleanupArgs {
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
        description: 'Unique name for the cache'
      },
      maxSize: {
        type: 'number',
        description: 'Maximum number of entries in the cache',
        default: 100
      },
      ttl: {
        type: 'number',
        description: 'Time to live for cache entries in milliseconds',
        default: 1800000
      },
      enableAnalytics: {
        type: 'boolean',
        description: 'Whether to enable analytics tracking',
        default: true
      }
    },
    required: ['name']
  },

  async execute(args: CreateBoundedCacheArgs): Promise<MCPToolResponse> {
    try {
      const { name, maxSize = 100, ttl = 1800000, enableAnalytics = true } = args;
      
      const cache = globalCacheRegistry.create(name, {
        maxSize,
        ttl,
        enableAnalytics
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              cacheName: name,
              config: {
                maxSize,
                ttl,
                enableAnalytics
              }
            })
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: (error as Error).message
            })
          }
        ],
        isError: true
      };
    }
  }
};

export const cacheOperationTool = {
  name: 'cache_operation',
  description: 'Perform operations on a bounded cache (get, set, delete, clear)',
  inputSchema: {
    type: 'object',
    properties: {
      cacheName: {
        type: 'string',
        description: 'Name of the cache to operate on'
      },
      operation: {
        type: 'string',
        description: 'Operation to perform',
        enum: ['get', 'set', 'delete', 'clear', 'has', 'size', 'keys']
      },
      key: {
        type: 'string',
        description: 'Key for get/set/delete/has operations'
      },
      value: {
        description: 'Value for set operation'
      }
    },
    required: ['cacheName', 'operation']
  },

  async execute(args: CacheOperationArgs): Promise<MCPToolResponse> {
    try {
      const { cacheName, operation, key, value } = args;
      
      const cache = globalCacheRegistry.get(cacheName);
      if (!cache) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: `Cache '${cacheName}' not found`
              })
            }
          ],
          isError: true
        };
      }

      let result: any;
      
      switch (operation) {
        case 'get':
          if (!key) throw new Error('Key required for get operation');
          result = cache.get(key);
          break;
        case 'set':
          if (!key) throw new Error('Key required for set operation');
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
              result
            })
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: (error as Error).message
            })
          }
        ],
        isError: true
      };
    }
  }
};

export const cacheAnalyticsTool = {
  name: 'cache_analytics',
  description: 'Get analytics and performance metrics for caches',
  inputSchema: {
    type: 'object',
    properties: {
      cacheName: {
        type: 'string',
        description: 'Name of specific cache (omit for global analytics)'
      }
    }
  },

  async execute(args: CacheAnalyticsArgs): Promise<MCPToolResponse> {
    try {
      const { cacheName } = args;
      
      let analytics: any;
      
      if (cacheName) {
        const cache = globalCacheRegistry.get(cacheName);
        if (!cache) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: `Cache '${cacheName}' not found`
                })
              }
            ],
            isError: true
          };
        }
        analytics = cache.getAnalytics();
      } else {
        analytics = globalCacheRegistry.getGlobalAnalytics();
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              analytics
            })
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: (error as Error).message
            })
          }
        ],
        isError: true
      };
    }
  }
};

export const cacheCleanupTool = {
  name: 'cache_cleanup',
  description: 'Perform memory cleanup on caches',
  inputSchema: {
    type: 'object',
    properties: {
      cacheName: {
        type: 'string',
        description: 'Name of specific cache (omit for global cleanup)'
      },
      force: {
        type: 'boolean',
        description: 'Force cleanup regardless of memory pressure',
        default: false
      }
    }
  },

  async execute(args: CacheCleanupArgs): Promise<MCPToolResponse> {
    try {
      const { cacheName, force = false } = args;
      
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
                  error: `Cache '${cacheName}' not found`
                })
              }
            ],
            isError: true
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
              cleanup: result
            })
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: (error as Error).message
            })
          }
        ],
        isError: true
      };
    }
  }
};