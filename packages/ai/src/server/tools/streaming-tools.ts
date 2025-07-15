/**
 * Tool Result Streaming and Progressive Disclosure - AI SDK v5
 *
 * Provides streaming capabilities for long-running tool operations
 * with progressive result disclosure and real-time updates.
 */

import { tool as aiTool, type Tool } from 'ai';
import { z } from 'zod/v4';

/**
 * Streaming result types
 */
export type StreamingResultType =
  | 'progress'
  | 'partial'
  | 'intermediate'
  | 'final'
  | 'error'
  | 'metadata';

/**
 * Streaming result chunk
 */
export interface StreamingChunk<T = any> {
  type: StreamingResultType;
  data: T;
  timestamp: number;
  sequence: number;
  metadata?: Record<string, any>;
}

/**
 * Progress information
 */
export interface ProgressInfo {
  current: number;
  total: number;
  percentage: number;
  stage?: string;
  estimatedTimeRemaining?: number;
  message?: string;
}

/**
 * Streaming tool configuration
 */
export interface StreamingToolConfig<TParams = any, TResult = any> {
  description: string;
  inputSchema: z.ZodSchema<TParams>;
  execute: (
    args: TParams,
    stream: StreamingToolContext,
  ) => AsyncGenerator<StreamingChunk<any>, TResult, unknown> | Promise<TResult>;

  /** Enable progress tracking */
  trackProgress?: boolean;
  /** Enable intermediate results */
  enableIntermediateResults?: boolean;
  /** Chunk size for large data */
  chunkSize?: number;
  /** Stream timeout (ms) */
  streamTimeout?: number;
  /** Buffer size for chunks */
  bufferSize?: number;
}

/**
 * Streaming tool context
 */
export interface StreamingToolContext {
  /** Emit progress update */
  progress: (info: ProgressInfo) => void;
  /** Emit partial result */
  partial: (data: any, metadata?: Record<string, any>) => void;
  /** Emit intermediate result */
  intermediate: (data: any, stage?: string) => void;
  /** Emit metadata */
  metadata: (data: Record<string, any>) => void;
  /** Check if stream is cancelled */
  isCancelled: () => boolean;
  /** Get current sequence number */
  getSequence: () => number;
}

/**
 * Streaming session state
 */
interface StreamingSession {
  id: string;
  startTime: number;
  chunks: StreamingChunk[];
  cancelled: boolean;
  sequence: number;
  subscribers: Set<(chunk: StreamingChunk) => void>;
}

/**
 * Global streaming sessions registry
 */
const streamingSessions = new Map<string, StreamingSession>();

/**
 * Create streaming tool context
 */
function createStreamingContext(sessionId: string): StreamingToolContext {
  const session = streamingSessions.get(sessionId);
  if (!session) {
    throw new Error(`Streaming session ${sessionId} not found`);
  }

  return {
    progress: (info: ProgressInfo) => {
      const chunk: StreamingChunk<ProgressInfo> = {
        type: 'progress',
        data: info,
        timestamp: Date.now(),
        sequence: ++session.sequence,
      };

      session.chunks.push(chunk);
      session.subscribers.forEach(subscriber => subscriber(chunk));
    },

    partial: (data: any, metadata?: Record<string, any>) => {
      const chunk: StreamingChunk = {
        type: 'partial',
        data,
        timestamp: Date.now(),
        sequence: ++session.sequence,
        metadata,
      };

      session.chunks.push(chunk);
      session.subscribers.forEach(subscriber => subscriber(chunk));
    },

    intermediate: (data: any, stage?: string) => {
      const chunk: StreamingChunk = {
        type: 'intermediate',
        data,
        timestamp: Date.now(),
        sequence: ++session.sequence,
        metadata: stage ? { stage } : undefined,
      };

      session.chunks.push(chunk);
      session.subscribers.forEach(subscriber => subscriber(chunk));
    },

    metadata: (data: Record<string, any>) => {
      const chunk: StreamingChunk<Record<string, any>> = {
        type: 'metadata',
        data,
        timestamp: Date.now(),
        sequence: ++session.sequence,
      };

      session.chunks.push(chunk);
      session.subscribers.forEach(subscriber => subscriber(chunk));
    },

    isCancelled: () => session.cancelled,

    getSequence: () => session.sequence,
  };
}

/**
 * Create a streaming tool
 */
