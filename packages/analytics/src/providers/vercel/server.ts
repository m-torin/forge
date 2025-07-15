/**
 * Vercel Analytics server-side (Node.js) provider implementation
 *
 * Note: Vercel Analytics is primarily client-side focused.
 * Server-side tracking is limited and mainly for custom events.
 */

import type { AnalyticsProvider, ProviderConfig } from '../../shared/types/types';
import type { VercelConfig } from './types';

export class VercelServerProvider implements AnalyticsProvider {
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

    // Vercel Analytics doesn't require server-side initialization
    // Just mark as initialized
    this.isInitialized = true;

    // Note: Limited server-side support. Consider using client-side tracking for better features.
  }

  async track(event: string, _properties: any = {}): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      // For server-side, we can use Vercel's Speed Insights API if available
      // Server-side tracking is limited - most tracking happens client-side
      // In production, you might want to send to Vercel's API endpoint
      // This would require additional setup and is not part of the standard SDK
    } catch (_error) {
      // Silently fail to avoid disrupting app flow
    }
  }

  async identify(userId: string, traits: any = {}): Promise<void> {
    // Track as custom event on server
    await this.track('User Identified', {
      userId,
      ...traits,
    });
  }

  async page(name?: string, properties: any = {}): Promise<void> {
    // Track page view on server (limited utility)
    await this.track('Page View (Server)', {
      page: name,
      ...properties,
    });
  }

  async group(groupId: string, traits: any = {}): Promise<void> {
    // Track as custom event on server
    await this.track('Group Identified', {
      groupId,
      ...traits,
    });
  }

  async alias(userId: string, previousId: string): Promise<void> {
    // Track as custom event on server
    await this.track('User Aliased', {
      previousId,
      userId,
    });
  }
}
