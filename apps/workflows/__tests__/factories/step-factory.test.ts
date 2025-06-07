import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StepFactory, StepTemplate, StepFactoryConfig } from '@/lib/factories/step-factory';
import { StepContext, StepResult } from '@/lib/steps/step-registry';
import { z } from 'zod';

describe('StepFactory', () => {
  let factory: StepFactory;

  beforeEach(() => {
    factory = new StepFactory();
  });

  describe('template registration', () => {
    it('should register a step template', () => {
      const template: StepTemplate = {
        id: 'test-template',
        name: 'Test Template',
        description: 'A test template',
        category: 'test',
        createHandler: () => async () => ({ success: true, output: 'test' }),
      };

      factory.registerTemplate(template);
      const templates = factory.getAllTemplates();

      expect(templates).toHaveLength(1);
      expect(templates[0]).toEqual(template);
    });

    it('should warn when overwriting a template', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const template: StepTemplate = {
        id: 'test-template',
        name: 'Test Template',
        description: 'A test template',
        category: 'test',
        createHandler: () => async () => ({ success: true, output: 'test' }),
      };

      factory.registerTemplate(template);
      factory.registerTemplate(template);

      expect(consoleSpy).toHaveBeenCalledWith('Template test-template is being overwritten');
      consoleSpy.mockRestore();
    });
  });

  describe('step creation', () => {
    beforeEach(() => {
      const template: StepTemplate = {
        id: 'test-template',
        name: 'Test Template',
        description: 'A test template',
        category: 'test',
        createHandler: (config) => async (context: StepContext) => ({
          success: true,
          output: { config, input: context.input },
        }),
      };
      factory.registerTemplate(template);
    });

    it('should create a step from a template', () => {
      const config: StepFactoryConfig = {
        id: 'test-step',
        name: 'Test Step',
        templateId: 'test-template',
      };

      const step = factory.createStep(config);

      expect(step.id).toBe('test-step');
      expect(step.name).toBe('Test Step');
      expect(step.category).toBe('test');
    });

    it('should throw error if template not found', () => {
      const config: StepFactoryConfig = {
        id: 'test-step',
        name: 'Test Step',
        templateId: 'non-existent',
      };

      expect(() => factory.createStep(config)).toThrow('Template not found: non-existent');
    });

    it('should throw error if no templateId provided', () => {
      const config: StepFactoryConfig = {
        id: 'test-step',
        name: 'Test Step',
      };

      expect(() => factory.createStep(config)).toThrow(
        'Step must have a templateId or extends property',
      );
    });

    it('should validate configuration with schema', () => {
      const template: StepTemplate = {
        id: 'validated-template',
        name: 'Validated Template',
        description: 'A template with validation',
        category: 'test',
        configSchema: z.object({
          url: z.string().url(),
          timeout: z.number().positive(),
        }),
        createHandler: () => async () => ({ success: true }),
      };
      factory.registerTemplate(template);

      const invalidConfig: StepFactoryConfig = {
        id: 'test-step',
        name: 'Test Step',
        templateId: 'validated-template',
        config: {
          url: 'not-a-url',
          timeout: -1,
        },
      };

      expect(() => factory.createStep(invalidConfig)).toThrow('Invalid configuration');
    });

    it('should merge default config with provided config', async () => {
      const template: StepTemplate = {
        id: 'config-template',
        name: 'Config Template',
        description: 'A template with default config',
        category: 'test',
        defaultConfig: {
          timeout: 5000,
          retries: 3,
        },
        createHandler: (config) => async () => ({
          success: true,
          output: config,
        }),
      };
      factory.registerTemplate(template);

      const step = factory.createStep({
        id: 'test-step',
        name: 'Test Step',
        templateId: 'config-template',
        config: {
          timeout: 10000,
        },
      });

      const context: StepContext = {
        workflowId: 'test-workflow',
        executionId: 'test-execution',
        stepId: 'test-step',
        input: {},
        previousSteps: {},
        metadata: {},
      };

      const result = await step.handler(context);
      expect(result.output).toEqual({
        timeout: 10000,
        retries: 3,
      });
    });

    it('should validate input and output schemas', async () => {
      const config: StepFactoryConfig = {
        id: 'validated-step',
        name: 'Validated Step',
        templateId: 'test-template',
        inputSchema: z.object({
          name: z.string(),
        }),
        outputSchema: z.object({
          result: z.string(),
        }),
      };

      const step = factory.createStep(config);
      const context: StepContext = {
        workflowId: 'test-workflow',
        executionId: 'test-execution',
        stepId: 'validated-step',
        input: { invalid: 'data' },
        previousSteps: {},
        metadata: {},
      };

      const result = await step.handler(context);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Input validation failed');
    });

    it('should call lifecycle hooks', () => {
      const beforeCreate = vi.fn();
      const afterCreate = vi.fn();

      const template: StepTemplate = {
        id: 'hooks-template',
        name: 'Hooks Template',
        description: 'A template with hooks',
        category: 'test',
        createHandler: () => async () => ({ success: true }),
        beforeCreate,
        afterCreate,
      };
      factory.registerTemplate(template);

      const config: StepFactoryConfig = {
        id: 'test-step',
        name: 'Test Step',
        templateId: 'hooks-template',
      };

      const step = factory.createStep(config);

      expect(beforeCreate).toHaveBeenCalledWith(config);
      expect(afterCreate).toHaveBeenCalledWith(step);
    });
  });

  describe('step management', () => {
    beforeEach(() => {
      const template: StepTemplate = {
        id: 'test-template',
        name: 'Test Template',
        description: 'A test template',
        category: 'test',
        createHandler: () => async () => ({ success: true }),
      };
      factory.registerTemplate(template);
    });

    it('should create multiple steps', () => {
      const configs: StepFactoryConfig[] = [
        { id: 'step1', name: 'Step 1', templateId: 'test-template' },
        { id: 'step2', name: 'Step 2', templateId: 'test-template' },
        { id: 'step3', name: 'Step 3', templateId: 'test-template' },
      ];

      const steps = factory.createSteps(configs);

      expect(steps).toHaveLength(3);
      expect(steps.map((s) => s.id)).toEqual(['step1', 'step2', 'step3']);
    });

    it('should get a created step', () => {
      const config: StepFactoryConfig = {
        id: 'test-step',
        name: 'Test Step',
        templateId: 'test-template',
      };

      factory.createStep(config);
      const step = factory.getStep('test-step');

      expect(step).toBeDefined();
      expect(step?.id).toBe('test-step');
    });

    it('should get all created steps', () => {
      factory.createStep({ id: 'step1', name: 'Step 1', templateId: 'test-template' });
      factory.createStep({ id: 'step2', name: 'Step 2', templateId: 'test-template' });

      const steps = factory.getAllSteps();

      expect(steps).toHaveLength(2);
      expect(steps.map((s) => s.id)).toContain('step1');
      expect(steps.map((s) => s.id)).toContain('step2');
    });

    it('should clone a step with modifications', () => {
      factory.createStep({
        id: 'original-step',
        name: 'Original Step',
        templateId: 'test-template',
        timeout: 5000,
      });

      const clonedStep = factory.cloneStep('original-step', {
        id: 'cloned-step',
        name: 'Cloned Step',
        timeout: 10000,
      });

      expect(clonedStep.id).toBe('cloned-step');
      expect(clonedStep.name).toBe('Cloned Step');
      expect(clonedStep.timeout).toBe(10000);
    });
  });

  describe('composite steps', () => {
    beforeEach(() => {
      const template: StepTemplate = {
        id: 'test-template',
        name: 'Test Template',
        description: 'A test template',
        category: 'test',
        createHandler: (config) => async (context: StepContext) => ({
          success: true,
          output: `${config.id}-output`,
        }),
      };
      factory.registerTemplate(template);

      // Create some base steps
      factory.createStep({ id: 'step1', name: 'Step 1', templateId: 'test-template' });
      factory.createStep({ id: 'step2', name: 'Step 2', templateId: 'test-template' });
      factory.createStep({ id: 'step3', name: 'Step 3', templateId: 'test-template' });
    });

    it('should create a sequential composite step', async () => {
      const compositeStep = factory.composeSteps('composite-step', 'Composite Step', [
        'step1',
        'step2',
        'step3',
      ]);

      const context: StepContext = {
        workflowId: 'test-workflow',
        executionId: 'test-execution',
        stepId: 'composite-step',
        input: {},
        previousSteps: {},
        metadata: {},
      };

      const result = await compositeStep.handler(context);

      expect(result.success).toBe(true);
      expect(result.metadata?.steps).toEqual(['step1', 'step2', 'step3']);
      expect(result.metadata?.executionMode).toBe('sequential');
    });

    it('should create a parallel composite step', async () => {
      const compositeStep = factory.composeSteps(
        'parallel-composite',
        'Parallel Composite',
        ['step1', 'step2', 'step3'],
        { parallel: true },
      );

      const context: StepContext = {
        workflowId: 'test-workflow',
        executionId: 'test-execution',
        stepId: 'parallel-composite',
        input: {},
        previousSteps: {},
        metadata: {},
      };

      const result = await compositeStep.handler(context);

      expect(result.success).toBe(true);
      expect(result.metadata?.executionMode).toBe('parallel');
    });

    it('should handle errors in composite steps', async () => {
      // Create a failing step
      const failingTemplate: StepTemplate = {
        id: 'failing-template',
        name: 'Failing Template',
        description: 'A template that fails',
        category: 'test',
        createHandler: () => async () => ({
          success: false,
          error: 'Step failed',
        }),
      };
      factory.registerTemplate(failingTemplate);
      factory.createStep({
        id: 'failing-step',
        name: 'Failing Step',
        templateId: 'failing-template',
      });

      const compositeStep = factory.composeSteps('composite-with-error', 'Composite with Error', [
        'step1',
        'failing-step',
        'step3',
      ]);

      const context: StepContext = {
        workflowId: 'test-workflow',
        executionId: 'test-execution',
        stepId: 'composite-with-error',
        input: {},
        previousSteps: {},
        metadata: {},
      };

      const result = await compositeStep.handler(context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('failing-step');
    });

    it('should continue on error when configured', async () => {
      // Create a failing step
      const failingTemplate: StepTemplate = {
        id: 'failing-template',
        name: 'Failing Template',
        description: 'A template that fails',
        category: 'test',
        createHandler: () => async () => ({
          success: false,
          error: 'Step failed',
        }),
      };
      factory.registerTemplate(failingTemplate);
      factory.createStep({
        id: 'failing-step',
        name: 'Failing Step',
        templateId: 'failing-template',
      });

      const compositeStep = factory.composeSteps(
        'composite-continue',
        'Composite Continue on Error',
        ['step1', 'failing-step', 'step3'],
        { continueOnError: true },
      );

      const context: StepContext = {
        workflowId: 'test-workflow',
        executionId: 'test-execution',
        stepId: 'composite-continue',
        input: {},
        previousSteps: {},
        metadata: {},
      };

      const result = await compositeStep.handler(context);

      expect(result.success).toBe(true);
      expect(result.metadata?.errors).toHaveLength(1);
    });
  });

  describe('conditional steps', () => {
    beforeEach(() => {
      const template: StepTemplate = {
        id: 'test-template',
        name: 'Test Template',
        description: 'A test template',
        category: 'test',
        createHandler: (config) => async () => ({
          success: true,
          output: `executed`,
        }),
      };
      factory.registerTemplate(template);

      factory.createStep({ id: 'true-step', name: 'True Step', templateId: 'test-template' });
      factory.createStep({ id: 'false-step', name: 'False Step', templateId: 'test-template' });
    });

    it('should execute true branch when condition is true', async () => {
      const conditionalStep = factory.createConditionalStep(
        'conditional-step',
        'Conditional Step',
        (context) => context.input.value > 5,
        'true-step',
        'false-step',
      );

      const context: StepContext = {
        workflowId: 'test-workflow',
        executionId: 'test-execution',
        stepId: 'conditional-step',
        input: { value: 10 },
        previousSteps: {},
        metadata: {},
      };

      const result = await conditionalStep.handler(context);

      expect(result.success).toBe(true);
      expect(result.output).toBe('executed');
      expect(result.metadata?.executedStep).toBe('true-step');
    });

    it('should execute false branch when condition is false', async () => {
      const conditionalStep = factory.createConditionalStep(
        'conditional-step',
        'Conditional Step',
        (context) => context.input.value > 5,
        'true-step',
        'false-step',
      );

      const context: StepContext = {
        workflowId: 'test-workflow',
        executionId: 'test-execution',
        stepId: 'conditional-step',
        input: { value: 3 },
        previousSteps: {},
        metadata: {},
      };

      const result = await conditionalStep.handler(context);

      expect(result.success).toBe(true);
      expect(result.output).toBe('executed');
      expect(result.metadata?.executedStep).toBe('false-step');
    });

    it('should skip when condition is false and no false branch', async () => {
      const conditionalStep = factory.createConditionalStep(
        'conditional-step',
        'Conditional Step',
        (context) => context.input.value > 5,
        'true-step',
      );

      const context: StepContext = {
        workflowId: 'test-workflow',
        executionId: 'test-execution',
        stepId: 'conditional-step',
        input: { value: 3 },
        previousSteps: {},
        metadata: {},
      };

      const result = await conditionalStep.handler(context);

      expect(result.success).toBe(true);
      expect(result.output).toBeNull();
      expect(result.metadata?.skipped).toBe(true);
    });
  });

  describe('loop steps', () => {
    beforeEach(() => {
      const template: StepTemplate = {
        id: 'process-template',
        name: 'Process Template',
        description: 'A template that processes items',
        category: 'test',
        createHandler: () => async (context: StepContext) => ({
          success: true,
          output: {
            item: context.input.item,
            index: context.input.index,
            processed: true,
          },
        }),
      };
      factory.registerTemplate(template);

      factory.createStep({
        id: 'process-step',
        name: 'Process Step',
        templateId: 'process-template',
      });
    });

    it('should process items sequentially', async () => {
      const loopStep = factory.createLoopStep('loop-step', 'Loop Step', 'process-step');

      const context: StepContext = {
        workflowId: 'test-workflow',
        executionId: 'test-execution',
        stepId: 'loop-step',
        input: {
          items: ['item1', 'item2', 'item3'],
        },
        previousSteps: {},
        metadata: {},
      };

      const result = await loopStep.handler(context);

      expect(result.success).toBe(true);
      expect(result.output).toHaveLength(3);
      expect(result.output[0]).toEqual({ item: 'item1', index: 0, processed: true });
      expect(result.metadata?.processedItems).toBe(3);
    });

    it('should process items in parallel', async () => {
      const loopStep = factory.createLoopStep('parallel-loop', 'Parallel Loop', 'process-step', {
        parallel: true,
      });

      const context: StepContext = {
        workflowId: 'test-workflow',
        executionId: 'test-execution',
        stepId: 'parallel-loop',
        input: {
          items: ['item1', 'item2', 'item3'],
        },
        previousSteps: {},
        metadata: {},
      };

      const result = await loopStep.handler(context);

      expect(result.success).toBe(true);
      expect(result.output).toHaveLength(3);
    });

    it('should respect max iterations', async () => {
      const loopStep = factory.createLoopStep('limited-loop', 'Limited Loop', 'process-step', {
        maxIterations: 2,
      });

      const context: StepContext = {
        workflowId: 'test-workflow',
        executionId: 'test-execution',
        stepId: 'limited-loop',
        input: {
          items: ['item1', 'item2', 'item3', 'item4', 'item5'],
        },
        previousSteps: {},
        metadata: {},
      };

      const result = await loopStep.handler(context);

      expect(result.success).toBe(true);
      expect(result.output).toHaveLength(2);
      expect(result.metadata?.processedItems).toBe(2);
      expect(result.metadata?.totalItems).toBe(5);
    });

    it('should handle errors in loop steps', async () => {
      const failingTemplate: StepTemplate = {
        id: 'failing-process',
        name: 'Failing Process',
        description: 'A template that fails on certain items',
        category: 'test',
        createHandler: () => async (context: StepContext) => {
          if (context.input.item === 'fail') {
            return { success: false, error: 'Item processing failed' };
          }
          return { success: true, output: context.input.item };
        },
      };
      factory.registerTemplate(failingTemplate);
      factory.createStep({
        id: 'failing-process-step',
        name: 'Failing Process Step',
        templateId: 'failing-process',
      });

      const loopStep = factory.createLoopStep(
        'loop-with-errors',
        'Loop with Errors',
        'failing-process-step',
      );

      const context: StepContext = {
        workflowId: 'test-workflow',
        executionId: 'test-execution',
        stepId: 'loop-with-errors',
        input: {
          items: ['item1', 'fail', 'item3'],
        },
        previousSteps: {},
        metadata: {},
      };

      const result = await loopStep.handler(context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('item 1');
    });

    it('should use custom items path', async () => {
      const loopStep = factory.createLoopStep(
        'custom-path-loop',
        'Custom Path Loop',
        'process-step',
        { itemsPath: 'data.records' },
      );

      const context: StepContext = {
        workflowId: 'test-workflow',
        executionId: 'test-execution',
        stepId: 'custom-path-loop',
        input: {
          data: {
            records: ['record1', 'record2'],
          },
        },
        previousSteps: {},
        metadata: {},
      };

      const result = await loopStep.handler(context);

      expect(result.success).toBe(true);
      expect(result.output).toHaveLength(2);
    });
  });

  describe('clear functionality', () => {
    it('should clear all templates and created steps', () => {
      const template: StepTemplate = {
        id: 'test-template',
        name: 'Test Template',
        description: 'A test template',
        category: 'test',
        createHandler: () => async () => ({ success: true }),
      };

      factory.registerTemplate(template);
      factory.createStep({ id: 'step1', name: 'Step 1', templateId: 'test-template' });

      expect(factory.getAllTemplates()).toHaveLength(1);
      expect(factory.getAllSteps()).toHaveLength(1);

      factory.clear();

      expect(factory.getAllTemplates()).toHaveLength(0);
      expect(factory.getAllSteps()).toHaveLength(0);
    });
  });
});
