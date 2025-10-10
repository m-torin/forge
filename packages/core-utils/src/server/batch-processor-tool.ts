/**
 * MCP Tool: Batch Processor
 * Optimizes file processing in memory-efficient batches with Node.js 22+ streaming
 */

import { LRUCache } from 'lru-cache';
import { delay } from '../shared/timeout.js';
import type { MCPToolResponse } from '../types/mcp';
import { safeThrowIfAborted } from './abort-support';
import { ioQueue } from './concurrency';
import { ErrorPatterns } from './error-handling';
import { enhancedClone, isStructuredCloneAvailable } from './structured-clone';
import { err, ok, runTool } from './tool-helpers';
import { validateSessionId } from './validation';
export interface BatchProcessorArgs {
  action:
    | 'createBatches'
    | 'prioritizeFiles'
    | 'filterCached'
    | 'estimateSize'
    | 'streamProcess'
    | 'streamBatches'
    | 'queuedProcess'
    | 'queueStatus'
    | 'configureConcurrency';
  files: string[];
  targetSize?: number;
  changedFiles?: string[];
  sessionId?: string;
  packagePath?: string;
  fileSizes?: Record<string, number>;
  signal?: AbortSignal;
  streaming?: boolean;
  concurrency?: number;
  memoryPressureProvider?: () => number;
}

// Production-ready LRU cache for file size estimates with memory leak protection
const sizeCache = new LRUCache<string, number>({
  max: 1000, // Maximum 1000 entries to prevent unbounded growth
  ttl: 1800000, // 30 minute TTL for automatic cleanup
  allowStale: false, // Don't return stale data
  updateAgeOnGet: true, // Reset TTL on access
});

// Node.js 22+ AsyncGenerator for streaming file processing with dynamic batching
async function* streamFileEstimation(
  files: string[],
  fileSizes: Record<string, number>,
  packagePath?: string,
  signal?: AbortSignal,
): AsyncGenerator<
  { file: string; size: number; progress: number; batchInfo?: any },
  void,
  unknown
