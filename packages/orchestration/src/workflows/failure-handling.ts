import { type Client } from '@upstash/qstash';

import type { WorkflowContext } from '@upstash/workflow';

/**
 * Failure context from Upstash Workflow serve function
 */
export interface WorkflowFailureContext<T = any> {
  context: WorkflowContext<T>;
  failHeaders: Record<string, string>;
  failResponse: string;
  failStatus: number;
}

/**
 * Workflow failure handling configuration
 */
export interface FailureHandlingConfig {
  /** Custom alerting function */
  alertFunction?: (alert: FailureAlert) => Promise<void>;
  /** Custom error categorization */
  categorizeError?: (failureContext: WorkflowFailureContext) => string;
  /** Enable DLQ monitoring */
  enableDLQMonitoring?: boolean;
  /** Enable Sentry error logging */
  enableSentryLogging?: boolean;
  /** Custom failure function for immediate error handling */
  failureFunction?: (failureContext: WorkflowFailureContext) => Promise<void>;
  /** External failure URL for when the main service is unavailable */
  failureUrl?: string;
  /** QStash client for DLQ operations */
  qstashClient?: Client;
  /** Retry configuration */
  retryConfig?: {
    maxRetries: number;
    retryBackoff: 'exponential' | 'linear' | 'fixed';
    baseDelayMs: number;
  };
}

/**
 * Failure alert structure
 */
export interface FailureAlert {
  context?: any;
  errorCategory: string;
  failureCount: number;
  message: string;
  timestamp: string;
  type: 'workflow_failure' | 'dlq_overflow' | 'repeated_failure';
  workflowRunId?: string;
  workflowUrl?: string;
}

/**
 * Workflow failure statistics
 */
export interface FailureStats {
  failuresByCategory: Record<string, number>;
  failuresByWorkflow: Record<string, number>;
  recentFailures: {
    workflowRunId: string;
    workflowUrl: string;
    failedAt: string;
    errorCategory: string;
    retryCount: number;
  }[];
  totalFailures: number;
}

/**
 * Global failure tracking (in production, use Redis/database)
 */
const globalFailureTracking = new Map<
  string,
  {
    failureCount: number;
    firstFailure: string;
    lastFailure: string;
    errorCategories: Set<string>;
  }
>();

/**
 * Create a comprehensive failure function for workflow serve
 */
export function createFailureFunction(config: FailureHandlingConfig = {}) {
  return async (failureContext: WorkflowFailureContext) => {
    const { context, failHeaders, failResponse, failStatus } = failureContext;
    const workflowRunId = context.workflowRunId;
    const workflowUrl = context.url || 'unknown';

    console.error('[WORKFLOW-FAILURE] Workflow failed:', {
      failResponse: failResponse?.substring(0, 500), // Truncate for logging
      failStatus,
      timestamp: new Date().toISOString(),
      workflowRunId,
      workflowUrl,
    });

    try {
      // 1. Categorize the error
      const errorCategory = config.categorizeError
        ? config.categorizeError(failureContext)
        : categorizeWorkflowError(failStatus, failResponse, failHeaders);

      // 2. Track failure statistics
      trackFailure(workflowRunId, workflowUrl, errorCategory);

      // 3. Log to Sentry if enabled
      if (config.enableSentryLogging) {
        await logToSentry(failureContext, errorCategory);
      }

      // 4. Check for repeated failures and alert
      const failureStats = getFailureStats(workflowUrl);
      if (failureStats.failureCount > 5) {
        // Configurable threshold
        await sendFailureAlert(
          {
            type: 'repeated_failure',
            context: { failResponse: failResponse?.substring(0, 200), failStatus },
            errorCategory,
            failureCount: failureStats.failureCount,
            message: `Workflow ${workflowUrl} has failed ${failureStats.failureCount} times`,
            timestamp: new Date().toISOString(),
            workflowRunId,
            workflowUrl,
          },
          config.alertFunction,
        );
      }

      // 5. Monitor DLQ if enabled
      if (config.enableDLQMonitoring && config.qstashClient) {
        await monitorDLQAfterFailure(config.qstashClient, workflowUrl, config.alertFunction);
      }

      // 6. Execute custom failure function
      if (config.failureFunction) {
        await config.failureFunction(failureContext);
      }

      // 7. Log comprehensive failure information for debugging
      await logFailureForDebugging(failureContext, errorCategory);
    } catch (error) {
      console.error('[WORKFLOW-FAILURE] Error in failure handler:', error);
      // Don't throw - we don't want failure handler to cause additional failures
    }
  };
}

/**
 * Categorize workflow errors based on status code, response, and headers
 */
