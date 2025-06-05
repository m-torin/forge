/**
 * Client-side Next.js analytics exports
 * Complete Next.js 15 integration for client components and browser environments
 *
 * @example
 * ```typescript
 * import {
 *   createNextJSClientAnalytics,
 *   usePageTracking,
 *   useTrackEvent,
 *   track
 * } from '@repo/analytics/client/next';
 *
 * // Create Next.js optimized analytics
 * const analytics = createNextJSClientAnalytics({
 *   providers: { segment: { writeKey: 'xxx' } },
 *   nextjs: { strategy: 'afterInteractive', bufferEvents: true }
 * });
 *
 * // Use in client components
 * function MyComponent() {
 *   const trackEvent = useTrackEvent();
 *   usePageTracking(); // Auto page tracking
 *
 *   return <button onClick={() => trackEvent('Button Clicked', { color: 'blue' })}>
 *     Click me
 *   </button>;
 * }
 * ```
 */

// ============================================================================
// CORE CLIENT ANALYTICS (re-export everything from client)
// ============================================================================

// Re-export everything from client for convenience
// ============================================================================
// FEATURE FLAGS FOR NEXT.JS CLIENT
// ============================================================================

// Import feature flag functions for convenience exports
import {
  commonFlags,
  createFeatureFlagManager,
  createFlagContext,
  createTypedFeatureFlags,
  evaluateFlag,
  trackFlagExposure,
} from './shared/feature-flags';

export * from './client';

// ============================================================================
// NEXT.JS CLIENT COMPONENTS & HOOKS
// ============================================================================

export {
  // Context providers
  AnalyticsProvider,
  // Tracked components
  TrackedButton,
  TrackedLink,
  useAnalytics,
  useFeatureFlag,

  // React hooks for client components
  usePageTracking,
  useTrackEvent,
} from './next/app-router';

// Note: Export types only if they exist in the app-router module
// Many of these types may not be implemented yet

// ============================================================================
// NEXT.JS CLIENT ANALYTICS MANAGER
// ============================================================================

export {
  createNextJSClientAnalytics,
  // PostHog bootstrap helpers
  createPostHogConfigWithBootstrap,

  // Script integration helpers
  getAnalyticsScriptProps,

  // Next.js client analytics manager
  NextJSClientAnalyticsManager,
} from './next/client';

// Enhanced PostHog utilities (also available on client)
export {
  getFeatureFlagVariant,
  getFeatureFlagWithFallback,
  getMultipleFeatureFlags,
  trackFeatureFlagExposure,
} from './shared/utils/posthog-next-utils';

// Feature flag convenience functions optimized for Next.js client components
export const nextFlags = {
  // Client-side flag evaluation with React hooks integration
  useFlag: (key: string, defaultValue: any) => {
    // This would integrate with useFeatureFlag hook
    return defaultValue; // Placeholder
  },

  // Batch flag evaluation for client components
  useBatchFlags: (flags: string[]) => {
    // This would integrate with Next.js client state
    return {}; // Placeholder
  },

  // PostHog integration helpers
  posthog: {
    context: createFlagContext,
    evaluate: evaluateFlag,
    track: trackFlagExposure,
  },
};

// Re-export feature flag system for Next.js client
export const flagsClient = {
  typed: createTypedFeatureFlags,
  common: commonFlags,
  context: createFlagContext,
  evaluate: evaluateFlag,
  manager: createFeatureFlagManager,
  nextjs: nextFlags,
  track: trackFlagExposure,
};

export type { NextJSClientAnalyticsConfig } from './next/client';

// ============================================================================
// NEXT.JS TYPES
// ============================================================================

export type {
  AddToCartEvent,
  // Next.js specific types that actually exist
  AnalyticsEvent,
  AnalyticsMiddlewareContext,
  AnalyticsProviderProps,
  CheckoutEvent,
  EventName,
  EventProperties,
  FormErrorEvent,
  FormStartEvent,
  FormSubmitEvent,
  PageViewEvent,
  ProductViewEvent,
  PurchaseEvent,
  TrackedComponentProps,
  TypedTrackFunction,
  UseAnalyticsReturn,
  UseFeatureFlagsReturn,
} from './next/types.d';

// ============================================================================
// USAGE EXAMPLES & PATTERNS
// ============================================================================

/**
 * Example usage patterns for client-side Next.js analytics
 *
 * @example Basic setup in layout.tsx
 * ```typescript
 * 'use client';
 * import { AnalyticsProvider, usePageTracking } from '@repo/analytics/client/next';
 *
 * function RootLayoutContent({ children }) {
 *   usePageTracking(); // Auto page tracking
 *   return <>{children}</>;
 * }
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <AnalyticsProvider config={{
 *       providers: {
 *         segment: { writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY }
 *       }
 *     }}>
 *       <RootLayoutContent>{children}</RootLayoutContent>
 *     </AnalyticsProvider>
 *   );
 * }
 * ```
 *
 * @example Event tracking in components
 * ```typescript
 * 'use client';
 * import { useTrackEvent, track } from '@repo/analytics/client/next';
 *
 * function MyComponent() {
 *   const trackEvent = useTrackEvent();
 *
 *   const handleClick = () => {
 *     trackEvent('Button Clicked', { location: 'hero' });
 *   };
 *
 *   return <button onClick={handleClick}>Click me</button>;
 * }
 * ```
 *
 * @example Feature flags
 * ```typescript
 * 'use client';
 * import { useFeatureFlag } from '@repo/analytics/client/next';
 *
 * function FeatureComponent() {
 *   const showNewFeature = useFeatureFlag('new-feature');
 *
 *   return (
 *     <div>
 *       {showNewFeature ? <NewFeature /> : <OldFeature />}
 *     </div>
 *   );
 * }
 * ```
 */
