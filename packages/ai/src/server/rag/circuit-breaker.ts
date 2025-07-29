/**
 * Circuit Breaker Pattern for RAG Operations
 * Provides fault tolerance and resilience for vector operations
 * Prevents cascading failures and enables graceful degradation
 */

import { logError, logInfo, logWarn } from '@repo/observability/server/next';

/**
 * Circuit breaker states
 */
export enum CircuitBreakerState {
  CLOSED = 'closed', // Normal operation
  OPEN = 'open', // Failure state - rejecting requests
  HALF_OPEN = 'half_open', // Testing state - allowing limited requests
}

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening
  recoveryTimeout: number; // Time to wait before attempting recovery (ms)
  monitoringWindow: number; // Time window for failure tracking (ms)
  successThreshold: number; // Successful calls needed to close from half-open
  timeoutDuration: number; // Request timeout (ms)
}

/**
 * Circuit breaker metrics
 */
export interface CircuitBreakerMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  state: CircuitBreakerState;
  lastFailureTime?: number;
  lastSuccessTime?: number;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
}

/**
 * Circuit breaker error types
 */
export class CircuitBreakerOpenError extends Error {
  constructor(operationName: string) {
    super(`Circuit breaker is OPEN for operation: ${operationName}`);
    this.name = 'CircuitBreakerOpenError';
  }
}

export class CircuitBreakerTimeoutError extends Error {
  constructor(operationName: string, timeout: number) {
    super(`Operation timed out after ${timeout}ms: ${operationName}`);
    this.name = 'CircuitBreakerTimeoutError';
  }
}

/**
 * Circuit Breaker implementation for RAG operations
 */
