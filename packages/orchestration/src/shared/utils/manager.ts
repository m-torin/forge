/**
 * Modern OrchestrationManager - Central management class for workflow orchestration
 * Uses ES2022+ features including private fields, nullish coalescing, and async generators
 */

import { createServerObservability } from '@repo/observability/shared-env';
import {
  StepCompositionConfig,
  StepExecutionPlan,
  StepSearchFilters,
  ValidationResult,
  WorkflowStepDefinition,
} from '../factories/index';
import { defaultStepFactory, type StepFactory } from '../factories/step-factory';
import { defaultStepRegistry, type StepRegistry } from '../factories/step-registry';
import {
  ListExecutionsOptions,
  ProviderHealthReport,
  WorkflowDefinition,
  WorkflowExecution,
  WorkflowProvider,
} from '../types/index';

import {
  createOrchestrationError,
  createProviderErrorWithCode,
  OrchestrationErrorCodes,
} from './errors';

export interface OrchestrationManagerConfig {
  /** Whether to auto-retry failed operations */
  autoRetry?: boolean;
  /** Default provider name to use for executions */
  defaultProvider?: string;
  /** Default retry configuration */
  defaultRetryConfig?: {
    backoff: 'exponential' | 'fixed' | 'linear';
    delay: number;
    maxAttempts: number;
  };
  /** Whether to enable health checks */
  enableHealthChecks?: boolean;
  /** Whether to enable metrics collection */
  enableMetrics?: boolean;
  /** Whether to enable step factory features */
  enableStepFactory?: boolean;
  /** Global timeout for operations */
  globalTimeout?: number;
  /** Health check interval in milliseconds */
  healthCheckInterval?: number;
  /** Maximum concurrent executions */
  maxConcurrentExecutions?: number;
  /** Step factory instance to use */
  stepFactory?: StepFactory;
  /** Step registry instance to use */
  stepRegistry?: StepRegistry;
}

export class OrchestrationManager {
  private abortController = new AbortController();
  private config: OrchestrationManagerConfig;
  private executionMetrics = new Map<
    string,
    { avgDuration: number; count: number; lastExecution: number }
  >();
  private healthCheckTimer?: NodeJS.Timeout;
  private isInitialized = false;
  // Private fields using conventional private syntax
  private providers = new Map<string, WorkflowProvider>();
  private stepFactory: StepFactory;
  private stepRegistry: StepRegistry;

  constructor(config: OrchestrationManagerConfig = {}) {
    this.config = {
      autoRetry: true,
      defaultRetryConfig: {
        backoff: 'exponential',
        delay: 1000,
        maxAttempts: 3,
      },
      enableHealthChecks: true,
      enableMetrics: true,
      enableStepFactory: true,
      globalTimeout: 300000, // 5 minutes
      healthCheckInterval: 60000, // 1 minute
      maxConcurrentExecutions: 100,
      ...config,
    };

    // Initialize step factory components (nullish coalescing)
    this.stepRegistry = config.stepRegistry ?? defaultStepRegistry;
    this.stepFactory = config.stepFactory ?? defaultStepFactory;
  }

  /**
   * Cancel a workflow execution
   */
  async cancelExecution(executionId: string, providerName?: string): Promise<boolean> {
    const provider = this.getProvider(providerName);

    try {
      return await provider.cancelExecution(executionId);
    } catch (error: any) {
      throw createProviderErrorWithCode(
        `Failed to cancel execution ${executionId}`,
        providerName || this.config.defaultProvider || 'unknown',
        provider.name,
        {
          code: OrchestrationErrorCodes.CANCEL_EXECUTION_ERROR,
          context: { executionId },
          originalError: error as Error,
          retryable: true,
        },
      );
    }
  }

  /**
   * Create execution plan for a set of steps
   */
  createStepExecutionPlan(
    stepIds: string[],
    config: StepCompositionConfig = {},
  ): StepExecutionPlan {
    if (!this.config.enableStepFactory) {
      throw createOrchestrationError('Step factory is not enabled', {
        code: OrchestrationErrorCodes.STEP_FACTORY_DISABLED,
        retryable: false,
      });
    }

    return this.stepRegistry.createExecutionPlan(stepIds, config);
  }

