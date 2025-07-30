/**
 * Interface for MCP (Model Context Protocol) tool definition
 */
export interface MCPTool {
  id: string;
  name: string;
  description: string;
  parameters: any; // JSON Schema
  isEnabled?: boolean;
  permissions?: string[];
}

/**
 * Interface for MCP connection configuration and status
 */
export interface MCPConnection {
  id: string;
  name: string;
  description?: string;
  transport?: 'stdio' | 'sse' | 'custom';
  config?: MCPConnectionConfig;
  status: 'connected' | 'connecting' | 'error' | 'disconnected';
  tools: MCPTool[];
  client?: any; // MCPClient instance
  connectedAt?: string;
  version?: string;
  capabilities?: {
    tools: boolean;
    prompts: boolean;
    resources: boolean;
    logging: boolean;
  };
  metrics?: {
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    averageLatency: number;
  };
}

/**
 * Configuration interface for MCP connections with transport options
 */
export interface MCPConnectionConfig {
  transport: 'stdio' | 'sse' | 'custom';
  name: string;
  description: string;

  // Stdio config
  command?: string;
  args?: string[];

  // SSE config
  url?: string;
  headers?: Record<string, string>;

  // Custom config
  customTransport?: any;
}

/**
 * Result interface for MCP tool execution
 */
export interface MCPToolResult {
  toolId?: string;
  status: 'success' | 'error';
  result?: any;
  error?: string;
  duration: number;
}
