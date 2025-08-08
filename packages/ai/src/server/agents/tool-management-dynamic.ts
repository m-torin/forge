/**
 * AI SDK v5 Dynamic Tool Management and Loading
 * Sophisticated tool management system for agents with dynamic loading capabilities
 */

import { logDebug, logError, logInfo, logWarn } from '@repo/observability/server/next';
import type { Tool } from 'ai';
import { z } from 'zod/v4';
import {
  ToolRegistry as UnifiedToolRegistry,
  createDynamicToolRegistry,
  type ToolMetadata as UnifiedToolMetadata,
} from '../tools/tool-registry';

/**
 * Tool metadata for advanced management
 */
export interface ToolMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  author: string;
  tags: string[];
  complexity: 'simple' | 'moderate' | 'complex';
  reliability: number; // 0-1 scale
  performance: number; // 0-1 scale
  cost: number; // relative cost metric
  dependencies: string[]; // other tool IDs this tool depends on
  conflicts: string[]; // tool IDs this tool conflicts with
  requirements: {
    minAgentCapability?: string;
    requiredPermissions?: string[];
    environmentVariables?: string[];
    externalServices?: string[];
  };
  security?: 'low' | 'medium' | 'high';
  usage: {
    callCount: number;
    successRate: number;
    averageExecutionTime: number;
    lastUsed: number;
  };
  isActive: boolean;
  isLoaded: boolean;
  loadedAt?: number;
}

/**
 * Tool execution context
 */
export interface ToolExecutionContext {
  agentId: string;
  sessionId: string;
  stepNumber: number;
  previousResults: any[];
  availableTools: string[];
  executionLimits: {
    maxCalls?: number;
    timeout?: number;
    retryAttempts?: number;
  };
}

/**
 * Tool selection criteria
 */
export interface ToolSelectionCriteria {
  categories?: string[];
  tags?: string[];
  complexity?: ('simple' | 'moderate' | 'complex')[];
  minReliability?: number;
  maxCost?: number;
  excludeTools?: string[];
  requirePermissions?: string[];
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
 * Tool execution result with enhanced metrics
 */
export interface ToolExecutionResult {
  toolId: string;
  success: boolean;
  result?: any;
  error?: Error;
  executionTime: number;
  tokensUsed?: number;
  cost?: number;
  metadata: Record<string, any>;
}

/**
 * Tool performance metrics
 */
export interface ToolPerformanceMetrics {
  toolId: string;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  averageExecutionTime: number;
  totalExecutionTime: number;
  successRate: number;
  reliability: number;
  costEfficiency: number;
  lastUpdated: number;
}

/**
 * Advanced tool management system
 * Now wraps the unified ToolRegistry for consistency
 * @deprecated Use tools.create() with advanced options or ToolRegistry directly
 */
export class DynamicToolManager {
  private registry: UnifiedToolRegistry;
  private toolLoaders = new Map<string, DynamicToolLoader>();
  private executionHistory: ToolExecutionResult[] = [];
  private toolMetadata = new Map<string, ToolMetadata>();
  private performanceMetrics = new Map<string, any>();

  constructor(
    private config: {
      cacheEnabled: boolean;
      cacheTtl: number;
      maxCacheSize: number;
      performanceTracking: boolean;
      autoOptimization: boolean;
    } = {
      cacheEnabled: true,
      cacheTtl: 3600000, // 1 hour
      maxCacheSize: 100,
      performanceTracking: true,
      autoOptimization: true,
    },
  ) {
    // Create unified registry with advanced features
    this.registry = createDynamicToolRegistry();

    logDebug('Dynamic Tool Manager: Initialized with unified registry', {
      operation: 'advanced_tool_manager_init',
      metadata: { config },
    });
  }

