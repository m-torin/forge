/**
 * Example showing standard Vercel Flags SDK API usage
 * Following the official documentation
 */
import { flag } from '@vercel/flags/next';

// Using with an adapter (e.g., PostHog)
import { postHogServerAdapter as postHogAdapter } from '@repo/feature-flags/server/next';

// Basic flag with all standard properties
export const showSummerSale = flag<boolean>({
  async decide() {
    // Your logic here - could check user, time, random percentage, etc.
    return false;
  },
  defaultValue: false,
  description: 'Show Summer Holiday Sale Banner, 20% off',
  key: 'summer-sale',
  options: [
    // Customize labels for boolean values
    { label: 'Hide', value: false },
    { label: 'Show', value: true },
  ],
  origin: 'https://example.com/flags/summer-sale/',
});

// Flag with evaluation context using identify
interface Entities {
  user?: { id: string; plan?: string };
}

export const premiumFeature = flag<boolean, Entities>({
  async decide({ entities }) {
    // Use entities in decision logic
    if (!entities?.user) return false;
    return entities.user.plan === 'premium' || entities.user.plan === 'enterprise';
  },
  identify({ cookies }) {
    // Extract user context from cookies
    const userId = cookies.get('user-id')?.value;
    const userPlan = cookies.get('user-plan')?.value;
    return {
      user: userId ? { id: userId, plan: userPlan } : undefined,
    };
  },
  defaultValue: false,
  description: 'Enable premium features for paid users',
  key: 'premium-feature',
});

// Multivariate flag with string options
export const homepageVariant = flag<string>({
  async decide() {
    // Could use random selection, user cohorts, etc.
    const random = Math.random();
    if (random < 0.33) return 'control';
    if (random < 0.66) return 'variant-a';
    return 'variant-b';
  },
  defaultValue: 'control',
  description: 'Homepage A/B test variants',
  key: 'homepage-variant',
  options: [
    { label: 'Control', value: 'control' },
    { label: 'Variant A - New Hero', value: 'variant-a' },
    { label: 'Variant B - Video Background', value: 'variant-b' },
  ],
});

// Complex object flag
interface FeatureConfig {
  enabled: boolean;
  maxItems: number;
  regions: string[];
}

export const featureConfig = flag<FeatureConfig>({
  async decide() {
    // Could fetch from database, API, etc.
    return {
      enabled: true,
      maxItems: 100,
      regions: ['us-east', 'eu-west'],
    };
  },
  defaultValue: {
    enabled: false,
    maxItems: 10,
    regions: ['us-east'],
  },
  description: 'Complex feature configuration object',
  key: 'feature-config',
});

export const adapterFlag = flag({
  // identify is passed to the adapter
  identify({ cookies }) {
    const userId = cookies.get('user-id')?.value;
    return { user: userId ? { id: userId } : undefined };
  },
  adapter: postHogAdapter.isFeatureEnabled(),
  description: 'Feature flag powered by PostHog',
  key: 'posthog-feature',
});
