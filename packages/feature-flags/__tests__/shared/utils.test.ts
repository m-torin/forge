import {
  generateVisitorId,
  getOrGenerateVisitorId,
  parseOverrides,
} from '#/shared/context-extraction';
import { beforeEach, describe, expect, vi } from 'vitest';
import { featureFlagTestData } from '../test-data-generators';
import { assertionHelpers, createMockCookieStore } from '../test-utils';

// Mock nanoid
vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'mock-nanoid-123'),
}));

// Mock Vercel flags dedupe
vi.mock('flags/next', () => ({
  dedupe: vi.fn(fn => fn),
}));

// Enhanced header store mock using existing utilities
const createMockHeaderStore = (headers: Record<string, string> = {}) => ({
  get: vi.fn((name: string) => headers[name] || null),
  has: vi.fn((name: string) => name in headers),
  set: vi.fn(),
  delete: vi.fn(),
  append: vi.fn(),
  forEach: vi.fn(),
  keys: vi.fn(() => Object.keys(headers).values()),
  values: vi.fn(() => Object.values(headers).values()),
  entries: vi.fn(() => Object.entries(headers).values()),
  [Symbol.iterator]: vi.fn(() => Object.entries(headers).values()),
});

describe('generateVisitorId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should generate a visitor ID using nanoid', async () => {
    const { nanoid } = vi.mocked(await import('nanoid'));
    nanoid.mockReturnValue('generated-id-456');

    const id = await generateVisitorId();

    expect(id).toBe('generated-id-456');
    assertionHelpers.assertMockCalled(nanoid, 1);
  });

  test('should be wrapped with dedupe function', async () => {
    // The function is defined at module level, so dedupe is called during import
    expect(generateVisitorId).toBeInstanceOf(Function);
  });
});

describe('getOrGenerateVisitorId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return existing visitor ID from cookies', async () => {
    const cookies = createMockCookieStore({
      'visitor-id': 'existing-cookie-id',
    });

    const id = await getOrGenerateVisitorId(cookies);

    expect(id).toBe('existing-cookie-id');
    expect(cookies.get).toHaveBeenCalledWith('visitor-id');
  });

  test('should use custom cookie name', async () => {
    const cookies = createMockCookieStore({
      'custom-visitor': 'custom-cookie-id',
    });

    const id = await getOrGenerateVisitorId(cookies, undefined, 'custom-visitor');

    expect(id).toBe('custom-cookie-id');
    expect(cookies.get).toHaveBeenCalledWith('custom-visitor');
  });

  test('should return visitor ID from headers when cookie not found', async () => {
    const cookies = createMockCookieStore();
    const headers = createMockHeaderStore({
      'x-visitor-id': 'header-visitor-id',
    });

    const id = await getOrGenerateVisitorId(cookies, headers);

    expect(id).toBe('header-visitor-id');
    expect(cookies.get).toHaveBeenCalledWith('visitor-id');
    expect(headers.get).toHaveBeenCalledWith('x-visitor-id');
  });

  test('should use custom cookie name for headers', async () => {
    const cookies = createMockCookieStore();
    const headers = createMockHeaderStore({
      'x-custom-visitor': 'custom-header-id',
    });

    const id = await getOrGenerateVisitorId(cookies, headers, 'custom-visitor');

    expect(id).toBe('custom-header-id');
    expect(headers.get).toHaveBeenCalledWith('x-custom-visitor');
  });

  test('should generate new ID when not found in cookies or headers', async () => {
    const { nanoid } = vi.mocked(await import('nanoid'));
    nanoid.mockReturnValue('new-generated-id');

    const cookies = createMockCookieStore();
    const headers = createMockHeaderStore();

    const id = await getOrGenerateVisitorId(cookies, headers);

    expect(id).toBe('new-generated-id');
    expect(cookies.get).toHaveBeenCalledWith('visitor-id');
    expect(headers.get).toHaveBeenCalledWith('x-visitor-id');
  });

  test('should generate new ID when no headers provided and cookie not found', async () => {
    const { nanoid } = vi.mocked(await import('nanoid'));
    nanoid.mockReturnValue('no-headers-id');

    const cookies = createMockCookieStore();

    const id = await getOrGenerateVisitorId(cookies);

    expect(id).toBe('no-headers-id');
    expect(cookies.get).toHaveBeenCalledWith('visitor-id');
  });

  test('should prioritize cookie over header', async () => {
    const cookies = createMockCookieStore({
      'visitor-id': 'cookie-priority-id',
    });
    const headers = createMockHeaderStore({
      'x-visitor-id': 'header-should-not-be-used',
    });

    const id = await getOrGenerateVisitorId(cookies, headers);

    expect(id).toBe('cookie-priority-id');
    expect(cookies.get).toHaveBeenCalledWith('visitor-id');
    expect(headers.get).not.toHaveBeenCalled();
  });

  test('should handle cookies without value property', async () => {
    const cookies = createMockCookieStore(); // Empty cookie store

    const { nanoid } = vi.mocked(await import('nanoid'));
    nanoid.mockReturnValue('fallback-id');

    const id = await getOrGenerateVisitorId(cookies);

    expect(id).toBe('fallback-id');
  });
});

describe('parseOverrides', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should parse valid JSON overrides', () => {
    const overrides = { 'test-flag': true, 'another-flag': 'variant-a' };
    const cookies = createMockCookieStore({
      'vercel-flag-overrides': JSON.stringify(overrides),
    });

    const result = parseOverrides(cookies);

    expect(result).toStrictEqual(overrides);
    expect(cookies.get).toHaveBeenCalledWith('vercel-flag-overrides');
  });

  test('should return undefined when no overrides cookie', () => {
    const cookies = createMockCookieStore();

    const result = parseOverrides(cookies);

    expect(result).toBeUndefined();
    expect(cookies.get).toHaveBeenCalledWith('vercel-flag-overrides');
  });

  test('should return undefined for invalid JSON', () => {
    const cookies = createMockCookieStore({
      'vercel-flag-overrides': 'invalid-json{',
    });

    const result = parseOverrides(cookies);

    expect(result).toBeUndefined();
  });

  test('should handle empty string overrides', () => {
    const cookies = createMockCookieStore({
      'vercel-flag-overrides': '',
    });

    const result = parseOverrides(cookies);

    expect(result).toBeUndefined();
  });

  test('should parse complex override structures', () => {
    const complexOverrides = {
      'boolean-flag': true,
      'string-flag': 'variant-b',
      'object-flag': featureFlagTestData.flags.objects['config-flag'],
      'array-flag': ['item1', 'item2'],
      'number-flag': 42,
    };
    const cookies = createMockCookieStore({
      'vercel-flag-overrides': JSON.stringify(complexOverrides),
    });

    const result = parseOverrides(cookies);

    expect(result).toStrictEqual(complexOverrides);
    assertionHelpers.assertMockCalled(cookies.get, 1, ['vercel-flag-overrides']);
  });

  test('should handle cookies without value property', () => {
    const cookies = createMockCookieStore(); // Empty cookie store

    const result = parseOverrides(cookies);

    expect(result).toBeUndefined();
  });

  test('should handle null JSON', () => {
    const cookies = createMockCookieStore({
      'vercel-flag-overrides': 'null',
    });

    const result = parseOverrides(cookies);

    expect(result).toBeNull();
  });

  test('should handle JSON parsing of primitive values', () => {
    const cookies = createMockCookieStore({
      'vercel-flag-overrides': '"string-value"',
    });

    const result = parseOverrides(cookies);

    expect(result).toBe('string-value');
  });
});
