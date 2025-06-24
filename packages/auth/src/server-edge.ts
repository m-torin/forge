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
export { auth } from './shared/auth.config';

// Export edge-compatible types
export type * from './shared/types';
export type * from './shared/better-auth-inference';

// Export edge-compatible utilities
export {
  AUTH_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  CSRF_COOKIE_NAME,
  getAuthCookieName,
  getSessionCookieName,
  getCsrfCookieName,
} from './shared/config';

// Export edge-compatible error utilities
export {
  AuthError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  RateLimitError,
  createErrorResponse,
  isAuthError,
} from './shared/utils/errors';

// Export edge-compatible header utilities
export { getRequestHeaders, getForwardedHeaders, getClientInfo } from './shared/utils/headers';

// Export edge-compatible middleware
export { withAuth, withOrgAuth } from './server/middleware';

// Note: Server actions, database operations, and other Node.js-specific
// functionality are not available in edge runtime
