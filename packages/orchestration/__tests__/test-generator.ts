/**
 * Automated Test Generation Script
 *
 * Generates standardized test files using the DRY patterns established
 * in the orchestration package. This tool ensures all new components
 * follow consistent testing patterns from the start.
 */

import { writeFileSync } from 'fs';

// Types for test generation configuration
export interface TestGenerationConfig {
  componentName: string;
  componentType: 'workflow' | 'provider' | 'engine' | 'client' | 'server' | 'step-factory';
  outputPath: string;
  features?: {
    performanceTests?: boolean;
    errorHandling?: boolean;
    integration?: boolean;
    randomScenarios?: boolean;
    customScenarios?: TestScenario[];
  };
  imports?: {
    customImports?: string[];
    customUtilities?: string[];
  };
}

export interface TestScenario {
  name: string;
  type: 'basic' | 'error' | 'performance' | 'integration';
  description?: string;
  setup?: string;
  assertions?: string[];
}

/**
 * Test Generator Class
 */
export class TestGenerator {
  private templates = new Map<string, string>();

  constructor() {
    this.loadTemplates();
  }

  /**
   * Load test templates
   */
  private loadTemplates() {
    this.templates.set('workflow', this.getWorkflowTemplate());
    this.templates.set('provider', this.getProviderTemplate());
    this.templates.set('engine', this.getEngineTemplate());
    this.templates.set('client', this.getClientTemplate());
    this.templates.set('server', this.getServerTemplate());
    this.templates.set('step-factory', this.getStepFactoryTemplate());
  }

  /**
   * Generate test file based on configuration
   */
  generateTest(config: TestGenerationConfig): string {
    const template = this.templates.get(config.componentType);
    if (!template) {
      throw new Error(`Template not found for component type: ${config.componentType}`);
    }

    return this.processTemplate(template, config);
  }

  /**
   * Process template with configuration
   */
  private processTemplate(template: string, config: TestGenerationConfig): string {
    let processed = template;

    // Replace placeholders
    processed = processed.replace(/\{\{COMPONENT_NAME\}\}/g, config.componentName);
    processed = processed.replace(/\{\{COMPONENT_TYPE\}\}/g, config.componentType);
    processed = processed.replace(
      /\{\{COMPONENT_NAME_CAMEL\}\}/g,
      this.toCamelCase(config.componentName),
    );
    processed = processed.replace(
      /\{\{COMPONENT_NAME_PASCAL\}\}/g,
      this.toPascalCase(config.componentName),
    );
    processed = processed.replace(
      /\{\{COMPONENT_NAME_KEBAB\}\}/g,
      this.toKebabCase(config.componentName),
    );

    // Add custom imports if specified
    if (config.imports?.customImports) {
      const customImports = config.imports.customImports.map(imp => `import ${imp};`).join('\n');
      processed = processed.replace('// {{CUSTOM_IMPORTS}}', customImports);
    }

    // Add custom utilities if specified
    if (config.imports?.customUtilities) {
      const customUtilities = config.imports.customUtilities.join(', ');
      processed = processed.replace('{{CUSTOM_UTILITIES}}', `, ${customUtilities}`);
    }

    // Add feature-specific tests
    if (config.features?.performanceTests) {
      processed = processed.replace('// {{PERFORMANCE_TESTS}}', this.getPerformanceTestsTemplate());
    }

    if (config.features?.errorHandling) {
      processed = processed.replace(
        '// {{ERROR_HANDLING_TESTS}}',
        this.getErrorHandlingTestsTemplate(),
      );
    }

    if (config.features?.integration) {
      processed = processed.replace('// {{INTEGRATION_TESTS}}', this.getIntegrationTestsTemplate());
    }

    if (config.features?.randomScenarios) {
      processed = processed.replace(
        '// {{RANDOM_SCENARIO_TESTS}}',
        this.getRandomScenarioTestsTemplate(),
      );
    }

    // Add custom scenarios if specified
    if (config.features?.customScenarios) {
      const customTests = this.generateCustomScenarios(config.features.customScenarios);
      processed = processed.replace('// {{CUSTOM_SCENARIOS}}', customTests);
    }

    return processed;
  }

  /**
   * Generate custom scenario tests
   */
  private generateCustomScenarios(scenarios: TestScenario[]): string {
    return scenarios
      .map(
        scenario => `
    test('${scenario.name}', async () => {
      ${scenario.setup || '// Setup'}

      ${scenario.assertions?.map(assertion => `expect(${assertion});`).join('\n      ') || '// Assertions'}
    });`,
      )
      .join('\n');
  }

