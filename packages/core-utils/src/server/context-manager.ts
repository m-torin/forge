/**
 * MCP Tool: Context Manager
 * Provides AsyncLocalStorage-based context tracking and management
 */

import { scheduler } from 'node:timers/promises';
import type { MCPToolResponse } from '../types/mcp';
import { AbortableToolArgs, safeThrowIfAborted } from './abort-support';
import {
  addContextMetadata,
  addPerformanceMark,
  createContextLogger,
  getCurrentContext,
  globalContextManager,
  runWithContext,
  setCorrelationId,
  setTracing,
} from './context';
import { ok, runTool } from './tool-helpers';
import { validateSessionId } from './validation';
export interface ContextManagerArgs extends AbortableToolArgs {
  action:
    | 'runWithContext' // Execute function with context
    | 'getCurrentContext' // Get current request context
    | 'addContextMetadata' // Add metadata to current context
    | 'addPerformanceMark' // Add performance mark
    | 'setCorrelation' // Set correlation ID for tracing
    | 'setTracing' // Set tracing information
    | 'getContextHistory' // Get context history for session
    | 'getContextStats' // Get context statistics
    | 'clearHistory' // Clear context history
    | 'demoContextPropagation' // Demonstrate context propagation
    | 'demoAsyncOperations' // Demo context across async operations
    | 'demoErrorHandling'; // Demo context in error scenarios

  // Context data
  sessionId?: string;
  userId?: string;
  toolName?: string;
  metadata?: Record<string, any>;
  correlationId?: string;
  traceId?: string;
  parentSpanId?: string;

  // For demos and operations
  operationName?: string;
  operationData?: any;
  markName?: string;
  metadataKey?: string;
  metadataValue?: any;

  // Async operation demo parameters
  asyncSteps?: number;
  errorStep?: number;
}

const logger = createContextLogger('ContextManager');

