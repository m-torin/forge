/**
 * Tests for server-edge.ts entry point
 */

import { describe, expect, vi } from 'vitest';

// Mock the dependencies
vi.mock('../src/shared/better-auth-inference', () => ({
  // Mock types are not needed for runtime tests
}));

vi.mock('../src/shared/types', () => ({}));

vi.mock('../src/shared/utils/errors', () => ({
  createErrorResponse: vi.fn(),
  createSuccessResponse: vi.fn(),
  getErrorMessage: vi.fn(),
}));

vi.mock('../src/shared/utils/headers', () => ({
  createApiKeyHeaders: vi.fn(),
  createBearerHeaders: vi.fn(),
  createJsonHeaders: vi.fn(),
}));

vi.mock('../src/server/middleware', () => ({
  withAuth: vi.fn(),
  withOrgAuth: vi.fn(),
}));

describe('server-edge.ts entry point', () => {
  test('should export cookie name constants', async () => {
    const serverEdgeModule = await import('#/server-edge');

    expect(serverEdgeModule.AUTH_COOKIE_NAME).toBe('better-auth.session');
    expect(serverEdgeModule.SESSION_COOKIE_NAME).toBe('better-auth.session');
    expect(serverEdgeModule.CSRF_COOKIE_NAME).toBe('better-auth.csrf-token');
  });

  test('should export cookie name getters', async () => {
    const serverEdgeModule = await import('#/server-edge');

    expect(serverEdgeModule.getAuthCookieName()).toBe('better-auth.session');
    expect(serverEdgeModule.getSessionCookieName()).toBe('better-auth.session');
    expect(serverEdgeModule.getCsrfCookieName()).toBe('better-auth.csrf-token');
  });

  test('should export error utilities', async () => {
    const serverEdgeModule = await import('#/server-edge');

    expect(serverEdgeModule.createErrorResponse).toBeDefined();
    expect(serverEdgeModule.createSuccessResponse).toBeDefined();
    expect(serverEdgeModule.getErrorMessage).toBeDefined();
  });

  test('should export custom error classes', async () => {
    const serverEdgeModule = await import('#/server-edge');

    expect(serverEdgeModule.AuthError).toBeDefined();
    expect(serverEdgeModule.AuthenticationError).toBeDefined();
    expect(serverEdgeModule.AuthorizationError).toBeDefined();
    expect(serverEdgeModule.ValidationError).toBeDefined();
    expect(serverEdgeModule.RateLimitError).toBeDefined();
  });

  test('should create custom error instances correctly', async () => {
    const serverEdgeModule = await import('#/server-edge');

    const authError = new serverEdgeModule.AuthError('Test error');
    expect(authError.name).toBe('AuthError');
    expect(authError.message).toBe('Test error');

    const authenticationError = new serverEdgeModule.AuthenticationError('Auth failed');
    expect(authenticationError.name).toBe('AuthenticationError');
    expect(authenticationError.message).toBe('Auth failed');

    const authorizationError = new serverEdgeModule.AuthorizationError();
    expect(authorizationError.name).toBe('AuthorizationError');
    expect(authorizationError.message).toBe('Authorization failed');

    const validationError = new serverEdgeModule.ValidationError();
    expect(validationError.name).toBe('ValidationError');
    expect(validationError.message).toBe('Validation failed');

    const rateLimitError = new serverEdgeModule.RateLimitError();
    expect(rateLimitError.name).toBe('RateLimitError');
    expect(rateLimitError.message).toBe('Rate limit exceeded');
  });

  test('should detect auth errors correctly', async () => {
    const serverEdgeModule = await import('#/server-edge');

    const authError = new serverEdgeModule.AuthError('Test');
    const regularError = new Error('Regular error');

    expect(serverEdgeModule.isAuthError(authError)).toBeTruthy();
    expect(serverEdgeModule.isAuthError(regularError)).toBeFalsy();
    expect(serverEdgeModule.isAuthError('not an error')).toBeFalsy();
  });

  test('should export header utilities', async () => {
    const serverEdgeModule = await import('#/server-edge');

    expect(serverEdgeModule.createApiKeyHeaders).toBeDefined();
    expect(serverEdgeModule.createBearerHeaders).toBeDefined();
    expect(serverEdgeModule.createJsonHeaders).toBeDefined();
  });

  test('should export request header utilities', async () => {
    const serverEdgeModule = await import('#/server-edge');

    expect(serverEdgeModule.getRequestHeaders).toBeDefined();
    expect(serverEdgeModule.getForwardedHeaders).toBeDefined();
    expect(serverEdgeModule.getClientInfo).toBeDefined();
  });

  test('should parse request headers correctly', async () => {
    const serverEdgeModule = await import('#/server-edge');

    const headers = new Headers({
      'content-type': 'application/json',
      'user-agent': 'test-agent',
    });

    const request = new Request('http://example.com', { headers });
    const parsedHeaders = serverEdgeModule.getRequestHeaders(request);

    expect(parsedHeaders['content-type']).toBe('application/json');
    expect(parsedHeaders['user-agent']).toBe('test-agent');
  });

  test('should extract forwarded headers', async () => {
    const serverEdgeModule = await import('#/server-edge');

    const headers = new Headers({
      'x-forwarded-for': '192.168.1.1',
      'x-forwarded-proto': 'https',
      'x-forwarded-host': 'example.com',
    });

    const request = new Request('http://example.com', { headers });
    const forwardedHeaders = serverEdgeModule.getForwardedHeaders(request);

    expect(forwardedHeaders['x-forwarded-for']).toBe('192.168.1.1');
    expect(forwardedHeaders['x-forwarded-proto']).toBe('https');
    expect(forwardedHeaders['x-forwarded-host']).toBe('example.com');
  });

  test('should extract client info', async () => {
    const serverEdgeModule = await import('#/server-edge');

    const headers = new Headers({
      'x-forwarded-for': '192.168.1.1,10.0.0.1',
      'user-agent': 'Mozilla/5.0',
    });

    const request = new Request('http://example.com', { headers });
    const clientInfo = serverEdgeModule.getClientInfo(request);

    expect(clientInfo.ip).toBe('192.168.1.1');
    expect(clientInfo.userAgent).toBe('Mozilla/5.0');
  });

  test('should export middleware functions', async () => {
    const serverEdgeModule = await import('#/server-edge');

    expect(serverEdgeModule.withAuth).toBeDefined();
    expect(serverEdgeModule.withOrgAuth).toBeDefined();
  });

  test('should parse auth cookies', async () => {
    const serverEdgeModule = await import('#/server-edge');

    const headers = new Headers({
      cookie: 'session=abc123; csrf-token=def456; other=value',
    });

    const request = new Request('http://example.com', { headers });
    const cookies = serverEdgeModule.parseAuthCookies(request);

    expect(cookies.session).toBe('abc123');
    expect(cookies['csrf-token']).toBe('def456');
    expect(cookies.other).toBe('value');
  });

  test('should handle empty cookie header', async () => {
    const serverEdgeModule = await import('#/server-edge');

    const request = new Request('http://example.com');
    const cookies = serverEdgeModule.parseAuthCookies(request);

    expect(cookies).toStrictEqual({});
  });

  test('should get auth cookie value', async () => {
    const serverEdgeModule = await import('#/server-edge');

    const headers = new Headers({
      cookie: 'better-auth.session=token123',
    });

    const request = new Request('http://example.com', { headers });
    const cookieValue = serverEdgeModule.getAuthCookieValue(request);

    expect(cookieValue).toBe('token123');
  });

  test('should return null for missing auth cookie', async () => {
    const serverEdgeModule = await import('#/server-edge');

    const request = new Request('http://example.com');
    const cookieValue = serverEdgeModule.getAuthCookieValue(request);

    expect(cookieValue).toBeNull();
  });

  test('should create auth response', async () => {
    const serverEdgeModule = await import('#/server-edge');

    const data = { success: true };
    const response = serverEdgeModule.createAuthResponse(data);

    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/json');
  });

  test('should create auth response with custom options', async () => {
    const serverEdgeModule = await import('#/server-edge');

    const data = { error: 'Not found' };
    const options = {
      status: 404,
      headers: { 'x-custom': 'value' },
      cookies: [{ name: 'test', value: 'cookie-value' }],
    };

    const response = serverEdgeModule.createAuthResponse(data, options);

    expect(response.status).toBe(404);
    expect(response.headers.get('x-custom')).toBe('value');
    expect(response.headers.get('set-cookie')).toContain('test=cookie-value');
  });
});