  /**
   * Workflow component template
   */
  private getWorkflowTemplate(): string {
    return `/**
 * {{COMPONENT_NAME}} Tests
 *
 * Auto-generated test file using DRY patterns.
 * Generated on: ${new Date().toISOString()}
 */

import { describe, expect, test, vi } from 'vitest';

// Import centralized DRY utilities
import {
  createWorkflowTestSuite,
  createWorkflowScenarios,
  testModuleImport,
  assertWorkflowExecution,
} from '../workflow-test-factory';
import {
  workflowGenerators,
  stepGenerators,
  executionGenerators,
  testDataUtils,
} from '../test-data-generators';
import {
  TestUtils,
  AssertionUtils,
  PerformanceUtils,
  ValidationUtils{{CUSTOM_UTILITIES}},
} from '../test-utils';
import {
  createMockWorkflowProvider,
  createMockWorkflowEngine,
} from '../setup';

// {{CUSTOM_IMPORTS}}

import { {{COMPONENT_NAME_PASCAL}} } from '../src/{{COMPONENT_NAME_KEBAB}}';

describe('{{COMPONENT_NAME}} - DRY Generated Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Use centralized workflow test suite
  createWorkflowTestSuite({
    suiteName: '{{COMPONENT_NAME}} Core Tests',
    moduleFactory: async () => {
      const module = await testModuleImport(
        () => import('../src/{{COMPONENT_NAME_KEBAB}}'),
        ['{{COMPONENT_NAME_PASCAL}}']
      );
      return new module.{{COMPONENT_NAME_PASCAL}}();
    },
    scenarios: [
      {
        name: 'should initialize correctly',
        type: 'basic',
        assertions: (instance) => {
          expect(instance).toBeDefined();
          AssertionUtils.assertWorkflow(instance);
        },
      },
      {
        name: 'should handle basic operations',
        type: 'execution',
        input: workflowGenerators.simple(),
        expected: { success: true },
      },
    ],
  });

  // Basic functionality tests
  describe('Basic Functionality', () => {
    test('should create {{COMPONENT_NAME_CAMEL}} instance', () => {
      const instance = new {{COMPONENT_NAME_PASCAL}}();
      expect(instance).toBeDefined();
    });

    test('should handle workflow operations', async () => {
      const instance = new {{COMPONENT_NAME_PASCAL}}();
      const workflow = workflowGenerators.simple();

      const result = await instance.execute(workflow);
      assertWorkflowExecution(result);
    });
  });

  // Validation tests
  describe('Validation Tests', () => {
    test('should validate input data', () => {
      const instance = new {{COMPONENT_NAME_PASCAL}}();
      const validWorkflow = workflowGenerators.simple();

      const validation = ValidationUtils.validateWorkflow(validWorkflow);
      expect(validation.valid).toBe(true);
    });

    test('should reject invalid input', () => {
      const instance = new {{COMPONENT_NAME_PASCAL}}();
      const invalidWorkflow = workflowGenerators.invalid();

      const validation = ValidationUtils.validateWorkflow(invalidWorkflow);
      expect(validation.valid).toBe(false);
    });
  });

  // {{PERFORMANCE_TESTS}}

  // {{ERROR_HANDLING_TESTS}}

  // {{INTEGRATION_TESTS}}

  // {{RANDOM_SCENARIO_TESTS}}

  // {{CUSTOM_SCENARIOS}}
});`;
  }