export const contextManagerTool = {
  name: 'context_manager',
  description: 'AsyncLocalStorage-based context tracking and management for Node.js 22+',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: [
          'runWithContext',
          'getCurrentContext',
          'addContextMetadata',
          'addPerformanceMark',
          'setCorrelation',
          'setTracing',
          'getContextHistory',
          'getContextStats',
          'clearHistory',
          'demoContextPropagation',
          'demoAsyncOperations',
          'demoErrorHandling',
        ],
        description: 'Context management action to perform',
      },
      sessionId: {
        type: 'string',
        description: 'Session ID for the context',
      },
      userId: {
        type: 'string',
        description: 'User ID for the context',
      },
      toolName: {
        type: 'string',
        description: 'Tool name for context identification',
      },
      metadata: {
        type: 'object',
        description: 'Initial metadata for the context',
      },
      correlationId: {
        type: 'string',
        description: 'Correlation ID for distributed tracing',
      },
      traceId: {
        type: 'string',
        description: 'Trace ID for distributed tracing',
      },
      parentSpanId: {
        type: 'string',
        description: 'Parent span ID for distributed tracing',
      },
      operationName: {
        type: 'string',
        description: 'Name of operation to run with context',
      },
      operationData: {
        description: 'Data for the operation',
      },
      markName: {
        type: 'string',
        description: 'Name of performance mark to add',
      },
      metadataKey: {
        type: 'string',
        description: 'Metadata key to add',
      },
      metadataValue: {
        description: 'Metadata value to add',
      },
      asyncSteps: {
        type: 'number',
        description: 'Number of async steps for demo',
        default: 3,
        minimum: 1,
        maximum: 10,
      },
      errorStep: {
        type: 'number',
        description: 'Step to trigger error on (for error demo)',
        minimum: 1,
      },
      signal: {
        description: 'AbortSignal for cancelling the operation',
      },
    },
    required: ['action'],
  },

  async execute(args: ContextManagerArgs): Promise<MCPToolResponse> {
    return runTool('context_manager', args.action, async () => {
      const {
        action,
        sessionId,
        userId,
        toolName,
        metadata = {},
        correlationId,
        traceId,
        parentSpanId,
        operationName,
        operationData,
        markName,
        metadataKey,
        metadataValue,
        asyncSteps = 3,
        errorStep,
        signal,
      } = args;

      // Validate session ID if provided
      if (sessionId) {
        const sessionValidation = validateSessionId(sessionId);
        if (!sessionValidation.isValid) {
          throw new Error(`Invalid session ID: ${sessionValidation.error}`);
        }
      }

      // Check for abort signal at start
      safeThrowIfAborted(signal);

      switch (action) {
        case 'runWithContext': {
          if (!operationName) {
            throw new Error('Operation name required for runWithContext');
          }

          const result = await runWithContext(
            {
              sessionId,
              userId,
              toolName: operationName,
              metadata: { ...metadata, fromContextManager: true },
              correlationId,
              traceId,
              parentSpanId,
            },
            async () => {
              addPerformanceMark('operation_start');

              // Simulate some work
              await scheduler.yield();
              addContextMetadata('operationData', operationData);

              safeThrowIfAborted(signal);

              // Simulate more work
              await scheduler.yield();
              addPerformanceMark('operation_work_done');

              const result = {
                operationName,
                data: operationData,
                processed: true,
                timestamp: new Date().toISOString(),
              };

              addContextMetadata('result', result);
              addPerformanceMark('operation_end');

              return result;
            },
          );

          return ok({
            success: true,
            action: 'runWithContext',
            result,
            contextCreated: true,
          });
        }

        case 'getCurrentContext': {
          const context = getCurrentContext();

          return ok({
            success: true,
            hasContext: !!context,
            context: context
              ? {
                  requestId: context.requestId,
                  sessionId: context.sessionId,
                  userId: context.userId,
                  toolName: context.toolName,
                  startTime: context.startTime,
                  duration: context.startTime ? Date.now() - context.startTime : 0,
                  metadata: context.metadata,
                  performanceMarks: context.performanceMarks,
                  correlationId: context.correlationId,
                  traceId: context.traceId,
                  parentSpanId: context.parentSpanId,
                }
              : null,
          });
        }

        case 'addContextMetadata': {
          if (!metadataKey || metadataValue === undefined) {
            throw new Error('metadataKey and metadataValue required for addContextMetadata');
          }

          const contextBefore = getCurrentContext();
          addContextMetadata(metadataKey, metadataValue);
          const contextAfter = getCurrentContext();

          return ok({
            success: true,
            hasContext: !!contextAfter,
            metadataAdded: {
              key: metadataKey,
              value: metadataValue,
            },
            metadataBefore: contextBefore?.metadata || {},
            metadataAfter: contextAfter?.metadata || {},
          });
        }

        case 'addPerformanceMark': {
          if (!markName) {
            throw new Error('markName required for addPerformanceMark');
          }

          const contextBefore = getCurrentContext();
          addPerformanceMark(markName);
          const contextAfter = getCurrentContext();

          return ok({
            success: true,
            hasContext: !!contextAfter,
            markAdded: markName,
            marksBefore: contextBefore?.performanceMarks || [],
            marksAfter: contextAfter?.performanceMarks || [],
          });
        }

        case 'setCorrelation': {
          if (!correlationId) {
            throw new Error('correlationId required for setCorrelation');
          }

          const contextBefore = getCurrentContext();
          setCorrelationId(correlationId);
          const contextAfter = getCurrentContext();

          return ok({
            success: true,
            hasContext: !!contextAfter,
            correlationId,
            correlationBefore: contextBefore?.correlationId,
            correlationAfter: contextAfter?.correlationId,
          });
        }

        case 'setTracing': {
          if (!traceId) {
            throw new Error('traceId required for setTracing');
          }

          const contextBefore = getCurrentContext();
          setTracing(traceId, parentSpanId);
          const contextAfter = getCurrentContext();

          return ok({
            success: true,
            hasContext: !!contextAfter,
            tracing: {
              traceId,
              parentSpanId,
            },
            tracingBefore: {
              traceId: contextBefore?.traceId,
              parentSpanId: contextBefore?.parentSpanId,
            },
            tracingAfter: {
              traceId: contextAfter?.traceId,
              parentSpanId: contextAfter?.parentSpanId,
            },
          });
        }

        case 'getContextHistory': {
          if (!sessionId) {
            throw new Error('sessionId required for getContextHistory');
          }

          const history = globalContextManager.getContextHistory(sessionId);

          return ok({
            success: true,
            sessionId,
            historyCount: history.length,
            history: history.map(snapshot => ({
              requestId: snapshot.context.requestId,
              toolName: snapshot.context.toolName,
              startTime: snapshot.context.startTime,
              duration:
                snapshot.context.performanceMarks.length > 1
                  ? snapshot.context.performanceMarks[snapshot.context.performanceMarks.length - 1]
                      .timestamp - snapshot.context.performanceMarks[0].timestamp
                  : 0,
              marksCount: snapshot.context.performanceMarks.length,
              metadataKeys: Object.keys(snapshot.context.metadata),
              memoryUsage: snapshot.memoryUsage.heapUsed,
              timestamp: snapshot.timestamp,
            })),
          });
        }

        case 'getContextStats': {
          const stats = globalContextManager.getContextStats();

          return ok({
            success: true,
            stats,
            timestamp: new Date().toISOString(),
          });
        }

        case 'clearHistory': {
          globalContextManager.clearContextHistory(sessionId);

          return ok({
            success: true,
            cleared: sessionId || 'all',
            timestamp: new Date().toISOString(),
          });
        }

        case 'demoContextPropagation': {
          const results: any[] = [];

          const result = await runWithContext(
            {
              sessionId: sessionId || `demo_${Date.now()}`,
              userId: userId || 'demo_user',
              toolName: 'contextPropagationDemo',
              metadata: { demo: true, type: 'propagation' },
            },
            async () => {
              addPerformanceMark('demo_start');
              results.push({ step: 1, context: getCurrentContext()?.requestId });

              // Nested async function that should inherit context
              const nestedOperation = async () => {
                addPerformanceMark('nested_start');
                addContextMetadata('nestedCall', true);
                results.push({ step: 2, context: getCurrentContext()?.requestId });

                await scheduler.yield();

                addPerformanceMark('nested_end');
                return 'nested_result';
              };

              const nestedResult = await nestedOperation();
              results.push({ step: 3, context: getCurrentContext()?.requestId, nestedResult });

              // Promise-based operation
              const promiseResult = await Promise.resolve().then(async () => {
                addPerformanceMark('promise_operation');
                addContextMetadata('promiseCall', true);
                results.push({ step: 4, context: getCurrentContext()?.requestId });
                return 'promise_result';
              });

              addPerformanceMark('demo_end');
              results.push({ step: 5, context: getCurrentContext()?.requestId, promiseResult });

              return {
                propagationTest: 'completed',
                steps: results.length,
                allContextsMatch: results.every(r => r.context === results[0].context),
              };
            },
          );

          return ok({
            success: true,
            demo: 'contextPropagation',
            result,
            contextSteps: results,
          });
        }

        case 'demoAsyncOperations': {
          const operations: any[] = [];

          const result = await runWithContext(
            {
              sessionId: sessionId || `async_demo_${Date.now()}`,
              toolName: 'asyncOperationsDemo',
              metadata: { demo: true, type: 'async', steps: asyncSteps },
            },
            async () => {
              addPerformanceMark('async_demo_start');

              for (let i = 1; i <= asyncSteps; i++) {
                safeThrowIfAborted(signal);

                addPerformanceMark(`step_${i}_start`);

                // Simulate async work with varying delays
                await scheduler.yield();

                addContextMetadata(`step_${i}_data`, { stepNumber: i, delay: i * 2 });
                operations.push({
                  step: i,
                  context: getCurrentContext()?.requestId,
                  timestamp: Date.now(),
                });

                addPerformanceMark(`step_${i}_end`);
              }

              addPerformanceMark('async_demo_end');
              return { completedSteps: asyncSteps, operations };
            },
          );

          return ok({
            success: true,
            demo: 'asyncOperations',
            result,
            contextConsistency: operations.every(op => op.context === operations[0]?.context),
          });
        }

        case 'demoErrorHandling': {
          let errorCaught = false;
          let errorDetails: any = null;
          let operationsCompleted = 0;

          const result = await runWithContext(
            {
              sessionId: sessionId || `error_demo_${Date.now()}`,
              toolName: 'errorHandlingDemo',
              metadata: { demo: true, type: 'error', errorStep },
            },
            async () => {
              addPerformanceMark('error_demo_start');

              try {
                for (let i = 1; i <= asyncSteps; i++) {
                  safeThrowIfAborted(signal);

                  addPerformanceMark(`error_step_${i}`);

                  if (errorStep && i === errorStep) {
                    addContextMetadata('aboutToError', { step: i, timestamp: Date.now() });
                    throw new Error(`Simulated error at step ${i}`);
                  }

                  await scheduler.yield();
                  operationsCompleted = i;
                  addContextMetadata(`step_${i}_completed`, true);
                }

                addPerformanceMark('error_demo_success');
                return { success: true, stepsCompleted: operationsCompleted };
              } catch (error) {
                errorCaught = true;
                addPerformanceMark('error_caught');
                addContextMetadata('errorCaught', {
                  message: error instanceof Error ? error.message : 'Unknown error',
                  step: errorStep,
                  stepsCompleted: operationsCompleted,
                  timestamp: Date.now(),
                });

                errorDetails = {
                  message: error instanceof Error ? error.message : 'Unknown error',
                  step: errorStep,
                  stepsCompleted: operationsCompleted,
                };

                // Re-throw to demonstrate error propagation
                throw error;
              }
            },
          ).catch(error => {
            // Catch the error to demonstrate context preservation in error scenarios
            return {
              error: true,
              message: error.message,
              contextPreserved: true,
              stepsCompleted: operationsCompleted,
            };
          });

          return ok({
            success: true,
            demo: 'errorHandling',
            result,
            errorCaught,
            errorDetails,
          });
        }

        default:
          throw new Error(`Unknown context manager action: ${action}`);
      }

      // This should never be reached due to default case throwing
      throw new Error('Unreachable code');
    });
  },
};
