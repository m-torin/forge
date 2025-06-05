/**
 * Saga Pattern Implementation
 * Distributed transaction management for complex workflows
 */

import type { WorkflowProvider } from '../types/index';

export interface SagaStep {
  /** Unique step identifier */
  id: string;
  /** Step name for display */
  name: string;
  /** The action to execute */
  action: (context: SagaContext) => Promise<unknown>;
  /** The compensation action to execute if saga fails */
  compensation?: (context: SagaContext) => Promise<unknown>;
  /** Step timeout in milliseconds */
  timeout?: number;
  /** Retry configuration */
  retry?: {
    maxAttempts: number;
    delay: number;
    backoff?: 'linear' | 'exponential';
  };
  /** Condition to determine if step should execute */
  condition?: (context: SagaContext) => boolean;
  /** Step metadata */
  metadata?: Record<string, unknown>;
}

export interface SagaDefinition {
  /** Unique saga identifier */
  id: string;
  /** Saga name */
  name: string;
  /** Saga description */
  description?: string;
  /** Ordered list of saga steps */
  steps: SagaStep[];
  /** Global saga timeout */
  timeout?: number;
  /** Saga configuration */
  config?: {
    /** Whether to run compensation in reverse order */
    reverseCompensation?: boolean;
    /** Whether to continue on compensation failure */
    continueOnCompensationFailure?: boolean;
    /** Global retry policy */
    globalRetry?: {
      maxAttempts: number;
      delay: number;
    };
  };
  /** Saga metadata */
  metadata?: Record<string, unknown>;
}

export interface SagaContext {
  /** Saga execution ID */
  sagaId: string;
  /** Execution ID */
  executionId: string;
  /** Current step ID */
  currentStepId?: string;
  /** Saga input data */
  input: unknown;
  /** Accumulated results from previous steps */
  results: Record<string, unknown>;
  /** Saga execution state */
  state: SagaExecutionState;
  /** Execution metadata */
  metadata: Record<string, unknown>;
  /** Set result for current step */
  setResult: (key: string, value: unknown) => void;
  /** Get result from previous step */
  getResult: (key: string) => unknown;
  /** Log message */
  log: (level: 'info' | 'warn' | 'error', message: string, data?: unknown) => void;
  /** Event emitter for saga events */
  events?: {
    emit: (event: string, data?: unknown) => void;
    on: (event: string, listener: (data?: unknown) => void) => void;
    off: (event: string, listener: (data?: unknown) => void) => void;
  };
  /** Sleep function for delays */
  sleep?: (milliseconds: number) => Promise<void>;
  /** Data store for persistent state */
  store?: {
    get: (key: string) => unknown;
    set: (key: string, value: unknown) => void;
    delete: (key: string) => void;
    clear: () => void;
  };
}

export interface SagaExecutionState {
  /** Current saga status */
  status: 'pending' | 'running' | 'completed' | 'compensating' | 'compensated' | 'failed';
  /** Execution start time */
  startedAt: Date;
  /** Execution completion time */
  completedAt?: Date;
  /** Current step index */
  currentStepIndex: number;
  /** Completed steps */
  completedSteps: Array<{
    stepId: string;
    status: 'completed' | 'failed' | 'compensated';
    result?: unknown;
    error?: string;
    startedAt: Date;
    completedAt: Date;
    duration: number;
  }>;
  /** Steps that need compensation */
  compensationQueue: string[];
  /** Error information */
  error?: {
    stepId: string;
    message: string;
    stack?: string;
  };
  /** Execution logs */
  logs: Array<{
    timestamp: Date;
    level: 'info' | 'warn' | 'error';
    message: string;
    stepId?: string;
    data?: unknown;
  }>;
}

export interface SagaExecution {
  /** Saga execution ID */
  id: string;
  /** Saga definition ID */
  sagaId: string;
  /** Execution state */
  state: SagaExecutionState;
  /** Input data */
  input: unknown;
  /** Final result */
  result?: unknown;
  /** Execution context */
  context: SagaContext;
}

export class SagaOrchestrator {
  private provider: WorkflowProvider;
  private sagas = new Map<string, SagaDefinition>();
  private executions = new Map<string, SagaExecution>();

