// timeout/middleware.ts
import { createMiddleware, type Middleware } from '../base';
import type { TimeoutOptions, TimeoutContext, TimeoutResult } from './types';

const DEFAULT_TIMEOUT = 30000; // 30 seconds

export const createTimeoutMiddleware = (
  options: TimeoutOptions = {},
): Middleware => {
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;

  return createMiddleware(async (context, next) => {
    const timeoutContext: TimeoutContext = {
      ...context,
      timeoutMs: timeout,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      timeoutContext.signal = controller.signal;

      const result = await Promise.race([
        next(),
        new Promise<TimeoutResult>((_resolve, reject) => {
          controller.signal.addEventListener('abort', () => {
            reject(new Error(`Operation timed out after ${timeout}ms`));
          });
        }),
      ]);

      return {
        ...result,
        metadata: {
          ...result.metadata,
          timeoutMs: timeout,
          timedOut: false,
        },
      };
    } catch (error) {
      if (options.onTimeout && controller.signal.aborted) {
        await options.onTimeout(timeoutContext);
      }

      return {
        error: error as Error,
        metadata: {
          ...context.metadata,
          timeoutMs: timeout,
          timedOut: true,
        },
        duration: Date.now() - context.startTime,
      };
    } finally {
      clearTimeout(timeoutId);
      controller.abort(); // Cleanup
    }
  }, options);
};
