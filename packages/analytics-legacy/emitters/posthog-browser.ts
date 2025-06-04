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
 * Browser-only PostHog Analytics Emitter
 * Only uses posthog-js, no Node.js dependencies
 */
export class PostHogBrowserEmitter extends BaseAnalyticsEmitter {
  private posthog: any;

  constructor(config: PostHogConfig) {
    super({
      apiHost: 'https://app.posthog.com',
      ...config,
    });

    this.initializePostHog();
  }

  private async initializePostHog(): Promise<void> {
    try {
      const posthogLib = await import('posthog-js');
      this.posthog = posthogLib.default;
      this.posthog.init((this.config as PostHogConfig).apiKey, {
        api_host: this.config.apiHost,
        debug: this.config.debug,
        disable_session_recording: true,
        loaded: (_posthog: any) => {
          if (this.config.debug) {
            console.log('[PostHog] Loaded successfully');
          }
        },
      });
    } catch (error) {
      console.error('[PostHog] Failed to initialize browser client:', error);
    }
  }

  async identify(message: IdentifyMessage): Promise<void> {
    const enrichedMessage = this.mergeContext(message);

    if (this.config.debug) {
      console.log('[PostHog] Identify:', enrichedMessage);
    }

    if (!this.posthog) return;

    this.posthog.identify(message.userId || message.anonymousId, message.traits);
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

    this.posthog.capture(message.event, properties);
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
      $host: enrichedMessage.context?.page?.url
        ? new URL(enrichedMessage.context.page.url).host
        : undefined,
      $referrer: enrichedMessage.context?.page?.referrer,
      category: message.category,
    };

    this.posthog.capture('$pageview', properties);
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

    this.posthog.capture('$screen', properties);
  }

  async group(message: GroupMessage): Promise<void> {
    this.validateUserIdentity(message);
    const enrichedMessage = this.mergeContext(message);

    if (this.config.debug) {
      console.log('[PostHog] Group:', enrichedMessage);
    }

    if (!this.posthog) return;

    this.posthog.group('company', message.groupId, message.traits);
  }

  async alias(message: AliasMessage): Promise<void> {
    const enrichedMessage = this.mergeContext(message);

    if (this.config.debug) {
      console.log('[PostHog] Alias:', enrichedMessage);
    }

    if (!this.posthog) return;

    this.posthog.alias(message.userId, message.previousId);
  }

  async flush(): Promise<void> {
    // Browser PostHog handles flushing automatically
  }

  async reset(): Promise<void> {
    await super.reset();
    if (this.posthog) {
      this.posthog.reset();
    }
  }
}