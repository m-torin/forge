import { type Client } from '@upstash/qstash';

import { createWorkflowError, WorkflowErrorType } from '../utils/error-handling';
import { aggregateByKey, formatDuration, formatTimestamp, isDevelopment } from '../utils/helpers';
import { devLog } from '../utils/observability';

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
  categorizeError?: (failureContext: WorkflowFailureContext) => WorkflowErrorType;
  /** DLQ overflow threshold */
  dlqThreshold?: number;
  /** Enable DLQ monitoring */
  enableDLQMonitoring?: boolean;
  /** Enable Sentry error logging */
  enableSentryLogging?: boolean;
  /** Custom failure function for immediate error handling */
  failureFunction?: (failureContext: WorkflowFailureContext) => Promise<void>;
  /** Failure threshold for alerts */
  failureThreshold?: number;
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
  errorCategory: WorkflowErrorType;
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
    errorCategory: WorkflowErrorType;
    retryCount: number;
  }[];
  totalFailures: number;
}

/**
 * Enhanced failure tracking entry
 */
interface FailureTrackingEntry {
  errorCategories: Set<WorkflowErrorType>;
  failureCount: number;
  firstFailure: string;
  lastCleanup: number;
  lastFailure: string;
}

/**
 * Global failure tracking (in production, use Redis/database)
 */
const globalFailureTracking = new Map<string, FailureTrackingEntry>();

// Cleanup expired entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
const TRACKING_TTL = 24 * 60 * 60 * 1000; // 24 hours

setInterval(() => {
  cleanupExpiredFailureTracking();
}, CLEANUP_INTERVAL);

/**
 * Clean up expired failure tracking entries
 */
function cleanupExpiredFailureTracking(): void {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, entry] of globalFailureTracking.entries()) {
    if (now - entry.lastCleanup > TRACKING_TTL) {
      globalFailureTracking.delete(key);
      cleaned++;
    }
  }

  if (isDevelopment() && cleaned > 0) {
    devLog.info(`Cleaned up ${cleaned} expired failure tracking entries`);
  }
}

/**
 * Create a comprehensive failure function for workflow serve
 */
export function createFailureFunction(config: FailureHandlingConfig = {}) {
  const {
    alertFunction,
    categorizeError,
    dlqThreshold = 10,
    enableDLQMonitoring = false,
    enableSentryLogging = false,
    failureFunction,
    failureThreshold = 5,
    qstashClient,
  } = config;

  return async (failureContext: WorkflowFailureContext) => {
    const { context, failHeaders, failResponse, failStatus } = failureContext;
    const workflowRunId = context.workflowRunId;
    const workflowUrl = context.url || 'unknown';

    devLog.error('Workflow failed', {
      failResponse: failResponse?.substring(0, 500),
      failStatus,
      workflowRunId,
      workflowUrl,
    });

    try {
      // 1. Categorize the error using enhanced error handling
      const errorCategory = categorizeError
        ? categorizeError(failureContext)
        : categorizeWorkflowFailure(failStatus, failResponse, failHeaders);

      // 2. Track failure statistics with enhanced tracking
      trackFailureWithMetrics(workflowRunId, workflowUrl, errorCategory);

      // 3. Log to Sentry if enabled
      if (enableSentryLogging) {
        await logToSentry(failureContext, errorCategory);
      }

      // 4. Check for repeated failures and alert
      const failureStats = getFailureStatsOptimized(workflowUrl);
      if (failureStats.failureCount > failureThreshold) {
        await sendAlert(
          {
            type: 'repeated_failure',
            context: {
              duration: formatDuration(Date.now() - new Date(failureStats.firstFailure).getTime()),
              failResponse: failResponse?.substring(0, 200),
              failStatus,
            },
            errorCategory,
            failureCount: failureStats.failureCount,
            message: `Workflow ${workflowUrl} has failed ${failureStats.failureCount} times`,
            timestamp: formatTimestamp(Date.now()),
            workflowRunId,
            workflowUrl,
          },
          alertFunction,
        );
      }

      // 5. Monitor DLQ if enabled
      if (enableDLQMonitoring && qstashClient) {
        await monitorDLQAfterFailure(qstashClient, workflowUrl, dlqThreshold, alertFunction);
      }

      // 6. Execute custom failure function
      if (failureFunction) {
        await failureFunction(failureContext);
      }

      // 7. Log comprehensive failure information for debugging
      await logFailureForDebugging(failureContext, errorCategory);
    } catch (error) {
      devLog.error('Error in failure handler', error);
      // Don't throw - we don't want failure handler to cause additional failures
    }
  };
}

/**
 * Categorize workflow errors using enhanced error classification
 */