  /**
   * Execute a single step by ID
   */
  async executeStep<TInput = any, TOutput = any>(
    stepId: string,
    input: TInput,
    workflowExecutionId: string,
    previousStepsContext: Record<string, any> = {},
    metadata: Record<string, any> = {},
    abortSignal?: AbortSignal,
  ) {
    if (!this.config.enableStepFactory) {
      throw createOrchestrationError('Step factory is not enabled', {
        code: OrchestrationErrorCodes.STEP_FACTORY_DISABLED,
        retryable: false,
      });
    }

    const executableStep = this.stepRegistry.createExecutableStep<TInput, TOutput>(stepId);
    const startTime = Date.now();

    try {
      const result = await executableStep.execute(
        input,
        workflowExecutionId,
        previousStepsContext,
        metadata,
        abortSignal ?? this.abortController.signal, // Use manager's abort signal as fallback
      );

      // Track execution metrics if enabled
      if (this.config.enableMetrics) {
        this.updateExecutionMetrics(stepId, Date.now() - startTime);
      }

      return result;
    } catch (error: any) {
      // Track failed execution metrics
      if (this.config.enableMetrics) {
        this.updateExecutionMetrics(stepId, Date.now() - startTime, false);
      }

      throw error;
    }
  }

  /**
   * Execute a workflow using the specified or default provider
   */
  async executeWorkflow(
    definition: WorkflowDefinition,
    input?: Record<string, any>,
    providerName?: string,
  ): Promise<WorkflowExecution> {
    const provider = this.getProvider(providerName);

    try {
      return await provider.execute(definition, input);
    } catch (error: any) {
      throw createProviderErrorWithCode(
        `Failed to execute workflow ${definition.id}`,
        providerName ?? this.config.defaultProvider ?? 'unknown',
        provider.name,
        {
          code: OrchestrationErrorCodes.WORKFLOW_EXECUTION_ERROR,
          context: { workflowId: definition.id },
          originalError: error as Error,
          retryable: true,
        },
      );
    }
  }

  /**
   * Export step definitions
   */
  exportSteps() {
    if (!this.config.enableStepFactory) {
      return [];
    }

    return this.stepRegistry.export();
  }

  /**
   * Get workflow execution status
   */
  async getExecution(
    executionId: string,
    providerName?: string,
  ): Promise<null | WorkflowExecution> {
    const provider = this.getProvider(providerName);

    try {
      return await provider.getExecution(executionId);
    } catch (error: any) {
      throw createProviderErrorWithCode(
        `Failed to get execution ${executionId}`,
        providerName || this.config.defaultProvider || 'unknown',
        provider.name,
        {
          code: OrchestrationErrorCodes.GET_EXECUTION_ERROR,
          context: { executionId },
          originalError: error as Error,
          retryable: true,
        },
      );
    }
  }

  /**
   * Get a registered provider
   */
  getProvider(name?: string): WorkflowProvider {
    const providerName = name ?? this.config.defaultProvider; // nullish coalescing

    if (!providerName) {
      throw createOrchestrationError('No provider specified and no default provider configured', {
        code: OrchestrationErrorCodes.NO_PROVIDER_AVAILABLE,
        retryable: false,
      });
    }

    const provider = this.providers.get(providerName);
    if (!provider) {
      throw createProviderErrorWithCode(
        `Provider ${providerName} not found`,
        providerName,
        'unknown',
        {
          code: OrchestrationErrorCodes.PROVIDER_NOT_FOUND,
          retryable: false,
        },
      );
    }

    return provider;
  }

  /**
   * Get manager status
   */
  getStatus() {
    const stepRegistryStats = this.config.enableStepFactory ? this.stepRegistry.getStats() : null;

    return {
      abortController: this.abortController.signal.aborted ? 'aborted' : 'active',
      defaultProvider: this.config.defaultProvider,
      executionMetrics: this.config.enableMetrics
        ? Object.fromEntries(this.executionMetrics)
        : null,
      healthChecksEnabled: this.config.enableHealthChecks,
      initialized: this.isInitialized,
      metricsEnabled: this.config.enableMetrics,
      providerCount: this.providers.size,
      stepFactoryEnabled: this.config.enableStepFactory,
      stepRegistry: stepRegistryStats,
    };
  }

  /**
   * Get a registered step definition
   */
  getStep(stepId: string): undefined | WorkflowStepDefinition {
    if (!this.config.enableStepFactory) {
      return undefined;
    }

    return this.stepRegistry.get(stepId);
  }

  /**
   * Get available step categories
   */
  getStepCategories(): string[] {
    if (!this.config.enableStepFactory) {
      return [];
    }

    return this.stepRegistry.getCategories();
  }

  /**
   * Get step factory instance
   */
  getStepFactory(): StepFactory {
    return this.stepFactory;
  }

  /**
   * Get step registry instance
   */
  getStepRegistry(): StepRegistry {
    return this.stepRegistry;
  }

  /**
   * Get available step tags
   */
  getStepTags(): string[] {
    if (!this.config.enableStepFactory) {
      return [];
    }

    return this.stepRegistry.getTags();
  }

  /**
   * Get step usage statistics
   */
  getStepUsageStatistics() {
    if (!this.config.enableStepFactory) {
      return null;
    }

    return this.stepRegistry.getUsageStatistics();
  }

