import { beforeEach, describe, expect, test, vi } from 'vitest';

import { WorkflowClient, type WorkflowClientConfig } from '#/client';
import { WorkflowExecution } from '#/shared/types';

import { createTestWorkflow } from './fixtures';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('workflow Client', () => {
  let client: WorkflowClient;
  const mockConfig: WorkflowClientConfig = {
    apiKey: 'test-key',
    baseUrl: 'http://localhost:3000',
    enableRetries: true,
    timeout: 5000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    client = new WorkflowClient(mockConfig);
  });

  describe('client Creation', () => {
    test('should create client with valid config', () => {
      expect(client).toBeDefined();
    });

    test('should throw error with invalid config', () => {
      // WorkflowClient constructor validates required fields
      expect(() => new WorkflowClient({ baseUrl: '' } as any)).toThrow('baseUrl is required');
      expect(() => new WorkflowClient({ apiKey: '', baseUrl: 'http://localhost' } as any)).toThrow(
        'apiKey cannot be empty string',
      );
    });
  });

  describe('workflow Execution', () => {
    const mockWorkflow = createTestWorkflow();

    test('should submit workflow successfully', async () => {
      const mockResponse = {
        executionId: 'exec_123',
        status: 'running',
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
        ok: true,
      });

      const result = await client.submitWorkflow(mockWorkflow, { test: 'data' });
      expect(result).toStrictEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/workflows/execute',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-key',
            'Content-Type': 'application/json',
          }),
          method: 'POST',
        }),
      );
    });

    test('should handle execution errors', async () => {
      // Create client with retries disabled for faster error tests
      const errorClient = new WorkflowClient({
        ...mockConfig,
        enableRetries: false,
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(errorClient.submitWorkflow(mockWorkflow, {})).rejects.toThrow(
        'HTTP 500: Internal Server Error',
      );
    });
  });

  describe('execution Status', () => {
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

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockStatus),
        ok: true,
      });

      const status = await client.getExecutionStatus('exec_123');
      expect(status).toStrictEqual(mockStatus);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/workflows/executions/exec_123',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-key',
          }),
          method: 'GET',
        }),
      );
    });

    test('should return null for non-existent execution', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const status = await client.getExecutionStatus('exec_123');
      expect(status).toBeNull();
    });
  });

  describe('execution Management', () => {
    test('should cancel execution', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ cancelled: true }),
        ok: true,
      });

      const result = await client.cancelExecution('exec_123');
      expect(result).toBeTruthy();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/workflows/executions/exec_123/cancel',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-key',
          }),
          method: 'POST',
        }),
      );
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

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockExecutions),
        ok: true,
      });

      const executions = await client.listExecutions('test-workflow', {
        limit: 10,
        status: ['completed', 'running'],
      });

      expect(executions).toStrictEqual(mockExecutions);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/workflows/test-workflow/executions?limit=10&status=completed%2Crunning',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-key',
          }),
          method: 'GET',
        }),
      );
    });
  });

  describe('error Handling', () => {
    test('should handle network errors', async () => {
      // Create client with retries disabled for faster error tests
      const errorClient = new WorkflowClient({
        ...mockConfig,
        enableRetries: false,
      });

      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      await expect(errorClient.getExecutionStatus('exec_123')).rejects.toThrow('Network error');
    });

    test('should handle timeout', async () => {
      // Create client with retries disabled for faster error tests
      const errorClient = new WorkflowClient({
        ...mockConfig,
        enableRetries: false,
      });

      mockFetch.mockRejectedValueOnce(new Error('Timeout'));
      await expect(errorClient.getExecutionStatus('exec_123')).rejects.toThrow('Timeout');
    });
  });
});
