/**
 * AI SDK v5 Object Streaming Utilities
 *
 * Provides core object streaming abstractions following official AI SDK v5 patterns.
 * Supports streaming structured data with schema validation and partial updates.
 */

import { logError, logInfo, logWarn } from '@repo/observability';
import { type DeepPartial, type StreamObjectResult } from 'ai';
import { z, type ZodSchema } from 'zod';

// Re-export official AI SDK object streaming types
export type { DeepPartial, StreamObjectResult } from 'ai';

/**
 * Object stream event types following official AI SDK v5 specification
 */
export type ObjectStreamEventType =
  | 'object-start'
  | 'object-delta'
  | 'object-end'
  | 'element-start'
  | 'element-delta'
  | 'element-end'
  | 'validation-error'
  | 'finish'
  | 'error';

/**
 * Object stream event part structure
 */
export interface ObjectStreamEventPart<T = any> {
  type: ObjectStreamEventType;
  partialObject?: DeepPartial<T>;
  element?: any;
  validatedObject?: T;
  error?: Error;
  finishReason?: string;
}

/**
 * Object stream event handler function type
 */
export type ObjectStreamEventHandler<T = any> = (
  part: ObjectStreamEventPart<T>,
) => void | Promise<void>;

/**
 * Object stream event handlers map
 */
export type ObjectStreamEventHandlers<T = any> = Partial<
  Record<ObjectStreamEventType, ObjectStreamEventHandler<T>>
>;

/**
 * Object streaming configuration
 */
export interface ObjectStreamConfig<T> {
  /** Zod schema for validation */
  schema: ZodSchema<T>;
  /** Enable partial object validation */
  validatePartials?: boolean;
  /** Maximum retries for validation errors */
  maxValidationRetries?: number;
  /** Custom error handler */
  onError?: (error: Error, context: { validationErrors?: z.ZodError[] }) => void;
}

/**
 * Create object streaming utilities with enhanced features
 *
 * This utility wraps the official AI SDK v5 streamObject function and provides
 * additional validation, error handling, and event processing.
 *
 * @param result - StreamObject result from AI SDK
 * @param config - Object streaming configuration
 * @returns Object streaming utilities
 */
export function createObjectStreamHandler<T>(
  result: StreamObjectResult<T, T, any>,
  config: ObjectStreamConfig<T>,
) {
  const { schema, validatePartials = false, maxValidationRetries = 3, onError } = config;

  let validationRetryCount = 0;

  return {
    /**
     * Process partial object stream events
     * Following official AI SDK v5 pattern: result.partialObjectStream
     */
    processPartialObjects: async (handlers: ObjectStreamEventHandlers<T>): Promise<void> => {
      try {
        logInfo('Starting partial object stream processing', {
          operation: 'process_partial_objects_start',
          metadata: {
            validatePartials,
            maxValidationRetries,
          },
        });

        for await (const partialObject of result.partialObjectStream) {
          const eventPart: ObjectStreamEventPart<T> = {
            type: 'object-delta',
            partialObject: partialObject as DeepPartial<T>,
          };

          // Validate partial object if enabled
          if (validatePartials) {
            try {
              const validated = schema.parse(partialObject);
              eventPart.validatedObject = validated;
              validationRetryCount = 0; // Reset on success
            } catch (error) {
              if (error instanceof z.ZodError) {
                validationRetryCount++;

                if (validationRetryCount <= maxValidationRetries) {
                  logWarn('Partial object validation failed, continuing...', {
                    operation: 'partial_object_validation_warning',
                    metadata: {
                      retryCount: validationRetryCount,
                      errors: error.issues,
                    },
                  });

                  eventPart.type = 'validation-error';
                  eventPart.error = error;
                } else {
                  logError('Max validation retries exceeded', {
                    operation: 'partial_object_validation_max_retries',
                    metadata: {
                      retryCount: validationRetryCount,
                      errors: error.issues,
                    },
                  });

                  onError?.(error, { validationErrors: [error] });
                  return;
                }
              }
            }
          }

          // Call appropriate handler
          const handler = handlers[eventPart.type];
          if (handler) {
            try {
              await handler(eventPart);
            } catch (handlerError) {
              const err =
                handlerError instanceof Error ? handlerError : new Error(String(handlerError));
              onError?.(err, {});
            }
          }
        }

        // Call finish handler
        const finishHandler = handlers.finish;
        if (finishHandler) {
          await finishHandler({
            type: 'finish',
            finishReason: 'completed',
          });
        }

        logInfo('Partial object stream processing completed', {
          operation: 'process_partial_objects_complete',
        });
      } catch (error) {
        const streamError = error instanceof Error ? error : new Error(String(error));

        logError('Partial object stream processing failed', {
          operation: 'process_partial_objects_error',
          error: streamError,
        });

        onError?.(streamError, {});

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
    },

    /**
     * Process element stream (for array objects)
     * Following official AI SDK v5 pattern: result.elementStream
     */
    processElements: async (handlers: ObjectStreamEventHandlers<T>): Promise<void> => {
      if (!('elementStream' in result)) {
        logWarn('Element stream not available - object is not in array mode', {
          operation: 'process_elements_not_available',
        });
        return;
      }

      try {
        logInfo('Starting element stream processing', {
          operation: 'process_elements_start',
        });

        for await (const element of (result as any).elementStream) {
          const eventPart: ObjectStreamEventPart<T> = {
            type: 'element-delta',
            element,
          };

          const handler = handlers['element-delta'];
          if (handler) {
            try {
              await handler(eventPart);
            } catch (handlerError) {
              const err =
                handlerError instanceof Error ? handlerError : new Error(String(handlerError));
              onError?.(err, {});
            }
          }
        }

        logInfo('Element stream processing completed', {
          operation: 'process_elements_complete',
        });
      } catch (error) {
        const streamError = error instanceof Error ? error : new Error(String(error));

        logError('Element stream processing failed', {
          operation: 'process_elements_error',
          error: streamError,
        });

        onError?.(streamError, {});
        throw streamError;
      }
    },

    /**
     * Process text stream (JSON representation)
     * Following official AI SDK v5 pattern: result.textStream
     */
    processTextStream: async (onTextChunk: (chunk: string) => void): Promise<void> => {
      try {
        logInfo('Starting text stream processing', {
          operation: 'process_text_stream_start',
        });

        for await (const textChunk of result.textStream) {
          onTextChunk(textChunk);
        }

        logInfo('Text stream processing completed', {
          operation: 'process_text_stream_complete',
        });
      } catch (error) {
        const streamError = error instanceof Error ? error : new Error(String(error));

        logError('Text stream processing failed', {
          operation: 'process_text_stream_error',
          error: streamError,
        });

        onError?.(streamError, {});
        throw streamError;
      }
    },

    /**
     * Get the final validated object
     * This resolves when the stream is complete
     */
    getFinalObject: async (): Promise<T> => {
      try {
        logInfo('Waiting for final object', {
          operation: 'get_final_object_start',
        });

        const finalObject = await result.object;
        const validated = schema.parse(finalObject);

        logInfo('Final object retrieved and validated', {
          operation: 'get_final_object_complete',
        });

        return validated;
      } catch (error) {
        const finalError = error instanceof Error ? error : new Error(String(error));

        logError('Failed to get final object', {
          operation: 'get_final_object_error',
          error: finalError,
        });

        onError?.(finalError, { validationErrors: error instanceof z.ZodError ? [error] : [] });
        throw finalError;
      }
    },

    /**
     * Create a Response object for streaming the object
     */
    toStreamResponse: (): Response => {
      try {
        logInfo('Creating object stream response', {
          operation: 'create_object_stream_response',
        });

        return new Response(
          new ReadableStream({
            async start(controller) {
              try {
                for await (const part of result.fullStream) {
                  const chunk = JSON.stringify(part) + '\n';
                  controller.enqueue(new TextEncoder().encode(chunk));
                }
                controller.close();
              } catch (error) {
                const streamError = error instanceof Error ? error : new Error(String(error));
                onError?.(streamError, {});
                controller.error(streamError);
              }
            },
          }),
          {
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Cache-Control': 'no-cache',
              Connection: 'keep-alive',
            },
          },
        );
      } catch (error) {
        const responseError = error instanceof Error ? error : new Error(String(error));

        logError('Failed to create object stream response', {
          operation: 'create_object_stream_response_error',
          error: responseError,
        });

        onError?.(responseError, {});
        throw responseError;
      }
    },
  };
}

