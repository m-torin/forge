/**
 * Feature flag integration helpers for Sentry Next.js
 */

/**
 * LaunchDarkly configuration options
 */
export interface LaunchDarklyConfig {
  clientId: string;
  options?: {
    streaming?: boolean;
    useReport?: boolean;
    evaluationReasons?: boolean;
    [key: string]: any;
  };
}

/**
 * Unleash configuration options
 */
export interface UnleashConfig {
  url: string;
  clientKey: string;
  appName: string;
  featureFlagClientClass?: any;
  options?: {
    refreshInterval?: number;
    disableMetrics?: boolean;
    [key: string]: any;
  };
}

/**
 * Custom feature flag provider configuration
 */
export interface CustomFeatureFlagConfig {
  integration: any;
  config?: Record<string, any>;
  setupCallback?: () => void | Promise<void>;
}

/**
 * Feature flag configuration
 */
export interface FeatureFlagConfig {
  provider: "launchdarkly" | "unleash" | "custom";
  launchDarkly?: LaunchDarklyConfig;
  unleash?: UnleashConfig;
  custom?: CustomFeatureFlagConfig;
}

/**
 * Build feature flag integration based on provider
 */
export async function buildFeatureFlagIntegration(
  config: FeatureFlagConfig,
  sentryClient: any,
): Promise<any[]> {
  const integrations: any[] = [];

  if (!sentryClient) return integrations;

  switch (config.provider) {
    case "launchdarkly":
      if (config.launchDarkly && sentryClient.launchDarklyIntegration) {
        integrations.push(sentryClient.launchDarklyIntegration());

        // Also add the feature flags integration for tracking
        if (sentryClient.featureFlagsIntegration) {
          integrations.push(sentryClient.featureFlagsIntegration());
        }
      }
      break;

    case "unleash":
      if (config.unleash && sentryClient.unleashIntegration) {
        const unleashOptions = config.unleash.featureFlagClientClass
          ? { featureFlagClientClass: config.unleash.featureFlagClientClass }
          : { unleashClientClass: config.unleash.featureFlagClientClass };

        integrations.push(sentryClient.unleashIntegration(unleashOptions));

        // Also add the feature flags integration for tracking
        if (sentryClient.featureFlagsIntegration) {
          integrations.push(sentryClient.featureFlagsIntegration());
        }
      }
      break;

    case "custom":
      if (config.custom?.integration) {
        integrations.push(config.custom.integration);

        // Run setup callback if provided
        if (config.custom.setupCallback) {
          await config.custom.setupCallback();
        }

        // Also add the feature flags integration for tracking
        if (sentryClient.featureFlagsIntegration) {
          integrations.push(sentryClient.featureFlagsIntegration());
        }
      }
      break;
  }

  return integrations;
}

/**
 * Helper to create LaunchDarkly client initialization code
 */
export function createLaunchDarklyInitCode(config: LaunchDarklyConfig): string {
  return `
// Initialize LaunchDarkly client
const ldClient = LaunchDarkly.initialize(
  '${config.clientId}',
  { kind: 'user', key: 'anonymous' },
  ${JSON.stringify(config.options || {}, null, 2)}
);

// Wait for client to be ready
await ldClient.waitForInitialization();
`;
}

/**
 * Helper to create Unleash client initialization code
 */
export function createUnleashInitCode(config: UnleashConfig): string {
  return `
// Initialize Unleash client
const unleash = new UnleashClient({
  url: '${config.url}',
  clientKey: '${config.clientKey}',
  appName: '${config.appName}',
  ${config.options ? `...${JSON.stringify(config.options, null, 2)}` : ""}
});

// Start the client
await unleash.start();
`;
}

/**
 * Detect installed feature flag packages
 */
export async function detectFeatureFlagPackages(): Promise<{
  launchDarkly: boolean;
  unleash: boolean;
}> {
  let launchDarkly = false;
  let unleash = false;

  // Skip dynamic imports in test environment
  if (typeof process !== "undefined" && process.env.NODE_ENV === "test") {
    return { launchDarkly: false, unleash: false };
  }

  try {
    // Check for LaunchDarkly - use string concatenation to avoid static analysis
    // @ts-ignore - Optional dependency
    const ldModule = "launchdarkly" + "-js-client-sdk";
    await import(/* @vite-ignore */ ldModule);
    launchDarkly = true;
  } catch (_) {
    // Not installed
  }

  try {
    // Check for Unleash - use string concatenation to avoid static analysis
    // @ts-ignore - Optional dependency
    const unleashModule = "unleash" + "-proxy-client";
    await import(/* @vite-ignore */ unleashModule);
    unleash = true;
  } catch (_) {
    // Not installed
  }

  return { launchDarkly, unleash };
}

/**
 * Get recommended feature flag configuration based on installed packages
 */
export async function getRecommendedFeatureFlagConfig(): Promise<Partial<FeatureFlagConfig> | null> {
  const detected = await detectFeatureFlagPackages();

  if (detected.launchDarkly) {
    return {
      provider: "launchdarkly",
      launchDarkly: {
        clientId: process.env.NEXT_PUBLIC_LAUNCHDARKLY_CLIENT_ID || "",
        options: {
          streaming: true,
          useReport: true,
        },
      },
    };
  }

  if (detected.unleash) {
    return {
      provider: "unleash",
      unleash: {
        url: process.env.NEXT_PUBLIC_UNLEASH_URL || "",
        clientKey: process.env.NEXT_PUBLIC_UNLEASH_CLIENT_KEY || "",
        appName: process.env.NEXT_PUBLIC_UNLEASH_APP_NAME || "nextjs-app",
      },
    };
  }

  return null;
}
