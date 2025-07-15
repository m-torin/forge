/**
 * Workflow Test Factory
 *
 * Provides comprehensive test suite generators for workflow orchestration components.
 * Reduces code duplication and ensures consistent test patterns across all workflow tests.
 *
 * Based on the analytics emitter-test-factory.ts pattern but specialized for workflows.
 */

import { beforeEach, describe, expect, test } from 'vitest';
import { createMockWorkflowProvider } from './setup';

// Types for test factory parameters
export interface WorkflowTestSuiteConfig<T = any> {
  suiteName: string;
  moduleFactory: () => Promise<T>;
  scenarios: WorkflowTestScenario[];
  options?: {
    skipPerformanceTests?: boolean;
    skipErrorTests?: boolean;
    customAssertions?: (result: any) => void;
  };
}

export interface WorkflowTestScenario {
  name: string;
  type: 'basic' | 'provider' | 'execution' | 'error' | 'performance' | 'edge-case';
  input?: any;
  expected?: any;
  mockSetup?: () => void;
  assertions?: (result: any) => void;
}

export interface ProviderTestSuiteConfig {
  providerName: string;
  providerType: 'upstash-workflow' | 'upstash-qstash' | 'redis';
  providerFactory: () => any;
  scenarios?: ProviderTestScenario[];
}

export interface ProviderTestScenario {
  name: string;
  method: string;
  input?: any;
  expected?: any;
  mockSetup?: () => void;
  shouldFail?: boolean;
  expectedError?: string;
}

export interface StepFactoryTestSuiteConfig {
  factoryName: string;
  factoryInstance: any;
  scenarios?: StepFactoryTestScenario[];
}

export interface StepFactoryTestScenario {
  name: string;
  operation: 'create' | 'validate' | 'register' | 'template' | 'registry';
  input?: any;
  expected?: any;
  shouldFail?: boolean;
  expectedError?: string;
}

/**
 * Create a comprehensive test suite for workflow components
 * Similar to analytics createEmitterTestSuite but for workflows
 */
export function createWorkflowTestSuite<T>(config: WorkflowTestSuiteConfig<T>) {
  const { suiteName, moduleFactory, scenarios, options = {} } = config;

  describe(suiteName, () => {
    // Basic import and module structure tests
    test('should import module successfully', async () => {
      const module = await moduleFactory();
      expect(module).toBeDefined();
    });

    // Run all scenarios
    scenarios.forEach(scenario => {
      const testName = `${scenario.type}: ${scenario.name}`;

      if (scenario.type === 'error') {
        test(testName, async () => {
          if (scenario.mockSetup) {
            scenario.mockSetup();
          }

          try {
            const module = await moduleFactory();
            const result = await executeScenario(module, scenario);

            if (!scenario.expected || scenario.expected.shouldFail) {
              throw new Error('Expected scenario to fail but it succeeded');
            }

            if (scenario.assertions) {
              scenario.assertions(result);
            }
          } catch (error) {
            if (scenario.expected?.shouldFail) {
              expect(error).toBeDefined();
              if (scenario.expected.errorMessage) {
                expect((error as Error).message).toContain(scenario.expected.errorMessage);
              }
            } else {
              throw error;
            }
          }
        });
      } else if (scenario.type === 'performance' && !options.skipPerformanceTests) {
        test(testName, async () => {
          if (scenario.mockSetup) {
            scenario.mockSetup();
          }

          const startTime = Date.now();
          const module = await moduleFactory();
          await executeScenario(module, scenario);
          const duration = Date.now() - startTime;

          // Performance assertions
          const maxDuration = scenario.expected?.maxDuration || 1000;
          expect(duration).toBeLessThan(maxDuration);
        });
      } else {
        test(testName, async () => {
          if (scenario.mockSetup) {
            scenario.mockSetup();
          }

          const module = await moduleFactory();
          const result = await executeScenario(module, scenario);

          if (scenario.expected) {
            expect(result).toMatchObject(scenario.expected);
          }

          if (scenario.assertions) {
            scenario.assertions(result);
          }

          if (options.customAssertions) {
            options.customAssertions(result);
          }
        });
      }
    });
  });
}

