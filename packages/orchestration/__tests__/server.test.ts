import { beforeEach, describe, expect, test, vi } from 'vitest';

import { createWorkflowEngine } from '../src/server';
import { ProviderHealthReport, WorkflowDefinition, WorkflowExecution } from '../src/shared/types';

import { createUpstashWorkflowConfig } from './fixtures';

// Mock server-only to prevent errors
vi.mock('server-only', () => ({}));

// Mock dependencies
vi.mock('@upstash/workflow/nextjs', () => ({
  serve: vi.fn().mockReturnValue({
    GET: vi.fn(),
    POST: vi.fn(),
  }),
}));

vi.mock('@upstash/qstash', () => ({
  Client: vi.fn(() => ({
    messages: {
      delete: vi.fn().mockResolvedValue(true),
    },
    publishJSON: vi.fn().mockResolvedValue({ messageId: 'msg_123' }),
    schedules: {
      create: vi.fn().mockResolvedValue({ scheduleId: 'schedule_123' }),
      delete: vi.fn().mockResolvedValue(true),
    },
  })),
}));

vi.mock('@upstash/redis', () => ({
  Redis: vi.fn(() => ({
    del: vi.fn().mockResolvedValue(1),
    get: vi.fn().mockResolvedValue(null),
    keys: vi.fn().mockResolvedValue([]),
    ping: vi.fn().mockResolvedValue('PONG'),
    set: vi.fn().mockResolvedValue('OK'),
  })),
}));

describe('workflow Engine', () => {
  let engine: ReturnType<typeof createWorkflowEngine>;
  const upstashConfig = createUpstashWorkflowConfig();
  const mockConfig = {
    defaultProvider: 'test-upstash-workflow',
    providers: [
      {
        name: upstashConfig.name,
        type: upstashConfig.type as 'upstash-workflow',
        config: upstashConfig,
      },
    ],
    enableHealthChecks: true,
    enableMetrics: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    engine = createWorkflowEngine(mockConfig);
  });

  describe('engine Creation', () => {
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

  describe('engine Initialization', () => {
    test('should initialize successfully', async () => {
      await expect(engine.initialize()).resolves.not.toThrow();
    });

    test('should register providers during initialization', async () => {
      const spy = vi.spyOn(engine.manager, 'registerProvider');
      await engine.initialize();
      expect(spy).toHaveBeenCalledWith('test-upstash-workflow', expect.any(Object));
    });
  });

  describe('workflow Execution', () => {
    const mockWorkflow: WorkflowDefinition = {
      id: 'test-workflow',
      name: 'Test Workflow',
      steps: [
        {
          id: 'step-1',
          name: 'Test Step',
          action: 'test-action',
        },
      ],
      version: '1.0.0',
    };

    beforeEach(async () => {
      await engine.initialize();
    });

    test('should execute workflow successfully', async () => {
      const mockExecution: WorkflowExecution = {
        id: 'exec_123',
        startedAt: new Date(),
        status: 'running',
        steps: [],
        workflowId: 'test-workflow',
      };

      vi.spyOn(engine.manager, 'executeWorkflow').mockResolvedValue(mockExecution);

      const result = await engine.executeWorkflow(mockWorkflow, { test: 'data' });
      expect(result).toStrictEqual(mockExecution);
    });

    test('should handle execution errors', async () => {
      // Mock the manager's executeWorkflow to throw an error after validation
      const executeSpy = vi.spyOn(engine.manager, 'executeWorkflow');
      executeSpy.mockRejectedValue(new Error('Execution failed'));

      // Create a valid workflow that passes validation
      const validWorkflow = {
        id: 'test-workflow',
        name: 'Test Workflow',
        steps: [
          {
            id: 'step-1',
            name: 'Test Step',
            action: 'test-action',
          },
        ],
        version: '1.0.0',
      };

      await expect(engine.executeWorkflow(validWorkflow, {})).rejects.toThrow('Execution failed');
    });
  });

  describe('execution Management', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    test('should get execution status', async () => {
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
      expect(status).toStrictEqual(mockStatus);
    });

    test('should list executions', async () => {
      const mockExecutions: WorkflowExecution[] = [
        {
          id: 'exec_1',
          completedAt: new Date(),
          startedAt: new Date(),
          status: 'completed',
          steps: [],
          workflowId: 'test-workflow',
        },
        {
          id: 'exec_2',
          startedAt: new Date(),
          status: 'running',
          steps: [],
          workflowId: 'test-workflow',
        },
      ];

      vi.spyOn(engine.manager, 'listExecutions').mockResolvedValue(mockExecutions);

      const executions = await engine.listExecutions('test-workflow', {
        limit: 10,
        status: ['completed', 'running'],
      });

      expect(executions).toStrictEqual(mockExecutions);
    });
  });

  describe('scheduling', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    test('should schedule workflow', async () => {
      const mockSchedule = 'schedule_123';

      const scheduleSpy = vi.spyOn(engine.manager, 'scheduleWorkflow');
      scheduleSpy.mockResolvedValue(mockSchedule);

      // First mock the validateWorkflowDefinition to avoid errors
      const validateSpy = vi.spyOn(
        await import('../src/shared/utils/validation'),
        'validateWorkflowDefinition',
      );
      validateSpy.mockImplementation((def: any) => def as any);

      const workflowWithSchedule = {
        id: 'test-workflow',
        name: 'Test Workflow',
        schedule: {
          cron: '0 0 * * *',
          enabled: true,
        },
        steps: [
          {
            id: 'step-1',
            name: 'Test Step',
            action: 'test-action',
          },
        ],
        version: '1.0.0',
      };

      const result = await engine.scheduleWorkflow(workflowWithSchedule);

      expect(result).toBe(mockSchedule);
      expect(scheduleSpy).toHaveBeenCalledWith(
        workflowWithSchedule,
        undefined, // providerName parameter
      );
    });
  });

  describe('health and Status', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    test('should perform health check', async () => {
      const mockHealth: ProviderHealthReport[] = [
        {
          name: 'test-provider',
          type: 'upstash-workflow',
          details: {
            uptime: 3600,
            version: '1.0.0',
          },
          responseTime: 100,
          status: 'healthy',
          timestamp: new Date(),
        },
      ];

      vi.spyOn(engine.manager, 'healthCheckAll').mockResolvedValue(mockHealth);

      const health = await engine.healthCheck();
      expect(health).toStrictEqual(mockHealth);
    });

    test('should get engine status', () => {
      const mockStatus = {
        defaultProvider: 'test-provider',
        providerCount: 1,
        abortController: 'test-controller',
        executionMetrics: null,
        healthChecksEnabled: true,
        initialized: true,
        metricsEnabled: true,
        stepFactoryEnabled: true,
        stepRegistry: null,
      };

      vi.spyOn(engine.manager, 'getStatus').mockReturnValue(mockStatus);

      const status = engine.getStatus();
      expect(status).toStrictEqual(mockStatus);
    });
  });

  describe('shutdown', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    test('should shutdown gracefully', async () => {
      vi.spyOn(engine.manager, 'shutdown').mockResolvedValue(undefined);
      await expect(engine.shutdown()).resolves.not.toThrow();
    });
  });
});
