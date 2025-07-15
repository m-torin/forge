/**
 * Environment Configuration for @repo/observability
 *
 * Implements the SafeEnv pattern to prevent white screens from missing environment variables.
 * This file provides validated environment variables with graceful fallbacks.
 */

import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

// Direct export for Next.js webpack inlining
export const env = createEnv({
  /**
   * Server-side environment variables
   */
  server: {
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    NEXT_RUNTIME: z.enum(['nodejs', 'edge']).optional(),
    // Sentry
    SENTRY_DSN: z.string().url().optional(),
    SENTRY_AUTH_TOKEN: z.string().optional(),
    SENTRY_ORG: z.string().optional(),
    SENTRY_PROJECT: z.string().optional(),
    // OpenTelemetry
    OTEL_SERVICE_NAME: z.string().optional(),
    OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),
    OTEL_EXPORTER_OTLP_HEADERS: z.string().optional(),
    // Logtail
    LOGTAIL_SOURCE_TOKEN: z.string().optional(),
    // Grafana
    GRAFANA_CLOUD_TOKEN: z.string().optional(),
    GRAFANA_CLOUD_URL: z.string().url().optional(),
    // Winston
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'verbose']).default('info'),
    // Feature flags
    OBSERVABILITY_CONSOLE_ENABLED: z
      .string()
      .optional()
      .default('true')
      .transform(val => val === 'true'),
    OBSERVABILITY_SENTRY_ENABLED: z
      .string()
      .optional()
      .default('false')
      .transform(val => val === 'true'),
    OBSERVABILITY_OTEL_ENABLED: z
      .string()
      .optional()
      .default('false')
      .transform(val => val === 'true'),
    OBSERVABILITY_LOGTAIL_ENABLED: z
      .string()
      .optional()
      .default('false')
      .transform(val => val === 'true'),
    OBSERVABILITY_GRAFANA_ENABLED: z
      .string()
      .optional()
      .default('false')
      .transform(val => val === 'true'),
  },

  /**
   * Client-side environment variables
   * Schema for public variables exposed to the browser
   */
  client: {
    NEXT_PUBLIC_NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
    NEXT_PUBLIC_GRAFANA_CLIENT_KEY: z.string().optional(),
    NEXT_PUBLIC_LOGTAIL_CLIENT_TOKEN: z.string().optional(),
    NEXT_PUBLIC_ENABLE_CLIENT_LOGGING: z
      .string()
      .optional()
      .default('false')
      .transform(val => val === 'true'),
  },

  /**
   * Runtime environment variable mapping
   * For Next.js runtime, we need to destructure process.env
   */
  runtimeEnv: {
    // Server
    NODE_ENV: process.env.NODE_ENV,
    NEXT_RUNTIME: process.env.NEXT_RUNTIME,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    OTEL_SERVICE_NAME: process.env.OTEL_SERVICE_NAME,
    OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    OTEL_EXPORTER_OTLP_HEADERS: process.env.OTEL_EXPORTER_OTLP_HEADERS,
    LOGTAIL_SOURCE_TOKEN: process.env.LOGTAIL_SOURCE_TOKEN,
    GRAFANA_CLOUD_TOKEN: process.env.GRAFANA_CLOUD_TOKEN,
    GRAFANA_CLOUD_URL: process.env.GRAFANA_CLOUD_URL,
    LOG_LEVEL: process.env.LOG_LEVEL,
    OBSERVABILITY_CONSOLE_ENABLED: process.env.OBSERVABILITY_CONSOLE_ENABLED,
    OBSERVABILITY_SENTRY_ENABLED: process.env.OBSERVABILITY_SENTRY_ENABLED,
    OBSERVABILITY_OTEL_ENABLED: process.env.OBSERVABILITY_OTEL_ENABLED,
    OBSERVABILITY_LOGTAIL_ENABLED: process.env.OBSERVABILITY_LOGTAIL_ENABLED,
    OBSERVABILITY_GRAFANA_ENABLED: process.env.OBSERVABILITY_GRAFANA_ENABLED,
    // Client
    NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV || process.env.NODE_ENV,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_GRAFANA_CLIENT_KEY: process.env.NEXT_PUBLIC_GRAFANA_CLIENT_KEY,
    NEXT_PUBLIC_LOGTAIL_CLIENT_TOKEN: process.env.NEXT_PUBLIC_LOGTAIL_CLIENT_TOKEN,
    NEXT_PUBLIC_ENABLE_CLIENT_LOGGING: process.env.NEXT_PUBLIC_ENABLE_CLIENT_LOGGING,
  },

  /**
   * Skip validation in specific environments
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Called when validation fails
   */
  onValidationError: (_error: any) => {
    // Don't throw in packages - use fallbacks for resilience
    // Silently handle validation errors to prevent crashes
    return undefined as never;
  },

  /**
   * Called when accessing a server-side env var on the client
   */
  onInvalidAccess: variable => {
    // Silently handle invalid access to prevent crashes
    throw new Error(`Cannot access server-side environment variable '${variable}' on the client`);
  },
});

