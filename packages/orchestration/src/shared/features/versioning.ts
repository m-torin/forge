/**
 * Workflow Versioning & Composition
 * Advanced workflow management with versioning and composition utilities
 */

import { randomUUID } from 'crypto';

import { WorkflowDefinition, WorkflowExecution, WorkflowProvider } from '../types/index';

interface BulkOperation {
  /** Completion timestamp */
  completedAt?: Date;
  /** Operation configuration */
  config: {
    /** Delay between batches */
    batchDelay?: number;
    /** Batch size */
    batchSize?: number;
    /** Maximum concurrent operations */
    concurrency?: number;
    /** Error handling */
    errorHandling: 'continue' | 'fail-fast' | 'retry';
    /** Timeout for entire operation */
    timeout?: number;
  };
  /** Operation ID */
  id: string;
  /** Overall progress */
  progress: {
    cancelled: number;
    completed: number;
    failed: number;
    total: number;
  };
  /** Results from individual operations */
  results: {
    duration?: number;
    error?: string;
    result?: unknown;
    status: 'cancelled' | 'failed' | 'success';
    workflowId: string;
  }[];
  /** Start timestamp */
  startedAt?: Date;
  /** Operation status */
  status: 'cancelled' | 'completed' | 'failed' | 'pending' | 'running';
  /** Target workflows */
  targets: {
    input?: unknown;
    options?: Record<string, unknown>;
    version?: string;
    workflowId: string;
  }[];
  /** Operation type */
  type: 'cancel' | 'delete' | 'execute' | 'retry' | 'schedule';
}

interface CompositionContext {
  /** Composition execution ID */
  compositionId: string;
  /** Current workflow being executed */
  currentWorkflow?: string;
  /** Execution ID */
  executionId: string;
  /** Get result from a workflow */
  getResult: (alias: string) => unknown;
  /** Input data */
  input: unknown;
  /** Results from completed workflows */
  results: Record<string, unknown>;
  /** Set result for a workflow */
  setResult: (alias: string, result: unknown) => void;
}

interface WorkflowComposition {
  /** Description */
  description?: string;
  /** Error handling strategy */
  errorHandling: 'continue' | 'fail-fast' | 'retry';
  /** Composition identifier */
  id: string;
  /** Composition metadata */
  metadata?: Record<string, unknown>;
  /** Composition name */
  name: string;
  /** Retry configuration */
  retry?: {
    delay: number;
    maxAttempts: number;
    strategy: 'exponential' | 'linear';
  };
  /** Composition execution strategy */
  strategy: 'conditional' | 'custom' | 'parallel' | 'sequential';
  /** Child workflows */
  workflows: {
    /** Alias for this workflow in the composition */
    alias?: string;
    /** Conditional execution */
    condition?: (context: CompositionContext) => boolean;
    /** Parallel execution group */
    group?: string;
    /** Input mapping from composition input */
    inputMapping?: Record<string, string>;
    /** Execution order/priority */
    order?: number;
    /** Output mapping to composition output */
    outputMapping?: Record<string, string>;
    /** Workflow version (optional, uses latest if not specified) */
    version?: string;
    /** Workflow ID */
    workflowId: string;
  }[];
}

interface WorkflowVersion {
  /** Compatibility information */
  compatibility?: {
    /** Breaking changes */
    breakingChanges?: string[];
    /** Maximum compatible version */
    maxVersion?: string;
    /** Minimum compatible version */
    minVersion?: string;
  };
  /** Creation timestamp */
  createdAt: Date;
  /** User who created this version */
  createdBy?: string;
  /** Workflow definition for this version */
  definition: WorkflowDefinition;
  /** Version description/changelog */
  description?: string;
  /** Version metadata */
  metadata?: Record<string, unknown>;
  /** Migration instructions from previous version */
  migration?: {
    automaticMigration?: boolean;
    fromVersion: string;
    instructions: string;
    migrationScript?: (oldData: unknown) => unknown;
  };
  /** Version status */
  status: 'active' | 'archived' | 'deprecated' | 'draft';
  /** Version identifier (semantic version) */
  version: string;
}