  /**
   * Provider component template
   */
  private getProviderTemplate(): string {
    return `/**
 * {{COMPONENT_NAME}} Provider Tests
 *
 * Auto-generated test file using DRY patterns.
 * Generated on: ${new Date().toISOString()}
 */

import { describe, expect, test, vi } from 'vitest';

// Import centralized DRY utilities
import {
  createProviderTestSuite,
  createProviderScenarios,
  testModuleImport,
  assertProviderHealth,
} from '../workflow-test-factory';
import {
  providerConfigGenerators,
  workflowGenerators,
  executionGenerators,
  testDataUtils,
} from '../test-data-generators';
import {
  TestUtils,
  AssertionUtils,
  PerformanceUtils{{CUSTOM_UTILITIES}},
} from '../test-utils';
import {
  createMockWorkflowProvider,
} from '../setup';

// {{CUSTOM_IMPORTS}}

import { {{COMPONENT_NAME_PASCAL}}Provider } from '../src/providers/{{COMPONENT_NAME_KEBAB}}-provider';

describe('{{COMPONENT_NAME}} Provider - DRY Generated Tests', () => {
  let provider: {{COMPONENT_NAME_PASCAL}}Provider;

  beforeEach(() => {
    vi.clearAllMocks();
    const config = providerConfigGenerators.{{COMPONENT_NAME_CAMEL}}();
    provider = new {{COMPONENT_NAME_PASCAL}}Provider(config);
  });

  // Use centralized provider test suite
  createProviderTestSuite({
    providerName: '{{COMPONENT_NAME}} Provider',
    providerType: '{{COMPONENT_NAME_KEBAB}}',
    providerFactory: () => provider,
    scenarios: createProviderScenarios().{{COMPONENT_NAME_CAMEL}},
  });

  // Provider-specific tests
  describe('Provider Operations', () => {
    test('should execute workflows', async () => {
      const workflow = workflowGenerators.simple();
      const result = await provider.execute(workflow.id, { test: 'data' });

      AssertionUtils.assertExecution(result);
    });

    test('should perform health checks', async () => {
      const health = await provider.healthCheck();
      assertProviderHealth(health);
    });
  });

  // {{PERFORMANCE_TESTS}}

  // {{ERROR_HANDLING_TESTS}}

  // {{INTEGRATION_TESTS}}

  // {{RANDOM_SCENARIO_TESTS}}

  // {{CUSTOM_SCENARIOS}}
});`;
  }

  /**
   * Engine component template
   */
  private getEngineTemplate(): string {
    return `/**
 * {{COMPONENT_NAME}} Engine Tests
 *
 * Auto-generated test file using DRY patterns.
 * Generated on: ${new Date().toISOString()}
 */

import { describe, expect, test, vi } from 'vitest';

// Import centralized DRY utilities
import {
  createWorkflowTestSuite,
  testModuleImport,
  assertWorkflowExecution,
} from '../workflow-test-factory';
import {
  workflowGenerators,
  executionGenerators,
  providerConfigGenerators,
  testDataUtils,
} from '../test-data-generators';
import {
  TestUtils,
  AssertionUtils,
  PerformanceUtils{{CUSTOM_UTILITIES}},
} from '../test-utils';
import {
  createMockWorkflowEngine,
  createMockWorkflowProvider,
} from '../setup';

// {{CUSTOM_IMPORTS}}

import { {{COMPONENT_NAME_PASCAL}}Engine } from '../src/engines/{{COMPONENT_NAME_KEBAB}}-engine';

describe('{{COMPONENT_NAME}} Engine - DRY Generated Tests', () => {
  let engine: {{COMPONENT_NAME_PASCAL}}Engine;

  beforeEach(() => {
    vi.clearAllMocks();
    const config = {
      defaultProvider: 'test-provider',
      providers: [
        {
          name: 'test-provider',
          type: '{{COMPONENT_NAME_KEBAB}}',
          config: providerConfigGenerators.{{COMPONENT_NAME_CAMEL}}(),
        },
      ],
    };
    engine = new {{COMPONENT_NAME_PASCAL}}Engine(config);
  });

  // Engine operations tests
  describe('Engine Operations', () => {
    test('should execute workflows', async () => {
      const workflow = workflowGenerators.simple();
      const result = await engine.execute(workflow.id, { test: 'data' });

      assertWorkflowExecution(result);
    });

    test('should manage execution lifecycle', async () => {
      const workflow = workflowGenerators.simple();

      // Start execution
      const execution = await engine.execute(workflow.id, { test: 'data' });
      assertWorkflowExecution(execution, 'running');

      // Get status
      const status = await engine.getExecution(execution.id);
      assertWorkflowExecution(status);

      // List executions
      const executions = await engine.listExecutions();
      expect(Array.isArray(executions)).toBe(true);
    });
  });

  // {{PERFORMANCE_TESTS}}

  // {{ERROR_HANDLING_TESTS}}

  // {{INTEGRATION_TESTS}}

  // {{RANDOM_SCENARIO_TESTS}}

  // {{CUSTOM_SCENARIOS}}
});`;
  }

