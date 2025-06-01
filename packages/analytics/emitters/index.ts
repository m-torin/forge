// Core Analytics
export { Analytics } from './analytics';
export type { AnalyticsOptions, AnalyticsProviders } from './analytics';

// Emitters
export { BaseAnalyticsEmitter } from './base';
export { SegmentEmitter } from './segment';
export { PostHogEmitter } from './posthog';
export { GoogleAnalyticsEmitter } from './google-analytics';
export { MultiEmitter } from './multi';

// Types
export * from './types';

// Flag-Aware Providers (for app-level usage)
export { FlagAwareAnalyticsProvider } from './providers/flag-aware-provider';
export {
  createFlagAwareAnalytics,
  identifyFlagAwareUser,
  trackFlagAwareEvent,
  withFlagAwareAnalytics,
} from './providers/flag-aware-server';

// Convenience exports
export { Analytics as default } from './analytics';