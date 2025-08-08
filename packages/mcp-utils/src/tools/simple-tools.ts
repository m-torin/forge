/**
 * Simplified MCP Tools for Code Analysis
 * Using the same pattern as existing tools
 */

import type { MCPToolResponse } from '../types/mcp';
import { extractExports, extractFileMetadata, extractImports } from '../utils/code-analysis';
import { retryOperation, RetryPredicates } from '../utils/retry';
import { initializeAgentSession } from '../utils/session';
// Code Analysis Tools
export interface ExtractImportsArgs {
  content: string;
}

export interface ExtractExportsArgs {
  content: string;
}

export interface ExtractFileMetadataArgs {
  filePath: string;
  content: string;
}

export interface InitSessionArgs {
  sessionId: string;
  agentType: string;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  cacheSize?: number;
  cacheTTL?: number;
  enableAnalytics?: boolean;
}

export interface RetryOperationArgs {
  operation: () => Promise<any>;
  maxRetries?: number;
  initialDelay?: number;
}

/**
 * Extract imports from code content
 */
export function extractImportsTool(args: ExtractImportsArgs) {
  try {
    const imports = extractImports(args.content);
    return { imports };
  } catch (error) {
    throw new Error(
      `Failed to extract imports: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Extract exports from code content
 */
export function extractExportsTool(args: ExtractExportsArgs) {
  try {
    const exports = extractExports(args.content);
    return { exports };
  } catch (error) {
    throw new Error(
      `Failed to extract exports: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Extract comprehensive file metadata
 */
export function extractFileMetadataTool(args: ExtractFileMetadataArgs) {
  try {
    const metadata = extractFileMetadata(args.filePath, args.content);
    return metadata;
  } catch (error) {
    throw new Error(
      `Failed to extract file metadata: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Initialize agent session
 */
export const initSessionTool = {
  name: 'init_session',
  description: 'Initialize an agent session with logger and cache',
  inputSchema: {
    type: 'object',
    properties: {
      sessionId: {
        type: 'string',
        description: 'Unique session identifier',
      },
      agentType: {
        type: 'string',
        description: 'Type of agent (e.g., analysis, optimization)',
      },
      logLevel: {
        type: 'string',
        enum: ['debug', 'info', 'warn', 'error'],
        description: 'Logging level',
        default: 'info',
      },
      cacheSize: {
        type: 'number',
        description: 'Cache size limit',
        default: 100,
      },
      cacheTTL: {
        type: 'number',
        description: 'Cache TTL in milliseconds',
        default: 1800000,
      },
      enableAnalytics: {
        type: 'boolean',
        description: 'Enable cache analytics',
        default: true,
      },
    },
    required: ['sessionId', 'agentType'],
  },

  async execute(args: InitSessionArgs): Promise<MCPToolResponse> {
    try {
      const session = await initializeAgentSession(args.sessionId, args.agentType, {
        logLevel: args.logLevel,
        cacheSize: args.cacheSize,
        cacheTTL: args.cacheTTL,
        enableAnalytics: args.enableAnalytics,
      });

      const result = {
        sessionId: session.sessionId,
        agentType: session.agentType,
        startTime: session.startTime,
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result),
          },
        ],
        metadata: result,
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error initializing session: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  },
};

/**
 * Retry operation with exponential backoff
 */
export async function retryOperationTool(args: RetryOperationArgs) {
  try {
    const result = await retryOperation(args.operation, {
      maxRetries: args.maxRetries,
      initialDelay: args.initialDelay,
      shouldRetry: RetryPredicates.temporaryErrors,
    });
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
