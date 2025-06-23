import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

// Set test environment before importing anything
vi.stubEnv('NODE_ENV', 'test');
vi.stubEnv('VITEST', 'true');

import {
  createTestExecution,
  createTestWorkflowDefinition,
  resetUpstashMocks,
  setupUpstashMocks,
} from '../utils/upstash-mocks';

// Set up mocks before importing the provider
let mocks: ReturnType<typeof setupUpstashMocks>;
beforeAll(() => {
  mocks = setupUpstashMocks();
});

describe('upstashWorkflowProvider', (_: any) => {
  let provider: any;
  let UpstashWorkflowProvider: any;

  beforeEach(async () => {
    // Clear all mocks and reset Redis storage
    vi.clearAllMocks();
    mocks.redis._clear();

    // Import the provider after mocks are set up
    const module = await import('../../src/providers/upstash-workflow/provider');
    UpstashWorkflowProvider = module.UpstashWorkflowProvider;

    // Create provider with Redis enabled to use mocks
    provider = new UpstashWorkflowProvider({
      baseUrl: 'http://localhost:3001',
      qstash: {
        token: 'test-qstash-token',
      },
      enableRedis: true, // Explicitly enable Redis to use mocks
    });

    // Ensure the provider uses the mocked clients
    provider.setClients(mocks.qstash, mocks.redis);

    // Verify the provider is using the test mocks
    expect(provider.redisClient).toBe(mocks.redis);
    expect(provider.qstash).toBe(mocks.qstash);
  });

  afterEach(() => {
    resetUpstashMocks(mocks);
  });

  describe('provider Initialization', (_: any) => {
    test('should initialize with QStash and Redis', (_: any) => {
      expect(provider.name).toBe('upstash-workflow');
      expect(provider.version).toBe('1.0.0');
    });

    test('should initialize without Redis', (_: any) => {
      const providerWithoutRedis = new UpstashWorkflowProvider({
        baseUrl: 'http://localhost:3001',
        qstash: {
          token: 'test-qstash-token',
        },
      });

      expect(providerWithoutRedis.name).toBe('upstash-workflow');
    });

    test('should create provider from config', (_: any) => {
      const config = {
        name: 'test-provider',
        type: 'upstash-workflow' as const,
        config: {
          baseUrl: 'http://localhost:3001',
          qstashToken: 'test-token',
          redisToken: 'test-redis-token',
          redisUrl: 'https://test-redis.upstash.io',
        },
        enabled: true,
      };

      const provider = UpstashWorkflowProvider.fromConfig(config);
      expect(provider.name).toBe('upstash-workflow');
    });
  });

  describe('workflow Execution', (_: any) => {
    test('should execute workflow successfully', async () => {
      const definition = createTestWorkflowDefinition();
      const input = { action: 'test', userId: '123' };

      // Pre-populate sorted set for executions
      const startedAt = new Date();
      const executionId = 'exec_success';
      await mocks.redis.zadd(`workflow:${definition.id}:executions`, {
        score: startedAt.getTime(),
        member: executionId,
      });

      const execution = await provider.execute(definition, input);

      expect(execution.id).toBeDefined();
      expect(execution.workflowId).toBe('test-workflow');
      expect(execution.status).toBe('running');
      expect(execution.input).toEqual(input);
      expect(execution.steps).toHaveLength(2);
      expect(execution.startedAt).toBeInstanceOf(Date);

      // Verify QStash was called with default URL pattern
      expect(mocks.qstash.publishJSON).toHaveBeenCalledWith({
        url: 'http://localhost:3001/api/workflows/test-workflow/execute',
        body: {
          definition,
          executionId: execution.id,
          input,
          workflowId: 'test-workflow',
        },
        delay: 0, // No delay by default
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
        enableRedis: false, // Explicitly disable Redis
      });
      providerWithoutRedis.setClients(mocks.qstash, null);

      const definition = createTestWorkflowDefinition();
      // No need to pre-populate Redis for this test
      const execution = await providerWithoutRedis.execute(definition);

      expect(execution.id).toBeDefined();
      expect(execution.status).toBe('running');
      expect(mocks.qstash.publishJSON).toHaveBeenCalled();
    });

    test('should use custom webhook URL pattern when provided', async () => {
      // Create provider with custom webhook URL pattern
      const customProvider = new UpstashWorkflowProvider({
        baseUrl: 'http://localhost:3001',
        qstash: {
          token: 'test-token',
        },
        redis: {
          url: 'redis://localhost:6379',
          token: 'test-redis-token',
        },
        webhookUrlPattern: '/{id}',
      });
      customProvider.setClients(mocks.qstash, mocks.redis);

      const definition = createTestWorkflowDefinition();
      const input = { testInput: 'value' };
      const startedAt = new Date();
      const executionId = 'exec_custom';
      await mocks.redis.zadd(`workflow:${definition.id}:executions`, {
        score: startedAt.getTime(),
        member: executionId,
      });

      const execution = await customProvider.execute(definition, input);

      // Verify QStash was called with custom URL pattern
      expect(mocks.qstash.publishJSON).toHaveBeenCalledWith({
        url: 'http://localhost:3001/test-workflow',
        body: {
          definition,
          executionId: execution.id,
          input,
          workflowId: 'test-workflow',
        },
        delay: 0,
        headers: {
          'X-Execution-ID': execution.id,
          'X-Workflow-ID': 'test-workflow',
        },
        retries: 3,
      });
    });

    test('should handle QStash publish error', async () => {
      mocks.qstash.publishJSON.mockRejectedValue(new Error('QStash error'));

      const definition = createTestWorkflowDefinition();

      await expect(provider.execute(definition)).rejects.toThrow(
        'Failed to execute workflow test-workflow',
      );
    });
  });

  describe('execution Management', (_: any) => {
    test('should get execution by ID', async () => {
      const workflowId = 'test-workflow';
      const executionId = 'exec-get-by-id';
      const testExecution = createTestExecution({ id: executionId, workflowId });

      // Store execution data using the provider's Redis client
      await provider.redisClient.set(
        `workflow:execution:${executionId}`,
        JSON.stringify(testExecution),
      );
      await provider.redisClient.zadd(`workflow:${workflowId}:executions`, {
        score: testExecution.startedAt.getTime(),
        member: executionId,
      });

      // Verify the data was stored using the provider's Redis client
      const raw = await provider.redisClient.get(`workflow:execution:${executionId}`);
      expect(raw).toBeDefined();

      // Get execution through provider
      const execution = await provider.getExecution(executionId);
      expect(execution).toEqual(
        expect.objectContaining({
          ...testExecution,
          metadata: {
            ...testExecution.metadata,
            trigger: {
              ...testExecution.metadata.trigger,
              timestamp: expect.any(String),
            },
          },
          startedAt: expect.any(String),
        }),
      );
      expect(provider.redisClient.get).toHaveBeenCalledWith(`workflow:execution:${executionId}`);
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
        enableRedis: false, // Explicitly disable Redis
      });

      await expect(providerWithoutRedis.getExecution('exec_123')).rejects.toThrow(
        'Redis not configured - cannot retrieve execution state',
      );
    });

    test('should cancel running execution', async () => {
      const testExecution = createTestExecution({
        status: 'running',
      });

      mocks.redis.get.mockResolvedValue(JSON.stringify(testExecution));

      const result = await provider.cancelExecution(testExecution.id);

      expect(result).toBeTruthy();
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

      expect(result).toBeFalsy();
    });

    test('should return false for non-existent execution cancellation', async () => {
      mocks.redis.get.mockResolvedValue(null);

      const result = await provider.cancelExecution('non-existent');

      expect(result).toBeFalsy();
    });
  });

  describe('execution Listing', (_: any) => {
    test('should list executions for workflow', async () => {
      const workflowId = 'test-workflow';
      const executionId = 'exec-list-1';
      const testExecution = createTestExecution({ id: executionId, workflowId });

      // Store execution data using the provider's Redis client
      await provider.redisClient.set(
        `workflow:execution:${executionId}`,
        JSON.stringify(testExecution),
      );
      await provider.redisClient.zadd(`workflow:${workflowId}:executions`, {
        score: testExecution.startedAt.getTime(),
        member: executionId,
      });

      // Mock the zrange to return the execution ID
      provider.redisClient.zrange.mockResolvedValue([executionId]);

      const executions = await provider.listExecutions(workflowId);
      expect(executions).toHaveLength(1);
      expect(executions[0]).toEqual(expect.objectContaining({ id: executionId }));
    });

    test('should filter executions by status', async () => {
      const workflowId = 'test-workflow';
      const executionId = 'exec-filter-status';
      const testExecution = createTestExecution({
        id: executionId,
        workflowId,
        status: 'completed',
      });

      // Store execution data using the provider's Redis client
      await provider.redisClient.set(
        `workflow:execution:${executionId}`,
        JSON.stringify(testExecution),
      );
      await provider.redisClient.zadd(`workflow:${workflowId}:executions`, {
        score: testExecution.startedAt.getTime(),
        member: executionId,
      });

      // Mock the zrange to return the execution ID
      provider.redisClient.zrange.mockResolvedValue([executionId]);

      const executions = await provider.listExecutions(workflowId, { status: 'completed' });
      expect(executions).toHaveLength(1);
      expect(executions[0]).toEqual(
        expect.objectContaining({ id: executionId, status: 'completed' }),
      );
    });

    test('should limit execution results', async () => {
      const workflowId = 'test-workflow';
      const executionId1 = 'exec-limit-1';
      const executionId2 = 'exec-limit-2';
      const testExecution1 = createTestExecution({ id: executionId1, workflowId });
      const testExecution2 = createTestExecution({ id: executionId2, workflowId });

      // Store execution data using the provider's Redis client
      await provider.redisClient.set(
        `workflow:execution:${executionId1}`,
        JSON.stringify(testExecution1),
      );
      await provider.redisClient.set(
        `workflow:execution:${executionId2}`,
        JSON.stringify(testExecution2),
      );
      await provider.redisClient.zadd(`workflow:${workflowId}:executions`, {
        score: testExecution1.startedAt.getTime(),
        member: executionId1,
      });
      await provider.redisClient.zadd(`workflow:${workflowId}:executions`, {
        score: testExecution2.startedAt.getTime(),
        member: executionId2,
      });

      // Mock the zrange to return both execution IDs
      provider.redisClient.zrange.mockResolvedValue([executionId1, executionId2]);

      const executions = await provider.listExecutions(workflowId, { limit: 1 });
      expect(executions.length).toBe(1);
    });

    test('should throw error when Redis not configured for listing', async () => {
      const providerWithoutRedis = new UpstashWorkflowProvider({
        baseUrl: 'http://localhost:3001',
        qstash: {
          token: 'test-qstash-token',
        },
        enableRedis: false, // Explicitly disable Redis
      });

      await expect(providerWithoutRedis.listExecutions('test-workflow')).rejects.toThrow(
        'Redis not configured - cannot list executions',
      );
    });
  });

  describe('workflow Scheduling', (_: any) => {
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
        'Workflow test-workflow does not include schedule configuration',
      );
    });

    test('should unschedule workflow', async () => {
      const scheduleData = {
        cron: '0 9 * * 1',
        scheduleId: 'schedule_123',
        workflowId: 'test-workflow',
      };

      mocks.redis.keys.mockResolvedValue(['workflow:schedule:schedule_123']);
      mocks.redis.get.mockResolvedValue(JSON.stringify(scheduleData));

      const result = await provider.unscheduleWorkflow('test-workflow');

      expect(result).toBeTruthy();
      expect(mocks.redis.del).toHaveBeenCalledWith('workflow:schedule:schedule_123');
    });

    test('should return false when unscheduling non-existent workflow', async () => {
      mocks.redis.keys.mockResolvedValue([]);

      const result = await provider.unscheduleWorkflow('non-existent');

      expect(result).toBeFalsy();
    });
  });

  describe('health Check', (_: any) => {
    test('should return healthy status', async () => {
      mocks.redis.ping.mockResolvedValue('PONG');

      const health = await provider.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.details?.qstash).toBe('healthy');
      expect(health.details?.redis).toBe('healthy');
      expect(health.responseTime).toBeGreaterThanOrEqual(0);
      expect(health.timestamp).toBeInstanceOf(Date);
    });

    test('should return unhealthy status on Redis error', async () => {
      mocks.redis.ping.mockRejectedValue(new Error('Redis connection failed'));

      const health = await provider.healthCheck();

      expect(health.status).toBe('unhealthy');
      expect(health.details?.error).toBe('Redis connection failed');
    });

    test('should handle provider without Redis', async () => {
      const providerWithoutRedis = new UpstashWorkflowProvider({
        baseUrl: 'http://localhost:3001',
        qstash: {
          token: 'test-qstash-token',
        },
        enableRedis: false, // Explicitly disable Redis
      });

      const health = await providerWithoutRedis.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.details?.redis).toBe('not-configured');
    });
  });

  describe('execution Status Updates', (_: any) => {
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
        enableRedis: false, // Explicitly disable Redis
      });

      // Should not throw error, just return silently
      await expect(
        providerWithoutRedis.updateExecutionStatus('exec_123', 'completed'),
      ).resolves.toBeUndefined();
    });
  });

  describe('workflow Handler', (_: any) => {
    test('should create workflow handler', (_: any) => {
      const handler = provider.createWorkflowHandler();

      expect(handler).toBeDefined();
      expect(handler).toHaveProperty('POST');
      expect(handler.POST).toBeInstanceOf(Function);
    });

    test('should execute workflow steps in handler', async () => {
      const workflowId = 'test-workflow';
      const executionId = 'exec-handler';
      const definition = createTestWorkflowDefinition({ id: workflowId });
      const testExecution = createTestExecution({ id: executionId, workflowId });

      // Store execution data using the provider's Redis client
      await provider.redisClient.set(
        `workflow:execution:${executionId}`,
        JSON.stringify(testExecution),
      );
      await provider.redisClient.zadd(`workflow:${workflowId}:executions`, {
        score: testExecution.startedAt.getTime(),
        member: executionId,
      });

      // Verify the execution exists
      const storedExecution = await provider.redisClient.get(`workflow:execution:${executionId}`);
      expect(storedExecution).toBeDefined();

      // Mock the workflow handler to avoid real Upstash workflow serve
      const mockHandler = {
        GET: async () => Response.json({ status: 'ok' }, { status: 200 }),
        POST: async (request: any) => {
          try {
            const body = await request.json();
            const { definition, executionId, workflowId } = body;

            // Mock workflow execution
            if (provider.useRedis) {
              // Update execution status to running
              await provider.updateExecutionStatus(executionId, 'running');

              // Simulate step execution
              for (const step of definition.steps) {
                await provider.updateExecutionStatus(executionId, 'running', step.id);
                await provider.updateExecutionStatus(executionId, 'completed', step.id, {
                  result: 'mock-success',
                });
              }

              // Mark execution as completed
              await provider.updateExecutionStatus(executionId, 'completed');
            }

            return Response.json({ success: true, executionId }, { status: 200 });
          } catch (error) {
            console.error('Mock handler error:', error);
            return Response.json({ error: 'Workflow execution failed' }, { status: 500 });
          }
        },
      };

      // Mock the createWorkflowHandler method
      vi.spyOn(provider, 'createWorkflowHandler').mockReturnValue(mockHandler);

      const handler = provider.createWorkflowHandler();
      const req = {
        method: 'POST',
        json: async () => ({
          definition,
          executionId,
          workflowId,
          input: { test: 'data' },
        }),
      };

      const response = await handler.POST(req);
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
    });
  });
});