export class RAGCircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private metrics: CircuitBreakerMetrics;
  private config: Required<CircuitBreakerConfig>;
  private lastFailureTime: number = 0;
  private failureWindow: number[] = [];

  constructor(
    private operationName: string,
    config: Partial<CircuitBreakerConfig> = {},
  ) {
    this.config = {
      failureThreshold: config.failureThreshold || 5,
      recoveryTimeout: config.recoveryTimeout || 60000, // 1 minute
      monitoringWindow: config.monitoringWindow || 300000, // 5 minutes
      successThreshold: config.successThreshold || 3,
      timeoutDuration: config.timeoutDuration || 30000, // 30 seconds
    };

    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      state: this.state,
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
    };

    logInfo('RAG Circuit Breaker initialized', {
      operation: 'rag_circuit_breaker_init',
      operationName: this.operationName,
      config: this.config,
    });
  }

  /**
   * Execute operation with circuit breaker protection
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    this.metrics.totalRequests++;

    // Check if circuit is open
    if (this.state === CircuitBreakerState.OPEN) {
      // Check if recovery timeout has passed
      if (Date.now() - this.lastFailureTime >= this.config.recoveryTimeout) {
        this.transitionToHalfOpen();
      } else {
        this.recordFailure('Circuit breaker is OPEN');
        throw new CircuitBreakerOpenError(this.operationName);
      }
    }

    // Check if we should allow the request in HALF_OPEN state
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      if (this.metrics.consecutiveSuccesses >= this.config.successThreshold) {
        this.transitionToClosed();
      }
    }

    // Execute the operation with timeout
    try {
      const result = await this.executeWithTimeout(operation);
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure(error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Execute operation with timeout protection
   */
  private async executeWithTimeout<T>(operation: () => Promise<T>): Promise<T> {
    const timeoutPromise = new Promise<never>((_resolve, reject) => {
      setTimeout(() => {
        reject(new CircuitBreakerTimeoutError(this.operationName, this.config.timeoutDuration));
      }, this.config.timeoutDuration);
    });

    return Promise.race([operation(), timeoutPromise]);
  }

  /**
   * Record successful operation
   */
  private recordSuccess(): void {
    this.metrics.successfulRequests++;
    this.metrics.consecutiveSuccesses++;
    this.metrics.consecutiveFailures = 0;
    this.metrics.lastSuccessTime = Date.now();

    // If we're in HALF_OPEN and have enough successes, close the circuit
    if (
      this.state === CircuitBreakerState.HALF_OPEN &&
      this.metrics.consecutiveSuccesses >= this.config.successThreshold
    ) {
      this.transitionToClosed();
    }

    this.updateMetrics();
  }

  /**
   * Record failed operation
   */
  private recordFailure(errorMessage: string): void {
    const now = Date.now();
    this.metrics.failedRequests++;
    this.metrics.consecutiveFailures++;
    this.metrics.consecutiveSuccesses = 0;
    this.metrics.lastFailureTime = now;
    this.lastFailureTime = now;

    // Add to failure window
    this.failureWindow.push(now);
    this.cleanFailureWindow(now);

    // Check if we should open the circuit
    if (this.state === CircuitBreakerState.CLOSED && this.shouldOpenCircuit()) {
      this.transitionToOpen();
    } else if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.transitionToOpen();
    }

    this.updateMetrics();

    logWarn('RAG Circuit Breaker recorded failure', {
      operation: 'rag_circuit_breaker_failure',
      operationName: this.operationName,
      error: errorMessage,
      consecutiveFailures: this.metrics.consecutiveFailures,
      state: this.state,
    });
  }

  /**
   * Check if circuit should be opened
   */
  private shouldOpenCircuit(): boolean {
    return this.failureWindow.length >= this.config.failureThreshold;
  }

  /**
   * Clean old failures from the monitoring window
   */
  private cleanFailureWindow(now: number): void {
    const cutoff = now - this.config.monitoringWindow;
    this.failureWindow = this.failureWindow.filter(time => time > cutoff);
  }

  /**
   * Transition to OPEN state
   */
  private transitionToOpen(): void {
    this.state = CircuitBreakerState.OPEN;
    this.updateMetrics();

    logError('RAG Circuit Breaker opened', {
      operation: 'rag_circuit_breaker_open',
      operationName: this.operationName,
      consecutiveFailures: this.metrics.consecutiveFailures,
      failuresInWindow: this.failureWindow.length,
      recoveryTimeoutMs: this.config.recoveryTimeout,
    });
  }

  /**
   * Transition to HALF_OPEN state
   */
  private transitionToHalfOpen(): void {
    this.state = CircuitBreakerState.HALF_OPEN;
    this.metrics.consecutiveSuccesses = 0;
    this.updateMetrics();

    logInfo('RAG Circuit Breaker transitioning to HALF_OPEN', {
      operation: 'rag_circuit_breaker_half_open',
      operationName: this.operationName,
      timeSinceLastFailure: Date.now() - this.lastFailureTime,
    });
  }

  /**
   * Transition to CLOSED state
   */
  private transitionToClosed(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.metrics.consecutiveFailures = 0;
    this.failureWindow = [];
    this.updateMetrics();

    logInfo('RAG Circuit Breaker closed', {
      operation: 'rag_circuit_breaker_closed',
      operationName: this.operationName,
      consecutiveSuccesses: this.metrics.consecutiveSuccesses,
    });
  }

  /**
   * Update metrics state
   */
  private updateMetrics(): void {
    this.metrics.state = this.state;
  }

  /**
   * Get current metrics
   */
  getMetrics(): CircuitBreakerMetrics {
    return { ...this.metrics };
  }

  /**
   * Get current state
   */
  getState(): CircuitBreakerState {
    return this.state;
  }

  /**
   * Check if circuit is healthy
   */
  isHealthy(): boolean {
    return this.state === CircuitBreakerState.CLOSED;
  }

  /**
   * Force circuit to close (for testing/recovery)
   */
  forceClose(): void {
    this.transitionToClosed();
    logWarn('RAG Circuit Breaker force closed', {
      operation: 'rag_circuit_breaker_force_close',
      operationName: this.operationName,
    });
  }

  /**
   * Force circuit to open (for maintenance)
   */
  forceOpen(): void {
    this.transitionToOpen();
    logWarn('RAG Circuit Breaker force opened', {
      operation: 'rag_circuit_breaker_force_open',
      operationName: this.operationName,
    });
  }

  /**
   * Reset all metrics and close circuit
   */
  reset(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      state: this.state,
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
    };
    this.failureWindow = [];
    this.lastFailureTime = 0;

    logInfo('RAG Circuit Breaker reset', {
      operation: 'rag_circuit_breaker_reset',
      operationName: this.operationName,
    });
  }
}

/**
 * Circuit breaker registry for managing multiple circuit breakers
 */
