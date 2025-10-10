/**
 * Segment Next.js server-side integration
 */

import { SegmentServerAnalytics } from './server';
import type { SegmentConfig } from './types';

export class SegmentNextServerAnalytics extends SegmentServerAnalytics {
  constructor(config: SegmentConfig) {
    super({
      ...config,
      // Next.js server optimizations
      flushAt: config.flushAt || 10,
      flushInterval: config.flushInterval || 5000,
    });
  }
}

export function createNextServerAnalytics(config: SegmentConfig) {
  return new SegmentNextServerAnalytics(config);
}
