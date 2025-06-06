/**
 * Modern Workflow Step Factory System (ES2022+)
 *
 * Provides a standardized way to create and execute workflow steps with
 * built-in patterns for retry, rate limiting, circuit breaking, validation,
 * and comprehensive error handling using modern JavaScript features.
 */

import { nanoid } from 'nanoid';

import { type RetryOptions, withCircuitBreaker, withRetry } from '../patterns/index';
import {
  createOrchestrationError,
  createValidationError,
  OrchestrationError,
  OrchestrationErrorCodes,
} from '../utils/errors';

import {
  createProgressReporter,
  initializePerformanceData,
  updatePerformanceData,
} from './step-factory/step-performance';
import {
  validateStepDefinition,
  validateStepInput,
  validateStepOutput,
} from './step-factory/step-validation';

import type { WorkflowError } from '../types/workflow';
// Import modularized components
import type {
  ErrorCode,
  ExecutionId,
  StepExecutionConfig,
  StepExecutionContext,
  StepExecutionFunction,
  StepExecutionResult,
  StepFactoryConfig,
  StepId,
  StepMetadata,
  StepPerformanceData,
  StepValidationConfig,
  ValidationResult,
  WorkflowStepDefinition,
} from './step-factory/step-types';
import type { SimpleWorkflowStep } from './step-factory/step-types';

// Re-export types for convenience
export * from './step-factory/step-types';
export * from './step-factory/step-validation';
export * from './step-factory/step-performance';

// ===== SIMPLE FUNCTION-BASED API (80% of use cases) =====

/**
 * Simple step creation for common use cases
 * Handles 80% of workflow step creation with minimal configuration
 */
export function createStep<TInput = any, TOutput = any>(
  name: string,
  action: (input: TInput) => Promise<TOutput> | TOutput,
): SimpleWorkflowStep<TInput, TOutput> {
  return {
    validate: async (input: TInput) => ({ valid: true }),
    execute: async (input: TInput) => {
      try {
        const output = await action(input);
        return {
          output,
          performance: { duration: 0, startTime: Date.now() },
          success: true,
        };
      } catch (error) {
        return {
          error: {
            code: 'STEP_EXECUTION_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error',
            retryable: true,
            stepId: name,
            timestamp: new Date(),
          },
          performance: { duration: 0, startTime: Date.now() },
          success: false,
        };
      }
    },
  };
}

/**
 * Enhanced step creation with validation
 */
export function createStepWithValidation<TInput = any, TOutput = any>(
  name: string,
  action: (input: TInput) => Promise<TOutput> | TOutput,
  inputValidator?: (input: TInput) => boolean | Promise<boolean>,
  outputValidator?: (output: TOutput) => boolean | Promise<boolean>,
): SimpleWorkflowStep<TInput, TOutput> {
  return {
    validate: async (input: TInput) => {
      if (inputValidator) {
        const isValid = await inputValidator(input);
        return {
          valid: isValid,
          errors: isValid ? undefined : ['Input validation failed'],
        };
      }
      return { valid: true };
    },
    execute: async (input: TInput) => {
      try {
        // Validate input if validator provided
        if (inputValidator && !(await inputValidator(input))) {
          return {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Input validation failed',
              retryable: false,
              stepId: name,
              timestamp: new Date(),
            },
            performance: { duration: 0, startTime: Date.now() },
            success: false,
          };
        }

        const output = await action(input);

        // Validate output if validator provided
        if (outputValidator && !(await outputValidator(output))) {
          return {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Output validation failed',
              retryable: false,
              stepId: name,
              timestamp: new Date(),
            },
            performance: { duration: 0, startTime: Date.now() },
            success: false,
          };
        }

        return {
          output,
          performance: { duration: 0, startTime: Date.now() },
          success: true,
        };
      } catch (error) {
        return {
          error: {
            code: 'STEP_EXECUTION_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error',
            retryable: true,
            stepId: name,
            timestamp: new Date(),
          },
          performance: { duration: 0, startTime: Date.now() },
          success: false,
        };
      }
    },
  };
}

