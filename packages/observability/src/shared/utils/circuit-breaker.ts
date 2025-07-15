/**
 * Circuit breaker pattern for provider resilience
 * Prevents cascading failures by temporarily disabling failing providers
 */

import { Environment } from './environment';

export enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation
  OPEN = 'OPEN', // Failing, rejecting all calls
  HALF_OPEN = 'HALF_OPEN', // Testing if service recovered
}

export interface CircuitBreakerOptions {
  /** Number of failures before opening circuit */
  failureThreshold: number;
  /** Time in ms to wait before attempting recovery */
  resetTimeout: number;
  /** Time window in ms to count failures */
  failureWindow: number;
  /** Success threshold to close circuit from half-open */
  successThreshold: number;
  /** Optional callback when circuit opens */
  onOpen?: (providerName: string) => void;
  /** Optional callback when circuit closes */
  onClose?: (providerName: string) => void;
  /** Optional callback when circuit enters half-open */
  onHalfOpen?: (providerName: string) => void;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number[] = [];
  private successes = 0;
  private lastFailureTime = 0;
  private nextRetryTime = 0;

  constructor(
    private readonly name: string,
    private readonly options: CircuitBreakerOptions,
  ) {}

  /**
   * Execute function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit should be opened
    if (this.state === CircuitState.OPEN) {
      if (Date.now() >= this.nextRetryTime) {
        this.transitionToHalfOpen();
      } else {
        throw new Error(`Circuit breaker is OPEN for ${this.name}`);
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error: any) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Record successful operation
   */
  private onSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++;
      if (this.successes >= this.options.successThreshold) {
        this.transitionToClosed();
      }
    } else if (this.state === CircuitState.CLOSED) {
      // Reset failure tracking on success in closed state
      this.failures = [];
    }
  }

  /**
   * Record failed operation
   */
  private onFailure(): void {
    const now = Date.now();

    // Clean old failures outside the window
    this.failures = this.failures.filter((time: any) => now - time <= this.options.failureWindow);

    // Add new failure
    this.failures.push(now);
    this.lastFailureTime = now;

    if (this.state === CircuitState.HALF_OPEN) {
      // Any failure in half-open state reopens the circuit
      this.transitionToOpen();
    } else if (this.state === CircuitState.CLOSED) {
      // Check if we've exceeded failure threshold
      if (this.failures.length >= this.options.failureThreshold) {
        this.transitionToOpen();
      }
    }
  }

  /**
   * Transition to OPEN state
   */
  private transitionToOpen(): void {
    this.state = CircuitState.OPEN;
    this.nextRetryTime = Date.now() + this.options.resetTimeout;
    this.successes = 0;

    if (Environment.isDevelopment()) {
      console.warn(`[CircuitBreaker] Opening circuit for ${this.name}`);
    }

    this.options.onOpen?.(this.name);
  }

  /**
   * Transition to HALF_OPEN state
   */
  private transitionToHalfOpen(): void {
    this.state = CircuitState.HALF_OPEN;
    this.successes = 0;
    this.failures = [];

    if (Environment.isDevelopment()) {
      console.info(`[CircuitBreaker] Half-opening circuit for ${this.name}`);
    }

    this.options.onHalfOpen?.(this.name);
  }

  /**
   * Transition to CLOSED state
   */
  private transitionToClosed(): void {
    this.state = CircuitState.CLOSED;
    this.failures = [];
    this.successes = 0;
    this.lastFailureTime = 0;
    this.nextRetryTime = 0;

    if (Environment.isDevelopment()) {
      console.info(`[CircuitBreaker] Closing circuit for ${this.name}`);
    }

    this.options.onClose?.(this.name);
  }

  /**
   * Get current circuit state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get circuit breaker statistics
   */
  getStats(): {
    state: CircuitState;
    failures: number;
    lastFailureTime: number;
    nextRetryTime: number;
  } {
    return {
      state: this.state,
      failures: this.failures.length,
      lastFailureTime: this.lastFailureTime,
      nextRetryTime: this.nextRetryTime,
    };
  }

  /**
   * Reset circuit breaker to closed state
   */
  reset(): void {
    this.transitionToClosed();
  }
}

/**
 * Default circuit breaker options
 */
export const DEFAULT_CIRCUIT_BREAKER_OPTIONS: CircuitBreakerOptions = {
  failureThreshold: 5,
  resetTimeout: 60000, // 1 minute
  failureWindow: 60000, // 1 minute
  successThreshold: 3,
};

/**
 * Create a circuit breaker with default options
 */
export function createCircuitBreaker(
  name: string,
  options: Partial<CircuitBreakerOptions> = {},
): CircuitBreaker {
  return new CircuitBreaker(name, {
    ...DEFAULT_CIRCUIT_BREAKER_OPTIONS,
    ...options,
  });
}
