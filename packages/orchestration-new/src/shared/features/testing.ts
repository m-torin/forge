/**
 * Testing & Development Utilities
 * Workflow mocking, testing utilities, and development server capabilities
 */

import type {
  WorkflowDefinition,
  WorkflowProvider,
  WorkflowExecution,
  WorkflowStep,
  WorkflowStepExecution,
  WorkflowExecutionStatus,
  WorkflowExecutionMetadata,
} from '../types/index';
import type { ExecutionHistory } from './monitoring';
import type { SagaDefinition, SagaExecution } from './saga';

export interface MockWorkflowConfig {
  /** Mock execution behavior */
  behavior: 'success' | 'failure' | 'timeout' | 'custom';
  /** Execution delay in milliseconds */
  delay?: number;
  /** Custom execution result */
  result?: unknown;
  /** Custom error for failure behavior */
  error?: Error;
  /** Step-by-step execution simulation */
  stepResults?: Array<{
    stepId: string;
    result?: unknown;
    error?: Error;
    delay?: number;
  }>;
  /** Execution metadata */
  metadata?: Record<string, unknown>;
}

export interface TestScenario {
  /** Scenario name */
  name: string;
  /** Scenario description */
  description?: string;
  /** Input data for the workflow */
  input: unknown;
  /** Expected output */
  expectedOutput?: unknown;
  /** Expected error */
  expectedError?: string;
  /** Mock configuration for dependencies */
  mocks?: Record<string, MockWorkflowConfig>;
  /** Test assertions */
  assertions?: Array<{
    type: 'output' | 'error' | 'duration' | 'steps' | 'custom';
    condition: unknown;
    message?: string;
  }>;
  /** Timeout for scenario execution */
  timeout?: number;
}

export interface WorkflowTestSuite {
  /** Test suite name */
  name: string;
  /** Test suite description */
  description?: string;
  /** Workflow to test */
  workflowId: string;
  /** Setup function */
  setup?: () => Promise<void>;
  /** Cleanup function */
  teardown?: () => Promise<void>;
  /** Test scenarios */
  scenarios: TestScenario[];
  /** Test configuration */
  config?: {
    /** Parallel execution */
    parallel?: boolean;
    /** Retry failed tests */
    retry?: boolean;
    /** Test timeout */
    timeout?: number;
  };
}

export interface TestExecutionResult {
  /** Scenario name */
  scenarioName: string;
  /** Test status */
  status: 'passed' | 'failed' | 'skipped' | 'timeout';
  /** Execution duration */
  duration: number;
  /** Actual output */
  actualOutput?: unknown;
  /** Error information */
  error?: {
    message: string;
    stack?: string;
    type: 'assertion' | 'execution' | 'timeout';
  };
  /** Assertion results */
  assertions?: Array<{
    type: string;
    passed: boolean;
    message?: string;
  }>;
  /** Execution details */
  execution?: WorkflowExecution;
}

export interface TestSuiteResult {
  /** Test suite name */
  suiteName: string;
  /** Overall status */
  status: 'passed' | 'failed' | 'partial';
  /** Total duration */
  duration: number;
  /** Statistics */
  stats: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    timeout: number;
  };
  /** Individual test results */
  results: TestExecutionResult[];
  /** Suite-level error */
  error?: string;
}

export class MockWorkflowProvider implements WorkflowProvider {
  private workflows = new Map<string, WorkflowDefinition>();
  private executions = new Map<string, WorkflowExecution>();
  private mocks = new Map<string, MockWorkflowConfig>();
  private executionHistory: ExecutionHistory[] = [];

  name = 'MockWorkflowProvider';
  version = '1.0.0';

  /**
   * Register a workflow for testing
   */
  registerWorkflow(workflow: WorkflowDefinition): void {
    this.workflows.set(workflow.id, workflow);
  }

  /**
   * Configure mock behavior for a workflow
   */
  configureMock(workflowId: string, config: MockWorkflowConfig): void {
    this.mocks.set(workflowId, config);
  }

  /**
   * Clear all mocks
   */
  clearMocks(): void {
    this.mocks.clear();
    this.executions.clear();
    this.executionHistory = [];
  }

  // WorkflowProvider implementation

