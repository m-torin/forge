import { evaluateFlags, getFlagContext } from '@/server/flags';
import { beforeEach, describe, expect, vi } from 'vitest';

// Mock Next.js headers/cookies
const mockHeaders = new Headers([
  ['x-forwarded-for', '127.0.0.1'],
  ['user-agent', 'test-agent'],
]);

const mockCookies = {
  get: vi.fn(),
  has: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(),
  getAll: vi.fn(() => []),
  toString: vi.fn(() => ''),
  [Symbol.iterator]: vi.fn(() => [].values()),
};

vi.mock('next/headers', async () => {
  return {
    headers: vi.fn(() => Promise.resolve(mockHeaders)),
    cookies: vi.fn(() => Promise.resolve(mockCookies)),
  };
});

// Mock shared utils
vi.mock('@/shared/utils', () => ({
  parseOverrides: vi.fn(),
}));

// Mock Vercel flags SDK
vi.mock('@vercel/flags/next', () => ({
  getProviderData: vi.fn(),
}));

describe('getFlagContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should get flag context from Next.js headers and cookies', async () => {
    const { parseOverrides } = vi.mocked(await import('@/shared/utils'));
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
    const { parseOverrides } = vi.mocked(await import('@/shared/utils'));
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
    expect(flags.testFlag).toHaveBeenCalledOnce();
  });

  test('should evaluate multiple flags in parallel', async () => {
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

    expect(flags.booleanFlag).toHaveBeenCalledOnce();
    expect(flags.stringFlag).toHaveBeenCalledOnce();
    expect(flags.numberFlag).toHaveBeenCalledOnce();
    expect(flags.objectFlag).toHaveBeenCalledOnce();
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

    await expect(evaluateFlags(flags)).rejects.toThrow('Flag error');
    expect(flags.successFlag).toHaveBeenCalledOnce();
    expect(flags.errorFlag).toHaveBeenCalledOnce();
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

    const startTime = Date.now();
    const result = await evaluateFlags(flags);
    const endTime = Date.now();

    expect(result).toStrictEqual({
      fastFlag: 'fast',
      slowFlag: 'slow',
      instantFlag: 'instant',
    });

    // Should resolve in parallel, taking roughly the time of the slowest flag
    expect(endTime - startTime).toBeLessThan(50); // Allow some buffer for test execution
    expect(flags.fastFlag).toHaveBeenCalledOnce();
    expect(flags.slowFlag).toHaveBeenCalledOnce();
    expect(flags.instantFlag).toHaveBeenCalledOnce();
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