/**
 * Execute a test scenario based on its type
 */
async function executeScenario(module: any, scenario: WorkflowTestScenario) {
  switch (scenario.type) {
    case 'basic':
      return module;
    case 'provider':
      return scenario.input ? await module.execute(scenario.input) : module;
    case 'execution':
      return scenario.input ? await module.execute(scenario.input) : await module.execute();
    case 'error':
    case 'performance':
    case 'edge-case':
      return scenario.input ? await module.execute(scenario.input) : module;
    default:
      return module;
  }
}

/**
 * Create a test suite for workflow providers
 */
export function createProviderTestSuite(config: ProviderTestSuiteConfig) {
  const { providerName, providerType, providerFactory, scenarios = [] } = config;

  describe(`${providerName} Provider`, () => {
    let provider: any;

    beforeEach(() => {
      provider = providerFactory();
    });

    // Standard provider tests
    test('should have required provider interface', () => {
      expect(provider).toBeDefined();
      expect(provider.name).toBeDefined();
      expect(provider.type).toBe(providerType);
      expect(provider.healthCheck).toBeDefined();
    });

    test('should pass health check', async () => {
      const health = await provider.healthCheck();
      expect(health).toBeDefined();
      expect(health.status).toBe('healthy');
    });

    // Provider-specific method tests
    if (providerType === 'upstash-workflow') {
      test('should have workflow methods', () => {
        expect(provider.execute).toBeDefined();
        expect(provider.getExecution).toBeDefined();
        expect(provider.listExecutions).toBeDefined();
        expect(provider.cancelExecution).toBeDefined();
        expect(provider.scheduleWorkflow).toBeDefined();
        expect(provider.unscheduleWorkflow).toBeDefined();
      });
    } else if (providerType === 'upstash-qstash') {
      test('should have QStash methods', () => {
        expect(provider.publishJSON).toBeDefined();
        expect(provider.schedules).toBeDefined();
        expect(provider.schedules.create).toBeDefined();
        expect(provider.schedules.delete).toBeDefined();
      });
    } else if (providerType === 'redis') {
      test('should have Redis methods', () => {
        expect(provider.get).toBeDefined();
        expect(provider.set).toBeDefined();
        expect(provider.del).toBeDefined();
        expect(provider.keys).toBeDefined();
      });
    }

    // Custom scenario tests
    scenarios.forEach(scenario => {
      const testName = scenario.shouldFail
        ? `should fail: ${scenario.name}`
        : `should succeed: ${scenario.name}`;

      test(testName, async () => {
        if (scenario.mockSetup) {
          scenario.mockSetup();
        }

        if (scenario.shouldFail) {
          try {
            await provider[scenario.method](scenario.input);
            throw new Error('Expected method to fail but it succeeded');
          } catch (error) {
            expect(error).toBeDefined();
            if (scenario.expectedError) {
              expect((error as Error).message).toContain(scenario.expectedError);
            }
          }
        } else {
          const result = await provider[scenario.method](scenario.input);

          if (scenario.expected) {
            expect(result).toMatchObject(scenario.expected);
          }
        }
      });
    });
  });
}

/**
 * Create a test suite for step factories
 */
export function createStepFactoryTestSuite(config: StepFactoryTestSuiteConfig) {
  const { factoryName, factoryInstance, scenarios = [] } = config;

  describe(`${factoryName} Step Factory`, () => {
    let factory: any;

    beforeEach(() => {
      factory = factoryInstance;
    });

    // Standard factory tests
    test('should have required factory interface', () => {
      expect(factory).toBeDefined();
      expect(factory.createStep).toBeDefined();
      expect(factory.validateStep).toBeDefined();
    });

    test('should create basic step', () => {
      const step = factory.createStep({ name: 'Test Step', action: 'test' });
      expect(step).toBeDefined();
      expect(step.name).toBe('Test Step');
      expect(step.action).toBe('test');
    });

    test('should validate step', () => {
      const step = { name: 'Test Step', action: 'test' };
      const isValid = factory.validateStep(step);
      expect(isValid).toBeTruthy();
    });

    // Custom scenario tests
    scenarios.forEach(scenario => {
      const testName = scenario.shouldFail
        ? `should fail: ${scenario.name}`
        : `should succeed: ${scenario.name}`;

      test(testName, async () => {
        let result;

        if (scenario.shouldFail) {
          try {
            result = await executeStepFactoryOperation(factory, scenario);
            throw new Error('Expected operation to fail but it succeeded');
          } catch (error) {
            expect(error).toBeDefined();
            if (scenario.expectedError) {
              expect((error as Error).message).toContain(scenario.expectedError);
            }
          }
        } else {
          result = await executeStepFactoryOperation(factory, scenario);

          if (scenario.expected) {
            expect(result).toMatchObject(scenario.expected);
          }
        }
      });
    });
  });
}

