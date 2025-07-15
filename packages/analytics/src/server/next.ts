/**
 * Server-side Next.js analytics exports
 * Complete Next.js 15 integration for server components, API routes, and middleware
 *
 * @example
 * ```typescript
 * import {
 *   createNextJSServerAnalytics,
 *   trackServerEvent,
 *   getServerFeatureFlag,
 *   createAnalyticsMiddleware
 * } from '@repo/analytics/server/next';
 *
 * // Server component
 * export default async function Page() {
 *   await trackServerEvent('Page Viewed', { path: '/home' });
 *   return <div>Page content</div>;
 * }
 *
 * // Middleware
 * export const middleware = createAnalyticsMiddleware({
 *   providers: { segment: { writeKey: process.env.SEGMENT_WRITE_KEY } }
 * });
 * ```
 */

// ============================================================================
// CORE SERVER ANALYTICS (re-export everything from server)
// ============================================================================

// Re-export everything from server for convenience
export * from './index';

// ============================================================================
// REACT SERVER COMPONENTS
// ============================================================================

export {
  // Context management for RSCs
  ServerAnalyticsProvider,
  getServerBootstrapData,
  identifyServerUser,
  identifyUserAction,
  // Server Actions support
  trackEventAction,
  // Server component tracking functions
  trackServerEvent,
  trackServerPageView,
  withServerPageTracking,
} from '../next/rsc';

// ============================================================================
// NEXT.JS SERVER ANALYTICS MANAGER
// ============================================================================

export {
  // Next.js server analytics manager
  NextJSServerAnalyticsManager,
  createNextJSServerAnalytics,
  createNextJSServerAnalyticsWithBootstrap,
} from '../next/server';

export type { NextJSServerAnalyticsConfig } from '../next/server';

// ============================================================================
// POSTHOG SERVER-SIDE BOOTSTRAP
// ============================================================================

export { getPostHogBootstrapDataOnServer } from '../next/server';

// Additional PostHog utilities
export {
  // PostHog Next.js utilities
  createPostHogConfig,
  createPostHogMiddleware,
  createPostHogServerClient,
  createPostHogSuspenseData,
  getCompleteBootstrapData,
  getOrGenerateDistinctId,
  getPostHogBootstrapData,
} from '../shared/utils/posthog-next-utils';

// ============================================================================
// MIDDLEWARE INTEGRATION
// ============================================================================

export {
  // Analytics middleware for edge runtime
  createAnalyticsMiddleware,
} from '../next/middleware';

export type {
  // Middleware types
  AnalyticsMiddlewareConfig,
} from '../next/middleware';

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
} from '../next/types';

// ============================================================================
// USAGE EXAMPLES & PATTERNS
// ============================================================================

/**
 * Example usage patterns for server-side Next.js analytics
 *
 * @example Server component tracking
 * ```typescript
 * import { trackServerEvent, getServerFeatureFlag } from '@repo/analytics/server/next';
 * import { cookies } from 'next/headers';
 *
 * export default async function HomePage() {
 *   // Track page view
 *   await trackServerEvent('Page Viewed', {
 *     path: '/home',
 *     title: 'Home Page'
 *   });
 *
 *   // Check feature flag
 *   const showBeta = await getServerFeatureFlag('beta-feature', cookies());
 *
 *   return (
 *     <div>
 *       <h1>Welcome</h1>
 *       {showBeta && <BetaFeature />}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example API route tracking
 * ```typescript
 * import { createServerAnalytics, track } from '@repo/analytics/server/next';
 *
 * const analytics = await createServerAnalytics({
 *   providers: {
 *     segment: { writeKey: process.env.SEGMENT_WRITE_KEY }
 *   }
 * });
 *
 * export async function POST(request: Request) {
 *   await analytics.emit(track('API Called', {
 *     endpoint: '/api/users',
 *     method: 'POST'
 *   }));
 *
 *   // Handle request...
 * }
 * ```
 *
 * @example Server Actions
 * ```typescript
 * 'use server';
 * import { trackServerAction } from '@repo/analytics/server/next';
 *
 * export async function submitForm(formData: FormData) {
 *   await trackServerAction('Form Submitted', {
 *     form_id: 'contact',
 *     email: formData.get('email')
 *   });
 *
 *   // Process form...
 * }
 * ```
 *
 * @example Middleware setup
 * ```typescript
 * // middleware.ts
 * import { createAnalyticsMiddleware } from '@repo/analytics/server/next';
 *
 * export const middleware = createAnalyticsMiddleware({
 *   providers: {
 *     segment: { writeKey: process.env.SEGMENT_WRITE_KEY }
 *   },
 *   matchers: ['/api/*', '/app/*'],
 *   exclude: ['/api/health'],
 *   extractUserId: (request) => request.headers.get('x-user-id'),
 *   extractContext: (request) => ({
 *     ip: request.ip,
 *     country: request.geo?.country
 *   })
 * });
 *
 * export const config = {
 *   matcher: ['/((?!_next/static|favicon.ico).*)']
 * };
 * ```
 */