class BulkOperationManager {
  private operations = new Map<string, BulkOperation>();
  private provider: WorkflowProvider;

  constructor(provider: WorkflowProvider) {
    this.provider = provider;
  }

  /**
   * Cancel bulk operation
   */
  async cancelBulkOperation(operationId: string): Promise<void> {
    const operation = this.operations.get(operationId);
    if (!operation) {
      throw new Error(`Bulk operation ${operationId} not found`);
    }

    operation.status = 'cancelled';
  }

  /**
   * Execute bulk operation
   */
  async executeBulkOperation(
    operation: Omit<BulkOperation, 'id' | 'progress' | 'results' | 'status'>,
  ): Promise<string> {
    const operationId = this.generateOperationId();

    const bulkOp: BulkOperation = {
      ...operation,
      id: operationId,
      progress: {
        cancelled: 0,
        completed: 0,
        failed: 0,
        total: operation.targets.length,
      },
      results: [],
      status: 'pending',
    };

    this.operations.set(operationId, bulkOp);

    // Start operation asynchronously
    this.runBulkOperation(bulkOp);

    return operationId;
  }

  /**
   * Get bulk operation status
   */
  getBulkOperation(operationId: string): BulkOperation | undefined {
    return this.operations.get(operationId);
  }

  // Private methods

  private generateOperationId(): string {
    return `bulk_${Date.now()}_${randomUUID()}`;
  }

  private async getWorkflowDefinition(workflowId: string): Promise<WorkflowDefinition> {
    if (this.provider.getWorkflow) {
      const definition = await this.provider.getWorkflow(workflowId);
      if (!definition) {
        throw new Error(`Workflow ${workflowId} not found`);
      }
      return definition;
    }
    throw new Error('Provider does not support getWorkflow method');
  }

  private async runBulkOperation(operation: BulkOperation): Promise<void> {
    operation.status = 'running';
    operation.startedAt = new Date();

    const { batchDelay = 0, batchSize = 10, concurrency = 5 } = operation.config;

    try {
      // Process targets in batches
      for (let i = 0; i < operation.targets.length; i += batchSize) {
        if ((operation.status as string) === 'cancelled') {
          break;
        }

        const batch = operation.targets.slice(i, i + batchSize);

        // Process batch with concurrency limit
        const batchPromises = batch.map(async target => {
          if ((operation.status as string) === 'cancelled') {
            return;
          }

          const startTime = Date.now();

          try {
            let result: unknown;

            switch (operation.type) {
              case 'cancel':
                if (target.options?.executionId) {
                  await this.provider.cancelExecution(target.options.executionId as string);
                }
                break;
              case 'execute':
                result = await (this.provider.executeWorkflow
                  ? this.provider.executeWorkflow(target.workflowId, target.input)
                  : this.provider.execute(
                      await this.getWorkflowDefinition(target.workflowId),
                      target.input as Record<string, any>,
                    ));
                break;
              default:
                throw new Error(`Unsupported operation type: ${operation.type}`);
            }

            const duration = Date.now() - startTime;

            operation.results.push({
              duration,
              result,
              status: 'success',
              workflowId: target.workflowId,
            });

            operation.progress.completed++;
          } catch (error: any) {
            const duration = Date.now() - startTime;

            operation.results.push({
              duration,
              error:
                error instanceof Error
                  ? (error as Error)?.message || 'Unknown error'
                  : String(error),
              status: 'failed',
              workflowId: target.workflowId,
            });

            operation.progress.failed++;

            if (operation.config.errorHandling === 'fail-fast') {
              operation.status = 'failed';
              return;
            }
          }
        });

        // Limit concurrency
        const concurrentBatches: any[] = [];
        for (let j = 0; j < batchPromises.length; j += concurrency) {
          concurrentBatches.push(Promise.all(batchPromises.slice(j, j + concurrency)));
        }

        await Promise.all(concurrentBatches);

        // Delay between batches if configured
        if (batchDelay > 0 && i + batchSize < operation.targets.length) {
          await new Promise(resolve => setTimeout(resolve, batchDelay));
        }
      }

      if (operation.status === 'running') {
        operation.status = 'completed';
      }
    } catch (_error: any) {
      operation.status = 'failed';
    } finally {
      operation.completedAt = new Date();
    }
  }
}

