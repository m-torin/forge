/**
 * Centralized environment utilities
 * Single source of truth for environment detection and configuration
 */

import type { Environment } from './types';

/**
 * Environment-specific configurations
 */
export const ENV_CONFIGS = {
  development: {
    cacheEnabled: false,
    defaultTimeout: 30000,
    enableDebugging: true,
    enableDevLogs: true,
    maxRetries: 5,
    strictMode: false,
  },
  production: {
    cacheEnabled: true,
    defaultTimeout: 60000,
    enableDebugging: false,
    enableDevLogs: false,
    maxRetries: 3,
    strictMode: true,
  },
  test: {
    cacheEnabled: false,
    defaultTimeout: 5000,
    enableDebugging: true,
    enableDevLogs: false,
    maxRetries: 1,
    strictMode: true,
  },
} as const;

/**
 * Get the current environment
 */
export function getEnvironment(): Environment {
  return (process.env.NODE_ENV as Environment) || 'development';
}

/**
 * Check if running in development environment
 * Also checks for local QStash URLs indicating local development
 */
export function isDevelopment(): boolean {
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // Check for local QStash URLs
  const qstashUrl = process.env.QSTASH_URL;
  if (qstashUrl) {
    return (
      qstashUrl.includes('localhost') ||
      qstashUrl.includes('127.0.0.1') ||
      qstashUrl.includes('host.docker.internal')
    );
  }

  return false;
}

/**
 * Check if running in production environment
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production' && !isDevelopment();
}

/**
 * Check if running in test environment
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}

/**
 * Get environment-specific configuration
 */
export function getEnvConfig<
  K extends keyof typeof ENV_CONFIGS = 'development',
>(): (typeof ENV_CONFIGS)[K] {
  const env = getEnvironment();
  return (ENV_CONFIGS[env] || ENV_CONFIGS.development) as (typeof ENV_CONFIGS)[K];
}

/**
 * Check if a feature is enabled for the current environment
 */
export function isFeatureEnabled(feature: keyof typeof ENV_CONFIGS.development): boolean {
  const config = getEnvConfig();
  return Boolean(config[feature]);
}

/**
 * Check if running with local QStash
 */
export function isLocalQStash(): boolean {
  const qstashUrl = process.env.QSTASH_URL;
  return !!(
    qstashUrl &&
    (qstashUrl.includes('127.0.0.1') ||
      qstashUrl.includes('localhost') ||
      qstashUrl.includes('host.docker.internal'))
  );
}

/**
 * Get environment variable with fallback
 */
export function getEnvVar(key: string, fallback?: string): string | undefined {
  return process.env[key] || fallback;
}

/**
 * Get required environment variable
 * Throws error if not found in production
 */
export function getRequiredEnvVar(key: string): string {
  const value = process.env[key];

  if (!value && isProduction()) {
    throw new Error(`Required environment variable ${key} is not set`);
  }

  return value || '';
}

/**
 * Get numeric environment variable
 */
export function getNumericEnvVar(key: string, fallback: number): number {
  const value = process.env[key];

  if (!value) {
    return fallback;
  }

  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Get boolean environment variable
 */
export function getBooleanEnvVar(key: string, fallback = false): boolean {
  const value = process.env[key];

  if (!value) {
    return fallback;
  }

  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Environment-aware logger
 * Only logs in development or when explicitly enabled
 */
export function envLog(message: string, data?: any): void {
  if (isFeatureEnabled('enableDevLogs')) {
    console.log(`[${getEnvironment()}] ${message}`, data || '');
  }
}

/**
 * Get API base URL based on environment
 */
export function getApiBaseUrl(): string {
  if (isDevelopment()) {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  }

  return process.env.NEXT_PUBLIC_API_URL || '';
}

/**
 * Get timeout value based on environment
 */
export function getDefaultTimeout(): number {
  return getEnvConfig().defaultTimeout;
}

/**
 * Get max retries based on environment
 */
export function getDefaultMaxRetries(): number {
  return getEnvConfig().maxRetries;
}

/**
 * Check if strict mode is enabled
 */
export function isStrictMode(): boolean {
  return getEnvConfig().strictMode;
}

/**
 * Check if caching is enabled
 */
export function isCacheEnabled(): boolean {
  return getEnvConfig().cacheEnabled;
}

/**
 * Export all environment utilities for convenience
 */
export const env = {
  apiUrl: getApiBaseUrl,
  boolean: getBooleanEnvVar,
  cacheEnabled: isCacheEnabled,
  config: getEnvConfig,
  get: getEnvironment,
  isDev: isDevelopment,
  isFeatureEnabled,
  isLocalQStash,
  isProd: isProduction,
  isTest,
  log: envLog,
  maxRetries: getDefaultMaxRetries,
  numeric: getNumericEnvVar,
  required: getRequiredEnvVar,
  strictMode: isStrictMode,
  timeout: getDefaultTimeout,
  var: getEnvVar,
} as const;
