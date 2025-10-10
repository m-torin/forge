/**
 * Simplified MCP Tools for Code Analysis
 * This file is kept for backward compatibility but most functionality
 * has been moved to specialized tools for better maintainability.
 *
 * @deprecated This file is deprecated. Use specialized tools instead:
 * - For imports/exports/metadata: use tools from code-analysis.ts
 * - For session management: use tools from session-management.ts
 * - For retry operations: use tools from retry-operations.ts
 */

import { retryOperation, RetryPredicates } from './retry';

export interface SimpleRetryOperationArgs {
  operation: () => Promise<any>;
  maxRetries?: number;
  initialDelay?: number;
}

/**
 * Retry operation with exponential backoff
 * @deprecated Use retryOperationHelper from retry-operations.ts instead
 */
export async function retryOperationTool(args: SimpleRetryOperationArgs) {
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
