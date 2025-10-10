/**
 * @repo/ai middleware utilities
 * Request processing, caching, telemetry, and rate limiting
 */

export { cache } from './cache';
export { compose } from './compose';
export { rateLimit } from './rate-limit';
export { telemetry } from './telemetry';

// AI-specific middleware helpers - use official AI SDK v5 patterns
export { createWrappedModel, observabilityHooks } from './ai-middleware';
