/**
 * Migration utilities for moving from @sentry/nextjs to observability plugin
 */

import type { SentryNextJSPluginConfig } from "../plugin";

/**
 * Migration options
 */
export interface MigrationOptions {
  /**
   * Path to existing sentry config files
   */
  configPaths?: {
    client?: string;
    server?: string;
    edge?: string;
  };

  /**
   * Whether to preserve custom integrations
   * @default true
   */
  preserveCustomIntegrations?: boolean;

  /**
   * Whether to migrate environment variables
   * @default true
   */
  migrateEnvVars?: boolean;

  /**
   * Custom transformation function
   */
  transform?: (config: any) => any;
}

/**
 * Convert vanilla Sentry config to observability plugin config
 */
export function migrateConfig(vanillaConfig: any): SentryNextJSPluginConfig {
  const pluginConfig: SentryNextJSPluginConfig = {
    // Copy basic configuration
    dsn: vanillaConfig.dsn,
    environment: vanillaConfig.environment,
    release: vanillaConfig.release,
    // Note: dist is not directly supported in current config
    // dist: vanillaConfig.dist,
    debug: vanillaConfig.debug,
    enabled: vanillaConfig.enabled ?? true,

    // Sample rates
    tracesSampleRate: vanillaConfig.tracesSampleRate,
    replaysSessionSampleRate: vanillaConfig.replaysSessionSampleRate,
    replaysOnErrorSampleRate: vanillaConfig.replaysOnErrorSampleRate,
    profilesSampleRate: vanillaConfig.profilesSampleRate,

    // Server options
    sendDefaultPii: vanillaConfig.sendDefaultPii,
    // Note: serverName is not directly supported in current config
    // serverName: vanillaConfig.serverName,
    attachStacktrace: vanillaConfig.attachStacktrace,

    // Integrations (will be processed separately)
    integrations: [],

    // Process hooks
    beforeSend: vanillaConfig.beforeSend,
    beforeBreadcrumb: vanillaConfig.beforeBreadcrumb,
  };

  // Process integrations
  if (vanillaConfig.integrations) {
    const integrations =
      typeof vanillaConfig.integrations === "function"
        ? vanillaConfig.integrations([])
        : vanillaConfig.integrations;

    for (const integration of integrations) {
      const migrated = migrateIntegration(integration, pluginConfig);
      if (migrated) {
        if (pluginConfig.integrations) {
          pluginConfig.integrations.push(migrated);
        }
      }
    }
  }

  // Process experiments
  if (vanillaConfig._experiments) {
    if (vanillaConfig._experiments.enableLogs) {
      pluginConfig.enableLogs = true;
    }
  }

  // Process trace propagation targets
  if (vanillaConfig.tracePropagationTargets) {
    pluginConfig.tracePropagationTargets =
      vanillaConfig.tracePropagationTargets;
  }

  return pluginConfig;
}

/**
 * Migrate individual integration
 */
function migrateIntegration(
  integration: any,
  config: SentryNextJSPluginConfig,
): any | null {
  const name = integration.name;

  switch (name) {
    case "BrowserTracing":
      config.enableTracing = true;
      return null; // Will be added by plugin

    case "Replay":
      config.enableReplay = true;
      // Extract replay options if available
      if (integration._options) {
        config.replayOptions = integration._options;
      }
      return null; // Will be added by plugin

    case "ReplayCanvas":
      config.enableCanvasRecording = true;
      if (integration._options) {
        config.canvasRecordingOptions = integration._options;
      }
      return null; // Will be added by plugin

    case "Feedback":
      config.enableFeedback = true;
      if (integration._options) {
        config.feedbackOptions = integration._options;
      }
      return null; // Will be added by plugin

    case "ProfilingIntegration":
    case "Profiling":
      config.enableProfiling = true;
      return null; // Will be added by plugin

    case "HttpClient":
      config.enableHttpClient = true;
      return null;

    case "ContextLines":
      config.enableContextLines = true;
      return null;

    case "ReportingObserver":
      config.enableReportingObserver = true;
      return null;

    case "CaptureConsole":
      config.enableCaptureConsole = true;
      if (integration._options) {
        config.captureConsoleOptions = integration._options;
      }
      return null;

    case "ExtraErrorData":
      config.enableExtraErrorData = true;
      if (integration._options) {
        config.extraErrorDataOptions = integration._options;
      }
      return null;

    case "RewriteFrames":
      config.enableRewriteFrames = true;
      if (integration._options) {
        config.rewriteFramesOptions = integration._options;
      }
      return null;

    case "SessionTiming":
      config.enableSessionTiming = true;
      return null;

    case "Debug":
      config.enableDebug = true;
      if (integration._options) {
        config.debugOptions = integration._options;
      }
      return null;

    case "LaunchDarkly":
      if (!config.featureFlags) {
        config.featureFlags = { provider: "launchdarkly" };
      }
      return null;

    case "Unleash":
      if (!config.featureFlags) {
        config.featureFlags = { provider: "unleash" };
      }
      return null;

    default:
      // Keep custom integrations
      return integration;
  }
}

/**
 * Generate migration code
 */
