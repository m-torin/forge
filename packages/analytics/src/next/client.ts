/**
 * Next.js client-side analytics implementation
 * For use in client components and browser environments
 */

import { type AnalyticsManager } from '../shared/utils/manager';
import { createPostHogConfig } from '../shared/utils/posthog-client-utils';

import type { BootstrapData } from '../shared/types/posthog-types';
import type { AnalyticsConfig, TrackingOptions } from '../shared/types/types';

export interface NextJSClientAnalyticsConfig extends AnalyticsConfig {
  nextjs?: {
    // Next.js Script loading strategy
    strategy?: 'afterInteractive' | 'beforeInteractive' | 'lazyOnload' | 'worker';

    // Defer initialization until user consent
    deferUntilConsent?: boolean;

    // Buffer events before initialization
    bufferEvents?: boolean;

    // Maximum events to buffer
    maxBufferSize?: number;

    // Custom consent check function
    checkConsent?: () => boolean | Promise<boolean>;

    // Enable debug mode
    debug?: boolean;

    // PostHog specific options
    posthog?: {
      // Server-side bootstrap data
      bootstrap?: BootstrapData;

      // API key for client operations
      apiKey?: string;

      // Host override
      host?: string;
    };
  };
}

interface BufferedEvent {
  args: any[];
  method: 'track' | 'identify' | 'page' | 'group' | 'alias';
  timestamp: number;
}

export class NextJSClientAnalyticsManager {
  private manager: AnalyticsManager | null = null;
  private config: NextJSClientAnalyticsConfig;
  private isInitialized = false;
  private isLoading = false;
  private eventBuffer: BufferedEvent[] = [];
  private consentGiven = false;

  constructor(config: NextJSClientAnalyticsConfig) {
    this.config = config;

    // Check if we should buffer events
    if (config.nextjs?.bufferEvents !== false) {
      this.setupEventBuffering();
    }

    // Auto-initialize if no consent required
    if (!config.nextjs?.deferUntilConsent) {
      this.initializeWhenReady();
    }
  }