  /**
   * Register a tool with metadata
   */
  registerTool(tool: Tool, metadata: Omit<ToolMetadata, 'usage' | 'isLoaded' | 'loadedAt'>): void {
    // Convert to unified metadata format
    const unifiedMetadata: Partial<UnifiedToolMetadata> = {
      name: metadata.name,
      description: metadata.description,
      category: metadata.category,
      tags: metadata.tags,
      security: metadata.security,
      version: metadata.version,
      author: metadata.author,
      complexity: metadata.complexity,
      reliability: metadata.reliability,
      performance: metadata.performance,
      cost: metadata.cost,
      dependencies: metadata.dependencies,
      conflicts: metadata.conflicts,
      requirements: metadata.requirements,
      isActive: metadata.isActive,
      usage: {
        callCount: 0,
        successRate: 0,
        averageExecutionTime: 0,
        lastUsed: 0,
      },
    };

    this.registry.register(metadata.id, tool, unifiedMetadata as UnifiedToolMetadata);

    logDebug('Dynamic Tool Manager: Tool registered', {
      operation: 'tool_registered',
      metadata: { toolId: metadata.id, category: metadata.category },
    });
  }

  /**
   * Register dynamic tool loader
   */
  registerToolLoader(category: string, loader: DynamicToolLoader): void {
    this.toolLoaders.set(category, loader);
    this.registry.registerLoader(category, loader);

    logDebug('Dynamic Tool Manager: Tool loader registered', {
      operation: 'tool_loader_registered',
      metadata: { category },
    });
  }

  /**
   * Load tool dynamically
   */
  async loadTool(toolId: string): Promise<Tool> {
    try {
      // Use unified registry's dynamic loading
      const metadata = this.registry.getMetadata(toolId);
      const category = metadata?.category;

      return await this.registry.loadTool(toolId, category);
    } catch (error) {
      logError('Dynamic Tool Manager: Failed to load tool', {
        operation: 'tool_load_failed',
        metadata: { toolId },
        error: error as Error,
      });
      throw error;
    }
  }

  /**
   * Get tools matching selection criteria
   */
  async getTools(criteria: ToolSelectionCriteria = {}): Promise<Record<string, Tool>> {
    const allMetadata = this.registry.getAllMetadata();
    const matchingTools: Record<string, Tool> = {};

    for (const [toolId, metadata] of Object.entries(allMetadata)) {
      if (this.matchesCriteria(metadata as ToolMetadata, criteria)) {
        try {
          const tool = await this.loadTool(toolId);
          if (tool) {
            matchingTools[toolId] = tool;
          }
        } catch (_error) {
          logWarn('Dynamic Tool Manager: Failed to load matching tool', {
            operation: 'tool_load_warning',
            metadata: { toolId },
          });
        }
      }
    }

    return matchingTools;
  }

  /**
   * Get recommended tools for specific context
   */
  async getRecommendedTools(
    context: ToolExecutionContext,
    maxTools: number = 10,
  ): Promise<Record<string, Tool>> {
    const allMetadata = Array.from(this.toolMetadata.values());

    // Score tools based on various factors
    const scoredTools = allMetadata.map(metadata => {
      const score = this.calculateToolScore(metadata, context);
      return { metadata, score };
    });

    // Sort by score and take top tools
    const topTools = scoredTools.sort((a, b) => b.score - a.score).slice(0, maxTools);

    const recommendedTools: Record<string, Tool> = {};

    for (const { metadata } of topTools) {
      try {
        const tool = await this.loadTool(metadata.id);
        recommendedTools[metadata.id] = tool;
      } catch (_error) {
        logWarn('Dynamic Tool Manager: Failed to load recommended tool', {
          operation: 'recommended_tool_load_failed',
          metadata: { toolId: metadata.id },
        });
      }
    }

    return recommendedTools;
  }

  /**
   * Execute tool with enhanced tracking
   */
  async executeTool(
    toolId: string,
    args: any,
    context: ToolExecutionContext,
  ): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    let result: ToolExecutionResult;

