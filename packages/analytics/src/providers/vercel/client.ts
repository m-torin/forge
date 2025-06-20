/**
 * Vercel Analytics client-side (browser) provider implementation
 */

import type { AnalyticsProvider, ProviderConfig } from '../../shared/types/types';
import type { VercelConfig } from './types';

// Vercel Analytics types are handled by @vercel/analytics package

export class VercelClientProvider implements AnalyticsProvider {
  readonly name = 'vercel';
  private config: VercelConfig;
  private isInitialized = false;

  constructor(config: ProviderConfig) {
    this.config = {
      options: config.options,
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Dynamically import Vercel Analytics
      const { inject } = await import('@vercel/analytics');

      // Initialize Vercel Analytics
      inject(this.config.options);

      this.isInitialized = true;
    } catch (_error) {
      throw new Error(
        'Vercel Analytics not available. Install with: npm install @vercel/analytics',
      );
    }
  }

  async track(event: string, properties: any = {}): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      // Import track function dynamically to avoid SSR issues
      const { track } = await import('@vercel/analytics');
      track(event, properties);
    } catch (_error) {
      // Silently fail to avoid disrupting app flow
    }
  }

  async identify(userId: string, traits: any = {}): Promise<void> {
    // Vercel Analytics doesn't have a native identify method
    // We can track this as a custom event
    await this.track('User Identified', {
      userId,
      ...traits,
    });
  }

  async page(name?: string, properties: any = {}): Promise<void> {
    // Vercel Analytics automatically tracks page views
    // We can track additional page data as custom events if needed
    if (name || Object.keys(properties).length > 0) {
      await this.track('Page View', {
        page: name,
        ...properties,
      });
    }
  }

  async group(groupId: string, traits: any = {}): Promise<void> {
    // Vercel Analytics doesn't have a native group method
    // We can track this as a custom event
    await this.track('Group Identified', {
      groupId,
      ...traits,
    });
  }

  async alias(userId: string, previousId: string): Promise<void> {
    // Vercel Analytics doesn't have a native alias method
    // We can track this as a custom event
    await this.track('User Aliased', {
      previousId,
      userId,
    });
  }
}
