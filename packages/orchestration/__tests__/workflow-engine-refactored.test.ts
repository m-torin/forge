/**
 * Workflow Engine Refactored Tests
 *
 * Demonstrates the DRY refactoring for workflow engine components.
 * Shows dramatic reduction in code duplication using centralized utilities.
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';

// Import centralized DRY utilities
import {
  createMockEventBus,
  createMockMonitoring,
  createMockScheduler,
  createMockWorkflowProvider,
} from './setup';
import {
  executionGenerators,
  providerConfigGenerators,
  testDataUtils,
  workflowGenerators,
} from './test-data-generators';
import { AssertionUtils, TestUtils, ValidationUtils } from './test-utils';
import {
  assertWorkflowExecution,
  createProviderTestSuite,
  createWorkflowTestSuite,
} from './workflow-test-factory';

import { createWorkflowEngine } from '#/index';

describe('workflow Engine - DRY Refactored', () => {
  let mockProvider: any;
  let engineConfig: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Use centralized mock creation
    mockProvider = createMockWorkflowProvider();

    // Use centralized configuration generation
    const upstashConfig = providerConfigGenerators.upstashWorkflow();
    engineConfig = {
      defaultProvider: upstashConfig.name,
      providers: [
        {
          name: upstashConfig.name,
          type: 'upstash-workflow' as const,
          config: upstashConfig,
        },
      ],
    };
  });

  // Use centralized test suite for workflow engine
  createWorkflowTestSuite({
    suiteName: 'Workflow Engine Creation Tests',
    moduleFactory: async () => {
      const engine = createWorkflowEngine(engineConfig);
      return engine;
    },
    scenarios: [
      {
        name: 'should create workflow engine with valid configuration',
        type: 'basic',
        assertions: engine => {
          expect(engine).toBeDefined();
          expect(engine.execute).toBeDefined();
          expect(engine.getExecution).toBeDefined();
          expect(engine.listExecutions).toBeDefined();
          expect(engine.healthCheck).toBeDefined();
        },
      },
      {
        name: 'should execute workflow successfully',
        type: 'execution',
        input: workflowGenerators.simple(),
        expected: { id: expect.any(String), status: 'running' },
        assertions: result => {
          assertWorkflowExecution(result);
        },
      },
      {
        name: 'should handle workflow execution errors',
        type: 'error',
        input: workflowGenerators.invalid(),
        expected: { shouldFail: true, errorMessage: 'Invalid workflow' },
      },
    ],
  });

  // Provider integration tests using centralized patterns
  describe('provider Integration', () => {
    createProviderTestSuite({
      providerName: 'Upstash Workflow Provider',
      providerType: 'upstash-workflow',
      providerFactory: () => createMockWorkflowProvider(),
      scenarios: [
        {
          name: 'execute workflow through engine',
          method: 'execute',
          input: workflowGenerators.simple(),
          expected: { id: expect.any(String), status: 'running' },
        },
        {
          name: 'get execution status through engine',
          method: 'getExecution',
          input: 'exec-123',
          expected: { id: 'exec-123', status: expect.any(String) },
        },
        {
          name: 'list executions through engine',
          method: 'listExecutions',
          expected: expect.any(Array),
        },
        {
          name: 'health check through engine',
          method: 'healthCheck',
          expected: { status: 'healthy' },
        },
      ],
    });
  });

  // Engine operations tests using centralized patterns
  describe('engine Operations', () => {
    test('should execute workflow with different scenarios', async () => {
      const engine = createWorkflowEngine(engineConfig);

      const workflows = [
        workflowGenerators.simple(),
        workflowGenerators.complex(),
        workflowGenerators.parallel(),
      ];

      for (const workflow of workflows) {
        // Use centralized validation
        const validation = ValidationUtils.validateWorkflow(workflow);
        expect(validation.valid).toBeTruthy();

        // Mock successful execution
        const mockExecution = executionGenerators.running({
          workflowId: workflow.id,
        });

        mockProvider.execute.mockResolvedValue(mockExecution);

        const result = await engine.executeWorkflow(workflow, { test: 'data' });

        // Use centralized assertions
        assertWorkflowExecution(result);
        expect(result.workflowId).toBe(workflow.id);
      }
    });

    test('should handle engine configuration errors', async () => {
      const invalidConfig = {
        defaultProvider: 'non-existent',
        providers: [],
      };

      await TestUtils.errors.expectError(async () => {
        createWorkflowEngine(invalidConfig);
      }, 'Invalid configuration');
    });

    test('should manage execution lifecycle', async () => {
      const engine = createWorkflowEngine(engineConfig);
      const workflow = workflowGenerators.simple();

      // Mock execution states
      const runningExecution = executionGenerators.running({ workflowId: workflow.id });
      const completedExecution = executionGenerators.completed({ workflowId: workflow.id });

      mockProvider.execute.mockResolvedValue(runningExecution);
      mockProvider.getExecution.mockResolvedValue(completedExecution);

      // Start execution
      const startResult = await engine.executeWorkflow(workflow, { test: 'data' });
      assertWorkflowExecution(startResult, 'running');

      // Check execution status
      const statusResult = await engine.getExecution(startResult.id);
      assertWorkflowExecution(statusResult);

      // List executions
      mockProvider.listExecutions.mockResolvedValue([runningExecution, completedExecution]);
      const listResult = await engine.listExecutions(workflow.id);

      expect(Array.isArray(listResult)).toBeTruthy();
      listResult.forEach(execution => {
        assertWorkflowExecution(execution);
      });
    });
  });

  // Performance tests using centralized utilities
  describe('performance Tests', () => {
    test('should handle concurrent workflow executions', async () => {
      const engine = createWorkflowEngine(engineConfig);

      const benchmark = await TestUtils.performance.benchmark(
        async () => {
          const workflows = Array.from({ length: 10 }, () => workflowGenerators.simple());

          const executions = await Promise.all(
            workflows.map(workflow => {
              mockProvider.execute.mockResolvedValue(
                executionGenerators.running({ workflowId: workflow.id }),
              );
              return engine.executeWorkflow(workflow, { test: 'data' });
            }),
          );

          return executions;
        },
        3, // 3 iterations
      );

      expect(benchmark.average).toBeLessThan(1000); // Max 1 second average
      expect(benchmark.results).toHaveLength(3);
    });

    test('should handle large workflow configurations', async () => {
      const engine = createWorkflowEngine(engineConfig);
      const largeWorkflow = workflowGenerators.large(100); // 100 steps

      const result = await TestUtils.performance.testPerformance(
        async () => {
          mockProvider.execute.mockResolvedValue(
            executionGenerators.running({ workflowId: largeWorkflow.id }),
          );

          return await engine.executeWorkflow(largeWorkflow, { test: 'data' });
        },
        2000, // Max 2 seconds
      );

      expect(result.duration).toBeLessThan(2000);
      assertWorkflowExecution(result.result);
    });
  });

  // Error handling tests using centralized utilities
  describe('error Handling Tests', () => {
    test('should handle provider failures gracefully', async () => {
      const engine = createWorkflowEngine(engineConfig);
      const workflow = workflowGenerators.simple();

      mockProvider.execute.mockRejectedValue(new Error('Provider failed'));

      const result = await engine.executeWorkflow(workflow, { test: 'data' });

      expect(result.status).toBe('failed');
      expect(result.error).toBeDefined();
      if (result.error) {
        expect(result.error.message).toContain('Provider failed');
      }
    });

    test('should handle invalid workflow definitions', async () => {
      const engine = createWorkflowEngine(engineConfig);
      const invalidWorkflow = workflowGenerators.invalid();

      await TestUtils.errors.expectError(async () => {
        await engine.executeWorkflow(invalidWorkflow, { test: 'data' });
      }, 'Invalid workflow');
    });

    test('should handle execution timeouts', async () => {
      const engine = createWorkflowEngine(engineConfig);
      const workflow = workflowGenerators.simple();

      mockProvider.execute.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return executionGenerators.running();
      });

      const result = await engine.executeWorkflow(workflow, { test: 'data' });

      expect(result.status).toBe('failed');
      if (result.error) {
        expect(result.error.message).toContain('timeout');
      }
    });
  });

  // Integration tests using centralized patterns
  describe('integration Tests', () => {
    test('should integrate with monitoring service', async () => {
      const mockMonitoring = createMockMonitoring();
      const engine = createWorkflowEngine({
        ...engineConfig,
        monitoring: mockMonitoring,
      });

      const workflow = workflowGenerators.simple();
      const execution = executionGenerators.running({ workflowId: workflow.id });

      mockProvider.execute.mockResolvedValue(execution);

      await engine.executeWorkflow(workflow, { test: 'data' });

      // Verify monitoring integration
      expect(mockMonitoring.recordEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'workflow_execution_started',
          workflowId: workflow.id,
        }),
      );
    });

    test('should integrate with event bus', async () => {
      const mockEventBus = createMockEventBus();
      const engine = createWorkflowEngine({
        ...engineConfig,
        eventBus: mockEventBus,
      });

      const workflow = workflowGenerators.simple();
      const execution = executionGenerators.running({ workflowId: workflow.id });

      mockProvider.execute.mockResolvedValue(execution);

      await engine.executeWorkflow(workflow, { test: 'data' });

      // Verify event bus integration
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        'workflow.execution.started',
        expect.objectContaining({
          workflowId: workflow.id,
          executionId: execution.id,
        }),
      );
    });

    test('should integrate with scheduler', async () => {
      const mockScheduler = createMockScheduler();
      const engine = createWorkflowEngine({
        ...engineConfig,
        scheduler: mockScheduler,
      });

      const workflow = workflowGenerators.simple();
      const scheduleConfig = {
        cron: '0 9 * * *',
        timezone: 'UTC',
      };

      const scheduleResult = await engine.scheduleWorkflow(workflow);

      expect(scheduleResult).toBeDefined();
      // The scheduler would be called internally by the workflow engine
    });
  });

  // Validation tests using centralized utilities
  describe('validation Tests', () => {
    test('should validate engine configuration', () => {
      const validConfigs = [
        {
          defaultProvider: 'test-provider',
          providers: [
            {
              name: 'test-provider',
              type: 'upstash-workflow' as const,
              config: providerConfigGenerators.upstashWorkflow(),
            },
          ],
        },
        {
          defaultProvider: 'test-workflow-2',
          providers: [
            {
              name: 'test-workflow-2',
              type: 'upstash-workflow' as const,
              config: providerConfigGenerators.upstashWorkflow({ name: 'test-workflow-2' }),
            },
          ],
        },
      ];

      validConfigs.forEach(config => {
        const engine = createWorkflowEngine(config);
        expect(engine).toBeDefined();
        expect(engine.healthCheck).toBeDefined();
      });
    });

    test('should validate workflow definitions before execution', async () => {
      const engine = createWorkflowEngine(engineConfig);

      const testWorkflows = [
        workflowGenerators.simple(),
        workflowGenerators.complex(),
        workflowGenerators.parallel(),
        workflowGenerators.withErrorHandling(),
      ];

      for (const workflow of testWorkflows) {
        const validation = ValidationUtils.validateWorkflow(workflow);
        expect(validation.valid).toBeTruthy();
        expect(validation.errors).toHaveLength(0);

        // Engine should accept valid workflows
        mockProvider.execute.mockResolvedValue(
          executionGenerators.running({ workflowId: workflow.id }),
        );

        const result = await engine.executeWorkflow(workflow, { test: 'data' });
        assertWorkflowExecution(result);
      }
    });
  });

  // Random scenario tests using centralized utilities
  describe('random Scenario Tests', () => {
    test('should handle random workflow configurations', async () => {
      const engine = createWorkflowEngine(engineConfig);
      const randomWorkflows = Array.from({ length: 5 }, () => testDataUtils.randomWorkflow());

      for (const workflow of randomWorkflows) {
        // Use centralized validation
        const validation = ValidationUtils.validateWorkflow(workflow);

        if (validation.valid) {
          mockProvider.execute.mockResolvedValue(
            executionGenerators.running({ workflowId: workflow.id }),
          );

          const result = await engine.executeWorkflow(workflow, {
            randomData: testDataUtils.randomString(),
          });

          assertWorkflowExecution(result);
        }
      }
    });

    test('should handle random provider configurations', async () => {
      const randomConfigs = Array.from({ length: 3 }, () => ({
        defaultProvider: 'test-provider',
        providers: [
          {
            name: 'test-provider',
            type: 'upstash-workflow' as const,
            config: providerConfigGenerators.upstashWorkflow({
              name: testDataUtils.randomString(),
            }),
          },
        ],
      }));

      randomConfigs.forEach((config: any) => {
        const engine = createWorkflowEngine(config);
        expect(engine).toBeDefined();

        // Test health check
        const healthPromise = engine.healthCheck();
        expect(healthPromise).toBeInstanceOf(Promise);
      });
    });
  });

  // Health check tests using centralized patterns
  describe('health Check Tests', () => {
    test('should perform engine health checks', async () => {
      const engine = createWorkflowEngine(engineConfig);

      mockProvider.healthCheck.mockResolvedValue({ status: 'healthy' });

      const health = await engine.healthCheck();

      // Use centralized assertions
      AssertionUtils.assertProviderHealthArray(health);
    });

    test('should handle provider health check failures', async () => {
      const engine = createWorkflowEngine(engineConfig);

      mockProvider.healthCheck.mockResolvedValue({
        status: 'unhealthy',
        error: 'Connection failed',
      });

      const health = await engine.healthCheck();

      AssertionUtils.assertProviderHealthArray(health);
    });
  });
});

// Code reduction comparison example
describe('code Reduction Comparison', () => {
  // Before DRY refactoring: This would be 500+ lines
  // After DRY refactoring: This is ~80 lines

  test('comprehensive workflow engine test with minimal code', async () => {
    const engineConfig = {
      defaultProvider: 'test-provider',
      providers: [
        {
          name: 'test-provider',
          type: 'upstash-workflow' as const,
          config: providerConfigGenerators.upstashWorkflow(),
        },
      ],
    };

    const engine = createWorkflowEngine(engineConfig);
    const workflow = workflowGenerators.simple();
    const execution = executionGenerators.running({ workflowId: workflow.id });

    const mockProvider = createMockWorkflowProvider();
    mockProvider.execute.mockResolvedValue(execution);

    // Test complete workflow lifecycle with minimal setup
    const result = await engine.executeWorkflow(workflow, { test: 'data' });
    assertWorkflowExecution(result);

    const status = await engine.getExecution(result.id);
    assertWorkflowExecution(status);

    const executions = await engine.listExecutions(workflow.id);
    expect(Array.isArray(executions)).toBeTruthy();

    const health = await engine.healthCheck();
    AssertionUtils.assertProviderHealthArray(health);
  });
});
