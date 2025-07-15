import { MCPClientConfig } from './client';

/**
 * Pre-configured MCP transports for common use cases
 */
export const mcpTransports = {
  /**
   * Filesystem MCP server
   * Allows AI to read/write files in specified directory
   */
  filesystem: (rootPath: string = process.cwd()): MCPClientConfig => ({
    name: 'filesystem',
    transport: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', rootPath],
    },
  }),

  /**
   * SQLite MCP server
   * Allows AI to query SQLite databases
   */
  sqlite: (dbPath: string): MCPClientConfig => ({
    name: 'sqlite',
    transport: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-sqlite', dbPath],
    },
  }),

  /**
   * Git MCP server
   * Allows AI to read git repository information
   */
  git: (repoPath: string = process.cwd()): MCPClientConfig => ({
    name: 'git',
    transport: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-git', repoPath],
    },
  }),

  /**
   * Custom SSE transport
   */
  sse: (name: string, url: string): MCPClientConfig => ({
    name,
    transport: {
      type: 'sse',
      url,
    },
  }),

  /**
   * Custom stdio transport
   */
  stdio: (name: string, command: string, args: string[] = []): MCPClientConfig => ({
    name,
    transport: {
      type: 'stdio',
      command,
      args,
    },
  }),

  /**
   * HTTP transport using StreamableHTTPClientTransport
   */
  http: (name: string, httpUrl: string, sessionId?: string): MCPClientConfig => ({
    name,
    transport: {
      type: 'http',
      httpUrl,
      sessionId,
    },
  }),

  /**
   * Perplexity Ask MCP server
   * Allows AI to perform live web searches using Perplexity's Sonar API
   * Requires PERPLEXITY_API_KEY environment variable
   */
  perplexityAsk: (): MCPClientConfig => ({
    name: 'perplexity-ask',
    transport: {
      type: 'stdio',
      command: 'npx',
      // Use locally installed package if available, otherwise download with -y flag
      args: ['-y', 'server-perplexity-ask'],
    },
  }),
};
