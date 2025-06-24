/**
 * Edge runtime exports for analytics
 *
 * This module provides edge-compatible analytics functionality for Next.js edge runtime
 * (middleware, edge API routes, etc.). It uses only Web APIs and HTTP-based implementations
 * compatible with the edge runtime.
 *
 * Limitations:
 * - No Node.js APIs (fs, crypto, etc.)
 * - No native modules
 * - HTTP-based implementations only
 * - Limited to Web APIs
 */

import type {
  AnalyticsConfig,
  AnalyticsManager,
  AnalyticsProvider,
  AnalyticsEvent,
  IdentifyTraits,
  PageProperties,
  GroupTraits,
  TrackProperties,
} from './types';

// Re-export types
export type * from './types';

// Re-export emitter types and utilities
export type * from './shared/emitters/emitter-types';
export { createEmitterAdapter } from './shared/utils/emitter-adapter';

/**
 * Edge-compatible analytics manager for server-side edge runtime
 * This implementation uses fetch-based providers only
 */
export async function createServerAnalytics(
  config: AnalyticsConfig = {},
): Promise<AnalyticsManager> {
  const providers: AnalyticsProvider[] = [];

  // Console provider is edge-compatible (uses console API)
  if (config.providers?.console?.enabled !== false) {
    const { ConsoleProvider } = await import('./providers/console');
    providers.push(new ConsoleProvider(config.providers?.console || {}));
  }

  // PostHog edge implementation (HTTP-based)
  if (config.providers?.posthog?.enabled && config.providers.posthog.apiKey) {
    // Note: PostHog Node SDK is not edge-compatible, so we use HTTP API directly
    providers.push({
      name: 'posthog-edge',
      async identify(userId: string, traits?: IdentifyTraits) {
        await fetch('https://app.posthog.com/capture/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: config.providers!.posthog!.apiKey,
            event: '$identify',
            distinct_id: userId,
            properties: { $set: traits },
          }),
        });
      },
      async track(event: string, properties?: TrackProperties) {
        await fetch('https://app.posthog.com/capture/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: config.providers!.posthog!.apiKey,
            event,
            properties,
          }),
        });
      },
      async page(properties?: PageProperties) {
        await fetch('https://app.posthog.com/capture/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: config.providers!.posthog!.apiKey,
            event: '$pageview',
            properties,
          }),
        });
      },
      async group(groupId: string, traits?: GroupTraits) {
        await fetch('https://app.posthog.com/capture/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: config.providers!.posthog!.apiKey,
            event: '$groupidentify',
            properties: { $group_id: groupId, $group_set: traits },
          }),
        });
      },
      async alias(userId: string, previousId: string) {
        await fetch('https://app.posthog.com/capture/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: config.providers!.posthog!.apiKey,
            event: '$create_alias',
            properties: { distinct_id: userId, alias: previousId },
          }),
        });
      },
      async reset() {
        // No-op for edge runtime
      },
      async flush() {
        // No-op for edge runtime (HTTP requests are immediate)
        return true;
      },
    });
  }

  // Create analytics manager
  return {
    providers,
    async identify(userId: string, traits?: IdentifyTraits) {
      await Promise.all(providers.map((p) => p.identify(userId, traits)));
    },
    async track(event: string, properties?: TrackProperties) {
      await Promise.all(providers.map((p) => p.track(event, properties)));
    },
    async page(properties?: PageProperties) {
      await Promise.all(providers.map((p) => p.page(properties)));
    },
    async group(groupId: string, traits?: GroupTraits) {
      await Promise.all(providers.map((p) => p.group(groupId, traits)));
    },
    async alias(userId: string, previousId: string) {
      await Promise.all(providers.map((p) => p.alias(userId, previousId)));
    },
    async reset() {
      await Promise.all(providers.map((p) => p.reset()));
    },
    async flush() {
      const results = await Promise.all(providers.map((p) => p.flush()));
      return results.every((r) => r);
    },
  };
}

// Export edge-compatible configuration utilities
export { createAnalyticsConfig } from './shared/utils/config';

// Note: Feature flags and other Node.js-specific functionality
// are not available in edge runtime