    try {
      // Use registry's execute with tracking
      const toolResult = await this.registry.executeTool(toolId, args, {
        agentId: context.agentId,
        sessionId: context.sessionId,
        stepNumber: context.stepNumber,
      });

      const executionTime = Date.now() - startTime;

      result = {
        toolId,
        success: true,
        result: toolResult,
        executionTime,
        metadata: {
          agentId: context.agentId,
          sessionId: context.sessionId,
          stepNumber: context.stepNumber,
        },
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      result = {
        toolId,
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        executionTime,
        metadata: {
          agentId: context.agentId,
          sessionId: context.sessionId,
          stepNumber: context.stepNumber,
        },
      };

      logError('Dynamic Tool Manager: Tool execution failed', {
        operation: 'tool_execution_failed',
        metadata: { toolId, executionTime },
        error: error as Error,
      });
    }

    if (this.config.performanceTracking) {
      this.executionHistory.push(result);
    }

    return result;
  }

  /**
   * Get tool performance metrics
   */
  getToolMetrics(toolId: string): ToolPerformanceMetrics | null {
    const metrics = this.registry.getMetrics(toolId);
    if (metrics && typeof metrics !== 'object') {
      return metrics as ToolPerformanceMetrics;
    }
    return null;
  }

  /**
   * Get all tool metadata
   */
  getAllToolMetadata(): ToolMetadata[] {
    const allMetadata = this.registry.getAllMetadata();
    return Object.values(allMetadata).map(
      meta =>
        ({
          ...meta,
          id: meta.name,
          isLoaded: true,
          loadedAt: Date.now(),
        }) as ToolMetadata,
    );
  }

  /**
   * Update tool metadata
   */
  updateToolMetadata(toolId: string, updates: Partial<ToolMetadata>): boolean {
    const currentMeta = this.registry.getMetadata(toolId);
    if (!currentMeta) {
      return false;
    }

    // Get tool and re-register with updated metadata
    const tool = this.registry.get(toolId);
    if (tool) {
      this.registry.register(toolId, tool, {
        ...currentMeta,
        ...updates,
      } as UnifiedToolMetadata);

      logDebug('Dynamic Tool Manager: Tool metadata updated', {
        operation: 'tool_metadata_updated',
        metadata: { toolId },
      });

      return true;
    }

    return false;
  }

  /**
   * Optimize tool selection based on historical performance
   */
  optimizeToolSelection(): void {
    if (!this.config.autoOptimization) {
      return;
    }

    for (const [toolId, metrics] of this.performanceMetrics.entries()) {
      const metadata = this.toolMetadata.get(toolId);
      if (!metadata) continue;

      // Update reliability based on success rate
      metadata.reliability = Math.max(0.1, metrics.successRate);

      // Update performance based on execution time efficiency
      if (metrics.averageExecutionTime > 0) {
        const performanceScore = Math.max(0.1, 1 - metrics.averageExecutionTime / 10000);
        metadata.performance = performanceScore;
      }

      // Deactivate consistently failing tools
      if (metrics.successRate < 0.3 && metrics.totalCalls > 10) {
        metadata.isActive = false;
        logWarn('Dynamic Tool Manager: Tool deactivated due to poor performance', {
          operation: 'tool_deactivated',
          metadata: { toolId, successRate: metrics.successRate },
        });
      }
    }

    logDebug('Dynamic Tool Manager: Tool selection optimized', {
      operation: 'tool_selection_optimized',
    });
  }