  async createWorkflow(definition: WorkflowDefinition): Promise<string> {
    this.workflows.set(definition.id, definition);
    return definition.id;
  }

  async getWorkflow(workflowId: string): Promise<WorkflowDefinition | null> {
    return this.workflows.get(workflowId) || null;
  }

  async listWorkflows(filter?: {
    tags?: string[];
    status?: string;
  }): Promise<WorkflowDefinition[]> {
    const workflows = Array.from(this.workflows.values());

    if (!filter) {
      return workflows;
    }

    return workflows.filter((workflow) => {
      if (filter.tags && !filter.tags.every((tag) => workflow.tags?.includes(tag))) {
        return false;
      }

      if (filter.status && workflow.metadata?.status !== filter.status) {
        return false;
      }

      return true;
    });
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

    const execution: WorkflowExecution = {
      id: executionId,
      workflowId,
      status: 'running',
      startedAt: new Date(),
      input: input as Record<string, any>,
      steps: [],
      metadata: (options as WorkflowExecutionMetadata) || {},
    };

    this.executions.set(executionId, execution);

    // Simulate execution based on mock configuration
    this.simulateExecution(execution, mockConfig);

    return executionId;
  }

  async getExecutionStatus(executionId: string): Promise<WorkflowExecution | null> {
    return this.executions.get(executionId) || null;
  }

  async cancelExecution(executionId: string): Promise<boolean> {
    const execution = this.executions.get(executionId);
    if (execution && execution.status === 'running') {
      execution.status = 'cancelled';
      execution.completedAt = new Date();
      return true;
    }
    return false;
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

  async getExecution(executionId: string): Promise<WorkflowExecution | null> {
    return this.executions.get(executionId) || null;
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    timestamp: Date;
  }> {
    return {
      status: 'healthy',
      responseTime: 1,
      timestamp: new Date(),
    };
  }

  async listExecutions(
    workflowId: string,
    options?: { cursor?: string; limit?: number; status?: WorkflowExecutionStatus[] },
  ): Promise<WorkflowExecution[]> {
    const executions = Array.from(this.executions.values()).filter(
      (e) => e.workflowId === workflowId,
    );

    if (options?.status) {
      return executions.filter((e) => options.status!.includes(e.status));
    }

    return executions.slice(0, options?.limit || 100);
  }

  async scheduleWorkflow(definition: WorkflowDefinition): Promise<string> {
    // Mock schedule - just return a schedule ID
    return `schedule_${definition.id}_${Date.now()}`;
  }

  async unscheduleWorkflow(workflowId: string): Promise<boolean> {
    // Mock unschedule - always successful
    return true;
  }

  // Mock execution simulation

  private async simulateExecution(
    execution: WorkflowExecution,
    config?: MockWorkflowConfig,
  ): Promise<void> {
    const delay = config?.delay || 100;

    // Wait for configured delay
    await new Promise((resolve) => setTimeout(resolve, delay));

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
      const stepConfig = stepResults?.find((s) => s.stepId === step.id);

      const stepExecution: Partial<WorkflowStepExecution> & {
        stepId: string;
        status: WorkflowExecutionStatus;
      } = {
        stepId: step.id,
        name: step.name,
        status: 'running',
        startedAt: new Date(),
        input: execution.input,
      };

      execution.steps.push(stepExecution);

      // Simulate step delay
      if (stepConfig?.delay) {
        await new Promise((resolve) => setTimeout(resolve, stepConfig.delay));
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
          message: stepConfig.error.message,
          code: 'SIMULATION_ERROR',
          retryable: false,
        };
        stepExecution.completedAt = new Date();

        execution.status = 'failed';
        execution.error = {
          message: stepConfig.error.message,
          code: 'SIMULATION_ERROR',
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
      execution.output = { success: true, steps: execution.steps.length };
      execution.completedAt = new Date();
    }
  }

  private async simulateBasicExecution(
    execution: WorkflowExecution,
    config?: MockWorkflowConfig,
  ): Promise<void> {
    switch (config?.behavior) {
      case 'failure':
        execution.status = 'failed';
        execution.error = config.error || {
          message: 'Mock execution failed',
          code: 'MOCK_FAILURE',
          retryable: false,
        };
        break;
      case 'timeout':
        // Simulate timeout by not completing
        return;
      case 'custom':
        execution.status = 'completed';
        execution.output = config.result as Record<string, any>;
        break;
      case 'success':
      default:
        execution.status = 'completed';
        execution.output = (config?.result as Record<string, any>) || { success: true };
        break;
    }

    execution.completedAt = new Date();
  }

  private recordExecutionHistory(execution: WorkflowExecution): void {
    // Map WorkflowExecutionStatus to ExecutionHistory status
    const mappedStatus = ['timeout', 'paused'].includes(execution.status)
      ? ('failed' as const)
      : execution.status === 'skipped'
        ? ('cancelled' as const)
        : (execution.status as 'pending' | 'running' | 'completed' | 'failed' | 'cancelled');

    const history: ExecutionHistory = {
      executionId: execution.id,
      workflowId: execution.workflowId,
      status: mappedStatus,
      startedAt: execution.startedAt,
      completedAt: execution.completedAt,
      duration: execution.completedAt
        ? execution.completedAt.getTime() - execution.startedAt.getTime()
        : undefined,
      input: execution.input,
      output: execution.output,
      error: execution.error,
      steps: execution.steps.map((step) => {
        // Map step status to ExecutionHistory step status
        const mappedStepStatus = ['timeout', 'paused', 'cancelled'].includes(step.status)
          ? ('failed' as const)
          : (step.status as 'pending' | 'running' | 'completed' | 'failed' | 'skipped');

        return {
          stepId: step.stepId,
          stepName: step.name || step.stepName || '',
          status: mappedStepStatus,
          startedAt: step.startedAt,
          completedAt: step.completedAt,
          duration:
            step.completedAt && step.startedAt
              ? step.completedAt.getTime() - step.startedAt.getTime()
              : undefined,
          input: step.input,
          output: step.output,
          error: step.error?.message,
        };
      }),
      metadata: {
        triggeredBy: 'api',
      },
    };

    this.executionHistory.push(history);
  }

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
}

export class WorkflowTestRunner {
  private provider: WorkflowProvider;
  private mockProvider?: MockWorkflowProvider;

