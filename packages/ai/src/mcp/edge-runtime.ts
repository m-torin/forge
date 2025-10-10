import { logWarn } from '@repo/observability/server/next';
import { experimental_createMCPClient } from 'ai';
import type { MCPClientConfig } from './client';
// Use AI SDK tool types instead of MCP SDK types

/**
 * Edge runtime compatible MCP client configuration
 * Limitations: No stdio transport (no child processes), HTTP transport only
 */
export interface EdgeMCPClientConfig {
  name: string;
  transport: EdgeMCPTransportConfig;
}

export interface EdgeMCPTransportConfig {
  type: 'sse' | 'http';
  // For SSE transport
  url?: string;
  headers?: Record<string, string>;
  // For HTTP transport
  httpUrl?: string;
  sessionId?: string;
}

/**
 * Check if we're running in edge runtime
 */
export function isEdgeRuntime(): boolean {
  try {
    // Edge runtime doesn't have process object
    return (
      typeof process === 'undefined' ||
      // Vercel Edge Runtime
      process.env.VERCEL_REGION !== undefined ||
      // Cloudflare Workers
      typeof (globalThis as any).WorkerGlobalScope !== 'undefined' ||
      // Other edge indicators
      typeof (globalThis as any).EdgeRuntime !== 'undefined'
    );
  } catch {
    return true; // If we can't access process, assume edge runtime
  }
}

/**
 * Filter MCP configurations for edge runtime compatibility
 */
export function getEdgeCompatibleConfigs(configs: MCPClientConfig[]): EdgeMCPClientConfig[] {
  return configs
    .filter(config => config.transport.type !== 'stdio')
    .map(config => ({
      name: config.name,
      transport: config.transport as EdgeMCPTransportConfig,
    }));
}

/**
 * Create edge-compatible MCP tools
 * This function works in both Node.js and edge runtimes
 */
export async function createEdgeMCPTools(
  configs: EdgeMCPClientConfig[],
  options: {
    gracefulDegradation?: boolean;
    timeout?: number;
  } = {},
): Promise<{
  tools: Record<string, any>;
  clients: any[];
  closeAllClients: () => Promise<void>;
}> {
  const clients: any[] = [];
  const toolSets: Record<string, any>[] = [];
  const timeout = options.timeout || 10000; // 10 second timeout for edge

  // Create clients with timeout
  const clientPromises = configs.map(async config => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      let transport: any;

      if (config.transport.type === 'sse') {
        transport = {
          type: 'sse' as const,
          url: config.transport.url || 'http://localhost:3001',
          headers: config.transport.headers,
        };
      } else if (config.transport.type === 'http') {
        // Use fetch-based transport for edge compatibility
        transport = await createEdgeHTTPTransport(config.transport);
      } else {
        throw new Error(`Unsupported transport type in edge runtime: ${config.transport.type}`);
      }

      const client = await experimental_createMCPClient({ transport });
      const toolSet = await client.tools();

      clearTimeout(timeoutId);
      return { client, toolSet, config };
    } catch (error) {
      clearTimeout(timeoutId);

      if (options.gracefulDegradation) {
        logWarn(`Failed to create edge MCP client ${config.name}`, {
          clientName: config.name,
          error: error instanceof Error ? error.message : String(error),
          operation: 'mcp_edge_client_creation',
        });
        return null;
      } else {
        throw error;
      }
    }
  });

  const results = await Promise.all(clientPromises);

  // Filter successful results
  for (const result of results) {
    if (result) {
      clients.push(result.client);
      toolSets.push(result.toolSet);
    }
  }

  // Merge tool sets
  const tools: Record<string, any> = Object.assign({}, ...toolSets);

  const closeAllClients = async (): Promise<void> => {
    await Promise.all(
      clients.map(client =>
        client.close().catch((error: unknown) => {
          logWarn('Failed to close edge MCP client', {
            error: error instanceof Error ? error.message : String(error),
            operation: 'mcp_edge_client_close',
          });
        }),
      ),
    );
  };

  return {
    tools,
    clients,
    closeAllClients,
  };
}

/**
 * Create HTTP transport compatible with edge runtime
 */
