import {
  type DeduplicationOptions,
  isDuplicateId,
  withDeduplication,
} from '../context/deduplication';
import { type BatchConfig, batchHTTPRequests, processBatches } from '../qstash/batch-processing';
import { type DLQConfig, runWithDLQ } from '../qstash/dlq-handling';
import {
  createFlowControl,
  type FlowControlConfig,
  runWithFlowControl,
} from '../qstash/flow-control';
import { createURLGroup, fanOutToURLGroup } from '../qstash/url-groups';

import type { WorkflowContext } from '@upstash/workflow';

/**
 * Multi-Tenant SaaS Operation Configuration
 */
export interface SaaSTenantOperationConfig {
  deduplicationId?: string;
  operationData: any;
  operationType: 'user_onboarding' | 'data_sync' | 'billing_update' | 'feature_rollout';
  options?: {
    batchSize?: number;
    dlqConfig?: DLQConfig;
    customFlowControl?: FlowControlConfig;
  };
  tenantConfig: {
    rateLimit: number; // requests per second
    parallelism: number; // concurrent operations
    endpoints: string[]; // tenant-specific notification URLs
  };
  tenantId: string;
}

/**
 * SaaS Operation Result
 */
export interface SaaSTenantOperationResult {
  deduplicationStatus: 'processed' | 'skipped_duplicate' | 'no_deduplication';
  metrics: {
    duration: number;
    operationsExecuted: number;
    notificationsSent: number;
    successRate: string;
  };
  operationId: string;
  operationType: string;
  results: {
    mainOperation: any;
    notifications: any;
    syncOperations?: any;
  };
  success: boolean;
  tenantId: string;
}

/**
 * Process Multi-Tenant SaaS Operation
 */
export async function processSaaSTenantOperation(
  context: WorkflowContext<any>,
  config: SaaSTenantOperationConfig,
): Promise<SaaSTenantOperationResult> {
  const startTime = Date.now();
  const {
    deduplicationId,
    operationData,
    operationType,
    options = {},
    tenantConfig,
    tenantId,
  } = config;
  const operationId = `${tenantId}-${operationType}-${Date.now()}`;

  console.log(`[SAAS-OPERATION] Starting ${operationType} for tenant ${tenantId}`);

  // Handle deduplication if ID provided
  const deduplicationOptions: DeduplicationOptions = {
    debug: process.env.NODE_ENV === 'development',
    ttl: 30 * 60 * 1000, // 30 minutes
  };

  if (deduplicationId && isDuplicateId(deduplicationId, deduplicationOptions)) {
    console.log(`[SAAS-OPERATION] Skipping duplicate operation: ${deduplicationId}`);
    return {
      deduplicationStatus: 'skipped_duplicate',
      metrics: { duration: 0, notificationsSent: 0, operationsExecuted: 0, successRate: '100%' },
      operationId,
      operationType,
      results: { mainOperation: null, notifications: null },
      success: true,
      tenantId,
    };
  }

  return withDeduplication(
    context,
    async () => {
      // Create tenant-specific flow control
      const flowControl =
        options.customFlowControl ||
        createFlowControl({
          key: `tenant-${tenantId}`,
          parallelism: tenantConfig.parallelism,
          ratePerSecond: tenantConfig.rateLimit,
        });

      // Create DLQ configuration
      const dlqConfig = options.dlqConfig || {
        dlqEndpoint: process.env.SAAS_DLQ_ENDPOINT || 'https://example.com/saas-dlq',
        includeOriginalPayload: true,
        maxRetries: 3,
        retryableErrors: ['network', 'rate_limit', 'server_error'],
      };

      let mainOperationResult;
      let syncOperationsResult;
      let notificationResult;

      // Step 1: Execute main operation based on type
      mainOperationResult = await runWithFlowControl(
        context,
        `main-operation-${operationType}`,
        async () => {
          return runWithDLQ(
            context,
            `${operationType}-${tenantId}`,
            async () => {
              switch (operationType) {
                case 'user_onboarding':
                  return processUserOnboarding(context, tenantId, operationData, flowControl);

                case 'data_sync':
                  return processDataSync(context, tenantId, operationData, flowControl);

                case 'billing_update':
                  return processBillingUpdate(context, tenantId, operationData, flowControl);

                case 'feature_rollout':
                  return processFeatureRollout(context, tenantId, operationData, flowControl);

                default:
                  throw new Error(`Unknown operation type: ${operationType}`);
              }
            },
            dlqConfig,
          );
        },
        flowControl,
      );

      // Step 2: Execute sync operations if needed
      if (operationType === 'data_sync' || operationType === 'feature_rollout') {
        syncOperationsResult = await runWithFlowControl(
          context,
          'sync-operations',
          async () => {
            return processTenantSyncOperations(
              context,
              tenantId,
              operationType,
              mainOperationResult,
              flowControl,
            );
          },
          flowControl,
        );
      }

      // Step 3: Send tenant-specific notifications
      notificationResult = await context.run('send-tenant-notifications', async () => {
        if (tenantConfig.endpoints.length === 0) {
          return { notificationsSent: 0, results: [] };
        }

        const notificationPayload = {
          operationId,
          operationType,
          result: mainOperationResult,
          status: 'completed',
          syncResult: syncOperationsResult,
          tenantId,
          timestamp: new Date().toISOString(),
        };

        const tenantURLGroup = createURLGroup({
          endpoints: tenantConfig.endpoints,
          groupName: `tenant-${tenantId}-notifications`,
          headers: {
            'X-Operation-ID': operationId,
            'X-Operation-Type': operationType,
            'X-Tenant-ID': tenantId,
          },
        });

        const fanOutResult = await fanOutToURLGroup(context, `notify-tenant-${tenantId}`, {
          urlGroup: tenantURLGroup,
          payload: notificationPayload,
          waitForAll: false,
        });

        return {
          notificationsSent: fanOutResult.successfulEndpoints,
          results: fanOutResult,
        };
      });

      const duration = Date.now() - startTime;
      const operationsExecuted = 1 + (syncOperationsResult ? 1 : 0);
      const successRate = '100%'; // If we get here, operations succeeded

      return {
        deduplicationStatus: deduplicationId ? 'processed' : 'no_deduplication',
        metrics: {
          duration,
          notificationsSent: notificationResult.notificationsSent,
          operationsExecuted,
          successRate,
        },
        operationId,
        operationType,
        results: {
          mainOperation: mainOperationResult,
          notifications: notificationResult,
          syncOperations: syncOperationsResult,
        },
        success: true,
        tenantId,
      };
    },
    deduplicationOptions,
  );
}

