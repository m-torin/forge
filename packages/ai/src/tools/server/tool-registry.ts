/**
 * Unified Tool Registry for AI SDK Tools
 * A flexible registry that supports simple to advanced use cases
 */

import { logDebug, logError } from "@repo/observability/server/next";
import type { Tool } from "ai";

/**
 * Tool metadata for discovery and categorization
 */
export interface ToolMetadata {
  name: string;
  description: string;
  category: string;
  tags: string[];
  security?: "low" | "medium" | "high";
  version?: string;
  author?: string;
  // Extended metadata for advanced features
  complexity?: "simple" | "moderate" | "complex";
  reliability?: number;
  performance?: number;
  cost?: number;
  dependencies?: string[];
  conflicts?: string[];
  requirements?: {
    minAgentCapability?: string;
    requiredPermissions?: string[];
    environmentVariables?: string[];
    externalServices?: string[];
  };
  usage?: {
    callCount: number;
    successRate: number;
    averageExecutionTime: number;
    lastUsed: number;
  };
  isActive?: boolean;
}

/**
 * Tool execution context for factory pattern
 */
export interface ToolContext {
  userId?: string;
  sessionId?: string;
  apiKeys?: Record<string, string>;
  config?: Record<string, any>;
  [key: string]: any;
}

/**
 * Dynamic tool loader interface
 */
export interface DynamicToolLoader {
  loadTool(toolId: string): Promise<Tool>;
  unloadTool(toolId: string): Promise<void>;
  isToolAvailable(toolId: string): Promise<boolean>;
  getToolMetadata(toolId: string): Promise<ToolMetadata | null>;
}

/**
 * Tool execution result for performance tracking
 */
interface ToolExecutionResult {
  toolId: string;
  success: boolean;
  result?: any;
  error?: Error;
  executionTime: number;
  metadata?: Record<string, any>;
}

/**
 * Performance metrics for a tool
 */
interface ToolPerformanceMetrics {
  toolId: string;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  averageExecutionTime: number;
  totalExecutionTime: number;
  successRate: number;
  lastUpdated: number;
}

/**
 * Configuration for ToolRegistry
 */
export interface ToolRegistryConfig {
  // Enable performance tracking
  enablePerformanceTracking?: boolean;
  // Enable caching
  cache?: {
    enabled?: boolean;
    ttl?: number;
    maxSize?: number;
  };
  // Enable dynamic loading
  enableDynamicLoading?: boolean;
}

/**
 * Unified Tool Registry
 * Supports basic usage with optional advanced features
 */
export class ToolRegistry {
  // Core storage
  private tools = new Map<string, Tool>();
  private metadata = new Map<string, ToolMetadata>();
  private factories = new Map<string, (context: ToolContext) => Tool>();

  // Optional advanced features
  private performanceMetrics?: Map<string, ToolPerformanceMetrics>;
  private cache?: Map<string, { tool: Tool; expiresAt: number }>;
  private loaders?: Map<string, DynamicToolLoader>;
  private executionHistory?: ToolExecutionResult[];

  private config: ToolRegistryConfig;

  constructor(config: ToolRegistryConfig = {}) {
    this.config = config;

    // Initialize optional features based on config
    if (config.enablePerformanceTracking) {
      this.performanceMetrics = new Map();
      this.executionHistory = [];
    }

    if (config.cache?.enabled) {
      this.cache = new Map();
    }

    if (config.enableDynamicLoading) {
      this.loaders = new Map();
    }

    logDebug("Tool Registry initialized", {
      operation: "tool_registry_init",
      metadata: {
        performanceTracking: config.enablePerformanceTracking,
        caching: config.cache?.enabled,
        dynamicLoading: config.enableDynamicLoading,
      },
    });
  }

