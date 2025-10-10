/**
 * Circuit breaker pattern implementation using opossum
 */

import OpossumCircuitBreaker from 'opossum';

import { createServerObservability } from '@repo/observability/server/next';
import { CircuitBreakerPattern, PatternContext, PatternResult } from '../types/patterns';
import { CircuitBreakerError } from '../utils/errors';

export interface CircuitBreakerOptions extends Partial<CircuitBreakerPattern> {
  /** Context for the operation */
  context?: Partial<PatternContext>;
  /** Name for the circuit breaker */
  name?: string;
}

/**
 * Resource tracking for circuit breakers to ensure proper cleanup
 */
interface CircuitBreakerResources {
  eventListeners: Array<{ event: string; listener: (...args: any[]) => void }>;
  timers: Set<NodeJS.Timeout>;
  intervals: Set<NodeJS.Timeout>;
  abortControllers: Set<AbortController>;
  createdAt: Date;
  lastUsed: Date;
}

/**
 * Circuit Breaker Manager with enhanced WeakMap-based resource tracking
 */
class CircuitBreakerManager {
  private breakers = new Map<string, OpossumCircuitBreaker<unknown[], unknown>>();
  // Use WeakMap for automatic garbage collection of cleanup resources (Node 22+ optimization)
  private readonly resourceTracking = new WeakMap<
    OpossumCircuitBreaker<unknown[], unknown>,
    CircuitBreakerResources
  >();

  /**
   * Remove all circuit breakers with comprehensive resource cleanup
   */
  clear(): void {
    for (const [_name, breaker] of this.breakers) {
      this.cleanupBreakerResources(breaker);
    }
    this.breakers.clear();
  }

  /**
   * Comprehensive cleanup of circuit breaker resources using WeakMap tracking
   */
  private cleanupBreakerResources(breaker: OpossumCircuitBreaker<unknown[], unknown>): void {
    const resources = this.resourceTracking.get(breaker);

    if (resources) {
      // Clean up tracked event listeners
      for (const { event, listener } of resources.eventListeners) {
        try {
          // Use off method which is the standard EventEmitter method
          (breaker as any).off(event, listener);
        } catch (_error) {
          try {
            // Fallback to removeListener if off is not available
            (breaker as any).removeListener?.(event, listener);
          } catch (fallbackError) {
            // Log cleanup errors but continue cleanup process

            console.warn(`Failed to remove listener for event '${event}':`, fallbackError);
          }
        }
      }

      // Clean up any tracked timers and intervals
      for (const timer of resources.timers) {
        clearTimeout(timer);
      }
      resources.timers.clear();

      for (const interval of resources.intervals) {
        clearInterval(interval);
      }
      resources.intervals.clear();

      // Clean up any tracked abort controllers
      for (const controller of resources.abortControllers) {
        try {
          controller.abort('Circuit breaker cleanup');
        } catch (error) {
          // Log abort errors but continue cleanup

          console.warn('Failed to abort controller during cleanup:', error);
        }
      }
      resources.abortControllers.clear();
    }

    // Standard opossum cleanup
    if (
      Object.hasOwn(breaker, 'removeAllListeners') &&
      typeof (breaker as any).removeAllListeners === 'function'
    ) {
      try {
        (breaker as any).removeAllListeners();
      } catch (error) {
        console.warn('Failed to remove all listeners:', error);
      }
    }

    // Call destroy method if available
    if (typeof (breaker as any).destroy === 'function') {
      try {
        (breaker as any).destroy();
      } catch (error) {
        console.warn('Failed to destroy circuit breaker:', error);
      }
    }

    // WeakMap will automatically clean up when breaker is garbage collected
    this.resourceTracking.delete(breaker);
  }

  /**
   * Get all circuit breaker statistics
   */
  getAllStats(): any[] {
    return Array.from(this.breakers.keys()).map((name: any) => this.getStats(name));
  }

