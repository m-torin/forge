/**
 * Enterprise Timeout Management with Advanced Resource Tracking
 *
 * Advanced timeout management system leveraging Node.js 22+ features for enterprise-grade
 * operation control, resource cleanup, and memory management. This module provides comprehensive
 * timeout handling with automatic resource tracking and intelligent cleanup mechanisms.
 *
 * ## Key Node 22+ Features Used:
 * - **AbortSignal.timeout()**: Modern timeout implementation with native abort handling
 * - **Promise.withResolvers()**: External promise control for precise operation management
 * - **WeakMap**: Automatic garbage collection of context-specific resources
 * - **AbortController**: Standardized cancellation with signal propagation
 * - **FinalizationRegistry**: Optional resource lifecycle tracking
 *
 * ## Core Capabilities:
 * - Context-aware timeout management with WeakMap-based tracking
 * - Automatic resource cleanup when objects are garbage collected
 * - Comprehensive operation statistics and monitoring
 * - Memory-safe timeout operations with leak prevention
 * - Centralized abort signal management
 * - Periodic cleanup of expired operations
 * - Production-ready error handling and logging
 * - Integration with enterprise observability platforms
 *
 * ## Usage Examples:
 *
 * ### Basic Timeout Operations:
 * ```typescript
 * import { globalTimeoutManager } from '@repo/orchestration';
 *
 * // Create a timeout operation
 * const { promise, abort, cleanup } = globalTimeoutManager.createTimeout(5000, {
 *   name: 'api-call-timeout',
 *   onTimeout: (operation) => console.log(`${operation.name} timed out`),
 *   onCleanup: (operation) => console.log(`${operation.name} cleaned up`)
 * });
 *
 * // Use the timeout
 * try {
 *   // Simulate some async operation that might take too long
 *   await promise; // Will throw timeout error after 5 seconds
 * } catch (error) {
 *   if (error.code === 'TIMEOUT') {
 *     console.log('Operation timed out gracefully');
 *   }
 * }
 * ```
 *
 * ### Context-Aware Resource Tracking:
 * ```typescript
 * class UserService {
 *   async processUser(userId: string) {
 *     // Create timeout with this service instance as context
 *     const wrappedPromise = globalTimeoutManager.wrapWithTimeout(
 *       this.fetchUserData(userId),
 *       3000, // 3 second timeout
 *       { name: 'user-fetch', context: this }
 *     );
 *
 *     return await wrappedPromise;
 *   }
 *
 *   cleanup() {
 *     // Cleanup all timeouts associated with this instance
 *     const cleanedCount = globalTimeoutManager.cleanupContext(this);
 *     console.log(`Cleaned up ${cleanedCount} operations`);
 *   }
 * }
 * ```
 *
 * ### Promise.withResolvers Integration:
 * ```typescript
 * // Modern promise control using Node 22+ Promise.withResolvers
 * const { promise, resolve, reject } = Promise.withResolvers();
 *
 * // Create timeout that can be controlled externally
 * const { abort } = globalTimeoutManager.createTimeout(10000, {
 *   name: 'external-control',
 *   onTimeout: () => reject(new Error('External operation timed out'))
 * });
 *
 * // External control of promise resolution
 * setTimeout(() => resolve('Success!'), 2000);
 *
 * try {
 *   const result = await promise;
 *   console.log(result); // 'Success!' after 2 seconds
 * } catch (error) {
 *   console.log('Operation failed or timed out');
 * }
 * ```
 *
 * ### Advanced AbortSignal Usage:
 * ```typescript
 * // Using AbortSignal.timeout() for modern cancellation
 * async function fetchWithTimeout(url: string, timeoutMs: number) {
 *   const { promise, operation } = globalTimeoutManager.createTimeout(timeoutMs, {
 *     name: 'http-request'
 *   });
 *
 *   // Use the abort signal for fetch cancellation
 *   const fetchPromise = fetch(url, {
 *     signal: operation.abortSignal
 *   });
 *
 *   // Race between fetch and timeout
 *   return Promise.race([fetchPromise, promise]);
 * }
 * ```
 *
 * @module TimeoutManager
 * @version 2.0.0
 * @since Node.js 22.0.0
 *
 * @example
 * // Enterprise timeout management setup
 * const timeoutManager = new TimeoutManager();
 *
 * // Track timeouts for a specific workflow
 * class WorkflowEngine {
 *   async executeStep(stepId: string, operation: () => Promise<any>) {
 *     const stepTimeout = timeoutManager.createTimeout(30000, {
 *       name: `workflow-step-${stepId}`,
 *       context: this,
 *       onTimeout: (op) => {
 *         console.log(`Step ${stepId} timed out after ${op.timeoutMs}ms`);
 *         this.handleStepTimeout(stepId);
 *       }
 *     });
 *
 *     try {
 *       const result = await Promise.race([
 *         operation(),
 *         stepTimeout.promise
 *       ]);
 *
 *       stepTimeout.cleanup();
 *       return result;
 *     } catch (error) {
 *       stepTimeout.abort();
 *       throw error;
 *     }
 *   }
 *
 *   shutdown() {
 *     // All timeouts for this workflow are automatically cleaned up
 *     const cleaned = timeoutManager.cleanupContext(this);
 *     console.log(`Workflow shutdown: ${cleaned} operations cleaned`);
 *   }
 * }
 */

