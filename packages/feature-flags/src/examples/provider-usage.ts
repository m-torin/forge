/**
 * Modern Vercel Flags SDK v4+ usage examples
 * This demonstrates the latest patterns and best practices
 */

import { modernEdgeConfigAdapter, modernPostHogAdapter } from '../adapters/provider-adapters';
import {
  analyticsConfig,
  trackExperimentAssignment,
  trackFlagConversion,
  trackFlagEvaluation,
} from '../server/analytics';
import {
  createModernFlagsDiscoveryEndpoint,
  getProviderDataWithMetadata,
} from '../server/discovery';
import {
  batchPrecompute,
  evaluateFlags,
  precomputeFlags,
  precomputeWithCache,
} from '../server/precomputation';
import { createBooleanFlag, createVariantFlag, createVercelFlag } from '../shared/createVercelFlag';
import { encryptFlags, isEncryptionAvailable } from '../shared/encryption';

// ============================================================================
// BASIC FLAG DEFINITIONS
// ============================================================================

/**
 * Simple boolean flag with automatic analytics tracking
 */
export const newCheckoutFlow = createBooleanFlag('new_checkout_flow', {
  description: 'Enable the new streamlined checkout experience',
  primaryAdapter: () => modernPostHogAdapter.isFeatureEnabled(),
  secondaryAdapter: () => modernEdgeConfigAdapter(),
  percentage: 25, // 25% rollout offline
});

/**
 * Variant flag with multiple options
 */
export const recommendationAlgorithm = createVariantFlag(
  'recommendation_algorithm',
  [
    { label: 'Collaborative Filtering', value: 'collaborative' },
    { label: 'Content Based', value: 'content' },
    { label: 'Hybrid Approach', value: 'hybrid' },
    { label: 'AI Powered', value: 'ai_powered' },
  ],
  {
    description: 'Product recommendation algorithm selection',
    primaryAdapter: () => modernPostHogAdapter.featureFlagValue() as any,
    secondaryAdapter: () => modernEdgeConfigAdapter(),
  },
);

/**
 * Advanced flag with custom logic
 */
export const dynamicPricing = createVercelFlag({
  key: 'dynamic_pricing',
  description: 'Enable dynamic pricing based on demand and user tier',
  adapters: {
    primary: () => modernPostHogAdapter.featureFlagPayload(),
    secondary: () => modernEdgeConfigAdapter(),
    offline: {
      type: 'custom',
      customLogic: context => {
        // Custom business logic for offline mode
        const isPremiumUser = context.user.tier === 'premium';
        const isHighDemandRegion = ['US', 'GB', 'DE'].includes(context.request.country);

        return {
          enabled: isPremiumUser || isHighDemandRegion,
          multiplier: isPremiumUser ? 0.9 : isHighDemandRegion ? 1.1 : 1.0,
          maxDiscount: isPremiumUser ? 0.3 : 0.1,
        };
      },
    },
  },
  defaultValue: { enabled: false, multiplier: 1.0, maxDiscount: 0 },
});

/**
 * Time-based flag for scheduled features
 */
export const blackFridayPromo = createVercelFlag({
  key: 'black_friday_promo',
  description: 'Black Friday promotional features',
  adapters: {
    primary: () => modernPostHogAdapter.isFeatureEnabled(),
    offline: {
      type: 'time-based',
      schedule: {
        start: '2024-11-29T00:00:00Z',
        end: '2024-11-30T23:59:59Z',
        // Only on Friday
        days: [5],
      },
    },
  },
  defaultValue: false,
});

// ============================================================================
// PRECOMPUTATION EXAMPLES
// ============================================================================

/**
 * Precompute flags for middleware use
 */
export async function precomputeMiddlewareFlags() {
  const flags = [newCheckoutFlow, recommendationAlgorithm, dynamicPricing] as const;

  const context = {
    user: { id: 'anonymous', sessionId: 'session-123' },
    visitor: { id: 'visitor-456' },
    request: {
      country: 'US',
      userAgent: 'Mozilla/5.0...',
      environment: 'production',
      deployment: 'deployment-abc',
    },
    timestamp: Date.now(),
  };

  try {
    // Basic precomputation
    const code = await precomputeFlags(flags, context, {
      enableMetrics: true,
      timeout: 3000,
    });

    // With caching for expensive computations
    const cachedCode = await precomputeWithCache(flags, context, {
      cacheKey: `flags:${context.user.id}:${context.request.country}`,
      cacheDuration: 300000, // 5 minutes
      enableMetrics: true,
    });

    return { code, cachedCode };
  } catch (error) {
    console.error('Precomputation failed:', error);
    throw error;
  }
}

/**
 * Batch precompute for multiple user segments
 */
export async function precomputeFlagsBySegment() {
  const flags = [newCheckoutFlow, recommendationAlgorithm] as const;

  const segments = [
    {
      name: 'premium_users',
      flags,
      context: {
        user: { id: 'premium-user', tier: 'premium', sessionId: 'session-1' },
        visitor: { id: 'visitor-1' },
        request: {
          country: 'US',
          userAgent: 'browser',
          environment: 'production',
          deployment: 'prod',
        },
        timestamp: Date.now(),
      },
    },
    {
      name: 'free_users',
      flags,
      context: {
        user: { id: 'free-user', tier: 'free', sessionId: 'session-2' },
        visitor: { id: 'visitor-2' },
        request: {
          country: 'IN',
          userAgent: 'browser',
          environment: 'production',
          deployment: 'prod',
        },
        timestamp: Date.now(),
      },
    },
  ];

  const results = await batchPrecompute(segments, {
    enableMetrics: true,
    failFast: false,
  });

  return results;
}