async function createEdgeHTTPTransport(transport: EdgeMCPTransportConfig): Promise<any> {
  if (!transport.httpUrl) {
    throw new Error('HTTP URL is required for HTTP transport');
  }

  // For edge runtime, we need to use a fetch-based transport
  // This is a simplified implementation that works with the experimental MCP client
  return {
    type: 'http' as const,
    url: transport.httpUrl,
    sessionId: transport.sessionId,
    fetch: globalThis.fetch, // Use the global fetch available in edge runtime
  };
}

/**
 * Pre-configured edge-compatible MCP transports
 */
export const edgeMCPTransports = {
  /**
   * SSE transport for edge runtime
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
   * HTTP transport for edge runtime
   */
  http: (name: string, httpUrl: string, sessionId?: string): EdgeMCPClientConfig => ({
    name,
    transport: {
      type: 'http',
      httpUrl,
      sessionId,
    },
  }),

  /**
   * Zapier MCP via SSE (edge compatible)
   */
  zapier: (apiKey: string): EdgeMCPClientConfig => ({
    name: 'zapier',
    transport: {
      type: 'sse',
      url: `https://actions.zapier.com/mcp/${apiKey}/sse`,
    },
  }),

  /**
   * Custom SSE-based search API
   */
  search: (baseUrl: string, apiKey?: string): EdgeMCPClientConfig => ({
    name: 'search',
    transport: {
      type: 'sse',
      url: `${baseUrl}/mcp/sse`,
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
    },
  }),
};

/**
 * Environment discovery for edge runtime
 */
export function discoverEdgeMCPServers(): EdgeMCPClientConfig[] {
  const servers: EdgeMCPClientConfig[] = [];

  // Look for edge-compatible environment variables
  if (typeof process !== 'undefined' && process.env) {
    // Zapier integration
    if (process.env.ZAPIER_MCP_API_KEY) {
      servers.push(edgeMCPTransports.zapier(process.env.ZAPIER_MCP_API_KEY));
    }

    // Custom SSE servers
    const sseUrl = process.env.MCP_SSE_URL;
    if (sseUrl) {
      const headers: Record<string, string> = {};
      if (process.env.MCP_SSE_API_KEY) {
        headers['Authorization'] = `Bearer ${process.env.MCP_SSE_API_KEY}`;
      }
      servers.push(edgeMCPTransports.sse('custom-sse', sseUrl, headers));
    }

    // Custom HTTP servers
    const httpUrl = process.env.MCP_HTTP_URL;
    if (httpUrl) {
      servers.push(edgeMCPTransports.http('custom-http', httpUrl, process.env.MCP_HTTP_SESSION_ID));
    }
  }

  return servers;
}

/**
 * Smart MCP client factory that chooses the right implementation based on runtime
 */
export async function createSmartMCPTools(
  nodeConfigs: MCPClientConfig[] = [],
  edgeConfigs: EdgeMCPClientConfig[] = [],
  options: {
    gracefulDegradation?: boolean;
    discoverFromEnvironment?: boolean;
  } = {},
): Promise<{
  tools: Record<string, any>;
  clients: any[];
  closeAllClients: () => Promise<void>;
  runtime: 'node' | 'edge';
}> {
  const runtime = isEdgeRuntime() ? 'edge' : 'node';

  if (runtime === 'edge') {
    // Use edge-compatible configurations
    let configs = edgeConfigs;

    if (options.discoverFromEnvironment) {
      const discovered = discoverEdgeMCPServers();
      configs = [...configs, ...discovered];
    }

    // Filter node configs to edge-compatible ones
    const edgeCompatible = getEdgeCompatibleConfigs(nodeConfigs);
    configs = [...configs, ...edgeCompatible];

    const result = await createEdgeMCPTools(configs, options);
    return { ...result, runtime };
  } else {
    // Use full Node.js implementation (import dynamically to avoid edge runtime issues)
    const { createMCPToolsFromConfigs } = await import('./client');

    let configs = nodeConfigs;

    if (options.discoverFromEnvironment) {
      const { getMCPServers } = await import('./environment');
      configs = getMCPServers(configs);
    }

    const result = await createMCPToolsFromConfigs(configs, options);
    return { ...result, runtime };
  }
}
