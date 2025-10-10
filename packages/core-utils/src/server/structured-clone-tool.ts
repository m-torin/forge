/**
 * MCP Tool: Structured Clone Operations
 * Provides Node.js 22+ structuredClone() performance optimizations
 */

import type { MCPToolResponse } from '../types/mcp';
import { AbortableToolArgs, safeThrowIfAborted } from './abort-support';
import { runWithContext } from './context';
import { createEnhancedMCPErrorResponse } from './error-handling';
import {
  benchmarkCloneMethods,
  cloneArrayStream,
  CloneUtils,
  enhancedClone,
  isStructuredCloneAvailable,
  StructuredCloneCache,
  type CloneResult,
  type StructuredCloneOptions,
} from './structured-clone';

export interface StructuredCloneArgs extends AbortableToolArgs {
  action:
    | 'clone' // Enhanced cloning with structuredClone
    | 'isAvailable' // Check if structuredClone is available
    | 'benchmark' // Performance comparison
    | 'cloneArray' // Stream clone array
    | 'cacheDemo' // Demonstrate structured clone cache
    | 'configClone' // Clone configuration objects
    | 'safeClone' // Safe cloning that never throws
    | 'optimizedClone' // Auto-optimized cloning
    | 'validateClone' // Clone with validation
    | 'performanceClone'; // Clone with performance tracking

  // Clone target
  data?: any;

  // Clone options
  fallbackToJson?: boolean;
  validateClone?: boolean;
  trackPerformance?: boolean;
  performanceMarker?: string;
  expectedType?: string;

  // Array streaming options
  batchSize?: number;

  // Benchmark options
  iterations?: number;

  // Cache demo options
  cacheSize?: number;

  // Safe clone options
  fallback?: any;

  // Demo data options
  generateDemoData?: boolean;
  demoDataType?: 'simple' | 'complex' | 'nested' | 'circular' | 'large';
  demoDataSize?: number;
}

/**
 * Generate demo data for testing
 */
function generateDemoDataFunction(type: string, size: number = 100): any {
  switch (type) {
    case 'simple':
      return { name: 'test', value: 42, active: true };

    case 'complex':
      return {
        id: 'complex-object',
        metadata: {
          created: new Date().toISOString(),
          version: '1.0.0',
          tags: ['demo', 'structured-clone', 'performance'],
        },
        data: Array.from({ length: size }, (_, i) => ({
          index: i,
          value: (i * 13 + 7) % 1000, // Deterministic value
          label: `Item ${i}`,
        })),
        config: {
          enabled: true,
          settings: {
            timeout: 5000,
            retry: 3,
            cache: true,
          },
        },
      };

    case 'nested':
      const createNested = (depth: number): any => {
        if (depth <= 0) return { value: 'leaf', depth };
        return {
          depth,
          nested: createNested(depth - 1),
          data: Array.from({ length: 3 }, (_, i) => ({
            index: i,
            value: `depth-${depth}-${i}`,
          })),
        };
      };
      return createNested(size > 20 ? 20 : size);

    case 'large':
      return {
        largeArray: Array.from({ length: size * 100 }, (_, i) => ({
          id: i,
          data: `Large item ${i} with some content to make it bigger`,
          nested: {
            value: (i * 7 + 3) / 1000, // Deterministic decimal value
            timestamp: Date.now(),
            tags: Array.from({ length: 5 }, (_, j) => `tag-${i}-${j}`),
          },
        })),
        metadata: {
          size: size * 100,
          created: new Date().toISOString(),
        },
      };

    case 'circular':
      // Note: This will only work with structured clone, not JSON
      const obj: any = { name: 'circular-test', data: {} };
      obj.self = obj;
      obj.data.parent = obj;
      return obj;

    default:
      return { type: 'unknown', value: type };
  }
}