  /**
   * Initialize analytics when DOM is ready
   */
  private async initializeWhenReady(): Promise<void> {
    if (typeof window === 'undefined') return;

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve, { once: true });
      });
    }

    await this.initialize();
  }

  /**
   * Initialize analytics with consent check
   */
  async initialize(): Promise<void> {
    if (this.isInitialized || this.isLoading) return;
    this.isLoading = true;

    try {
      // Check consent if required
      if (this.config.nextjs?.deferUntilConsent) {
        const hasConsent = await this.checkConsent();
        if (!hasConsent) {
          // Analytics initialization deferred - no consent
          this.isLoading = false;
          return;
        }
      }

      // Import only what we need for Next.js environment
      const { createAnalyticsManager } = await import('../shared/utils/manager');
      const { ConsoleProvider } = await import('../shared/providers/console-provider');

      const CLIENT_PROVIDERS: any = {
        console: (config: any) => new ConsoleProvider(config),
      };

      // Only import providers that are configured
      const configuredProviders = Object.keys(this.config.providers);

      // Dynamically import only configured providers to avoid webpack bundling unused ones
      for (const providerName of configuredProviders) {
        if (providerName === 'console') continue; // Already loaded above

        switch (providerName) {
          case 'posthog': {
            const { PostHogClientProvider } = await import('../providers/posthog/client');
            CLIENT_PROVIDERS.posthog = (config: any) => new PostHogClientProvider(config);
            break;
          }
          case 'segment': {
            const { SegmentClientProvider } = await import('../providers/segment/client');
            CLIENT_PROVIDERS.segment = (config: any) => new SegmentClientProvider(config);
            break;
          }
          case 'vercel': {
            const { VercelClientProvider } = await import('../providers/vercel/client');
            CLIENT_PROVIDERS.vercel = (config: any) => new VercelClientProvider(config);
            break;
          }
          default:
            // Skip unknown providers
            break;
        }
      }

      this.manager = createAnalyticsManager(this.config, CLIENT_PROVIDERS);
      await this.manager.initialize();
      this.isInitialized = true;
      this.consentGiven = true;

      // Flush buffered events
      await this.flushBufferedEvents();

      // Analytics initialized successfully
    } catch (_error) {
      // Failed to initialize analytics
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Grant consent and initialize analytics
   */
  async grantConsent(): Promise<void> {
    this.consentGiven = true;
    await this.initialize();
  }

  /**
   * Revoke consent and clear data
   */
  revokeConsent(): void {
    this.consentGiven = false;
    this.isInitialized = false;
    this.manager = null;
    this.eventBuffer = [];

    // Analytics consent revoked
  }

  /**
   * Check consent status
   */
  private async checkConsent(): Promise<boolean> {
    if (this.consentGiven) return true;

    if (this.config.nextjs?.checkConsent) {
      return await this.config.nextjs.checkConsent();
    }

    return !this.config.nextjs?.deferUntilConsent;
  }

  /**
   * Setup event buffering
   */
  private setupEventBuffering(): void {
    const maxSize = this.config.nextjs?.maxBufferSize || 50;

    // Ensure buffer doesn't grow too large
    setInterval(() => {
      if (this.eventBuffer.length > maxSize) {
        this.eventBuffer = this.eventBuffer.slice(-maxSize);
        // Analytics buffer trimmed
      }
    }, 5000);
  }

  /**
   * Buffer an event if not initialized
   */
  private bufferEvent(method: BufferedEvent['method'], args: any[]): void {
    if (!this.config.nextjs?.bufferEvents) return;

    this.eventBuffer.push({
      args,
      method,
      timestamp: Date.now(),
    });

    // Event buffered
  }

  /**
   * Flush all buffered events
   */
  private async flushBufferedEvents(): Promise<void> {
    if (!this.manager || this.eventBuffer.length === 0) return;

    // Flushing buffered events

    const events = [...this.eventBuffer];
    this.eventBuffer = [];

    for (const event of events) {
      try {
        switch (event.method) {
          case 'track':
            await this.manager.track(event.args[0], event.args[1], event.args[2]);
            break;
          case 'identify':
            await this.manager.identify(event.args[0], event.args[1], event.args[2]);
            break;
          case 'page':
            await this.manager.page(event.args[0], event.args[1], event.args[2]);
            break;
          case 'group':
            await this.manager.group(event.args[0], event.args[1], event.args[2]);
            break;
          case 'alias':
            await this.manager.alias(event.args[0], event.args[1], event.args[2]);
            break;
        }
      } catch (_error) {
        // Error flushing buffered event
      }
    }
  }

  /**
   * Track an event (with buffering support)
   */
  async track(event: string, properties?: any, options?: TrackingOptions): Promise<void> {
    if (this.isInitialized && this.manager) {
      await this.manager.track(event, properties, options);
    } else if (this.config.nextjs?.bufferEvents !== false) {
      this.bufferEvent('track', [event, properties, options]);
    }
  }

  /**
   * Identify a user (with buffering support)
   */
  async identify(userId: string, traits?: any, options?: TrackingOptions): Promise<void> {
    if (this.isInitialized && this.manager) {
      await this.manager.identify(userId, traits, options);
    } else if (this.config.nextjs?.bufferEvents !== false) {
      this.bufferEvent('identify', [userId, traits, options]);
    }
  }

  /**
   * Track a page view (with buffering support)
   */
  async page(name?: string, properties?: any, options?: TrackingOptions): Promise<void> {
    if (this.isInitialized && this.manager) {
      await this.manager.page(name, properties, options);
    } else if (this.config.nextjs?.bufferEvents !== false) {
      this.bufferEvent('page', [name, properties, options]);
    }
  }

  /**
   * Track a group (with buffering support)
   */
  async group(groupId: string, traits?: any, options?: TrackingOptions): Promise<void> {
    if (this.isInitialized && this.manager) {
      await this.manager.group(groupId, traits, options);
    } else if (this.config.nextjs?.bufferEvents !== false) {
      this.bufferEvent('group', [groupId, traits, options]);
    }
  }

  /**
   * Alias a user (with buffering support)
   */
  async alias(userId: string, previousId: string, options?: TrackingOptions): Promise<void> {
    if (this.isInitialized && this.manager) {
      await this.manager.alias(userId, previousId, options);
    } else if (this.config.nextjs?.bufferEvents !== false) {
      this.bufferEvent('alias', [userId, previousId, options]);
    }
  }

  /**
   * Get initialization status
   */
  getStatus() {
    return {
      activeProviders: this.manager?.getActiveProviders() || [],
      bufferedEvents: this.eventBuffer.length,
      consentGiven: this.consentGiven,
      isInitialized: this.isInitialized,
      isLoading: this.isLoading,
    };
  }
}

/**
 * Create a Next.js optimized analytics instance for client
 */
export function createNextJSClientAnalytics(
  config: NextJSClientAnalyticsConfig,
): NextJSClientAnalyticsManager {
  return new NextJSClientAnalyticsManager(config);
}

/**
 * Next.js Script component integration helper
 */
export function getAnalyticsScriptProps(
  strategy: 'afterInteractive' | 'beforeInteractive' | 'lazyOnload' = 'afterInteractive',
) {
  return {
    onLoad: () => {
      if (typeof window !== 'undefined') {
        // Analytics scripts have loaded, can now initialize
        window.dispatchEvent(new CustomEvent('analytics:scripts-loaded'));
      }
    },
    strategy,
  };
}

/**
 * Create PostHog config with bootstrap data for client
 */
export function createPostHogConfigWithBootstrap(
  apiKey: string,
  bootstrapData: BootstrapData,
  options?: {
    host?: string;
    autocapture?: boolean;
    capture_pageview?: boolean;
    session_recording?: boolean;
    debug?: boolean;
  },
): NextJSClientAnalyticsConfig {
  const posthogConfig = createPostHogConfig(apiKey, {
    ...options,
    bootstrap: bootstrapData,
  });

  return {
    providers: {
      posthog: posthogConfig,
    },
    nextjs: {
      posthog: {
        apiKey,
        bootstrap: bootstrapData,
        host: options?.host,
      },
    },
  };
}
