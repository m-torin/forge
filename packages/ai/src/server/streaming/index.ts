import { logError } from '@repo/observability/server/next';
import { createDataStream, smoothStream, type DataStreamWriter, type StreamTextResult } from 'ai';

// Standard streaming utilities following Vercel AI SDK patterns

export interface StreamConfig {
  onError?: (error: unknown) => string;
  chunking?: 'word' | 'line' | 'none';
}

/**
 * Creates a data stream with standard error handling
 */
export function createStandardDataStream(
  execute: (dataStream: DataStreamWriter) => void | Promise<void>,
  config?: StreamConfig,
) {
  return createDataStream({
    execute,
    onError:
      config?.onError ||
      ((error: unknown) => {
        // Log error using centralized logger
        logError(
          'Stream error occurred',
          error instanceof Error ? error : new Error(String(error)),
          {
            operation: 'data_stream',
            metadata: { streaming: true },
          },
        );
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
 */
export function mergeIntoDataStream(
  result: StreamTextResult<any, any>,
  dataStream: DataStreamWriter,
  options?: {
    sendReasoning?: boolean;
  },
) {
  result.mergeIntoDataStream(dataStream, options);
}

// Artifact generation utilities
export * from './artifact-generation';

// Resumable streaming utilities
export * from './resumable-streams';

// Enhanced streaming utilities
export * from './enhanced-streams';

// Additional streaming exports
export * from './resumable';
export * from './vector-context';
