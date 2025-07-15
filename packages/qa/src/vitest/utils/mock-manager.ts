/**
 * @fileoverview Mock manager utilities for Vitest with comprehensive lifecycle management.
 *
 * This module provides utilities for managing mocks throughout the test lifecycle
 * with enhanced type safety, performance optimizations, and debugging capabilities.
 *
 * @example
 * ```ts
 * import { mockManager } from '@repo/qa/vitest/utils/mock-manager';
 *
 * // Register a mock with metadata
 * const mockId = mockManager.register(vi.fn(), {
 *   name: 'userService.createUser',
 *   type: 'function',
 *   group: 'userService'
 * });
 *
 * // Clean up mocks
 * mockManager.cleanup({ groups: ['userService'] });
 * ```
 */

import type { Mock, MockInstance } from 'vitest';
import { vi } from 'vitest';

// Enhanced type definitions for better development experience
type MockFunction = Mock | MockInstance;
type MockType = 'function' | 'module' | 'class' | 'object' | 'spy';
type CleanupStrategy = 'restore' | 'clear' | 'reset';

/**
 * Enhanced mock registry with performance optimizations and type safety.
 */
export interface MockRegistry {
  /** Map of mock IDs to mock instances */
  mocks: Map<string, MockFunction>;
  /** Map of group names to sets of mock IDs */
  groups: Map<string, Set<string>>;
  /** Map of mock IDs to their metadata */
  metadata: Map<string, MockMetadata>;
  /** Performance: Index for fast lookups by name */
  nameIndex: Map<string, string>;
  /** Performance: Index for fast lookups by type */
  typeIndex: Map<MockType, Set<string>>;
}

/**
 * Enhanced mock metadata with comprehensive tracking and validation.
 */
export interface MockMetadata {
  /** Unique identifier for the mock */
  id: string;
  /** Human-readable name for the mock */
  name: string;
  /** Type classification of the mock */
  type: MockType;
  /** Timestamp when the mock was created */
  created: Date;
  /** Timestamp when the mock was last accessed */
  lastUsed: Date | null;
  /** Optional group assignment for batch operations */
  group: string | null;
  /** Searchable tags for categorization */
  tags: string[];
  /** Human-readable description */
  description: string;
  /** Test expectations associated with this mock */
  expectations: unknown[];
  /** Performance: Call count tracking */
  callCount: number;
  /** Debugging: Stack trace where mock was created */
  creationStack?: string;
}

export interface MockGroup {
  name: string;
  mocks: string[];
  created: Date;
  description: string;
}

/**
 * Configuration options for mock discovery with validation constraints.
 */
export interface MockDiscoveryOptions {
  patterns?: string[];
  directories?: string[];
  extensions?: string[];
  recursive?: boolean;
  includeInternal?: boolean;
  includePackages?: boolean;
  includeProviders?: boolean;
  maxFiles?: number;
}

/**
 * Enhanced cleanup options with multiple strategies and safety constraints.
 */
export interface MockCleanupOptions {
  strategy?: CleanupStrategy;
  restoreAll?: boolean;
  clearAll?: boolean;
  resetAll?: boolean;
  specific?: string[];
  groups?: string[];
  cleanupUnused?: boolean;
  ageThreshold?: number;
  dryRun?: boolean;
  onCleanup?: (mockId: string, metadata: MockMetadata) => void;
}

// Global mock registry with enhanced performance tracking
const mockRegistry: MockRegistry = {
  mocks: new Map(),
  groups: new Map(),
  metadata: new Map(),
  nameIndex: new Map(),
  typeIndex: new Map(),
};

// Performance monitoring
let registryOperationCount = 0;
const MAX_REGISTRY_SIZE = 10000; // Prevent memory exhaustion
const CLEANUP_THRESHOLD = 8000; // Trigger cleanup when approaching limit

/**
 * Performance monitoring utilities
 */
