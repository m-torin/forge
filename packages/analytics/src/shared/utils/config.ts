/**
 * Configuration utilities for the analytics system
 */

import type { AnalyticsConfig, ProviderConfig } from '../types/types';

export type ConfigRequirements = Record<string, string[]>;

export const PROVIDER_REQUIREMENTS: ConfigRequirements = {
  console: [], // No required fields
  posthog: ['apiKey'],
  segment: ['writeKey'],
  vercel: [], // No required fields
};

/**
 * Validates analytics configuration
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
 * Environment-based configuration builder
 */
export interface ConfigBuilder {
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
 * Environment-based configuration helpers
 */
export function getAnalyticsConfig(): AnalyticsConfig {
  const builder = createConfigBuilder();

  // Development - minimal providers
  if (process.env.NODE_ENV === 'development') {
    builder.addConsole({
      prefix: '[Dev Analytics]',
      pretty: true,
    });
    return builder.build();
  }

  // Staging - selective providers (check custom env var)
  if (process.env.APP_ENV === 'staging') {
    if (process.env.POSTHOG_API_KEY) {
      builder.addPostHog(process.env.POSTHOG_API_KEY);
    }

    builder.addConsole({
      prefix: '[Staging Analytics]',
      pretty: true,
    });

    return builder.build();
  }

  // Production - multiple providers
  if (process.env.SEGMENT_WRITE_KEY) {
    builder.addSegment(process.env.SEGMENT_WRITE_KEY);
  }

  if (process.env.POSTHOG_API_KEY) {
    builder.addPostHog(process.env.POSTHOG_API_KEY);
  }

  // Add Vercel Analytics in production
  builder.addVercel();

  return builder.build();
}

/**
 * Conditional provider inclusion based on feature flags
 */
async function _buildAnalyticsConfig(
  getFeatureFlag: (flag: string) => Promise<boolean>,
): Promise<AnalyticsConfig> {
  const builder = createConfigBuilder();

  // Always include core provider if available
  if (process.env.SEGMENT_WRITE_KEY) {
    builder.addSegment(process.env.SEGMENT_WRITE_KEY);
  }

  // Conditionally include based on feature flags
  if ((await getFeatureFlag('enable_posthog')) && process.env.POSTHOG_API_KEY) {
    builder.addPostHog(process.env.POSTHOG_API_KEY);
  }

  if (await getFeatureFlag('enable_vercel_analytics')) {
    builder.addVercel();
  }

  // Include console in development
  if (process.env.NODE_ENV === 'development') {
    builder.addConsole();
  }

  return builder.build();
}