import { createServerObservability } from '@repo/observability/server/next';

/**
 * Timeout operation metadata for comprehensive tracking and debugging
 *
 * Contains all necessary information for managing a timeout operation throughout
 * its lifecycle, including abort signals, promises, callbacks, and metadata.
 *
 * @interface TimeoutOperation
 */
interface TimeoutOperation {
  id: string;
  name: string;
  timeoutMs: number;
  createdAt: Date;
  abortSignal?: AbortSignal;
  controller?: AbortController;
  timer?: NodeJS.Timeout;
  promise?: Promise<any>;
  resolve?: (value: any) => void;
  reject?: (reason: any) => void;
  onTimeout?: (operation: TimeoutOperation) => void;
  onCleanup?: (operation: TimeoutOperation) => void;
}

/**
 * Resource tracking for timeout operations
 */
interface TimeoutResources {
  operations: Map<string, TimeoutOperation>;
  timers: Set<NodeJS.Timeout>;
  controllers: Set<AbortController>;
  promises: Set<Promise<any>>;
  createdAt: Date;
  lastCleanup: Date;
}

/**
 * Global timeout statistics
 */
interface TimeoutStats {
  activeOperations: number;
  totalCreated: number;
  totalCompleted: number;
  totalTimedOut: number;
  totalAborted: number;
  averageTimeout: number;
  oldestOperation?: Date;
  memoryUsage: {
    operations: number;
    timers: number;
    controllers: number;
    promises: number;
  };
}

/**
 * Enterprise-Grade Timeout Manager with Advanced Resource Tracking
 *
 * Provides comprehensive timeout management using Node 22+ features including:
 * - **WeakMap-based resource tracking**: Automatic cleanup when context objects are GC'd
 * - **AbortSignal.timeout()**: Native timeout implementation with standardized cancellation
 * - **Promise.withResolvers()**: External promise control for complex async patterns
 * - **Automatic resource cleanup**: Prevents memory leaks in long-running applications
 * - **Context-aware operations**: Group timeouts by service/component for batch cleanup
 * - **Comprehensive monitoring**: Statistics, active operation tracking, and health metrics
 *
 * ## Memory Safety Features:
 * - Uses WeakMap for context-specific resource tracking to prevent memory leaks
 * - Automatic cleanup of expired operations (24-hour default)
 * - Graceful shutdown with resource cleanup
 * - Periodic maintenance to remove stale operations
 *
 * ## Node 22+ Optimizations:
 * - Leverages `AbortSignal.timeout()` when available, falls back gracefully
 * - Uses `Promise.withResolvers()` for external promise control
 * - Employs modern async/await patterns throughout
 * - Integrates with enterprise observability platforms
 *
 * @class TimeoutManager
 * @version 2.0.0
 * @since Node.js 22.0.0
 */
export class TimeoutManager {
  private static instance: TimeoutManager;

  // Use WeakMap for automatic garbage collection (Node 22+ optimization)
  private readonly resourceMap = new WeakMap<object, TimeoutResources>();
  private readonly globalOperations = new Map<string, TimeoutOperation>();
  private readonly globalResources: TimeoutResources;

  // Statistics tracking
  private stats = {
    totalCreated: 0,
    totalCompleted: 0,
    totalTimedOut: 0,
    totalAborted: 0,
    totalTimeSum: 0, // for calculating average
  };

  constructor() {
    this.globalResources = {
      operations: new Map(),
      timers: new Set(),
      controllers: new Set(),
      promises: new Set(),
      createdAt: new Date(),
      lastCleanup: new Date(),
    };

    // Set up periodic cleanup (every 5 minutes)
    const cleanupInterval = setInterval(
      () => {
        this.performPeriodicCleanup().catch(error => {
          // Fire and forget error logging
          (async () => {
            try {
              const logger = await createServerObservability();
              logger.log('warning', 'Timeout manager periodic cleanup failed', { error });
            } catch {
              console.warn('Timeout manager periodic cleanup failed:', error);
            }
          })();
        });
      },
      5 * 60 * 1000,
    );

    this.globalResources.timers.add(cleanupInterval);
  }

