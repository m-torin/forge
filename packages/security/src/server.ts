/**
 * Server-side security exports (non-Next.js)
 *
 * This file provides server-side security functionality for non-Next.js environments.
 * For Next.js applications, use '@repo/security/server/next' instead.
 */

// Re-export rate limiting functionality
export { createRateLimiter } from '../rate-limit';

// Re-export env helpers for server use
export { env, safeEnv } from '../env';
