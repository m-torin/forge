/**
 * Upstash Workflow Provider Refactored Tests
 *
 * Demonstrates the DRY refactoring for provider-specific tests.
 * Shows how the new test factory patterns dramatically reduce code duplication.
 */

import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

// Import centralized DRY utilities
import { createMockQStashProvider, createMockRedisProvider } from '../setup';
import {
  executionGenerators,
  providerConfigGenerators,
  testDataUtils,
  workflowGenerators,
} from '../test-data-generators';
import { TestUtils, ValidationUtils } from '../test-utils';
import {
  assertProviderHealth,
  assertWorkflowExecution,
  createProviderScenarios,
  createProviderTestSuite,
  testModuleImport,
} from '../workflow-test-factory';

// Import from @repo/qa for centralized mocking
import { resetCombinedUpstashMocks, setupCombinedUpstashMocks } from '@repo/qa';

// Import types
import type { WorkflowExecutionStatus } from '../../src/shared/types/workflow';

// Set test environment before importing anything
vi.stubEnv('NODE_ENV', 'test');
vi.stubEnv('VITEST', 'true');

// Set up mocks before importing the provider
let mocks: ReturnType<typeof setupCombinedUpstashMocks>;

beforeAll(() => {
  mocks = setupCombinedUpstashMocks();
});