  constructor(provider: WorkflowProvider) {
    this.provider = provider;
  }

  /**
   * Register a saga definition
   */
  registerSaga(saga: SagaDefinition): void {
    this.sagas.set(saga.id, saga);
  }

  /**
   * Execute a saga
   */
  async executeSaga(
    sagaId: string,
    input: unknown,
    metadata?: Record<string, unknown>,
  ): Promise<string> {
    const saga = this.sagas.get(sagaId);
    if (!saga) {
      throw new Error(`Saga ${sagaId} not found`);
    }

    const executionId = this.generateExecutionId();

    const state: SagaExecutionState = {
      status: 'pending',
      startedAt: new Date(),
      currentStepIndex: 0,
      completedSteps: [],
      compensationQueue: [],
      logs: [],
    };

    const context: SagaContext = {
      sagaId,
      executionId,
      input,
      results: {},
      state,
      metadata: metadata || {},
      setResult: (key: string, value: unknown) => {
        context.results[key] = value;
      },
      getResult: (key: string) => {
        return context.results[key];
      },
      log: (level, message, data) => {
        state.logs.push({
          timestamp: new Date(),
          level,
          message,
          stepId: context.currentStepId,
          data,
        });
      },
    };

    const execution: SagaExecution = {
      id: executionId,
      sagaId,
      state,
      input,
      context,
    };

    this.executions.set(executionId, execution);

    // Start execution asynchronously
    this.runSaga(execution);

    return executionId;
  }

  /**
   * Get saga execution status
   */
  getSagaExecution(executionId: string): SagaExecution | undefined {
    return this.executions.get(executionId);
  }

