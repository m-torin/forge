import type { WorkflowContext } from '@upstash/workflow';

/**
 * Development environment detection
 */
export function isDevelopment(): boolean {
  return (
    (process.env.NODE_ENV === 'development' ||
      process.env.QSTASH_URL?.includes('localhost') === true ||
      process.env.QSTASH_URL?.includes('127.0.0.1') === true ||
      process.env.QSTASH_URL?.includes('host.docker.internal') === true) ??
    false
  );
}

/**
 * Production environment detection
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production' && !isDevelopment();
}

/**
 * Development logging utilities
 */
export const devLog = {
  info: (message: string, data?: any) => {
    if (isDevelopment()) {
      console.log(`[DEV] ${message}`, data || '');
    }
  },

  warn: (message: string, data?: any) => {
    if (isDevelopment()) {
      console.warn(`[DEV] ${message}`, data || '');
    }
  },

  error: (message: string, data?: any) => {
    if (isDevelopment()) {
      console.error(`[DEV] ${message}`, data || '');
    }
  },

  workflow: (context: WorkflowContext<any>, message: string, data?: any) => {
    if (isDevelopment()) {
      console.log(`[WORKFLOW:${context.workflowRunId}] ${message}`, data || '');
    }
  },
};

/**
 * Development workflow helpers
 */
export const devWorkflow = {
  /**
   * Log incoming workflow request details
   */
  logRequest: (context: WorkflowContext<any>) => {
    if (!isDevelopment()) return;

    const { messageId, retried } = getQStashHeadersForDev(context);

    console.log('Incoming workflow request:', {
      payload: context.requestPayload,
      qstashMessageId: messageId || 'not-provided',
      qstashRetried: retried,
      timestamp: new Date().toISOString(),
      workflowRunId: context.workflowRunId,
    });
  },

  /**
   * Provide development tips for common issues
   */
  tips: {
    deduplication: () => {
      if (isDevelopment()) {
        console.log(
          'Tip: Set SKIP_WORKFLOW_DEDUPLICATION=true to disable deduplication in development',
        );
      }
    },

    waitForEvent: () => {
      if (isDevelopment()) {
        console.log(`
LOCAL DEVELOPMENT: Auto-approving to bypass waitForEvent messageId issue.
To fix this issue at the source:
1. Upgrade QStash CLI: npm install @upstash/qstash-cli@latest
2. Run with: npx @upstash/qstash-cli dev --full-metadata --persist
3. Or set: QSTASH_EVENT_METADATA=full
        `);
      }
    },

    localhost: () => {
      if (isDevelopment()) {
        console.log('Warning: Using localhost URL. Use ngrok for production-like testing.');
      }
    },
  },
};

/**
 * Get QStash headers helper for development
 */
function getQStashHeadersForDev(context: WorkflowContext<any>) {
  const headers = context.headers || {};

  let messageId: string | null = null;
  let retried = 0;

  if (typeof headers.get === 'function') {
    messageId = headers.get('upstash-message-id') || headers.get('qstash-message-id');
    retried = parseInt(headers.get('upstash-retried') || '0', 10);
  } else if (typeof headers === 'object' && headers !== null) {
    const h = headers as any;
    messageId = h['upstash-message-id'] || h['qstash-message-id'];
    retried = parseInt(h['upstash-retried'] || '0', 10);
  }

  return { messageId, retried };
}

/**
 * Development-only workflow wrapper that provides helpful logging
 */
export function withDevLogging<T>(
  handler: (context: WorkflowContext<T>) => Promise<any>,
): (context: WorkflowContext<T>) => Promise<any> {
  return async (context: WorkflowContext<T>) => {
    if (isDevelopment()) {
      devWorkflow.logRequest(context);

      const start = Date.now();
      try {
        const result = await handler(context);
        devLog.workflow(context, `Completed in ${Date.now() - start}ms`);
        return result;
      } catch (error) {
        devLog.workflow(context, `Failed after ${Date.now() - start}ms`, error);
        throw error;
      }
    }

    return handler(context);
  };
}

/**
 * Environment-specific configuration
 */
export interface EnvironmentConfig {
  deduplicationTTL: number;
  isLocal: boolean;
  retries: number;
  skipDeduplication: boolean;
  verbose: boolean;
}

/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const isDev = isDevelopment();

  return {
    deduplicationTTL: isDev ? 60 * 1000 : 30 * 60 * 1000,
    isLocal: isDev,
    retries: isDev ? 1 : 3,
    skipDeduplication: process.env.SKIP_WORKFLOW_DEDUPLICATION === 'true',
    verbose: isDev || process.env.VERBOSE === 'true',
  };
}

/**
 * Local development workarounds
 */
export const localDev = {
  /**
   * Handle waitForEvent in local development
   * Returns mock approval data to bypass messageId issues
   */
  mockApproval: (orderId: string) => ({
    approved: true,
    approver: 'auto-approved-local',
    notes: 'Local development auto-approval (messageId workaround)',
    timestamp: new Date().toISOString(),
  }),

  /**
   * Check if we should skip waitForEvent
   */
  shouldSkipWaitForEvent: (): boolean => {
    return isDevelopment() && process.env.SKIP_WAIT_FOR_EVENT === 'true';
  },

  /**
   * Get local development base URL
   */
  getBaseUrl: (): string => {
    if (process.env.QSTASH_URL?.includes('localhost')) {
      return `http://localhost:${process.env.PORT || 3400}`;
    }
    return process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : `http://localhost:${process.env.PORT || 3400}`;
  },
};
