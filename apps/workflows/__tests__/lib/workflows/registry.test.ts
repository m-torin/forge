import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WorkflowRegistry } from '@/lib/workflows/registry';

// Mock the workflow modules
vi.mock('/test/workflows/test-workflow.ts', () => ({
  default: {
    id: 'test-workflow',
    name: 'Test Workflow',
    handler: vi.fn().mockResolvedValue({ result: 'success' }),
  },
}));

vi.mock('/test/workflows/another-workflow.ts', () => ({
  default: {
    id: 'another-workflow',
    name: 'Another Workflow',
    handler: vi.fn().mockResolvedValue({ result: 'success' }),
  },
}));

describe('WorkflowRegistry', () => {
  let registry: WorkflowRegistry;

  // Mock workflow definition
  const mockWorkflow = {
    id: 'test-workflow',
    name: 'Test Workflow',
    description: 'A test workflow',
    version: '1.0.0',
    category: 'test',
    tags: ['test', 'example'],
    author: 'Test Author',
    timeout: 30000,
    retries: 2,
    concurrency: 1,
    filePath: '/test/workflows/test-workflow.ts',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
  };

  const mockWorkflow2 = {
    ...mockWorkflow,
    id: 'another-workflow',
    name: 'Another Workflow',
    category: 'other',
    tags: ['other'],
    filePath: '/test/workflows/another-workflow.ts',
  };

  beforeEach(() => {
    registry = new WorkflowRegistry('./test-workflows');
    vi.clearAllMocks();

    // Set up default import mock
    const mockImport = vi.fn().mockImplementation((path) => {
      if (path === mockWorkflow.filePath) {
        return Promise.resolve({
          default: { ...mockWorkflow, handler: vi.fn().mockResolvedValue({ result: 'success' }) },
        });
      }
      return Promise.reject(new Error(`Cannot find module '${path}'`));
    });
    vi.stubGlobal('import', mockImport);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('workflow management', () => {
    it('should register and retrieve workflows', async () => {
      await registry.registerWorkflow(mockWorkflow);

      const workflows = registry.getWorkflows();
      expect(workflows).toHaveLength(1);
      expect(workflows[0]).toEqual(mockWorkflow);
    });

    it('should get workflow by ID', async () => {
      await registry.registerWorkflow(mockWorkflow);

      const workflow = registry.getWorkflow('test-workflow');
      expect(workflow).toEqual(mockWorkflow);
    });

    it('should return undefined for non-existent workflow', () => {
      const workflow = registry.getWorkflow('non-existent');
      expect(workflow).toBeUndefined();
    });

    it('should filter workflows by category', async () => {
      await registry.registerWorkflow(mockWorkflow);
      await registry.registerWorkflow(mockWorkflow2);

      const testWorkflows = registry.getWorkflowsByCategory('test');
      expect(testWorkflows).toHaveLength(1);
      expect(testWorkflows[0].id).toBe('test-workflow');
    });

    it('should filter workflows by tag', async () => {
      await registry.registerWorkflow(mockWorkflow);
      await registry.registerWorkflow(mockWorkflow2);

      const exampleWorkflows = registry.getWorkflowsByTag('example');
      expect(exampleWorkflows).toHaveLength(1);
      expect(exampleWorkflows[0].id).toBe('test-workflow');
    });

    it('should search workflows by text', async () => {
      await registry.registerWorkflow(mockWorkflow);
      await registry.registerWorkflow(mockWorkflow2);

      const results = registry.searchWorkflows('example');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('test-workflow');
    });

    it('should search workflows by description', async () => {
      await registry.registerWorkflow(mockWorkflow);
      await registry.registerWorkflow({
        ...mockWorkflow2,
        description: 'Another different workflow',
      });

      const results = registry.searchWorkflows('test workflow');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('test-workflow');
    });

    it('should search workflows by tags', async () => {
      await registry.registerWorkflow(mockWorkflow);
      await registry.registerWorkflow(mockWorkflow2);

      const results = registry.searchWorkflows('example');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('test-workflow');
    });
  });

  describe('workflow execution', () => {
    it('should execute workflow successfully', async () => {
      await registry.registerWorkflow(mockWorkflow);

      const result = await registry.executeWorkflow('test-workflow', { input: 'test' });

      expect(result).toEqual({ result: 'success' });
    });

    it('should throw error for non-existent workflow', async () => {
      await expect(registry.executeWorkflow('non-existent', {})).rejects.toThrow(
        'Workflow not found: non-existent',
      );
    });

    it('should handle execution errors', async () => {
      // Re-mock with error
      vi.doMock('/test/workflows/test-workflow.ts', () => ({
        default: {
          id: 'test-workflow',
          name: 'Test Workflow',
          handler: vi.fn().mockRejectedValue(new Error('Execution failed')),
        },
      }));

      await registry.registerWorkflow(mockWorkflow);

      await expect(registry.executeWorkflow('test-workflow', {})).rejects.toThrow(
        'Execution failed',
      );
    });
  });

  describe('metadata operations', () => {
    it('should get all categories', async () => {
      await registry.registerWorkflow(mockWorkflow);
      await registry.registerWorkflow(mockWorkflow2);

      const categories = registry.getCategories();
      expect(categories).toEqual(['other', 'test']);
    });

    it('should get all tags', async () => {
      await registry.registerWorkflow(mockWorkflow);
      await registry.registerWorkflow(mockWorkflow2);

      const tags = registry.getTags();
      expect(tags).toEqual(['example', 'other', 'test']);
    });

    it('should get workflow statistics', async () => {
      await registry.registerWorkflow(mockWorkflow);
      await registry.registerWorkflow(mockWorkflow2);

      const stats = registry.getStats();
      expect(stats).toEqual({
        total: 2,
        categories: 2,
        tags: 3,
        byCategory: {
          test: 1,
          other: 1,
        },
      });
    });
  });

  describe('subscription system', () => {
    it('should allow subscribing to workflow changes', () => {
      const callback = vi.fn();
      const unsubscribe = registry.subscribe(callback);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should notify subscribers of workflow changes', async () => {
      const callback = vi.fn();
      registry.subscribe(callback);

      await registry.registerWorkflow(mockWorkflow);

      expect(callback).toHaveBeenCalledWith([mockWorkflow]);
    });

    it('should allow unsubscribing from changes', async () => {
      const callback = vi.fn();
      const unsubscribe = registry.subscribe(callback);

      unsubscribe();

      await registry.registerWorkflow(mockWorkflow);

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
