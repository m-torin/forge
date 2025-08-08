/**
 * MCP Tool: Streaming Utilities
 * Provides Node.js 22+ streaming utilities for efficient data processing
 */

import { pipeline } from 'node:stream/promises';
import { scheduler } from 'node:timers/promises';
import type { MCPToolResponse } from '../types/mcp';
import { AbortableToolArgs, throwIfAborted } from '../utils/abort-support';
import { ioQueue } from '../utils/concurrency';
import { withRetry } from '../utils/retryable';
import { yieldToEventLoop } from '../utils/scheduler';
import { createSafeFunction } from '../utils/security';
import {
  asyncGeneratorToReadableStream,
  createBatchingTransformStream,
  createCollectorWritableStream,
  createThrottlingTransformStream,
  createTransformStream,
  mergeReadableStreams,
  pipelineStreams,
  streamWithBackpressure,
} from '../utils/streams';
import { safeStringifyAdvanced } from '../utils/stringify';
import { ok, runTool } from '../utils/tool-helpers';

export interface StreamingUtilitiesArgs extends AbortableToolArgs {
  action:
    | 'streamArray'
    | 'streamTransform'
    | 'streamFilter'
    | 'streamReduce'
    | 'streamMerge'
    | 'streamBatch'
    | 'streamThrottle'
    | 'streamBuffer'
    | 'streamCompress'
    | 'streamParallel'
    | 'createAsyncIterator'
    // Web Streams API actions
    | 'createWebReadableStream'
    | 'createWebTransformStream'
    | 'pipelineWebStreams'
    | 'webStreamBackpressure'
    | 'mergeWebStreams'; // Merge multiple Web Streams

  // Data input
  data?: any[];
  streams?: any[][];

  // Processing options
  chunkSize?: number;
  batchSize?: number;
  transformFunction?: string;
  filterFunction?: string;
  reduceFunction?: string;
  initialValue?: any;

  // Performance options
  throttleMs?: number;
  bufferSize?: number;
  parallelism?: number;
  compressionLevel?: number;

  // Iterator options
  iteratorName?: string;
  iteratorCode?: string;
}

export interface StreamingChunk<T = any> {
  data: T;
  index: number;
  isComplete: boolean;
  timestamp: string;
  bytesProcessed?: number;
  metadata?: Record<string, any>;
}

