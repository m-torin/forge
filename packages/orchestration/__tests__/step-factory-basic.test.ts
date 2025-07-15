/**
 * Basic Step Factory Tests
 *
 * Simple tests to verify the step factory system works correctly.
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  createWorkflowStep,
  defaultStepRegistry,
  StandardWorkflowStep,
  StepFactory,
  StepRegistry,
  StepTemplates,
} from '../src/shared/index';

// Mock server-only to prevent errors
vi.mock('server-only', () => ({}));

describe('basic Step Factory', () => {
  beforeEach(() => {
    // Clear registries before each test
    defaultStepRegistry.clear();
  });

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

  test('should create HTTP step from template', () => {
    const httpStep = StepTemplates.http('API Call', 'Call external API');

    expect(httpStep.metadata.name).toBe('API Call');
    expect(httpStep.metadata.category).toBe('http');
    expect(httpStep.metadata.tags).toContain('http');
    expect(httpStep.validationConfig?.validateInput).toBeTruthy();
  });

  test('should create delay step and execute it', async () => {
    const delayStep = StepTemplates.delay('Test Delay', 50);
    const executableStep = new StandardWorkflowStep(delayStep);

    const startTime = Date.now();
    const result = await executableStep.execute({}, 'workflow_123');
    const duration = Date.now() - startTime;

    expect(result.success).toBeTruthy();
    expect(result.output?.delayMs).toBe(50);
    expect(duration).toBeGreaterThanOrEqual(40); // Allow some tolerance
  });

  test('should register and retrieve steps in registry', () => {
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

  test('should use step factory to create and register steps', () => {
    const factory = new StepFactory();

    const step = factory.createStep(
      {
        name: 'Factory Step',
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

    factory.registerStep(step);

    const retrieved = factory.getStep(step.id);
    expect(retrieved).toBe(step);
  });

  test('should validate step definitions', () => {
    const validStep = createWorkflowStep(
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

    const validation = StandardWorkflowStep.validateDefinition(validStep);
    expect(validation.valid).toBeTruthy();
    expect(validation.errors).toBeUndefined();
  });

  test('should search steps by category', () => {
    const registry = new StepRegistry();

    const httpStep = createWorkflowStep(
      {
        name: 'HTTP Step',
        category: 'http',
        tags: ['http', 'api'],
        version: '1.0.0',
      },
      async () => ({ output: {}, performance: {} as any, success: true }),
    );

    const dbStep = createWorkflowStep(
      {
        name: 'DB Step',
        category: 'database',
        tags: ['database', 'sql'],
        version: '1.0.0',
      },
      async () => ({ output: {}, performance: {} as any, success: true }),
    );

    registry.register(httpStep);
    registry.register(dbStep);

    // Search by category
    const httpSteps = registry.search({ category: 'http' });
    expect(httpSteps).toHaveLength(1);
    expect(httpSteps[0].metadata.name).toBe('HTTP Step');

    // Search by tags
    const apiSteps = registry.search({ tags: ['api'] });
    expect(apiSteps).toHaveLength(1);
    expect(apiSteps[0].metadata.name).toBe('HTTP Step');
  });
});
