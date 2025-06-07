import { EventEmitter } from 'events';

export enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation
  HALF_OPEN = 'HALF_OPEN', // Testing if service is back up
  OPEN = 'OPEN', // Circuit is open, calls fail fast
}

export interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening
  halfOpenMaxAttempts: number; // Max attempts in half-open state
  monitoringPeriod: number; // Time window for failure counting
  name: string;
  resetTimeout: number; // Time in ms before trying half-open
  successThreshold: number; // Successful calls needed to close
  timeout: number; // Call timeout in ms
}

export interface CircuitBreakerStats {
  failedCalls: number;
  failureRate: number;
  lastFailureTime?: Date;
  lastSuccessTime?: Date;
  rejectedCalls: number;
  state: CircuitState;
  successfulCalls: number;
  totalCalls: number;
  uptime: number;
}

export class CircuitBreakerError extends Error {
  constructor(
    message: string,
    public readonly circuitName: string,
    public readonly state: CircuitState,
  ) {
    super(message);
    this.name = 'CircuitBreakerError';
  }
}

export class CircuitBreaker<T = any> extends EventEmitter {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime?: Date;
  private lastSuccessTime?: Date;
  private nextAttempt = 0;
  private stats = {
    failedCalls: 0,
    rejectedCalls: 0,
    successfulCalls: 0,
    totalCalls: 0,
  };

  // Sliding window for failure tracking
  private recentFailures: Date[] = [];
  private halfOpenAttempts = 0;

  constructor(private config: CircuitBreakerConfig) {
    super();
    this.validateConfig();
  }

  private validateConfig(): void {
    const {
      failureThreshold,
      halfOpenMaxAttempts,
      monitoringPeriod,
      resetTimeout,
      successThreshold,
      timeout,
    } = this.config;

    if (failureThreshold <= 0) throw new Error('failureThreshold must be positive');
    if (resetTimeout <= 0) throw new Error('resetTimeout must be positive');
    if (monitoringPeriod <= 0) throw new Error('monitoringPeriod must be positive');
    if (halfOpenMaxAttempts <= 0) throw new Error('halfOpenMaxAttempts must be positive');
    if (successThreshold <= 0) throw new Error('successThreshold must be positive');
    if (timeout <= 0) throw new Error('timeout must be positive');
  }

  async execute<R>(operation: () => Promise<R>): Promise<R> {
    return this.call(operation);
  }

