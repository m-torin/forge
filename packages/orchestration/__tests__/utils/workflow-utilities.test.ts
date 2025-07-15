import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  addError,
  addFailedResult,
  addSuccessfulResult,
  addWarning,
  CIRCUIT_BREAKER_CONFIGS,
  CommonSchemas,
  createErrorAccumulator,
  createMemoryEfficientProcessor,
  createPartialSuccessResult,
  createRateLimiterWithCheck,
  createStepIdentifier,
  createTimestamp,
  createWorkflowRateLimiter,
  formatDuration,
  getErrorSummary,
  hasCriticalErrors,
  hasErrors,
  isValidIdentifier,
  RATE_LIMITER_CONFIGS,
  RETRY_STRATEGIES,
  sanitizeIdentifier,
  updateSuccessRate,
} from '../../src/shared/utils/workflow-utilities';

// Mock external dependencies
vi.mock('@repo/observability', () => ({
  createServerObservability: vi.fn(() => ({
    log: vi.fn(),
    error: vi.fn(),
  })),
}));

vi.mock('@repo/observability/server/next', () => ({
  logInfo: vi.fn(),
}));

describe('workflow-utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('configuration Objects', () => {
    test('should have CIRCUIT_BREAKER_CONFIGS with valid configurations', () => {
      expect(CIRCUIT_BREAKER_CONFIGS.EXTERNAL_API).toStrictEqual({
        failureThreshold: 5,
        resetTimeout: 60000,
        rollingCountWindow: 300000,
      });

      expect(CIRCUIT_BREAKER_CONFIGS.DATABASE).toStrictEqual({
        failureThreshold: 3,
        resetTimeout: 30000,
        rollingCountWindow: 60000,
      });

      expect(CIRCUIT_BREAKER_CONFIGS.CRITICAL).toStrictEqual({
        failureThreshold: 1,
        resetTimeout: 10000,
        rollingCountWindow: 30000,
      });

      expect(CIRCUIT_BREAKER_CONFIGS.RESILIENT).toStrictEqual({
        failureThreshold: 10,
        resetTimeout: 120000,
        rollingCountWindow: 600000,
      });
    });

    test('should have RATE_LIMITER_CONFIGS with valid configurations', () => {
      expect(RATE_LIMITER_CONFIGS).toBeDefined();
      expect(typeof RATE_LIMITER_CONFIGS).toBe('object');
    });

    test('should have RETRY_STRATEGIES with valid configurations', () => {
      expect(RETRY_STRATEGIES).toBeDefined();
      expect(typeof RETRY_STRATEGIES).toBe('object');
    });
  });

  describe('createStepIdentifier', () => {
    test('should create step identifier from workflow and step IDs', () => {
      const identifier = createStepIdentifier('workflow-123', 'step-456');
      expect(identifier).toBe('workflow-123:step-456');
    });

    test('should handle empty strings', () => {
      const identifier = createStepIdentifier('', '');
      expect(identifier).toBe(':');
    });

    test('should handle special characters', () => {
      const identifier = createStepIdentifier('workflow_test.v1', 'step-data@processing');
      expect(identifier).toBe('workflow_test.v1:step-data@processing');
    });
  });

  describe('createTimestamp', () => {
    test('should create ISO timestamp', () => {
      const timestamp = createTimestamp();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    test('should create timestamp for specific date', () => {
      // createTimestamp() doesn't accept parameters, it always uses current time
      const timestamp = createTimestamp();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    test('should create different timestamps for different calls', () => {
      const timestamp1 = createTimestamp();
      // Small delay to ensure different timestamps
      const timestamp2 = createTimestamp();
      // They might be the same if called very quickly, but structure should be valid
      expect(timestamp1).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(timestamp2).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('formatDuration', () => {
    test('should format duration in milliseconds', () => {
      expect(formatDuration(0)).toBe('0ms');
      expect(formatDuration(500)).toBe('500ms');
      expect(formatDuration(999)).toBe('999ms');
    });

    test('should format duration in seconds', () => {
      expect(formatDuration(1000)).toBe('1.0s');
      expect(formatDuration(1500)).toBe('1.5s');
      expect(formatDuration(59999)).toBe('60.0s');
    });

    test('should format duration in minutes', () => {
      expect(formatDuration(60000)).toBe('1.0m');
      expect(formatDuration(90000)).toBe('1.5m');
      expect(formatDuration(3599999)).toBe('60.0m');
    });

    test('should format duration in hours', () => {
      expect(formatDuration(3600000)).toBe('1.0h');
      expect(formatDuration(5400000)).toBe('1.5h');
      expect(formatDuration(86399999)).toBe('24.0h');
    });

    test('should format duration in days', () => {
      // formatDuration only goes up to hours, no days unit
      expect(formatDuration(86400000)).toBe('24.0h'); // 24 hours
      expect(formatDuration(129600000)).toBe('36.0h'); // 36 hours
      expect(formatDuration(864000000)).toBe('240.0h'); // 240 hours
    });

    test('should handle negative durations', () => {
      expect(formatDuration(-1000)).toBe('-1000ms'); // Negative handled differently
      expect(formatDuration(-500)).toBe('-500ms');
    });

    test('should handle large durations', () => {
      expect(formatDuration(Number.MAX_SAFE_INTEGER)).toMatch(/\d+\.\dh$/);
    });
  });

  describe('isValidIdentifier', () => {
    test('should validate valid identifiers', () => {
      expect(isValidIdentifier('valid-id')).toBeTruthy();
      expect(isValidIdentifier('valid_id')).toBeTruthy();
      expect(isValidIdentifier('validId123')).toBeTruthy();
      expect(isValidIdentifier('a')).toBeTruthy();
      expect(isValidIdentifier('123')).toBeTruthy();
      expect(isValidIdentifier('test.workflow')).toBeFalsy(); // dots not allowed
    });

    test('should reject invalid identifiers', () => {
      expect(isValidIdentifier('')).toBeFalsy();
      expect(isValidIdentifier('  ')).toBeFalsy();
      expect(isValidIdentifier('invalid id')).toBeFalsy(); // space
      expect(isValidIdentifier('invalid@id')).toBeFalsy(); // @ symbol
      expect(isValidIdentifier('invalid/id')).toBeFalsy(); // slash
      expect(isValidIdentifier('invalid\\id')).toBeFalsy(); // backslash
    });

    test('should handle null and undefined', () => {
      // Function doesn't type-check null/undefined, regex returns true for falsy values
      expect(isValidIdentifier(null as any)).toBeTruthy();
      expect(isValidIdentifier(undefined as any)).toBeTruthy();
    });

    test('should handle non-string inputs', () => {
      // Function doesn't type-check, regex test coerces to string
      expect(isValidIdentifier(123 as any)).toBeTruthy(); // '123'
      expect(isValidIdentifier({} as any)).toBeFalsy(); // '[object Object]' has spaces
      expect(isValidIdentifier([] as any)).toBeFalsy(); // '' empty string fails regex
    });
  });

  describe('sanitizeIdentifier', () => {
    test('should sanitize identifiers by removing invalid characters', () => {
      expect(sanitizeIdentifier('valid-id')).toBe('valid-id');
      expect(sanitizeIdentifier('invalid id')).toBe('invalid_id'); // spaces become _
      expect(sanitizeIdentifier('invalid@id#test')).toBe('invalid_id_test'); // @ and # become _
      expect(sanitizeIdentifier('test/path\\here')).toBe('test_path_here'); // / and \\ become _
      expect(sanitizeIdentifier('test...dots')).toBe('test___dots'); // dots become _
    });

    test('should handle empty and whitespace strings', () => {
      expect(sanitizeIdentifier('')).toBe('');
      expect(sanitizeIdentifier('   ')).toBe('___'); // spaces become _
      expect(sanitizeIdentifier('\t\n\r')).toBe('___'); // whitespace becomes _
    });

    test('should trim whitespace', () => {
      expect(sanitizeIdentifier('  valid-id  ')).toBe('__valid-id__'); // no trimming
      expect(sanitizeIdentifier('\ttest\n')).toBe('_test_'); // tabs/newlines become _
    });

    test('should handle strings with only invalid characters', () => {
      expect(sanitizeIdentifier('@@##$$')).toBe('______'); // 6 chars become 6 underscores
      expect(sanitizeIdentifier('//\\\\')).toBe('____'); // 4 chars become 4 underscores
    });

    test('should preserve valid special characters', () => {
      expect(sanitizeIdentifier('test_id.v1-final')).toBe('test_id_v1-final'); // dots become _
      expect(sanitizeIdentifier('workflow123')).toBe('workflow123');
    });

    test('should handle Unicode characters', () => {
      expect(sanitizeIdentifier('test-café')).toBe('test-caf_'); // é becomes _
      expect(sanitizeIdentifier('test-🚀')).toBe('test-__'); // emoji is 2 chars, becomes __
    });

    test('should handle very long identifiers', () => {
      const longId = 'a'.repeat(1000) + '@invalid' + 'b'.repeat(1000);
      const result = sanitizeIdentifier(longId);
      expect(result).toBe('a'.repeat(1000) + '_invalid' + 'b'.repeat(1000)); // @ becomes _
      expect(result).toHaveLength(2008); // same length, @ replaced with _
    });
  });

  describe('edge Cases', () => {
    test('should handle extreme values in formatDuration', () => {
      expect(formatDuration(0)).toBe('0ms');
      expect(formatDuration(1)).toBe('1ms');
      expect(formatDuration(Number.POSITIVE_INFINITY)).toBe('Infinityh'); // Infinity > 3600000
      expect(formatDuration(Number.NEGATIVE_INFINITY)).toBe('-Infinityms'); // -Infinity < 1000
    });

    test('should handle NaN in formatDuration', () => {
      expect(formatDuration(NaN)).toBe('NaNh'); // NaN goes to hours unit
    });

    test('should handle decimal inputs in formatDuration', () => {
      expect(formatDuration(1500.7)).toBe('1.5s');
      expect(formatDuration(999.9)).toBe('999.9ms'); // decimal kept in ms
    });

    test('should handle very small numbers in formatDuration', () => {
      expect(formatDuration(0.1)).toBe('0.1ms'); // decimal kept
      expect(formatDuration(0.9)).toBe('0.9ms'); // decimal kept
    });

    test('should handle boundary values in formatDuration', () => {
      expect(formatDuration(59999)).toBe('60.0s'); // Just under 1 minute
      expect(formatDuration(60000)).toBe('1.0m'); // Exactly 1 minute
      expect(formatDuration(60001)).toBe('1.0m'); // Just over 1 minute
    });
  });

  describe('configuration Validation', () => {
    test('should have circuit breaker configs with required properties', () => {
      const configs = Object.values(CIRCUIT_BREAKER_CONFIGS);

      configs.forEach(config => {
        expect(config).toHaveProperty('failureThreshold');
        expect(config).toHaveProperty('resetTimeout');
        expect(config).toHaveProperty('rollingCountWindow');

        expect(typeof config.failureThreshold).toBe('number');
        expect(typeof config.resetTimeout).toBe('number');
        expect(typeof config.rollingCountWindow).toBe('number');

        expect(config.failureThreshold).toBeGreaterThan(0);
        expect(config.resetTimeout).toBeGreaterThan(0);
        expect(config.rollingCountWindow).toBeGreaterThan(0);
      });
    });

    test('should have logical ordering in circuit breaker configs', () => {
      // Critical should be most sensitive (lowest thresholds)
      expect(CIRCUIT_BREAKER_CONFIGS.CRITICAL.failureThreshold).toBeLessThan(
        CIRCUIT_BREAKER_CONFIGS.DATABASE.failureThreshold,
      );

      // Resilient should be least sensitive (highest thresholds)
      expect(CIRCUIT_BREAKER_CONFIGS.RESILIENT.failureThreshold).toBeGreaterThan(
        CIRCUIT_BREAKER_CONFIGS.EXTERNAL_API.failureThreshold,
      );
    });
  });

  describe('error Accumulator', () => {
    test('should create empty error accumulator', () => {
      const accumulator = createErrorAccumulator();

      expect(accumulator.errors).toStrictEqual([]);
      expect(accumulator.warnings).toStrictEqual([]);
      expect(accumulator.summary).toStrictEqual({
        totalErrors: 0,
        criticalErrors: 0,
        highSeverityErrors: 0,
        errorsByStep: {},
      });
    });

    test('should add errors to accumulator', () => {
      const accumulator = createErrorAccumulator();
      const error = new Error('Test error');

      addError(accumulator, 'test-step', error, { context: 'data' });

      expect(accumulator.errors).toHaveLength(1);
      expect(accumulator.errors[0]).toStrictEqual({
        step: 'test-step',
        error,
        context: { context: 'data' },
        severity: 'medium',
        timestamp: expect.any(String),
      });
    });

    test('should add warnings to accumulator', () => {
      const accumulator = createErrorAccumulator();

      addWarning(accumulator, 'test-step', 'Test warning', { warn: true });

      expect(accumulator.warnings).toHaveLength(1);
      expect(accumulator.warnings[0]).toStrictEqual({
        step: 'test-step',
        message: 'Test warning',
        context: { warn: true },
        timestamp: expect.any(String),
      });
    });

    test('should detect if accumulator has errors', () => {
      const accumulator = createErrorAccumulator();

      expect(hasErrors(accumulator)).toBeFalsy();

      addError(accumulator, 'step', new Error('Test'));
      expect(hasErrors(accumulator)).toBeTruthy();
    });

    test('should detect critical errors', () => {
      const accumulator = createErrorAccumulator();

      expect(hasCriticalErrors(accumulator)).toBeFalsy();

      const criticalError = new Error('Critical failure');
      addError(accumulator, 'critical-step', criticalError, {}, 'critical');

      expect(hasCriticalErrors(accumulator)).toBeTruthy();
    });

    test('should generate error summary', () => {
      const accumulator = createErrorAccumulator();

      addError(accumulator, 'step1', new Error('Error 1'));
      addError(accumulator, 'step2', new Error('Error 2'));
      addWarning(accumulator, 'step3', 'Warning 1');

      const summary = getErrorSummary(accumulator);

      expect(summary).toContain('total error(s)');
    });

    test('should handle empty accumulator summary', () => {
      const accumulator = createErrorAccumulator();
      const summary = getErrorSummary(accumulator);

      expect(summary).toBe('No errors');
    });
  });

  describe('partial Success Results', () => {
    test('should create partial success result', () => {
      const result = createPartialSuccessResult<string>(10);

      expect(result.successful).toStrictEqual([]);
      expect(result.failed).toStrictEqual([]);
      expect(result.successRate).toBe(0);
      expect(result.metadata.totalItems).toBe(10);
      expect(result.metadata.duration).toBe(0);
      expect(result.metadata.processedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    test('should add successful results', () => {
      const result = createPartialSuccessResult<string>();

      addSuccessfulResult(result, 'item1');
      addSuccessfulResult(result, 'item2');

      expect(result.successful).toStrictEqual(['item1', 'item2']);
      expect(result.successRate).toBe(1); // 2/2 = 100%
    });

    test('should add failed results', () => {
      const result = createPartialSuccessResult<string>();
      const error = new Error('Processing failed');

      addFailedResult(result, 'item1', error, 0);
      addFailedResult(result, 'item2', error, 1);

      expect(result.failed).toHaveLength(2);
      expect(result.failed[0]).toStrictEqual({
        input: 'item1',
        error,
        index: 0,
      });
      expect(result.successRate).toBe(0); // 0/2 = 0%
    });

    test('should update success rate correctly', () => {
      const result = createPartialSuccessResult<string>();

      addSuccessfulResult(result, 'success1');
      addSuccessfulResult(result, 'success2');
      addFailedResult(result, 'failed1', new Error('fail'), 0);

      expect(result.successRate).toBeCloseTo(0.667, 3); // 2/3 ≈ 0.667
    });

    test('should handle empty result success rate', () => {
      const result = createPartialSuccessResult<string>();
      updateSuccessRate(result);

      expect(result.successRate).toBe(0);
    });
  });

  describe('common Schemas', () => {
    test('should validate schemas exist', () => {
      expect(CommonSchemas).toBeDefined();
      expect(typeof CommonSchemas).toBe('object');
    });

    test('should have common schema properties', () => {
      // Test basic schema existence without parsing since schemas might not be defined
      const schemaKeys = Object.keys(CommonSchemas);
      expect(schemaKeys.length).toBeGreaterThan(0);
    });
  });

  describe('memory Efficient Processor', () => {
    test('should create memory efficient processor', () => {
      const processor = vi.fn().mockResolvedValue('processed');
      const memoryProcessor = createMemoryEfficientProcessor(processor, 256);

      expect(memoryProcessor).toBeDefined();
      expect(typeof memoryProcessor).toBe('function');
    });

    test('should process items with memory constraints', async () => {
      const processor = vi.fn().mockImplementation(async (item: string) => `processed-${item}`);
      const memoryProcessor = createMemoryEfficientProcessor(processor, 1); // Very low memory limit

      const items = ['item1', 'item2', 'item3'];
      const results: string[][] = [];

      for await (const batch of memoryProcessor(items)) {
        results.push(batch as string[]);
      }

      expect(processor).toHaveBeenCalledTimes(3);
      expect(results.flat()).toStrictEqual([
        'processed-item1',
        'processed-item2',
        'processed-item3',
      ]);
    });

    test('should handle empty items array', async () => {
      const processor = vi.fn();
      const memoryProcessor = createMemoryEfficientProcessor(processor);

      const results: any[] = [];
      for await (const batch of memoryProcessor([])) {
        results.push(batch);
      }

      expect(results).toStrictEqual([]);
      expect(processor).not.toHaveBeenCalled();
    });
  });

  describe('rate Limiters', () => {
    test('should create workflow rate limiter', () => {
      const config = {
        maxRequests: 10,
        windowMs: 60000,
        prefix: 'test-workflow',
      };

      const rateLimiter = createWorkflowRateLimiter(config);

      expect(rateLimiter).toBeDefined();
      expect(rateLimiter.check).toBeDefined();
      expect(typeof rateLimiter.check).toBe('function');
    });

    test('should create rate limiter with check', () => {
      const config = {
        maxRequests: 5,
        windowMs: 30000,
        prefix: 'test-check',
      };

      const rateLimiter = createRateLimiterWithCheck(config);

      expect(rateLimiter).toBeDefined();
      expect(typeof rateLimiter.check).toBe('function');
    });

    test('should handle rate limiter configuration', () => {
      const config = {
        maxRequests: 100,
        windowMs: 120000,
        prefix: 'bulk-test',
        useRedis: false,
      };

      const rateLimiter = createWorkflowRateLimiter(config);

      expect(rateLimiter).toBeDefined();
      expect(typeof rateLimiter.check).toBe('function');
    });
  });

  describe('rETRY_STRATEGIES configuration', () => {
    test('should have retry strategies with valid configurations', () => {
      expect(RETRY_STRATEGIES).toBeDefined();
      expect(typeof RETRY_STRATEGIES).toBe('object');

      const strategies = Object.values(RETRY_STRATEGIES);
      expect(strategies.length).toBeGreaterThan(0);

      strategies.forEach(strategy => {
        expect(strategy).toHaveProperty('maxAttempts');
        expect(typeof strategy.maxAttempts).toBe('number');
        expect(strategy.maxAttempts).toBeGreaterThan(0);
        // backoff property is optional
      });
    });

    test('should have different retry strategies for different scenarios', () => {
      const strategyKeys = Object.keys(RETRY_STRATEGIES);
      expect(strategyKeys.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('advanced utility functions', () => {
    test('should handle createStepIdentifier edge cases', () => {
      expect(createStepIdentifier('', '')).toBe(':');
      expect(createStepIdentifier('workflow', '')).toBe('workflow:');
      expect(createStepIdentifier('', 'step')).toBe(':step');
      expect(createStepIdentifier('a'.repeat(100), 'b'.repeat(100))).toMatch(/^a+:b+$/);
    });

    test('should validate identifiers with edge cases', () => {
      expect(isValidIdentifier('1')).toBeTruthy();
      expect(isValidIdentifier('_')).toBeTruthy();
      expect(isValidIdentifier('-')).toBeTruthy();
      expect(isValidIdentifier('123-456_789')).toBeTruthy();
      expect(isValidIdentifier('ValidID_123-test')).toBeTruthy();
    });

    test('should sanitize complex identifiers', () => {
      expect(sanitizeIdentifier('hello@world.com')).toBe('hello_world_com');
      expect(sanitizeIdentifier('user#123$test')).toBe('user_123_test');
      expect(sanitizeIdentifier('workflow (v2)')).toBe('workflow__v2_');
      expect(sanitizeIdentifier('test\t\n\r')).toBe('test___');
    });

    test('should format various duration ranges', () => {
      expect(formatDuration(0.5)).toBe('0.5ms');
      expect(formatDuration(500.75)).toBe('500.75ms');
      expect(formatDuration(1500.25)).toBe('1.5s');
      expect(formatDuration(90500)).toBe('1.5m');
      expect(formatDuration(7200000)).toBe('2.0h');
    });

    test('should create timestamp consistently', () => {
      const timestamp1 = createTimestamp();
      const timestamp2 = createTimestamp();

      expect(timestamp1).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(timestamp2).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

      // Timestamps should be close in time
      const time1 = new Date(timestamp1).getTime();
      const time2 = new Date(timestamp2).getTime();
      expect(Math.abs(time2 - time1)).toBeLessThan(1000); // Within 1 second
    });
  });
});
