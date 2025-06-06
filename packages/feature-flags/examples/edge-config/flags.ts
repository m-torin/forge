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
  key: 'example-flag',
  adapter: edgeConfigAdapter(),
  description: 'Simple boolean flag from Edge Config',
});

// Multivariate flag
export const homepageVariant = flag<string>({
  key: 'homepage-variant',
  adapter: edgeConfigAdapter(),
  defaultValue: 'control',
  options: [
    { value: 'control', label: 'Control' },
    { value: 'variant-a', label: 'Variant A' },
    { value: 'variant-b', label: 'Variant B' },
  ],
  description: 'Homepage A/B test variant',
});

// Percentage rollout flag (stored as number 0-1)
export const featureRollout = flag<number>({
  key: 'feature-rollout',
  adapter: edgeConfigAdapter(),
  defaultValue: 0,
  description: 'Percentage rollout for new feature',
});

// Complex configuration flag
interface FeatureConfig {
  enabled: boolean;
  maxUsers: number;
  allowedRegions: string[];
}

export const featureConfig = flag<FeatureConfig>({
  key: 'feature-config',
  adapter: edgeConfigAdapter(),
  defaultValue: {
    enabled: false,
    maxUsers: 100,
    allowedRegions: ['us-east-1'],
  },
  description: 'Complex feature configuration',
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