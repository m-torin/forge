/**
 * Next.js 15 optimized analytics integration
 * Supports deferred loading, script strategies, and consent management
 */

import { AnalyticsManager } from './manager';
import type { AnalyticsConfig, TrackingOptions } from './types';

export interface NextJSAnalyticsConfig extends AnalyticsConfig {
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
  };
}

interface BufferedEvent {
  method: 'track' | 'identify' | 'page' | 'group' | 'alias';
  args: any[];
  timestamp: number;
}

export class NextJSAnalyticsManager {
  private manager: AnalyticsManager | null = null;
  private config: NextJSAnalyticsConfig;
  private isInitialized = false;
  private isLoading = false;
  private eventBuffer: BufferedEvent[] = [];
  private consentGiven = false;

  constructor(config: NextJSAnalyticsConfig) {
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
   * Initialize analytics when DOM is ready (for Next.js environments)
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
          if (this.config.nextjs?.debug) {
            console.log('Analytics initialization deferred - no consent');
          }
          this.isLoading = false;
          return;
        }
      }

      // Dynamically import and create manager based on environment
      const isClient = typeof window !== 'undefined';
      
      if (isClient) {
        const { createAnalyticsManager } = await import('./manager');
        const { SegmentClientProvider } = await import('./segment/client');
        const { PostHogClientProvider } = await import('./posthog/client');
        const { VercelClientProvider } = await import('./vercel/client');
        const { ConsoleProvider } = await import('./console/universal');

        const CLIENT_PROVIDERS = {
          segment: (config: any) => new SegmentClientProvider(config),
          posthog: (config: any) => new PostHogClientProvider(config),
          vercel: (config: any) => new VercelClientProvider(config),
          console: (config: any) => new ConsoleProvider(config)
        };

        this.manager = createAnalyticsManager(this.config, CLIENT_PROVIDERS);
      } else {
        // Server-side initialization
        const { createAnalyticsManager } = await import('./manager');
        const { SegmentServerProvider } = await import('./segment/server');
        const { PostHogServerProvider } = await import('./posthog/server');
        const { VercelServerProvider } = await import('./vercel/server');
        const { ConsoleProvider } = await import('./console/universal');

        const SERVER_PROVIDERS = {
          segment: (config: any) => new SegmentServerProvider(config),
          posthog: (config: any) => new PostHogServerProvider(config),
          vercel: (config: any) => new VercelServerProvider(config),
          console: (config: any) => new ConsoleProvider(config)
        };

        this.manager = createAnalyticsManager(this.config, SERVER_PROVIDERS);
      }

      await this.manager.initialize();
      this.isInitialized = true;
      this.consentGiven = true;

      // Flush buffered events
      await this.flushBufferedEvents();

      if (this.config.nextjs?.debug) {
        console.log('Analytics initialized successfully', {
          environment: isClient ? 'client' : 'server',
          providers: this.manager.getActiveProviders()
        });
      }
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
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
    
    if (this.config.nextjs?.debug) {
      console.log('Analytics consent revoked');
    }
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
        if (this.config.nextjs?.debug) {
          console.warn(`Analytics buffer trimmed to ${maxSize} events`);
        }
      }
    }, 5000);
  }

  /**
   * Buffer an event if not initialized
   */
  private bufferEvent(method: BufferedEvent['method'], args: any[]): void {
    if (!this.config.nextjs?.bufferEvents) return;
    
    this.eventBuffer.push({
      method,
      args,
      timestamp: Date.now()
    });

    if (this.config.nextjs?.debug) {
      console.log(`Buffered ${method} event:`, args[0]);
    }
  }

  /**
   * Flush all buffered events
   */
  private async flushBufferedEvents(): Promise<void> {
    if (!this.manager || this.eventBuffer.length === 0) return;

    if (this.config.nextjs?.debug) {
      console.log(`Flushing ${this.eventBuffer.length} buffered events`);
    }

    const events = [...this.eventBuffer];
    this.eventBuffer = [];

    for (const event of events) {
      try {
        switch (event.method) {
          case 'track':
            await this.manager.track(...event.args);
            break;
          case 'identify':
            await this.manager.identify(...event.args);
            break;
          case 'page':
            await this.manager.page(...event.args);
            break;
          case 'group':
            await this.manager.group(...event.args);
            break;
          case 'alias':
            await this.manager.alias(...event.args);
            break;
        }
      } catch (error) {
        console.error('Error flushing buffered event:', error);
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
    } else if (this.config.nextjs?.debug) {
      console.warn('Analytics not initialized, event not tracked:', event);
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
    } else if (this.config.nextjs?.debug) {
      console.warn('Analytics not initialized, identify not called');
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
    } else if (this.config.nextjs?.debug) {
      console.warn('Analytics not initialized, page not tracked');
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
    } else if (this.config.nextjs?.debug) {
      console.warn('Analytics not initialized, group not tracked');
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
    } else if (this.config.nextjs?.debug) {
      console.warn('Analytics not initialized, alias not called');
    }
  }

  /**
   * Get initialization status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isLoading: this.isLoading,
      consentGiven: this.consentGiven,
      bufferedEvents: this.eventBuffer.length,
      activeProviders: this.manager?.getActiveProviders() || []
    };
  }
}

/**
 * Create a Next.js optimized analytics instance
 */
export function createNextJSAnalytics(config: NextJSAnalyticsConfig): NextJSAnalyticsManager {
  return new NextJSAnalyticsManager(config);
}

/**
 * Next.js Script component integration helper
 */
export function getAnalyticsScriptProps(strategy: 'afterInteractive' | 'beforeInteractive' | 'lazyOnload' = 'afterInteractive') {
  return {
    strategy,
    onLoad: () => {
      if (typeof window !== 'undefined') {
        // Analytics scripts have loaded, can now initialize
        window.dispatchEvent(new CustomEvent('analytics:scripts-loaded'));
      }
    }
  };
}