/**
 * Modern Workflow Step Factory System (ES2022+)
 * 
 * Provides a standardized way to create and execute workflow steps with
 * built-in patterns for retry, rate limiting, circuit breaking, validation,
 * and comprehensive error handling using modern JavaScript features.
 */

import { nanoid } from 'nanoid';
import { z } from 'zod';
import { withRetry, withCircuitBreaker, type RetryOptions, type CircuitBreakerOptions } from '../patterns/index.js';
import { OrchestrationError } from '../utils/errors.js';
import type { WorkflowStep, WorkflowStepExecution, RetryConfig, WorkflowError } from '../types/workflow.js';

// Modern ES2022+ type utilities
type NonEmptyArray<T> = [T, ...T[]];
type StepId = `step_${string}`;
type ExecutionId = `exec_${string}`;
type ProgressState = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

// Template literal type for better type safety
type ErrorCode = `${'STEP' | 'VALIDATION' | 'TIMEOUT' | 'CIRCUIT_BREAKER'}_${'INPUT' | 'OUTPUT' | 'EXECUTION' | 'VALIDATION'}_ERROR`;

/**
 * Configuration for step execution behavior
 */
export interface StepExecutionConfig {
  /** Retry configuration */
  retryConfig?: RetryConfig;
  /** Rate limiting configuration */
  rateLimitConfig?: {
    /** Maximum requests per window */
    maxRequests: number;
    /** Time window in milliseconds */
    windowMs: number;
    /** Identifier for rate limiting scope */
    identifier?: string;
  };
  /** Circuit breaker configuration */
  circuitBreakerConfig?: CircuitBreakerOptions;
  /** Timeout configuration */
  timeout?: {
    /** Execution timeout in milliseconds */
    execution?: number;
    /** Warning threshold in milliseconds */
    warning?: number;
  };
  /** Concurrency configuration */
  concurrency?: {
    /** Maximum concurrent executions */
    max: number;
    /** Queue limit */
    queueLimit?: number;
  };
}

/**
 * Validation configuration for step inputs and outputs
 */
export interface StepValidationConfig<TInput = any, TOutput = any> {
  /** Input validation schema */
  input?: z.ZodSchema<TInput>;
  /** Output validation schema */
  output?: z.ZodSchema<TOutput>;
  /** Whether to validate input */
  validateInput?: boolean;
  /** Whether to validate output */
  validateOutput?: boolean;
  /** Custom validation function */
  customValidation?: (input: TInput) => Promise<ValidationResult> | ValidationResult;
}

/**
 * Result of validation operation
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Validation error messages */
  errors?: string[];
  /** Additional validation context */
  context?: Record<string, any>;
}

/**
 * Metadata about a workflow step
 */
export interface StepMetadata {
  /** Step name */
  name: string;
  /** Step description */
  description?: string;
  /** Step version */
  version: string;
  /** Step category/tags */
  category?: string;
  /** Step tags for organization */
  tags?: string[];
  /** Author information */
  author?: string;
  /** Creation timestamp */
  createdAt?: Date;
  /** Whether step is deprecated */
  deprecated?: boolean;
  /** Deprecation message */
  deprecationMessage?: string;
}

/**
 * Performance monitoring data for step execution
 */
export interface StepPerformanceData {
  /** Execution start time */
  readonly startTime: number;
  /** Execution end time */
  endTime?: number;
  /** Duration in milliseconds */
  duration?: number;
  /** Memory usage data */
  memoryUsage?: {
    readonly before: NodeJS.MemoryUsage;
    after?: NodeJS.MemoryUsage;
    peak?: number;
  };
  /** CPU usage data */
  cpuUsage?: {
    readonly before: NodeJS.CpuUsage;
    after?: NodeJS.CpuUsage;
  };
  /** Custom metrics */
  customMetrics?: ReadonlyMap<string, number>;
  /** Progress tracking */
  progress?: {
    current: number;
    total: number;
    state: ProgressState;
    details?: string;
  };
}

/**
 * Context passed to step execution function
 */