export const streamingUtilitiesTool = {
  name: 'streaming_utilities',
  description: 'Node.js 22+ streaming utilities for efficient data processing',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: [
          'streamArray',
          'streamTransform',
          'streamFilter',
          'streamReduce',
          'streamMerge',
          'streamBatch',
          'streamThrottle',
          'streamBuffer',
          'streamCompress',
          'streamParallel',
          'createAsyncIterator',
          'createWebReadableStream',
          'createWebTransformStream',
          'pipelineWebStreams',
          'webStreamBackpressure',
          'mergeWebStreams',
        ],
        description: 'Streaming operation to perform',
      },
      data: {
        type: 'array',
        description: 'Input data array for streaming operations',
      },
      streams: {
        type: 'array',
        items: { type: 'array' },
        description: 'Multiple data streams for merge operations',
      },
      chunkSize: {
        type: 'number',
        description: 'Size of each streamed chunk',
        default: 10,
      },
      batchSize: {
        type: 'number',
        description: 'Size of batches for batch operations',
        default: 5,
      },
      transformFunction: {
        type: 'string',
        description: 'JavaScript function to transform data (e.g., "x => x * 2")',
      },
      filterFunction: {
        type: 'string',
        description: 'JavaScript function to filter data (e.g., "x => x > 10")',
      },
      reduceFunction: {
        type: 'string',
        description: 'JavaScript function to reduce data (e.g., "(acc, x) => acc + x")',
      },
      initialValue: {
        description: 'Initial value for reduce operations',
      },
      throttleMs: {
        type: 'number',
        description: 'Throttling delay in milliseconds',
        default: 100,
      },
      bufferSize: {
        type: 'number',
        description: 'Buffer size for backpressure management',
        default: 1000,
      },
      parallelism: {
        type: 'number',
        description: 'Number of parallel workers',
        default: 4,
      },
      compressionLevel: {
        type: 'number',
        description: 'Compression level (1-9)',
        minimum: 1,
        maximum: 9,
        default: 6,
      },
      iteratorName: {
        type: 'string',
        description: 'Name for custom async iterator',
      },
      iteratorCode: {
        type: 'string',
        description: 'Custom async iterator implementation code',
      },
      signal: {
        description: 'AbortSignal for cancelling the operation',
      },
    },
    required: ['action'],
  },

  async execute(args: StreamingUtilitiesArgs): Promise<MCPToolResponse> {
    return runTool('StreamingUtilities', args.action, async () => {
      const {
        action,
        data = [],
        streams = [],
        chunkSize = 10,
        batchSize = 5,
        transformFunction,
        filterFunction,
        reduceFunction,
        initialValue,
        throttleMs = 100,
        bufferSize = 1000,
        parallelism = 4,
        compressionLevel = 6,
        iteratorName,
        iteratorCode,
        signal,
      } = args;

      // Check for abort signal at start
      throwIfAborted(signal);

      switch (action) {
        case 'streamArray': {
          if (data.length === 0) {
            throw new Error('Data array required for streamArray operation');
          }

          // Use manual collection for compatibility
          const chunks: any[] = [];
          for await (const chunk of streamArray(data, { chunkSize, signal })) {
            throwIfAborted(signal);
            chunks.push(chunk);
          }

          return ok({
            success: true,
            operation: 'streamArray',
            chunks: chunks.length,
            results: chunks,
            totalItems: data.length,
          });
        }

        case 'streamTransform': {
          if (!transformFunction) {
            throw new Error('Transform function required for streamTransform operation');
          }
          if (data.length === 0) {
            throw new Error('Data array required for streamTransform operation');
          }

          // Security: Use safe VM context instead of new Function
          const transform = createSafeFunction(transformFunction, 'x');

          // Use manual collection for compatibility
          const chunks: any[] = [];
          for await (const chunk of streamTransform(data, transform, { chunkSize, signal })) {
            throwIfAborted(signal);
            chunks.push(chunk);
          }

          return ok({
            success: true,
            operation: 'streamTransform',
            chunks: chunks.length,
            results: chunks,
            transformFunction,
          });
        }

        case 'streamFilter': {
          if (!filterFunction) {
            throw new Error('Filter function required for streamFilter operation');
          }
          if (data.length === 0) {
            throw new Error('Data array required for streamFilter operation');
          }

          // Security: Use safe VM context instead of new Function
          const filterFn = createSafeFunction(filterFunction, 'x');
          const filter = (x: any): boolean => Boolean(filterFn(x));
          const chunks: StreamingChunk[] = [];

          for await (const chunk of streamFilter(data, filter, { chunkSize, signal })) {
            chunks.push(chunk);

            if (chunks.length % 5 === 0) {
              await yieldToEventLoop();
            }
          }

          return {
            content: [
              {
                type: 'text' as const,
                text: safeStringifyAdvanced({
                  success: true,
                  operation: 'streamFilter',
                  chunks: chunks.length,
                  results: chunks,
                  filterFunction,
                }).result,
              },
            ],
          };
        }

        case 'streamReduce': {
          if (!reduceFunction) {
            throw new Error('Reduce function required for streamReduce operation');
          }
          if (data.length === 0) {
            throw new Error('Data array required for streamReduce operation');
          }

          // Security: Use safe VM context instead of new Function - need special handling for 2 parameters
          const reducer = createSafeFunction(reduceFunction, ['acc', 'x']);
          const result = await streamReduce(data, reducer, initialValue, { signal });

          return {
            content: [
              {
                type: 'text' as const,
                text: safeStringifyAdvanced({
                  success: true,
                  operation: 'streamReduce',
                  result,
                  reduceFunction,
                  initialValue,
                }).result,
              },
            ],
          };
        }

        case 'streamMerge': {
          if (streams.length === 0) {
            throw new Error('Multiple streams required for streamMerge operation');
          }

          const chunks: StreamingChunk[] = [];

          for await (const chunk of streamMerge(streams, { chunkSize, signal })) {
            chunks.push(chunk);

            if (chunks.length % 5 === 0) {
              await yieldToEventLoop();
            }
          }

          return {
            content: [
              {
                type: 'text' as const,
                text: safeStringifyAdvanced({
                  success: true,
                  operation: 'streamMerge',
                  chunks: chunks.length,
                  results: chunks,
                  streamCount: streams.length,
                }).result,
              },
            ],
          };
        }

        case 'streamBatch': {
          if (data.length === 0) {
            throw new Error('Data array required for streamBatch operation');
          }

          const chunks: StreamingChunk[] = [];

          for await (const chunk of streamBatch(data, { batchSize, signal })) {
            chunks.push(chunk);

            if (chunks.length % 3 === 0) {
              await yieldToEventLoop();
            }
          }

          return {
            content: [
              {
                type: 'text' as const,
                text: safeStringifyAdvanced({
                  success: true,
                  operation: 'streamBatch',
                  chunks: chunks.length,
                  results: chunks,
                  batchSize,
                }).result,
              },
            ],
          };
        }

        case 'streamThrottle': {
          if (data.length === 0) {
            throw new Error('Data array required for streamThrottle operation');
          }

          const chunks: StreamingChunk[] = [];

          for await (const chunk of streamThrottle(data, { throttleMs, chunkSize, signal })) {
            chunks.push(chunk);
          }

          return {
            content: [
              {
                type: 'text' as const,
                text: safeStringifyAdvanced({
                  success: true,
                  operation: 'streamThrottle',
                  chunks: chunks.length,
                  results: chunks,
                  throttleMs,
                }).result,
              },
            ],
          };
        }

        case 'streamBuffer': {
          if (data.length === 0) {
            throw new Error('Data array required for streamBuffer operation');
          }

          const chunks: StreamingChunk[] = [];

          for await (const chunk of streamBuffer(data, { bufferSize, chunkSize, signal })) {
            chunks.push(chunk);

            if (chunks.length % 5 === 0) {
              await yieldToEventLoop();
            }
          }

          return {
            content: [
              {
                type: 'text' as const,
                text: safeStringifyAdvanced({
                  success: true,
                  operation: 'streamBuffer',
                  chunks: chunks.length,
                  results: chunks,
                  bufferSize,
                }).result,
              },
            ],
          };
        }

        case 'streamParallel': {
          if (data.length === 0) {
            throw new Error('Data array required for streamParallel operation');
          }
          if (!transformFunction) {
            throw new Error('Transform function required for parallel processing');
          }

          // Security: Use safe VM context instead of new Function
          const transform = createSafeFunction(transformFunction, 'x');
          const chunks: StreamingChunk[] = [];

          for await (const chunk of streamParallel(data, transform, {
            parallelism,
            chunkSize,
            signal,
          })) {
            chunks.push(chunk);

            if (chunks.length % 3 === 0) {
              await yieldToEventLoop();
            }
          }

          return {
            content: [
              {
                type: 'text' as const,
                text: safeStringifyAdvanced({
                  success: true,
                  operation: 'streamParallel',
                  chunks: chunks.length,
                  results: chunks,
                  parallelism,
                  transformFunction,
                }).result,
              },
            ],
          };
        }

        case 'createAsyncIterator': {
          if (!iteratorName || !iteratorCode) {
            throw new Error('Iterator name and code required for createAsyncIterator');
          }

          // Security: Use safe VM context for iterator creation
          const iteratorFactory = createSafeFunction(iteratorCode, 'signal');
          const iterator = iteratorFactory(signal) as AsyncIterable<any>;

          if (!iterator || typeof iterator[Symbol.asyncIterator] !== 'function') {
            throw new Error('Iterator code must return an async iterable');
          }

          const chunks: any[] = [];
          let index = 0;

          for await (const value of iterator) {
            throwIfAborted(signal);

            chunks.push({
              data: value,
              index: index++,
              timestamp: new Date().toISOString(),
            });

            // Limit iterations to prevent infinite loops
            if (index > 100) break;

            if (index % 5 === 0) {
              await yieldToEventLoop();
            }
          }

          return {
            content: [
              {
                type: 'text' as const,
                text: safeStringifyAdvanced({
                  success: true,
                  operation: 'createAsyncIterator',
                  iteratorName,
                  iterations: chunks.length,
                  results: chunks,
                }).result,
              },
            ],
          };
        }

        case 'createWebReadableStream': {
          if (data.length === 0) {
            throw new Error('Data array required for createWebReadableStream operation');
          }

          const chunks: any[] = [];

          // Create AsyncGenerator from data
          const generator = streamArray(data, { chunkSize, signal });

          // Convert to ReadableStream
          const readableStream = asyncGeneratorToReadableStream(generator, { signal });

          // Collect results from the stream
          const { stream: collectorStream, getCollectedData } = createCollectorWritableStream({
            signal,
          });

          try {
            await readableStream.pipeTo(collectorStream, { signal });
            const results = getCollectedData();

            return {
              content: [
                {
                  type: 'text' as const,
                  text: safeStringifyAdvanced({
                    success: true,
                    operation: 'createWebReadableStream',
                    streamType: 'ReadableStream',
                    chunks: results.length,
                    results,
                    totalItems: data.length,
                  }).result,
                },
              ],
            };
          } catch (error) {
            if (error instanceof Error && error.message.includes('aborted')) {
              return {
                content: [
                  {
                    type: 'text' as const,
                    text: safeStringifyAdvanced({
                      success: false,
                      aborted: true,
                      chunks: chunks.length,
                    }).result,
                  },
                ],
                isError: true,
              };
            }
            throw error;
          }
        }

        case 'createWebTransformStream': {
          if (!transformFunction) {
            throw new Error('Transform function required for createWebTransformStream operation');
          }
          if (data.length === 0) {
            throw new Error('Data array required for createWebTransformStream operation');
          }

          // Security: Use safe VM context instead of new Function
          const transform = createSafeFunction(transformFunction, 'x');
          const results: any[] = [];

          // Create transform stream
          const transformStream = createTransformStream(async item => transform(item), { signal });

          // Create source stream from data
          const sourceGenerator = streamArray(data, { chunkSize, signal });
          const sourceStream = asyncGeneratorToReadableStream(sourceGenerator, { signal });

          // Create collector for results
          const { stream: collectorStream, getCollectedData } = createCollectorWritableStream({
            signal,
          });

          try {
            // Pipeline: source -> transform -> collector
            await pipelineStreams(sourceStream, [transformStream], collectorStream, signal);

            const transformedResults = getCollectedData();

            return {
              content: [
                {
                  type: 'text' as const,
                  text: safeStringifyAdvanced({
                    success: true,
                    operation: 'createWebTransformStream',
                    streamType: 'TransformStream',
                    chunks: transformedResults.length,
                    results: transformedResults,
                    transformFunction,
                  }).result,
                },
              ],
            };
          } catch (error) {
            if (error instanceof Error && error.message.includes('aborted')) {
              return {
                content: [
                  {
                    type: 'text' as const,
                    text: safeStringifyAdvanced({ success: false, aborted: true }).result,
                  },
                ],
                isError: true,
              };
            }
            throw error;
          }
        }

        case 'webStreamBackpressure': {
          if (data.length === 0) {
            throw new Error('Data array required for webStreamBackpressure operation');
          }

          const chunks: any[] = [];

          // Use backpressure-enabled streaming
          for await (const item of streamWithBackpressure(
            data,
            async x => {
              // Simulate some processing time
              await scheduler.yield();
              return x;
            },
            { chunkSize, signal, backpressure: true },
          )) {
            chunks.push({
              data: item,
              timestamp: new Date().toISOString(),
              index: chunks.length,
            });

            // Yield periodically
            if (chunks.length % 10 === 0) {
              await yieldToEventLoop();
            }
          }

          return {
            content: [
              {
                type: 'text' as const,
                text: safeStringifyAdvanced({
                  success: true,
                  operation: 'webStreamBackpressure',
                  backpressureEnabled: true,
                  chunks: chunks.length,
                  results: chunks,
                  totalItems: data.length,
                }).result,
              },
            ],
          };
        }

        case 'mergeWebStreams': {
          if (streams.length === 0) {
            throw new Error('Multiple streams required for mergeWebStreams operation');
          }

          // Convert each stream array to ReadableStream
          const readableStreams = streams.map(streamData => {
            const generator = streamArray(streamData, { chunkSize, signal });
            return asyncGeneratorToReadableStream(generator, { signal });
          });

          // Merge the streams
          const mergedStream = mergeReadableStreams(readableStreams, { signal });

          // Collect results
          const { stream: collectorStream, getCollectedData } = createCollectorWritableStream({
            signal,
          });

          try {
            await mergedStream.pipeTo(collectorStream, { signal });
            const results = getCollectedData();

            return {
              content: [
                {
                  type: 'text' as const,
                  text: safeStringifyAdvanced({
                    success: true,
                    operation: 'mergeWebStreams',
                    streamType: 'MergedReadableStream',
                    streamCount: streams.length,
                    chunks: results.length,
                    results,
                  }).result,
                },
              ],
            };
          } catch (error) {
            if (error instanceof Error && error.message.includes('aborted')) {
              return {
                content: [
                  {
                    type: 'text' as const,
                    text: safeStringifyAdvanced({ success: false, aborted: true }).result,
                  },
                ],
                isError: true,
              };
            }
            throw error;
          }
        }

        case 'pipelineWebStreams': {
          if (data.length === 0) {
            throw new Error('Data array required for pipelineWebStreams operation');
          }
          if (!transformFunction) {
            throw new Error('Transform function required for pipeline demonstration');
          }

          // Security: Use safe VM context instead of new Function
          const transform = createSafeFunction(transformFunction, 'x');

          // Create source stream
          const sourceGenerator = streamArray(data, { chunkSize, signal });
          const sourceStream = asyncGeneratorToReadableStream(sourceGenerator, { signal });

          // Create pipeline of transform streams
          const transforms = [
            createBatchingTransformStream(batchSize, { signal }),
            createTransformStream(async (batch: any[]) => batch.map(transform), { signal }),
            createThrottlingTransformStream(throttleMs, { signal }),
          ];

          // Create collector
          const { stream: collectorStream, getCollectedData } = createCollectorWritableStream({
            signal,
          });

          try {
            // Use Node.js 22+ pipeline API for robust stream composition
            await pipeline(
              sourceStream as any,
              ...transforms.map(t => t as any),
              collectorStream as any,
              { signal },
            );
            const results = getCollectedData();

            return {
              content: [
                {
                  type: 'text' as const,
                  text: safeStringifyAdvanced({
                    success: true,
                    operation: 'pipelineWebStreams',
                    pipelineStages: transforms.length,
                    transformFunction,
                    chunks: results.length,
                    results: results.flat(), // Flatten batched results
                  }).result,
                },
              ],
            };
          } catch (error) {
            if (error instanceof Error && error.message.includes('aborted')) {
              return {
                content: [
                  {
                    type: 'text' as const,
                    text: safeStringifyAdvanced({ success: false, aborted: true }).result,
                  },
                ],
                isError: true,
              };
            }
            throw error;
          }
        }

        default:
          throw new Error(`Unknown streaming utilities action: ${action}`);
      }
    });
  },
};