export function categorizeWorkflowError(
  failStatus: number,
  failResponse: string,
  failHeaders: Record<string, string>,
): string {
  // Network/Infrastructure errors
  if (failStatus === 0 || failStatus >= 500) {
    if (failHeaders['ngrok-error-code']) {
      return 'ngrok_tunnel_error';
    }
    if (failStatus === 502 || failStatus === 503 || failStatus === 504) {
      return 'gateway_error';
    }
    return 'server_error';
  }

  // Client errors
  if (failStatus === 404) {
    if (failHeaders['ngrok-error-code'] === 'ERR_NGROK_3200') {
      return 'ngrok_url_not_found';
    }
    return 'endpoint_not_found';
  }

  if (failStatus === 401 || failStatus === 403) {
    return 'authentication_error';
  }

  if (failStatus === 429) {
    return 'rate_limit_exceeded';
  }

  if (failStatus >= 400 && failStatus < 500) {
    return 'client_error';
  }

  // Timeout errors
  if (failResponse?.includes('timeout') || failResponse?.includes('TIMEOUT')) {
    return 'timeout_error';
  }

  // Database errors
  if (failResponse?.includes('database') || failResponse?.includes('connection')) {
    return 'database_error';
  }

  // Platform-specific errors
  if (failResponse?.includes('vercel') || failResponse?.includes('netlify')) {
    return 'platform_timeout';
  }

  return 'unknown_error';
}

/**
 * Track failure in global statistics
 */
function trackFailure(workflowRunId: string, workflowUrl: string, errorCategory: string): void {
  const key = workflowUrl;
  const existing = globalFailureTracking.get(key);

  if (existing) {
    existing.failureCount++;
    existing.lastFailure = new Date().toISOString();
    existing.errorCategories.add(errorCategory);
  } else {
    globalFailureTracking.set(key, {
      errorCategories: new Set([errorCategory]),
      failureCount: 1,
      firstFailure: new Date().toISOString(),
      lastFailure: new Date().toISOString(),
    });
  }
}

/**
 * Get failure statistics for a workflow
 */
function getFailureStats(workflowUrl: string): {
  failureCount: number;
  firstFailure: string;
  lastFailure: string;
  errorCategories: string[];
} {
  const stats = globalFailureTracking.get(workflowUrl);

  if (!stats) {
    return {
      errorCategories: [],
      failureCount: 0,
      firstFailure: '',
      lastFailure: '',
    };
  }

  return {
    errorCategories: Array.from(stats.errorCategories),
    failureCount: stats.failureCount,
    firstFailure: stats.firstFailure,
    lastFailure: stats.lastFailure,
  };
}

/**
 * Log workflow failure to Sentry
 */
async function logToSentry(
  failureContext: WorkflowFailureContext,
  errorCategory: string,
): Promise<void> {
  try {
    // Check if Sentry is available
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      const Sentry = (window as any).Sentry;

      Sentry.captureException(new Error(`Workflow failed: ${failureContext.failResponse}`), {
        extra: {
          failHeaders: failureContext.failHeaders,
          requestPayload: failureContext.context.requestPayload,
        },
        tags: {
          errorCategory,
          failStatus: failureContext.failStatus.toString(),
          workflowRunId: failureContext.context.workflowRunId,
          workflowUrl: failureContext.context.url,
        },
      });
    } else if (process.env.SENTRY_DSN) {
      // Server-side Sentry logging
      console.error('[SENTRY] Workflow failure logged:', {
        errorCategory,
        failStatus: failureContext.failStatus,
        workflowRunId: failureContext.context.workflowRunId,
      });
    }
  } catch (error) {
    console.error('[WORKFLOW-FAILURE] Failed to log to Sentry:', error);
  }
}

/**
 * Send failure alert
 */
async function sendFailureAlert(
  alert: FailureAlert,
  alertFunction?: (alert: FailureAlert) => Promise<void>,
): Promise<void> {
  try {
    if (alertFunction) {
      await alertFunction(alert);
    } else {
      // Default alert logging
      console.warn('[WORKFLOW-ALERT]', alert);
    }
  } catch (error) {
    console.error('[WORKFLOW-FAILURE] Failed to send alert:', error);
  }
}

/**
 * Monitor DLQ after a workflow failure
 */
async function monitorDLQAfterFailure(
  qstashClient: Client,
  workflowUrl: string,
  alertFunction?: (alert: FailureAlert) => Promise<void>,
): Promise<void> {
  try {
    // Get DLQ messages (implementation depends on QStash API)
    const dlqMessages = await getDLQMessages(qstashClient);
    const workflowDLQMessages = dlqMessages.filter(
      (msg: any) => msg.url === workflowUrl || msg.workflowUrl === workflowUrl,
    );

    if (workflowDLQMessages.length > 10) {
      // Configurable threshold
      await sendFailureAlert(
        {
          type: 'dlq_overflow',
          errorCategory: 'dlq_overflow',
          failureCount: workflowDLQMessages.length,
          message: `DLQ has ${workflowDLQMessages.length} messages for workflow ${workflowUrl}`,
          timestamp: new Date().toISOString(),
          workflowUrl,
        },
        alertFunction,
      );
    }
  } catch (error) {
    console.error('[WORKFLOW-FAILURE] Failed to monitor DLQ:', error);
  }
}

/**
 * Get DLQ messages (placeholder - actual implementation depends on QStash API)
 */
