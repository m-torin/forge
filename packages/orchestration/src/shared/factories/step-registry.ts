/**
 * Step Registry System
 *
 * Centralized registry for workflow step definitions, templates, and discovery.
 * Provides step validation, composition utilities, and lifecycle management.
 */

import { nanoid } from 'nanoid';
import { z } from 'zod';
import { OrchestrationError } from '../utils/errors';
import {
  type WorkflowStepDefinition,
  type StepMetadata,
  type ValidationResult,
  StandardWorkflowStep,
  StepFactory,
} from './step-factory';
import { StepTemplates, type StepTemplateType } from './step-templates';

/**
 * Step registry entry with additional metadata
 */
export interface StepRegistryEntry<TInput = any, TOutput = any> {
  /** Step definition */
  definition: WorkflowStepDefinition<TInput, TOutput>;
  /** When the step was registered */
  registeredAt: Date;
  /** Who registered the step */
  registeredBy?: string;
  /** Number of times this step has been used */
  usageCount: number;
  /** Last time this step was used */
  lastUsedAt?: Date;
  /** Whether the step is currently active */
  active: boolean;
  /** Step validation status */
  validated: boolean;
  /** Validation result details */
  validationResult?: ValidationResult;
}

/**
 * Step search filters
 */
export interface StepSearchFilters {
  /** Filter by category */
  category?: string;
  /** Filter by tags (all must match) */
  tags?: string[];
  /** Filter by name pattern */
  namePattern?: string;
  /** Filter by version */
  version?: string;
  /** Filter by author */
  author?: string;
  /** Include deprecated steps */
  includeDeprecated?: boolean;
  /** Only active steps */
  activeOnly?: boolean;
  /** Only validated steps */
  validatedOnly?: boolean;
}

/**
 * Step composition configuration
 */
export interface StepCompositionConfig {
  /** Whether to validate dependencies */
  validateDependencies?: boolean;
  /** Whether to optimize execution order */
  optimizeOrder?: boolean;
  /** Whether to detect cycles */
  detectCycles?: boolean;
  /** Maximum composition depth */
  maxDepth?: number;
}

/**
 * Step dependency graph node
 */
export interface StepDependencyNode {
  /** Step ID */
  stepId: string;
  /** Step definition */
  definition: WorkflowStepDefinition;
  /** Direct dependencies */
  dependencies: string[];
  /** Steps that depend on this step */
  dependents: string[];
  /** Depth in dependency graph */
  depth: number;
}

/**
 * Step execution plan
 */
export interface StepExecutionPlan {
  /** Execution order (topologically sorted) */
  executionOrder: string[];
  /** Parallel execution groups */
  parallelGroups: string[][];
  /** Dependency graph */
  dependencyGraph: Map<string, StepDependencyNode>;
  /** Total estimated execution time */
  estimatedDuration?: number;
  /** Warnings or issues */
  warnings: string[];
}

/**
 * Centralized registry for workflow steps
 */
export class StepRegistry {
  private steps = new Map<string, StepRegistryEntry>();
  private factory: StepFactory;
  private categories = new Set<string>();
  private tags = new Set<string>();

  constructor(factory?: StepFactory) {
    this.factory = factory || new StepFactory();
  }

  /**
   * Register a step definition
   */
  register<TInput = any, TOutput = any>(
    definition: WorkflowStepDefinition<TInput, TOutput>,
    registeredBy?: string,
  ): void {
    // Validate step definition
    const validationResult = StandardWorkflowStep.validateDefinition(definition);

    if (!validationResult.valid) {
      throw new OrchestrationError(
        `Cannot register invalid step: ${validationResult.errors?.join(', ')}`,
        'INVALID_STEP_REGISTRATION',
        false,
        { stepId: definition.id, validationErrors: validationResult.errors },
      );
    }

    // Check for duplicate step ID
    if (this.steps.has(definition.id)) {
      throw new OrchestrationError(
        `Step with ID ${definition.id} is already registered`,
        'DUPLICATE_STEP_ID',
        false,
        { stepId: definition.id },
      );
    }

    // Create registry entry
    const entry: StepRegistryEntry<TInput, TOutput> = {
      definition,
      registeredAt: new Date(),
      registeredBy,
      usageCount: 0,
      active: true,
      validated: validationResult.valid,
      validationResult,
    };

    // Update collections
    this.steps.set(definition.id, entry);

    if (definition.metadata.category) {
      this.categories.add(definition.metadata.category);
    }

    if (definition.metadata.tags) {
      definition.metadata.tags.forEach((tag) => this.tags.add(tag));
    }

    // Register with factory as well
    this.factory.registerStep(definition);
  }

