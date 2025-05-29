/**
 * Resource management utilities for Node.js 22 using AsyncDisposableStack
 */

// Check if AsyncDisposableStack is supported
const supportsAsyncDisposable = typeof Symbol.asyncDispose === 'symbol';

/**
 * Resource interface for cleanup operations
 */
export interface Resource {
  [Symbol.asyncDispose]?: () => Promise<void>;
  cleanup?: () => Promise<void>;
}

/**
 * Resource manager for AsyncDisposableStack
 */
export class ResourceManager {
  private cleanupFunctions: Array<() => Promise<void>> = [];
  private stack?: AsyncDisposableStack;

  constructor() {
    if (supportsAsyncDisposable) {
      this.stack = new AsyncDisposableStack();
    }
  }

  /**
   * Add a resource to be automatically cleaned up
   * @param resource Resource with cleanup method or Symbol.asyncDispose
   */
  add<T extends Resource>(resource: T): T {
    if (this.stack && typeof resource[Symbol.asyncDispose] === 'function') {
      this.stack.use(resource);
    } else if (typeof resource.cleanup === 'function') {
      if (this.stack) {
        this.stack.use({
          [Symbol.asyncDispose]: resource.cleanup.bind(resource)
        });
      } else {
        this.cleanupFunctions.push(resource.cleanup.bind(resource));
      }
    }
    return resource;
  }

  /**
   * Manually clean up all resources
   * Only needed when not using AsyncDisposableStack
   */
  async cleanup(): Promise<void> {
    if (this.stack) {
      await this.stack.disposeAsync();
    } else {
      // Run cleanup functions in reverse order (LIFO)
      for (const cleanup of this.cleanupFunctions.reverse()) {
        try {
          await cleanup();
        } catch (err) {
          // Import dynamically to avoid circular dependencies
          const { devLog } = await import('./observability');
          devLog.error('Error during resource cleanup:', err);
        }
      }
      this.cleanupFunctions = [];
    }
  }
}

/**
 * Execute a function with automatic resource cleanup
 * @param fn Function that receives a ResourceManager and returns a promise
 * @returns Promise with the function result
 */
export async function withResources<T>(
  fn: (resources: ResourceManager) => Promise<T>
): Promise<T> {
  const manager = new ResourceManager();

  try {
    return await fn(manager);
  } finally {
    await manager.cleanup();
  }
}

/**
 * Create a resource with cleanup function
 * @param value The resource value
 * @param cleanup Cleanup function
 * @returns Resource object
 */
export function createResource<T>(value: T, cleanup: () => Promise<void>): T & Resource {
  return Object.assign(value, {
    cleanup,
    ...(supportsAsyncDisposable ? { [Symbol.asyncDispose]: cleanup } : {})
  });
}

/**
 * Create a Redis connection resource that will be automatically closed
 * @param redis Redis client
 * @returns Resource-wrapped Redis client
 */
export function createRedisResource<T>(redis: T & { disconnect: () => Promise<void> }): T & Resource {
  return createResource(redis, () => redis.disconnect());
}

/**
 * Create a timeout resource that will be automatically cleared
 * @param ms Timeout in milliseconds
 * @param callback Callback function
 * @returns Resource-wrapped timeout ID
 */
export function createTimeoutResource(
  ms: number,
  callback: () => void
): { id: NodeJS.Timeout } & Resource {
  const id = setTimeout(callback, ms);
  return createResource({ id }, async () => clearTimeout(id));
}

/**
 * Create an interval resource that will be automatically cleared
 * @param ms Interval in milliseconds
 * @param callback Callback function
 * @returns Resource-wrapped interval ID
 */
export function createIntervalResource(
  ms: number,
  callback: () => void
): { id: NodeJS.Timeout } & Resource {
  const id = setInterval(callback, ms);
  return createResource({ id }, async () => clearInterval(id));
}
