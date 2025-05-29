import { Client } from '@upstash/qstash';

import type { WorkflowContext } from '@upstash/workflow';
import { formatTimestamp, calculateBackoff, isDevelopment, createErrorMessage } from '../../utils/helpers';
import { devLog } from '../../utils/observability';
import { isNetworkError, isTimeoutError, isRateLimitError } from '../../utils/helpers';
import { isRetryableError as isRetryableErrorType, classifyError, WorkflowErrorType } from '../../utils/error-handling';

/**
 * Enhanced Dead Letter Queue configuration with QStash integration
 */
export interface DLQConfig {
  /** Custom error categorization function */
  categorizeError?: (error: Error) => string;
  /** DLQ endpoint URL (optional - can use QStash native DLQ) */
  dlqEndpoint?: string;
  /** Headers to include with DLQ messages */
  dlqHeaders?: Record<string, string>;
  /** Failure callback URL for QStash */
  failureCallback?: string;
  /** Whether to include original payload in DLQ message */
  includeOriginalPayload?: boolean;
  /** Maximum number of retries before sending to DLQ */
  maxRetries: number;
  /** QStash client for DLQ operations */
  qstashClient?: Client;
  /** Whether to retry certain error types */
  retryableErrors?: string[];
  /** Use QStash native DLQ instead of custom endpoint */
  useNativeDLQ?: boolean;
}

/**
 * DLQ message format
 */
export interface DLQMessage {
  context: {
    url?: string;
    headers?: Record<string, any>;
    environment: string;
  };
  errorCategory: string;
  errorMessage: string;
  failedStep: string;
  firstFailedAt: string;
  isRetryable: boolean;
  lastFailedAt: string;
  originalPayload: any;
  originalWorkflowRunId: string;
  retryCount: number;
}

/**
 * Error tracking for DLQ
 */
interface ErrorTracking {
  errors: string[];
  firstFailedAt: string;
  lastFailedAt: string;
  retryCount: number;
}

/**
 * Global error tracking (in production, use Redis)
 */
const globalErrorTracking = new Map<string, ErrorTracking>();

/**
 * Map WorkflowErrorType to string for DLQ compatibility
 */
function mapErrorTypeToString(errorType: WorkflowErrorType): string {
  const mapping: Record<WorkflowErrorType, string> = {
    [WorkflowErrorType.NETWORK]: 'network',
    [WorkflowErrorType.RATE_LIMIT]: 'rate_limit',
    [WorkflowErrorType.AUTHENTICATION]: 'authentication',
    [WorkflowErrorType.VALIDATION]: 'validation',
    [WorkflowErrorType.NOT_FOUND]: 'not_found',
    [WorkflowErrorType.EXTERNAL_API]: 'server_error',
    [WorkflowErrorType.TIMEOUT]: 'network',
    [WorkflowErrorType.UNAVAILABLE]: 'server_error',
    [WorkflowErrorType.INTERNAL]: 'unknown',
    [WorkflowErrorType.CONFLICT]: 'validation',
    [WorkflowErrorType.PERMISSION]: 'authentication',
    [WorkflowErrorType.RESOURCE_EXHAUSTED]: 'server_error',
    [WorkflowErrorType.DATA_CORRUPTION]: 'unknown',
    [WorkflowErrorType.CONFIGURATION]: 'unknown',
  };
  
  return mapping[errorType] || 'unknown';
}

/**
 * Categorize errors for DLQ handling using centralized error classification
 */
export function categorizeError(error: Error): string {
  const errorType = classifyError(error);
  return mapErrorTypeToString(errorType);
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: Error, retryableErrors?: string[]): boolean {
  const category = categorizeError(error);

  const defaultRetryableErrors = ['network', 'rate_limit', 'server_error'];
  const retryable = retryableErrors || defaultRetryableErrors;

  return retryable.includes(category);
}

/**
 * Get error tracking for a workflow run
 */