  /**
   * Get or create a circuit breaker
   */
  getCircuitBreaker<T extends any[], R>(
    name: string,
    fn: (...args: T) => Promise<R>,
    options: CircuitBreakerOptions = {},
  ): OpossumCircuitBreaker<T, R> {
    if (this.breakers.has(name)) {
      return this.breakers.get(name) as OpossumCircuitBreaker<T, R>;
    }

    const pattern: CircuitBreakerPattern = {
      failureThreshold: 5,
      minimumCallsToTrip: 10,
      resetTimeout: 30000, // 30 seconds
      rollingCountWindow: 10000, // 10 seconds
      timeout: 60000, // 1 minute
      ...options,
    };

    const breaker = new OpossumCircuitBreaker(fn, {
      capacity: 10,
      errorFilter: options.errorFilter,
      errorThresholdPercentage:
        (pattern.failureThreshold / (pattern.minimumCallsToTrip || 10)) * 100,
      group: 'orchestration',
      name,
      resetTimeout: pattern.resetTimeout,
      rollingCountBuckets: 10,
      // Additional opossum options
      rollingCountTimeout: pattern.rollingCountWindow,
      timeout: pattern.timeout,
      volumeThreshold: pattern.minimumCallsToTrip,
    });

    // Initialize WeakMap-based resource tracking for comprehensive cleanup
    const resources: CircuitBreakerResources = {
      eventListeners: [],
      timers: new Set(),
      intervals: new Set(),
      abortControllers: new Set(),
      createdAt: new Date(),
      lastUsed: new Date(),
    };
    this.resourceTracking.set(breaker, resources);

    // Helper function to track event listeners for proper cleanup
    const trackEventListener = (event: string, listener: (...args: any[]) => void) => {
      resources.eventListeners.push({ event, listener });
      (breaker as any).on(event, listener);
    };

    // Set up event handlers with tracking
    if (pattern.onOpen) {
      trackEventListener('open', pattern.onOpen);
    }

    if (pattern.onClose) {
      trackEventListener('close', pattern.onClose);
    }

    if (pattern.onHalfOpen) {
      trackEventListener('halfOpen', pattern.onHalfOpen);
    }

    // Default event handlers for logging (with tracking)
    trackEventListener('open', async () => {
      resources.lastUsed = new Date();
      try {
        const logger = await createServerObservability();
        logger.log('warning', `Circuit breaker '${name}' opened`);
      } catch {
        // Fallback to console if logger fails
      }
    });

    trackEventListener('halfOpen', async () => {
      resources.lastUsed = new Date();
      try {
        const logger = await createServerObservability();
        logger.log('info', `Circuit breaker '${name}' half-opened`);
      } catch {
        // Fallback to console if logger fails
      }
    });

    trackEventListener('close', async () => {
      resources.lastUsed = new Date();
      try {
        const logger = await createServerObservability();
        logger.log('info', `Circuit breaker '${name}' closed`);
      } catch {
        // Fallback to console if logger fails
      }
    });

    this.breakers.set(name, breaker);
    return breaker;
  }

  /**
   * Add a timer to the resource tracking for a specific circuit breaker
   */
  addTimer(name: string, timer: NodeJS.Timeout): boolean {
    const breaker = this.breakers.get(name);
    if (!breaker) return false;

    const resources = this.resourceTracking.get(breaker);
    if (resources) {
      resources.timers.add(timer);
      return true;
    }
    return false;
  }

  /**
   * Add an interval to the resource tracking for a specific circuit breaker
   */
  addInterval(name: string, interval: NodeJS.Timeout): boolean {
    const breaker = this.breakers.get(name);
    if (!breaker) return false;

    const resources = this.resourceTracking.get(breaker);
    if (resources) {
      resources.intervals.add(interval);
      return true;
    }
    return false;
  }

