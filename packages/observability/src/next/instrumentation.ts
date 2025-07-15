/**
 * Next.js instrumentation for server-side observability
 * This file is imported by apps in their instrumentation.ts
 */

import { type Instrumentation } from 'next';
import {
  getRawEnv,
  hasLogtailConfig,
  hasSentryConfig,
  isEdgeRuntime,
  isNodeRuntime,
  isProduction,
} from '../../env';
import { ObservabilityConfig } from '../shared/types/types';
import { Environment } from '../shared/utils/environment';

/**
 * Register function for Next.js instrumentation
 * Called automatically by Next.js on server startup
 */
export async function register(config?: ObservabilityConfig) {
  // Initialize for Node.js runtime with full observability
  if (getRawEnv().NEXT_RUNTIME === 'nodejs') {
    try {
      const { createServerObservabilityManager } = await import('../server/utils/manager');

      // Get Next.js server providers
      const NEXTJS_SERVER_PROVIDERS = {
        console: async () => {
          const { ConsoleProvider } = await import('../shared/providers/console-provider');
          return new ConsoleProvider();
        },
        sentry: async () => {
          const { SentryServerProvider } = await import('../server/providers/sentry-server');
          return new SentryServerProvider();
        },
      };

      // Use provided config or default config
      const observabilityConfig = config || getDefaultServerConfig();

      // Initialize observability providers
      const manager = createServerObservabilityManager(
        observabilityConfig,
        NEXTJS_SERVER_PROVIDERS,
      );
      await manager.initialize();
    } catch (error: any) {
      // Silently fail if observability dependencies are not available
      if (Environment.isDevelopment()) {
        console.warn('[Observability] Failed to initialize server observability: ', error);
      }
    }
  }

  // Initialize for edge runtime with edge-compatible providers
  if (isEdgeRuntime()) {
    try {
      const { createServerObservabilityManager } = await import('../server/utils/manager');

      // Edge-compatible providers (minimal set)
      const EDGE_PROVIDERS = {
        console: async () => {
          const { ConsoleProvider } = await import('../shared/providers/console-provider');
          return new ConsoleProvider();
        },
      };

      // Use edge-specific config with edge-compatible providers
      const observabilityConfig = config || getDefaultEdgeConfig();

      // Initialize edge-compatible observability providers
      const manager = createServerObservabilityManager(observabilityConfig, EDGE_PROVIDERS);
      await manager.initialize();

      if (Environment.isDevelopment()) {
        console.info('[Observability] Initialized edge runtime observability');
      }
    } catch (error: any) {
      // Silently fail if observability dependencies are not available
      if (Environment.isDevelopment()) {
        console.warn('[Observability] Failed to initialize edge observability: ', error);
      }
    }
  }
}

/**
 * Next.js onRequestError handler
 * Captures errors that occur during request handling
 *
 * @param err - The error object with digest
 * @param request - Request information
 * @param context - Context about where the error occurred
 */
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  // Only process errors in Node.js runtime where Sentry is available
  if (!isNodeRuntime()) {
    return;
  }

  try {
    // Dynamically import Sentry to avoid edge runtime issues
    const Sentry = await import('@sentry/nextjs');

    // Check if Sentry is initialized
    const client = Sentry.getClient();
    if (!client) {
      if (Environment.isDevelopment()) {
        console.warn('[Observability] Sentry not initialized, skipping error capture');
      }
      return;
    }

    // Capture the error with full context
    Sentry.withScope(scope => {
      // Set request context
      scope.setContext('request', {
        path: request.path,
        method: request.method,
        headers: request.headers,
      });

      // Set error context
      scope.setContext('nextjs', {
        routerKind: context.routerKind,
        routePath: context.routePath,
        routeType: context.routeType,
        renderSource: context.renderSource,
        revalidateReason: context.revalidateReason,
        renderType: (context as any).renderType, // Next.js 15.3+ property
      });

      // Add tags for filtering
      scope.setTag('nextjs.router', context.routerKind);
      scope.setTag('nextjs.route_type', context.routeType);
      scope.setTag('nextjs.render_source', context.renderSource || 'unknown');

      // Set error digest as fingerprint for grouping
      if ((err as any).digest) {
        scope.setFingerprint([(err as any).digest]);
        scope.setTag('error.digest', (err as any).digest);
      }

      // Capture the error
      Sentry.captureException(err, {
        mechanism: {
          type: 'nextjs',
          handled: false,
          data: {
            routeType: context.routeType,
            renderSource: (context.renderSource as string | boolean) || 'unknown',
          },
        },
      });
    });

    // Log in development for debugging
    if (Environment.isDevelopment()) {
      console.error('[Observability] Captured Next.js error:', {
        message: err instanceof Error ? err.message : String(err),
        digest: (err as any).digest,
        path: request.path,
        routeType: context.routeType,
      });
    }
  } catch (captureError) {
    // Silently fail if error capture fails
    if (Environment.isDevelopment()) {
      console.error('[Observability] Failed to capture error:', captureError);
    }
  }
};

/**
 * Get default edge configuration
 * Uses edge-compatible providers only (no OpenTelemetry)
 */
function getDefaultEdgeConfig(): ObservabilityConfig {
  // Check if Sentry is configured with required env vars
  const hasSentryConfigLocal = Boolean(getRawEnv().NEXT_PUBLIC_SENTRY_DSN);

  return {
    providers: {
      console: {
        enabled: Environment.isDevelopment(),
      },
      // Only enable Sentry Edge if DSN is provided
      ...(hasSentryConfigLocal && {
        'sentry-edge': {
          dsn: getRawEnv().NEXT_PUBLIC_SENTRY_DSN,
          environment: getRawEnv().NODE_ENV,
          tracesSampleRate: 0.1, // Lower sample rate for edge
        },
      }),
    },
  };
}

/**
 * Get default server configuration (no OpenTelemetry)
 * Apps can override this by passing their own config
 */
function getDefaultServerConfig(): ObservabilityConfig {
  // Check if Sentry is configured with required env vars
  const hasSentryConfigLocal = hasSentryConfig();
  const hasLogtailConfigLocal = hasLogtailConfig();

  return {
    providers: {
      console: {
        enabled: Environment.isDevelopment(),
      },
      // Only enable Logtail if source token is provided
      ...(hasLogtailConfigLocal && {
        logtail: {
          sourceToken: getRawEnv().LOGTAIL_SOURCE_TOKEN,
        },
      }),
      // Only enable Sentry if DSN is provided
      ...(hasSentryConfigLocal && {
        sentry: {
          dsn: getRawEnv().NEXT_PUBLIC_SENTRY_DSN || getRawEnv().SENTRY_DSN,
          environment: getRawEnv().NODE_ENV,
          tracesSampleRate: isProduction() ? 0.1 : 1.0,
        },
      }),
    },
  };
}
