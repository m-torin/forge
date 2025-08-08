/**
 * Resource Lifecycle Management System
 * Advanced resource tracking, automatic cleanup, and leak prevention
 */

import { AsyncLocalStorage } from 'node:async_hooks';
import { EventEmitter } from 'node:events';
import { globalAdvancedMemoryMonitor } from './advanced-memory-monitor';
export interface ResourceMetadata {
  id: string;
  type: string;
  name: string;
  createdAt: number;
  lastUsed: number;
  size: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  metadata: Record<string, any>;
  dependencies: string[]; // Resource IDs this depends on
  dependents: string[]; // Resource IDs that depend on this
}

export interface ResourceCleanupCallback {
  (resource: ResourceMetadata): Promise<void> | void;
}

export interface ResourceLeakPattern {
  pattern: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectionLogic: (resources: ResourceMetadata[]) => boolean;
  recommendedAction: string;
}

export interface LifecycleHooks {
  onResourceCreated?: (resource: ResourceMetadata) => void;
  onResourceAccessed?: (resource: ResourceMetadata) => void;
  onResourceUpdated?: (resource: ResourceMetadata, changes: Partial<ResourceMetadata>) => void;
  onResourceCleaned?: (resource: ResourceMetadata) => void;
  onLeakDetected?: (leak: ResourceLeakDetection) => void;
  onCleanupFailed?: (resource: ResourceMetadata, error: Error) => void;
}

export interface ResourceLeakDetection {
  resourceId: string;
  pattern: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: number;
  ageMs: number;
  inactivityMs: number;
  suspectedCause: string;
  recommendedAction: string;
}

export interface CleanupStrategy {
  name: string;
  description: string;
  condition: (resource: ResourceMetadata) => boolean;
  priority: number; // Lower = higher priority
  action: ResourceCleanupCallback;
}

/**
 * Resource Lifecycle Manager with advanced leak detection
 */
export class ResourceLifecycleManager extends EventEmitter {
  private resources = new Map<string, ResourceMetadata>();
  private cleanupCallbacks = new Map<string, ResourceCleanupCallback[]>();
  private weakRefs = new Map<string, WeakRef<object>>();
  private finalizationRegistry: FinalizationRegistry<string>;

  private hooks: LifecycleHooks = {};
  private cleanupStrategies: CleanupStrategy[] = [];
  private leakPatterns: ResourceLeakPattern[] = [];

  private asyncLocalStorage = new AsyncLocalStorage<{
    resourceContext: string;
    trackingEnabled: boolean;
  }>();

  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;
  private lastCleanupCheck = 0;
  private cleanupCheckInterval = 60000; // 1 minute

  // Resource statistics
  private stats = {
    totalCreated: 0,
    totalCleaned: 0,
    totalLeaks: 0,
    cleanupFailures: 0,
    averageLifetime: 0,
  };

  constructor(
    options: {
      enableMonitoring?: boolean;
      cleanupInterval?: number;
      hooks?: LifecycleHooks;
    } = {},
  ) {
    super();

    this.hooks = options.hooks || {};
    this.cleanupCheckInterval = options.cleanupInterval || 60000;

    this.finalizationRegistry = new FinalizationRegistry((resourceId: string) => {
      this.handleResourceFinalization(resourceId);
    });

    this.initializeDefaultStrategies();
    this.initializeLeakPatterns();

    if (options.enableMonitoring !== false) {
      this.startMonitoring();
    }
  }

