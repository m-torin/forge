/**
 * Enhanced MCP Integration as Tools - AI SDK v5
 *
 * Provides MCP (Model Context Protocol) servers as AI SDK tools
 * with auto-discovery, latest client patterns, and seamless integration.
 */

import { logError, logInfo } from '@repo/observability';
import { tool as aiTool, type Tool } from 'ai';
import { z } from 'zod/v4';

/**
 * MCP Server Configuration
 */
export interface MCPServerConfig {
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
  timeout?: number;
  autoRestart?: boolean;
  healthCheck?: {
    interval: number;
    maxFailures: number;
  };
  /** Transport type for MCP connection */
  transport?: 'stdio' | 'sse' | 'websocket';
  /** SSE endpoint URL (for SSE transport) */
  sseEndpoint?: string;
  /** WebSocket URL (for websocket transport) */
  websocketUrl?: string;
}

/**
 * MCP Tool Definition from server
 */
export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: any;
  serverName: string;
}

/**
 * MCP Client Connection Status
 */
export type MCPConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * MCP Tool Execution Context
 */
export interface MCPToolContext {
  serverName: string;
  toolName: string;
  timeout?: number;
  retries?: number;
}

/**
 * Mock MCP Client for development/testing
 * In production, this would connect to actual MCP servers
 */
class MockMCPClient {
  private servers = new Map<
    string,
    {
      config: MCPServerConfig;
      status: MCPConnectionStatus;
      tools: MCPToolDefinition[];
      lastActivity: number;
    }
  >();

  private mockTools: Record<string, MCPToolDefinition[]> = {
    filesystem: [
      {
        name: 'readFile',
        description: 'Read contents of a file',
        inputSchema: z.object({
          path: z.string().describe('File path to read'),
          encoding: z.enum(['utf8', 'binary']).default('utf8'),
        }),
        serverName: 'filesystem',
      },
      {
        name: 'writeFile',
        description: 'Write contents to a file',
        inputSchema: z.object({
          path: z.string().describe('File path to write'),
          content: z.string().describe('Content to write'),
          encoding: z.enum(['utf8', 'binary']).default('utf8'),
        }),
        serverName: 'filesystem',
      },
      {
        name: 'listDirectory',
        description: 'List directory contents',
        inputSchema: z.object({
          path: z.string().describe('Directory path to list'),
          includeHidden: z.boolean().default(false),
        }),
        serverName: 'filesystem',
      },
    ],
    database: [
      {
        name: 'query',
        description: 'Execute SQL query',
        inputSchema: z.object({
          sql: z.string().describe('SQL query to execute'),
          inputSchema: z.array(z.any()).optional(),
        }),
        serverName: 'database',
      },
      {
        name: 'schema',
        description: 'Get database schema information',
        inputSchema: z.object({
          table: z.string().optional().describe('Specific table name'),
        }),
        serverName: 'database',
      },
    ],
    webSearch: [
      {
        name: 'search',
        description: 'Search the web for information',
        inputSchema: z.object({
          query: z.string().describe('Search query'),
          limit: z.number().default(10).describe('Number of results'),
          safeSearch: z.boolean().default(true),
        }),
        serverName: 'webSearch',
      },
      {
        name: 'getPage',
        description: 'Get full content of a web page',
        inputSchema: z.object({
          url: z.string().url().describe('URL to fetch'),
          format: z.enum(['text', 'html', 'markdown']).default('text'),
        }),
        serverName: 'webSearch',
      },
    ],
    weather: [
      {
        name: 'getCurrentWeather',
        description: 'Get current weather for a location',
        inputSchema: z.object({
          location: z.string().describe('Location name or coordinates'),
          units: z.enum(['celsius', 'fahrenheit']).default('celsius'),
        }),
        serverName: 'weather',
      },
      {
        name: 'getForecast',
        description: 'Get weather forecast',
        inputSchema: z.object({
          location: z.string().describe('Location name or coordinates'),
          days: z.number().min(1).max(10).default(5),
          units: z.enum(['celsius', 'fahrenheit']).default('celsius'),
        }),
        serverName: 'weather',
      },
    ],
  };

  async connectServer(config: MCPServerConfig): Promise<void> {
    logInfo(`Connecting to MCP server: ${config.name}`);

    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const tools = this.mockTools[config.name] || [];

    this.servers.set(config.name, {
      config,
      status: 'connected',
      tools,
      lastActivity: Date.now(),
    });

    logInfo(`Connected to ${config.name} with ${tools.length} tools`);
  }

