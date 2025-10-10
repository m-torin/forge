/**
 * Client-safe configuration utilities for the analytics system
 * This file contains only configuration functions that are safe to use in browser environments
 */

import type { AnalyticsConfig, ProviderConfig } from '../types/types';

type ConfigRequirements = Record<string, string[]>;

export const PROVIDER_REQUIREMENTS: ConfigRequirements = {
  console: [], // No required fields
  posthog: ['apiKey'],
  segment: ['writeKey'],
  vercel: [], // No required fields
};

/**
 * Validates analytics configuration (client-safe version)
 */
export function validateConfig(config: AnalyticsConfig): void {
  if (!config.providers || typeof config.providers !== 'object') {
    throw new Error('Analytics config must have a providers object');
  }

  for (const [providerName, providerConfig] of Object.entries(config.providers)) {
    validateProviderConfig(providerName, providerConfig);
  }
}

/**
 * Validates a single provider configuration
 */
function validateProviderConfig(providerName: string, config: ProviderConfig): void {
  const requiredFields = PROVIDER_REQUIREMENTS[providerName] || [];

  for (const field of requiredFields) {
    if (!config[field as keyof ProviderConfig]) {
      throw new Error(
        `Provider '${providerName}' missing required field '${field}'. ` +
          `Remove the provider from config or provide the required field.`,
      );
    }
  }
}

/**
 * Configuration builder (client-safe version)
 */
interface ConfigBuilder {
  addConsole(options?: any): ConfigBuilder;
  addPostHog(apiKey: string, options?: any): ConfigBuilder;
  addProvider(name: string, config: ProviderConfig): ConfigBuilder;
  addSegment(writeKey: string, options?: any): ConfigBuilder;
  addVercel(options?: any): ConfigBuilder;
  build(): AnalyticsConfig;
  providers: Record<string, ProviderConfig>;
}

export function createConfigBuilder(): ConfigBuilder {
  const builder: ConfigBuilder = {
    providers: {},

    addProvider(name: string, config: ProviderConfig): ConfigBuilder {
      this.providers[name] = config;
      return this;
    },

    addSegment(writeKey: string, options?: any): ConfigBuilder {
      return this.addProvider('segment', { options, writeKey });
    },

    addPostHog(apiKey: string, options?: any): ConfigBuilder {
      return this.addProvider('posthog', { apiKey, options });
    },

    addVercel(options?: any): ConfigBuilder {
      return this.addProvider('vercel', { options });
    },

    addConsole(options?: any): ConfigBuilder {
      return this.addProvider('console', { options });
    },

    build(): AnalyticsConfig {
      const config = { providers: { ...this.providers } };
      validateConfig(config);
      return config;
    },
  };

  return builder;
}

/**
 * Client-safe configuration helper
 * Instead of using process.env, this accepts configuration from the app
 */
export function getAnalyticsConfig(options?: {
  isDevelopment?: boolean;
  isStaging?: boolean;
  segmentWriteKey?: string;
  posthogApiKey?: string;
}): AnalyticsConfig {
  const builder = createConfigBuilder();

  // Development - minimal providers
  if (options?.isDevelopment) {
    builder.addConsole({
      prefix: '[Dev Analytics]',
      pretty: true,
    });
    return builder.build();
  }

  // Staging - selective providers
  if (options?.isStaging) {
    if (options.posthogApiKey) {
      builder.addPostHog(options.posthogApiKey);
    }

    builder.addConsole({
      prefix: '[Staging Analytics]',
      pretty: true,
    });

    return builder.build();
  }

  // Production - multiple providers
  if (options?.segmentWriteKey) {
    builder.addSegment(options.segmentWriteKey);
  }

  if (options?.posthogApiKey) {
    builder.addPostHog(options.posthogApiKey);
  }

  // Add Vercel Analytics in production
  builder.addVercel();

  return builder.build();
}

/**
 * Conditional provider inclusion based on feature flags (client-safe version)
 */
async function _buildAnalyticsConfig(
  getFeatureFlag: (flag: string) => Promise<boolean>,
  options?: {
    segmentWriteKey?: string;
    posthogApiKey?: string;
    isDevelopment?: boolean;
  },
): Promise<AnalyticsConfig> {
  const builder = createConfigBuilder();

  // Always include core provider if available
  if (options?.segmentWriteKey) {
    builder.addSegment(options.segmentWriteKey);
  }

  // Conditionally include based on feature flags
  if ((await getFeatureFlag('enable_posthog')) && options?.posthogApiKey) {
    builder.addPostHog(options.posthogApiKey);
  }

  if (await getFeatureFlag('enable_vercel_analytics')) {
    builder.addVercel();
  }

  // Include console in development
  if (options?.isDevelopment) {
    builder.addConsole();
  }

  return builder.build();
}
