/**
 * Analytics types exports
 */

// Core analytics types
export type {
  AnalyticsConfig,
  AnalyticsContext,
  AnalyticsManager,
  AnalyticsProvider,
  ProviderConfig,
  TrackingOptions,
  ProviderRegistry,
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
export type { BootstrapData, PostHogConfig, PostHogOptions } from '../shared/types/posthog-types';
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
