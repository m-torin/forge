/**
 * Testing & Development Utilities
 * Workflow mocking, testing utilities, and development server capabilities
 */

import { createServerObservability } from '@repo/observability/server/next';
import {
  WorkflowDefinition,
  WorkflowExecution,
  WorkflowExecutionMetadata,
  WorkflowExecutionStatus,
  WorkflowProvider,
  WorkflowStepExecution,
} from '../types/index';

import { ExecutionHistory } from './monitoring';

export interface MockWorkflowConfig {
  /** Mock execution behavior */
  behavior: 'custom' | 'failure' | 'success' | 'timeout';
  /** Execution delay in milliseconds */
  delay?: number;
  /** Custom error for failure behavior */
  error?: Error;
  /** Execution metadata */
  metadata?: Record<string, unknown>;
  /** Custom execution result */
  result?: unknown;
  /** Step-by-step execution simulation */
  stepResults?: {
    delay?: number;
    error?: Error;
    result?: unknown;
    stepId: string;
  }[];
}

export interface TestExecutionResult {
  /** Actual output */
  actualOutput?: unknown;
  /** Assertion results */
  assertions?: {
    message?: string;
    passed: boolean;
    type: string;
  }[];
  /** Execution duration */
  duration: number;
  /** Error information */
  error?: {
    message: string;
    stack?: string;
    type: 'assertion' | 'execution' | 'timeout';
  };
  /** Execution details */
  execution?: WorkflowExecution;
  /** Scenario name */
  scenarioName: string;
  /** Test status */
  status: 'failed' | 'passed' | 'skipped' | 'timeout';
}

export interface TestScenario {
  /** Test assertions */
  assertions?: {
    condition: unknown;
    message?: string;
    type: 'custom' | 'duration' | 'error' | 'output' | 'steps';
  }[];
  /** Scenario description */
  description?: string;
  /** Expected error */
  expectedError?: string;
  /** Expected output */
  expectedOutput?: unknown;
  /** Input data for the workflow */
  input: unknown;
  /** Mock configuration for dependencies */
  mocks?: Record<string, MockWorkflowConfig>;
  /** Scenario name */
  name: string;
  /** Timeout for scenario execution */
  timeout?: number;
}

export interface TestSuiteResult {
  /** Total duration */
  duration: number;
  /** Suite-level error */
  error?: string;
  /** Individual test results */
  results: TestExecutionResult[];
  /** Statistics */
  stats: {
    failed: number;
    passed: number;
    skipped: number;
    timeout: number;
    total: number;
  };
  /** Overall status */
  status: 'failed' | 'partial' | 'passed';
  /** Test suite name */
  suiteName: string;
}

export interface WorkflowTestSuite {
  /** Test configuration */
  config?: {
    /** Parallel execution */
    parallel?: boolean;
    /** Retry failed tests */
    retry?: boolean;
    /** Test timeout */
    timeout?: number;
  };
  /** Test suite description */
  description?: string;
  /** Test suite name */
  name: string;
  /** Test scenarios */
  scenarios: TestScenario[];
  /** Setup function */
  setup?: () => Promise<void>;
  /** Cleanup function */
  teardown?: () => Promise<void>;
  /** Workflow to test */
  workflowId: string;
}

export class MockWorkflowProvider implements WorkflowProvider {
  name = 'MockWorkflowProvider';
  version = '1.0.0';
  private executionHistory: ExecutionHistory[] = [];
  private executions = new Map<string, WorkflowExecution>();

  private mocks = new Map<string, MockWorkflowConfig>();
  private workflows = new Map<string, WorkflowDefinition>();

