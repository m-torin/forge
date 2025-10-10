/**
 * Segment client adapter
 */

import { BaseProviderAdapter } from '@repo/3p-core/adapters/base-adapter';
import type {
  AnalyticsEvent,
  BatchingConfig,
  GroupPayload,
  IdentifyPayload,
  PagePayload,
  PrivacyConfig,
  ProviderType,
  RetryConfig,
} from '@repo/3p-core/types';

import { validateSegmentConfig } from './config';
import type {
  SegmentAliasPayload,
  SegmentConfig,
  SegmentContext,
  SegmentGroupPayload,
  SegmentIdentifyPayload,
  SegmentPagePayload,
  SegmentPlugin,
  SegmentTrackPayload,
} from './types';

export class SegmentAdapter extends BaseProviderAdapter {
  private analytics: any = null;
  private serverAnalytics: any = null;
  private isServer: boolean;
  private plugins: SegmentPlugin[] = [];

  constructor(
    config: SegmentConfig,
    batchingConfig?: BatchingConfig,
    privacyConfig?: PrivacyConfig,
    retryConfig?: RetryConfig,
  ) {
    super(config, batchingConfig, privacyConfig, retryConfig);

    // Validate Segment-specific config
    const validation = validateSegmentConfig(config);
    if (!validation.valid) {
      throw new Error(`Invalid Segment config: ${validation.errors.join(', ')}`);
    }

    if (validation.warnings.length > 0) {
      validation.warnings.forEach(warning => this.log('warn', warning));
    }

    this.isServer = typeof window === 'undefined';
  }

  get provider(): ProviderType {
    return 'segment';
  }

  protected async doInitialize(): Promise<void> {
    const config = this.config as SegmentConfig;

    if (this.isServer) {
      await this.initializeServer(config);
    } else {
      await this.initializeClient(config);
    }

    this.log(
      'info',
      `Segment ${this.isServer ? 'server' : 'client'} adapter initialized successfully`,
    );
  }

  private async initializeClient(config: SegmentConfig): Promise<void> {
    try {
      // Dynamic import to avoid bundling when not needed
      const { AnalyticsBrowser } = await import('@segment/analytics-node');

      this.analytics = AnalyticsBrowser.load(
        {
          writeKey: config.writeKey,
          cdnURL: config.dataplane ? `${config.dataplane}/analytics.js/v1` : undefined,
        },
        {
          // Client configuration
          integrations: config.integrations || {},
          anonymizeIP: config.anonymizeIP,

          // Privacy settings
          ...this.buildPrivacyConfig(config),
        },
      );

      // Load plugins
      if (config.plugins) {
        await this.loadPlugins(config.plugins);
      }

      // Set up error handling
      if (config.errorHandler) {
        this.analytics.on('error', config.errorHandler);
      }
    } catch (error) {
      throw new Error(`Failed to initialize Segment client: ${(error as Error).message}`);
    }
  }

  private async initializeServer(config: SegmentConfig): Promise<void> {
    try {
      // Dynamic import for server-side Segment
      const { Analytics } = await import('@segment/analytics-node');

      this.serverAnalytics = new Analytics({
        writeKey: config.writeKey,
        host: config.dataplane || config.endpoint,
        flushAt: config.flushAt,
        flushInterval: config.flushInterval,
        maxEventsInBatch: config.maxEventsInBatch,
        timeout: config.timeout,
        httpKeepalive: config.httpKeepalive,
        httpKeepaliveMaxSockets: config.httpKeepaliveMaxSockets,
        httpKeepaliveMaxFreeSockets: config.httpKeepaliveMaxFreeSockets,
        httpKeepaliveTimeout: config.httpKeepaliveTimeout,
        httpKeepaliveFreeSocketTimeout: config.httpKeepaliveFreeSocketTimeout,
        errorHandler: config.errorHandler,
        disable: config.disable,
      });
    } catch (error) {
      throw new Error(`Failed to initialize Segment server: ${(error as Error).message}`);
    }
  }

  private buildPrivacyConfig(config: SegmentConfig): Record<string, any> {
    const privacyConfig: Record<string, any> = {};

    if (config.gdpr?.enabled) {
      privacyConfig.consent = {
        categories: config.gdpr.consentTypes || [],
        defaultConsent: config.gdpr.defaultConsent ?? true,
      };
    }

    return privacyConfig;
  }

  private async loadPlugins(plugins: SegmentPlugin[]): Promise<void> {
    for (const plugin of plugins) {
      try {
        if (!plugin.isLoaded()) {
          await plugin.load();
        }
        this.analytics.register(plugin);
        this.plugins.push(plugin);
        this.log('debug', `Plugin ${plugin.name} loaded successfully`);
      } catch (error) {
        this.log('error', `Failed to load plugin ${plugin.name}`, error);
      }
    }
  }