  private initializeDefaultStrategies(): void {
    // Age-based cleanup
    this.addCleanupStrategy({
      name: 'age-based',
      description: 'Clean up resources older than threshold',
      condition: resource => {
        const age = Date.now() - resource.createdAt;
        const maxAge = this.getMaxAgeForPriority(resource.priority);
        return age > maxAge;
      },
      priority: 3,
      action: async resource => {
        console.debug(`Age-based cleanup for resource ${resource.id} (${resource.type})`);
      },
    });

    // Inactivity-based cleanup
    this.addCleanupStrategy({
      name: 'inactivity-based',
      description: 'Clean up inactive resources',
      condition: resource => {
        const inactivity = Date.now() - resource.lastUsed;
        const maxInactivity = this.getMaxInactivityForPriority(resource.priority);
        return inactivity > maxInactivity;
      },
      priority: 2,
      action: async resource => {
        console.debug(`Inactivity-based cleanup for resource ${resource.id} (${resource.type})`);
      },
    });

    // Memory pressure cleanup
    this.addCleanupStrategy({
      name: 'memory-pressure',
      description: 'Clean up resources during high memory pressure',
      condition: resource => {
        const pressure = globalAdvancedMemoryMonitor.getMemoryPressure();
        if (pressure.level === 'critical' || pressure.level === 'emergency') {
          return resource.priority !== 'critical';
        }
        if (pressure.level === 'high') {
          return resource.priority === 'low';
        }
        return false;
      },
      priority: 1,
      action: async resource => {
        console.debug(`Memory pressure cleanup for resource ${resource.id} (${resource.type})`);
      },
    });

    // Dependency-based cleanup
    this.addCleanupStrategy({
      name: 'orphaned-dependencies',
      description: 'Clean up resources with no active dependencies',
      condition: resource => {
        if (resource.dependencies.length === 0) return false;

        // Check if all dependencies are cleaned up
        return resource.dependencies.every(depId => !this.resources.has(depId));
      },
      priority: 4,
      action: async resource => {
        console.debug(`Orphaned dependency cleanup for resource ${resource.id} (${resource.type})`);
      },
    });
  }

  private initializeLeakPatterns(): void {
    // Long-lived inactive resources
    this.leakPatterns.push({
      pattern: 'long-lived-inactive',
      description: "Resources that are old and haven't been used recently",
      severity: 'medium',
      detectionLogic: resources => {
        return resources.some(r => {
          const age = Date.now() - r.createdAt;
          const inactivity = Date.now() - r.lastUsed;
          return age > 3600000 && inactivity > 1800000; // 1hr old, 30min inactive
        });
      },
      recommendedAction: 'Review resource usage patterns and implement proper cleanup',
    });

    // Circular dependencies
    this.leakPatterns.push({
      pattern: 'circular-dependencies',
      description: 'Resources with circular dependency chains',
      severity: 'high',
      detectionLogic: resources => {
        return this.detectCircularDependencies(resources);
      },
      recommendedAction: 'Break circular dependencies or implement WeakRef patterns',
    });

    // Exponential growth
    this.leakPatterns.push({
      pattern: 'exponential-growth',
      description: 'Rapid increase in resource count of same type',
      severity: 'critical',
      detectionLogic: resources => {
        const typeGroups = this.groupResourcesByType(resources);
        return Object.values(typeGroups).some(group => group.length > 100);
      },
      recommendedAction: 'Implement resource pooling or stricter cleanup policies',
    });

    // Memory-heavy resources
    this.leakPatterns.push({
      pattern: 'memory-heavy-accumulation',
      description: 'Accumulation of large resources',
      severity: 'high',
      detectionLogic: resources => {
        const totalSize = resources.reduce((sum, r) => sum + r.size, 0);
        const largeResources = resources.filter(r => r.size > 10 * 1024 * 1024); // 10MB
        return largeResources.length > 5 || totalSize > 100 * 1024 * 1024; // 100MB
      },
      recommendedAction: 'Implement streaming or pagination for large data resources',
    });
  }

