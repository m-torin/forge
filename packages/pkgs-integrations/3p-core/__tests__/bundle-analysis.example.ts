/**
 * Bundle Analysis Examples - Tree-shaking Verification
 * These examples demonstrate optimal import patterns for minimum bundle size
 */

// ===== TREE-SHAKING OPTIMIZED IMPORTS =====

// Example 1: Direct adapter import (minimal bundle impact)
import { VercelAdapter } from '@repo/3p-vercel/adapter';

// Example 2: Specific operation imports (only load what you need)
import { trackButtonClick, trackCustomEvent } from '@repo/3p-vercel/operations/events';
import { trackPageView } from '@repo/3p-vercel/operations/page-views';

// Example 3: Optional composable utilities (tree-shaken if unused)
import { withPrivacy } from '@repo/3p-core/composable/with-privacy';
import { withRetry } from '@repo/3p-core/composable/with-retry';

// Example 4: Lazy multi-provider (only loads providers when needed)
import { LazyMultiProvider } from '@repo/3p-core/orchestration/lazy-multi-provider';

// ===== EXAMPLE USAGE PATTERNS =====

export function minimalVercelUsage() {
  // Smallest possible bundle - just the adapter
  const adapter = new VercelAdapter({
    provider: 'vercel',
    enabled: true,
  });

  return {
    // Basic tracking function
    track: (name: string, data: Record<string, any>) => adapter.track({ name, properties: data }),

    // Clean up when done
    destroy: () => adapter.destroy(),
  };
}

export function operationsUsage() {
  // Medium bundle - includes operation helpers
  const adapter = new VercelAdapter({
    provider: 'vercel',
    enabled: true,
  });

  return {
    // Use operation helpers for semantic tracking
    trackButton: (buttonId: string, buttonText: string) =>
      trackButtonClick(adapter, { id: buttonId, text: buttonText }),

    trackPage: (url: string, title: string) => trackPageView(adapter, { url, title }),

    trackCustom: (name: string, data: Record<string, any>) => trackCustomEvent(adapter, name, data),
  };
}

export function enhancedUsage() {
  // Larger bundle - includes composable utilities
  const baseAdapter = new VercelAdapter({
    provider: 'vercel',
    enabled: true,
  });

  // Add retry capability (tree-shaken if not used)
  const adapterWithRetry = withRetry(baseAdapter, {
    maxAttempts: 3,
    baseDelay: 1000,
  });

  // Add privacy compliance (tree-shaken if not used)
  const adapter = withPrivacy(adapterWithRetry, {
    consentRequired: true,
    anonymizeByDefault: false,
  });

  return {
    track: (name: string, data: Record<string, any>) => adapter.track({ name, properties: data }),
  };
}

export function multiProviderUsage() {
  // Full orchestration - lazy loads providers only when needed
  const multiProvider = new LazyMultiProvider({
    providers: {
      vercel: {
        enabled: true,
        priority: 1,
        loader: async () => {
          const { VercelAdapter } = await import('@repo/3p-vercel/adapter');
          return new VercelAdapter({ provider: 'vercel', enabled: true });
        },
      },
      posthog: {
        enabled: true,
        priority: 2,
        loader: async () => {
          const { PostHogAdapter } = await import('@repo/3p-posthog/adapter');
          return new PostHogAdapter({
            provider: 'posthog',
            enabled: true,
            apiHost: 'https://app.posthog.com',
          });
        },
      },
    },
    execution: {
      mode: 'parallel',
      continueOnError: true,
      timeout: 5000,
    },
  });

  return {
    // Single call reaches all enabled providers
    track: (name: string, data: Record<string, any>) =>
      multiProvider.track({ name, properties: data }),

    identify: (userId: string, traits: Record<string, any>) =>
      multiProvider.identify({ userId, traits }),

    page: (name: string, properties: Record<string, any>) =>
      multiProvider.page({ name, properties }),
  };
}

// ===== BUNDLE SIZE ESTIMATION =====

export const bundleSizeEstimates = {
  minimalVercelUsage: {
    // Only VercelAdapter + minimal-adapter base class
    estimatedSize: '~2KB gzipped',
    includes: ['VercelAdapter class', 'BaseMinimalAdapter base class', 'Core types'],
  },

  operationsUsage: {
    // Adapter + operation helper functions
    estimatedSize: '~3KB gzipped',
    includes: ['VercelAdapter class', 'Operation helper functions', 'Type definitions'],
  },

  enhancedUsage: {
    // Adapter + composable utilities
    estimatedSize: '~4-5KB gzipped',
    includes: [
      'VercelAdapter class',
      'withRetry utility',
      'withPrivacy utility',
      'Circuit breaker logic',
      'Privacy checking logic',
    ],
  },

  multiProviderUsage: {
    // LazyMultiProvider + dynamic imports
    estimatedSize: '~3KB gzipped initial + providers on-demand',
    includes: [
      'LazyMultiProvider orchestration',
      'Dynamic import loaders',
      'Providers loaded only when used',
    ],
    notes: [
      'Initial bundle: LazyMultiProvider only',
      'Providers: Loaded on-demand via dynamic imports',
      'Unused providers: Completely tree-shaken',
    ],
  },
} as const;

// ===== ANTI-PATTERNS (AVOID THESE) =====

// ❌ DON'T: Import entire packages
// import * as VercelAnalytics from '@repo/3p-vercel';

// ❌ DON'T: Import index files (we don't have them anyway)
// import { everything } from '@repo/3p-vercel';

// ❌ DON'T: Import utilities you won't use
// import { withRetry, withBatching, withPrivacy } from '@repo/3p-core/composable/*';

// ✅ DO: Import only what you need
// import { withRetry } from '@repo/3p-core/composable/with-retry';

// ✅ DO: Use dynamic imports for optional features
// const { withBatching } = await import('@repo/3p-core/composable/with-batching');

// ===== TREE-SHAKING VERIFICATION =====

export function verifyTreeShaking() {
  // This function demonstrates what gets included/excluded

  // ✅ INCLUDED: Used imports
  const adapter = new VercelAdapter({ provider: 'vercel', enabled: true });

  // ✅ EXCLUDED: Unused imports are tree-shaken
  // Even though withBatching is available, it won't be in the bundle if unused

  return {
    // Only the adapter will be in the final bundle
    track: (name: string) => adapter.track({ name, properties: {} }),
  };

  // withRetry, withPrivacy, LazyMultiProvider, operations/* all excluded
  // because they're not used in this function
}

export type BundleAnalysisExample = ReturnType<typeof minimalVercelUsage>;