  /**
   * Client component template
   */
  private getClientTemplate(): string {
    return `/**
 * {{COMPONENT_NAME}} Client Tests
 *
 * Auto-generated test file using DRY patterns.
 * Generated on: ${new Date().toISOString()}
 *
 * @vitest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

// Import centralized DRY utilities
import {
  createWorkflowTestSuite,
  testModuleImport,
} from '../workflow-test-factory';
import {
  workflowGenerators,
  executionGenerators,
  testDataUtils,
} from '../test-data-generators';
import {
  TestUtils,
  AssertionUtils,
  HookTestUtils{{CUSTOM_UTILITIES}},
} from '../test-utils';
import {
  createMockWorkflowClient,
  createMockWorkflowProvider,
} from '../setup';

// {{CUSTOM_IMPORTS}}

import { use{{COMPONENT_NAME_PASCAL}} } from '../src/client/use-{{COMPONENT_NAME_KEBAB}}';

describe('{{COMPONENT_NAME}} Client - DRY Generated Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Hook tests using centralized utilities
  describe('Hook Tests', () => {
    test('should initialize hook correctly', () => {
      const mockProvider = createMockWorkflowProvider();

      const { result } = renderHook(() =>
        use{{COMPONENT_NAME_PASCAL}}({
          provider: mockProvider,
          enabled: true,
        })
      );

      expect(result.current).toBeDefined();
      expect(result.current.isLoading).toBe(false);
    });

    test('should handle hook operations', async () => {
      const mockProvider = createMockWorkflowProvider();
      const mockWorkflow = workflowGenerators.simple();

      const { result } = renderHook(() =>
        use{{COMPONENT_NAME_PASCAL}}({
          provider: mockProvider,
          enabled: true,
        })
      );

      await act(async () => {
        await result.current.execute?.(mockWorkflow);
      });

      expect(result.current.data).toBeDefined();
    });
  });

  // {{PERFORMANCE_TESTS}}

  // {{ERROR_HANDLING_TESTS}}

  // {{INTEGRATION_TESTS}}

  // {{RANDOM_SCENARIO_TESTS}}

  // {{CUSTOM_SCENARIOS}}
});`;
  }

  /**
   * Server component template
   */
  private getServerTemplate(): string {
    return `/**
 * {{COMPONENT_NAME}} Server Tests
 *
 * Auto-generated test file using DRY patterns.
 * Generated on: ${new Date().toISOString()}
 */

import { describe, expect, test, vi } from 'vitest';

// Import centralized DRY utilities
import {
  createWorkflowTestSuite,
  testModuleImport,
  assertWorkflowExecution,
} from '../workflow-test-factory';
import {
  workflowGenerators,
  executionGenerators,
  testDataUtils,
} from '../test-data-generators';
import {
  TestUtils,
  AssertionUtils,
  PerformanceUtils{{CUSTOM_UTILITIES}},
} from '../test-utils';
import {
  createMockWorkflowProvider,
  createTestWorkflowServerClient,
} from '../setup';

// {{CUSTOM_IMPORTS}}

import {
  create{{COMPONENT_NAME_PASCAL}}Handler,
  {{COMPONENT_NAME_CAMEL}}Action,
} from '../src/server/{{COMPONENT_NAME_KEBAB}}';

describe('{{COMPONENT_NAME}} Server - DRY Generated Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Handler tests
  describe('Handler Tests', () => {
    test('should create handler', () => {
      const mockProvider = createMockWorkflowProvider();
      const handler = create{{COMPONENT_NAME_PASCAL}}Handler(mockProvider);

      expect(handler).toBeDefined();
      expect(typeof handler).toBe('function');
    });

    test('should handle requests', async () => {
      const mockProvider = createMockWorkflowProvider();
      const handler = create{{COMPONENT_NAME_PASCAL}}Handler(mockProvider);

      const mockRequest = {
        method: 'POST',
        json: () => Promise.resolve({ test: 'data' }),
      };

      const response = await handler(mockRequest);
      expect(response).toBeDefined();
    });
  });

  // Server action tests
  describe('Server Action Tests', () => {
    test('should execute server action', async () => {
      const formData = new FormData();
      formData.append('test', 'data');

      const result = await {{COMPONENT_NAME_CAMEL}}Action(formData);
      expect(result).toBeDefined();
    });
  });

  // {{PERFORMANCE_TESTS}}

  // {{ERROR_HANDLING_TESTS}}

  // {{INTEGRATION_TESTS}}

  // {{RANDOM_SCENARIO_TESTS}}

  // {{CUSTOM_SCENARIOS}}
});`;
  }

