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

interface PostHogConfig extends AnalyticsConfig {
  apiHost?: string;
  apiKey: string;
}

/**
 * PostHog Analytics Emitter
 * Works in both browser and Node.js environments
 */
export class PostHogEmitter extends BaseAnalyticsEmitter {
  private posthog: any;
  private isNode: boolean;

  constructor(config: PostHogConfig) {
    super({
      apiHost: 'https://app.posthog.com',
      ...config,
    });

    this.isNode = typeof window === 'undefined';
    this.initializePostHog();
  }

  private async initializePostHog(): Promise<void> {
    if (this.isNode) {
      // Node.js environment
      try {
        const { PostHog } = await import('posthog-node');
        this.posthog = new PostHog((this.config as PostHogConfig).apiKey, {
          flushAt: this.config.flushAt || 20,
          flushInterval: this.config.flushInterval || 10000,
          host: this.config.apiHost,
        });
      } catch (error) {
        console.error('[PostHog] Failed to initialize Node.js client:', error);
      }
    } else {
      // Browser environment
      try {
        const posthogLib = await import('posthog-js');
        this.posthog = posthogLib.default;
        this.posthog.init((this.config as PostHogConfig).apiKey, {
          api_host: this.config.apiHost,
          debug: this.config.debug,
          disable_session_recording: true,
          loaded: (posthog: any) => {
            if (this.config.debug) {
              console.log('[PostHog] Loaded successfully');
            }
          },
        });
      } catch (error) {
        console.error('[PostHog] Failed to initialize browser client:', error);
      }
    }
  }

  async identify(message: IdentifyMessage): Promise<void> {
    const enrichedMessage = this.mergeContext(message);
    
    if (this.config.debug) {
      console.log('[PostHog] Identify:', enrichedMessage);
    }

    if (!this.posthog) return;

    if (this.isNode) {
      this.posthog.identify({
        distinctId: message.userId || message.anonymousId!,
        properties: {
          ...message.traits,
          $set: message.traits,
        },
      });
    } else {
      this.posthog.identify(
        message.userId || message.anonymousId,
        message.traits
      );
    }
  }

  async track(message: TrackMessage): Promise<void> {
    this.validateUserIdentity(message);
    const enrichedMessage = this.mergeContext(message);
    
    if (this.config.debug) {
      console.log('[PostHog] Track:', enrichedMessage);
    }

    if (!this.posthog) return;

    const properties = {
      ...message.properties,
      ...enrichedMessage.context,
    };

    if (this.isNode) {
      this.posthog.capture({
        distinctId: message.userId || message.anonymousId!,
        event: message.event,
        properties,
        timestamp: enrichedMessage.timestamp,
      });
    } else {
      this.posthog.capture(message.event, properties);
    }
  }

  async page(message: PageMessage): Promise<void> {
    const enrichedMessage = this.mergeContext(message);
    
    if (this.config.debug) {
      console.log('[PostHog] Page:', enrichedMessage);
    }

    if (!this.posthog) return;

    const properties = {
      ...message.properties,
      $pathname: enrichedMessage.context?.page?.path,
      name: message.name,
      $current_url: enrichedMessage.context?.page?.url,
      $host: enrichedMessage.context?.page?.url ? new URL(enrichedMessage.context.page.url).host : undefined,
      $referrer: enrichedMessage.context?.page?.referrer,
      category: message.category,
    };

    if (this.isNode) {
      this.posthog.capture({
        distinctId: message.userId || message.anonymousId || 'anonymous',
        event: '$pageview',
        properties,
        timestamp: enrichedMessage.timestamp,
      });
    } else {
      this.posthog.capture('$pageview', properties);
    }
  }

  async screen(message: ScreenMessage): Promise<void> {
    const enrichedMessage = this.mergeContext(message);
    
    if (this.config.debug) {
      console.log('[PostHog] Screen:', enrichedMessage);
    }

    if (!this.posthog) return;

    const properties = {
      ...message.properties,
      $screen_name: message.name,
      name: message.name,
      $screen_category: message.category,
      category: message.category,
    };

    if (this.isNode) {
      this.posthog.capture({
        distinctId: message.userId || message.anonymousId || 'anonymous',
        event: '$screen',
        properties,
        timestamp: enrichedMessage.timestamp,
      });
    } else {
      this.posthog.capture('$screen', properties);
    }
  }

  async group(message: GroupMessage): Promise<void> {
    this.validateUserIdentity(message);
    const enrichedMessage = this.mergeContext(message);
    
    if (this.config.debug) {
      console.log('[PostHog] Group:', enrichedMessage);
    }

    if (!this.posthog) return;

    if (this.isNode) {
      this.posthog.groupIdentify({
        groupKey: message.groupId,
        groupType: 'company',
        properties: message.traits,
      });
      
      // Associate user with group
      this.posthog.capture({
        distinctId: message.userId || message.anonymousId!,
        event: '$groupidentify',
        properties: {
          $group_type: 'company',
          $group_key: message.groupId,
          $group_set: message.traits,
        },
      });
    } else {
      this.posthog.group('company', message.groupId, message.traits);
    }
  }

  async alias(message: AliasMessage): Promise<void> {
    const enrichedMessage = this.mergeContext(message);
    
    if (this.config.debug) {
      console.log('[PostHog] Alias:', enrichedMessage);
    }

    if (!this.posthog) return;

    if (this.isNode) {
      this.posthog.alias({
        alias: message.userId,
        distinctId: message.previousId,
      });
    } else {
      this.posthog.alias(message.userId, message.previousId);
    }
  }

  async flush(): Promise<void> {
    if (this.isNode && this.posthog) {
      await this.posthog.flush();
    }
    // Browser PostHog handles flushing automatically
  }

  async reset(): Promise<void> {
    await super.reset();
    if (!this.isNode && this.posthog) {
      this.posthog.reset();
    }
    if (this.isNode && this.posthog) {
      await this.posthog.shutdown();
    }
  }
}