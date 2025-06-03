import { BaseAnalyticsEmitter } from './base';

import type {
  AliasMessage,
  AnalyticsConfig,
  GroupMessage,
  IdentifyMessage,
  PageMessage,
  ScreenMessage,
  TrackMessage,
} from './types';

interface SegmentConfig extends AnalyticsConfig {
  apiHost?: string;
  writeKey: string;
}

/**
 * Segment Analytics Emitter
 * Works in both browser and Node.js environments
 */
export class SegmentEmitter extends BaseAnalyticsEmitter {
  private analytics: any;
  private isNode: boolean;

  constructor(config: SegmentConfig) {
    super({
      apiHost: 'https://api.segment.io',
      flushAt: 20,
      flushInterval: 10000,
      ...config,
    });

    this.isNode = typeof window === 'undefined';
    this.initializeAnalytics();
  }

  private async initializeAnalytics(): Promise<void> {
    if (this.isNode) {
      // Node.js environment - use @segment/analytics-node
      try {
        const { Analytics } = await import('@segment/analytics-node');
        this.analytics = new Analytics({
          flushAt: this.config.flushAt,
          flushInterval: this.config.flushInterval,
          host: this.config.apiHost,
          writeKey: (this.config as SegmentConfig).writeKey,
        });
      } catch (error) {
        console.error('[Segment] Failed to initialize Node.js client:', error);
      }
    } else {
      // Browser environment - load analytics.js
      await this.loadAnalyticsJS();
    }
  }

  private async loadAnalyticsJS(): Promise<void> {
    return new Promise((resolve) => {
      // Check if already loaded
      if ((window as any).analytics) {
        this.analytics = (window as any).analytics;
        resolve();
        return;
      }

      // Create a queue to hold events until analytics.js loads
      const analytics = ((window as any).analytics = (window as any).analytics || []);

      if (!analytics.initialize) {
        if (analytics.invoked) {
          console.error('[Segment] Analytics.js snippet included twice.');
          resolve();
          return;
        }

        analytics.invoked = true;
        analytics.methods = [
          'trackSubmit',
          'trackClick',
          'trackLink',
          'trackForm',
          'pageview',
          'identify',
          'reset',
          'group',
          'track',
          'ready',
          'alias',
          'debug',
          'page',
          'screen',
          'once',
          'off',
          'on',
          'addSourceMiddleware',
          'addIntegrationMiddleware',
          'setAnonymousId',
          'addDestinationMiddleware',
        ];

        analytics.factory = function (method: string) {
          return function (...args: any[]) {
            args.unshift(method);
            analytics.push(args);
            return analytics;
          };
        };

        for (const method of analytics.methods) {
          analytics[method] = analytics.factory(method);
        }

        analytics.load = function (key: string, options: any) {
          const script = document.createElement('script');
          script.type = 'text/javascript';
          script.async = true;
          script.src = `https://cdn.segment.com/analytics.js/v1/${key}/analytics.min.js`;

          const first = document.getElementsByTagName('script')[0];
          if (first && first.parentNode) {
            first.parentNode.insertBefore(script, first);
          }

          analytics._loadOptions = options;
        };

        analytics.SNIPPET_VERSION = '4.13.1';
        analytics.load((this.config as SegmentConfig).writeKey);

        this.analytics = analytics;
        resolve();
      }
    });
  }

  async identify(message: IdentifyMessage): Promise<void> {
    const enrichedMessage = this.mergeContext(message);

    if (this.config.debug) {
      console.log('[Segment] Identify:', enrichedMessage);
    }

    if (this.isNode && this.analytics) {
      this.analytics.identify(enrichedMessage);
    } else if (!this.isNode && this.analytics) {
      this.analytics.identify(enrichedMessage.userId, enrichedMessage.traits, {
        context: enrichedMessage.context,
        integrations: enrichedMessage.integrations,
        timestamp: enrichedMessage.timestamp,
      });
    }
  }

  async track(message: TrackMessage): Promise<void> {
    this.validateUserIdentity(message);
    const enrichedMessage = this.mergeContext(message);

    if (this.config.debug) {
      console.log('[Segment] Track:', enrichedMessage);
    }

    if (this.isNode && this.analytics) {
      this.analytics.track(enrichedMessage);
    } else if (!this.isNode && this.analytics) {
      this.analytics.track(enrichedMessage.event, enrichedMessage.properties, {
        context: enrichedMessage.context,
        integrations: enrichedMessage.integrations,
        timestamp: enrichedMessage.timestamp,
      });
    }
  }

  async page(message: PageMessage): Promise<void> {
    const enrichedMessage = this.mergeContext(message);

    if (this.config.debug) {
      console.log('[Segment] Page:', enrichedMessage);
    }

    if (this.isNode && this.analytics) {
      this.analytics.page(enrichedMessage);
    } else if (!this.isNode && this.analytics) {
      this.analytics.page(
        enrichedMessage.category,
        enrichedMessage.name,
        enrichedMessage.properties,
        {
          context: enrichedMessage.context,
          integrations: enrichedMessage.integrations,
          timestamp: enrichedMessage.timestamp,
        },
      );
    }
  }

  async screen(message: ScreenMessage): Promise<void> {
    const enrichedMessage = this.mergeContext(message);

    if (this.config.debug) {
      console.log('[Segment] Screen:', enrichedMessage);
    }

    if (this.isNode && this.analytics) {
      this.analytics.screen(enrichedMessage);
    } else if (!this.isNode && this.analytics) {
      this.analytics.screen(
        enrichedMessage.category,
        enrichedMessage.name,
        enrichedMessage.properties,
        {
          context: enrichedMessage.context,
          integrations: enrichedMessage.integrations,
          timestamp: enrichedMessage.timestamp,
        },
      );
    }
  }

  async group(message: GroupMessage): Promise<void> {
    this.validateUserIdentity(message);
    const enrichedMessage = this.mergeContext(message);

    if (this.config.debug) {
      console.log('[Segment] Group:', enrichedMessage);
    }

    if (this.isNode && this.analytics) {
      this.analytics.group(enrichedMessage);
    } else if (!this.isNode && this.analytics) {
      this.analytics.group(enrichedMessage.groupId, enrichedMessage.traits, {
        context: enrichedMessage.context,
        integrations: enrichedMessage.integrations,
        timestamp: enrichedMessage.timestamp,
      });
    }
  }

  async alias(message: AliasMessage): Promise<void> {
    const enrichedMessage = this.mergeContext(message);

    if (this.config.debug) {
      console.log('[Segment] Alias:', enrichedMessage);
    }

    if (this.isNode && this.analytics) {
      this.analytics.alias(enrichedMessage);
    } else if (!this.isNode && this.analytics) {
      this.analytics.alias(enrichedMessage.userId, enrichedMessage.previousId, {
        context: enrichedMessage.context,
        integrations: enrichedMessage.integrations,
        timestamp: enrichedMessage.timestamp,
      });
    }
  }

  async flush(): Promise<void> {
    if (this.isNode && this.analytics) {
      await this.analytics.flush();
    }
    // Browser analytics.js handles flushing automatically
  }

  async reset(): Promise<void> {
    await super.reset();
    if (!this.isNode && this.analytics) {
      this.analytics.reset();
    }
  }
}
