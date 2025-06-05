/**
 * Step Factory System Tests
 *
 * Tests for the comprehensive workflow step factory system including
 * step creation, execution, templates, registry, and integration.
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { z } from 'zod';
import {
  createWorkflowStep,
  StandardWorkflowStep,
  StepFactory,
  StepRegistry,
  StepTemplates,
  defaultStepFactory,
  defaultStepRegistry,
  OrchestrationManager,
} from '../src/shared/index';
import type {
  WorkflowStepDefinition,
  StepExecutionPlan,
  StepMetadata,
  ValidationResult,
} from '../src/shared/factories';
import { OrchestrationErrorCodes } from '../src/shared/utils/errors';
import { validateStepDefinition } from '../src/shared/factories/step-factory/step-validation';

describe('Step Factory System', () => {
  beforeEach(() => {
    // Clear registries before each test
    defaultStepRegistry.clear();
  });

  describe('Step Creation', () => {
    test('should create a basic workflow step', () => {
      const step = createWorkflowStep(
        {
          name: 'Test Step',
          version: '1.0.0',
        },
        async (context) => {
          return {
            success: true,
            output: { result: 'test' },
            performance: context.performance,
          };
        },
      );

      expect(step.id).toBeDefined();
      expect(step.metadata.name).toBe('Test Step');
      expect(step.metadata.version).toBe('1.0.0');
      expect(step.execute).toBeInstanceOf(Function);
    });

    test('should create step with execution configuration', () => {
      const step = createWorkflowStep(
        {
          name: 'Configured Step',
          version: '1.0.0',
        },
        async (context) => {
          return {
            success: true,
            output: {},
            performance: context.performance,
          };
        },
        {
          executionConfig: {
            retryConfig: {
              maxAttempts: 5,
              delay: 2000,
              backoff: 'exponential',
            },
            timeout: { execution: 30000 },
          },
        },
      );

      expect(step.executionConfig?.retryConfig?.maxAttempts).toBe(5);
      expect(step.executionConfig?.timeout?.execution).toBe(30000);
    });

    test('should create step with validation configuration', () => {
      const inputSchema = z.object({
        value: z.string(),
      });

      const outputSchema = z.object({
        result: z.string(),
      });

      const step = createWorkflowStep(
        {
          name: 'Validated Step',
          version: '1.0.0',
        },
        async (context) => {
          return {
            success: true,
            output: { result: 'validated' },
            performance: context.performance,
          };
        },
        {
          validationConfig: {
            input: inputSchema,
            output: outputSchema,
            validateInput: true,
            validateOutput: true,
          },
        },
      );

      expect(step.validationConfig?.input).toBe(inputSchema);
      expect(step.validationConfig?.output).toBe(outputSchema);
    });
  });

  describe('StandardWorkflowStep Execution', () => {
    test('should execute step successfully', async () => {
      const step = createWorkflowStep(
        {
          name: 'Success Step',
          version: '1.0.0',
        },
        async (context) => {
          return {
            success: true,
            output: { data: context.input },
            performance: context.performance,
          };
        },
      );

      const executableStep = new StandardWorkflowStep(step);
      const result = await executableStep.execute({ test: 'data' }, 'workflow_123');

      expect(result.success).toBe(true);
      expect(result.output?.data).toEqual({ test: 'data' });
      expect(result.performance).toBeDefined();
    });

    test('should handle step failure with retry', async () => {
      let attempts = 0;
      const step = createWorkflowStep(
        {
          name: 'Retry Step',
          version: '1.0.0',
        },
        async (context) => {
          attempts++;
          if (attempts < 3) {
            throw new Error('Temporary failure');
          }
          return {
            success: true,
            output: { attempts },
            performance: context.performance,
          };
        },
        {
          executionConfig: {
            retryConfig: {
              maxAttempts: 3,
              delay: 10,
              backoff: 'fixed',
            },
          },
        },
      );

      const executableStep = new StandardWorkflowStep(step);
      const result = await executableStep.execute({}, 'workflow_123');

      expect(result.success).toBe(true);
      expect(result.output?.attempts).toBe(3);
    });

    test('should validate input and fail on invalid data', async () => {
      const step = createWorkflowStep(
        {
          name: 'Validation Step',
          version: '1.0.0',
        },
        async (context) => {
          return {
            success: true,
            output: {},
            performance: context.performance,
          };
        },
        {
          validationConfig: {
            input: z.object({
              required: z.string(),
            }),
            validateInput: true,
          },
        },
      );

      const executableStep = new StandardWorkflowStep(step);
      const result = await executableStep.execute({}, 'workflow_123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('STEP_INPUT_VALIDATION_ERROR');
    });

    test('should skip step when condition is not met', async () => {
      const step = createWorkflowStep(
        {
          name: 'Conditional Step',
          version: '1.0.0',
        },
        async (context) => {
          return {
            success: true,
            output: { executed: true },
            performance: context.performance,
          };
        },
        {
          condition: (context) => context.skipStep === true,
        },
      );

      const executableStep = new StandardWorkflowStep(step);
      const result = await executableStep.execute({}, 'workflow_123', { skipStep: false });

      expect(result.success).toBe(true);
      expect(result.metadata?.skipped).toBe(true);
      expect(result.output).toBeUndefined();
    });

    test('should handle execution timeout', async () => {
      const step = createWorkflowStep(
        {
          name: 'Timeout Step',
          version: '1.0.0',
        },
        async (context) => {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return {
            success: true,
            output: {},
            performance: context.performance,
          };
        },
        {
          executionConfig: {
            timeout: { execution: 100 },
          },
        },
      );

      const executableStep = new StandardWorkflowStep(step);
      const result = await executableStep.execute({}, 'workflow_123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('STEP_TIMEOUT_ERROR');
    });

    test('should handle invalid input gracefully', async () => {
      const executableStep = factory.createExecutableStep(mockStep)
      const result = await executableStep.execute({}, 'workflow_123')
      expect(result).toBeDefined()
    });
  });

  describe('Step Templates', () => {
    test('should create HTTP request step from template', () => {
      const httpStep = StepTemplates.http('API Call', 'Call external API');

      expect(httpStep.metadata.name).toBe('API Call');
      expect(httpStep.metadata.category).toBe('http');
      expect(httpStep.metadata.tags).toContain('http');
      expect(httpStep.validationConfig?.validateInput).toBe(true);
    });

    test('should create database query step from template', () => {
      const dbStep = StepTemplates.database('User Query', 'Query user data');

      expect(dbStep.metadata.name).toBe('User Query');
      expect(dbStep.metadata.category).toBe('database');
      expect(dbStep.metadata.tags).toContain('database');
    });

    test('should create notification step from template', () => {
      const notificationStep = StepTemplates.notification('Send Alert', 'Send notification alert');

      expect(notificationStep.metadata.name).toBe('Send Alert');
      expect(notificationStep.metadata.category).toBe('notification');
      expect(notificationStep.metadata.tags).toContain('notification');
    });

    test('should create delay step with specific duration', () => {
      const delayStep = StepTemplates.delay('Wait 5s', 5000);

      expect(delayStep.metadata.name).toBe('Wait 5s');
      expect(delayStep.metadata.category).toBe('utility');
      expect(delayStep.metadata.tags).toContain('delay');
    });

    test('should execute delay step successfully', async () => {
      const delayStep = StepTemplates.delay('Test Delay', 50);
      const executableStep = new StandardWorkflowStep(delayStep);

      const startTime = Date.now();
      const result = await executableStep.execute({}, 'workflow_123');
      const duration = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(result.output?.delayMs).toBe(50);
      expect(duration).toBeGreaterThanOrEqual(40); // Allow some tolerance
    });
  });

  describe('Step Factory', () => {
    let factory: StepFactory;

    beforeEach(() => {
      factory = new StepFactory();
    });

    describe('Step Registration', () => {
      const mockStep: WorkflowStepDefinition = {
        id: 'test-step',
        metadata: {
          name: 'Test Step',
          description: 'A test step',
          version: '1.0.0',
          category: 'test',
          tags: ['test'],
        },
        execute: vi.fn(),
      };

      test('should register step successfully', () => {
        factory.registerStep(mockStep);
        const step = factory.getStep('test-step');
        expect(step).toBeDefined();
        expect(step?.id).toBe('test-step');
      });

      test('should throw error when registering duplicate step', () => {
        factory.registerStep(mockStep);
        expect(() => factory.registerStep(mockStep)).toThrow(
          'Step with ID test-step is already registered',
        );
      });

      test('should validate step definition', () => {
        const invalidStep = {
          id: 'test-step',
          metadata: {
            version: '1.0.0',
            category: 'test',
            tags: ['test'],
          },
          execute: vi.fn(),
        } as any;
        expect(() => factory.registerStep(invalidStep as any)).toThrow('Cannot register invalid step: Step name is required');
      });
    });

    describe('Step Retrieval', () => {
      const mockSteps = [
        {
          id: 'step-1',
          metadata: {
            name: 'Step 1',
            version: '1.0.0',
            category: 'test',
          },
          execute: vi.fn(),
        },
        {
          id: 'step-2',
          metadata: {
            name: 'Step 2',
            version: '1.0.0',
            category: 'test',
          },
          execute: vi.fn(),
        },
        {
          id: 'step-3',
          metadata: {
            name: 'Step 3',
            version: '1.0.0',
            category: 'other',
          },
          execute: vi.fn(),
        },
      ];

      beforeEach(() => {
        mockSteps.forEach((step) => factory.registerStep(step as any));
      });

      test('should get step by ID', () => {
        const step = factory.getStep('step-1');
        expect(step).toBeDefined();
        expect(step?.id).toBe('step-1');
      });

      test('should return undefined for non-existent step', () => {
        const step = factory.getStep('non-existent');
        expect(step).toBeUndefined();
      });

      test('should list all steps', () => {
        const allSteps = factory.listSteps();
        expect(allSteps).toHaveLength(3);
      });
    });

    describe('Step Creation', () => {
      const metadata: StepMetadata = {
        name: 'Test Step',
        version: '1.0.0',
        category: 'test',
        tags: ['test'],
      };

      const executeFn = vi.fn().mockResolvedValue({ output: 'test' });

      test('should create step successfully', () => {
        const step = factory.createStep(metadata, executeFn);
        expect(step).toBeDefined();
        expect(step.id).toBeDefined();
        expect(step.metadata).toEqual(metadata);
        expect(step.execute).toBe(executeFn);
      });

      test('should create executable step instance', () => {
        const step = factory.createStep(metadata, executeFn);
        const executable = factory.createExecutableStep(step);
        expect(executable).toBeDefined();
        expect(executable.getDefinition()).toEqual(step);
      });

      test('should create executable step from registered step', () => {
        const step = factory.createStep(metadata, executeFn);
        factory.registerStep(step);
        const executable = factory.createExecutableStepById(step.id);
        expect(executable).toBeDefined();
        expect(executable.getDefinition()).toEqual(step);
      });

      test('should throw error when creating executable from non-existent step', () => {
        expect(() => factory.createExecutableStepById('non-existent')).toThrow(
          'Step with ID non-existent not found',
        );
      });
    });

    describe('Default Factory', () => {
      test('should create default factory', () => {
        expect(defaultStepFactory).toBeDefined();
        expect(defaultStepFactory).toBeInstanceOf(StepFactory);
      });

      test('should register built-in steps', () => {
        const steps = defaultStepFactory.listSteps();
        expect(steps.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Step Registry', () => {
    test('should register and retrieve steps', () => {
      const registry = new StepRegistry();

      const step = createWorkflowStep(
        {
          name: 'Registry Step',
          version: '1.0.0',
          category: 'test',
          tags: ['registry', 'test'],
        },
        async (context) => {
          return {
            success: true,
            output: {},
            performance: context.performance,
          };
        },
      );

      registry.register(step, 'test-user');

      const retrieved = registry.get(step.id);
      expect(retrieved).toBe(step);

      const entry = registry.getEntry(step.id);
      expect(entry?.registeredBy).toBe('test-user');
      expect(entry?.usageCount).toBe(0);
    });

    test('should search steps by filters', () => {
      const registry = new StepRegistry();

      const step1 = createWorkflowStep(
        {
          name: 'HTTP Step',
          version: '1.0.0',
          category: 'http',
          tags: ['http', 'api'],
        },
        async () => ({ success: true, output: {}, performance: {} as any }),
      );

      const step2 = createWorkflowStep(
        {
          name: 'DB Step',
          version: '1.0.0',
          category: 'database',
          tags: ['database', 'sql'],
        },
        async () => ({ success: true, output: {}, performance: {} as any }),
      );

      registry.register(step1);
      registry.register(step2);

      // Search by category
      const httpSteps = registry.search({ category: 'http' });
      expect(httpSteps).toHaveLength(1);
      expect(httpSteps[0].metadata.name).toBe('HTTP Step');

      // Search by tags
      const apiSteps = registry.search({ tags: ['api'] });
      expect(apiSteps).toHaveLength(1);
      expect(apiSteps[0].metadata.name).toBe('HTTP Step');

      // Search by name pattern
      const dbSteps = registry.search({ namePattern: 'DB' });
      expect(dbSteps).toHaveLength(1);
      expect(dbSteps[0].metadata.name).toBe('DB Step');
    });

    test('should validate dependencies', () => {
      const registry = new StepRegistry();

      const step1 = createWorkflowStep({ name: 'Step 1', version: '1.0.0' }, async () => ({
        success: true,
        output: {},
        performance: {} as any,
      }));

      const step2 = createWorkflowStep(
        { name: 'Step 2', version: '1.0.0' },
        async () => ({ success: true, output: {}, performance: {} as any }),
        { dependencies: [step1.id] },
      );

      registry.register(step1);
      registry.register(step2);

      const validation = registry.validateDependencies([step1.id, step2.id]);
      expect(validation.valid).toBe(true);

      // Test with missing dependency
      const step3 = createWorkflowStep(
        { name: 'Step 3', version: '1.0.0' },
        async () => ({ success: true, output: {}, performance: {} as any }),
        { dependencies: ['missing-step'] },
      );

      registry.register(step3);
      const invalidValidation = registry.validateDependencies([step3.id]);
      expect(invalidValidation.valid).toBe(false);
      expect(invalidValidation.errors).toContain('Step missing-step not found');
    });

    test('should create execution plan', () => {
      const registry = new StepRegistry();

      const step1 = createWorkflowStep({ name: 'Step 1', version: '1.0.0' }, async () => ({
        success: true,
        output: {},
        performance: {} as any,
      }));

      const step2 = createWorkflowStep(
        { name: 'Step 2', version: '1.0.0' },
        async () => ({ success: true, output: {}, performance: {} as any }),
        { dependencies: [step1.id] },
      );

      const step3 = createWorkflowStep(
        { name: 'Step 3', version: '1.0.0' },
        async () => ({ success: true, output: {}, performance: {} as any }),
        { dependencies: [step1.id] },
      );

      registry.register(step1);
      registry.register(step2);
      registry.register(step3);

      const plan = registry.createExecutionPlan([step1.id, step2.id, step3.id]);

      expect(plan.executionOrder).toEqual([step1.id, step2.id, step3.id]);
      expect(plan.parallelGroups).toHaveLength(2);
      expect(plan.parallelGroups[0]).toEqual([step1.id]);
      expect(plan.parallelGroups[1]).toHaveLength(2); // step2 and step3 can run in parallel
    });

    test('should track usage statistics', async () => {
      const registry = new StepRegistry();

      const step = createWorkflowStep({ name: 'Usage Step', version: '1.0.0' }, async () => ({
        success: true,
        output: {},
        performance: {} as any,
      }));

      registry.register(step);

      // Create executable steps to trigger usage tracking
      const executable1 = registry.createExecutableStep(step.id);
      const executable2 = registry.createExecutableStep(step.id);

      const entry = registry.getEntry(step.id);
      expect(entry?.usageCount).toBe(2);
      expect(entry?.lastUsedAt).toBeInstanceOf(Date);

      const stats = registry.getUsageStatistics();
      expect(stats.totalSteps).toBe(1);
      expect(stats.activeSteps).toBe(1);
      expect(stats.mostUsed).toHaveLength(1);
      expect(stats.mostUsed[0].usageCount).toBe(2);
    });

    test('should export and import step definitions', () => {
      const registry = new StepRegistry();

      const step = createWorkflowStep(
        {
          name: 'Export Step',
          version: '1.0.0',
          category: 'export',
        },
        async () => ({ success: true, output: {}, performance: {} as any }),
      );

      registry.register(step, 'export-user');

      const exported = registry.export();
      expect(exported).toHaveLength(1);
      expect(exported[0].definition.metadata.name).toBe('Export Step');
      expect(exported[0].metadata.registeredBy).toBe('export-user');

      // Test import
      const newRegistry = new StepRegistry();
      const importResult = newRegistry.import(exported);

      expect(importResult.imported).toBe(1);
      expect(importResult.skipped).toBe(0);
      expect(importResult.errors).toHaveLength(0);

      const imported = newRegistry.get(step.id);
      expect(imported?.metadata.name).toBe('Export Step');
    });
  });

  describe('OrchestrationManager Integration', () => {
    test('should integrate step factory with manager', () => {
      const manager = new OrchestrationManager({
        enableStepFactory: true,
      });

      const step = createWorkflowStep(
        {
          name: 'Manager Step',
          version: '1.0.0',
        },
        async (context) => {
          return {
            success: true,
            output: {},
            performance: context.performance,
          };
        },
      );

      manager.registerStep(step, 'manager-test');

      const retrieved = manager.getStep(step.id);
      expect(retrieved).toBe(step);

      const status = manager.getStatus();
      expect(status.stepFactoryEnabled).toBe(true);
      expect(status.stepRegistry?.totalSteps).toBe(1);
    });

    test('should disable step factory features when configured', () => {
      const manager = new OrchestrationManager({
        enableStepFactory: false,
      });

      expect(() => {
        manager.registerStep(
          createWorkflowStep({ name: 'Test', version: '1.0.0' }, async () => ({
            success: true,
            output: {},
            performance: {} as any,
          })),
        );
      }).toThrow('Step factory is not enabled');

      const status = manager.getStatus();
      expect(status.stepFactoryEnabled).toBe(false);
    });

    test('should execute single step through manager', async () => {
      const manager = new OrchestrationManager({
        enableStepFactory: true,
      });

      const step = createWorkflowStep(
        {
          name: 'Execute Step',
          version: '1.0.0',
        },
        async (context) => {
          return {
            success: true,
            output: { processed: context.input },
            performance: context.performance,
          };
        },
      );

      manager.registerStep(step);

      const result = await manager.executeStep(step.id, { data: 'test' }, 'workflow_123');

      expect(result.success).toBe(true);
      expect(result.output?.processed).toEqual({ data: 'test' });
    });

    test('should provide step management capabilities', () => {
      const manager = new OrchestrationManager({
        enableStepFactory: true,
      });

      const httpStep = StepTemplates.http('Manager HTTP', 'HTTP via manager');
      const dbStep = StepTemplates.database('Manager DB', 'DB via manager');

      manager.registerStep(httpStep);
      manager.registerStep(dbStep);

      // Test listing
      const allSteps = manager.listSteps();
      expect(allSteps).toHaveLength(2);

      // Test searching
      const httpSteps = manager.searchSteps({ category: 'http' });
      expect(httpSteps).toHaveLength(1);
      expect(httpSteps[0].metadata.name).toBe('Manager HTTP');

      // Test categories and tags
      const categories = manager.getStepCategories();
      expect(categories).toContain('http');
      expect(categories).toContain('database');

      const tags = manager.getStepTags();
      expect(tags).toContain('http');
      expect(tags).toContain('database');
    });
  });

  describe('Step Definition Validation', () => {
    test('should validate correct step definition', () => {
      const step = createWorkflowStep(
        {
          name: 'Valid Step',
          version: '1.0.0',
        },
        async (context) => {
          return {
            success: true,
            output: {},
            performance: context.performance,
          };
        },
      );

      const validation = StandardWorkflowStep.validateDefinition(step);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toBeUndefined();
    });

    test('should fail validation for invalid step definition', () => {
      const invalidStep = {
        id: '',
        metadata: {
          name: '',
          version: '',
        },
        execute: null,
      } as any;

      const validation = StandardWorkflowStep.validateDefinition(invalidStep);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toHaveLength(4); // Missing id, name, version, execute
    });

    test('should validate retry configuration', () => {
      const step = createWorkflowStep(
        {
          name: 'Retry Step',
          version: '1.0.0',
        },
        async () => ({ success: true, output: {}, performance: {} as any }),
        {
          executionConfig: {
            retryConfig: {
              maxAttempts: 0, // Invalid
              delay: -100, // Invalid
              backoff: 'exponential',
            },
          },
        },
      );

      const validation = StandardWorkflowStep.validateDefinition(step);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Retry maxAttempts must be at least 1');
      expect(validation.errors).toContain('Retry delay must be non-negative');
    });
  });
});
