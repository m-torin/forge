/**
 * Next.js server-side analytics implementation
 * For use in server components and API routes
 */

import { type AnalyticsManager } from '../shared/utils/manager';
import { createPostHogConfig, getCompleteBootstrapData } from '../shared/utils/posthog-next-utils';

import type { BootstrapData } from '../shared/types/posthog-types';
import type { AnalyticsConfig, TrackingOptions } from '../shared/types/types';

export interface NextJSServerAnalyticsConfig extends AnalyticsConfig {
  nextjs?: {
    // Enable debug mode
    debug?: boolean;

    // PostHog specific options
    posthog?: {
      // Cookies for distinct ID extraction
      cookies?: any;

      // API key for server-side operations
      apiKey?: string;

      // Host override
      host?: string;

      // Request timeout for server calls
      timeout?: number;
    };
  };
}

export class NextJSServerAnalyticsManager {
  private manager: AnalyticsManager | null = null;
  private config: NextJSServerAnalyticsConfig;
  private isInitialized = false;

  constructor(config: NextJSServerAnalyticsConfig) {
    this.config = config;
  }

  /**
   * Initialize analytics for server-side usage
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Dynamically import server providers
      const { createAnalyticsManager } = await import('../shared/utils/manager');
      const { SegmentServerProvider } = await import('../providers/segment/server');
      const { PostHogServerProvider } = await import('../providers/posthog/server');
      const { VercelServerProvider } = await import('../providers/vercel/server');
      const { ConsoleProvider } = await import('../providers/console/server');

      const SERVER_PROVIDERS = {
        console: (config: any) => new ConsoleProvider(config),
        posthog: (config: any) => new PostHogServerProvider(config),
        segment: (config: any) => new SegmentServerProvider(config),
        vercel: (config: any) => new VercelServerProvider(config),
      };

      this.manager = createAnalyticsManager(this.config, SERVER_PROVIDERS);
      await this.manager.initialize();
      this.isInitialized = true;

      // Server analytics initialized successfully
    } catch (_error) {
      // Failed to initialize server analytics
    }
  }

  /**
   * Track an event
   */
  async track(event: string, properties?: any, options?: TrackingOptions): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.manager) {
      await this.manager.track(event, properties, options);
    }
  }

  /**
   * Identify a user
   */
  async identify(userId: string, traits?: any, options?: TrackingOptions): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.manager) {
      await this.manager.identify(userId, traits, options);
    }
  }

  /**
   * Track a page view
   */
  async page(name?: string, properties?: any, options?: TrackingOptions): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.manager) {
      await this.manager.page(name, properties, options);
    }
  }

  /**
   * Track a group
   */
  async group(groupId: string, traits?: any, options?: TrackingOptions): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.manager) {
      await this.manager.group(groupId, traits, options);
    }
  }

  /**
   * Alias a user
   */
  async alias(userId: string, previousId: string, options?: TrackingOptions): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.manager) {
      await this.manager.alias(userId, previousId, options);
    }
  }

  /**
   * Get initialization status
   */
  getStatus() {
    return {
      activeProviders: this.manager?.getActiveProviders() || [],
      isInitialized: this.isInitialized,
    };
  }
}

/**
 * Create a Next.js optimized analytics instance for server
 */
export function createNextJSServerAnalytics(
  config: NextJSServerAnalyticsConfig,
): NextJSServerAnalyticsManager {
  return new NextJSServerAnalyticsManager(config);
}

/**
 * Get PostHog bootstrap data for server-side rendering
 */
export async function getPostHogBootstrapDataOnServer(
  cookies: any,
  apiKey: string,
  options?: {
    host?: string;
    timeout?: number;
  },
): Promise<BootstrapData> {
  return await getCompleteBootstrapData(cookies, apiKey, options);
}

/**
 * Enhanced analytics manager with PostHog bootstrap for SSR
 */
export async function createNextJSServerAnalyticsWithBootstrap(
  cookies: any,
  apiKey: string,
  options?: {
    host?: string;
    timeout?: number;
    providers?: Record<string, any>;
    nextjs?: Omit<NextJSServerAnalyticsConfig['nextjs'], 'posthog'>;
  },
): Promise<{
  analytics: NextJSServerAnalyticsManager;
  bootstrapData: BootstrapData;
}> {
  // Get bootstrap data
  const bootstrapData = await getCompleteBootstrapData(cookies, apiKey, {
    host: options?.host,
    timeout: options?.timeout,
  });

  // Create config with server-side settings
  const config: NextJSServerAnalyticsConfig = {
    providers: {
      posthog: createPostHogConfig(apiKey, {
        host: options?.host,
      }),
      ...options?.providers,
    },
    nextjs: {
      ...options?.nextjs,
      posthog: {
        apiKey,
        cookies,
        host: options?.host,
        timeout: options?.timeout,
      },
    },
  };

  const analytics = new NextJSServerAnalyticsManager(config);
  await analytics.initialize();

  return { analytics, bootstrapData };
}
