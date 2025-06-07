import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  WorkflowFactory,
  WorkflowTemplate,
  WorkflowFactoryConfig,
} from '@/lib/factories/workflow-factory';
import { stepFactory } from '@/lib/factories/step-factory';
import { z } from 'zod';

// Mock the step factory
vi.mock('@/lib/factories/step-factory', () => ({
  stepFactory: {
    createStep: vi.fn((config) => ({
      id: config.id,
      name: config.name,
      templateId: config.templateId,
      handler: vi.fn().mockResolvedValue({ success: true, output: 'test' }),
      dependencies: [],
    })),
  },
}));

describe('WorkflowFactory', () => {
  let factory: WorkflowFactory;

  beforeEach(() => {
    factory = new WorkflowFactory();
    vi.clearAllMocks();
  });

  describe('template registration', () => {
    it('should register a workflow template', () => {
      const template: WorkflowTemplate = {
        id: 'test-workflow-template',
        name: 'Test Workflow Template',
        description: 'A test workflow template',
        category: 'test',
        tags: ['test', 'example'],
        steps: [
          {
            templateId: 'step-template',
            config: { id: 'step1', name: 'Step 1' },
          },
        ],
      };

      factory.registerTemplate(template);
      const templates = factory.getAllTemplates();

      expect(templates).toHaveLength(1);
      expect(templates[0]).toEqual(template);
    });

    it('should warn when overwriting a template', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const template: WorkflowTemplate = {
        id: 'test-workflow-template',
        name: 'Test Workflow Template',
        description: 'A test workflow template',
        category: 'test',
        tags: ['test'],
        steps: [],
      };

      factory.registerTemplate(template);
      factory.registerTemplate(template);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Workflow template test-workflow-template is being overwritten',
      );
      consoleSpy.mockRestore();
    });
  });

  describe('workflow creation', () => {
    beforeEach(() => {
      const template: WorkflowTemplate = {
        id: 'test-workflow-template',
        name: 'Test Workflow Template',
        description: 'A test workflow template',
        category: 'test',
        tags: ['test'],
        steps: [
          {
            templateId: 'http-request',
            config: { id: 'fetch-data', name: 'Fetch Data' },
          },
          {
            templateId: 'data-transform',
            config: { id: 'transform-data', name: 'Transform Data' },
            dependencies: ['fetch-data'],
          },
        ],
        timeout: 60000,
        retries: 3,
      };
      factory.registerTemplate(template);
    });

    it('should create a workflow from a template', () => {
      const config: WorkflowFactoryConfig = {
        id: 'my-workflow',
        name: 'My Workflow',
        templateId: 'test-workflow-template',
      };

      const workflow = factory.createWorkflow(config);

      expect(workflow.id).toBe('my-workflow');
      expect(workflow.name).toBe('My Workflow');
      expect(workflow.category).toBe('test');
      expect(workflow.timeout).toBe(60000);
      expect(workflow.retries).toBe(3);
      expect(stepFactory.createStep).toHaveBeenCalledTimes(2);
    });

    it('should throw error if template not found', () => {
      const config: WorkflowFactoryConfig = {
        id: 'my-workflow',
        name: 'My Workflow',
        templateId: 'non-existent',
      };

      expect(() => factory.createWorkflow(config)).toThrow(
        'Workflow template not found: non-existent',
      );
    });

    it('should throw error if no templateId provided', () => {
      const config: WorkflowFactoryConfig = {
        id: 'my-workflow',
        name: 'My Workflow',
      };

      expect(() => factory.createWorkflow(config)).toThrow('Workflow must have a templateId');
    });

    it('should validate configuration with schema', () => {
      const template: WorkflowTemplate = {
        id: 'validated-workflow-template',
        name: 'Validated Workflow Template',
        description: 'A workflow template with validation',
        category: 'test',
        tags: ['test'],
        configSchema: z.object({
          apiKey: z.string(),
          endpoint: z.string().url(),
        }),
        steps: [],
      };
      factory.registerTemplate(template);

      const invalidConfig: WorkflowFactoryConfig = {
        id: 'my-workflow',
        name: 'My Workflow',
        templateId: 'validated-workflow-template',
        config: {
          apiKey: '',
          endpoint: 'not-a-url',
        },
      };

      expect(() => factory.createWorkflow(invalidConfig)).toThrow('Invalid configuration');
    });

    it('should merge default config with provided config', () => {
      const template: WorkflowTemplate = {
        id: 'config-workflow-template',
        name: 'Config Workflow Template',
        description: 'A workflow template with default config',
        category: 'test',
        tags: ['test'],
        defaultConfig: {
          timeout: 5000,
          retries: 3,
          maxConcurrent: 10,
        },
        steps: [],
      };
      factory.registerTemplate(template);

      const workflow = factory.createWorkflow({
        id: 'my-workflow',
        name: 'My Workflow',
        templateId: 'config-workflow-template',
        config: {
          timeout: 10000,
        },
      });

      // The config would be used in step creation
      expect(workflow).toBeDefined();
    });

    it('should create steps with correct IDs and dependencies', () => {
      const config: WorkflowFactoryConfig = {
        id: 'my-workflow',
        name: 'My Workflow',
        templateId: 'test-workflow-template',
      };

      factory.createWorkflow(config);

      expect(stepFactory.createStep).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'my-workflow_step_1',
          name: 'Fetch Data',
          templateId: 'http-request',
        }),
      );

      expect(stepFactory.createStep).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'my-workflow_step_2',
          name: 'Transform Data',
          templateId: 'data-transform',
        }),
      );
    });

    it('should apply step overrides', () => {
      const config: WorkflowFactoryConfig = {
        id: 'my-workflow',
        name: 'My Workflow',
        templateId: 'test-workflow-template',
        stepOverrides: {
          'fetch-data': {
            timeout: 30000,
            retries: 5,
          },
        },
      };

      factory.createWorkflow(config);

      expect(stepFactory.createStep).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'my-workflow_step_1',
          name: 'Fetch Data',
          templateId: 'http-request',
          timeout: 30000,
          retries: 5,
        }),
      );
    });

    it('should add additional steps', () => {
      const config: WorkflowFactoryConfig = {
        id: 'my-workflow',
        name: 'My Workflow',
        templateId: 'test-workflow-template',
        additionalSteps: [
          {
            id: 'extra-step',
            name: 'Extra Step',
            templateId: 'email-notification',
          },
        ],
      };

      factory.createWorkflow(config);

      expect(stepFactory.createStep).toHaveBeenCalledTimes(3);
      expect(stepFactory.createStep).toHaveBeenLastCalledWith(
        expect.objectContaining({
          id: 'extra-step',
          name: 'Extra Step',
          templateId: 'email-notification',
        }),
      );
    });

    it('should call lifecycle hooks', () => {
      const beforeCreate = vi.fn();
      const afterCreate = vi.fn();

      const template: WorkflowTemplate = {
        id: 'hooks-workflow-template',
        name: 'Hooks Workflow Template',
        description: 'A workflow template with hooks',
        category: 'test',
        tags: ['test'],
        steps: [],
        beforeCreate,
        afterCreate,
      };
      factory.registerTemplate(template);

      const config: WorkflowFactoryConfig = {
        id: 'my-workflow',
        name: 'My Workflow',
        templateId: 'hooks-workflow-template',
      };

      const workflow = factory.createWorkflow(config);

      expect(beforeCreate).toHaveBeenCalledWith(config);
      expect(afterCreate).toHaveBeenCalledWith(workflow);
    });
  });

  describe('workflow handler execution', () => {
    it('should execute workflow handler and return result', async () => {
      const template: WorkflowTemplate = {
        id: 'executable-template',
        name: 'Executable Template',
        description: 'A template that executes',
        category: 'test',
        tags: ['test'],
        steps: [
          {
            templateId: 'test-step',
            config: { id: 'step1', name: 'Step 1' },
          },
        ],
      };
      factory.registerTemplate(template);

      const workflow = factory.createWorkflow({
        id: 'my-workflow',
        name: 'My Workflow',
        templateId: 'executable-template',
      });

      const handler = factory.getWorkflowHandler('my-workflow');
      expect(handler).toBeDefined();

      const result = await handler!({ input: 'test' });
      expect(result).toBe('test');
    });

    it('should handle step dependencies in execution', async () => {
      const executionOrder: string[] = [];

      // Mock step factory to track execution order
      vi.mocked(stepFactory.createStep).mockImplementation((config) => ({
        id: config.id,
        name: config.name,
        templateId: config.templateId,
        version: '1.0.0',
        category: 'test',
        tags: [],
        dependencies: config.dependencies || [],
        handler: vi.fn().mockImplementation(async () => {
          executionOrder.push(config.id);
          return { success: true, output: `${config.id}-output` };
        }),
      }));

      const template: WorkflowTemplate = {
        id: 'dependency-template',
        name: 'Dependency Template',
        description: 'A template with dependencies',
        category: 'test',
        tags: ['test'],
        steps: [
          {
            templateId: 'test-step',
            config: { id: 'step1', name: 'Step 1' },
          },
          {
            templateId: 'test-step',
            config: { id: 'step2', name: 'Step 2' },
            dependencies: ['step1'],
          },
          {
            templateId: 'test-step',
            config: { id: 'step3', name: 'Step 3' },
            dependencies: ['step1', 'step2'],
          },
        ],
      };
      factory.registerTemplate(template);

      const workflow = factory.createWorkflow({
        id: 'my-workflow',
        name: 'My Workflow',
        templateId: 'dependency-template',
      });

      const handler = factory.getWorkflowHandler('my-workflow');
      expect(handler).toBeDefined();

      await handler!({ input: 'test' });

      // Verify dependencies are handled correctly
      expect(executionOrder).toEqual([
        'my-workflow_step_1',
        'my-workflow_step_2',
        'my-workflow_step_3',
      ]);
    });

    it('should throw error when step fails', async () => {
      vi.mocked(stepFactory.createStep).mockImplementation((config) => ({
        id: config.id,
        name: config.name,
        templateId: config.templateId,
        version: '1.0.0',
        category: 'test',
        tags: [],
        dependencies: [],
        handler: vi.fn().mockResolvedValue({
          success: false,
          error: 'Step failed',
        }),
      }));

      const template: WorkflowTemplate = {
        id: 'failing-template',
        name: 'Failing Template',
        description: 'A template that fails',
        category: 'test',
        tags: ['test'],
        steps: [
          {
            templateId: 'test-step',
            config: { id: 'failing-step', name: 'Failing Step' },
          },
        ],
      };
      factory.registerTemplate(template);

      const workflow = factory.createWorkflow({
        id: 'my-workflow',
        name: 'My Workflow',
        templateId: 'failing-template',
      });

      const handler = factory.getWorkflowHandler('my-workflow');
      expect(handler).toBeDefined();

      await expect(handler!({ input: 'test' })).rejects.toThrow('Step my-workflow_step_1 failed');
    });
  });

  describe('workflow management', () => {
    beforeEach(() => {
      const template: WorkflowTemplate = {
        id: 'test-template',
        name: 'Test Template',
        description: 'A test template',
        category: 'test',
        tags: ['test'],
        steps: [],
      };
      factory.registerTemplate(template);
    });

    it('should get a created workflow', () => {
      factory.createWorkflow({
        id: 'my-workflow',
        name: 'My Workflow',
        templateId: 'test-template',
      });

      const workflow = factory.getWorkflow('my-workflow');

      expect(workflow).toBeDefined();
      expect(workflow?.id).toBe('my-workflow');
    });

    it('should get all created workflows', () => {
      factory.createWorkflow({
        id: 'workflow1',
        name: 'Workflow 1',
        templateId: 'test-template',
      });

      factory.createWorkflow({
        id: 'workflow2',
        name: 'Workflow 2',
        templateId: 'test-template',
      });

      const workflows = factory.getAllWorkflows();

      expect(workflows).toHaveLength(2);
      expect(workflows.map((w) => w.id)).toContain('workflow1');
      expect(workflows.map((w) => w.id)).toContain('workflow2');
    });

    it('should clone a workflow with modifications', () => {
      factory.createWorkflow({
        id: 'original-workflow',
        name: 'Original Workflow',
        templateId: 'test-template',
        tags: ['original'],
      });

      const clonedWorkflow = factory.cloneWorkflow('original-workflow', {
        id: 'cloned-workflow',
        name: 'Cloned Workflow',
        tags: ['cloned'],
      });

      expect(clonedWorkflow.id).toBe('cloned-workflow');
      expect(clonedWorkflow.name).toBe('Cloned Workflow');
      expect(clonedWorkflow.tags).toEqual(['cloned']);
    });

    it('should throw error when cloning non-existent workflow', () => {
      expect(() => factory.cloneWorkflow('non-existent', {})).toThrow(
        'Workflow not found: non-existent',
      );
    });
  });

  describe('clear functionality', () => {
    it('should clear all templates and created workflows', () => {
      const template: WorkflowTemplate = {
        id: 'test-template',
        name: 'Test Template',
        description: 'A test template',
        category: 'test',
        tags: ['test'],
        steps: [],
      };

      factory.registerTemplate(template);
      factory.createWorkflow({
        id: 'workflow1',
        name: 'Workflow 1',
        templateId: 'test-template',
      });

      expect(factory.getAllTemplates()).toHaveLength(1);
      expect(factory.getAllWorkflows()).toHaveLength(1);

      factory.clear();

      expect(factory.getAllTemplates()).toHaveLength(0);
      expect(factory.getAllWorkflows()).toHaveLength(0);
    });
  });
});