export const structuredCloneTool = {
  name: 'structured_clone',
  description: 'Node.js 22+ Performance Optimization with structuredClone()',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: [
          'clone',
          'isAvailable',
          'benchmark',
          'cloneArray',
          'cacheDemo',
          'configClone',
          'safeClone',
          'optimizedClone',
          'validateClone',
          'performanceClone',
        ],
        description: 'Structured clone action to perform',
      },
      data: {
        type: 'object',
        description: 'Data to clone (any JSON-serializable object)',
      },
      fallbackToJson: {
        type: 'boolean',
        description: 'Whether to fallback to JSON if structuredClone fails',
        default: true,
      },
      validateClone: {
        type: 'boolean',
        description: 'Whether to validate the cloned data',
        default: false,
      },
      trackPerformance: {
        type: 'boolean',
        description: 'Whether to track cloning performance',
        default: false,
      },
      performanceMarker: {
        type: 'string',
        description: 'Performance marker name for tracking',
      },
      expectedType: {
        type: 'string',
        description: 'Expected type of cloned data for validation',
      },
      batchSize: {
        type: 'number',
        description: 'Batch size for array streaming',
        default: 100,
      },
      iterations: {
        type: 'number',
        description: 'Number of iterations for benchmarking',
        default: 1000,
      },
      cacheSize: {
        type: 'number',
        description: 'Size of cache for demo',
        default: 10,
      },
      fallback: {
        type: 'object',
        description: 'Fallback value for safe cloning',
      },
      generateDemoData: {
        type: 'boolean',
        description: 'Whether to generate demo data',
        default: false,
      },
      demoDataType: {
        type: 'string',
        enum: ['simple', 'complex', 'nested', 'circular', 'large'],
        description: 'Type of demo data to generate',
        default: 'complex',
      },
      demoDataSize: {
        type: 'number',
        description: 'Size parameter for demo data',
        default: 100,
      },
      signal: {
        type: 'object',
        description: 'AbortSignal for cancelling the operation',
      },
    },
    required: ['action'],
  },

  async execute(args: StructuredCloneArgs): Promise<MCPToolResponse> {
    try {
      const {
        action,
        data: inputData,
        fallbackToJson = true,
        validateClone = false,
        trackPerformance = false,
        performanceMarker,
        expectedType,
        batchSize = 100,
        iterations = 1000,
        cacheSize = 10,
        fallback,
        generateDemoData = false,
        demoDataType = 'complex',
        demoDataSize = 100,
        signal,
      } = args;

      // Check for abort signal at start
      safeThrowIfAborted(signal);

      return runWithContext(
        {
          toolName: 'structured_clone',
          metadata: { action, generateDemoData, demoDataType },
        },
        async () => {
          // Get or generate data
          let data = inputData;
          if (args.generateDemoData || !data) {
            data = generateDemoDataFunction(demoDataType, demoDataSize);
          }

          switch (action) {
            case 'isAvailable': {
              const available = isStructuredCloneAvailable();

              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(
                      {
                        success: true,
                        action: 'isAvailable',
                        structuredCloneAvailable: available,
                        nodeVersion: process.version,
                        recommendation: available
                          ? 'Use structuredClone for better performance'
                          : 'Use JSON fallback for compatibility',
                      },
                      null,
                      2,
                    ),
                  },
                ],
              };
            }

            case 'clone': {
              const options: StructuredCloneOptions = {
                fallbackToJson,
                validateClone,
                trackPerformance,
                performanceMarker,
                expectedType,
              };

              const result = enhancedClone(data, options);

              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(
                      {
                        success: true,
                        action: 'clone',
                        cloneMethod: result.method,
                        clonedData: result.data,
                        performance: result.performance,
                        warnings: result.warnings,
                        options,
                      },
                      null,
                      2,
                    ),
                  },
                ],
              };
            }

            case 'benchmark': {
              if (!data) {
                throw new Error('Data required for benchmarking');
              }

              const benchmark = benchmarkCloneMethods(data, iterations);

              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(
                      {
                        success: true,
                        action: 'benchmark',
                        iterations,
                        results: benchmark,
                        dataSize: JSON.stringify(data).length,
                        conclusion: {
                          recommended: benchmark.recommendation,
                          reason:
                            benchmark.structuredClone && benchmark.json
                              ? benchmark.structuredClone.avgMs < benchmark.json.avgMs
                                ? 'structuredClone is faster'
                                : 'JSON is faster'
                              : 'Unable to compare both methods',
                        },
                      },
                      null,
                      2,
                    ),
                  },
                ],
              };
            }

            case 'cloneArray': {
              if (!Array.isArray(data)) {
                throw new Error('Data must be an array for cloneArray action');
              }

              const results: CloneResult<any>[] = [];
              let index = 0;

              for await (const result of cloneArrayStream(data, {
                batchSize,
                fallbackToJson,
                trackPerformance,
              })) {
                results.push(result);
                index++;

                safeThrowIfAborted(signal);

                // Limit results for demo
                if (index >= 20) break;
              }

              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(
                      {
                        success: true,
                        action: 'cloneArray',
                        originalLength: data.length,
                        processedCount: results.length,
                        truncated: results.length >= 20,
                        batchSize,
                        results: results.slice(0, 5), // Show first 5 results
                        summary: {
                          structuredCloneUsed: results.filter(r => r.method === 'structuredClone')
                            .length,
                          jsonUsed: results.filter(r => r.method === 'json').length,
                          failed: results.filter(r => r.method === 'failed').length,
                        },
                      },
                      null,
                      2,
                    ),
                  },
                ],
              };
            }

            case 'cacheDemo': {
              const cache = new StructuredCloneCache<string, any>({
                fallbackToJson,
                trackPerformance: true,
              });

              // Add demo data to cache
              const demoItems = Array.from({ length: cacheSize }, (_, i) => ({
                id: i,
                name: `Item ${i}`,
                data: generateDemoDataFunction('simple'),
              }));

              demoItems.forEach((item, i) => {
                cache.set(`item-${i}`, item);
              });

              // Retrieve and modify
              const retrieved = cache.get('item-0') as any;
              if (retrieved) {
                retrieved.modified = true;
                retrieved.timestamp = Date.now();
              }

              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(
                      {
                        success: true,
                        action: 'cacheDemo',
                        cacheSize: cache.size,
                        originalItem: demoItems[0],
                        retrievedItem: retrieved,
                        demonstratesIsolation:
                          !(demoItems[0] as any).modified && retrieved?.modified,
                        cacheKeys: Array.from(cache.keys()),
                      },
                      null,
                      2,
                    ),
                  },
                ],
              };
            }

            case 'configClone': {
              const result = CloneUtils.cloneConfig(data);

              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(
                      {
                        success: true,
                        action: 'configClone',
                        originalConfig: data,
                        clonedConfig: result.data,
                        cloneMethod: result.method,
                        validated: result.warnings ? false : true,
                        warnings: result.warnings,
                      },
                      null,
                      2,
                    ),
                  },
                ],
              };
            }

            case 'safeClone': {
              const safeResult = CloneUtils.safeClone(data, fallback || { error: 'fallback used' });

              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(
                      {
                        success: true,
                        action: 'safeClone',
                        originalData: data,
                        clonedData: safeResult,
                        fallbackUsed: safeResult === (fallback || { error: 'fallback used' }),
                        fallbackData: fallback,
                      },
                      null,
                      2,
                    ),
                  },
                ],
              };
            }

            case 'optimizedClone': {
              const result = await CloneUtils.optimizedClone(data);

              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(
                      {
                        success: true,
                        action: 'optimizedClone',
                        optimizedMethod: result.method,
                        clonedData: result.data,
                        performance: result.performance,
                        automaticallyOptimized: true,
                      },
                      null,
                      2,
                    ),
                  },
                ],
              };
            }

            case 'validateClone': {
              const result = enhancedClone(data, {
                validateClone: true,
                expectedType,
                fallbackToJson,
                trackPerformance: true,
                performanceMarker: 'validation-clone',
              });

              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(
                      {
                        success: true,
                        action: 'validateClone',
                        originalData: data,
                        clonedData: result.data,
                        cloneMethod: result.method,
                        validationPassed: !result.warnings || result.warnings.length === 0,
                        warnings: result.warnings,
                        performance: result.performance,
                        expectedType,
                      },
                      null,
                      2,
                    ),
                  },
                ],
              };
            }

            case 'performanceClone': {
              const marker = performanceMarker || `perf-clone-${Date.now()}`;

              const result = CloneUtils.cloneWithMetrics(data, marker);

              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(
                      {
                        success: true,
                        action: 'performanceClone',
                        cloneMethod: result.method,
                        clonedData: result.data,
                        performance: result.performance,
                        performanceMarker: marker,
                        dataSize: JSON.stringify(data).length,
                        efficiency: result.performance
                          ? JSON.stringify(data).length / result.performance.durationMs
                          : undefined,
                      },
                      null,
                      2,
                    ),
                  },
                ],
              };
            }

            default:
              throw new Error(`Unknown structured clone action: ${action}`);
          }
        },
      );
    } catch (error) {
      // Handle abort errors specially
      if (error instanceof Error && error.message.includes('aborted')) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: false, aborted: true }),
            },
          ],
          isError: true,
        };
      }

      return createEnhancedMCPErrorResponse(error, 'structured_clone', {
        contextInfo: 'Structured Clone Operations',
      });
    }
  },
};
