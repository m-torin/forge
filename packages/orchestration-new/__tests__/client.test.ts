import { describe, test, expect, beforeEach, vi } from 'vitest';
import { WorkflowClient, type WorkflowClientConfig } from '../src/client';
import type { WorkflowExecution, WorkflowDefinition } from '../src/shared/types';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Workflow Client', () => {
  let client: WorkflowClient;
  const mockConfig: WorkflowClientConfig = {
    baseUrl: 'http://localhost:3000',
    apiKey: 'test-key',
    enableRetries: true,
    timeout: 5000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    client = new WorkflowClient(mockConfig);
  });

  describe('Client Creation', () => {
    test('should create client with valid config', () => {
      expect(client).toBeDefined();
    });

    test('should throw error with invalid config', () => {
      expect(() => new WorkflowClient({} as any)).toThrow();
    });
  });

  describe('Workflow Execution', () => {
    const mockWorkflow: WorkflowDefinition = {
      id: 'test-workflow',
      name: 'Test Workflow',
      version: '1.0.0',
      steps: [],
    };

    test('should submit workflow successfully', async () => {
      const mockResponse = {
        executionId: 'exec_123',
        status: 'running',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await client.submitWorkflow(mockWorkflow, { test: 'data' });
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/workflows/execute',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-key',
          }),
        }),
      );
    });

    test('should handle execution errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(client.submitWorkflow(mockWorkflow, {})).rejects.toThrow(
        'HTTP 500: Internal Server Error',
      );
    });
  });

  describe('Execution Status', () => {
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

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStatus),
      });

      const status = await client.getExecutionStatus('exec_123');
      expect(status).toEqual(mockStatus);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/workflows/executions/exec_123',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-key',
          }),
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

  describe('Execution Management', () => {
    test('should cancel execution', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cancelled: true }),
      });

      const result = await client.cancelExecution('exec_123');
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/workflows/executions/exec_123/cancel',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-key',
          }),
        }),
      );
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

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockExecutions),
      });

      const executions = await client.listExecutions('test-workflow', {
        limit: 10,
        status: ['completed', 'running'],
      });

      expect(executions).toEqual(mockExecutions);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/workflows/test-workflow/executions?limit=10&status=completed%2Crunning',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-key',
          }),
        }),
      );
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      await expect(client.getExecutionStatus('exec_123')).rejects.toThrow('Network error');
    });

    test('should handle timeout', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Timeout'));
      await expect(client.getExecutionStatus('exec_123')).rejects.toThrow('Timeout');
    });
  });
});
