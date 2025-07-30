// middleware/backpressure/types.ts

import type { MiddlewareContext } from '../base';

export interface BackpressureOptions {
  maxConcurrent?: number; // Max concurrent operations
  maxQueueSize?: number; // Max items in queue
  queueTimeout?: number; // Max time in queue (ms)
  shedStrategy?: ShedStrategy; // How to handle overload
  samplingRate?: number; // Metric sampling (0-1)
  getWeight?: (context: MiddlewareContext) => number; // Operation weight
}

export type ShedStrategy = 'reject' | 'drop-newest' | 'drop-oldest' | 'timeout';

export interface QueueMetrics {
  queueSize: number;
  activeCount: number;
  rejectedCount: number;
  queueLatency: number;
  utilizationRate: number;
}

export interface BackpressureMetadata {
  queued: boolean;
  queueTime?: number;
  rejected?: boolean;
  weight: number;
}

export interface Queue<T> {
  enqueue(item: T): Promise<boolean>;
  dequeue(): Promise<T | undefined>;
  size(): number;
  isEmpty(): boolean;
  clear(): void;
}

export class QueueFullError extends Error {
  constructor(message = 'Queue capacity exceeded') {
    super(message);
    this.name = 'QueueFullError';
  }
}
