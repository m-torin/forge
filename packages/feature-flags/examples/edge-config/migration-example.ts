/**
 * Example showing how to migrate from hardcoded flags to Edge Config
 */
import { flag } from '@vercel/flags/next';
import { edgeConfigAdapter } from '@repo/feature-flags/server/next';

// Before: Hardcoded flag
export const oldFlag = flag({
  key: 'my-feature',
  decide: () => true, // Always enabled
});

// After: Edge Config flag
export const newFlag = flag({
  key: 'my-feature',
  adapter: edgeConfigAdapter(),
  defaultValue: true, // Fallback if Edge Config is unavailable
});

// Gradual migration: Use Edge Config with fallback to hardcoded
export const migrationFlag = flag({
  key: 'gradual-migration',
  adapter: edgeConfigAdapter(),
  decide: async () => {
    // This decide function only runs if Edge Config fails
    // or returns undefined for this flag
    console.log('Falling back to hardcoded value');
    return false;
  },
});

// Multi-provider example: Try Edge Config first, then fallback
import { createPostHogAdapter } from '@repo/feature-flags/server/next';

const postHogFallback = createPostHogAdapter();

export const multiProviderFlag = flag({
  key: 'multi-provider-feature',
  adapter: edgeConfigAdapter(),
  decide: async ({ key, entities }) => {
    // This runs if Edge Config doesn't have the flag
    // Use PostHog as fallback
    const adapter = postHogFallback.isFeatureEnabled();
    const result = await adapter.decide({ key, entities, headers: {} as any, cookies: {} as any });
    return result;
  },
});
