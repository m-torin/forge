import { logDebug, logError } from '@repo/observability';

/**
 * Simple error handling DRY helper for tool execution
 * Follows README philosophy: "DRY helper functions that reduce boilerplate without adding complexity"
 */

/**
 * Execute a tool safely with basic retry logic
 * Simple wrapper that reduces error handling boilerplate across monorepo
 */
export async function executeToolSafely<T>(
  toolFn: () => Promise<T>,
  options: {
    retries?: number;
    delay?: number;
    onRetry?: (attempt: number, error: any) => void;
  } = {},
): Promise<T> {
  const { retries = 3, delay = 1000, onRetry } = options;

  let lastError: any;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await toolFn();
    } catch (error) {
      lastError = error;

      if (attempt === retries) {
        logError('[Tools] Tool execution failed after all retries', {
          attempts: retries,
          error: error instanceof Error ? error.message : String(error),
        });
        break;
      }

      if (onRetry) {
        onRetry(attempt, error);
      }

      logDebug('[Tools] Tool execution failed, retrying', {
        attempt,
        retries,
        error: error instanceof Error ? error.message : String(error),
      });

      // Simple delay before retry
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Execute tool with fallback function
 * Simple DRY helper for common fallback pattern
 */
export async function executeWithFallback<T>(
  primaryFn: () => Promise<T>,
  fallbackFn: () => Promise<T>,
): Promise<T> {
  try {
    return await primaryFn();
  } catch (error) {
    logDebug('[Tools] Primary execution failed, using fallback', {
      error: error instanceof Error ? error.message : String(error),
    });
    return await fallbackFn();
  }
}