  /**
   * Cancel saga execution
   */
  async cancelSaga(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Saga execution ${executionId} not found`);
    }

    if (execution.state.status === 'running') {
      execution.state.status = 'compensating';
      execution.context.log('info', 'Saga execution cancelled, starting compensation');
      await this.compensate(execution);
    }
  }

  /**
   * Retry failed saga step
   */
  async retrySaga(executionId: string, fromStepId?: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Saga execution ${executionId} not found`);
    }

    const saga = this.sagas.get(execution.sagaId);
    if (!saga) {
      throw new Error(`Saga ${execution.sagaId} not found`);
    }

    // Reset execution state
    if (fromStepId) {
      const stepIndex = saga.steps.findIndex((step) => step.id === fromStepId);
      if (stepIndex !== -1) {
        execution.state.currentStepIndex = stepIndex;
        execution.state.completedSteps = execution.state.completedSteps.slice(0, stepIndex);
      }
    }

    execution.state.status = 'running';
    execution.state.error = undefined;
    execution.context.log('info', `Retrying saga from step ${fromStepId || 'current'}`);

    await this.runSaga(execution);
  }

  // Private methods

  private async runSaga(execution: SagaExecution): Promise<void> {
    const saga = this.sagas.get(execution.sagaId);
    if (!saga) {
      throw new Error(`Saga ${execution.sagaId} not found`);
    }

    execution.state.status = 'running';
    execution.context.log('info', 'Starting saga execution');

    try {
      // Set global timeout if configured
      if (saga.timeout) {
        setTimeout(() => {
          if (execution.state.status === 'running') {
            execution.state.status = 'compensating';
            execution.state.error = {
              stepId: 'global',
              message: 'Saga execution timeout',
            };
            execution.context.log('error', 'Saga execution timeout');
            this.compensate(execution);
          }
        }, saga.timeout);
      }

      // Execute steps sequentially
      for (let i = execution.state.currentStepIndex; i < saga.steps.length; i++) {
        const step = saga.steps[i];
        execution.state.currentStepIndex = i;
        execution.context.currentStepId = step.id;

        // Check if step should execute
        if (step.condition && !step.condition(execution.context)) {
          execution.context.log('info', `Skipping step ${step.id} due to condition`);
          continue;
        }

        execution.context.log('info', `Executing step ${step.id}: ${step.name}`);

        const stepStartTime = new Date();

        try {
          // Execute step with timeout and retry
          const result = await this.executeStepWithRetry(step, execution.context);

          const stepCompletedTime = new Date();
          const duration = stepCompletedTime.getTime() - stepStartTime.getTime();

          // Record successful step
          execution.state.completedSteps.push({
            stepId: step.id,
            status: 'completed',
            result,
            startedAt: stepStartTime,
            completedAt: stepCompletedTime,
            duration,
          });

          // Add step to compensation queue if it has compensation
          if (step.compensation) {
            execution.state.compensationQueue.push(step.id);
          }

          execution.context.log('info', `Step ${step.id} completed successfully`);
        } catch (error) {
          const stepCompletedTime = new Date();
          const duration = stepCompletedTime.getTime() - stepStartTime.getTime();

          // Record failed step
          execution.state.completedSteps.push({
            stepId: step.id,
            status: 'failed',
            error: error instanceof Error ? error.message : String(error),
            startedAt: stepStartTime,
            completedAt: stepCompletedTime,
            duration,
          });

          execution.state.error = {
            stepId: step.id,
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          };

          execution.context.log('error', `Step ${step.id} failed`, {
            error: error instanceof Error ? error.message : String(error),
          });

          // Start compensation
          execution.state.status = 'compensating';
          await this.compensate(execution);
          return;
        }
      }

      // All steps completed successfully
      execution.state.status = 'completed';
      execution.state.completedAt = new Date();
      execution.result = execution.context.results;
      execution.context.log('info', 'Saga execution completed successfully');
    } catch (error) {
      execution.state.status = 'failed';
      execution.state.completedAt = new Date();
      execution.state.error = {
        stepId: 'global',
        message: error instanceof Error ? error.message : String(error),
      };
      execution.context.log('error', 'Saga execution failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private async executeStepWithRetry(step: SagaStep, context: SagaContext): Promise<unknown> {
    const maxAttempts = step.retry?.maxAttempts || 1;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Set step timeout if configured
        if (step.timeout) {
          return await Promise.race([
            step.action(context),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Step timeout')), step.timeout),
            ),
          ]);
        } else {
          return await step.action(context);
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < maxAttempts && step.retry) {
          const delay = this.calculateRetryDelay(step.retry, attempt);
          context.log(
            'warn',
            `Step ${step.id} failed (attempt ${attempt}/${maxAttempts}), retrying in ${delay}ms`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  private async compensate(execution: SagaExecution): Promise<void> {
    const saga = this.sagas.get(execution.sagaId);
    if (!saga) {
      throw new Error(`Saga ${execution.sagaId} not found`);
    }

    execution.context.log('info', 'Starting compensation');

    const compensationOrder =
      saga.config?.reverseCompensation !== false
        ? [...execution.state.compensationQueue].reverse()
        : execution.state.compensationQueue;

    for (const stepId of compensationOrder) {
      const step = saga.steps.find((s) => s.id === stepId);
      if (!step || !step.compensation) {
        continue;
      }

      execution.context.currentStepId = stepId;
      execution.context.log('info', `Compensating step ${stepId}`);

      try {
        await step.compensation(execution.context);

        // Update completed step status
        const completedStep = execution.state.completedSteps.find((s) => s.stepId === stepId);
        if (completedStep) {
          completedStep.status = 'compensated';
        }

        execution.context.log('info', `Step ${stepId} compensated successfully`);
      } catch (error) {
        execution.context.log('error', `Compensation failed for step ${stepId}`, {
          error: error instanceof Error ? error.message : String(error),
        });

        if (!saga.config?.continueOnCompensationFailure) {
          execution.state.status = 'failed';
          execution.state.completedAt = new Date();
          return;
        }
      }
    }

    execution.state.status = 'compensated';
    execution.state.completedAt = new Date();
    execution.context.log('info', 'Compensation completed');
  }

  private calculateRetryDelay(retry: NonNullable<SagaStep['retry']>, attempt: number): number {
    const baseDelay = retry.delay;

    switch (retry.backoff) {
      case 'exponential':
        return baseDelay * Math.pow(2, attempt - 1);
      case 'linear':
      default:
        return baseDelay * attempt;
    }
  }

  private generateExecutionId(): string {
    return `saga_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Saga builder utility for creating saga definitions
 */
export class SagaBuilder {
  private saga: Partial<SagaDefinition> = {
    steps: [],
  };

  constructor(id: string, name: string) {
    this.saga.id = id;
    this.saga.name = name;
  }

  /**
   * Set saga description
   */
  description(description: string): this {
    this.saga.description = description;
    return this;
  }

  /**
   * Set global timeout
   */
  timeout(milliseconds: number): this {
    this.saga.timeout = milliseconds;
    return this;
  }

  /**
   * Configure saga options
   */
  configure(config: SagaDefinition['config']): this {
    this.saga.config = config;
    return this;
  }

  /**
   * Add metadata
   */
  metadata(metadata: Record<string, unknown>): this {
    this.saga.metadata = metadata;
    return this;
  }

  /**
   * Add a step to the saga
   */
  step(
    id: string,
    name: string,
    action: SagaStep['action'],
    options?: {
      compensation?: SagaStep['compensation'];
      timeout?: number;
      retry?: SagaStep['retry'];
      condition?: SagaStep['condition'];
      metadata?: Record<string, unknown>;
    },
  ): this {
    const step: SagaStep = {
      id,
      name,
      action,
      ...options,
    };

    this.saga.steps!.push(step);
    return this;
  }

  /**
   * Build the saga definition
   */
  build(): SagaDefinition {
    if (!this.saga.id || !this.saga.name || !this.saga.steps?.length) {
      throw new Error('Saga must have id, name, and at least one step');
    }

    return this.saga as SagaDefinition;
  }

  /**
   * Execute the saga with a provider
   */
  async execute(
    provider: WorkflowProvider,
    input?: unknown,
    metadata?: Record<string, unknown>,
  ): Promise<string> {
    const definition = this.build();
    const orchestrator = new SagaOrchestrator(provider);
    orchestrator.registerSaga(definition);
    return orchestrator.executeSaga(definition.id, input, metadata);
  }
}

/**
 * Create a new saga builder
 */
export function createSaga(id: string, name: string): SagaBuilder {
  return new SagaBuilder(id, name);
}

/**
 * Create a saga orchestrator
 */
export function createSagaOrchestrator(provider: WorkflowProvider): SagaOrchestrator {
  return new SagaOrchestrator(provider);
}

/**
 * Utility functions for saga patterns
 */
export const SagaUtils = {
  /**
   * Create a conditional step
   */
  createConditionalStep(
    condition: (context: SagaContext) => boolean,
    trueStep: Omit<SagaStep, 'condition'>,
    falseStep?: Omit<SagaStep, 'condition'>,
  ): SagaStep[] {
    const steps: SagaStep[] = [{ ...trueStep, condition }];

    if (falseStep) {
      steps.push({
        ...falseStep,
        condition: (context) => !condition(context),
      });
    }

    return steps;
  },

  /**
   * Create a parallel step (executes multiple actions concurrently)
   */
  createParallelStep(
    id: string,
    name: string,
    actions: Array<{
      id: string;
      action: SagaStep['action'];
      compensation?: SagaStep['compensation'];
    }>,
  ): SagaStep {
    return {
      id,
      name,
      action: async (context) => {
        const results = await Promise.all(
          actions.map(async ({ id: actionId, action }) => ({
            id: actionId,
            result: await action(context),
          })),
        );

        // Store results with action IDs
        for (const { id: actionId, result } of results) {
          context.setResult(`${id}.${actionId}`, result);
        }

        return results;
      },
      compensation: actions.some((a) => a.compensation)
        ? async (context) => {
            // Compensate in reverse order
            for (const { id: actionId, compensation } of actions.reverse()) {
              if (compensation) {
                await compensation(context);
              }
            }
          }
        : undefined,
    };
  },

  /**
   * Create a retry wrapper for any step
   */
  createRetryWrapper(step: SagaStep, retryConfig: NonNullable<SagaStep['retry']>): SagaStep {
    return {
      ...step,
      retry: retryConfig,
    };
  },

  /**
   * Create a timeout wrapper for any step
   */
  createTimeoutWrapper(step: SagaStep, timeoutMs: number): SagaStep {
    return {
      ...step,
      timeout: timeoutMs,
    };
  },
};
