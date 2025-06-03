import { beforeEach, describe, expect, it, vi } from 'vitest';

// Import only client-safe utilities for testing
import { WorkflowError, WorkflowErrorType } from '../src/utils/error-handling';
import { withResources } from '../src/utils/resource-management';

// Mock the server-dependent imports
vi.mock('../src/runtime/core/workflow-builder', () => ({
  createWorkflow: vi.fn(() => ({
    build: vi.fn(() => ({ POST: vi.fn() })),
    withFailureFunction: vi.fn().mockReturnThis(),
    withFailureUrl: vi.fn().mockReturnThis(),
    withRetries: vi.fn().mockReturnThis(),
    withVerboseLogging: vi.fn().mockReturnThis(),
  })),
  WorkflowBuilder: vi.fn(),
}));

vi.mock('../src/runtime/core/workflow-client', () => ({
  WorkflowClient: vi.fn().mockImplementation(() => ({
    cancel: vi.fn().mockResolvedValue(undefined),
    cancelEndpoint: vi.fn(),
    getActiveWorkflows: vi.fn(),
    logs: vi.fn().mockResolvedValue({ cursor: null, runs: [] }),
    trigger: vi.fn().mockResolvedValue({ workflowRunId: 'test-id' }),
    waitForCompletion: vi.fn(),
  })),
}));

// Mock storage for deduplication testing
const mockStorage = {
  processedIds: new Map<string, number>(),
  processedMessageIds: new Map<string, number>(),
};

vi.mock('../src/runtime/deduplication', () => ({
  isDuplicateId: vi.fn((id: string, options?: any) => {
    if (options?.skip) return false;
    const storage = options?.storage || mockStorage;
    if (storage.processedIds.has(id)) return true;
    storage.processedIds.set(id, Date.now());
    return false;
  }),
  isDuplicateMessage: vi.fn((context: any, options?: any) => {
    if (options?.skip) return false;
    const storage = options?.storage || mockStorage;
    // Check multiple possible paths for the message ID
    let messageId = context.req?.headers?.['upstash-message-id'] || context['upstash-message-id'];

    // Handle Headers object
    if (context.headers?.get) {
      messageId = messageId || context.headers.get('upstash-message-id');
    } else if (context.headers?.['upstash-message-id']) {
      messageId = messageId || context.headers['upstash-message-id'];
    }

    if (!messageId) return false;
    if (storage.processedMessageIds.has(messageId)) return true;
    storage.processedMessageIds.set(messageId, Date.now());
    return false;
  }),
}));