// ============================================================================
// DISCOVERY ENDPOINT EXAMPLES
// ============================================================================

/**
 * Modern discovery endpoint for Next.js API route
 *
 * Usage in app/api/flags/discover/route.ts:
 * ```typescript
 * export const GET = createFlagsDiscoveryEndpoint();
 * ```
 */
export const flagsDiscoveryEndpoint: (
  request: import('next/server').NextRequest,
) => Promise<Response> = createModernFlagsDiscoveryEndpoint(
  async () => {
    return getProviderDataWithMetadata({
      posthog: {
        personalApiKey: process.env.POSTHOG_PERSONAL_API_KEY || '',
        projectId: process.env.POSTHOG_PROJECT_ID || '',
      },
      edgeConfig: {
        connectionString: process.env.EDGE_CONFIG || '',
      },
    });
  },
  {
    secret: process.env.FLAGS_SECRET,
    enableLogging: true,
  },
);

// ============================================================================
// ANALYTICS INTEGRATION EXAMPLES
// ============================================================================

/**
 * Track feature flag usage with detailed context
 */
export async function trackFeatureFlagUsage() {
  // Initialize client-side analytics
  analyticsConfig.initializeClient();

  // Track flag evaluation
  await trackFlagEvaluation('new_checkout_flow', true, {
    userId: 'user-123',
    sessionId: 'session-456',
    country: 'US',
    environment: 'production',
    tier: 'premium',
  });

  // Track A/B test assignment
  await trackExperimentAssignment('checkout_experiment', 'variant_b', {
    userId: 'user-123',
    sessionId: 'session-456',
    country: 'US',
    environment: 'production',
  });

  // Track conversion event
  await trackFlagConversion('new_checkout_flow', 'purchase_completed', 49.99, {
    userId: 'user-123',
    sessionId: 'session-456',
    country: 'US',
    environment: 'production',
  });
}

// ============================================================================
// ENCRYPTION EXAMPLES
// ============================================================================

/**
 * Encrypt sensitive flag values
 */
export async function handleSensitiveFlagData() {
  const sensitiveFlags = {
    user_credit_limit: 5000,
    internal_feature: true,
    beta_pricing: { discount: 0.3, eligible: true },
  };

  if (isEncryptionAvailable()) {
    try {
      // Encrypt flag values
      const encrypted = await encryptFlags(sensitiveFlags);
      console.log('Encrypted flag data:', encrypted);

      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw error;
    }
  } else {
    console.warn('Encryption not available - FLAGS_SECRET not configured');
    return null;
  }
}

// ============================================================================
// USAGE IN NEXT.JS COMPONENTS
// ============================================================================

/**
 * Example Next.js server component usage
 */
export async function ServerComponentExample() {
  // In a real server component, you'd have access to cookies() and headers()
  const mockCookies = new Map([
    ['user-id', { value: 'user-123' }],
    ['visitor-id', { value: 'visitor-456' }],
  ]) as any;

  const mockHeaders = new Map([
    ['x-country', 'US'],
    ['user-agent', 'Mozilla/5.0...'],
  ]) as any;

  // Evaluate flags
  const isNewCheckoutEnabled = await newCheckoutFlow({
    cookies: mockCookies,
    headers: mockHeaders,
  } as any);

  const algorithmVariant = await recommendationAlgorithm({
    cookies: mockCookies,
    headers: mockHeaders,
  } as any);

  const pricingConfig = await dynamicPricing({
    cookies: mockCookies,
    headers: mockHeaders,
  } as any);

  return {
    checkout: isNewCheckoutEnabled,
    algorithm: algorithmVariant,
    pricing: pricingConfig,
  };
}

// ============================================================================
// MIGRATION HELPERS
// ============================================================================

/**
 * Helper to migrate from old flag patterns to new ones
 */
export function migrateOldFlagToModern() {
  // Old pattern (v3):
  // const oldFlag = flag({
  //   key: 'feature',
  //   decide: () => true,
  //   defaultValue: false
  // });

  // New pattern (v4+):
  const newFlag = createBooleanFlag('feature', {
    description: 'Migrated feature flag',
    primaryAdapter: () => modernPostHogAdapter.isFeatureEnabled(),
    secondaryAdapter: () => modernEdgeConfigAdapter(),
    percentage: 50,
  });

  return newFlag;
}

// ============================================================================
// TESTING HELPERS
// ============================================================================

/**
 * Helper for testing flag behavior
 */
export async function testFlagScenarios() {
  const testContexts = [
    {
      name: 'Premium User - US',
      context: {
        user: { id: 'premium-user', tier: 'premium', sessionId: 'test-session' },
        visitor: { id: 'test-visitor' },
        request: { country: 'US', userAgent: 'test', environment: 'test', deployment: 'test' },
        timestamp: Date.now(),
      },
    },
    {
      name: 'Free User - IN',
      context: {
        user: { id: 'free-user', tier: 'free', sessionId: 'test-session-2' },
        visitor: { id: 'test-visitor-2' },
        request: { country: 'IN', userAgent: 'test', environment: 'test', deployment: 'test' },
        timestamp: Date.now(),
      },
    },
  ];

  const flags = [newCheckoutFlow, recommendationAlgorithm, dynamicPricing];

  for (const scenario of testContexts) {
    console.log(`
=== Testing: ${scenario.name} ===`);

    for (const flag of flags) {
      try {
        const result = await evaluateFlags([flag], scenario.context);
        console.log(`${flag.key}:`, result);
      } catch (error) {
        console.error(`Error evaluating ${flag.key}:`, error);
      }
    }
  }
}
