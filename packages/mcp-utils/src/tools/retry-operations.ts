/**
 * MCP Tools for Retry Operations
 */

import { RetryPredicates } from '../utils/retry';

export interface RetryOperationArgs {
  operationName: string;
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryOn?: 'all' | 'network' | 'rateLimit' | 'temporary';
}

export interface RetryConfigArgs {
  scenario: 'api' | 'database' | 'file' | 'network' | 'test';
}

/**
 * Get retry configuration for common scenarios
 */
export function getRetryConfigTool(args: RetryConfigArgs) {
  const configs = {
    api: {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2,
      retryOn: 'temporary' as const,
    },
    database: {
      maxRetries: 5,
      initialDelay: 500,
      maxDelay: 5000,
      backoffMultiplier: 1.5,
      retryOn: 'temporary' as const,
    },
    file: {
      maxRetries: 2,
      initialDelay: 100,
      maxDelay: 1000,
      backoffMultiplier: 2,
      retryOn: 'all' as const,
    },
    network: {
      maxRetries: 3,
      initialDelay: 2000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      retryOn: 'network' as const,
    },
    test: {
      maxRetries: 2,
      initialDelay: 500,
      maxDelay: 2000,
      backoffMultiplier: 2,
      retryOn: 'all' as const,
    },
  };

  return configs[args.scenario] || configs.api;
}

/**
 * Execute retry operation helper
 * Note: This returns configuration, the actual retry is done by calling retryOperation
 */
export function retryOperationHelper(args: RetryOperationArgs) {
  // Determine retry predicate - using proper error typing
  let shouldRetry: (error: unknown) => boolean;
  switch (args.retryOn || 'all') {
    case 'network':
      shouldRetry = RetryPredicates.networkErrors;
      break;
    case 'rateLimit':
      shouldRetry = RetryPredicates.rateLimitErrors;
      break;
    case 'temporary':
      shouldRetry = RetryPredicates.temporaryErrors;
      break;
    default:
      shouldRetry = () => true;
  }

  return {
    config: {
      maxRetries: args.maxRetries || 3,
      initialDelay: args.initialDelay || 1000,
      maxDelay: args.maxDelay || 30000,
      backoffMultiplier: args.backoffMultiplier || 2,
      shouldRetry,
    },
    operationName: args.operationName,
  };
}
