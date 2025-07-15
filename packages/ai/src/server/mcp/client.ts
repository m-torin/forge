import { logError, logWarn } from '@repo/observability/server/next';
import { experimental_createMCPClient } from 'ai';
import { Experimental_StdioMCPTransport } from 'ai/mcp-stdio';

export interface MCPClientConfig {
  name: string;
  transport: MCPTransportConfig;
}

export interface MCPTransportConfig {
  type: 'stdio' | 'sse' | 'http';
  // For stdio transport
  command?: string;
  args?: string[];
  // For SSE transport
  url?: string;
  headers?: Record<string, string>;
  // For HTTP transport
  httpUrl?: string;
  sessionId?: string;
}

/**
 * MCP Client wrapper with proper typing
 * Uses AI SDK tool format instead of MCP SDK format
 */
export interface MCPClient {
  tools(): Promise<Record<string, any>>;
  close(): Promise<void>;
}

/**
 * MCP Transport union type for better type safety
 */
export type MCPTransport =
  | Experimental_StdioMCPTransport
  | { type: 'sse'; url: string; headers?: Record<string, string> };

/**
 * Result type for MCP client creation
 */
export interface MCPClientResult {
  client: MCPClient;
  toolSet: Record<string, any>;
  config: MCPClientConfig;
}

/**
 * MCP Error types for better error handling
 */
export class MCPConnectionError extends Error {
  constructor(
    message: string,
    public readonly clientName: string,
    public readonly transportType: string,
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = 'MCPConnectionError';
  }
}

export class MCPTransportError extends Error {
  constructor(
    message: string,
    public readonly transportType: string,
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = 'MCPTransportError';
  }
}

/**
 * Validate transport configuration at runtime
 */
function validateTransportConfig(transportConfig: MCPTransportConfig): void {
  switch (transportConfig.type) {
    case 'stdio':
      if (!transportConfig.command) {
        throw new MCPTransportError('Command is required for stdio transport', 'stdio');
      }
      break;
    case 'sse':
      if (!transportConfig.url) {
        throw new MCPTransportError('URL is required for SSE transport', 'sse');
      }
      try {
        new URL(transportConfig.url);
      } catch {
        throw new MCPTransportError('Invalid URL format for SSE transport', 'sse');
      }
      break;
    case 'http':
      if (!transportConfig.httpUrl) {
        throw new MCPTransportError('HTTP URL is required for HTTP transport', 'http');
      }
      try {
        new URL(transportConfig.httpUrl);
      } catch {
        throw new MCPTransportError('Invalid HTTP URL format for HTTP transport', 'http');
      }
      break;
    default:
      throw new MCPTransportError(
        `Unsupported transport type: ${(transportConfig as any).type}`,
        'unknown',
      );
  }
}

/**
 * Create transport instance from configuration with proper typing and validation
 */
export function createTransportFromConfig(transportConfig: MCPTransportConfig): MCPTransport {
  // Validate configuration first
  validateTransportConfig(transportConfig);

  switch (transportConfig.type) {
    case 'stdio':
      return new Experimental_StdioMCPTransport({
        command: transportConfig.command || 'node',
        args: transportConfig.args || [],
        env: {
          ...process.env,
          // Ensure API keys are passed to child processes
          ...(process.env.PERPLEXITY_API_KEY && {
            PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY,
          }),
          ...(process.env.OPENAI_API_KEY && { OPENAI_API_KEY: process.env.OPENAI_API_KEY }),
          ...(process.env.ANTHROPIC_API_KEY && {
            ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
          }),
        },
      });

    case 'sse':
      return {
        type: 'sse' as const,
        url: transportConfig.url || 'http://localhost:3001',
        headers: transportConfig.headers,
      };

    case 'http':
      // HTTP transport not available in current AI SDK version
      throw new Error('HTTP transport not currently supported. Use stdio or sse instead.');

    default:
      // TypeScript should catch this, but runtime safety
      throw new MCPTransportError(
        `Unsupported transport type: ${(transportConfig as any).type}`,
        'unknown',
      );
  }
}

/**
 * Per-request MCP client manager following Next.js documentation pattern
 * Creates clients per request and cleans them up automatically
 */
export class MCPRequestManager {
  public clients: MCPClient[] = [];
  private tools: Record<string, any> = {};

