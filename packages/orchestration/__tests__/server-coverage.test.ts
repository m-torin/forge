/**
 * Comprehensive test coverage for server.ts
 * Tests the createWorkflowEngine function and workflow engine functionality
 */

import { beforeEach, describe, expect, vi } from 'vitest';

// Import after mocking
import { createWorkflowEngine, workflowEngine } from '../src/server';

// Mock dependencies before importing
vi.mock('@repo/database/redis/server', () => ({
  redis: {
    ping: vi.fn().mockResolvedValue('PONG'),
    set: vi.fn().mockResolvedValue('OK'),
    get: vi.fn().mockResolvedValue(null),
  },
}));

vi.mock('../src/providers/index', () => ({
  UpstashWorkflowProvider: vi.fn().mockImplementation(() => ({
    setClients: vi.fn(),
    healthCheck: vi.fn().mockResolvedValue({ healthy: true }),
    executeWorkflow: vi.fn().mockResolvedValue({ executionId: 'exec-123' }),
    getExecution: vi.fn().mockResolvedValue({ status: 'completed' }),
    listExecutions: vi.fn().mockResolvedValue([]),
    scheduleWorkflow: vi.fn().mockResolvedValue({ scheduleId: 'sched-123' }),
  })),
  RateLimitProvider: vi.fn(),
}));

vi.mock('../src/shared/utils/index', () => ({
  OrchestrationManager: vi.fn().mockImplementation(() => ({
    executeWorkflow: vi.fn().mockResolvedValue({ executionId: 'exec-123' }),
    getExecution: vi.fn().mockResolvedValue({ status: 'completed' }),
    getStatus: vi.fn().mockReturnValue({ initialized: true }),
    healthCheckAll: vi.fn().mockResolvedValue({ healthy: true }),
    initialize: vi.fn().mockResolvedValue(undefined),
    listExecutions: vi.fn().mockResolvedValue([]),
    registerProvider: vi.fn().mockResolvedValue(undefined),
    scheduleWorkflow: vi.fn().mockResolvedValue({ scheduleId: 'sched-123' }),
    shutdown: vi.fn().mockResolvedValue(undefined),
  })),
  validateWorkflowDefinition: vi.fn().mockImplementation(def => def),
  createOrchestrationError: vi.fn(),
  createProviderError: vi.fn(),
  createWorkflowExecutionError: vi.fn(),
  OrchestrationError: vi.fn(),
  OrchestrationErrorCodes: {},
  ProviderError: vi.fn(),
  validateProviderConfig: vi.fn(),
  withRateLimit: vi.fn(),
  WorkflowExecutionError: vi.fn(),
}));