export function createStreamingTool<TParams, TResult>(
  config: StreamingToolConfig<TParams, TResult>,
): Tool & {
  stream: (args: TParams) => AsyncGenerator<StreamingChunk, TResult, unknown>;
  subscribe: (sessionId: string, callback: (chunk: StreamingChunk) => void) => () => void;
  cancel: (sessionId: string) => void;
  getSession: (sessionId: string) => StreamingSession | undefined;
} {
  const baseTool = aiTool({
    description: config.description,
    inputSchema: config.inputSchema,
    execute: async (args: any, _options: any) => {
      // For non-streaming execution, run to completion
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create session
      const session: StreamingSession = {
        id: sessionId,
        startTime: Date.now(),
        chunks: [],
        cancelled: false,
        sequence: 0,
        subscribers: new Set(),
      };

      streamingSessions.set(sessionId, session);

      try {
        const context = createStreamingContext(sessionId);
        const result = await config.execute(args, context);

        let finalResult: TResult | undefined;

        // Handle both sync and async generator results
        if (result && typeof result === 'object' && 'next' in result) {
          // It's an async generator, consume it
          for await (const value of result as AsyncGenerator<any, TResult, unknown>) {
            finalResult = value;
          }
          return finalResult as TResult;
        }
        return result as TResult;
      } finally {
        // Clean up session after a delay
        setTimeout(() => {
          streamingSessions.delete(sessionId);
        }, 60000); // Keep for 1 minute
      }
    },
  } as any) as Tool;

  return Object.assign(baseTool, {
    /**
     * Stream execution with real-time updates
     */
    stream: async function* (args: TParams): AsyncGenerator<StreamingChunk, TResult, unknown> {
      const sessionId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create session
      const session: StreamingSession = {
        id: sessionId,
        startTime: Date.now(),
        chunks: [],
        cancelled: false,
        sequence: 0,
        subscribers: new Set(),
      };

      streamingSessions.set(sessionId, session);

      try {
        const context = createStreamingContext(sessionId);

        // Set up chunk buffering
        const chunkBuffer: StreamingChunk[] = [];
        let bufferTimeout: NodeJS.Timeout | null = null;

        const subscriber = (chunk: StreamingChunk) => {
          chunkBuffer.push(chunk);

          // Clear existing timeout
          if (bufferTimeout) {
            clearTimeout(bufferTimeout);
          }

          // Set new timeout to flush buffer
          bufferTimeout = setTimeout(() => {
            const _chunksToFlush = chunkBuffer.splice(0);
            // In a real implementation, these would be yielded
            // For this example, we store them in the session
          }, 50); // 50ms buffer
        };

        session.subscribers.add(subscriber);

        // Execute the tool
        const executionResult = config.execute(args, context);

        if (executionResult && typeof executionResult === 'object' && 'next' in executionResult) {
          // It's an async generator
          const generator = executionResult as AsyncGenerator<
            StreamingChunk<any>,
            TResult,
            unknown
          >;

          let done = false;
          let finalResult: TResult | undefined;

          while (!done && !session.cancelled) {
            try {
              const { value, done: iterDone } = await generator.next();

              if (iterDone) {
                done = true;
                finalResult = value;
              } else {
                yield value;
              }
            } catch (error) {
              const errorChunk: StreamingChunk = {
                type: 'error',
                data: { error: error instanceof Error ? error.message : String(error) },
                timestamp: Date.now(),
                sequence: ++session.sequence,
              };

              yield errorChunk;
              throw error;
            }
          }

          return finalResult as TResult;
        } else {
          // It's a regular promise - wait for completion and yield chunks from session
          const result = await executionResult;

          // Yield all accumulated chunks
          for (const chunk of session.chunks) {
            if (!session.cancelled) {
              yield chunk;
            }
          }

          return result;
        }
      } finally {
        // Clean up session
        setTimeout(() => {
          streamingSessions.delete(sessionId);
        }, 60000);
      }
    },

    /**
     * Subscribe to streaming updates for a session
     */
    subscribe: (sessionId: string, callback: (chunk: StreamingChunk) => void) => {
      const session = streamingSessions.get(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      session.subscribers.add(callback);

      // Return unsubscribe function
      return () => {
        session.subscribers.delete(callback);
      };
    },

    /**
     * Cancel a streaming session
     */
    cancel: (sessionId: string) => {
      const session = streamingSessions.get(sessionId);
      if (session) {
        session.cancelled = true;

        const cancelChunk: StreamingChunk = {
          type: 'error',
          data: { cancelled: true },
          timestamp: Date.now(),
          sequence: ++session.sequence,
        };

        session.subscribers.forEach(subscriber => subscriber(cancelChunk));
      }
    },

    /**
     * Get session information
     */
    getSession: (sessionId: string) => {
      return streamingSessions.get(sessionId);
    },
  });
}

/**
 * Utility functions for common streaming patterns
 */
export const streamingUtils = {
  /**
   * Create progress tracker
   */
  createProgressTracker: (total: number, stage?: string) => {
    let current = 0;

    return {
      increment: (amount = 1, message?: string): ProgressInfo => {
        current = Math.min(current + amount, total);
        return {
          current,
          total,
          percentage: Math.round((current / total) * 100),
          stage,
          message,
        };
      },

      setProgress: (value: number, message?: string) => {
        current = Math.min(Math.max(value, 0), total);
        return {
          current,
          total,
          percentage: Math.round((current / total) * 100),
          stage,
          message,
        };
      },

      complete: (message?: string) => {
        current = total;
        return {
          current,
          total,
          percentage: 100,
          stage,
          message: message || 'Complete',
        };
      },
    };
  },

  /**
   * Chunk large data for streaming
   */
  chunkData: <T>(data: T[], chunkSize: number = 10): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize));
    }
    return chunks;
  },

  /**
   * Create time estimator
   */
  createTimeEstimator: () => {
    const startTime = Date.now();

    return (current: number, total: number) => {
      if (current === 0) return undefined;

      const elapsed = Date.now() - startTime;
      const rate = current / elapsed;
      const remaining = total - current;

      return remaining / rate;
    };
  },

  /**
   * Throttle streaming updates
   */
  createThrottledEmitter: (minInterval: number = 100) => {
    let lastEmitTime = 0;
    let pendingEmit: (() => void) | null = null;

    return (emitFn: () => void) => {
      const now = Date.now();

      if (now - lastEmitTime >= minInterval) {
        emitFn();
        lastEmitTime = now;

        if (pendingEmit) {
          clearTimeout(pendingEmit as any);
          pendingEmit = null;
        }
      } else if (!pendingEmit) {
        pendingEmit = setTimeout(
          () => {
            emitFn();
            lastEmitTime = Date.now();
            pendingEmit = null;
          },
          minInterval - (now - lastEmitTime),
        ) as any;
      }
    };
  },
};

