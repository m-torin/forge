import { describe, test, expect, beforeEach, vi } from 'vitest';
import {
  createWorkflowEngine,
  UpstashWorkflowProvider,
  type WorkflowEngineConfig,
  type WorkflowExecution,
} from '../src/index';

// Mock the removed placeholder functions for testing
const createMonitoringService = () => ({
  startMonitoring: vi.fn(),
  stopMonitoring: vi.fn(),
  getMetrics: vi.fn(() => ({})),
  getHealthReport: vi.fn(() => ({ status: 'healthy', providers: [] })),
});

const createEventBus = () => ({
  subscribe: vi.fn(),
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
});

const createSchedulingService = () => ({
  schedule: vi.fn(() => 'mock-schedule-id'),
  unschedule: vi.fn(),
  listSchedules: vi.fn(() => []),
});

// Mock Upstash dependencies
vi.mock('@upstash/workflow', () => ({
  serve: vi.fn(),
  Client: vi.fn(() => ({
    run: vi.fn(),
    cancel: vi.fn(),
    getResult: vi.fn(),
  })),
}));

vi.mock('@upstash/qstash', () => ({
  Client: vi.fn(() => ({
    publishJSON: vi.fn(),
    schedule: vi.fn(),
  })),
}));

vi.mock('@upstash/redis', () => ({
  Redis: vi.fn(() => ({
    set: vi.fn(),
    get: vi.fn(),
    del: vi.fn(),
  })),
}));

