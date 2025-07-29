/**
 * Mock manager utilities for Vitest
 * This file provides utilities for managing mocks throughout the test lifecycle
 */

import { Mock, vi } from 'vitest';

// Mock manager types
export interface MockRegistry {
  mocks: Map<string, Mock>;
  groups: Map<string, Set<string>>;
  metadata: Map<string, MockMetadata>;
}

export interface MockMetadata {
  id: string;
  name: string;
  type: 'function' | 'module' | 'class' | 'object';
  created: Date;
  lastUsed: Date | null;
  group: string | null;
  tags: string[];
  description: string;
  expectations: any[];
}

export interface MockGroup {
  name: string;
  mocks: string[];
  created: Date;
  description: string;
}

export interface MockDiscoveryOptions {
  /**
   * Patterns to search for mocks
   */
  patterns?: string[];

  /**
   * Directories to search in
   */
  directories?: string[];

  /**
   * File extensions to include
   */
  extensions?: string[];

  /**
   * Whether to search recursively
   */
  recursive?: boolean;

  /**
   * Whether to include internal mocks
   */
  includeInternal?: boolean;

  /**
   * Whether to include package mocks
   */
  includePackages?: boolean;

  /**
   * Whether to include provider mocks
   */
  includeProviders?: boolean;
}

export interface MockCleanupOptions {
  /**
   * Whether to restore all mocks
   */
  restoreAll?: boolean;

  /**
   * Whether to clear all mocks
   */
  clearAll?: boolean;

  /**
   * Whether to reset all mocks
   */
  resetAll?: boolean;

  /**
   * Specific mock IDs to cleanup
   */
  specific?: string[];

  /**
   * Groups to cleanup
   */
  groups?: string[];

  /**
   * Whether to cleanup unused mocks
   */
  cleanupUnused?: boolean;

  /**
   * Age threshold for cleanup (in milliseconds)
   */
  ageThreshold?: number;
}

// Global mock registry
const mockRegistry: MockRegistry = {
  mocks: new Map(),
  groups: new Map(),
  metadata: new Map(),
};

