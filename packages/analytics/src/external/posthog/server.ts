/**
 * PostHog server-side (Node.js) provider implementation
 */

import type { AnalyticsProvider, ProviderConfig } from '../types';
import type { PostHogConfig } from './types';

export class PostHogServerProvider implements AnalyticsProvider {
  readonly name = 'posthog';
  private config: PostHogConfig;
  private client: any = null;
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
      // Dynamically import PostHog Node.js SDK
      const { PostHog } = await import('posthog-node');
      
      this.client = new PostHog(this.config.apiKey, {
        host: 'https://app.posthog.com',
        ...this.config.options
      });
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize PostHog server provider:', error);
      throw new Error('PostHog Node.js SDK not available. Install with: npm install posthog-node');
    }
  }

  async track(event: string, properties: any = {}): Promise<void> {
    if (!this.isInitialized || !this.client) {
      console.warn('PostHog not initialized, cannot track event:', event);
      return;
    }

    try {
      this.client.capture({
        event,
        properties,
        distinctId: properties.userId || properties.distinctId || 'anonymous'
      });
    } catch (error) {
      console.error('PostHog track error:', error);
    }
  }

  async identify(userId: string, traits: any = {}): Promise<void> {
    if (!this.isInitialized || !this.client) {
      console.warn('PostHog not initialized, cannot identify user');
      return;
    }

    try {
      this.client.identify({
        distinctId: userId,
        properties: traits
      });
    } catch (error) {
      console.error('PostHog identify error:', error);
    }
  }

  async page(name?: string, properties: any = {}): Promise<void> {
    if (!this.isInitialized || !this.client) {
      console.warn('PostHog not initialized, cannot track page');
      return;
    }

    try {
      this.client.capture({
        event: '$pageview',
        distinctId: properties.userId || properties.distinctId || 'anonymous',
        properties: {
          $current_url: properties.url,
          $title: name,
          ...properties
        }
      });
    } catch (error) {
      console.error('PostHog page error:', error);
    }
  }

  async group(groupId: string, traits: any = {}): Promise<void> {
    if (!this.isInitialized || !this.client) {
      console.warn('PostHog not initialized, cannot track group');
      return;
    }

    try {
      this.client.groupIdentify({
        groupType: 'company',
        groupKey: groupId,
        properties: traits
      });
    } catch (error) {
      console.error('PostHog group error:', error);
    }
  }

  async alias(userId: string, previousId: string): Promise<void> {
    if (!this.isInitialized || !this.client) {
      console.warn('PostHog not initialized, cannot alias user');
      return;
    }

    try {
      this.client.alias({
        distinctId: userId,
        alias: previousId
      });
    } catch (error) {
      console.error('PostHog alias error:', error);
    }
  }
}