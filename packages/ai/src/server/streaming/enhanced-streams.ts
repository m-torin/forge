import { createUIMessageStream, type UIMessageStreamWriter } from 'ai';

/**
 * Enhanced streaming utilities for AI applications
 * Provides advanced stream handling patterns including status updates, progress tracking, and error recovery
 */

/**
 * AI SDK v5 native write helper
 * Converts legacy writeData calls to proper v5 write calls
 */
function writeToStream(writer: UIMessageStreamWriter, data: any) {
  if (data.type && typeof data.type === 'string') {
    // Map legacy types to v5 compatible types
    const typeMap: Record<string, string> = {
      status: 'data-status',
      progress: 'data-progress',
      metadata: 'metadata',
      error: 'error',
      'tool-call': 'tool-call',
      'tool-result': 'tool-result',
      'text-start': 'data-text-start',
      'text-delta': 'text',
      'text-end': 'data-text-end',
      'reasoning-start': 'data-reasoning-start',
      'reasoning-delta': 'reasoning',
      'reasoning-end': 'data-reasoning-end',
      finish: 'finish',
      'finish-step': 'data-finish-step',
    };

    const v5Type = typeMap[data.type] || `data-${data.type}`;

    if (v5Type === 'text') {
      writer.write({ type: 'text', text: data.content || data.text || '' });
    } else if (v5Type === 'reasoning') {
      writer.write({ type: 'reasoning', text: data.content || data.text || '' });
    } else if (v5Type.startsWith('data-')) {
      writer.write({ type: v5Type as any, data: data.content || data } as any);
    } else {
      writer.write({ type: v5Type as any, ...data });
    }
  } else {
    // Fallback for unstructured data
    writer.write({ type: 'data-custom', data: data } as any);
  }
}

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
 * AI SDK v5 Stream part types following start/delta/end pattern
 */
export type StreamDeltaType =
  // Text streaming lifecycle
  | 'text-start'
  | 'text-delta'
  | 'text-end'
  // Reasoning streaming lifecycle
  | 'reasoning-start'
  | 'reasoning-delta'
  | 'reasoning-end'
  // Tool input streaming lifecycle
  | 'tool-input-start'
  | 'tool-input-delta'
  | 'tool-input-end'
  // Tool execution
  | 'tool-call'
  | 'tool-result'
  // Stream lifecycle
  | 'stream-start'
  | 'finish'
  | 'finish-step'
  // Legacy types (for backward compatibility)
  | 'status'
  | 'progress'
  | 'metadata'
  | 'artifact'
  | 'suggestion'
  | 'error';

/**
 * Stream delta structure following AI SDK v5 patterns
 */
