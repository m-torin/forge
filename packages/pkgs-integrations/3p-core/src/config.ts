/**
 * Configuration utilities for 3rd party analytics integrations
 */

import type {
  BaseProviderConfig,
  BatchingConfig,
  PrivacyConfig,
  ProviderType,
  RetryConfig,
} from './types';

export const DEFAULT_BATCHING_CONFIG: BatchingConfig = {
  enabled: true,
  flushInterval: 10000, // 10 seconds
  batchSize: 100,
  maxQueueSize: 1000,
};

export const DEFAULT_PRIVACY_CONFIG: PrivacyConfig = {
  anonymizeIp: true,
  respectDoNotTrack: true,
  gdprCompliant: true,
  ccpaCompliant: true,
  cookieConsent: true,
};

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2,
  maxRetryDelay: 30000,
};

export class ProviderConfigBuilder {
  private config: Partial<BaseProviderConfig> = {};

  static create(provider: ProviderType): ProviderConfigBuilder {
    return new ProviderConfigBuilder().setProvider(provider);
  }

  setProvider(provider: ProviderType): this {
    this.config.provider = provider;
    return this;
  }

  setApiKey(apiKey: string): this {
    this.config.apiKey = apiKey;
    return this;
  }

  setApiSecret(apiSecret: string): this {
    this.config.apiSecret = apiSecret;
    return this;
  }

  setEndpoint(endpoint: string): this {
    this.config.endpoint = endpoint;
    return this;
  }

  setDebug(debug: boolean): this {
    this.config.debug = debug;
    return this;
  }

  setDisabled(disabled: boolean): this {
    this.config.disabled = disabled;
    return this;
  }

  setFlushInterval(flushInterval: number): this {
    this.config.flushInterval = flushInterval;
    return this;
  }

  setBatchSize(batchSize: number): this {
    this.config.batchSize = batchSize;
    return this;
  }

  build(): BaseProviderConfig {
    if (!this.config.provider) {
      throw new Error('Provider type is required');
    }

    return {
      ...this.getDefaultsForProvider(this.config.provider),
      ...this.config,
    } as BaseProviderConfig;
  }

  private getDefaultsForProvider(provider: ProviderType): Partial<BaseProviderConfig> {
    const defaults: Record<ProviderType, Partial<BaseProviderConfig>> = {
      posthog: {
        endpoint: 'https://app.posthog.com',
        flushInterval: 10000,
        batchSize: 100,
        debug: false,
      },
      segment: {
        endpoint: 'https://api.segment.io',
        flushInterval: 10000,
        batchSize: 100,
        debug: false,
      },
      vercel: {
        endpoint: 'https://vitals.vercel-analytics.com',
        flushInterval: 5000,
        batchSize: 50,
        debug: false,
      },
      ga4: {
        endpoint: 'https://www.google-analytics.com',
        flushInterval: 2000,
        batchSize: 25,
        debug: false,
      },
      mixpanel: {
        endpoint: 'https://api.mixpanel.com',
        flushInterval: 10000,
        batchSize: 50,
        debug: false,
      },
      amplitude: {
        endpoint: 'https://api2.amplitude.com',
        flushInterval: 30000,
        batchSize: 100,
        debug: false,
      },
      plausible: {
        endpoint: 'https://plausible.io',
        flushInterval: 5000,
        batchSize: 1, // Plausible processes events individually
        debug: false,
      },
    };

    return defaults[provider] || {};
  }
}

export function createProviderConfig(
  provider: ProviderType,
  overrides: Partial<BaseProviderConfig> = {},
): BaseProviderConfig {
  return ProviderConfigBuilder.create(provider).build();
}

export function getEnvironmentConfig(): {
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
  debugMode: boolean;
} {
  const env = typeof process !== 'undefined' ? process.env.NODE_ENV : 'development';

  return {
    isDevelopment: env === 'development',
    isProduction: env === 'production',
    isTest: env === 'test',
    debugMode: env === 'development' || process.env.ANALYTICS_DEBUG === 'true',
  };
}

export function validateProviderConfig(config: BaseProviderConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.provider) {
    errors.push('Provider type is required');
  }

  if (config.flushInterval && config.flushInterval < 1000) {
    errors.push('Flush interval must be at least 1000ms');
  }

  if (config.batchSize && config.batchSize < 1) {
    errors.push('Batch size must be at least 1');
  }

  if (config.batchSize && config.batchSize > 1000) {
    errors.push('Batch size should not exceed 1000');
  }

  // Provider-specific validations
  switch (config.provider) {
    case 'posthog':
    case 'segment':
    case 'mixpanel':
    case 'amplitude':
      if (!config.apiKey) {
        errors.push(`${config.provider} requires an API key`);
      }
      break;
    case 'ga4':
      if (!config.apiKey) {
        errors.push('GA4 requires a measurement ID');
      }
      break;
    case 'vercel':
      // Vercel Analytics works without explicit API key in Vercel environment
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
