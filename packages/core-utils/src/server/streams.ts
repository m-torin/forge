/**
 * Web Streams API Integration for Node.js 22+
 * Provides ReadableStream, WritableStream, and TransformStream utilities
 * with seamless AsyncGenerator interoperability
 */

import { delay } from '../shared/timeout.js';
import { safeThrowIfAborted } from './abort-support';
import { createLimiter } from './concurrency';
import { yieldToEventLoop } from './scheduler';

/**
 * Buffer Pool for efficient memory management in streaming operations
 * Reduces garbage collection pressure by reusing ArrayBuffers
 */
class BufferPool {
  private pools = new Map<number, ArrayBuffer[]>();
  private readonly maxPoolSize: number;
  private readonly standardSizes: number[];

  constructor(maxPoolSize: number = 50) {
    this.maxPoolSize = maxPoolSize;
    // Standard buffer sizes: 1KB, 4KB, 16KB, 64KB, 256KB, 1MB
    this.standardSizes = [1024, 4096, 16384, 65536, 262144, 1048576];

    // Pre-populate pools with common sizes
    this.standardSizes.forEach(size => {
      this.pools.set(size, []);
    });
  }

  /**
   * Get a buffer of the specified size from the pool
   */
  getBuffer(requestedSize: number): ArrayBuffer {
    // Find the smallest standard size that fits the request
    const size = this.standardSizes.find(s => s >= requestedSize) || requestedSize;

    let pool = this.pools.get(size);
    if (!pool) {
      pool = [];
      this.pools.set(size, pool);
    }

    // Return from pool if available, otherwise create new
    const buffer = pool.pop();
    if (buffer) {
      return buffer.slice(0, requestedSize); // Slice to requested size
    }

    return new ArrayBuffer(size);
  }

  /**
   * Return a buffer to the pool for reuse
   */
  returnBuffer(buffer: ArrayBuffer): void {
    const size = buffer.byteLength;

    // Only pool standard sizes to prevent memory fragmentation
    if (!this.standardSizes.includes(size)) {
      return; // Let GC handle non-standard sizes
    }

    let pool = this.pools.get(size);
    if (!pool) {
      pool = [];
      this.pools.set(size, pool);
    }

    // Only return to pool if under max size limit
    if (pool.length < this.maxPoolSize) {
      pool.push(buffer);
    }
  }

  /**
   * Clear all buffers from the pools (useful for memory pressure situations)
   */
  clear(): void {
    for (const pool of this.pools.values()) {
      pool.length = 0;
    }
  }

  /**
   * Get pool statistics
   */
  getStats(): Record<number, { pooled: number; totalSize: number }> {
    const stats: Record<number, { pooled: number; totalSize: number }> = {};

    for (const [size, pool] of this.pools) {
      stats[size] = {
        pooled: pool.length,
        totalSize: pool.length * size,
      };
    }

    return stats;
  }
}

// Global buffer pool instance
const globalBufferPool = new BufferPool();

export interface StreamingChunk<T = any> {
  data: T;
  index: number;
  isComplete: boolean;
  timestamp: string;
  bytesProcessed?: number;
  metadata?: Record<string, any>;
}

export interface WebStreamOptions {
  chunkSize?: number;
  signal?: AbortSignal;
  highWaterMark?: number;
  backpressure?: boolean;
  useBufferPool?: boolean;
  bufferSize?: number;
}

/**
 * Convert AsyncGenerator to ReadableStream for Node.js 22+ Web Streams API
 */
export function asyncGeneratorToReadableStream<T>(
  generator: AsyncGenerator<T, void, unknown>,
  options: WebStreamOptions = {},
): ReadableStream<T> {
  const { signal, highWaterMark = 1 } = options;
  let cancelled = false;

  return new ReadableStream<T>(
    {
      start() {
        // Initial setup - check for abort signal
        safeThrowIfAborted(signal);
      },

      async pull(controller) {
        try {
          safeThrowIfAborted(signal);

          if (cancelled) {
            controller.close();
            return;
          }

          const { value, done } = await generator.next();

          if (done) {
            controller.close();
          } else {
            controller.enqueue(value);
          }
        } catch (error) {
          if (typeof generator.return === 'function') {
            await generator.return();
          }

          if (error instanceof Error && error.message.includes('aborted')) {
            controller.close();
          } else {
            controller.error(error);
          }
        }
      },

      async cancel(reason) {
        cancelled = true;
        console.warn('ReadableStream cancelled:', reason);

        if (typeof generator.return === 'function') {
          await generator.return();
        }
      },
    },
    {
      highWaterMark,
      size: () => 1, // Each chunk counts as 1 unit
    },
  );
}

