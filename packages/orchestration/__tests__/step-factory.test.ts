/**
 * Step Factory System Tests
 *
 * Tests for the comprehensive workflow step factory system including
 * step creation, execution, templates, registry, and integration.
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';
import { z } from 'zod/v4';

import { StepMetadata, WorkflowStepDefinition } from '../src/shared/factories';
import {
  createWorkflowStep,
  defaultStepFactory,
  defaultStepRegistry,
  OrchestrationManager,
  StandardWorkflowStep,
  StepFactory,
  StepRegistry,
  StepTemplates,
} from '../src/shared/index';

// Mock server-only to prevent errors
vi.mock('server-only', () => ({}));

describe('step Factory System', () => {
  beforeEach(() => {
    // Clear registries before each test
    defaultStepRegistry.clear();
  });

  describe('step Creation', () => {
    test('should create a basic workflow step', () => {
      const step = createWorkflowStep(
        {
          name: 'Test Step',
          version: '1.0.0',
        },
        async (context: any) => {
          return {
            output: { result: 'test' },
            performance: context?.performance,
            success: true,
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
        async (context: any) => {
          return {
            output: {},
            performance: context?.performance,
            success: true,
          };
        },
        {
          executionConfig: {
            retryConfig: {
              backoff: 'exponential',
              delay: 2000,
              maxAttempts: 5,
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
        async (context: any) => {
          return {
            output: { result: 'validated' },
            performance: context?.performance,
            success: true,
          };
        },
        {
          validationConfig: {
            validateInput: true,
            validateOutput: true,
            input: inputSchema,
            output: outputSchema,
          },
        },
      );

      expect(step.validationConfig?.input).toBe(inputSchema);
      expect(step.validationConfig?.output).toBe(outputSchema);
    });
  });

  describe('standardWorkflowStep Execution', () => {
    test('should execute step successfully', async () => {
      const step = createWorkflowStep(
        {
          name: 'Success Step',
          version: '1.0.0',
        },
        async (context: any) => {
          return {
            output: { data: context.input },
            performance: context?.performance,
            success: true,
          };
        },
      );

      const executableStep = new StandardWorkflowStep(step);
      const result = await executableStep.execute({ test: 'data' }, 'workflow_123');

      expect(result.success).toBeTruthy();
      expect(result.output?.data).toStrictEqual({ test: 'data' });
      expect(result.performance).toBeDefined();
    });

    test('should handle step failure with retry', async () => {
      let attempts = 0;
      const step = createWorkflowStep(
        {
          name: 'Retry Step',
          version: '1.0.0',
        },
        async (context: any) => {
          attempts++;
          if (attempts < 3) {
            throw new Error('Temporary failure');
          }
          return {
            output: { attempts },
            performance: context?.performance,
            success: true,
          };
        },
        {
          executionConfig: {
            retryConfig: {
              backoff: 'fixed',
              delay: 10,
              maxAttempts: 3,
            },
          },
        },
      );

      const executableStep = new StandardWorkflowStep(step);
      const result = await executableStep.execute({}, 'workflow_123');

      expect(result.success).toBeTruthy();
      expect(result.output?.attempts).toBe(3);
    });

    test('should validate input and fail on invalid data', async () => {
      const step = createWorkflowStep(
        {
          name: 'Validation Step',
          version: '1.0.0',
        },
        async (context: any) => {
          return {
            output: {},
            performance: context?.performance,
            success: true,
          };
        },
        {
          validationConfig: {
            validateInput: true,
            input: z.object({
              required: z.string(),
            }),
          },
        },
      );

      const executableStep = new StandardWorkflowStep(step);
      const result = await executableStep.execute({ required: 'test' }, 'workflow_123');

      expect(result.success).toBeTruthy();
      expect(result.output).toStrictEqual({});
    });

    test('should skip step when condition is not met', async () => {
      const step = createWorkflowStep(
        {
          name: 'Conditional Step',
          version: '1.0.0',
        },
        async (context: any) => {
          return {
            output: { executed: true },
            performance: context?.performance,
            success: true,
          };
        },
        {
          condition: (context: any) => context.skipStep === true,
        },
      );

      const executableStep = new StandardWorkflowStep(step);
      const result = await executableStep.execute({}, 'workflow_123', { skipStep: false });

      expect(result.success).toBeTruthy();
      expect(result.metadata?.skipped).toBeTruthy();
      expect(result.output).toBeUndefined();
    });

    test('should handle execution timeout', async () => {
      const step = createWorkflowStep(
        {
          name: 'Timeout Step',
          version: '1.0.0',
        },
        async (context: any) => {
          await new Promise((resolve: any) => setTimeout(resolve, 1000));
          return {
            output: {},
            performance: context?.performance,
            success: true,
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

      expect(result.success).toBeFalsy();
      expect(result.error?.code).toBe('STEP_TIMEOUT_ERROR');
    });

    test('should handle invalid input gracefully', async () => {
      const step = createWorkflowStep(
        {
          name: 'Validation Step',
          version: '1.0.0',
        },
        async (context: any) => {
          return {
            output: {},
            performance: context?.performance,
            success: true,
          };
        },
        {
          validationConfig: {
            validateInput: true,
            input: z.object({
              required: z.string(),
            }),
          },
        },
      );
      const executableStep = new StandardWorkflowStep(step);
      const result = await executableStep.execute({ required: 'test' }, 'workflow_123');
      expect(result.success).toBeTruthy();
    });
  });

  describe('step Templates', () => {
    test('should create HTTP request step from template', () => {
      const httpStep = StepTemplates.http('API Call', 'Call external API');

      expect(httpStep.metadata.name).toBe('API Call');
      expect(httpStep.metadata.category).toBe('http');
      expect(httpStep.metadata.tags).toContain('http');
      expect(httpStep.validationConfig?.validateInput).toBeTruthy();
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

      expect(result.success).toBeTruthy();
      expect(result.output?.delayMs).toBe(50);
      expect(duration).toBeGreaterThanOrEqual(40); // Allow some tolerance
    });
  });

  describe('step Factory', () => {
    let factory: StepFactory;

    beforeEach(() => {
      factory = new StepFactory();
    });

    describe('step Registration', () => {
      const mockStep: WorkflowStepDefinition = {
        id: 'test-step',
        execute: vi.fn(),
        metadata: {
          name: 'Test Step',
          category: 'test',
          description: 'A test step',
          tags: ['test'],
          version: '1.0.0',
        },
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
          execute: vi.fn(),
          metadata: {
            category: 'test',
            tags: ['test'],
            version: '1.0.0',
          },
        } as any;
        expect(() => factory.registerStep(invalidStep as any)).toThrow(
          'Cannot register invalid step: Step name is required',
        );
      });
    });

    describe('step Retrieval', () => {
      const mockSteps = [
        {
          id: 'step-1',
          execute: vi.fn(),
          metadata: {
            name: 'Step 1',
            category: 'test',
            version: '1.0.0',
          },
        },
        {
          id: 'step-2',
          execute: vi.fn(),
          metadata: {
            name: 'Step 2',
            category: 'test',
            version: '1.0.0',
          },
        },
        {
          id: 'step-3',
          execute: vi.fn(),
          metadata: {
            name: 'Step 3',
            category: 'other',
            version: '1.0.0',
          },
        },
      ];

      beforeEach(() => {
        mockSteps.forEach((step: any) => factory.registerStep(step as any));
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
        expect(allSteps).toHaveLength(5); // 3 mock steps + 2 built-in steps
      });
    });

    describe('step Creation', () => {
      const metadata: StepMetadata = {
        name: 'Test Step',
        category: 'test',
        tags: ['test'],
        version: '1.0.0',
      };

      const executeFn = vi.fn().mockResolvedValue({ output: 'test' });

      test('should create step successfully', () => {
        const step = factory.createStep(metadata, executeFn);
        expect(step).toBeDefined();
        expect(step.id).toBeDefined();
        expect(step.metadata).toMatchObject(metadata);
        expect(step.execute).toBe(executeFn);
      });

      test('should create executable step instance', () => {
        const step = factory.createStep(metadata, executeFn);
        const executable = factory.createExecutableStep(step);
        expect(executable).toBeDefined();
        expect(executable.getDefinition()).toStrictEqual(step);
      });

      test('should create executable step from registered step', () => {
        const step = factory.createStep(metadata, executeFn);
        factory.registerStep(step);
        const executable = factory.createExecutableStepById(step.id);
        expect(executable).toBeDefined();
        expect(executable.getDefinition()).toStrictEqual(step);
      });

      test('should throw error when creating executable from non-existent step', () => {
        expect(() => factory.createExecutableStepById('non-existent')).toThrow(
          'Step with ID non-existent not found',
        );
      });
    });

    describe('default Factory', () => {
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

  describe('step Registry', () => {
    test('should register and retrieve steps', () => {
      const registry = new StepRegistry();

      const step = createWorkflowStep(
        {
          name: 'Registry Step',
          category: 'test',
          tags: ['registry', 'test'],
          version: '1.0.0',
        },
        async (context: any) => {
          return {
            output: {},
            performance: context?.performance,
            success: true,
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
          category: 'http',
          tags: ['http', 'api'],
          version: '1.0.0',
        },
        async () => ({ output: {}, performance: {} as any, success: true }),
      );

      const step2 = createWorkflowStep(
        {
          name: 'DB Step',
          category: 'database',
          tags: ['database', 'sql'],
          version: '1.0.0',
        },
        async () => ({ output: {}, performance: {} as any, success: true }),
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
        output: {},
        performance: {} as any,
        success: true,
      }));

      const step2 = createWorkflowStep(
        { name: 'Step 2', version: '1.0.0' },
        async () => ({ output: {}, performance: {} as any, success: true }),
        { dependencies: [step1.id] },
      );

      registry.register(step1);
      registry.register(step2);

      const validation = registry.validateDependencies([step1.id, step2.id]);
      expect(validation.valid).toBeTruthy();

      // Test with missing dependency
      const step3 = createWorkflowStep(
        { name: 'Step 3', version: '1.0.0' },
        async () => ({ output: {}, performance: {} as any, success: true }),
        { dependencies: ['missing-step'] },
      );

      registry.register(step3);
      const invalidValidation = registry.validateDependencies([step3.id]);
      expect(invalidValidation.valid).toBeFalsy();
      expect(invalidValidation.errors).toContain('Step missing-step not found');
    });

    test('should create execution plan', () => {
      const registry = new StepRegistry();

      const step1 = createWorkflowStep({ name: 'Step 1', version: '1.0.0' }, async () => ({
        output: {},
        performance: {} as any,
        success: true,
      }));

      const step2 = createWorkflowStep(
        { name: 'Step 2', version: '1.0.0' },
        async () => ({ output: {}, performance: {} as any, success: true }),
        { dependencies: [step1.id] },
      );

      const step3 = createWorkflowStep(
        { name: 'Step 3', version: '1.0.0' },
        async () => ({ output: {}, performance: {} as any, success: true }),
        { dependencies: [step1.id] },
      );

      registry.register(step1);
      registry.register(step2);
      registry.register(step3);

      const plan = registry.createExecutionPlan([step1.id, step2.id, step3.id]);

      expect(plan.executionOrder).toStrictEqual([step1.id, step2.id, step3.id]);
      expect(plan.parallelGroups).toHaveLength(2);
      expect(plan.parallelGroups[0]).toStrictEqual([step1.id]);
      expect(plan.parallelGroups[1]).toHaveLength(2); // step2 and step3 can run in parallel
    });

    test('should track usage statistics', async () => {
      const registry = new StepRegistry();

      const step = createWorkflowStep({ name: 'Usage Step', version: '1.0.0' }, async () => ({
        output: {},
        performance: {} as any,
        success: true,
      }));

      registry.register(step);

      // Create executable steps to trigger usage tracking
      const _executable1 = registry.createExecutableStep(step.id);
      const _executable2 = registry.createExecutableStep(step.id);

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
          category: 'export',
          version: '1.0.0',
        },
        async () => ({ output: {}, performance: {} as any, success: true }),
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

  describe('orchestrationManager Integration', () => {
    test('should integrate step factory with manager', () => {
      const manager = new OrchestrationManager({
        enableStepFactory: true,
      });

      const step = createWorkflowStep(
        {
          name: 'Manager Step',
          version: '1.0.0',
        },
        async (context: any) => {
          return {
            output: {},
            performance: context?.performance,
            success: true,
          };
        },
      );

      manager.registerStep(step, 'manager-test');

      const retrieved = manager.getStep(step.id);
      expect(retrieved).toBe(step);

      const status = manager.getStatus();
      expect(status.stepFactoryEnabled).toBeTruthy();
      expect(status.stepRegistry?.totalSteps).toBe(1);
    });

    test('should disable step factory features when configured', () => {
      const manager = new OrchestrationManager({
        enableStepFactory: false,
      });

      expect(() => {
        manager.registerStep(
          createWorkflowStep({ name: 'Test', version: '1.0.0' }, async () => ({
            output: {},
            performance: {} as any,
            success: true,
          })),
        );
      }).toThrow('Step factory is not enabled');

      const status = manager.getStatus();
      expect(status.stepFactoryEnabled).toBeFalsy();
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
        async (context: any) => {
          return {
            output: { processed: context.input },
            performance: context?.performance,
            success: true,
          };
        },
      );

      manager.registerStep(step);

      const result = await manager.executeStep(step.id, { data: 'test' }, 'workflow_123');

      expect(result.success).toBeTruthy();
      expect(result.output?.processed).toStrictEqual({ data: 'test' });
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

  describe('step Definition Validation', () => {
    test('should validate correct step definition', () => {
      const step = createWorkflowStep(
        {
          name: 'Valid Step',
          version: '1.0.0',
        },
        async (context: any) => {
          return {
            output: {},
            performance: context?.performance,
            success: true,
          };
        },
      );

      const validation = StandardWorkflowStep.validateDefinition(step);
      expect(validation.valid).toBeTruthy();
      expect(validation.errors).toBeUndefined();
    });

    test('should fail validation for invalid step definition', () => {
      const invalidStep = {
        id: '',
        execute: null,
        metadata: {
          name: '',
          version: '',
        },
      } as any;

      const validation = StandardWorkflowStep.validateDefinition(invalidStep);
      expect(validation.valid).toBeFalsy();
      expect(validation.errors).toHaveLength(4); // Missing id, name, version, execute
    });

    test('should validate retry configuration', () => {
      const step = createWorkflowStep(
        {
          name: 'Retry Step',
          version: '1.0.0',
        },
        async () => ({ output: {}, performance: {} as any, success: true }),
        {
          executionConfig: {
            retryConfig: {
              backoff: 'exponential',
              delay: -100, // Invalid
              maxAttempts: 0, // Invalid
            },
          },
        },
      );

      const validation = StandardWorkflowStep.validateDefinition(step);
      expect(validation.valid).toBeFalsy();
      expect(validation.errors).toContain('Retry maxAttempts must be at least 1');
      expect(validation.errors).toContain('Retry delay must be non-negative');
    });
  });
});