  /**
   * Step Factory component template
   */
  private getStepFactoryTemplate(): string {
    return `/**
 * {{COMPONENT_NAME}} Step Factory Tests
 *
 * Auto-generated test file using DRY patterns.
 * Generated on: ${new Date().toISOString()}
 */

import { describe, expect, test, vi } from 'vitest';

// Import centralized DRY utilities
import {
  createStepFactoryTestSuite,
  createStepFactoryScenarios,
  testModuleImport,
} from '../workflow-test-factory';
import {
  stepGenerators,
  workflowGenerators,
  testDataUtils,
} from '../test-data-generators';
import {
  TestUtils,
  AssertionUtils,
  ValidationUtils{{CUSTOM_UTILITIES}},
} from '../test-utils';
import {
  createMockStepFactory,
} from '../setup';

// {{CUSTOM_IMPORTS}}

import { {{COMPONENT_NAME_PASCAL}}StepFactory } from '../src/factories/{{COMPONENT_NAME_KEBAB}}-step-factory';

describe('{{COMPONENT_NAME}} Step Factory - DRY Generated Tests', () => {
  let factory: {{COMPONENT_NAME_PASCAL}}StepFactory;

  beforeEach(() => {
    vi.clearAllMocks();
    factory = new {{COMPONENT_NAME_PASCAL}}StepFactory();
  });

  // Use centralized step factory test suite
  createStepFactoryTestSuite({
    factoryName: '{{COMPONENT_NAME}} Step Factory',
    factoryInstance: factory,
    scenarios: createStepFactoryScenarios(),
  });

  // Factory-specific tests
  describe('Factory Operations', () => {
    test('should create steps', () => {
      const stepConfig = stepGenerators.basic();
      const step = factory.createStep(stepConfig);

      AssertionUtils.assertStep(step);
    });

    test('should validate steps', () => {
      const step = stepGenerators.basic();
      const isValid = factory.validateStep(step);

      expect(isValid).toBe(true);
    });
  });

  // {{PERFORMANCE_TESTS}}

  // {{ERROR_HANDLING_TESTS}}

  // {{INTEGRATION_TESTS}}

  // {{RANDOM_SCENARIO_TESTS}}

  // {{CUSTOM_SCENARIOS}}
});`;
  }

  /**
   * Performance tests template
   */
  private getPerformanceTestsTemplate(): string {
    return `
  // Performance tests using centralized utilities
  describe('Performance Tests', () => {
    test('should meet performance requirements', async () => {
      const result = await TestUtils.performance.testPerformance(
        async () => {
          // Performance test implementation
          return await instance.performOperation();
        },
        1000 // Max 1 second
      );

      expect(result.duration).toBeLessThan(1000);
    });

    test('should handle high load', async () => {
      const benchmark = await TestUtils.performance.benchmark(
        async () => {
          // High load test implementation
          return await instance.handleBatch();
        },
        5 // 5 iterations
      );

      expect(benchmark.average).toBeLessThan(500); // Max 500ms average
    });
  });`;
  }

  /**
   * Error handling tests template
   */
  private getErrorHandlingTestsTemplate(): string {
    return `
  // Error handling tests using centralized utilities
  describe('Error Handling Tests', () => {
    test('should handle errors gracefully', async () => {
      await TestUtils.errors.expectError(
        async () => {
          // Error-inducing operation
          await instance.performInvalidOperation();
        },
        'Expected error message'
      );
    });

    test('should handle multiple error scenarios', async () => {
      const scenarios = [
        {
          name: 'network error',
          fn: async () => await instance.networkOperation(),
          expectedError: 'Network error',
        },
        {
          name: 'validation error',
          fn: async () => await instance.validateData(null),
          expectedError: 'Validation failed',
        },
      ];

      await TestUtils.errors.testErrorScenarios(
        scenarios.reduce((acc, scenario) => {
          acc[scenario.name] = scenario.fn;
          return acc;
        }, {} as any),
        scenarios.reduce((acc, scenario) => {
          acc[scenario.name] = scenario.expectedError;
          return acc;
        }, {} as any)
      );
    });
  });`;
  }