  protected async doTrack(event: AnalyticsEvent): Promise<boolean> {
    if (!this.analytics && !this.serverAnalytics) {
      this.log('error', 'Segment not initialized');
      return false;
    }

    try {
      const segmentEvent = this.convertToSegmentTrack(event);

      if (this.isServer && this.serverAnalytics) {
        this.serverAnalytics.track(segmentEvent);
      } else if (this.analytics) {
        this.analytics.track(segmentEvent.event, segmentEvent.properties, {
          context: segmentEvent.context,
          integrations: segmentEvent.integrations,
          timestamp: segmentEvent.timestamp,
          anonymousId: segmentEvent.anonymousId,
          messageId: segmentEvent.messageId,
        });
      }

      this.log('debug', 'Event tracked successfully', segmentEvent);
      return true;
    } catch (error) {
      this.log('error', 'Failed to track event', error);
      return false;
    }
  }

  protected async doIdentify(payload: IdentifyPayload): Promise<boolean> {
    try {
      const segmentPayload = this.convertToSegmentIdentify(payload);

      if (this.isServer && this.serverAnalytics) {
        this.serverAnalytics.identify(segmentPayload);
      } else if (this.analytics) {
        this.analytics.identify(segmentPayload.userId, segmentPayload.traits, {
          context: segmentPayload.context,
          integrations: segmentPayload.integrations,
          timestamp: segmentPayload.timestamp,
          anonymousId: segmentPayload.anonymousId,
          messageId: segmentPayload.messageId,
        });
      }

      this.log('debug', 'User identified successfully', { userId: payload.userId });
      return true;
    } catch (error) {
      this.log('error', 'Failed to identify user', error);
      return false;
    }
  }

  protected async doGroup(payload: GroupPayload): Promise<boolean> {
    try {
      const segmentPayload = this.convertToSegmentGroup(payload);

      if (this.isServer && this.serverAnalytics) {
        this.serverAnalytics.group(segmentPayload);
      } else if (this.analytics) {
        this.analytics.group(segmentPayload.groupId, segmentPayload.traits, {
          context: segmentPayload.context,
          integrations: segmentPayload.integrations,
          timestamp: segmentPayload.timestamp,
          userId: segmentPayload.userId,
          anonymousId: segmentPayload.anonymousId,
          messageId: segmentPayload.messageId,
        });
      }

      this.log('debug', 'Group identified successfully', { groupId: payload.groupId });
      return true;
    } catch (error) {
      this.log('error', 'Failed to identify group', error);
      return false;
    }
  }

  protected async doPage(payload: PagePayload): Promise<boolean> {
    try {
      const segmentPayload = this.convertToSegmentPage(payload);

      if (this.isServer && this.serverAnalytics) {
        this.serverAnalytics.page(segmentPayload);
      } else if (this.analytics) {
        this.analytics.page(
          segmentPayload.category,
          segmentPayload.name,
          segmentPayload.properties,
          {
            context: segmentPayload.context,
            integrations: segmentPayload.integrations,
            timestamp: segmentPayload.timestamp,
            userId: segmentPayload.userId,
            anonymousId: segmentPayload.anonymousId,
            messageId: segmentPayload.messageId,
          },
        );
      }

      this.log('debug', 'Page tracked successfully', payload);
      return true;
    } catch (error) {
      this.log('error', 'Failed to track page', error);
      return false;
    }
  }

  protected async doDestroy(): Promise<void> {
    try {
      if (this.serverAnalytics) {
        await this.serverAnalytics.closeAndFlush();
        this.serverAnalytics = null;
      }

      if (this.analytics) {
        // Segment client doesn't need explicit cleanup
        this.analytics = null;
      }

      this.plugins = [];
      this.log('info', 'Segment adapter destroyed');
    } catch (error) {
      this.log('error', 'Error during Segment adapter destruction', error);
    }
  }

  private convertToSegmentTrack(event: AnalyticsEvent): SegmentTrackPayload {
    return {
      event: event.name,
      properties: event.properties,
      context: this.buildContext(event.context),
      userId: event.userId,
      anonymousId: event.anonymousId,
      timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
      integrations: {},
      messageId: this.generateMessageId(),
    };
  }

  private convertToSegmentIdentify(payload: IdentifyPayload): SegmentIdentifyPayload {
    return {
      userId: payload.userId,
      traits: payload.traits,
      context: this.buildContext(payload.context),
      anonymousId: payload.anonymousId,
      timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
      integrations: {},
      messageId: this.generateMessageId(),
    };
  }