// Node.js 22+ AsyncGenerator streaming utility functions
async function* streamArray<T>(
  data: T[],
  options: { chunkSize?: number; signal?: AbortSignal } = {},
): AsyncGenerator<StreamingChunk<T[]>, void, unknown> {
  const { chunkSize = 10, signal } = options;
  let bytesProcessed = 0;

  for (let i = 0; i < data.length; i += chunkSize) {
    throwIfAborted(signal);

    const chunk = data.slice(i, i + chunkSize);
    const chunkBytes = Buffer.byteLength(JSON.stringify(chunk), 'utf8');
    bytesProcessed += chunkBytes;

    yield {
      data: chunk,
      index: Math.floor(i / chunkSize),
      isComplete: i + chunkSize >= data.length,
      timestamp: new Date().toISOString(),
      bytesProcessed,
      metadata: {
        chunkSize: chunk.length,
        totalItems: data.length,
        progress: Math.round(((i + chunk.length) / data.length) * 100),
      },
    };

    // Yield to event loop
    await yieldToEventLoop();
  }
}

async function* streamTransform<T, U>(
  data: T[],
  transformFn: (item: T) => U,
  options: { chunkSize?: number; signal?: AbortSignal } = {},
): AsyncGenerator<StreamingChunk<U[]>, void, unknown> {
  const { chunkSize = 10, signal } = options;
  let bytesProcessed = 0;

  for (let i = 0; i < data.length; i += chunkSize) {
    throwIfAborted(signal);

    const chunk = data.slice(i, i + chunkSize);
    const transformedChunk = chunk.map(transformFn);
    const chunkBytes = Buffer.byteLength(JSON.stringify(transformedChunk), 'utf8');
    bytesProcessed += chunkBytes;

    yield {
      data: transformedChunk,
      index: Math.floor(i / chunkSize),
      isComplete: i + chunkSize >= data.length,
      timestamp: new Date().toISOString(),
      bytesProcessed,
      metadata: {
        originalSize: chunk.length,
        transformedSize: transformedChunk.length,
      },
    };

    await yieldToEventLoop();
  }
}