  /**
   * Register a resource for lifecycle management
   */
  registerResource<T extends object>(
    object: T,
    metadata: Omit<ResourceMetadata, 'id' | 'createdAt' | 'lastUsed' | 'dependents'>,
    cleanupCallbacks?: ResourceCleanupCallback[],
  ): string {
    const id = `${metadata.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const resource: ResourceMetadata = {
      ...metadata,
      id,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      dependents: [],
    };

    // Store resource metadata
    this.resources.set(id, resource);

    // Store cleanup callbacks
    if (cleanupCallbacks && cleanupCallbacks.length > 0) {
      this.cleanupCallbacks.set(id, cleanupCallbacks);
    }

    // Create WeakRef and register for finalization
    this.weakRefs.set(id, new WeakRef(object));
    this.finalizationRegistry.register(object, id, object);

    // Track with memory monitor
    globalAdvancedMemoryMonitor.trackObject(object, `lifecycle-${metadata.type}`, {
      resourceId: id,
      resourceType: metadata.type,
      resourceName: metadata.name,
    });

    // Update dependencies
    for (const depId of resource.dependencies) {
      const dep = this.resources.get(depId);
      if (dep) {
        dep.dependents.push(id);
      }
    }

    // Update statistics
    this.stats.totalCreated++;

    // Call hook
    if (this.hooks.onResourceCreated) {
      this.hooks.onResourceCreated(resource);
    }

    this.emit('resourceCreated', resource);

    return id;
  }

  /**
   * Mark resource as accessed
   */
  touchResource(resourceId: string): boolean {
    const resource = this.resources.get(resourceId);
    if (!resource) return false;

    resource.lastUsed = Date.now();

    if (this.hooks.onResourceAccessed) {
      this.hooks.onResourceAccessed(resource);
    }

    this.emit('resourceAccessed', resource);
    return true;
  }

  /**
   * Update resource metadata
   */
  updateResource(resourceId: string, changes: Partial<ResourceMetadata>): boolean {
    const resource = this.resources.get(resourceId);
    if (!resource) return false;

    // Don't allow changing immutable fields
    const immutableFields = ['id', 'createdAt'];
    const allowedChanges = Object.fromEntries(
      Object.entries(changes).filter(([key]) => !immutableFields.includes(key)),
    );

    Object.assign(resource, allowedChanges);

    if (this.hooks.onResourceUpdated) {
      this.hooks.onResourceUpdated(resource, allowedChanges);
    }

    this.emit('resourceUpdated', resource, allowedChanges);
    return true;
  }

  /**
   * Get resource metadata
   */
  getResource(resourceId: string): ResourceMetadata | undefined {
    return this.resources.get(resourceId);
  }

  /**
   * Get all resources of a specific type
   */
  getResourcesByType(type: string): ResourceMetadata[] {
    return Array.from(this.resources.values()).filter(r => r.type === type);
  }

  /**
   * Get resources by tags
   */
  getResourcesByTags(tags: string[]): ResourceMetadata[] {
    return Array.from(this.resources.values()).filter(resource =>
      tags.some(tag => resource.tags.includes(tag)),
    );
  }

  /**
   * Start monitoring for leaks and cleanup opportunities
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(async () => {
      await this.performMonitoringCycle();
    }, this.cleanupCheckInterval);
    this.monitoringInterval.unref();

    console.debug('Resource lifecycle monitoring started');
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.isMonitoring = false;
    console.debug('Resource lifecycle monitoring stopped');
  }

  private async performMonitoringCycle(): Promise<void> {
    const now = Date.now();

    // Skip if too soon since last check
    if (now - this.lastCleanupCheck < this.cleanupCheckInterval * 0.5) {
      return;
    }

    this.lastCleanupCheck = now;

    try {
      // Clean up dead WeakRefs
      await this.cleanupDeadReferences();

      // Detect memory leaks
      await this.detectLeaks();

      // Apply cleanup strategies
      await this.applyCleanupStrategies();

      // Update statistics
      this.updateStatistics();
    } catch (error) {
      console.error('Error in resource monitoring cycle:', error);
      this.emit('monitoringError', error);
    }
  }

  private async cleanupDeadReferences(): Promise<void> {
    let cleaned = 0;

    for (const [resourceId, weakRef] of this.weakRefs.entries()) {
      if (weakRef.deref() === undefined) {
        await this.cleanupResource(resourceId, 'garbage-collected');
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.debug(`Cleaned up ${cleaned} dead resource references`);
    }
  }

  private async detectLeaks(): Promise<void> {
    const resources = Array.from(this.resources.values());
    const detectedLeaks: ResourceLeakDetection[] = [];

    for (const pattern of this.leakPatterns) {
      if (pattern.detectionLogic(resources)) {
        // Find specific resources matching this pattern
        const matchingResources = this.findResourcesMatchingPattern(pattern, resources);

        for (const resource of matchingResources) {
          const leak: ResourceLeakDetection = {
            resourceId: resource.id,
            pattern: pattern.pattern,
            severity: pattern.severity,
            description: pattern.description,
            detectedAt: Date.now(),
            ageMs: Date.now() - resource.createdAt,
            inactivityMs: Date.now() - resource.lastUsed,
            suspectedCause: this.determineSuspectedCause(resource),
            recommendedAction: pattern.recommendedAction,
          };

          detectedLeaks.push(leak);

          if (this.hooks.onLeakDetected) {
            this.hooks.onLeakDetected(leak);
          }

          this.emit('leakDetected', leak);
        }
      }
    }

    this.stats.totalLeaks += detectedLeaks.length;
  }

  private findResourcesMatchingPattern(
    pattern: ResourceLeakPattern,
    resources: ResourceMetadata[],
  ): ResourceMetadata[] {
    const now = Date.now();

    switch (pattern.pattern) {
      case 'long-lived-inactive':
        return resources.filter(r => {
          const age = now - r.createdAt;
          const inactivity = now - r.lastUsed;
          return age > 3600000 && inactivity > 1800000;
        });

      case 'memory-heavy-accumulation':
        return resources.filter(r => r.size > 10 * 1024 * 1024);

      default:
        return [];
    }
  }

  private determineSuspectedCause(resource: ResourceMetadata): string {
    const age = Date.now() - resource.createdAt;
    const inactivity = Date.now() - resource.lastUsed;

    if (inactivity > age * 0.9) {
      return 'Resource created but rarely used - possible over-allocation';
    }
    if (resource.dependencies.length > 0) {
      return 'Resource with dependencies not properly cleaned up';
    }
    if (resource.size > 5 * 1024 * 1024) {
      return 'Large resource not released - possible memory leak';
    }
    return 'Long-lived resource without recent activity';
  }

  private async applyCleanupStrategies(): Promise<void> {
    const resources = Array.from(this.resources.values());

    // Sort strategies by priority (lower number = higher priority)
    const sortedStrategies = [...this.cleanupStrategies].sort((a, b) => a.priority - b.priority);

    for (const strategy of sortedStrategies) {
      const candidateResources = resources.filter(strategy.condition);

      for (const resource of candidateResources) {
        try {
          await strategy.action(resource);
          await this.cleanupResource(resource.id, strategy.name);
        } catch (error) {
          console.error(
            `Cleanup strategy '${strategy.name}' failed for resource ${resource.id}:`,
            error,
          );
          this.stats.cleanupFailures++;

          if (this.hooks.onCleanupFailed) {
            this.hooks.onCleanupFailed(resource, error as Error);
          }
        }
      }
    }
  }

  private async cleanupResource(resourceId: string, reason: string): Promise<void> {
    const resource = this.resources.get(resourceId);
    if (!resource) return;

    try {
      // Execute cleanup callbacks
      const callbacks = this.cleanupCallbacks.get(resourceId);
      if (callbacks) {
        for (const callback of callbacks) {
          await callback(resource);
        }
      }

      // Clean up dependents first
      for (const dependentId of resource.dependents) {
        await this.cleanupResource(dependentId, `dependency-${reason}`);
      }

      // Remove from tracking
      this.resources.delete(resourceId);
      this.cleanupCallbacks.delete(resourceId);
      this.weakRefs.delete(resourceId);

      // Update statistics
      this.stats.totalCleaned++;
      const lifetime = Date.now() - resource.createdAt;
      this.stats.averageLifetime =
        (this.stats.averageLifetime * (this.stats.totalCleaned - 1) + lifetime) /
        this.stats.totalCleaned;

      if (this.hooks.onResourceCleaned) {
        this.hooks.onResourceCleaned(resource);
      }

      this.emit('resourceCleaned', resource, reason);

      console.debug(`Resource ${resourceId} (${resource.type}) cleaned up: ${reason}`);
    } catch (error) {
      console.error(`Failed to cleanup resource ${resourceId}:`, error);
      this.stats.cleanupFailures++;
    }
  }

  private handleResourceFinalization(resourceId: string): void {
    // Object was garbage collected, clean up our tracking
    void this.cleanupResource(resourceId, 'finalization');
  }

  private updateStatistics(): void {
    // Update average lifetime calculation periodically
    const activeResources = Array.from(this.resources.values());
    if (activeResources.length > 0) {
      const now = Date.now();
      const totalLifetime = activeResources.reduce((sum, r) => sum + (now - r.createdAt), 0);
      const currentAverageLifetime = totalLifetime / activeResources.length;

      // Blend with historical average
      this.stats.averageLifetime = this.stats.averageLifetime * 0.8 + currentAverageLifetime * 0.2;
    }
  }

  private detectCircularDependencies(resources: ResourceMetadata[]): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (resourceId: string): boolean => {
      if (recursionStack.has(resourceId)) return true;
      if (visited.has(resourceId)) return false;

      visited.add(resourceId);
      recursionStack.add(resourceId);

      const resource = this.resources.get(resourceId);
      if (resource) {
        for (const depId of resource.dependencies) {
          if (hasCycle(depId)) return true;
        }
      }

      recursionStack.delete(resourceId);
      return false;
    };

    return resources.some(resource => hasCycle(resource.id));
  }

  private groupResourcesByType(resources: ResourceMetadata[]): Record<string, ResourceMetadata[]> {
    return resources.reduce(
      (groups, resource) => {
        const type = resource.type;
        if (!groups[type]) {
          groups[type] = [];
        }
        groups[type].push(resource);
        return groups;
      },
      {} as Record<string, ResourceMetadata[]>,
    );
  }

  private getMaxAgeForPriority(priority: string): number {
    switch (priority) {
      case 'low':
        return 1800000; // 30 minutes
      case 'medium':
        return 3600000; // 1 hour
      case 'high':
        return 7200000; // 2 hours
      case 'critical':
        return 86400000; // 24 hours
      default:
        return 3600000;
    }
  }

  private getMaxInactivityForPriority(priority: string): number {
    switch (priority) {
      case 'low':
        return 600000; // 10 minutes
      case 'medium':
        return 1800000; // 30 minutes
      case 'high':
        return 3600000; // 1 hour
      case 'critical':
        return 7200000; // 2 hours
      default:
        return 1800000;
    }
  }

  /**
   * Add custom cleanup strategy
   */
  addCleanupStrategy(strategy: CleanupStrategy): void {
    this.cleanupStrategies.push(strategy);
  }

  /**
   * Add custom leak detection pattern
   */
  addLeakPattern(pattern: ResourceLeakPattern): void {
    this.leakPatterns.push(pattern);
  }

  /**
   * Force cleanup of all resources matching criteria
   */
  async forceCleanup(
    criteria: {
      type?: string;
      tags?: string[];
      olderThan?: number;
      inactiveLongerThan?: number;
      priority?: string;
    } = {},
  ): Promise<{
    cleaned: number;
    failed: number;
    errors: string[];
  }> {
    const resources = Array.from(this.resources.values());
    const toCleanup: ResourceMetadata[] = [];
    const now = Date.now();

    for (const resource of resources) {
      let shouldCleanup = true;

      if (criteria.type && resource.type !== criteria.type) {
        shouldCleanup = false;
      }
      if (criteria.tags && !criteria.tags.some(tag => resource.tags.includes(tag))) {
        shouldCleanup = false;
      }
      if (criteria.olderThan && now - resource.createdAt < criteria.olderThan) {
        shouldCleanup = false;
      }
      if (criteria.inactiveLongerThan && now - resource.lastUsed < criteria.inactiveLongerThan) {
        shouldCleanup = false;
      }
      if (criteria.priority && resource.priority !== criteria.priority) {
        shouldCleanup = false;
      }

      if (shouldCleanup) {
        toCleanup.push(resource);
      }
    }

    let cleaned = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const resource of toCleanup) {
      try {
        await this.cleanupResource(resource.id, 'forced-cleanup');
        cleaned++;
      } catch (error) {
        failed++;
        errors.push(`${resource.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { cleaned, failed, errors };
  }

  /**
   * Get comprehensive statistics
   */
  getStatistics(): {
    resources: {
      total: number;
      byType: Record<string, number>;
      byPriority: Record<string, number>;
      averageAge: number;
      averageInactivity: number;
      totalSize: number;
    };
    lifecycle: {
      totalCreated: number;
      totalCleaned: number;
      totalLeaks: number;
      cleanupFailures: number;
      averageLifetime: number;
    };
    leakPatterns: {
      pattern: string;
      matches: number;
    }[];
  } {
    const resources = Array.from(this.resources.values());
    const now = Date.now();

    const byType: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    let totalAge = 0;
    let totalInactivity = 0;
    let totalSize = 0;

    for (const resource of resources) {
      byType[resource.type] = (byType[resource.type] || 0) + 1;
      byPriority[resource.priority] = (byPriority[resource.priority] || 0) + 1;
      totalAge += now - resource.createdAt;
      totalInactivity += now - resource.lastUsed;
      totalSize += resource.size;
    }

    const leakPatternMatches = this.leakPatterns.map(pattern => ({
      pattern: pattern.pattern,
      matches: this.findResourcesMatchingPattern(pattern, resources).length,
    }));

    return {
      resources: {
        total: resources.length,
        byType,
        byPriority,
        averageAge: resources.length > 0 ? totalAge / resources.length : 0,
        averageInactivity: resources.length > 0 ? totalInactivity / resources.length : 0,
        totalSize,
      },
      lifecycle: { ...this.stats },
      leakPatterns: leakPatternMatches,
    };
  }

  /**
   * Cleanup and dispose of the manager
   */
  async dispose(): Promise<void> {
    this.stopMonitoring();

    // Force cleanup of all resources
    await this.forceCleanup();

    // Clear all data
    this.resources.clear();
    this.cleanupCallbacks.clear();
    this.weakRefs.clear();

    this.removeAllListeners();

    console.debug('Resource lifecycle manager disposed');
  }
}

// Global instance
export const globalResourceLifecycleManager = new ResourceLifecycleManager({
  enableMonitoring: true,
});

// MCP Tool interface
export interface ResourceLifecycleManagerArgs {
  action:
    | 'register'
    | 'touch'
    | 'update'
    | 'get'
    | 'getByType'
    | 'getByTags'
    | 'startMonitoring'
    | 'stopMonitoring'
    | 'forceCleanup'
    | 'getStatistics';

