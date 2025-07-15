/**
 * Saga Pattern Implementation
 * Distributed transaction management for complex workflows
 */

import { WorkflowProvider } from '../types/workflow';

export interface SagaContext {
  /** Current step ID */
  currentStepId?: string;
  /** Event emitter for saga events */
  events?: {
    emit: (event: string, data?: unknown) => void;
    off: (event: string, listener: (data?: unknown) => void) => void;
    on: (event: string, listener: (data?: unknown) => void) => void;
  };
  /** Execution ID */
  executionId: string;
  /** Get result from previous step */
  getResult: (key: string) => unknown;
  /** Saga input data */
  input: unknown;
  /** Log message */
  log: (level: 'error' | 'info' | 'warn', message: string, data?: unknown) => void;
  /** Execution metadata */
  metadata: Record<string, unknown>;
  /** Accumulated results from previous steps */
  results: Record<string, unknown>;
  /** Saga execution ID */
  sagaId: string;
  /** Set result for current step */
  setResult: (key: string, value: unknown) => void;
  /** Sleep function for delays */
  sleep?: (milliseconds: number) => Promise<void>;
  /** Saga execution state */
  state: SagaExecutionState;
  /** Data store for persistent state */
  store?: {
    clear: () => void;
    delete: (key: string) => void;
    get: (key: string) => unknown;
    set: (key: string, value: unknown) => void;
  };
}

export interface SagaDefinition {
  /** Saga configuration */
  config?: {
    /** Whether to continue on compensation failure */
    continueOnCompensationFailure?: boolean;
    /** Global retry policy */
    globalRetry?: {
      delay: number;
      maxAttempts: number;
    };
    /** Failure callback */
    onFailure?: (context: SagaContext, error: Error) => Promise<void> | void;
    /** Success callback */
    onSuccess?: (context: SagaContext) => Promise<void> | void;
    /** Whether to run compensation in reverse order */
    reverseCompensation?: boolean;
  };
  /** Saga description */
  description?: string;
  /** Unique saga identifier */
  id: string;
  /** Saga metadata */
  metadata?: Record<string, unknown>;
  /** Saga name */
  name: string;
  /** Ordered list of saga steps */
  steps: SagaStep[];
  /** Global saga timeout */
  timeout?: number;
}

export interface SagaExecution {
  /** Execution context */
  context: SagaContext;
  /** Saga execution ID */
  id: string;
  /** Input data */
  input: unknown;
  /** Final result */
  result?: unknown;
  /** Saga definition ID */
  sagaId: string;
  /** Execution state */
  state: SagaExecutionState;
}

export interface SagaExecutionState {
  /** Steps that need compensation */
  compensationQueue: string[];
  /** Execution completion time */
  completedAt?: Date;
  /** Completed steps */
  completedSteps: {
    completedAt: Date;
    duration: number;
    error?: string;
    result?: unknown;
    startedAt: Date;
    status: 'compensated' | 'completed' | 'failed';
    stepId: string;
  }[];
  /** Current step index */
  currentStepIndex: number;
  /** Error information */
  error?: {
    message: string;
    stack?: string;
    stepId: string;
  };
  /** Execution logs */
  logs: {
    data?: unknown;
    level: 'error' | 'info' | 'warn';
    message: string;
    stepId?: string;
    timestamp: Date;
  }[];
  /** Execution metadata */
  metadata?: Record<string, unknown>;
  /** Execution start time */
  startedAt: Date;
  /** Current saga status */
  status: 'compensated' | 'compensating' | 'completed' | 'failed' | 'pending' | 'running';
}

export interface SagaStep {
  /** The action to execute */
  action: (context: SagaContext) => Promise<unknown>;
  /** The compensation action to execute if saga fails */
  compensation?: (context: SagaContext) => Promise<unknown>;
  /** Condition to determine if step should execute */
  condition?: (context: SagaContext) => boolean;
  /** Unique step identifier */
  id: string;
  /** Step metadata */
  metadata?: Record<string, unknown>;
  /** Step name for display */
  name: string;
  /** Retry configuration */
  retry?: {
    backoff?: 'exponential' | 'linear';
    delay: number;
    maxAttempts: number;
  };
  /** Step timeout in milliseconds */
  timeout?: number;
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
   * Build the saga definition
   */
  build(): SagaDefinition {
    if (!this.saga.id || !this.saga.name || !this.saga.steps?.length) {
      throw new Error('Saga must have id, name, and at least one step');
    }

    return this.saga as SagaDefinition;
  }

  /**
   * Configure saga options
   */
  configure(config: SagaDefinition['config']): this {
    this.saga.config = config;
    return this;
  }

