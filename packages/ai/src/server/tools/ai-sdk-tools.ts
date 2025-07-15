/**
 * Simplified AI SDK tools following Vercel AI SDK patterns
 * Replaces complex tool registry with simple, discoverable patterns
 */

import type { CoreTool } from 'ai';
import { tool } from 'ai';
import { z } from 'zod/v4';

/**
 * Simplified tool metadata for discovery
 */
export interface ToolMetadata {
  name: string;
  description: string;
  category: 'weather' | 'document' | 'search' | 'utility' | 'external';
  tags: string[];
  security: 'low' | 'medium' | 'high';
}

/**
 * Tool with metadata for discovery
 */
export interface ToolWithMetadata {
  tool: CoreTool<any, any>;
  metadata: ToolMetadata;
}

/**
 * Simple tool registry that follows AI SDK patterns
 * Only stores tools for discovery, doesn't create complex abstractions
 */
export class SimpleToolRegistry {
  private tools = new Map<string, ToolWithMetadata>();

  register(name: string, toolWithMetadata: ToolWithMetadata): void {
    this.tools.set(name, toolWithMetadata);
  }

  get(name: string): CoreTool<any, any> | undefined {
    return this.tools.get(name)?.tool;
  }

  getMetadata(name: string): ToolMetadata | undefined {
    return this.tools.get(name)?.metadata;
  }

  getAll(): Record<string, CoreTool<any, any>> {
    const result: Record<string, CoreTool<any, any>> = {};
    for (const [name, { tool: toolInstance }] of this.tools) {
      result[name] = toolInstance;
    }
    return result;
  }

  getByCategory(category: string): Record<string, CoreTool<any, any>> {
    const result: Record<string, CoreTool<any, any>> = {};
    for (const [name, { tool: toolInstance, metadata }] of this.tools) {
      if (metadata.category === category) {
        result[name] = toolInstance;
      }
    }
    return result;
  }

  getByTags(tags: string[]): Record<string, CoreTool<any, any>> {
    const result: Record<string, CoreTool<any, any>> = {};
    for (const [name, { tool: toolInstance, metadata }] of this.tools) {
      if (tags.some(tag => metadata.tags.includes(tag))) {
        result[name] = toolInstance;
      }
    }
    return result;
  }

  list(): ToolMetadata[] {
    return Array.from(this.tools.values()).map(({ metadata }) => metadata);
  }

  clear(): void {
    this.tools.clear();
  }
}

/**
 * Global simple tool registry
 */
export const simpleToolRegistry = new SimpleToolRegistry();

/**
 * Weather tool using pure AI SDK patterns
 */
export const weatherTool = tool({
  description: 'Get weather information for a specific location',
  parameters: z.object({
    location: z.string().describe('The location to get weather for'),
    units: z.enum(['celsius', 'fahrenheit']).optional().default('celsius'),
  }),
  execute: async ({ location, units }) => {
    // Simulate weather API call
    const temperature = units === 'fahrenheit' ? 72 : 22;
    const unit = units === 'fahrenheit' ? '°F' : '°C';

    return {
      location,
      temperature: `${temperature}${unit}`,
      conditions: 'Partly cloudy',
      humidity: '65%',
      windSpeed: '10 mph',
      forecast: 'Sunny with occasional clouds',
    };
  },
});

/**
 * Document creation tool using pure AI SDK patterns
 */
export const createDocumentTool = tool({
  description: 'Create a new document with specified title and content',
  parameters: z.object({
    title: z.string().describe('The title of the document'),
    content: z.string().describe('The content of the document'),
    format: z.enum(['markdown', 'text', 'html']).optional().default('markdown'),
    tags: z.array(z.string()).optional().describe('Tags for the document'),
  }),
  execute: async ({ title, content, format, tags }) => {
    // Simulate document creation
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      id: documentId,
      title,
      content,
      format,
      tags: tags || [],
      createdAt: new Date().toISOString(),
      wordCount: content.split(/\s+/).length,
      status: 'created',
    };
  },
});

