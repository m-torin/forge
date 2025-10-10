/**
 * Server-side analytics exports
 * Complete analytics solution for server/Node.js environments
 *
 * @example
 * ```typescript
 * import { createServerAnalytics, track, ecommerce } from '@repo/analytics/server';
 *
 * const analytics = await createServerAnalytics({
 *   providers: {
 *     segment: { writeKey: 'xxx' },
 *     posthog: { apiKey: 'yyy' }
 *   }
 * });
 *
 * // Preferred: Use emitters
 * await analytics.emit(track('API Called', { endpoint: '/users' }));
 * await analytics.emit(ecommerce.orderCompleted({ order_id: '123' }));
 * ```
 */

import { ConsoleProvider } from '../providers/console/server';
import { createAnalyticsManager } from '../shared/utils/manager';

import { PostHogServerProvider } from '../providers/posthog/server';
import { SegmentServerProvider } from '../providers/segment/server';
import { VercelServerProvider } from '../providers/vercel/server';

import type { AnalyticsConfig, AnalyticsManager, ProviderRegistry } from '../shared/types/types';

// Server-specific provider registry
const SERVER_PROVIDERS: ProviderRegistry = {
  console: config => new ConsoleProvider(config),
  posthog: config => new PostHogServerProvider(config),
  segment: config => new SegmentServerProvider(config),
  vercel: config => new VercelServerProvider(config),
};

// ============================================================================
// CORE ANALYTICS FUNCTIONS
// ============================================================================

/**
 * Create and initialize a server analytics instance
 * This is the primary way to create analytics for server-side applications
 */
export async function createServerAnalytics(config: AnalyticsConfig): Promise<AnalyticsManager> {
  const manager = createAnalyticsManager(config, SERVER_PROVIDERS);
  await manager.initialize();
  return manager;
}

/**
 * Create a server analytics instance without initializing
 * Useful when you need to control initialization timing
 */
function _createServerAnalyticsUninitialized(config: AnalyticsConfig): AnalyticsManager {
  return createAnalyticsManager(config, SERVER_PROVIDERS);
}

// ============================================================================
// EMITTERS - PRIMARY INTERFACE
// ============================================================================

// Export all core emitters - these are the preferred way to track events
export {} from '../shared/emitters';

// ============================================================================
// ADAPTER UTILITIES
// ============================================================================

export {} from '../shared/utils/emitter-adapter';

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

// ============================================================================
// ADVANCED UTILITIES
// ============================================================================

// Manager utilities

// PostHog server utilities

// Export Node 22+ enhanced features for server-side use
