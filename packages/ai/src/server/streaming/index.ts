import { logError } from '@repo/observability/server/next';
import {
  createUIMessageStream,
  smoothStream,
  type StreamTextResult,
  type UIMessageStreamWriter,
} from 'ai';

// Standard streaming utilities following Vercel AI SDK patterns

export interface StreamConfig {
  onError?: (error: unknown) => string;
  chunking?: 'word' | 'line' | 'none';
}

/**
 * Creates a data stream with standard error handling
 */
export function createStandardDataStream(
  execute: (dataStream: UIMessageStreamWriter) => void | Promise<void>,
  config?: StreamConfig,
) {
  return createUIMessageStream({
    execute,
    onError:
      config?.onError ||
      ((error: unknown) => {
        // Log error using centralized logger
        logError('Stream error occurred', {
          operation: 'data_stream',
          metadata: { streaming: true },
          error: error instanceof Error ? error : new Error(String(error)),
        });
        return 'An error occurred while streaming.';
      }),
  });
}

/**
 * Creates smooth stream transform for use in streamText calls
 */
export function createSmoothStreamTransform(chunking: 'word' | 'line' = 'word') {
  return smoothStream({ chunking });
}

/**
 * Helper to merge stream results into a data stream
 * AI SDK v5: Uses writer.merge() instead of result.mergeIntoDataStream()
 */
export function mergeIntoDataStream(
  result: StreamTextResult<any, any>,
  dataStream: UIMessageStreamWriter,
  _options?: {
    sendReasoning?: boolean;
  },
) {
  // AI SDK v5: Convert to UI message stream and merge
  const uiMessageStream = result.toUIMessageStream();
  dataStream.merge(uiMessageStream);
}

// Artifact generation utilities
export * from './artifact-generation';

// Resumable streaming utilities
export * from './resumable-streams';

// Streaming patterns and utilities
export * from './streaming-transformations';

// AI SDK v5 streaming patterns
export * from './v5-chunk-patterns';

// Additional streaming exports
export * from './resumable';
export * from './stream-defaults';
export * from './ui-patterns';
export * from './vector-context';
