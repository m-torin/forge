/**
 * Circuit breaker pattern implementation using opossum
 */

import OpossumCircuitBreaker from 'opossum';

import { CircuitBreakerError } from '../utils/errors';

import type { CircuitBreakerPattern, PatternContext, PatternResult } from '../types/patterns';

export interface CircuitBreakerOptions extends Partial<CircuitBreakerPattern> {
  /** Context for the operation */
  context?: Partial<PatternContext>;
  /** Name for the circuit breaker */
  name?: string;
}

/**
 * Circuit Breaker Manager
 */
export class CircuitBreakerManager {
  private breakers = new Map<string, OpossumCircuitBreaker<any, any>>();

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
      name,
      capacity: 10,
      errorFilter: options.errorFilter,
      errorThresholdPercentage:
        (pattern.failureThreshold / (pattern.minimumCallsToTrip || 10)) * 100,
      group: 'orchestration',
      resetTimeout: pattern.resetTimeout,
      rollingCountBuckets: 10,
      // Additional opossum options
      rollingCountTimeout: pattern.rollingCountWindow,
      timeout: pattern.timeout,
      volumeThreshold: pattern.minimumCallsToTrip,
    });

    // Set up event handlers
    if (pattern.onOpen) {
      breaker.on('open', pattern.onOpen);
    }

    if (pattern.onClose) {
      breaker.on('close', pattern.onClose);
    }

    if (pattern.onHalfOpen) {
      breaker.on('halfOpen', pattern.onHalfOpen);
    }

    // Default event handlers for logging
    breaker.on('open', () => {
      console.warn(`Circuit breaker '${name}' opened`);
    });

    breaker.on('halfOpen', () => {
      console.info(`Circuit breaker '${name}' half-opened`);
    });

    breaker.on('close', () => {
      console.info(`Circuit breaker '${name}' closed`);
    });

    this.breakers.set(name, breaker);
    return breaker;
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
    } catch (error) {
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
      options: breaker.options,
      state: breaker.closed ? 'closed' : breaker.opened ? 'open' : 'half-open',
      stats: breaker.stats,
    };
  }

  /**
   * Get all circuit breaker statistics
   */
  getAllStats(): any[] {
    return Array.from(this.breakers.keys()).map((name) => this.getStats(name));
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
   * Remove a circuit breaker
   */
  remove(name: string): boolean {
    const breaker = this.breakers.get(name);
    if (!breaker) {
      return false;
    }

    breaker.destroy();
    this.breakers.delete(name);
    return true;
  }

  /**
   * Remove all circuit breakers
   */
  clear(): void {
    for (const [name, breaker] of this.breakers) {
      breaker.destroy();
    }
    this.breakers.clear();
  }

  /**
   * Get the number of registered circuit breakers
   */
  size(): number {
    return this.breakers.size;
  }
}

// Global circuit breaker manager instance
const globalManager = new CircuitBreakerManager();

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
 * Create a circuit breaker decorator
 */
export function CircuitBreaker(name?: string, options: CircuitBreakerOptions = {}) {
  return function <T extends (...args: any[]) => Promise<any>>(
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
        return result.data;
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
export function getCircuitBreakerStats(name?: string): any {
  if (name) {
    return globalManager.getStats(name);
  }
  return globalManager.getAllStats();
}

/**
 * Reset circuit breaker(s)
 */
export function resetCircuitBreaker(name?: string): boolean | void {
  if (name) {
    return globalManager.reset(name);
  }
  globalManager.resetAll();
}

/**
 * Predefined circuit breaker configurations
 */
export const CircuitBreakerConfigs = {
  /** Fast-failing circuit breaker for quick operations */
  fast: {
    failureThreshold: 3,
    minimumCallsToTrip: 5,
    resetTimeout: 10000, // 10 seconds
    rollingCountWindow: 5000, // 5 seconds
    timeout: 5000, // 5 seconds
  },

  /** Standard circuit breaker for most operations */
  standard: {
    failureThreshold: 5,
    minimumCallsToTrip: 10,
    resetTimeout: 30000, // 30 seconds
    rollingCountWindow: 10000, // 10 seconds
    timeout: 30000, // 30 seconds
  },

  /** Patient circuit breaker for slow operations */
  patient: {
    failureThreshold: 10,
    minimumCallsToTrip: 20,
    resetTimeout: 60000, // 1 minute
    rollingCountWindow: 30000, // 30 seconds
    timeout: 60000, // 1 minute
  },

  /** API-specific circuit breaker */
  api: {
    errorFilter: (error: Error) => {
      // Only trip on 5xx errors, not 4xx
      const message = error.message?.toLowerCase() || '';
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
      const message = error.message?.toLowerCase() || '';
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
} as const;

/**
 * Create a circuit breaker function with predefined configuration
 */
export function createCircuitBreakerFn<T extends any[], R>(
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