class WorkflowComposer {
  private compositions = new Map<string, WorkflowComposition>();
  private provider: WorkflowProvider;
  private versionManager: WorkflowVersionManager;

  constructor(provider: WorkflowProvider, versionManager: WorkflowVersionManager) {
    this.provider = provider;
    this.versionManager = versionManager;
  }

  /**
   * Create a workflow composition
   */
  createComposition(composition: WorkflowComposition): void {
    this.compositions.set(composition.id, composition);
  }

  /**
   * Execute a workflow composition
   */
  async executeComposition(
    compositionId: string,
    input: unknown,
    _metadata?: Record<string, unknown>,
  ): Promise<string> {
    const composition = this.compositions.get(compositionId);
    if (!composition) {
      throw new Error(`Composition ${compositionId} not found`);
    }

    const executionId = this.generateExecutionId();

    const context: CompositionContext = {
      compositionId,
      executionId,
      getResult: (alias: string) => {
        return context.results[alias];
      },
      input,
      results: {},
      setResult: (alias: string, result: unknown) => {
        context.results[alias] = result;
      },
    };

    // Execute composition asynchronously
    this.runComposition(composition, context);

    return executionId;
  }

  // Private methods

  private async executeConditional(
    composition: WorkflowComposition,
    context: CompositionContext,
  ): Promise<void> {
    for (const workflow of composition.workflows) {
      if (workflow.condition?.(context)) {
        context.currentWorkflow = workflow.alias || workflow.workflowId;

        const input = this.mapInput(workflow.inputMapping, context.input);
        const executionId = await (this.provider.executeWorkflow
          ? this.provider.executeWorkflow(workflow.workflowId, input)
          : this.provider.execute(
              await this.getWorkflowDefinition(workflow.workflowId),
              input as Record<string, any>,
            ));

        const result = await this.waitForCompletion(executionId);
        const mappedResult = this.mapOutput(workflow.outputMapping, result);

        context.setResult(workflow.alias || workflow.workflowId, mappedResult);

        // Execute only the first matching condition
        break;
      }
    }
  }

  private async executeParallel(
    composition: WorkflowComposition,
    context: CompositionContext,
  ): Promise<void> {
    const eligibleWorkflows = composition.workflows.filter(
      w => !w.condition || w.condition(context),
    );

    const executionPromises = eligibleWorkflows.map(async workflow => {
      context.currentWorkflow = workflow.alias || workflow.workflowId;

      const input = this.mapInput(workflow.inputMapping, context.input);
      const executionId = await (this.provider.executeWorkflow
        ? this.provider.executeWorkflow(workflow.workflowId, input)
        : this.provider.execute(
            await this.getWorkflowDefinition(workflow.workflowId),
            input as Record<string, any>,
          ));

      const result = await this.waitForCompletion(executionId);
      const mappedResult = this.mapOutput(workflow.outputMapping, result);

      return {
        alias: workflow.alias || workflow.workflowId,
        result: mappedResult,
      };
    });

    const results = await Promise.all(executionPromises);

    for (const { alias, result } of results) {
      context.setResult(alias, result);
    }
  }

  private async executeSequential(
    composition: WorkflowComposition,
    context: CompositionContext,
  ): Promise<void> {
    const orderedWorkflows = composition.workflows.sort((a, b) => (a.order || 0) - (b.order || 0));

    for (const workflow of orderedWorkflows) {
      if (workflow.condition && !workflow.condition(context)) {
        continue;
      }

      context.currentWorkflow = workflow.alias || workflow.workflowId;

      const input = this.mapInput(workflow.inputMapping, context.input);
      const executionId = await (this.provider.executeWorkflow
        ? this.provider.executeWorkflow(workflow.workflowId, input)
        : this.provider.execute(
            await this.getWorkflowDefinition(workflow.workflowId),
            input as Record<string, any>,
          ));

      // Wait for completion and get result
      const result = await this.waitForCompletion(executionId);
      const mappedResult = this.mapOutput(workflow.outputMapping, result);

      context.setResult(workflow.alias || workflow.workflowId, mappedResult);
    }
  }