describe('upstash Workflow Provider - DRY Refactored', () => {
  let provider: any;
  let UpstashWorkflowProvider: any;

  beforeEach(async () => {
    // Reset mocks properly using centralized utilities
    resetCombinedUpstashMocks(mocks);

    // Use centralized mock setup
    const mockRedis = createMockRedisProvider();
    const mockQStash = createMockQStashProvider();

    // Enhanced mock implementations with storage backing
    const storage = new Map<string, string>();
    const zsetStorage = new Map<string, Map<string, number>>();

    mocks.redis.set.mockImplementation(async (key: string, value: string) => {
      storage.set(key, value);
      return 'OK';
    });

    mocks.redis.get.mockImplementation(async (key: string) => {
      return storage.get(key) || null;
    });

    mocks.redis.zadd.mockImplementation(async (key: string, scoreMembers: any) => {
      if (!zsetStorage.has(key)) {
        zsetStorage.set(key, new Map());
      }
      const zset = zsetStorage.get(key)!;
      if (Array.isArray(scoreMembers)) {
        for (let i = 0; i < scoreMembers.length; i += 2) {
          const score = scoreMembers[i];
          const member = scoreMembers[i + 1];
          zset.set(member, score);
        }
      }
      return 1;
    });

    // Dynamic import with centralized error handling
    const module = await testModuleImport(
      () => import('../../src/providers/upstash-workflow/provider'),
      ['UpstashWorkflowProvider'],
    );

    UpstashWorkflowProvider = module.UpstashWorkflowProvider;

    // Use centralized configuration generation
    const config = providerConfigGenerators.upstashWorkflow();
    provider = new UpstashWorkflowProvider(config.config);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Use centralized provider test suite
  createProviderTestSuite({
    providerName: 'Upstash Workflow Provider',
    providerType: 'upstash-workflow',
    providerFactory: () => provider,
    scenarios: createProviderScenarios().upstashWorkflow,
  });

  // Workflow execution tests using centralized patterns
  describe('workflow Execution Tests', () => {
    const workflowExecutionTests = [
      {
        name: 'simple workflow',
        workflow: workflowGenerators.simple(),
        input: { test: 'data' },
        expectedStatus: 'running',
      },
      {
        name: 'complex workflow',
        workflow: workflowGenerators.complex(),
        input: { complex: true, data: [1, 2, 3] },
        expectedStatus: 'running',
      },
      {
        name: 'parallel workflow',
        workflow: workflowGenerators.parallel(),
        input: { parallel: true },
        expectedStatus: 'running',
      },
    ];

    TestUtils.suites.createParameterizedTests(
      'Execute Workflow Scenarios',
      async ({ workflow, input, expectedStatus }) => {
        // Use centralized validation
        const validation = ValidationUtils.validateWorkflow(workflow);
        expect(validation.valid).toBeTruthy();

        // Mock successful execution
        const mockExecution = executionGenerators.running({
          workflowId: workflow.id,
          status: expectedStatus as WorkflowExecutionStatus,
        });

        mocks.qstash.publishJSON.mockResolvedValue({
          messageId: `msg_${workflow.id}`,
        });

        const result = await provider.execute(workflow, input);

        // Use centralized assertions
        assertWorkflowExecution(result, expectedStatus);
        expect(result.workflowId).toBe(workflow.id);
      },
      workflowExecutionTests.map(test => ({
        name: `should execute ${test.name}`,
        params: test,
      })),
    );

    test('should handle execution errors gracefully', async () => {
      const workflow = workflowGenerators.simple();

      mocks.qstash.publishJSON.mockRejectedValue(new Error('QStash error'));

      await TestUtils.errors.expectError(async () => {
        await provider.execute(workflow.id, { test: 'data' });
      }, 'QStash error');
    });

    test('should validate workflow before execution', async () => {
      const invalidWorkflow = workflowGenerators.invalid();

      await TestUtils.errors.expectError(async () => {
        await provider.execute(invalidWorkflow.id, { test: 'data' });
      }, 'Invalid workflow');
    });
  });

  // Execution management tests using centralized patterns
  describe('execution Management Tests', () => {
    test('should get execution status', async () => {
      const execution = executionGenerators.running();

      mocks.redis.get.mockResolvedValue(JSON.stringify(execution));

      const result = await provider.getExecution(execution.id);

      // Use centralized assertions
      assertWorkflowExecution(result);
      expect(result.id).toBe(execution.id);
    });

    test('should list executions', async () => {
      const executions = [
        executionGenerators.running(),
        executionGenerators.completed(),
        executionGenerators.failed(),
      ];

      mocks.redis.zrange.mockResolvedValue(executions.map(e => e.id));

      // Mock individual execution fetches
      executions.forEach(execution => {
        mocks.redis.get.mockResolvedValueOnce(JSON.stringify(execution));
      });

      const result = await provider.listExecutions();

      expect(Array.isArray(result)).toBeTruthy();
      expect(result).toHaveLength(3);

      result.forEach((execution: any) => {
        assertWorkflowExecution(execution);
      });
    });

    test('should cancel execution', async () => {
      const execution = executionGenerators.running();
      const cancelledExecution = executionGenerators.cancelled({ id: execution.id });

      mocks.redis.get.mockResolvedValue(JSON.stringify(execution));
      mocks.redis.set.mockResolvedValue('OK');

      const result = await provider.cancelExecution(execution.id);

      assertWorkflowExecution(result, 'cancelled');
      expect(result.id).toBe(execution.id);
    });
  });

  // Scheduling tests using centralized patterns
  describe('scheduling Tests', () => {
    test('should schedule workflow', async () => {
      const workflow = workflowGenerators.simple();
      const scheduleConfig = {
        cron: '0 9 * * *',
        timezone: 'UTC',
      };

      mocks.qstash.schedules.create.mockResolvedValue({
        scheduleId: 'schedule_123',
      });

      const result = await provider.scheduleWorkflow(workflow.id, scheduleConfig);

      expect(result.scheduleId).toBe('schedule_123');
      expect(mocks.qstash.schedules.create).toHaveBeenCalledWith(
        expect.objectContaining({
          cron: scheduleConfig.cron,
        }),
      );
    });

    test('should unschedule workflow', async () => {
      const scheduleId = 'schedule_123';

      mocks.qstash.schedules.delete.mockResolvedValue({ success: true });

      const result = await provider.unscheduleWorkflow(scheduleId);

      expect(result.success).toBeTruthy();
      expect(mocks.qstash.schedules.delete).toHaveBeenCalledWith(scheduleId);
    });
  });

  // Performance tests using centralized utilities
  describe('performance Tests', () => {
    test('should handle high-volume executions', async () => {
      const workflows = Array.from({ length: 50 }, () => workflowGenerators.simple());

      const benchmark = await TestUtils.performance.benchmark(
        async () => {
          mocks.qstash.publishJSON.mockResolvedValue({
            messageId: 'msg_batch',
          });

          const executions = await Promise.all(
            workflows.map(workflow => provider.execute(workflow.id, { test: 'data' })),
          );

          return executions;
        },
        3, // 3 iterations
      );

      expect(benchmark.average).toBeLessThan(2000); // Max 2 seconds average
      expect(benchmark.results).toHaveLength(3);
    });

    test('should handle large workflow definitions', async () => {
      const largeWorkflow = workflowGenerators.large(200); // 200 steps

      const result = await TestUtils.performance.testPerformance(
        async () => {
          mocks.qstash.publishJSON.mockResolvedValue({
            messageId: 'msg_large',
          });

          return await provider.execute(largeWorkflow.id, {
            largeData: Array.from({ length: 1000 }, (_, i) => ({ id: i })),
          });
        },
        3000, // Max 3 seconds
      );

      expect(result.duration).toBeLessThan(3000);
      assertWorkflowExecution(result.result);
    });
  });

  // Error handling tests using centralized utilities
  describe('error Handling Tests', () => {
    const errorScenarios = [
      {
        name: 'QStash connection error',
        setup: () => {
          mocks.qstash.publishJSON.mockRejectedValue(new Error('Connection failed'));
        },
        expectedError: 'Connection failed',
      },
      {
        name: 'Redis storage error',
        setup: () => {
          mocks.redis.set.mockRejectedValue(new Error('Redis error'));
        },
        expectedError: 'Redis error',
      },
      {
        name: 'Invalid configuration',
        setup: () => {
          // Create provider with invalid config
          const invalidProvider = new UpstashWorkflowProvider({
            qstashToken: '',
            redisUrl: 'invalid-url',
          });
          provider = invalidProvider;
        },
        expectedError: 'Invalid configuration',
      },
    ];

    TestUtils.suites.createParameterizedTests(
      'Error Handling Scenarios',
      async ({ setup, expectedError }) => {
        setup();

        const workflow = workflowGenerators.simple();

        await TestUtils.errors.expectError(async () => {
          await provider.execute(workflow.id, { test: 'data' });
        }, expectedError);
      },
      errorScenarios.map(scenario => ({
        name: `should handle ${scenario.name}`,
        params: scenario,
      })),
    );
  });

  // Health check tests using centralized patterns
  describe('health Check Tests', () => {
    test('should perform health check', async () => {
      mocks.redis.ping.mockResolvedValue('PONG');
      mocks.qstash.publishJSON.mockResolvedValue({ messageId: 'health_check' });

      const health = await provider.healthCheck();

      // Use centralized assertions
      assertProviderHealth(health, 'healthy');
    });

    test('should detect unhealthy state', async () => {
      mocks.redis.ping.mockRejectedValue(new Error('Redis connection failed'));

      const health = await provider.healthCheck();

      assertProviderHealth(health, 'unhealthy');
      expect(health.error).toContain('Redis connection failed');
    });
  });

  // Integration tests using centralized patterns
  describe('integration Tests', () => {
    test('should integrate with workflow engine', async () => {
      const workflow = workflowGenerators.simple();
      const execution = executionGenerators.running({ workflowId: workflow.id });

      mocks.qstash.publishJSON.mockResolvedValue({
        messageId: `msg_${workflow.id}`,
      });

      mocks.redis.get.mockResolvedValue(JSON.stringify(execution));

      // Execute workflow
      const executeResult = await provider.execute(workflow.id, { test: 'data' });
      assertWorkflowExecution(executeResult);

      // Get execution status
      const statusResult = await provider.getExecution(executeResult.id);
      assertWorkflowExecution(statusResult);

      // Verify integration
      expect(executeResult.workflowId).toBe(workflow.id);
      expect(statusResult.id).toBe(executeResult.id);
    });
  });

  // Random scenario tests using centralized utilities
  describe('random Scenario Tests', () => {
    test('should handle random workflow configurations', async () => {
      const randomWorkflows = Array.from({ length: 10 }, () => testDataUtils.randomWorkflow());

      for (const workflow of randomWorkflows) {
        const validation = ValidationUtils.validateWorkflow(workflow);

        if (validation.valid) {
          mocks.qstash.publishJSON.mockResolvedValue({
            messageId: `msg_${workflow.id}`,
          });

          const result = await provider.execute(workflow.id, {
            randomData: testDataUtils.randomString(),
          });

          assertWorkflowExecution(result);
          expect(result.workflowId).toBe(workflow.id);
        }
      }
    });
  });
});

// Code reduction comparison example
describe('code Reduction Comparison', () => {
  // Before DRY refactoring: This would be 600+ lines
  // After DRY refactoring: This is ~100 lines

  test('comprehensive provider test with minimal code', async () => {
    // Reset mocks
    resetCombinedUpstashMocks(mocks);

    // Use centralized setup
    const config = providerConfigGenerators.upstashWorkflow();
    const module = await testModuleImport(
      () => import('../../src/providers/upstash-workflow/provider'),
      ['UpstashWorkflowProvider'],
    );

    const provider = new module.UpstashWorkflowProvider({
      qstash: {
        token: config.config.qstashToken,
      },
      baseUrl: config.config.baseUrl,
    });
    const workflow = workflowGenerators.simple();
    const execution = executionGenerators.running({ workflowId: workflow.id });

    // Mock successful operations
    mocks.qstash.publishJSON.mockResolvedValue({ messageId: 'msg_test' });
    mocks.redis.get.mockResolvedValue(JSON.stringify(execution));
    mocks.redis.set.mockResolvedValue('OK');
    mocks.redis.ping.mockResolvedValue('PONG');

    // Test complete provider functionality with minimal setup
    const executeResult = await provider.execute(workflow, { test: 'data' });
    assertWorkflowExecution(executeResult);

    const statusResult = await provider.getExecution(executeResult.id);
    assertWorkflowExecution(statusResult);

    const listResult = await provider.listExecutions(workflow.id);
    expect(Array.isArray(listResult)).toBeTruthy();

    const health = await provider.healthCheck();
    assertProviderHealth(health);
  });
});