  private convertToSegmentGroup(payload: GroupPayload): SegmentGroupPayload {
    return {
      groupId: payload.groupId,
      traits: payload.traits,
      context: this.buildContext(payload.context),
      userId: payload.userId,
      anonymousId: payload.anonymousId,
      timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
      integrations: {},
      messageId: this.generateMessageId(),
    };
  }

  private convertToSegmentPage(payload: PagePayload): SegmentPagePayload {
    return {
      name: payload.name,
      category: payload.category,
      properties: payload.properties,
      context: this.buildContext(payload.context),
      userId: payload.userId,
      anonymousId: payload.anonymousId,
      timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
      integrations: {},
      messageId: this.generateMessageId(),
    };
  }

  private buildContext(eventContext?: Record<string, any>): SegmentContext {
    const config = this.config as SegmentConfig;

    const context: SegmentContext = {
      library: {
        name: '@repo/3p-segment',
        version: '0.1.0',
      },
      ...eventContext,
    };

    // Add client-side context
    if (!this.isServer && typeof window !== 'undefined') {
      context.page = {
        url: window.location.href,
        path: window.location.pathname,
        referrer: document.referrer,
        search: window.location.search,
        title: document.title,
      };

      context.userAgent = navigator.userAgent;
      context.locale = navigator.language;

      if (navigator.userAgentData) {
        context.userAgentData = {
          brands: navigator.userAgentData.brands,
          mobile: navigator.userAgentData.mobile,
          platform: navigator.userAgentData.platform,
        };
      }

      if (screen) {
        context.screen = {
          width: screen.width,
          height: screen.height,
          density: window.devicePixelRatio,
        };
      }
    }

    // Add timezone
    try {
      context.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (error) {
      // Ignore timezone detection errors
    }

    return context;
  }

  private generateMessageId(): string {
    return 'segment-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
  }

  // Segment-specific methods
  public async alias(userId: string, previousId: string): Promise<boolean> {
    try {
      const aliasPayload: SegmentAliasPayload = {
        userId,
        previousId,
        context: this.buildContext(),
        timestamp: new Date(),
        integrations: {},
        messageId: this.generateMessageId(),
      };

      if (this.isServer && this.serverAnalytics) {
        this.serverAnalytics.alias(aliasPayload);
      } else if (this.analytics) {
        this.analytics.alias(userId, previousId);
      }

      this.log('debug', 'Alias created successfully', { userId, previousId });
      return true;
    } catch (error) {
      this.log('error', 'Failed to create alias', error);
      return false;
    }
  }

  public async flush(): Promise<boolean> {
    try {
      if (this.serverAnalytics) {
        await this.serverAnalytics.flush();
      } else if (this.analytics) {
        await this.analytics.flush();
      }

      this.log('debug', 'Segment flush completed');
      return true;
    } catch (error) {
      this.log('error', 'Failed to flush Segment', error);
      return false;
    }
  }

  public reset(): void {
    try {
      if (this.analytics && !this.isServer) {
        this.analytics.reset();
        this.log('debug', 'Segment reset completed');
      }
    } catch (error) {
      this.log('error', 'Failed to reset Segment', error);
    }
  }

  public addPlugin(plugin: SegmentPlugin): void {
    try {
      if (this.analytics && !this.isServer) {
        this.analytics.register(plugin);
        this.plugins.push(plugin);
        this.log('debug', `Plugin ${plugin.name} added successfully`);
      }
    } catch (error) {
      this.log('error', `Failed to add plugin ${plugin.name}`, error);
    }
  }

  public removePlugin(pluginName: string): void {
    try {
      if (this.analytics && !this.isServer) {
        const pluginIndex = this.plugins.findIndex(p => p.name === pluginName);
        if (pluginIndex > -1) {
          // Segment doesn't have a direct remove method, but we can track it
          this.plugins.splice(pluginIndex, 1);
          this.log('debug', `Plugin ${pluginName} removed`);
        }
      }
    } catch (error) {
      this.log('error', `Failed to remove plugin ${pluginName}`, error);
    }
  }

  public getAnonymousId(): string | null {
    try {
      if (this.analytics && !this.isServer) {
        return this.analytics.user().anonymousId();
      }
      return null;
    } catch (error) {
      this.log('error', 'Failed to get anonymous ID', error);
      return null;
    }
  }

  public getUserId(): string | null {
    try {
      if (this.analytics && !this.isServer) {
        return this.analytics.user().id();
      }
      return null;
    } catch (error) {
      this.log('error', 'Failed to get user ID', error);
      return null;
    }
  }

  public getUserTraits(): Record<string, any> | null {
    try {
      if (this.analytics && !this.isServer) {
        return this.analytics.user().traits();
      }
      return null;
    } catch (error) {
      this.log('error', 'Failed to get user traits', error);
      return null;
    }
  }

  public getConfig(): SegmentConfig {
    return this.config as SegmentConfig;
  }
}
