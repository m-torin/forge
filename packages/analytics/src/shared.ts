/**
 * Shared Environment Analytics Exports
 *
 * This file provides environment-agnostic analytics functionality for packages
 * that can run in both client and server environments.
 *
 * The environment detection is centralized here to avoid scattered runtime checks
 * across multiple packages, maintaining the architectural integrity of the four-file
 * export pattern while solving the cross-environment challenge.
 *
 * @example
 * ```typescript
 * // In environment-agnostic code
 * import { createAnalytics } from '@repo/analytics/shared-env';
 *
 * // Works in both client and server environments
 * const analytics = await createAnalytics(config);
 * ```
 */

// Import types for proper typing
import type { AnalyticsConfig, AnalyticsManager } from './shared/types/types';

// Runtime detection for environment
function isServerEnvironment(): boolean {
  return typeof window === 'undefined' && typeof global !== 'undefined';
}

// Runtime detection for Next.js environment
function isNextJSEnvironment(): boolean {
  // Check for Next.js-specific environment variables and globals
  return (
    // Next.js runtime environment variable
    process.env.NEXT_RUNTIME !== undefined ||
    // Next.js data global (client-side)
    typeof (globalThis as any).__NEXT_DATA__ !== 'undefined' ||
    // Edge runtime global
    typeof (globalThis as any).EdgeRuntime !== 'undefined' ||
    // Next.js process title
    (typeof process !== 'undefined' && process.title?.includes('next')) ||
    // Next.js in development mode
    (typeof process !== 'undefined' &&
      process.env.NODE_ENV === 'development' &&
      process.env.NEXT_PUBLIC_APP_ENV !== undefined)
  );
}

// Main function that environment-agnostic packages need
export async function createAnalytics(config: AnalyticsConfig): Promise<AnalyticsManager> {
  const isServer = isServerEnvironment();
  const isNextJS = isNextJSEnvironment();

  if (isServer) {
    if (isNextJS) {
      const { createServerAnalytics } = await import('./server-next');
      return createServerAnalytics(config);
    } else {
      const { createServerAnalytics } = await import('./server');
      return createServerAnalytics(config);
    }
  } else {
    if (isNextJS) {
      const { createNextJSClientAnalytics } = await import('./client-next');
      return createNextJSClientAnalytics(config);
    } else {
      const { createClientAnalytics } = await import('./client');
      return createClientAnalytics(config);
    }
  }
}

// Re-export essential types that shared packages need
export type {
  AnalyticsConfig,
  AnalyticsContext,
  AnalyticsManager,
  AnalyticsProvider,
  ProviderConfig,
  TrackingOptions,
} from './shared/types/types';

// Re-export emitters for environment-agnostic usage
export { alias, ecommerce, group, identify, page, track } from './shared/emitters';

/**
 * Environment information for debugging
 */
export const environmentInfo = {
  isServer: isServerEnvironment(),
  isNextJS: isNextJSEnvironment(),
  runtime: typeof process !== 'undefined' ? process.env.NEXT_RUNTIME || 'node' : 'browser',
  nodeEnv: typeof process !== 'undefined' ? process.env.NODE_ENV : 'production',
};