// Type definitions for better IDE support
type ServerEnvironmentVariables = {
  NODE_ENV: 'development' | 'production' | 'test';
  NEXT_RUNTIME?: 'nodejs' | 'edge';
  SENTRY_DSN?: string;
  SENTRY_AUTH_TOKEN?: string;
  SENTRY_ORG?: string;
  SENTRY_PROJECT?: string;
  OTEL_SERVICE_NAME?: string;
  OTEL_EXPORTER_OTLP_ENDPOINT?: string;
  OTEL_EXPORTER_OTLP_HEADERS?: string;
  LOGTAIL_SOURCE_TOKEN?: string;
  GRAFANA_CLOUD_TOKEN?: string;
  GRAFANA_CLOUD_URL?: string;
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug' | 'verbose';
  OBSERVABILITY_CONSOLE_ENABLED: boolean;
  OBSERVABILITY_SENTRY_ENABLED: boolean;
  OBSERVABILITY_OTEL_ENABLED: boolean;
  OBSERVABILITY_LOGTAIL_ENABLED: boolean;
  OBSERVABILITY_GRAFANA_ENABLED: boolean;
};

type ClientEnvironmentVariables = {
  NEXT_PUBLIC_NODE_ENV: 'development' | 'production' | 'test';
  NEXT_PUBLIC_SENTRY_DSN?: string;
  NEXT_PUBLIC_GRAFANA_CLIENT_KEY?: string;
  NEXT_PUBLIC_LOGTAIL_CLIENT_TOKEN?: string;
  NEXT_PUBLIC_ENABLE_CLIENT_LOGGING: boolean;
};

type _EnvironmentVariables = ServerEnvironmentVariables & ClientEnvironmentVariables;

