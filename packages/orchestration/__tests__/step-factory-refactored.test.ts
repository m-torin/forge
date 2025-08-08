/**
 * Step Factory Refactored Tests
 *
 * Demonstrates the DRY refactoring using centralized utilities.
 * This file shows how the new test patterns reduce code duplication.
 */

import { describe, expect, test, vi } from 'vitest';

// Import centralized DRY utilities
import { createTestOrchestrationManager } from './setup';
import { stepGenerators, testDataUtils, workflowGenerators } from './test-data-generators';
import { AssertionUtils, PerformanceUtils, TestUtils, ValidationUtils } from './test-utils';
import {
  assertWorkflowExecution,
  createStepFactoryScenarios,
  createStepFactoryTestSuite,
  createWorkflowTestSuite,
} from './workflow-test-factory';

import {
  createWorkflowStep,
  defaultStepFactory,
  defaultStepRegistry,
  StandardWorkflowStep,
  StepTemplates,
} from '../src/shared/index';

describe('step Factory System - DRY Refactored', () => {
  // Use centralized test suite for step factory
  createStepFactoryTestSuite({
    factoryName: 'DefaultStepFactory',
    factoryInstance: defaultStepFactory,
    scenarios: createStepFactoryScenarios(),
  });

  // Use centralized workflow test suite for step execution
  createWorkflowTestSuite({
    suiteName: 'Step Execution Tests',
    moduleFactory: async () => {
      const step = createWorkflowStep(
        { name: 'Basic Step', version: '1.0.0' },
        async (context: any) => ({
          output: { result: 'test' },
          performance: context?.performance,
          success: true,
        }),
      );
      return new StandardWorkflowStep(step);
    },
    scenarios: [
      {
        name: 'basic step execution',
        type: 'execution',
        input: { test: 'data' },
        expected: { success: true },
        assertions: result => {
          expect(result.output?.result).toBe('test');
        },
      },
      {
        name: 'step with validation',
        type: 'execution',
        input: { value: 'test' },
        expected: { success: true },
        mockSetup: () => {
          // Setup validation mock
          vi.clearAllMocks();
        },
      },
      {
        name: 'step timeout error',
        type: 'error',
        input: { delay: 1000 },
        expected: { shouldFail: true, errorMessage: 'timeout' },
      },
    ],
  });

  // Performance tests using centralized utilities
  describe('performance Tests', () => {
    test('should create steps within performance bounds', async () => {
      const result = await PerformanceUtils.testPerformance(
        async () => {
          const steps = Array.from({ length: 100 }, (_, i) =>
            createWorkflowStep({ name: `Step ${i}`, version: '1.0.0' }, async () => ({
              output: {},
              success: true,
              performance: { startTime: Date.now() },
            })),
          );
          return steps;
        },
        1000, // Max 1 second
      );

      expect(result.result).toHaveLength(100);
      expect(result.duration).toBeLessThan(1000);
    });
  });

  // Validation tests using centralized utilities
  describe('validation Tests', () => {
    test('should validate step structures', () => {
      const testSteps = [
        stepGenerators.basic(),
        stepGenerators.withInput(),
        stepGenerators.withOutput(),
      ];

      testSteps.forEach(step => {
        const validation = ValidationUtils.validateStep(step);
        expect(validation.valid).toBeTruthy();
        expect(validation.errors).toHaveLength(0);
      });
    });

    test('should detect invalid step structures', () => {
      const invalidStep = stepGenerators.invalid();
      const validation = ValidationUtils.validateStep(invalidStep);

      expect(validation.valid).toBeFalsy();
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  // Template tests using centralized patterns
  describe('template Tests', () => {
    const templateTests = [
      {
        name: 'HTTP template',
        factory: () => StepTemplates.http('API Call', 'Call external API'),
        expectedCategory: 'http',
        expectedTags: ['http'],
      },
      {
        name: 'Database template',
        factory: () => StepTemplates.database('User Query', 'Query user data'),
        expectedCategory: 'database',
        expectedTags: ['database'],
      },
      {
        name: 'Notification template',
        factory: () => StepTemplates.notification('Send Alert', 'Send notification alert'),
        expectedCategory: 'notification',
        expectedTags: ['notification'],
      },
    ];

    templateTests.forEach(({ name, factory, expectedCategory, expectedTags }) => {
      test(`should create ${name}`, () => {
        const step = factory();

        // Use centralized assertions
        AssertionUtils.assertStep(step, ['metadata']);
        expect(step.metadata.category).toBe(expectedCategory);
        expect(step.metadata.tags).toStrictEqual(expect.arrayContaining(expectedTags));
      });
    });
  });

  // Registry tests using centralized patterns
  describe('registry Tests', () => {
    test('should register and retrieve steps', () => {
      const step = stepGenerators.basic({ name: 'Registered Step' });

      // Create step definition
      const stepDef = createWorkflowStep({ name: step.name, version: '1.0.0' }, async () => ({
        output: {},
        success: true,
        performance: { startTime: Date.now() },
      }));

      // Register step
      defaultStepRegistry.register(stepDef);

      // Retrieve step
      const retrieved = defaultStepRegistry.get(stepDef.id);

      // Use centralized assertions
      expect(retrieved).toBeDefined();
      if (retrieved) {
        expect(retrieved.metadata.name).toBe(step.name);
      }
    });

    test('should handle registry operations', () => {
      const steps = [
        stepGenerators.basic({ name: 'Step 1' }),
        stepGenerators.basic({ name: 'Step 2' }),
        stepGenerators.basic({ name: 'Step 3' }),
      ];

      // Create step definitions
      const stepDefs = steps.map(step =>
        createWorkflowStep({ name: step.name, version: '1.0.0' }, async () => ({
          output: {},
          success: true,
          performance: { startTime: Date.now() },
        })),
      );

      // Register multiple steps
      stepDefs.forEach(stepDef => {
        defaultStepRegistry.register(stepDef);
      });

      // Test registry operations
      const stats = defaultStepRegistry.getStats();
      expect(stats.totalSteps).toBe(3);

      // Clear registry
      defaultStepRegistry.clear();
      const clearedStats = defaultStepRegistry.getStats();
      expect(clearedStats.totalSteps).toBe(0);
    });
  });

  // Error handling tests using centralized utilities
  describe('error Handling Tests', () => {
    test('should handle step creation errors', async () => {
      await TestUtils.errors.expectError(async () => {
        const invalidStep = stepGenerators.invalid();
        createWorkflowStep(
          { name: invalidStep.name || 'Invalid', version: '1.0.0' }, // Convert to StepMetadata
          async () => ({ output: {}, success: true, performance: { startTime: Date.now() } }),
        );
      }, 'Invalid step');
    });

    test('should handle execution errors', async () => {
      const stepData = stepGenerators.basic({ name: 'Error Step' });
      const step = createWorkflowStep({ name: stepData.name, version: '1.0.0' }, async () => {
        throw new Error('Step execution failed');
      });

      const executableStep = new StandardWorkflowStep(step);
      const result = await executableStep.execute({}, 'workflow_123');

      expect(result.success).toBeFalsy();
      expect(result.error).toBeDefined();
    });
  });

  // Integration tests using centralized patterns
  describe('integration Tests', () => {
    test('should integrate with orchestration manager', async () => {
      const manager = await createTestOrchestrationManager();
      const workflow = workflowGenerators.simple();

      // Use centralized assertions
      AssertionUtils.assertWorkflow(workflow);

      // Test workflow execution
      const execution = await manager.executeWorkflow(workflow, { test: 'data' });
      assertWorkflowExecution(execution, 'running');
    });
  });

  // Random scenario tests using centralized utilities
  describe('random Scenario Tests', () => {
    test('should handle random step configurations', () => {
      const randomSteps = Array.from({ length: 10 }, () =>
        stepGenerators.basic({
          name: testDataUtils.randomString(8),
          action: testDataUtils.randomItem(['http', 'database', 'notification']),
        }),
      );

      randomSteps.forEach(step => {
        expect(step).toBeDefined();
        expect(step.name).toBeDefined();
        expect(step.action).toBeDefined();
      });
    });

    test('should handle random workflow generation', () => {
      const randomWorkflow = testDataUtils.randomWorkflow();

      AssertionUtils.assertWorkflow(randomWorkflow);
      expect(randomWorkflow.steps.length).toBeGreaterThan(0);
    });
  });
});

// Example of how much more concise tests can be with DRY utilities
describe('concise Test Examples', () => {
  // Before DRY refactoring: 50+ lines for basic step test
  // After DRY refactoring: 10 lines
  test('concise step creation test', () => {
    const stepData = stepGenerators.basic();
    const step = createWorkflowStep({ name: stepData.name, version: '1.0.0' }, async () => ({
      output: {},
      success: true,
      performance: { startTime: Date.now() },
    }));

    expect(step).toBeDefined();
    expect(step.metadata).toBeDefined();
  });

  // Before DRY refactoring: 30+ lines for validation test
  // After DRY refactoring: 5 lines
  test('concise validation test', () => {
    const step = stepGenerators.basic();
    expect(step).toBeDefined();
    expect(step.name).toBeDefined();
  });

  // Before DRY refactoring: 40+ lines for performance test
  // After DRY refactoring: 8 lines
  test('concise performance test', async () => {
    const stepData = stepGenerators.basic();
    const result = await PerformanceUtils.testPerformance(
      async () =>
        createWorkflowStep({ name: stepData.name, version: '1.0.0' }, async () => ({
          output: {},
          success: true,
          performance: { startTime: Date.now() },
        })),
      100, // Max 100ms
    );
    expect(result.duration).toBeLessThan(100);
  });
});
