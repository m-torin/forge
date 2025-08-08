/**
 * Backpressure Handling for Streams
 * Manage flow control and prevent overwhelming consumers
 */

import { logInfo, logWarn } from '@repo/observability/server/next';

/**
 * Backpressure configuration
 */
export interface BackpressureConfig {
  /** High water mark for buffering */
  highWaterMark?: number;
  /** Low water mark to resume */
  lowWaterMark?: number;
  /** Strategy when buffer is full */
  strategy?: 'buffer' | 'drop' | 'throttle' | 'block';
  /** Maximum buffer size */
  maxBufferSize?: number;
  /** Throttle rate in ms */
  throttleMs?: number;
  /** Memory management configuration */
  memory?: {
    /** Maximum memory usage in bytes (default: 50MB) */
    maxBytes?: number;
    /** Enable automatic garbage collection */
    autoGC?: boolean;
    /** Memory cleanup threshold in bytes */
    gcThreshold?: number;
  };
}

/**
 * Backpressure controller
 */
export class BackpressureController<T> {
  private buffer: T[] = [];
  private isPaused = false;
  private writeCallbacks: Array<() => void> = [];
  private config: Required<BackpressureConfig & { memory: Required<BackpressureConfig['memory']> }>;
  private metrics = {
    totalReceived: 0,
    totalDropped: 0,
    totalProcessed: 0,
    currentBufferSize: 0,
    maxBufferReached: 0,
    memoryReclaimed: 0,
    gcTriggered: 0,
  };
  // Memory optimization: track buffer memory usage
  private estimatedMemoryUsage = 0;
  private readonly ESTIMATED_ITEM_SIZE = 1024; // 1KB default estimate

  constructor(config: BackpressureConfig = {}) {
    this.config = {
      highWaterMark: config.highWaterMark || 100,
      lowWaterMark: config.lowWaterMark || 50,
      strategy: config.strategy || 'buffer',
      maxBufferSize: config.maxBufferSize || 1000,
      throttleMs: config.throttleMs || 10,
      memory: {
        maxBytes: config.memory?.maxBytes || 50 * 1024 * 1024, // 50MB
        autoGC: config.memory?.autoGC ?? true,
        gcThreshold: config.memory?.gcThreshold || 30 * 1024 * 1024, // 30MB
      },
    };

    // Validate water marks
    if (this.config.lowWaterMark >= this.config.highWaterMark) {
      throw new Error('Low water mark must be less than high water mark');
    }
  }

  /**
   * Check if can write
   */
  canWrite(): boolean {
    return !this.isPaused && this.buffer.length < this.config.highWaterMark;
  }

  /**
   * Write data with backpressure handling
   */
  async write(data: T): Promise<boolean> {
    this.metrics.totalReceived++;
    const itemSize = this.estimateItemSize(data);

    // Check memory limits before processing
    if (this.shouldRejectForMemory(itemSize)) {
      this.metrics.totalDropped++;
      logWarn('Backpressure: Dropped data due to memory limit', {
        operation: 'backpressure_memory_limit',
        metadata: {
          estimatedMemoryUsage: this.estimatedMemoryUsage,
          itemSize,
          bufferSize: this.buffer.length,
        },
      });
      return false;
    }

    // Check buffer capacity
    if (this.buffer.length >= this.config.maxBufferSize) {
      return this.handleOverflow(data);
    }

    // Apply strategy
    switch (this.config.strategy) {
      case 'drop':
        if (this.isPaused) {
          this.metrics.totalDropped++;
          logWarn('Backpressure: Dropped data due to pause', {
            operation: 'backpressure_drop',
            metadata: { bufferSize: this.buffer.length },
          });
          return false;
        }
        break;

      case 'throttle':
        await this.throttle();
        break;

      case 'block':
        await this.waitForDrain();
        break;
    }

    // Buffer the data
    this.buffer.push(data);
    this.estimatedMemoryUsage += itemSize;
    this.metrics.currentBufferSize = this.buffer.length;
    this.metrics.maxBufferReached = Math.max(this.metrics.maxBufferReached, this.buffer.length);

    // Check high water mark
    if (this.buffer.length >= this.config.highWaterMark) {
      this.pause();
    }

    return true;
  }

