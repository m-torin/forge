/**
 * Complete PostHog adapter example showing various flag types
 */
import { dedupe, flag } from '@vercel/flags/next';

import { useFlag } from '@repo/feature-flags/client/next';
import { postHogServerAdapter as postHogAdapter } from '@repo/feature-flags/server/next';

import type { ReadonlyRequestCookies } from '@vercel/flags';

// Define entities for type safety
interface Entities {
  team?: { id: string };
  user?: { id: string };
}

// Dedupe the identify function to prevent duplicate calls
const identify = dedupe(({ cookies }: { cookies: ReadonlyRequestCookies }): Entities => {
  const userId = cookies.get('user-id')?.value;
  const teamId = cookies.get('team-id')?.value;

  return {
    team: teamId ? { id: teamId } : undefined,
    user: userId ? { id: userId } : undefined,
  };
});

// Basic boolean feature flag
export const betaFeatureFlag = flag<boolean, Entities>({
  identify,
  adapter: postHogAdapter.isFeatureEnabled(),
  defaultValue: false,
  key: 'beta-feature',
});

// Multivariate A/B test flag
export const homepageVariantFlag = flag<string | boolean, Entities>({
  identify,
  adapter: postHogAdapter.featureFlagValue(),
  defaultValue: 'control',
  key: 'homepage-variant',
  options: [
    { label: 'Control', value: 'control' },
    { label: 'Variant A', value: 'variant-a' },
    { label: 'Variant B', value: 'variant-b' },
  ],
});

// Feature flag with JSON payload
interface ExperimentConfig {
  buttonColor: string;
  buttonText: string;
  showBadge: boolean;
}

export const experimentConfigFlag = flag<ExperimentConfig, Entities>({
  identify,
  adapter: postHogAdapter.featureFlagPayload<ExperimentConfig>(payload => {
    // Transform the payload if needed
    return {
      buttonColor: payload.buttonColor || '#0070f3',
      buttonText: payload.buttonText || 'Get Started',
      showBadge: payload.showBadge ?? false,
    };
  }),
  defaultValue: {
    buttonColor: '#0070f3',
    buttonText: 'Get Started',
    showBadge: false,
  },
  key: 'experiment-config',
});

// Percentage rollout flag
export const newCheckoutFlag = flag<boolean, Entities>({
  identify,
  adapter: postHogAdapter.isFeatureEnabled(),
  defaultValue: false,
  key: 'new-checkout-flow',
});

// Team-based feature flag
export const teamFeatureFlag = flag<boolean, Entities>({
  identify,
  adapter: postHogAdapter.isFeatureEnabled(),
  defaultValue: false,
  key: 'team-collaboration-feature',
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
void 'use client';

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