  async addClient(config: MCPClientConfig): Promise<void> {
    try {
      const transport = createTransportFromConfig(config.transport);
      const client = (await experimental_createMCPClient({ transport })) as any;
      this.clients.push(client);

      // Get tools from this client and merge them
      const clientTools = await client.tools();
      // Merge tools directly (later tools override earlier ones with same name)
      Object.assign(this.tools, clientTools);
    } catch (error) {
      throw new MCPConnectionError(
        `Failed to create MCP client '${config.name}'`,
        config.name,
        config.transport.type,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  getTools(): Record<string, any> {
    return this.tools;
  }

  async close(): Promise<void> {
    const closePromises = this.clients.map(async (client, index) => {
      try {
        await client.close();
      } catch (error) {
        logWarn(`Failed to close MCP client ${index}`, {
          operation: 'mcp_client_close',
          metadata: {
            clientIndex: index,
            error: error instanceof Error ? error.message : String(error),
          },
        });
      }
    });

    await Promise.all(closePromises);
    this.clients = [];
    this.tools = {};
  }
}

/**
 * Create MCP tools for a single request (following Next.js docs pattern)
 * This creates clients per request and returns cleanup functions
 */
export async function createMCPToolsForRequest(configs: MCPClientConfig[]): Promise<{
  tools: Record<string, any>;
  clients: MCPClient[];
  cleanup: () => Promise<void>;
}> {
  const manager = new MCPRequestManager();

  for (const config of configs) {
    await manager.addClient(config);
  }

  return {
    tools: manager.getTools(),
    clients: manager.clients,
    cleanup: () => manager.close(),
  };
}

/**
 * Create MCP tools following the exact Next.js documentation pattern
 * This function matches the pattern shown in the official AI SDK docs:
 * https://sdk.vercel.ai/docs/ai-sdk-ui/mcp-tools (Next.js usage)
 * https://sdk.vercel.ai/docs/ai-sdk-core/mcp-tools (Node.js usage)
 *
 * Next.js streamText example from official docs:
 * ```typescript
 * const toolSetOne = await stdioClient.tools();
 * const toolSetTwo = await sseClient.tools();
 * const toolSetThree = await customClient.tools();
 * const tools = {
 *   ...toolSetOne,
 *   ...toolSetTwo,
 *   ...toolSetThree, // note: this approach causes subsequent tool sets to override tools with the same name
 * };
 *
 * const response = await streamText({
 *   model: openai('gpt-4o'),
 *   tools,
 *   prompt,
 *   onFinish: async () => {
 *     await stdioClient.close();
 *     await sseClient.close();
 *     await customClient.close();
 *   },
 * });
 * ```
 */
export async function createMCPToolsFromConfigs(
  configs: MCPClientConfig[],
  options: { gracefulDegradation?: boolean } = {},
): Promise<{
  tools: Record<string, any>;
  clients: MCPClient[];
  closeAllClients: () => Promise<void>;
}> {
  const clients: MCPClient[] = [];
  const toolSets: Record<string, any>[] = [];

  // Create all clients in parallel for better performance
  const clientPromises = configs.map(async (config): Promise<MCPClientResult | null> => {
    let client: MCPClient | null = null;
    try {
      const transport = createTransportFromConfig(config.transport);

      // Create MCP client with transport (following official docs pattern)
      client = (await experimental_createMCPClient({ transport })) as any;

      // Get tools from this client before adding to clients array
      if (!client) throw new Error('Failed to create MCP client');
      const toolSet = await client.tools();

      return { client, toolSet, config };
    } catch (error) {
      // Close the client if it was created but tool retrieval failed
      if (client) {
        try {
          await client.close();
        } catch (closeError) {
          logError(
            `Failed to close failed client ${config.name}`,
            closeError instanceof Error ? closeError : new Error(String(closeError)),
            {
              operation: 'mcp_client_cleanup',
              metadata: { clientName: config.name },
            },
          );
        }
      }

      const mcpError = new MCPConnectionError(
        `Failed to create MCP client '${config.name}'`,
        config.name,
        config.transport.type,
        error instanceof Error ? error : new Error(String(error)),
      );

      if (options.gracefulDegradation) {
        logWarn(`Failed to create MCP client ${config.name}`, {
          operation: 'mcp_client_creation',
          metadata: {
            clientName: config.name,
            transportType: config.transport.type,
            error: mcpError.message,
          },
        });
        // Return null to filter out later
        return null;
      } else {
        // Re-throw error if not using graceful degradation
        throw mcpError;
      }
    }
  });

  // Wait for all clients to be created
  const results = await Promise.all(clientPromises);

  // Filter out failed clients and populate arrays
  for (const result of results) {
    if (result) {
      clients.push(result.client);
      toolSets.push(result.toolSet);
    }
  }

  // Merge all tool sets using explicit spread operator (following Next.js docs pattern)
  // Note: this approach causes subsequent tool sets to override tools with the same name
  const tools: Record<string, any> =
    toolSets.length === 0
      ? {}
      : toolSets.length === 1
        ? { ...toolSets[0] }
        : toolSets.length === 2
          ? { ...toolSets[0], ...toolSets[1] }
          : toolSets.length === 3
            ? { ...toolSets[0], ...toolSets[1], ...toolSets[2] }
            : // For 4+ clients, fall back to Object.assign (less common scenario)
              Object.assign({}, ...toolSets);

  // Enhanced cleanup function with better error handling
  const closeAllClients = async (): Promise<void> => {
    const closePromises = clients.map(async (client, index) => {
      try {
        await client.close();
      } catch (error) {
        logWarn(`Failed to close MCP client ${index}`, {
          operation: 'mcp_client_close',
          metadata: {
            clientIndex: index,
            error: error instanceof Error ? error.message : String(error),
          },
        });
      }
    });

    await Promise.all(closePromises);
  };

  return {
    tools,
    clients,
    closeAllClients,
  };
}