  /**
   * Read data from buffer
   */
  read(): T | undefined {
    const data = this.buffer.shift();

    if (data !== undefined) {
      // Update memory usage
      const itemSize = this.estimateItemSize(data);
      this.estimatedMemoryUsage = Math.max(0, this.estimatedMemoryUsage - itemSize);

      this.metrics.totalProcessed++;
      this.metrics.currentBufferSize = this.buffer.length;

      // Check low water mark
      if (this.isPaused && this.buffer.length <= this.config.lowWaterMark) {
        this.resume();
      }
    }

    return data;
  }

  /**
   * Read multiple items
   */
  readBatch(count: number): T[] {
    const batch: T[] = [];

    for (let i = 0; i < count && this.buffer.length > 0; i++) {
      const item = this.read();
      if (item !== undefined) {
        batch.push(item);
      }
    }

    return batch;
  }

  /**
   * Pause accepting new data
   */
  private pause(): void {
    this.isPaused = true;

    logInfo('Backpressure: Paused - high water mark reached', {
      operation: 'backpressure_pause',
      metadata: {
        bufferSize: this.buffer.length,
        highWaterMark: this.config.highWaterMark,
      },
    });
  }

  /**
   * Resume accepting new data
   */
  private resume(): void {
    this.isPaused = false;

    // Notify waiting writers
    this.writeCallbacks.forEach(callback => callback());
    this.writeCallbacks = [];

    logInfo('Backpressure: Resumed - low water mark reached', {
      operation: 'backpressure_resume',
      metadata: {
        bufferSize: this.buffer.length,
        lowWaterMark: this.config.lowWaterMark,
      },
    });
  }

  /**
   * Handle buffer overflow
   */
  private handleOverflow(data: T): boolean {
    const itemSize = this.estimateItemSize(data);

    switch (this.config.strategy) {
      case 'drop':
        this.metrics.totalDropped++;
        logWarn('Backpressure: Buffer overflow - dropping data', {
          operation: 'backpressure_overflow_drop',
          metadata: { maxBufferSize: this.config.maxBufferSize },
        });
        return false;

      case 'buffer':
      case 'throttle':
      case 'block':
        // Force drop oldest item and update memory usage
        const droppedItem = this.buffer.shift();
        if (droppedItem) {
          const droppedSize = this.estimateItemSize(droppedItem);
          this.estimatedMemoryUsage = Math.max(0, this.estimatedMemoryUsage - droppedSize);
        }

        this.buffer.push(data);
        this.estimatedMemoryUsage += itemSize;
        this.metrics.totalDropped++;
        logWarn('Backpressure: Buffer overflow - dropped oldest item', {
          operation: 'backpressure_overflow_rotate',
          metadata: {
            memoryUsage: this.getMemoryUsage(),
            bufferSize: this.buffer.length,
          },
        });
        return true;
    }
  }

  /**
   * Throttle writes
   */
  private async throttle(): Promise<void> {
    if (this.config.throttleMs > 0) {
      await new Promise(resolve => setTimeout(resolve, this.config.throttleMs));
    }
  }

  /**
   * Wait for buffer to drain
   */
  private async waitForDrain(): Promise<void> {
    if (!this.isPaused) {
      return;
    }

    return new Promise<void>(resolve => {
      this.writeCallbacks.push(resolve);
    });
  }

  /**
   * Get current metrics
   */
  getMetrics(): typeof this.metrics & {
    memoryUsage: { estimatedBytes: number; estimatedMB: number };
  } {
    return {
      ...this.metrics,
      memoryUsage: this.getMemoryUsage(),
    };
  }

  /**
   * Get buffer status
   */
  getStatus(): {
    bufferSize: number;
    isPaused: boolean;
    canWrite: boolean;
    fillPercentage: number;
    memoryUsage: { estimatedBytes: number; estimatedMB: number };
  } {
    return {
      bufferSize: this.buffer.length,
      isPaused: this.isPaused,
      canWrite: this.canWrite(),
      fillPercentage: (this.buffer.length / this.config.maxBufferSize) * 100,
      memoryUsage: this.getMemoryUsage(),
    };
  }

