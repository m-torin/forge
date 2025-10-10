/**
 * Vercel Analytics Next.js server-side integration
 */

import { VercelAnalyticsAdapter } from './client';
import type { VercelAnalyticsConfig } from './types';

export class VercelServerAnalytics extends VercelAnalyticsAdapter {
  constructor(config: VercelAnalyticsConfig) {
    super(config);
  }

  protected async doInitialize(): Promise<void> {
    // Server-side initialization for Vercel Analytics
    // Vercel Analytics is primarily client-side, but we can set up
    // server-side tracking for specific events
    this.log('info', 'Vercel Analytics server adapter initialized');
  }

  // Server-side specific methods
  public async trackServerSideEvent(
    eventName: string,
    properties?: Record<string, string | number | boolean>,
  ): Promise<boolean> {
    // For server-side events, we could log them or queue them
    // to be sent when the page loads on the client
    try {
      this.log('debug', 'Server-side event tracked', { eventName, properties });
      return true;
    } catch (error) {
      this.log('error', 'Failed to track server-side event', error);
      return false;
    }
  }
}

export function createServerAnalytics(config: VercelAnalyticsConfig) {
  return new VercelServerAnalytics(config);
}
