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
export function createServerAnalyticsUninitialized(config: AnalyticsConfig): AnalyticsManager {
  return createAnalyticsManager(config, SERVER_PROVIDERS);
}

// ============================================================================
// EMITTERS - PRIMARY INTERFACE
// ============================================================================

// Export all core emitters - these are the preferred way to track events
export {
  alias,
  // Emitter utilities
  ContextBuilder,
  createAnonymousSession,
  createUserSession,
  // Ecommerce emitters namespace
  ecommerce,
  EventBatch,
  group,
  // Core Segment.io spec emitters
  identify,
  isAliasPayload,
  isGroupPayload,
  isIdentifyPayload,
  isPagePayload,

  // Type guards
  isTrackPayload,
  page,
  PayloadBuilder,
  track,
  withMetadata,
  withUTM,
} from '../shared/emitters';

// ============================================================================
// ADAPTER UTILITIES
// ============================================================================

export {
  createEmitterProcessor,
  // Emitter processing utilities
  processEmitterPayload,
  trackEcommerceEvent,
} from '../shared/utils/emitter-adapter';

// ============================================================================
// TYPES
// ============================================================================

// Core analytics types
export type {
  AnalyticsConfig,
  AnalyticsContext,
  AnalyticsManager,
  AnalyticsProvider,
  ProviderConfig,
  TrackingOptions,
} from '../shared/types/types';

// Emitter types
export type {
  EmitterAliasPayload,
  EmitterContext,
  EmitterGroupPayload,
  EmitterIdentifyPayload,
  EmitterOptions,
  EmitterPagePayload,
  EmitterPayload,
  EmitterTrackPayload,
} from '../shared/emitters/emitter-types';

// Provider-specific types
export type { SegmentConfig, SegmentOptions } from '../shared/types/segment-types';

export type {
  BootstrapData,
  EnhancedPostHogProvider,
  PostHogConfig,
  PostHogOptions,
} from '../shared/types/posthog-types';

export type { VercelConfig, VercelOptions } from '../shared/types/vercel-types';

export type { ConsoleConfig, ConsoleOptions } from '../shared/types/console-types';

// Ecommerce types
export type {
  BaseProductProperties,
  CartProperties,
  EcommerceEventSpec,
  ExtendedProductProperties,
  OrderProperties,
} from '../shared/emitters/ecommerce/types';

// ============================================================================
// CONFIGURATION UTILITIES
// ============================================================================

export {
  createConfigBuilder,
  getAnalyticsConfig,
  PROVIDER_REQUIREMENTS,
  validateConfig,
} from '../shared/utils/config';

export type { ConfigBuilder, ConfigRequirements } from '../shared/utils/config';

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export {
  debugConfig,
  validateAnalyticsConfig,
  validateConfigOrThrow,
  validateProvider,
} from '../shared/utils/validation';

export type { ValidationError, ValidationResult } from '../shared/utils/validation';

// ============================================================================
// ADVANCED UTILITIES
// ============================================================================

// Manager utilities
export {
  AnalyticsManager as AnalyticsManagerClass,
  createAnalyticsManager,
} from '../shared/utils/manager';

// PostHog server utilities
export {
  createBootstrapData,
  createMinimalBootstrapData,
  generateDistinctId,
  getDistinctIdFromCookies,
} from '../shared/utils/posthog-bootstrap';

export {
  createPostHogConfig,
  createPostHogServerClient,
  getCompleteBootstrapData,
} from '../shared/utils/posthog-next-utils';
