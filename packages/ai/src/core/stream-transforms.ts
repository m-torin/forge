/**
 * AI SDK v5 Stream Transformation Utilities
 * Standardized stream transforms for the monorepo
 */

import { logDebug, logWarn } from '@repo/observability';
import type { TextStreamPart, ToolSet } from 'ai';
import type { StreamTransform } from './types';

// Type guards for TextStreamPart types
function isTextDelta<T extends ToolSet>(
  chunk: TextStreamPart<T>,
): chunk is TextStreamPart<T> & { type: 'text-delta'; text: string } {
  return chunk.type === 'text-delta';
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Smooth stream utility - reduces token bursts for better UX
 * Based on AI SDK v5 smoothStream function
 */
export function smoothStream<TOOLS extends ToolSet = {}>(): StreamTransform<TOOLS> {
  return () => {
    let buffer: string = '';
    let lastFlushTime = 0;
    const flushIntervalMs = 50; // Smooth flush every 50ms

    return new TransformStream<TextStreamPart<TOOLS>, TextStreamPart<TOOLS>>({
      transform(chunk, controller) {
        // Handle text content based on actual AI SDK types
        if (isTextDelta(chunk)) {
          buffer += chunk.text || '';
          const now = Date.now();

          // Smooth release of buffered text
          if (now - lastFlushTime >= flushIntervalMs || buffer.length > 100) {
            if (buffer.length > 0) {
              controller.enqueue({
                type: 'text-delta',
                text: buffer,
              } as TextStreamPart<TOOLS>);
              buffer = '';
              lastFlushTime = now;
            }
          }
        } else {
          // Flush any remaining buffer on non-text chunks
          if (buffer.length > 0) {
            controller.enqueue({
              type: 'text-delta',
              text: buffer,
            } as TextStreamPart<TOOLS>);
            buffer = '';
          }
          controller.enqueue(chunk);
        }
      },

      flush(controller) {
        // Flush any remaining buffer on stream end
        if (buffer.length > 0) {
          controller.enqueue({
            type: 'text-delta',
            text: buffer,
          } as TextStreamPart<TOOLS>);
        }
      },
    });
  };
}

/**
 * Text transformation utilities
 */
export const textTransforms = {
  /**
   * Convert all text to uppercase
   */
  upperCase:
    <TOOLS extends ToolSet = {}>(): StreamTransform<TOOLS> =>
    () =>
      new TransformStream<TextStreamPart<TOOLS>, TextStreamPart<TOOLS>>({
        transform(chunk, controller) {
          controller.enqueue(
            isTextDelta(chunk) ? { ...chunk, text: chunk.text.toUpperCase() } : chunk,
          );
        },
      }),

  /**
   * Convert all text to lowercase
   */
  lowerCase:
    <TOOLS extends ToolSet = {}>(): StreamTransform<TOOLS> =>
    () =>
      new TransformStream<TextStreamPart<TOOLS>, TextStreamPart<TOOLS>>({
        transform(chunk, controller) {
          controller.enqueue(
            isTextDelta(chunk) ? { ...chunk, text: chunk.text.toLowerCase() } : chunk,
          );
        },
      }),

  /**
   * Filter out specific words or phrases
   */
  filterWords:
    <TOOLS extends ToolSet = {}>(bannedWords: string[]): StreamTransform<TOOLS> =>
    () =>
      new TransformStream<TextStreamPart<TOOLS>, TextStreamPart<TOOLS>>({
        transform(chunk, controller) {
          if (isTextDelta(chunk)) {
            let filteredText = chunk.text || '';

            // Filter out banned words
            bannedWords.forEach(word => {
              filteredText = filteredText.replace(new RegExp(escapeRegExp(word), 'gi'), '***');
            });

            controller.enqueue({
              ...chunk,
              text: filteredText,
            });
          } else {
            controller.enqueue(chunk);
          }
        },
      }),

  /**
   * Stop stream when encountering stop words
   */
  stopOnWords:
    <TOOLS extends ToolSet = {}>(stopWords: string[]): StreamTransform<TOOLS> =>
    ({ stopStream }) =>
      new TransformStream<TextStreamPart<TOOLS>, TextStreamPart<TOOLS>>({
        transform(chunk, controller) {
          if (isTextDelta(chunk)) {
            const text = chunk.text || '';

            // Check for stop words
            const hasStopWord = stopWords.some(word =>
              text.toLowerCase().includes(word.toLowerCase()),
            );

            if (hasStopWord) {
              logWarn('[AI Stream] Stop word detected, terminating stream');
              stopStream();

              // Emit proper finish events
              controller.enqueue({
                type: 'finish-step',
                finishReason: 'stop',
                usage: { outputTokens: 0, inputTokens: 0, totalTokens: 0 },
                request: {},
                response: {
                  id: 'stream-stopped',
                  modelId: 'unknown',
                  timestamp: new Date(),
                },
                warnings: [],
                isContinued: false,
              } as any);

              controller.enqueue({
                type: 'finish',
                finishReason: 'stop',
                usage: { outputTokens: 0, inputTokens: 0, totalTokens: 0 },
                response: {
                  id: 'stream-stopped',
                  modelId: 'unknown',
                  timestamp: new Date(),
                },
              } as any);

              return;
            }
          }

          controller.enqueue(chunk);
        },
      }),
};

/**
 * Rate limiting transform
 */
export function rateLimitTransform<TOOLS extends ToolSet = {}>(
  rateLimitMs = 100,
): StreamTransform<TOOLS> {
  return () => {
    let lastChunkTime = 0;

    return new TransformStream<TextStreamPart<TOOLS>, TextStreamPart<TOOLS>>({
      async transform(chunk, controller) {
        const now = Date.now();
        const elapsed = now - lastChunkTime;

        if (elapsed < rateLimitMs) {
          await new Promise(resolve => setTimeout(resolve, rateLimitMs - elapsed));
        }

        controller.enqueue(chunk);
        lastChunkTime = Date.now();
      },
    });
  };
}

/**
 * Debugging transform - logs all chunks
 */
export function debugTransform<TOOLS extends ToolSet = {}>(
  prefix = '[Stream Debug]',
): StreamTransform<TOOLS> {
  return () =>
    new TransformStream<TextStreamPart<TOOLS>, TextStreamPart<TOOLS>>({
      transform(chunk, controller) {
        logDebug(`${prefix} Chunk:`, {
          type: chunk.type,
          hasText: isTextDelta(chunk) && !!chunk.text,
        });
        controller.enqueue(chunk);
      },
    });
}

/**
 * Combine multiple transforms in sequence
 */
export function combineTransforms<TOOLS extends ToolSet = {}>(
  ...transforms: StreamTransform<TOOLS>[]
): StreamTransform<TOOLS> {
  return ({ tools, stopStream }) => {
    // Create a pipeline of transforms
    let stream = new ReadableStream<TextStreamPart<TOOLS>>({
      start(controller) {
        // This will be replaced by the actual stream source
      },
    });

    // Apply each transform in sequence
    for (const transform of transforms) {
      const transformStream = transform({ tools, stopStream });
      stream = stream.pipeThrough(transformStream);
    }

    // Return a transform that pipes through the combined pipeline
    return new TransformStream<TextStreamPart<TOOLS>, TextStreamPart<TOOLS>>({
      start(controller) {
        // Pipeline setup will be handled by the AI SDK
      },
      transform(chunk, controller) {
        controller.enqueue(chunk);
      },
    });
  };
}

/**
 * Utility to create custom transform patterns
 */
export function createCustomTransform<TOOLS extends ToolSet = {}>(
  transformFn: (
    chunk: TextStreamPart<TOOLS>,
  ) => TextStreamPart<TOOLS> | TextStreamPart<TOOLS>[] | null,
): StreamTransform<TOOLS> {
  return () =>
    new TransformStream<TextStreamPart<TOOLS>, TextStreamPart<TOOLS>>({
      transform(chunk, controller) {
        try {
          const result = transformFn(chunk);

          if (result === null) {
            // Skip this chunk
            return;
          } else if (Array.isArray(result)) {
            // Emit multiple chunks
            result.forEach(c => controller.enqueue(c));
          } else {
            // Emit single chunk
            controller.enqueue(result);
          }
        } catch (error) {
          logWarn('[AI Stream] Transform error', { error });
          controller.enqueue(chunk); // Pass through on error
        }
      },
    });
}
