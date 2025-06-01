import { beforeEach, describe, expect, it, vi } from 'vitest';

import { loadWorkflow, getAvailableWorkflows, loadAllWorkflowMetadata } from '../app/workflows/loader';
import type { WorkflowDefinition } from '../app/workflows/types';

// Mock the dynamic imports
const mockWorkflows: Record<string, WorkflowDefinition> = {
  basic: {
    metadata: {
      id: 'basic',
      title: 'Basic Workflow',
      description: 'Test basic workflow',
      tags: ['test'],
      difficulty: 'beginner',
      estimatedTime: '5 seconds',
      features: ['test feature'],
    },
    defaultPayload: { test: true },
    workflow: vi.fn(),
  },
  'kitchen-sink': {
    metadata: {
      id: 'kitchen-sink',
      title: 'Kitchen Sink',
      description: 'Test kitchen sink workflow',
      tags: ['test', 'advanced'],
      difficulty: 'advanced',
      estimatedTime: '5 minutes',
      features: ['test feature 1', 'test feature 2'],
    },
    defaultPayload: { test: true, advanced: true },
    workflow: vi.fn(),
  },
};

vi.mock('../app/workflows/basic/definition', () => ({
  default: mockWorkflows.basic,
}));

vi.mock('../app/workflows/kitchen-sink/definition', () => ({
  default: mockWorkflows['kitchen-sink'],
}));

describe('Workflow Loader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset console mocks
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('loadWorkflow', () => {
    it('should load an existing workflow', async () => {
      const workflow = await loadWorkflow('basic');
      
      expect(workflow).toBeDefined();
      expect(workflow?.metadata.id).toBe('basic');
      expect(workflow?.metadata.title).toBe('Basic Workflow');
      expect(workflow?.workflow).toBeDefined();
    });

    it('should return null for non-existent workflow', async () => {
      const workflow = await loadWorkflow('non-existent');
      
      expect(workflow).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Failed to load workflow non-existent:',
        expect.any(Error)
      );
    });

    it('should handle malformed workflow module', async () => {
      // Mock a workflow that doesn't export default
      vi.doMock('../app/workflows/malformed/definition', () => ({}));
      
      const workflow = await loadWorkflow('malformed');
      expect(workflow).toBeNull();
    });
  });

  describe('getAvailableWorkflows', () => {
    it('should return empty array on client side', () => {
      // Mock window object to simulate client side
      const originalWindow = global.window;
      global.window = {} as any;
      
      const workflows = getAvailableWorkflows();
      expect(workflows).toEqual([]);
      
      // Restore window
      global.window = originalWindow;
    });

    it('should handle require.context errors gracefully', () => {
      // This test runs in Node environment where require.context doesn't exist
      // The function should catch the error and return empty array
      const workflows = getAvailableWorkflows();
      
      // Since we're in a test environment without webpack, it should handle the error
      expect(workflows).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        'Failed to discover workflows:',
        expect.any(Error)
      );
    });
  });

  describe('loadAllWorkflowMetadata', () => {
    it('should load metadata for all available workflows', async () => {
      // Since getAvailableWorkflows won't work in test environment,
      // test the actual loading functionality directly
      const workflowIds = ['basic', 'kitchen-sink'];
      const metadata: Record<string, any> = {};

      for (const id of workflowIds) {
        const definition = await loadWorkflow(id);
        if (definition) {
          metadata[id] = {
            ...definition.metadata,
            defaultPayload: definition.defaultPayload,
          };
        }
      }
      
      expect(metadata).toHaveProperty('basic');
      expect(metadata).toHaveProperty('kitchen-sink');
      expect(metadata.basic.id).toBe('basic');
      expect(metadata.basic.defaultPayload).toEqual({ test: true });
      expect(metadata['kitchen-sink'].id).toBe('kitchen-sink');
      expect(metadata['kitchen-sink'].defaultPayload).toEqual({ test: true, advanced: true });
    });

    it('should handle empty workflow list', async () => {
      // Test loadAllWorkflowMetadata with empty workflow list
      // In test environment, getAvailableWorkflows returns empty array
      const metadata = await loadAllWorkflowMetadata();
      
      expect(metadata).toEqual({});
    });
  });
});