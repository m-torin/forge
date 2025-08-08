/**
 * Comprehensive test coverage for workflow-utilities.ts
 * Tests batch processing, progress reporting, error handling, and utility functions
 */

import { beforeEach, describe, expect, vi } from 'vitest';

// Import after mocking
import {
  CIRCUIT_BREAKER_CONFIGS,
  CommonSchemas,
  ProgressReporter,
  RATE_LIMITER_CONFIGS,
  RETRY_STRATEGIES,
  addError,
  addFailedResult,
  addSuccessfulResult,
  addWarning,
  createErrorAccumulator,
  createMemoryEfficientProcessor,
  createPartialSuccessResult,
  createStepIdentifier,
  createTimestamp,
  createWorkflowRateLimiter,
  formatDuration,
  getErrorSummary,
  hasCriticalErrors,
  hasErrors,
  isValidIdentifier,
  processBatch,
  sanitizeIdentifier,
  streamProcess,
  updateSuccessRate,
  withFallback,
} from '../../src/shared/utils/workflow-utilities';

// Mock dependencies
vi.mock('@repo/observability/server/next', () => ({
  createServerObservability: vi.fn().mockResolvedValue({
    log: vi.fn(),
  }),
  logInfo: vi.fn(),
}));

vi.mock('./rate-limit', () => ({
  createRateLimiter: vi.fn().mockReturnValue({
    limit: vi.fn().mockResolvedValue({ success: true }),
  }),
}));

