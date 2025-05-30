import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createWorkflow, WorkflowClient, workflows } from '../src/runtime';
import { isDuplicateId, isDuplicateMessage } from '../src/runtime';
import { withResources } from '../src/utils';
import { WorkflowError, WorkflowErrorType } from '../src/utils/error-handling';
import { createMockContext } from '../src/utils/testing';

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
      expect(typeof workflow).toBe('object');
      expect(typeof workflow.POST).toBe('function');
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
        baseUrl: 'https://example.com',
        token: 'test-token',
      });

      // Mock the internal client methods
      (client as any).client = {
        cancel: vi.fn().mockResolvedValue(undefined),
        getWaiters: vi.fn().mockResolvedValue([]),
        logs: vi.fn().mockResolvedValue({ cursor: null, runs: [] }),
        notify: vi.fn().mockResolvedValue([]),
        trigger: vi.fn().mockResolvedValue({ workflowRunId: 'test-id' }),
      };
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

      expect(result).toEqual({ workflowRunId: 'test-id' });
      expect((client as any).client.trigger).toHaveBeenCalledWith({
        url: 'https://example.com/workflow',
        body: { test: true },
      });
    });

    it('should get workflow logs', async () => {
      await client.logs({ workflowRunId: 'test-id' });

      expect((client as any).client.logs).toHaveBeenCalledWith({
        workflowRunId: 'test-id',
      });
    });

    it('should cancel workflows', async () => {
      await client.cancel({ ids: ['test-id'] });

      expect((client as any).client.cancel).toHaveBeenCalledWith({
        ids: ['test-id'],
      });
    });

    it('should provide helper methods for common operations', async () => {
      expect(typeof client.cancelEndpoint).toBe('function');
      expect(typeof client.getActiveWorkflows).toBe('function');
      expect(typeof client.waitForCompletion).toBe('function');
    });
  });

  describe('Workflow Error Handling', () => {
    it('should create a workflow with error handling', () => {
      const onError = vi.fn();
      const builder = workflows.withErrorHandling(onError);

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
    // Mock storage for testing
    const mockStorage = {
      processedIds: new Map<string, number>(),
      processedMessageIds: new Map<string, number>(),
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
      const mockContext = createMockContext(
        {},
        {
          headers: { 'upstash-message-id': 'test-message-id' },
        },
        vi.fn,
      );

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
      const result = isDuplicateId('test-id-2', { skip: true, storage: mockStorage });
      expect(result).toBe(false);
    });
  });
});