  // ===== STEP FACTORY METHODS =====

  /**
   * Health check all providers
   */
  async healthCheckAll(): Promise<ProviderHealthReport[]> {
    const reports: ProviderHealthReport[] = [];

    for (const [name, provider] of this.providers) {
      try {
        const startTime = Date.now();
        const health = await provider.healthCheck();
        const responseTime = Date.now() - startTime;

        reports.push({
          details: health.details,
          name,
          responseTime,
          status: health.status,
          timestamp: new Date(),
          type: provider.name,
        });
      } catch (error: any) {
        reports.push({
          error:
            error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error',
          name,
          responseTime: 0,
          status: 'unhealthy',
          timestamp: new Date(),
          type: provider.name,
        });
      }
    }

    return reports;
  }

  /**
   * Import step definitions
   */
  importSteps(
    data: {
      definition: WorkflowStepDefinition;
      metadata?: any;
    }[],
    overwrite = false,
  ) {
    if (!this.config.enableStepFactory) {
      throw createOrchestrationError('Step factory is not enabled', {
        code: OrchestrationErrorCodes.STEP_FACTORY_DISABLED,
        retryable: false,
      });
    }

    return this.stepRegistry.import(data, overwrite);
  }

  /**
   * Initialize the orchestration manager
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Start health checks if enabled (nullish coalescing)
      if (this.config.enableHealthChecks) {
        this.startHealthChecks();
      }

      // Initialize metrics collection if enabled
      if (this.config.enableMetrics) {
        this.initializeMetrics();
      }

      this.isInitialized = true;
    } catch (error: any) {
      throw createOrchestrationError('Failed to initialize orchestration manager', {
        code: OrchestrationErrorCodes.INITIALIZATION_ERROR,
        originalError: error as Error,
        retryable: false,
      });
    }
  }

  /**
   * List executions for a workflow
   */
  async listExecutions(
    workflowId: string,
    options?: ListExecutionsOptions,
    providerName?: string,
  ): Promise<WorkflowExecution[]> {
    const provider = this.getProvider(providerName);

    try {
      return await provider.listExecutions(workflowId, options);
    } catch (error: any) {
      throw createProviderErrorWithCode(
        `Failed to list executions for workflow ${workflowId}`,
        providerName || this.config.defaultProvider || 'unknown',
        provider.name,
        {
          code: OrchestrationErrorCodes.LIST_EXECUTIONS_ERROR,
          context: { workflowId },
          originalError: error as Error,
          retryable: true,
        },
      );
    }
  }

  /**
   * List all registered providers
   */
  listProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * List all registered steps
   */
  listSteps(activeOnly = true): WorkflowStepDefinition[] {
    if (!this.config.enableStepFactory) {
      return [];
    }

    return this.stepRegistry.list(activeOnly);
  }

  /**
   * Register a workflow provider
   */
  async registerProvider(name: string, provider: WorkflowProvider): Promise<void> {
    try {
      // Validate provider health
      const health = await provider.healthCheck();
      if (health.status === 'unhealthy') {
        throw createProviderErrorWithCode(
          `Provider ${name} failed health check`,
          name,
          provider.name,
          {
            code: OrchestrationErrorCodes.PROVIDER_UNHEALTHY,
            retryable: false,
          },
        );
      }

      this.providers.set(name, provider);

      // Set as default if this is the first provider (nullish coalescing)
      if (!this.config.defaultProvider && this.providers.size === 1) {
        this.config.defaultProvider = name;
      }
    } catch (error: any) {
      throw createProviderErrorWithCode(
        `Failed to register provider ${name}`,
        name,
        provider.name,
        {
          code: OrchestrationErrorCodes.PROVIDER_REGISTRATION_ERROR,
          originalError: error as Error,
          retryable: false,
        },
      );
    }
  }

  /**
   * Register a step definition in the step registry
   */
  registerStep<TInput = any, TOutput = any>(
    definition: WorkflowStepDefinition<TInput, TOutput>,
    registeredBy?: string,
  ): void {
    if (!this.config.enableStepFactory) {
      throw createOrchestrationError('Step factory is not enabled', {
        code: OrchestrationErrorCodes.STEP_FACTORY_DISABLED,
        retryable: false,
      });
    }

    this.stepRegistry.register(definition, registeredBy);
  }

  /**
   * Schedule a workflow
   */
  async scheduleWorkflow(definition: WorkflowDefinition, providerName?: string): Promise<string> {
    const provider = this.getProvider(providerName);

    try {
      return await provider.scheduleWorkflow(definition);
    } catch (error: any) {
      throw createProviderErrorWithCode(
        `Failed to schedule workflow ${definition.id}`,
        providerName || this.config.defaultProvider || 'unknown',
        provider.name,
        {
          code: OrchestrationErrorCodes.SCHEDULE_WORKFLOW_ERROR,
          context: { workflowId: definition.id },
          originalError: error as Error,
          retryable: true,
        },
      );
    }
  }