  /**
   * Add an abort controller to the resource tracking for a specific circuit breaker
   */
  addAbortController(name: string, controller: AbortController): boolean {
    const breaker = this.breakers.get(name);
    if (!breaker) return false;

    const resources = this.resourceTracking.get(breaker);
    if (resources) {
      resources.abortControllers.add(controller);
      return true;
    }
    return false;
  }

  /**
   * Get resource usage statistics for all circuit breakers
   */
  getResourceStats(): Array<{
    name: string;
    eventListeners: number;
    timers: number;
    intervals: number;
    abortControllers: number;
    createdAt: Date;
    lastUsed: Date;
    age: number; // milliseconds since creation
  }> {
    const stats: Array<{
      name: string;
      eventListeners: number;
      timers: number;
      intervals: number;
      abortControllers: number;
      createdAt: Date;
      lastUsed: Date;
      age: number;
    }> = [];

    for (const [name, breaker] of this.breakers) {
      const resources = this.resourceTracking.get(breaker);
      if (resources) {
        stats.push({
          name,
          eventListeners: resources.eventListeners.length,
          timers: resources.timers.size,
          intervals: resources.intervals.size,
          abortControllers: resources.abortControllers.size,
          createdAt: resources.createdAt,
          lastUsed: resources.lastUsed,
          age: Date.now() - resources.createdAt.getTime(),
        });
      }
    }

    return stats;
  }

  /**
   * Get circuit breaker statistics
   */
  getStats(name: string): any {
    const breaker = this.breakers.get(name);
    if (!breaker) {
      return null;
    }

    return {
      name,
      options: (breaker as any).options,
      state: breaker.closed ? 'closed' : breaker.opened ? 'open' : 'half-open',
      stats: breaker.stats,
    };
  }

  /**
   * Remove a circuit breaker with comprehensive resource cleanup
   */
  remove(name: string): boolean {
    const breaker = this.breakers.get(name);
    if (!breaker) {
      return false;
    }

    // Use comprehensive cleanup method
    this.cleanupBreakerResources(breaker);
    this.breakers.delete(name);
    return true;
  }

  /**
   * Reset a circuit breaker
   */
  reset(name: string): boolean {
    const breaker = this.breakers.get(name);
    if (!breaker) {
      return false;
    }

    breaker.close();
    return true;
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.close();
    }
  }

  /**
   * Get the number of registered circuit breakers
   */
  size(): number {
    return this.breakers.size;
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async withCircuitBreaker<T extends any[], R>(
    name: string,
    fn: (...args: T) => Promise<R>,
    args: T,
    options: CircuitBreakerOptions = {},
  ): Promise<PatternResult<R>> {
    const startTime = Date.now();
    const breaker = this.getCircuitBreaker(name, fn, options);

    try {
      const result = await breaker.fire(...args);

      return {
        attempts: 1,
        data: result,
        duration: Date.now() - startTime,
        metadata: {
          circuitBreakerName: name,
          state: breaker.closed ? 'closed' : breaker.opened ? 'open' : 'half-open',
          stats: breaker.stats,
        },
        pattern: 'circuit-breaker',
        success: true,
      };
    } catch (error: any) {
      const err = error as Error;

      // Check if this is a circuit breaker error
      if (err.message?.includes('Circuit breaker is open')) {
        const cbError = new CircuitBreakerError(
          `Circuit breaker '${name}' is open`,
          name,
          breaker.opened ? 'open' : 'half-open',
        );

        return {
          attempts: 1,
          duration: Date.now() - startTime,
          error: cbError,
          metadata: {
            circuitBreakerName: name,
            circuitBreakerTripped: true,
            state: breaker.opened ? 'open' : 'half-open',
            stats: breaker.stats,
          },
          pattern: 'circuit-breaker',
          success: false,
        };
      }

      return {
        attempts: 1,
        duration: Date.now() - startTime,
        error: err,
        metadata: {
          circuitBreakerName: name,
          state: breaker.closed ? 'closed' : breaker.opened ? 'open' : 'half-open',
          stats: breaker.stats,
        },
        pattern: 'circuit-breaker',
        success: false,
      };
    }
  }
}