  async call<R>(operation: () => Promise<R>): Promise<R> {
    this.stats.totalCalls++;

    // Check if circuit should be opened
    this.updateState();

    if (this.state === CircuitState.OPEN) {
      this.stats.rejectedCalls++;
      this.emit('callRejected', { circuitName: this.config.name, state: this.state });
      throw new CircuitBreakerError(
        `Circuit breaker is OPEN for ${this.config.name}`,
        this.config.name,
        this.state,
      );
    }

    if (this.state === CircuitState.HALF_OPEN) {
      if (this.halfOpenAttempts >= this.config.halfOpenMaxAttempts) {
        this.stats.rejectedCalls++;
        this.emit('callRejected', { circuitName: this.config.name, state: this.state });
        throw new CircuitBreakerError(
          `Circuit breaker is HALF_OPEN and max attempts exceeded for ${this.config.name}`,
          this.config.name,
          this.state,
        );
      }
      this.halfOpenAttempts++;
    }

    try {
      const startTime = Date.now();

      // Execute with timeout
      const result = await this.executeWithTimeout(operation);

      const duration = Date.now() - startTime;
      this.onSuccess(duration);

      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  private async executeWithTimeout<R>(operation: () => Promise<R>): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Operation timeout after ${this.config.timeout}ms`));
      }, this.config.timeout);

      operation()
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  private onSuccess(duration: number): void {
    this.successCount++;
    this.stats.successfulCalls++;
    this.lastSuccessTime = new Date();

    this.emit('callSuccess', {
      circuitName: this.config.name,
      duration,
      state: this.state,
    });

    if (this.state === CircuitState.HALF_OPEN) {
      if (this.successCount >= this.config.successThreshold) {
        this.closeCircuit();
      }
    } else if (this.state === CircuitState.CLOSED) {
      // Reset failure count on success
      this.resetFailureCount();
    }
  }

  private onFailure(error: unknown): void {
    this.failureCount++;
    this.stats.failedCalls++;
    this.lastFailureTime = new Date();
    this.recentFailures.push(new Date());

    // Clean old failures outside monitoring period
    this.cleanOldFailures();

    this.emit('callFailure', {
      circuitName: this.config.name,
      error,
      failureCount: this.failureCount,
      state: this.state,
    });

    if (this.state === CircuitState.HALF_OPEN) {
      this.openCircuit();
    }
  }

  private updateState(): void {
    const now = Date.now();

    switch (this.state) {
      case CircuitState.CLOSED:
        if (this.shouldOpenCircuit()) {
          this.openCircuit();
        }
        break;

      case CircuitState.OPEN:
        if (now >= this.nextAttempt) {
          this.halfOpenCircuit();
        }
        break;

      case CircuitState.HALF_OPEN:
        // State changes are handled in onSuccess/onFailure
        break;
    }
  }

  private shouldOpenCircuit(): boolean {
    this.cleanOldFailures();
    return this.recentFailures.length >= this.config.failureThreshold;
  }

  private openCircuit(): void {
    this.state = CircuitState.OPEN;
    this.nextAttempt = Date.now() + this.config.resetTimeout;
    this.halfOpenAttempts = 0;

    this.emit('circuitOpened', {
      circuitName: this.config.name,
      failureCount: this.failureCount,
      nextAttempt: new Date(this.nextAttempt),
    });

    console.warn(`Circuit breaker OPENED for ${this.config.name}`);
  }

  private halfOpenCircuit(): void {
    this.state = CircuitState.HALF_OPEN;
    this.successCount = 0;
    this.halfOpenAttempts = 0;

    this.emit('circuitHalfOpened', {
      circuitName: this.config.name,
    });

    console.info(`Circuit breaker HALF-OPEN for ${this.config.name}`);
  }

  private closeCircuit(): void {
    this.state = CircuitState.CLOSED;
    this.resetFailureCount();
    this.halfOpenAttempts = 0;

    this.emit('circuitClosed', {
      circuitName: this.config.name,
    });

    console.info(`Circuit breaker CLOSED for ${this.config.name}`);
  }

  private resetFailureCount(): void {
    this.failureCount = 0;
    this.successCount = 0;
    this.recentFailures = [];
  }

  private cleanOldFailures(): void {
    const cutoff = Date.now() - this.config.monitoringPeriod;
    this.recentFailures = this.recentFailures.filter((failure) => failure.getTime() > cutoff);
  }

  // Public API for monitoring
  getState(): CircuitState {
    return this.state;
  }

  getStats(): CircuitBreakerStats {
    this.cleanOldFailures();

    const failureRate =
      this.stats.totalCalls > 0 ? (this.stats.failedCalls / this.stats.totalCalls) * 100 : 0;

    const uptime = this.state === CircuitState.CLOSED ? 100 : 0;

    return {
      failedCalls: this.stats.failedCalls,
      failureRate,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      rejectedCalls: this.stats.rejectedCalls,
      state: this.state,
      successfulCalls: this.stats.successfulCalls,
      totalCalls: this.stats.totalCalls,
      uptime,
    };
  }

  getName(): string {
    return this.config.name;
  }

  getConfig(): CircuitBreakerConfig {
    return { ...this.config };
  }

  // Manual control (for testing/admin)
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.resetFailureCount();
    this.halfOpenAttempts = 0;
    this.nextAttempt = 0;

    this.emit('circuitReset', {
      circuitName: this.config.name,
    });

    console.info(`Circuit breaker RESET for ${this.config.name}`);
  }

  forceOpen(): void {
    this.state = CircuitState.OPEN;
    this.nextAttempt = Date.now() + this.config.resetTimeout;

    this.emit('circuitForceOpened', {
      circuitName: this.config.name,
    });

    console.warn(`Circuit breaker FORCE OPENED for ${this.config.name}`);
  }

  forceClose(): void {
    this.state = CircuitState.CLOSED;
    this.resetFailureCount();

    this.emit('circuitForceClosed', {
      circuitName: this.config.name,
    });

    console.info(`Circuit breaker FORCE CLOSED for ${this.config.name}`);
  }

  // Health check
  isHealthy(): boolean {
    return this.state === CircuitState.CLOSED;
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    this.removeAllListeners();
    this.reset();
  }
}

// Circuit breaker factory and registry
export class CircuitBreakerRegistry {
  private breakers = new Map<string, CircuitBreaker>();

  create(config: CircuitBreakerConfig): CircuitBreaker {
    if (this.breakers.has(config.name)) {
      throw new Error(`Circuit breaker ${config.name} already exists`);
    }

    const breaker = new CircuitBreaker(config);
    this.breakers.set(config.name, breaker);

    // Forward events
    breaker.on('circuitOpened', (event) => {
      console.warn(`Circuit breaker opened: ${event.circuitName}`);
    });

    breaker.on('circuitClosed', (event) => {
      console.info(`Circuit breaker closed: ${event.circuitName}`);
    });

    return breaker;
  }

  get(name: string): CircuitBreaker | undefined {
    return this.breakers.get(name);
  }

  getOrCreate(config: CircuitBreakerConfig): CircuitBreaker {
    const existing = this.breakers.get(config.name);
    if (existing) {
      return existing;
    }
    return this.create(config);
  }

  remove(name: string): boolean {
    const breaker = this.breakers.get(name);
    if (breaker) {
      breaker.shutdown();
      return this.breakers.delete(name);
    }
    return false;
  }

  list(): string[] {
    return Array.from(this.breakers.keys());
  }

  getAllStats(): Record<string, CircuitBreakerStats> {
    const stats: Record<string, CircuitBreakerStats> = {};
    for (const [name, breaker] of this.breakers) {
      stats[name] = breaker.getStats();
    }
    return stats;
  }

  getHealthyBreakers(): string[] {
    return Array.from(this.breakers.entries())
      .filter(([, breaker]) => breaker.isHealthy())
      .map(([name]) => name);
  }

  getUnhealthyBreakers(): string[] {
    return Array.from(this.breakers.entries())
      .filter(([, breaker]) => !breaker.isHealthy())
      .map(([name]) => name);
  }

  async shutdown(): Promise<void> {
    const shutdownPromises = Array.from(this.breakers.values()).map((breaker) =>
      breaker.shutdown(),
    );

    await Promise.all(shutdownPromises);
    this.breakers.clear();
  }
}

// Default configurations
export const DEFAULT_CIRCUIT_CONFIGS = {
  database: {
    failureThreshold: 3,
    halfOpenMaxAttempts: 2,
    monitoringPeriod: 120000, // 2 minutes
    resetTimeout: 30000, // 30 seconds
    successThreshold: 3,
    timeout: 10000, // 10 seconds
  },
  external_api: {
    failureThreshold: 10,
    halfOpenMaxAttempts: 5,
    monitoringPeriod: 600000, // 10 minutes
    resetTimeout: 120000, // 2 minutes
    successThreshold: 3,
    timeout: 45000, // 45 seconds
  },
  http: {
    failureThreshold: 5,
    halfOpenMaxAttempts: 3,
    monitoringPeriod: 300000, // 5 minutes
    resetTimeout: 60000, // 1 minute
    successThreshold: 2,
    timeout: 30000, // 30 seconds
  },
};

// Global registry instance
export const circuitBreakerRegistry = new CircuitBreakerRegistry();
