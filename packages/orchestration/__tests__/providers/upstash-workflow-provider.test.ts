import { describe, test, expect, beforeEach, vi } from 'vitest';
import { UpstashWorkflowProvider } from '../../src/providers/upstash-workflow/provider';
import {
  setupUpstashMocks,
  resetUpstashMocks,
  createTestWorkflowDefinition,
  createTestExecution,
} from '../utils/upstash-mocks';

describe('UpstashWorkflowProvider', () => {
  let mocks: ReturnType<typeof setupUpstashMocks>;
  let provider: UpstashWorkflowProvider;

  beforeEach(() => {
    mocks = setupUpstashMocks();

    provider = new UpstashWorkflowProvider({
      baseUrl: 'http://localhost:3001',
      qstash: {
        token: 'test-qstash-token',
      },
      redis: {
        url: 'https://test-redis.upstash.io',
        token: 'test-redis-token',
      },
    });
  });

  afterEach(() => {
    resetUpstashMocks(mocks);
  });

  describe('Provider Initialization', () => {
    test('should initialize with QStash and Redis', () => {
      expect(provider.name).toBe('upstash-workflow');
      expect(provider.version).toBe('1.0.0');
    });

    test('should initialize without Redis', () => {
      const providerWithoutRedis = new UpstashWorkflowProvider({
        baseUrl: 'http://localhost:3001',
        qstash: {
          token: 'test-qstash-token',
        },
      });

      expect(providerWithoutRedis.name).toBe('upstash-workflow');
    });

    test('should create provider from config', () => {
      const config = {
        name: 'test-provider',
        type: 'upstash-workflow' as const,
        config: {
          baseUrl: 'http://localhost:3001',
          qstashToken: 'test-token',
          redisUrl: 'https://test-redis.upstash.io',
          redisToken: 'test-redis-token',
        },
      };

      const provider = UpstashWorkflowProvider.fromConfig(config);
      expect(provider.name).toBe('upstash-workflow');
    });
  });

  describe('Workflow Execution', () => {
    test('should execute workflow successfully', async () => {
      const definition = createTestWorkflowDefinition();
      const input = { userId: '123', action: 'test' };

      const execution = await provider.execute(definition, input);

      expect(execution.id).toBeDefined();
      expect(execution.workflowId).toBe('test-workflow');
      expect(execution.status).toBe('running');
      expect(execution.input).toEqual(input);
      expect(execution.steps).toHaveLength(2);
      expect(execution.startedAt).toBeInstanceOf(Date);

      // Verify QStash was called
      expect(mocks.qstash.publishJSON).toHaveBeenCalledWith({
        url: 'http://localhost:3001/api/workflows/test-workflow/execute',
        body: {
          definition,
          executionId: execution.id,
          input,
          workflowId: 'test-workflow',
        },
        delay: 1000,
        headers: {
          'X-Execution-ID': execution.id,
          'X-Workflow-ID': 'test-workflow',
        },
        retries: 3,
      });

      // Verify Redis storage
      expect(mocks.redis.set).toHaveBeenCalledWith(
        `workflow:execution:${execution.id}`,
        expect.stringContaining(execution.id),
        { ex: 24 * 60 * 60 },
      );
    });

    test('should handle execution without Redis', async () => {
      const providerWithoutRedis = new UpstashWorkflowProvider({
        baseUrl: 'http://localhost:3001',
        qstash: {
          token: 'test-qstash-token',
        },
      });

      const definition = createTestWorkflowDefinition();
      const execution = await providerWithoutRedis.execute(definition);

      expect(execution.id).toBeDefined();
      expect(execution.status).toBe('running');
      expect(mocks.qstash.publishJSON).toHaveBeenCalled();
    });

    test('should handle QStash publish error', async () => {
      mocks.qstash.publishJSON.mockRejectedValue(new Error('QStash error'));

      const definition = createTestWorkflowDefinition();

      await expect(provider.execute(definition)).rejects.toThrow(
        'Failed to execute workflow test-workflow',
      );
    });
  });

  describe('Execution Management', () => {
    test('should get execution by ID', async () => {
      const testExecution = createTestExecution();

      // Store execution in mock Redis
      mocks.redis.set(`workflow:execution:${testExecution.id}`, JSON.stringify(testExecution));

      const execution = await provider.getExecution(testExecution.id);

      expect(execution).toEqual(testExecution);
      expect(mocks.redis.get).toHaveBeenCalledWith(`workflow:execution:${testExecution.id}`);
    });

    test('should return null for non-existent execution', async () => {
      mocks.redis.get.mockResolvedValue(null);

      const execution = await provider.getExecution('non-existent');

      expect(execution).toBeNull();
    });

    test('should throw error when Redis not configured', async () => {
      const providerWithoutRedis = new UpstashWorkflowProvider({
        baseUrl: 'http://localhost:3001',
        qstash: {
          token: 'test-qstash-token',
        },
      });

      await expect(providerWithoutRedis.getExecution('exec_123')).rejects.toThrow(
        'Redis not configured',
      );
    });

    test('should cancel running execution', async () => {
      const testExecution = createTestExecution({
        status: 'running',
      });

      mocks.redis.get.mockResolvedValue(JSON.stringify(testExecution));

      const result = await provider.cancelExecution(testExecution.id);

      expect(result).toBe(true);
      expect(mocks.redis.set).toHaveBeenCalledWith(
        `workflow:execution:${testExecution.id}`,
        expect.stringContaining('"status":"cancelled"'),
        { ex: 24 * 60 * 60 },
      );
    });

    test('should not cancel completed execution', async () => {
      const testExecution = createTestExecution({
        status: 'completed',
      });

      mocks.redis.get.mockResolvedValue(JSON.stringify(testExecution));

      const result = await provider.cancelExecution(testExecution.id);

      expect(result).toBe(false);
    });

    test('should return false for non-existent execution cancellation', async () => {
      mocks.redis.get.mockResolvedValue(null);

      const result = await provider.cancelExecution('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('Execution Listing', () => {
    test('should list executions for workflow', async () => {
      const execution1 = createTestExecution({ id: 'exec_1', workflowId: 'test-workflow' });
      const execution2 = createTestExecution({ id: 'exec_2', workflowId: 'test-workflow' });
      const execution3 = createTestExecution({ id: 'exec_3', workflowId: 'other-workflow' });

      // Mock Redis keys and get calls
      mocks.redis.keys.mockResolvedValue([
        'workflow:execution:exec_1',
        'workflow:execution:exec_2',
        'workflow:execution:exec_3',
      ]);

      mocks.redis.get
        .mockResolvedValueOnce(JSON.stringify(execution1))
        .mockResolvedValueOnce(JSON.stringify(execution2))
        .mockResolvedValueOnce(JSON.stringify(execution3));

      const executions = await provider.listExecutions('test-workflow');

      expect(executions).toHaveLength(2);
      expect(executions[0].id).toBe('exec_1');
      expect(executions[1].id).toBe('exec_2');
    });

    test('should filter executions by status', async () => {
      const execution1 = createTestExecution({ id: 'exec_1', status: 'completed' });
      const execution2 = createTestExecution({ id: 'exec_2', status: 'failed' });

      mocks.redis.keys.mockResolvedValue([
        'workflow:execution:exec_1',
        'workflow:execution:exec_2',
      ]);

      mocks.redis.get
        .mockResolvedValueOnce(JSON.stringify(execution1))
        .mockResolvedValueOnce(JSON.stringify(execution2));

      const executions = await provider.listExecutions('test-workflow', {
        status: ['completed'],
      });

      expect(executions).toHaveLength(1);
      expect(executions[0].status).toBe('completed');
    });

    test('should limit execution results', async () => {
      const executions = Array.from({ length: 5 }, (_, i) =>
        createTestExecution({ id: `exec_${i}` }),
      );

      mocks.redis.keys.mockResolvedValue(executions.map((e) => `workflow:execution:${e.id}`));

      for (const exec of executions) {
        mocks.redis.get.mockResolvedValueOnce(JSON.stringify(exec));
      }

      const result = await provider.listExecutions('test-workflow', {
        limit: 3,
      });

      expect(result).toHaveLength(3);
    });

    test('should throw error when Redis not configured for listing', async () => {
      const providerWithoutRedis = new UpstashWorkflowProvider({
        baseUrl: 'http://localhost:3001',
        qstash: {
          token: 'test-qstash-token',
        },
      });

      await expect(providerWithoutRedis.listExecutions('test-workflow')).rejects.toThrow(
        'Redis not configured',
      );
    });
  });

  describe('Workflow Scheduling', () => {
    test('should schedule workflow', async () => {
      const definition = createTestWorkflowDefinition({
        schedule: {
          cron: '0 9 * * 1',
          enabled: true,
        },
      });

      const scheduleId = await provider.scheduleWorkflow(definition);

      expect(scheduleId).toBeDefined();
      expect(mocks.qstash.schedules.create).toHaveBeenCalledWith({
        body: expect.stringContaining('"workflowId":"test-workflow"'),
        cron: '0 9 * * 1',
        destination: 'http://localhost:3001/api/workflows/test-workflow/execute',
        headers: {
          'X-Schedule-ID': scheduleId,
          'X-Workflow-ID': 'test-workflow',
        },
      });

      // Verify Redis storage
      expect(mocks.redis.set).toHaveBeenCalledWith(
        `workflow:schedule:${scheduleId}`,
        expect.stringContaining('"workflowId":"test-workflow"'),
      );
    });

    test('should throw error for workflow without schedule config', async () => {
      const definition = createTestWorkflowDefinition();

      await expect(provider.scheduleWorkflow(definition)).rejects.toThrow(
        'does not include schedule configuration',
      );
    });

    test('should unschedule workflow', async () => {
      const scheduleData = {
        scheduleId: 'schedule_123',
        workflowId: 'test-workflow',
        cron: '0 9 * * 1',
      };

      mocks.redis.keys.mockResolvedValue(['workflow:schedule:schedule_123']);
      mocks.redis.get.mockResolvedValue(JSON.stringify(scheduleData));

      const result = await provider.unscheduleWorkflow('test-workflow');

      expect(result).toBe(true);
      expect(mocks.redis.del).toHaveBeenCalledWith('workflow:schedule:schedule_123');
    });

    test('should return false when unscheduling non-existent workflow', async () => {
      mocks.redis.keys.mockResolvedValue([]);

      const result = await provider.unscheduleWorkflow('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('Health Check', () => {
    test('should return healthy status', async () => {
      mocks.redis.ping.mockResolvedValue('PONG');

      const health = await provider.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.details.qstash).toBe('healthy');
      expect(health.details.redis).toBe('healthy');
      expect(health.responseTime).toBeGreaterThan(0);
      expect(health.timestamp).toBeInstanceOf(Date);
    });

    test('should return unhealthy status on Redis error', async () => {
      mocks.redis.ping.mockRejectedValue(new Error('Redis connection failed'));

      const health = await provider.healthCheck();

      expect(health.status).toBe('unhealthy');
      expect(health.details.error).toBe('Redis connection failed');
    });

    test('should handle provider without Redis', async () => {
      const providerWithoutRedis = new UpstashWorkflowProvider({
        baseUrl: 'http://localhost:3001',
        qstash: {
          token: 'test-qstash-token',
        },
      });

      const health = await providerWithoutRedis.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.details.redis).toBe('not-configured');
    });
  });

  describe('Execution Status Updates', () => {
    test('should update execution status', async () => {
      const testExecution = createTestExecution();
      mocks.redis.get.mockResolvedValue(JSON.stringify(testExecution));

      await provider.updateExecutionStatus(testExecution.id, 'completed', 'step-1', {
        result: 'success',
      });

      expect(mocks.redis.set).toHaveBeenCalledWith(
        `workflow:execution:${testExecution.id}`,
        expect.stringContaining('"status":"completed"'),
        { ex: 24 * 60 * 60 },
      );
    });

    test('should throw error for non-existent execution', async () => {
      mocks.redis.get.mockResolvedValue(null);

      await expect(provider.updateExecutionStatus('non-existent', 'completed')).rejects.toThrow(
        'Execution non-existent not found',
      );
    });

    test('should handle update without Redis', async () => {
      const providerWithoutRedis = new UpstashWorkflowProvider({
        baseUrl: 'http://localhost:3001',
        qstash: {
          token: 'test-qstash-token',
        },
      });

      // Should not throw error, just return silently
      await expect(
        providerWithoutRedis.updateExecutionStatus('exec_123', 'completed'),
      ).resolves.toBeUndefined();
    });
  });

  describe('Workflow Handler', () => {
    test('should create workflow handler', () => {
      const handler = provider.createWorkflowHandler();

      expect(handler).toBeInstanceOf(Function);
      expect(mocks.serve).toHaveBeenCalled();
    });

    test('should execute workflow steps in handler', async () => {
      const definition = createTestWorkflowDefinition();
      const payload = {
        definition,
        executionId: 'exec_123',
        input: { test: 'data' },
        workflowId: 'test-workflow',
      };

      // Mock the handler creation and execution
      const mockHandler = vi.fn();
      mocks.serve.mockReturnValue(mockHandler);

      const handler = provider.createWorkflowHandler();

      // The serve mock should have been called with a function
      const workflowFunction = mocks.serve.mock.calls[0][0];
      expect(workflowFunction).toBeInstanceOf(Function);
    });
  });
});
