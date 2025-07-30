/**
 * Comprehensive test coverage for retry pattern implementation
 * Tests retry strategies, delay calculations, and error handling
 */

import { beforeEach, describe, expect, vi } from 'vitest';

// Import after mocking
import { calculateDelay, withRetry } from '../../src/shared/patterns/retry';

// Mock dependencies
vi.mock('p-retry', () => ({
  default: vi.fn().mockImplementation(async (fn, options) => {
    let lastError;
    for (let attempt = 1; attempt <= (options?.retries || 1) + 1; attempt++) {
      try {
        return await fn(attempt);
      } catch (error) {
        lastError = error;
        if (attempt > (options?.retries || 1)) {
          throw error;
        }
        // Simulate delay
        if (options?.onFailedAttempt) {
          await options.onFailedAttempt({
            attemptNumber: attempt,
            retriesLeft: (options?.retries || 1) - attempt + 1,
          });
        }
      }
    }
    throw lastError;
  }),
}));

vi.mock('../utils/errors', () => ({
  isRetryableError: vi.fn().mockImplementation(error => {
    return !error.message.includes('non-retryable');
  }),
}));

describe('retry Pattern', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateDelay', () => {
    test('should calculate fixed delay', () => {
      const pattern = {
        baseDelay: 1000,
        strategy: 'fixed' as const,
        jitter: false,
      };

      expect(calculateDelay(1, pattern)).toBe(1000);
      expect(calculateDelay(2, pattern)).toBe(1000);
      expect(calculateDelay(3, pattern)).toBe(1000);
    });

    test('should calculate linear delay', () => {
      const pattern = {
        baseDelay: 1000,
        strategy: 'linear' as const,
        jitter: false,
      };

      expect(calculateDelay(1, pattern)).toBe(1000);
      expect(calculateDelay(2, pattern)).toBe(2000);
      expect(calculateDelay(3, pattern)).toBe(3000);
    });

    test('should calculate exponential delay', () => {
      const pattern = {
        baseDelay: 1000,
        strategy: 'exponential' as const,
        jitter: false,
      };

      expect(calculateDelay(1, pattern)).toBe(1000);
      expect(calculateDelay(2, pattern)).toBe(2000);
      expect(calculateDelay(3, pattern)).toBe(4000);
      expect(calculateDelay(4, pattern)).toBe(8000);
    });

    test('should apply maximum delay cap', () => {
      const pattern = {
        baseDelay: 1000,
        strategy: 'exponential' as const,
        maxDelay: 5000,
        jitter: false,
      };

      expect(calculateDelay(1, pattern)).toBe(1000);
      expect(calculateDelay(2, pattern)).toBe(2000);
      expect(calculateDelay(3, pattern)).toBe(4000);
      expect(calculateDelay(4, pattern)).toBe(5000); // Capped
      expect(calculateDelay(5, pattern)).toBe(5000); // Capped
    });

    test('should apply jitter when enabled', () => {
      const pattern = {
        baseDelay: 1000,
        strategy: 'fixed' as const,
        jitter: true,
      };

      const delay1 = calculateDelay(1, pattern);
      const delay2 = calculateDelay(1, pattern);

      // Should be within ±25% of base delay
      expect(delay1).toBeGreaterThanOrEqual(750);
      expect(delay1).toBeLessThanOrEqual(1250);
      expect(delay2).toBeGreaterThanOrEqual(750);
      expect(delay2).toBeLessThanOrEqual(1250);

      // With jitter, delays should potentially be different
      // (though they might be the same due to randomness)
    });

    test('should handle jitter with maximum delay', () => {
      const pattern = {
        baseDelay: 1000,
        strategy: 'exponential' as const,
        maxDelay: 2000,
        jitter: true,
      };

      const delay = calculateDelay(4, pattern); // Would be 8000 without max

      // Should be capped at maxDelay (2000) and then jitter applied
      expect(delay).toBeGreaterThanOrEqual(1500); // 2000 - 25%
      expect(delay).toBeLessThanOrEqual(2500); // 2000 + 25%
    });

    test('should default to exponential strategy', () => {
      const pattern = {
        baseDelay: 1000,
        jitter: false,
      } as any; // No strategy specified

      expect(calculateDelay(1, pattern)).toBe(1000);
      expect(calculateDelay(2, pattern)).toBe(2000);
      expect(calculateDelay(3, pattern)).toBe(4000);
    });
  });

  describe('withRetry', () => {
    test('should execute function successfully on first attempt', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const retryFn = withRetry(fn);

      const result = await retryFn();

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    test('should retry on failure and succeed', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockResolvedValueOnce('success');

      const retryFn = withRetry(fn, { maxAttempts: 3 });

      const result = await retryFn();

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    test('should respect maxAttempts limit', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Always fails'));
      const retryFn = withRetry(fn, { maxAttempts: 3 });

      await expect(retryFn()).rejects.toThrow('Always fails');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    test('should use custom shouldRetry function', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('retryable-error'))
        .mockRejectedValueOnce(new Error('non-retryable-error'))
        .mockResolvedValueOnce('success');

      const shouldRetry = vi.fn().mockImplementation(error => {
        return error.message.includes('retryable');
      });

      const retryFn = withRetry(fn, {
        maxAttempts: 5,
        shouldRetry,
      });

      await expect(retryFn()).rejects.toThrow('non-retryable-error');
      expect(fn).toHaveBeenCalledTimes(2);
      expect(shouldRetry).toHaveBeenCalledTimes(2);
    });

    test('should use default retry logic when shouldRetry not provided', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('retryable-error'))
        .mockRejectedValueOnce(new Error('non-retryable-error'))
        .mockResolvedValueOnce('success');

      const retryFn = withRetry(fn, { maxAttempts: 5 });

      await expect(retryFn()).rejects.toThrow('non-retryable-error');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    test('should pass arguments to the wrapped function', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const retryFn = withRetry(fn);

      await retryFn('arg1', 'arg2', { option: 'value' });

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2', { option: 'value' });
    });

    test('should work with different retry strategies', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('First fail'))
        .mockRejectedValueOnce(new Error('Second fail'))
        .mockResolvedValueOnce('success');

      const retryFn = withRetry(fn, {
        maxAttempts: 3,
        baseDelay: 100,
        strategy: 'linear',
      });

      const result = await retryFn();

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    test('should handle async functions', async () => {
      const asyncFn = vi.fn().mockImplementation(async (value: string) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        if (value === 'fail') {
          throw new Error('Async failure');
        }
        return `async-${value}`;
      });

      const retryFn = withRetry(asyncFn, { maxAttempts: 2 });

      // Test success case
      const successResult = await retryFn('success');
      expect(successResult).toBe('async-success');

      // Test failure case
      await expect(retryFn('fail')).rejects.toThrow('Async failure');
    });

    test('should handle retry with context', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Context error'))
        .mockResolvedValueOnce('success');

      const context = {
        operationId: 'test-op-123',
        userId: 'user-456',
      };

      const retryFn = withRetry(fn, {
        maxAttempts: 2,
        context,
      });

      const result = await retryFn();

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    test('should work with zero base delay', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('First fail'))
        .mockResolvedValueOnce('success');

      const retryFn = withRetry(fn, {
        maxAttempts: 2,
        baseDelay: 0,
      });

      const result = await retryFn();

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    test('should handle functions that return non-promise values', async () => {
      const syncFn = vi.fn().mockReturnValue('sync-result');
      const retryFn = withRetry(syncFn);

      const result = await retryFn();

      expect(result).toBe('sync-result');
      expect(syncFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge Cases and Error Scenarios', () => {
    test('should handle function that throws non-Error objects', async () => {
      const fn = vi.fn().mockImplementation(() => {
        throw 'String error';
      });

      const retryFn = withRetry(fn, { maxAttempts: 2 });

      await expect(retryFn()).rejects.toBe('String error');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    test('should handle function that returns rejected promise', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Rejected promise'));
      const retryFn = withRetry(fn, { maxAttempts: 2 });

      await expect(retryFn()).rejects.toThrow('Rejected promise');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    test('should handle very large maxAttempts', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValueOnce('success');

      const retryFn = withRetry(fn, { maxAttempts: 1000 });

      const result = await retryFn();

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    test('should handle maxAttempts of 1 (no retries)', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('No retries'));
      const retryFn = withRetry(fn, { maxAttempts: 1 });

      await expect(retryFn()).rejects.toThrow('No retries');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    test('should handle shouldRetry function that throws', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Function error'));
      const shouldRetry = vi.fn().mockImplementation(() => {
        throw new Error('shouldRetry error');
      });

      const retryFn = withRetry(fn, {
        maxAttempts: 3,
        shouldRetry,
      });

      // Should still work, falling back to default retry logic
      await expect(retryFn()).rejects.toThrow('Function error');
    });
  });

  describe('integration with calculateDelay', () => {
    test('should use calculated delays in retry attempts', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValueOnce('success');

      const startTime = Date.now();
      const retryFn = withRetry(fn, {
        maxAttempts: 3,
        baseDelay: 100,
        strategy: 'fixed',
      });

      const result = await retryFn();
      const endTime = Date.now();

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);

      // Should have taken at least some time for the delays
      // (though we can't be too precise due to test environment timing)
      expect(endTime - startTime).toBeGreaterThanOrEqual(50);
    });
  });
});
