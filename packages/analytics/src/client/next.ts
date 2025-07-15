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
export * from './index';

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
  // React hooks for client components
  usePageTracking,
  useTrackEvent,
} from '../next/app-router';

// Note: Export types only if they exist in the app-router module
// Many of these types may not be implemented yet

// ============================================================================
// NEXT.JS CLIENT ANALYTICS MANAGER
// ============================================================================

export {
  // Next.js client analytics manager
  NextJSClientAnalyticsManager,
  createNextJSClientAnalytics,
  // PostHog bootstrap helpers
  createPostHogConfigWithBootstrap,

  // Script integration helpers
  getAnalyticsScriptProps,
} from '../next/client';

export type { NextJSClientAnalyticsConfig } from '../next/client';

// ============================================================================
// NEXT.JS TYPES
// ============================================================================

// Note: Next.js types exports have been moved to avoid non-existent type errors
// Import the actual types from their respective modules as needed

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
