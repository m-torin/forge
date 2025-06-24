import { experimental_createMCPClient } from 'ai';
import { Experimental_StdioMCPTransport } from 'ai/mcp-stdio';

export interface MCPClientConfig {
  name: string;
  transport: MCPTransportConfig;
}

export interface MCPTransportConfig {
  type: 'stdio' | 'sse';
  // For stdio transport
  command?: string;
  args?: string[];
  // For SSE transport
  url?: string;
}

export class MCPClientManager {
  private clients = new Map<string, any>();
  private tools = new Map<string, any>();

  async addClient(config: MCPClientConfig): Promise<void> {
    let transport;

    if (config.transport.type === 'stdio') {
      if (!config.transport.command) {
        throw new Error('Command is required for stdio transport');
      }
      transport = new Experimental_StdioMCPTransport({
        command: config.transport.command,
        args: config.transport.args || [],
      });
    } else if (config.transport.type === 'sse') {
      if (!config.transport.url) {
        throw new Error('URL is required for SSE transport');
      }
      transport = {
        type: 'sse' as const,
        url: config.transport.url,
      };
    } else {
      throw new Error(`Unsupported transport type: ${(config.transport as any).type}`);
    }

    const client = await experimental_createMCPClient({ transport });
    this.clients.set(config.name, client);

    // Get tools from this client and merge them
    const clientTools = await client.tools();
    for (const [toolName, tool] of Object.entries(clientTools)) {
      // Prefix tool names with client name to avoid conflicts
      const prefixedName = `${config.name}_${toolName}`;
      this.tools.set(prefixedName, tool);
    }
  }

  getTools(): Record<string, any> {
    return Object.fromEntries(this.tools);
  }

  async close(): Promise<void> {
    await Promise.all(Array.from(this.clients.values()).map((client) => client.close()));
    this.clients.clear();
    this.tools.clear();
  }
}

/**
 * Create a simplified MCP tools interface
 * Usage:
 * const tools = await createMCPTools([
 *   { name: 'filesystem', transport: { type: 'stdio', command: 'npx', args: ['@modelcontextprotocol/server-filesystem', '/tmp'] }},
 *   { name: 'web', transport: { type: 'sse', url: 'http://localhost:3000/sse' }}
 * ]);
 */
export async function createMCPTools(configs: MCPClientConfig[]): Promise<{
  tools: Record<string, any>;
  cleanup: () => Promise<void>;
}> {
  const manager = new MCPClientManager();

  for (const config of configs) {
    await manager.addClient(config);
  }

  return {
    tools: manager.getTools(),
    cleanup: () => manager.close(),
  };
}
