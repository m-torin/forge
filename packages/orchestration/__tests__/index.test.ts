import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { createWorkflow, WorkflowClient, workflows } from '../src/runtime';
import { WorkflowError, WorkflowErrorType, withErrorHandling } from '../src/utils/error-handling';
import { withResources } from '../src/utils';
import { isDuplicateId, isDuplicateMessage } from '../src/runtime';
import type { WorkflowContext } from '../src/utils/types';

// Mock WorkflowContext for testing
const createMockContext = <T>(payload: T): WorkflowContext<T> => ({
  workflowRunId: `mock-${Date.now()}`,
  requestPayload: payload,
  headers: new Map(),
  env: {},
  run: vi.fn().mockImplementation((_, fn) => fn()),
  sleep: vi.fn().mockResolvedValue(undefined),
  call: vi.fn().mockResolvedValue({
    status: 200,
    body: {},
    headers: {}
  }),
  notify: vi.fn().mockResolvedValue({
    messageId: 'mock-message-id',
    waiter: {
      deadline: Date.now() + 60000,
      headers: {},
      url: 'https://example.com/webhook'
    }
  }),
  waitForEvent: vi.fn().mockResolvedValue({
    eventData: { approved: true },
    timeout: false
  }),
  invoke: vi.fn().mockResolvedValue({
    body: {},
    isCanceled: false,
    isFailed: false
  })
});

