import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock observability functions
const mockLogInfo = vi.fn();
const mockLogWarn = vi.fn();
const mockLogError = vi.fn();

vi.mock('@repo/observability', () => ({
  logInfo: mockLogInfo,
  logWarn: mockLogWarn,
  logError: mockLogError,
}));

describe('shared/flag-registry', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useRealTimers();
    // Clear the singleton flag manager state
    const { flagManager } = await import('#/shared/flag-registry');
    (flagManager as any).registry.clear();
    (flagManager as any).evaluationMetrics.clear();
  });

  describe('flagManager', () => {
    test('should register a flag with default options', async () => {
      const { flagManager } = await import('#/shared/flag-registry');

      const mockFlagFunction = vi.fn().mockResolvedValue(true);

      flagManager.register('testFlag', mockFlagFunction);

      expect(mockLogInfo).toHaveBeenCalledWith('Flag registered', {
        key: 'testFlag',
        type: 'boolean',
      });
    });

    test('should register a flag with custom options', async () => {
      const { flagManager } = await import('#/shared/flag-registry');

      const mockFlagFunction = vi.fn().mockResolvedValue('variant-a');

      flagManager.register('customFlag', mockFlagFunction, {
        description: 'A custom variant flag',
        type: 'variant',
        adapters: ['posthog', 'edge-config'],
        fallbackType: 'string',
      });

      expect(mockLogInfo).toHaveBeenCalledWith('Flag registered', {
        key: 'customFlag',
        type: 'variant',
      });
    });

    test('should evaluate multiple flags in parallel', async () => {
      const { flagManager } = await import('#/shared/flag-registry');

      const flags = {
        flag1: vi.fn().mockResolvedValue(true),
        flag2: vi.fn().mockResolvedValue('variant-b'),
        flag3: vi.fn().mockResolvedValue(42),
      };

      const result = await flagManager.evaluateFlags(flags);

      expect(result).toStrictEqual({
        flag1: true,
        flag2: 'variant-b',
        flag3: 42,
      });

      expect(flags.flag1).toHaveBeenCalledTimes(1);
      expect(flags.flag2).toHaveBeenCalledTimes(1);
      expect(flags.flag3).toHaveBeenCalledTimes(1);
    });

    test('should handle flag evaluation errors gracefully', async () => {
      const { flagManager } = await import('#/shared/flag-registry');

      const flags = {
        successFlag: vi.fn().mockResolvedValue(true),
        errorFlag: vi.fn().mockRejectedValue(new Error('Evaluation failed')),
        anotherSuccessFlag: vi.fn().mockResolvedValue('success'),
      };

      const result = await flagManager.evaluateFlags(flags, { trackMetrics: true });

      expect(result).toStrictEqual({
        successFlag: true,
        errorFlag: undefined, // Error should result in undefined
        anotherSuccessFlag: 'success',
      });
    });

    test('should handle timeout for slow flag evaluations', async () => {
      vi.useFakeTimers();

      const { flagManager } = await import('#/shared/flag-registry');

      const flags = {
        fastFlag: vi.fn().mockResolvedValue(true),
        slowFlag: vi
          .fn()
          .mockImplementation(
            () => new Promise(resolve => setTimeout(() => resolve('slow'), 2000)),
          ),
      };

      const evaluationPromise = flagManager.evaluateFlags(flags, { timeout: 1000 });

      // Fast forward time
      vi.advanceTimersByTime(1000);

      const result = await evaluationPromise;

      expect(result.fastFlag).toBeTruthy();
      expect(result.slowFlag).toBeUndefined(); // Should timeout

      vi.useRealTimers();
    });

    test('should fail fast when enabled and error occurs', async () => {
      const { flagManager } = await import('#/shared/flag-registry');

      const flags = {
        errorFlag: vi.fn().mockRejectedValue(new Error('First error')),
        successFlag: vi.fn().mockResolvedValue(true),
      };

      await expect(flagManager.evaluateFlags(flags, { failFast: true })).rejects.toThrow(
        'First error',
      );

      // Note: In current implementation, both flags start executing
      // as promises are started simultaneously. This is expected behavior.
      expect(flags.errorFlag).toHaveBeenCalledTimes(1);
      expect(flags.successFlag).toHaveBeenCalledTimes(1);
    });

    test('should track metrics when enabled', async () => {
      const { flagManager } = await import('#/shared/flag-registry');

      // Register flags first
      const mockFlagFunction1 = vi.fn().mockResolvedValue(true);
      const mockFlagFunction2 = vi.fn().mockResolvedValue(false);

      flagManager.register('flag1', mockFlagFunction1);
      flagManager.register('flag2', mockFlagFunction2);

      const flags = {
        flag1: mockFlagFunction1,
        flag2: mockFlagFunction2,
      };

      await flagManager.evaluateFlags(flags, { trackMetrics: true });

      const report = flagManager.generateReport();

      expect(report.totalFlags).toBe(2);
      expect(report.flagDetails).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({ key: 'flag1' }),
          expect.objectContaining({ key: 'flag2' }),
        ]),
      );
    });

    test('should generate comprehensive report', async () => {
      const { flagManager } = await import('#/shared/flag-registry');

      // Register some flags
      flagManager.register('booleanFlag', vi.fn().mockResolvedValue(true), {
        type: 'boolean',
        description: 'Test boolean flag',
      });
      flagManager.register('variantFlag', vi.fn().mockResolvedValue('A'), {
        type: 'variant',
        adapters: ['posthog'],
      });

      const report = flagManager.generateReport();

      expect(report).toMatchObject({
        totalFlags: 2,
        totalEvaluations: expect.any(Number),
        averageLatency: expect.any(Number),
        overallFailureRate: expect.any(Number),
      });

      expect(report.flagDetails).toHaveLength(2);
      expect(report.flagDetails[0]).toMatchObject({
        key: expect.any(String),
        description: expect.any(String),
        evaluations: expect.any(Number),
        failureRate: expect.any(Number),
        avgLatency: expect.any(Number),
        status: expect.stringMatching(/^(healthy|warning|error)$/),
      });
    });

    test('should test flags with mock context', async () => {
      const { flagManager } = await import('#/shared/flag-registry');

      const mockContext = {
        user: { id: 'test-user', sessionId: 'test-session' },
        request: { country: 'US', userAgent: 'test-agent' },
      };

      // Register a flag that depends on context
      const contextFlag = vi.fn().mockResolvedValue(true);
      flagManager.register('contextFlag', contextFlag, {
        description: 'Context-dependent flag',
      });

      const testResults = await flagManager.testFlags({
        ...mockContext,
        request: {
          ...mockContext.request,
          environment: 'test',
          deployment: 'preview',
        },
      });

      expect(testResults).toHaveLength(1);
      expect(testResults[0]).toMatchObject({
        key: 'contextFlag',
        result: true,
        latency: expect.any(Number),
        usedFallback: false,
      });
    });

    test('should handle flag testing errors', async () => {
      const { flagManager } = await import('#/shared/flag-registry');

      const errorFlag = vi.fn().mockRejectedValue(new Error('Test error'));
      flagManager.register('errorFlag', errorFlag);

      const testResults = await flagManager.testFlags({});

      expect(testResults).toHaveLength(1);
      expect(testResults[0]).toMatchObject({
        key: 'errorFlag',
        result: null,
        error: 'Test error',
        usedFallback: true,
      });
    });
  });

  describe('helper functions', () => {
    test('should create managed flag correctly', async () => {
      const { createManagedFlag } = await import('#/shared/flag-registry');

      const mockFlagFunction = vi.fn().mockResolvedValue('test-result');

      const flag = createManagedFlag('helperFlag', mockFlagFunction, {
        description: 'Flag registered via helper',
        type: 'custom',
      });

      expect(flag).toBe(mockFlagFunction);
      expect(mockLogInfo).toHaveBeenCalledWith('Flag registered', {
        key: 'helperFlag',
        type: 'custom',
      });
    });

    test('should evaluate flags correctly', async () => {
      const { evaluateFlags } = await import('#/shared/flag-registry');

      const flags = {
        flag1: vi.fn().mockResolvedValue(true),
        flag2: vi.fn().mockResolvedValue('value'),
      };

      const result = await evaluateFlags(flags, { timeout: 5000 });

      expect(result).toStrictEqual({
        flag1: true,
        flag2: 'value',
      });
    });

    test('should generate report correctly', async () => {
      const { getFlagReport } = await import('#/shared/flag-registry');

      const report = getFlagReport();

      expect(report).toMatchObject({
        totalFlags: expect.any(Number),
        totalEvaluations: expect.any(Number),
        averageLatency: expect.any(Number),
        overallFailureRate: expect.any(Number),
        flagDetails: expect.any(Array),
      });
    });

    test('should test flags correctly', async () => {
      const { testAllFlags } = await import('#/shared/flag-registry');

      const mockContext = {
        user: { id: 'test', sessionId: 'test-session' },
        request: {
          country: 'US',
          userAgent: 'test-agent',
          environment: 'test',
          deployment: 'preview',
        },
      };

      const results = await testAllFlags(mockContext);

      expect(Array.isArray(results)).toBeTruthy();
      results.forEach(result => {
        expect(result).toMatchObject({
          key: expect.any(String),
          result: expect.anything(),
          latency: expect.any(Number),
          usedFallback: expect.any(Boolean),
        });
      });
    });
  });

  describe('edge cases', () => {
    test('should handle empty flags object', async () => {
      const { flagManager } = await import('#/shared/flag-registry');

      const result = await flagManager.evaluateFlags({});

      expect(result).toStrictEqual({});
    });

    test('should handle flags that return null or undefined', async () => {
      const { flagManager } = await import('#/shared/flag-registry');

      const flags = {
        nullFlag: vi.fn().mockResolvedValue(null),
        undefinedFlag: vi.fn().mockResolvedValue(undefined),
        zeroFlag: vi.fn().mockResolvedValue(0),
        falseFlag: vi.fn().mockResolvedValue(false),
      };

      const result = await flagManager.evaluateFlags(flags);

      expect(result).toStrictEqual({
        nullFlag: null,
        undefinedFlag: undefined,
        zeroFlag: 0,
        falseFlag: false,
      });
    });

    test('should handle concurrent flag registrations', async () => {
      const { flagManager } = await import('#/shared/flag-registry');

      const registrations = Array.from(
        { length: 10 },
        (_, i) => () => flagManager.register(`flag${i}`, vi.fn().mockResolvedValue(i)),
      );

      // Register flags concurrently
      registrations.forEach(register => register());

      const report = flagManager.generateReport();
      expect(report.totalFlags).toBe(10);
    });

    test('should handle very large number of flags', async () => {
      const { flagManager } = await import('#/shared/flag-registry');

      const flags: Record<string, () => Promise<any>> = {};

      // Create 100 flags
      for (let i = 0; i < 100; i++) {
        vi.spyOn(flags, `flag${i}`).mockResolvedValue(i % 2 === 0);
      }

      const result = await flagManager.evaluateFlags(flags);

      expect(Object.keys(result)).toHaveLength(100);
      expect(result.flag0).toBeTruthy();
      expect(result.flag1).toBeFalsy();
    });
  });
});
