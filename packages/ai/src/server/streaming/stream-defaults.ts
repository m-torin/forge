import { smoothStream, type StreamTextTransform } from 'ai';

/**
 * Default stream transformation for AI SDK v5
 * Uses word-based chunking for smooth streaming
 */
export const defaultStreamTransform = smoothStream({ chunking: 'word' });

/**
 * Stream transformation presets for different use cases
 */
export const streamTransformPresets = {
  /** Word-based chunking for natural text streaming */
  word: smoothStream({ chunking: 'word' }),

  /** Line-based chunking for structured output */
  line: smoothStream({ chunking: 'line' }),

  /** No chunking - stream as received */
  none: undefined,
} as const;

/**
 * Creates a custom stream transform with options
 */
export function createStreamTransform(
  chunking: 'word' | 'line' | 'none' = 'word',
): StreamTextTransform<any> | undefined {
  return streamTransformPresets[chunking];
}
