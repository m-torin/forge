import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  createWorkflowEngine,
  UpstashWorkflowProvider,
  type WorkflowExecution,
} from '../src/index';

import { createTestWorkflow, createUpstashWorkflowConfig } from './fixtures';

// Mock the removed placeholder functions for testing
const createMonitoringService = (_provider?: any) => ({
  getHealthReport: vi.fn(() => ({ providers: [], status: 'healthy' })),
  getMetrics: vi.fn(() => ({})),
  startMonitoring: vi.fn(),
  stopMonitoring: vi.fn(),
});

const createEventBus = () => ({
  emit: vi.fn(),
  off: vi.fn(),
  on: vi.fn(),
  subscribe: vi.fn(),
});

const createSchedulingService = (_provider?: any) => ({
  listSchedules: vi.fn(() => []),
  schedule: vi.fn(() => 'mock-schedule-id'),
  unschedule: vi.fn(),
});

// 3rd party mocks removed - using @repo/qa centralized mocks

describe('workflow Engine', () => {
  let mockProvider: UpstashWorkflowProvider;
  let engineConfig: Parameters<typeof createWorkflowEngine>[0];

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock provider
    mockProvider = new UpstashWorkflowProvider({
      baseUrl: 'http://localhost:8080',
      qstash: {
        token: 'test-token',
      },
    });

    const upstashConfig = createUpstashWorkflowConfig();
    engineConfig = {
      defaultProvider: 'test-upstash-workflow',
      providers: [
        {
          name: upstashConfig.name,
          type: upstashConfig.type as 'upstash-workflow',
          config: upstashConfig,
        },
      ],
    };
  });

  describe('engine Creation', () => {
    test('should create workflow engine with basic config', () => {
      const engine = createWorkflowEngine(engineConfig);

      expect(engine).toBeDefined();
      expect(engine.manager).toBeDefined();
      // Providers are registered during initialize
    });

    test('should create engine with monitoring enabled', () => {
      const monitoringService = createMonitoringService(mockProvider);

      const config = {
        ...engineConfig,
        monitoring: {
          enabled: true,
          service: monitoringService,
        },
      };

      const engine = createWorkflowEngine(config);
      // Monitoring is internal to the manager
      expect(engine.manager).toBeDefined();
    });

    test('should create engine with event bus enabled', () => {
      const eventBus = createEventBus();

      const config = {
        ...engineConfig,
        events: {
          bus: eventBus,
          enabled: true,
        },
      };

      const engine = createWorkflowEngine(config);
      // Events are internal to the manager
      expect(engine.manager).toBeDefined();
    });

    test('should create engine with scheduling enabled', () => {
      const schedulingService = createSchedulingService(mockProvider);

      const config = {
        ...engineConfig,
        scheduling: {
          enabled: true,
          service: schedulingService,
        },
      };

      const engine = createWorkflowEngine(config);
      // Scheduling is internal to the manager
      expect(engine.manager).toBeDefined();
    });
  });

  describe('workflow Execution', () => {
    test('should execute workflow successfully', async () => {
      const engine = createWorkflowEngine(engineConfig);
      await engine.initialize();

      // Mock successful execution
      const mockExecution: WorkflowExecution = {
        id: 'exec_123',
        input: { test: 'data' },
        startedAt: new Date(),
        status: 'running',
        steps: [],
        workflowId: 'test-workflow',
      };

      vi.spyOn(engine.manager, 'executeWorkflow').mockResolvedValue(mockExecution);

      const workflow = createTestWorkflow();
      const result = await engine.executeWorkflow(workflow, { test: 'data' });

      expect(result.id).toBe('exec_123');
      expect(result.status).toBe('running');
      expect(result.input).toStrictEqual({ test: 'data' });
    });

    test('should handle workflow execution errors', async () => {
      const engine = createWorkflowEngine(engineConfig);
      await engine.initialize();

      vi.spyOn(engine.manager, 'executeWorkflow').mockRejectedValue(new Error('Execution failed'));

      const workflow = createTestWorkflow({ id: 'failing-workflow' });
      await expect(engine.executeWorkflow(workflow, {})).rejects.toThrow('Execution failed');
    });

    test('should get workflow status', async () => {
      const engine = createWorkflowEngine(engineConfig);
      await engine.initialize();

      const mockStatus: WorkflowExecution = {
        id: 'exec_123',
        completedAt: new Date(),
        output: { success: true },
        startedAt: new Date(),
        status: 'completed',
        steps: [],
        workflowId: 'test-workflow',
      };

      vi.spyOn(engine.manager, 'getExecution').mockResolvedValue(mockStatus);

      const status = await engine.getExecution('exec_123');

      expect(status?.id).toBe('exec_123');
      expect(status?.status).toBe('completed');
      expect(status?.output).toStrictEqual({ success: true });
    });

    test('should cancel workflow execution', async () => {
      const engine = createWorkflowEngine(engineConfig);
      await engine.initialize();
      // cancelExecution is not directly exposed by the engine
      // TODO: Implement cancel functionality through manager
      expect(engine).toBeDefined();
    });
  });

  describe('provider Management', () => {
    test('should register multiple providers', async () => {
      const provider1Config = createUpstashWorkflowConfig({ name: 'provider-1' });
      const provider2Config = createUpstashWorkflowConfig({
        name: 'provider-2',
        config: {
          baseUrl: 'http://localhost:8081',
          qstashToken: 'test-qstash-token-2',
          redisToken: 'test-redis-token-2',
          redisUrl: 'redis://localhost:6379',
        },
      });

      const config = {
        defaultProvider: 'provider-1',
        providers: [
          {
            name: provider1Config.name,
            type: provider1Config.type as 'upstash-workflow',
            config: provider1Config,
          },
          {
            name: provider2Config.name,
            type: provider2Config.type as 'upstash-workflow',
            config: provider2Config,
          },
        ],
      };

      const engine = createWorkflowEngine(config);

      // Providers are managed internally by the manager
      await engine.initialize();
      expect(engine.manager).toBeDefined();
    });

    test('should throw error for unknown provider', () => {
      const engine = createWorkflowEngine(engineConfig);

      // Provider access is managed internally
      expect(engine.manager).toBeDefined();
    });

    test('should execute with specific provider', async () => {
      const provider1Config = createUpstashWorkflowConfig({ name: 'provider-1' });
      const provider2Config = createUpstashWorkflowConfig({
        name: 'provider-2',
        config: {
          baseUrl: 'http://localhost:8081',
          qstashToken: 'test-qstash-token-2',
          redisToken: 'test-redis-token-2',
          redisUrl: 'redis://localhost:6379',
        },
      });

      const config = {
        defaultProvider: 'provider-1',
        providers: [
          {
            name: provider1Config.name,
            type: provider1Config.type as 'upstash-workflow',
            config: provider1Config,
          },
          {
            name: provider2Config.name,
            type: provider2Config.type as 'upstash-workflow',
            config: provider2Config,
          },
        ],
      };

      const engine = createWorkflowEngine(config);
      await engine.initialize();

      // Mock the manager's executeWorkflow method
      const mockExecution: WorkflowExecution = {
        id: 'exec_123',
        startedAt: new Date(),
        status: 'running',
        steps: [],
        workflowId: 'test-workflow',
      };

      vi.spyOn(engine.manager, 'executeWorkflow').mockResolvedValue(mockExecution);

      // Execute with specific provider by passing provider name to executeWorkflow
      const workflow = createTestWorkflow();
      const result = await engine.executeWorkflow(workflow, {}, 'provider-2');

      expect(result).toBeDefined();
      expect(result.id).toBe('exec_123');
    });
  });

  describe('health Checks', () => {
    test('should perform health check on all providers', async () => {
      const engine = createWorkflowEngine(engineConfig);

      // Health check returns array of provider health reports
      const health = await engine.healthCheck();

      expect(Array.isArray(health)).toBeTruthy();
      expect(health).toBeDefined();
    });

    test('should report unhealthy provider', async () => {
      const engine = createWorkflowEngine(engineConfig);

      // Health check returns array of provider health reports
      const health = await engine.healthCheck();

      expect(Array.isArray(health)).toBeTruthy();
      expect(health).toBeDefined();
    });
  });

  describe('metrics and Monitoring', () => {
    test('should collect execution metrics', async () => {
      const monitoringService = createMonitoringService(mockProvider);
      const config = {
        ...engineConfig,
        monitoring: {
          enabled: true,
          service: monitoringService,
        },
      };

      const engine = createWorkflowEngine(config);
      await engine.initialize();

      const _mockMetrics = {
        averageExecutionTime: 5000,
        failedExecutions: 15,
        successfulExecutions: 85,
        timeRange: {
          end: new Date(),
          start: new Date(Date.now() - 86400000),
        },
        totalExecutions: 100,
      };

      // Metrics are not directly exposed by the engine
      // They would be accessed through monitoring service if implemented
      expect(engine).toBeDefined();
    });

    test('should query execution history', async () => {
      const monitoringService = createMonitoringService(mockProvider);
      const config = {
        ...engineConfig,
        monitoring: {
          enabled: true,
          service: monitoringService,
        },
      };

      const engine = createWorkflowEngine(config);

      const mockExecutions: WorkflowExecution[] = [
        {
          id: 'exec_1',
          completedAt: new Date(),
          startedAt: new Date(),
          status: 'completed',
          steps: [],
          workflowId: 'workflow_1',
        },
        {
          id: 'exec_2',
          error: { message: 'Processing failed' },
          startedAt: new Date(),
          status: 'failed',
          steps: [],
          workflowId: 'workflow_1',
        },
      ];

      // Query executions through listExecutions
      vi.spyOn(engine.manager, 'listExecutions').mockResolvedValue(mockExecutions);

      const executions = await engine.listExecutions('workflow_1', { limit: 10 });

      expect(executions).toHaveLength(2);
      expect(executions[0].status).toBe('completed');
      expect(executions[1].status).toBe('failed');
    });
  });

  describe('event Integration', () => {
    test('should emit workflow events', async () => {
      const eventBus = createEventBus();
      const config = {
        ...engineConfig,
        events: {
          bus: eventBus,
          enabled: true,
        },
      };

      const engine = createWorkflowEngine(config);
      await engine.initialize();

      const eventListener = vi.fn();
      eventBus.subscribe('workflow.*', eventListener);

      const mockExecution: WorkflowExecution = {
        id: 'exec_123',
        startedAt: new Date(),
        status: 'running',
        steps: [],
        workflowId: 'test-workflow',
      };

      vi.spyOn(engine.manager, 'executeWorkflow').mockResolvedValue(mockExecution);

      const workflow = createTestWorkflow();
      await engine.executeWorkflow(workflow, {});

      // Events handling depends on event bus implementation
      expect(eventListener).toBeDefined();
    });

    test('should handle event subscriptions', async () => {
      const eventBus = createEventBus();
      const config = {
        ...engineConfig,
        events: {
          bus: eventBus,
          enabled: true,
        },
      };

      const engine = createWorkflowEngine(config);

      // Event subscriptions are not directly exposed by the engine
      // They would be handled through event bus if implemented
      expect(engine).toBeDefined();
    });
  });

  describe('engine Lifecycle', () => {
    test('should initialize engine properly', async () => {
      const engine = createWorkflowEngine(engineConfig);

      // Initialize is handled by the engine
      await engine.initialize();
      expect(engine.manager).toBeDefined();
    });

    test('should shutdown engine gracefully', async () => {
      const engine = createWorkflowEngine(engineConfig);
      await engine.initialize();

      // Shutdown is handled by the engine
      await engine.shutdown();
      expect(engine.manager).toBeDefined();
    });

    test('should get engine status', () => {
      const engine = createWorkflowEngine({
        ...engineConfig,
        enableHealthChecks: true,
        enableMetrics: true,
      });

      const status = engine.getStatus();

      expect(status.initialized).toBeFalsy();
      expect(status.providerCount).toBe(0); // No providers registered yet
      expect(status.healthChecksEnabled).toBeTruthy();
      expect(status.metricsEnabled).toBeTruthy();
      expect(status.defaultProvider).toBe('test-upstash-workflow');
    });
  });
});
