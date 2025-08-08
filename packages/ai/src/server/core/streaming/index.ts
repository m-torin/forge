/**
 * AI SDK v5 Core Streaming Utilities
 *
 * Provides core streaming abstractions following official AI SDK v5 patterns.
 * These utilities are provider-agnostic and can be used across different applications.
 */

import { logError, logInfo } from '@repo/observability';
import { type StreamObjectResult, type StreamTextResult } from 'ai';

// Export object streaming utilities
export * from './object-streaming';

// Re-export official AI SDK streaming types and utilities
export type { StreamObjectResult, StreamTextResult } from 'ai';

/**
 * Stream event types following official AI SDK v5 specification
 */
export type StreamEventType =
  | 'start'
  | 'start-step'
  | 'text-start'
  | 'text-delta'
  | 'text-end'
  | 'reasoning-start'
  | 'reasoning-delta'
  | 'reasoning-end'
  | 'source'
  | 'file'
  | 'tool-call'
  | 'tool-input-start'
  | 'tool-input-delta'
  | 'tool-input-end'
  | 'tool-result'
  | 'tool-error'
  | 'finish-step'
  | 'finish'
  | 'error'
  | 'raw';

/**
 * Stream event part structure following AI SDK v5
 */
export interface StreamEventPart {
  type: StreamEventType;
  data?: any;
  toolName?: string;
  toolCallId?: string;
  error?: Error;
  finishReason?: string;
}

/**
 * Event handler function type
 */
export type StreamEventHandler = (part: StreamEventPart) => void | Promise<void>;

/**
 * Event handlers map
 */
export type StreamEventHandlers = Partial<Record<StreamEventType, StreamEventHandler>>;

/**
 * Create a UI message stream response using official AI SDK v5 pattern
 *
 * This utility wraps the official toUIMessageStreamResponse() method and provides
 * additional logging and error handling for production use.
 *
 * @param result - StreamText result from AI SDK
 * @param options - Optional response configuration
 * @returns Response object compatible with Next.js API routes
 */
export function createUIMessageStreamResponse(
  result: StreamTextResult<any, any>,
  options?: {
    sendSources?: boolean;
    headers?: Record<string, string>;
    onError?: (error: Error) => void;
  },
): Response {
  try {
    logInfo('Creating UI message stream response', {
      operation: 'create_ui_message_stream_response',
      metadata: {
        sendSources: options?.sendSources,
        hasCustomHeaders: !!options?.headers,
      },
    });

    return result.toUIMessageStreamResponse({
      sendSources: options?.sendSources,
      ...(options?.headers && {
        init: {
          headers: options.headers,
        },
      }),
    });
  } catch (error) {
    const streamError = error instanceof Error ? error : new Error(String(error));

    logError('Failed to create UI message stream response', {
      operation: 'create_ui_message_stream_response_error',
      error: streamError,
    });

    options?.onError?.(streamError);
    throw streamError;
  }
}

/**
 * Process all stream events using fullStream pattern
 *
 * This utility provides a standardized way to handle all stream events
 * following the official AI SDK v5 fullStream pattern.
 *
 * @param result - StreamText result from AI SDK
 * @param handlers - Event handlers for different event types
 */
export async function processStreamEvents<T>(
  result: StreamTextResult<any, any>,
  handlers: StreamEventHandlers,
): Promise<void> {
  try {
    logInfo('Starting stream event processing', {
      operation: 'process_stream_events_start',
      metadata: {
        handlerTypes: Object.keys(handlers),
      },
    });

    for await (const part of result.fullStream) {
      const eventPart: StreamEventPart = {
        type: part.type as StreamEventType,
        data: (part as any).delta || (part as any).data || (part as any).result,
        toolName: (part as any).toolName,
        toolCallId: (part as any).toolCallId,
        error: (part as any).error,
        finishReason: (part as any).finishReason,
      };

      const handler = handlers[eventPart.type];
      if (handler) {
        try {
          await handler(eventPart);
        } catch (error) {
          const handlerError = error instanceof Error ? error : new Error(String(error));

          logError(`Stream event handler failed for ${eventPart.type}`, {
            operation: 'stream_event_handler_error',
            metadata: {
              eventType: eventPart.type,
              toolName: eventPart.toolName,
            },
            error: handlerError,
          });

          // Call error handler if available
          const errorHandler = handlers.error;
          if (errorHandler) {
            await errorHandler({
              type: 'error',
              error: handlerError,
            });
          }
        }
      }
    }

    logInfo('Stream event processing completed', {
      operation: 'process_stream_events_complete',
    });
  } catch (error) {
    const streamError = error instanceof Error ? error : new Error(String(error));

    logError('Stream event processing failed', {
      operation: 'process_stream_events_error',
      error: streamError,
    });

    // Call error handler if available
    const errorHandler = handlers.error;
    if (errorHandler) {
      await errorHandler({
        type: 'error',
        error: streamError,
      });
    }

    throw streamError;
  }
}

