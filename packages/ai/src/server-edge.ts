/**
 * Server-side AI exports for Edge Runtime
 *
 * This file provides server-side AI functionality specifically for edge runtime environments.
 * Edge runtime has limitations: no Node.js APIs, no native modules, HTTP-based implementations only.
 */

// Edge runtime specific functionality
import type { VectorDB } from './shared/types/vector';

// Edge-compatible exports (no server-only imports)
export * from './shared/middleware';
export * from './shared/streaming/data-stream';
export * from './shared/utils/messages';

// Tool factory (edge-compatible)
export { commonSchemas, type ToolContext } from './server/tools/factory-simple';

// Weather tool (edge-compatible since it uses fetch)
export { createWeatherTool, getWeather, type WeatherData } from './server/tools/weather';

// Vector tools (edge-compatible subset)
export type { VectorRecord, VectorSearchResult } from './server/utils/vector/types';
export type { ServerVectorConfig, VectorDB } from './shared/types/vector';

/**
 * Edge-compatible MCP Client
 * Only supports SSE transport in edge runtime (no stdio)
 */
export interface EdgeMCPClientConfig {
  name: string;
  transport: {
    type: 'sse';
    url: string;
    headers?: Record<string, string>;
  };
}

export class EdgeMCPClientManager {
  public clients = new Map<string, any>();
  private tools = new Map<string, any>();

  async addClient(config: EdgeMCPClientConfig): Promise<void> {
    if (config.transport.type !== 'sse') {
      throw new Error('Edge runtime only supports SSE transport for MCP');
    }

    try {
      // Dynamic import for edge compatibility
      const { experimental_createMCPClient } = await import('ai');

      const client = await experimental_createMCPClient({
        transport: {
          type: 'sse' as const,
          url: config.transport.url,
          headers: config.transport.headers,
        },
      });

      this.clients.set(config.name, client);

      // Get tools from this client
      const clientTools = await client.tools();
      for (const [toolName, tool] of Object.entries(clientTools)) {
        // Later tools override earlier ones with same name (consistent with server runtime)
        this.tools.set(toolName, tool);
      }
    } catch (_error) {
      // Graceful degradation - continue without this client
      // Error details available in error object for debugging
    }
  }

  getTools(): Record<string, any> {
    return Object.fromEntries(this.tools);
  }

  async close(): Promise<void> {
    await Promise.all(Array.from(this.clients.values()).map(client => client.close()));
    this.clients.clear();
    this.tools.clear();
  }
}

/**
 * Create MCP tools for edge runtime (SSE only)
 */
export async function createEdgeMCPTools(configs: EdgeMCPClientConfig[]): Promise<{
  tools: Record<string, any>;
  clients: any[];
  closeAllClients: () => Promise<void>;
}> {
  const manager = new EdgeMCPClientManager();

  for (const config of configs) {
    await manager.addClient(config);
  }

  return {
    tools: manager.getTools(),
    clients: Array.from(manager.clients.values()),
    closeAllClients: () => manager.close(),
  };
}

/**
 * Pre-configured edge MCP transports
 * Only includes SSE-based transports suitable for edge runtime
 */
export const edgeMcpTransports = {
  /**
   * Custom SSE transport
   */
  sse: (name: string, url: string, headers?: Record<string, string>): EdgeMCPClientConfig => ({
    name,
    transport: {
      type: 'sse',
      url,
      headers,
    },
  }),

  /**
   * Web-based search MCP server
   */
  webSearch: (url: string, apiKey?: string): EdgeMCPClientConfig => ({
    name: 'web-search',
    transport: {
      type: 'sse',
      url,
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
    },
  }),

  /**
   * API-based database MCP server
   */
  apiDatabase: (url: string, apiKey?: string): EdgeMCPClientConfig => ({
    name: 'api-database',
    transport: {
      type: 'sse',
      url,
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
    },
  }),
};

/**
 * Edge runtime vector operations (simplified)
 * Uses fetch-based implementations only
 */
export const EdgeVectorRuntime = {
  /**
   * Create a simple search handler for edge runtime
   */
  createSearchHandler: (_vectorDB: VectorDB) => {
    return async (request: Request) => {
      try {
        const url = new URL(request.url);
        const query = url.searchParams.get('q') || '';
        const topK = parseInt(url.searchParams.get('topK') || '5');

        if (!query.trim()) {
          return new Response(JSON.stringify({ error: 'Query parameter "q" is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        // Basic vector search - would need actual implementation
        // This is a placeholder for edge-compatible vector operations
        const results: any[] = [];

        return new Response(
          JSON.stringify({
            success: true,
            results,
            query,
            topK,
            note: 'Edge runtime vector search (placeholder)',
          }),
          {
            headers: { 'Content-Type': 'application/json' },
          },
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: error instanceof Error ? error.message : 'Search failed',
            success: false,
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }
    };
  },
};

/**
 * Edge-compatible tool creation utilities
 */
export function createEdgeTools() {
  return {
    // Add edge-compatible tools here
    // For now, return empty object since vectorDB is not used
  };
}

/**
 * Check if running in edge runtime
 */
export function isEdgeRuntime(): boolean {
  return typeof globalThis !== 'undefined' && 'EdgeRuntime' in globalThis;
}

/**
 * Get appropriate MCP client based on runtime
 */
export async function getMCPClient(configs: EdgeMCPClientConfig[]) {
  if (!isEdgeRuntime()) {
    // Runtime mismatch - consider using server/next instead
  }

  return createEdgeMCPTools(configs);
}