// ===== LEGACY COMPLEX API (for backward compatibility) =====

/**
 * Creates a standardized workflow step with all necessary patterns and configurations
 * @deprecated Use createStep() or enhancer functions for new code
 */
export function createWorkflowStep<TInput = any, TOutput = any>(
  metadata: StepMetadata,
  executionFunction: StepExecutionFunction<TInput, TOutput>,
  options: {
    executionConfig?: StepExecutionConfig;
    validationConfig?: StepValidationConfig<TInput, TOutput>;
    dependencies?: string[];
    condition?: (context: Record<string, any>) => boolean | Promise<boolean>;
    optional?: boolean;
    cleanup?: (context: StepExecutionContext<TInput>) => Promise<void> | void;
  } = {},
): WorkflowStepDefinition<TInput, TOutput> {
  const stepId: StepId = `step_${nanoid()}`;

  return {
    id: stepId,
    validationConfig: options.validationConfig,
    cleanup: options.cleanup,
    condition: options.condition,
    dependencies: options.dependencies,
    execute: executionFunction,
    executionConfig: options.executionConfig,
    metadata: {
      ...metadata,
      createdAt: metadata.createdAt ?? new Date(), // nullish coalescing
    },
    optional: options.optional,
  };
}

/**
 * Standard implementation of workflow step execution with all patterns applied
 * Uses ES2022+ private fields and modern patterns
 */
export class StandardWorkflowStep<TInput = any, TOutput = any> {
  // Private fields (ES2022+)
  #definition: WorkflowStepDefinition<TInput, TOutput>;
  #factoryConfig: StepFactoryConfig;
  #executionCount = 0;
  #lastExecutionTime?: number;
  #progressGenerator?: AsyncGenerator<StepPerformanceData, StepExecutionResult<TOutput>, unknown>;

  // Static initialization block (ES2022+)
  static {
    // Validate ES2022+ support
    if (!globalThis.structuredClone) {
      console.warn('StandardWorkflowStep: structuredClone not available, using JSON fallback');
    }
  }