/**
 * Create a standard stream handler configuration
 *
 * This utility provides a standardized way to configure stream handling
 * with logging, error recovery, and event processing.
 */
export interface StreamHandlerConfig {
  /** Enable detailed logging */
  enableLogging?: boolean;
  /** Timeout for stream processing in milliseconds */
  timeout?: number;
  /** Maximum retries on stream errors */
  maxRetries?: number;
  /** Custom error handler */
  onError?: (error: Error, context: { retryCount?: number }) => void;
  /** Stream completion handler */
  onComplete?: (result: any) => void;
}

/**
 * Create a streaming response with enhanced error handling and logging
 *
 * @param streamResult - Result from streamText or streamObject
 * @param config - Stream handler configuration
 * @returns Enhanced streaming response
 */
export function createEnhancedStreamResponse<T>(
  streamResult: StreamTextResult<any, any> | StreamObjectResult<any, any, any>,
  config: StreamHandlerConfig = {},
): Response {
  const { enableLogging = true, timeout = 30000, onError, onComplete } = config;

  try {
    if (enableLogging) {
      logInfo('Creating enhanced stream response', {
        operation: 'create_enhanced_stream_response',
        metadata: {
          timeout,
          hasErrorHandler: !!onError,
          hasCompleteHandler: !!onComplete,
        },
      });
    }

    // Use the official pattern for creating stream responses
    const response =
      'toUIMessageStreamResponse' in streamResult
        ? (streamResult as StreamTextResult<any, any>).toUIMessageStreamResponse()
        : new Response(
            new ReadableStream({
              async start(controller) {
                try {
                  const stream =
                    'fullStream' in streamResult && !('partialObjectStream' in streamResult)
                      ? (streamResult as StreamTextResult<any, any>).fullStream
                      : 'partialObjectStream' in streamResult
                        ? (streamResult as StreamObjectResult<any, any, any>).partialObjectStream
                        : null;

                  if (stream) {
                    for await (const part of stream) {
                      controller.enqueue(new TextEncoder().encode(JSON.stringify(part) + '\n'));
                    }
                  }

                  controller.close();
                  onComplete?.(streamResult);
                } catch (error) {
                  const streamError = error instanceof Error ? error : new Error(String(error));
                  onError?.(streamError, {});
                  controller.error(streamError);
                }
              },
            }),
            {
              headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
              },
            },
          );

    // Add timeout handling
    if (timeout > 0) {
      const timeoutId = setTimeout(() => {
        if (onError) {
          onError(new Error('Stream timeout'), {});
        }
      }, timeout);

      // Clear timeout on response completion (best effort)
      response.body
        ?.getReader()
        .read()
        .then(() => clearTimeout(timeoutId));
    }

    return response;
  } catch (error) {
    const streamError = error instanceof Error ? error : new Error(String(error));

    if (enableLogging) {
      logError('Failed to create enhanced stream response', {
        operation: 'create_enhanced_stream_response_error',
        error: streamError,
      });
    }

    onError?.(streamError, {});
    throw streamError;
  }
}

/**
 * Stream data parts utility for custom data streaming
 *
 * This utility provides a standardized way to stream custom data parts
 * following the official AI SDK v5 pattern.
 */
export interface DataPart {
  type: string;
  id: string;
  data: any;
}

/**
 * Create a data streaming utility
 *
 * @param writer - Stream writer from createStandardUIMessageStream
 * @returns Data streaming utilities
 */
export function createDataStreamer(writer: any) {
  return {
    /**
     * Write a data part to the stream
     * Following official AI SDK v5 pattern: writer.write()
     */
    writeData: (dataPart: DataPart) => {
      logInfo('Writing data part to stream', {
        operation: 'write_data_part',
        metadata: {
          type: dataPart.type,
          id: dataPart.id,
        },
      });

      writer.write({
        type: dataPart.type,
        id: dataPart.id,
        data: dataPart.data,
      });
    },

    /**
     * Write multiple data parts
     */
    writeBatch: (dataParts: DataPart[]) => {
      dataParts.forEach(part => {
        writer.write({
          type: part.type,
          id: part.id,
          data: part.data,
        });
      });
    },

    /**
     * Write progress data
     */
    writeProgress: (id: string, current: number, total: number, message?: string) => {
      writer.write({
        type: 'progress',
        id,
        data: {
          current,
          total,
          percentage: Math.round((current / total) * 100),
          message,
          isComplete: current >= total,
        },
      });
    },

    /**
     * Write status update
     */
    writeStatus: (
      id: string,
      status: 'loading' | 'success' | 'error',
      message?: string,
      data?: any,
    ) => {
      writer.write({
        type: 'status',
        id,
        data: {
          status,
          message,
          timestamp: Date.now(),
          ...data,
        },
      });
    },
  };
}
