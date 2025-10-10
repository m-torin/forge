/**
 * Canonical MCP (Model Context Protocol) types for consistent tool responses
 */

export interface MCPTextContent {
  type: string;
  text: string;
}

export interface MCPToolResponse<M = Record<string, unknown>> {
  content: MCPTextContent[];
  metadata?: M;
  isError?: boolean;
}

export interface MCPErrorResponse extends MCPToolResponse {
  isError: boolean;
  metadata?: {
    error?: string;
    action?: string;
    contextInfo?: string;
    timestamp?: string;
    errorChainDepth?: number;
    isAggregateError?: boolean;
    errorTypes?: string[];
    [key: string]: unknown;
  };
}
