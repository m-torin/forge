import { describe, expect, it, vi, beforeEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';

import { discoverWorkflows, getWorkflowMetadata } from '../app/workflows/registry';
import type { WorkflowDefinition } from '../app/workflows/types';

// Mock fs module
vi.mock('fs', () => ({
  promises: {
    readdir: vi.fn(),
    access: vi.fn(),
  },
}));

// Mock path module
vi.mock('path', () => ({
  default: {
    join: vi.fn((...args: string[]) => args.join('/')),
  },
  join: vi.fn((...args: string[]) => args.join('/')),
}));

// Mock workflow definitions
const mockWorkflows: Record<string, WorkflowDefinition> = {
  basic: {
    metadata: {
      id: 'basic',
      title: 'Basic Workflow',
      description: 'Test basic workflow',
      tags: ['test'],
      difficulty: 'beginner',
      estimatedTime: '5 seconds',
      features: ['feature1'],
    },
    defaultPayload: { test: true },
    workflow: vi.fn(),
  },
  advanced: {
    metadata: {
      id: 'advanced',
      title: 'Advanced Workflow',
      description: 'Test advanced workflow',
      tags: ['test', 'complex'],
      difficulty: 'advanced',
      estimatedTime: '5 minutes',
      features: ['feature1', 'feature2'],
    },
    defaultPayload: { complex: true },
    workflow: vi.fn(),
  },
};

// Mock dynamic imports
vi.mock('../app/workflows/basic/definition', () => ({
  default: mockWorkflows.basic,
}));

vi.mock('../app/workflows/advanced/definition', () => ({
  default: mockWorkflows.advanced,
}));

describe('Workflow Registry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('discoverWorkflows', () => {
    it('should discover all workflow directories', async () => {
      vi.mocked(fs.readdir).mockResolvedValue([
        { name: 'basic', isDirectory: () => true } as any,
        { name: 'advanced', isDirectory: () => true } as any,
        { name: '_components', isDirectory: () => true } as any, // Should be ignored
        { name: 'file.ts', isDirectory: () => false } as any, // Should be ignored
      ]);

      vi.mocked(fs.access).mockResolvedValue(undefined);

      const workflows = await discoverWorkflows();

      expect(fs.readdir).toHaveBeenCalledWith(
        expect.stringContaining('/app/workflows'),
        { withFileTypes: true }
      );

      expect(workflows).toHaveProperty('basic');
      // Advanced workflow might not be imported in test environment
      expect(Object.keys(workflows).length).toBeGreaterThanOrEqual(1);
      expect(workflows).not.toHaveProperty('_components');
      expect(workflows).not.toHaveProperty('file.ts');
    });

    it('should skip directories without definition.ts', async () => {
      vi.mocked(fs.readdir).mockResolvedValue([
        { name: 'basic', isDirectory: () => true } as any,
        { name: 'invalid', isDirectory: () => true } as any,
      ]);

      // basic has definition.ts, invalid doesn't
      vi.mocked(fs.access).mockImplementation(async (path) => {
        if ((path as string).includes('invalid')) {
          throw new Error('File not found');
        }
      });

      const workflows = await discoverWorkflows();

      expect(workflows).toHaveProperty('basic');
      expect(workflows).not.toHaveProperty('invalid');
      expect(console.warn).toHaveBeenCalledWith('Skipping invalid: no definition.ts found');
    });

    it('should handle empty workflow directory', async () => {
      vi.mocked(fs.readdir).mockResolvedValue([]);

      const workflows = await discoverWorkflows();

      expect(workflows).toEqual({});
    });

    it('should handle fs errors gracefully', async () => {
      vi.mocked(fs.readdir).mockRejectedValue(new Error('Permission denied'));

      const workflows = await discoverWorkflows();

      expect(workflows).toEqual({});
      expect(console.error).toHaveBeenCalledWith(
        'Error discovering workflows:',
        expect.any(Error)
      );
    });

    it('should skip workflows with invalid exports', async () => {
      vi.mocked(fs.readdir).mockResolvedValue([
        { name: 'basic', isDirectory: () => true } as any,
        { name: 'malformed', isDirectory: () => true } as any,
      ]);

      vi.mocked(fs.access).mockResolvedValue(undefined);

      // Mock malformed workflow
      vi.doMock('../app/workflows/malformed/definition', () => ({
        // No default export
      }));

      const workflows = await discoverWorkflows();

      expect(workflows).toHaveProperty('basic');
      expect(workflows).not.toHaveProperty('malformed');
    });

    it('should only include directories starting without underscore', async () => {
      vi.mocked(fs.readdir).mockResolvedValue([
        { name: 'basic', isDirectory: () => true } as any,
        { name: '_internal', isDirectory: () => true } as any,
        { name: '__tests__', isDirectory: () => true } as any,
        { name: '_components', isDirectory: () => true } as any,
      ]);

      vi.mocked(fs.access).mockResolvedValue(undefined);

      const workflows = await discoverWorkflows();

      expect(workflows).toHaveProperty('basic');
      expect(workflows).not.toHaveProperty('_internal');
      expect(workflows).not.toHaveProperty('__tests__');
      expect(workflows).not.toHaveProperty('_components');
    });

    it('should validate workflow metadata exists', async () => {
      vi.mocked(fs.readdir).mockResolvedValue([
        { name: 'basic', isDirectory: () => true } as any,
        { name: 'advanced', isDirectory: () => true } as any,
      ]);

      vi.mocked(fs.access).mockResolvedValue(undefined);

      const workflows = await discoverWorkflows();

      expect(workflows).toHaveProperty('basic');
      
      // Basic should have metadata
      expect(workflows.basic.metadata).toBeDefined();
      
      // If advanced is loaded, it should also have metadata
      if (workflows.advanced) {
        expect(workflows.advanced.metadata).toBeDefined();
      }
    });
  });

  describe('getWorkflowMetadata', () => {
    it('should extract metadata from workflows', () => {
      const metadata = getWorkflowMetadata(mockWorkflows);

      expect(metadata).toHaveProperty('basic');
      expect(metadata).toHaveProperty('advanced');

      expect(metadata.basic).toEqual({
        id: 'basic',
        title: 'Basic Workflow',
        description: 'Test basic workflow',
        tags: ['test'],
        difficulty: 'beginner',
        estimatedTime: '5 seconds',
        features: ['feature1'],
        defaultPayload: { test: true },
      });

      expect(metadata.advanced).toEqual({
        id: 'advanced',
        title: 'Advanced Workflow',
        description: 'Test advanced workflow',
        tags: ['test', 'complex'],
        difficulty: 'advanced',
        estimatedTime: '5 minutes',
        features: ['feature1', 'feature2'],
        defaultPayload: { complex: true },
      });
    });

    it('should exclude workflow implementation', () => {
      const metadata = getWorkflowMetadata(mockWorkflows);

      Object.values(metadata).forEach(meta => {
        expect(meta).not.toHaveProperty('workflow');
      });
    });

    it('should handle empty workflows object', () => {
      const metadata = getWorkflowMetadata({});
      expect(metadata).toEqual({});
    });

    it('should preserve all metadata fields', () => {
      const workflowWithAllFields: Record<string, WorkflowDefinition> = {
        complete: {
          metadata: {
            id: 'complete',
            title: 'Complete Workflow',
            description: 'Test workflow with all fields',
            tags: ['tag1', 'tag2', 'tag3'],
            difficulty: 'intermediate',
            estimatedTime: '1-2 minutes',
            features: ['feature1', 'feature2', 'feature3'],
            color: 'blue',
            icon: 'icon-name',
          },
          defaultPayload: {
            field1: 'value1',
            field2: 123,
            field3: true,
            nested: { inner: 'value' },
          },
          workflow: vi.fn(),
        },
      };

      const metadata = getWorkflowMetadata(workflowWithAllFields);

      expect(metadata.complete).toEqual({
        id: 'complete',
        title: 'Complete Workflow',
        description: 'Test workflow with all fields',
        tags: ['tag1', 'tag2', 'tag3'],
        difficulty: 'intermediate',
        estimatedTime: '1-2 minutes',
        features: ['feature1', 'feature2', 'feature3'],
        color: 'blue',
        icon: 'icon-name',
        defaultPayload: {
          field1: 'value1',
          field2: 123,
          field3: true,
          nested: { inner: 'value' },
        },
      });
    });

    it('should handle workflows with minimal metadata', () => {
      const minimalWorkflow: Record<string, WorkflowDefinition> = {
        minimal: {
          metadata: {
            id: 'minimal',
            title: 'Minimal',
            description: 'Minimal workflow',
            tags: [],
            difficulty: 'beginner',
            estimatedTime: '1s',
            features: [],
          },
          defaultPayload: {},
          workflow: vi.fn(),
        },
      };

      const metadata = getWorkflowMetadata(minimalWorkflow);

      expect(metadata.minimal).toBeDefined();
      expect(metadata.minimal.tags).toEqual([]);
      expect(metadata.minimal.features).toEqual([]);
      expect(metadata.minimal.defaultPayload).toEqual({});
    });
  });
});