async function* streamFilter<T>(
  data: T[],
  filterFn: (item: T) => boolean,
  options: { chunkSize?: number; signal?: AbortSignal } = {},
): AsyncGenerator<StreamingChunk<T[]>, void, unknown> {
  const { chunkSize = 10, signal } = options;
  let bytesProcessed = 0;

  for (let i = 0; i < data.length; i += chunkSize) {
    throwIfAborted(signal);

    const chunk = data.slice(i, i + chunkSize);
    const filteredChunk = chunk.filter(filterFn);
    const chunkBytes = Buffer.byteLength(JSON.stringify(filteredChunk), 'utf8');
    bytesProcessed += chunkBytes;

    yield {
      data: filteredChunk,
      index: Math.floor(i / chunkSize),
      isComplete: i + chunkSize >= data.length,
      timestamp: new Date().toISOString(),
      bytesProcessed,
      metadata: {
        originalSize: chunk.length,
        filteredSize: filteredChunk.length,
        filterRatio: chunk.length > 0 ? filteredChunk.length / chunk.length : 0,
      },
    };

    await yieldToEventLoop();
  }
}

async function streamReduce<T, U>(
  data: T[],
  reduceFn: (acc: U, item: T) => U,
  initialValue: U,
  options: { signal?: AbortSignal } = {},
): Promise<U> {
  const { signal } = options;
  let accumulator = initialValue;

  for (let i = 0; i < data.length; i++) {
    throwIfAborted(signal);

    accumulator = reduceFn(accumulator, data[i]);

    // Yield to event loop every 100 items
    if (i % 100 === 0) {
      await yieldToEventLoop();
    }
  }

  return accumulator;
}

