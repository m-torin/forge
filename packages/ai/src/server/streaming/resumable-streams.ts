import { logError, logInfo } from '@repo/observability/server/next';
import { createDataStream, type DataStreamWriter } from 'ai';

/**
 * Configuration for resumable stream context
 */
export interface ResumableStreamConfig {
  /** Function to wait until completion (like Next.js after) */
  waitUntil?: (promise: Promise<any>) => void;
  /** Redis URL for stream persistence */
  redisUrl?: string;
  /** Custom stream storage adapter */
  storageAdapter?: ResumableStreamStorage;
}

/**
 * Interface for resumable stream storage
 */
export interface ResumableStreamStorage {
  store(streamId: string, data: any): Promise<void>;
  retrieve(streamId: string): Promise<any>;
  delete(streamId: string): Promise<void>;
}

/**
 * Context for managing resumable streams
 */
export interface ResumableStreamContext {
  resumableStream(streamId: string, factory: () => ReadableStream): Promise<ReadableStream>;
}

/**
 * Creates a resumable stream context
 * Note: This is a mock implementation. In production, you'd use a proper
 * resumable stream library like 'resumable-stream'
 */
export function createResumableStreamContext(
  config: ResumableStreamConfig,
): ResumableStreamContext | null {
  try {
    // Check if we have the necessary dependencies
    if (!config.redisUrl && !config.storageAdapter) {
      logInfo('Resumable streams disabled - no storage configured', {
        operation: 'resumable_streams',
      });
      return null;
    }

    return {
      async resumableStream(streamId: string, factory: () => ReadableStream) {
        // This is a simplified implementation
        // In a real scenario, you'd check storage for existing streams
        return factory();
      },
    };
  } catch (error: any) {
    if (error.message?.includes('REDIS_URL')) {
      logInfo('Resumable streams disabled - Redis not available', {
        operation: 'resumable_streams',
      });
    } else {
      logError(
        'Failed to create resumable stream context',
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'resumable_streams' },
      );
    }
    return null;
  }
}

/**
 * Global stream context manager
 */
class StreamContextManager {
  private context: ResumableStreamContext | null = null;
  private initialized = false;

  initialize(config: ResumableStreamConfig): void {
    if (!this.initialized) {
      this.context = createResumableStreamContext(config);
      this.initialized = true;
    }
  }

  getContext(): ResumableStreamContext | null {
    return this.context;
  }

  reset(): void {
    this.context = null;
    this.initialized = false;
  }
}

const globalStreamManager = new StreamContextManager();

/**
 * Initialize the global stream context
 */
export function initializeStreamContext(config: ResumableStreamConfig): void {
  globalStreamManager.initialize(config);
}

/**
 * Get the global stream context
 */
export function getStreamContext(): ResumableStreamContext | null {
  return globalStreamManager.getContext();
}

/**
 * Reset the global stream context (useful for testing)
 */
export function resetStreamContext(): void {
  globalStreamManager.reset();
}

/**
 * Create a resumable data stream
 */
export function createResumableDataStream(
  streamId: string,
  execute: (dataStream: DataStreamWriter) => void | Promise<void>,
  config?: {
    onError?: (error: unknown) => string;
    fallbackFactory?: () => ReadableStream;
  },
): Promise<ReadableStream> | ReadableStream {
  const streamContext = getStreamContext();

  // Create the base data stream
  const dataStream = createDataStream({
    execute,
    onError: config?.onError || (() => 'An error occurred while streaming.'),
  });

  // If no resumable context, return regular stream
  if (!streamContext) {
    return dataStream;
  }

  // Return resumable stream
  return streamContext.resumableStream(streamId, () => dataStream);
}

/**
 * Utility for creating empty data streams (for resumable stream fallbacks)
 */
export function createEmptyDataStream(): ReadableStream {
  return createDataStream({
    execute: () => {},
  });
}

/**
 * Create a restored data stream from a message
 */
export function createRestoredDataStream(message: any): ReadableStream {
  return createDataStream({
    execute: buffer => {
      buffer.writeData({
        type: 'append-message',
        message: JSON.stringify(message),
      });
    },
  });
}