// Mock manager utilities
export const mockManager = {
  /**
   * Register a mock
   */
  register(mock: Mock, metadata: Partial<MockMetadata> = {}): string {
    const id = this.generateMockId();
    const fullMetadata: MockMetadata = {
      id,
      name: metadata.name || mock.getMockName() || `mock-${id}`,
      type: metadata.type || 'function',
      created: new Date(),
      lastUsed: null,
      group: metadata.group || null,
      tags: metadata.tags || [],
      description: metadata.description || '',
      expectations: metadata.expectations || [],
    };

    mockRegistry.mocks.set(id, mock);
    mockRegistry.metadata.set(id, fullMetadata);

    // Add to group if specified
    if (fullMetadata.group) {
      this.addToGroup(id, fullMetadata.group);
    }

    return id;
  },

  /**
   * Unregister a mock
   */
  unregister(id: string): boolean {
    const metadata = mockRegistry.metadata.get(id);
    if (!metadata) return false;

    // Remove from group
    if (metadata.group) {
      this.removeFromGroup(id, metadata.group);
    }

    // Remove from registry
    mockRegistry.mocks.delete(id);
    mockRegistry.metadata.delete(id);

    return true;
  },

  /**
   * Get a mock by ID
   */
  get(id: string): Mock | null {
    return mockRegistry.mocks.get(id) || null;
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
  getAll(): Map<string, Mock> {
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
  }): Map<string, Mock> {
    const results = new Map<string, Mock>();

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
        const isUnused = mock && mock.mock.calls.length === 0;
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
   * Mark mock as used
   */
  markAsUsed(id: string): boolean {
    const metadata = mockRegistry.metadata.get(id);
    if (!metadata) return false;

    metadata.lastUsed = new Date();
    return true;
  },

  /**
   * Generate unique mock ID
   */
  generateMockId(): string {
    return `mock-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
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
  getGroup(groupName: string): Map<string, Mock> {
    const group = mockRegistry.groups.get(groupName);
    if (!group) return new Map();

    const results = new Map<string, Mock>();
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
    } = options;

    let cleanedCount = 0;

    // Handle specific mocks
    if (specific.length > 0) {
      for (const id of specific) {
        const mock = mockRegistry.mocks.get(id);
        if (mock) {
          if (restoreAll) vi.restoreAllMocks();
          if (clearAll) vi.clearAllMocks();
          if (resetAll) vi.resetAllMocks();

          this.unregister(id);
          cleanedCount++;
        }
      }
    }

    // Handle groups
    if (groups.length > 0) {
      for (const groupName of groups) {
        const groupMocks = this.getGroup(groupName);
        for (const [id, mock] of groupMocks) {
          if (restoreAll) vi.restoreAllMocks();
          if (clearAll) vi.clearAllMocks();
          if (resetAll) vi.resetAllMocks();

          this.unregister(id);
          cleanedCount++;
        }
      }
    }

    // Handle unused mocks
    if (cleanupUnused) {
      const unusedMocks = this.find({ unused: true });
      for (const [id, mock] of unusedMocks) {
        if (restoreAll) vi.restoreAllMocks();
        if (clearAll) vi.clearAllMocks();
        if (resetAll) vi.resetAllMocks();

        this.unregister(id);
        cleanedCount++;
      }
    }

    // Handle age threshold
    if (ageThreshold > 0) {
      const now = Date.now();
      const cutoff = now - ageThreshold;

      for (const [id, metadata] of mockRegistry.metadata) {
        if (metadata.created.getTime() < cutoff) {
          const mock = mockRegistry.mocks.get(id);
          if (mock) {
            if (restoreAll) vi.restoreAllMocks();
            if (clearAll) vi.clearAllMocks();
            if (resetAll) vi.resetAllMocks();

            this.unregister(id);
            cleanedCount++;
          }
        }
      }
    }

    // Handle global cleanup
    if (restoreAll || clearAll || resetAll) {
      if (restoreAll) vi.restoreAllMocks();
      if (clearAll) vi.clearAllMocks();
      if (resetAll) vi.resetAllMocks();
    }

    return cleanedCount;
  },

  /**
   * Get registry statistics
   */
  getStats(): {
    total: number;
    byType: Record<string, number>;
    byGroup: Record<string, number>;
    used: number;
    unused: number;
    withTags: number;
    averageAge: number;
  } {
    const total = mockRegistry.mocks.size;
    const byType: Record<string, number> = {};
    const byGroup: Record<string, number> = {};
    let used = 0;
    let unused = 0;
    let withTags = 0;
    let totalAge = 0;

    for (const [id, metadata] of mockRegistry.metadata) {
      // Count by type
      byType[metadata.type] = (byType[metadata.type] || 0) + 1;

      // Count by group
      if (metadata.group) {
        byGroup[metadata.group] = (byGroup[metadata.group] || 0) + 1;
      }

      // Count used/unused
      const mock = mockRegistry.mocks.get(id);
      if (mock && mock.mock.calls.length > 0) {
        used++;
      } else {
        unused++;
      }

      // Count with tags
      if (metadata.tags.length > 0) {
        withTags++;
      }

      // Calculate age
      totalAge += Date.now() - metadata.created.getTime();
    }

    return {
      total,
      byType,
      byGroup,
      used,
      unused,
      withTags,
      averageAge: total > 0 ? totalAge / total : 0,
    };
  },

  /**
   * Clear registry
   */
  clearRegistry(): void {
    mockRegistry.mocks.clear();
    mockRegistry.groups.clear();
    mockRegistry.metadata.clear();
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

    return discovered;
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

// Export all utilities
export default {
  mockManager,
  mockDiscovery,
  mockRegistry,
};
