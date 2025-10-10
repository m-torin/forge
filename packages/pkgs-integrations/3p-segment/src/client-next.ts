/**
 * Segment Next.js client-side integration
 */

'use client';

import { SegmentAdapter } from './client';
import type { SegmentConfig } from './types';

export class SegmentNextClientAnalytics extends SegmentAdapter {
  constructor(config: SegmentConfig) {
    super({
      ...config,
      // Next.js client optimizations
      flushAt: config.flushAt || 10,
      flushInterval: config.flushInterval || 10000,
    });
  }

  protected async doInitialize(): Promise<void> {
    await super.doInitialize();
    this.setupNextRouterIntegration();
  }

  private setupNextRouterIntegration(): void {
    if (typeof window === 'undefined') return;

    try {
      // Track Next.js navigation
      const handleRouteChange = (url: string) => {
        this.page({
          name: document.title,
          properties: {
            url,
            path: new URL(url, window.location.origin).pathname,
            framework: 'nextjs',
          },
        });
      };

      // Next.js App Router navigation events
      if ('navigation' in window && 'addEventListener' in (window as any).navigation) {
        (window as any).navigation.addEventListener('navigate', (event: any) => {
          if (event.destination?.url) {
            handleRouteChange(event.destination.url);
          }
        });
      }

      this.log('debug', 'Next.js router integration setup complete');
    } catch (error) {
      this.log('warn', 'Failed to setup Next.js router integration', error);
    }
  }
}

export function createNextClientAnalytics(config: SegmentConfig) {
  return new SegmentNextClientAnalytics(config);
}