  constructor(
    definition: WorkflowStepDefinition<TInput, TOutput>,
    factoryConfig: StepFactoryConfig = {},
  ) {
    this.#definition = definition;
    this.#factoryConfig = {
      enableDetailedLogging: false,
      enablePerformanceMonitoring: true,
      ...factoryConfig,
    };
  }

  /**
   * Execute the step with all configured patterns and monitoring
   * Uses modern ES2022+ features and nullish coalescing
   */
  async execute(
    input: TInput,
    workflowExecutionId: string,
    previousStepsContext: Record<string, any> = {},
    metadata: Record<string, any> = {},
    abortSignal?: AbortSignal,
  ): Promise<StepExecutionResult<TOutput>> {
    const executionId: ExecutionId = `exec_${nanoid()}`;
    this.#executionCount++;
    this.#lastExecutionTime = Date.now();

    // Convert to ReadonlyMaps for immutability
    const contextMap = new Map(Object.entries(previousStepsContext));
    const metadataMap = new Map(Object.entries(metadata));

    const performance = initializePerformanceData(this.#factoryConfig.enablePerformanceMonitoring);

    const context: StepExecutionContext<TInput> = {
      abortSignal,
      attempt: 1,
      executionId,
      input,
      metadata: metadataMap,
      performance,
      previousStepsContext: contextMap,
      reportProgress: createProgressReporter(
        performance,
        this.#definition.id,
        this.#factoryConfig.enableDetailedLogging,
      ),
      stepDefinition: this.#definition,
      workflowExecutionId,
    };

    try {
      // Validate input if configured (nullish coalescing)
      if (this.#definition.validationConfig?.validateInput !== false) {
        await validateStepInput(input, this.#definition.validationConfig);
      }

      // Check execution condition
      if (this.#definition.condition) {
        const shouldExecute = await this.#definition.condition(Object.fromEntries(contextMap));
        if (!shouldExecute) {
          return this.#createSkippedResult(performance, 'Condition not met');
        }
      }

      // Execute with patterns applied
      const result = await this.#executeWithPatterns(context);

      // Validate output if configured and execution succeeded
      if (result.success && result.output && this.#definition.validationConfig?.validateOutput) {
        await validateStepOutput(result.output, this.#definition.validationConfig.output);
      }

      // Update performance data using .at() method (ES2022+)
      updatePerformanceData(performance, this.#factoryConfig.enablePerformanceMonitoring);

      // Run cleanup if configured (nullish coalescing)
      if (this.#definition.cleanup) {
        try {
          await this.#definition.cleanup(context);
        } catch (cleanupError) {
          console.warn(`Cleanup failed for step ${this.#definition.id}:`, cleanupError);
        }
      }

      return {
        ...result,
        performance,
      };
    } catch (error) {
      updatePerformanceData(performance, this.#factoryConfig.enablePerformanceMonitoring);

      const workflowError = this.#createWorkflowError(error, this.#definition.id);

      // Handle error with configured handlers
      await this.#handleError(error as Error, context);

      return {
        error: workflowError,
        performance,
        shouldRetry: this.#shouldRetryError(workflowError),
        success: false,
      };
    }
  }

  /**
   * Execute the step with retry, circuit breaker, and other patterns applied
   * Uses async generators for progress tracking
   */
  async #executeWithPatterns(
    context: StepExecutionContext<TInput>,
  ): Promise<StepExecutionResult<TOutput>> {
    let executeFunction = this.#definition.execute;

    // Apply circuit breaker if configured (nullish coalescing)
    const circuitBreakerConfig = this.#definition.executionConfig?.circuitBreakerConfig;
    if (circuitBreakerConfig) {
      const originalFunction = executeFunction;
      executeFunction = async (
        context: StepExecutionContext<TInput>,
      ): Promise<StepExecutionResult<TOutput>> => {
        const result = await withCircuitBreaker(
          `step-${this.#definition.id}`,
          originalFunction,
          [context],
          circuitBreakerConfig,
        );
        return (
          result.data || {
            output: undefined as any,
            performance: context.performance,
            success: false,
          }
        );
      };
    }

    // Apply retry if configured
    const retryConfig = this.#definition.executionConfig?.retryConfig;
    if (retryConfig) {
      const originalFunction = executeFunction;
      executeFunction = async (
        context: StepExecutionContext<TInput>,
      ): Promise<StepExecutionResult<TOutput>> => {
        const retryOptions: RetryOptions = {
          baseDelay: retryConfig.delay,
          jitter: retryConfig.jitter ?? false,
          maxAttempts: retryConfig.maxAttempts,
          maxDelay: retryConfig.maxDelay ?? retryConfig.delay * 10,
          shouldRetry: (error, attempt) => {
            context.attempt = attempt;
            this.#factoryConfig.enableDetailedLogging &&
              console.log(
                `Retrying step ${this.#definition.id}, attempt ${attempt}:`,
                error.message,
              );
            return attempt < retryConfig.maxAttempts;
          },
          strategy: retryConfig.backoff,
        };

        const result = await withRetry(() => originalFunction(context), retryOptions);
        return (
          result.data || {
            output: undefined as any,
            performance: context.performance,
            success: false,
          }
        );
      };
    }

    // Apply timeout if configured (nullish coalescing)
    const timeoutMs = this.#definition.executionConfig?.timeout?.execution;
    if (timeoutMs) {
      executeFunction = this.#withTimeout(executeFunction, timeoutMs);
    }

    return await executeFunction(context);
  }

  /**
   * Add timeout wrapper to execution function using ES2022+ private method
   */
  #withTimeout<T>(fn: (context: StepExecutionContext<TInput>) => Promise<T>, timeoutMs: number) {
    return async (context: StepExecutionContext<TInput>): Promise<T> => {
      return await Promise.race([
        fn(context),
        new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(
              createOrchestrationError(`Step execution timed out after ${timeoutMs}ms`, {
                code: OrchestrationErrorCodes.STEP_TIMEOUT_ERROR,
                retryable: true,
              }),
            );
          }, timeoutMs);
        }),
      ]);
    };
  }

  /**
   * Create workflow error from caught error using ES2022+ private method
   */
  #createWorkflowError(error: unknown, stepId: string): WorkflowError {
    if (error instanceof OrchestrationError) {
      return {
        code: error.code as ErrorCode,
        details: error.context,
        message: error.message,
        retryable: error.retryable,
        stepId,
        timestamp: new Date(),
      };
    }

    return {
      code: 'STEP_EXECUTION_ERROR' as ErrorCode,
      details: { originalError: error },
      message: error instanceof Error ? error.message : 'Unknown error',
      retryable: true,
      stepId,
      timestamp: new Date(),
    };
  }

  /**
   * Determine if error should trigger retry using ES2022+ private method
   */
  #shouldRetryError(error: WorkflowError): boolean {
    // Check if retry is configured (nullish coalescing)
    const retryConfig = this.#definition.executionConfig?.retryConfig;
    if (!retryConfig) {
      return false;
    }

    // Check custom retry condition (nullish coalescing)
    return retryConfig.retryIf?.(error) ?? error.retryable ?? false;
  }

  /**
   * Handle error with configured error handlers using ES2022+ private method
   */
  async #handleError(error: Error, context: StepExecutionContext<TInput>): Promise<void> {
    const errorHandlers = this.#factoryConfig.errorHandlers;
    if (!errorHandlers) return;

    // Try to find specific handler for error type (nullish coalescing)
    const errorType = error.constructor.name;
    const handler = errorHandlers.get(errorType) ?? errorHandlers.get('default');

    if (handler) {
      try {
        await handler(error, context);
      } catch (handlerError) {
        console.warn(`Error handler failed for step ${this.#definition.id}:`, handlerError);
      }
    }
  }

  /**
   * Create result for skipped step execution using ES2022+ private method
   */
  #createSkippedResult(
    performance: StepPerformanceData,
    reason: string,
  ): StepExecutionResult<TOutput> {
    updatePerformanceData(performance, this.#factoryConfig.enablePerformanceMonitoring);

    return {
      metadata: { reason, skipped: true },
      performance,
      success: true,
    };
  }

  /**
   * Get step definition (deep clone for immutability)
   */
  getDefinition(): WorkflowStepDefinition<TInput, TOutput> {
    // Create a deep copy of the definition without the execute function
    const definitionCopy = {
      ...this.#definition,
      execute: this.#definition.execute, // Keep the original function reference
    };
    return definitionCopy;
  }

  /**
   * Get step metadata
   */
  getMetadata(): StepMetadata {
    return this.#definition.metadata;
  }

  /**
   * Check if step is deprecated (nullish coalescing)
   */
  isDeprecated(): boolean {
    return this.#definition.metadata.deprecated ?? false;
  }

  /**
   * Get execution statistics
   */
  getExecutionStats() {
    return {
      executionCount: this.#executionCount,
      lastExecutionTime: this.#lastExecutionTime,
      stepId: this.#definition.id,
    };
  }

  /**
   * Validate step definition
   */
  static validateDefinition<TInput, TOutput>(
    definition: WorkflowStepDefinition<TInput, TOutput>,
  ): ValidationResult {
    return validateStepDefinition(definition);
  }
}