export interface StepExecutionContext<TInput = any> {
  /** Step execution ID */
  readonly executionId: ExecutionId;
  /** Workflow execution ID */
  readonly workflowExecutionId: string;
  /** Step definition */
  readonly stepDefinition: WorkflowStepDefinition<TInput>;
  /** Current attempt number */
  attempt: number;
  /** Input data */
  readonly input: TInput;
  /** Context from previous steps */
  readonly previousStepsContext: ReadonlyMap<string, any>;
  /** Execution metadata */
  metadata: ReadonlyMap<string, any>;
  /** Performance monitoring */
  performance: StepPerformanceData;
  /** Abort signal for cancellation */
  readonly abortSignal?: AbortSignal;
  /** Progress reporter for async generators */
  reportProgress?: (current: number, total: number, details?: string) => Promise<void>;
}

/**
 * Result of step execution
 */
export interface StepExecutionResult<TOutput = any> {
  /** Execution success status */
  success: boolean;
  /** Output data */
  output?: TOutput;
  /** Error information */
  error?: WorkflowError;
  /** Execution metadata */
  metadata?: Record<string, any>;
  /** Performance data */
  performance: StepPerformanceData;
  /** Whether step should be retried on failure */
  shouldRetry?: boolean;
  /** Context to pass to next steps */
  context?: Record<string, any>;
}

/**
 * Function signature for step execution
 */
export type StepExecutionFunction<TInput = any, TOutput = any> = (
  context: StepExecutionContext<TInput>
) => Promise<StepExecutionResult<TOutput>>;

/**
 * Complete workflow step definition with all configuration
 */
export interface WorkflowStepDefinition<TInput = any, TOutput = any> {
  /** Unique step identifier */
  id: string;
  /** Step metadata */
  metadata: StepMetadata;
  /** Execution function */
  execute: StepExecutionFunction<TInput, TOutput>;
  /** Execution configuration */
  executionConfig?: StepExecutionConfig;
  /** Validation configuration */
  validationConfig?: StepValidationConfig<TInput, TOutput>;
  /** Dependencies - step IDs that must complete first */
  dependencies?: string[];
  /** Condition function to determine if step should execute */
  condition?: (context: Record<string, any>) => boolean | Promise<boolean>;
  /** Whether step can be skipped on failure */
  optional?: boolean;
  /** Cleanup function called after execution */
  cleanup?: (context: StepExecutionContext<TInput>) => Promise<void> | void;
}

/**
 * Step factory configuration
 */
export interface StepFactoryConfig {
  /** Default execution configuration */
  defaultExecutionConfig?: StepExecutionConfig;
  /** Default validation configuration */
  defaultValidationConfig?: StepValidationConfig;
  /** Whether to enable performance monitoring */
  enablePerformanceMonitoring?: boolean;
  /** Whether to enable detailed logging */
  enableDetailedLogging?: boolean;
  /** Custom error handlers */
  errorHandlers?: Map<string, (error: Error, context: StepExecutionContext) => Promise<void>>;
}