async function getDLQMessages(qstashClient: Client): Promise<any[]> {
  try {
    // This is a placeholder - actual QStash DLQ API call
    const response = await qstashClient.http.request({
      method: 'GET',
      path: ['v2', 'dlq'],
    });
    return response || [];
  } catch (error) {
    console.error('[DLQ] Failed to get DLQ messages:', error);
    return [];
  }
}

/**
 * Log comprehensive failure information for debugging
 */
async function logFailureForDebugging(
  failureContext: WorkflowFailureContext,
  errorCategory: string,
): Promise<void> {
  const debugInfo = {
    // Add debugging hints based on error type
    debuggingHints: getDebuggingHints(failureContext, errorCategory),
    errorCategory,
    failHeaders: failureContext.failHeaders,
    failResponse: failureContext.failResponse,
    failStatus: failureContext.failStatus,
    requestPayload: failureContext.context.requestPayload,
    timestamp: new Date().toISOString(),
    workflowRunId: failureContext.context.workflowRunId,
    workflowUrl: failureContext.context.url,
  };

  console.error('[WORKFLOW-DEBUG] Comprehensive failure information:', debugInfo);

  // In production, you might want to send this to a logging service
  if (process.env.DEBUG_WEBHOOK_URL) {
    try {
      await fetch(process.env.DEBUG_WEBHOOK_URL, {
        body: JSON.stringify(debugInfo),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
    } catch (error) {
      console.error('[WORKFLOW-DEBUG] Failed to send debug info to webhook:', error);
    }
  }
}

/**
 * Get debugging hints based on error category
 */
function getDebuggingHints(
  failureContext: WorkflowFailureContext,
  errorCategory: string,
): string[] {
  const hints: string[] = [];

  switch (errorCategory) {
    case 'ngrok_url_not_found':
      hints.push('Check if your ngrok tunnel is running');
      hints.push('Verify the ngrok URL in your workflow configuration');
      hints.push('Ensure the local server is running on the correct port');
      break;

    case 'endpoint_not_found':
      hints.push('Verify the endpoint URL exists');
      hints.push('Check route configuration in your application');
      hints.push('Ensure the HTTP method (GET/POST) is correct');
      break;

    case 'platform_timeout':
      hints.push('Check if the function execution time exceeds platform limits');
      hints.push('Consider breaking the workflow into smaller steps');
      hints.push('Optimize database queries and external API calls');
      break;

    case 'authentication_error':
      hints.push('Verify API keys and authentication tokens');
      hints.push('Check if authorization headers are correctly set');
      hints.push('Ensure the endpoint has proper access permissions');
      break;

    case 'database_error':
      hints.push('Check database connection configuration');
      hints.push('Verify database credentials and connection string');
      hints.push('Check if database is accessible from your deployment');
      break;

    case 'rate_limit_exceeded':
      hints.push('Implement exponential backoff in your workflow');
      hints.push('Add delays between API calls');
      hints.push('Consider using flow control to limit request rate');
      break;

    default:
      hints.push('Check the full error response and headers for more details');
      hints.push('Review recent changes to the workflow or dependencies');
      hints.push('Test the endpoint manually to reproduce the issue');
  }

  return hints;
}

/**
 * Get comprehensive failure statistics
 */
export function getComprehensiveFailureStats(): FailureStats {
  const totalFailures = Array.from(globalFailureTracking.values()).reduce(
    (sum, stats) => sum + stats.failureCount,
    0,
  );

  const failuresByCategory: Record<string, number> = {};
  const failuresByWorkflow: Record<string, number> = {};
  const recentFailures: FailureStats['recentFailures'] = [];

  globalFailureTracking.forEach((stats, workflowUrl) => {
    failuresByWorkflow[workflowUrl] = stats.failureCount;

    stats.errorCategories.forEach((category) => {
      failuresByCategory[category] = (failuresByCategory[category] || 0) + 1;
    });

    recentFailures.push({
      errorCategory: Array.from(stats.errorCategories)[0], // Most recent category
      failedAt: stats.lastFailure,
      retryCount: stats.failureCount,
      workflowRunId: 'tracked-globally', // Would need individual tracking for this
      workflowUrl,
    });
  });

  return {
    failuresByCategory,
    failuresByWorkflow,
    recentFailures: recentFailures
      .sort((a, b) => new Date(b.failedAt).getTime() - new Date(a.failedAt).getTime())
      .slice(0, 10), // Last 10 failures
    totalFailures,
  };
}

/**
 * Clear failure tracking (development only)
 */
export function clearFailureTracking(): void {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Failure tracking clearing is only available in development');
  }

  globalFailureTracking.clear();
  console.log('[WORKFLOW-FAILURE] Cleared all failure tracking');
}

/**
 * Create a complete workflow configuration with proper failure handling
 */
export function createWorkflowWithFailureHandling<T>(
  handler: (context: WorkflowContext<T>) => Promise<any>,
  config: FailureHandlingConfig & {
    retries?: number;
    verbose?: boolean;
  } = {},
) {
  return {
    config: {
      failureFunction: createFailureFunction(config),
      failureUrl: config.failureUrl,
      retries: config.retryConfig?.maxRetries || 3,
      verbose: config.verbose || process.env.NODE_ENV === 'development',
    },
    handler,
  };
}