  /**
   * Register a step from template
   */
  registerFromTemplate<TInput = any, TOutput = any>(
    templateType: StepTemplateType,
    name: string,
    description?: string,
    customConfig?: any,
    registeredBy?: string,
  ): WorkflowStepDefinition<TInput, TOutput> {
    const template = StepTemplates[templateType];

    // Only allow template creation functions, not utility functions
    const allowedTemplates = [
      'http',
      'database',
      'file',
      'notification',
      'transformation',
      'conditional',
      'delay',
      'batch',
      'mapReduce',
    ];
    if (!allowedTemplates.includes(templateType)) {
      throw new OrchestrationError(
        'INVALID_TEMPLATE_TYPE',
        `Template ${templateType} is not a step creation template`,
      );
    }

    if (typeof template !== 'function') {
      throw new OrchestrationError(
        'TEMPLATE_NOT_CALLABLE',
        `Template ${templateType} is not a function`,
      );
    }

    const definition = (template as any)(name, description, customConfig) as WorkflowStepDefinition<
      TInput,
      TOutput
    >;

    this.register(definition, registeredBy);
    return definition;
  }

  /**
   * Unregister a step
   */
  unregister(stepId: string): boolean {
    const entry = this.steps.get(stepId);
    if (!entry) {
      return false;
    }

    // Mark as inactive instead of removing to preserve history
    entry.active = false;
    return true;
  }

  /**
   * Get a registered step
   */
  get(stepId: string): WorkflowStepDefinition | undefined {
    const entry = this.steps.get(stepId);
    return entry?.active ? entry.definition : undefined;
  }

  /**
   * Get step registry entry
   */
  getEntry(stepId: string): StepRegistryEntry | undefined {
    return this.steps.get(stepId);
  }

  /**
   * Search for steps based on filters
   */
  search(filters: StepSearchFilters = {}): WorkflowStepDefinition[] {
    const results: WorkflowStepDefinition[] = [];

    for (const [stepId, entry] of this.steps) {
      // Skip inactive steps unless specifically requested
      if (!entry.active && filters.activeOnly !== false) {
        continue;
      }

      // Skip unvalidated steps if requested
      if (filters.validatedOnly && !entry.validated) {
        continue;
      }

      const metadata = entry.definition.metadata;

      // Skip deprecated steps unless requested
      if (metadata.deprecated && !filters.includeDeprecated) {
        continue;
      }

      // Filter by category
      if (filters.category && metadata.category !== filters.category) {
        continue;
      }

      // Filter by tags (all must match)
      if (filters.tags && filters.tags.length > 0) {
        const stepTags = metadata.tags || [];
        if (!filters.tags.every((tag) => stepTags.includes(tag))) {
          continue;
        }
      }

      // Filter by name pattern
      if (filters.namePattern) {
        const pattern = new RegExp(filters.namePattern, 'i');
        if (!pattern.test(metadata.name)) {
          continue;
        }
      }

      // Filter by version
      if (filters.version && metadata.version !== filters.version) {
        continue;
      }

      // Filter by author
      if (filters.author && metadata.author !== filters.author) {
        continue;
      }

      results.push(entry.definition);
    }

    return results;
  }

  /**
   * List all registered steps
   */
  list(activeOnly = true): WorkflowStepDefinition[] {
    const results: WorkflowStepDefinition[] = [];

    for (const entry of this.steps.values()) {
      if (!activeOnly || entry.active) {
        results.push(entry.definition);
      }
    }

    return results;
  }

  /**
   * Get all available categories
   */
  getCategories(): string[] {
    return Array.from(this.categories).sort();
  }

  /**
   * Get all available tags
   */
  getTags(): string[] {
    return Array.from(this.tags).sort();
  }

  /**
   * Create executable step instance
   */
  createExecutableStep<TInput = any, TOutput = any>(
    stepId: string,
  ): StandardWorkflowStep<TInput, TOutput> {
    const definition = this.get(stepId);
    if (!definition) {
      throw new OrchestrationError(
        `Step with ID ${stepId} not found or inactive`,
        'STEP_NOT_FOUND',
        false,
        { stepId },
      );
    }

    // Increment usage count
    const entry = this.steps.get(stepId);
    if (entry) {
      entry.usageCount++;
      entry.lastUsedAt = new Date();
    }

    return this.factory.createExecutableStep(definition as WorkflowStepDefinition<TInput, TOutput>);
  }

