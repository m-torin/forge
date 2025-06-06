/**
 * Complete PostHog adapter example showing various flag types
 */
import { flag, dedupe } from '@vercel/flags/next';
import { postHogAdapter } from '@repo/feature-flags/server/next';
import type { ReadonlyRequestCookies } from '@vercel/flags';

// Define entities for type safety
interface Entities {
  user?: { id: string };
  team?: { id: string };
}

// Dedupe the identify function to prevent duplicate calls
const identify = dedupe(({ cookies }: { cookies: ReadonlyRequestCookies }): Entities => {
  const userId = cookies.get('user-id')?.value;
  const teamId = cookies.get('team-id')?.value;

  return {
    user: userId ? { id: userId } : undefined,
    team: teamId ? { id: teamId } : undefined,
  };
});

// Basic boolean feature flag
export const betaFeatureFlag = flag<boolean, Entities>({
  key: 'beta-feature',
  adapter: postHogAdapter.isFeatureEnabled(),
  identify,
  defaultValue: false,
});

// Multivariate A/B test flag
export const homepageVariantFlag = flag<string | boolean, Entities>({
  key: 'homepage-variant',
  adapter: postHogAdapter.featureFlagValue(),
  identify,
  defaultValue: 'control',
  options: [
    { value: 'control', label: 'Control' },
    { value: 'variant-a', label: 'Variant A' },
    { value: 'variant-b', label: 'Variant B' },
  ],
});

// Feature flag with JSON payload
interface ExperimentConfig {
  buttonColor: string;
  buttonText: string;
  showBadge: boolean;
}

export const experimentConfigFlag = flag<ExperimentConfig, Entities>({
  key: 'experiment-config',
  adapter: postHogAdapter.featureFlagPayload<ExperimentConfig>((payload) => {
    // Transform the payload if needed
    return {
      buttonColor: payload.buttonColor || '#0070f3',
      buttonText: payload.buttonText || 'Get Started',
      showBadge: payload.showBadge ?? false,
    };
  }),
  identify,
  defaultValue: {
    buttonColor: '#0070f3',
    buttonText: 'Get Started',
    showBadge: false,
  },
});

// Percentage rollout flag
export const newCheckoutFlag = flag<boolean, Entities>({
  key: 'new-checkout-flow',
  adapter: postHogAdapter.isFeatureEnabled(),
  identify,
  defaultValue: false,
});

// Team-based feature flag
export const teamFeatureFlag = flag<boolean, Entities>({
  key: 'team-collaboration-feature',
  adapter: postHogAdapter.isFeatureEnabled(),
  identify,
  defaultValue: false,
});

// Example usage in a Server Component
export default async function ExamplePage() {
  // Evaluate all flags
  const [betaFeature, homepageVariant, experimentConfig, newCheckout, teamFeature] =
    await Promise.all([
      betaFeatureFlag(),
      homepageVariantFlag(),
      experimentConfigFlag(),
      newCheckoutFlag(),
      teamFeatureFlag(),
    ]);

  return (
    <div>
      {/* Beta feature gating */}
      {betaFeature && <div>Beta feature is enabled!</div>}

      {/* A/B test variant */}
      {homepageVariant === 'variant-a' && <div>Welcome to Variant A!</div>}
      {homepageVariant === 'variant-b' && <div>Welcome to Variant B!</div>}

      {/* Using payload configuration */}
      <button style={{ backgroundColor: experimentConfig.buttonColor }}>
        {experimentConfig.buttonText}
        {experimentConfig.showBadge && <span>New!</span>}
      </button>

      {/* Percentage rollout */}
      {newCheckout ? <div>New checkout flow</div> : <div>Classic checkout flow</div>}

      {/* Team feature */}
      {teamFeature && <div>Team collaboration features enabled</div>}
    </div>
  );
}

// Example usage in a Client Component
('use client');

import { useFlag } from '@repo/feature-flags/client/next';

export function ClientExample() {
  const betaFeature = useFlag(betaFeatureFlag, false);
  const homepageVariant = useFlag(homepageVariantFlag, 'control');

  if (betaFeature === undefined || homepageVariant === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <p>Beta feature: {betaFeature ? 'On' : 'Off'}</p>
      <p>Homepage variant: {homepageVariant}</p>
    </div>
  );
}
