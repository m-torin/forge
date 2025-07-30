// middleware/circuit/types.ts
export enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation
  OPEN = 'OPEN', // Failing, reject fast
  HALF_OPEN = 'HALF_OPEN', // Testing recovery
}

export interface CircuitBucket {
  timestamp: number;
  failures: number;
  successes: number;
  totalTime: number;
}

export interface CircuitMetrics {
  failures: number;
  successes: number;
  errorPercentage: number;
  avgResponseTime: number;
}

export interface CircuitOptions {
  enabled?: boolean;
  bucketSize?: number; // Time window size in ms (e.g., 1000ms)
  bucketCount?: number; // Number of rolling windows (e.g., 10)
  errorThresholdPercentage?: number; // e.g., 50 means 50% errors triggers open
  resetTimeout?: number; // Time before attempting reset (ms)
  halfOpenLimit?: number; // Max requests in half-open state
  degradationThreshold?: number; // Latency threshold for degradation (ms)
  onStateChange?: (from: CircuitState, to: CircuitState) => void;
}

export interface CircuitMetadata {
  state: CircuitState;
  metrics: CircuitMetrics;
  degraded: boolean;
}

export interface CircuitStats extends CircuitMetrics {
  state: CircuitState;
  degraded: boolean;
  lastFailure?: Date;
  nextReset?: Date;
}

export class CircuitBreakerError extends Error {
  constructor(
    message: string,
    public readonly state: CircuitState,
    public readonly stats: CircuitStats,
  ) {
    super(message);
    this.name = 'CircuitBreakerError';
  }
}
