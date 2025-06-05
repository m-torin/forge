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
export * from './client';

// ============================================================================
// NEXT.JS CLIENT COMPONENTS & HOOKS
// ============================================================================

export {
  // React hooks for client components
  usePageTracking,
  useTrackEvent,
  useFeatureFlag,
  
  // Context providers
  AnalyticsProvider,
  useAnalytics,
  
  // Tracked components
  TrackedButton,
  TrackedLink
} from './next/app-router';

// Note: Export types only if they exist in the app-router module
// Many of these types may not be implemented yet

// ============================================================================
// NEXT.JS CLIENT ANALYTICS MANAGER
// ============================================================================

export {
  // Next.js client analytics manager
  NextJSClientAnalyticsManager,
  createNextJSClientAnalytics,
  
  // Script integration helpers
  getAnalyticsScriptProps,
  
  // PostHog bootstrap helpers
  createPostHogConfigWithBootstrap
} from './next/client';

// Enhanced PostHog utilities (also available on client)
export {
  getFeatureFlagWithFallback,
  getFeatureFlagVariant,
  trackFeatureFlagExposure,
  getMultipleFeatureFlags
} from './shared/utils/posthog-next-utils';

// ============================================================================
// FEATURE FLAGS FOR NEXT.JS CLIENT
// ============================================================================

// Import feature flag functions for convenience exports
import {
  evaluateFlag,
  trackFlagExposure,
  createFlagContext,
  createFeatureFlagManager,
  createTypedFeatureFlags,
  commonFlags
} from './shared/feature-flags';

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
    evaluate: evaluateFlag,
    track: trackFlagExposure,
    context: createFlagContext
  }
};

// Re-export feature flag system for Next.js client
export const flagsClient = {
  manager: createFeatureFlagManager,
  typed: createTypedFeatureFlags,
  context: createFlagContext,
  evaluate: evaluateFlag,
  track: trackFlagExposure,
  common: commonFlags,
  nextjs: nextFlags
};

export type {
  NextJSClientAnalyticsConfig
} from './next/client';

// ============================================================================
// NEXT.JS TYPES
// ============================================================================

export type {
  // Next.js specific types that actually exist
  AnalyticsEvent,
  PageViewEvent,
  ProductViewEvent,
  AddToCartEvent,
  CheckoutEvent,
  PurchaseEvent,
  FormStartEvent,
  FormSubmitEvent,
  FormErrorEvent,
  AnalyticsMiddlewareContext,
  TrackedComponentProps,
  UseAnalyticsReturn,
  UseFeatureFlagsReturn,
  AnalyticsProviderProps,
  EventProperties,
  EventName,
  TypedTrackFunction
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