  /**
   * Search for steps based on filters
   */
  searchSteps(filters: StepSearchFilters = {}): WorkflowStepDefinition[] {
    if (!this.config.enableStepFactory) {
      return [];
    }

    return this.stepRegistry.search(filters);
  }

  /**
   * Shutdown the orchestration manager
   */
  async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      // Abort any ongoing operations
      this.abortController.abort();

      // Stop health checks
      if (this.healthCheckTimer) {
        clearInterval(this.healthCheckTimer);
        this.healthCheckTimer = undefined;
      }

      // Cleanup all providers
      const cleanupPromises: Promise<void>[] = [];
      for (const [name, provider] of this.providers) {
        // Check if provider has cleanup method
        if ('cleanup' in provider && typeof provider.cleanup === 'function') {
          cleanupPromises.push(
            (async () => {
              try {
                await provider.cleanup?.();
              } catch (error: any) {
                // Fire and forget logging
                (async () => {
                  try {
                    const logger = await createServerObservability({
                      providers: {
                        console: { enabled: true },
                      },
                    });
                    logger.log('error', `Failed to cleanup provider ${name}`, error);
                  } catch {
                    // Fallback to console if logger fails
                  }
                })();
              }
            })(),
          );
        }
      }

      // Wait for all cleanup operations to complete
      await Promise.allSettled(cleanupPromises);

      // Clear providers and metrics
      this.providers.clear();
      this.executionMetrics.clear();
      this.isInitialized = false;
    } catch (error: any) {
      throw createOrchestrationError('Failed to shutdown orchestration manager', {
        code: OrchestrationErrorCodes.SHUTDOWN_ERROR,
        originalError: error as Error,
        retryable: false,
      });
    }
  }

  /**
   * Unregister a workflow provider
   */
  async unregisterProvider(name: string): Promise<void> {
    if (!this.providers.has(name)) {
      throw createProviderErrorWithCode(`Provider ${name} not found`, name, 'unknown', {
        code: OrchestrationErrorCodes.PROVIDER_NOT_FOUND,
        retryable: false,
      });
    }

    this.providers.delete(name);

    // Update default provider if needed (using .at(0) ES2022+ method)
    if (this.config.defaultProvider === name) {
      const remainingProviders = Array.from(this.providers.keys());
      this.config.defaultProvider = remainingProviders.at(0); // ES2022+ .at() method
    }
  }

  /**
   * Unschedule a workflow
   */
  async unscheduleWorkflow(workflowId: string, providerName?: string): Promise<boolean> {
    const provider = this.getProvider(providerName);

    try {
      return await provider.unscheduleWorkflow(workflowId);
    } catch (error: any) {
      throw createProviderErrorWithCode(
        `Failed to unschedule workflow ${workflowId}`,
        providerName || this.config.defaultProvider || 'unknown',
        provider.name,
        {
          code: OrchestrationErrorCodes.UNSCHEDULE_WORKFLOW_ERROR,
          context: { workflowId },
          originalError: error as Error,
          retryable: true,
        },
      );
    }
  }

  /**
   * Validate step dependencies
   */
  validateStepDependencies(stepIds: string[]): ValidationResult {
    if (!this.config.enableStepFactory) {
      return { errors: ['Step factory is not enabled'], valid: false };
    }

    return this.stepRegistry.validateDependencies(stepIds);
  }

  /**
   * Initialize metrics collection
   */
  private initializeMetrics(): void {
    // Initialize metrics collection system
    this.executionMetrics.clear();
  }

  /**
   * Start periodic health checks
   */
  private startHealthChecks(): void {
    if (this.healthCheckTimer) {
      return;
    }

    this.healthCheckTimer = setInterval(async () => {
      try {
        await this.healthCheckAll();
      } catch (error: any) {
        // Fire and forget logging
        (async () => {
          try {
            const logger = await createServerObservability({
              providers: {
                console: { enabled: true },
              },
            });
            logger.log('warn', 'Health check failed', error);
          } catch {
            // Fallback to console if logger fails
          }
        })();
      }
    }, this.config.healthCheckInterval);
  }

  /**
   * Update execution metrics
   */
  private updateExecutionMetrics(stepId: string, duration: number, _success = true): void {
    const existing = this.executionMetrics.get(stepId) || {
      avgDuration: 0,
      count: 0,
      lastExecution: 0,
    };

    existing.count += 1;
    existing.lastExecution = Date.now();
    existing.avgDuration =
      (existing.avgDuration * (existing.count - 1) + duration) / existing.count;

    this.executionMetrics.set(stepId, existing);
  }
}