function getErrorTracking(workflowRunId: string, stepName: string): ErrorTracking {
  const key = `${workflowRunId}:${stepName}`;

  if (!globalErrorTracking.has(key)) {
    globalErrorTracking.set(key, {
      errors: [],
      firstFailedAt: formatTimestamp(Date.now()),
      lastFailedAt: formatTimestamp(Date.now()),
      retryCount: 0,
    });
  }

  return globalErrorTracking.get(key)!;
}

/**
 * Update error tracking
 */
function updateErrorTracking(workflowRunId: string, stepName: string, error: Error): ErrorTracking {
  const key = `${workflowRunId}:${stepName}`;
  const tracking = getErrorTracking(workflowRunId, stepName);

  tracking.retryCount++;
  tracking.lastFailedAt = formatTimestamp(Date.now());
  tracking.errors.push(error.message);

  globalErrorTracking.set(key, tracking);
  return tracking;
}

/**
 * Send message to Dead Letter Queue (supports both QStash native DLQ and custom endpoints)
 */
export async function sendToDLQ(
  context: WorkflowContext<any>,
  stepName: string,
  config: DLQConfig,
  error: Error,
  originalStepName: string,
): Promise<void> {
  const tracking = getErrorTracking(context.workflowRunId, originalStepName);
  const errorCategory = config.categorizeError
    ? config.categorizeError(error)
    : categorizeError(error);

  const dlqMessage: DLQMessage = {
    context: {
      url: context.url,
      environment: process.env.NODE_ENV || 'unknown',
      headers: context.headers,
    },
    errorCategory,
    errorMessage: error.message,
    failedStep: originalStepName,
    firstFailedAt: tracking.firstFailedAt,
    isRetryable: isRetryableError(error, config.retryableErrors),
    lastFailedAt: tracking.lastFailedAt,
    originalPayload: config.includeOriginalPayload ? context.requestPayload : undefined,
    originalWorkflowRunId: context.workflowRunId,
    retryCount: tracking.retryCount,
  };

  devLog.info(`Sending to DLQ: ${originalStepName} failed ${tracking.retryCount} times`);

  try {
    if (config.useNativeDLQ && config.qstashClient) {
      // Use QStash native DLQ - messages automatically go to DLQ after max retries
      devLog.info(`Using QStash native DLQ for failed message`);

      // Log the failure for monitoring (the message will automatically go to QStash DLQ)
      await logDLQMessage(dlqMessage, config);
    } else if (config.dlqEndpoint) {
      // Use custom DLQ endpoint
      await context.call(stepName, {
        url: config.dlqEndpoint,
        body: dlqMessage,
        failureCallback: config.failureCallback, // QStash failure callback
        headers: {
          'Content-Type': 'application/json',
          'X-DLQ-Message': 'true',
          'X-Error-Category': errorCategory,
          'X-Original-Step': originalStepName,
          'X-Retry-Count': tracking.retryCount.toString(),
          ...config.dlqHeaders,
        },
        method: 'POST',
        retries: 3, // Always retry DLQ sends
      });

      devLog.info(`Successfully sent to custom DLQ: ${config.dlqEndpoint}`);
    } else {
      devLog.warn(`No DLQ configuration available - logging error only`);
      await logDLQMessage(dlqMessage, config);
    }
  } catch (dlqError) {
    devLog.error(`Failed to send to DLQ: ${dlqError}`);
    // Don't throw - we don't want DLQ failures to fail the entire workflow
  }
}

/**
 * Log DLQ message for monitoring (when using native DLQ or as fallback)
 */
