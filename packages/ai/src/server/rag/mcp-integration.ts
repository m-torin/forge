/**
 * Model Context Protocol (MCP) Integration for RAG
 * Enables external tool integration and context sharing via MCP
 */

import { logInfo, logWarn } from '@repo/observability/server/next';
import { tool } from 'ai';
import { z } from 'zod/v4';
import type { RAGDatabaseBridge } from './database-bridge';
import { ragRetry } from './retry-strategies';

/**
 * MCP Server configuration
 */
export interface MCPServerConfig {
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
  timeout?: number;
}

/**
 * MCP Tool definition
 */
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: z.ZodSchema;
  serverName: string;
}

/**
 * MCP-RAG Bridge configuration
 */
export interface MCPRAGConfig {
  vectorStore: RAGDatabaseBridge;
  mcpServers: MCPServerConfig[];
  enableContextSharing?: boolean;
  maxContextLength?: number;
  defaultTopK?: number;
}

/**
 * MCP-RAG Bridge for external tool integration
 */
export class MCPRAGBridge {
  private connectedServers = new Map<string, any>();
  private availableTools = new Map<string, MCPTool>();

  constructor(private config: MCPRAGConfig) {}

  /**
   * Initialize MCP connections
   */
  async initialize(): Promise<void> {
    logInfo('Initializing MCP-RAG bridge', {
      operation: 'mcp_rag_initialize',
      serverCount: this.config.mcpServers.length,
    });

    for (const serverConfig of this.config.mcpServers) {
      try {
        await this.connectToServer(serverConfig);
      } catch (error) {
        logWarn('Failed to connect to MCP server', {
          operation: 'mcp_rag_server_connection_failed',
          serverName: serverConfig.name,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  /**
   * Connect to an MCP server
   */
  private async connectToServer(serverConfig: MCPServerConfig): Promise<void> {
    // This is a placeholder implementation
    // In a real implementation, you would use the actual MCP client library
    logInfo('Connected to MCP server', {
      operation: 'mcp_rag_server_connected',
      serverName: serverConfig.name,
    });

    // Simulate server connection
    this.connectedServers.set(serverConfig.name, {
      name: serverConfig.name,
      connected: true,
      lastActivity: Date.now(),
    });

    // Register example tools for demonstration
    if (serverConfig.name === 'web-search') {
      this.registerTool({
        name: 'webSearch',
        description: 'Search the web for current information',
        inputSchema: z.object({
          query: z.string().describe('Search query'),
          maxResults: z.number().default(5).describe('Maximum number of results'),
        }),
        serverName: serverConfig.name,
      });
    }

    if (serverConfig.name === 'database') {
      this.registerTool({
        name: 'databaseQuery',
        description: 'Query external database for structured data',
        inputSchema: z.object({
          query: z.string().describe('SQL or query string'),
          database: z.string().optional().describe('Database name'),
        }),
        serverName: serverConfig.name,
      });
    }
  }

  /**
   * Register an MCP tool
   */
  private registerTool(toolConfig: MCPTool): void {
    this.availableTools.set(toolConfig.name, toolConfig);
    logInfo('Registered MCP tool', {
      operation: 'mcp_rag_tool_registered',
      toolName: toolConfig.name,
      serverName: toolConfig.serverName,
    });
  }

  /**
   * Create RAG-enhanced MCP tool
   */
  createRAGEnhancedTool(toolName: string) {
    const mcpTool = this.availableTools.get(toolName);
    if (!mcpTool) {
      throw new Error(`MCP tool ${toolName} not found`);
    }

    return tool({
      description: `${mcpTool.description} (Enhanced with RAG context)`,
      inputSchema: z.object({
        includeRAGContext: z
          .boolean()
          .default(true)
          .describe('Include relevant context from knowledge base'),
        ragQuery: z
          .string()
          .optional()
          .describe('Custom query for RAG context (defaults to main query)'),
        maxRAGResults: z.number().default(3).describe('Maximum RAG context items to include'),
      }),
      execute: async (params: any) => {
        const { includeRAGContext, ragQuery, maxRAGResults, ...toolParams } = params;

        let ragContext: any[] = [];

        // Get RAG context if requested
        if (includeRAGContext) {
          try {
            const searchQuery = ragQuery || this.extractQueryFromParams(toolParams);

            if (searchQuery) {
              const results = await ragRetry.vector(
                async () =>
                  await this.config.vectorStore.queryDocuments(searchQuery, {
                    topK: maxRAGResults,
                    threshold: 0.7,
                    includeContent: true,
                  }),
              );

              ragContext = results.map(result => ({
                content: result.content,
                score: result.score,
                metadata: result.metadata,
              }));
            }
          } catch (error) {
            logWarn('Failed to retrieve RAG context for MCP tool', {
              operation: 'mcp_rag_context_retrieval_failed',
              toolName,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }

        // Execute the MCP tool with enhanced context
        try {
          const result = await this.executeMCPTool(mcpTool, toolParams, ragContext);

          return {
            toolResult: result,
            ragContext: ragContext.length > 0 ? ragContext : undefined,
            contextUsed: ragContext.length > 0,
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          logWarn('MCP tool execution failed', {
            operation: 'mcp_tool_execution_failed',
            toolName,
            error: error instanceof Error ? error.message : String(error),
          });

          // Return RAG context as fallback if tool fails
          if (ragContext.length > 0) {
            return {
              toolResult: null,
              ragContext,
              contextUsed: true,
              fallbackUsed: true,
              error: 'MCP tool failed, using RAG context as fallback',
              timestamp: new Date().toISOString(),
            };
          }

          throw error;
        }
      },
    });
  }

  /**
   * Execute MCP tool (placeholder implementation)
   */
  private async executeMCPTool(mcpTool: MCPTool, params: any, _context?: any[]): Promise<any> {
    // This is a placeholder implementation
    // In a real implementation, you would call the actual MCP server

    const server = this.connectedServers.get(mcpTool.serverName);
    if (!server || !server.connected) {
      throw new Error(`MCP server ${mcpTool.serverName} not connected`);
    }

    // Simulate tool execution based on tool name
    switch (mcpTool.name) {
      case 'webSearch':
        return {
          results: [
            {
              title: `Search result for: ${params.query}`,
              url: 'https://example.com/result1',
              snippet: `This is a mock search result for the query: ${params.query}`,
            },
          ],
          totalResults: 1,
        };

      case 'databaseQuery':
        return {
          rows: [{ id: 1, name: 'Sample Data', value: 'Mock database result' }],
          rowCount: 1,
          executionTime: '0.05s',
        };

      default:
        return {
          status: 'executed',
          tool: mcpTool.name,
          params,
          timestamp: new Date().toISOString(),
        };
    }
  }

  /**
   * Extract search query from tool parameters
   */
  private extractQueryFromParams(params: any): string | null {
    // Common query field names
    const queryFields = ['query', 'search', 'question', 'prompt', 'text'];

    for (const field of queryFields) {
      if (params[field] && typeof params[field] === 'string') {
        return params[field];
      }
    }

    return null;
  }

  /**
   * Create RAG-MCP hybrid tool for context sharing
   */
  createContextSharingTool() {
    return tool({
      description: 'Share knowledge base context with MCP tools for enhanced responses',
      inputSchema: z.object({
        targetTool: z.string().describe('Name of the MCP tool to enhance'),
        contextQuery: z.string().describe('Query to retrieve relevant context'),
        toolParams: z.record(z.string(), z.any()).describe('Parameters for the target tool'),
        maxContextItems: z.number().default(5).describe('Maximum context items to share'),
      }),
      execute: async ({ targetTool, contextQuery, toolParams, maxContextItems }) => {
        // Get RAG context
        const ragResults = await ragRetry.vector(
          async () =>
            await this.config.vectorStore.queryDocuments(contextQuery, {
              topK: maxContextItems,
              threshold: 0.7,
              includeContent: true,
            }),
        );

        const ragContext = ragResults.map(result => ({
          content: result.content,
          score: result.score,
          id: result.id,
        }));

        // Execute target MCP tool with context
        const mcpTool = this.availableTools.get(targetTool);
        if (!mcpTool) {
          return {
            error: `Target tool ${targetTool} not found`,
            availableTools: Array.from(this.availableTools.keys()),
          };
        }

        try {
          const toolResult = await this.executeMCPTool(mcpTool, toolParams, ragContext);

          return {
            toolResult,
            contextProvided: ragContext,
            contextItemCount: ragContext.length,
            averageRelevance:
              ragContext.reduce((sum, item) => sum + item.score, 0) / ragContext.length,
            executedTool: targetTool,
          };
        } catch (error) {
          return {
            error: `Failed to execute ${targetTool}: ${error instanceof Error ? error.message : String(error)}`,
            contextProvided: ragContext,
            contextItemCount: ragContext.length,
          };
        }
      },
    });
  }

  /**
   * Get available MCP tools
   */
  getAvailableTools(): string[] {
    return Array.from(this.availableTools.keys());
  }

  /**
   * Get server connection status
   */
  getServerStatus(): Array<{ name: string; connected: boolean; lastActivity: number }> {
    return Array.from(this.connectedServers.entries()).map(([name, server]) => ({
      name,
      connected: server.connected,
      lastActivity: server.lastActivity,
    }));
  }

  /**
   * Cleanup connections
   */
  async cleanup(): Promise<void> {
    logInfo('Cleaning up MCP-RAG bridge connections', {
      operation: 'mcp_rag_cleanup',
      serverCount: this.connectedServers.size,
    });

    this.connectedServers.clear();
    this.availableTools.clear();
  }
}

/**
 * Create MCP-RAG integration
 */
export function createMCPRAGIntegration(config: MCPRAGConfig): MCPRAGBridge {
  return new MCPRAGBridge(config);
}

/**
 * Factory function for common MCP server configurations
 */
export function createCommonMCPServers(): MCPServerConfig[] {
  return [
    {
      name: 'web-search',
      command: 'mcp-server-web-search',
      args: ['--api-key', process.env.SEARCH_API_KEY || ''],
      timeout: 30000,
    },
    {
      name: 'database',
      command: 'mcp-server-database',
      args: ['--connection-string', process.env.DATABASE_URL || ''],
      timeout: 15000,
    },
    {
      name: 'file-system',
      command: 'mcp-server-filesystem',
      args: ['--root-path', process.env.MCP_FILESYSTEM_ROOT || '/tmp'],
      timeout: 10000,
    },
  ];
}

/**
 * Example usage patterns
 */
export const mcpRAGExamples = {
  /**
   * Basic MCP-RAG setup
   */
  basic: `
import { createMCPRAGIntegration, createCommonMCPServers } from './mcp-integration';
import { createRAGDatabaseBridge } from './database-bridge';

const vectorStore = createRAGDatabaseBridge(config);
const mcpRAG = createMCPRAGIntegration({
  vectorStore,
  mcpServers: createCommonMCPServers(),
  enableContextSharing: true,
});

await mcpRAG.initialize();

// Create enhanced web search tool with RAG context
const contextualWebSearch = mcpRAG.createRAGEnhancedTool('webSearch');
  `,

  /**
   * Context sharing example
   */
  contextSharing: `
// Share knowledge base context with external tools
const contextSharing = mcpRAG.createContextSharingTool();

// Use in AI SDK streamText
const result = streamText({
  model: openai('gpt-4o'),
  tools: {
    contextualWebSearch: mcpRAG.createRAGEnhancedTool('webSearch'),
    contextSharing: contextSharing,
  },
  messages,
});
  `,
};