  constructor(provider: WorkflowProvider, useMockProvider = false) {
    this.provider = provider;

    if (useMockProvider) {
      this.mockProvider = new MockWorkflowProvider();
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
        const scenarioPromises = testSuite.scenarios.map((scenario) =>
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
    } catch (error) {
      return {
        suiteName: testSuite.name,
        status: 'failed',
        duration: Date.now() - startTime,
        stats: { total: 0, passed: 0, failed: 0, skipped: 0, timeout: 0 },
        results: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }

    const stats = {
      total: results.length,
      passed: results.filter((r) => r.status === 'passed').length,
      failed: results.filter((r) => r.status === 'failed').length,
      skipped: results.filter((r) => r.status === 'skipped').length,
      timeout: results.filter((r) => r.status === 'timeout').length,
    };

    const status =
      stats.failed > 0 ? 'failed' : stats.passed === stats.total ? 'passed' : 'partial';

    return {
      suiteName: testSuite.name,
      status,
      duration: Date.now() - startTime,
      stats,
      results,
    };
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
      const allPassed = assertions.every((a) => a.passed);

      return {
        scenarioName: scenario.name,
        status: allPassed ? 'passed' : 'failed',
        duration,
        actualOutput: execution.output,
        assertions,
        execution,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const isTimeout = error instanceof Error && error.message.includes('timeout');

      return {
        scenarioName: scenario.name,
        status: isTimeout ? 'timeout' : 'failed',
        duration,
        error: {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          type: isTimeout ? 'timeout' : 'execution',
        },
      };
    }
  }

  // Private methods

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

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    throw new Error('Execution timeout');
  }

  private async runAssertions(
    scenario: TestScenario,
    execution: WorkflowExecution,
  ): Promise<
    Array<{
      type: string;
      passed: boolean;
      message?: string;
    }>
  > {
    const results = [];

    // Default output assertion
    if (scenario.expectedOutput !== undefined) {
      const passed = JSON.stringify(execution.output) === JSON.stringify(scenario.expectedOutput);
      results.push({
        type: 'output',
        passed,
        message: passed
          ? undefined
          : `Expected ${JSON.stringify(scenario.expectedOutput)}, got ${JSON.stringify(execution.output)}`,
      });
    }

    // Default error assertion
    if (scenario.expectedError !== undefined) {
      const hasExpectedError = execution.error?.message === scenario.expectedError;
      results.push({
        type: 'error',
        passed: hasExpectedError,
        message: hasExpectedError
          ? undefined
          : `Expected error "${scenario.expectedError}", got "${execution.error?.message || 'no error'}"`,
      });
    }

    // Custom assertions
    if (scenario.assertions) {
      for (const assertion of scenario.assertions) {
        try {
          const passed = await this.evaluateAssertion(assertion, execution);
          results.push({
            type: assertion.type,
            passed,
            message: passed ? undefined : assertion.message,
          });
        } catch (error) {
          results.push({
            type: assertion.type,
            passed: false,
            message: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }

    return results;
  }

  private async evaluateAssertion(
    assertion: NonNullable<TestScenario['assertions']>[0],
    execution: WorkflowExecution,
  ): Promise<boolean> {
    switch (assertion.type) {
      case 'duration':
        const duration =
          execution.completedAt && execution.startedAt
            ? execution.completedAt.getTime() - execution.startedAt.getTime()
            : 0;
        return duration <= (assertion.condition as number);

      case 'steps':
        return execution.steps.length === (assertion.condition as number);

      case 'custom':
        if (typeof assertion.condition === 'function') {
          return assertion.condition(execution);
        }
        return Boolean(assertion.condition);

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
}

/**
 * Development server for workflow testing
 */
export class WorkflowDevServer {
  private provider: WorkflowProvider;
  private testRunner: WorkflowTestRunner;
  private isRunning = false;

  constructor(provider: WorkflowProvider) {
    this.provider = provider;
    this.testRunner = new WorkflowTestRunner(provider, true);
  }

  /**
   * Start development server
   */
  async start(port = 3000): Promise<void> {
    if (this.isRunning) {
      throw new Error('Development server is already running');
    }

    this.isRunning = true;
    console.log(`Workflow development server started on port ${port}`);

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
    console.log('Workflow development server stopped');
  }

  /**
   * Hot reload workflow
   */
  async reloadWorkflow(workflowId: string): Promise<void> {
    // Implementation would reload workflow definition
    console.log(`Reloading workflow ${workflowId}`);
  }

  /**
   * Run tests in watch mode
   */
  async watchTests(testSuites: WorkflowTestSuite[]): Promise<void> {
    console.log('Starting test watcher...');

    // Implementation would watch for changes and re-run tests
    for (const suite of testSuites) {
      const result = await this.testRunner.runTestSuite(suite);
      console.log(`Test suite ${suite.name}: ${result.status}`);
    }
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
    const trace = [];
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
      trace.push(`Error: ${execution.error.message}`);
    }

    return trace.join('\n');
  },

  /**
   * Validate workflow definition
   */
  validateWorkflowDefinition(workflow: WorkflowDefinition): string[] {
    const errors = [];

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

  /**
   * Generate test scenarios from workflow definition
   */
  generateTestScenarios(workflow: WorkflowDefinition): TestScenario[] {
    const scenarios: TestScenario[] = [];

    // Happy path scenario
    scenarios.push({
      name: 'Happy Path',
      description: 'Test successful execution with valid input',
      input: { test: true },
      expectedOutput: { success: true },
    });

    // Error scenarios
    scenarios.push({
      name: 'Invalid Input',
      description: 'Test execution with invalid input',
      input: null,
      expectedError: 'Invalid input',
    });

    // Timeout scenario
    scenarios.push({
      name: 'Timeout',
      description: 'Test execution timeout',
      input: { test: true },
      timeout: 1000,
      mocks: {
        [workflow.id]: {
          behavior: 'timeout',
          delay: 2000,
        },
      },
    });

    return scenarios;
  },
};

/**
 * Create mock workflow provider
 */
export function createMockWorkflowProvider(): MockWorkflowProvider {
  return new MockWorkflowProvider();
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

/**
 * Create workflow development server
 */
export function createWorkflowDevServer(provider: WorkflowProvider): WorkflowDevServer {
  return new WorkflowDevServer(provider);
}
