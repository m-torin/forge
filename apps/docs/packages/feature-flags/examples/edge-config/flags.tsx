import { flag } from '@vercel/flags/next';

import { edgeConfigAdapter } from '@repo/feature-flags/server/next';

/**
 * Basic Edge Config flag example
 *
 * This expects your Edge Config to have a structure like:
 * {
 *   "flags": {
 *     "example-flag": true,
 *     "homepage-variant": "control",
 *     "feature-rollout": 0.5
 *   }
 * }
 */

// Simple boolean flag
export const exampleFlag = flag({
  adapter: edgeConfigAdapter(),
  description: 'Simple boolean flag from Edge Config',
  key: 'example-flag',
});

// Multivariate flag
export const homepageVariant = flag<string>({
  adapter: edgeConfigAdapter(),
  defaultValue: 'control',
  description: 'Homepage A/B test variant',
  key: 'homepage-variant',
  options: [
    { label: 'Control', value: 'control' },
    { label: 'Variant A', value: 'variant-a' },
    { label: 'Variant B', value: 'variant-b' },
  ],
});

// Percentage rollout flag (stored as number 0-1)
export const featureRollout = flag<number>({
  adapter: edgeConfigAdapter(),
  defaultValue: 0,
  description: 'Percentage rollout for new feature',
  key: 'feature-rollout',
});

// Complex configuration flag
interface FeatureConfig {
  allowedRegions: string[];
  enabled: boolean;
  maxUsers: number;
}

export const featureConfig = flag<FeatureConfig>({
  adapter: edgeConfigAdapter(),
  defaultValue: {
    allowedRegions: ['us-east-1'],
    enabled: false,
    maxUsers: 100,
  },
  description: 'Complex feature configuration',
  key: 'feature-config',
});

// Example usage in a component
export async function EdgeConfigExample() {
  const [isEnabled, variant, rollout, config] = await Promise.all([
    exampleFlag(),
    homepageVariant(),
    featureRollout(),
    featureConfig(),
  ]);

  return (
    <div>
      <h2>Edge Config Flags</h2>
      <ul>
        <li>Example Flag: {isEnabled ? 'Enabled' : 'Disabled'}</li>
        <li>Homepage Variant: {variant}</li>
        <li>Feature Rollout: {(rollout * 100).toFixed(0)}%</li>
        <li>Feature Config: {JSON.stringify(config)}</li>
      </ul>
    </div>
  );
}