// Global circuit breaker manager instance
const globalManager = new CircuitBreakerManager();

/**
 * Create a circuit breaker decorator
 */
function CircuitBreaker(name: string, options: CircuitBreakerOptions = {}) {
  return function <_T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value;
    const breakerName = name || `${target.constructor.name}.${propertyName}`;

    descriptor.value = async function (...args: any[]) {
      const result = await globalManager.withCircuitBreaker(
        breakerName,
        method.bind(this),
        args,
        options,
      );

      if (result.success) {
        return result?.data;
      } else {
        throw result.error;
      }
    };

    return descriptor;
  };
}

/**
 * Get circuit breaker statistics
 */
function getCircuitBreakerStats(name?: string): any {
  if (name) {
    return globalManager.getStats(name);
  }
  return globalManager.getAllStats();
}

/**
 * Reset circuit breaker(s)
 */
function resetCircuitBreaker(name?: string): boolean | void {
  if (name) {
    return globalManager.reset(name);
  }
  globalManager.resetAll();
}

/**
 * Execute a function with circuit breaker protection
 */
export async function withCircuitBreaker<T extends any[], R>(
  name: string,
  fn: (...args: T) => Promise<R>,
  args: T,
  options: CircuitBreakerOptions = {},
): Promise<PatternResult<R>> {
  return globalManager.withCircuitBreaker(name, fn, args, options);
}

/**
 * Predefined circuit breaker configurations
 */
export const CircuitBreakerConfigs = {
  /** API-specific circuit breaker */
  api: {
    errorFilter: (error: Error) => {
      // Only trip on 5xx errors, not 4xx
      const message = (error as Error)?.message || 'Unknown error'?.toLowerCase() || '';
      return message.includes('5') || message.includes('timeout') || message.includes('network');
    },
    failureThreshold: 5,
    minimumCallsToTrip: 10,
    resetTimeout: 30000, // 30 seconds
    rollingCountWindow: 10000, // 10 seconds
    timeout: 10000, // 10 seconds
  },

  /** Database-specific circuit breaker */
  database: {
    errorFilter: (error: Error) => {
      const message = (error as Error)?.message || 'Unknown error'?.toLowerCase() || '';
      return (
        message.includes('connection') ||
        message.includes('timeout') ||
        message.includes('unavailable')
      );
    },
    failureThreshold: 3,
    minimumCallsToTrip: 5,
    resetTimeout: 15000, // 15 seconds
    rollingCountWindow: 5000, // 5 seconds
    timeout: 5000, // 5 seconds
  },

  /** Fast-failing circuit breaker for quick operations */
  fast: {
    failureThreshold: 3,
    minimumCallsToTrip: 5,
    resetTimeout: 10000, // 10 seconds
    rollingCountWindow: 5000, // 5 seconds
    timeout: 5000, // 5 seconds
  },

  /** Patient circuit breaker for slow operations */
  patient: {
    failureThreshold: 10,
    minimumCallsToTrip: 20,
    resetTimeout: 60000, // 1 minute
    rollingCountWindow: 30000, // 30 seconds
    timeout: 60000, // 1 minute
  },

  /** Standard circuit breaker for most operations */
  standard: {
    failureThreshold: 5,
    minimumCallsToTrip: 10,
    resetTimeout: 30000, // 30 seconds
    rollingCountWindow: 10000, // 10 seconds
    timeout: 30000, // 30 seconds
  },
} as const;

/**
 * Create a circuit breaker function with predefined configuration
 */
function createCircuitBreakerFn<T extends any[], R>(
  name: string,
  config: keyof typeof CircuitBreakerConfigs,
) {
  const options = CircuitBreakerConfigs[config];

  return (fn: (...args: T) => Promise<R>, args: T) => {
    return withCircuitBreaker(name, fn, args, options);
  };
}

// Export the global manager for advanced usage
export { globalManager as circuitBreakerManager };
