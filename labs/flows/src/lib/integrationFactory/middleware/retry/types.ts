// retry/types.ts
export type RetryStrategyType = 'linear' | 'exponential' | 'decorrelated';

export interface RetryOptions {
  /** Maximum number of retry attempts */
  maxAttempts?: number;
  /** Initial delay between retries in ms */
  baseDelay?: number;
  /** Maximum delay between retries in ms */
  maxDelay?: number;
  /** Randomization factor for jitter */
  jitterFactor?: number;
  /** Strategy for calculating delays */
  strategy?: RetryStrategyType;
  /** Custom retry condition */
  shouldRetry?: (error: Error) => boolean;
}

export interface RetryState {
  attempts: number;
  lastError?: Error;
  nextDelayMs: number;
}

export interface RetryMetadata {
  attempts: number;
  delays: number[];
  success: boolean;
  finalError?: Error;
}