describe('workflow Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('circuit Breaker Configurations', () => {
    test('should export all circuit breaker configurations', () => {
      expect(CIRCUIT_BREAKER_CONFIGS.EXTERNAL_API).toBeDefined();
      expect(CIRCUIT_BREAKER_CONFIGS.DATABASE).toBeDefined();
      expect(CIRCUIT_BREAKER_CONFIGS.CRITICAL).toBeDefined();
      expect(CIRCUIT_BREAKER_CONFIGS.RESILIENT).toBeDefined();
    });

    test('should have proper configuration values', () => {
      expect(CIRCUIT_BREAKER_CONFIGS.EXTERNAL_API.failureThreshold).toBe(5);
      expect(CIRCUIT_BREAKER_CONFIGS.DATABASE.failureThreshold).toBe(3);
      expect(CIRCUIT_BREAKER_CONFIGS.CRITICAL.failureThreshold).toBe(1);
      expect(CIRCUIT_BREAKER_CONFIGS.RESILIENT.failureThreshold).toBe(10);
    });

    test('should have different timeout configurations', () => {
      expect(CIRCUIT_BREAKER_CONFIGS.CRITICAL.resetTimeout).toBeLessThan(
        CIRCUIT_BREAKER_CONFIGS.DATABASE.resetTimeout,
      );
      expect(CIRCUIT_BREAKER_CONFIGS.DATABASE.resetTimeout).toBeLessThan(
        CIRCUIT_BREAKER_CONFIGS.EXTERNAL_API.resetTimeout,
      );
    });
  });

  describe('rate Limiter Configurations', () => {
    test('should export all rate limiter configurations', () => {
      expect(RATE_LIMITER_CONFIGS.EXTERNAL_API_STRICT).toBeDefined();
      expect(RATE_LIMITER_CONFIGS.EXTERNAL_API_MODERATE).toBeDefined();
      expect(RATE_LIMITER_CONFIGS.INTERNAL_API).toBeDefined();
      expect(RATE_LIMITER_CONFIGS.BULK_OPERATION).toBeDefined();
      expect(RATE_LIMITER_CONFIGS.DATABASE_WRITE).toBeDefined();
    });

    test('should have different rate limits', () => {
      expect(RATE_LIMITER_CONFIGS.EXTERNAL_API_STRICT.maxRequests).toBe(60);
      expect(RATE_LIMITER_CONFIGS.EXTERNAL_API_MODERATE.maxRequests).toBe(300);
      expect(RATE_LIMITER_CONFIGS.INTERNAL_API.maxRequests).toBe(1000);
    });

    test('should have unique prefixes', () => {
      const prefixes = Object.values(RATE_LIMITER_CONFIGS).map(config => config.prefix);
      const uniquePrefixes = [...new Set(prefixes)];
      expect(prefixes).toStrictEqual(uniquePrefixes);
    });
  });

  describe('batch Processing', () => {
    describe('processBatch', () => {
      test('should process items in batches', async () => {
        const items = [1, 2, 3, 4, 5];
        const processor = vi.fn().mockImplementation(async (item: number) => item * 2);

        const result = await processBatch(items, processor, {
          batchSize: 2,
          concurrency: 1,
        });

        expect(result.results).toStrictEqual([2, 4, 6, 8, 10]);
        expect(result.errors).toStrictEqual([]);
        expect(processor).toHaveBeenCalledTimes(5);
      });

      test('should handle processing errors', async () => {
        const items = [1, 2, 3];
        const processor = vi.fn().mockImplementation(async (item: number) => {
          if (item === 2) throw new Error('Processing failed');
          return item * 2;
        });

        const result = await processBatch(items, processor, {
          continueOnError: true,
        });

        expect(result.results).toStrictEqual([2, 6]);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].item).toBe(2);
        expect(result.errors[0].error.message).toBe('Processing failed');
      });

      test('should call progress callback', async () => {
        const items = [1, 2, 3];
        const processor = vi.fn().mockImplementation(async (item: number) => item * 2);
        const onProgress = vi.fn();

        await processBatch(items, processor, {
          onProgress,
        });

        expect(onProgress).toHaveBeenCalledWith(3, 3);
      });

      test('should preserve order when configured', async () => {
        const items = [1, 2, 3, 4, 5];
        const processor = vi.fn().mockImplementation(async (item: number) => {
          // Simulate variable processing time
          await new Promise(resolve => setTimeout(resolve, (6 - item) * 10));
          return item * 2;
        });

        const result = await processBatch(items, processor, {
          preserveOrder: true,
          concurrency: 3,
        });

        expect(result.results).toStrictEqual([2, 4, 6, 8, 10]);
      });

      test('should handle timeout', async () => {
        const items = [1, 2];
        const processor = vi.fn().mockImplementation(async (item: number) => {
          if (item === 2) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
          return item * 2;
        });

        const result = await processBatch(items, processor, {
          timeout: 100,
          continueOnError: true,
        });

        expect(result.results).toStrictEqual([2]);
        expect(result.errors).toHaveLength(1);
      });
    });

    describe('streamProcess', () => {
      test('should process items as a stream', async () => {
        const items = [1, 2, 3];
        const processor = vi.fn().mockImplementation(async (item: number) => item * 2);
        const results: number[] = [];

        await streamProcess(items, processor, {
          onResult: async result => {
            results.push(result);
          },
        });

        expect(results).toStrictEqual([2, 4, 6]);
      });

      test('should handle stream processing errors', async () => {
        const items = [1, 2, 3];
        const processor = vi.fn().mockImplementation(async (item: number) => {
          if (item === 2) throw new Error('Stream error');
          return item * 2;
        });
        const errors: any[] = [];

        await streamProcess(items, processor, {
          onResult: async () => {},
          onError: async (error, item) => {
            errors.push({ error, item });
          },
        });

        expect(errors).toHaveLength(1);
        expect(errors[0].item).toBe(2);
      });
    });

    describe('createMemoryEfficientProcessor', () => {
      test('should create a memory efficient processor', async () => {
        const processor = vi.fn().mockImplementation(async (item: number) => item * 2);
        const memoryProcessor = createMemoryEfficientProcessor(processor, {
          batchSize: 2,
          gcInterval: 1,
        });

        const result = await memoryProcessor([1, 2, 3, 4]);

        expect(result).toStrictEqual([2, 4, 6, 8]);
        expect(processor).toHaveBeenCalledTimes(4);
      });

      test('should handle memory processing errors', async () => {
        const processor = vi.fn().mockImplementation(async (item: number) => {
          if (item === 2) throw new Error('Memory error');
          return item * 2;
        });
        const memoryProcessor = createMemoryEfficientProcessor(processor);

        await expect(memoryProcessor([1, 2, 3])).rejects.toThrow('Memory error');
      });
    });
  });

  describe('progress Reporting', () => {
    test('should create progress reporter', () => {
      const reporter = new ProgressReporter('test-operation');

      expect(reporter).toBeDefined();
      expect(typeof reporter.report).toBe('function');
      expect(typeof reporter.complete).toBe('function');
      expect(typeof reporter.fail).toBe('function');
    });

    test('should report progress', async () => {
      const reporter = new ProgressReporter('test-operation');

      await reporter.report(50, 100, { stage: 'processing' });
      await reporter.complete({ processed: 100 });

      // Should not throw
      expect(true).toBeTruthy();
    });

    test('should report failures', async () => {
      const reporter = new ProgressReporter('test-operation');
      const error = new Error('Test error');

      await reporter.fail(error, { context: 'test' });

      // Should not throw
      expect(true).toBeTruthy();
    });
  });

  describe('error Accumulator', () => {
    test('should create error accumulator', () => {
      const accumulator = createErrorAccumulator();

      expect(accumulator.errors).toStrictEqual([]);
      expect(accumulator.warnings).toStrictEqual([]);
      expect(accumulator.successfulResults).toStrictEqual([]);
      expect(accumulator.failedResults).toStrictEqual([]);
    });

    test('should add errors', () => {
      const accumulator = createErrorAccumulator();
      const error = new Error('Test error');

      addError(accumulator, error, 'Test context');

      expect(accumulator.errors).toHaveLength(1);
      expect(accumulator.errors[0].error).toBe(error);
      expect(accumulator.errors[0].context).toBe('Test context');
    });

    test('should add warnings', () => {
      const accumulator = createErrorAccumulator();

      addWarning(accumulator, 'Test warning', 'Warning context');

      expect(accumulator.warnings).toHaveLength(1);
      expect(accumulator.warnings[0].message).toBe('Test warning');
      expect(accumulator.warnings[0].context).toBe('Warning context');
    });

    test('should add successful results', () => {
      const accumulator = createErrorAccumulator();
      const result = { success: true, data: 'test' };

      addSuccessfulResult(accumulator, result, 'Success context');

      expect(accumulator.successfulResults).toHaveLength(1);
      expect(accumulator.successfulResults[0].result).toBe(result);
    });

    test('should add failed results', () => {
      const accumulator = createErrorAccumulator();
      const error = new Error('Failed');

      addFailedResult(accumulator, error, 'Failure context');

      expect(accumulator.failedResults).toHaveLength(1);
      expect(accumulator.failedResults[0].error).toBe(error);
    });

    test('should check for errors', () => {
      const accumulator = createErrorAccumulator();

      expect(hasErrors(accumulator)).toBeFalsy();

      addError(accumulator, new Error('Test'), 'context');

      expect(hasErrors(accumulator)).toBeTruthy();
    });

    test('should check for critical errors', () => {
      const accumulator = createErrorAccumulator();

      expect(hasCriticalErrors(accumulator)).toBeFalsy();

      addError(accumulator, new Error('Critical'), 'context', true);

      expect(hasCriticalErrors(accumulator)).toBeTruthy();
    });

    test('should get error summary', () => {
      const accumulator = createErrorAccumulator();
      addError(accumulator, new Error('Error 1'), 'context');
      addWarning(accumulator, 'Warning 1', 'context');

      const summary = getErrorSummary(accumulator);

      expect(summary.totalErrors).toBe(1);
      expect(summary.totalWarnings).toBe(1);
      expect(summary.hasCriticalErrors).toBeFalsy();
    });
  });

  describe('partial Success Handling', () => {
    test('should create partial success result', () => {
      const successfulResults = [{ data: 'success1' }, { data: 'success2' }];
      const failedResults = [new Error('Failed 1')];

      const result = createPartialSuccessResult(successfulResults, failedResults);

      expect(result.success).toBeTruthy();
      expect(result.partial).toBeTruthy();
      expect(result.successfulResults).toBe(successfulResults);
      expect(result.failedResults).toBe(failedResults);
      expect(result.successRate).toBe(2 / 3);
    });

    test('should update success rate', () => {
      const result = createPartialSuccessResult([1, 2], [new Error('failed')]);

      updateSuccessRate(result, 4, 1);

      expect(result.successRate).toBe(4 / 5);
    });
  });

  describe('fallback Mechanisms', () => {
    test('should execute with fallback on success', async () => {
      const primaryFn = vi.fn().mockResolvedValue('primary-result');
      const fallbackFn = vi.fn().mockResolvedValue('fallback-result');

      const result = await withFallback(primaryFn, fallbackFn)();

      expect(result).toBe('primary-result');
      expect(primaryFn).toHaveBeenCalledWith();
      expect(fallbackFn).not.toHaveBeenCalled();
    });

    test('should execute fallback on primary failure', async () => {
      const primaryFn = vi.fn().mockRejectedValue(new Error('Primary failed'));
      const fallbackFn = vi.fn().mockResolvedValue('fallback-result');

      const result = await withFallback(primaryFn, fallbackFn)();

      expect(result).toBe('fallback-result');
      expect(primaryFn).toHaveBeenCalledWith();
      expect(fallbackFn).toHaveBeenCalledWith();
    });

    test('should throw if both primary and fallback fail', async () => {
      const primaryFn = vi.fn().mockRejectedValue(new Error('Primary failed'));
      const fallbackFn = vi.fn().mockRejectedValue(new Error('Fallback failed'));

      await expect(withFallback(primaryFn, fallbackFn)()).rejects.toThrow('Primary failed');
    });

    test('should respect retry configuration', async () => {
      const primaryFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Attempt 1'))
        .mockResolvedValueOnce('success');
      const fallbackFn = vi.fn();

      const result = await withFallback(primaryFn, fallbackFn, {
        retries: 1,
        retryDelay: 0,
      })();

      expect(result).toBe('success');
      expect(primaryFn).toHaveBeenCalledTimes(2);
      expect(fallbackFn).not.toHaveBeenCalled();
    });
  });

  describe('utility Functions', () => {
    describe('createTimestamp', () => {
      test('should create ISO timestamp', () => {
        const timestamp = createTimestamp();

        expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      });

      test('should create timestamp with custom date', () => {
        const date = new Date('2024-01-01T00:00:00.000Z');
        const timestamp = createTimestamp(date);

        expect(timestamp).toBe('2024-01-01T00:00:00.000Z');
      });
    });

    describe('formatDuration', () => {
      test('should format duration in milliseconds', () => {
        expect(formatDuration(500)).toBe('500ms');
        expect(formatDuration(1500)).toBe('1.5s');
        expect(formatDuration(65000)).toBe('1m 5s');
        expect(formatDuration(3665000)).toBe('1h 1m 5s');
      });

      test('should handle zero duration', () => {
        expect(formatDuration(0)).toBe('0ms');
      });

      test('should handle negative duration', () => {
        expect(formatDuration(-1000)).toBe('0ms');
      });
    });

    describe('sanitizeIdentifier', () => {
      test('should sanitize identifiers', () => {
        expect(sanitizeIdentifier('test-id')).toBe('test-id');
        expect(sanitizeIdentifier('test id')).toBe('test-id');
        expect(sanitizeIdentifier('test@id#123')).toBe('test-id-123');
        expect(sanitizeIdentifier('Test_ID')).toBe('test-id');
      });

      test('should handle empty string', () => {
        expect(sanitizeIdentifier('')).toBe('');
      });

      test('should handle special characters', () => {
        expect(sanitizeIdentifier('!@#$%^&*()')).toBe('');
      });
    });

    describe('isValidIdentifier', () => {
      test('should validate identifiers', () => {
        expect(isValidIdentifier('valid-id')).toBeTruthy();
        expect(isValidIdentifier('valid_id')).toBeTruthy();
        expect(isValidIdentifier('valid123')).toBeTruthy();
        expect(isValidIdentifier('invalid id')).toBeFalsy();
        expect(isValidIdentifier('invalid@id')).toBeFalsy();
        expect(isValidIdentifier('')).toBeFalsy();
      });
    });

    describe('createStepIdentifier', () => {
      test('should create step identifier', () => {
        const id = createStepIdentifier('workflow-123', 'step-456');

        expect(id).toBe('workflow-123:step-456');
      });

      test('should sanitize components', () => {
        const id = createStepIdentifier('workflow 123', 'step@456');

        expect(id).toBe('workflow-123:step-456');
      });
    });
  });

  describe('common Schemas', () => {
    test('should export common schemas', () => {
      expect(CommonSchemas).toBeDefined();
      expect(CommonSchemas.positiveInteger).toBeDefined();
      expect(CommonSchemas.nonEmptyString).toBeDefined();
      expect(CommonSchemas.url).toBeDefined();
      expect(CommonSchemas.email).toBeDefined();
    });

    test('should validate positive integers', () => {
      expect(CommonSchemas.positiveInteger.safeParse(5).success).toBeTruthy();
      expect(CommonSchemas.positiveInteger.safeParse(0).success).toBeFalsy();
      expect(CommonSchemas.positiveInteger.safeParse(-1).success).toBeFalsy();
    });

    test('should validate non-empty strings', () => {
      expect(CommonSchemas.nonEmptyString.safeParse('test').success).toBeTruthy();
      expect(CommonSchemas.nonEmptyString.safeParse('').success).toBeFalsy();
    });

    test('should validate URLs', () => {
      expect(CommonSchemas.url.safeParse('https://example.com').success).toBeTruthy();
      expect(CommonSchemas.url.safeParse('invalid-url').success).toBeFalsy();
    });

    test('should validate emails', () => {
      expect(CommonSchemas.email.safeParse('test@example.com').success).toBeTruthy();
      expect(CommonSchemas.email.safeParse('invalid-email').success).toBeFalsy();
    });
  });

  describe('retry Strategies', () => {
    test('should export retry strategies', () => {
      expect(RETRY_STRATEGIES).toBeDefined();
      expect(RETRY_STRATEGIES.IMMEDIATE).toBeDefined();
      expect(RETRY_STRATEGIES.LINEAR).toBeDefined();
      expect(RETRY_STRATEGIES.EXPONENTIAL).toBeDefined();
      expect(RETRY_STRATEGIES.AGGRESSIVE).toBeDefined();
    });

    test('should have different retry configurations', () => {
      expect(RETRY_STRATEGIES.IMMEDIATE.delay).toBe(0);
      expect(RETRY_STRATEGIES.LINEAR.backoff).toBe('linear');
      expect(RETRY_STRATEGIES.EXPONENTIAL.backoff).toBe('exponential');
      expect(RETRY_STRATEGIES.AGGRESSIVE.maxAttempts).toBeGreaterThan(3);
    });
  });

  describe('workflow Rate Limiter', () => {
    test('should create workflow rate limiter', () => {
      const rateLimiter = createWorkflowRateLimiter({
        maxRequests: 100,
        windowMs: 60000,
        prefix: 'test-workflow',
      });

      expect(rateLimiter).toBeDefined();
      expect(typeof rateLimiter.limit).toBe('function');
    });

    test('should create rate limiter with default config', () => {
      const rateLimiter = createWorkflowRateLimiter();

      expect(rateLimiter).toBeDefined();
    });
  });

  describe('integration Tests', () => {
    test('should handle complex batch processing with error accumulation', async () => {
      const items = [1, 2, 3, 4, 5];
      const processor = vi.fn().mockImplementation(async (item: number) => {
        if (item === 3) throw new Error('Processing failed');
        return item * 2;
      });

      const accumulator = createErrorAccumulator();

      const result = await processBatch(
        items,
        async item => {
          try {
            const processed = await processor(item);
            addSuccessfulResult(accumulator, processed, `item-${item}`);
            return processed;
          } catch (error) {
            addError(accumulator, error as Error, `item-${item}`);
            throw error;
          }
        },
        {
          continueOnError: true,
        },
      );

      expect(result.results).toStrictEqual([2, 4, 8, 10]);
      expect(result.errors).toHaveLength(1);
      expect(accumulator.successfulResults).toHaveLength(4);
      expect(accumulator.errors).toHaveLength(1);

      const summary = getErrorSummary(accumulator);
      expect(summary.totalErrors).toBe(1);
      expect(summary.totalWarnings).toBe(0);
    });

    test('should combine fallback with progress reporting', async () => {
      const reporter = new ProgressReporter('test-operation');
      const primaryFn = vi.fn().mockRejectedValue(new Error('Primary failed'));
      const fallbackFn = vi.fn().mockResolvedValue('fallback-success');

      const result = await withFallback(
        async () => {
          await reporter.report(25, 100);
          return primaryFn();
        },
        async () => {
          await reporter.report(75, 100);
          const result = await fallbackFn();
          await reporter.complete({ result });
          return result;
        },
      )();

      expect(result).toBe('fallback-success');
      expect(primaryFn).toHaveBeenCalledWith();
      expect(fallbackFn).toHaveBeenCalledWith();
    });
  });
});
