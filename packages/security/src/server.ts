/**
 * Server-side security exports (non-Next.js)
 *
 * This file provides server-side security functionality for non-Next.js environments.
 * For Next.js applications, use '@repo/security/server/next' instead.
 */

import { keys } from '../keys';

// Re-export rate limiting functionality
export { createRateLimiter, slidingWindow } from '../rate-limit';

// Re-export keys for server use
export { keys };
