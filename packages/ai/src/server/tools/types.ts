import type { z } from 'zod/v4';

/**
 * Tool definition following Vercel AI SDK patterns
 */
export interface ToolDefinition<TParameters extends z.ZodTypeAny = z.ZodTypeAny, TResult = any> {
  description: string;
  parameters: TParameters;
  execute: (args: z.infer<TParameters>) => TResult | Promise<TResult>;
}

/**
 * Tool with additional metadata
 */
export interface ExtendedTool<_TParameters extends z.ZodTypeAny = z.ZodTypeAny, _TResult = any> {
  tool: any; // Use generic any for now since CoreTool is no longer available
  metadata?: {
    category?: string;
    version?: string;
    experimental?: boolean;
    deprecated?: boolean;
  };
}

/**
 * Tool execution result with metadata
 */
export interface ToolResult<T = any> {
  data: T;
  metadata?: {
    duration?: number;
    tokensUsed?: number;
    cacheHit?: boolean;
  };
}

/**
 * Error types for tool execution
 */
export class ToolExecutionError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: any,
  ) {
    super(message);
    this.name = 'ToolExecutionError';
  }
}

/**
 * Tool categories for organization
 */
export enum ToolCategory {
  Document = 'document',
  Search = 'search',
  Data = 'data',
  Communication = 'communication',
  Analysis = 'analysis',
  Generation = 'generation',
}

/**
 * Type guard for tool results
 */
export function isToolResult<T>(value: any): value is ToolResult<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    (!('metadata' in value) || typeof value.metadata === 'object')
  );
}