async function* streamMerge<T>(
  streams: T[][],
  options: { chunkSize?: number; signal?: AbortSignal } = {},
): AsyncGenerator<StreamingChunk<T[]>, void, unknown> {
  const { chunkSize = 10, signal } = options;
  const iterators = streams.map(stream => streamArray(stream, { chunkSize, signal }));
  let chunkIndex = 0;
  let bytesProcessed = 0;

  // Simple round-robin merge strategy
  while (iterators.length > 0) {
    throwIfAborted(signal);

    for (let i = iterators.length - 1; i >= 0; i--) {
      const iterator = iterators[i];
      const { value, done } = await iterator.next();

      if (done) {
        iterators.splice(i, 1);
        continue;
      }

      const chunk = value.data;
      const chunkBytes = Buffer.byteLength(JSON.stringify(chunk), 'utf8');
      bytesProcessed += chunkBytes;

      yield {
        data: chunk,
        index: chunkIndex++,
        isComplete: iterators.length === 1 && i === iterators.length - 1,
        timestamp: new Date().toISOString(),
        bytesProcessed,
        metadata: {
          sourceStream: streams.length - iterators.length,
          remainingStreams: iterators.length,
        },
      };

      await yieldToEventLoop();
    }
  }
}

async function* streamBatch<T>(
  data: T[],
  options: { batchSize?: number; signal?: AbortSignal } = {},
): AsyncGenerator<StreamingChunk<T[][]>, void, unknown> {
  const { batchSize = 5, signal } = options;
  let bytesProcessed = 0;

  for (let i = 0; i < data.length; i += batchSize) {
    throwIfAborted(signal);

    const batch = data.slice(i, i + batchSize);
    // Group batch into sub-batches
    const groupedBatch = [batch];
    const chunkBytes = Buffer.byteLength(JSON.stringify(groupedBatch), 'utf8');
    bytesProcessed += chunkBytes;

    yield {
      data: groupedBatch,
      index: Math.floor(i / batchSize),
      isComplete: i + batchSize >= data.length,
      timestamp: new Date().toISOString(),
      bytesProcessed,
      metadata: {
        batchSize: batch.length,
        totalBatches: Math.ceil(data.length / batchSize),
      },
    };

    await yieldToEventLoop();
  }
}