const performanceMonitor = {
  /**
   * Get current registry statistics for monitoring
   */
  getStats(): {
    totalMocks: number;
    totalGroups: number;
    operationCount: number;
    memoryUsage: 'low' | 'medium' | 'high' | 'critical';
  } {
    const totalMocks = mockRegistry.mocks.size;
    let memoryUsage: 'low' | 'medium' | 'high' | 'critical';

    if (totalMocks < 1000) memoryUsage = 'low';
    else if (totalMocks < 5000) memoryUsage = 'medium';
    else if (totalMocks < CLEANUP_THRESHOLD) memoryUsage = 'high';
    else memoryUsage = 'critical';

    return {
      totalMocks,
      totalGroups: mockRegistry.groups.size,
      operationCount: registryOperationCount,
      memoryUsage,
    };
  },

  /**
   * Check if automatic cleanup should be triggered
   */
  shouldTriggerCleanup(): boolean {
    return mockRegistry.mocks.size >= CLEANUP_THRESHOLD;
  },
};

/**
 * Enhanced mock manager with comprehensive lifecycle management,
 * performance optimizations, and debugging capabilities.
 */
export const mockManager = {
  /**
   * Register a mock with comprehensive metadata and validation.
   *
   * @param mock - The mock instance to register
   * @param metadata - Optional metadata for the mock
   * @returns Unique mock ID
   *
   * @throws {Error} When registry size limit is exceeded
   *
   * @example
   * ```ts
   * const mockId = mockManager.register(vi.fn(), {
   *   name: 'userService.createUser',
   *   type: 'function',
   *   group: 'userService',
   *   tags: ['database', 'user']
   * });
   * ```
   */
  register(mock: MockFunction, metadata: Partial<MockMetadata> = {}): string {
    // Check registry size limits
    if (mockRegistry.mocks.size >= MAX_REGISTRY_SIZE) {
      throw new Error(
        `Mock registry size limit exceeded (${MAX_REGISTRY_SIZE}). Consider cleaning up unused mocks.`,
      );
    }

    // Validate inputs
    if (!mock || typeof mock !== 'object') {
      throw new Error('Invalid mock: must be a valid mock object');
    }

    // Generate unique ID and create comprehensive metadata
    const id = this.generateMockId();
    const mockName =
      (mock as { getMockName?: () => string }).getMockName?.() || metadata.name || `mock-${id}`;

    // Capture creation stack for debugging (in development only)
    const creationStack =
      typeof process !== 'undefined' && process.env.NODE_ENV === 'development'
        ? new Error().stack
        : undefined;

    const fullMetadata: MockMetadata = {
      id,
      name: mockName,
      type: metadata.type || 'function',
      created: new Date(),
      lastUsed: null,
      group: metadata.group || null,
      tags: metadata.tags ? [...metadata.tags] : [],
      description: metadata.description || '',
      expectations: metadata.expectations ? [...metadata.expectations] : [],
      callCount: 0,
      creationStack,
    };

    // Store in registry with performance indexes
    mockRegistry.mocks.set(id, mock);
    mockRegistry.metadata.set(id, fullMetadata);
    mockRegistry.nameIndex.set(fullMetadata.name, id);

    // Update type index
    const typeSet = mockRegistry.typeIndex.get(fullMetadata.type) || new Set();
    typeSet.add(id);
    mockRegistry.typeIndex.set(fullMetadata.type, typeSet);

    // Add to group if specified
    if (fullMetadata.group) {
      this.addToGroup(id, fullMetadata.group);
    }

    // Update performance counters
    registryOperationCount++;

    // Trigger automatic cleanup if needed
    if (performanceMonitor.shouldTriggerCleanup()) {
      console.warn('Mock registry approaching capacity. Consider manual cleanup.');
      // Auto-cleanup unused mocks
      setTimeout(() => this.cleanup({ cleanupUnused: true }), 0);
    }

    return id;
  },

  /**
   * Unregister a mock and clean up all associated data.
   *
   * @param id - The mock ID to unregister
   * @returns true if successfully unregistered, false if not found
   *
   * @example
   * ```ts
   * const success = mockManager.unregister(mockId);
   * ```
   */
  unregister(id: string): boolean {
    const metadata = mockRegistry.metadata.get(id);
    if (!metadata) return false;

    // Validate ID format
    if (typeof id !== 'string' || !id.startsWith('mock-')) {
      throw new Error('Invalid mock ID format');
    }

    // Remove from group
    if (metadata.group) {
      this.removeFromGroup(id, metadata.group);
    }

    // Remove from performance indexes
    mockRegistry.nameIndex.delete(metadata.name);
    const typeSet = mockRegistry.typeIndex.get(metadata.type);
    if (typeSet) {
      typeSet.delete(id);
      if (typeSet.size === 0) {
        mockRegistry.typeIndex.delete(metadata.type);
      }
    }

    // Remove from registry
    mockRegistry.mocks.delete(id);
    mockRegistry.metadata.delete(id);

    registryOperationCount++;

    return true;
  },

  /**
   * Get a mock by ID with automatic usage tracking.
   *
   * @param id - The mock ID to retrieve
   * @returns The mock instance or null if not found
   *
   * @example
   * ```ts
   * const mock = mockManager.get(mockId);
   * if (mock) {
   *   // Use the mock
   * }
   * ```
   */
  get(id: string): MockFunction | null {
    const mock = mockRegistry.mocks.get(id) || null;

    // Track usage for performance monitoring
    if (mock) {
      this.markAsUsed(id);
    }

    return mock;
  },

  /**
   * Get mock metadata
   */
  getMetadata(id: string): MockMetadata | null {
    return mockRegistry.metadata.get(id) || null;
  },

  /**
   * Get all mocks
   */
  getAll(): Map<string, MockFunction> {
    return new Map(mockRegistry.mocks);
  },

  /**
   * Get all metadata
   */
  getAllMetadata(): Map<string, MockMetadata> {
    return new Map(mockRegistry.metadata);
  },

  /**
   * Find mocks by criteria
   */
  find(criteria: {
    name?: string;
    type?: MockMetadata['type'];
    group?: string;
    tags?: string[];
    unused?: boolean;
  }): Map<string, MockFunction> {
    const results = new Map<string, MockFunction>();

    for (const [id, metadata] of mockRegistry.metadata) {
      let matches = true;

      if (criteria.name && metadata.name !== criteria.name) {
        matches = false;
      }

      if (criteria.type && metadata.type !== criteria.type) {
        matches = false;
      }

      if (criteria.group && metadata.group !== criteria.group) {
        matches = false;
      }

      if (criteria.tags && !criteria.tags.every(tag => metadata.tags.includes(tag))) {
        matches = false;
      }

      if (criteria.unused !== undefined) {
        const mock = mockRegistry.mocks.get(id);
        const isUnused = mock && (mock as Mock).mock?.calls?.length === 0;
        if (criteria.unused !== isUnused) {
          matches = false;
        }
      }

      if (matches) {
        const mock = mockRegistry.mocks.get(id);
        if (mock) {
          results.set(id, mock);
        }
      }
    }

    return results;
  },

  /**
   * Update mock metadata
   */
  updateMetadata(id: string, updates: Partial<MockMetadata>): boolean {
    const metadata = mockRegistry.metadata.get(id);
    if (!metadata) return false;

    Object.assign(metadata, updates);
    mockRegistry.metadata.set(id, metadata);

    return true;
  },

  /**
   * Mark mock as used with call count tracking.
   *
   * @param id - The mock ID to mark as used
   * @returns true if successfully marked, false if not found
   */
  markAsUsed(id: string): boolean {
    const metadata = mockRegistry.metadata.get(id);
    if (!metadata) return false;

    // Update usage tracking
    metadata.lastUsed = new Date();
    metadata.callCount++;

    return true;
  },

  /**
   * Generate unique mock ID with collision detection.
   *
   * @returns Unique mock ID
   * @throws {Error} If unable to generate unique ID after multiple attempts
   */
  generateMockId(): string {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const id = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

      // Ensure uniqueness
      if (!mockRegistry.mocks.has(id)) {
        return id;
      }

      attempts++;
      // Small delay to ensure different timestamp
      if (attempts < maxAttempts) {
        // Synchronous delay for ID generation
        const start = Date.now();
        while (Date.now() - start < 1) {
          // Busy wait for 1ms
        }
      }
    }

    throw new Error(`Unable to generate unique mock ID after ${maxAttempts} attempts`);
  },

  /**
   * Create a mock group
   */
  createGroup(name: string, description = ''): boolean {
    if (mockRegistry.groups.has(name)) {
      return false;
    }

    mockRegistry.groups.set(name, new Set());
    return true;
  },

  /**
   * Delete a mock group
   */
  deleteGroup(name: string): boolean {
    const group = mockRegistry.groups.get(name);
    if (!group) return false;

    // Remove group from all mocks
    for (const mockId of group) {
      const metadata = mockRegistry.metadata.get(mockId);
      if (metadata && metadata.group === name) {
        metadata.group = null;
      }
    }

    mockRegistry.groups.delete(name);
    return true;
  },

  /**
   * Add mock to group
   */
  addToGroup(mockId: string, groupName: string): boolean {
    if (!mockRegistry.mocks.has(mockId)) return false;

    let group = mockRegistry.groups.get(groupName);
    if (!group) {
      group = new Set();
      mockRegistry.groups.set(groupName, group);
    }

    group.add(mockId);

    // Update metadata
    const metadata = mockRegistry.metadata.get(mockId);
    if (metadata) {
      metadata.group = groupName;
    }

    return true;
  },

  /**
   * Remove mock from group
   */
  removeFromGroup(mockId: string, groupName: string): boolean {
    const group = mockRegistry.groups.get(groupName);
    if (!group) return false;

    group.delete(mockId);

    // Update metadata
    const metadata = mockRegistry.metadata.get(mockId);
    if (metadata && metadata.group === groupName) {
      metadata.group = null;
    }

    return true;
  },

  /**
   * Get mocks in group
   */
  getGroup(groupName: string): Map<string, MockFunction> {
    const group = mockRegistry.groups.get(groupName);
    if (!group) return new Map();

    const results = new Map<string, MockFunction>();
    for (const mockId of group) {
      const mock = mockRegistry.mocks.get(mockId);
      if (mock) {
        results.set(mockId, mock);
      }
    }

    return results;
  },

  /**
   * Get all groups
   */
  getAllGroups(): Map<string, MockGroup> {
    const results = new Map<string, MockGroup>();

    for (const [name, mockIds] of mockRegistry.groups) {
      results.set(name, {
        name,
        mocks: Array.from(mockIds),
        created: new Date(), // This should be tracked better
        description: '',
      });
    }

    return results;
  },

  /**
   * Cleanup mocks based on options
   */
  cleanup(options: MockCleanupOptions = {}): number {
    const {
      restoreAll = false,
      clearAll = false,
      resetAll = false,
      specific = [],
      groups = [],
      cleanupUnused = false,
      ageThreshold = 0,
      dryRun = false,
      onCleanup,
    } = options;

    let cleanedCount = 0;

    // Handle specific mocks
    if (specific.length > 0) {
      for (const id of specific) {
        const metadata = mockRegistry.metadata.get(id);
        if (metadata) {
          if (!dryRun) {
            if (restoreAll) vi.restoreAllMocks();
            if (clearAll) vi.clearAllMocks();
            if (resetAll) vi.resetAllMocks();
            this.unregister(id);
          }

          if (onCleanup) {
            onCleanup(id, metadata);
          }

          cleanedCount++;
        }
      }
    }

    // Handle groups
    if (groups.length > 0) {
      for (const groupName of groups) {
        const groupMocks = this.getGroup(groupName);
        for (const [id] of groupMocks) {
          const metadata = mockRegistry.metadata.get(id);
          if (metadata) {
            if (!dryRun) {
              if (restoreAll) vi.restoreAllMocks();
              if (clearAll) vi.clearAllMocks();
              if (resetAll) vi.resetAllMocks();
              this.unregister(id);
            }

            if (onCleanup) {
              onCleanup(id, metadata);
            }

            cleanedCount++;
          }
        }
      }
    }

    // Handle unused mocks
    if (cleanupUnused) {
      const unusedMocks = this.find({ unused: true });
      for (const [id] of unusedMocks) {
        const metadata = mockRegistry.metadata.get(id);
        if (metadata) {
          if (!dryRun) {
            if (restoreAll) vi.restoreAllMocks();
            if (clearAll) vi.clearAllMocks();
            if (resetAll) vi.resetAllMocks();
            this.unregister(id);
          }

          if (onCleanup) {
            onCleanup(id, metadata);
          }

          cleanedCount++;
        }
      }
    }

    // Handle age threshold
    if (ageThreshold > 0) {
      const now = Date.now();
      const cutoff = now - ageThreshold;

      for (const [id, metadata] of mockRegistry.metadata) {
        if (metadata.created.getTime() < cutoff) {
          if (!dryRun) {
            if (restoreAll) vi.restoreAllMocks();
            if (clearAll) vi.clearAllMocks();
            if (resetAll) vi.resetAllMocks();
            this.unregister(id);
          }

          if (onCleanup) {
            onCleanup(id, metadata);
          }

          cleanedCount++;
        }
      }
    }

    // Handle global cleanup
    if (restoreAll || clearAll || resetAll) {
      if (!dryRun) {
        if (restoreAll) vi.restoreAllMocks();
        if (clearAll) vi.clearAllMocks();
        if (resetAll) vi.resetAllMocks();
      }
    }

    return cleanedCount;
  },

  /**
   * Get comprehensive registry statistics for monitoring and debugging.
   *
   * @returns Detailed statistics about the mock registry
   */
  getStats(): {
    total: number;
    byType: Record<string, number>;
    byGroup: Record<string, number>;
    used: number;
    unused: number;
    withTags: number;
    averageAge: number;
    memoryUsage: ReturnType<typeof performanceMonitor.getStats>['memoryUsage'];
    oldestMock: { id: string; age: number } | null;
    mostUsedMock: { id: string; callCount: number } | null;
  } {
    const total = mockRegistry.mocks.size;
    const byType: Record<string, number> = {};
    const byGroup: Record<string, number> = {};
    let used = 0;
    let unused = 0;
    let withTags = 0;
    let totalAge = 0;
    let oldestMock: { id: string; age: number } | null = null;
    let mostUsedMock: { id: string; callCount: number } | null = null;

    for (const [id, metadata] of mockRegistry.metadata) {
      // Count by type
      byType[metadata.type] = (byType[metadata.type] || 0) + 1;

      // Count by group
      if (metadata.group) {
        byGroup[metadata.group] = (byGroup[metadata.group] || 0) + 1;
      }

      // Count used/unused
      const mock = mockRegistry.mocks.get(id);
      if (mock && (mock as Mock).mock?.calls?.length > 0) {
        used++;
      } else {
        unused++;
      }

      // Count with tags
      if (metadata.tags.length > 0) {
        withTags++;
      }

      // Calculate age
      const age = Date.now() - metadata.created.getTime();
      totalAge += age;

      // Track oldest mock
      if (!oldestMock || age > oldestMock.age) {
        oldestMock = { id, age };
      }

      // Track most used mock
      if (!mostUsedMock || metadata.callCount > mostUsedMock.callCount) {
        mostUsedMock = { id, callCount: metadata.callCount };
      }
    }

    const perfStats = performanceMonitor.getStats();

    return {
      total,
      byType,
      byGroup,
      used,
      unused,
      withTags,
      averageAge: total > 0 ? totalAge / total : 0,
      memoryUsage: perfStats.memoryUsage,
      oldestMock,
      mostUsedMock,
    };
  },

  /**
   * Clear registry
   */
  clearRegistry(): void {
    mockRegistry.mocks.clear();
    mockRegistry.groups.clear();
    mockRegistry.metadata.clear();
    mockRegistry.nameIndex.clear();
    mockRegistry.typeIndex.clear();
    registryOperationCount = 0;
  },
};