async function logDLQMessage(dlqMessage: DLQMessage, config: DLQConfig): Promise<void> {
  // Log to devLog (in production, you might want to send to logging service)
  devLog.error('Message sent to Dead Letter Queue:', {
    errorCategory: dlqMessage.errorCategory,
    errorMessage: dlqMessage.errorMessage,
    failedStep: dlqMessage.failedStep,
    isRetryable: dlqMessage.isRetryable,
    retryCount: dlqMessage.retryCount,
    workflowRunId: dlqMessage.originalWorkflowRunId,
  });

  // If a failure callback is configured, send notification
  if (config.failureCallback) {
    try {
      await fetch(config.failureCallback, {
        body: JSON.stringify({
          type: 'dlq_message',
          message: dlqMessage,
          timestamp: formatTimestamp(Date.now()),
        }),
        headers: {
          'Content-Type': 'application/json',
          'X-DLQ-Notification': 'true',
        },
        method: 'POST',
      });
    } catch (error) {
      devLog.error('Failed to send failure callback:', error);
    }
  }
}

/**
 * Wrapper for context.run with DLQ handling
 */
export async function runWithDLQ<T>(
  context: WorkflowContext<any>,
  stepName: string,
  stepFunction: () => Promise<T>,
  config: DLQConfig,
): Promise<T> {
  const tracking = getErrorTracking(context.workflowRunId, stepName);

  try {
    const result = await context.run(stepName, stepFunction);

    // Clear error tracking on success
    const key = `${context.workflowRunId}:${stepName}`;
    globalErrorTracking.delete(key);

    return result;
  } catch (error) {
    const err = error as Error;
    const updatedTracking = updateErrorTracking(context.workflowRunId, stepName, err);

    devLog.info(
      `Step ${stepName} failed (attempt ${updatedTracking.retryCount}/${config.maxRetries})`,
    );

    // Check if we should send to DLQ
    if (updatedTracking.retryCount >= config.maxRetries) {
      await sendToDLQ(context, 'send-to-dlq', config, err, stepName);

      // Don't throw after sending to DLQ - return a failure result instead
      throw new Error(`Step ${stepName} failed after ${config.maxRetries} retries. Sent to DLQ.`);
    }

    // Check if error is retryable
    if (!isRetryableError(err, config.retryableErrors)) {
      devLog.info(`Non-retryable error, sending to DLQ immediately`);
      await sendToDLQ(context, 'send-to-dlq', config, err, stepName);
      throw new Error(`Non-retryable error in step ${stepName}. Sent to DLQ.`);
    }

    // Re-throw for retry
    throw error;
  }
}

/**
 * Wrapper for context.call with DLQ handling
 */
export async function callWithDLQ(
  context: WorkflowContext<any>,
  stepName: string,
  options: any,
  config: DLQConfig,
): Promise<any> {
  return runWithDLQ(
    context,
    stepName,
    async () => {
      return context.call(stepName, options);
    },
    config,
  );
}

/**
 * Process DLQ messages (for DLQ endpoint implementation)
 */
export interface DLQProcessor {
  /** Handle a DLQ message */
  handleDLQMessage: (message: DLQMessage) => Promise<{
    action: 'retry' | 'discard' | 'escalate';
    reason?: string;
    retryDelay?: number;
  }>;

  /** Handle retry from DLQ */
  retryFromDLQ?: (message: DLQMessage) => Promise<void>;

  /** Escalate to human intervention */
  escalateToHuman?: (message: DLQMessage, reason: string) => Promise<void>;
}

/**
 * Standard DLQ message processor
 */
