import { evaluateFlags, getFlagContext } from '#/server/flags';
import { beforeEach, describe, expect, vi } from 'vitest';
import { featureFlagTestData } from '../test-data-generators';
import {
  assertionHelpers,
  createMockCookies,
  createMockHeaders,
  performanceHelpers,
} from '../test-utils';

// Create consistent mock data
const mockHeaders = createMockHeaders({
  'x-forwarded-for': '127.0.0.1',
  'user-agent': 'test-agent',
});

const mockCookies = createMockCookies({
  'flag-override': 'test-flag=true',
});

vi.mock('next/headers', async () => {
  return {
    headers: vi.fn(() => Promise.resolve(mockHeaders)),
    cookies: vi.fn(() => Promise.resolve(mockCookies)),
  };
});

// Mock shared context-extraction
vi.mock('#/shared/context-extraction', () => ({
  parseOverrides: vi.fn(),
}));

// Mock Vercel flags SDK
vi.mock('flags/next', () => ({
  getProviderData: vi.fn(),
}));

describe('getFlagContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should get flag context from Next.js headers and cookies', async () => {
    const { parseOverrides } = vi.mocked(await import('#/shared/context-extraction'));
    const mockOverrides = { 'test-flag': true };
    parseOverrides.mockReturnValue(mockOverrides);

    const context = await getFlagContext();

    expect(context).toStrictEqual({
      overrides: mockOverrides,
      cookies: mockCookies,
      headers: mockHeaders,
    });

    expect(parseOverrides).toHaveBeenCalledWith(mockCookies);
  });

  test('should call headers and cookies functions', async () => {
    const { headers, cookies } = vi.mocked(await import('next/headers'));

    await getFlagContext();

    expect(headers).toHaveBeenCalledOnce();
    expect(cookies).toHaveBeenCalledOnce();
  });

  test('should handle parseOverrides returning empty object', async () => {
    const { parseOverrides } = vi.mocked(await import('#/shared/context-extraction'));
    parseOverrides.mockReturnValue({});

    const context = await getFlagContext();

    expect(context.overrides).toStrictEqual({});
    expect(context.cookies).toBe(mockCookies);
    expect(context.headers).toBe(mockHeaders);
  });
});

describe('evaluateFlags', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should evaluate single flag', async () => {
    const flags = {
      testFlag: vi.fn(() => Promise.resolve(true)),
    };

    const result = await evaluateFlags(flags);

    expect(result).toStrictEqual({
      testFlag: true,
    });
    assertionHelpers.assertMockCalled(flags.testFlag, 1);
  });

  test('should evaluate multiple flags in parallel', async () => {
    const testFlagValues = featureFlagTestData.flags.boolean;
    const flags = {
      booleanFlag: vi.fn(() => Promise.resolve(true)),
      stringFlag: vi.fn(() => Promise.resolve('variant-a')),
      numberFlag: vi.fn(() => Promise.resolve(42)),
      objectFlag: vi.fn(() => Promise.resolve({ config: 'value' })),
    };

    const result = await evaluateFlags(flags);

    expect(result).toStrictEqual({
      booleanFlag: true,
      stringFlag: 'variant-a',
      numberFlag: 42,
      objectFlag: { config: 'value' },
    });

    assertionHelpers.assertMockCalled(flags.booleanFlag, 1);
    assertionHelpers.assertMockCalled(flags.stringFlag, 1);
    assertionHelpers.assertMockCalled(flags.numberFlag, 1);
    assertionHelpers.assertMockCalled(flags.objectFlag, 1);
  });

  test('should handle empty flags object', async () => {
    const result = await evaluateFlags({});

    expect(result).toStrictEqual({});
  });

  test('should handle flags that resolve to undefined', async () => {
    const flags = {
      undefinedFlag: vi.fn(() => Promise.resolve(undefined)),
      nullFlag: vi.fn(() => Promise.resolve(null)),
    };

    const result = await evaluateFlags(flags);

    expect(result).toStrictEqual({
      undefinedFlag: undefined,
      nullFlag: null,
    });
  });

  test('should handle flags that reject', async () => {
    const flags = {
      successFlag: vi.fn(() => Promise.resolve(true)),
      errorFlag: vi.fn(() => Promise.reject(new Error('Flag error'))),
    };

    await assertionHelpers.assertErrorThrown(() => evaluateFlags(flags), 'Flag error');
    assertionHelpers.assertMockCalled(flags.successFlag, 1);
    assertionHelpers.assertMockCalled(flags.errorFlag, 1);
  });

  test('should maintain type safety', async () => {
    const flags = {
      typedFlag: (): Promise<{ type: 'success'; data: string }> =>
        Promise.resolve({ type: 'success', data: 'test' }),
      simpleFlag: (): Promise<boolean> => Promise.resolve(true),
    };

    const result = await evaluateFlags(flags);

    // TypeScript should infer correct types
    expect(result.typedFlag.type).toBe('success');
    expect(result.typedFlag.data).toBe('test');
    expect(result.simpleFlag).toBeTruthy();
  });

  test('should evaluate flags with different resolution times', async () => {
    const flags = {
      fastFlag: vi.fn(() => Promise.resolve('fast')),
      slowFlag: vi.fn(() => new Promise(resolve => setTimeout(() => resolve('slow'), 10))),
      instantFlag: vi.fn(() => Promise.resolve('instant')),
    };

    const { result, duration } = await performanceHelpers.measureExecutionTime(() =>
      evaluateFlags(flags),
    );

    expect(result).toStrictEqual({
      fastFlag: 'fast',
      slowFlag: 'slow',
      instantFlag: 'instant',
    });

    // Should resolve in parallel, taking roughly the time of the slowest flag
    performanceHelpers.assertPerformance(duration, 50); // Allow some buffer for test execution
    assertionHelpers.assertMockCalled(flags.fastFlag, 1);
    assertionHelpers.assertMockCalled(flags.slowFlag, 1);
    assertionHelpers.assertMockCalled(flags.instantFlag, 1);
  });

  test('should preserve flag function call order independence', async () => {
    let callOrder: string[] = [];

    const flags = {
      first: vi.fn(async () => {
        callOrder.push('first');
        return 'first-result';
      }),
      second: vi.fn(async () => {
        callOrder.push('second');
        return 'second-result';
      }),
      third: vi.fn(async () => {
        callOrder.push('third');
        return 'third-result';
      }),
    };

    const result = await evaluateFlags(flags);

    expect(result).toStrictEqual({
      first: 'first-result',
      second: 'second-result',
      third: 'third-result',
    });

    // All flags should be called
    expect(callOrder).toHaveLength(3);
    expect(callOrder).toStrictEqual(expect.arrayContaining(['first', 'second', 'third']));
  });
});