/**
 * Utility for common object streaming patterns
 */
export const objectStreamingPatterns = {
  /**
   * Create a progress tracking object stream
   */
  createProgressTracker: <T>(
    schema: ZodSchema<T>,
    onProgress: (progress: { current: number; total: number; percentage: number }) => void,
  ) => {
    let current = 0;
    let total = 100; // Default total, can be updated

    return {
      updateProgress: (newCurrent: number, newTotal?: number) => {
        current = newCurrent;
        if (newTotal !== undefined) {
          total = newTotal;
        }

        const percentage = Math.round((current / total) * 100);
        onProgress({ current, total, percentage });
      },

      complete: () => {
        onProgress({ current: total, total, percentage: 100 });
      },
    };
  },

  /**
   * Create a validation error collector
   */
  createValidationCollector: <T>() => {
    const errors: z.ZodError[] = [];
    const warnings: string[] = [];

    return {
      addError: (error: z.ZodError) => {
        errors.push(error);
      },

      addWarning: (warning: string) => {
        warnings.push(warning);
      },

      getReport: () => ({
        hasErrors: errors.length > 0,
        hasWarnings: warnings.length > 0,
        errorCount: errors.length,
        warningCount: warnings.length,
        errors,
        warnings,
      }),

      clear: () => {
        errors.length = 0;
        warnings.length = 0;
      },
    };
  },

  /**
   * Create a batched object processor
   */
  createBatchProcessor: <T>(batchSize: number = 10, onBatch: (batch: DeepPartial<T>[]) => void) => {
    let batch: DeepPartial<T>[] = [];

    return {
      addObject: (obj: DeepPartial<T>) => {
        batch.push(obj);

        if (batch.length >= batchSize) {
          onBatch([...batch]);
          batch.length = 0; // Clear batch
        }
      },

      flush: () => {
        if (batch.length > 0) {
          onBatch([...batch]);
          batch.length = 0;
        }
      },
    };
  },
};

/**
 * Create object streaming utilities from streamObject result
 *
 * This is the main entry point for object streaming functionality
 *
 * @param result - Result from AI SDK streamObject call
 * @param schema - Zod schema for validation
 * @param options - Additional configuration options
 * @returns Object streaming handler
 */
export function createObjectStream<T>(
  result: StreamObjectResult<T, T, any>,
  schema: ZodSchema<T>,
  options: Omit<ObjectStreamConfig<T>, 'schema'> = {},
) {
  return createObjectStreamHandler(result, { schema, ...options });
}
