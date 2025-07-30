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

/**
 * Edge-compatible auth configuration
 * Note: The full auth instance is not available in edge runtime due to database connections
 * Use session verification and basic auth utilities instead
 */

/**
 * Edge-compatible authentication types
 */
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

/**
 * Edge-compatible cookie constants
 * Fallback to commonly used cookie names since shared/config is not available
 */
export const AUTH_COOKIE_NAME = 'better-auth.session';
export const SESSION_COOKIE_NAME = 'better-auth.session';
export const CSRF_COOKIE_NAME = 'better-auth.csrf-token';

/**
 * Get auth cookie name for edge runtime
 * @returns Auth cookie name
 */
export const getAuthCookieName = () => AUTH_COOKIE_NAME;

/**
 * Get session cookie name for edge runtime
 * @returns Session cookie name
 */
export const getSessionCookieName = () => SESSION_COOKIE_NAME;

/**
 * Get CSRF cookie name for edge runtime
 * @returns CSRF cookie name
 */
export const getCsrfCookieName = () => CSRF_COOKIE_NAME;

/**
 * Edge-compatible error utilities
 */
export { createErrorResponse, createSuccessResponse, getErrorMessage } from './shared/utils/errors';

/**
 * Base authentication error class for edge runtime
 */
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Authentication failure error
 */
export class AuthenticationError extends AuthError {
  constructor(message = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization failure error
 */
export class AuthorizationError extends AuthError {
  constructor(message = 'Authorization failed') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Validation failure error
 */
export class ValidationError extends AuthError {
  constructor(message = 'Validation failed') {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Rate limit exceeded error
 */
export class RateLimitError extends AuthError {
  constructor(message = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Type guard to check if error is an AuthError
 * @param error - Error to check
 * @returns True if error is an AuthError instance
 */
export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}

/**
 * Edge-compatible header utilities from shared utilities
 */
export {
  createApiKeyHeaders,
  createBearerHeaders,
  createJsonHeaders,
} from './shared/utils/headers';

/**
 * Extract all headers from Request into a plain object
 * @param request - Request object
 * @returns Headers as key-value pairs
 */
export function getRequestHeaders(request: Request): Record<string, string> {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  return headers;
}

/**
 * Extract forwarded headers for proxy information
 * @param request - Request object
 * @returns Forwarded headers object
 */
export function getForwardedHeaders(request: Request): Record<string, string> {
  const headers = getRequestHeaders(request);
  return {
    'x-forwarded-for': headers['x-forwarded-for'] || '',
    'x-forwarded-proto': headers['x-forwarded-proto'] || '',
    'x-forwarded-host': headers['x-forwarded-host'] || '',
  };
}

/**
 * Extract client information from request headers
 * @param request - Request object
 * @returns Client IP and user agent if available
 */
export function getClientInfo(request: Request): { ip?: string; userAgent?: string } {
  const headers = getRequestHeaders(request);
  return {
    ip: headers['x-forwarded-for']?.split(',')[0] || headers['x-real-ip'] || undefined,
    userAgent: headers['user-agent'] || undefined,
  };
}

/**
 * Edge-compatible middleware functions
 */
export { withAuth, withOrgAuth } from './server/middleware';

/**
 * Parse authentication cookies from request
 * @param request - Request object
 * @returns Parsed cookies as key-value pairs
 */
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

/**
 * Extract auth cookie value from request
 * @param request - Request object
 * @returns Auth cookie value or null if not found
 */
export function getAuthCookieValue(request: Request): string | null {
  const cookies = parseAuthCookies(request);
  return cookies[AUTH_COOKIE_NAME] || cookies[SESSION_COOKIE_NAME] || null;
}

/**
 * Create authentication response with optional cookies
 * @param data - Response data
 * @param options - Response options including status, headers, and cookies
 * @returns Response object
 */
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
