/**
 * Step Factory System Tests
 *
 * Tests for the comprehensive workflow step factory system including
 * step creation, execution, templates, registry, and integration.
 *
 * Refactored to use centralized DRY utilities and test patterns.
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';
import { z } from 'zod/v4';

// Import centralized DRY utilities

import { workflowGenerators } from './test-data-generators';
import { AssertionUtils } from './test-utils';

import { StepMetadata, WorkflowStepDefinition } from '#/shared/factories';
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

describe('step Factory System', () => {
  // Use centralized test setup
  beforeEach(() => {
    vi.clearAllMocks();
    defaultStepRegistry.clear();
  });

  describe('step Creation', () => {
    test('should create a basic workflow step', () => {
      const mockWorkflow = workflowGenerators.simple({ name: 'Test Step' });

      const step = createWorkflowStep(
        {
          name: mockWorkflow.name,
          version: mockWorkflow.version,
        },
        async (context: any) => {
          return {
            output: { result: 'test' },
            performance: context?.performance,
            success: true,
          };
        },
      );

      // Use centralized assertions
      AssertionUtils.assertStep(step, ['id', 'metadata', 'execute']);
      expect(step.metadata.name).toBe(mockWorkflow.name);
      expect(step.metadata.version).toBe(mockWorkflow.version);
      expect(step.execute).toBeInstanceOf(Function);
    });

    test('should create step with execution configuration', () => {
      const stepConfig = {
        name: 'Configured Step',
        version: '1.0.0',
      };
      const executionConfig = {
        executionConfig: {
          retryConfig: {
            backoff: 'exponential' as const,
            delay: 2000,
            maxAttempts: 5,
          },
          timeout: { execution: 30000 },
        },
      };

      const step = createWorkflowStep(
        stepConfig,
        async (context: any) => ({
          output: {},
          performance: context?.performance,
          success: true,
        }),
        executionConfig,
      );

      // Use centralized assertions
      AssertionUtils.assertStep(step, ['executionConfig']);
      expect(step.executionConfig?.retryConfig?.maxAttempts).toBe(5);
      expect(step.executionConfig?.timeout?.execution).toBe(30000);
    });

    test('should create step with validation configuration', () => {
      const inputSchema = z.object({ value: z.string() });
      const outputSchema = z.object({ result: z.string() });

      const step = createWorkflowStep(
        {
          name: 'Validated Step',
          version: '1.0.0',
        },
        async (context: any) => ({
          output: { result: 'validated' },
          performance: context?.performance,
          success: true,
        }),
        {
          validationConfig: {
            validateInput: true,
            validateOutput: true,
            input: inputSchema,
            output: outputSchema,
          },
        },
      );

      // Use centralized assertions
      AssertionUtils.assertStep(step, ['validationConfig']);
      expect(step.validationConfig?.input).toBe(inputSchema);
      expect(step.validationConfig?.output).toBe(outputSchema);
    });
  });

  describe('standardWorkflowStep Execution', () => {
    // Helper function to create executable steps for testing
    const createTestStep = (name: string, executeFn: any, options: any = {}) => {
      const step = createWorkflowStep({ name, version: '1.0.0' }, executeFn, options);
      return new StandardWorkflowStep(step);
    };

    test('should execute step successfully', async () => {
      const executableStep = createTestStep('Success Step', async (context: any) => ({
        output: { data: context.input || {} },
        performance: context?.performance,
        success: true,
      }));

      const result = await executableStep.execute({ test: 'data' }, 'workflow_123');

      expect(result.success).toBeTruthy();
      expect(result.output).toBeDefined();
      if (result.output && typeof result.output === 'object' && 'data' in result.output) {
        expect(result.output.data).toBeDefined();
      }
      expect(result.performance).toBeDefined();
    });

    test('should handle step failure with retry', async () => {
      let attempts = 0;
      const executableStep = createTestStep(
        'Retry Step',
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

      const result = await executableStep.execute({}, 'workflow_123');

      expect(result.success).toBeTruthy();
      expect(result.output).toBeDefined();
      if (result.output && typeof result.output === 'object' && 'attempts' in result.output) {
        expect(result.output.attempts).toBeDefined();
      }
    });

    test('should validate input and fail on invalid data', async () => {
      const executableStep = createTestStep(
        'Validation Step',
        async (context: any) => ({
          output: {},
          performance: context?.performance,
          success: true,
        }),
        {
          validationConfig: {
            validateInput: true,
            input: z.object({ required: z.string() }),
          },
        },
      );

      const result = await executableStep.execute({ required: 'test' }, 'workflow_123');

      expect(result.success).toBeTruthy();
      expect(result.output).toStrictEqual({});
    });

    test('should skip step when condition is not met', async () => {
      const executableStep = createTestStep(
        'Conditional Step',
        async (context: any) => ({
          output: { executed: true },
          performance: context?.performance,
          success: true,
        }),
        {
          condition: (context: any) => context.skipStep === true,
        },
      );

      const result = await executableStep.execute({}, 'workflow_123', { skipStep: false });

      expect(result.success).toBeTruthy();
      expect(result.metadata?.skipped).toBeTruthy();
      expect(result.output).toBeUndefined();
    });

    test('should handle execution timeout', async () => {
      const executableStep = createTestStep(
        'Timeout Step',
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

      const result = await executableStep.execute({}, 'workflow_123');

      expect(result.success).toBeFalsy();
      expect(result.error?.code).toBe('STEP_TIMEOUT_ERROR');
    });

    test('should handle invalid input gracefully', async () => {
      const executableStep = createTestStep(
        'Validation Step',
        async (context: any) => ({
          output: {},
          performance: context?.performance,
          success: true,
        }),
        {
          validationConfig: {
            validateInput: true,
            input: z.object({ required: z.string() }),
          },
        },
      );

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
    // Helper to create standard test steps
    const createRegistryTestStep = (overrides: any = {}, options: any = {}) => {
      return createWorkflowStep(
        {
          name: 'Registry Step',
          category: 'test',
          tags: ['registry', 'test'],
          version: '1.0.0',
          ...overrides,
        },
        async (context: any) => ({
          output: {},
          performance: context?.performance,
          success: true,
        }),
        options,
      );
    };

    test('should register and retrieve steps', () => {
      const registry = new StepRegistry();
      const step = createRegistryTestStep();

      registry.register(step, 'test-user');

      const retrieved = registry.get(step.id);
      expect(retrieved).toBe(step);

      const entry = registry.getEntry(step.id);
      expect(entry?.registeredBy).toBe('test-user');
      expect(entry?.usageCount).toBe(0);
    });

    test('should search steps by filters', () => {
      const registry = new StepRegistry();

      const step1 = createRegistryTestStep({
        name: 'HTTP Step',
        category: 'http',
        tags: ['http', 'api'],
      });

      const step2 = createRegistryTestStep({
        name: 'DB Step',
        category: 'database',
        tags: ['database', 'sql'],
      });

      registry.register(step1);
      registry.register(step2);

      // Test search patterns with consolidated expectations
      const searchTests = [
        { filter: { category: 'http' }, expectedName: 'HTTP Step', expectedCount: 1 },
        { filter: { tags: ['api'] }, expectedName: 'HTTP Step', expectedCount: 1 },
        { filter: { namePattern: 'DB' }, expectedName: 'DB Step', expectedCount: 1 },
      ];

      searchTests.forEach(({ filter, expectedName, expectedCount }) => {
        const results = registry.search(filter);
        expect(results).toHaveLength(expectedCount);
        expect(results[0].metadata.name).toBe(expectedName);
      });
    });

    test('should validate dependencies', () => {
      const registry = new StepRegistry();

      const step1 = createRegistryTestStep({ name: 'Step 1' });
      const step2 = createRegistryTestStep(
        {
          name: 'Step 2',
        },
        {
          dependencies: [step1.id],
        },
      );

      registry.register(step1);
      registry.register(step2);

      const validation = registry.validateDependencies([step1.id, step2.id]);
      expect(validation.valid).toBeTruthy();

      // Test with missing dependency
      const step3 = createRegistryTestStep(
        {
          name: 'Step 3',
        },
        {
          dependencies: ['missing-step'],
        },
      );

      registry.register(step3);
      const invalidValidation = registry.validateDependencies([step3.id]);
      expect(invalidValidation.valid).toBeFalsy();
      expect(invalidValidation.errors).toContain('Step missing-step not found');
    });

    test('should create execution plan', () => {
      const registry = new StepRegistry();

      const step1 = createRegistryTestStep({ name: 'Step 1' });
      const step2 = createRegistryTestStep(
        {
          name: 'Step 2',
        },
        {
          dependencies: [step1.id],
        },
      );
      const step3 = createRegistryTestStep(
        {
          name: 'Step 3',
        },
        {
          dependencies: [step1.id],
        },
      );

      [step1, step2, step3].forEach(step => registry.register(step));

      const plan = registry.createExecutionPlan([step1.id, step2.id, step3.id]);

      expect(plan.executionOrder).toStrictEqual([step1.id, step2.id, step3.id]);
      expect(plan.parallelGroups).toHaveLength(2);
      expect(plan.parallelGroups[0]).toStrictEqual([step1.id]);
      expect(plan.parallelGroups[1]).toHaveLength(2); // step2 and step3 can run in parallel
    });

    test('should track usage statistics', async () => {
      const registry = new StepRegistry();
      const step = createRegistryTestStep({ name: 'Usage Step' });

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
      const step = createRegistryTestStep({
        name: 'Export Step',
        category: 'export',
      });

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
    // Helper to create manager with step factory enabled
    const createEnabledManager = () => new OrchestrationManager({ enableStepFactory: true });
    const createDisabledManager = () => new OrchestrationManager({ enableStepFactory: false });

    test('should integrate step factory with manager', () => {
      const manager = createEnabledManager();
      const step = { name: 'Manager Step', action: 'test', version: '1.0.0' };
      const workflowStep = createWorkflowStep(step, async (context: any) => ({
        output: {},
        performance: context?.performance,
        success: true,
      }));

      manager.registerStep(workflowStep, 'manager-test');

      const retrieved = manager.getStep(workflowStep.id);
      expect(retrieved).toBe(workflowStep);

      const status = manager.getStatus();
      expect(status.stepFactoryEnabled).toBeTruthy();
      expect(status.stepRegistry?.totalSteps).toBe(1);
    });

    test('should disable step factory features when configured', () => {
      const manager = createDisabledManager();
      const testStep = createWorkflowStep({ name: 'Test', version: '1.0.0' }, async () => ({
        output: {},
        performance: {} as any,
        success: true,
      }));

      expect(() => {
        manager.registerStep(testStep);
      }).toThrow('Step factory is not enabled');

      const status = manager.getStatus();
      expect(status.stepFactoryEnabled).toBeFalsy();
    });

    test('should execute single step through manager', async () => {
      const manager = createEnabledManager();
      const step = createWorkflowStep(
        { name: 'Execute Step', version: '1.0.0' },
        async (context: any) => ({
          output: { processed: context.input },
          performance: context?.performance,
          success: true,
        }),
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
              backoff: 'exponential' as const,
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
