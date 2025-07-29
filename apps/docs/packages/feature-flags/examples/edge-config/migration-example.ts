/**
 * Example showing how to migrate from hardcoded flags to Edge Config
 */
import { flag } from '@vercel/flags/next';

import { createPostHogServerAdapter, edgeConfigAdapter } from '@repo/feature-flags/server/next';

// Before: Hardcoded flag
export const oldFlag = flag({
  decide: () => true, // Always enabled
  key: 'my-feature',
});

// After: Edge Config flag
export const newFlag = flag({
  adapter: edgeConfigAdapter(),
  defaultValue: true, // Fallback if Edge Config is unavailable
  key: 'my-feature',
});

// Gradual migration: Use Edge Config with fallback to hardcoded
export const migrationFlag = flag({
  decide: async () => {
    // This decide function only runs if Edge Config fails
    // or returns undefined for this flag
    console.log('Falling back to hardcoded value');
    return false;
  },
  adapter: edgeConfigAdapter(),
  key: 'gradual-migration',
});

const postHogFallback = createPostHogServerAdapter();

export const multiProviderFlag = flag({
  decide: async params => {
    // This runs if Edge Config doesn't have the flag
    // Use PostHog as fallback
    const adapter = postHogFallback.isFeatureEnabled();
    const result = await adapter.decide({
      cookies: {} as any,
      entities: params.entities,
      headers: {} as any,
      key: 'multi-provider-feature',
    });
    return result;
  },
  adapter: edgeConfigAdapter(),
  key: 'multi-provider-feature',
});
