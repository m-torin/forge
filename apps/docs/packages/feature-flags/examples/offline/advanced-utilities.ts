import { dedupe, flag } from '@vercel/flags/next';
import {
  checkEnvironmentOverride,
  createDeterministicHash,
  extractRequestContext,
  extractUserContext,
  getOfflineRolloutPercentage,
  getOfflineVariant,
  getTimeBasedFlag,
} from '../../src/shared/utils';

import type { ReadonlyRequestCookies } from '@vercel/flags';

// Example: Using deterministic hash for consistent evaluation
export const consistentHashFlag = flag<boolean>({
  key: 'consistent-hash-example',
  description: 'Demonstrates deterministic hash-based evaluation',
  async identify({ cookies }) {
    const { userId } = extractUserContext(cookies);
    return { user: { id: userId } };
  },
  decide: ({ key, entities }) => {
    const context = entities?.user?.id || 'anonymous';
    const hash = createDeterministicHash(key + context);
    return hash % 2 === 0; // Consistent 50/50 split
  },
});

// Example: Percentage-based rollout utility
export const gradualRolloutFlag = flag<boolean>({
  key: 'gradual-rollout-example',
  description: 'Demonstrates percentage-based feature rollout',
  async identify({ cookies }) {
    const { userId } = extractUserContext(cookies);
    return { user: { id: userId } };
  },
  decide: ({ key, entities }) => {
    const context = entities?.user?.id || 'anonymous';
    return getOfflineRolloutPercentage(key, context, 25); // 25% rollout
  },
});

// Example: Multi-variant testing with utilities
export const multiVariantFlag = flag<'control' | 'variant-a' | 'variant-b' | 'variant-c'>({
  key: 'multi-variant-example',
  description: 'Demonstrates multi-variant testing with utilities',
  async identify({ cookies }) {
    const { userId, visitorId } = extractUserContext(cookies);
    return { user: { id: userId }, visitor: { id: visitorId } };
  },
  decide: ({ key, entities }) => {
    const context = entities?.user?.id || entities?.visitor?.id || 'anonymous';
    const variants = ['control', 'variant-a', 'variant-b', 'variant-c'] as const;
    return getOfflineVariant(key, context, variants);
  },
  options: [
    { label: 'Control', value: 'control' },
    { label: 'Variant A', value: 'variant-a' },
    { label: 'Variant B', value: 'variant-b' },
    { label: 'Variant C', value: 'variant-c' },
  ],
});

// Example: Environment variable override
export const environmentOverrideFlag = flag<boolean>({
  key: 'environment-override-example',
  description: 'Demonstrates environment variable override pattern',
  async identify({ cookies }) {
    const { userId } = extractUserContext(cookies);
    return { user: { id: userId } };
  },
  decide: ({ key, entities }) => {
    // Check environment override first
    const envOverride = checkEnvironmentOverride(key);
    if (envOverride !== undefined) {
      return envOverride as boolean;
    }

    // Fallback to user-based logic
    const context = entities?.user?.id || 'anonymous';
    return getOfflineRolloutPercentage(key, context, 50);
  },
});

// Example: Time-based flag evaluation
export const timeBasedFlag = flag<boolean>({
  key: 'time-based-example',
  description: 'Demonstrates time-based flag evaluation',
  decide: ({ key }) => {
    // Enable only during business hours on weekdays
    return getTimeBasedFlag(key, {
      days: [1, 2, 3, 4, 5], // Monday-Friday
      hours: [9, 10, 11, 12, 13, 14, 15, 16, 17], // 9 AM - 5 PM
    });
  },
});

// Example: Complex context-based evaluation
interface ComplexEntities {
  user?: { id: string; tier: string };
  request?: { country: string; userAgent: string; environment: string };
  session?: { id: string; duration: number };
}

const identifyComplexContext = dedupe(
  async ({
    cookies,
    headers,
  }: {
    cookies: ReadonlyRequestCookies;
    headers: Headers;
  }): Promise<ComplexEntities> => {
    const userContext = extractUserContext(cookies);
    const requestContext = extractRequestContext(headers);

    // Simulate user tier lookup (would be from database in real app)
    let userTier = 'free';
    if (userContext.userId.includes('pro')) userTier = 'pro';
    if (userContext.userId.includes('premium')) userTier = 'premium';

    return {
      user: {
        id: userContext.userId,
        tier: userTier,
      },
      request: {
        country: requestContext.country,
        userAgent: requestContext.userAgent,
        environment: requestContext.environment,
      },
      session: {
        id: userContext.sessionId,
        duration: Date.now() % 3600000, // Simulated session duration
      },
    };
  },
);

export const complexContextFlag = flag<'basic' | 'enhanced' | 'premium'>({
  key: 'complex-context-example',
  description: 'Demonstrates complex context-based evaluation',
  identify: identifyComplexContext,
  decide: ({ key, entities }) => {
    // Environment override check
    const envOverride = checkEnvironmentOverride(key);
    if (envOverride !== undefined) {
      return envOverride as 'basic' | 'enhanced' | 'premium';
    }

    // Premium tier gets premium features
    if (entities?.user?.tier === 'premium') return 'premium';

    // Pro tier gets enhanced features in specific regions
    if (
      entities?.user?.tier === 'pro' &&
      ['US', 'CA', 'GB'].includes(entities?.request?.country || '')
    ) {
      return 'enhanced';
    }

    // Long sessions get enhanced features (engagement boost)
    if ((entities?.session?.duration || 0) > 1800000) {
      // 30 minutes
      return 'enhanced';
    }

    // Default to basic
    return 'basic';
  },
  options: [
    { label: 'Basic Features', value: 'basic' },
    { label: 'Enhanced Features', value: 'enhanced' },
    { label: 'Premium Features', value: 'premium' },
  ],
});

// Example: Canary deployment flag
export const canaryDeploymentFlag = flag<boolean>({
  key: 'canary-deployment-example',
  description: 'Demonstrates canary deployment pattern',
  async identify({ cookies, headers }) {
    const userContext = extractUserContext(cookies);
    const requestContext = extractRequestContext(headers);
    return {
      user: { id: userContext.userId },
      deployment: {
        id: requestContext.deployment,
        environment: requestContext.environment,
      },
    };
  },
  decide: ({ key, entities }) => {
    // Never enable in production for regular deployments
    if (
      entities?.deployment?.environment === 'production' &&
      !entities?.deployment?.id?.includes('canary')
    ) {
      return false;
    }

    // Enable for canary deployments with gradual rollout
    if (entities?.deployment?.id?.includes('canary')) {
      const context = entities?.user?.id || 'anonymous';
      return getOfflineRolloutPercentage(key, context, 10); // 10% of canary traffic
    }

    // Enable for all non-production environments
    return entities?.deployment?.environment !== 'production';
  },
});

// Export utility functions for reuse
export {
  checkEnvironmentOverride,
  createDeterministicHash,
  extractRequestContext,
  extractUserContext,
  getOfflineRolloutPercentage,
  getOfflineVariant,
  getTimeBasedFlag,
};