  /**
   * Generate tool usage report
   */
  generateUsageReport(): {
    totalTools: number;
    activeTools: number;
    loadedTools: number;
    totalExecutions: number;
    overallSuccessRate: number;
    topPerformingTools: string[];
    underperformingTools: string[];
    recommendations: string[];
  } {
    // Get report from unified registry
    const registryReport = this.registry.generateUsageReport();

    if (!registryReport) {
      // Fallback if registry doesn't have tracking enabled
      const allMetadata = this.getAllToolMetadata();
      const totalTools = allMetadata.length;
      const activeTools = allMetadata.filter(m => m.isActive).length;
      const loadedTools = totalTools; // All are considered loaded

      const totalExecutions = this.executionHistory.length;
      const successfulExecutions = this.executionHistory.filter(r => r.success).length;
      const overallSuccessRate = totalExecutions > 0 ? successfulExecutions / totalExecutions : 0;

      return {
        totalTools,
        activeTools,
        loadedTools,
        totalExecutions,
        overallSuccessRate,
        topPerformingTools: [],
        underperformingTools: [],
        recommendations: ['Enable performance tracking for detailed insights'],
      };
    }

    // Add our execution history data
    const totalExecutions = this.executionHistory.length;
    const successfulExecutions = this.executionHistory.filter(r => r.success).length;
    const overallSuccessRate = totalExecutions > 0 ? successfulExecutions / totalExecutions : 0;

    const recommendations: string[] = [];

    if (overallSuccessRate < 0.7) {
      recommendations.push(
        'Consider reviewing tool selection criteria and removing unreliable tools',
      );
    }

    if (registryReport.underperformingTools.length > 0) {
      recommendations.push(
        `Review or replace underperforming tools: ${registryReport.underperformingTools.join(', ')}`,
      );
    }

    return {
      ...registryReport,
      loadedTools: this.toolMetadata.size,
      totalExecutions: totalExecutions || registryReport.totalExecutions,
      overallSuccessRate: overallSuccessRate || registryReport.overallSuccessRate,
      recommendations,
    };
  }

  // Private helper methods

  private matchesCriteria(metadata: ToolMetadata, criteria: ToolSelectionCriteria): boolean {
    if (!metadata.isActive) return false;

    if (criteria.categories && !criteria.categories.includes(metadata.category)) {
      return false;
    }

    if (criteria.tags && !criteria.tags.some(tag => metadata.tags.includes(tag))) {
      return false;
    }

    if (criteria.complexity && !criteria.complexity.includes(metadata.complexity)) {
      return false;
    }

    if (criteria.minReliability && metadata.reliability < criteria.minReliability) {
      return false;
    }

    if (criteria.maxCost && metadata.cost > criteria.maxCost) {
      return false;
    }

    if (criteria.excludeTools && criteria.excludeTools.includes(metadata.id)) {
      return false;
    }

    return true;
  }

  private calculateToolScore(metadata: ToolMetadata, context: ToolExecutionContext): number {
    let score = 0;

    // Base score from reliability and performance
    score += metadata.reliability * 0.4;
    score += metadata.performance * 0.3;

    // Cost efficiency (lower cost is better)
    score += (1 - Math.min(1, metadata.cost / 10)) * 0.2;

    // Usage frequency bonus
    if (metadata.usage.callCount > 0) {
      const recencyBonus = Math.max(
        0,
        1 - (Date.now() - metadata.usage.lastUsed) / (7 * 24 * 60 * 60 * 1000),
      );
      score += recencyBonus * 0.1;
    }

    // Complexity penalty for simple contexts
    if (context.stepNumber <= 2 && metadata.complexity === 'complex') {
      score -= 0.1;
    }

    return Math.max(0, Math.min(1, score));
  }