export function generateMigrationCode(options: MigrationOptions = {}): string {
  return `/**
 * Migration from @sentry/nextjs to @repo/observability
 * Generated by migration utility
 */

// Step 1: Update imports
// Old:
// import * as Sentry from '@sentry/nextjs';
// New:
import { createSentryNextJSPlugin } from '@repo/observability/plugins/sentry-nextjs';

// Step 2: Update configuration files

// === Client Configuration (sentry.client.config.ts) ===
// Old:
/*
Sentry.init({
  dsn: '...',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
*/

// New:
const sentryPlugin = createSentryNextJSPlugin({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enableTracing: true,
  enableReplay: true,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// === Server Configuration (sentry.server.config.ts) ===
// Old:
/*
Sentry.init({
  dsn: '...',
  integrations: [
    Sentry.profilesIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});
*/

// New:
const sentryPlugin = createSentryNextJSPlugin({
  dsn: process.env.SENTRY_DSN,
  enableProfiling: true,
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

// === Edge Configuration (sentry.edge.config.ts) ===
// Use edge-optimized configuration:
import { createEdgeOptimizedConfig } from '@repo/observability/plugins/sentry-nextjs/edge';

const edgeConfig = createEdgeOptimizedConfig({
  dsn: process.env.SENTRY_DSN,
}, {
  minimalMode: true,
  maxEventSize: 100000,
});

// Step 3: Update next.config.js
// Old:
/*
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(nextConfig, {
  org: "...",
  project: "...",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  hideSourceMaps: true,
});
*/

// New:
import { withObservabilitySentry } from '@repo/observability/plugins/sentry-nextjs';

module.exports = withObservabilitySentry(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  hideSourceMaps: true,
});

// Step 4: Update environment variables
// Add to .env.local:
/*
# Client-side
NEXT_PUBLIC_SENTRY_DSN=...
NEXT_PUBLIC_SENTRY_ENVIRONMENT=...

# Server-side
SENTRY_DSN=...
SENTRY_ENVIRONMENT=...
SENTRY_ORG=...
SENTRY_PROJECT=...
SENTRY_AUTH_TOKEN=...

# Optional feature flags
NEXT_PUBLIC_SENTRY_ENABLE_REPLAY=true
NEXT_PUBLIC_SENTRY_ENABLE_TRACING=true
SENTRY_ENABLE_PROFILING=true
*/

// Step 5: Update instrumentation.ts
// Use the instrumentation generator:
import { createInstrumentation } from '@repo/observability/plugins/sentry-nextjs';

export const register = createInstrumentation({
  productionOnly: true,
  enableAppRouterMetadata: true,
  featureFlags: {
    provider: 'launchdarkly', // or 'unleash'
  },
});

// Step 6: Update error boundaries
// Old:
/*
import * as Sentry from '@sentry/nextjs';

export default function ErrorPage({ error }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  // ...
}
*/

// New:
import { ErrorBoundary } from '@repo/observability/plugins/sentry-nextjs';

export default function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary
      fallback={(error, reset) => <CustomErrorUI error={error} reset={reset} />}
      showDialog={true}
    >
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}

// Step 7: Leverage new features
// - Feature flag integration
// - Enhanced session replay with privacy controls
// - Custom integrations
// - Edge runtime optimization
// - Performance budgets
// - Debug tools

${
  options.preserveCustomIntegrations
    ? `
// Custom integrations are preserved and can be added:
sentryPlugin.initialize({
  integrations: [
    ...yourCustomIntegrations,
  ],
});
`
    : ""
}

${
  options.migrateEnvVars
    ? `
// Environment variables mapping:
// NEXT_PUBLIC_SENTRY_DSN → stays the same
// SENTRY_DSN → stays the same
// SENTRY_ORG → stays the same
// SENTRY_PROJECT → stays the same
// SENTRY_AUTH_TOKEN → stays the same
// NEW: SENTRY_ENABLE_PROFILING=true
// NEW: NEXT_PUBLIC_SENTRY_ENABLE_REPLAY=true
// NEW: NEXT_PUBLIC_SENTRY_ENABLE_CANVAS_RECORDING=true
`
    : ""
}
`;
}

/**
 * Check compatibility issues
 */
export function checkCompatibility(config: any): {
  compatible: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check for deprecated options
  if ("sentry" in config) {
    issues.push('The "sentry" property in next.config.js is deprecated');
    recommendations.push(
      "Move Sentry options to withObservabilitySentry() second parameter",
    );
  }

  // Check for old integration syntax
  if (config.integrations?.some((i: any) => typeof i === "function")) {
    issues.push("Function-based integration syntax detected");
    recommendations.push("Use new integration configuration options");
  }

  // Check for unsupported features
  if (config.transport) {
    issues.push("Custom transport detected");
    recommendations.push(
      "Custom transports need to be reimplemented as plugins",
    );
  }

  // Check environment
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN && !process.env.SENTRY_DSN) {
    issues.push("No Sentry DSN found in environment");
    recommendations.push(
      "Set NEXT_PUBLIC_SENTRY_DSN for client-side and SENTRY_DSN for server-side",
    );
  }

  return {
    compatible: issues.length === 0,
    issues,
    recommendations,
  };
}

/**
 * Migration checklist
 */
export const MIGRATION_CHECKLIST = `
# Migration Checklist

## Pre-Migration
- [ ] Back up existing Sentry configuration
- [ ] Note custom integrations and hooks
- [ ] Document current environment variables
- [ ] Review current error handling patterns

## Migration Steps
- [ ] Install @repo/observability package
- [ ] Update imports from @sentry/nextjs
- [ ] Convert configuration to plugin format
- [ ] Update next.config.js with withObservabilitySentry
- [ ] Migrate environment variables
- [ ] Update instrumentation.ts
- [ ] Convert error boundaries to new components
- [ ] Test in development environment

## Post-Migration
- [ ] Verify errors are being captured
- [ ] Check performance monitoring
- [ ] Confirm session replay is working
- [ ] Test feature flag integration
- [ ] Review bundle size impact
- [ ] Update monitoring dashboards

## Rollback Plan
- [ ] Keep old configuration files backed up
- [ ] Document rollback steps
- [ ] Test rollback procedure
`;
