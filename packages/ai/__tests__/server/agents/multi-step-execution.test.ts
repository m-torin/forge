/**
 * Multi-Step Agent Execution Tests
 * Comprehensive testing for multi-step agent functionality and step conditions
 */

import '@repo/qa/vitest/setup/next-app';
import { afterEach, beforeEach, describe, expect, vi } from 'vitest';
import {
  MultiStepAgentExecutor,
  type AgentStep,
} from '../../../src/server/agents/multi-step-execution';
import {
  OptimizedConditionFactory,
  type PerformanceOptimizedCondition,
} from '../../../src/server/agents/optimized-conditions';
import { AgentPerformanceMonitor } from '../../../src/server/agents/performance-monitoring';

describe('multiStepAgentExecutor', () => {
  let executor: MultiStepAgentExecutor;
  let performanceMonitor: AgentPerformanceMonitor;
  let conditionFactory: OptimizedConditionFactory;

  beforeEach(() => {
    performanceMonitor = new AgentPerformanceMonitor({
      enablePerformanceTracking: true,
      performanceThresholds: {
        maxExecutionTime: 30000,
        maxMemoryUsage: 100 * 1024 * 1024,
      },
    });

    conditionFactory = new OptimizedConditionFactory();

    executor = new MultiStepAgentExecutor({
      maxSteps: 10,
      timeout: 30000,
      enablePerformanceMonitoring: true,
      performanceMonitor,
      conditionFactory,
    });
  });

  afterEach(() => {
    executor.destroy();
    performanceMonitor.destroy();
  });

  describe('basic Step Execution', () => {
    test('should execute a simple sequential workflow', async () => {
      const steps: AgentStep[] = [
        {
          id: 'step1',
          name: 'Initialize',
          type: 'action',
          action: async context => {
            context.data.initialized = true;
            return { success: true, data: { message: 'Initialized' } };
          },
        },
        {
          id: 'step2',
          name: 'Process',
          type: 'action',
          action: async context => {
            expect(context.data.initialized).toBeTruthy();
            context.data.processed = true;
            return { success: true, data: { message: 'Processed' } };
          },
        },
        {
          id: 'step3',
          name: 'Finalize',
          type: 'action',
          action: async context => {
            expect(context.data.processed).toBeTruthy();
            context.data.finalized = true;
            return { success: true, data: { message: 'Finalized' } };
          },
        },
      ];

      const result = await executor.executeWorkflow(steps, {
        data: {},
        metadata: { workflowId: 'test-workflow' },
      });

      expect(result.success).toBeTruthy();
      expect(result.executedSteps).toHaveLength(3);
      expect(result.context.data.initialized).toBeTruthy();
      expect(result.context.data.processed).toBeTruthy();
      expect(result.context.data.finalized).toBeTruthy();
    });

    test('should handle step failures gracefully', async () => {
      const steps: AgentStep[] = [
        {
          id: 'step1',
          name: 'Success Step',
          type: 'action',
          action: async () => ({ success: true, data: { message: 'OK' } }),
        },
        {
          id: 'step2',
          name: 'Failing Step',
          type: 'action',
          action: async () => {
            throw new Error('Step failed intentionally');
          },
        },
        {
          id: 'step3',
          name: 'Should Not Execute',
          type: 'action',
          action: async () => ({ success: true, data: { message: 'Should not reach' } }),
        },
      ];

      const result = await executor.executeWorkflow(steps, {
        data: {},
        metadata: { workflowId: 'failing-workflow' },
      });

      expect(result.success).toBeFalsy();
      expect(result.executedSteps).toHaveLength(2);
      expect(result.error).toContain('Step failed intentionally');
      expect(result.failedStep?.id).toBe('step2');
    });

    test('should respect execution timeout', async () => {
      const shortTimeoutExecutor = new MultiStepAgentExecutor({
        maxSteps: 10,
        timeout: 100, // 100ms timeout
      });

      const steps: AgentStep[] = [
        {
          id: 'slow-step',
          name: 'Slow Step',
          type: 'action',
          action: async () => {
            await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
            return { success: true, data: {} };
          },
        },
      ];

      const result = await shortTimeoutExecutor.executeWorkflow(steps, {
        data: {},
        metadata: { workflowId: 'timeout-test' },
      });

      expect(result.success).toBeFalsy();
      expect(result.error).toContain('timeout');

      shortTimeoutExecutor.destroy();
    });
  });

  describe('step Conditions', () => {
    test('should evaluate conditional steps correctly', async () => {
      const steps: AgentStep[] = [
        {
          id: 'setup',
          name: 'Setup',
          type: 'action',
          action: async context => {
            context.data.shouldProceed = true;
            return { success: true, data: {} };
          },
        },
        {
          id: 'conditional-step',
          name: 'Conditional Step',
          type: 'action',
          condition: {
            type: 'simple',
            expression: 'context.data.shouldProceed === true',
          },
          action: async context => {
            context.data.conditionalExecuted = true;
            return { success: true, data: {} };
          },
        },
        {
          id: 'skipped-step',
          name: 'Skipped Step',
          type: 'action',
          condition: {
            type: 'simple',
            expression: 'context.data.shouldProceed === false',
          },
          action: async context => {
            context.data.skippedExecuted = true;
            return { success: true, data: {} };
          },
        },
      ];

      const result = await executor.executeWorkflow(steps, {
        data: {},
        metadata: { workflowId: 'conditional-test' },
      });

      expect(result.success).toBeTruthy();
      expect(result.context.data.conditionalExecuted).toBeTruthy();
      expect(result.context.data.skippedExecuted).toBeUndefined();
      expect(result.executedSteps).toHaveLength(2); // setup + conditional-step
      expect(result.skippedSteps).toHaveLength(1); // skipped-step
    });

    test('should handle complex performance-optimized conditions', async () => {
      const performanceCondition: PerformanceOptimizedCondition = {
        id: 'perf-condition',
        type: 'performance_optimized',
        complexity: 'medium',
        predictedExecutionTime: 50,
        evaluator: async context => {
          return context.data.performanceScore > 80;
        },
        cacheKey: context => `perf-${context.data.performanceScore}`,
        optimizationHints: {
          cacheable: true,
          parallelizable: false,
          memoryIntensive: false,
        },
      };

      const steps: AgentStep[] = [
        {
          id: 'setup-performance',
          name: 'Setup Performance Data',
          type: 'action',
          action: async context => {
            context.data.performanceScore = 85;
            return { success: true, data: {} };
          },
        },
        {
          id: 'performance-step',
          name: 'Performance Step',
          type: 'action',
          condition: performanceCondition,
          action: async context => {
            context.data.performanceStepExecuted = true;
            return { success: true, data: {} };
          },
        },
      ];

      const result = await executor.executeWorkflow(steps, {
        data: {},
        metadata: { workflowId: 'performance-condition-test' },
      });

      expect(result.success).toBeTruthy();
      expect(result.context.data.performanceStepExecuted).toBeTruthy();
    });

    test('should cache condition evaluations for performance', async () => {
      const evaluatorSpy = vi.fn().mockResolvedValue(true);

      const cachedCondition: PerformanceOptimizedCondition = {
        id: 'cached-condition',
        type: 'performance_optimized',
        complexity: 'low',
        evaluator: evaluatorSpy,
        cacheKey: () => 'static-key',
        optimizationHints: {
          cacheable: true,
          parallelizable: false,
          memoryIntensive: false,
        },
      };

      const steps: AgentStep[] = [
        {
          id: 'step1',
          name: 'First Step',
          type: 'action',
          condition: cachedCondition,
          action: async () => ({ success: true, data: {} }),
        },
        {
          id: 'step2',
          name: 'Second Step',
          type: 'action',
          condition: cachedCondition,
          action: async () => ({ success: true, data: {} }),
        },
      ];

      await executor.executeWorkflow(steps, {
        data: {},
        metadata: { workflowId: 'cache-test' },
      });

      // Should only call evaluator once due to caching
      expect(evaluatorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('parallel Execution', () => {
    test('should execute parallel steps concurrently', async () => {
      const executionOrder: string[] = [];

      const steps: AgentStep[] = [
        {
          id: 'parallel-group',
          name: 'Parallel Group',
          type: 'parallel',
          steps: [
            {
              id: 'parallel-1',
              name: 'Parallel Step 1',
              type: 'action',
              action: async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
                executionOrder.push('parallel-1');
                return { success: true, data: {} };
              },
            },
            {
              id: 'parallel-2',
              name: 'Parallel Step 2',
              type: 'action',
              action: async () => {
                await new Promise(resolve => setTimeout(resolve, 50));
                executionOrder.push('parallel-2');
                return { success: true, data: {} };
              },
            },
            {
              id: 'parallel-3',
              name: 'Parallel Step 3',
              type: 'action',
              action: async () => {
                await new Promise(resolve => setTimeout(resolve, 75));
                executionOrder.push('parallel-3');
                return { success: true, data: {} };
              },
            },
          ],
        },
      ];

      const startTime = Date.now();
      const result = await executor.executeWorkflow(steps, {
        data: {},
        metadata: { workflowId: 'parallel-test' },
      });
      const endTime = Date.now();

      expect(result.success).toBeTruthy();
      expect(executionOrder).toHaveLength(3);
      expect(executionOrder).toContain('parallel-1');
      expect(executionOrder).toContain('parallel-2');
      expect(executionOrder).toContain('parallel-3');

      // Should complete faster than sequential execution (which would take ~225ms)
      expect(endTime - startTime).toBeLessThan(200);

      // parallel-2 should finish first (50ms), then parallel-3 (75ms), then parallel-1 (100ms)
      expect(executionOrder[0]).toBe('parallel-2');
    });

    test('should handle failures in parallel steps', async () => {
      const steps: AgentStep[] = [
        {
          id: 'parallel-group',
          name: 'Parallel Group with Failure',
          type: 'parallel',
          steps: [
            {
              id: 'success-step',
              name: 'Success Step',
              type: 'action',
              action: async () => ({ success: true, data: { message: 'OK' } }),
            },
            {
              id: 'failure-step',
              name: 'Failure Step',
              type: 'action',
              action: async () => {
                throw new Error('Parallel step failed');
              },
            },
          ],
        },
      ];

      const result = await executor.executeWorkflow(steps, {
        data: {},
        metadata: { workflowId: 'parallel-failure-test' },
      });

      expect(result.success).toBeFalsy();
      expect(result.error).toContain('Parallel step failed');
    });
  });

  describe('decision Steps', () => {
    test('should handle decision-based branching', async () => {
      const steps: AgentStep[] = [
        {
          id: 'setup-data',
          name: 'Setup Data',
          type: 'action',
          action: async context => {
            context.data.score = 85;
            return { success: true, data: {} };
          },
        },
        {
          id: 'decision-step',
          name: 'Score Decision',
          type: 'decision',
          condition: {
            type: 'simple',
            expression: 'context.data.score >= 80',
          },
          onTrue: [
            {
              id: 'high-score-action',
              name: 'High Score Action',
              type: 'action',
              action: async context => {
                context.data.result = 'high-score';
                return { success: true, data: {} };
              },
            },
          ],
          onFalse: [
            {
              id: 'low-score-action',
              name: 'Low Score Action',
              type: 'action',
              action: async context => {
                context.data.result = 'low-score';
                return { success: true, data: {} };
              },
            },
          ],
        },
      ];

      const result = await executor.executeWorkflow(steps, {
        data: {},
        metadata: { workflowId: 'decision-test' },
      });

      expect(result.success).toBeTruthy();
      expect(result.context.data.result).toBe('high-score');
      expect(result.executedSteps.some(step => step.id === 'high-score-action')).toBeTruthy();
      expect(result.executedSteps.some(step => step.id === 'low-score-action')).toBeFalsy();
    });
  });

  describe('loop Steps', () => {
    test('should execute loop steps with proper iteration control', async () => {
      const steps: AgentStep[] = [
        {
          id: 'setup-counter',
          name: 'Setup Counter',
          type: 'action',
          action: async context => {
            context.data.counter = 0;
            context.data.results = [];
            return { success: true, data: {} };
          },
        },
        {
          id: 'count-loop',
          name: 'Counting Loop',
          type: 'loop',
          condition: {
            type: 'simple',
            expression: 'context.data.counter < 3',
          },
          steps: [
            {
              id: 'increment-counter',
              name: 'Increment Counter',
              type: 'action',
              action: async context => {
                context.data.counter++;
                context.data.results.push(`iteration-${context.data.counter}`);
                return { success: true, data: {} };
              },
            },
          ],
          maxIterations: 5,
        },
      ];

      const result = await executor.executeWorkflow(steps, {
        data: {},
        metadata: { workflowId: 'loop-test' },
      });

      expect(result.success).toBeTruthy();
      expect(result.context.data.counter).toBe(3);
      expect(result.context.data.results).toStrictEqual([
        'iteration-1',
        'iteration-2',
        'iteration-3',
      ]);
    });

    test('should respect max iterations in loops', async () => {
      const steps: AgentStep[] = [
        {
          id: 'infinite-loop',
          name: 'Infinite Loop',
          type: 'loop',
          condition: {
            type: 'simple',
            expression: 'true', // Always true - would be infinite without maxIterations
          },
          steps: [
            {
              id: 'loop-action',
              name: 'Loop Action',
              type: 'action',
              action: async context => {
                if (!context.data.iterations) context.data.iterations = 0;
                context.data.iterations++;
                return { success: true, data: {} };
              },
            },
          ],
          maxIterations: 2,
        },
      ];

      const result = await executor.executeWorkflow(steps, {
        data: {},
        metadata: { workflowId: 'max-iterations-test' },
      });

      expect(result.success).toBeTruthy();
      expect(result.context.data.iterations).toBe(2);
    });
  });

  describe('performance Monitoring Integration', () => {
    test('should track step execution performance', async () => {
      const steps: AgentStep[] = [
        {
          id: 'tracked-step',
          name: 'Tracked Step',
          type: 'action',
          action: async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
            return { success: true, data: {} };
          },
        },
      ];

      await executor.executeWorkflow(steps, {
        data: {},
        metadata: { workflowId: 'performance-test' },
      });

      const metrics = performanceMonitor.getMetrics();
      expect(metrics.totalStepsExecuted).toBeGreaterThan(0);
      expect(metrics.averageStepDuration).toBeGreaterThan(90); // Should be around 100ms
    });

    test('should provide step optimization recommendations', async () => {
      // Execute a slow step to trigger optimization recommendations
      const steps: AgentStep[] = [
        {
          id: 'slow-step',
          name: 'Slow Step',
          type: 'action',
          action: async () => {
            await new Promise(resolve => setTimeout(resolve, 300));
            return { success: true, data: {} };
          },
        },
      ];

      await executor.executeWorkflow(steps, {
        data: {},
        metadata: { workflowId: 'optimization-test' },
      });

      const recommendations = performanceMonitor.getOptimizationRecommendations();
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(rec => rec.type === 'performance')).toBeTruthy();
    });
  });

  describe('error Handling and Recovery', () => {
    test('should handle errors with retry logic', async () => {
      let attemptCount = 0;

      const steps: AgentStep[] = [
        {
          id: 'retry-step',
          name: 'Retry Step',
          type: 'action',
          retryConfig: {
            maxRetries: 2,
            retryDelay: 10,
          },
          action: async () => {
            attemptCount++;
            if (attemptCount < 3) {
              throw new Error(`Attempt ${attemptCount} failed`);
            }
            return { success: true, data: { attempts: attemptCount } };
          },
        },
      ];

      const result = await executor.executeWorkflow(steps, {
        data: {},
        metadata: { workflowId: 'retry-test' },
      });

      expect(result.success).toBeTruthy();
      expect(attemptCount).toBe(3);
      expect(result.executedSteps[0].result?.data.attempts).toBe(3);
    });

    test('should provide detailed error information on failure', async () => {
      const steps: AgentStep[] = [
        {
          id: 'error-step',
          name: 'Error Step',
          type: 'action',
          action: async () => {
            const error = new Error('Detailed error message');
            error.stack = 'Error stack trace';
            throw error;
          },
        },
      ];

      const result = await executor.executeWorkflow(steps, {
        data: {},
        metadata: { workflowId: 'error-details-test' },
      });

      expect(result.success).toBeFalsy();
      expect(result.error).toContain('Detailed error message');
      expect(result.failedStep?.id).toBe('error-step');
      expect(result.failedStep?.error).toContain('Detailed error message');
    });
  });

  describe('context and State Management', () => {
    test('should maintain context across steps', async () => {
      const steps: AgentStep[] = [
        {
          id: 'set-data',
          name: 'Set Data',
          type: 'action',
          action: async context => {
            context.data.sharedValue = 'shared-data';
            context.metadata.timestamp = Date.now();
            return { success: true, data: {} };
          },
        },
        {
          id: 'read-data',
          name: 'Read Data',
          type: 'action',
          action: async context => {
            expect(context.data.sharedValue).toBe('shared-data');
            expect(context.metadata.timestamp).toBeDefined();
            context.data.verified = true;
            return { success: true, data: {} };
          },
        },
      ];

      const result = await executor.executeWorkflow(steps, {
        data: { initialValue: 'initial' },
        metadata: { workflowId: 'context-test' },
      });

      expect(result.success).toBeTruthy();
      expect(result.context.data.initialValue).toBe('initial');
      expect(result.context.data.sharedValue).toBe('shared-data');
      expect(result.context.data.verified).toBeTruthy();
      expect(result.context.metadata.timestamp).toBeDefined();
    });

    test('should handle context isolation in parallel steps', async () => {
      const steps: AgentStep[] = [
        {
          id: 'parallel-context-test',
          name: 'Parallel Context Test',
          type: 'parallel',
          steps: [
            {
              id: 'branch-1',
              name: 'Branch 1',
              type: 'action',
              action: async context => {
                context.data.branch1Value = 'branch-1-data';
                return { success: true, data: {} };
              },
            },
            {
              id: 'branch-2',
              name: 'Branch 2',
              type: 'action',
              action: async context => {
                context.data.branch2Value = 'branch-2-data';
                return { success: true, data: {} };
              },
            },
          ],
        },
      ];

      const result = await executor.executeWorkflow(steps, {
        data: {},
        metadata: { workflowId: 'parallel-context-test' },
      });

      expect(result.success).toBeTruthy();
      expect(result.context.data.branch1Value).toBe('branch-1-data');
      expect(result.context.data.branch2Value).toBe('branch-2-data');
    });
  });
});
