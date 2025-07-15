import { logError } from '@repo/observability';
import { experimental_createMCPClient as createMCPClient } from 'ai';
import type { MCPConnection, MCPTool, MCPToolResult } from './types';

// Re-export for convenience
export { createMCPClient };

// MCP Protocol types
export interface MCPCapabilities {
  tools: boolean;
  prompts: boolean;
  resources: boolean;
  logging: boolean;
}

export interface MCPToolInvocation {
  toolId: string;
  connectionId: string;
  parameters: Record<string, any>;
}

// Custom MCP Client class
export class CustomMCPClient {
  private connections: Map<string, MCPConnection> = new Map();
  private toolHandlers: Map<string, (params: any) => Promise<any>> = new Map();

  constructor() {
    // Initialize with mock connections for demo
    void this.initializeMockConnections().catch(error =>
      logError('Failed to initialize MCP client', { error }),
    );
  }

  // Connect to an MCP server
  async connect(config: { url: string; name: string; apiKey?: string }): Promise<MCPConnection> {
    try {
      // In a real implementation, this would establish a WebSocket or HTTP connection
      const connection: MCPConnection = {
        id: `mcp-${Date.now()}`,
        name: config.name,
        version: '1.0.0',
        status: 'connected',
        capabilities: {
          tools: true,
          prompts: true,
          resources: false,
          logging: true,
        },
        tools: [],
      };

      // Discover available tools
      connection.tools = await this.discoverTools(connection.id);

      this.connections.set(connection.id, connection);
      return connection;
    } catch (error) {
      throw new Error(`Failed to connect to MCP server: ${error}`);
    }
  }

  // Disconnect from an MCP server
  async disconnect(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.status = 'disconnected';
      this.connections.delete(connectionId);
    }
  }

  // Get all active connections
  getConnections(): MCPConnection[] {
    return Array.from(this.connections.values());
  }

  // Discover available tools from a connection
  private async discoverTools(_connectionId: string): Promise<MCPTool[]> {
    // Mock tool discovery - in real implementation, this would query the MCP server
    return [
      {
        id: 'web-search',
        name: 'Web Search',
        description: 'Search the web for current information',
        isEnabled: true,
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results',
            },
          },
          required: ['query'],
        },
      },
      {
        id: 'code-interpreter',
        name: 'Code Interpreter',
        description: 'Execute Python code in a sandboxed environment',
        isEnabled: false,
        permissions: ['execute_code'],
        parameters: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              description: 'Python code to execute',
            },
          },
          required: ['code'],
        },
      },
    ];
  }

  // Invoke a tool
  async invokeTool(invocation: MCPToolInvocation): Promise<MCPToolResult> {
    const startTime = performance.now();

    try {
      // Find the connection and tool
      const connection = this.connections.get(invocation.connectionId);
      if (!connection || connection.status !== 'connected') {
        throw new Error('Connection not found or not connected');
      }

      const tool = connection.tools.find(t => t.id === invocation.toolId);
      if (!tool) {
        throw new Error('Tool not found');
      }

      if (!tool.isEnabled) {
        throw new Error('Tool is not enabled');
      }

      // Validate parameters
      this.validateToolParameters(tool, invocation.parameters);

      // Execute the tool (mock implementation)
      const result = await this.executeToolMock(invocation.toolId, invocation.parameters);

      return {
        toolId: invocation.toolId,
        status: 'success',
        result,
        duration: performance.now() - startTime,
      };
    } catch (error) {
      return {
        toolId: invocation.toolId,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: performance.now() - startTime,
      };
    }
  }

  // Validate tool parameters
  private validateToolParameters(tool: MCPTool, params: Record<string, any>): void {
    if (!tool.parameters) return;

    for (const param of tool.parameters) {
      if (param.required && !(param.name in params)) {
        throw new Error(`Missing required parameter: ${param.name}`);
      }

      if (param.name in params) {
        const value = params[param.name];

        // Basic type validation
        switch (param.type) {
          case 'string':
            if (typeof value !== 'string') {
              throw new Error(`Parameter ${param.name} must be a string`);
            }
            break;
          case 'number':
            if (typeof value !== 'number') {
              throw new Error(`Parameter ${param.name} must be a number`);
            }
            break;
          case 'boolean':
            if (typeof value !== 'boolean') {
              throw new Error(`Parameter ${param.name} must be a boolean`);
            }
            break;
        }
      }
    }
  }

  // Mock tool execution
  private async executeToolMock(toolId: string, params: Record<string, any>): Promise<any> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    switch (toolId) {
      case 'web-search':
        return {
          results: [
            {
              title: 'Example Result 1',
              url: 'https://example.com/1',
              snippet: `Search result for "${params.query}"`,
            },
            {
              title: 'Example Result 2',
              url: 'https://example.com/2',
              snippet: `Another result for "${params.query}"`,
            },
          ],
        };

      case 'code-interpreter':
        return {
          output: `# Code execution result
print("Hello from Python!")
# Output: Hello from Python!`,
          exitCode: 0,
        };

      default:
        throw new Error(`Unknown tool: ${toolId}`);
    }
  }

  // Initialize mock connections for demo
  private async initializeMockConnections() {
    // This would be replaced with real MCP server connections
    try {
      await this.connect({
        url: 'ws://localhost:8080',
        name: 'Local MCP Server',
      });
    } catch (error) {
      logError('Failed to initialize mock MCP connection', { error });
    }
  }

  // Enable/disable a tool
  async setToolEnabled(connectionId: string, toolId: string, enabled: boolean): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error('Connection not found');
    }

    const tool = connection.tools.find(t => t.id === toolId);
    if (!tool) {
      throw new Error('Tool not found');
    }

    tool.isEnabled = enabled;
  }

  // Get tool permissions
  getToolPermissions(connectionId: string, toolId: string): string[] {
    const connection = this.connections.get(connectionId);
    if (!connection) return [];

    const tool = connection.tools.find(t => t.id === toolId);
    return tool?.permissions || [];
  }
}

// Singleton instance
let mcpClient: CustomMCPClient | null = null;

export function getMCPClient(): CustomMCPClient {
  if (!mcpClient) {
    mcpClient = new CustomMCPClient();
  }
  return mcpClient;
}

// React hook for MCP
export function useMCPClient() {
  const client = getMCPClient();

  return {
    client,
    connections: client.getConnections(),
    invokeTool: client.invokeTool.bind(client),
    setToolEnabled: client.setToolEnabled.bind(client),
  };
}