async function* streamThrottle<T>(
  data: T[],
  options: { throttleMs?: number; chunkSize?: number; signal?: AbortSignal } = {},
): AsyncGenerator<StreamingChunk<T[]>, void, unknown> {
  const { throttleMs = 100, chunkSize = 10, signal } = options;

  for await (const chunk of streamArray(data, { chunkSize, signal })) {
    throwIfAborted(signal);

    yield chunk;

    // Throttle by waiting
    if (!chunk.isComplete && throttleMs > 0) {
      await scheduler.wait(throttleMs);
    }
  }
}

async function* streamBuffer<T>(
  data: T[],
  options: { bufferSize?: number; chunkSize?: number; signal?: AbortSignal } = {},
): AsyncGenerator<StreamingChunk<T[]>, void, unknown> {
  const { bufferSize = 1000, chunkSize = 10, signal } = options;
  const buffer: T[] = [];

  for await (const chunk of streamArray(data, { chunkSize, signal })) {
    throwIfAborted(signal);

    buffer.push(...chunk.data);

    // Flush buffer when it exceeds buffer size
    if (buffer.length >= bufferSize || chunk.isComplete) {
      const bufferedData = buffer.splice(0, buffer.length);

      yield {
        ...chunk,
        data: bufferedData,
        metadata: {
          ...chunk.metadata,
          bufferSize: bufferedData.length,
          bufferFull: bufferedData.length >= bufferSize,
        },
      };
    }
  }
}