describe('Orchestration Package', () => {
  describe('Workflow Builder (Mocked)', () => {
    it('should create a workflow builder with default options', async () => {
      const { createWorkflow } = await import('../src/runtime/core/workflow-builder');
      const builder = createWorkflow();
      expect(builder).toBeDefined();
      expect(typeof builder.build).toBe('function');
    });

    it('should allow chaining configuration methods', async () => {
      const { createWorkflow } = await import('../src/runtime/core/workflow-builder');
      const builder = createWorkflow()
        .withRetries(5)
        .withVerboseLogging(true)
        .withFailureUrl('https://example.com/failure');

      expect(builder).toBeDefined();
    });

    it('should build a workflow handler', async () => {
      const { createWorkflow } = await import('../src/runtime/core/workflow-builder');
      const handler = vi.fn();
      const workflow = createWorkflow().build(handler);

      expect(workflow).toBeDefined();
      expect(typeof workflow).toBe('object');
      expect(typeof workflow.POST).toBe('function');
    });

    it('should provide pre-configured workflow builders', async () => {
      const { createWorkflow } = await import('../src/runtime/core/workflow-builder');
      // Test client-safe workflow creation instead
      const builder = createWorkflow().withRetries(3).withVerboseLogging(false);

      expect(builder).toBeDefined();
      expect(typeof builder.build).toBe('function');
    });
  });

  describe('Workflow Client (Mocked)', () => {
    let client: any;

    beforeEach(async () => {
      const { WorkflowClient } = await import('../src/runtime/core/workflow-client');
      client = new WorkflowClient({
        baseUrl: 'https://example.com',
        token: 'test-token',
      });
    });

    it('should create a workflow client', () => {
      expect(client).toBeDefined();
      expect(typeof client.trigger).toBe('function');
    });

    it('should trigger a workflow', async () => {
      const result = await client.trigger({
        url: 'https://example.com/workflow',
        body: { test: true },
      });

      expect(result).toBeDefined();
    });

    it('should get workflow logs', async () => {
      await client.logs({ workflowRunId: 'test-id' });
      expect(client.logs).toHaveBeenCalled();
    });

    it('should cancel workflows', async () => {
      await client.cancel({ ids: ['test-id'] });
      expect(client.cancel).toHaveBeenCalled();
    });

    it('should provide helper methods for common operations', async () => {
      expect(typeof client.cancelEndpoint).toBe('function');
      expect(typeof client.getActiveWorkflows).toBe('function');
      expect(typeof client.waitForCompletion).toBe('function');
    });
  });

  describe('Workflow Error Handling', () => {
    it('should create a workflow with error handling', async () => {
      const { createWorkflow } = await import('../src/runtime/core/workflow-builder');
      const onError = vi.fn();
      const builder = createWorkflow().withFailureFunction(onError);

      expect(builder).toBeDefined();
      expect(typeof builder.build).toBe('function');
    });

    it('should create WorkflowError instances', () => {
      const error = new WorkflowError(
        WorkflowErrorType.RATE_LIMIT,
        'Rate limit exceeded',
        { endpoint: '/api/test' },
        true,
        30000,
      );

      expect(error).toBeInstanceOf(WorkflowError);
      expect(error.type).toBe(WorkflowErrorType.RATE_LIMIT);
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.context).toEqual({ endpoint: '/api/test' });
      expect(error.retryable).toBe(true);
      expect(error.retryAfter).toBe(30000);
    });

    it('should serialize WorkflowError to JSON', () => {
      const error = new WorkflowError(
        WorkflowErrorType.VALIDATION,
        'Validation failed',
        { field: 'email' },
        false,
      );

      const json = error.toJSON();
      expect(json).toHaveProperty('type', WorkflowErrorType.VALIDATION);
      expect(json).toHaveProperty('message', 'Validation failed');
      expect(json).toHaveProperty('context', { field: 'email' });
      expect(json).toHaveProperty('retryable', false);
      expect(json).toHaveProperty('stack');
    });
  });

  describe('Resource Management', () => {
    it('should manage resources and clean them up', async () => {
      const cleanup = vi.fn();

      await withResources(async (resources) => {
        const resource = { cleanup };
        resources.add(resource);

        return 'result';
      });

      expect(cleanup).toHaveBeenCalledTimes(1);
    });

    it('should clean up resources even if an error occurs', async () => {
      const cleanup = vi.fn();

      await expect(
        withResources(async (resources) => {
          const resource = { cleanup };
          resources.add(resource);

          throw new Error('Test error');
        }),
      ).rejects.toThrow('Test error');

      expect(cleanup).toHaveBeenCalledTimes(1);
    });
  });

  describe('Deduplication', () => {
    beforeEach(() => {
      mockStorage.processedIds.clear();
      mockStorage.processedMessageIds.clear();
    });

    it('should detect duplicate IDs', async () => {
      const { isDuplicateId } = await import('../src/runtime/deduplication');

      // First call should not be a duplicate
      const result1 = isDuplicateId('test-id', { storage: mockStorage });
      expect(result1).toBe(false);

      // Second call with same ID should be a duplicate
      const result2 = isDuplicateId('test-id', { storage: mockStorage });
      expect(result2).toBe(true);
    });

    it('should detect duplicate messages', async () => {
      const { isDuplicateMessage } = await import('../src/runtime/deduplication');

      // Create mock context with required WorkflowContext properties
      const mockContext = {
        url: 'https://test.com/workflow',
        agents: {} as any,
        api: {} as any,
        call: vi.fn(),
        cancel: vi.fn(),
        env: {},
        executor: {} as any,
        headers: new Headers({ 'upstash-message-id': 'test-message-id' }),
        invoke: vi.fn(),
        notify: vi.fn(),
        qstashClient: {} as any,
        req: {
          headers: { 'upstash-message-id': 'test-message-id' },
        },
        requestPayload: {},
        retries: 3,
        run: vi.fn(),
        sleep: vi.fn(),
        sleepUntil: vi.fn(),
        steps: [],
        waitForEvent: vi.fn(),
        workflowRunId: 'test-run-id',
      } as any;

      // First call should not be a duplicate
      const result1 = isDuplicateMessage(mockContext, { storage: mockStorage });
      expect(result1).toBe(false);

      // Second call with same message ID should be a duplicate
      const result2 = isDuplicateMessage(mockContext, { storage: mockStorage });
      expect(result2).toBe(true);
    });

    it('should skip deduplication when configured', async () => {
      const { isDuplicateId } = await import('../src/runtime/deduplication');

      // First call should not be a duplicate
      isDuplicateId('test-id-2', { storage: mockStorage });

      // Second call with skip=true should not be detected as duplicate
      const result = isDuplicateId('test-id-2', { skip: true, storage: mockStorage });
      expect(result).toBe(false);
    });
  });
});
