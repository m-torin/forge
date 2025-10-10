/**
 * Composable Batching Utility - Tree-shaking optimized
 * Only imported when batching functionality is needed
 */

import type { MinimalAdapter } from '../adapters/minimal-adapter';
import type { AnalyticsEvent, GroupPayload, IdentifyPayload, PagePayload } from '../types';

export interface BatchingConfig {
  maxSize?: number;
  flushInterval?: number;
  enabled?: boolean;
}

interface BatchItem {
  type: 'track' | 'identify' | 'group' | 'page';
  payload: any;
  timestamp: Date;
  resolve: (value: boolean) => void;
  reject: (error: Error) => void;
}

class EventBatcher {
  private batch: BatchItem[] = [];
  private flushTimer?: NodeJS.Timeout;

  constructor(
    private config: BatchingConfig,
    private processBatch: (batch: BatchItem[]) => Promise<boolean>,
  ) {
    this.startFlushTimer();
  }

  async add(item: Omit<BatchItem, 'resolve' | 'reject'>): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.batch.push({
        ...item,
        resolve,
        reject,
      });

      if (this.batch.length >= (this.config.maxSize || 100)) {
        this.flush();
      }
    });
  }

  async flush(): Promise<boolean> {
    if (this.batch.length === 0) return true;

    const currentBatch = [...this.batch];
    this.batch = [];

    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.startFlushTimer();
    }

    try {
      const success = await this.processBatch(currentBatch);

      currentBatch.forEach(item => {
        item.resolve(success);
      });

      return success;
    } catch (error) {
      currentBatch.forEach(item => {
        item.reject(error as Error);
      });
      return false;
    }
  }

  destroy(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }

    // Reject any pending items
    this.batch.forEach(item => {
      item.reject(new Error('Batcher destroyed'));
    });
    this.batch = [];
  }

  private startFlushTimer(): void {
    const interval = this.config.flushInterval || 5000;
    this.flushTimer = setTimeout(() => {
      this.flush();
    }, interval);
  }
}

export function withBatching(
  adapter: MinimalAdapter,
  batchingConfig?: BatchingConfig,
): MinimalAdapter {
  if (!batchingConfig?.enabled) {
    return adapter; // No batching, return original adapter
  }

  const batcher = new EventBatcher(batchingConfig, async batch => {
    // Process batch through the adapter
    const results = await Promise.allSettled(
      batch.map(async item => {
        switch (item.type) {
          case 'track':
            return adapter.track(item.payload);
          case 'identify':
            return adapter.identify(item.payload);
          case 'group':
            return adapter.group(item.payload);
          case 'page':
            return adapter.page(item.payload);
          default:
            return false;
        }
      }),
    );

    // Return true if all succeeded
    return results.every(result => result.status === 'fulfilled' && result.value === true);
  });

  return {
    ...adapter,
    async track(event: AnalyticsEvent): Promise<boolean> {
      return batcher.add({
        type: 'track',
        payload: event,
        timestamp: new Date(),
      });
    },

    async identify(payload: IdentifyPayload): Promise<boolean> {
      return batcher.add({
        type: 'identify',
        payload,
        timestamp: new Date(),
      });
    },

    async group(payload: GroupPayload): Promise<boolean> {
      return batcher.add({
        type: 'group',
        payload,
        timestamp: new Date(),
      });
    },

    async page(payload: PagePayload): Promise<boolean> {
      return batcher.add({
        type: 'page',
        payload,
        timestamp: new Date(),
      });
    },

    async flush(): Promise<boolean> {
      const result = await batcher.flush();
      if (adapter.flush) {
        await adapter.flush();
      }
      return result;
    },

    async destroy(): Promise<void> {
      batcher.destroy();
      return adapter.destroy();
    },
  };
}
