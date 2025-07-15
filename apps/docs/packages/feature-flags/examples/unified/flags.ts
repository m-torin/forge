import {
  createBooleanFlag,
  createRolloutFlag,
  createVariantFlag,
  createVercelFlag,
} from '@repo/feature-flags';
import { edgeConfigAdapter, postHogServerAdapter } from '@repo/feature-flags/server/next';

// Example 1: Simple boolean flag with transparent fallback
export const newFeatureFlag = createBooleanFlag('new-feature', {
  description: 'Enable new dashboard feature',
  primaryAdapter: () => postHogServerAdapter.isFeatureEnabled(),
  secondaryAdapter: () => edgeConfigAdapter(),
  percentage: 50, // 50% offline rollout
});

// Example 2: A/B test variant flag
export const heroTestFlag = createVariantFlag(
  'hero-test',
  [
    { label: 'Control', value: 'control' },
    { label: 'Variant A', value: 'variant-a' },
    { label: 'Variant B', value: 'variant-b' },
  ],
  {
    description: 'Hero section A/B test',
    primaryAdapter: () => postHogServerAdapter.featureFlagValue(),
    secondaryAdapter: () => edgeConfigAdapter(),
  },
);

// Example 3: Gradual rollout flag
export const betaFeatureFlag = createRolloutFlag('beta-feature', 25, {
  description: 'Beta features with 25% rollout',
  primaryAdapter: () => postHogServerAdapter.isFeatureEnabled(),
  secondaryAdapter: () => edgeConfigAdapter(),
});

// Example 4: Complex flag with custom fallback logic
export const premiumFeatureFlag = createVercelFlag<boolean>({
  key: 'premium-feature',
  description: 'Premium tier features',
  adapters: {
    primary: () => postHogServerAdapter.isFeatureEnabled(),
    secondary: () => edgeConfigAdapter(),
    offline: {
      type: 'custom',
      customLogic: context => {
        // Premium users always get access
        if (context.user.tier === 'premium') return true;

        // Pro users in certain regions
        if (context.user.tier === 'pro' && ['US', 'CA', 'GB'].includes(context.request.country)) {
          return true;
        }

        // Long-term users (heuristic based on session)
        if (
          context.user.sessionId.startsWith('session-') &&
          parseInt(context.user.sessionId.split('-')[1], 36) < Date.now() - 86400000
        ) {
          return true;
        }

        return false;
      },
    },
  },
  options: [
    { label: 'Enabled', value: true },
    { label: 'Disabled', value: false },
  ],
});

// Example 5: Time-based maintenance flag
export const maintenanceModeFlag = createVercelFlag<boolean>({
  key: 'maintenance-mode',
  description: 'Maintenance mode scheduling',
  adapters: {
    primary: () => edgeConfigAdapter(),
    offline: {
      type: 'time-based',
      schedule: {
        // Maintenance every Sunday 2-4 AM UTC
        days: [0], // Sunday
        hours: [2, 3], // 2-4 AM
      },
    },
  },
});

// Example 6: Multi-tier configuration flag
interface FeatureTier {
  analytics: boolean;
  exports: boolean;
  aiInsights: boolean;
  customIntegrations: boolean;
}

export const featureTierFlag = createVercelFlag<FeatureTier>({
  key: 'feature-tier',
  description: 'Feature availability by tier',
  adapters: {
    primary: () =>
      postHogServerAdapter.featureFlagPayload((payload: any) => payload as FeatureTier),
    secondary: () => edgeConfigAdapter(),
    offline: {
      type: 'custom',
      customLogic: context => {
        switch (context.user.tier) {
          case 'premium':
            return {
              analytics: true,
              exports: true,
              aiInsights: true,
              customIntegrations: true,
            };
          case 'pro':
            return {
              analytics: true,
              exports: true,
              aiInsights: false,
              customIntegrations: false,
            };
          default:
            return {
              analytics: true,
              exports: false,
              aiInsights: false,
              customIntegrations: false,
            };
        }
      },
    },
  },
  defaultValue: {
    analytics: true,
    exports: false,
    aiInsights: false,
    customIntegrations: false,
  },
});

// Example 7: Regional feature flag
export const regionalFeatureFlag = createVercelFlag<boolean>({
  key: 'regional-feature',
  description: 'Feature available in specific regions',
  adapters: {
    primary: () => postHogServerAdapter.isFeatureEnabled(),
    secondary: () => edgeConfigAdapter(),
    offline: {
      type: 'custom',
      customLogic: context => {
        // Enable for EU and North America
        const allowedRegions = ['US', 'CA', 'GB', 'DE', 'FR', 'NL', 'BE'];
        return allowedRegions.includes(context.request.country);
      },
    },
  },
});

// Example 8: Environment-based feature flag
export const devToolsFlag = createVercelFlag<boolean>({
  key: 'dev-tools',
  description: 'Development tools visibility',
  adapters: {
    offline: {
      type: 'custom',
      customLogic: context => {
        // Always show in development
        if (context.request.environment === 'development') return true;

        // Show in staging for internal users
        if (context.request.environment === 'staging' && context.user.id.includes('@company.com'))
          return true;

        // Never show in production
        return false;
      },
    },
  },
});

// Export array for batch evaluation
export const unifiedFlags = [
  newFeatureFlag,
  heroTestFlag,
  betaFeatureFlag,
  premiumFeatureFlag,
  maintenanceModeFlag,
  featureTierFlag,
  regionalFeatureFlag,
  devToolsFlag,
] as const;