  private generateExecutionId(): string {
    return `composition_${Date.now()}_${randomUUID()}`;
  }

  private async getWorkflowDefinition(workflowId: string): Promise<WorkflowDefinition> {
    if (this.provider.getWorkflow) {
      const definition = await this.provider.getWorkflow(workflowId);
      if (!definition) {
        throw new Error(`Workflow ${workflowId} not found`);
      }
      return definition;
    }
    throw new Error('Provider does not support getWorkflow method');
  }

  private mapInput(mapping: Record<string, string> | undefined, input: unknown): unknown {
    if (!mapping || typeof input !== 'object' || input === null) {
      return input;
    }

    const mapped: Record<string, unknown> = {};
    const inputObj = input as Record<string, unknown>;

    for (const [targetKey, sourceKey] of Object.entries(mapping)) {
      mapped[targetKey] = inputObj[sourceKey];
    }

    return mapped;
  }

  private mapOutput(mapping: Record<string, string> | undefined, output: unknown): unknown {
    if (!mapping || typeof output !== 'object' || output === null) {
      return output;
    }

    const mapped: Record<string, unknown> = {};
    const outputObj = output as Record<string, unknown>;

    for (const [targetKey, sourceKey] of Object.entries(mapping)) {
      mapped[targetKey] = outputObj[sourceKey];
    }

    return mapped;
  }

  private async runComposition(
    composition: WorkflowComposition,
    context: CompositionContext,
  ): Promise<void> {
    try {
      switch (composition.strategy) {
        case 'conditional':
          await this.executeConditional(composition, context);
          break;
        case 'custom':
          // Custom execution logic would be implemented here
          break;
        case 'parallel':
          await this.executeParallel(composition, context);
          break;
        case 'sequential':
          await this.executeSequential(composition, context);
          break;
      }
    } catch (error: any) {
      if (composition.errorHandling === 'fail-fast') {
        throw error;
      }
      // Handle other error strategies
    }
  }

  private async waitForCompletion(executionId: string | WorkflowExecution): Promise<unknown> {
    if (typeof executionId === 'string') {
      // Poll for execution completion
      let execution = await this.provider.getExecution(executionId);
      while (execution && ['pending', 'running'].includes(execution.status)) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        execution = await this.provider.getExecution(executionId);
      }
      return execution?.output || {};
    } else {
      // If it's already an execution object, wait for it to complete
      return executionId.output || {};
    }
  }
}

class WorkflowVersionManager {
  private provider: WorkflowProvider;
  private versions = new Map<string, WorkflowVersion[]>();

  constructor(provider: WorkflowProvider) {
    this.provider = provider;
  }

  /**
   * Activate a version
   */
  async activateVersion(workflowId: string, version: string): Promise<void> {
    const versions = this.versions.get(workflowId);
    if (!versions) {
      throw new Error(`No versions found for workflow ${workflowId}`);
    }

    const targetVersion = versions.find((v: any) => v.version === version);
    if (!targetVersion) {
      throw new Error(`Version ${version} not found for workflow ${workflowId}`);
    }

    // Deactivate current active versions
    versions.forEach(v => {
      if (v.status === 'active') {
        v.status = 'deprecated';
      }
    });

    // Activate target version
    targetVersion.status = 'active';
  }

  /**
   * Archive a version
   */
  async archiveVersion(workflowId: string, version: string): Promise<void> {
    const workflowVersion = this.getVersion(workflowId, version);
    if (!workflowVersion) {
      throw new Error(`Version ${version} not found for workflow ${workflowId}`);
    }

    if (workflowVersion.status === 'active') {
      throw new Error('Cannot archive active version');
    }

    workflowVersion.status = 'archived';
  }