/**
 * Execute step factory operations based on scenario
 */
async function executeStepFactoryOperation(factory: any, scenario: StepFactoryTestScenario) {
  switch (scenario.operation) {
    case 'create':
      return factory.createStep(scenario.input);
    case 'validate':
      return factory.validateStep(scenario.input);
    case 'register':
      return await factory.registerStep(scenario.input);
    case 'template':
      return factory.createStepFromTemplate(scenario.input);
    case 'registry':
      return factory.getRegisteredSteps();
    default:
      return factory.createStep(scenario.input);
  }
}

/**
 * Create standard workflow test scenarios
 */
export function createWorkflowScenarios() {
  return {
    // Basic workflow scenarios
    basic: {
      simpleWorkflow: {
        name: 'simple workflow execution',
        type: 'execution' as const,
        input: {
          id: 'test-workflow',
          steps: [{ name: 'Step 1', action: 'test' }],
        },
        expected: {
          id: expect.any(String),
          status: 'running',
        },
      },

      emptyWorkflow: {
        name: 'empty workflow',
        type: 'basic' as const,
        input: {
          id: 'empty-workflow',
          steps: [],
        },
      },
    },

    // Provider scenarios
    provider: {
      healthCheck: {
        name: 'provider health check',
        type: 'provider' as const,
        expected: {
          status: 'healthy',
        },
      },

      execution: {
        name: 'provider execution',
        type: 'provider' as const,
        input: {
          workflowId: 'test-workflow',
          input: { test: true },
        },
        expected: {
          id: expect.any(String),
          status: expect.stringMatching(/^(running|completed|failed)$/),
        },
      },
    },

    // Error scenarios
    error: {
      invalidWorkflow: {
        name: 'invalid workflow structure',
        type: 'error' as const,
        input: {
          id: null,
          steps: 'invalid',
        },
        expected: {
          shouldFail: true,
          errorMessage: 'Invalid workflow',
        },
      },

      providerError: {
        name: 'provider failure',
        type: 'error' as const,
        mockSetup: () => {
          const mockProvider = createMockWorkflowProvider();
          mockProvider.execute.mockRejectedValue(new Error('Provider failed'));
        },
        expected: {
          shouldFail: true,
          errorMessage: 'Provider failed',
        },
      },
    },

    // Performance scenarios
    performance: {
      fastExecution: {
        name: 'fast workflow execution',
        type: 'performance' as const,
        input: {
          id: 'fast-workflow',
          steps: [{ name: 'Fast Step', action: 'test' }],
        },
        expected: {
          maxDuration: 500,
        },
      },

      bulkExecution: {
        name: 'bulk workflow execution',
        type: 'performance' as const,
        input: {
          workflows: Array.from({ length: 10 }, (_, i) => ({
            id: `bulk-workflow-${i}`,
            steps: [{ name: `Step ${i}`, action: 'test' }],
          })),
        },
        expected: {
          maxDuration: 2000,
        },
      },
    },

    // Edge case scenarios
    edgeCase: {
      largeWorkflow: {
        name: 'large workflow with many steps',
        type: 'edge-case' as const,
        input: {
          id: 'large-workflow',
          steps: Array.from({ length: 100 }, (_, i) => ({
            name: `Step ${i}`,
            action: 'test',
          })),
        },
      },

      specialCharacters: {
        name: 'workflow with special characters',
        type: 'edge-case' as const,
        input: {
          id: 'special-workflow-!@#$%^&*()',
          name: 'Workflow with émojis 🚀 and üñíçøðé',
          steps: [{ name: "Step with \"quotes\" and 'apostrophes'", action: 'test' }],
        },
      },
    },
  };
}

