/**
 * Edge runtime exports for authentication
 *
 * This module provides edge-compatible authentication functionality for Next.js edge runtime
 * (middleware, edge API routes, etc.). It excludes any Node.js-specific APIs and uses only
 * Web APIs available in the edge runtime.
 *
 * Limitations:
 * - No Node.js APIs (fs, crypto, etc.)
 * - No native modules
 * - HTTP-based implementations only
 * - Limited to Web APIs
 */

// Export edge-compatible auth configuration
// Note: The full auth instance is not available in edge runtime due to database connections
// Use session verification and basic auth utilities instead

// Export edge-compatible types
export type {
  AuthResponse,
  AuthSession,
  ClientSession,
  ClientUser,
  ServerSession,
  ServerUser,
  Session,
  User,
} from './shared/better-auth-inference';
export type * from './shared/types';

// Export edge-compatible utilities - these constants are not available in shared/config
// Fallback to commonly used cookie names
export const AUTH_COOKIE_NAME = 'better-auth.session';
export const SESSION_COOKIE_NAME = 'better-auth.session';
export const CSRF_COOKIE_NAME = 'better-auth.csrf-token';

export const getAuthCookieName = () => AUTH_COOKIE_NAME;
export const getSessionCookieName = () => SESSION_COOKIE_NAME;
export const getCsrfCookieName = () => CSRF_COOKIE_NAME;

// Export edge-compatible error utilities
export { createErrorResponse, createSuccessResponse, getErrorMessage } from './shared/utils/errors';

// Define auth-specific error classes for edge runtime
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class AuthenticationError extends AuthError {
  constructor(message = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AuthError {
  constructor(message = 'Authorization failed') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class ValidationError extends AuthError {
  constructor(message = 'Validation failed') {
    super(message);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends AuthError {
  constructor(message = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
  }
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}

// Export edge-compatible header utilities
export {
  createApiKeyHeaders,
  createBearerHeaders,
  createJsonHeaders,
} from './shared/utils/headers';

// Define edge-compatible header utilities
export function getRequestHeaders(request: Request): Record<string, string> {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  return headers;
}

export function getForwardedHeaders(request: Request): Record<string, string> {
  const headers = getRequestHeaders(request);
  return {
    'x-forwarded-for': headers['x-forwarded-for'] || '',
    'x-forwarded-proto': headers['x-forwarded-proto'] || '',
    'x-forwarded-host': headers['x-forwarded-host'] || '',
  };
}

export function getClientInfo(request: Request): { ip?: string; userAgent?: string } {
  const headers = getRequestHeaders(request);
  return {
    ip: headers['x-forwarded-for']?.split(',')[0] || headers['x-real-ip'] || undefined,
    userAgent: headers['user-agent'] || undefined,
  };
}

// Export edge-compatible middleware
export { withAuth, withOrgAuth } from './server/middleware';

// Export edge-compatible session utilities
export function parseAuthCookies(request: Request): Record<string, string> {
  const cookies: Record<string, string> = {};
  const cookieHeader = request.headers.get('cookie');

  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
  }

  return cookies;
}

export function getAuthCookieValue(request: Request): string | null {
  const cookies = parseAuthCookies(request);
  return cookies[AUTH_COOKIE_NAME] || cookies[SESSION_COOKIE_NAME] || null;
}

export function createAuthResponse(
  data: any,
  options: {
    status?: number;
    headers?: Record<string, string>;
    cookies?: Array<{ name: string; value: string; options?: any }>;
  } = {},
): Response {
  const headers = new Headers(options.headers || {});
  headers.set('content-type', 'application/json');

  // Add cookies if provided
  if (options.cookies) {
    options.cookies.forEach(cookie => {
      const cookieValue = `${cookie.name}=${cookie.value}`;
      headers.append('set-cookie', cookieValue);
    });
  }

  return new Response(JSON.stringify(data), {
    status: options.status || 200,
    headers,
  });
}

// Note: Server actions, database operations, and other Node.js-specific
// functionality are not available in edge runtime