  // Helper method to check if the unified registry has a tool
  hasToolInRegistry(toolId: string): boolean {
    return this.registry.get(toolId) !== undefined;
  }
}

/**
 * Create built-in tool definitions with metadata
 */
export const createBuiltInTools = () => {
  const tools: Array<{
    tool: Tool;
    metadata: Omit<ToolMetadata, 'usage' | 'isLoaded' | 'loadedAt'>;
  }> = [];

  // Web search tool
  tools.push({
    tool: {
      description: 'Search the web for information',
      inputSchema: z.object({
        query: z.string().describe('The search query'),
        maxResults: z.number().optional().describe('Maximum number of results'),
      }),
      execute: async ({ query: _query, maxResults: _maxResults }) => ({
        results: [
          { title: 'Sample Result', url: 'https://example.com', snippet: 'Sample snippet' },
        ],
      }),
    } as Tool,
    metadata: {
      id: 'web_search',
      name: 'Web Search',
      description: 'Search the web for information',
      category: 'information',
      version: '1.0.0',
      author: 'system',
      tags: ['search', 'web', 'information'],
      complexity: 'simple',
      reliability: 0.9,
      performance: 0.8,
      cost: 2,
      dependencies: [],
      conflicts: [],
      requirements: {
        externalServices: ['search_api'],
      },
      isActive: true,
    },
  });

  // Data analysis tool
  tools.push({
    tool: {
      description: 'Analyze data and provide insights',
      inputSchema: {} as any,
      execute: async () => ({
        analysis: 'Sample analysis',
        insights: ['Sample insight'],
        confidence: 0.85,
      }),
    } as unknown as Tool,
    metadata: {
      id: 'data_analysis',
      name: 'Data Analysis',
      description: 'Analyze data and provide insights',
      category: 'analysis',
      version: '1.0.0',
      author: 'system',
      tags: ['analysis', 'data', 'insights'],
      complexity: 'moderate',
      reliability: 0.85,
      performance: 0.7,
      cost: 3,
      dependencies: [],
      conflicts: [],
      requirements: {},
      isActive: true,
    },
  });

  // Code generation tool
  tools.push({
    tool: {
      description: 'Generate code based on specifications',
      inputSchema: {} as any,
      execute: async () => ({
        code: '// Sample generated code\nfunction example() { return "Hello"; }',
        explanation: 'Sample code explanation',
        tests: ['sampleTest()'],
      }),
    } as unknown as Tool,
    metadata: {
      id: 'code_generation',
      name: 'Code Generation',
      description: 'Generate code based on specifications',
      category: 'development',
      version: '1.0.0',
      author: 'system',
      tags: ['code', 'generation', 'development'],
      complexity: 'complex',
      reliability: 0.75,
      performance: 0.6,
      cost: 5,
      dependencies: [],
      conflicts: [],
      requirements: {
        minAgentCapability: 'advanced',
      },
      isActive: true,
    },
  });

  return tools;
};

/**
 * Global advanced tool manager instance
 */
export const globalDynamicToolManager = new DynamicToolManager();

/**
 * Utility functions for dynamic tool management
 */
export const dynamicToolUtils = {
  /**
   * Initialize tools with built-in definitions
   */
  initializeBuiltInTools: (manager: DynamicToolManager = globalDynamicToolManager): void => {
    const builtInTools = createBuiltInTools();

    builtInTools.forEach(({ tool, metadata }) => {
      manager.registerTool(tool, metadata);
    });

    logInfo('Dynamic Tool Manager: Built-in tools initialized', {
      operation: 'builtin_tools_initialized',
      metadata: { toolCount: builtInTools.length },
    });
  },

  /**
   * Create tool metadata template
   */
  createToolMetadata: (
    id: string,
    name: string,
    category: string,
    options: Partial<
      Omit<ToolMetadata, 'id' | 'name' | 'category' | 'usage' | 'isLoaded' | 'loadedAt'>
    > = {},
  ): Omit<ToolMetadata, 'usage' | 'isLoaded' | 'loadedAt'> => ({
    id,
    name,
    category,
    description: options.description || `${name} tool`,
    version: options.version || '1.0.0',
    author: options.author || 'unknown',
    tags: options.tags || [],
    complexity: options.complexity || 'simple',
    reliability: options.reliability || 0.8,
    performance: options.performance || 0.8,
    cost: options.cost || 1,
    dependencies: options.dependencies || [],
    conflicts: options.conflicts || [],
    requirements: options.requirements || {},
    isActive: options.isActive !== undefined ? options.isActive : true,
  }),

  /**
   * Filter tools by execution context
   */
  filterToolsByContext: (
    tools: Record<string, Tool>,
    context: ToolExecutionContext,
  ): Record<string, Tool> => {
    const filteredTools: Record<string, Tool> = {};

    Object.entries(tools).forEach(([toolId, tool]) => {
      // Simple filtering logic - can be enhanced
      if (context.availableTools.length === 0 || context.availableTools.includes(toolId)) {
        filteredTools[toolId] = tool;
      }
    });

    return filteredTools;
  },
} as const;