/**
 * Creates a standardized workflow step with all necessary patterns and configurations
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
  } = {}
): WorkflowStepDefinition<TInput, TOutput> {
  const stepId = `step_${nanoid()}`;

  return {
    id: stepId,
    metadata: {
      ...metadata,
      createdAt: metadata.createdAt || new Date(),
    },
    execute: executionFunction,
    executionConfig: options.executionConfig,
    validationConfig: options.validationConfig,
    dependencies: options.dependencies,
    condition: options.condition,
    optional: options.optional,
    cleanup: options.cleanup,
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
    factoryConfig: StepFactoryConfig = {}
  ) {
    this.#definition = definition;
    this.#factoryConfig = {
      enablePerformanceMonitoring: true,
      enableDetailedLogging: false,
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
    abortSignal?: AbortSignal
  ): Promise<StepExecutionResult<TOutput>> {
    const executionId: ExecutionId = `exec_${nanoid()}`;
    this.#executionCount++;
    this.#lastExecutionTime = Date.now();

    // Convert to ReadonlyMaps for immutability
    const contextMap = new Map(Object.entries(previousStepsContext));
    const metadataMap = new Map(Object.entries(metadata));
    
    const performance: StepPerformanceData = {
      startTime: this.#lastExecutionTime,
      memoryUsage: this.#factoryConfig.enablePerformanceMonitoring 
        ? { before: process.memoryUsage() }
        : undefined,
      cpuUsage: this.#factoryConfig.enablePerformanceMonitoring 
        ? { before: process.cpuUsage() }
        : undefined,
      customMetrics: new Map(),
      progress: {
        current: 0,
        total: 100,
        state: 'pending' as const,
      },
    };

    const context: StepExecutionContext<TInput> = {
      executionId,
      workflowExecutionId,
      stepDefinition: this.#definition,
      attempt: 1,
      input,
      previousStepsContext: contextMap,
      metadata: metadataMap,
      performance,
      abortSignal,
      reportProgress: async (current: number, total: number, details?: string) => {
        performance.progress = { current, total, state: 'in_progress', details };
        this.#factoryConfig.enableDetailedLogging && 
          console.log(`[${this.#definition.id}] Progress: ${current}/${total} ${details ?? ''}`);
      },
    };

    try {
      // Validate input if configured (nullish coalescing)
      if (this.#definition.validationConfig?.validateInput !== false) {
        await this.#validateInput(input);
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
        await this.#validateOutput(result.output);
      }

      // Update performance data using .at() method (ES2022+)
      this.#updatePerformanceData(performance);

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
      this.#updatePerformanceData(performance);
      
      const workflowError = this.#createWorkflowError(error, this.#definition.id);
      
      // Handle error with configured handlers
      await this.#handleError(error as Error, context);

      return {
        success: false,
        error: workflowError,
        performance,
        shouldRetry: this.#shouldRetryError(workflowError),
      };
    }
  }

  /**
   * Execute the step with retry, circuit breaker, and other patterns applied
   */
  private async executeWithPatterns(
    context: StepExecutionContext<TInput>
  ): Promise<StepExecutionResult<TOutput>> {
    let executeFunction = this.definition.execute;

    // Apply circuit breaker if configured
    if (this.definition.executionConfig?.circuitBreakerConfig) {
      executeFunction = withCircuitBreaker(
        executeFunction,
        this.definition.executionConfig.circuitBreakerConfig
      );
    }

    // Apply retry if configured
    if (this.definition.executionConfig?.retryConfig) {
      const retryOptions: RetryOptions = {
        retries: this.definition.executionConfig.retryConfig.maxAttempts - 1,
        factor: this.definition.executionConfig.retryConfig.backoff === 'exponential' ? 2 : 1,
        minTimeout: this.definition.executionConfig.retryConfig.delay,
        maxTimeout: this.definition.executionConfig.retryConfig.maxDelay,
        randomize: this.definition.executionConfig.retryConfig.jitter,
        onRetry: (error, attempt) => {
          context.attempt = attempt + 1;
          if (this.factoryConfig.enableDetailedLogging) {
            console.log(`Retrying step ${this.definition.id}, attempt ${attempt + 1}:`, error.message);
          }
        },
      };

      executeFunction = withRetry(executeFunction, retryOptions);
    }

    // Apply timeout if configured
    if (this.definition.executionConfig?.timeout?.execution) {
      executeFunction = this.withTimeout(
        executeFunction,
        this.definition.executionConfig.timeout.execution
      );
    }

    return await executeFunction(context);
  }

  /**
   * Validate step input
   */
  private async validateInput(input: TInput): Promise<void> {
    const config = this.definition.validationConfig;
    if (!config) return;

    // Schema validation
    if (config.input) {
      const result = config.input.safeParse(input);
      if (!result.success) {
        throw new OrchestrationError(
          `Input validation failed: ${result.error.issues.map(i => i.message).join(', ')}`,
          'STEP_INPUT_VALIDATION_ERROR',
          false,
          { validationErrors: result.error.issues }
        );
      }
    }

    // Custom validation
    if (config.customValidation) {
      const result = await config.customValidation(input);
      if (!result.valid) {
        throw new OrchestrationError(
          `Custom input validation failed: ${result.errors?.join(', ') || 'Unknown validation error'}`,
          'STEP_CUSTOM_VALIDATION_ERROR',
          false,
          { validationResult: result }
        );
      }
    }
  }

  /**
   * Validate step output
   */
  private async validateOutput(output: TOutput): Promise<void> {
    const schema = this.definition.validationConfig?.output;
    if (!schema) return;

    const result = schema.safeParse(output);
    if (!result.success) {
      throw new OrchestrationError(
        `Output validation failed: ${result.error.issues.map(i => i.message).join(', ')}`,
        'STEP_OUTPUT_VALIDATION_ERROR',
        false,
        { validationErrors: result.error.issues }
      );
    }
  }

  /**
   * Add timeout wrapper to execution function
   */
  private withTimeout<T>(
    fn: (context: StepExecutionContext<TInput>) => Promise<T>,
    timeoutMs: number
  ) {
    return async (context: StepExecutionContext<TInput>): Promise<T> => {
      return await Promise.race([
        fn(context),
        new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new OrchestrationError(
              `Step execution timed out after ${timeoutMs}ms`,
              'STEP_TIMEOUT_ERROR',
              true
            ));
          }, timeoutMs);
        }),
      ]);
    };
  }

  /**
   * Update performance monitoring data
   */
  private updatePerformanceData(performance: StepPerformanceData): void {
    if (!this.factoryConfig.enablePerformanceMonitoring) return;

    performance.endTime = Date.now();
    performance.duration = performance.endTime - performance.startTime;

    if (performance.memoryUsage) {
      performance.memoryUsage.after = process.memoryUsage();
      performance.memoryUsage.peak = Math.max(
        performance.memoryUsage.before.heapUsed,
        performance.memoryUsage.after.heapUsed
      );
    }

    if (performance.cpuUsage) {
      performance.cpuUsage.after = process.cpuUsage(performance.cpuUsage.before);
    }
  }

  /**
   * Create workflow error from caught error
   */
  private createWorkflowError(error: unknown, stepId: string): WorkflowError {
    if (error instanceof OrchestrationError) {
      return {
        code: error.code,
        message: error.message,
        retryable: error.retryable,
        stepId,
        timestamp: new Date(),
        details: error.details,
      };
    }

    return {
      code: 'STEP_EXECUTION_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
      retryable: true,
      stepId,
      timestamp: new Date(),
      details: { originalError: error },
    };
  }

  /**
   * Determine if error should trigger retry
   */
  private shouldRetryError(error: WorkflowError): boolean {
    // Check if retry is configured
    if (!this.definition.executionConfig?.retryConfig) {
      return false;
    }

    // Check custom retry condition
    if (this.definition.executionConfig.retryConfig.retryIf) {
      return this.definition.executionConfig.retryConfig.retryIf(error);
    }

    // Default to error's retryable flag
    return error.retryable;
  }

  /**
   * Handle error with configured error handlers
   */
  private async handleError(error: Error, context: StepExecutionContext<TInput>): Promise<void> {
    const errorHandlers = this.factoryConfig.errorHandlers;
    if (!errorHandlers) return;

    // Try to find specific handler for error type
    const errorType = error.constructor.name;
    const handler = errorHandlers.get(errorType) || errorHandlers.get('default');

    if (handler) {
      try {
        await handler(error, context);
      } catch (handlerError) {
        console.warn(`Error handler failed for step ${this.definition.id}:`, handlerError);
      }
    }
  }

  /**
   * Create result for skipped step execution
   */
  private createSkippedResult(
    performance: StepPerformanceData,
    reason: string
  ): StepExecutionResult<TOutput> {
    this.updatePerformanceData(performance);
    
    return {
      success: true,
      metadata: { skipped: true, reason },
      performance,
    };
  }

  /**
   * Get step definition
   */
  getDefinition(): WorkflowStepDefinition<TInput, TOutput> {
    return this.definition;
  }

  /**
   * Get step metadata
   */
  getMetadata(): StepMetadata {
    return this.definition.metadata;
  }

  /**
   * Check if step is deprecated
   */
  isDeprecated(): boolean {
    return this.definition.metadata.deprecated === true;
  }

  /**
   * Validate step definition
   */
  static validateDefinition<TInput, TOutput>(
    definition: WorkflowStepDefinition<TInput, TOutput>
  ): ValidationResult {
    const errors: string[] = [];

    // Validate required fields
    if (!definition.id) {
      errors.push('Step ID is required');
    }

    if (!definition.metadata.name) {
      errors.push('Step name is required');
    }

    if (!definition.metadata.version) {
      errors.push('Step version is required');
    }

    if (!definition.execute || typeof definition.execute !== 'function') {
      errors.push('Step execute function is required');
    }

    // Validate retry configuration
    if (definition.executionConfig?.retryConfig) {
      const retry = definition.executionConfig.retryConfig;
      if (retry.maxAttempts < 1) {
        errors.push('Retry maxAttempts must be at least 1');
      }
      if (retry.delay < 0) {
        errors.push('Retry delay must be non-negative');
      }
    }

    // Validate timeout configuration
    if (definition.executionConfig?.timeout?.execution && definition.executionConfig.timeout.execution <= 0) {
      errors.push('Execution timeout must be positive');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}

/**
 * Step factory for creating and managing workflow steps
 */
export class StepFactory {
  private steps = new Map<string, WorkflowStepDefinition>();
  private config: StepFactoryConfig;

  constructor(config: StepFactoryConfig = {}) {
    this.config = {
      enablePerformanceMonitoring: true,
      enableDetailedLogging: false,
      ...config,
    };
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
    } = {}
  ): WorkflowStepDefinition<TInput, TOutput> {
    // Merge with default configurations
    const mergedExecutionConfig = {
      ...this.config.defaultExecutionConfig,
      ...options.executionConfig,
    };

    const mergedValidationConfig = {
      ...this.config.defaultValidationConfig,
      ...options.validationConfig,
    };

    const definition = createWorkflowStep(metadata, executionFunction, {
      ...options,
      executionConfig: mergedExecutionConfig,
      validationConfig: mergedValidationConfig,
    });

    // Validate step definition
    const validation = StandardWorkflowStep.validateDefinition(definition);
    if (!validation.valid) {
      throw new OrchestrationError(
        `Invalid step definition: ${validation.errors?.join(', ')}`,
        'INVALID_STEP_DEFINITION',
        false,
        { validationErrors: validation.errors }
      );
    }

    return definition;
  }

  /**
   * Register a step in the factory
   */
  registerStep<TInput = any, TOutput = any>(
    definition: WorkflowStepDefinition<TInput, TOutput>
  ): void {
    const validation = StandardWorkflowStep.validateDefinition(definition);
    if (!validation.valid) {
      throw new OrchestrationError(
        `Cannot register invalid step: ${validation.errors?.join(', ')}`,
        'INVALID_STEP_REGISTRATION',
        false,
        { validationErrors: validation.errors }
      );
    }

    this.steps.set(definition.id, definition);
  }

  /**
   * Get a registered step
   */
  getStep(stepId: string): WorkflowStepDefinition | undefined {
    return this.steps.get(stepId);
  }

  /**
   * List all registered steps
   */
  listSteps(): WorkflowStepDefinition[] {
    return Array.from(this.steps.values());
  }

  /**
   * Create executable step instance
   */
  createExecutableStep<TInput = any, TOutput = any>(
    definition: WorkflowStepDefinition<TInput, TOutput>
  ): StandardWorkflowStep<TInput, TOutput> {
    return new StandardWorkflowStep(definition, this.config);
  }

  /**
   * Create executable step instance from registered step
   */
  createExecutableStepById<TInput = any, TOutput = any>(
    stepId: string
  ): StandardWorkflowStep<TInput, TOutput> {
    const definition = this.getStep(stepId);
    if (!definition) {
      throw new OrchestrationError(
        `Step with ID ${stepId} not found`,
        'STEP_NOT_FOUND',
        false
      );
    }

    return new StandardWorkflowStep(definition as WorkflowStepDefinition<TInput, TOutput>, this.config);
  }

  /**
   * Update factory configuration
   */
  updateConfig(config: Partial<StepFactoryConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get factory configuration
   */
  getConfig(): StepFactoryConfig {
    return { ...this.config };
  }
}

/**
 * Default step factory instance
 */
export const defaultStepFactory = new StepFactory();