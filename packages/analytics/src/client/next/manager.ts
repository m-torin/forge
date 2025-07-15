/**
 * Next.js client analytics manager with truly dynamic provider loading
 */

// Simple console fallback - observability integration can be added later
import type { AnalyticsConfig, AnalyticsManager, ProviderRegistry } from '../../shared/types/types';
import { createAnalyticsManager } from '../../shared/utils/manager';
const logWarn = (_message: string, _context?: any) => {
  // No-op to avoid console warnings in production
  // TODO: Add proper error logging via observability package
};

/**
 * Create a Next.js client analytics instance with runtime provider loading
 * Only imports providers that are actually configured to avoid webpack bundling unused dependencies
 */
export async function createNextJSClientAnalytics(
  config: AnalyticsConfig,
): Promise<AnalyticsManager> {
  const CLIENT_PROVIDERS: ProviderRegistry = {};

  // Get configured providers
  const configuredProviders = Object.keys(config.providers);

  // Only import configured providers using truly dynamic imports
  const providerPromises = configuredProviders.map(async providerName => {
    switch (providerName) {
      case 'console': {
        const module = await import(
          /* webpackChunkName: "analytics-console" */ '../../providers/console/client'
        );
        CLIENT_PROVIDERS.console = config => new module.ConsoleProvider(config);
        break;
      }
      case 'posthog': {
        const module = await import(
          /* webpackChunkName: "analytics-posthog" */ '../../providers/posthog/client'
        );
        CLIENT_PROVIDERS.posthog = config => new module.PostHogClientProvider(config);
        break;
      }
      case 'segment': {
        const module = await import(
          /* webpackChunkName: "analytics-segment" */ '../../providers/segment/client'
        );
        CLIENT_PROVIDERS.segment = config => new module.SegmentClientProvider(config);
        break;
      }
      case 'vercel': {
        const module = await import(
          /* webpackChunkName: "analytics-vercel" */ '../../providers/vercel/client'
        );
        CLIENT_PROVIDERS.vercel = config => new module.VercelClientProvider(config);
        break;
      }
      default:
        // Skip unknown providers
        logWarn('Unknown analytics provider:', { providerName });
        break;
    }
  });

  // Wait for all configured providers to load
  await Promise.all(providerPromises);

  const manager = createAnalyticsManager(config, CLIENT_PROVIDERS);
  await manager.initialize();
  return manager;
}

/**
 * Create a Next.js client analytics instance without initializing
 */
export async function createNextJSClientAnalyticsUninitialized(
  config: AnalyticsConfig,
): Promise<AnalyticsManager> {
  const CLIENT_PROVIDERS: ProviderRegistry = {};

  // Get configured providers
  const configuredProviders = Object.keys(config.providers);

  // Dynamically import only configured providers
  for (const providerName of configuredProviders) {
    switch (providerName) {
      case 'console': {
        const { ConsoleProvider } = await import('../../providers/console/client');
        CLIENT_PROVIDERS.console = config => new ConsoleProvider(config);
        break;
      }
      case 'posthog': {
        const { PostHogClientProvider } = await import('../../providers/posthog/client');
        CLIENT_PROVIDERS.posthog = config => new PostHogClientProvider(config);
        break;
      }
      case 'segment': {
        const { SegmentClientProvider } = await import('../../providers/segment/client');
        CLIENT_PROVIDERS.segment = config => new SegmentClientProvider(config);
        break;
      }
      case 'vercel': {
        const { VercelClientProvider } = await import('../../providers/vercel/client');
        CLIENT_PROVIDERS.vercel = config => new VercelClientProvider(config);
        break;
      }
      default:
        // Skip unknown providers
        logWarn('Unknown analytics provider:', { providerName });
        break;
    }
  }

  return createAnalyticsManager(config, CLIENT_PROVIDERS);
}