  /**
   * Register a tool
   */
  register(name: string, tool: Tool, metadata?: ToolMetadata): void {
    this.tools.set(name, tool);

    if (metadata) {
      this.metadata.set(name, metadata);
    }

    if (this.performanceMetrics) {
      this.initializePerformanceMetrics(name);
    }

    logDebug("Tool registered", {
      operation: "tool_register",
      metadata: { name, hasMetadata: !!metadata },
    });
  }

  /**
   * Register a tool factory for dynamic creation
   */
  registerFactory(
    name: string,
    factory: (context: ToolContext) => Tool,
    metadata?: ToolMetadata,
  ): void {
    this.factories.set(name, factory);

    if (metadata) {
      this.metadata.set(name, metadata);
    }

    logDebug("Tool factory registered", {
      operation: "tool_factory_register",
      metadata: { name },
    });
  }

  /**
   * Register a dynamic loader for lazy loading
   */
  registerLoader(category: string, loader: DynamicToolLoader): void {
    if (!this.loaders) {
      throw new Error(
        "Dynamic loading not enabled. Initialize with { enableDynamicLoading: true }",
      );
    }

    this.loaders.set(category, loader);

    logDebug("Tool loader registered", {
      operation: "tool_loader_register",
      metadata: { category },
    });
  }

  /**
   * Get a tool by name
   */
  get(name: string, context?: ToolContext): Tool | undefined {
    // Check static tools first
    const staticTool = this.tools.get(name);
    if (staticTool) return staticTool;

    // Check cache if enabled
    if (this.cache) {
      const cached = this.cache.get(name);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.tool;
      }
    }

    // Check factories
    const factory = this.factories.get(name);
    if (factory && context) {
      const tool = factory(context);

      // Cache if enabled
      if (this.cache && this.config.cache?.enabled) {
        const ttl = this.config.cache.ttl ?? 3600000;
        this.cache.set(name, {
          tool,
          expiresAt: Date.now() + ttl,
        });
        this.cleanupCache();
      }

      return tool;
    }

