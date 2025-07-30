// retry/middleware.ts
import { Middleware, MiddlewareContext, createMiddleware } from '../base';
import type { RetryOptions, RetryState, RetryMetadata } from './types';

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelay: 100,
  maxDelay: 5000,
  jitterFactor: 0.2,
  strategy: 'exponential',
  shouldRetry: (_error: Error) => true,
};

export const createRetryMiddleware = (
  options: RetryOptions = {},
): Middleware => {
  const config = { ...DEFAULT_OPTIONS, ...options };

  const calculateDelay = (attempt: number): number => {
    let delay: number;

    switch (config.strategy) {
      case 'linear':
        delay = config.baseDelay * attempt;
        break;
      case 'decorrelated':
        delay = Math.random() * config.baseDelay * Math.pow(2, attempt);
        break;
      case 'exponential':
      default:
        delay = config.baseDelay * Math.pow(2, attempt - 1);
    }

    // Add jitter
    const jitter = 1 + (Math.random() * 2 - 1) * config.jitterFactor;
    delay *= jitter;

    return Math.min(delay, config.maxDelay);
  };

  const sleep = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

  return createMiddleware(async (context: MiddlewareContext, next) => {
    const state: RetryState = {
      attempts: 0,
      nextDelayMs: 0,
    };

    const metadata: RetryMetadata = {
      attempts: 0,
      delays: [],
      success: false,
    };

    while (state.attempts < config.maxAttempts) {
      try {
        if (state.attempts > 0) {
          await sleep(state.nextDelayMs);
          metadata.delays.push(state.nextDelayMs);
        }

        state.attempts++;
        metadata.attempts = state.attempts;

        const result = await next();
        metadata.success = true;

        return {
          ...result,
          metadata: {
            ...result.metadata,
            retry: metadata,
          },
        };
      } catch (error) {
        state.lastError = error as Error;
        metadata.finalError = state.lastError;

        if (
          !config.shouldRetry(state.lastError) ||
          state.attempts >= config.maxAttempts
        ) {
          throw state.lastError;
        }

        state.nextDelayMs = calculateDelay(state.attempts);
      }
    }

    throw state.lastError;
  });
};