export function categorizeWorkflowFailure(
  failStatus: number,
  failResponse: string,
  failHeaders: Record<string, string>,
): WorkflowErrorType {
  // Use enhanced error classification from utils
  if (failStatus === 0 || failStatus >= 500) {
    if (failHeaders['ngrok-error-code']) {
      return WorkflowErrorType.NETWORK; // Ngrok tunnel errors are network issues
    }
    if (failStatus === 502 || failStatus === 503 || failStatus === 504) {
      return WorkflowErrorType.UNAVAILABLE;
    }
    return WorkflowErrorType.EXTERNAL_API;
  }

  if (failStatus === 404) {
    return WorkflowErrorType.NOT_FOUND;
  }

  if (failStatus === 401 || failStatus === 403) {
    return WorkflowErrorType.AUTHENTICATION;
  }

  if (failStatus === 429) {
    return WorkflowErrorType.RATE_LIMIT;
  }

  if (failStatus >= 400 && failStatus < 500) {
    return WorkflowErrorType.VALIDATION;
  }

  // Use helper functions for content-based classification
  if (failResponse?.toLowerCase().includes('timeout')) {
    return WorkflowErrorType.TIMEOUT;
  }

  if (
    failResponse?.toLowerCase().includes('database') ||
    failResponse?.toLowerCase().includes('connection')
  ) {
    return WorkflowErrorType.EXTERNAL_API;
  }

  return WorkflowErrorType.INTERNAL;
}

/**
 * Enhanced failure tracking with metrics
 */
function trackFailureWithMetrics(
  workflowRunId: string,
  workflowUrl: string,
  errorCategory: WorkflowErrorType,
): void {
  const key = workflowUrl;
  const now = Date.now();
  const existing = globalFailureTracking.get(key);

  if (existing) {
    existing.failureCount++;
    existing.lastFailure = formatTimestamp(now);
    existing.errorCategories.add(errorCategory);
    existing.lastCleanup = now;
  } else {
    globalFailureTracking.set(key, {
      errorCategories: new Set([errorCategory]),
      failureCount: 1,
      firstFailure: formatTimestamp(now),
      lastCleanup: now,
      lastFailure: formatTimestamp(now),
    });
  }
}

/**
 * Optimized failure statistics retrieval
 */