/**
 * Create standard provider test scenarios
 */
export function createProviderScenarios() {
  return {
    upstashWorkflow: [
      {
        name: 'execute workflow',
        method: 'execute',
        input: { workflowId: 'test', input: {} },
        expected: { id: expect.any(String), status: 'running' },
      },
      {
        name: 'get execution',
        method: 'getExecution',
        input: 'exec-123',
        expected: { id: 'exec-123', status: expect.any(String) },
      },
      {
        name: 'list executions',
        method: 'listExecutions',
        expected: expect.any(Array),
      },
      {
        name: 'cancel execution',
        method: 'cancelExecution',
        input: 'exec-123',
        expected: { id: 'exec-123', status: 'cancelled' },
      },
    ],

    upstashQStash: [
      {
        name: 'publish JSON message',
        method: 'publishJSON',
        input: { url: 'https://example.com', body: { test: true } },
        expected: { messageId: expect.any(String) },
      },
      {
        name: 'create schedule',
        method: 'schedules.create',
        input: { cron: '0 9 * * *', destination: 'https://example.com' },
        expected: { scheduleId: expect.any(String) },
      },
    ],

    redis: [
      {
        name: 'set and get value',
        method: 'set',
        input: ['test-key', 'test-value'],
        expected: 'OK',
      },
      {
        name: 'delete key',
        method: 'del',
        input: 'test-key',
        expected: expect.any(Number),
      },
    ],
  };
}

/**
 * Create standard step factory test scenarios
 */
export function createStepFactoryScenarios() {
  return [
    {
      name: 'create simple step',
      operation: 'create' as const,
      input: { name: 'Test Step', action: 'test' },
      expected: { name: 'Test Step', action: 'test', id: expect.any(String) },
    },
    {
      name: 'create step with input',
      operation: 'create' as const,
      input: { name: 'Input Step', action: 'test', input: { value: 42 } },
      expected: { name: 'Input Step', action: 'test', input: { value: 42 } },
    },
    {
      name: 'validate valid step',
      operation: 'validate' as const,
      input: { name: 'Valid Step', action: 'test' },
      expected: true,
    },
    {
      name: 'validate invalid step',
      operation: 'validate' as const,
      input: { name: '', action: '' },
      expected: false,
    },
    {
      name: 'register step',
      operation: 'register' as const,
      input: { name: 'Registered Step', action: 'test' },
      expected: { success: true },
    },
    {
      name: 'create from template',
      operation: 'template' as const,
      input: { template: 'basic', name: 'Templated Step' },
      expected: { name: 'Templated Step', id: expect.any(String) },
    },
    {
      name: 'get registered steps',
      operation: 'registry' as const,
      expected: expect.any(Array),
    },
  ];
}

/**
 * Test utility for module imports with consistent error handling
 */
export async function testModuleImport<T>(
  importFn: () => Promise<T>,
  expectedExports: string[] = [],
): Promise<T> {
  try {
    const module = await importFn();
    expect(module).toBeDefined();

    expectedExports.forEach(exportName => {
      expect((module as any)[exportName]).toBeDefined();
    });

    return module;
  } catch (error) {
    throw new Error(`Module import failed: ${(error as Error).message}`);
  }
}

/**
 * Test utility for asserting workflow execution results
 */
export function assertWorkflowExecution(execution: any, expectedStatus?: string) {
  expect(execution).toBeDefined();
  expect(execution.id).toBeDefined();
  expect(execution.status).toBeDefined();

  if (expectedStatus) {
    expect(execution.status).toBe(expectedStatus);
  }

  expect(['pending', 'running', 'completed', 'failed', 'cancelled']).toContain(execution.status);
}

/**
 * Test utility for asserting provider health
 */
export function assertProviderHealth(health: any, expectedStatus = 'healthy') {
  expect(health).toBeDefined();
  expect(health.status).toBe(expectedStatus);
}