// Helper for non-Next.js contexts (Node.js, workers, tests)
export function safeEnv() {
  if (env) return env;

  // Fallback values for resilience
  return {
    // Server variables
    NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
    NEXT_RUNTIME: process.env.NEXT_RUNTIME as 'nodejs' | 'edge' | undefined,
    SENTRY_DSN: process.env.SENTRY_DSN || '',
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN || '',
    SENTRY_ORG: process.env.SENTRY_ORG || '',
    SENTRY_PROJECT: process.env.SENTRY_PROJECT || '',
    OTEL_SERVICE_NAME: process.env.OTEL_SERVICE_NAME || '',
    OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || '',
    OTEL_EXPORTER_OTLP_HEADERS: process.env.OTEL_EXPORTER_OTLP_HEADERS || '',
    LOGTAIL_SOURCE_TOKEN: process.env.LOGTAIL_SOURCE_TOKEN || '',
    GRAFANA_CLOUD_TOKEN: process.env.GRAFANA_CLOUD_TOKEN || '',
    GRAFANA_CLOUD_URL: process.env.GRAFANA_CLOUD_URL || '',
    LOG_LEVEL: (process.env.LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug' | 'verbose') || 'info',
    OBSERVABILITY_CONSOLE_ENABLED: process.env.OBSERVABILITY_CONSOLE_ENABLED !== 'false',
    OBSERVABILITY_SENTRY_ENABLED: process.env.OBSERVABILITY_SENTRY_ENABLED === 'true',
    OBSERVABILITY_OTEL_ENABLED: process.env.OBSERVABILITY_OTEL_ENABLED === 'true',
    OBSERVABILITY_LOGTAIL_ENABLED: process.env.OBSERVABILITY_LOGTAIL_ENABLED === 'true',
    OBSERVABILITY_GRAFANA_ENABLED: process.env.OBSERVABILITY_GRAFANA_ENABLED === 'true',

    // Client variables
    NEXT_PUBLIC_NODE_ENV:
      (process.env.NEXT_PUBLIC_NODE_ENV as 'development' | 'production' | 'test') ||
      (process.env.NODE_ENV as 'development' | 'production' | 'test') ||
      'development',
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
    NEXT_PUBLIC_GRAFANA_CLIENT_KEY: process.env.NEXT_PUBLIC_GRAFANA_CLIENT_KEY || '',
    NEXT_PUBLIC_LOGTAIL_CLIENT_TOKEN: process.env.NEXT_PUBLIC_LOGTAIL_CLIENT_TOKEN || '',
    NEXT_PUBLIC_ENABLE_CLIENT_LOGGING: process.env.NEXT_PUBLIC_ENABLE_CLIENT_LOGGING === 'true',
  };
}

// Export type for better DX
export type Env = typeof env;

/**
 * Helper function to get raw environment variables (for special cases)
 * Prefer using safeEnv() functions for type safety
 */
export function getRawEnv(): Record<string, string | undefined> {
  return typeof process !== 'undefined' ? process.env : {};
}

/**
 * Environment detection helpers
 */
export function isProduction(): boolean {
  const envVars = safeEnv();
  return envVars.NODE_ENV === 'production';
}

export function isDevelopment(): boolean {
  const envVars = safeEnv();
  return envVars.NODE_ENV === 'development';
}

export function isTest(): boolean {
  const envVars = safeEnv();
  return envVars.NODE_ENV === 'test';
}

export function isEdgeRuntime(): boolean {
  const envVars = safeEnv();
  return envVars.NEXT_RUNTIME === 'edge';
}

export function isNodeRuntime(): boolean {
  const envVars = safeEnv();
  return envVars.NEXT_RUNTIME === 'nodejs' || !envVars.NEXT_RUNTIME;
}

/**
 * Check if we're in Vercel environment
 */
export function isVercelEnvironment(): boolean {
  const env = getRawEnv();
  return Boolean(env.VERCEL_ENV);
}

/**
 * Build-time environment detection
 */
export function isBuildEnvironment(): boolean {
  const raw = getRawEnv();
  return raw.CI === 'true' || raw.VERCEL === '1' || raw.BUILDING_CONTAINER === 'true';
}

/**
 * Feature flag helpers
 */
export function isConsoleEnabled(): boolean {
  const envVars = safeEnv();
  return envVars.OBSERVABILITY_CONSOLE_ENABLED;
}

export function isSentryEnabled(): boolean {
  const envVars = safeEnv();
  return envVars.OBSERVABILITY_SENTRY_ENABLED;
}

export function isOtelEnabled(): boolean {
  const envVars = safeEnv();
  return envVars.OBSERVABILITY_OTEL_ENABLED;
}

export function isLogtailEnabled(): boolean {
  const envVars = safeEnv();
  return envVars.OBSERVABILITY_LOGTAIL_ENABLED;
}

export function isGrafanaEnabled(): boolean {
  const envVars = safeEnv();
  return envVars.OBSERVABILITY_GRAFANA_ENABLED;
}

/**
 * Configuration presence helpers
 */
export function hasSentryConfig(): boolean {
  const envVars = safeEnv();
  return Boolean(envVars.SENTRY_DSN && envVars.SENTRY_AUTH_TOKEN);
}

export function hasLogtailConfig(): boolean {
  const envVars = safeEnv();
  return Boolean(envVars.LOGTAIL_SOURCE_TOKEN);
}

export function hasGrafanaConfig(): boolean {
  const envVars = safeEnv();
  return Boolean(envVars.GRAFANA_CLOUD_TOKEN && envVars.GRAFANA_CLOUD_URL);
}

export function hasOtelConfig(): boolean {
  const envVars = safeEnv();
  return Boolean(envVars.OTEL_SERVICE_NAME && envVars.OTEL_EXPORTER_OTLP_ENDPOINT);
}

// Backward compatibility removed - use safeEnv() instead