  /**
   * Clear buffer
   */
  clear(): void {
    const dropped = this.buffer.length;
    this.buffer = [];
    this.estimatedMemoryUsage = 0; // Reset memory usage
    this.metrics.totalDropped += dropped;
    this.metrics.currentBufferSize = 0;

    if (this.isPaused) {
      this.resume();
    }
  }

  /**
   * Memory optimization: estimate item size for memory tracking
   */
  private estimateItemSize(item: T): number {
    if (typeof item === 'string') {
      return item.length * 2; // 2 bytes per character in UTF-16
    }
    if (typeof item === 'object' && item !== null) {
      try {
        return JSON.stringify(item).length * 2;
      } catch {
        return this.ESTIMATED_ITEM_SIZE;
      }
    }
    return this.ESTIMATED_ITEM_SIZE;
  }

  /**
   * Memory optimization: check if item should be rejected for memory reasons
   */
  private shouldRejectForMemory(itemSize: number): boolean {
    return this.estimatedMemoryUsage + itemSize > (this.config.memory?.maxBytes || Infinity);
  }

  /**
   * Memory optimization: trigger garbage collection when memory usage is high
   */
  private tryMemoryCleanup(): void {
    if (!this.config.memory?.autoGC) return;

    if (this.estimatedMemoryUsage > (this.config.memory?.gcThreshold || Infinity)) {
      // Force garbage collection if available
      if (global.gc) {
        const beforeGC = this.estimatedMemoryUsage;
        global.gc();
        this.metrics.gcTriggered++;

        // Estimate memory reclaimed (conservative estimate)
        const estimatedReclaimed = Math.floor(beforeGC * 0.1); // Assume 10% reclaimed
        this.estimatedMemoryUsage = Math.max(0, this.estimatedMemoryUsage - estimatedReclaimed);
        this.metrics.memoryReclaimed += estimatedReclaimed;

        logInfo('Backpressure: Triggered garbage collection', {
          operation: 'backpressure_gc',
          metadata: {
            beforeGC: beforeGC / (1024 * 1024),
            afterGC: this.estimatedMemoryUsage / (1024 * 1024),
            estimatedReclaimed: estimatedReclaimed / (1024 * 1024),
            bufferSize: this.buffer.length,
          },
        });
      }
    }
  }

  /**
   * Periodic memory cleanup - call this periodically for long-running streams
   */
  performPeriodicCleanup(): void {
    this.tryMemoryCleanup();

    // Log memory status if usage is significant
    const memoryUsageMB = this.estimatedMemoryUsage / (1024 * 1024);
    if (memoryUsageMB > 10) {
      logInfo('Backpressure: Memory status', {
        operation: 'backpressure_memory_status',
        metadata: {
          memoryUsageMB,
          bufferSize: this.buffer.length,
          totalGCTriggered: this.metrics.gcTriggered,
          totalMemoryReclaimed: this.metrics.memoryReclaimed / (1024 * 1024),
        },
      });
    }
  }

  /**
   * Get memory usage statistics
   */
  getMemoryUsage(): { estimatedBytes: number; estimatedMB: number } {
    return {
      estimatedBytes: this.estimatedMemoryUsage,
      estimatedMB: this.estimatedMemoryUsage / (1024 * 1024),
    };
  }
}

/**
 * Create a backpressure-aware transform stream
 */
export function createBackpressureTransform<T>(
  config?: BackpressureConfig,
  transform?: (value: T) => T | Promise<T>,
): TransformStream<T, T> {
  const controller = new BackpressureController<T>(config);

  return new TransformStream<T, T>({
    async transform(chunk, streamController) {
      // Apply backpressure
      const written = await controller.write(chunk);

      if (!written) {
        // Data was dropped
        return;
      }

      // Process buffered data
      let data = controller.read();
      while (data !== undefined) {
        const transformed = transform ? await transform(data) : data;
        streamController.enqueue(transformed);
        data = controller.read();
      }
    },

    flush(streamController) {
      // Flush remaining buffer
      let data = controller.read();
      while (data !== undefined) {
        streamController.enqueue(data);
        data = controller.read();
      }

      const metrics = controller.getMetrics();
      logInfo('Backpressure: Stream completed', {
        operation: 'backpressure_complete',
        metadata: metrics,
      });
    },
  });
}