export class CircuitBreakerRegistry {
  private circuitBreakers = new Map<string, RAGCircuitBreaker>();

  /**
   * Get or create circuit breaker for operation
   */
  getCircuitBreaker(
    operationName: string,
    config?: Partial<CircuitBreakerConfig>,
  ): RAGCircuitBreaker {
    if (!this.circuitBreakers.has(operationName)) {
      this.circuitBreakers.set(operationName, new RAGCircuitBreaker(operationName, config));
    }
    const breaker = this.circuitBreakers.get(operationName);
    if (!breaker) throw new Error(`Circuit breaker not found for operation: ${operationName}`);
    return breaker;
  }

  /**
   * Get all circuit breaker metrics
   */
  getAllMetrics(): Record<string, CircuitBreakerMetrics> {
    const metrics: Record<string, CircuitBreakerMetrics> = {};
    this.circuitBreakers.forEach((breaker, name) => {
      metrics[name] = breaker.getMetrics();
    });
    return metrics;
  }

  /**
   * Get health status of all circuit breakers
   */
  getHealthStatus(): {
    healthy: string[];
    unhealthy: string[];
    totalBreakers: number;
  } {
    const healthy: string[] = [];
    const unhealthy: string[] = [];

    this.circuitBreakers.forEach((breaker, name) => {
      if (breaker.isHealthy()) {
        healthy.push(name);
      } else {
        unhealthy.push(name);
      }
    });

    return {
      healthy,
      unhealthy,
      totalBreakers: this.circuitBreakers.size,
    };
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    this.circuitBreakers.forEach(breaker => breaker.reset());
    logInfo('All RAG Circuit Breakers reset', {
      operation: 'rag_circuit_breaker_registry_reset_all',
      totalBreakers: this.circuitBreakers.size,
    });
  }

  /**
   * Remove circuit breaker
   */
  remove(operationName: string): boolean {
    return this.circuitBreakers.delete(operationName);
  }

  /**
   * Clear all circuit breakers
   */
  clear(): void {
    this.circuitBreakers.clear();
  }
}

/**
 * Global circuit breaker registry instance
 */
export const ragCircuitBreakerRegistry = new CircuitBreakerRegistry();

/**
 * Convenience function to execute operation with circuit breaker
 */
export async function executeWithCircuitBreaker<T>(
  operationName: string,
  operation: () => Promise<T>,
  config?: Partial<CircuitBreakerConfig>,
): Promise<T> {
  const circuitBreaker = ragCircuitBreakerRegistry.getCircuitBreaker(operationName, config);
  return circuitBreaker.execute(operation);
}

/**
 * Decorator for adding circuit breaker protection to methods
 */
export function withCircuitBreaker(operationName: string, config?: Partial<CircuitBreakerConfig>) {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<T>,
  ) {
    const method = descriptor.value;
    if (!method) throw new Error('Method descriptor value is undefined');
    descriptor.value = async function (this: any, ...args: any[]) {
      return executeWithCircuitBreaker(
        `${target.constructor.name}.${operationName}`,
        () => method.apply(this, args),
        config,
      );
    } as T;
  };
}

/**
 * Pre-configured circuit breakers for common RAG operations
 */
export const ragCircuitBreakers = {
  embedding: () =>
    ragCircuitBreakerRegistry.getCircuitBreaker('embedding', {
      failureThreshold: 3,
      recoveryTimeout: 30000, // 30 seconds
      timeoutDuration: 10000, // 10 seconds
    }),

  vectorQuery: () =>
    ragCircuitBreakerRegistry.getCircuitBreaker('vector_query', {
      failureThreshold: 5,
      recoveryTimeout: 60000, // 1 minute
      timeoutDuration: 15000, // 15 seconds
    }),

  vectorUpsert: () =>
    ragCircuitBreakerRegistry.getCircuitBreaker('vector_upsert', {
      failureThreshold: 3,
      recoveryTimeout: 45000, // 45 seconds
      timeoutDuration: 20000, // 20 seconds
    }),

  batchProcessing: () =>
    ragCircuitBreakerRegistry.getCircuitBreaker('batch_processing', {
      failureThreshold: 2,
      recoveryTimeout: 120000, // 2 minutes
      timeoutDuration: 60000, // 1 minute
    }),
};