/**
 * Convert ReadableStream to AsyncGenerator for interoperability
 */
export async function* readableStreamToAsyncGenerator<T>(
  stream: ReadableStream<T>,
  signal?: AbortSignal,
): AsyncGenerator<T, void, unknown> {
  const reader = stream.getReader();

  try {
    while (true) {
      safeThrowIfAborted(signal);

      const { value, done } = await reader.read();

      if (done) break;

      yield value;

      // Yield to event loop for better performance
      await yieldToEventLoop();
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Create a TransformStream that processes data with a transformation function
 */
export function createTransformStream<T, U>(
  transformFn: (chunk: T) => Promise<U> | U,
  options: WebStreamOptions = {},
): TransformStream<T, U> {
  const { signal } = options;

  return new TransformStream<T, U>({
    async transform(chunk, controller) {
      try {
        safeThrowIfAborted(signal);

        const transformed = await transformFn(chunk);
        controller.enqueue(transformed);
      } catch (error) {
        if (error instanceof Error && error.message.includes('aborted')) {
          controller.terminate();
        } else {
          controller.error(error);
        }
      }
    },

    flush(controller) {
      // Final cleanup if needed
      console.debug('TransformStream flush completed');
    },
  });
}

/**
 * Create a batching transform stream that groups items into chunks
 */
export function createBatchingTransformStream<T>(
  batchSize: number,
  options: WebStreamOptions = {},
): TransformStream<T, T[]> {
  const { signal } = options;
  let batch: T[] = [];

  return new TransformStream<T, T[]>({
    transform(chunk, controller) {
      try {
        safeThrowIfAborted(signal);

        batch.push(chunk);

        if (batch.length >= batchSize) {
          controller.enqueue([...batch]);
          batch.length = 0; // Clear batch efficiently
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('aborted')) {
          controller.terminate();
        } else {
          controller.error(error);
        }
      }
    },

    flush(controller) {
      // Flush any remaining items in the batch
      if (batch.length > 0) {
        controller.enqueue([...batch]);
        batch.length = 0;
      }
    },
  });
}

/**
 * Create a throttling transform stream that limits throughput
 */
export function createThrottlingTransformStream<T>(
  throttleMs: number,
  options: WebStreamOptions = {},
): TransformStream<T, T> {
  const { signal } = options;
  let lastEmit = 0;

  return new TransformStream<T, T>({
    async transform(chunk, controller) {
      try {
        safeThrowIfAborted(signal);

        const now = Date.now();
        const timeSinceLastEmit = now - lastEmit;

        if (timeSinceLastEmit < throttleMs) {
          await delay(throttleMs - timeSinceLastEmit);
        }

        safeThrowIfAborted(signal); // Check again after delay

        controller.enqueue(chunk);
        lastEmit = Date.now();
      } catch (error) {
        if (error instanceof Error && error.message.includes('aborted')) {
          controller.terminate();
        } else {
          controller.error(error);
        }
      }
    },
  });
}

/**
 * Create a compression transform stream for data size reduction
 */
export function createCompressionTransformStream<T>(
  compressionFn: (data: T) => Promise<T> | T,
  options: WebStreamOptions = {},
): TransformStream<T, T> {
  const { signal } = options;

  return new TransformStream<T, T>({
    async transform(chunk, controller) {
      try {
        safeThrowIfAborted(signal);

        const compressed = await compressionFn(chunk);
        controller.enqueue(compressed);

        // Yield to event loop
        await new Promise(resolve => setImmediate(resolve));
      } catch (error) {
        if (error instanceof Error && error.message.includes('aborted')) {
          controller.terminate();
        } else {
          controller.error(error);
        }
      }
    },
  });
}

/**
 * Create a WritableStream that collects all chunks into an array
 */
export function createCollectorWritableStream<T>(options: WebStreamOptions = {}): {
  stream: WritableStream<T>;
  getCollectedData: () => T[];
} {
  const { signal } = options;
  const collected: T[] = [];

  const stream = new WritableStream<T>({
    write(chunk) {
      safeThrowIfAborted(signal);
      collected.push(chunk);
    },

    close() {
      console.debug('CollectorWritableStream closed, collected items:', collected.length);
    },

    abort(reason) {
      console.warn('CollectorWritableStream aborted:', reason);
      collected.length = 0; // Clear collected data on abort
    },
  });

  return {
    stream,
    getCollectedData: () => [...collected], // Return a copy to prevent external mutation
  };
}

/**
 * Pipe multiple ReadableStreams through a series of TransformStreams
 */
export async function pipelineStreams<T, U>(
  source: ReadableStream<T>,
  transforms: TransformStream<any, any>[],
  destination?: WritableStream<U>,
  signal?: AbortSignal,
): Promise<void> {
  safeThrowIfAborted(signal);

  let currentStream: ReadableStream<any> = source;

  // Apply all transforms in sequence
  for (const transform of transforms) {
    safeThrowIfAborted(signal);
    currentStream = currentStream.pipeThrough(transform);
  }

  // If destination provided, pipe to it
  if (destination) {
    await currentStream.pipeTo(destination, { signal });
  }
}

/**
 * Merge multiple ReadableStreams into a single stream
 */
export function mergeReadableStreams<T>(
  streams: ReadableStream<T>[],
  options: WebStreamOptions = {},
): ReadableStream<T> {
  const { signal } = options;

  return new ReadableStream<T>({
    async start(controller) {
      try {
        safeThrowIfAborted(signal);

        // Create readers for all streams
        const readers = streams.map(stream => stream.getReader());
        const activeReaders = new Set(readers);

        // Read from all streams concurrently
        const readPromises = readers.map(async (reader, index) => {
          try {
            while (true) {
              safeThrowIfAborted(signal);

              const { value, done } = await reader.read();

              if (done) {
                activeReaders.delete(reader);
                break;
              }

              controller.enqueue(value);
            }
          } catch (error) {
            activeReaders.delete(reader);
            console.warn(`Stream ${index} error:`, error);
          } finally {
            reader.releaseLock();
          }
        });

        // Wait for all streams to complete with bounded concurrency
        const limit = createLimiter(8);
        await Promise.all(readPromises.map(p => limit(() => p)));
        controller.close();
      } catch (error) {
        if (error instanceof Error && error.message.includes('aborted')) {
          controller.close();
        } else {
          controller.error(error);
        }
      }
    },
  });
}

/**
 * Create a stream that processes data chunks with backpressure handling
 */
export async function* streamWithBackpressure<T>(
  data: T[],
  processingFn: (chunk: T) => Promise<T> | T,
  options: WebStreamOptions = {},
): AsyncGenerator<T, void, unknown> {
  const { chunkSize = 10, signal, backpressure = true } = options;

  // Create a ReadableStream from the data
  const sourceStream = new ReadableStream<T[]>({
    start(controller) {
      for (let i = 0; i < data.length; i += chunkSize) {
        safeThrowIfAborted(signal);
        const chunk = data.slice(i, i + chunkSize);
        controller.enqueue(chunk);
      }
      controller.close();
    },
  });

  // Transform stream for processing with bounded concurrency
  const processStream = createTransformStream<T[], T[]>(
    async chunk => {
      const limit2 = createLimiter(16);
      const results = await Promise.all(chunk.map(item => limit2(() => processingFn(item))));
      return results;
    },
    { signal },
  );

  // Pipeline the streams
  const processedStream = sourceStream.pipeThrough(processStream);

  // Convert back to AsyncGenerator
  for await (const batch of readableStreamToAsyncGenerator(processedStream, signal)) {
    for (const item of batch) {
      yield item;

      if (backpressure) {
        // Yield to event loop for backpressure
        await new Promise(resolve => setImmediate(resolve));
      }
    }
  }
}

/**
 * Utility to create streaming chunk metadata
 */
export function createStreamingChunk<T>(
  data: T,
  index: number,
  isComplete: boolean,
  additionalMetadata: Record<string, any> = {},
): StreamingChunk<T> {
  return {
    data,
    index,
    isComplete,
    timestamp: new Date().toISOString(),
    metadata: additionalMetadata,
  };
}

/**
 * Create a buffered transform stream that uses buffer pooling for efficient memory management
 */
export function createBufferedTransformStream<T>(
  transformFn: (chunk: T, buffer: ArrayBuffer) => Promise<T> | T,
  options: WebStreamOptions = {},
): TransformStream<T, T> {
  const { signal, useBufferPool = true, bufferSize = 16384 } = options;

  return new TransformStream<T, T>({
    async transform(chunk, controller) {
      try {
        safeThrowIfAborted(signal);

        let buffer: ArrayBuffer | undefined;
        let result: T;

        if (useBufferPool) {
          buffer = globalBufferPool.getBuffer(bufferSize);
          try {
            result = await transformFn(chunk, buffer);
          } finally {
            // Always return buffer to pool
            globalBufferPool.returnBuffer(buffer);
          }
        } else {
          buffer = new ArrayBuffer(bufferSize);
          result = await transformFn(chunk, buffer);
        }

        controller.enqueue(result);
      } catch (error) {
        if (error instanceof Error && error.message.includes('aborted')) {
          controller.terminate();
        } else {
          controller.error(error);
        }
      }
    },

    flush() {
      console.debug('BufferedTransformStream flush completed');
    },
  });
}

/**
 * Create a high-performance batching stream with buffer pooling
 */
export function createPooledBatchingStream<T>(
  batchSize: number,
  options: WebStreamOptions = {},
): TransformStream<T, T[]> {
  const { signal, useBufferPool = true } = options;
  const buffers: ArrayBuffer[] = [];
  let batch: T[] = [];

  return new TransformStream<T, T[]>({
    start() {
      // Pre-allocate buffers if using buffer pool
      if (useBufferPool) {
        for (let i = 0; i < Math.min(batchSize, 10); i++) {
          buffers.push(globalBufferPool.getBuffer(4096));
        }
      }
    },

    transform(chunk, controller) {
      try {
        safeThrowIfAborted(signal);

        batch.push(chunk);

        if (batch.length >= batchSize) {
          controller.enqueue([...batch]);
          batch.length = 0; // Clear efficiently
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('aborted')) {
          controller.terminate();
        } else {
          controller.error(error);
        }
      }
    },

    flush(controller) {
      // Flush any remaining items
      if (batch.length > 0) {
        controller.enqueue([...batch]);
        batch.length = 0;
      }

      // Return buffers to pool
      if (useBufferPool) {
        for (const buffer of buffers) {
          globalBufferPool.returnBuffer(buffer);
        }
        buffers.length = 0;
      }
    },
  });
}

/**
 * Memory-efficient stream processor with automatic buffer management
 */
export async function* processStreamWithBufferPool<T, R>(
  inputStream: ReadableStream<T>,
  processor: (items: T[], workBuffer: ArrayBuffer) => Promise<R[]>,
  options: WebStreamOptions = {},
): AsyncGenerator<R, void, unknown> {
  const {
    chunkSize = 10,
    signal,
    useBufferPool = true,
    bufferSize = 65536, // 64KB default
  } = options;

  const batchingStream = createPooledBatchingStream<T>(chunkSize, { signal, useBufferPool });
  const batchedStream = inputStream.pipeThrough(batchingStream);

  let workBuffer: ArrayBuffer | undefined;
  if (useBufferPool) {
    workBuffer = globalBufferPool.getBuffer(bufferSize);
  }

  try {
    for await (const batch of readableStreamToAsyncGenerator(batchedStream, signal)) {
      safeThrowIfAborted(signal);

      const processBuffer = workBuffer || new ArrayBuffer(bufferSize);
      const results = await processor(batch, processBuffer);

      for (const result of results) {
        yield result;
      }

      // Yield control periodically
      await new Promise(resolve => setImmediate(resolve));
    }
  } finally {
    // Return work buffer to pool
    if (workBuffer && useBufferPool) {
      globalBufferPool.returnBuffer(workBuffer);
    }
  }
}

/**
 * Get buffer pool statistics and management functions
 */
export const BufferPoolManager = {
  getStats: () => globalBufferPool.getStats(),
  clear: () => globalBufferPool.clear(),

  /**
   * Clear buffer pools when memory pressure is detected
   */
  handleMemoryPressure(): void {
    const memUsage = process.memoryUsage();
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024;

    if (heapUsedMB > 100) {
      // Clear pools if heap usage > 100MB
      globalBufferPool.clear();

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
    }
  },
};

// Make BufferPoolManager globally available for memory cleanup coordination
if (typeof globalThis !== 'undefined') {
  (globalThis as any).BufferPoolManager = BufferPoolManager;
}

/**
 * Stream performance monitoring wrapper
 */
export async function* monitorStreamPerformance<T>(
  generator: AsyncGenerator<T, void, unknown>,
  operationName: string,
  signal?: AbortSignal,
): AsyncGenerator<T & { performance?: { duration: number; throughput: number } }, void, unknown> {
  const startTime = performance.now();
  let itemCount = 0;

  try {
    for await (const item of generator) {
      safeThrowIfAborted(signal);

      itemCount++;
      const currentTime = performance.now();
      const duration = currentTime - startTime;
      const throughput = itemCount / (duration / 1000); // items per second

      // Add performance metadata to the item
      const monitoredItem = {
        ...item,
        performance: {
          duration,
          throughput,
        },
      } as T & { performance?: { duration: number; throughput: number } };

      yield monitoredItem;
    }
  } catch (error) {
    const endTime = performance.now();
    console.error(
      `Stream ${operationName} error after ${endTime - startTime}ms, processed ${itemCount} items:`,
      error,
    );
    throw error;
  }
}