  /**
   * Validate step dependencies
   */
  validateDependencies(stepIds: string[]): ValidationResult {
    const errors: string[] = [];
    const visited = new Set<string>();

    for (const stepId of stepIds) {
      const step = this.get(stepId);
      if (!step) {
        errors.push(`Step ${stepId} not found`);
        continue;
      }

      // Check dependencies
      if (step.dependencies) {
        for (const depId of step.dependencies) {
          if (!this.get(depId)) {
            errors.push(`Step ${depId} not found`);
          }
        }
      }

      // Check for circular dependencies
      if (this.hasCyclicDependencies(stepId, visited, new Set())) {
        errors.push(`Circular dependency detected for step ${stepId}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Create execution plan for a set of steps
   */
  createExecutionPlan(stepIds: string[], config: StepCompositionConfig = {}): StepExecutionPlan {
    const {
      validateDependencies = true,
      optimizeOrder = true,
      detectCycles = true,
      maxDepth = 10,
    } = config;

    const warnings: string[] = [];
    const dependencyGraph = new Map<string, StepDependencyNode>();

    // Build dependency graph
    for (const stepId of stepIds) {
      const definition = this.get(stepId);
      if (!definition) {
        warnings.push(`Step ${stepId} not found, skipping`);
        continue;
      }

      const dependencies = definition.dependencies || [];
      const node: StepDependencyNode = {
        stepId,
        definition,
        dependencies,
        dependents: [],
        depth: 0,
      };

      dependencyGraph.set(stepId, node);
    }

    // Calculate dependents and depths
    for (const [stepId, node] of dependencyGraph) {
      for (const depId of node.dependencies) {
        const depNode = dependencyGraph.get(depId);
        if (depNode) {
          depNode.dependents.push(stepId);
        } else if (validateDependencies) {
          warnings.push(`Dependency ${depId} for step ${stepId} not found`);
        }
      }
    }

    // Detect cycles if requested
    if (detectCycles) {
      for (const stepId of stepIds) {
        if (this.hasCyclicDependencies(stepId, new Set(), new Set())) {
          warnings.push(`Circular dependency detected starting from step ${stepId}`);
        }
      }
    }

    // Calculate execution order (topological sort)
    const executionOrder = this.topologicalSort(
      Array.from(dependencyGraph.keys()),
      dependencyGraph,
    );

    // Create parallel execution groups
    const parallelGroups = this.createParallelGroups(executionOrder, dependencyGraph);

    return {
      executionOrder,
      parallelGroups,
      dependencyGraph,
      warnings,
    };
  }

  /**
   * Get step usage statistics
   */
  getUsageStatistics(): {
    totalSteps: number;
    activeSteps: number;
    categories: Record<string, number>;
    mostUsed: Array<{ stepId: string; usageCount: number }>;
    recentlyUsed: Array<{ stepId: string; lastUsedAt: Date }>;
  } {
    const stats = {
      totalSteps: this.steps.size,
      activeSteps: 0,
      categories: {} as Record<string, number>,
      mostUsed: [] as Array<{ stepId: string; usageCount: number }>,
      recentlyUsed: [] as Array<{ stepId: string; lastUsedAt: Date }>,
    };

    const allEntries = Array.from(this.steps.entries());

    // Count active steps and categories
    for (const [stepId, entry] of allEntries) {
      if (entry.active) {
        stats.activeSteps++;

        const category = entry.definition.metadata.category || 'uncategorized';
        stats.categories[category] = (stats.categories[category] || 0) + 1;
      }
    }

    // Most used steps
    stats.mostUsed = allEntries
      .filter(([, entry]) => entry.active && entry.usageCount > 0)
      .map(([stepId, entry]) => ({ stepId, usageCount: entry.usageCount }))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10);

    // Recently used steps
    stats.recentlyUsed = allEntries
      .filter(([, entry]) => entry.active && entry.lastUsedAt)
      .map(([stepId, entry]) => ({ stepId, lastUsedAt: entry.lastUsedAt! }))
      .sort((a, b) => b.lastUsedAt.getTime() - a.lastUsedAt.getTime())
      .slice(0, 10);

    return stats;
  }

  /**
   * Export step definitions for backup/migration
   */
  export(): Array<{
    definition: WorkflowStepDefinition;
    metadata: Pick<StepRegistryEntry, 'registeredAt' | 'registeredBy' | 'usageCount'>;
  }> {
    return Array.from(this.steps.values()).map((entry) => ({
      definition: entry.definition,
      metadata: {
        registeredAt: entry.registeredAt,
        registeredBy: entry.registeredBy,
        usageCount: entry.usageCount,
      },
    }));
  }

  /**
   * Import step definitions from backup/migration
   */
  import(
    data: Array<{
      definition: WorkflowStepDefinition;
      metadata?: Partial<Pick<StepRegistryEntry, 'registeredAt' | 'registeredBy' | 'usageCount'>>;
    }>,
    overwrite = false,
  ): { imported: number; skipped: number; errors: string[] } {
    const result = { imported: 0, skipped: 0, errors: [] as string[] };

    for (const item of data) {
      try {
        if (this.steps.has(item.definition.id) && !overwrite) {
          result.skipped++;
          continue;
        }

        // If overwriting, unregister existing step first
        if (overwrite && this.steps.has(item.definition.id)) {
          this.unregister(item.definition.id);
        }

        this.register(item.definition, item.metadata?.registeredBy);

        // Update usage statistics if provided
        if (item.metadata) {
          const entry = this.steps.get(item.definition.id);
          if (entry) {
            if (item.metadata.usageCount !== undefined) {
              entry.usageCount = item.metadata.usageCount;
            }
            if (item.metadata.registeredAt) {
              entry.registeredAt = new Date(item.metadata.registeredAt);
            }
          }
        }

        result.imported++;
      } catch (error) {
        result.errors.push(
          `Failed to import step ${item.definition.id}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }

    return result;
  }

  /**
   * Check for cyclic dependencies using DFS
   */
  private hasCyclicDependencies(
    stepId: string,
    visited: Set<string>,
    recursionStack: Set<string>,
  ): boolean {
    if (recursionStack.has(stepId)) {
      return true; // Cycle detected
    }

    if (visited.has(stepId)) {
      return false; // Already processed
    }

    visited.add(stepId);
    recursionStack.add(stepId);

    const definition = this.get(stepId);
    if (definition?.dependencies) {
      for (const depId of definition.dependencies) {
        if (this.hasCyclicDependencies(depId, visited, recursionStack)) {
          return true;
        }
      }
    }

    recursionStack.delete(stepId);
    return false;
  }

  /**
   * Topological sort for execution order
   */
  private topologicalSort(
    stepIds: string[],
    dependencyGraph: Map<string, StepDependencyNode>,
  ): string[] {
    const visited = new Set<string>();
    const result: string[] = [];

    const visit = (stepId: string) => {
      if (visited.has(stepId)) {
        return;
      }

      visited.add(stepId);
      const node = dependencyGraph.get(stepId);

      if (node) {
        // Visit dependencies first
        for (const depId of node.dependencies) {
          if (dependencyGraph.has(depId)) {
            visit(depId);
          }
        }
      }

      result.push(stepId);
    };

    for (const stepId of stepIds) {
      visit(stepId);
    }

    return result;
  }

  /**
   * Create parallel execution groups
   */
  private createParallelGroups(
    executionOrder: string[],
    dependencyGraph: Map<string, StepDependencyNode>,
  ): string[][] {
    const groups: string[][] = [];
    const completed = new Set<string>();

    for (const stepId of executionOrder) {
      const node = dependencyGraph.get(stepId);
      if (!node) continue;

      // Check if all dependencies are completed
      const canExecute = node.dependencies.every((depId) => completed.has(depId));

      if (canExecute) {
        // Find or create a group for this step
        let groupIndex = groups.findIndex((group) =>
          group.every((groupStepId) => {
            const groupNode = dependencyGraph.get(groupStepId);
            return groupNode && !groupNode.dependents.includes(stepId);
          }),
        );

        if (groupIndex === -1) {
          groups.push([stepId]);
        } else {
          groups[groupIndex].push(stepId);
        }

        completed.add(stepId);
      }
    }

    return groups;
  }

  /**
   * Clear all registered steps
   */
  clear(): void {
    this.steps.clear();
    this.categories.clear();
    this.tags.clear();
  }

  /**
   * Get registry statistics
   */
  getStats(): {
    totalSteps: number;
    activeSteps: number;
    inactiveSteps: number;
    categories: number;
    tags: number;
  } {
    const activeSteps = Array.from(this.steps.values()).filter((entry) => entry.active).length;

    return {
      totalSteps: this.steps.size,
      activeSteps,
      inactiveSteps: this.steps.size - activeSteps,
      categories: this.categories.size,
      tags: this.tags.size,
    };
  }
}

/**
 * Default step registry instance
 */
export const defaultStepRegistry = new StepRegistry();