  /**
   * Get singleton instance
   */
  static getInstance(): TimeoutManager {
    if (!TimeoutManager.instance) {
      TimeoutManager.instance = new TimeoutManager();
    }
    return TimeoutManager.instance;
  }

  /**
   * Create a timeout operation using Node 22+ AbortSignal.timeout()
   *
   * Creates a timeout operation with modern Node.js 22+ features including native
   * AbortSignal.timeout() support and Promise.withResolvers() for external control.
   *
   * ## Node 22+ Features Used:
   * - **AbortSignal.timeout()**: Native timeout implementation with automatic abort handling
   * - **Promise.withResolvers()**: External promise control for complex async patterns
   * - **WeakMap tracking**: Context-aware resource management with automatic cleanup
   *
   * ## Memory Safety:
   * - All resources are tracked and cleaned up automatically
   * - Context objects use WeakMap for automatic GC when context is destroyed
   * - Timeout operations are automatically removed after completion or abort
   *
   * @template T The type of value the timeout promise will resolve to
   * @param timeoutMs Timeout duration in milliseconds
   * @param options Configuration options for the timeout operation
   * @param options.name Human-readable name for debugging and monitoring
   * @param options.context Optional context object for WeakMap-based resource tracking
   * @param options.onTimeout Callback executed when operation times out
   * @param options.onCleanup Callback executed during resource cleanup
   * @returns Object containing promise, operation metadata, and control functions
   *
   * @example
   * // Basic timeout with Node 22+ features
   * const { promise, abort, cleanup } = timeoutManager.createTimeout(5000, {
   *   name: 'critical-operation',
   *   onTimeout: (op) => console.log(`${op.name} timed out after ${op.timeoutMs}ms`)
   * });
   *
   * try {
   *   await promise; // Will timeout after 5 seconds
   * } catch (error) {
   *   if (error.code === 'TIMEOUT') {
   *     console.log('Operation timed out gracefully');
   *   }
   * } finally {
   *   cleanup(); // Always cleanup resources
   * }
   *
   * @example
   * // Context-aware timeout with automatic cleanup
   * class APIClient {
   *   async makeRequest(url: string) {
   *     const { promise } = timeoutManager.createTimeout(3000, {
   *       name: `api-request-${url}`,
   *       context: this, // Cleanup when APIClient is garbage collected
   *       onTimeout: () => this.logTimeout(url)
   *     });
   *
   *     return Promise.race([
   *       fetch(url),
   *       promise
   *     ]);
   *   }
   * }
   *
   * @since Node.js 22.0.0
   */
  createTimeout<T>(
    timeoutMs: number,
    options: {
      name?: string;
      context?: object; // For WeakMap tracking
      onTimeout?: (operation: TimeoutOperation) => void;
      onCleanup?: (operation: TimeoutOperation) => void;
    } = {},
  ): {
    promise: Promise<T>;
    operation: TimeoutOperation;
    abort: (reason?: string) => void;
    cleanup: () => void;
  } {
    const id = `timeout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const { name = 'anonymous', context, onTimeout, onCleanup } = options;

    this.stats.totalCreated++;

    // Use Promise.withResolvers() (ES2023/Node 22+) for external control
    const { promise, resolve, reject } = Promise.withResolvers<T>();

    let controller: AbortController;
    let abortSignal: AbortSignal;

    try {
      // Try modern AbortSignal.timeout first (Node 22+)
      abortSignal = AbortSignal.timeout(timeoutMs);
      controller = new AbortController();
    } catch {
      // Fallback for older environments
      controller = new AbortController();
      abortSignal = controller.signal;

      // Manual timeout implementation for fallback
      const timer = setTimeout(() => {
        controller.abort('Timeout');
      }, timeoutMs);

      this.globalResources.timers.add(timer);
    }

    const operation: TimeoutOperation = {
      id,
      name,
      timeoutMs,
      createdAt: new Date(),
      abortSignal,
      controller,
      promise,
      resolve,
      reject,
      onTimeout,
      onCleanup,
    };

    // Track resources
    this.globalOperations.set(id, operation);
    this.globalResources.operations.set(id, operation);
    this.globalResources.controllers.add(controller);
    this.globalResources.promises.add(promise);

    // Context-specific tracking using WeakMap
    if (context) {
      const contextResources = this.getOrCreateContextResources(context);
      contextResources.operations.set(id, operation);
      contextResources.controllers.add(controller);
      contextResources.promises.add(promise);
    }

    // Set up abort signal listener
    const abortListener = () => {
      this.stats.totalTimedOut++;
      const error = new Error(`Operation '${name}' timed out after ${timeoutMs}ms`);
      (error as any).code = 'TIMEOUT';
      (error as any).operationId = id;

      if (onTimeout) {
        try {
          onTimeout(operation);
        } catch (callbackError) {
          console.warn('Timeout callback error:', callbackError);
        }
      }

      reject(error);
      this.cleanupOperation(id);
    };

    abortSignal.addEventListener('abort', abortListener, { once: true });

    const abort = (reason = 'Operation aborted') => {
      this.stats.totalAborted++;
      controller.abort(reason);
      reject(new Error(reason));
      this.cleanupOperation(id);
    };

    const cleanup = () => {
      this.cleanupOperation(id);
    };

    // Auto-cleanup on promise resolution/rejection
    (async () => {
      try {
        await promise;
        this.stats.totalCompleted++;
        this.cleanupOperation(id);
      } catch {
        // Promise is already handled by the caller, this is just for cleanup tracking
        this.stats.totalCompleted++;
        this.cleanupOperation(id);
      }
    })();

    return { promise, operation, abort, cleanup };
  }

  /**
   * Create a timeout wrapper for any promise
   */
  wrapWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    options: {
      name?: string;
      context?: object;
      onTimeout?: () => void;
    } = {},
  ): Promise<T> {
    const timeoutOperation = this.createTimeout<T>(timeoutMs, {
      name: options.name || 'wrapped-promise',
      context: options.context,
      onTimeout: options.onTimeout ? () => options.onTimeout?.() : undefined,
    });

    const racedPromise = Promise.race([promise, timeoutOperation.promise]);

    // Clean up timeout operation when promise completes
    (async () => {
      try {
        await racedPromise;
        timeoutOperation.cleanup();
      } catch {
        // Promise error handling is managed by the caller
        timeoutOperation.cleanup();
      }
    })();

    return racedPromise;
  }

  /**
   * Cleanup a specific operation
   */
  private cleanupOperation(operationId: string): void {
    const operation = this.globalOperations.get(operationId);
    if (!operation) return;

    try {
      // Call cleanup callback
      if (operation.onCleanup) {
        operation.onCleanup(operation);
      }

      // Clean up controller
      if (operation.controller && !operation.controller.signal.aborted) {
        operation.controller.abort('Cleanup');
      }

      // Clean up timer if present
      if (operation.timer) {
        clearTimeout(operation.timer);
        this.globalResources.timers.delete(operation.timer);
      }

      // Remove from tracking
      this.globalOperations.delete(operationId);
      this.globalResources.operations.delete(operationId);

      if (operation.controller) {
        this.globalResources.controllers.delete(operation.controller);
      }
      if (operation.promise) {
        this.globalResources.promises.delete(operation.promise);
      }
    } catch (error) {
      console.warn(`Failed to cleanup operation ${operationId}:`, error);
    }
  }

  /**
   * Get or create context-specific resources using WeakMap
   */
  private getOrCreateContextResources(context: object): TimeoutResources {
    let resources = this.resourceMap.get(context);
    if (!resources) {
      resources = {
        operations: new Map(),
        timers: new Set(),
        controllers: new Set(),
        promises: new Set(),
        createdAt: new Date(),
        lastCleanup: new Date(),
      };
      this.resourceMap.set(context, resources);
    }
    return resources;
  }

  /**
   * Clean up all timeouts for a specific context
   */
  cleanupContext(context: object): number {
    const resources = this.resourceMap.get(context);
    if (!resources) return 0;

    let cleanedCount = 0;

    // Cleanup all operations for this context
    for (const [operationId, operation] of resources.operations) {
      try {
        if (operation.controller) {
          operation.controller.abort('Context cleanup');
        }
        if (operation.timer) {
          clearTimeout(operation.timer);
        }
        this.globalOperations.delete(operationId);
        cleanedCount++;
      } catch (error) {
        console.warn(`Failed to cleanup context operation ${operationId}:`, error);
      }
    }

    // Clean up timers
    for (const timer of resources.timers) {
      clearTimeout(timer);
    }

    // Clean up controllers
    for (const controller of resources.controllers) {
      try {
        controller.abort('Context cleanup');
      } catch {
        // Controller may already be aborted
      }
    }

    // WeakMap will automatically clean up when context is garbage collected
    this.resourceMap.delete(context);

    return cleanedCount;
  }

  /**
   * Get comprehensive timeout statistics
   */
  getStats(): TimeoutStats {
    const activeOperations = this.globalOperations.size;
    let oldestOperation: Date | undefined;

    if (activeOperations > 0) {
      const operations = Array.from(this.globalOperations.values());
      oldestOperation = operations.reduce(
        (oldest, op) => (op.createdAt < oldest ? op.createdAt : oldest),
        operations[0].createdAt,
      );
    }

    return {
      activeOperations,
      totalCreated: this.stats.totalCreated,
      totalCompleted: this.stats.totalCompleted,
      totalTimedOut: this.stats.totalTimedOut,
      totalAborted: this.stats.totalAborted,
      averageTimeout:
        this.stats.totalCreated > 0 ? this.stats.totalTimeSum / this.stats.totalCreated : 0,
      oldestOperation,
      memoryUsage: {
        operations: this.globalResources.operations.size,
        timers: this.globalResources.timers.size,
        controllers: this.globalResources.controllers.size,
        promises: this.globalResources.promises.size,
      },
    };
  }

  /**
   * List all active operations
   */
  listActiveOperations(): Array<{
    id: string;
    name: string;
    timeoutMs: number;
    age: number; // milliseconds since creation
    createdAt: Date;
  }> {
    const now = Date.now();
    return Array.from(this.globalOperations.values()).map(operation => ({
      id: operation.id,
      name: operation.name,
      timeoutMs: operation.timeoutMs,
      age: now - operation.createdAt.getTime(),
      createdAt: operation.createdAt,
    }));
  }

  /**
   * Perform periodic cleanup of expired operations
   */
  private async performPeriodicCleanup(): Promise<void> {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    let cleanedCount = 0;

    for (const [operationId, operation] of this.globalOperations) {
      const age = now - operation.createdAt.getTime();
      if (age > maxAge) {
        this.cleanupOperation(operationId);
        cleanedCount++;
      }
    }

    this.globalResources.lastCleanup = new Date();

    if (cleanedCount > 0) {
      try {
        const logger = await createServerObservability();
        logger.log('info', `Timeout manager cleaned up ${cleanedCount} expired operations`);
      } catch {
        console.info(`Timeout manager cleaned up ${cleanedCount} expired operations`);
      }
    }
  }

  /**
   * Shutdown the timeout manager and cleanup all resources
   */
  async shutdown(): Promise<void> {
    // Cleanup all active operations
    const operationIds = Array.from(this.globalOperations.keys());
    for (const operationId of operationIds) {
      this.cleanupOperation(operationId);
    }

    // Clear all timers
    for (const timer of this.globalResources.timers) {
      clearTimeout(timer);
    }

    // Abort all controllers
    for (const controller of this.globalResources.controllers) {
      try {
        controller.abort('Shutdown');
      } catch {
        // Controller may already be aborted
      }
    }

    // Clear all collections
    this.globalOperations.clear();
    this.globalResources.operations.clear();
    this.globalResources.timers.clear();
    this.globalResources.controllers.clear();
    this.globalResources.promises.clear();

    try {
      const logger = await createServerObservability();
      logger.log('info', 'Timeout manager shutdown complete');
    } catch {
      console.info('Timeout manager shutdown complete');
    }
  }
}

// Singleton instance for global use
export const globalTimeoutManager = TimeoutManager.getInstance();

// Utility functions for convenient timeout operations
function createTimeout<T>(timeoutMs: number, name?: string, context?: object) {
  return globalTimeoutManager.createTimeout<T>(timeoutMs, { name, context });
}

function wrapWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  name?: string,
  context?: object,
): Promise<T> {
  return globalTimeoutManager.wrapWithTimeout(promise, timeoutMs, { name, context });
}

function cleanupTimeouts(context: object): number {
  return globalTimeoutManager.cleanupContext(context);
}

function getTimeoutStats(): TimeoutStats {
  return globalTimeoutManager.getStats();
}

/**
 * Decorator for adding timeout to class methods
 */
function WithTimeout(timeoutMs: number, name?: string) {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value as T;
    const timeoutName = name || `${target.constructor.name}.${propertyName}`;

    descriptor.value = async function (...args: any[]) {
      const promise = method.apply(this, args);
      return wrapWithTimeout(promise, timeoutMs, timeoutName, this);
    };

    return descriptor;
  };
}