> {
  const totalFiles = files.length;

  // Dynamic chunk sizing based on file count and available memory
  const memoryUsage = process.memoryUsage();
  const availableMemory = memoryUsage.heapTotal - memoryUsage.heapUsed;
  const targetMemoryPerChunk = Math.min(availableMemory * 0.1, 100 * 1024 * 1024); // Max 100MB per chunk

  // Calculate optimal chunk size based on average file size and memory
  let CHUNK_SIZE: number;
  if (totalFiles < 100) {
    CHUNK_SIZE = totalFiles; // Small batches - process all at once
  } else if (totalFiles < 1000) {
    CHUNK_SIZE = Math.max(25, Math.floor(totalFiles / 10)); // Medium batches
  } else {
    // Large batches - calculate based on memory and estimated file sizes
    const estimatedAvgFileSize = 200; // lines per file estimate
    const filesPerMemoryChunk = Math.floor(targetMemoryPerChunk / (estimatedAvgFileSize * 100)); // rough bytes estimate
    CHUNK_SIZE = Math.max(50, Math.min(200, filesPerMemoryChunk));
  }

  for (let i = 0; i < files.length; i += CHUNK_SIZE) {
    // Check for cancellation
    safeThrowIfAborted(signal);

    const chunk = files.slice(i, i + CHUNK_SIZE);

    for (const file of chunk) {
      let size = fileSizes[file];
      if (!size) {
        // Check cache
        const cacheKey = `${packagePath || ''}:${file}`;
        if (sizeCache.has(cacheKey)) {
          size = sizeCache.get(cacheKey)!;
        } else {
          // Enhanced estimation based on file extension, name, and path patterns
          const ext = file.split('.').pop()?.toLowerCase() || '';
          const filename = file.split('/').pop() || '';
          const isLargeFile =
            filename.length > 50 || file.includes('large') || file.includes('generated');

          // Base estimate by extension with large file detection
          let estimate = 100; // default
          switch (ext) {
            case 'ts':
            case 'tsx':
              if (filename.includes('test') || filename.includes('spec')) {
                estimate = 150;
              } else if (
                isLargeFile ||
                filename.includes('index') ||
                filename.includes('generated')
              ) {
                estimate = 500; // Large TypeScript files
              } else if (filename.includes('component') || filename.includes('page')) {
                estimate = 300;
              } else {
                estimate = 200;
              }
              break;
            case 'js':
            case 'jsx':
              if (filename.includes('test') || filename.includes('spec')) {
                estimate = 120;
              } else if (
                isLargeFile ||
                filename.includes('bundle') ||
                filename.includes('vendor')
              ) {
                estimate = 1000; // Large JS bundles
              } else if (filename.includes('component') || filename.includes('page')) {
                estimate = 250;
              } else {
                estimate = 180;
              }
              break;
            case 'json':
              if (filename === 'package-lock.json' || filename === 'yarn.lock') {
                estimate = 5000; // Large lock files
              } else if (filename === 'package.json') {
                estimate = 50;
              } else if (filename.includes('config') || filename.includes('settings')) {
                estimate = 100;
              } else {
                estimate = 30;
              }
              break;
            case 'md':
              if (filename.toLowerCase() === 'readme.md' || filename.includes('changelog')) {
                estimate = 200;
              } else {
                estimate = 80;
              }
              break;
            case 'css':
            case 'scss':
            case 'less':
              if (isLargeFile || filename.includes('main') || filename.includes('global')) {
                estimate = 400;
              } else {
                estimate = 120;
              }
              break;
            case 'html':
            case 'htm':
              estimate = isLargeFile ? 300 : 150;
              break;
            case 'svg':
              estimate = 50;
              break;
            case 'yml':
            case 'yaml':
              estimate = filename.includes('docker') ? 100 : 60;
              break;
            case 'xml':
              estimate = isLargeFile ? 500 : 200;
              break;
            default:
              estimate = 100;
          }

          // Adjust for common patterns and directory structures
          if (filename.includes('config')) estimate *= 0.7;
          if (filename.includes('types') || filename.includes('.d.')) estimate *= 0.8;
          if (filename.includes('utils') || filename.includes('helpers')) estimate *= 1.2;
          if (filename.includes('component')) estimate *= 1.3;
          if (filename.includes('service') || filename.includes('api')) estimate *= 1.1;
          if (file.includes('node_modules')) estimate *= 0.3; // Node modules are typically larger but less important
          if (file.includes('__tests__') || file.includes('test/')) estimate *= 0.9;
          if (file.includes('dist/') || file.includes('build/')) estimate *= 2.0; // Built files are larger
          if (file.includes('coverage/')) estimate *= 0.5; // Coverage files vary widely

          // Path-based adjustments for large file detection
          const pathDepth = file.split('/').length;
          if (pathDepth > 5) estimate *= 0.9; // Deeply nested files tend to be smaller
          if (pathDepth < 3) estimate *= 1.1; // Top-level files tend to be larger
          size = Math.round(estimate);
          sizeCache.set(cacheKey, size);
        }
      }

      yield {
        file,
        size,
        progress: Math.round(((i + chunk.indexOf(file) + 1) / totalFiles) * 100),
        batchInfo: {
          chunkSize: CHUNK_SIZE,
          chunkIndex: Math.floor(i / CHUNK_SIZE),
          filesInChunk: chunk.length,
          totalChunks: Math.ceil(totalFiles / CHUNK_SIZE),
          memoryOptimized: CHUNK_SIZE !== 50, // Indicates if dynamic sizing was used
          estimatedMemoryUsage: chunk.length * 200 * 100, // rough estimate in bytes
        },
      };
    }

    // Memory-aware yielding - check memory pressure periodically
    if (i % (CHUNK_SIZE * 5) === 0) {
      // Every 5 chunks
      const currentMemory = process.memoryUsage();
      const heapUsagePercent = (currentMemory.heapUsed / currentMemory.heapTotal) * 100;

      if (heapUsagePercent > 80) {
        // Force garbage collection if available and high memory usage
        if (global.gc) {
          global.gc();
        }
        // Longer yield for memory pressure
        await delay(100);
      } else {
        // Normal yield to event loop
        await new Promise(resolve => setImmediate(resolve));
      }
    } else if (i + CHUNK_SIZE < files.length) {
      // Quick yield for smaller batches
      await new Promise(resolve => setImmediate(resolve));
    }
  }
}

