/**
 * Segment Node.js server integration
 */

import { SegmentAdapter } from './client';
import type { SegmentConfig } from './types';

export class SegmentServerAnalytics extends SegmentAdapter {
  constructor(config: SegmentConfig) {
    // Ensure server-optimized configuration
    super({
      ...config,
      flushAt: config.flushAt || 20,
      flushInterval: config.flushInterval || 10000,
      maxEventsInBatch: config.maxEventsInBatch || 500,
      httpKeepalive: config.httpKeepalive !== false,
      timeout: config.timeout || 15000,
    });
  }

  // Server-specific methods for batch operations
  public async batchTrack(
    events: Array<{
      event: string;
      properties?: Record<string, any>;
      userId?: string;
      anonymousId?: string;
      timestamp?: Date | string;
    }>,
  ): Promise<boolean> {
    try {
      const promises = events.map(event =>
        this.track({
          name: event.event,
          properties: event.properties,
          userId: event.userId,
          anonymousId: event.anonymousId,
          timestamp: event.timestamp,
        }),
      );

      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled').length;

      this.log('debug', `Batch tracked ${successful}/${events.length} events`);
      return successful > 0;
    } catch (error) {
      this.log('error', 'Failed to batch track events', error);
      return false;
    }
  }
}

export function createServerAnalytics(config: SegmentConfig) {
  return new SegmentServerAnalytics(config);
}
