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

// Mock analytics tracking
const mockAnalyticsTrack = vi.fn();
const mockCreateAnalytics = vi.fn().mockResolvedValue({
  track: mockAnalyticsTrack,
});

vi.mock('@repo/analytics/shared', () => ({
  createAnalytics: mockCreateAnalytics,
}));

describe('shared/core-functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock globalThis.dispatchEvent
    if (!globalThis.dispatchEvent) {
      vi.spyOn(globalThis, 'dispatchEvent').mockImplementation(() => true);
    }
  });

  describe('mergeProviderData', () => {
    test('should return empty structure for empty array', async () => {
      const { mergeProviderData } = await import('../../src/shared/core-functions');

      const result = await mergeProviderData([]);

      expect(result).toStrictEqual({
        definitions: {},
        values: {},
        overrides: {},
        treatments: {},
      });
      expect(mockLogWarn).toHaveBeenCalledWith(
        'mergeProviderData called with empty or invalid array',
      );
    });

    test('should return empty structure for invalid input', async () => {
      const { mergeProviderData } = await import('../../src/shared/core-functions');

      const result = await mergeProviderData(null as any);

      expect(result).toStrictEqual({
        definitions: {},
        values: {},
        overrides: {},
        treatments: {},
      });
      expect(mockLogWarn).toHaveBeenCalledWith(
        'mergeProviderData called with empty or invalid array',
      );
    });

    test('should merge single provider data', async () => {
      const { mergeProviderData } = await import('../../src/shared/core-functions');

      const providerData = [
        {
          definitions: { flag1: { key: 'flag1', description: 'Test flag' } },
          values: { flag1: true },
          overrides: { flag1: false },
          treatments: { flag1: 'control' },
        },
      ];

      const result = await mergeProviderData(providerData);

      expect(result).toStrictEqual({
        definitions: { flag1: { key: 'flag1', description: 'Test flag' } },
        values: { flag1: true },
        overrides: { flag1: false },
        treatments: { flag1: 'control' },
      });
      expect(mockLogInfo).toHaveBeenCalledWith('Merging provider data', expect.any(Object));
    });

    test('should merge multiple provider data with priority order', async () => {
      const { mergeProviderData } = await import('../../src/shared/core-functions');

      const providerData = [
        {
          definitions: { flag1: { key: 'flag1', description: 'First provider' } },
          values: { flag1: true, flag2: 'value1' },
          overrides: {},
          treatments: {},
        } as any,
        {
          definitions: {
            flag1: { key: 'flag1', description: 'Second provider' },
            flag3: { key: 'flag3' },
          },
          values: { flag1: false, flag3: 'value3' },
          overrides: { flag1: 'override' },
          treatments: {},
        } as any,
      ];

      const result = await mergeProviderData(providerData);

      // Later providers should take precedence
      expect(result.definitions?.flag1).toMatchObject({
        key: 'flag1',
        description: 'Second provider',
      });
      expect(result.values?.flag1).toBeFalsy();
      expect(result.values?.flag2).toBe('value1');
      expect(result.values?.flag3).toBe('value3');
      expect(result.overrides?.flag1).toBe('override');
    });

    test('should handle providers with missing properties', async () => {
      const { mergeProviderData } = await import('../../src/shared/core-functions');

      const providerData = [
        {
          definitions: { flag1: { key: 'flag1' } },
          values: {},
          overrides: {},
          treatments: {},
        } as any, // Missing other properties
        { definitions: {}, values: { flag2: true }, overrides: {}, treatments: {} } as any, // Missing definitions
        { definitions: {}, values: {}, overrides: {}, treatments: {} } as any, // Empty provider
      ];

      const result = await mergeProviderData(providerData);

      expect(result.definitions?.flag1).toStrictEqual({ key: 'flag1' });
      expect(result.values?.flag2).toBeTruthy();
      expect(result.overrides).toStrictEqual({});
      expect(result.treatments).toStrictEqual({});
    });

    test('should log provider merge information', async () => {
      const { mergeProviderData } = await import('../../src/shared/core-functions');

      const providerData = [
        {
          definitions: { flag1: { key: 'flag1' }, flag2: { key: 'flag2' } },
          values: { flag1: true },
          overrides: {},
          treatments: {},
        } as any,
        {
          definitions: { flag3: { key: 'flag3' } },
          values: {},
          overrides: { flag1: false },
          treatments: { flag1: 'variant' },
        } as any,
      ];

      await mergeProviderData(providerData);

      expect(mockLogInfo).toHaveBeenCalledWith('Merging provider data', {
        providerCount: 2,
        sources: [
          {
            index: 0,
            definitionCount: 2,
            valueCount: 1,
            overrideCount: 0,
            treatmentCount: 0,
          },
          {
            index: 1,
            definitionCount: 1,
            valueCount: 0,
            overrideCount: 1,
            treatmentCount: 1,
          },
        ],
      });
    });
  });

  describe('evaluateFlags', () => {
    test('should evaluate flags with context', async () => {
      const { evaluateFlags } = await import('../../src/shared/core-functions');

      const flags = {
        simpleFlag: { key: 'simpleFlag', decide: () => true },
        contextFlag: { key: 'contextFlag', decide: ({ user }: any) => user?.id === 'test' },
      };

      const context = { user: { id: 'test' } };
      const result = await evaluateFlags(flags, context);

      expect(result).toStrictEqual({
        simpleFlag: true,
        contextFlag: true,
      });
    });

    test('should handle flag evaluation errors gracefully', async () => {
      const { evaluateFlags } = await import('../../src/shared/core-functions');

      const flags = {
        errorFlag: {
          key: 'errorFlag',
          decide: () => {
            throw new Error('Evaluation failed');
          },
        },
        goodFlag: { key: 'goodFlag', decide: () => true },
      };

      const result = await evaluateFlags(flags, {});

      expect(result).toStrictEqual({
        errorFlag: undefined, // Error should result in undefined
        goodFlag: true,
      });
    });

    test('should pass context to flag decide functions', async () => {
      const { evaluateFlags } = await import('../../src/shared/core-functions');

      const mockDecide = vi.fn().mockReturnValue('context-result');
      const flags = {
        contextFlag: { key: 'contextFlag', decide: mockDecide },
      };

      const context = { user: { id: 'user123' }, environment: 'test' };
      await evaluateFlags(flags, context);

      expect(mockDecide).toHaveBeenCalledWith(context);
    });

    test('should handle empty flags object', async () => {
      const { evaluateFlags } = await import('../../src/shared/core-functions');

      const result = await evaluateFlags({}, { user: { id: 'test' } });

      expect(result).toStrictEqual({});
    });

    test('should handle async flag decide functions', async () => {
      const { evaluateFlags } = await import('../../src/shared/core-functions');

      const flags = {
        asyncFlag: {
          key: 'asyncFlag',
          decide: async () => {
            await new Promise(resolve => setTimeout(resolve, 1));
            return 'async-result';
          },
        },
      };

      const result = await evaluateFlags(flags, {});

      expect(result).toStrictEqual({
        asyncFlag: 'async-result',
      });
    });
  });

  describe('generatePermutations', () => {
    test('should generate permutations for simple flags', async () => {
      const { generatePermutations } = await import('../../src/shared/core-functions');

      const flagDefinitions = {
        flag1: { options: [true, false] },
        flag2: { options: ['A', 'B'] },
      };

      const result = generatePermutations(flagDefinitions, { maxPermutations: 10 });

      expect(result).toHaveLength(4); // 2 * 2 = 4 permutations
      expect(result).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({ flag1: true, flag2: 'A' }),
          expect.objectContaining({ flag1: true, flag2: 'B' }),
          expect.objectContaining({ flag1: false, flag2: 'A' }),
          expect.objectContaining({ flag1: false, flag2: 'B' }),
        ]),
      );
    });

    test('should respect maxPermutations limit', async () => {
      const { generatePermutations } = await import('../../src/shared/core-functions');

      const flagDefinitions = {
        flag1: { options: [1, 2, 3, 4] },
        flag2: { options: ['A', 'B', 'C'] },
        flag3: { options: [true, false] },
      };

      const result = generatePermutations(flagDefinitions, { maxPermutations: 10 });

      expect(result).toHaveLength(10); // Limited to 10 instead of 24
    });

    test('should handle single flag definition', async () => {
      const { generatePermutations } = await import('../../src/shared/core-functions');

      const flagDefinitions = {
        onlyFlag: { options: ['option1', 'option2', 'option3'] },
      };

      const result = generatePermutations(flagDefinitions);

      expect(result).toHaveLength(3);
      expect(result).toStrictEqual([
        { onlyFlag: 'option1' },
        { onlyFlag: 'option2' },
        { onlyFlag: 'option3' },
      ]);
    });

    test('should handle empty flag definitions', async () => {
      const { generatePermutations } = await import('../../src/shared/core-functions');

      const result = generatePermutations({});

      expect(result).toStrictEqual([{}]);
    });

    test('should handle flags with no options', async () => {
      const { generatePermutations } = await import('../../src/shared/core-functions');

      const flagDefinitions = {
        flag1: { options: [] },
        flag2: { options: ['A'] },
      };

      const result = generatePermutations(flagDefinitions);

      expect(result).toStrictEqual([{ flag2: 'A' }]);
    });

    test('should use default maxPermutations when not specified', async () => {
      const { generatePermutations } = await import('../../src/shared/core-functions');

      const flagDefinitions = [
        {
          key: 'flag1',
          options: Array.from({ length: 20 }, (_, i) => ({ value: i, label: `Option ${i}` })),
        },
      ];

      const result = await generatePermutations(flagDefinitions);

      // Should be limited by default maxPermutations (likely 100)
      expect(result.length).toBeLessThanOrEqual(100);
    });
  });

  describe('decodePermutation', () => {
    test('should decode valid permutation code', async () => {
      const { decodePermutation } = await import('../../src/shared/core-functions');

      // Mock base64url encoded data
      const mockCode = 'eyJmbGFnMSI6dHJ1ZSwiZmxhZzIiOiJBIn0'; // {"flag1":true,"flag2":"A"}

      const result = decodePermutation(mockCode);

      expect(result).toStrictEqual({
        flag1: true,
        flag2: 'A',
      });
    });

    test('should handle invalid base64 codes gracefully', async () => {
      const { decodePermutation } = await import('../../src/shared/core-functions');

      const result = decodePermutation('invalid-base64!@#');

      expect(result).toStrictEqual({});
    });

    test('should handle empty code', async () => {
      const { decodePermutation } = await import('../../src/shared/core-functions');

      const result = decodePermutation('');

      expect(result).toStrictEqual({});
    });

    test('should handle non-JSON decoded data', async () => {
      const { decodePermutation } = await import('../../src/shared/core-functions');

      // Valid base64 but not JSON
      const nonJsonCode = btoa('not-json-data');

      const result = decodePermutation(nonJsonCode);

      expect(result).toStrictEqual({});
    });
  });

  describe('reportValue', () => {
    test('should report flag value with analytics tracking', async () => {
      const { reportValue } = await import('../../src/shared/core-functions');

      reportValue('testFlag', true, { user: { id: 'user123' } });

      // Wait for async analytics handling
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should log the flag value being reported
      expect(mockLogInfo).toHaveBeenCalledWith(
        'Flag value reported',
        expect.objectContaining({
          flagName: 'testFlag',
          value: true,
          context: { user: { id: 'user123' } },
          timestamp: expect.any(String),
        }),
      );
    });

    test('should dispatch custom event when supported', async () => {
      const { reportValue } = await import('../../src/shared/core-functions');

      // Mock globalThis with dispatchEvent
      const mockDispatchEvent = vi.fn();
      Object.defineProperty(globalThis, 'dispatchEvent', {
        value: mockDispatchEvent,
        writable: true,
      });

      reportValue('testFlag', 'variant-a', { experiment: 'test' });

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'flag-value-reported',
          detail: expect.objectContaining({
            flagName: 'testFlag',
            value: 'variant-a',
            context: { experiment: 'test' },
            timestamp: expect.any(String),
          }),
        }),
      );
    });

    test('should handle analytics tracking errors gracefully', async () => {
      const { reportValue } = await import('../../src/shared/core-functions');

      // Make analytics tracking throw an error
      mockCreateAnalytics.mockRejectedValue(new Error('Analytics failed'));

      // Should not throw despite analytics error
      expect(() => reportValue('testFlag', true, {})).not.toThrow();
    });

    test('should handle missing globalThis gracefully', async () => {
      const { reportValue } = await import('../../src/shared/core-functions');

      // Mock globalThis without dispatchEvent
      const originalDispatchEvent = globalThis.dispatchEvent;
      delete (globalThis as any).dispatchEvent;

      // Should not throw
      expect(() => reportValue('testFlag', true, {})).not.toThrow();

      // Restore
      globalThis.dispatchEvent = originalDispatchEvent;
    });
  });
});