  async cancelExecution(executionId: string): Promise<boolean> {
    const execution = this.executions.get(executionId);
    if (execution && execution.status === 'running') {
      execution.status = 'cancelled';
      execution.completedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Clear all mocks
   */
  clearMocks(): void {
    this.mocks.clear();
    this.executions.clear();
    this.executionHistory = [];
  }

  /**
   * Configure mock behavior for a workflow
   */
  configureMock(workflowId: string, config: MockWorkflowConfig): void {
    this.mocks.set(workflowId, config);
  }

  // WorkflowProvider implementation

  async createWorkflow(definition: WorkflowDefinition): Promise<string> {
    this.workflows.set(definition.id, definition);
    return definition.id;
  }

  async execute(
    definition: WorkflowDefinition,
    input?: Record<string, any>,
  ): Promise<WorkflowExecution> {
    const executionId = await this.executeWorkflow(definition.id, input);
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }
    return execution;
  }

  async executeWorkflow(
    workflowId: string,
    input?: unknown,
    options?: Record<string, unknown>,
  ): Promise<string> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const executionId = this.generateExecutionId();
    const mockConfig = this.mocks.get(workflowId);

    const startedAt = new Date();
    const execution: WorkflowExecution = {
      id: executionId,
      input: input as Record<string, any>,
      metadata: (options as WorkflowExecutionMetadata) || {},
      startedAt,
      status: 'running',
      steps: [],
      workflowId,
    };

    this.executions.set(executionId, execution);

    // Simulate execution based on mock configuration
    this.simulateExecution(execution, mockConfig);

    return executionId;
  }

  async getExecution(executionId: string): Promise<null | WorkflowExecution> {
    return this.executions.get(executionId) || null;
  }

  async getExecutionStatus(executionId: string): Promise<null | WorkflowExecution> {
    return this.executions.get(executionId) || null;
  }

  async getWorkflow(workflowId: string): Promise<null | WorkflowDefinition> {
    return this.workflows.get(workflowId) || null;
  }

  async healthCheck(): Promise<{
    responseTime: number;
    status: 'degraded' | 'healthy' | 'unhealthy';
    timestamp: Date;
  }> {
    return {
      responseTime: 1,
      status: 'healthy',
      timestamp: new Date(),
    };
  }

  async listExecutions(
    workflowId: string,
    options?: { cursor?: string; limit?: number; status?: WorkflowExecutionStatus[] },
  ): Promise<WorkflowExecution[]> {
    const executions = Array.from(this.executions.values()).filter(
      (e: any) => e.workflowId === workflowId,
    );

    if (options?.status) {
      return executions.filter((e: any) => options.status?.includes(e.status));
    }

    return executions.slice(0, options?.limit || 100);
  }

  async listWorkflows(filter?: {
    status?: string;
    tags?: string[];
  }): Promise<WorkflowDefinition[]> {
    const workflows = Array.from(this.workflows.values());

    if (!filter) {
      return workflows;
    }

    return workflows.filter((workflow: any) => {
      if (filter.tags && !filter.tags.every((tag: any) => workflow.tags?.includes(tag))) {
        return false;
      }

      if (filter.status && workflow.metadata?.status !== filter.status) {
        return false;
      }

      return true;
    });
  }

  /**
   * Register a workflow for testing
   */
  registerWorkflow(workflow: WorkflowDefinition): void {
    this.workflows.set(workflow.id, workflow);
  }

  async scheduleWorkflow(definition: WorkflowDefinition): Promise<string> {
    // Mock schedule - just return a schedule ID
    return `schedule_${definition.id}_${Date.now()}`;
  }

  async unscheduleWorkflow(_workflowId: string): Promise<boolean> {
    // Mock unschedule - always successful
    return true;
  }

  // Mock execution simulation