/**
 * Process User Onboarding
 */
async function processUserOnboarding(
  context: WorkflowContext<any>,
  tenantId: string,
  userData: any,
  flowControl: FlowControlConfig,
): Promise<any> {
  return context.run('user-onboarding', async () => {
    const { email, metadata, plan, userId } = userData;

    // Step 1: Create user account
    const userAccount = await context.call('create-user-account', {
      url: `${process.env.SAAS_API_BASE}/tenants/${tenantId}/users`,
      body: { email, metadata, plan, userId },
      headers: {
        Authorization: `Bearer ${process.env.SAAS_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      retries: 3,
    });

    // Step 2: Setup user permissions
    const permissions = await context.call('setup-permissions', {
      url: `${process.env.SAAS_API_BASE}/tenants/${tenantId}/users/${userId}/permissions`,
      body: { customPermissions: metadata.permissions || [], plan },
      headers: {
        Authorization: `Bearer ${process.env.SAAS_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      retries: 3,
    });

    // Step 3: Send welcome email
    const welcomeEmail = await context.call('send-welcome-email', {
      url: `${process.env.EMAIL_SERVICE_URL}/send`,
      body: {
        data: { plan, tenantId, userId },
        template: 'welcome',
        to: email,
      },
      headers: {
        Authorization: `Bearer ${process.env.EMAIL_SERVICE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      retries: 2,
    });

    return {
      onboardingCompleted: true,
      permissions: permissions.body,
      userAccount: userAccount.body,
      welcomeEmail: welcomeEmail.body,
    };
  });
}

/**
 * Process Data Sync
 */
async function processDataSync(
  context: WorkflowContext<any>,
  tenantId: string,
  syncData: any,
  flowControl: FlowControlConfig,
): Promise<any> {
  return context.run('data-sync', async () => {
    const { options = {}, sourceData, syncType } = syncData;

    // Batch process data items
    const batchConfig: BatchConfig = {
      batchSize: options.batchSize || 10,
      continueOnError: true,
      delayBetweenBatches: 1000,
      maxConcurrentBatches: 3,
    };

    const syncResults = await processBatches(
      context,
      'sync-data-batches',
      sourceData,
      async (item, index) => {
        const response = await context.call(`sync-item-${index}`, {
          url: `${process.env.SAAS_API_BASE}/tenants/${tenantId}/sync`,
          body: { item, options, syncType },
          headers: {
            Authorization: `Bearer ${process.env.SAAS_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          method: 'POST',
          retries: 2,
        });

        return {
          itemId: item.id || index,
          result: response.body,
          synced: true,
        };
      },
      batchConfig,
    );

    return {
      batches: syncResults.batches,
      failedItems: syncResults.totalFailedItems,
      processedItems: syncResults.totalProcessedItems,
      successfulItems: syncResults.totalSuccessfulItems,
      syncType,
      totalItems: sourceData.length,
    };
  });
}

/**
 * Process Billing Update
 */
async function processBillingUpdate(
  context: WorkflowContext<any>,
  tenantId: string,
  billingData: any,
  flowControl: FlowControlConfig,
): Promise<any> {
  return context.run('billing-update', async () => {
    const { customerId, metadata, plan, proration } = billingData;

    // Step 1: Update subscription
    const subscription = await context.call('update-subscription', {
      url: `${process.env.BILLING_API_BASE}/customers/${customerId}/subscription`,
      body: { metadata, plan, proration },
      headers: {
        Authorization: `Bearer ${process.env.BILLING_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
      retries: 3,
    });

    // Step 2: Update tenant limits
    const limits = await context.call('update-tenant-limits', {
      url: `${process.env.SAAS_API_BASE}/tenants/${tenantId}/limits`,
      body: { customLimits: metadata.limits, plan },
      headers: {
        Authorization: `Bearer ${process.env.SAAS_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      method: 'PUT',
      retries: 3,
    });

    return {
      billingUpdated: true,
      limits: limits.body,
      subscription: subscription.body,
    };
  });
}

/**
 * Process Feature Rollout
 */
async function processFeatureRollout(
  context: WorkflowContext<any>,
  tenantId: string,
  rolloutData: any,
  flowControl: FlowControlConfig,
): Promise<any> {
  return context.run('feature-rollout', async () => {
    const { configuration, enabled, featureName, rolloutPercentage } = rolloutData;

    // Step 1: Update feature flags
    const featureFlags = await context.call('update-feature-flags', {
      url: `${process.env.FEATURE_FLAGS_API}/tenants/${tenantId}/features`,
      body: { configuration, enabled, featureName, rolloutPercentage },
      headers: {
        Authorization: `Bearer ${process.env.FEATURE_FLAGS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      retries: 3,
    });

    // Step 2: Update tenant configuration
    const tenantConfig = await context.call('update-tenant-config', {
      url: `${process.env.SAAS_API_BASE}/tenants/${tenantId}/config`,
      body: { features: { [featureName]: { configuration, enabled } } },
      headers: {
        Authorization: `Bearer ${process.env.SAAS_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
      retries: 3,
    });

    return {
      enabled,
      featureFlags: featureFlags.body,
      featureName,
      rolloutCompleted: true,
      tenantConfig: tenantConfig.body,
    };
  });
}

/**
 * Process tenant sync operations
 */
async function processTenantSyncOperations(
  context: WorkflowContext<any>,
  tenantId: string,
  operationType: string,
  mainResult: any,
  flowControl: FlowControlConfig,
): Promise<any> {
  return context.run('tenant-sync-operations', async () => {
    // Sync operations based on main operation type
    const syncOperations: { url: string; method: string; body: any }[] = [];

    if (operationType === 'data_sync') {
      // Sync to analytics service
      syncOperations.push({
        url: `${process.env.ANALYTICS_API}/tenants/${tenantId}/sync`,
        body: { type: 'data_sync', result: mainResult },
        method: 'POST',
      });

      // Sync to search index
      syncOperations.push({
        url: `${process.env.SEARCH_API}/tenants/${tenantId}/reindex`,
        body: { items: mainResult.processedItems },
        method: 'POST',
      });
    }

    if (operationType === 'feature_rollout') {
      // Sync to CDN
      syncOperations.push({
        url: `${process.env.CDN_API}/tenants/${tenantId}/invalidate`,
        body: { feature: mainResult.featureName },
        method: 'POST',
      });
    }

    if (syncOperations.length === 0) {
      return { results: [], syncOperations: 0 };
    }

    // Execute sync operations
    const requests = syncOperations.map((op, index) => ({
      id: `sync-${index}`,
      ...op,
      headers: {
        Authorization: `Bearer ${process.env.SAAS_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }));

    const syncResults = await batchHTTPRequests(context, 'execute-sync-operations', requests, {
      batchSize: 3,
      continueOnError: true,
      delayBetweenBatches: 500,
      maxConcurrentBatches: 2,
    });

    return {
      results: syncResults,
      syncOperations: syncOperations.length,
    };
  });
}

/**
 * Batch process multiple tenant operations
 */
export async function batchProcessTenantOperations(
  context: WorkflowContext<any>,
  stepName: string,
  operations: SaaSTenantOperationConfig[],
): Promise<{
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  results: (SaaSTenantOperationResult | { error: string })[];
}> {
  return context.run(stepName, async () => {
    const results: (SaaSTenantOperationResult | { error: string })[] = [];
    let successfulOperations = 0;
    let failedOperations = 0;

    // Process operations in parallel with tenant-specific flow control
    const operationPromises = operations.map(async (operation) => {
      try {
        const result = await processSaaSTenantOperation(context, operation);
        results.push(result);
        successfulOperations++;
        return result;
      } catch (error) {
        const errorResult = { error: error instanceof Error ? error.message : 'Unknown error' };
        results.push(errorResult);
        failedOperations++;
        return errorResult;
      }
    });

    await Promise.allSettled(operationPromises);

    return {
      failedOperations,
      results,
      successfulOperations,
      totalOperations: operations.length,
    };
  });
}
