import { tool } from 'ai';
import { z } from 'zod/v4';
import { ToolContext, createToolFactory } from './factory';

/**
 * Tool Registry for managing and discovering AI SDK tools
 * Follows Vercel AI SDK best practices for tool organization
 */
export class ToolRegistry {
  private tools = new Map<string, ReturnType<typeof tool>>();
  private factories = new Map<string, (context: ToolContext) => ReturnType<typeof tool>>();
  private metadata = new Map<string, ToolMetadata>();

  /**
   * Register a tool with metadata
   */
  register(
    name: string,
    toolOrFactory: ReturnType<typeof tool> | ((context: ToolContext) => ReturnType<typeof tool>),
    metadata?: ToolMetadata,
  ): void {
    if (typeof toolOrFactory === 'function') {
      this.factories.set(name, toolOrFactory);
    } else {
      this.tools.set(name, toolOrFactory);
    }

    if (metadata) {
      this.metadata.set(name, metadata);
    }
  }

  /**
   * Get a tool by name
   */
  get(name: string, context?: ToolContext): ReturnType<typeof tool> | undefined {
    // Check static tools first
    const staticTool = this.tools.get(name);
    if (staticTool) return staticTool;

    // Check factories
    const factory = this.factories.get(name);
    if (factory && context) {
      return factory(context);
    }

    return undefined;
  }

  /**
   * Get all tools with optional context
   */
  getAll(context?: ToolContext): Record<string, ReturnType<typeof tool>> {
    const result: Record<string, ReturnType<typeof tool>> = {};

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
  getByCategory(category: string, context?: ToolContext): Record<string, ReturnType<typeof tool>> {
    const result: Record<string, ReturnType<typeof tool>> = {};

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
  getByTags(tags: string[], context?: ToolContext): Record<string, ReturnType<typeof tool>> {
    const result: Record<string, ReturnType<typeof tool>> = {};

    for (const [name, meta] of this.metadata) {
      if (meta.tags && tags.some(tag => meta.tags?.includes(tag))) {
        const tool = this.get(name, context);
        if (tool) {
          result[name] = tool;
        }
      }
    }

    return result;
  }

  /**
   * Clear all tools
   */
  clear(): void {
    this.tools.clear();
    this.factories.clear();
    this.metadata.clear();
  }

  /**
   * Get tool names
   */
  getNames(): string[] {
    return Array.from(new Set([...this.tools.keys(), ...this.factories.keys()]));
  }

  /**
   * Check if a tool exists
   */
  has(name: string): boolean {
    return this.tools.has(name) || this.factories.has(name);
  }
}

/**
 * Tool metadata for organization and discovery
 */
export interface ToolMetadata {
  category?: string;
  tags?: string[];
  version?: string;
  deprecated?: boolean;
  security?: 'low' | 'medium' | 'high';
  requiresAuth?: boolean;
  rateLimit?: {
    requests: number;
    window: number; // in seconds
  };
}

/**
 * Global tool registry instance
 */
export const globalToolRegistry = new ToolRegistry();

/**
 * Register default tools
 */
export function registerDefaultTools(): void {
  // Import and register all default tools
  const toolFactory = createToolFactory({});

  // File system tools
  globalToolRegistry.register(
    'readFile',
    (_context: ToolContext) =>
      toolFactory({
        description: 'Read contents of a file',
        parameters: z.object({
          path: z.string().describe('File path to read'),
        }),
        execute: async (input: unknown) => {
          const { path } = input as { path: any };
          // Implementation would go here
          return `Contents of ${path}`;
        },
      }),
    {
      category: 'filesystem',
      tags: ['read', 'file'],
      security: 'medium',
    },
  );

  // Web tools
  globalToolRegistry.register(
    'webSearch',
    (_context: ToolContext) =>
      toolFactory({
        description: 'Search the web for information',
        parameters: z.object({
          query: z.string().describe('Search query'),
          limit: z.number().optional().default(5),
        }),
        execute: async (input: unknown) => {
          const { query, limit } = input as { query: any; limit: any };
          // Implementation would go here
          return { results: [], query, limit };
        },
      }),
    {
      category: 'web',
      tags: ['search', 'internet'],
      security: 'low',
      rateLimit: { requests: 10, window: 60 },
    },
  );
}

/**
 * Create a tool collection from registry
 */
export function createToolsFromRegistry(
  registry: ToolRegistry,
  options?: {
    categories?: string[];
    tags?: string[];
    context?: ToolContext;
    exclude?: string[];
  },
): Record<string, ReturnType<typeof tool>> {
  let tools: Record<string, ReturnType<typeof tool>> = {};

  if (options) {
    if (options.categories) {
      for (const category of options.categories) {
        tools = { ...tools, ...registry.getByCategory(category, options.context) };
      }
    } else if (options.tags) {
      tools = registry.getByTags(options.tags, options.context);
    } else {
      tools = registry.getAll(options.context);
    }

    // Exclude specific tools if requested
    if (options.exclude) {
      for (const name of options.exclude) {
        delete tools[name];
      }
    }
  } else {
    tools = registry.getAll();
  }

  return tools;
}

/**
 * Utility to merge multiple tool collections
 */
export function mergeTools(
  ...toolCollections: Array<Record<string, ReturnType<typeof tool>>>
): Record<string, ReturnType<typeof tool>> {
  const merged: Record<string, ReturnType<typeof tool>> = {};

  for (const collection of toolCollections) {
    Object.assign(merged, collection);
  }

  return merged;
}
