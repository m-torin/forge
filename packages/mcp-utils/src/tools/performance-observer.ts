/**
 * MCP Tool: Performance Observer
 * Provides Node.js 22+ performance monitoring and optimization insights
 */

import { scheduler } from 'node:timers/promises';
import type { MCPToolResponse } from '../types/mcp';
import { AbortableToolArgs, throwIfAborted } from '../utils/abort-support';
import { createMCPErrorResponse } from '../utils/error-handling';
import {
  getPerformanceInsights,
  globalPerformanceMonitor,
  measureAsync,
  StreamingPerformanceChunk,
} from '../utils/performance';

export interface PerformanceObserverArgs extends AbortableToolArgs {
  action:
    | 'startMonitoring'
    | 'stopMonitoring'
    | 'getSummary'
    | 'getInsights'
    | 'streamMetrics'
    | 'measureOperation'
    | 'analyzeBottlenecks'
    | 'getMemoryPressure'
    | 'clearMetrics'
    | 'getRecommendations'; // Get optimization recommendations

  // For measureOperation
  operationName?: string;
  operationCode?: string;

  // For streaming
  chunkSize?: number;
  filterByOperation?: string[];
  minDurationThreshold?: number;

  // For analysis
  includeDetailedAnalysis?: boolean;
}

export const performanceObserverTool = {
  name: 'performance_observer',
  description: 'Node.js 22+ Performance Observer for monitoring and optimization',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: [
          'startMonitoring',
          'stopMonitoring',
          'getSummary',
          'getInsights',
          'streamMetrics',
          'measureOperation',
          'analyzeBottlenecks',
          'getMemoryPressure',
          'clearMetrics',
          'getRecommendations',
        ],
        description: 'Performance monitoring action to perform',
      },
      operationName: {
        type: 'string',
        description: 'Name of operation to measure (for measureOperation)',
      },
      operationCode: {
        type: 'string',
        description: 'JavaScript code to execute and measure',
      },
      chunkSize: {
        type: 'number',
        description: 'Size of each streamed chunk',
        default: 10,
      },
      filterByOperation: {
        type: 'array',
        items: { type: 'string' },
        description: 'Filter metrics by operation names',
      },
      minDurationThreshold: {
        type: 'number',
        description: 'Minimum duration threshold for filtering (ms)',
        default: 0,
      },
      includeDetailedAnalysis: {
        type: 'boolean',
        description: 'Include detailed performance analysis',
        default: false,
      },
      signal: {
        description: 'AbortSignal for cancelling the operation',
      },
    },
    required: ['action'],
  },

  async execute(args: PerformanceObserverArgs): Promise<MCPToolResponse> {
    try {
      const {
        action,
        operationName,
        operationCode,
        chunkSize = 10,
        filterByOperation = [],
        minDurationThreshold = 0,
        includeDetailedAnalysis = false,
        signal,
      } = args;

      // Check for abort signal at start
      throwIfAborted(signal);

      switch (action) {
        case 'startMonitoring': {
          globalPerformanceMonitor.startObserving();

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  monitoring: true,
                  message: 'Performance monitoring started',
                  timestamp: new Date().toISOString(),
                }),
              },
            ],
          };
        }

        case 'stopMonitoring': {
          globalPerformanceMonitor.stopObserving();

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  monitoring: false,
                  message: 'Performance monitoring stopped',
                  timestamp: new Date().toISOString(),
                }),
              },
            ],
          };
        }

        case 'getSummary': {
          throwIfAborted(signal);

          const summary = globalPerformanceMonitor.getSummary();

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  summary,
                  timestamp: new Date().toISOString(),
                }),
              },
            ],
          };
        }

        case 'getInsights': {
          throwIfAborted(signal);

          const insights = getPerformanceInsights();

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  insights,
                  detailed: includeDetailedAnalysis,
                  timestamp: new Date().toISOString(),
                }),
              },
            ],
          };
        }

        case 'streamMetrics': {
          const chunks: StreamingPerformanceChunk[] = [];

          try {
            for await (const chunk of globalPerformanceMonitor.streamPerformanceMetrics({
              chunkSize,
              signal,
              filterByOperation,
              minDurationThreshold,
            })) {
              chunks.push(chunk);

              // Yield control periodically
              if (chunks.length % 5 === 0) {
                await new Promise(resolve => setImmediate(resolve));
              }
            }

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: true,
                    streaming: true,
                    chunks: chunks.length,
                    metrics: chunks,
                    filters: {
                      operations: filterByOperation,
                      minDuration: minDurationThreshold,
                    },
                    completed: true,
                  }),
                },
              ],
            };
          } catch (error) {
            if (error instanceof Error && error.message.includes('aborted')) {
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify({
                      success: false,
                      streaming: true,
                      chunks: chunks.length,
                      metrics: chunks,
                      aborted: true,
                    }),
                  },
                ],
              };
            }
            throw error;
          }
        }

        case 'measureOperation': {
          if (!operationName) {
            throw new Error('Operation name required for measureOperation');
          }

          throwIfAborted(signal);

          let result: any;
          let metrics: any;

          if (operationCode) {
            // Security: Use VM context instead of Function constructor to prevent RCE
            const vm = await import('node:vm');

            // Security: Validate operation code for dangerous patterns
            const dangerousPatterns = [
              /require\s*\(/,
              /import\s+/,
              /eval\s*\(/,
              /Function\s*\(/,
              /constructor/,
              /__proto__/,
              /prototype/,
              /process\./,
              /global\./,
              /fs\./,
              /child_process/,
              /spawn/,
              /exec/,
            ];

            for (const pattern of dangerousPatterns) {
              if (pattern.test(operationCode)) {
                throw new Error(
                  `Operation code contains potentially dangerous pattern: ${pattern}`,
                );
              }
            }

            // Security: Create restricted VM context
            const safeContext = {
              // Safe built-ins only
              Math,
              Array,
              Object,
              String,
              Number,
              Boolean,
              JSON,
              Date: () => new Date(),
              console: {
                log: () => {}, // Disable console in user code
                warn: () => {},
                error: () => {},
              },
              // Explicitly deny dangerous globals
              setTimeout: undefined,
              setInterval: undefined,
              setImmediate: undefined,
              process: undefined,
              require: undefined,
              global: undefined,
              eval: undefined,
              Function: undefined,
            };

            let operation: any;
            try {
              // Security: Execute with timeout and restricted context using enhanced VM options
              operation = vm.runInNewContext(`(${operationCode})`, safeContext, {
                timeout: 1000, // 1 second timeout
                displayErrors: false, // Prevent information leakage
                contextName: 'perf-observer-sandbox',
                contextOrigin: 'performance-measurement',
                contextCodeGeneration: {
                  strings: false, // Disable eval and similar
                  wasm: false, // Disable WebAssembly
                },
              });
            } catch (error) {
              throw new Error(
                `Failed to compile operation code: ${error instanceof Error ? error.message : 'Unknown error'}`,
              );
            }

            if (typeof operation !== 'function') {
              throw new Error('operationCode must evaluate to a function');
            }

            const measured = await measureAsync(operationName, operation, signal);
            result = measured.result;
            metrics = measured.metrics;
          } else {
            // Measure a simple timestamp operation
            const measured = await measureAsync(
              operationName,
              async () => {
                await scheduler.yield(); // Minimal async operation
                return { timestamp: Date.now(), operationName };
              },
              signal,
            );
            result = measured.result;
            metrics = measured.metrics;
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  operationName,
                  result,
                  metrics,
                  timestamp: new Date().toISOString(),
                }),
              },
            ],
          };
        }

        case 'analyzeBottlenecks': {
          throwIfAborted(signal);

          const bottlenecks = globalPerformanceMonitor.analyzeBottlenecks();
          const memoryPressure = globalPerformanceMonitor.getMemoryPressure();

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  bottlenecks,
                  memoryPressure,
                  detailed: includeDetailedAnalysis,
                  timestamp: new Date().toISOString(),
                }),
              },
            ],
          };
        }

        case 'getMemoryPressure': {
          throwIfAborted(signal);

          const memoryPressure = globalPerformanceMonitor.getMemoryPressure();

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  memoryPressure,
                  timestamp: new Date().toISOString(),
                }),
              },
            ],
          };
        }

        case 'clearMetrics': {
          globalPerformanceMonitor.clear();

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  message: 'Performance metrics cleared',
                  timestamp: new Date().toISOString(),
                }),
              },
            ],
          };
        }

        case 'getRecommendations': {
          throwIfAborted(signal);

          const insights = getPerformanceInsights();
          const recommendations = insights.bottlenecks.recommendations;

          // Generate additional recommendations based on current state
          const additionalRecommendations: string[] = [];

          if (insights.summary.totalOperations === 0) {
            additionalRecommendations.push('Start performance monitoring to collect metrics');
          }

          if (insights.summary.averageDuration > 50) {
            additionalRecommendations.push(
              'Consider implementing caching for operations averaging > 50ms',
            );
          }

          if (
            insights.memoryPressure.level === 'high' ||
            insights.memoryPressure.level === 'critical'
          ) {
            additionalRecommendations.push('Implement memory optimization strategies immediately');
          }

          if (insights.uptime > 86400) {
            // > 1 day
            additionalRecommendations.push(
              'Consider periodic memory cleanup for long-running processes',
            );
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  recommendations: {
                    performance: recommendations,
                    additional: additionalRecommendations,
                    priority: insights.memoryPressure.level === 'critical' ? 'high' : 'medium',
                  },
                  context: {
                    uptime: insights.uptime,
                    totalOperations: insights.summary.totalOperations,
                    memoryLevel: insights.memoryPressure.level,
                  },
                  timestamp: new Date().toISOString(),
                }),
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown performance observer action: ${action}`);
      }
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

      return createMCPErrorResponse(error, 'performance_observer', {
        contextInfo: 'Performance Observer',
      });
    }
  },
};
