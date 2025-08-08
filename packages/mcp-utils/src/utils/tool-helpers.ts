/**
 * Centralized helpers for MCP tool responses and execution
 */

import type { MCPErrorResponse, MCPToolResponse } from '../types/mcp';
import { createEnhancedMCPErrorResponse, withErrorHandling } from './error-handling';
import { safeStringifyAdvanced } from './stringify';

/**
 * Create a successful MCP response with JSON data
 */
export function ok(data: unknown, metadata?: Record<string, unknown>): MCPToolResponse {
  const { result } = safeStringifyAdvanced(data);
  return {
    content: [{ type: 'text', text: result }],
    metadata,
  };
}

/**
 * Create an error MCP response
 */
export function err(error: unknown, action: string, contextInfo?: string): MCPErrorResponse {
  return createEnhancedMCPErrorResponse(error, action, { contextInfo });
}

/**
 * Create a text-only MCP response
 */
export function text(text: string, metadata?: Record<string, unknown>): MCPToolResponse {
  return {
    content: [{ type: 'text', text }],
    metadata,
  };
}

/**
 * Wrapper for tool execution with standardized error handling
 */
export async function runTool<T extends Record<string, any>>(
  action: string,
  contextInfo: string,
  fn: () => Promise<MCPToolResponse>,
): Promise<MCPToolResponse> {
  try {
    return await withErrorHandling(fn, action, { contextInfo });
  } catch (error) {
    return createEnhancedMCPErrorResponse(error, action, { contextInfo });
  }
}