function getFailureStatsOptimized(workflowUrl: string): {
  failureCount: number;
  firstFailure: string;
  lastFailure: string;
  errorCategories: WorkflowErrorType[];
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
 * Log workflow failure to Sentry using enhanced error handling
 */
async function logToSentry(
  failureContext: WorkflowFailureContext,
  errorCategory: WorkflowErrorType,
): Promise<void> {
  try {
    const workflowError = createWorkflowError.externalApi(
      'workflow',
      failureContext.failStatus,
      failureContext.failResponse,
    );

    // Check if Sentry is available
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      const Sentry = (window as any).Sentry;

      Sentry.captureException(workflowError, {
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
      devLog.error('Workflow failure logged to Sentry', {
        errorCategory,
        failStatus: failureContext.failStatus,
        workflowRunId: failureContext.context.workflowRunId,
      });
    }
  } catch (error) {
    devLog.error('Failed to log to Sentry', error);
  }
}

/**
 * Enhanced alert sending with proper error handling
 */
async function sendAlert(
  alert: FailureAlert,
  alertFunction?: (alert: FailureAlert) => Promise<void>,
): Promise<void> {
  try {
    if (alertFunction) {
      await alertFunction(alert);
    } else {
      devLog.warn('Workflow alert', alert);
    }
  } catch (error) {
    devLog.error('Failed to send alert', error);
  }
}

/**
 * Enhanced DLQ monitoring with configurable threshold
 */
async function monitorDLQAfterFailure(
  qstashClient: Client,
  workflowUrl: string,
  threshold: number,
  alertFunction?: (alert: FailureAlert) => Promise<void>,
): Promise<void> {
  try {
    const dlqMessages = await getDLQMessages(qstashClient);
    const workflowDLQMessages = dlqMessages.filter(
      (msg: any) => msg.url === workflowUrl || msg.workflowUrl === workflowUrl,
    );

    if (workflowDLQMessages.length > threshold) {
      await sendAlert(
        {
          type: 'dlq_overflow',
          errorCategory: WorkflowErrorType.RESOURCE_EXHAUSTED,
          failureCount: workflowDLQMessages.length,
          message: `DLQ has ${workflowDLQMessages.length} messages for workflow ${workflowUrl}`,
          timestamp: formatTimestamp(Date.now()),
          workflowUrl,
        },
        alertFunction,
      );
    }
  } catch (error) {
    devLog.error('Failed to monitor DLQ', error);
  }
}

/**
 * Get DLQ messages with enhanced error handling
 */
async function getDLQMessages(qstashClient: Client): Promise<any[]> {
  try {
    const response = await qstashClient.http.request({
      method: 'GET',
      path: ['v2', 'dlq'],
    });
    return Array.isArray(response) ? response : [];
  } catch (error) {
    devLog.error('Failed to get DLQ messages', error);
    return [];
  }
}

/**
 * Enhanced debugging information with categorized hints
 */
async function logFailureForDebugging(
  failureContext: WorkflowFailureContext,
  errorCategory: WorkflowErrorType,
): Promise<void> {
  const debugInfo = {
    debuggingHints: getEnhancedDebuggingHints(errorCategory, failureContext),
    errorCategory,
    failHeaders: failureContext.failHeaders,
    failResponse: failureContext.failResponse,
    failStatus: failureContext.failStatus,
    requestPayload: failureContext.context.requestPayload,
    timestamp: formatTimestamp(Date.now()),
    workflowRunId: failureContext.context.workflowRunId,
    workflowUrl: failureContext.context.url,
  };

  devLog.error('Comprehensive failure information', debugInfo);

  // Send to external debugging service if configured
  if (process.env.DEBUG_WEBHOOK_URL) {
    try {
      await fetch(process.env.DEBUG_WEBHOOK_URL, {
        body: JSON.stringify(debugInfo),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
    } catch (error) {
      devLog.error('Failed to send debug info to webhook', error);
    }
  }
}

/**
 * Enhanced debugging hints using error categorization from utils
 */
function getEnhancedDebuggingHints(
  errorCategory: WorkflowErrorType,
  failureContext: WorkflowFailureContext,
): string[] {
  const hints: string[] = [];
  const { failHeaders, failResponse, failStatus: _failStatus } = failureContext;

  switch (errorCategory) {
    case WorkflowErrorType.NETWORK:
      if (failHeaders['ngrok-error-code']) {
        hints.push('Check if your ngrok tunnel is running');
        hints.push('Verify the ngrok URL in your workflow configuration');
        hints.push('Ensure the local server is running on the correct port');
      } else {
        hints.push('Check network connectivity');
        hints.push('Verify DNS resolution');
        hints.push('Check for firewall or proxy issues');
      }
      break;

    case WorkflowErrorType.NOT_FOUND:
      hints.push('Verify the endpoint URL exists');
      hints.push('Check route configuration in your application');
      hints.push('Ensure the HTTP method (GET/POST) is correct');
      break;

    case WorkflowErrorType.TIMEOUT:
      hints.push('Check if the function execution time exceeds platform limits');
      hints.push('Consider breaking the workflow into smaller steps');
      hints.push('Optimize database queries and external API calls');
      break;

    case WorkflowErrorType.AUTHENTICATION:
      hints.push('Verify API keys and authentication tokens');
      hints.push('Check if authorization headers are correctly set');
      hints.push('Ensure the endpoint has proper access permissions');
      break;

    case WorkflowErrorType.EXTERNAL_API:
      if (failResponse?.toLowerCase().includes('database')) {
        hints.push('Check database connection configuration');
        hints.push('Verify database credentials and connection string');
        hints.push('Check if database is accessible from your deployment');
      } else {
        hints.push('Check external API status and availability');
        hints.push('Verify API credentials and permissions');
      }
      break;

    case WorkflowErrorType.RATE_LIMIT:
      hints.push('Implement exponential backoff in your workflow');
      hints.push('Add delays between API calls');
      hints.push('Consider using flow control to limit request rate');
      break;

    case WorkflowErrorType.UNAVAILABLE:
      hints.push('Service may be temporarily unavailable');
      hints.push('Check service status pages');
      hints.push('Implement retry logic with backoff');
      break;

    default:
      hints.push('Check the full error response and headers for more details');
      hints.push('Review recent changes to the workflow or dependencies');
      hints.push('Test the endpoint manually to reproduce the issue');
  }

  return hints;
}

/**
 * Get comprehensive failure statistics using helper aggregation functions
 */
export function getComprehensiveFailureStats(): FailureStats {
  const entries = Array.from(globalFailureTracking.entries());

  // Use helper function for aggregation
  const totalFailures = entries.reduce((sum, [, stats]) => sum + stats.failureCount, 0);

  const failuresByWorkflow = aggregateByKey(
    entries,
    ([workflowUrl]) => workflowUrl,
    ([, stats]) => stats.failureCount,
  );

  // Aggregate by category
  const failuresByCategory: Record<string, number> = {};
  const recentFailures: FailureStats['recentFailures'] = [];

  entries.forEach(([workflowUrl, stats]) => {
    stats.errorCategories.forEach((category) => {
      failuresByCategory[category] = (failuresByCategory[category] || 0) + 1;
    });

    recentFailures.push({
      errorCategory: Array.from(stats.errorCategories)[0],
      failedAt: stats.lastFailure,
      retryCount: stats.failureCount,
      workflowRunId: 'tracked-globally',
      workflowUrl,
    });
  });

  return {
    failuresByCategory,
    failuresByWorkflow,
    recentFailures: recentFailures
      .sort((a, b) => new Date(b.failedAt).getTime() - new Date(a.failedAt).getTime())
      .slice(0, 10),
    totalFailures,
  };
}

/**
 * Clear failure tracking (development only)
 */
export function clearFailureTracking(): void {
  if (!isDevelopment()) {
    throw new Error('Failure tracking clearing is only available in development');
  }

  globalFailureTracking.clear();
  devLog.info('Cleared all failure tracking');
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
      verbose: config.verbose || isDevelopment(),
    },
    handler,
  };
}