describe('server Orchestration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createWorkflowEngine', () => {
    test('should create workflow engine with default configuration', () => {
      const engine = createWorkflowEngine();

      expect(engine).toBeDefined();
      expect(engine.executeWorkflow).toBeDefined();
      expect(engine.getExecution).toBeDefined();
      expect(engine.getStatus).toBeDefined();
      expect(engine.healthCheck).toBeDefined();
      expect(engine.initialize).toBeDefined();
      expect(engine.listExecutions).toBeDefined();
      expect(engine.manager).toBeDefined();
      expect(engine.scheduleWorkflow).toBeDefined();
      expect(engine.shutdown).toBeDefined();
    });

    test('should create workflow engine with custom configuration', () => {
      const config = {
        defaultProvider: 'test-provider',
        enableHealthChecks: true,
        enableMetrics: true,
      };

      const engine = createWorkflowEngine(config);

      expect(engine).toBeDefined();
    });

    test('should create workflow engine with providers configuration', () => {
      const config = {
        providers: [
          {
            name: 'upstash-provider',
            type: 'upstash-workflow' as const,
            config: {
              baseUrl: 'https://test.upstash.io',
              qstashToken: 'test-token',
            },
          },
        ],
      };

      const engine = createWorkflowEngine(config);

      expect(engine).toBeDefined();
    });

    test('should handle rate-limit provider type during initialization', async () => {
      const config = {
        providers: [
          {
            name: 'rate-limiter',
            type: 'rate-limit' as const,
            config: {
              maxRequests: 100,
              windowMs: 60000,
            },
          },
        ],
      };

      const engine = createWorkflowEngine(config);

      // This should not throw an error even though rate-limit is skipped
      await expect(engine.initialize()).resolves.toBeUndefined();
    });

    test('should throw error for unknown provider type', async () => {
      const config = {
        providers: [
          {
            name: 'unknown-provider',
            type: 'unknown-type' as any,
            config: {},
          },
        ],
      };

      const engine = createWorkflowEngine(config);

      await expect(engine.initialize()).rejects.toThrow('Unknown provider type: unknown-type');
    });
  });

  describe('workflow Engine Methods', () => {
    let engine: ReturnType<typeof createWorkflowEngine>;

    beforeEach(() => {
      engine = createWorkflowEngine();
    });

    describe('executeWorkflow', () => {
      test('should execute workflow successfully', async () => {
        const definition = {
          id: 'test-workflow',
          name: 'Test Workflow',
          steps: [],
        };
        const input = { key: 'value' };

        const result = await engine.executeWorkflow(definition, input);

        expect(result).toStrictEqual({ executionId: 'exec-123' });
      });

      test('should execute workflow with provider name', async () => {
        const definition = {
          id: 'test-workflow',
          name: 'Test Workflow',
          steps: [],
        };
        const input = { key: 'value' };
        const providerName = 'test-provider';

        const result = await engine.executeWorkflow(definition, input, providerName);

        expect(result).toStrictEqual({ executionId: 'exec-123' });
      });

      test('should execute workflow without input', async () => {
        const definition = {
          id: 'test-workflow',
          name: 'Test Workflow',
          steps: [],
        };

        const result = await engine.executeWorkflow(definition);

        expect(result).toStrictEqual({ executionId: 'exec-123' });
      });
    });

    describe('getExecution', () => {
      test('should get execution by id', async () => {
        const result = await engine.getExecution('exec-123');

        expect(result).toStrictEqual({ status: 'completed' });
      });

      test('should get execution with provider name', async () => {
        const result = await engine.getExecution('exec-123', 'test-provider');

        expect(result).toStrictEqual({ status: 'completed' });
      });
    });

    describe('getStatus', () => {
      test('should return engine status', () => {
        const status = engine.getStatus();

        expect(status).toStrictEqual({ initialized: true });
      });
    });

    describe('healthCheck', () => {
      test('should perform health check', async () => {
        const result = await engine.healthCheck();

        expect(result).toStrictEqual({ healthy: true });
      });
    });

    describe('initialize', () => {
      test('should initialize engine', async () => {
        await expect(engine.initialize()).resolves.toBeUndefined();
      });

      test('should initialize with upstash-workflow provider', async () => {
        const engineWithProvider = createWorkflowEngine({
          providers: [
            {
              name: 'upstash-test',
              type: 'upstash-workflow',
              config: {
                baseUrl: 'https://test.upstash.io',
                qstashToken: 'test-token',
              },
            },
          ],
        });

        await expect(engineWithProvider.initialize()).resolves.toBeUndefined();
      });
    });

    describe('listExecutions', () => {
      test('should list executions', async () => {
        const result = await engine.listExecutions('workflow-123');

        expect(result).toStrictEqual([]);
      });

      test('should list executions with options', async () => {
        const options = { limit: 10, offset: 0 };
        const result = await engine.listExecutions('workflow-123', options);

        expect(result).toStrictEqual([]);
      });

      test('should list executions with provider name', async () => {
        const options = { limit: 10 };
        const result = await engine.listExecutions('workflow-123', options, 'test-provider');

        expect(result).toStrictEqual([]);
      });
    });

    describe('scheduleWorkflow', () => {
      test('should schedule workflow', async () => {
        const definition = {
          id: 'scheduled-workflow',
          name: 'Scheduled Workflow',
          steps: [],
        };

        const result = await engine.scheduleWorkflow(definition);

        expect(result).toStrictEqual({ scheduleId: 'sched-123' });
      });

      test('should schedule workflow with provider name', async () => {
        const definition = {
          id: 'scheduled-workflow',
          name: 'Scheduled Workflow',
          steps: [],
        };

        const result = await engine.scheduleWorkflow(definition, 'test-provider');

        expect(result).toStrictEqual({ scheduleId: 'sched-123' });
      });
    });

    describe('shutdown', () => {
      test('should shutdown engine', async () => {
        await expect(engine.shutdown()).resolves.toBeUndefined();
      });
    });

    describe('manager property', () => {
      test('should expose manager instance', () => {
        expect(engine.manager).toBeDefined();
      });
    });
  });

  describe('default Workflow Engine', () => {
    test('should export default workflow engine instance', () => {
      expect(workflowEngine).toBeDefined();
      expect(workflowEngine.executeWorkflow).toBeDefined();
      expect(workflowEngine.getExecution).toBeDefined();
      expect(workflowEngine.getStatus).toBeDefined();
      expect(workflowEngine.healthCheck).toBeDefined();
      expect(workflowEngine.initialize).toBeDefined();
      expect(workflowEngine.listExecutions).toBeDefined();
      expect(workflowEngine.manager).toBeDefined();
      expect(workflowEngine.scheduleWorkflow).toBeDefined();
      expect(workflowEngine.shutdown).toBeDefined();
    });
  });

  describe('error Handling', () => {
    test('should handle validation errors in executeWorkflow', async () => {
      const { validateWorkflowDefinition } = await import('../src/shared/utils/index');

      // Mock validation to throw an error
      vi.mocked(validateWorkflowDefinition).mockImplementationOnce(() => {
        throw new Error('Validation failed');
      });

      const engine = createWorkflowEngine();
      const definition = { id: 'invalid', name: 'Invalid', steps: [] };

      await expect(engine.executeWorkflow(definition)).rejects.toThrow('Validation failed');
    });

    test('should handle validation errors in scheduleWorkflow', async () => {
      const { validateWorkflowDefinition } = await import('../src/shared/utils/index');

      // Mock validation to throw an error
      vi.mocked(validateWorkflowDefinition).mockImplementationOnce(() => {
        throw new Error('Schedule validation failed');
      });

      const engine = createWorkflowEngine();
      const definition = { id: 'invalid', name: 'Invalid', steps: [] };

      await expect(engine.scheduleWorkflow(definition)).rejects.toThrow(
        'Schedule validation failed',
      );
    });

    test('should handle manager initialization errors', async () => {
      const { OrchestrationManager } = await import('../src/shared/utils/index');

      // Mock manager initialization to fail
      vi.mocked(OrchestrationManager).mockImplementationOnce(
        () =>
          ({
            initialize: vi.fn().mockRejectedValue(new Error('Init failed')),
          }) as any,
      );

      const engine = createWorkflowEngine();

      await expect(engine.initialize()).rejects.toThrow('Init failed');
    });

    test('should handle provider registration errors', async () => {
      const { OrchestrationManager } = await import('../src/shared/utils/index');

      // Mock manager to fail on provider registration
      const mockManager = {
        initialize: vi.fn().mockResolvedValue(undefined),
        registerProvider: vi.fn().mockRejectedValue(new Error('Registration failed')),
      };
      vi.mocked(OrchestrationManager).mockImplementationOnce(() => mockManager as any);

      const config = {
        providers: [
          {
            name: 'failing-provider',
            type: 'upstash-workflow' as const,
            config: {
              baseUrl: 'https://test.upstash.io',
              qstashToken: 'test-token',
            },
          },
        ],
      };

      const engine = createWorkflowEngine(config);

      await expect(engine.initialize()).rejects.toThrow('Registration failed');
    });
  });

  describe('integration Scenarios', () => {
    test('should handle complete workflow lifecycle', async () => {
      const engine = createWorkflowEngine({
        defaultProvider: 'test-provider',
        enableHealthChecks: true,
        enableMetrics: true,
        providers: [
          {
            name: 'test-provider',
            type: 'upstash-workflow',
            config: {
              baseUrl: 'https://test.upstash.io',
              qstashToken: 'test-token',
            },
          },
        ],
      });

      // Initialize
      await engine.initialize();

      // Check health
      const health = await engine.healthCheck();
      expect(health).toStrictEqual({ healthy: true });

      // Execute workflow
      const definition = {
        id: 'integration-test',
        name: 'Integration Test Workflow',
        steps: [],
      };
      const execution = await engine.executeWorkflow(definition, { test: true });
      expect(execution).toStrictEqual({ executionId: 'exec-123' });

      // Get execution status
      const status = await engine.getExecution('exec-123');
      expect(status).toStrictEqual({ status: 'completed' });

      // List executions
      const executions = await engine.listExecutions('integration-test');
      expect(executions).toStrictEqual([]);

      // Schedule workflow
      const schedule = await engine.scheduleWorkflow(definition);
      expect(schedule).toStrictEqual({ scheduleId: 'sched-123' });

      // Get engine status
      const engineStatus = engine.getStatus();
      expect(engineStatus).toStrictEqual({ initialized: true });

      // Shutdown
      await engine.shutdown();
    });

    test('should handle mixed provider types', async () => {
      const config = {
        providers: [
          {
            name: 'upstash-provider',
            type: 'upstash-workflow' as const,
            config: {
              baseUrl: 'https://test.upstash.io',
              qstashToken: 'test-token',
            },
          },
          {
            name: 'rate-limiter',
            type: 'rate-limit' as const,
            config: {
              maxRequests: 100,
              windowMs: 60000,
            },
          },
        ],
      };

      const engine = createWorkflowEngine(config);

      // Should initialize without error despite mixed provider types
      await expect(engine.initialize()).resolves.toBeUndefined();
    });
  });
});