describe('Workflow Engine', () => {
  let mockProvider: UpstashWorkflowProvider;
  let engineConfig: WorkflowEngineConfig;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock provider
    mockProvider = new UpstashWorkflowProvider({
      workflowUrl: 'http://localhost:8080',
      qstashToken: 'test-token',
    });

    engineConfig = {
      providers: [
        {
          name: 'test-provider',
          type: 'upstash-workflow',
          config: {
            workflowUrl: 'http://localhost:8080',
            qstashToken: 'test-token',
          },
        },
      ],
      defaultProvider: 'test-provider',
    };
  });

  describe('Engine Creation', () => {
    test('should create workflow engine with basic config', () => {
      const engine = createWorkflowEngine(engineConfig);

      expect(engine).toBeDefined();
      expect(engine.getProviders()).toHaveLength(1);
      expect(engine.getProviders()[0].name).toBe('test-provider');
    });

    test('should create engine with monitoring enabled', () => {
      const monitoringService = createMonitoringService(mockProvider);

      const config: WorkflowEngineConfig = {
        ...engineConfig,
        monitoring: {
          enabled: true,
          service: monitoringService,
        },
      };

      const engine = createWorkflowEngine(config);
      expect(engine.getMonitoringService()).toBe(monitoringService);
    });

    test('should create engine with event bus enabled', () => {
      const eventBus = createEventBus();

      const config: WorkflowEngineConfig = {
        ...engineConfig,
        events: {
          enabled: true,
          bus: eventBus,
        },
      };

      const engine = createWorkflowEngine(config);
      expect(engine.getEventBus()).toBe(eventBus);
    });

    test('should create engine with scheduling enabled', () => {
      const schedulingService = createSchedulingService(mockProvider);

      const config: WorkflowEngineConfig = {
        ...engineConfig,
        scheduling: {
          enabled: true,
          service: schedulingService,
        },
      };

      const engine = createWorkflowEngine(config);
      expect(engine.getSchedulingService()).toBe(schedulingService);
    });
  });

  describe('Workflow Execution', () => {
    test('should execute workflow successfully', async () => {
      const engine = createWorkflowEngine(engineConfig);
      await engine.initialize();

      // Mock successful execution
      const mockExecution: WorkflowExecution = {
        id: 'exec_123',
        workflowId: 'test-workflow',
        status: 'running',
        startTime: new Date(),
        input: { test: 'data' },
      };

      vi.spyOn(mockProvider, 'execute').mockResolvedValue(mockExecution);

      const result = await engine.execute('test-workflow', { test: 'data' });

      expect(result.id).toBe('exec_123');
      expect(result.status).toBe('running');
      expect(result.input).toEqual({ test: 'data' });
    });

    test('should handle workflow execution errors', async () => {
      const engine = createWorkflowEngine(engineConfig);
      await engine.initialize();

      vi.spyOn(mockProvider, 'execute').mockRejectedValue(new Error('Execution failed'));

      await expect(engine.execute('failing-workflow', {})).rejects.toThrow('Execution failed');
    });

    test('should get workflow status', async () => {
      const engine = createWorkflowEngine(engineConfig);
      await engine.initialize();

      const mockStatus: WorkflowExecution = {
        id: 'exec_123',
        workflowId: 'test-workflow',
        status: 'completed',
        startTime: new Date(),
        endTime: new Date(),
        result: { success: true },
      };

      vi.spyOn(mockProvider, 'getExecution').mockResolvedValue(mockStatus);

      const status = await engine.getExecutionStatus('exec_123');

      expect(status.id).toBe('exec_123');
      expect(status.status).toBe('completed');
      expect(status.result).toEqual({ success: true });
    });

    test('should cancel workflow execution', async () => {
      const engine = createWorkflowEngine(engineConfig);
      await engine.initialize();

      vi.spyOn(mockProvider, 'cancel').mockResolvedValue(true);

      const result = await engine.cancelExecution('exec_123');
      expect(result).toBe(true);
    });
  });

  describe('Provider Management', () => {
    test('should register multiple providers', () => {
      const config: WorkflowEngineConfig = {
        providers: [
          {
            name: 'provider-1',
            type: 'upstash-workflow',
            config: { workflowUrl: 'http://localhost:8080', qstashToken: 'token1' },
          },
          {
            name: 'provider-2',
            type: 'upstash-workflow',
            config: { workflowUrl: 'http://localhost:8081', qstashToken: 'token2' },
          },
        ],
        defaultProvider: 'provider-1',
      };

      const engine = createWorkflowEngine(config);

      expect(engine.getProviders()).toHaveLength(2);
      expect(engine.getProvider('provider-1')).toBeDefined();
      expect(engine.getProvider('provider-2')).toBeDefined();
      expect(engine.getDefaultProvider().name).toBe('provider-1');
    });

    test('should throw error for unknown provider', () => {
      const engine = createWorkflowEngine(engineConfig);

      expect(() => engine.getProvider('unknown')).toThrow('Provider unknown not found');
    });

    test('should execute with specific provider', async () => {
      const config: WorkflowEngineConfig = {
        providers: [
          {
            name: 'provider-1',
            type: 'upstash-workflow',
            config: { workflowUrl: 'http://localhost:8080', qstashToken: 'token1' },
          },
          {
            name: 'provider-2',
            type: 'upstash-workflow',
            config: { workflowUrl: 'http://localhost:8081', qstashToken: 'token2' },
          },
        ],
        defaultProvider: 'provider-1',
      };

      const engine = createWorkflowEngine(config);
      await engine.initialize();

      const provider2 = engine.getProvider('provider-2');
      vi.spyOn(provider2.implementation, 'execute').mockResolvedValue({
        id: 'exec_provider2',
        workflowId: 'test',
        status: 'running',
        startTime: new Date(),
      });

      const result = await engine.executeWithProvider('provider-2', 'test-workflow', {});
      expect(result.id).toBe('exec_provider2');
    });
  });

  describe('Health Checks', () => {
    test('should perform health check on all providers', async () => {
      const engine = createWorkflowEngine(engineConfig);

      vi.spyOn(mockProvider, 'healthCheck').mockResolvedValue({
        healthy: true,
        timestamp: new Date(),
        details: { uptime: 1000 },
      });

      const health = await engine.healthCheck();

      expect(health.overall).toBe(true);
      expect(health.providers).toHaveLength(1);
      expect(health.providers[0].healthy).toBe(true);
    });

    test('should report unhealthy provider', async () => {
      const engine = createWorkflowEngine(engineConfig);

      vi.spyOn(mockProvider, 'healthCheck').mockResolvedValue({
        healthy: false,
        timestamp: new Date(),
        error: 'Connection failed',
      });

      const health = await engine.healthCheck();

      expect(health.overall).toBe(false);
      expect(health.providers[0].healthy).toBe(false);
      expect(health.providers[0].error).toBe('Connection failed');
    });
  });

  describe('Metrics and Monitoring', () => {
    test('should collect execution metrics', async () => {
      const monitoringService = createMonitoringService(mockProvider);
      const config: WorkflowEngineConfig = {
        ...engineConfig,
        monitoring: {
          enabled: true,
          service: monitoringService,
        },
      };

      const engine = createWorkflowEngine(config);
      await engine.initialize();

      const mockMetrics = {
        totalExecutions: 100,
        successfulExecutions: 85,
        failedExecutions: 15,
        averageExecutionTime: 5000,
        timeRange: {
          start: new Date(Date.now() - 86400000),
          end: new Date(),
        },
      };

      vi.spyOn(monitoringService, 'getMetrics').mockResolvedValue(mockMetrics);

      const metrics = await engine.getMetrics();
      expect(metrics.totalExecutions).toBe(100);
      expect(metrics.successfulExecutions).toBe(85);
      expect(metrics.averageExecutionTime).toBe(5000);
    });

    test('should query execution history', async () => {
      const monitoringService = createMonitoringService(mockProvider);
      const config: WorkflowEngineConfig = {
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
          workflowId: 'workflow_1',
          status: 'completed',
          startTime: new Date(),
          endTime: new Date(),
        },
        {
          id: 'exec_2',
          workflowId: 'workflow_1',
          status: 'failed',
          startTime: new Date(),
          error: 'Processing failed',
        },
      ];

      vi.spyOn(monitoringService, 'queryExecutions').mockResolvedValue(mockExecutions);

      const executions = await engine.queryExecutions({
        workflowId: 'workflow_1',
        limit: 10,
      });

      expect(executions).toHaveLength(2);
      expect(executions[0].status).toBe('completed');
      expect(executions[1].status).toBe('failed');
    });
  });

  describe('Event Integration', () => {
    test('should emit workflow events', async () => {
      const eventBus = createEventBus();
      const config: WorkflowEngineConfig = {
        ...engineConfig,
        events: {
          enabled: true,
          bus: eventBus,
        },
      };

      const engine = createWorkflowEngine(config);
      await engine.initialize();

      const eventListener = vi.fn();
      eventBus.subscribe('workflow.*', eventListener);

      const mockExecution: WorkflowExecution = {
        id: 'exec_123',
        workflowId: 'test-workflow',
        status: 'running',
        startTime: new Date(),
      };

      vi.spyOn(mockProvider, 'execute').mockResolvedValue(mockExecution);

      await engine.execute('test-workflow', {});

      // Events should be emitted
      expect(eventListener).toHaveBeenCalled();
    });

    test('should handle event subscriptions', async () => {
      const eventBus = createEventBus();
      const config: WorkflowEngineConfig = {
        ...engineConfig,
        events: {
          enabled: true,
          bus: eventBus,
        },
      };

      const engine = createWorkflowEngine(config);

      let receivedEvent: any = null;
      const subscription = await engine.subscribeToEvents({
        id: 'test-subscription',
        patterns: [{ type: 'workflow.completed' }],
        workflowId: 'event-handler',
      });

      expect(subscription.id).toBe('test-subscription');
      expect(subscription.patterns).toEqual([{ type: 'workflow.completed' }]);
    });
  });

  describe('Engine Lifecycle', () => {
    test('should initialize engine properly', async () => {
      const engine = createWorkflowEngine(engineConfig);

      vi.spyOn(mockProvider, 'initialize').mockResolvedValue(undefined);

      await engine.initialize();
      expect(mockProvider.initialize).toHaveBeenCalled();
    });

    test('should shutdown engine gracefully', async () => {
      const engine = createWorkflowEngine(engineConfig);
      await engine.initialize();

      vi.spyOn(mockProvider, 'shutdown').mockResolvedValue(undefined);

      await engine.shutdown();
      expect(mockProvider.shutdown).toHaveBeenCalled();
    });

    test('should get engine status', () => {
      const engine = createWorkflowEngine({
        ...engineConfig,
        monitoring: { enabled: true },
        events: { enabled: true },
        scheduling: { enabled: true },
      });

      const status = engine.getStatus();

      expect(status.initialized).toBe(false);
      expect(status.providers).toHaveLength(1);
      expect(status.monitoring?.enabled).toBe(true);
      expect(status.events?.enabled).toBe(true);
      expect(status.scheduling?.enabled).toBe(true);
    });
  });
});
