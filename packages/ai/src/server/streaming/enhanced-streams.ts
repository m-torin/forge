import { createDataStream, type DataStreamWriter } from 'ai';

/**
 * Enhanced streaming utilities for AI applications
 * Provides advanced stream handling patterns including status updates, progress tracking, and error recovery
 */

/**
 * Stream status types for tracking stream state
 */
export type StreamStatus =
  | 'idle'
  | 'starting'
  | 'streaming'
  | 'processing'
  | 'completing'
  | 'completed'
  | 'error'
  | 'cancelled';

/**
 * Stream delta types for different content updates
 */
export type StreamDeltaType =
  | 'text'
  | 'status'
  | 'progress'
  | 'metadata'
  | 'tool_call'
  | 'tool_result'
  | 'artifact'
  | 'suggestion'
  | 'error'
  | 'finish';

/**
 * Stream delta structure
 */
export interface StreamDelta<T = any> {
  type: StreamDeltaType;
  content: T;
  timestamp?: string;
  metadata?: Record<string, any>;
}

/**
 * Enhanced stream configuration
 */
export interface EnhancedStreamConfig {
  /** Stream identifier */
  streamId?: string;

  /** Enable status updates */
  statusUpdates?: boolean;

  /** Enable progress tracking */
  progressTracking?: boolean;

  /** Custom status messages */
  statusMessages?: {
    starting?: string;
    processing?: string;
    completing?: string;
    completed?: string;
  };

  /** Error handling */
  onError?: (error: unknown) => string | StreamDelta;

  /** Stream lifecycle hooks */
  onStart?: (dataStream: DataStreamWriter) => void | Promise<void>;
  onProgress?: (progress: number, dataStream: DataStreamWriter) => void | Promise<void>;
  onComplete?: (dataStream: DataStreamWriter) => void | Promise<void>;

  /** Metadata to include with all deltas */
  globalMetadata?: Record<string, any>;
}

/**
 * Progress tracker for long-running operations
 */
export class StreamProgressTracker {
  private progress = 0;
  private total = 100;
  private lastUpdate = 0;

  constructor(
    private dataStream: DataStreamWriter,
    private minUpdateInterval = 100, // ms
  ) {}

  setTotal(total: number): void {
    this.total = total;
  }

  update(current: number): void {
    this.progress = current;
    const now = Date.now();

    // Throttle updates
    if (now - this.lastUpdate >= this.minUpdateInterval) {
      const percentage = Math.round((this.progress / this.total) * 100);
      this.dataStream.writeData({
        type: 'progress',
        content: {
          current: this.progress,
          total: this.total,
          percentage,
        },
      });
      this.lastUpdate = now;
    }
  }

  increment(by = 1): void {
    this.update(this.progress + by);
  }

  complete(): void {
    this.update(this.total);
  }
}

/**
 * Create an enhanced data stream with status and progress tracking
 */
export function createEnhancedDataStream(
  execute: (
    dataStream: DataStreamWriter,
    helpers: {
      sendStatus: (status: StreamStatus, message?: string) => void;
      sendProgress: (current: number, total?: number) => void;
      sendDelta: <T>(delta: StreamDelta<T>) => void;
      progressTracker: StreamProgressTracker;
    },
  ) => void | Promise<void>,
  config: EnhancedStreamConfig = {},
): ReadableStream {
  const _streamId = config.streamId || `stream_${Date.now()}`;
  const {
    statusUpdates = true,
    progressTracking = true,
    statusMessages = {},
    onError,
    onStart,
    onProgress,
    onComplete,
    globalMetadata = {},
  } = config;

  return createDataStream({
    execute: async dataStream => {
      const progressTracker = new StreamProgressTracker(dataStream);

      // Helper functions
      const sendStatus = (status: StreamStatus, message?: string) => {
        if (statusUpdates) {
          dataStream.writeData({
            type: 'status',
            content: {
              status,
              message: message || statusMessages[status as keyof typeof statusMessages] || status,
              timestamp: new Date().toISOString(),
            },
            ...globalMetadata,
          });
        }
      };

      const sendProgress = (current: number, total?: number) => {
        if (progressTracking) {
          if (total !== undefined) {
            progressTracker.setTotal(total);
          }
          progressTracker.update(current);

          if (onProgress) {
            onProgress(current / (total || 100), dataStream);
          }
        }
      };

      const sendDelta = <T>(delta: StreamDelta<T>) => {
        dataStream.writeData({
          type: delta.type,
          content: delta.content,
          timestamp: delta.timestamp || new Date().toISOString(),
          metadata: { ...globalMetadata, ...delta.metadata },
        } as any);
      };

      try {
        // Send starting status
        sendStatus('starting');

        // Call onStart hook
        if (onStart) {
          await onStart(dataStream);
        }

        // Execute main stream logic
        await execute(dataStream, {
          sendStatus,
          sendProgress,
          sendDelta,
          progressTracker,
        });

        // Send completion status
        sendStatus('completed');

        // Call onComplete hook
        if (onComplete) {
          await onComplete(dataStream);
        }
      } catch (error) {
        // Send error status
        sendStatus('error', error instanceof Error ? error.message : 'Unknown error');

        // Handle error
        if (onError) {
          const errorResponse = onError(error);
          if (typeof errorResponse === 'string') {
            dataStream.writeData({ type: 'error', content: errorResponse });
          } else {
            dataStream.writeData(errorResponse as any);
          }
        } else {
          dataStream.writeData({
            type: 'error',
            content: error instanceof Error ? error.message : 'An error occurred',
          });
        }

        throw error;
      }
    },
    onError: onError
      ? error => {
          const response = onError(error);
          return typeof response === 'string' ? response : JSON.stringify(response);
        }
      : undefined,
  });
}

