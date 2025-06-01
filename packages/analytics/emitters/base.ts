import type {
  AliasMessage,
  AnalyticsConfig,
  AnalyticsContext,
  AnalyticsEmitter,
  GroupMessage,
  IdentifyMessage,
  PageMessage,
  ScreenMessage,
  TrackMessage,
} from './types';

/**
 * Base Analytics Emitter
 * Provides common functionality for all analytics emitters
 */
export abstract class BaseAnalyticsEmitter implements AnalyticsEmitter {
  protected config: AnalyticsConfig;
  protected context: AnalyticsContext;
  protected queue: (() => Promise<void>)[] = [];
  protected flushTimer?: NodeJS.Timeout;

  constructor(config: AnalyticsConfig = {}) {
    this.config = config;
    this.context = this.getDefaultContext();
    
    if (config.flushInterval && config.flushInterval > 0) {
      this.startFlushTimer();
    }
  }

  /**
   * Get default context based on the environment
   */
  protected getDefaultContext(): AnalyticsContext {
    const context: AnalyticsContext = {
      library: {
        name: '@repo/analytics',
        version: '1.0.0',
      },
    };

    // Browser environment
    if (typeof window !== 'undefined') {
      context.userAgent = window.navigator.userAgent;
      context.locale = window.navigator.language;
      context.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      if (window.location) {
        context.page = {
          url: window.location.href,
          path: window.location.pathname,
          referrer: document.referrer,
          search: window.location.search,
          title: document.title,
        };
      }
      
      if (window.screen) {
        context.screen = {
          width: window.screen.width,
          height: window.screen.height,
        };
      }
    }
    
    // Node.js environment
    if (typeof process !== 'undefined' && process.versions?.node) {
      context.os = {
        name: process.platform,
        version: process.version,
      };
    }

    return context;
  }

  /**
   * Merge message with default context
   */
  protected mergeContext(message: any): any {
    return {
      ...message,
      context: {
        ...this.context,
        ...message.context,
      },
      messageId: message.messageId || this.generateMessageId(),
      timestamp: message.timestamp || new Date().toISOString(),
    };
  }

  /**
   * Generate a unique message ID
   */
  protected generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Add event to queue
   */
  protected async enqueue(fn: () => Promise<void>): Promise<void> {
    if (this.config.disabled) {
      return;
    }

    if (this.config.debug) {
      console.log('[Analytics] Enqueuing event');
    }

    this.queue.push(fn);

    // Auto-flush if we hit the limit
    if (this.config.flushAt && this.queue.length >= this.config.flushAt) {
      await this.flush();
    }
  }

  /**
   * Start the flush timer
   */
  protected startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush().catch((error) => {
        if (this.config.debug) {
          console.error('[Analytics] Flush error:', error);
        }
      });
    }, this.config.flushInterval!);
  }

  /**
   * Stop the flush timer
   */
  protected stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
  }

  /**
   * Validate user identification
   */
  protected validateUserIdentity(message: { userId?: string; anonymousId?: string }): void {
    if (!message.userId && !message.anonymousId) {
      throw new Error('Either userId or anonymousId must be provided');
    }
  }

  // Abstract methods to be implemented by specific emitters
  abstract identify(message: IdentifyMessage): Promise<void>;
  abstract track(message: TrackMessage): Promise<void>;
  abstract page(message: PageMessage): Promise<void>;
  abstract screen(message: ScreenMessage): Promise<void>;
  abstract group(message: GroupMessage): Promise<void>;
  abstract alias(message: AliasMessage): Promise<void>;

  /**
   * Flush queued events
   */
  async flush(): Promise<void> {
    if (this.queue.length === 0) {
      return;
    }

    if (this.config.debug) {
      console.log(`[Analytics] Flushing ${this.queue.length} events`);
    }

    const batch = [...this.queue];
    this.queue = [];

    try {
      await Promise.all(batch.map(fn => fn()));
    } catch (error) {
      if (this.config.debug) {
        console.error('[Analytics] Error flushing events:', error);
      }
      // Re-queue failed events
      this.queue.unshift(...batch);
      throw error;
    }
  }

  /**
   * Reset the emitter
   */
  async reset(): Promise<void> {
    this.queue = [];
    this.stopFlushTimer();
    this.context = this.getDefaultContext();
  }
}