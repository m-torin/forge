/**
 * Vercel Analytics configuration utilities
 * Based on official @vercel/analytics package patterns
 */

import type { AnalyticsProps, BeforeSendEvent, VercelConfig } from './types';

export function createVercelConfig(overrides: Partial<VercelConfig> = {}): VercelConfig {
  return {
    provider: 'vercel',
    debug: false,
    disabled: false,
    mode: 'auto',
    ...overrides,
  };
}

// Create configuration for Analytics component
export function createAnalyticsConfig(options: Partial<AnalyticsProps> = {}): AnalyticsProps {
  return {
    debug: false,
    mode: 'auto',
    ...options,
  };
}

export function getVercelEnvironmentConfig(): {
  isVercelEnvironment: boolean;
  isProduction: boolean;
  analyticsId?: string;
  region?: string;
} {
  if (typeof process === 'undefined') {
    return {
      isVercelEnvironment: false,
      isProduction: false,
    };
  }

  const env = process.env;

  return {
    isVercelEnvironment: !!env.VERCEL,
    isProduction: env.VERCEL_ENV === 'production',
    analyticsId: env.VERCEL_ANALYTICS_ID,
    region: env.VERCEL_REGION,
  };
}

export function validateVercelConfig(config: VercelConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (config.provider !== 'vercel') {
    errors.push('Provider must be "vercel"');
  }

  if (config.mode && !['auto', 'production', 'development'].includes(config.mode)) {
    errors.push('Mode must be "auto", "production", or "development"');
  }

  if (config.endpoint && !config.endpoint.startsWith('https://')) {
    errors.push('Endpoint must be a valid HTTPS URL');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Utility functions for creating beforeSend handlers
export function createPrivacyHandler(storageKey: string = 'va-disable') {
  return (event: BeforeSendEvent) => {
    if (typeof window !== 'undefined' && localStorage.getItem(storageKey)) {
      return null;
    }
    return event;
  };
}

export function createRouteExclusionHandler(patterns: (string | RegExp)[]) {
  return (event: BeforeSendEvent) => {
    for (const pattern of patterns) {
      if (typeof pattern === 'string' && event.url.includes(pattern)) {
        return null;
      }
      if (pattern instanceof RegExp && pattern.test(event.url)) {
        return null;
      }
    }
    return event;
  };
}

export function createQueryParamHandler(paramsToRemove: string[]) {
  return (event: BeforeSendEvent) => {
    try {
      const url = new URL(event.url);
      paramsToRemove.forEach(param => url.searchParams.delete(param));
      return { ...event, url: url.toString() };
    } catch {
      return event;
    }
  };
}