  private generateExecutionId(): string {
    return `test_exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getWorkflowDefinition(
    provider: WorkflowProvider,
    workflowId: string,
  ): Promise<WorkflowDefinition> {
    if (provider.getWorkflow) {
      const definition = await provider.getWorkflow(workflowId);
      if (!definition) {
        throw new Error(`Workflow ${workflowId} not found`);
      }
      return definition;
    }
    throw new Error('Provider does not support getWorkflow method');
  }

  private recordExecutionHistory(execution: WorkflowExecution): void {
    // Map WorkflowExecutionStatus to ExecutionHistory status
    const mappedStatus = ['paused', 'timeout'].includes(execution.status)
      ? ('failed' as const)
      : execution.status === 'skipped'
        ? ('cancelled' as const)
        : (execution.status as 'cancelled' | 'completed' | 'failed' | 'pending' | 'running');

    const history: ExecutionHistory = {
      completedAt: execution.completedAt,
      duration: execution.completedAt
        ? execution.completedAt.getTime() - execution.startedAt.getTime()
        : undefined,
      error: execution.error,
      executionId: execution.id,
      input: execution.input,
      metadata: {
        triggeredBy: 'api',
      },
      output: execution.output,
      startedAt: execution.startedAt,
      status: mappedStatus,
      steps: execution.steps.map((step: any) => {
        // Map step status to ExecutionHistory step status
        const mappedStepStatus = ['cancelled', 'paused', 'timeout'].includes(step.status)
          ? ('failed' as const)
          : (step.status as 'completed' | 'failed' | 'pending' | 'running' | 'skipped');

        return {
          completedAt: step.completedAt,
          duration:
            step.completedAt && step.startedAt
              ? step.completedAt.getTime() - step.startedAt.getTime()
              : undefined,
          error: step.error?.message,
          input: step.input,
          output: step.output,
          startedAt: step.startedAt,
          status: mappedStepStatus,
          stepId: step.stepId,
          stepName: step.name || step.stepName || '',
        };
      }),
      workflowId: execution.workflowId,
    };

    this.executionHistory.push(history);
  }

  private async simulateBasicExecution(
    execution: WorkflowExecution,
    config?: MockWorkflowConfig,
  ): Promise<void> {
    switch (config?.behavior) {
      case 'custom':
        execution.status = 'completed';
        execution.output = config.result as Record<string, any>;
        break;
      case 'failure':
        execution.status = 'failed';
        execution.error = config.error || {
          code: 'MOCK_FAILURE',
          message: 'Mock execution failed',
          retryable: false,
        };
        break;
      case 'timeout':
        // Simulate timeout by not completing
        return;
      case 'success':
      default:
        execution.status = 'completed';
        execution.output = (config?.result as Record<string, any>) || { success: true };
        break;
    }

    execution.completedAt = new Date();
  }

  private async simulateExecution(
    execution: WorkflowExecution,
    config?: MockWorkflowConfig,
  ): Promise<void> {
    const delay = config?.delay || 100;

    // Wait for configured delay
    await new Promise((resolve: any) => setTimeout(resolve, delay));

    // Check if execution was cancelled
    if (execution.status === 'cancelled') {
      return;
    }

    const workflow = this.workflows.get(execution.workflowId);
    if (!workflow) {
      execution.status = 'failed';
      execution.error = { message: 'Workflow not found' };
      execution.completedAt = new Date();
      return;
    }

    // Simulate step execution
    if (config?.stepResults) {
      await this.simulateStepExecution(execution, config.stepResults);
    } else {
      await this.simulateBasicExecution(execution, config);
    }

    // Record execution history
    this.recordExecutionHistory(execution);
  }

  private async simulateStepExecution(
    execution: WorkflowExecution,
    stepResults: MockWorkflowConfig['stepResults'],
  ): Promise<void> {
    const workflow = this.workflows.get(execution.workflowId);
    if (!workflow) return;

    for (let i = 0; i < workflow.steps.length; i++) {
      if (execution.status === 'cancelled') break;
      const step = workflow.steps[i];
      const stepConfig = stepResults?.find((s: any) => s.stepId === step.id);
      const stepExecution: Partial<WorkflowStepExecution> & {
        status: WorkflowExecutionStatus;
        stepId: string;
      } = {
        input: execution.input,
        name: step.name,
        startedAt: new Date(),
        status: 'running',
        stepId: step.id,
      };

      execution.steps.push(stepExecution);

      // Simulate step delay
      if (stepConfig?.delay) {
        await new Promise((resolve: any) => setTimeout(resolve, stepConfig.delay));
      }

      // Check for cancellation
      if ((execution.status as string) === 'cancelled') {
        stepExecution.status = 'failed';
        stepExecution.completedAt = new Date();
        break;
      }

      // Simulate step result
      if (stepConfig?.error) {
        stepExecution.status = 'failed';
        stepExecution.error = {
          code: 'SIMULATION_ERROR',
          message: (stepConfig.error as Error)?.message || 'Unknown error',
          retryable: false,
        };
        stepExecution.completedAt = new Date();

        execution.status = 'failed';
        execution.error = {
          code: 'SIMULATION_ERROR',
          message: (stepConfig.error as Error)?.message || 'Unknown error',
          retryable: false,
        };
        execution.completedAt = new Date();
        return;
      } else {
        stepExecution.status = 'completed';
        stepExecution.output = stepConfig?.result || { stepId: step.id, success: true };
        stepExecution.completedAt = new Date();
      }
    }

    if (execution.status === 'running') {
      execution.status = 'completed';
      execution.output = { steps: execution.steps.length, success: true };
      execution.completedAt = new Date();
    }
  }
}

/**
 * Development server for workflow testing
 */
export class WorkflowDevServer {
  private isRunning = false;
  private provider: WorkflowProvider;
  private testRunner: WorkflowTestRunner;

  constructor(provider: WorkflowProvider) {
    this.provider = provider;
    this.testRunner = new WorkflowTestRunner(provider, true);
  }

  /**
   * Hot reload workflow
   */
  async reloadWorkflow(workflowId: string): Promise<void> {
    // Implementation would reload workflow definition
    const logger = await createServerObservability();
    await logger.log('info', `Reloading workflow ${workflowId}`);
  }

  /**
   * Start development server
   */
  async start(port = 3000): Promise<void> {
    if (this.isRunning) {
      throw new Error('Development server is already running');
    }

    this.isRunning = true;
    const logger = await createServerObservability();
    await logger.log('info', `Workflow development server started on port ${port}`);

    // Development server implementation would go here
    // This could include:
    // - HTTP server for workflow management
    // - WebSocket for real-time updates
    // - File watcher for hot reloading
    // - Test runner integration
  }

  /**
   * Stop development server
   */
  async stop(): Promise<void> {
    this.isRunning = false;
    const logger = await createServerObservability();
    await logger.log('info', 'Workflow development server stopped');
  }

  /**
   * Run tests in watch mode
   */
  async watchTests(testSuites: WorkflowTestSuite[]): Promise<void> {
    const logger = await createServerObservability();
    await logger.log('info', 'Starting test watcher...');

    // Implementation would watch for changes and re-run tests
    for (const suite of testSuites) {
      const result = await this.testRunner.runTestSuite(suite);
      await logger.log('info', `Test suite ${suite.name}: ${result.status}`);
    }
  }
}

export class WorkflowTestRunner {
  private mockProvider?: MockWorkflowProvider;
  private provider: WorkflowProvider;

  constructor(provider: WorkflowProvider, useMockProvider = false) {
    this.provider = provider;

    if (useMockProvider) {
      this.mockProvider = new MockWorkflowProvider();
    }
  }

  /**
   * Run a single test scenario
   */
  async runScenario(workflowId: string, scenario: TestScenario): Promise<TestExecutionResult> {
    const startTime = Date.now();

    try {
      // Configure mocks if using mock provider
      if (this.mockProvider && scenario.mocks) {
        for (const [mockWorkflowId, config] of Object.entries(scenario.mocks)) {
          this.mockProvider.configureMock(mockWorkflowId, config);
        }
      }

      // Execute workflow
      const provider = this.mockProvider || this.provider;
      const executionId = await (provider.executeWorkflow
        ? provider.executeWorkflow(workflowId, scenario.input)
        : provider.execute(
            await this.getWorkflowDefinition(provider, workflowId),
            scenario.input as Record<string, any>,
          ));

      // Wait for completion
      const finalExecutionId = typeof executionId === 'string' ? executionId : executionId.id;
      const execution = await this.waitForCompletion(provider, finalExecutionId, scenario.timeout);

      // Run assertions
      const assertions = await this.runAssertions(scenario, execution);

      const duration = Date.now() - startTime;
      const allPassed = assertions.every((a: any) => a.passed);

      return {
        actualOutput: execution.output,
        assertions,
        duration,
        execution,
        scenarioName: scenario.name,
        status: allPassed ? 'passed' : 'failed',
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const isTimeout =
        (error instanceof Error && (error as Error)?.message) ||
        'Unknown error'.includes('timeout');

      return {
        duration,
        error: {
          message:
            error instanceof Error ? (error as Error)?.message || 'Unknown error' : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          type: isTimeout ? 'timeout' : 'execution',
        },
        scenarioName: scenario.name,
        status: isTimeout ? 'timeout' : 'failed',
      };
    }
  }

  /**
   * Run a test suite
   */
  async runTestSuite(testSuite: WorkflowTestSuite): Promise<TestSuiteResult> {
    const startTime = Date.now();
    const results: TestExecutionResult[] = [];

    try {
      // Setup
      if (testSuite.setup) {
        await testSuite.setup();
      }

      // Run scenarios
      if (testSuite.config?.parallel) {
        const scenarioPromises = testSuite.scenarios.map((scenario: any) =>
          this.runScenario(testSuite.workflowId, scenario),
        );
        const scenarioResults = await Promise.all(scenarioPromises);
        results.push(...scenarioResults);
      } else {
        for (const scenario of testSuite.scenarios) {
          const result = await this.runScenario(testSuite.workflowId, scenario);
          results.push(result);
        }
      }

      // Teardown
      if (testSuite.teardown) {
        await testSuite.teardown();
      }
    } catch (error: any) {
      return {
        duration: Date.now() - startTime,
        error:
          error instanceof Error ? (error as Error)?.message || 'Unknown error' : String(error),
        results: [],
        stats: { failed: 0, passed: 0, skipped: 0, timeout: 0, total: 0 },
        status: 'failed',
        suiteName: testSuite.name,
      };
    }

    const stats = {
      failed: results.filter((r: any) => r.status === 'failed').length,
      passed: results.filter((r: any) => r.status === 'passed').length,
      skipped: results.filter((r: any) => r.status === 'skipped').length,
      timeout: results.filter((r: any) => r.status === 'timeout').length,
      total: results.length,
    };

    const status =
      stats.failed > 0 ? 'failed' : stats.passed === stats.total ? 'passed' : 'partial';

    return {
      duration: Date.now() - startTime,
      results,
      stats,
      status,
      suiteName: testSuite.name,
    };
  }

  // Private methods

  private async evaluateAssertion(
    assertion: NonNullable<TestScenario['assertions']>[0],
    execution: WorkflowExecution,
  ): Promise<boolean> {
    switch (assertion.type) {
      case 'custom':
        if (typeof assertion.condition === 'function') {
          return assertion.condition(execution);
        }
        return Boolean(assertion.condition);

      case 'duration':
        const duration =
          execution.completedAt && execution.startedAt
            ? execution.completedAt.getTime() - execution.startedAt.getTime()
            : 0;
        return duration <= (assertion.condition as number);

      case 'steps':
        return execution.steps.length === (assertion.condition as number);

      default:
        return true;
    }
  }

  private async getWorkflowDefinition(
    provider: WorkflowProvider,
    workflowId: string,
  ): Promise<WorkflowDefinition> {
    if (provider.getWorkflow) {
      const definition = await provider.getWorkflow(workflowId);
      if (!definition) {
        throw new Error(`Workflow ${workflowId} not found`);
      }
      return definition;
    }
    throw new Error('Provider does not support getWorkflow method');
  }

  private async runAssertions(
    scenario: TestScenario,
    execution: WorkflowExecution,
  ): Promise<
    {
      message?: string;
      passed: boolean;
      type: string;
    }[]
  > {
    const results: any[] = [];

    // Default output assertion
    if (scenario.expectedOutput !== undefined) {
      const passed = JSON.stringify(execution.output) === JSON.stringify(scenario.expectedOutput);
      results.push({
        message: passed
          ? undefined
          : `Expected ${JSON.stringify(scenario.expectedOutput)}, got ${JSON.stringify(execution.output)}`,
        passed,
        type: 'output',
      });
    }

    // Default error assertion
    if (scenario.expectedError !== undefined) {
      const hasExpectedError = execution.error?.message === scenario.expectedError;
      results.push({
        message: hasExpectedError
          ? undefined
          : `Expected error "${scenario.expectedError}", got "${execution.error?.message || 'no error'}"`,
        passed: hasExpectedError,
        type: 'error',
      });
    }

    // Custom assertions
    if (scenario.assertions) {
      for (const assertion of scenario.assertions) {
        try {
          const passed = await this.evaluateAssertion(assertion, execution);
          results.push({
            message: passed ? undefined : assertion.message,
            passed,
            type: assertion.type,
          });
        } catch (error: any) {
          results.push({
            message:
              error instanceof Error ? (error as Error)?.message || 'Unknown error' : String(error),
            passed: false,
            type: assertion.type,
          });
        }
      }
    }

    return results;
  }

  private async waitForCompletion(
    provider: WorkflowProvider,
    executionId: string,
    timeout = 30000,
  ): Promise<WorkflowExecution> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const execution = await (provider.getExecutionStatus
        ? provider.getExecutionStatus(executionId)
        : provider.getExecution(executionId));

      if (!execution) {
        throw new Error('Execution not found');
      }

      if (
        execution.status === 'completed' ||
        execution.status === 'failed' ||
        execution.status === 'cancelled'
      ) {
        return execution;
      }

      await new Promise((resolve: any) => setTimeout(resolve, 100));
    }

    throw new Error('Execution timeout');
  }
}

/**
 * Workflow debugging utilities
 */
export const WorkflowDebugUtils = {
  /**
   * Create execution trace for debugging
   */
  createExecutionTrace(execution: WorkflowExecution): string {
    const trace: any[] = [];
    trace.push(`Execution ${execution.id} (${execution.status})`);
    trace.push(`Started: ${execution.startedAt.toISOString()}`);

    if (execution.completedAt) {
      trace.push(`Completed: ${execution.completedAt.toISOString()}`);
      trace.push(`Duration: ${execution.completedAt.getTime() - execution.startedAt.getTime()}ms`);
    }

    trace.push(`Input: ${JSON.stringify(execution.input, null, 2)}`);

    if (execution.steps.length > 0) {
      trace.push('Steps:');
      for (const step of execution.steps) {
        trace.push(`  ${step.stepId}: ${step.status}`);
        if (step.error) {
          trace.push(`    Error: ${step.error}`);
        }
      }
    }

    if (execution.output) {
      trace.push(`Output: ${JSON.stringify(execution.output, null, 2)}`);
    }

    if (execution.error) {
      trace.push(`Error: ${(execution.error as Error)?.message || 'Unknown error'}`);
    }

    return trace.join('\n');
  },

  /**
   * Generate test scenarios from workflow definition
   */
  generateTestScenarios(workflow: WorkflowDefinition): TestScenario[] {
    const scenarios: TestScenario[] = [];

    // Happy path scenario
    scenarios.push({
      description: 'Test successful execution with valid input',
      expectedOutput: { success: true },
      input: { test: true },
      name: 'Happy Path',
    });

    // Error scenarios
    scenarios.push({
      description: 'Test execution with invalid input',
      expectedError: 'Invalid input',
      input: null,
      name: 'Invalid Input',
    });

    // Timeout scenario
    scenarios.push({
      description: 'Test execution timeout',
      input: { test: true },
      mocks: {
        [workflow.id]: {
          behavior: 'timeout',
          delay: 2000,
        },
      },
      name: 'Timeout',
      timeout: 1000,
    });

    return scenarios;
  },

  /**
   * Validate workflow definition
   */
  validateWorkflowDefinition(workflow: WorkflowDefinition): string[] {
    const errors: any[] = [];

    if (!workflow.id) {
      errors.push('Workflow must have an id');
    }

    if (!workflow.name) {
      errors.push('Workflow must have a name');
    }

    if (!workflow.steps || workflow.steps.length === 0) {
      errors.push('Workflow must have at least one step');
    }

    if (workflow.steps) {
      const stepIds = new Set();
      for (const step of workflow.steps) {
        if (!step.id) {
          errors.push('All steps must have an id');
        } else if (stepIds.has(step.id)) {
          errors.push(`Duplicate step id: ${step.id}`);
        } else {
          stepIds.add(step.id);
        }

        if (!step.name) {
          errors.push(`Step ${step.id} must have a name`);
        }
      }
    }

    return errors;
  },
};

/**
 * Create mock workflow provider
 */
export function createMockWorkflowProvider(): MockWorkflowProvider {
  return new MockWorkflowProvider();
}

/**
 * Create workflow development server
 */
export function createWorkflowDevServer(provider: WorkflowProvider): WorkflowDevServer {
  return new WorkflowDevServer(provider);
}

/**
 * Create workflow test runner
 */
export function createWorkflowTestRunner(
  provider: WorkflowProvider,
  useMockProvider = false,
): WorkflowTestRunner {
  return new WorkflowTestRunner(provider, useMockProvider);
}