/**
 * Stream aggregator for combining multiple streams
 */
export class StreamAggregator {
  private streams: Map<string, ReadableStream> = new Map();
  private readers: Map<string, ReadableStreamDefaultReader> = new Map();

  add(id: string, stream: ReadableStream): void {
    this.streams.set(id, stream);
    this.readers.set(id, stream.getReader());
  }

  async *aggregate(): AsyncGenerator<{ streamId: string; value: any }> {
    while (this.readers.size > 0) {
      const promises = Array.from(this.readers.entries()).map(async ([id, reader]) => {
        const result = await reader.read();
        return { id, result };
      });

      const { id, result } = await Promise.race(promises);

      if (result.done) {
        this.readers.delete(id);
        this.streams.delete(id);
      } else {
        yield { streamId: id, value: result.value };
      }
    }
  }

  cancel(): void {
    for (const reader of this.readers.values()) {
      reader.cancel();
    }
    this.readers.clear();
    this.streams.clear();
  }
}

/**
 * Create a multiplexed stream that combines multiple sources
 */
export function createMultiplexedStream(
  sources: Record<string, () => ReadableStream | Promise<ReadableStream>>,
  config?: {
    onSourceStart?: (sourceId: string) => void;
    onSourceComplete?: (sourceId: string) => void;
    onAllComplete?: () => void;
  },
): ReadableStream {
  return createDataStream({
    execute: async dataStream => {
      const aggregator = new StreamAggregator();
      const _sourceIds = Object.keys(sources);

      // Start all streams
      for (const [id, factory] of Object.entries(sources)) {
        try {
          if (config?.onSourceStart) {
            config.onSourceStart(id);
          }

          const stream = await factory();
          aggregator.add(id, stream);
        } catch (error) {
          dataStream.writeData({
            type: 'error',
            content: {
              sourceId: id,
              error: error instanceof Error ? error.message : 'Failed to start stream',
            },
          });
        }
      }

      // Aggregate results
      const completedSources = new Set<string>();

      for await (const { streamId, value } of aggregator.aggregate()) {
        dataStream.writeData({
          type: 'multiplexed',
          content: {
            sourceId: streamId,
            data: value,
          },
        });

        // Track completed sources
        if (!completedSources.has(streamId)) {
          completedSources.add(streamId);
          if (config?.onSourceComplete) {
            config.onSourceComplete(streamId);
          }
        }
      }

      if (config?.onAllComplete) {
        config.onAllComplete();
      }
    },
  });
}

/**
 * Stream buffer for collecting and batching stream data
 */
export class StreamBuffer<T> {
  private buffer: T[] = [];
  private flushTimer?: NodeJS.Timeout;

  constructor(
    private dataStream: DataStreamWriter,
    private config: {
      maxSize?: number;
      flushInterval?: number;
      onFlush?: (items: T[]) => any;
    } = {},
  ) {}

  add(item: T): void {
    this.buffer.push(item);

    // Flush if buffer is full
    if (this.config.maxSize && this.buffer.length >= this.config.maxSize) {
      this.flush();
    } else if (this.config.flushInterval && !this.flushTimer) {
      // Set up flush timer
      this.flushTimer = setTimeout(() => this.flush(), this.config.flushInterval);
    }
  }

  flush(): void {
    if (this.buffer.length === 0) return;

    const items = [...this.buffer];
    this.buffer = [];

    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = undefined;
    }

    const data = this.config.onFlush ? this.config.onFlush(items) : items;
    this.dataStream.writeData({
      type: 'batch',
      content: data,
    });
  }

  destroy(): void {
    this.flush();
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }
  }
}

/**
 * Create a buffered stream for batching updates
 */
export function createBufferedStream<T>(
  execute: (dataStream: DataStreamWriter, buffer: StreamBuffer<T>) => void | Promise<void>,
  config?: {
    maxSize?: number;
    flushInterval?: number;
    onFlush?: (items: T[]) => any;
  },
): ReadableStream {
  return createDataStream({
    execute: async dataStream => {
      const buffer = new StreamBuffer<T>(dataStream, config);

      try {
        await execute(dataStream, buffer);
      } finally {
        buffer.destroy();
      }
    },
  });
}