/**
 * Example streaming tools
 */
export const streamingExamples = {
  /**
   * Large dataset processor with progress tracking
   */
  dataProcessor: createStreamingTool({
    description: 'Process large dataset with progress updates',
    inputSchema: z.object({
      data: z.array(z.any()),
      batchSize: z.number().default(10),
      delay: z.number().default(100),
    }),
    trackProgress: true,
    enableIntermediateResults: true,

    execute: async function* (args, stream) {
      const { data, batchSize, delay } = args;
      const batches = streamingUtils.chunkData(data, batchSize);
      const progressTracker = streamingUtils.createProgressTracker(batches.length, 'Processing');
      const timeEstimator = streamingUtils.createTimeEstimator();

      const results: any[] = [];

      for (let i = 0; i < batches.length; i++) {
        if (stream.isCancelled()) {
          break;
        }

        const batch = batches[i];

        // Process batch (simulate work)
        await new Promise(resolve => setTimeout(resolve, delay));
        const processedBatch = batch.map(item => ({ ...item, processed: true, batchIndex: i }));

        results.push(...processedBatch);

        // Emit progress
        const progress = progressTracker.increment(1, `Processed batch ${i + 1}/${batches.length}`);
        progress.estimatedTimeRemaining = timeEstimator(i + 1, batches.length);
        stream.progress(progress);

        // Emit intermediate results
        stream.intermediate(processedBatch, `batch-${i}`);

        // Emit partial accumulated results every 5 batches
        if ((i + 1) % 5 === 0) {
          stream.partial(results.slice(), { processedBatches: i + 1 });
        }

        yield {
          type: 'intermediate' as StreamingResultType,
          data: processedBatch,
          timestamp: Date.now(),
          sequence: stream.getSequence(),
          metadata: { batchIndex: i, totalBatches: batches.length },
        };
      }

      // Final result
      return {
        processedData: results,
        totalProcessed: results.length,
        batchCount: batches.length,
        completedAt: new Date().toISOString(),
      };
    },
  }),

  /**
   * File download simulator with progress
   */
  fileDownloader: createStreamingTool({
    description: 'Download file with progress tracking',
    inputSchema: z.object({
      url: z.string().url(),
      filename: z.string(),
      size: z.number().positive(),
    }),
    trackProgress: true,

    execute: async function* (args, stream) {
      const { url, filename, size } = args;
      const chunkSize = Math.max(Math.floor(size / 100), 1024); // ~1% chunks
      const progressTracker = streamingUtils.createProgressTracker(size, 'Downloading');
      const timeEstimator = streamingUtils.createTimeEstimator();

      let downloaded = 0;
      const chunks: Buffer[] = [];

      stream.metadata({
        url,
        filename,
        totalSize: size,
        startTime: new Date().toISOString(),
      });

      while (downloaded < size) {
        if (stream.isCancelled()) {
          throw new Error('Download cancelled');
        }

        // Simulate download delay
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));

        const remainingSize = size - downloaded;
        const currentChunkSize = Math.min(chunkSize, remainingSize);

        // Simulate chunk data
        const chunk = Buffer.alloc(currentChunkSize, 'x');
        chunks.push(chunk);
        downloaded += currentChunkSize;

        // Emit progress
        const progress = {
          ...progressTracker.setProgress(downloaded, `Downloaded ${downloaded}/${size} bytes`),
          estimatedTimeRemaining: timeEstimator(downloaded, size),
        };
        stream.progress(progress);

        // Emit partial data every 10% or so
        if (downloaded % Math.floor(size / 10) < chunkSize) {
          stream.partial({
            downloadedBytes: downloaded,
            chunks: chunks.length,
            percentage: Math.round((downloaded / size) * 100),
          });
        }

        yield {
          type: 'progress' as StreamingResultType,
          data: progress,
          timestamp: Date.now(),
          sequence: stream.getSequence(),
        };
      }

      return {
        filename,
        size: downloaded,
        chunks: chunks.length,
        data: Buffer.concat(chunks),
        completedAt: new Date().toISOString(),
      };
    },
  }),

  /**
   * Multi-stage analysis tool
   */
  multiStageAnalyzer: createStreamingTool({
    description: 'Perform multi-stage analysis with intermediate results',
    inputSchema: z.object({
      input: z.any(),
      stages: z.array(z.string()).default(['parse', 'validate', 'analyze', 'summarize']),
    }),
    enableIntermediateResults: true,

    execute: async function* (args, stream) {
      const { input, stages } = args;
      const progressTracker = streamingUtils.createProgressTracker(stages.length, 'Analysis');

      let currentResult = input;
      const stageResults: Record<string, any> = {};

      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];

        if (stream.isCancelled()) {
          break;
        }

        stream.metadata({ currentStage: stage, stageIndex: i + 1, totalStages: stages.length });

        // Simulate stage processing
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

        // Mock stage processing
        const stageResult = {
          stage,
          input: currentResult,
          output: `${stage}_result_for_${JSON.stringify(currentResult).slice(0, 50)}`,
          timestamp: new Date().toISOString(),
          duration: Math.random() * 1000,
        };

        stageResults[stage] = stageResult;
        currentResult = stageResult.output;

        // Emit progress
        const progress = progressTracker.increment(1, `Completed ${stage}`);
        stream.progress(progress);

        // Emit intermediate result
        stream.intermediate(stageResult, stage);

        yield {
          type: 'intermediate' as StreamingResultType,
          data: stageResult,
          timestamp: Date.now(),
          sequence: stream.getSequence(),
          metadata: { stage, completed: i + 1, total: stages.length },
        };
      }

      return {
        finalResult: currentResult,
        stageResults,
        completedStages: Object.keys(stageResults),
        totalDuration: Object.values(stageResults).reduce(
          (sum, result) => sum + result.duration,
          0,
        ),
        completedAt: new Date().toISOString(),
      };
    },
  }),
};

/**
 * Get all active streaming sessions
 */
export function getActiveStreamingSessions(): Record<
  string,
  Omit<StreamingSession, 'subscribers'>
> {
  const sessions: Record<string, Omit<StreamingSession, 'subscribers'>> = {};

  for (const [id, session] of streamingSessions) {
    sessions[id] = {
      id: session.id,
      startTime: session.startTime,
      chunks: session.chunks,
      cancelled: session.cancelled,
      sequence: session.sequence,
    };
  }

  return sessions;
}

/**
 * Clean up old streaming sessions
 */
export function cleanupStreamingSessions(maxAge: number = 3600000): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [id, session] of streamingSessions) {
    if (now - session.startTime > maxAge) {
      streamingSessions.delete(id);
      cleaned++;
    }
  }

  return cleaned;
}