/**
 * Search tool using pure AI SDK patterns
 */
export const searchTool = tool({
  description: 'Search through documents and knowledge base',
  parameters: z.object({
    query: z.string().describe('The search query'),
    limit: z.number().optional().default(10).describe('Maximum number of results'),
    category: z.string().optional().describe('Filter by category'),
  }),
  execute: async ({ query, limit, category }) => {
    // Simulate search
    const results = Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
      id: `result_${i + 1}`,
      title: `Search result ${i + 1} for "${query}"`,
      content: `This is a simulated search result for the query "${query}". In a real implementation, this would return actual search results.`,
      relevance: 0.9 - i * 0.1,
      category: category || 'general',
    }));

    return {
      query,
      totalResults: results.length,
      results,
      searchTime: '0.123s',
    };
  },
});

/**
 * Calculator tool using pure AI SDK patterns
 */
export const calculatorTool = tool({
  description: 'Perform basic mathematical calculations',
  parameters: z.object({
    expression: z.string().describe('Mathematical expression to evaluate (e.g., "2 + 3 * 4")'),
  }),
  execute: async ({ expression }) => {
    try {
      // Simple expression evaluation (in real app, use a proper math parser)
      // This is a simplified version for demonstration
      const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');

      if (!sanitized || sanitized !== expression) {
        throw new Error('Invalid mathematical expression');
      }

      // Use Function constructor for simple evaluation (be careful in production)
      const result = Function(`"use strict"; return (${sanitized})`)();

      if (typeof result !== 'number' || !isFinite(result)) {
        throw new Error('Calculation resulted in invalid number');
      }

      return {
        expression,
        result,
        formatted: result.toString(),
      };
    } catch (error) {
      return {
        expression,
        error: error instanceof Error ? error.message : 'Calculation failed',
        result: null,
      };
    }
  },
});

/**
 * Register standard tools
 */
export function registerStandardTools() {
  simpleToolRegistry.register('weather', {
    tool: weatherTool,
    metadata: {
      name: 'weather',
      description: 'Get weather information for any location',
      category: 'external',
      tags: ['weather', 'location', 'forecast'],
      security: 'low',
    },
  });

  simpleToolRegistry.register('createDocument', {
    tool: createDocumentTool,
    metadata: {
      name: 'createDocument',
      description: 'Create new documents with title and content',
      category: 'document',
      tags: ['create', 'document', 'write'],
      security: 'medium',
    },
  });

  simpleToolRegistry.register('search', {
    tool: searchTool,
    metadata: {
      name: 'search',
      description: 'Search through documents and knowledge base',
      category: 'search',
      tags: ['search', 'query', 'find'],
      security: 'low',
    },
  });

  simpleToolRegistry.register('calculator', {
    tool: calculatorTool,
    metadata: {
      name: 'calculator',
      description: 'Perform mathematical calculations',
      category: 'utility',
      tags: ['math', 'calculate', 'arithmetic'],
      security: 'low',
    },
  });
}

/**
 * Get all tools as a simple object (AI SDK pattern)
 */
export function getAllTools(): Record<string, CoreTool<any, any>> {
  return simpleToolRegistry.getAll();
}

/**
 * Get tools by category
 */
export function getToolsByCategory(category: string): Record<string, CoreTool<any, any>> {
  return simpleToolRegistry.getByCategory(category);
}

/**
 * Get tools by tags
 */
export function getToolsByTags(tags: string[]): Record<string, CoreTool<any, any>> {
  return simpleToolRegistry.getByTags(tags);
}

/**
 * Create a tool set for AI SDK usage
 */
export function createToolSet(toolNames?: string[]): Record<string, CoreTool<any, any>> {
  if (!toolNames) {
    return getAllTools();
  }

  const result: Record<string, CoreTool<any, any>> = {};
  for (const name of toolNames) {
    const tool = simpleToolRegistry.get(name);
    if (tool) {
      result[name] = tool;
    }
  }
  return result;
}

/**
 * Initialize the tool registry with standard tools
 */
registerStandardTools();
