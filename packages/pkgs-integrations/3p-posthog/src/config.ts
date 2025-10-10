/**
 * PostHog configuration utilities
 */

import type { PostHogConfig } from './types';

export function createPostHogConfig(
  apiKey: string,
  overrides: Partial<PostHogConfig> = {},
): PostHogConfig {
  return {
    provider: 'posthog',
    apiKey,
    host: 'https://app.posthog.com',
    ui_host: 'https://app.posthog.com',
    endpoint: 'https://app.posthog.com',
    flushInterval: 10000,
    batchSize: 100,
    debug: false,
    disabled: false,

    // PostHog defaults
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,
    cross_subdomain_cookie: false,
    persistence: 'cookie',
    respect_dnt: true,
    save_referrer: true,
    secure_cookie: false,

    // Session recording defaults
    session_recording: {
      recordHeaders: false,
      recordBody: false,
      maskAllInputs: true,
      blockClass: 'ph-no-capture',
      ignoreClass: 'ph-ignore-input',
      maskTextClass: 'ph-mask',
    },

    ...overrides,
  };
}

export function getPostHogEnvironmentConfig(): {
  apiKey?: string;
  host?: string;
  personalApiKey?: string;
  projectId?: string;
  isPostHogCloud: boolean;
  region?: 'us' | 'eu';
} {
  if (typeof process === 'undefined') {
    return {
      isPostHogCloud: true,
    };
  }

  const env = process.env;
  const host = env.POSTHOG_HOST || env.NEXT_PUBLIC_POSTHOG_HOST;

  return {
    apiKey: env.POSTHOG_KEY || env.NEXT_PUBLIC_POSTHOG_KEY,
    host,
    personalApiKey: env.POSTHOG_PERSONAL_API_KEY,
    projectId: env.POSTHOG_PROJECT_ID,
    isPostHogCloud: !host || host.includes('posthog.com'),
    region: host?.includes('.eu.') ? 'eu' : 'us',
  };
}

export function validatePostHogConfig(config: PostHogConfig): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (config.provider !== 'posthog') {
    errors.push('Provider must be "posthog"');
  }

  if (!config.apiKey) {
    errors.push('API key is required');
  } else {
    // Validate API key format
    if (config.apiKey.startsWith('phc_')) {
      // Client-side key format
      if (config.apiKey.length < 43) {
        warnings.push('API key appears to be too short for a PostHog client key');
      }
    } else {
      warnings.push('API key should start with "phc_" for client-side usage');
    }
  }

  if (config.host && !config.host.startsWith('http')) {
    errors.push('Host must be a valid URL starting with http:// or https://');
  }

  if (config.batchSize && (config.batchSize < 1 || config.batchSize > 1000)) {
    errors.push('Batch size must be between 1 and 1000');
  }

  if (config.flushInterval && config.flushInterval < 1000) {
    errors.push('Flush interval must be at least 1000ms');
  }

  if (
    config.persistence &&
    !['localStorage', 'cookie', 'memory', 'sessionStorage'].includes(config.persistence)
  ) {
    errors.push('Persistence must be one of: localStorage, cookie, memory, sessionStorage');
  }

  // Validate session recording config
  if (config.session_recording) {
    const recording = config.session_recording;
    if (recording.recordBody && recording.maskAllInputs === false) {
      warnings.push('Recording body content without masking inputs may capture sensitive data');
    }
  }

  // Server-side validation
  if (config.personalApiKey && !config.projectId) {
    warnings.push('Project ID is recommended when using personal API key');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function createServerConfig(
  apiKey: string,
  personalApiKey?: string,
  overrides: Partial<PostHogConfig> = {},
): PostHogConfig {
  return createPostHogConfig(apiKey, {
    ...overrides,
    personalApiKey,
    // Server-side optimized defaults
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    session_recording: undefined,
    flushAt: 20,
    flushInterval: 10000,
    requestTimeout: 30000,
  });
}

export function createClientConfig(
  apiKey: string,
  overrides: Partial<PostHogConfig> = {},
): PostHogConfig {
  return createPostHogConfig(apiKey, {
    ...overrides,
    // Client-side optimized defaults
    autocapture: true,
    capture_pageview: true,
    session_recording: {
      recordHeaders: false,
      recordBody: false,
      maskAllInputs: true,
      blockClass: 'ph-no-capture',
      ignoreClass: 'ph-ignore-input',
    },
  });
}