async function* streamParallel<T, U>(
  data: T[],
  transformFn: (item: T) => U,
  options: { parallelism?: number; chunkSize?: number; signal?: AbortSignal } = {},
): AsyncGenerator<StreamingChunk<U[]>, void, unknown> {
  const { parallelism = 4, chunkSize = 10, signal } = options;
  let bytesProcessed = 0;

  for (let i = 0; i < data.length; i += chunkSize * parallelism) {
    throwIfAborted(signal);

    // Create parallel processing batches with bounded concurrency
    const batchFunctions: (() => Promise<U[]>)[] = [];

    for (let j = 0; j < parallelism && i + j * chunkSize < data.length; j++) {
      const batchStart = i + j * chunkSize;
      const batchEnd = Math.min(batchStart + chunkSize, data.length);
      const batch = data.slice(batchStart, batchEnd);

      batchFunctions.push(async () => withRetry(async () => batch.map(transformFn)));
    }

    // Use bounded concurrency instead of unbounded Promise.all
    const results = await ioQueue.addAll(batchFunctions);
    const flatResults = results.flat();
    const chunkBytes = Buffer.byteLength(JSON.stringify(flatResults), 'utf8');
    bytesProcessed += chunkBytes;

    yield {
      data: flatResults,
      index: Math.floor(i / (chunkSize * parallelism)),
      isComplete: i + chunkSize * parallelism >= data.length,
      timestamp: new Date().toISOString(),
      bytesProcessed,
      metadata: {
        parallelBatches: batchFunctions.length,
        parallelism,
        processedItems: flatResults.length,
      },
    };

    await yieldToEventLoop();
  }
}