  /**
   * Integration tests template
   */
  private getIntegrationTestsTemplate(): string {
    return `
  // Integration tests using centralized patterns
  describe('Integration Tests', () => {
    test('should integrate with other components', async () => {
      const mockProvider = createMockWorkflowProvider();
      const workflow = workflowGenerators.simple();

      const result = await instance.integrateWith(mockProvider, workflow);

      AssertionUtils.assertWorkflowExecution(result);
    });

    test('should handle integration errors', async () => {
      const mockProvider = createMockWorkflowProvider();
      mockProvider.execute.mockRejectedValue(new Error('Integration error'));

      await TestUtils.errors.expectError(
        async () => {
          await instance.integrateWith(mockProvider, workflowGenerators.simple());
        },
        'Integration error'
      );
    });
  });`;
  }

  /**
   * Random scenario tests template
   */
  private getRandomScenarioTestsTemplate(): string {
    return `
  // Random scenario tests using centralized utilities
  describe('Random Scenario Tests', () => {
    test('should handle random configurations', async () => {
      const randomConfigs = Array.from({ length: 10 }, () => ({
        id: testDataUtils.randomString(),
        data: testDataUtils.randomData(),
      }));

      for (const config of randomConfigs) {
        const result = await instance.processConfig(config);
        expect(result).toBeDefined();
      }
    });

    test('should handle random workflows', async () => {
      const randomWorkflows = Array.from({ length: 5 }, () =>
        testDataUtils.randomWorkflow()
      );

      for (const workflow of randomWorkflows) {
        const validation = ValidationUtils.validateWorkflow(workflow);

        if (validation.valid) {
          const result = await instance.processWorkflow(workflow);
          AssertionUtils.assertWorkflowExecution(result);
        }
      }
    });
  });`;
  }

  // Utility methods
  private toCamelCase(str: string): string {
    return str.replace(/-([a-z])/g, g => g[1].toUpperCase());
  }

  private toPascalCase(str: string): string {
    return this.toCamelCase(str).replace(/^[a-z]/, g => g.toUpperCase());
  }

  private toKebabCase(str: string): string {
    return str.replace(/[A-Z]/g, g => `-${g.toLowerCase()}`).replace(/^-/, '');
  }

  /**
   * Save generated test to file
   */
  saveTest(config: TestGenerationConfig, content: string): void {
    try {
      writeFileSync(config.outputPath, content, 'utf8');
      console.log(`✅ Generated test file: ${config.outputPath}`);
    } catch (error) {
      console.error(`❌ Failed to save test file: ${error}`);
      throw error;
    }
  }

  /**
   * Generate and save test file
   */
  generateAndSave(config: TestGenerationConfig): void {
    const content = this.generateTest(config);
    this.saveTest(config, content);
  }
}

/**
 * CLI utility for generating tests
 */
export function generateTestFromCLI(args: string[]): void {
  const [componentName, componentType, outputPath] = args;

  if (!componentName || !componentType || !outputPath) {
    console.error('Usage: node test-generator.js <componentName> <componentType> <outputPath>');
    console.error('Component types: workflow, provider, engine, client, server, step-factory');
    process.exit(1);
  }

  const generator = new TestGenerator();
  const config: TestGenerationConfig = {
    componentName,
    componentType: componentType as any,
    outputPath,
    features: {
      performanceTests: true,
      errorHandling: true,
      integration: true,
      randomScenarios: true,
    },
  };

  try {
    generator.generateAndSave(config);
    console.log(`🎉 Successfully generated test file for ${componentName}`);
  } catch (error) {
    console.error(`❌ Failed to generate test: ${error}`);
    process.exit(1);
  }
}

/**
 * Predefined configurations for common components
 */
export const presetConfigs = {
  workflowComponent: (name: string, outputPath: string): TestGenerationConfig => ({
    componentName: name,
    componentType: 'workflow',
    outputPath,
    features: {
      performanceTests: true,
      errorHandling: true,
      integration: true,
      randomScenarios: true,
    },
  }),

  providerComponent: (name: string, outputPath: string): TestGenerationConfig => ({
    componentName: name,
    componentType: 'provider',
    outputPath,
    features: {
      performanceTests: true,
      errorHandling: true,
      integration: true,
      randomScenarios: true,
    },
  }),

  clientComponent: (name: string, outputPath: string): TestGenerationConfig => ({
    componentName: name,
    componentType: 'client',
    outputPath,
    features: {
      performanceTests: false, // Usually not needed for client components
      errorHandling: true,
      integration: true,
      randomScenarios: false,
    },
  }),
};

// Export the generator instance for use in other files
export const testGenerator = new TestGenerator();

// CLI support if running directly
if (require.main === module) {
  generateTestFromCLI(process.argv.slice(2));
}
