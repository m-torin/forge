/**
 * Common observability configurations and presets
 */

import { env } from '../../env';
import { createBetterStackPlugin } from '../plugins/betterstack';
import { env as betterStackEnv } from '../plugins/betterstack/env';
import { createConsolePlugin } from '../plugins/console';
import { createSentryPlugin } from '../plugins/sentry';
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
