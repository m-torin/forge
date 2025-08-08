/**
 * Next.js-specific Sentry plugin exports
 * Provides enhanced Next.js integration on top of @sentry/nextjs
 */

// Re-export core Sentry functions from @sentry/nextjs for convenience
export {
  addBreadcrumb,
  addIntegration,
  captureEvent,
  captureException,
  captureMessage,
  captureRequestError,
  captureRouterTransitionStart,
  getActiveSpan,
  getClient,
  getCurrentScope,
  init,
  // Keep lazyLoadIntegration from Sentry
  lazyLoadIntegration,
  setContext,
  setExtra,
  setExtras,
  setTag,
  setTags,
  setUser,
  startSpan,
  withScope,
  withServerActionInstrumentation,
  wrapGetInitialPropsWithSentry,
  // Next.js specific functions
  wrapGetServerSidePropsWithSentry,
  wrapGetStaticPropsWithSentry,
} from '@sentry/nextjs';

// Export plugin and factory
export { SentryNextJSPlugin, createSentryNextJSPlugin } from './plugin';
export type { SentryNextJSPluginConfig } from './plugin';

// Export environment configuration
export { env, safeEnv } from './env';
export type { Env } from './env';

// Export build configuration utilities
export { withObservabilitySentry } from './build-config';
export type { ObservabilitySentryBuildOptions } from './build-config';

// Next.js wrappers are already exported above

// Export instrumentation utilities
export {
  createClientInstrumentation,
  createEdgeInstrumentation,
  createInstrumentation,
  createServerInstrumentation,
} from './instrumentation';

// Export error boundary components
export { ErrorBoundary } from './components/ErrorBoundary';
export type { ErrorBoundaryProps } from './components/ErrorBoundary';
export { default as ErrorPage, SimpleErrorPage } from './components/ErrorPage';
export type { ErrorPageProps } from './components/ErrorPage';
export { default as GlobalError } from './components/GlobalError';
export type { GlobalErrorProps } from './components/GlobalError';

// Export types
export type { ObservabilityPlugin, ObservabilityServerPlugin } from '../../core/plugin';

// Export integrations
export * from './integrations/app-router';
export * from './integrations/custom';
export * from './integrations/feature-flags';
export * from './integrations/profiling';
export * from './integrations/session-replay';

// Export edge runtime utilities
export * from './edge';

// Export types and utilities
export * from './debug';
export * from './lazy-loading';
export * from './types';
export * from './utils/migration';

// Export tracing utilities
export * from './distributed-tracing';
export * from './tracing-helpers';
export * from './web-vitals';