  // Action-specific parameters
  resourceId?: string;
  objectType?: string;
  resourceName?: string;
  size?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
  metadata?: Record<string, any>;
  dependencies?: string[];

  // Update parameters
  changes?: Partial<ResourceMetadata>;

  // Query parameters
  type?: string;
  queryTags?: string[];

  // Cleanup parameters
  cleanupCriteria?: {
    type?: string;
    tags?: string[];
    olderThan?: number;
    inactiveLongerThan?: number;
    priority?: string;
  };
}

export const resourceLifecycleManagerTool = {
  name: 'resource_lifecycle_manager',
  description: 'Advanced resource lifecycle management with leak detection and automatic cleanup',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: [
          'register',
          'touch',
          'update',
          'get',
          'getByType',
          'getByTags',
          'startMonitoring',
          'stopMonitoring',
          'forceCleanup',
          'getStatistics',
        ],
        description: 'Action to perform',
      },
      resourceId: {
        type: 'string',
        description: 'Resource ID for operations on specific resources',
      },
      objectType: {
        type: 'string',
        description: 'Type of resource being registered',
      },
      resourceName: {
        type: 'string',
        description: 'Name of the resource',
      },
      size: {
        type: 'number',
        description: 'Size of the resource in bytes',
      },
      priority: {
        type: 'string',
        enum: ['low', 'medium', 'high', 'critical'],
        description: 'Priority of the resource',
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Tags for the resource',
      },
      metadata: {
        type: 'object',
        description: 'Additional metadata for the resource',
      },
      dependencies: {
        type: 'array',
        items: { type: 'string' },
        description: 'Resource IDs this resource depends on',
      },
      changes: {
        type: 'object',
        description: 'Changes to apply to the resource',
      },
      type: {
        type: 'string',
        description: 'Resource type to query',
      },
      queryTags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Tags to query for',
      },
      cleanupCriteria: {
        type: 'object',
        description: 'Criteria for forced cleanup',
      },
    },
    required: ['action'],
  },

  async execute(args: ResourceLifecycleManagerArgs): Promise<{
    content: Array<{ type: string; text: string }>;
    isError?: boolean;
  }> {
    try {
      const { action } = args;

      switch (action) {
        case 'register': {
          if (!args.objectType || !args.resourceName) {
            throw new Error('objectType and resourceName are required for register action');
          }

          // Create a dummy object for demonstration (in real usage, this would be the actual object)
          const dummyObject = {
            type: args.objectType,
            name: args.resourceName,
            timestamp: Date.now(),
          };

          const resourceId = globalResourceLifecycleManager.registerResource(dummyObject, {
            type: args.objectType,
            name: args.resourceName,
            size: args.size || 0,
            priority: args.priority || 'medium',
            tags: args.tags || [],
            metadata: args.metadata || {},
            dependencies: args.dependencies || [],
          });

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  resourceId,
                  message: `Resource registered: ${args.resourceName} (${args.objectType})`,
                }),
              },
            ],
          };
        }

        case 'touch': {
          if (!args.resourceId) {
            throw new Error('resourceId is required for touch action');
          }

          const touched = globalResourceLifecycleManager.touchResource(args.resourceId);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: touched,
                  resourceId: args.resourceId,
                  message: touched ? 'Resource touched' : 'Resource not found',
                }),
              },
            ],
          };
        }

        case 'update': {
          if (!args.resourceId || !args.changes) {
            throw new Error('resourceId and changes are required for update action');
          }

          const updated = globalResourceLifecycleManager.updateResource(
            args.resourceId,
            args.changes,
          );

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: updated,
                  resourceId: args.resourceId,
                  changes: args.changes,
                  message: updated ? 'Resource updated' : 'Resource not found',
                }),
              },
            ],
          };
        }

        case 'get': {
          if (!args.resourceId) {
            throw new Error('resourceId is required for get action');
          }

          const resource = globalResourceLifecycleManager.getResource(args.resourceId);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  found: resource !== undefined,
                  resource,
                }),
              },
            ],
          };
        }

        case 'getByType': {
          if (!args.type) {
            throw new Error('type is required for getByType action');
          }

          const resources = globalResourceLifecycleManager.getResourcesByType(args.type);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  type: args.type,
                  count: resources.length,
                  resources,
                }),
              },
            ],
          };
        }

        case 'getByTags': {
          if (!args.queryTags) {
            throw new Error('queryTags is required for getByTags action');
          }

          const resources = globalResourceLifecycleManager.getResourcesByTags(args.queryTags);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  tags: args.queryTags,
                  count: resources.length,
                  resources,
                }),
              },
            ],
          };
        }

        case 'startMonitoring': {
          globalResourceLifecycleManager.startMonitoring();

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  message: 'Resource lifecycle monitoring started',
                }),
              },
            ],
          };
        }

        case 'stopMonitoring': {
          globalResourceLifecycleManager.stopMonitoring();

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  message: 'Resource lifecycle monitoring stopped',
                }),
              },
            ],
          };
        }

        case 'forceCleanup': {
          const result = await globalResourceLifecycleManager.forceCleanup(
            args.cleanupCriteria || {},
          );

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result),
              },
            ],
          };
        }

        case 'getStatistics': {
          const statistics = globalResourceLifecycleManager.getStatistics();

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(statistics),
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: `Resource lifecycle manager error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            }),
          },
        ],
        isError: true,
      };
    }
  },
};