export async function processDLQMessage(
  message: DLQMessage,
  processor: DLQProcessor,
): Promise<void> {
  devLog.info(`Processing DLQ message for step: ${message.failedStep}`);

  try {
    const decision = await processor.handleDLQMessage(message);

    switch (decision.action) {
      case 'retry':
        if (processor.retryFromDLQ) {
          console.log(`[DLQ] Retrying message: ${decision.reason}`);
          if (decision.retryDelay) {
            await new Promise((resolve) => setTimeout(resolve, decision.retryDelay));
          }
          await processor.retryFromDLQ(message);
        } else {
          console.warn(`[DLQ] Retry requested but no retry handler available`);
        }
        break;

      case 'escalate':
        if (processor.escalateToHuman) {
          console.log(`[DLQ] Escalating to human: ${decision.reason}`);
          await processor.escalateToHuman(
            message,
            decision.reason || 'Manual intervention required',
          );
        } else {
          console.warn(`[DLQ] Escalation requested but no escalation handler available`);
        }
        break;

      case 'discard':
        console.log(`[DLQ] Discarding message: ${decision.reason}`);
        break;
    }
  } catch (error) {
    console.error(`[DLQ] Error processing DLQ message: ${error}`);

    // If processing fails, escalate by default
    if (processor.escalateToHuman) {
      await processor.escalateToHuman(
        message,
        `DLQ processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}

/**
 * Create a default DLQ processor
 */
export function createDefaultDLQProcessor(options: {
  autoRetryCategories?: string[];
  escalationEndpoint?: string;
  maxAutoRetries?: number;
}): DLQProcessor {
  const {
    autoRetryCategories = ['network', 'rate_limit'],
    escalationEndpoint,
    maxAutoRetries = 3,
  } = options;

  return {
    handleDLQMessage: async (message) => {
      // Auto-retry certain categories if under retry limit
      if (
        autoRetryCategories.includes(message.errorCategory) &&
        message.retryCount < maxAutoRetries
      ) {
        return {
          action: 'retry',
          reason: `Auto-retry for ${message.errorCategory} error`,
          retryDelay: calculateBackoff(message.retryCount, { baseDelayMs: 5000, maxDelayMs: 30000 }),
        };
      }

      // Escalate validation errors and unknown errors
      if (['authentication', 'unknown', 'validation'].includes(message.errorCategory)) {
        return {
          action: 'escalate',
          reason: `Manual review required for ${message.errorCategory} error`,
        };
      }

      // Discard non-critical errors after max retries
      return {
        action: 'discard',
        reason: `Max retries exceeded for ${message.errorCategory} error`,
      };
    },

    escalateToHuman: escalationEndpoint
      ? async (message, reason) => {
          // Send to escalation endpoint (e.g., Slack, email, ticketing system)
          try {
            const response = await fetch(escalationEndpoint, {
              body: JSON.stringify({
                type: 'dlq_escalation',
                escalatedAt: formatTimestamp(Date.now()),
                message,
                reason,
              }),
              headers: { 'Content-Type': 'application/json' },
              method: 'POST',
            });

            if (!response.ok) {
              throw new Error(`Escalation endpoint returned ${response.status}`);
            }
          } catch (error) {
            console.error(`[DLQ] Failed to escalate: ${error}`);
          }
        }
      : undefined,
  };
}

/**
 * Get DLQ statistics
 */
export function getDLQStats(): {
  totalTrackedErrors: number;
  errorsByCategory: Record<string, number>;
  errorsByStep: Record<string, number>;
} {
  const errorsByCategory: Record<string, number> = {};
  const errorsByStep: Record<string, number> = {};

  for (const [key, tracking] of globalErrorTracking.entries()) {
    const stepName = key.split(':')[1];
    errorsByStep[stepName] = (errorsByStep[stepName] || 0) + tracking.retryCount;

    // Categorize the most recent error
    if (tracking.errors.length > 0) {
      const lastError = tracking.errors[tracking.errors.length - 1];
      const category = categorizeError(new Error(lastError));
      errorsByCategory[category] = (errorsByCategory[category] || 0) + 1;
    }
  }

  return {
    errorsByCategory,
    errorsByStep,
    totalTrackedErrors: globalErrorTracking.size,
  };
}

/**
 * QStash native DLQ management functions
 */

/**
 * Retrieve messages from QStash DLQ
 */
export async function getDLQMessages(qstashClient: Client): Promise<any[]> {
  try {
    // QStash DLQ API endpoint - this might need to be updated based on actual QStash API
    const response = await qstashClient.http.request({
      method: 'GET',
      path: ['v2', 'dlq'],
    });

    return response || [];
  } catch (error) {
    console.error('[DLQ] Failed to retrieve DLQ messages:', error);
    return [];
  }
}

/**
 * Retry a message from QStash DLQ
 */
export async function retryDLQMessage(qstashClient: Client, messageId: string): Promise<boolean> {
  try {
    // Retry the message from DLQ
    await qstashClient.http.request({
      method: 'POST',
      path: ['v2', 'dlq', messageId, 'retry'],
    });

    console.log(`[DLQ] Successfully retried message ${messageId} from DLQ`);
    return true;
  } catch (error) {
    console.error(`[DLQ] Failed to retry message ${messageId}:`, error);
    return false;
  }
}

/**
 * Delete a message from QStash DLQ
 */
export async function deleteDLQMessage(qstashClient: Client, messageId: string): Promise<boolean> {
  try {
    // Delete the message from DLQ
    await qstashClient.http.request({
      method: 'DELETE',
      path: ['v2', 'dlq', messageId],
    });

    console.log(`[DLQ] Successfully deleted message ${messageId} from DLQ`);
    return true;
  } catch (error) {
    console.error(`[DLQ] Failed to delete message ${messageId}:`, error);
    return false;
  }
}

/**
 * Batch retry multiple messages from QStash DLQ
 */
export async function batchRetryDLQMessages(
  qstashClient: Client,
  messageIds: string[],
): Promise<{ successful: string[]; failed: string[] }> {
  const successful: string[] = [];
  const failed: string[] = [];

  await Promise.allSettled(
    messageIds.map(async (messageId) => {
      const success = await retryDLQMessage(qstashClient, messageId);
      if (success) {
        successful.push(messageId);
      } else {
        failed.push(messageId);
      }
    }),
  );

  return { failed, successful };
}

/**
 * Create QStash client for DLQ operations
 */
export function createQStashDLQClient(): Client | null {
  const token = process.env.QSTASH_TOKEN;

  if (!token) {
    console.warn('[DLQ] No QStash token found - DLQ operations unavailable');
    return null;
  }

  return new Client({ token });
}

/**
 * Enhanced context.call with failure callback support
 */
export async function callWithFailureCallback(
  context: WorkflowContext<any>,
  stepName: string,
  options: any,
  config: {
    failureCallback?: string;
    dlqConfig?: DLQConfig;
  },
): Promise<any> {
  const enhancedOptions = {
    ...options,
    failureCallback: config.failureCallback,
    retries: config.dlqConfig?.maxRetries || 3,
  };

  try {
    return await context.call(stepName, enhancedOptions);
  } catch (error) {
    // If we have DLQ config, handle the error
    if (config.dlqConfig) {
      await sendToDLQ(context, `dlq-${stepName}`, config.dlqConfig, error as Error, stepName);
    }
    throw error;
  }
}

/**
 * Handle failures with DLQ wrapper
 */
export async function handleFailuresWithDLQ<T>(
  context: WorkflowContext<any>,
  stepName: string,
  stepFunction: () => Promise<T>,
  config: DLQConfig,
): Promise<T> {
  return runWithDLQ(context, stepName, stepFunction, config);
}

/**
 * Wrapper for workflow serve with DLQ and comprehensive failure handling
 */
export function serveWithDLQ<T>(
  handler: (context: WorkflowContext<T>) => Promise<any>,
  config: {
    failureCallback?: string;
    dlqConfig?: DLQConfig;
    retries?: number;
    verbose?: boolean;
    enableSentryLogging?: boolean;
    enableDLQMonitoring?: boolean;
  },
) {
  return {
    config: {
      failureFunction: async ({ context, failHeaders, failResponse, failStatus }) => {
        console.error('[DLQ] Workflow failed:', {
          url: context.url,
          response: failResponse?.substring(0, 200),
          status: failStatus,
          timestamp: new Date().toISOString(),
          workflowRunId: context.workflowRunId,
        });

        // Categorize the error
        const errorCategory = categorizeDLQError(failStatus, failResponse, failHeaders);

        // Send to DLQ if configured
        if (config.dlqConfig) {
          const error = new Error(`Workflow failed with status ${failStatus}: ${failResponse}`);
          await sendToDLQ(context, 'workflow-failure', config.dlqConfig, error, 'workflow');
        }

        // Log to Sentry if enabled
        if (config.enableSentryLogging) {
          try {
            console.error('[SENTRY] Logging workflow failure:', {
              errorCategory,
              failStatus,
              workflowRunId: context.workflowRunId,
            });
          } catch (error) {
            console.error('[DLQ] Failed to log to Sentry:', error);
          }
        }

        // Monitor DLQ if enabled
        if (config.enableDLQMonitoring && config.dlqConfig?.qstashClient) {
          try {
            const dlqStats = await monitorDLQHealth(config.dlqConfig.qstashClient, {
              alertCallback: async (stats) => {
                console.warn('[DLQ] DLQ size threshold exceeded:', stats);
              },
              maxDLQSize: 100,
            });

            if (dlqStats.alertTriggered) {
              console.warn('[DLQ] DLQ monitoring alert triggered');
            }
          } catch (error) {
            console.error('[DLQ] Failed to monitor DLQ health:', error);
          }
        }
      },
      failureUrl: config.failureCallback,
      retries: config.retries || config.dlqConfig?.maxRetries || 3,
      verbose: config.verbose,
    },
    handler,
  };
}

/**
 * Categorize DLQ errors for better handling
 */
function categorizeDLQError(
  failStatus: number,
  failResponse: string,
  failHeaders: Record<string, string>,
): string {
  // Network/Infrastructure errors
  if (failStatus === 0 || failStatus >= 500) {
    if (failHeaders['ngrok-error-code']) {
      return 'ngrok_tunnel_error';
    }
    return 'server_error';
  }

  // Client errors
  if (failStatus === 404) {
    return 'endpoint_not_found';
  }

  if (failStatus === 401 || failStatus === 403) {
    return 'authentication_error';
  }

  if (failStatus === 429) {
    return 'rate_limit_exceeded';
  }

  // Timeout errors
  if (failResponse?.includes('timeout')) {
    return 'timeout_error';
  }

  return 'unknown_error';
}

/**
 * DLQ monitoring and alerting
 */
export async function monitorDLQHealth(
  qstashClient: Client,
  config: {
    maxDLQSize?: number;
    alertCallback?: (stats: any) => Promise<void>;
  } = {},
): Promise<{
  dlqSize: number;
  oldestMessage?: any;
  alertTriggered: boolean;
}> {
  try {
    const dlqMessages = await getDLQMessages(qstashClient);
    const dlqSize = dlqMessages.length;
    const maxSize = config.maxDLQSize || 100;

    const oldestMessage = dlqMessages.length > 0 ? dlqMessages[0] : undefined;
    let alertTriggered = false;

    // Trigger alert if DLQ size exceeds threshold
    if (dlqSize > maxSize && config.alertCallback) {
      await config.alertCallback({
        dlqSize,
        maxSize,
        oldestMessage,
        timestamp: new Date().toISOString(),
      });
      alertTriggered = true;
    }

    return {
      alertTriggered,
      dlqSize,
      oldestMessage,
    };
  } catch (error) {
    console.error('[DLQ] Failed to monitor DLQ health:', error);
    return {
      alertTriggered: false,
      dlqSize: -1,
    };
  }
}

/**
 * Clear DLQ error tracking (development only)
 */
export function clearDLQTracking(): void {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('DLQ tracking clearing is only available in development');
  }

  globalErrorTracking.clear();
  console.log('[DLQ] Cleared all error tracking');
}