// Mock discovery utilities
export const mockDiscovery = {
  /**
   * Auto-discover mocks in test files
   */
  async discoverMocks(options: MockDiscoveryOptions = {}): Promise<string[]> {
    const {
      patterns = ['**/*.mock.*', '**/__mocks__/**/*'],
      directories = ['src', 'tests', '__tests__'],
      extensions = ['.ts', '.js', '.tsx', '.jsx'],
      recursive = true,
      includeInternal = true,
      includePackages = true,
      includeProviders = true,
      maxFiles = 1000,
    } = options;

    const discovered: string[] = [];

    // This is a simplified implementation
    // In a real implementation, you'd use file system scanning

    // Discover internal mocks
    if (includeInternal) {
      discovered.push(...this.discoverInternalMocks());
    }

    // Discover package mocks
    if (includePackages) {
      discovered.push(...this.discoverPackageMocks());
    }

    // Discover provider mocks
    if (includeProviders) {
      discovered.push(...this.discoverProviderMocks());
    }

    return discovered.slice(0, maxFiles);
  },

  /**
   * Discover internal mocks
   */
  discoverInternalMocks(): string[] {
    // This would scan for internal mock files
    return ['src/mocks/user.mock.ts', 'src/mocks/api.mock.ts', 'src/mocks/database.mock.ts'];
  },

  /**
   * Discover package mocks
   */
  discoverPackageMocks(): string[] {
    // This would scan for package mock files
    return ['src/mocks/react.mock.ts', 'src/mocks/next.mock.ts', 'src/mocks/prisma.mock.ts'];
  },

  /**
   * Discover provider mocks
   */
  discoverProviderMocks(): string[] {
    // This would scan for provider mock files
    return ['src/mocks/auth.mock.ts', 'src/mocks/analytics.mock.ts', 'src/mocks/payments.mock.ts'];
  },

  /**
   * Get mock usage in test files
   */
  async getMockUsage(mockPath: string): Promise<{
    files: string[];
    usage: Array<{
      file: string;
      line: number;
      context: string;
    }>;
  }> {
    // This would analyze test files for mock usage
    return {
      files: ['src/test.spec.ts'],
      usage: [
        {
          file: 'src/test.spec.ts',
          line: 10,
          context: 'import { mockUser } from "./mocks/user.mock"',
        },
      ],
    };
  },

  /**
   * Find unused mocks
   */
  async findUnusedMocks(): Promise<string[]> {
    const discoveredMocks = await this.discoverMocks();
    const unusedMocks: string[] = [];

    for (const mockPath of discoveredMocks) {
      const usage = await this.getMockUsage(mockPath);
      if (usage.files.length === 0) {
        unusedMocks.push(mockPath);
      }
    }

    return unusedMocks;
  },

  /**
   * Generate mock dependency graph
   */
  async generateDependencyGraph(): Promise<Map<string, string[]>> {
    const dependencyGraph = new Map<string, string[]>();
    const discoveredMocks = await this.discoverMocks();

    for (const mockPath of discoveredMocks) {
      const usage = await this.getMockUsage(mockPath);
      dependencyGraph.set(mockPath, usage.files);
    }

    return dependencyGraph;
  },
};

// Export performance monitor for external access
export { performanceMonitor };

// Export all utilities
export default {
  mockManager,
  mockDiscovery,
  mockRegistry,
  performanceMonitor,
};
