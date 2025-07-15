import { flag } from 'flags/next';
import { edgeConfigAdapter } from '../adapters/edge-config';
import { postHogServerAdapter } from '../adapters/posthog-server';
import { identify } from '../shared/identify';

// Simple feature toggle
export const newDashboardFlag = flag<boolean>({
  key: 'new-dashboard',
  description: 'Enable the redesigned dashboard interface',
  identify,
  adapter: postHogServerAdapter.isFeatureEnabled(),
});

// A/B test for button color
export const ctaButtonColorFlag = flag<'blue' | 'green' | 'red'>({
  key: 'cta-button-color',
  description: 'A/B test for call-to-action button color',
  identify,
  adapter: {
    decide: async context => {
      const result = await postHogServerAdapter.featureFlagValue().decide(context);
      // Ensure we return a valid variant
      if (result === 'green' || result === 'red') return result;
      return 'blue'; // Default fallback
    },
    config: { reportValue: true },
    origin: { provider: 'posthog-variant' },
  },
  defaultValue: 'blue',
  options: [
    { label: 'Blue (Control)', value: 'blue' },
    { label: 'Green (Variant A)', value: 'green' },
    { label: 'Red (Variant B)', value: 'red' },
  ],
});

// Kill switch with fallback chain
export const maintenanceModeFlag = flag<boolean>({
  key: 'maintenance-mode',
  description: 'Emergency maintenance mode kill switch',
  identify,
  adapter: {
    decide: async context => {
      // Try PostHog first, fallback to Edge Config for reliability
      try {
        return await postHogServerAdapter.isFeatureEnabled().decide(context);
      } catch {
        return (await edgeConfigAdapter().decide(context)) ?? false;
      }
    },
    config: { reportValue: true },
    origin: { provider: 'hybrid' },
  },
});

// Feature flag with conditional logic
export const premiumFeatureFlag = flag<boolean>({
  key: 'premium-features',
  description: 'Enable premium features for qualifying users',
  identify,
  adapter: {
    decide: async ({ entities }) => {
      const context = entities as any;

      // Always enabled for premium users
      if (context.tier === 'premium') return true;

      // Check PostHog for pro users
      if (context.tier === 'pro') {
        try {
          // For simplified example, just return a static value
          // In real usage, you'd pass the full context with headers/cookies
          return false; // Conservative fallback for demo
        } catch {
          return false; // Conservative fallback for pro users
        }
      }

      // Disabled for free users
      return false;
    },
    config: { reportValue: true },
    origin: { provider: 'conditional' },
  },
});

// Time-based feature flag
export const holidayThemeFlag = flag<boolean>({
  key: 'holiday-theme',
  description: 'Enable holiday theme during December',
  identify,
  adapter: {
    decide: async context => {
      const currentMonth = new Date().getMonth();
      const isDecember = currentMonth === 11; // December is month 11

      if (!isDecember) return false;

      // During December, check PostHog for gradual rollout
      try {
        return await postHogServerAdapter.isFeatureEnabled().decide(context);
      } catch {
        return true; // Default to enabled during holidays if PostHog fails
      }
    },
    config: { reportValue: true },
    origin: { provider: 'time-based' },
  },
});

// Percentage-based rollout
export const betaFeaturesFlag = flag<boolean>({
  key: 'beta-features',
  description: 'Beta features for testing (gradual rollout)',
  identify,
  adapter: {
    decide: async context => {
      const entities = context.entities as any;
      const userId = entities?.userId || 'anonymous';

      // Always enabled for specific test users
      const testUsers = ['test-user-1', 'test-user-2', 'admin-user'];
      if (testUsers.includes(userId)) return true;

      // Use PostHog for percentage rollout
      try {
        return await postHogServerAdapter.isFeatureEnabled().decide(context);
      } catch {
        // Fallback: simple hash-based percentage
        const hash = userId
          .split('')
          .reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        return hash % 100 < 10; // 10% rollout
      }
    },
    config: { reportValue: true },
    origin: { provider: 'percentage-rollout' },
  },
});
