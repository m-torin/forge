import { isDevelopment } from '../../utils/helpers';
import { devLog, getEnvironmentConfig } from '../../utils/observability';
import { getQStashHeaders, isDuplicateId, isDuplicateMessage } from '../deduplication';

import type { WorkflowContext } from '@upstash/workflow';

/**
 * Enhanced workflow context with common utilities
 */
export interface EnhancedContext<T = unknown> extends WorkflowContext<T> {
  /** Deduplication helpers */
  readonly dedup: {
    readonly isDuplicateMessage: () => boolean;
    readonly isDuplicateId: (id: string) => boolean;
  };
  /** Development helpers */
  readonly dev: {
    readonly isDevelopment: boolean;
    readonly log: typeof devLog.log;
  };
  /** Environment configuration */
  readonly envConfig: ReturnType<typeof getEnvironmentConfig>;
  /** QStash headers */
  readonly qstash: ReturnType<typeof getQStashHeaders>;
}

/**
 * Enhance a workflow context with utilities
 */
export function enhanceContext<T>(context: WorkflowContext<T>): EnhancedContext<T> {
  // Create enhanced context by extending the original context
  const enhanced = Object.create(context) as EnhancedContext<T>;

  // Copy all properties from original context
  Object.assign(enhanced, context);

  // Add QStash headers
  Object.defineProperty(enhanced, 'qstash', {
    value: getQStashHeaders(context),
    writable: false,
    enumerable: true,
  });

  // Add environment config
  Object.defineProperty(enhanced, 'envConfig', {
    value: getEnvironmentConfig(),
    writable: false,
    enumerable: true,
  });

  // Add development helpers
  Object.defineProperty(enhanced, 'dev', {
    value: {
      isDevelopment: isDevelopment(),
      log: devLog.log,
    },
    writable: false,
    enumerable: true,
  });

  // Add deduplication helpers
  Object.defineProperty(enhanced, 'dedup', {
    value: {
      isDuplicateId: (id: string) => isDuplicateId(id),
      isDuplicateMessage: () => isDuplicateMessage(context),
    },
    writable: false,
    enumerable: true,
  });

  return enhanced;
}

/**
 * Workflow wrapper that provides enhanced context
 */
export function withEnhancedContext<T, R = unknown>(
  handler: (context: EnhancedContext<T>) => Promise<R>,
): (context: WorkflowContext<T>) => Promise<R> {
  return async (context: WorkflowContext<T>) => {
    const enhanced = enhanceContext(context);
    return handler(enhanced);
  };
}
