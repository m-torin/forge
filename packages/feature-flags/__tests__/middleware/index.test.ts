import { createFeatureFlagMiddleware } from '@/middleware';
import { beforeEach, describe, expect, vi } from 'vitest';

// Mock Next.js imports
vi.mock('next/server', () => ({
  NextResponse: {
    next: vi.fn(() => ({
      cookies: { set: vi.fn() },
      headers: { set: vi.fn() },
    })),
    rewrite: vi.fn((url, options) => ({
      cookies: { set: vi.fn() },
      headers: { set: vi.fn() },
      url: url.href,
      options,
    })),
  },
}));

// Mock Vercel flags
vi.mock('@vercel/flags/next', () => ({
  precompute: vi.fn(),
}));

// Mock shared utils
vi.mock('@/shared/utils', () => ({
  getOrGenerateVisitorId: vi.fn(),
}));

// Mock NextRequest
const createMockRequest = (pathname = '/', search = '', cookies = new Map()) => ({
  nextUrl: {
    pathname,
    search,
  },
  url: `https://example.com${pathname}${search}`,
  cookies: {
    has: vi.fn(name => cookies.has(name)),
    get: vi.fn(name => cookies.get(name)),
  },
  headers: new Headers(),
});

describe('createFeatureFlagMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should create middleware function', () => {
    const middleware = createFeatureFlagMiddleware();

    expect(middleware).toBeInstanceOf(Function);
    expect(middleware.name).toBe('featureFlagMiddleware');
  });

  test('should return undefined when no flags and no visitor ID generation', async () => {
    const middleware = createFeatureFlagMiddleware({
      generateVisitorId: false,
      flags: [],
    });

    const request = createMockRequest();
    const result = await middleware(request as any);

    expect(result).toBeUndefined();
  });

  test('should generate visitor ID when enabled', async () => {
    const { getOrGenerateVisitorId } = vi.mocked(await import('@/shared/utils'));
    getOrGenerateVisitorId.mockResolvedValue('visitor-123');

    const middleware = createFeatureFlagMiddleware({
      generateVisitorId: true,
    });

    const request = createMockRequest();
    const result = await middleware(request as any);

    expect(getOrGenerateVisitorId).toHaveBeenCalledWith(
      request.cookies,
      request.headers,
      'visitor-id',
    );
    expect(result).toBeDefined();
    expect(result?.cookies.set).toHaveBeenCalledWith('visitor-id', 'visitor-123', {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
      sameSite: 'lax',
    });
    expect(result?.headers.set).toHaveBeenCalledWith('x-visitor-id', 'visitor-123');
  });

  test('should use custom visitor cookie name', async () => {
    const { getOrGenerateVisitorId } = vi.mocked(await import('@/shared/utils'));
    getOrGenerateVisitorId.mockResolvedValue('custom-visitor-123');

    const middleware = createFeatureFlagMiddleware({
      generateVisitorId: true,
      visitorCookieName: 'custom-visitor',
    });

    const request = createMockRequest();
    const result = await middleware(request as any);

    expect(getOrGenerateVisitorId).toHaveBeenCalledWith(
      request.cookies,
      request.headers,
      'custom-visitor',
    );
    expect(result?.cookies.set).toHaveBeenCalledWith(
      'custom-visitor',
      'custom-visitor-123',
      expect.any(Object),
    );
    expect(result?.headers.set).toHaveBeenCalledWith('x-custom-visitor', 'custom-visitor-123');
  });

  test('should not set visitor ID cookie if already exists', async () => {
    const { getOrGenerateVisitorId } = vi.mocked(await import('@/shared/utils'));
    getOrGenerateVisitorId.mockResolvedValue('existing-visitor');

    const cookies = new Map([['visitor-id', { value: 'existing-visitor' }]]);
    const request = createMockRequest('/', '', cookies);
    request.cookies.has.mockReturnValue(true);

    const middleware = createFeatureFlagMiddleware({
      generateVisitorId: true,
    });

    const result = await middleware(request as any);

    expect(result).toBeUndefined();
  });

  test('should precompute flags when provided', async () => {
    const { precompute } = vi.mocked(await import('@vercel/flags/next'));
    precompute.mockResolvedValue('computed-code-123');

    const mockFlags = [{ key: 'test-flag' }];
    const middleware = createFeatureFlagMiddleware({
      flags: mockFlags,
      generateVisitorId: false,
    });

    const request = createMockRequest('/test-page', '?query=value');
    const result = await middleware(request as any);

    expect(precompute).toHaveBeenCalledWith(mockFlags);
    const { NextResponse } = vi.mocked(await import('next/server'));
    expect(NextResponse.rewrite).toHaveBeenCalledWith(
      expect.objectContaining({
        href: 'https://example.com/computed-code-123/test-page?query=value',
      }),
      { request },
    );
    expect(result).toBeDefined();
  });

  test('should use custom code prefix for precomputed routes', async () => {
    const { precompute } = vi.mocked(await import('@vercel/flags/next'));
    precompute.mockResolvedValue('code-456');

    const mockFlags = [{ key: 'test-flag' }];
    const middleware = createFeatureFlagMiddleware({
      flags: mockFlags,
      codePrefix: '/flags',
      generateVisitorId: false,
    });

    const request = createMockRequest('/home');
    const result = await middleware(request as any);

    const { NextResponse } = vi.mocked(await import('next/server'));
    expect(NextResponse.rewrite).toHaveBeenCalledWith(
      expect.objectContaining({
        href: 'https://example.com/flags/code-456/home',
      }),
      { request },
    );
  });

  test('should handle both flags and visitor ID generation', async () => {
    const { precompute } = vi.mocked(await import('@vercel/flags/next'));
    const { getOrGenerateVisitorId } = vi.mocked(await import('@/shared/utils'));

    precompute.mockResolvedValue('code-789');
    getOrGenerateVisitorId.mockResolvedValue('visitor-789');

    const mockFlags = [{ key: 'combo-flag' }];
    const middleware = createFeatureFlagMiddleware({
      flags: mockFlags,
      generateVisitorId: true,
    });

    const request = createMockRequest('/combo-page');
    const result = await middleware(request as any);

    expect(precompute).toHaveBeenCalledWith(mockFlags);
    expect(getOrGenerateVisitorId).toHaveBeenCalledWith();
    const { NextResponse } = vi.mocked(await import('next/server'));
    expect(NextResponse.rewrite).toHaveBeenCalledWith();
    expect(result).toBeDefined();
    expect(result?.cookies.set).toHaveBeenCalledWith(
      'visitor-id',
      'visitor-789',
      expect.any(Object),
    );
  });

  test('should handle empty flags array', async () => {
    const middleware = createFeatureFlagMiddleware({
      flags: [],
      generateVisitorId: false,
    });

    const request = createMockRequest();
    const result = await middleware(request as any);

    expect(result).toBeUndefined();
  });

  test('should handle complex pathname and search params', async () => {
    const { precompute } = vi.mocked(await import('@vercel/flags/next'));
    precompute.mockResolvedValue('complex-code');

    const mockFlags = [{ key: 'complex-flag' }];
    const middleware = createFeatureFlagMiddleware({
      flags: mockFlags,
      generateVisitorId: false,
    });

    const request = createMockRequest('/products/123/reviews', '?sort=date&filter=5-star');
    await middleware(request as any);

    const { NextResponse } = vi.mocked(await import('next/server'));
    expect(NextResponse.rewrite).toHaveBeenCalledWith(
      expect.objectContaining({
        href: 'https://example.com/complex-code/products/123/reviews?sort=date&filter=5-star',
      }),
      { request },
    );
  });

  test('should set visitor ID header when cookie exists but response is created', async () => {
    const { precompute } = vi.mocked(await import('@vercel/flags/next'));
    const { getOrGenerateVisitorId } = vi.mocked(await import('@/shared/utils'));

    precompute.mockResolvedValue('header-code');
    getOrGenerateVisitorId.mockResolvedValue('header-visitor');

    const mockFlags = [{ key: 'header-flag' }];
    const cookies = new Map([['visitor-id', { value: 'existing-visitor' }]]);
    const request = createMockRequest('/', '', cookies);
    request.cookies.has.mockReturnValue(false); // Cookie doesn't exist

    const middleware = createFeatureFlagMiddleware({
      flags: mockFlags,
      generateVisitorId: true,
    });

    const result = await middleware(request as any);

    expect(result?.headers.set).toHaveBeenCalledWith('x-visitor-id', 'header-visitor');
  });
});