/**
 * Step factory for creating and managing workflow steps
 * Uses ES2022+ private fields and modern patterns
 */
export class StepFactory {
  // Private fields (ES2022+)
  #steps = new Map<string, WorkflowStepDefinition>();
  #config: StepFactoryConfig;

  // Static initialization block
  static {
    // console.debug('StepFactory: Initialized with ES2022+ features');
  }

  constructor(config: StepFactoryConfig = {}) {
    this.#config = {
      enableDetailedLogging: false,
      enablePerformanceMonitoring: true,
      ...config,
    };
    this.#steps = new Map();
    this.registerBuiltInSteps();
  }

  /**
   * Register built-in steps
   */
  private registerBuiltInSteps(): void {
    // Register HTTP request step
    const httpStep = createWorkflowStep(
      {
        name: 'HTTP Request',
        category: 'http',
        description: 'Make an HTTP request',
        tags: ['http', 'api'],
        version: '1.0.0',
      },
      async (context) => ({
        output: {},
        performance: context.performance,
        success: true,
      }),
    );
    httpStep.id = 'builtin_http_request';
    this.registerStep(httpStep);

    // Register database query step
    const dbStep = createWorkflowStep(
      {
        name: 'Database Query',
        category: 'database',
        description: 'Execute a database query',
        tags: ['database', 'sql'],
        version: '1.0.0',
      },
      async (context) => ({
        output: {},
        performance: context.performance,
        success: true,
      }),
    );
    dbStep.id = 'builtin_db_query';
    this.registerStep(dbStep);
  }

  /**
   * Create a new workflow step
   */
  createStep<TInput = any, TOutput = any>(
    metadata: StepMetadata,
    executionFunction: StepExecutionFunction<TInput, TOutput>,
    options: {
      executionConfig?: StepExecutionConfig;
      validationConfig?: StepValidationConfig<TInput, TOutput>;
      dependencies?: string[];
      condition?: (context: Record<string, any>) => boolean | Promise<boolean>;
      optional?: boolean;
      cleanup?: (context: StepExecutionContext<TInput>) => Promise<void> | void;
    } = {},
  ): WorkflowStepDefinition<TInput, TOutput> {
    // Merge with default configurations (nullish coalescing)
    const mergedExecutionConfig = {
      ...this.#config.defaultExecutionConfig,
      ...options.executionConfig,
    };

    const mergedValidationConfig = {
      ...this.#config.defaultValidationConfig,
      ...options.validationConfig,
    };

    const definition = createWorkflowStep(metadata, executionFunction, {
      ...options,
      validationConfig: mergedValidationConfig,
      executionConfig: mergedExecutionConfig,
    });

    // Validate step definition
    const validation = validateStepDefinition(definition);
    if (!validation.valid) {
      throw createValidationError(`Invalid step definition: ${validation.errors?.join(', ')}`, {
        validationErrors: validation.errors,
        code: OrchestrationErrorCodes.INVALID_STEP_DEFINITION,
      });
    }

    return definition;
  }

  /**
   * Register a step in the factory
   */
  registerStep<TInput = any, TOutput = any>(
    definition: WorkflowStepDefinition<TInput, TOutput>,
  ): void {
    const validation = validateStepDefinition(definition);
    if (!validation.valid) {
      throw createValidationError(
        `Cannot register invalid step: ${validation.errors?.join(', ')}`,
        {
          validationErrors: validation.errors,
          code: OrchestrationErrorCodes.INVALID_STEP_REGISTRATION,
        },
      );
    }

    if (this.#steps.has(definition.id)) {
      throw createOrchestrationError(`Step with ID ${definition.id} is already registered`, {
        code: OrchestrationErrorCodes.DUPLICATE_STEP,
        retryable: false,
      });
    }

    this.#steps.set(definition.id, definition);
  }

  /**
   * Get a registered step (nullish coalescing)
   */
  getStep(stepId: string): WorkflowStepDefinition | undefined {
    return this.#steps.get(stepId);
  }

  /**
   * List all registered steps
   */
  listSteps(): WorkflowStepDefinition[] {
    return Array.from(this.#steps.values());
  }

  /**
   * List steps by category using .at() method (ES2022+)
   */
  listStepsByCategory(category: string): WorkflowStepDefinition[] {
    return this.listSteps().filter((step) => step.metadata.category === category);
  }

  /**
   * Get the latest registered step (using .at(-1) ES2022+)
   */
  getLatestStep(): WorkflowStepDefinition | undefined {
    const steps = this.listSteps();
    return steps.at(-1); // ES2022+ array .at() method
  }

  /**
   * Create executable step instance
   */
  createExecutableStep<TInput = any, TOutput = any>(
    definition: WorkflowStepDefinition<TInput, TOutput>,
  ): StandardWorkflowStep<TInput, TOutput> {
    return new StandardWorkflowStep(definition, this.#config);
  }

  /**
   * Create executable step instance from registered step
   */
  createExecutableStepById<TInput = any, TOutput = any>(
    stepId: string,
  ): StandardWorkflowStep<TInput, TOutput> {
    const definition = this.getStep(stepId);
    if (!definition) {
      throw createOrchestrationError(`Step with ID ${stepId} not found`, {
        code: OrchestrationErrorCodes.STEP_NOT_FOUND,
        retryable: false,
      });
    }

    return new StandardWorkflowStep(
      definition as WorkflowStepDefinition<TInput, TOutput>,
      this.#config,
    );
  }

  /**
   * Update factory configuration
   */
  updateConfig(config: Partial<StepFactoryConfig>): void {
    this.#config = { ...this.#config, ...config };
  }

  /**
   * Get factory configuration
   */
  getConfig(): StepFactoryConfig {
    return { ...this.#config };
  }

  /**
   * Clear all registered steps
   */
  clearSteps(): void {
    this.#steps.clear();
  }

  /**
   * Get factory statistics
   */
  getStats() {
    return {
      deprecatedSteps: this.#getDeprecatedStepsCount(),
      stepsByCategory: this.#getStepsByCategory(),
      totalSteps: this.#steps.size,
    };
  }

  /**
   * Private helper for categorizing steps
   */
  #getStepsByCategory(): Map<string, number> {
    const categories = new Map<string, number>();
    for (const step of this.#steps.values()) {
      const category = step.metadata.category ?? 'uncategorized';
      categories.set(category, (categories.get(category) ?? 0) + 1);
    }
    return categories;
  }

  /**
   * Private helper for counting deprecated steps
   */
  #getDeprecatedStepsCount(): number {
    return Array.from(this.#steps.values()).filter((step) => step.metadata.deprecated ?? false)
      .length;
  }
}

/**
 * Default step factory instance
 */
export const defaultStepFactory = new StepFactory();

// ===== OPTIONAL ENHANCERS (20% of use cases) =====

// Note: Enhancers are exported from factories/index.ts to avoid conflicts

// ===== MODERN UTILITY FUNCTIONS (ES2022+) ====="

/**
 * Pattern matching for error handling
 */
export const matchError = (error: WorkflowError) => ({
  validation: (handler: (error: WorkflowError) => void) =>
    error.code?.includes('VALIDATION') ? handler(error) : undefined,
  default: (handler: (error: WorkflowError) => void) => handler(error),
  execution: (handler: (error: WorkflowError) => void) =>
    error.code?.includes('EXECUTION') ? handler(error) : undefined,
  timeout: (handler: (error: WorkflowError) => void) =>
    error.code?.includes('TIMEOUT') ? handler(error) : undefined,
});

/**
 * Conditional step execution helper
 */
export const when = <TInput, TOutput>(
  condition: (input: TInput) => boolean | Promise<boolean>,
  trueStep: WorkflowStepDefinition<TInput, TOutput>,
  falseStep?: WorkflowStepDefinition<TInput, TOutput>,
): WorkflowStepDefinition<TInput, TOutput> => {
  return createWorkflowStep(
    {
      name: 'conditional_step',
      category: 'control',
      description: 'Conditional step execution',
      tags: ['conditional'],
      version: '1.0.0',
    },
    async (context) => {
      const shouldExecuteTrue = await condition(context.input);
      const stepToExecute = shouldExecuteTrue ? trueStep : falseStep;

      if (!stepToExecute) {
        return {
          metadata: { reason: 'No step for condition result', skipped: true },
          output: context.input as unknown as TOutput,
          performance: context.performance,
          success: true,
        };
      }

      const stepInstance = new StandardWorkflowStep(stepToExecute);
      return stepInstance.execute(
        context.input,
        context.workflowExecutionId,
        Object.fromEntries(context.previousStepsContext),
        Object.fromEntries(context.metadata),
        context.abortSignal,
      );
    },
  );
};
