/**
 * Client-side analytics exports
 * Complete analytics solution for browser/client environments
 *
 * @example
 * ```typescript
 * import { createClientAnalytics, track, ecommerce } from '@repo/analytics/client';
 *
 * const analytics = await createClientAnalytics({
 *   providers: {
 *     segment: { writeKey: 'xxx' },
 *     posthog: { apiKey: 'yyy' }
 *   }
 * });
 *
 * // Preferred: Use emitters
 * await analytics.emit(track('Button Clicked', { color: 'blue' }));
 * await analytics.emit(ecommerce.productViewed({ product_id: '123' }));
 * ```
 */

import { ConsoleProvider } from '../providers/console/client';
import { createAnalyticsManager } from '../shared/utils/manager';

import { PostHogClientProvider } from '../providers/posthog/client';
import { SegmentClientProvider } from '../providers/segment/client';
import { VercelClientProvider } from '../providers/vercel/client';

import type { AnalyticsConfig, AnalyticsManager, ProviderRegistry } from '../shared/types/types';

// Client-specific provider registry
const CLIENT_PROVIDERS: ProviderRegistry = {
  console: config => new ConsoleProvider(config),
  posthog: config => new PostHogClientProvider(config),
  segment: config => new SegmentClientProvider(config),
  vercel: config => new VercelClientProvider(config),
};

// ============================================================================
// CORE ANALYTICS FUNCTIONS
// ============================================================================

/**
 * Create and initialize a client analytics instance
 * This is the primary way to create analytics for client-side applications
 */
export async function createClientAnalytics(config: AnalyticsConfig): Promise<AnalyticsManager> {
  const manager = createAnalyticsManager(config, CLIENT_PROVIDERS);
  await manager.initialize();
  return manager;
}

/**
 * Create a client analytics instance without initializing
 * Useful when you need to control initialization timing
 */
export function createClientAnalyticsUninitialized(config: AnalyticsConfig): AnalyticsManager {
  return createAnalyticsManager(config, CLIENT_PROVIDERS);
}

// ============================================================================
// EMITTERS - PRIMARY INTERFACE
// ============================================================================

// Export all core emitters - these are the preferred way to track events
export {
  // Core Segment.io spec emitters
  alias,
  // Ecommerce emitters namespace
  ecommerce,
  group,
  identify,
  page,
  track,
} from '../shared/emitters';

// ============================================================================
// ADAPTER UTILITIES
// ============================================================================

export { createEmitterProcessor, processEmitterPayload } from '../shared/utils/emitter-adapter';

// ============================================================================
// TYPES
// ============================================================================

// Core analytics types;

// Emitter types;

// Provider-specific types;

// Ecommerce types;

// ============================================================================
// CONFIGURATION UTILITIES
// ============================================================================

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

// Validation should happen on the server side only
// Client-side validation is removed to follow the four-file export pattern

// ============================================================================
// ADVANCED UTILITIES
// ============================================================================

// Manager utilities

// PostHog utilities
