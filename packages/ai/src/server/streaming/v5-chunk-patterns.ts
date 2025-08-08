/**
 * AI SDK v5 Streaming Chunk Patterns
 *
 * Implements the new start/delta/end streaming architecture
 * with proper chunk type definitions and handlers
 */

import { logInfo, logWarn } from '@repo/observability/server/next';

// AI SDK v5 Chunk Types
export interface StreamChunk {
  type: 'start' | 'delta' | 'end' | 'error';
  timestamp?: number;
}

export interface StreamStartChunk extends StreamChunk {
  type: 'start';
  metadata?: {
    model?: string;
    provider?: string;
    temperature?: number;
    maxOutputTokens?: number;
  };
}

export interface StreamDeltaChunk extends StreamChunk {
  type: 'delta';
  content: {
    type: 'text' | 'reasoning' | 'tool-call' | 'tool-result';
    delta?: string;
    text?: string;
    reasoningText?: string;
    toolCall?: {
      id: string;
      name: string;
      args: any;
    };
    toolResult?: {
      id: string;
      result: any;
      error?: string;
    };
  };
}

export interface StreamEndChunk extends StreamChunk {
  type: 'end';
  finishReason?: 'stop' | 'length' | 'tool-calls' | 'error';
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: Record<string, unknown>;
}

export interface StreamErrorChunk extends StreamChunk {
  type: 'error';
  error: {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
  };
}

export type V5StreamChunk = StreamStartChunk | StreamDeltaChunk | StreamEndChunk | StreamErrorChunk;

/**
 * Stream chunk processor for AI SDK v5
 */
export class V5StreamProcessor {
  private chunks: V5StreamChunk[] = [];
  private isComplete = false;
  private error: Error | null = null;

  constructor(
    private onChunk?: (chunk: V5StreamChunk) => void,
    private onComplete?: (chunks: V5StreamChunk[]) => void,
    private onError?: (error: Error) => void,
  ) {}

  /**
   * Process a new streaming chunk
   */
  processChunk(chunk: V5StreamChunk) {
    try {
      // Add timestamp if not present
      if (!chunk.timestamp) {
        chunk.timestamp = Date.now();
      }

      this.chunks.push(chunk);

      // Handle different chunk types
      switch (chunk.type) {
        case 'start':
          logInfo('Stream started', {
            model: chunk.metadata?.model,
            provider: chunk.metadata?.provider,
          });
          break;

        case 'delta':
          // Process delta content
          this.processDeltaContent(chunk);
          break;

        case 'end':
          logInfo('Stream ended', {
            finishReason: chunk.finishReason,
            usage: chunk.usage,
          });
          this.isComplete = true;
          this.onComplete?.(this.chunks);
          break;

        case 'error':
          logWarn('Stream error', { error: chunk.error });
          this.error = new Error(chunk.error.message);
          this.onError?.(this.error);
          break;
      }

      // Notify chunk handler
      this.onChunk?.(chunk);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.error = err;
      this.onError?.(err);
    }
  }

  /**
   * Process delta content based on type
   */
  private processDeltaContent(chunk: StreamDeltaChunk) {
    const { content } = chunk;

    switch (content.type) {
      case 'text':
        // Handle text delta
        if (content.delta) {
          // Accumulate text delta
        }
        break;

      case 'reasoning':
        // Handle reasoning content
        if (content.reasoningText) {
          logInfo('Reasoning provided', { reasoningText: content.reasoningText.substring(0, 100) });
        }
        break;

      case 'tool-call':
        // Handle tool call
        if (content.toolCall) {
          logInfo('Tool called', {
            toolName: content.toolCall.name,
            toolId: content.toolCall.id,
          });
        }
        break;

      case 'tool-result':
        // Handle tool result
        if (content.toolResult) {
          logInfo('Tool result', {
            toolId: content.toolResult.id,
            hasError: !!content.toolResult.error,
          });
        }
        break;
    }
  }

  /**
   * Get accumulated text from all text deltas
   */
  getAccumulatedText(): string {
    return this.chunks
      .filter(
        (chunk): chunk is StreamDeltaChunk =>
          chunk.type === 'delta' && chunk.content.type === 'text',
      )
      .map(chunk => chunk.content.delta || chunk.content.text || '')
      .join('');
  }

  /**
   * Get all tool calls from the stream
   */
  getToolCalls() {
    return this.chunks
      .filter(
        (chunk): chunk is StreamDeltaChunk =>
          chunk.type === 'delta' && chunk.content.type === 'tool-call',
      )
      .map(chunk => chunk.content.toolCall)
      .filter(Boolean);
  }

  /**
   * Get final usage statistics
   */
  getUsage() {
    const endChunk = this.chunks.find((chunk): chunk is StreamEndChunk => chunk.type === 'end');
    return endChunk?.usage;
  }

  /**
   * Check if stream is complete
   */
  get complete() {
    return this.isComplete;
  }

  /**
   * Get any error that occurred
   */
  get streamError() {
    return this.error;
  }

  /**
   * Get all chunks
   */
  getAllChunks() {
    return [...this.chunks];
  }
}

/**
 * Transform legacy stream to v5 chunk format
 */
export function transformLegacyStreamToV5(
  legacyStream: ReadableStream<any>,
): ReadableStream<V5StreamChunk> {
  return new ReadableStream({
    start(controller) {
      // Emit start chunk
      controller.enqueue({
        type: 'start',
        timestamp: Date.now(),
        metadata: {},
      } satisfies StreamStartChunk);
    },

    async pull(controller) {
      const reader = legacyStream.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            // Emit end chunk
            controller.enqueue({
              type: 'end',
              timestamp: Date.now(),
              finishReason: 'stop',
            } satisfies StreamEndChunk);
            controller.close();
            break;
          }

          // Transform legacy chunk to v5 delta
          if (value) {
            controller.enqueue({
              type: 'delta',
              timestamp: Date.now(),
              content: {
                type: 'text',
                delta: typeof value === 'string' ? value : value.text || '',
              },
            } satisfies StreamDeltaChunk);
          }
        }
      } catch (error) {
        controller.enqueue({
          type: 'error',
          timestamp: Date.now(),
          error: {
            message: error instanceof Error ? error.message : String(error),
          },
        } satisfies StreamErrorChunk);
        controller.error(error);
      } finally {
        reader.releaseLock();
      }
    },
  });
}

/**
 * Create a v5-compatible stream processor
 */
export function createV5StreamProcessor(
  options: {
    onChunk?: (chunk: V5StreamChunk) => void;
    onComplete?: (chunks: V5StreamChunk[]) => void;
    onError?: (error: Error) => void;
  } = {},
) {
  return new V5StreamProcessor(options.onChunk, options.onComplete, options.onError);
}
