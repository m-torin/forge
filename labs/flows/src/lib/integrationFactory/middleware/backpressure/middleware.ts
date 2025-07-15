// middleware/backpressure/middleware.ts

import {
  createMiddleware,
  type Middleware,
  type MiddlewareContext,
} from '../base';
import type {
  BackpressureOptions,
  Queue,
  QueueMetrics,
  BackpressureMetadata,
} from './types';

class OperationQueue
  implements
    Queue<{
      context: MiddlewareContext;
      weight: number;
      timestamp: number;
    }>
{
  private queue: Array<{
    context: MiddlewareContext;
    weight: number;
    timestamp: number;
  }> = [];
  private metrics: QueueMetrics = {
    queueSize: 0,
    activeCount: 0,
    rejectedCount: 0,
    queueLatency: 0,
    utilizationRate: 0,
  };

  constructor(private maxSize: number) {}

  async enqueue(item: {
    context: MiddlewareContext;
    weight: number;
    timestamp: number;
  }): Promise<boolean> {
    if (this.queue.length >= this.maxSize) {
      this.metrics.rejectedCount++;
      return false;
    }

    this.queue.push(item);
    this.metrics.queueSize = this.queue.length;
    return true;
  }

  async dequeue() {
    const item = this.queue.shift();
    if (item) {
      this.metrics.queueSize = this.queue.length;
      this.metrics.queueLatency = Date.now() - item.timestamp;
    }
    return item;
  }

  size(): number {
    return this.queue.length;
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  clear(): void {
    this.queue = [];
    this.metrics.queueSize = 0;
  }

  getMetrics(): QueueMetrics {
    return { ...this.metrics };
  }

  updateActiveCount(delta: number): void {
    this.metrics.activeCount += delta;
    this.metrics.utilizationRate = this.metrics.activeCount / this.maxSize;
  }
}

export const createBackpressureMiddleware = (
  options: BackpressureOptions = {},
): Middleware => {
  const {
    maxConcurrent = 100,
    maxQueueSize = 1000,
    queueTimeout = 30000,
    shedStrategy = 'reject',
    samplingRate = 0.1,
    getWeight = () => 1,
  } = options;

  const queue = new OperationQueue(maxQueueSize);
  let activeOperations = 0;

  const shouldSample = () => Math.random() < samplingRate;

  return createMiddleware(async (context, next) => {
    const startTime = Date.now();
    const weight = getWeight(context);

    // Check if we can process immediately
    if (activeOperations < maxConcurrent) {
      activeOperations++;
      queue.updateActiveCount(1);

      try {
        const result = await next();
        return {
          ...result,
          metadata: {
            ...result.metadata,
            backpressure: {
              queued: false,
              weight,
            } as BackpressureMetadata,
          },
        };
      } finally {
        activeOperations--;
        queue.updateActiveCount(-1);
      }
    }

    // Handle queue overflow based on strategy
    if (queue.size() >= maxQueueSize) {
      switch (shedStrategy) {
        case 'reject':
          throw new Error('Operation rejected due to backpressure');
        case 'drop-newest':
          return {
            error: new Error('Operation dropped due to backpressure'),
            metadata: {
              backpressure: {
                rejected: true,
                weight,
              },
            },
            duration: 0,
          };
        case 'drop-oldest':
          queue.dequeue(); // Drop oldest
          break;
        case 'timeout':
          // Continue to queue but with timeout
          break;
      }
    }

    // Queue the operation
    const queueSuccess = await queue.enqueue({
      context,
      weight,
      timestamp: startTime,
    });

    if (!queueSuccess) {
      throw new Error('Queue capacity exceeded');
    }

    // Wait for our turn with timeout
    const timeoutPromise = new Promise((_resolve, reject) => {
      setTimeout(() => {
        reject(new Error('Queue timeout exceeded'));
      }, queueTimeout);
    });

    try {
      await Promise.race([
        new Promise<void>((resolve) => {
          const checkQueue = () => {
            if (activeOperations < maxConcurrent) {
              resolve();
            } else {
              setTimeout(checkQueue, 100);
            }
          };
          checkQueue();
        }),
        timeoutPromise,
      ]);

      activeOperations++;
      queue.updateActiveCount(1);

      const result = await next();
      const queueTime = Date.now() - startTime;

      if (shouldSample()) {
        // Sample metrics
        const metrics = queue.getMetrics();
        context.metadata.queueMetrics = metrics;
      }

      return {
        ...result,
        metadata: {
          ...result.metadata,
          backpressure: {
            queued: true,
            queueTime,
            weight,
          } as BackpressureMetadata,
        },
      };
    } finally {
      activeOperations--;
      queue.updateActiveCount(-1);
    }
  });
};
