/**
 * Analytics emitters - The recommended way to track events
 * 
 * Emitters provide type-safe, consistent event tracking following
 * the Segment.io specification. They are the primary pattern for
 * analytics in this package.
 */

// Export core emitter functions as the primary API
export {
  // Main emitter functions
  track,
  identify,
  page,
  screen,
  group,
  alias
} from './emitters';

// Export all emitter types
export * from './emitter-types';

// Export helper utilities for easier emitter usage
export * from './helpers';

// Export convenience builders
export {
  ContextBuilder,
  PayloadBuilder,
  EventBatch,
  createUserSession,
  createAnonymousSession,
  withMetadata,
  withUTM
} from './helpers';

// Export ecommerce emitters as a namespace
export * as ecommerce from './ecommerce';

// Re-export ecommerce types for convenience
export type { 
  EcommerceEventSpec,
  BaseProductProperties,
  ExtendedProductProperties,
  CartProperties,
  OrderProperties
} from './ecommerce/types';