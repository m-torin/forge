import { describe, test, expect, beforeEach, vi } from 'vitest';
import { createWorkflowEngine } from '../src/server';
import type {
  WorkflowDefinition,
  WorkflowExecution,
  ProviderHealthReport,
} from '../src/shared/types';

// Mock dependencies
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
  let engine: ReturnType<typeof createWorkflowEngine>;
  const mockConfig = {
    providers: [
      {
        name: 'test-provider',
        type: 'upstash-workflow' as const,
        config: {
          workflowUrl: 'http://localhost:8080',
          qstashToken: 'test-token',
        },
      },
    ],
    defaultProvider: 'test-provider',
    enableHealthChecks: true,
    enableMetrics: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    engine = createWorkflowEngine(mockConfig);
  });

  describe('Engine Creation', () => {
    test('should create engine with valid config', () => {
      expect(engine).toBeDefined();
      expect(engine.manager).toBeDefined();
    });

    test('should create engine with minimal config', () => {
      const minimalEngine = createWorkflowEngine();
      expect(minimalEngine).toBeDefined();
      expect(minimalEngine.manager).toBeDefined();
    });
  });

  describe('Engine Initialization', () => {
    test('should initialize successfully', async () => {
      await expect(engine.initialize()).resolves.not.toThrow();
    });

    test('should register providers during initialization', async () => {
      const spy = vi.spyOn(engine.manager, 'registerProvider');
      await engine.initialize();
      expect(spy).toHaveBeenCalledWith('test-provider', expect.any(Object));
    });
  });

  describe('Workflow Execution', () => {
    const mockWorkflow: WorkflowDefinition = {
      id: 'test-workflow',
      name: 'Test Workflow',
      version: '1.0.0',
      steps: [],
    };

    beforeEach(async () => {
      await engine.initialize();
    });

    test('should execute workflow successfully', async () => {
      const mockExecution: WorkflowExecution = {
        id: 'exec_123',
        workflowId: 'test-workflow',
        status: 'running',
        startedAt: new Date(),
        steps: [],
      };

      vi.spyOn(engine.manager, 'executeWorkflow').mockResolvedValue(mockExecution);

      const result = await engine.executeWorkflow(mockWorkflow, { test: 'data' });
      expect(result).toEqual(mockExecution);
    });

    test('should handle execution errors', async () => {
      vi.spyOn(engine.manager, 'executeWorkflow').mockRejectedValue(new Error('Execution failed'));
      await expect(engine.executeWorkflow(mockWorkflow, {})).rejects.toThrow('Execution failed');
    });
  });

  describe('Execution Management', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    test('should get execution status', async () => {
      const mockStatus: WorkflowExecution = {
        id: 'exec_123',
        workflowId: 'test-workflow',
        status: 'completed',
        startedAt: new Date(),
        completedAt: new Date(),
        steps: [],
        output: { success: true },
      };

      vi.spyOn(engine.manager, 'getExecution').mockResolvedValue(mockStatus);

      const status = await engine.getExecution('exec_123');
      expect(status).toEqual(mockStatus);
    });

    test('should list executions', async () => {
      const mockExecutions: WorkflowExecution[] = [
        {
          id: 'exec_1',
          workflowId: 'test-workflow',
          status: 'completed',
          startedAt: new Date(),
          completedAt: new Date(),
          steps: [],
        },
        {
          id: 'exec_2',
          workflowId: 'test-workflow',
          status: 'running',
          startedAt: new Date(),
          steps: [],
        },
      ];

      vi.spyOn(engine.manager, 'listExecutions').mockResolvedValue(mockExecutions);

      const executions = await engine.listExecutions('test-workflow', {
        limit: 10,
        status: ['completed', 'running'],
      });

      expect(executions).toEqual(mockExecutions);
    });
  });

  describe('Scheduling', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    test('should schedule workflow', async () => {
      const mockSchedule = 'schedule_123';

      vi.spyOn(engine.manager, 'scheduleWorkflow').mockResolvedValue(mockSchedule);

      const result = await engine.scheduleWorkflow({
        id: 'test-workflow',
        name: 'Test Workflow',
        version: '1.0.0',
        steps: [],
        schedule: {
          cron: '0 0 * * *',
          enabled: true,
        },
      });

      expect(result).toBe(mockSchedule);
    });
  });

  describe('Health and Status', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    test('should perform health check', async () => {
      const mockHealth: ProviderHealthReport[] = [
        {
          name: 'test-provider',
          type: 'upstash-workflow',
          status: 'healthy',
          responseTime: 100,
          timestamp: new Date(),
          details: {
            version: '1.0.0',
            uptime: 3600,
          },
        },
      ];

      vi.spyOn(engine.manager, 'healthCheckAll').mockResolvedValue(mockHealth);

      const health = await engine.healthCheck();
      expect(health).toEqual(mockHealth);
    });

    test('should get engine status', () => {
      const mockStatus = {
        defaultProvider: 'test-provider',
        providerCount: 1,
        healthChecksEnabled: true,
        initialized: true,
        metricsEnabled: true,
        stepFactoryEnabled: true,
        stepRegistry: null,
        executionMetrics: null,
        abortController: 'test-controller',
      };

      vi.spyOn(engine.manager, 'getStatus').mockReturnValue(mockStatus);

      const status = engine.getStatus();
      expect(status).toEqual(mockStatus);
    });
  });

  describe('Shutdown', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    test('should shutdown gracefully', async () => {
      vi.spyOn(engine.manager, 'shutdown').mockResolvedValue(undefined);
      await expect(engine.shutdown()).resolves.not.toThrow();
    });
  });
});
