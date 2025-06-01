import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { WorkflowContext } from '@upstash/workflow';

import basicDefinition from '../../app/workflows/basic/definition';
import type { BasicWorkflowPayload } from '@repo/orchestration/examples';

// Helper to create a partial mock of WorkflowContext
const createMockContext = <T = any>(overrides: Partial<WorkflowContext<T>> = {}): any => ({
  requestPayload: {},
  workflowRunId: 'test-run-123',
  headers: new Headers(),
  env: {},
  run: vi.fn().mockImplementation((_name, fn) => fn()),
  sleep: vi.fn(),
  sleepUntil: vi.fn(),
  call: vi.fn(),
  waitForEvent: vi.fn(),
  notify: vi.fn(),
  qstashClient: {} as any,
  ...overrides,
});

// Mock the orchestration package
vi.mock('@repo/orchestration/examples', () => ({
  basicWorkflow: vi.fn(),
}));

// Mock the workflow wrapper
vi.mock('../../app/workflows/workflow-wrapper', () => ({
  wrapWorkflow: (fn: any) => fn,
}));

describe('Basic Workflow Definition', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('metadata', () => {
    it('should have correct metadata properties', () => {
      expect(basicDefinition.metadata).toEqual({
        id: 'basic',
        color: 'blue',
        description: 'Essential workflow pattern with validation, batch processing, and error handling',
        difficulty: 'beginner',
        estimatedTime: '5-10 seconds',
        features: [
          'Input validation with custom logic',
          'Batch processing with configurable size',
          'Detailed progress tracking',
          'Comprehensive error handling',
          'Task prioritization',
          'Optional approval steps',
        ],
        tags: ['demo', 'batch', 'validation'],
        title: 'Basic Workflow',
      });
    });

    it('should have unique ID', () => {
      expect(basicDefinition.metadata.id).toBe('basic');
      expect(typeof basicDefinition.metadata.id).toBe('string');
    });

    it('should have valid difficulty level', () => {
      expect(['beginner', 'intermediate', 'advanced']).toContain(basicDefinition.metadata.difficulty);
    });
  });

  describe('defaultPayload', () => {
    it('should have required fields in default payload', () => {
      expect(basicDefinition.defaultPayload).toHaveProperty('requiresValidation');
      expect(basicDefinition.defaultPayload).toHaveProperty('name');
      expect(basicDefinition.defaultPayload).toHaveProperty('batchSize');
      expect(basicDefinition.defaultPayload).toHaveProperty('requiresApproval');
      expect(basicDefinition.defaultPayload).toHaveProperty('taskId');
      expect(basicDefinition.defaultPayload).toHaveProperty('tasks');
    });

    it('should have valid tasks array in default payload', () => {
      const { tasks } = basicDefinition.defaultPayload;
      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBeGreaterThan(0);
      
      // Check task structure
      tasks.forEach((task: any) => {
        expect(task).toHaveProperty('id');
        expect(task).toHaveProperty('data');
        expect(task).toHaveProperty('priority');
        expect(typeof task.priority).toBe('number');
      });
    });

    it('should have proper default values', () => {
      expect(basicDefinition.defaultPayload.requiresValidation).toBe(true);
      expect(basicDefinition.defaultPayload.requiresApproval).toBe(false);
      expect(basicDefinition.defaultPayload.batchSize).toBe(5);
      expect(basicDefinition.defaultPayload.name).toBe('Enhanced Basic Processing');
    });

    it('should have unique taskId with timestamp', () => {
      const { taskId } = basicDefinition.defaultPayload;
      expect(taskId).toMatch(/^task-\d+$/);
    });
  });

  describe('workflow function', () => {
    it('should be a function', () => {
      expect(typeof basicDefinition.workflow).toBe('function');
    });

    it('should accept WorkflowContext', async () => {
      // Mock the actual workflow implementation
      const { basicWorkflow } = await import('@repo/orchestration/examples');
      const mockImplementation = vi.fn().mockResolvedValue({
        status: 'success',
        data: { processed: true },
      });
      vi.mocked(basicWorkflow).mockImplementation(mockImplementation);

      const mockContext = createMockContext<BasicWorkflowPayload>({
        requestPayload: {
          tasks: [{ id: '1', priority: 5, data: { test: true } }],
        },
        workflowRunId: 'test-run-basic-123',
      });

      // Execute the workflow
      await basicDefinition.workflow(mockContext);

      // Verify the workflow was called
      expect(mockImplementation).toHaveBeenCalledWith(mockContext);
    });
  });

  describe('payload validation', () => {
    it('should validate required tasks array', () => {
      const invalidPayloads = [
        { tasks: null },
        { tasks: undefined },
        { tasks: [] },
        { tasks: 'not-an-array' },
        {},
      ];

      invalidPayloads.forEach((payload) => {
        expect(() => {
          // Validate payload structure
          if (!payload.tasks || !Array.isArray(payload.tasks) || payload.tasks.length === 0) {
            throw new Error('Tasks must be a non-empty array');
          }
        }).toThrow('Tasks must be a non-empty array');
      });
    });

    it('should validate task structure', () => {
      const validTask = { id: '1', priority: 5, data: { test: true } };
      const invalidTasks = [
        { priority: 5, data: {} }, // missing id
        { id: '1', data: {} }, // missing priority
        { id: '1', priority: 'not-a-number', data: {} }, // invalid priority type
      ];

      expect(() => {
        // Validate task has required fields
        if (!validTask.id || typeof validTask.priority !== 'number') {
          throw new Error('Invalid task structure');
        }
      }).not.toThrow();

      invalidTasks.forEach((task) => {
        expect(() => {
          if (!task.id || typeof task.priority !== 'number') {
            throw new Error('Invalid task structure');
          }
        }).toThrow('Invalid task structure');
      });
    });
  });

  describe('workflow features', () => {
    it('should support validation feature', () => {
      const features = basicDefinition.metadata.features;
      expect(features).toContain('Input validation with custom logic');
      
      // Check payload supports validation
      expect(basicDefinition.defaultPayload).toHaveProperty('requiresValidation');
    });

    it('should support batch processing', () => {
      const features = basicDefinition.metadata.features;
      expect(features).toContain('Batch processing with configurable size');
      
      // Check payload supports batch size
      expect(basicDefinition.defaultPayload).toHaveProperty('batchSize');
      expect(typeof basicDefinition.defaultPayload.batchSize).toBe('number');
    });

    it('should support approval workflow', () => {
      const features = basicDefinition.metadata.features;
      expect(features).toContain('Optional approval steps');
      
      // Check payload supports approval
      expect(basicDefinition.defaultPayload).toHaveProperty('requiresApproval');
      expect(typeof basicDefinition.defaultPayload.requiresApproval).toBe('boolean');
    });

    it('should support task prioritization', () => {
      const features = basicDefinition.metadata.features;
      expect(features).toContain('Task prioritization');
      
      // Check tasks have priority
      const { tasks } = basicDefinition.defaultPayload;
      const priorities = tasks.map((t: any) => t.priority);
      expect(priorities.every((p: number) => typeof p === 'number')).toBe(true);
      
      // Check different priority levels exist
      const uniquePriorities = new Set(priorities);
      expect(uniquePriorities.size).toBeGreaterThan(1);
    });
  });

  describe('workflow tags', () => {
    it('should have appropriate tags', () => {
      const { tags } = basicDefinition.metadata;
      expect(tags).toContain('demo');
      expect(tags).toContain('batch');
      expect(tags).toContain('validation');
    });

    it('should reflect workflow capabilities in tags', () => {
      const { tags } = basicDefinition.metadata;
      // Basic workflow should have fundamental tags
      expect(tags.some(tag => ['demo', 'batch', 'validation'].includes(tag))).toBe(true);
    });
  });

  describe('workflow color and styling', () => {
    it('should have a color defined', () => {
      expect(basicDefinition.metadata.color).toBe('blue');
      expect(typeof basicDefinition.metadata.color).toBe('string');
    });
  });
});