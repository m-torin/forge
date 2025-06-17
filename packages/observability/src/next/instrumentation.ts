/**
 * Next.js instrumentation for server-side observability
 * This file is imported by apps in their instrumentation.ts
 */

// Only import Sentry on Node.js runtime to avoid edge runtime issues
import { ObservabilityConfig } from '../shared/types/types';
import { Environment, Runtime } from '../shared/utils/environment';

let Sentry: any = null;

// Dynamic import Sentry for ESM compliance
if (typeof window === 'undefined' && !Runtime.isEdge()) {
  try {
    // Use dynamic import instead of require for ESM compliance
    import('@sentry/nextjs')
      .then((sentryModule: any) => {
        Sentry = sentryModule;
      })
      .catch(() => {
        // Sentry not available, that's okay
      });
  } catch {
    // Sentry not available, that's okay
  }
}

/**
 * Register function for Next.js instrumentation
 * Called automatically by Next.js on server startup
 */
export async function register(config?: ObservabilityConfig) {
  // Initialize for Node.js runtime with full observability
  if (Runtime.isNodeJS()) {
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
  if (Runtime.isEdge()) {
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
 * Sentry's onRequestError handler for Next.js
 * Captures errors that occur during request handling
 */
export const onRequestError = Sentry?.captureRequestError || ((() => {}) as any);

/**
 * Get default edge configuration
 * Uses edge-compatible providers only (no OpenTelemetry)
 */
function getDefaultEdgeConfig(): ObservabilityConfig {
  return {
    providers: {
      console: {
        enabled: Environment.isDevelopment(),
      },
      // Sentry Edge disabled to prevent OpenTelemetry bundling
      // 'sentry-edge': {
      //   dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      //   environment: process.env.NODE_ENV,
      //   tracesSampleRate: 0.1, // Lower sample rate for edge
      // },
    },
  };
}

/**
 * Get default server configuration (no OpenTelemetry)
 * Apps can override this by passing their own config
 */
function getDefaultServerConfig(): ObservabilityConfig {
  return {
    providers: {
      console: {
        enabled: Environment.isDevelopment(),
      },
      // Logtail disabled to prevent potential OpenTelemetry issues
      // logtail: {
      //   sourceToken: process.env.LOGTAIL_SOURCE_TOKEN,
      // },
      // Sentry disabled to prevent OpenTelemetry bundling
      // sentry: {
      //   dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      //   environment: process.env.NODE_ENV,
      //   tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      // },
    },
  };
}