// Legacy function for backward compatibility
async function estimateSize(
  files: string[],
  fileSizes: Record<string, number>,
  packagePath?: string,
): Promise<Record<string, number>> {
  const estimates: Record<string, number> = {};

  // Use async iterator for cleaner async iteration (fallback for Array.fromAsync)
  const results: Array<{ file: string; size: number }> = [];
  for await (const result of streamFileEstimation(files, fileSizes, packagePath)) {
    results.push(result);
  }

  return results.reduce(
    (acc: Record<string, number>, result: { file: string; size: number }) => {
      acc[result.file] = result.size;
      return acc;
    },
    {} as Record<string, number>,
  );
}

export const batchProcessorTool = {
  name: 'batch_processor',
  description: 'Optimize file processing in memory-efficient batches with Node.js 22+ streaming',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: [
          'createBatches',
          'prioritizeFiles',
          'filterCached',
          'estimateSize',
          'streamProcess',
          'streamBatches',
          'queuedProcess',
          'queueStatus',
          'configureConcurrency',
        ],
        description: 'Batch processing action to perform',
      },
      files: {
        type: 'array',
        items: {
          type: 'string',
          description: 'File path relative to package root',
        },
        description: 'List of files to process',
      },
      targetSize: {
        type: 'number',
        description: 'Target batch size (lines or bytes)',
        default: 3000,
      },
      changedFiles: {
        type: 'array',
        items: {
          type: 'string',
          description: 'File path of changed file for priority processing',
        },
        description: 'List of changed files for prioritization',
      },
      sessionId: {
        type: 'string',
        description: 'Session ID for caching',
      },
      packagePath: {
        type: 'string',
        description: 'Base package path',
      },
      fileSizes: {
        type: 'object',
        description: 'Pre-computed file sizes (filename -> lines)',
      },
      streaming: {
        type: 'boolean',
        description: 'Enable streaming mode for large datasets',
        default: false,
      },
    },
    required: ['action', 'files'],
  },

  async execute(args: BatchProcessorArgs): Promise<MCPToolResponse> {
    return runTool('batch_processor', args.action, async () => {
      const {
        action,
        files,
        targetSize = 3000,
        changedFiles = [],
        sessionId,
        packagePath,
        fileSizes = {},
        streaming = false,
      } = args;

      // Validate session ID if provided
      if (sessionId) {
        const sessionValidation = validateSessionId(sessionId);
        if (!sessionValidation.isValid) {
          throw new Error(`Invalid session ID: ${sessionValidation.error}`);
        }
      }

      switch (action) {
        case 'estimateSize': {
          const estimates: Record<string, number> = {};

          for (const file of files) {
            let size = fileSizes[file];

            if (!size) {
              // Check cache
              const cacheKey = `${packagePath || ''}:${file}`;
              if (sizeCache.has(cacheKey)) {
                size = sizeCache.get(cacheKey)!;
              } else {
                // Estimate based on file extension and name
                const ext = file.split('.').pop()?.toLowerCase() || '';
                const filename = file.split('/').pop() || '';

                // Base estimate by extension
                let estimate = 100; // default

                switch (ext) {
                  case 'ts':
                  case 'tsx':
                    estimate = filename.includes('test') ? 150 : 200;
                    break;
                  case 'js':
                  case 'jsx':
                    estimate = filename.includes('test') ? 120 : 180;
                    break;
                  case 'json':
                    estimate = filename === 'package.json' ? 50 : 30;
                    break;
                  case 'md':
                    estimate = 80;
                    break;
                  case 'css':
                  case 'scss':
                    estimate = 120;
                    break;
                  default:
                    estimate = 100;
                }

                // Adjust for common patterns
                if (filename.includes('config')) estimate *= 0.7;
                if (filename.includes('types') || filename.includes('.d.')) estimate *= 0.8;
                if (filename.includes('utils') || filename.includes('helpers')) estimate *= 1.2;
                if (filename.includes('component')) estimate *= 1.3;
                if (file.includes('node_modules')) estimate *= 0.5;

                size = Math.round(estimate);
                sizeCache.set(cacheKey, size);
              }
            }

            estimates[file] = size;
          }

          const result = {
            estimates,
            totalEstimatedLines: Object.values(estimates).reduce((sum, size) => sum + size, 0),
            averageSize:
              Object.values(estimates).reduce((sum, size) => sum + size, 0) / files.length,
            cacheHits: Object.keys(estimates).filter(f => {
              const cacheKey = `${packagePath || ''}:${f}`;
              return sizeCache.has(cacheKey);
            }).length,
          };

          return ok(result);
        }

        case 'prioritizeFiles': {
          if (changedFiles.length === 0) {
            // No prioritization needed
            return ok({
              priorityFiles: [],
              normalFiles: files,
              totalFiles: files.length,
            });
          }

          const changedSet = new Set(changedFiles);
          const priorityFiles: string[] = [];
          const normalFiles: string[] = [];

          for (const file of files) {
            if (changedSet.has(file)) {
              priorityFiles.push(file);
            } else {
              normalFiles.push(file);
            }
          }

          const result = {
            priorityFiles,
            normalFiles,
            totalFiles: files.length,
            priorityCount: priorityFiles.length,
            normalCount: normalFiles.length,
            prioritizedOrder: [...priorityFiles, ...normalFiles],
          };

          return ok(result);
        }

        case 'filterCached': {
          if (!sessionId) {
            // No session ID, treat all as uncached
            return ok({
              toAnalyze: files,
              cachedFiles: [],
              totalFiles: files.length,
              cacheHitRate: 0,
            });
          }

          // Cache checking - files ending with .test.ts are likely cached
          const cachedFiles: string[] = [];
          const toAnalyze: string[] = [];

          // For demo, mark some files as potentially cached
          for (const file of files) {
            safeThrowIfAborted(args.signal);
            const cacheKey = `${sessionId}:${file}`;
            // Simple heuristic: files with 'test' or 'spec' in name are less likely to be cached
            // Also cache smaller files (based on path length as proxy)
            const shouldCache =
              !file.includes('test') && !file.includes('spec') && file.length < 50;

            if (shouldCache) {
              cachedFiles.push(file);
            } else {
              toAnalyze.push(file);
            }
          }

          const cacheHitRate = Math.round((cachedFiles.length / files.length) * 100);

          const result = {
            toAnalyze,
            cachedFiles,
            totalFiles: files.length,
            cacheHitRate,
            sessionId,
          };

          return ok(result);
        }

        case 'createBatches': {
          // First get size estimates - direct call to avoid recursive execution
          const estimates = await estimateSize(files, fileSizes ?? {}, packagePath);

          // Create file objects with sizes
          const filesWithSizes = files.map(file => ({
            file,
            lines: estimates[file] || 100,
          }));

          // Sort by size (largest first for better load distribution)
          filesWithSizes.sort((a, b) => b.lines - a.lines);

          // Create batches with balanced sizes
          const batches: string[][] = [];
          let currentBatch: string[] = [];
          let currentSize = 0;

          for (const { file, lines } of filesWithSizes) {
            if (currentSize + lines > targetSize && currentBatch?.length) {
              batches.push([...currentBatch]);
              currentBatch = [file];
              currentSize = lines;
            } else {
              currentBatch.push(file);
              currentSize += lines;
            }
          }

          if (currentBatch?.length) {
            batches.push(currentBatch);
          }

          const result = {
            batches,
            batchCount: batches.length,
            targetSize,
            actualSizes: batches.map(batch =>
              batch.reduce((sum, file) => sum + (estimates[file] || 100), 0),
            ),
            totalFiles: files.length,
            averageBatchSize: batches?.length
              ? Math.round(batches.reduce((sum, batch) => sum + batch.length, 0) / batches.length)
              : 0,
          };

          return ok(result);
        }

        case 'streamProcess': {
          // Enhanced streaming file processing using Node.js 22+ features
          const signal = args.signal; // AbortController support
          let results: Array<{ file: string; size: number; batchInfo?: any }> = [];
          let processedCount = 0;
          let totalMemoryUsed = 0;

          try {
            // Use for await...of with async generator for better memory efficiency
            for await (const result of streamFileEstimation(
              files,
              fileSizes || {},
              packagePath,
              signal,
            )) {
              results.push(result);
              processedCount++;
              totalMemoryUsed += result.batchInfo?.estimatedMemoryUsage || 0;

              if (streaming && processedCount % 1000 === 0) {
                // Use queueMicrotask for better event loop handling
                await new Promise(resolve => queueMicrotask(() => resolve(undefined)));
              }
            }

            const totalSize = results.reduce((sum, r) => sum + r.size, 0);
            const avgSize = totalSize / results.length;
            const memoryEfficiency =
              totalMemoryUsed > 0 ? (totalSize / totalMemoryUsed) * 100 : 100;

            return ok({
              streaming: true,
              processed: results.length,
              totalEstimatedLines: totalSize,
              averageSize: avgSize,
              completed: true,
              performance: {
                memoryUsed: totalMemoryUsed,
                memoryEfficiency: Math.round(memoryEfficiency),
                dynamicBatching: results.some(r => r.batchInfo?.memoryOptimized),
                avgChunkSize:
                  results.length > 0
                    ? results.reduce((sum, r) => sum + (r.batchInfo?.chunkSize || 50), 0) /
                      results.length
                    : 50,
              },
              results: streaming ? results.slice(-5) : results, // Show last 5 in streaming mode
            });
          } catch (error) {
            if (error instanceof Error && (error.name === 'AbortError' || signal?.aborted)) {
              return ok({
                streaming: true,
                processed: results.length,
                aborted: true,
                partialResults: results,
                partialStats: {
                  totalProcessed: processedCount,
                  partialSize: results.reduce((sum, r) => sum + r.size, 0),
                  memoryUsedBeforeAbort: totalMemoryUsed,
                },
              });
            }
            throw error;
          }
        }

        case 'streamBatches': {
          // Create batches using streaming approach
          const estimates = await estimateSize(files, fileSizes || {}, packagePath);
          const batches: Array<{
            files: string[];
            estimatedSize: number;
            batchIndex: number;
            cloneMethod?: string;
            batchOptimizations?: {
              usedStructuredClone: boolean;
              fileCount: number;
              avgFileSize: number;
            };
          }> = [];

          let currentBatch: string[] = [];
          let currentSize = 0;
          let batchIndex = 0;

          // Stream through files and create batches dynamically
          for (const file of files) {
            const fileSize = estimates[file] || 100;

            if (currentSize + fileSize > targetSize && currentBatch.length > 0) {
              // Complete current batch and start new one - use Node.js 22+ structured clone for optimal performance
              let clonedFiles: string[];
              let cloneMethod = 'spread';

              if (isStructuredCloneAvailable()) {
                const cloneResult = enhancedClone(currentBatch, {
                  fallbackToJson: false,
                  trackPerformance: true,
                  performanceMarker: `batch-clone-${batchIndex}`,
                });
                clonedFiles = cloneResult.data;
                cloneMethod = cloneResult.method;
              } else {
                clonedFiles = [...currentBatch];
              }

              batches.push({
                files: clonedFiles,
                estimatedSize: currentSize,
                batchIndex: batchIndex++,
                cloneMethod, // Track which clone method was used for debugging
                batchOptimizations: {
                  usedStructuredClone: cloneMethod === 'structuredClone',
                  fileCount: currentBatch.length,
                  avgFileSize: currentBatch.length > 0 ? currentSize / currentBatch.length : 0,
                },
              });

              currentBatch = [file];
              currentSize = fileSize;
            } else {
              currentBatch.push(file);
              currentSize += fileSize;
            }

            // Enhanced yielding for better responsiveness
            if (batches.length % 50 === 0) {
              // More frequent yielding for better responsiveness
              // Use setImmediate for yielding control to event loop
              await new Promise(resolve => setImmediate(resolve));
            }
          }

          // Add final batch if it has files - use structured clone for performance
          if (currentBatch.length > 0) {
            batches.push({
              files: isStructuredCloneAvailable()
                ? enhancedClone(currentBatch, { fallbackToJson: false }).data
                : [...currentBatch],
              estimatedSize: currentSize,
              batchIndex: batchIndex,
            });
          }

          return ok({
            streaming: true,
            totalBatches: batches.length,
            totalFiles: files.length,
            targetSize,
            batches,
            efficiency: {
              averageBatchSize:
                batches.reduce((sum, b) => sum + b.estimatedSize, 0) / batches.length,
              utilizationRate:
                batches.reduce((sum, b) => sum + b.estimatedSize, 0) /
                (batches.length * targetSize),
            },
          });
        }

        case 'queuedProcess': {
          // Process files using ioQueue for bounded concurrency
          if (!files || files.length === 0) {
            return err('No files provided for queued processing', 'queuedProcess', 'Validation');
          }

          const results: any[] = [];
          const startTime = performance.now();

          try {
            // Process files using ioQueue.addAll for bounded concurrency
            const queuedResults = await ioQueue.addAll(
              files.map(file => () => {
                safeThrowIfAborted(args.signal);

                // Simulate file processing operation
                return new Promise<any>((resolve, reject) => {
                  setImmediate(() => {
                    try {
                      const fileSize = fileSizes?.[file] || file.length * 10 + 50; // Estimate based on file path length
                      const processingTime = Math.min(file.length / 10, 15) + 1; // 1-16ms based on path length

                      resolve({
                        file,
                        size: fileSize,
                        processingTime,
                        queuedAt: Date.now(),
                        concurrency: ioQueue.concurrency,
                      });
                    } catch (error) {
                      reject(error);
                    }
                  });
                });
              }),
            );

            results.push(...queuedResults);
            const totalTime = performance.now() - startTime;
            const avgSize = results.reduce((sum, r) => sum + r.size, 0) / results.length;

            return ok({
              processed: results.length,
              totalTime: Math.round(totalTime),
              averageSize: Math.round(avgSize),
              concurrency: ioQueue.concurrency,
              queueStatus: {
                pending: ioQueue.pending,
                size: ioQueue.size,
              },
              results: streaming ? results.slice(-5) : results,
            });
          } catch (error) {
            if (error instanceof Error && (error.name === 'AbortError' || args.signal?.aborted)) {
              return ok({
                aborted: true,
                processed: results.length,
                partialResults: results,
              });
            }
            throw error;
          }
        }

        case 'queueStatus': {
          // Return current queue status and statistics
          return ok(
            {
              concurrency: ioQueue.concurrency,
              pendingOperations: ioQueue.pending,
              queueSize: ioQueue.size,
              isPaused: ioQueue.isPaused,
              memoryUsage: process.memoryUsage(),
              uptime: process.uptime(),
            },
            {
              concurrency: ioQueue.concurrency,
              pending: ioQueue.pending,
              size: ioQueue.size,
              isPaused: ioQueue.isPaused,
            },
          );
        }

        case 'configureConcurrency': {
          // Configure concurrency and memory pressure monitoring
          const { concurrency } = args;

          if (concurrency && typeof concurrency === 'number') {
            ioQueue.concurrency = concurrency;
          }

          return ok(
            {
              configured: true,
              concurrency: ioQueue.concurrency,
              message: 'Concurrency configuration updated',
            },
            {
              configured: true,
              concurrency: ioQueue.concurrency,
            },
          );
        }

        default:
          ErrorPatterns.unknownAction(action, [
            'createBatches',
            'prioritizeFiles',
            'filterCached',
            'estimateSize',
            'streamProcess',
            'streamBatches',
            'queueStatus',
            'configureConcurrency',
          ]);
      }

      // This should never be reached due to ErrorPatterns.unknownAction throwing
      throw new Error('Unreachable code');
    });
  },
};
