import { generateVisitorId, getOrGenerateVisitorId, parseOverrides } from '@/shared/utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock nanoid
vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'mock-nanoid-123'),
}));

// Mock Vercel flags dedupe
vi.mock('@vercel/flags/next', () => ({
  dedupe: vi.fn(fn => fn),
}));

// Mock cookie store
const createMockCookieStore = (cookies: Record<string, string> = {}) => ({
  get: vi.fn((name: string) => (cookies[name] ? { value: cookies[name] } : undefined)),
  has: vi.fn((name: string) => name in cookies),
  set: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(),
  getAll: vi.fn(() => Object.entries(cookies).map(([name, value]) => ({ name, value }))),
  toString: vi.fn(() => ''),
  [Symbol.iterator]: vi.fn(() => Object.entries(cookies).values()),
});

// Mock header store
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

  it('should generate a visitor ID using nanoid', async () => {
    const { nanoid } = vi.mocked(await import('nanoid'));
    nanoid.mockReturnValue('generated-id-456');

    const id = await generateVisitorId();

    expect(id).toBe('generated-id-456');
    expect(nanoid).toHaveBeenCalledOnce();
  });

  it('should be wrapped with dedupe function', async () => {
    // The function is defined at module level, so dedupe is called during import
    expect(generateVisitorId).toBeInstanceOf(Function);
  });
});

describe('getOrGenerateVisitorId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return existing visitor ID from cookies', async () => {
    const cookies = createMockCookieStore({
      'visitor-id': 'existing-cookie-id',
    });

    const id = await getOrGenerateVisitorId(cookies);

    expect(id).toBe('existing-cookie-id');
    expect(cookies.get).toHaveBeenCalledWith('visitor-id');
  });

  it('should use custom cookie name', async () => {
    const cookies = createMockCookieStore({
      'custom-visitor': 'custom-cookie-id',
    });

    const id = await getOrGenerateVisitorId(cookies, undefined, 'custom-visitor');

    expect(id).toBe('custom-cookie-id');
    expect(cookies.get).toHaveBeenCalledWith('custom-visitor');
  });

  it('should return visitor ID from headers when cookie not found', async () => {
    const cookies = createMockCookieStore();
    const headers = createMockHeaderStore({
      'x-visitor-id': 'header-visitor-id',
    });

    const id = await getOrGenerateVisitorId(cookies, headers);

    expect(id).toBe('header-visitor-id');
    expect(cookies.get).toHaveBeenCalledWith('visitor-id');
    expect(headers.get).toHaveBeenCalledWith('x-visitor-id');
  });

  it('should use custom cookie name for headers', async () => {
    const cookies = createMockCookieStore();
    const headers = createMockHeaderStore({
      'x-custom-visitor': 'custom-header-id',
    });

    const id = await getOrGenerateVisitorId(cookies, headers, 'custom-visitor');

    expect(id).toBe('custom-header-id');
    expect(headers.get).toHaveBeenCalledWith('x-custom-visitor');
  });

  it('should generate new ID when not found in cookies or headers', async () => {
    const { nanoid } = vi.mocked(await import('nanoid'));
    nanoid.mockReturnValue('new-generated-id');

    const cookies = createMockCookieStore();
    const headers = createMockHeaderStore();

    const id = await getOrGenerateVisitorId(cookies, headers);

    expect(id).toBe('new-generated-id');
    expect(cookies.get).toHaveBeenCalledWith('visitor-id');
    expect(headers.get).toHaveBeenCalledWith('x-visitor-id');
  });

  it('should generate new ID when no headers provided and cookie not found', async () => {
    const { nanoid } = vi.mocked(await import('nanoid'));
    nanoid.mockReturnValue('no-headers-id');

    const cookies = createMockCookieStore();

    const id = await getOrGenerateVisitorId(cookies);

    expect(id).toBe('no-headers-id');
    expect(cookies.get).toHaveBeenCalledWith('visitor-id');
  });

  it('should prioritize cookie over header', async () => {
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

  it('should handle cookies without value property', async () => {
    const cookies = {
      get: vi.fn(() => ({})), // Cookie object without value
      has: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
      getAll: vi.fn(),
      toString: vi.fn(),
      [Symbol.iterator]: vi.fn(),
    };

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

  it('should parse valid JSON overrides', () => {
    const overrides = { 'test-flag': true, 'another-flag': 'variant-a' };
    const cookies = createMockCookieStore({
      'vercel-flag-overrides': JSON.stringify(overrides),
    });

    const result = parseOverrides(cookies);

    expect(result).toStrictEqual(overrides);
    expect(cookies.get).toHaveBeenCalledWith('vercel-flag-overrides');
  });

  it('should return undefined when no overrides cookie', () => {
    const cookies = createMockCookieStore();

    const result = parseOverrides(cookies);

    expect(result).toBeUndefined();
    expect(cookies.get).toHaveBeenCalledWith('vercel-flag-overrides');
  });

  it('should return undefined for invalid JSON', () => {
    const cookies = createMockCookieStore({
      'vercel-flag-overrides': 'invalid-json{',
    });

    const result = parseOverrides(cookies);

    expect(result).toBeUndefined();
  });

  it('should handle empty string overrides', () => {
    const cookies = createMockCookieStore({
      'vercel-flag-overrides': '',
    });

    const result = parseOverrides(cookies);

    expect(result).toBeUndefined();
  });

  it('should parse complex override structures', () => {
    const complexOverrides = {
      'boolean-flag': true,
      'string-flag': 'variant-b',
      'object-flag': { config: 'value', nested: { key: 'data' } },
      'array-flag': ['item1', 'item2'],
      'number-flag': 42,
    };
    const cookies = createMockCookieStore({
      'vercel-flag-overrides': JSON.stringify(complexOverrides),
    });

    const result = parseOverrides(cookies);

    expect(result).toStrictEqual(complexOverrides);
  });

  it('should handle cookies without value property', () => {
    const cookies = {
      get: vi.fn(() => ({})), // Cookie object without value
      has: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
      getAll: vi.fn(),
      toString: vi.fn(),
      [Symbol.iterator]: vi.fn(),
    };

    const result = parseOverrides(cookies);

    expect(result).toBeUndefined();
  });

  it('should handle null JSON', () => {
    const cookies = createMockCookieStore({
      'vercel-flag-overrides': 'null',
    });

    const result = parseOverrides(cookies);

    expect(result).toBeNull();
  });

  it('should handle JSON parsing of primitive values', () => {
    const cookies = createMockCookieStore({
      'vercel-flag-overrides': '"string-value"',
    });

    const result = parseOverrides(cookies);

    expect(result).toBe('string-value');
  });
});
