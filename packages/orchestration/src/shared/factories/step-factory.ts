/**
 * Modern Workflow Step Factory System (ES2022+)
 *
 * Provides a standardized way to create and execute workflow steps with
 * built-in patterns for retry, rate limiting, circuit breaking, validation,
 * and comprehensive error handling using modern JavaScript features.
 */

import { nanoid } from 'nanoid';

import { createServerObservability } from '@repo/observability/shared-env';
import { type RetryOptions, withCircuitBreaker, withRetry } from '../patterns/index';
import { WorkflowError } from '../types/errors';
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
// Import modularized components
import {
  ErrorCode,
  ExecutionId,
  SimpleWorkflowStep,
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
// Duplicate import removed
import {
  validateStepDefinition,
  validateStepInput,
  validateStepOutput,
} from './step-factory/step-validation';

export * from './step-factory/step-performance';
// Re-export types for convenience
export * from './step-factory/step-types';
export * from './step-factory/step-validation';

// ===== SIMPLE FUNCTION-BASED API (80% of use cases) =====

/**
 * Standard implementation of workflow step execution with all patterns applied
 * Uses ES2022+ private fields and modern patterns
 */
export class StandardWorkflowStep<TInput = unknown, TOutput = unknown> {
  // Static initialization block (ES2022+)
  static {
    // Validate ES2022+ support
    if (!globalThis.structuredClone) {
      // Fire and forget logging
      (async () => {
        try {
          const logger = await createServerObservability({
            providers: {
              console: { enabled: true },
            },
          });
          logger.log(
            'warn',
            'StandardWorkflowStep: structuredClone not available, using JSON fallback',
          );
        } catch {
          // Fallback to console if logger fails
        }
      })();
    }
  }
  // Private fields (ES2022+)
  #definition: WorkflowStepDefinition<TInput, TOutput>;
  #executionCount = 0;
  #factoryConfig: StepFactoryConfig;
  #lastExecutionTime?: number;

  #progressGenerator?: AsyncGenerator<StepPerformanceData, StepExecutionResult<TOutput>, unknown>;

  constructor(
    definition: WorkflowStepDefinition<TInput, TOutput>,
    factoryConfig: StepFactoryConfig = {},
  ) {
    this.#definition = definition;
    this.#factoryConfig = {
      onStepComplete: (_stepName: string, _duration: number, _success: boolean) => {},
      enablePerformanceMonitoring: true,
      ...factoryConfig,
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

  /**
   * Execute the step with all configured patterns and monitoring
   * Uses modern ES2022+ features and nullish coalescing
   */
  async execute(
    input: TInput,
    workflowExecutionId: string,
    previousStepsContext: Record<string, unknown> = {},
    metadata: Record<string, unknown> = {},
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
        } catch (cleanupError: any) {
          // Fire and forget logging
          (async () => {
            try {
              const logger = await createServerObservability({
                providers: {
                  console: { enabled: true },
                },
              });
              logger.log('warn', `Cleanup failed for step ${this.#definition.id}`, cleanupError);
            } catch {
              // Fallback to console if logger fails
            }
          })();
        }
      }

      return {
        ...result,
        performance,
      };
    } catch (error: any) {
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
   * Create workflow error from caught error using ES2022+ private method
   */
  #createWorkflowError(error: unknown, stepId: string): WorkflowError {
    if (error instanceof OrchestrationError) {
      return {
        code: error.code as ErrorCode,
        details: error.context,
        message: (error as Error)?.message || 'Unknown error',
        retryable: error.retryable,
        stepId,
        timestamp: new Date(),
      };
    }

    return {
      code: 'STEP_EXECUTION_ERROR' as ErrorCode,
      details: { originalError: error },
      message:
        error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error',
      retryable: true,
      stepId,
      timestamp: new Date(),
    };
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
          result?.data || {
            output: undefined as unknown as TOutput,
            performance: context?.performance,
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
          shouldRetry: (error, attempt: any) => {
            context.attempt = attempt;
            if (this.#factoryConfig.enableDetailedLogging) {
              // Fire and forget logging
              (async () => {
                try {
                  const logger = await createServerObservability({
                    providers: {
                      console: { enabled: true },
                    },
                  });
                  logger.log(
                    'info',
                    `Retrying step ${this.#definition.id}, attempt ${attempt}: ${(error as Error)?.message || 'Unknown error'}`,
                  );
                } catch {
                  // Fallback to console if logger fails
                }
              })();
            }
            return attempt < retryConfig.maxAttempts;
          },
          strategy: retryConfig.backoff,
        };

        const result = await withRetry(() => originalFunction(context), retryOptions);
        return (
          result?.data || {
            output: undefined as unknown as TOutput,
            performance: context?.performance,
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
      } catch (handlerError: any) {
        // Fire and forget logging
        (async () => {
          try {
            const logger = await createServerObservability({
              providers: {
                console: { enabled: true },
              },
            });
            logger.log(
              'warn',
              `Error handler failed for step ${this.#definition.id}`,
              handlerError,
            );
          } catch {
            // Fallback to console if logger fails
          }
        })();
      }
    }
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
   * Add timeout wrapper to execution function using ES2022+ private method
   */
  #withTimeout<T>(fn: (context: StepExecutionContext<TInput>) => Promise<T>, timeoutMs: number) {
    return async (context: StepExecutionContext<TInput>): Promise<T> => {
      return await Promise.race([
        fn(context),
        new Promise<never>((_resolve, reject) => {
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
}

/**
 * Step factory for creating and managing workflow steps
 * Uses ES2022+ private fields and modern patterns
 */
export class StepFactory {
  // Static initialization block
  static {
    // Fire and forget logging
    (async () => {
      try {
        const logger = await createServerObservability({
          providers: {
            console: { enabled: true },
          },
        });
        logger.log('debug', 'StepFactory: Initialized with ES2022+ features');
      } catch {
        // Fallback to console if logger fails
      }
    })();
  }
  #config: StepFactoryConfig;

  // Private fields (ES2022+)
  #steps = new Map<string, WorkflowStepDefinition>();

  constructor(config: StepFactoryConfig = {}) {
    this.#config = {
      onStepComplete: (_stepName: string, _duration: number, _success: boolean) => {},
      enablePerformanceMonitoring: true,
      ...config,
    };
    this.#steps = new Map();
    this.registerBuiltInSteps();
  }

  /**
   * Clear all registered steps
   */
  clearSteps(): void {
    this.#steps.clear();
  }

  /**
   * Create executable step instance
   */
  createExecutableStep<TInput = unknown, TOutput = unknown>(
    definition: WorkflowStepDefinition<TInput, TOutput>,
  ): StandardWorkflowStep<TInput, TOutput> {
    return new StandardWorkflowStep(definition, this.#config);
  }

  /**
   * Create executable step instance from registered step
   */
  createExecutableStepById<TInput = unknown, TOutput = unknown>(
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
   * Create a new workflow step
   */
  createStep<TInput = unknown, TOutput = unknown>(
    metadata: StepMetadata,
    executionFunction: StepExecutionFunction<TInput, TOutput>,
    options: {
      cleanup?: (context: StepExecutionContext<TInput>) => Promise<void> | void;
      condition?: (context: Record<string, unknown>) => boolean | Promise<boolean>;
      dependencies?: string[];
      executionConfig?: StepExecutionConfig;
      optional?: boolean;
      validationConfig?: StepValidationConfig<TInput, TOutput>;
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
      executionConfig: mergedExecutionConfig,
      validationConfig: mergedValidationConfig,
    });

    // Validate step definition
    const validation = validateStepDefinition(definition);
    if (!validation.valid) {
      throw createValidationError(`Invalid step definition: ${validation.errors?.join(', ')}`, {
        code: OrchestrationErrorCodes.INVALID_STEP_DEFINITION,
        validationErrors: validation.errors,
      });
    }

    return definition;
  }

  /**
   * Get factory configuration
   */
  getConfig(): StepFactoryConfig {
    return { ...this.#config };
  }

  /**
   * Get the latest registered step (using .at(-1) ES2022+)
   */
  getLatestStep(): WorkflowStepDefinition | undefined {
    const steps = this.listSteps();
    return steps.at(-1); // ES2022+ array .at() method
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
    return this.listSteps().filter((step: any) => step.metadata.category === category);
  }

  /**
   * Register a step in the factory
   */
  registerStep<TInput = unknown, TOutput = unknown>(
    definition: WorkflowStepDefinition<TInput, TOutput>,
  ): void {
    const validation = validateStepDefinition(definition);
    if (!validation.valid) {
      throw createValidationError(
        `Cannot register invalid step: ${validation.errors?.join(', ')}`,
        {
          code: OrchestrationErrorCodes.INVALID_STEP_REGISTRATION,
          validationErrors: validation.errors,
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
   * Update factory configuration
   */
  updateConfig(config: Partial<StepFactoryConfig>): void {
    this.#config = { ...this.#config, ...config };
  }

  /**
   * Private helper for counting deprecated steps
   */
  #getDeprecatedStepsCount(): number {
    return Array.from(this.#steps.values()).filter((step: any) => step.metadata.deprecated ?? false)
      .length;
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
   * Register built-in steps
   */
  private registerBuiltInSteps(): void {
    // Register HTTP request step
    const httpStep = createWorkflowStep(
      {
        category: 'http',
        description: 'Make an HTTP request',
        name: 'HTTP Request',
        tags: ['http', 'api'],
        version: '1.0.0',
      },
      async (context: any) => ({
        output: {},
        performance: context?.performance,
        success: true,
      }),
    );
    httpStep.id = 'builtin_http_request';
    this.registerStep(httpStep);

    // Register database query step
    const dbStep = createWorkflowStep(
      {
        category: 'database',
        description: 'Execute a database query',
        name: 'Database Query',
        tags: ['database', 'sql'],
        version: '1.0.0',
      },
      async (context: any) => ({
        output: {},
        performance: context?.performance,
        success: true,
      }),
    );
    dbStep.id = 'builtin_db_query';
    this.registerStep(dbStep);
  }
}

// ===== LEGACY COMPLEX API (for backward compatibility) =====

/**
 * Simple step creation for common use cases
 * Handles 80% of workflow step creation with minimal configuration
 */
export function createStep<TInput = unknown, TOutput = unknown>(
  name: string,
  action: (input: TInput) => Promise<TOutput> | TOutput,
): SimpleWorkflowStep<TInput, TOutput> {
  return {
    execute: async (input: TInput) => {
      try {
        const output = await action(input);
        return {
          output,
          performance: { duration: 0, startTime: Date.now() },
          success: true,
        };
      } catch (error: any) {
        return {
          error: {
            code: 'STEP_EXECUTION_ERROR',
            message:
              error instanceof Error
                ? (error as Error)?.message || 'Unknown error'
                : 'Unknown error',
            retryable: true,
            stepId: name,
            timestamp: new Date(),
          },
          performance: { duration: 0, startTime: Date.now() },
          success: false,
        };
      }
    },
    validate: async (_input: TInput) => ({ valid: true }),
  };
}

/**
 * Enhanced step creation with validation
 */
export function createStepWithValidation<TInput = unknown, TOutput = unknown>(
  name: string,
  action: (input: TInput) => Promise<TOutput> | TOutput,
  inputValidator?: (input: TInput) => boolean | Promise<boolean>,
  outputValidator?: (output: TOutput) => boolean | Promise<boolean>,
): SimpleWorkflowStep<TInput, TOutput> {
  return {
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
      } catch (error: any) {
        return {
          error: {
            code: 'STEP_EXECUTION_ERROR',
            message:
              error instanceof Error
                ? (error as Error)?.message || 'Unknown error'
                : 'Unknown error',
            retryable: true,
            stepId: name,
            timestamp: new Date(),
          },
          performance: { duration: 0, startTime: Date.now() },
          success: false,
        };
      }
    },
    validate: async (input: TInput) => {
      if (inputValidator) {
        const isValid = await inputValidator(input);
        return {
          errors: isValid ? undefined : ['Input validation failed'],
          valid: isValid,
        };
      }
      return { valid: true };
    },
  };
}

/**
 * Creates a standardized workflow step with all necessary patterns and configurations
 * @deprecated Use createStep() or enhancer functions for new code
 */
export function createWorkflowStep<TInput = unknown, TOutput = unknown>(
  metadata: StepMetadata,
  executionFunction: StepExecutionFunction<TInput, TOutput>,
  options: {
    cleanup?: (context: StepExecutionContext<TInput>) => Promise<void> | void;
    condition?: (context: Record<string, any>) => boolean | Promise<boolean>;
    dependencies?: string[];
    executionConfig?: StepExecutionConfig;
    optional?: boolean;
    validationConfig?: StepValidationConfig<TInput, TOutput>;
  } = {},
): WorkflowStepDefinition<TInput, TOutput> {
  const stepId: StepId = `step_${nanoid()}`;

  return {
    cleanup: options.cleanup,
    condition: options.condition,
    dependencies: options.dependencies,
    execute: executionFunction,
    executionConfig: options.executionConfig,
    id: stepId,
    metadata: {
      ...metadata,
      createdAt: metadata.createdAt ?? new Date(), // nullish coalescing
    },
    optional: options.optional,
    validationConfig: options.validationConfig,
  };
}

/**
 * Default step factory instance
 */
export const defaultStepFactory = new StepFactory();

// ===== OPTIONAL ENHANCERS (20% of use cases) =====

// Note: Enhancers are exported from factories/index.ts to avoid conflicts

// ===== MODERN UTILITY FUNCTIONS (ES2022+) =====

/**
 * Pattern matching for error handling
 */
export const matchError = (error: WorkflowError) => ({
  default: (handler: (error: WorkflowError) => void) => handler(error),
  execution: (handler: (error: WorkflowError) => void) =>
    error.code?.includes('EXECUTION') ? handler(error) : undefined,
  timeout: (handler: (error: WorkflowError) => void) =>
    error.code?.includes('TIMEOUT') ? handler(error) : undefined,
  validation: (handler: (error: WorkflowError) => void) =>
    error.code?.includes('VALIDATION') ? handler(error) : undefined,
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
      category: 'control',
      description: 'Conditional step execution',
      name: 'conditional_step',
      tags: ['conditional'],
      version: '1.0.0',
    },
    async (context: any) => {
      const shouldExecuteTrue = await condition(context.input);
      const stepToExecute = shouldExecuteTrue ? trueStep : falseStep;

      if (!stepToExecute) {
        return {
          metadata: { reason: 'No step for condition result', skipped: true },
          output: context.input as unknown as TOutput,
          performance: context?.performance,
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

// ===== CONVERSION UTILITIES =====

/**
 * Convert a WorkflowStepDefinition to a SimpleWorkflowStep
 * This enables using step templates with enhancer functions
 */
export function toSimpleStep<TInput = unknown, TOutput = unknown>(
  definition: WorkflowStepDefinition<TInput, TOutput>,
): SimpleWorkflowStep<TInput, TOutput> {
  return {
    async execute(input: TInput): Promise<StepExecutionResult<TOutput>> {
      const executableStep = new StandardWorkflowStep(definition);
      return await executableStep.execute(input, `workflow_${Date.now()}`);
    },
    async validate(input: TInput): Promise<ValidationResult> {
      if (definition.validationConfig?.validateInput !== false) {
        try {
          await validateStepInput(input, definition.validationConfig);
          return { valid: true };
        } catch (error: any) {
          return {
            errors: [
              error instanceof Error
                ? (error as Error)?.message || 'Unknown error'
                : 'Validation failed',
            ],
            valid: false,
          };
        }
      }
      return { valid: true };
    },
  };
}