export interface StreamDelta<T = any> {
  type: StreamDeltaType;
  // v5 properties
  id?: string; // Unique ID for start/delta/end tracking
  delta?: string; // Text content for delta updates
  toolCallId?: string; // Tool call identifier
  toolName?: string; // Tool name
  input?: any; // Tool input (renamed from args in v5)
  output?: any; // Tool output (renamed from result in v5)
  // Enhanced metadata
  providerMetadata?: Record<string, any>;
  timestamp?: string;
  // Legacy content property for backward compatibility
  content?: T;
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
  onStart?: (dataStream: UIMessageStreamWriter) => void | Promise<void>;
  onProgress?: (progress: number, dataStream: UIMessageStreamWriter) => void | Promise<void>;
  onComplete?: (dataStream: UIMessageStreamWriter) => void | Promise<void>;

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
    private dataStream: UIMessageStreamWriter,
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
      writeToStream(this.dataStream, {
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
    dataStream: UIMessageStreamWriter,
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

  return createUIMessageStream({
    execute: async dataStream => {
      const progressTracker = new StreamProgressTracker(dataStream);

      // Helper functions
      const sendStatus = (status: StreamStatus, message?: string) => {
        if (statusUpdates) {
          writeToStream(dataStream, {
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
        writeToStream(dataStream, {
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
            writeToStream(dataStream, { type: 'error', content: errorResponse });
          } else {
            writeToStream(dataStream, errorResponse as any);
          }
        } else {
          writeToStream(dataStream, {
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
  return createUIMessageStream({
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
          writeToStream(dataStream, {
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
        writeToStream(dataStream, {
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
    private dataStream: UIMessageStreamWriter,
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
    writeToStream(this.dataStream, {
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
  execute: (dataStream: UIMessageStreamWriter, buffer: StreamBuffer<T>) => void | Promise<void>,
  config?: {
    maxSize?: number;
    flushInterval?: number;
    onFlush?: (items: T[]) => any;
  },
): ReadableStream {
  return createUIMessageStream({
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

/**
 * AI SDK v5 Enhanced Streaming Utilities
 * Implements start/delta/end lifecycle patterns following v5 specifications
 */

/**
 * Create a v5-compliant text streaming utility
 */
export function createTextStreamHandler(dataStream: UIMessageStreamWriter) {
  let streamId: string | undefined;
  let isActive = false;

  return {
    start(id?: string): void {
      streamId = id || `text_${Date.now()}`;
      isActive = true;
      writeToStream(dataStream, {
        type: 'text-start',
        id: streamId,
        timestamp: new Date().toISOString(),
      });
    },

    delta(content: string): void {
      if (!isActive || !streamId) {
        throw new Error('Text stream not started');
      }
      writeToStream(dataStream, {
        type: 'text-delta',
        id: streamId,
        delta: content,
        timestamp: new Date().toISOString(),
      });
    },

    end(): void {
      if (!isActive || !streamId) {
        throw new Error('Text stream not started');
      }
      writeToStream(dataStream, {
        type: 'text-end',
        id: streamId,
        timestamp: new Date().toISOString(),
      });
      isActive = false;
      streamId = undefined;
    },

    isActive(): boolean {
      return isActive;
    },

    getId(): string | undefined {
      return streamId;
    },
  };
}

/**
 * Create a v5-compliant reasoning streaming utility
 */
export function createReasoningStreamHandler(dataStream: UIMessageStreamWriter) {
  let streamId: string | undefined;
  let isActive = false;

  return {
    start(id?: string): void {
      streamId = id || `reasoning_${Date.now()}`;
      isActive = true;
      writeToStream(dataStream, {
        type: 'reasoning-start',
        id: streamId,
        timestamp: new Date().toISOString(),
      });
    },

    delta(content: string): void {
      if (!isActive || !streamId) {
        throw new Error('Reasoning stream not started');
      }
      writeToStream(dataStream, {
        type: 'reasoning-delta',
        id: streamId,
        delta: content,
        timestamp: new Date().toISOString(),
      });
    },

    end(): void {
      if (!isActive || !streamId) {
        throw new Error('Reasoning stream not started');
      }
      writeToStream(dataStream, {
        type: 'reasoning-end',
        id: streamId,
        timestamp: new Date().toISOString(),
      });
      isActive = false;
      streamId = undefined;
    },

    isActive(): boolean {
      return isActive;
    },

    getId(): string | undefined {
      return streamId;
    },
  };
}

/**
 * Create a v5-compliant tool input streaming utility
 */
export function createToolInputStreamHandler(dataStream: UIMessageStreamWriter) {
  let streamId: string | undefined;
  let isActive = false;

  return {
    start(toolCallId: string, toolName: string, id?: string): void {
      streamId = id || `tool_input_${Date.now()}`;
      isActive = true;
      writeToStream(dataStream, {
        type: 'tool-input-start',
        id: streamId,
        toolCallId,
        toolName,
        timestamp: new Date().toISOString(),
      });
    },

    delta(inputDelta: any): void {
      if (!isActive || !streamId) {
        throw new Error('Tool input stream not started');
      }
      writeToStream(dataStream, {
        type: 'tool-input-delta',
        id: streamId,
        input: inputDelta,
        timestamp: new Date().toISOString(),
      });
    },

    end(finalInput: any): void {
      if (!isActive || !streamId) {
        throw new Error('Tool input stream not started');
      }
      writeToStream(dataStream, {
        type: 'tool-input-end',
        id: streamId,
        input: finalInput,
        timestamp: new Date().toISOString(),
      });
      isActive = false;
      streamId = undefined;
    },

    isActive(): boolean {
      return isActive;
    },

    getId(): string | undefined {
      return streamId;
    },
  };
}

/**
 * Create a comprehensive v5 streaming manager
 */
export function createV5StreamManager(dataStream: UIMessageStreamWriter) {
  const textHandler = createTextStreamHandler(dataStream);
  const reasoningHandler = createReasoningStreamHandler(dataStream);
  const toolInputHandler = createToolInputStreamHandler(dataStream);

  return {
    text: textHandler,
    reasoning: reasoningHandler,
    toolInput: toolInputHandler,

    /**
     * Send a tool call event with v5 property names
     */
    toolCall(toolCallId: string, toolName: string, input: any): void {
      writeToStream(dataStream, {
        type: 'tool-call',
        toolCallId,
        toolName,
        input, // v5 uses 'input' instead of 'args'
        timestamp: new Date().toISOString(),
      });
    },

    /**
     * Send a tool result event with v5 property names
     */
    toolResult(toolCallId: string, output: any, metadata?: Record<string, any>): void {
      writeToStream(dataStream, {
        type: 'tool-result',
        toolCallId,
        output, // v5 uses 'output' instead of 'result'
        providerMetadata: metadata,
        timestamp: new Date().toISOString(),
      });
    },

    /**
     * Send stream lifecycle events
     */
    streamStart(streamId?: string): void {
      writeToStream(dataStream, {
        type: 'stream-start',
        id: streamId || `stream_${Date.now()}`,
        timestamp: new Date().toISOString(),
      });
    },

    finish(reason?: string, metadata?: Record<string, any>): void {
      writeToStream(dataStream, {
        type: 'finish',
        reason,
        providerMetadata: metadata,
        timestamp: new Date().toISOString(),
      });
    },

    finishStep(stepIndex: number, metadata?: Record<string, any>): void {
      writeToStream(dataStream, {
        type: 'finish-step',
        stepIndex,
        providerMetadata: metadata,
        timestamp: new Date().toISOString(),
      });
    },

    /**
     * Check if any streams are active
     */
    hasActiveStreams(): boolean {
      return textHandler.isActive() || reasoningHandler.isActive() || toolInputHandler.isActive();
    },

    /**
     * Get all active stream IDs
     */
    getActiveStreamIds(): string[] {
      const ids: string[] = [];
      const textId = textHandler.getId();
      const reasoningId = reasoningHandler.getId();
      const toolInputId = toolInputHandler.getId();

      if (textId) ids.push(textId);
      if (reasoningId) ids.push(reasoningId);
      if (toolInputId) ids.push(toolInputId);

      return ids;
    },
  };
}
