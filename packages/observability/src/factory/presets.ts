/**
 * Common observability configurations and presets
 */

import { env } from '../../env';
import { createBetterStackPlugin } from '../plugins/betterstack';
import { env as betterStackEnv } from '../plugins/betterstack/env';
import { createConsolePlugin } from '../plugins/console';
import { createSentryPlugin } from '../plugins/sentry';
import type { ZoneConfig } from '../plugins/sentry-microfrontend';
import { createSentryMicroFrontendPlugin } from '../plugins/sentry-microfrontend';
import { env as sentryEnv } from '../plugins/sentry/env';
import { ObservabilityBuilder } from './builder';

/**
 * Development preset with console logging
 */
export async function createDevelopmentObservability(): Promise<ObservabilityBuilder> {
  const builder = ObservabilityBuilder.create();

  // Always add console in development
  if (env.NEXT_PUBLIC_NODE_ENV === 'development') {
    builder.withPlugin(createConsolePlugin());
  }

  return builder;
}

/**
 * Production preset with error tracking
 */
export async function createProductionObservability(): Promise<ObservabilityBuilder> {
  const builder = ObservabilityBuilder.create();

  // Add Sentry if DSN is configured
  if (sentryEnv.SENTRY_DSN || sentryEnv.NEXT_PUBLIC_SENTRY_DSN) {
    builder.withPlugin(createSentryPlugin());
  }

  // Add Better Stack if token is configured
  const hasToken =
    betterStackEnv.BETTER_STACK_SOURCE_TOKEN ||
    betterStackEnv.BETTERSTACK_SOURCE_TOKEN ||
    betterStackEnv.LOGTAIL_SOURCE_TOKEN;

  if (hasToken) {
    builder.withPlugin(createBetterStackPlugin());
  }

  return builder;
}

/**
 * Create observability based on environment
 */
export async function createAutoConfiguredObservability(): Promise<ObservabilityBuilder> {
  if (env.NEXT_PUBLIC_NODE_ENV === 'production') {
    return createProductionObservability();
  } else {
    return createDevelopmentObservability();
  }
}

/**
 * Backstage micro frontend host preset
 * Used by the main backstage app that handles routing
 */
export function createBackstageHostPreset(zones: ZoneConfig[]): ObservabilityBuilder {
  const builder = ObservabilityBuilder.create();

  // Add console in development
  const isDevelopment = env.NEXT_PUBLIC_NODE_ENV === 'development';
  if (isDevelopment) {
    builder.withPlugin(
      createConsolePlugin({
        prefix: '[Backstage Host]',
      }),
    );
  }

  // Add Sentry micro frontend plugin in host mode
  const dsn = sentryEnv.SENTRY_DSN || sentryEnv.NEXT_PUBLIC_SENTRY_DSN;
  if (dsn) {
    builder.withPlugin(
      createSentryMicroFrontendPlugin({
        isHost: true,
        zones,
        dsn,
        useMultiplexedTransport: true,
        addZoneContext: true,
        globalTags: {
          app: 'backstage-host',
        },
      }),
    );
  }

  return builder;
}

/**
 * Backstage micro frontend preset
 * Used by individual micro frontend apps (cms, workflows, authmgmt)
 */
export function createBackstageMicroFrontendPreset(zone: string): ObservabilityBuilder {
  const builder = ObservabilityBuilder.create();

  // Add console in development
  const isDevelopment = env.NEXT_PUBLIC_NODE_ENV === 'development';
  if (isDevelopment) {
    builder.withPlugin(
      createConsolePlugin({
        prefix: `[Backstage ${zone}]`,
      }),
    );
  }

  // Add Sentry micro frontend plugin
  const dsn = sentryEnv.SENTRY_DSN || sentryEnv.NEXT_PUBLIC_SENTRY_DSN;
  if (dsn) {
    builder.withPlugin(
      createSentryMicroFrontendPlugin({
        zone,
        dsn,
        detectParent: true,
        addZoneContext: true,
        globalTags: {
          app: `backstage-${zone}`,
        },
      }),
    );
  }

  // Add Better Stack if configured
  const betterStackToken =
    betterStackEnv.BETTER_STACK_SOURCE_TOKEN ||
    betterStackEnv.BETTERSTACK_SOURCE_TOKEN ||
    betterStackEnv.LOGTAIL_SOURCE_TOKEN;

  if (betterStackToken) {
    builder.withPlugin(
      createBetterStackPlugin({
        sourceToken: betterStackToken,
      }),
    );
  }

  return builder;
}

/**
 * Default zone configurations for backstage
 */
export const defaultBackstageZones: ZoneConfig[] = [
  {
    name: 'cms',
    // DSN can be overridden by environment variables
    dsn: process.env.SENTRY_DSN_CMS || process.env.SENTRY_DSN,
    pathPatterns: ['/cms'],
    tags: {
      service: 'backstage-cms',
    },
  },
  {
    name: 'workflows',
    dsn: process.env.SENTRY_DSN_WORKFLOWS || process.env.SENTRY_DSN,
    pathPatterns: ['/workflows'],
    tags: {
      service: 'backstage-workflows',
    },
  },
  {
    name: 'authmgmt',
    dsn: process.env.SENTRY_DSN_AUTHMGMT || process.env.SENTRY_DSN,
    pathPatterns: ['/authmgmt'],
    tags: {
      service: 'backstage-authmgmt',
    },
  },
];