/**
 * Backpressure patterns
 */
export const backpressurePatterns = {
  /**
   * Create an adaptive backpressure controller
   */
  createAdaptiveBackpressure: <T>(initialConfig?: BackpressureConfig) => {
    const controller = new BackpressureController<T>(initialConfig);
    let lastAdjustment = Date.now();
    const adjustmentInterval = 1000; // 1 second

    return {
      controller,
      write: async (data: T): Promise<boolean> => {
        const result = await controller.write(data);

        // Adaptive adjustment
        const now = Date.now();
        if (now - lastAdjustment > adjustmentInterval) {
          const status = controller.getStatus();
          const memoryUsageMB = status.memoryUsage.estimatedMB;

          // Adjust water marks based on fill rate and memory usage
          if (status.fillPercentage > 80 || memoryUsageMB > 30) {
            // Increase buffer capacity if not memory constrained
            if (memoryUsageMB < 40) {
              controller['config'].highWaterMark = Math.min(
                controller['config'].highWaterMark * 1.2,
                controller['config'].maxBufferSize * 0.9,
              );
            }
          } else if (status.fillPercentage < 20 && memoryUsageMB < 10) {
            // Decrease buffer capacity
            controller['config'].highWaterMark = Math.max(
              controller['config'].highWaterMark * 0.8,
              10,
            );
          }

          // Trigger periodic cleanup
          controller.performPeriodicCleanup();
          lastAdjustment = now;
        }

        return result;
      },
      read: () => controller.read(),
      getMemoryStats: () => controller.getMemoryUsage(),
    };
  },

  /**
   * Create a prioritized backpressure controller
   */
  createPrioritizedBackpressure: <T extends { priority: number }>(config?: BackpressureConfig) => {
    const queues: Map<number, T[]> = new Map();
    const controller = new BackpressureController<T>(config);

    return {
      write: async (data: T): Promise<boolean> => {
        // Add to priority queue
        if (!queues.has(data.priority)) {
          queues.set(data.priority, []);
        }
        const queue = queues.get(data.priority);
        if (queue) queue.push(data);

        // Process highest priority items first
        const priorities = Array.from(queues.keys()).sort((a, b) => b - a);

        for (const priority of priorities) {
          const queue = queues.get(priority);
          if (queue && queue.length > 0) {
            const item = queue.shift();
            if (!item) continue;
            const result = await controller.write(item);

            if (!result) {
              // Put back in queue
              queue.unshift(item);
              return false;
            }
          }

          if (queue && queue.length === 0) {
            queues.delete(priority);
          }
        }

        return true;
      },
      read: () => controller.read(),
      getQueueSizes: () => {
        const sizes: Record<number, number> = {};
        queues.forEach((queue, priority) => {
          sizes[priority] = queue.length;
        });
        return sizes;
      },
    };
  },

  /**
   * Create a time-window backpressure controller
   */
  createTimeWindowBackpressure: <T>(windowMs: number, maxItemsPerWindow: number) => {
    const controller = new BackpressureController<T>();
    const window: Array<{ data: T; timestamp: number }> = [];

    return {
      write: async (data: T): Promise<boolean> => {
        const now = Date.now();

        // Remove old items from window
        while (window.length > 0 && now - window[0].timestamp > windowMs) {
          window.shift();
        }

        // Check rate limit
        if (window.length >= maxItemsPerWindow) {
          return false;
        }

        // Add to window and controller
        window.push({ data, timestamp: now });
        return controller.write(data);
      },
      read: () => controller.read(),
      getCurrentRate: () => ({
        items: window.length,
        window: windowMs,
        rate: (window.length / windowMs) * 1000, // items per second
      }),
    };
  },
};