    return undefined;
  }

  /**
   * Get all tools
   */
  getAll(context?: ToolContext): Record<string, Tool> {
    const result: Record<string, Tool> = {};

    // Add static tools
    for (const [name, tool] of this.tools) {
      result[name] = tool;
    }

    // Add factory-created tools if context provided
    if (context) {
      for (const [name, factory] of this.factories) {
        if (!result[name]) {
          result[name] = factory(context);
        }
      }
    }

    return result;
  }

  /**
   * Get tools by category
   */
  getByCategory(category: string, context?: ToolContext): Record<string, Tool> {
    const result: Record<string, Tool> = {};

    for (const [name, meta] of this.metadata) {
      if (meta.category === category) {
        const tool = this.get(name, context);
        if (tool) {
          result[name] = tool;
        }
      }
    }

    return result;
  }

  /**
   * Get tools by tags
   */
  getByTags(tags: string[], context?: ToolContext): Record<string, Tool> {
    const result: Record<string, Tool> = {};

    for (const [name, meta] of this.metadata) {
      if (meta.tags && tags.some((tag) => meta.tags.includes(tag))) {
        const tool = this.get(name, context);
        if (tool) {
          result[name] = tool;
        }
      }
    }

    return result;
  }

  /**
   * Get tool metadata
   */
  getMetadata(name: string): ToolMetadata | undefined {
    return this.metadata.get(name);
  }

  /**
   * Get all metadata
   */
  getAllMetadata(): Record<string, ToolMetadata> {
    const result: Record<string, ToolMetadata> = {};
    for (const [name, metadata] of this.metadata) {
      result[name] = metadata;
    }
    return result;
  }

  /**
   * Load tool dynamically
   */
  async loadTool(toolId: string, category?: string): Promise<Tool> {
    if (!this.loaders) {
      throw new Error(
        "Dynamic loading not enabled. Initialize with { enableDynamicLoading: true }",
      );
    }

    // Check if already loaded
    const existing = this.tools.get(toolId);
    if (existing) return existing;

    // Find appropriate loader
    const loader = category
      ? this.loaders.get(category)
      : this.loaders.values().next().value;
    if (!loader) {
      throw new Error(`No loader available for tool: ${toolId}`);
    }

    try {
      const tool = await loader.loadTool(toolId);
      this.tools.set(toolId, tool);

      // Get and store metadata if available
      const meta = await loader.getToolMetadata(toolId);
      if (meta) {
        this.metadata.set(toolId, meta);
      }

      return tool;
    } catch (error) {
      logError("Failed to load tool dynamically", {
        operation: "tool_load_failed",
        metadata: { toolId },
        error: error as Error,
      });
      throw error;
    }
  }

  /**
   * Execute tool with tracking
   */
  async executeTool(
    toolId: string,
    args: any,
    context?: Record<string, any>,
  ): Promise<any> {
    const tool = this.get(toolId);
    if (!tool) throw new Error(`Tool not found: ${toolId}`);

    if (!this.performanceMetrics) {
      // Just execute without tracking
      return (
        (await tool.execute?.(args, {
          toolCallId: `tool-${Date.now()}`,
          messages: [],
        })) || null
      );
    }

    const startTime = Date.now();
    let result: ToolExecutionResult | undefined;

    try {
      const toolResult =
        (await tool.execute?.(args, {
          toolCallId: `tool-${Date.now()}`,
          messages: [],
        })) || null;
      const executionTime = Date.now() - startTime;

      result = {
        toolId,
        success: true,
        result: toolResult,
        executionTime,
        metadata: context,
      };

      this.updatePerformanceMetrics(result);

      return toolResult;
    } catch (error) {
      const executionTime = Date.now() - startTime;

      result = {
        toolId,
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        executionTime,
        metadata: context,
      };

      this.updatePerformanceMetrics(result);

      throw error;
    } finally {
      if (this.executionHistory && result) {
        this.executionHistory.push(result);
      }
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics(
    toolId?: string,
  ): ToolPerformanceMetrics | Map<string, ToolPerformanceMetrics> | null {
    if (!this.performanceMetrics) {
      return null;
    }

    if (toolId) {
      return this.performanceMetrics.get(toolId) || null;
    }

    return new Map(this.performanceMetrics);
  }

  /**
   * Generate usage report
   */
  generateUsageReport(): {
    totalTools: number;
    activeTools: number;
    totalExecutions: number;
    overallSuccessRate: number;
    topPerformingTools: string[];
    underperformingTools: string[];
  } | null {
    if (!this.performanceMetrics || !this.executionHistory) {
      return null;
    }

    const allMetadata = Array.from(this.metadata.values());
    const totalTools = this.tools.size + this.factories.size;
    const activeTools = allMetadata.filter((m) => m.isActive !== false).length;

    const totalExecutions = this.executionHistory.length;
    const successfulExecutions = this.executionHistory.filter(
      (r) => r.success,
    ).length;
    const overallSuccessRate =
      totalExecutions > 0 ? successfulExecutions / totalExecutions : 0;

    const sortedMetrics = Array.from(this.performanceMetrics.entries()).sort(
      ([, a], [, b]) => b.successRate - a.successRate,
    );

    const topPerformingTools = sortedMetrics
      .slice(0, 5)
      .filter(([, metrics]) => metrics.successRate >= 0.8)
      .map(([toolId]) => toolId);

    const underperformingTools = sortedMetrics
      .slice(-5)
      .filter(
        ([, metrics]) => metrics.successRate < 0.5 && metrics.totalCalls > 5,
      )
      .map(([toolId]) => toolId);

    return {
      totalTools,
      activeTools,
      totalExecutions,
      overallSuccessRate,
      topPerformingTools,
      underperformingTools,
    };
  }

  /**
   * Clear all tools
   */
  clear(): void {
    this.tools.clear();
    this.factories.clear();
    this.metadata.clear();

    if (this.cache) {
      this.cache.clear();
    }

    if (this.performanceMetrics) {
      this.performanceMetrics.clear();
    }

    if (this.executionHistory) {
      this.executionHistory = [];
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    if (this.cache) {
      this.cache.clear();
    }
  }

  /**
   * Get tool names
   */
  getNames(): string[] {
    const names = new Set<string>();

    for (const name of this.tools.keys()) {
      names.add(name);
    }

    for (const name of this.factories.keys()) {
      names.add(name);
    }

    return Array.from(names);
  }

  /**
   * Private helper methods
   */
  private initializePerformanceMetrics(toolId: string): void {
    if (!this.performanceMetrics) return;

    this.performanceMetrics.set(toolId, {
      toolId,
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      averageExecutionTime: 0,
      totalExecutionTime: 0,
      successRate: 0,
      lastUpdated: Date.now(),
    });
  }

  private updatePerformanceMetrics(result: ToolExecutionResult): void {
    if (!this.performanceMetrics) return;

    const metrics = this.performanceMetrics.get(result.toolId);
    if (!metrics) return;

    metrics.totalCalls += 1;

    if (result.success) {
      metrics.successfulCalls += 1;
    } else {
      metrics.failedCalls += 1;
    }

    metrics.totalExecutionTime += result.executionTime;
    metrics.averageExecutionTime =
      metrics.totalExecutionTime / metrics.totalCalls;
    metrics.successRate = metrics.successfulCalls / metrics.totalCalls;
    metrics.lastUpdated = Date.now();
  }

  private cleanupCache(): void {
    if (!this.cache || !this.config.cache?.maxSize) return;

    if (this.cache.size >= this.config.cache.maxSize) {
      // Remove expired entries first
      const now = Date.now();
      for (const [toolId, cached] of this.cache.entries()) {
        if (cached.expiresAt <= now) {
          this.cache.delete(toolId);
        }
      }

      // If still over limit, remove oldest entries
      if (this.cache.size >= this.config.cache.maxSize) {
        const entries = Array.from(this.cache.entries());
        entries.sort(([, a], [, b]) => a.expiresAt - b.expiresAt);

        const toRemove = entries.slice(
          0,
          Math.floor(this.config.cache.maxSize * 0.2),
        );
        toRemove.forEach(([toolId]) => this.cache?.delete(toolId));
      }
    }
  }
}

/**
 * Create a simple tool registry (no advanced features)
 */
export function createSimpleToolRegistry(): ToolRegistry {
  return new ToolRegistry();
}

/**
 * Create a standard tool registry with performance tracking
 */
export function createStandardToolRegistry(): ToolRegistry {
  return new ToolRegistry({
    enablePerformanceTracking: true,
  });
}

/**
 * Create a dynamic tool registry with all features
 */
export function createDynamicToolRegistry(): ToolRegistry {
  return new ToolRegistry({
    enablePerformanceTracking: true,
    cache: {
      enabled: true,
      ttl: 3600000, // 1 hour
      maxSize: 100,
    },
    enableDynamicLoading: true,
  });
}

/**
 * Global tool registry instance
 */
export const globalToolRegistry = createStandardToolRegistry();

/**
 * Helper to create tools from registry
 */
export function createToolsFromRegistry(
  registry: ToolRegistry,
  context?: ToolContext,
  filter?: {
    categories?: string[];
    tags?: string[];
    names?: string[];
  },
): Record<string, Tool> {
  if (!filter) {
    return registry.getAll(context);
  }

  const result: Record<string, Tool> = {};

  if (filter.names) {
    for (const name of filter.names) {
      const tool = registry.get(name, context);
      if (tool) {
        result[name] = tool;
      }
    }
    return result;
  }

  if (filter.categories) {
    for (const category of filter.categories) {
      Object.assign(result, registry.getByCategory(category, context));
    }
  }

  if (filter.tags) {
    Object.assign(result, registry.getByTags(filter.tags, context));
  }

  return result;
}
