/**
 * PostHog client-side (browser) provider implementation
 */

import type { AnalyticsProvider, ProviderConfig } from '../types';
import type { PostHogConfig } from './types';

declare global {
  interface Window {
    posthog?: {
      init: (apiKey: string, options?: any) => void;
      capture: (event: string, properties?: any) => void;
      identify: (userId: string, properties?: any) => void;
      reset: () => void;
      group: (groupType: string, groupKey: string, properties?: any) => void;
      alias: (alias: string) => void;
      people?: {
        set: (properties: any) => void;
        set_once: (properties: any) => void;
      };
      register: (properties: any) => void;
      isFeatureEnabled: (flag: string) => boolean;
      getFeatureFlag: (flag: string) => any;
      onFeatureFlags: (callback: (flags: string[], variants: Record<string, any>) => void) => void;
    };
  }
}

export class PostHogClientProvider implements AnalyticsProvider {
  readonly name = 'posthog';
  private config: PostHogConfig;
  private isInitialized = false;

  constructor(config: ProviderConfig) {
    if (!config.apiKey) {
      throw new Error('PostHog apiKey is required');
    }
    
    this.config = {
      apiKey: config.apiKey,
      options: config.options
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Dynamically import PostHog
      const { default: posthog } = await import('posthog-js');
      
      // Initialize PostHog
      posthog.init(this.config.apiKey, {
        api_host: 'https://app.posthog.com',
        ...this.config.options
      });
      
      // Make it available globally
      window.posthog = posthog;
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize PostHog client provider:', error);
      throw new Error('PostHog JS SDK not available. Install with: npm install posthog-js');
    }
  }

  async track(event: string, properties: any = {}): Promise<void> {
    if (!this.isInitialized || !window.posthog) {
      console.warn('PostHog not initialized, cannot track event:', event);
      return;
    }

    try {
      window.posthog.capture(event, properties);
    } catch (error) {
      console.error('PostHog track error:', error);
    }
  }

  async identify(userId: string, traits: any = {}): Promise<void> {
    if (!this.isInitialized || !window.posthog) {
      console.warn('PostHog not initialized, cannot identify user');
      return;
    }

    try {
      window.posthog.identify(userId, traits);
    } catch (error) {
      console.error('PostHog identify error:', error);
    }
  }

  async page(name?: string, properties: any = {}): Promise<void> {
    if (!this.isInitialized || !window.posthog) {
      console.warn('PostHog not initialized, cannot track page');
      return;
    }

    try {
      window.posthog.capture('$pageview', {
        $current_url: window.location.href,
        $title: name || document.title,
        ...properties
      });
    } catch (error) {
      console.error('PostHog page error:', error);
    }
  }

  async group(groupId: string, traits: any = {}): Promise<void> {
    if (!this.isInitialized || !window.posthog) {
      console.warn('PostHog not initialized, cannot track group');
      return;
    }

    try {
      window.posthog.group('company', groupId, traits);
    } catch (error) {
      console.error('PostHog group error:', error);
    }
  }

  async alias(userId: string, previousId: string): Promise<void> {
    if (!this.isInitialized || !window.posthog) {
      console.warn('PostHog not initialized, cannot alias user');
      return;
    }

    try {
      window.posthog.alias(userId);
    } catch (error) {
      console.error('PostHog alias error:', error);
    }
  }
}