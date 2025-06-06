import { flag } from '@vercel/flags/next';
import { createEdgeConfigAdapter } from '@repo/feature-flags/server/next';
import { createClient } from '@vercel/edge-config';

/**
 * Custom Edge Config adapter examples
 */

// Example 1: Custom Edge Config with different item key
const customAdapter = createEdgeConfigAdapter({
  connectionString: process.env.OTHER_EDGE_CONFIG,
  options: {
    edgeConfigItemKey: 'feature-flags', // Uses 'feature-flags' instead of 'flags'
    teamSlug: 'my-team', // For Vercel dashboard links
  },
});

export const customFlag = flag({
  key: 'custom-feature',
  adapter: customAdapter(),
  description: 'Flag from custom Edge Config',
});

// Example 2: Using a pre-configured Edge Config client
const myEdgeConfigClient = createClient(process.env.MY_EDGE_CONFIG!);

const clientAdapter = createEdgeConfigAdapter({
  connectionString: myEdgeConfigClient,
  options: {
    edgeConfigItemKey: 'app-flags',
  },
});

export const appFlag = flag({
  key: 'app-feature',
  adapter: clientAdapter(),
  description: 'Flag using custom Edge Config client',
});

// Example 3: Multiple Edge Configs for different environments
const stagingAdapter = createEdgeConfigAdapter({
  connectionString: process.env.STAGING_EDGE_CONFIG,
  options: {
    edgeConfigItemKey: 'staging-flags',
    teamSlug: 'my-team',
  },
});

const productionAdapter = createEdgeConfigAdapter({
  connectionString: process.env.PRODUCTION_EDGE_CONFIG,
  options: {
    edgeConfigItemKey: 'production-flags',
    teamSlug: 'my-team',
  },
});

// Use different adapters based on environment
const environmentAdapter =
  process.env.NODE_ENV === 'production' ? productionAdapter : stagingAdapter;

export const environmentFlag = flag({
  key: 'environment-feature',
  adapter: environmentAdapter(),
  description: 'Flag that uses different Edge Config based on environment',
});

// Example 4: Typed Edge Config flags
interface EdgeConfigFlags {
  'beta-feature': boolean;
  'experiment-variant': 'control' | 'test-a' | 'test-b';
  'rollout-percentage': number;
  'feature-settings': {
    maxItems: number;
    enableCache: boolean;
    regions: string[];
  };
}

// Type-safe flag definitions
export const betaFeature = flag<EdgeConfigFlags['beta-feature']>({
  key: 'beta-feature',
  adapter: edgeConfigAdapter(),
});

export const experimentVariant = flag<EdgeConfigFlags['experiment-variant']>({
  key: 'experiment-variant',
  adapter: edgeConfigAdapter(),
  defaultValue: 'control',
});

export const featureSettings = flag<EdgeConfigFlags['feature-settings']>({
  key: 'feature-settings',
  adapter: edgeConfigAdapter(),
  defaultValue: {
    maxItems: 10,
    enableCache: false,
    regions: ['us-east-1'],
  },
});