  async disconnectServer(serverName: string): Promise<void> {
    const server = this.servers.get(serverName);
    if (server) {
      server.status = 'disconnected';
      logInfo(`Disconnected from MCP server: ${serverName}`);
    }
  }

  getServerStatus(serverName: string): MCPConnectionStatus {
    return this.servers.get(serverName)?.status || 'disconnected';
  }

  listServers(): string[] {
    return Array.from(this.servers.keys());
  }

  getServerTools(serverName: string): MCPToolDefinition[] {
    return this.servers.get(serverName)?.tools || [];
  }

  getAllTools(): MCPToolDefinition[] {
    return Array.from(this.servers.values()).flatMap(server => server.tools);
  }

  async executeServerTool(serverName: string, toolName: string, input: any): Promise<any> {
    const server = this.servers.get(serverName);
    if (!server || server.status !== 'connected') {
      throw new Error(`MCP server ${serverName} is not connected`);
    }

    const tool = server.tools.find(t => t.name === toolName);
    if (!tool) {
      throw new Error(`Tool ${toolName} not found on server ${serverName}`);
    }

    server.lastActivity = Date.now();

    // Mock implementations for different tools
    return this.mockToolExecution(serverName, toolName, input);
  }

  private async mockToolExecution(serverName: string, toolName: string, input: any): Promise<any> {
    // Simulate execution delay
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 200));

    switch (serverName) {
      case 'filesystem':
        return this.mockFilesystemTool(toolName, input);
      case 'database':
        return this.mockDatabaseTool(toolName, input);
      case 'webSearch':
        return this.mockWebSearchTool(toolName, input);
      case 'weather':
        return this.mockWeatherTool(toolName, input);
      default:
        return { result: 'Mock execution successful', tool: toolName, input };
    }
  }

  private mockFilesystemTool(toolName: string, input: any): any {
    switch (toolName) {
      case 'readFile':
        return {
          content: `Mock file content for ${input.path}`,
          size: 1024,
          encoding: input.encoding,
        };
      case 'writeFile':
        return {
          success: true,
          bytesWritten: input.content.length,
          path: input.path,
        };
      case 'listDirectory':
        return {
          files: [
            {
              type: 'file',

              file: {
                file: {
                  file: {
                    file: {
                      file: {
                        file: {
                          file: {
                            file: {
                              file: {
                                name: 'file1.txt',
                                size: 1024,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            {
              type: 'file',

              file: {
                file: {
                  file: {
                    file: {
                      file: {
                        file: {
                          file: {
                            file: {
                              file: {
                                name: 'file2.js',
                                size: 2048,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            { name: 'subdirectory', type: 'directory' },
          ],
          path: input.path,
        };
      default:
        return { error: 'Unknown filesystem tool' };
    }
  }

  private mockDatabaseTool(toolName: string, input: any): any {
    switch (toolName) {
      case 'query':
        return {
          rows: [
            { id: 1, name: 'John Doe', email: 'john@example.com' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
          ],
          rowCount: 2,
          query: input.sql,
        };
      case 'schema':
        return {
          tables: [
            {
              name: 'users',
              columns: [
                { name: 'id', type: 'integer', primary: true },
                { name: 'name', type: 'varchar(255)' },
                { name: 'email', type: 'varchar(255)' },
              ],
            },
          ],
        };
      default:
        return { error: 'Unknown database tool' };
    }
  }

  private mockWebSearchTool(toolName: string, input: any): any {
    switch (toolName) {
      case 'search':
        return {
          results: Array.from({ length: Math.min(input.limit, 3) }, (_, i) => ({
            title: `Search Result ${i + 1}`,
            url: `https://example.com/result-${i + 1}`,
            snippet: `This is a search result for "${input.query}"`,
            relevance: 0.9 - i * 0.1,
          })),
          query: input.query,
          totalResults: 1000000,
        };
      case 'getPage':
        return {
          content: `Mock page content for ${input.url}`,
          title: 'Example Page',
          format: input.format,
          url: input.url,
        };
      default:
        return { error: 'Unknown web search tool' };
    }
  }

  private mockWeatherTool(toolName: string, input: any): any {
    switch (toolName) {
      case 'getCurrentWeather':
        const temp = input.units === 'fahrenheit' ? 72 : 22;
        return {
          location: input.location,
          temperature: temp,
          unit: input.units === 'fahrenheit' ? 'F' : 'C',
          condition: 'Partly cloudy',
          humidity: 65,
          windSpeed: 10,
        };
      case 'getForecast':
        return {
          location: input.location,
          forecast: Array.from({ length: input.days }, (_, i) => ({
            date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
            temperature: {
              high: input.units === 'fahrenheit' ? 75 + i : 24 + i,
              low: input.units === 'fahrenheit' ? 65 + i : 18 + i,
            },
            condition: ['Sunny', 'Cloudy', 'Rainy'][i % 3],
          })),
        };
      default:
        return { error: 'Unknown weather tool' };
    }
  }
}

/**
 * Global MCP client instance
 */
const mcpClient = new MockMCPClient();

/**
 * MCP Tool Manager
 */
export class MCPToolManager {
  private connectedServers = new Set<string>();
  private toolCache = new Map<string, Tool>();

  /**
   * Connect to MCP servers
   */
  async connectServers(servers: MCPServerConfig[]): Promise<void> {
    logInfo(`Connecting to ${servers.length} MCP servers...`);

    for (const serverConfig of servers) {
      try {
        await mcpClient.connectServer(serverConfig);
        this.connectedServers.add(serverConfig.name);
      } catch (error) {
        logError(`Failed to connect to ${serverConfig.name}`, error);
      }
    }

    // Refresh tool cache
    this.refreshToolCache();

    logInfo(`Connected to ${this.connectedServers.size} MCP servers`);
  }

  /**
   * Disconnect from a specific server
   */
  async disconnectServer(serverName: string): Promise<void> {
    await mcpClient.disconnectServer(serverName);
    this.connectedServers.delete(serverName);
    this.refreshToolCache();
  }

  /**
   * Get all available MCP tools as AI SDK tools
   */
  getAvailableTools(): Record<string, Tool> {
    const tools: Record<string, Tool> = {};

    for (const [toolKey, tool] of this.toolCache) {
      tools[toolKey] = tool;
    }

    return tools;
  }

  /**
   * Get tools from a specific server
   */
  getServerTools(serverName: string): Record<string, Tool> {
    const tools: Record<string, Tool> = {};

    for (const [toolKey, tool] of this.toolCache) {
      if (toolKey.startsWith(`${serverName}_`)) {
        tools[toolKey] = tool;
      }
    }

    return tools;
  }

  /**
   * Get server status information
   */
  getServerStatus(): Record<string, MCPConnectionStatus> {
    const status: Record<string, MCPConnectionStatus> = {};

    for (const serverName of this.connectedServers) {
      status[serverName] = mcpClient.getServerStatus(serverName);
    }

    return status;
  }

  /**
   * Refresh the tool cache from connected servers
   */
  private refreshToolCache(): void {
    this.toolCache.clear();

    for (const serverName of this.connectedServers) {
      const tools = mcpClient.getServerTools(serverName);

      for (const toolDef of tools) {
        const toolKey = `${serverName}_${toolDef.name}`;

        const toolInstance = aiTool({
          description: `[${serverName}] ${toolDef.description}`,
          inputSchema: toolDef.inputSchema,
          execute: async (input: any, _options: any) => {
            try {
              const result = await mcpClient.executeServerTool(serverName, toolDef.name, input);

              return {
                ...result,
                _mcp: {
                  server: serverName,
                  tool: toolDef.name,
                  timestamp: new Date().toISOString(),
                },
              };
            } catch (error) {
              throw new Error(
                `MCP tool execution failed: ${error instanceof Error ? error.message : error}`,
              );
            }
          },
        });

        this.toolCache.set(toolKey, toolInstance);
      }
    }

    logInfo(`Refreshed tool cache: ${this.toolCache.size} tools available`);
  }

  /**
   * Auto-discover and connect to common MCP servers
   */
  async autoDiscoverServers(): Promise<void> {
    const commonServers: MCPServerConfig[] = [
      {
        name: 'filesystem',
        command: 'npx',
        args: ['@modelcontextprotocol/server-filesystem'],
        timeout: 10000,
        autoRestart: true,
        transport: 'stdio', // Default to stdio transport
      },
      {
        name: 'database',
        command: 'npx',
        args: ['@modelcontextprotocol/server-sqlite'],
        timeout: 10000,
        autoRestart: true,
        transport: 'stdio',
      },
      {
        name: 'context7',
        command: 'mcp-context7',
        args: [],
        timeout: 15000,
        autoRestart: true,
        transport: 'sse', // Context7 uses SSE transport
        sseEndpoint: 'https://api.context7.ai/mcp/stream',
      },
      {
        name: 'webSearch',
        command: 'npx',
        args: ['@modelcontextprotocol/server-brave-search'],
        timeout: 15000,
        autoRestart: true,
        transport: 'stdio',
      },
      {
        name: 'weather',
        command: 'npx',
        args: ['@modelcontextprotocol/server-weather'],
        timeout: 10000,
        autoRestart: true,
        transport: 'stdio',
      },
    ];

    await this.connectServers(commonServers);
  }

  /**
   * Health check for all connected servers
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};

    for (const serverName of this.connectedServers) {
      try {
        const status = mcpClient.getServerStatus(serverName);
        health[serverName] = status === 'connected';
      } catch (_error) {
        health[serverName] = false;
      }
    }

    return health;
  }
}

/**
 * Global MCP tool manager instance
 */
export const mcpToolManager = new MCPToolManager();

/**
 * Create MCP toolset with automatic server discovery
 */
export async function createMCPToolset(
  options: {
    servers?: MCPServerConfig[];
    autoDiscover?: boolean;
    includeServerPrefix?: boolean;
  } = {},
): Promise<Record<string, Tool>> {
  const { servers, autoDiscover = true, includeServerPrefix = true } = options;

  if (autoDiscover) {
    await mcpToolManager.autoDiscoverServers();
  }

  if (servers) {
    await mcpToolManager.connectServers(servers);
  }

  const tools = mcpToolManager.getAvailableTools();

  if (!includeServerPrefix) {
    // Remove server prefix from tool names
    const prefixlessTools: Record<string, Tool> = {};

    for (const [key, tool] of Object.entries(tools)) {
      const parts = key.split('_');
      if (parts.length > 1) {
        const toolName = parts.slice(1).join('_');
        prefixlessTools[toolName] = tool;
      } else {
        prefixlessTools[key] = tool;
      }
    }

    return prefixlessTools;
  }

  return tools;
}

/**
 * Create tools for specific MCP servers
 */
export async function createServerToolset(serverName: string): Promise<Record<string, Tool>> {
  return mcpToolManager.getServerTools(serverName);
}

/**
 * MCP health monitoring tool
 */
export const mcpHealthTool = aiTool({
  description: 'Check MCP server health and connection status',
  inputSchema: z.object({
    serverName: z.string().optional().describe('Specific server to check'),
    detailed: z.boolean().default(false).describe('Include detailed information'),
  }),
  execute: async ({ serverName, detailed }) => {
    if (serverName) {
      const status = mcpToolManager.getServerStatus()[serverName];
      const tools = mcpToolManager.getServerTools(serverName);

      return {
        server: serverName,
        status,
        toolCount: Object.keys(tools).length,
        ...(detailed && {
          tools: Object.keys(tools),
          lastCheck: new Date().toISOString(),
        }),
      };
    }

    const allStatus = mcpToolManager.getServerStatus();
    const healthCheck = await mcpToolManager.healthCheck();

    return {
      servers: allStatus,
      health: healthCheck,
      totalServers: Object.keys(allStatus).length,
      healthyServers: Object.values(healthCheck).filter(Boolean).length,
      ...(detailed && {
        toolCounts: Object.fromEntries(
          Object.keys(allStatus).map(name => [
            name,
            Object.keys(mcpToolManager.getServerTools(name)).length,
          ]),
        ),
      }),
    };
  },
});

/**
 * Common MCP server configurations with enhanced transport support
 */
export const commonMCPServers = {
  filesystem: {
    name: 'filesystem',
    command: 'npx',
    args: ['@modelcontextprotocol/server-filesystem'],
    timeout: 10000,
    transport: 'stdio' as const,
  },
  database: {
    name: 'database',
    command: 'npx',
    args: ['@modelcontextprotocol/server-sqlite'],
    timeout: 10000,
    transport: 'stdio' as const,
  },
  context7: {
    name: 'context7',
    command: 'mcp-context7',
    args: [],
    timeout: 15000,
    transport: 'sse' as const,
    sseEndpoint: 'https://api.context7.ai/mcp/stream',
    autoRestart: true,
  },
  webSearch: {
    name: 'webSearch',
    command: 'npx',
    args: ['@modelcontextprotocol/server-brave-search'],
    timeout: 15000,
    transport: 'stdio' as const,
  },
  weather: {
    name: 'weather',
    command: 'npx',
    args: ['@modelcontextprotocol/server-weather'],
    timeout: 10000,
    transport: 'stdio' as const,
  },
} as const;