describe('Orchestration Package', () => {
  describe('Workflow Builder', () => {
    it('should create a workflow builder with default options', () => {
      const builder = createWorkflow();
      expect(builder).toBeDefined();
      expect(typeof builder.build).toBe('function');
    });

    it('should allow chaining configuration methods', () => {
      const builder = createWorkflow()
        .withRetries(5)
        .withVerboseLogging(true)
        .withFailureUrl('https://example.com/failure');

      expect(builder).toBeDefined();
    });

    it('should build a workflow handler', () => {
      const handler = vi.fn();
      const workflow = createWorkflow().build(handler);

      expect(workflow).toBeDefined();
      expect(typeof workflow).toBe('function');
    });

    it('should provide pre-configured workflow builders', () => {
      expect(workflows.development).toBeDefined();
      expect(workflows.production).toBeDefined();
      expect(workflows.rateLimited).toBeDefined();
      expect(workflows.withErrorHandling).toBeDefined();
      expect(workflows.parallel).toBeDefined();
    });
  });

  describe('Workflow Client', () => {
    let client: WorkflowClient;

    beforeEach(() => {
      client = new WorkflowClient({
        token: 'test-token',
        baseUrl: 'https://example.com'
      });

      // Mock the internal client methods
      (client as any).client = {
        trigger: vi.fn().mockResolvedValue({ workflowRunId: 'test-id' }),
        logs: vi.fn().mockResolvedValue({ runs: [], cursor: null }),
        cancel: vi.fn().mockResolvedValue(undefined),
        notify: vi.fn().mockResolvedValue([]),
        getWaiters: vi.fn().mockResolvedValue([])
      };
    });

    it('should create a workflow client', () => {
      expect(client).toBeDefined();
      expect(typeof client.trigger).toBe('function');
    });

    it('should trigger a workflow', async () => {
      const result = await client.trigger({
        url: 'https://example.com/workflow',
        body: { test: true }
      });

      expect(result).toEqual({ workflowRunId: 'test-id' });
      expect((client as any).client.trigger).toHaveBeenCalledWith({
        url: 'https://example.com/workflow',
        body: { test: true }
      });
    });

    it('should get workflow logs', async () => {
      await client.logs({ workflowRunId: 'test-id' });

      expect((client as any).client.logs).toHaveBeenCalledWith({
        workflowRunId: 'test-id'
      });
    });

    it('should cancel workflows', async () => {
      await client.cancel({ ids: ['test-id'] });

      expect((client as any).client.cancel).toHaveBeenCalledWith({
        ids: ['test-id']
      });
    });

    it('should provide helper methods for common operations', async () => {
      expect(typeof client.cancelEndpoint).toBe('function');
      expect(typeof client.getActiveWorkflows).toBe('function');
      expect(typeof client.waitForCompletion).toBe('function');
    });
  });

  describe('Error Handling', () => {
    let mockContext: WorkflowContext<any>;

    beforeEach(() => {
      mockContext = createMockContext({});
    });

    it('should handle successful operations', async () => {
      const handler = vi.fn().mockResolvedValue({ success: true });

      const result = await withErrorHandling(mockContext, handler);

      expect(result).toEqual({ success: true });
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable errors', async () => {
      const error = new WorkflowError(
        WorkflowErrorType.RATE_LIMIT,
        'Rate limit exceeded',
        {},
        true
      );

      const handler = vi.fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce({ success: true });

      const result = await withErrorHandling(mockContext, handler, {
        retryOn: [WorkflowErrorType.RATE_LIMIT],
        maxRetries: 1
      });

      expect(result).toEqual({ success: true });
      expect(handler).toHaveBeenCalledTimes(2);
      expect(mockContext.sleep).toHaveBeenCalledTimes(1);
    });

    it('should not retry on non-retryable errors', async () => {
      const error = new WorkflowError(
        WorkflowErrorType.VALIDATION,
        'Validation failed',
        {},
        false
      );

      const handler = vi.fn().mockRejectedValue(error);

      const result = await withErrorHandling(mockContext, handler, {
        retryOn: [WorkflowErrorType.RATE_LIMIT],
        maxRetries: 3
      });

      expect(result.status).toBe('failed');
      expect(result.error).toBeDefined();
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should use custom retry delay function if provided', async () => {
      const error = new WorkflowError(
        WorkflowErrorType.NETWORK,
        'Network error',
        {},
        true
      );

      const handler = vi.fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce({ success: true });

      const retryDelayFn = vi.fn().mockReturnValue(500);

      await withErrorHandling(mockContext, handler, {
        retryOn: [WorkflowErrorType.NETWORK],
        maxRetries: 1,
        retryDelayFn
      });

      expect(retryDelayFn).toHaveBeenCalledWith(error, 0);
      expect(mockContext.sleep).toHaveBeenCalledWith('retry-0', 0.5);
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

      await expect(withResources(async (resources) => {
        const resource = { cleanup };
        resources.add(resource);

        throw new Error('Test error');
      })).rejects.toThrow('Test error');

      expect(cleanup).toHaveBeenCalledTimes(1);
    });
  });

  describe('Deduplication', () => {
    // Mock storage for testing
    const mockStorage = {
      processedIds: new Map<string, number>(),
      processedMessageIds: new Map<string, number>()
    };

    beforeEach(() => {
      mockStorage.processedIds.clear();
      mockStorage.processedMessageIds.clear();
    });

    it('should detect duplicate IDs', () => {
      // First call should not be a duplicate
      const result1 = isDuplicateId('test-id', { storage: mockStorage });
      expect(result1).toBe(false);

      // Second call with same ID should be a duplicate
      const result2 = isDuplicateId('test-id', { storage: mockStorage });
      expect(result2).toBe(true);
    });

    it('should detect duplicate messages', () => {
      const mockContext = createMockContext({});

      // Add message ID to headers
      (mockContext.headers as Map<string, string>).set('upstash-message-id', 'test-message-id');

      // First call should not be a duplicate
      const result1 = isDuplicateMessage(mockContext, { storage: mockStorage });
      expect(result1).toBe(false);

      // Second call with same message ID should be a duplicate
      const result2 = isDuplicateMessage(mockContext, { storage: mockStorage });
      expect(result2).toBe(true);
    });

    it('should skip deduplication when configured', () => {
      // First call should not be a duplicate
      isDuplicateId('test-id-2', { storage: mockStorage });

      // Second call with skip=true should not be detected as duplicate
      const result = isDuplicateId('test-id-2', { storage: mockStorage, skip: true });
      expect(result).toBe(false);
    });
  });
});
