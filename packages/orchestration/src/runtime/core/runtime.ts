import { devLog, getEnvironmentConfig } from '../../utils/observability';
import { isDevelopment, validatePayload, extractPayload } from '../../utils/helpers';
import { WorkflowResponse, createResponse, workflowError } from '../../utils/response';

import { getQStashHeaders, isDuplicateId, isDuplicateMessage } from '../deduplication';

import type { WorkflowContext } from '@upstash/workflow';

/**
 * Enhanced workflow context with common utilities
 */
export interface EnhancedContext<T = any> extends WorkflowContext<T> {
  /** Deduplication helpers */
  dedup: {
    isDuplicateMessage: () => boolean;
    isDuplicateId: (id: string) => boolean;
  };
  /** Development helpers */
  dev: {
    isDevelopment: boolean;
    log: typeof devLog.log;
  };
  /** Environment configuration */
  envConfig: ReturnType<typeof getEnvironmentConfig>;
  /** QStash headers */
  qstash: ReturnType<typeof getQStashHeaders>;
}

/**
 * Enhance a workflow context with utilities
 */
export function enhanceContext<T>(context: WorkflowContext<T>): EnhancedContext<T> {
  const enhanced = context as EnhancedContext<T>;

  // Add QStash headers
  enhanced.qstash = getQStashHeaders(context);

  // Add environment config
  enhanced.envConfig = getEnvironmentConfig();

  // Add development helpers
  enhanced.dev = {
    isDevelopment: isDevelopment(),
    log: devLog.log,
  };

  // Add deduplication helpers
  enhanced.dedup = {
    isDuplicateId: (id: string) => isDuplicateId(id),
    isDuplicateMessage: () => isDuplicateMessage(context),
  };

  return enhanced;
}

/**
 * Workflow wrapper that provides enhanced context
 */
export function withEnhancedContext<T>(
  handler: (context: EnhancedContext<T>) => Promise<any>,
): (context: WorkflowContext<T>) => Promise<any> {
  return async (context: WorkflowContext<T>) => {
    const enhanced = enhanceContext(context);
    return handler(enhanced);
  };
}

