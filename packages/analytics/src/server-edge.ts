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

import type { AnalyticsConfig, AnalyticsProvider } from './types';

// Define missing trait/property types
type IdentifyTraits = Record<string, any>;
type _PageProperties = Record<string, any>;
type GroupTraits = Record<string, any>;
type TrackProperties = Record<string, any>;

// Re-export types
export type * from './types';

// Re-export emitter types and utilities
export type * from './shared/emitters/emitter-types';
export { createEmitterProcessor } from './shared/utils/emitter-adapter';

/**
 * Edge-compatible analytics manager for server-side edge runtime
 * This implementation uses fetch-based providers only
 */
export async function createServerAnalytics(
  config: AnalyticsConfig = { providers: {} },
): Promise<any> {
  const providers: AnalyticsProvider[] = [];

  // Console provider is edge-compatible (uses console API)
  if (config.providers?.console) {
    const { ConsoleProvider } = await import('./providers/console');
    providers.push(new ConsoleProvider(config.providers.console));
  }

  // PostHog edge implementation (HTTP-based)
  if (config.providers?.posthog && config.providers.posthog.apiKey) {
    // Note: PostHog Node SDK is not edge-compatible, so we use HTTP API directly
    providers.push({
      name: 'posthog-edge',
      async initialize() {
        // No initialization needed for HTTP-based PostHog
      },
      async identify(userId: string, traits?: IdentifyTraits) {
        await fetch('https://app.posthog.com/capture/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: config.providers?.posthog?.apiKey,
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
            api_key: config.providers?.posthog?.apiKey,
            event,
            properties,
          }),
        });
      },
      async page(name: string, properties?: any) {
        await fetch('https://app.posthog.com/capture/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: config.providers?.posthog?.apiKey,
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
            api_key: config.providers?.posthog?.apiKey,
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
            api_key: config.providers?.posthog?.apiKey,
            event: '$create_alias',
            properties: { distinct_id: userId, alias: previousId },
          }),
        });
      },
    });
  }

  // Create analytics manager (simplified implementation)
  return {
    providers,
    getContext: () => ({}),
    initialize: async () => {},
    setContext: () => {},
    createEmitter: () => async () => {},
    emit: async () => {},
    emitBatch: async () => {},

    async identify(userIdOrPayload: any, traits?: any) {
      // Handle both overload signatures
      if (typeof userIdOrPayload === 'string') {
        await Promise.all(providers.map(p => p.identify?.(userIdOrPayload, traits)));
      }
    },

    async track(eventOrPayload: any, properties?: any) {
      // Handle both overload signatures
      if (typeof eventOrPayload === 'string') {
        await Promise.all(providers.map(p => p.track(eventOrPayload, properties)));
      }
    },

    async page(nameOrPayload?: any, properties?: any) {
      // Handle both overload signatures
      if (typeof nameOrPayload === 'string' || nameOrPayload === undefined) {
        await Promise.all(providers.map(p => p.page?.(nameOrPayload, properties)));
      }
    },

    async group(groupIdOrPayload: any, traits?: any) {
      // Handle both overload signatures
      if (typeof groupIdOrPayload === 'string') {
        await Promise.all(providers.map(p => p.group?.(groupIdOrPayload, traits)));
      }
    },

    async alias(userIdOrPayload: any, previousId?: any) {
      // Handle both overload signatures
      if (typeof userIdOrPayload === 'string') {
        await Promise.all(providers.map(p => p.alias?.(userIdOrPayload, previousId)));
      }
    },

    getActiveProviders: () => providers.map(p => p.name),
    getProvider: (name: string) => providers.find(p => p.name === name),
    processEmitterPayload: async () => {},
    trackEcommerce: async () => {},
  };
}

// Export edge-compatible configuration utilities
export { getAnalyticsConfig } from './shared/utils/config';

// Note: Feature flags and other Node.js-specific functionality
// are not available in edge runtime
