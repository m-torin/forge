/**
 * Example showing standard Vercel Flags SDK API usage
 * Following the official documentation
 */
import { flag } from '@vercel/flags/next';

// Basic flag with all standard properties
export const showSummerSale = flag<boolean>({
  key: 'summer-sale',
  async decide() {
    // Your logic here - could check user, time, random percentage, etc.
    return false;
  },
  origin: 'https://example.com/flags/summer-sale/',
  description: 'Show Summer Holiday Sale Banner, 20% off',
  defaultValue: false,
  options: [
    // Customize labels for boolean values
    { value: false, label: 'Hide' },
    { value: true, label: 'Show' },
  ],
});

// Flag with evaluation context using identify
interface Entities {
  user?: { id: string; plan?: string };
}

export const premiumFeature = flag<boolean, Entities>({
  key: 'premium-feature',
  identify({ cookies }) {
    // Extract user context from cookies
    const userId = cookies.get('user-id')?.value;
    const userPlan = cookies.get('user-plan')?.value;
    return {
      user: userId ? { id: userId, plan: userPlan } : undefined,
    };
  },
  async decide({ entities }) {
    // Use entities in decision logic
    if (!entities?.user) return false;
    return entities.user.plan === 'premium' || entities.user.plan === 'enterprise';
  },
  defaultValue: false,
  description: 'Enable premium features for paid users',
});

// Multivariate flag with string options
export const homepageVariant = flag<string>({
  key: 'homepage-variant',
  async decide() {
    // Could use random selection, user cohorts, etc.
    const random = Math.random();
    if (random < 0.33) return 'control';
    if (random < 0.66) return 'variant-a';
    return 'variant-b';
  },
  defaultValue: 'control',
  options: [
    { value: 'control', label: 'Control' },
    { value: 'variant-a', label: 'Variant A - New Hero' },
    { value: 'variant-b', label: 'Variant B - Video Background' },
  ],
  description: 'Homepage A/B test variants',
});

// Complex object flag
interface FeatureConfig {
  enabled: boolean;
  maxItems: number;
  regions: string[];
}

export const featureConfig = flag<FeatureConfig>({
  key: 'feature-config',
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
});

// Using with an adapter (e.g., PostHog)
import { postHogAdapter } from '@repo/feature-flags/server/next';

export const adapterFlag = flag({
  key: 'posthog-feature',
  adapter: postHogAdapter.isFeatureEnabled(),
  // identify is passed to the adapter
  identify({ cookies }) {
    const userId = cookies.get('user-id')?.value;
    return { user: userId ? { id: userId } : undefined };
  },
  description: 'Feature flag powered by PostHog',
});
