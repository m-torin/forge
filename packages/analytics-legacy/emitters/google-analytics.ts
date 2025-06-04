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

interface GoogleAnalyticsConfig extends AnalyticsConfig {
  measurementId: string;
}

/**
 * Google Analytics 4 (GA4) Analytics Emitter
 * Works primarily in browser environments
 */
export class GoogleAnalyticsEmitter extends BaseAnalyticsEmitter {
  private gtag: any;
  private measurementId: string;
  private userProperties: Record<string, any> = {};

  constructor(config: GoogleAnalyticsConfig) {
    super(config);
    this.measurementId = config.measurementId;
    this.initializeGA();
  }

  private async initializeGA(): Promise<void> {
    // Only works in browser environment
    if (typeof window === 'undefined') {
      console.warn('[GoogleAnalytics] GA4 only works in browser environments');
      return;
    }

    // Check if gtag is already loaded
    if ((window as any).gtag) {
      this.gtag = (window as any).gtag;
      return;
    }

    // Load GA4 script
    await this.loadGAScript();
  }

  private async loadGAScript(): Promise<void> {
    return new Promise((resolve) => {
      // Initialize dataLayer
      (window as any).dataLayer = (window as any).dataLayer || [];

      // Define gtag function
      (window as any).gtag = function (...args: any[]) {
        (window as any).dataLayer.push(args);
      };

      this.gtag = (window as any).gtag;

      // Set default consent (adjust based on your requirements)
      this.gtag('consent', 'default', {
        ad_storage: 'denied',
        analytics_storage: 'granted',
      });

      // Configure GA4
      this.gtag('js', new Date());
      this.gtag('config', this.measurementId, {
        debug_mode: this.config.debug,
        send_page_view: false, // We'll handle page views manually
      });

      // Load the GA4 script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
      script.onload = () => {
        if (this.config.debug) {
          console.log('[GoogleAnalytics] GA4 loaded successfully');
        }
        resolve();
      };
      document.head.appendChild(script);
    });
  }

  async identify(message: IdentifyMessage): Promise<void> {
    if (!this.gtag) return;

    const enrichedMessage = this.mergeContext(message);

    if (this.config.debug) {
      console.log('[GoogleAnalytics] Identify:', enrichedMessage);
    }

    // Set user ID if provided
    if (message.userId) {
      this.gtag('set', {
        user_id: message.userId,
      });
    }

    // Store user properties for future events
    if (message.traits) {
      this.userProperties = {
        ...this.userProperties,
        ...message.traits,
      };

      // Set user properties in GA4
      this.gtag('set', {
        user_properties: this.userProperties,
      });
    }
  }

  async track(message: TrackMessage): Promise<void> {
    if (!this.gtag) return;

    this.validateUserIdentity(message);
    const enrichedMessage = this.mergeContext(message);

    if (this.config.debug) {
      console.log('[GoogleAnalytics] Track:', enrichedMessage);
    }

    // Map to GA4 event name format (snake_case)
    const eventName = this.formatEventName(message.event);

    // Prepare event parameters
    const eventParams: Record<string, any> = {
      ...message.properties,
      ...this.userProperties,
    };

    // Add user ID if available
    if (message.userId) {
      eventParams.user_id = message.userId;
    }

    // Add standard e-commerce parameters if present
    if (message.properties?.revenue) {
      eventParams.value = message.properties.revenue;
      eventParams.currency = message.properties.currency || 'USD';
    }

    this.gtag('event', eventName, eventParams);
  }

  async page(message: PageMessage): Promise<void> {
    if (!this.gtag) return;

    const enrichedMessage = this.mergeContext(message);

    if (this.config.debug) {
      console.log('[GoogleAnalytics] Page:', enrichedMessage);
    }

    const pageParams: Record<string, any> = {
      page_location: enrichedMessage.context?.page?.url || window.location.href,
      page_path: enrichedMessage.context?.page?.path || window.location.pathname,
      page_title: message.name || enrichedMessage.context?.page?.title || document.title,
      ...message.properties,
      ...this.userProperties,
    };

    // Add referrer if available
    if (enrichedMessage.context?.page?.referrer) {
      pageParams.page_referrer = enrichedMessage.context.page.referrer;
    }

    // Add user ID if available
    if (message.userId) {
      pageParams.user_id = message.userId;
    }

    this.gtag('event', 'page_view', pageParams);
  }

  async screen(message: ScreenMessage): Promise<void> {
    if (!this.gtag) return;

    const enrichedMessage = this.mergeContext(message);

    if (this.config.debug) {
      console.log('[GoogleAnalytics] Screen:', enrichedMessage);
    }

    const screenParams: Record<string, any> = {
      screen_name: message.name,
      screen_category: message.category,
      ...message.properties,
      ...this.userProperties,
    };

    // Add user ID if available
    if (message.userId) {
      screenParams.user_id = message.userId;
    }

    this.gtag('event', 'screen_view', screenParams);
  }

  async group(message: GroupMessage): Promise<void> {
    if (!this.gtag) return;

    this.validateUserIdentity(message);
    const enrichedMessage = this.mergeContext(message);

    if (this.config.debug) {
      console.log('[GoogleAnalytics] Group:', enrichedMessage);
    }

    // GA4 doesn't have native group support, so we track it as user properties
    const groupProperties = {
      group_id: message.groupId,
      ...Object.entries(message.traits || {}).reduce(
        (acc, [key, value]) => {
          acc[`group_${key}`] = value;
          return acc;
        },
        {} as Record<string, any>,
      ),
    };

    this.userProperties = {
      ...this.userProperties,
      ...groupProperties,
    };

    this.gtag('set', {
      user_properties: this.userProperties,
    });

    // Also track as an event
    this.gtag('event', 'join_group', {
      group_id: message.groupId,
      ...message.traits,
    });
  }

  async alias(message: AliasMessage): Promise<void> {
    if (!this.gtag) return;

    const enrichedMessage = this.mergeContext(message);

    if (this.config.debug) {
      console.log('[GoogleAnalytics] Alias:', enrichedMessage);
    }

    // GA4 doesn't support aliasing directly, but we can track it as an event
    this.gtag('event', 'user_alias', {
      previous_id: message.previousId,
      user_id: message.userId,
    });

    // Update the user ID
    this.gtag('set', {
      user_id: message.userId,
    });
  }

  /**
   * Format event names to GA4 convention (snake_case)
   */
  private formatEventName(eventName: string): string {
    // Common event mappings
    const eventMappings: Record<string, string> = {
      'Cart Viewed': 'view_cart',
      'Checkout Started': 'begin_checkout',
      'Order Completed': 'purchase',
      'Product Added': 'add_to_cart',
      'Product Removed': 'remove_from_cart',
      'Product Searched': 'search',
      'Product Viewed': 'view_item',
      'Signed In': 'login',
      'Signed Up': 'sign_up',
    };

    if (eventMappings[eventName]) {
      return eventMappings[eventName];
    }

    // Convert to snake_case
    return eventName
      .replace(/\s+/g, '_')
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '')
      .replace(/_+/g, '_');
  }
}
