import { GoogleAnalyticsEmitter } from './google-analytics';
import { MultiEmitter } from './multi';
import { PostHogBrowserEmitter } from './posthog-browser';
import { SegmentBrowserEmitter } from './segment-browser';

import type {
  AliasMessage,
  AnalyticsConfig,
  AnalyticsEmitter,
  AnalyticsUser,
  GroupMessage,
  IdentifyMessage,
  PageMessage,
  ScreenMessage,
  TrackMessage,
} from './types';

export interface AnalyticsProviders {
  googleAnalytics?: {
    measurementId: string;
    config?: AnalyticsConfig;
  };
  posthog?: {
    apiKey: string;
    config?: AnalyticsConfig;
  };
  segment?: {
    writeKey: string;
    config?: AnalyticsConfig;
  };
}

export interface AnalyticsOptions {
  debug?: boolean;
  defaultAnonymousId?: string;
  defaultUserId?: string;
  disabled?: boolean;
  providers?: AnalyticsProviders;
}

/**
 * Browser-Safe Analytics Client
 * Uses only browser-compatible analytics providers
 * No Node.js dependencies
 */
export class BrowserAnalytics {
  private emitter: AnalyticsEmitter;
  private user: AnalyticsUser = {};
  private options: AnalyticsOptions;

  constructor(options: AnalyticsOptions = {}) {
    this.options = options;
    this.emitter = this.createEmitter();

    // Set default user IDs if provided
    if (options.defaultUserId) {
      this.user.userId = options.defaultUserId;
    }
    if (options.defaultAnonymousId) {
      this.user.anonymousId = options.defaultAnonymousId;
    }
  }

  /**
   * Create the appropriate emitter(s) based on configuration
   */
  private createEmitter(): AnalyticsEmitter {
    const emitters: AnalyticsEmitter[] = [];
    const { providers, debug, disabled } = this.options;

    if (disabled) {
      // Return a no-op emitter
      return {
        identify: async () => {},
        alias: async () => {},
        flush: async () => {},
        group: async () => {},
        page: async () => {},
        reset: async () => {},
        screen: async () => {},
        track: async () => {},
      };
    }

    if (providers?.segment) {
      emitters.push(
        new SegmentBrowserEmitter({
          ...providers.segment.config,
          debug,
          writeKey: providers.segment.writeKey,
        }),
      );
    }

    if (providers?.posthog) {
      emitters.push(
        new PostHogBrowserEmitter({
          ...providers.posthog.config,
          apiKey: providers.posthog.apiKey,
          debug,
        }),
      );
    }

    if (providers?.googleAnalytics) {
      emitters.push(
        new GoogleAnalyticsEmitter({
          ...providers.googleAnalytics.config,
          debug,
          measurementId: providers.googleAnalytics.measurementId,
        }),
      );
    }

    // If no emitters configured, return no-op
    if (emitters.length === 0) {
      return {
        identify: async () => {},
        alias: async () => {},
        flush: async () => {},
        group: async () => {},
        page: async () => {},
        reset: async () => {},
        screen: async () => {},
        track: async () => {},
      };
    }

    // If only one emitter, return it directly
    if (emitters.length === 1) {
      return emitters[0];
    }

    // Otherwise, return a multi-emitter
    return new MultiEmitter(emitters, debug || false);
  }

  /**
   * Set the current user
   */
  setUser(userId?: string, anonymousId?: string): void {
    if (userId) {
      this.user.userId = userId;
    }
    if (anonymousId) {
      this.user.anonymousId = anonymousId;
    }
  }

  /**
   * Get the current user
   */
  getUser(): AnalyticsUser {
    return { ...this.user };
  }

  /**
   * Identify a user
   */
  async identify(
    userId?: string,
    traits?: Record<string, any>,
    options?: Omit<IdentifyMessage, 'userId' | 'traits'>,
  ): Promise<void> {
    const message: IdentifyMessage = {
      anonymousId: this.user.anonymousId,
      traits,
      userId: userId || this.user.userId,
      ...options,
    };

    // Update stored user
    if (userId) {
      this.user.userId = userId;
    }
    if (traits) {
      this.user.traits = { ...this.user.traits, ...traits };
    }

    await this.emitter.identify(message);
  }

  /**
   * Track an event
   */
  async track(
    event: string,
    properties?: Record<string, any>,
    options?: Omit<TrackMessage, 'event' | 'properties'>,
  ): Promise<void> {
    const message: TrackMessage = {
      anonymousId: this.user.anonymousId,
      event,
      properties,
      userId: this.user.userId,
      ...options,
    };

    await this.emitter.track(message);
  }

  /**
   * Track a page view
   */
  async page(
    category?: string,
    name?: string,
    properties?: Record<string, any>,
    options?: Omit<PageMessage, 'category' | 'name' | 'properties'>,
  ): Promise<void> {
    const message: PageMessage = {
      name,
      anonymousId: this.user.anonymousId,
      category,
      properties,
      userId: this.user.userId,
      ...options,
    };

    await this.emitter.page(message);
  }

  /**
   * Track a screen view (mobile/app)
   */
  async screen(
    category?: string,
    name?: string,
    properties?: Record<string, any>,
    options?: Omit<ScreenMessage, 'category' | 'name' | 'properties'>,
  ): Promise<void> {
    const message: ScreenMessage = {
      name,
      anonymousId: this.user.anonymousId,
      category,
      properties,
      userId: this.user.userId,
      ...options,
    };

    await this.emitter.screen(message);
  }

  /**
   * Associate user with a group
   */
  async group(
    groupId: string,
    traits?: Record<string, any>,
    options?: Omit<GroupMessage, 'groupId' | 'traits'>,
  ): Promise<void> {
    const message: GroupMessage = {
      anonymousId: this.user.anonymousId,
      groupId,
      traits,
      userId: this.user.userId,
      ...options,
    };

    await this.emitter.group(message);
  }

  /**
   * Create an alias for a user
   */
  async alias(
    userId: string,
    previousId?: string,
    options?: Omit<AliasMessage, 'userId' | 'previousId'>,
  ): Promise<void> {
    const message: AliasMessage = {
      previousId: previousId || this.user.userId || this.user.anonymousId || 'unknown',
      userId,
      ...options,
    };

    // Update stored user
    this.user.userId = userId;

    await this.emitter.alias(message);
  }

  /**
   * Flush any queued events
   */
  async flush(): Promise<void> {
    if (this.emitter.flush) {
      await this.emitter.flush();
    }
  }

  /**
   * Reset the current user and clear any queued events
   */
  async reset(): Promise<void> {
    this.user = {};

    if (this.emitter.reset) {
      await this.emitter.reset();
    }
  }

  /**
   * Enable analytics
   */
  enable(): void {
    this.options.disabled = false;
    this.emitter = this.createEmitter();
  }

  /**
   * Disable analytics
   */
  disable(): void {
    this.options.disabled = true;
    this.emitter = this.createEmitter();
  }

  /**
   * Check if analytics is enabled
   */
  isEnabled(): boolean {
    return !this.options.disabled;
  }
}