  /**
   * Set saga description
   */
  description(description: string): this {
    this.saga.description = description;
    return this;
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

  /**
   * Add metadata
   */
  metadata(metadata: Record<string, unknown>): this {
    this.saga.metadata = metadata;
    return this;
  }

  /**
   * Add failure callback
   */
  onFailure(callback: (context: SagaContext, error: Error) => Promise<void> | void): this {
    if (!this.saga.config) {
      this.saga.config = {};
    }
    this.saga.config.onFailure = callback;
    return this;
  }

  /**
   * Add success callback
   */
  onSuccess(callback: (context: SagaContext) => Promise<void> | void): this {
    if (!this.saga.config) {
      this.saga.config = {};
    }
    this.saga.config.onSuccess = callback;
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
      condition?: SagaStep['condition'];
      metadata?: Record<string, unknown>;
      retry?: SagaStep['retry'];
      timeout?: number;
    },
  ): this {
    const step: SagaStep = {
      action,
      id,
      name,
      ...options,
    };

    (this.saga.steps as SagaStep[]).push(step);
    return this;
  }

  /**
   * Set global timeout
   */
  timeout(milliseconds: number): this {
    this.saga.timeout = milliseconds;
    return this;
  }
}

export class SagaOrchestrator {
  private executions = new Map<string, SagaExecution>();
  private provider: WorkflowProvider;
  private sagas = new Map<string, SagaDefinition>();

  constructor(provider: WorkflowProvider) {
    this.provider = provider;
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
      compensationQueue: [],
      completedSteps: [],
      currentStepIndex: 0,
      logs: [],
      startedAt: new Date(),
      status: 'pending',
    };

    const context: SagaContext = {
      executionId,
      getResult: (key: string) => {
        return context.results[key];
      },
      input,
      log: (level, message, data: any) => {
        state.logs.push({
          data,
          level,
          message,
          stepId: context.currentStepId,
          timestamp: new Date(),
        });
      },
      metadata: metadata || {},
      results: {},
      sagaId,
      setResult: (key: string, value: unknown) => {
        context.results[key] = value;
      },
      state,
    };

    const execution: SagaExecution = {
      context,
      id: executionId,
      input,
      sagaId,
      state,
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
   * Register a saga definition
   */
  registerSaga(saga: SagaDefinition): void {
    this.sagas.set(saga.id, saga);
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
      const stepIndex = saga.steps.findIndex((step: any) => step.id === fromStepId);
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
      const step = saga.steps.find((s: any) => s.id === stepId);
      if (!step?.compensation) {
        continue;
      }

      execution.context.currentStepId = stepId;
      execution.context.log('info', `Compensating step ${stepId}`);

      try {
        await step.compensation(execution.context);

        // Update completed step status
        const completedStep = execution.state.completedSteps.find((s: any) => s.stepId === stepId);
        if (completedStep) {
          completedStep.status = 'compensated';
        }

        execution.context.log('info', `Step ${stepId} compensated successfully`);
      } catch (error) {
        execution.context.log('error', `Compensation failed for step ${stepId}`, {
          error:
            error instanceof Error ? (error as Error)?.message || 'Unknown error' : String(error),
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

  private async executeStepWithRetry(step: SagaStep, context: SagaContext): Promise<unknown> {
    const maxAttempts = step.retry?.maxAttempts || 1;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Set step timeout if configured
        if (step.timeout) {
          return await Promise.race([
            step.action(context),
            new Promise((_resolve, reject) =>
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
          await new Promise((resolve: any) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  private generateExecutionId(): string {
    return `saga_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

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
              message: 'Saga execution timeout',
              stepId: 'global',
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
            completedAt: stepCompletedTime,
            duration,
            result,
            startedAt: stepStartTime,
            status: 'completed',
            stepId: step.id,
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
            completedAt: stepCompletedTime,
            duration,
            error:
              error instanceof Error ? (error as Error)?.message || 'Unknown error' : String(error),
            startedAt: stepStartTime,
            status: 'failed',
            stepId: step.id,
          });

          execution.state.error = {
            message:
              error instanceof Error ? (error as Error)?.message || 'Unknown error' : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            stepId: step.id,
          };

          execution.context.log('error', `Step ${step.id} failed`, {
            error:
              error instanceof Error ? (error as Error)?.message || 'Unknown error' : String(error),
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
    } catch (error: any) {
      execution.state.status = 'failed';
      execution.state.completedAt = new Date();
      execution.state.error = {
        message:
          error instanceof Error ? (error as Error)?.message || 'Unknown error' : String(error),
        stepId: 'global',
      };
      execution.context.log('error', 'Saga execution failed', {
        error:
          error instanceof Error ? (error as Error)?.message || 'Unknown error' : String(error),
      });
    }
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
        condition: (context: any) => !condition(context),
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
    actions: {
      action: SagaStep['action'];
      compensation?: SagaStep['compensation'];
      id: string;
    }[],
  ): SagaStep {
    return {
      action: async (context: any) => {
        const results = await Promise.all(
          actions.map(async ({ action, id: actionId }) => ({
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
      compensation: actions.some((a: any) => a.compensation)
        ? async (context: any) => {
            // Compensate in reverse order
            for (const { compensation, id: _actionId } of actions.reverse()) {
              if (compensation) {
                await compensation(context);
              }
            }
          }
        : undefined,
      id,
      name,
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