  /**
   * Create a new workflow version
   */
  async createVersion(
    workflowId: string,
    definition: WorkflowDefinition,
    version: string,
    options?: {
      compatibility?: WorkflowVersion['compatibility'];
      createdBy?: string;
      description?: string;
      metadata?: Record<string, unknown>;
      migration?: WorkflowVersion['migration'];
    },
  ): Promise<void> {
    // Validate version format
    if (!this.isValidVersion(version)) {
      throw new Error(`Invalid version format: ${version}`);
    }

    const versions = this.versions.get(workflowId) || [];

    // Check if version already exists
    if (versions.some(v => v.version === version)) {
      throw new Error(`Version ${version} already exists for workflow ${workflowId}`);
    }

    const workflowVersion: WorkflowVersion = {
      createdAt: new Date(),
      definition,
      status: 'draft',
      version,
      ...options,
    };

    versions.push(workflowVersion);
    versions.sort((a, b) => this.compareVersions(a.version, b.version));

    this.versions.set(workflowId, versions);
  }

  /**
   * Deprecate a version
   */
  async deprecateVersion(workflowId: string, version: string): Promise<void> {
    const workflowVersion = this.getVersion(workflowId, version);
    if (!workflowVersion) {
      throw new Error(`Version ${version} not found for workflow ${workflowId}`);
    }

    workflowVersion.status = 'deprecated';
  }

  /**
   * Get migration path between versions
   */
  getMigrationPath(workflowId: string, fromVersion: string, toVersion: string): WorkflowVersion[] {
    const versions = this.versions.get(workflowId);
    if (!versions) {
      return [];
    }

    const fromIndex = versions.findIndex(v => v.version === fromVersion);
    const toIndex = versions.findIndex(v => v.version === toVersion);

    if (fromIndex === -1 || toIndex === -1) {
      return [];
    }

    if (fromIndex < toIndex) {
      // Forward migration
      return versions.slice(fromIndex + 1, toIndex + 1);
    } else {
      // Backward migration (not typically supported)
      return [];
    }
  }

  /**
   * Get workflow version
   */
  getVersion(workflowId: string, version?: string): undefined | WorkflowVersion {
    const versions = this.versions.get(workflowId);
    if (!versions || versions.length === 0) {
      return undefined;
    }

    if (!version) {
      // Return latest active version
      return (
        versions
          .filter(v => v.status === 'active')
          .sort((a, b) => this.compareVersions(b.version, a.version))[0] ||
        versions[versions.length - 1]
      );
    }

    return versions.find(v => v.version === version);
  }

  /**
   * Check version compatibility
   */
  isCompatible(workflowId: string, version1: string, version2: string): boolean {
    const v1 = this.getVersion(workflowId, version1);
    const v2 = this.getVersion(workflowId, version2);

    if (!v1 || !v2) {
      return false;
    }

    const compat1 = v1.compatibility;
    const compat2 = v2.compatibility;

    if (compat1?.minVersion && this.compareVersions(version2, compat1.minVersion) < 0) {
      return false;
    }

    if (compat1?.maxVersion && this.compareVersions(version2, compat1.maxVersion) > 0) {
      return false;
    }

    if (compat2?.minVersion && this.compareVersions(version1, compat2.minVersion) < 0) {
      return false;
    }

    if (compat2?.maxVersion && this.compareVersions(version1, compat2.maxVersion) > 0) {
      return false;
    }

    return true;
  }

  /**
   * List all versions for a workflow
   */
  listVersions(workflowId: string): WorkflowVersion[] {
    return this.versions.get(workflowId) || [];
  }

  // Private methods

  private compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);

    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;

      if (v1Part > v2Part) return 1;
      if (v1Part < v2Part) return -1;
    }

    return 0;
  }

  private isValidVersion(version: string): boolean {
    // Simple semantic version validation (major.minor.patch)
    return /^\d+\.\d+\.\d+$/.test(version);
  }
}

/**
 * Create bulk operation manager
 */
function createBulkOperationManager(provider: WorkflowProvider): BulkOperationManager {
  return new BulkOperationManager(provider);
}

/**
 * Create workflow composer
 */
function createWorkflowComposer(
  provider: WorkflowProvider,
  versionManager: WorkflowVersionManager,
): WorkflowComposer {
  return new WorkflowComposer(provider, versionManager);
}

/**
 * Create workflow version manager
 */
function createWorkflowVersionManager(provider: WorkflowProvider): WorkflowVersionManager {
  return new WorkflowVersionManager(provider);
}
