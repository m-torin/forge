/**
 * Analytics emitters - The recommended way to track events
 *
 * Emitters provide type-safe, consistent event tracking following
 * the Segment.io specification. They are the primary pattern for
 * analytics in this package.
 */

// Export core emitter functions as the primary API
export {
  alias,
  group,
  identify,
  page,
  screen,
  // Main emitter functions
  track,
} from './emitters';

// Export all emitter types
export * from './emitter-types';

// Export helper utilities for easier emitter usage
export * from './helpers';

// Export convenience builders
export {
  ContextBuilder,
  EventBatch,
  PayloadBuilder,
  createAnonymousSession,
  createUserSession,
  withMetadata,
  withUTM,
} from './helpers';

// Export ecommerce emitters as a namespace
export * as ecommerce from './ecommerce';

// Re-export ecommerce types for convenience;
