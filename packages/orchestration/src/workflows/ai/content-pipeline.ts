import {
  type BatchContentAnalysisRequest,
  type ContentModerationRequest,
  createAnthropicConfigFromEnv,
} from '@repo/ai/providers/anthropic';
import { moderateContent, batchAnalyzeContent } from '../../utils/ai-integration';
import { createOptimalBatchConfig, processBatches } from '../../runtime/features/batch-processing';
import { type DLQConfig, runWithDLQ } from '../../runtime/features/dlq-handling';
import {
  createFlowControl,
  type FlowControlConfig,
  runWithFlowControl,
} from '../../runtime/features/flow-control';
import { createSigningConfigFromEnv, withSignatureVerification } from '../../runtime/features/request-signing';
import { createURLGroup, fanOutToURLGroup } from '../../runtime/features/url-groups';

// Import utilities to eliminate DRY violations
import { formatTimestamp, isDevelopment, calculateElapsedTime, formatPercentage } from '../../utils/helpers';
import { devLog } from '../../utils/observability';
import { withWorkflowErrorHandling, createWorkflowError } from '../../utils/error-handling';
import { createResponse } from '../../utils/response';

import type { WorkflowContext } from '@upstash/workflow';

/**
 * AI Content Moderation Pipeline Configuration
 */
export interface AIContentPipelineConfig {
  content: {
    id: string;
    type: 'text' | 'image' | 'video';
    data: string;
    metadata: { userId: string; platform: string; timestamp: string };
  }[];
  jobId: string;
  moderationRules: {
    checkToxicity: boolean;
    checkSpam: boolean;
    checkAdultContent: boolean;
    customPrompt?: string;
  };
  notificationEndpoints: string[];
  options?: {
    batchSize?: number;
    flowControl?: FlowControlConfig;
    dlqConfig?: DLQConfig;
    verifySignatures?: boolean;
  };
}

/**
 * AI Content Pipeline Result
 */
export interface AIContentPipelineResult {
  flaggedContent: number;
  jobId: string;
  processedContent: number;
  results: {
    contentId: string;
    moderation: {
      safe: boolean;
      violations: string[];
      confidence: number;
      categories: any;
    };
    notificationsSent: boolean;
    processingTime: number;
  }[];
  safeContent: number;
  summary: {
    processingDuration: number;
    successRate: string;
    flaggedRate: string;
  };
  totalContent: number;
}

/**
 * Process AI Content Moderation Pipeline
 */
export async function processAIContentPipeline(
  context: WorkflowContext<any>,
  config: AIContentPipelineConfig,
): Promise<AIContentPipelineResult> {
  return withWorkflowErrorHandling(async () => {
    const startTime = Date.now();
    const { content, jobId, moderationRules, notificationEndpoints, options = {} } = config;

    devLog.workflow(
      context,
      `Starting content moderation job ${jobId} with ${content.length} items`,
    );

    // Verify request signature if enabled
    if (options.verifySignatures) {
      const signingConfig = createSigningConfigFromEnv();
      if (signingConfig) {
        await withSignatureVerification(context, signingConfig, async () => {
          devLog.workflow(context, 'Request signature verified');
        });
      }
    }

    // Get Anthropic configuration
    const anthropicConfig = createAnthropicConfigFromEnv();
    if (!anthropicConfig) {
      throw createWorkflowError.configuration('Anthropic API configuration not found');
    }

    // Create flow control for AI API calls
    const flowControl =
      options.flowControl ||
      createFlowControl({
        key: `ai-moderation-${jobId}`,
        parallelism: 5, // Concurrent requests
        ratePerSecond: 10, // Anthropic rate limit
      });

    // Create DLQ configuration with environment fallback
    const dlqConfig = options.dlqConfig || {
      dlqEndpoint: process.env.AI_DLQ_ENDPOINT || 'https://example.com/dlq',
      includeOriginalPayload: true,
      maxRetries: 3,
      retryableErrors: ['network', 'rate_limit', 'server_error'],
    };

    // Step 1: Batch content moderation with AI
    const moderationResults = await runWithFlowControl(
      context,
      'batch-content-moderation',
      async () => {
        const batchConfig = createOptimalBatchConfig(content.length, 3000); // 3s per AI call

        return processBatches(
          context,
          'moderate-content-batches',
          content,
          async (item) => {
            return runWithDLQ(
              context,
              'moderate-content',
              async () => {
                const moderationRequest: ContentModerationRequest = {
                  content: item.data,
                  contentType: item.type === 'text' ? 'text' : 'image_url',
                  moderationRules,
                };

                const moderation = await moderateContent(
                  context,
                  'ai-moderate-content',
                  anthropicConfig,
                  moderationRequest,
                );

                return {
                  contentId: item.id,
                  metadata: item.metadata,
                  moderation,
                  processingTime: calculateElapsedTime(startTime),
                };
              },
              dlqConfig,
            );
          },
          batchConfig,
        );
      },
      flowControl,
    );

    // Step 2: Process moderation results
    const processedResults = await context.run('process-moderation-results', async () => {
      const allResults = moderationResults.batches.flatMap((batch) => batch.results);
      let flaggedContent = 0;
      let safeContent = 0;

      const processedItems = allResults.map((result) => {
        if (!result.moderation.safe) {
          flaggedContent++;
        } else {
          safeContent++;
        }

        return {
          contentId: result.contentId,
          moderation: result.moderation,
          notificationsSent: false, // Will be updated in next step
          processingTime: result.processingTime,
        };
      });

      return { flaggedContent, processedItems, safeContent };
    });

    // Step 3: Fan-out notifications for flagged content
    const notificationResults = await context.run('send-notifications', async () => {
      const flaggedItems = processedResults.processedItems.filter((item) => !item.moderation.safe);

      if (flaggedItems.length === 0 || notificationEndpoints.length === 0) {
        return { notificationsSent: false, results: [] };
      }

      // Create URL group for notifications
      const notificationGroup = createURLGroup({
        endpoints: notificationEndpoints,
        groupName: `moderation-notifications-${jobId}`,
        headers: {
          'X-Job-ID': jobId,
          'X-Notification-Type': 'content-moderation',
        },
      });

      // Send notifications for each flagged item
      const notificationPromises = flaggedItems.map(async (item) => {
        const notificationPayload = {
          action: 'content_flagged',
          contentId: item.contentId,
          jobId,
          moderationResult: item.moderation,
          timestamp: formatTimestamp(Date.now()),
        };

        return fanOutToURLGroup(context, 'notify-flagged-content', {
          urlGroup: notificationGroup,
          payload: notificationPayload,
          waitForAll: false, // Fire and forget
        });
      });

      const results = await Promise.allSettled(notificationPromises);

      // Update notification status
      flaggedItems.forEach((item, index) => {
        const result = results[index];
        item.notificationsSent = result.status === 'fulfilled';
      });

      return { notificationsSent: true, results };
    });

    // Step 4: Generate comprehensive summary
    const summary = await context.run('generate-pipeline-summary', async () => {
      const processingDuration = calculateElapsedTime(startTime);
      const totalContent = content.length;
      const processedContent = processedResults.processedItems.length;
      const successRate = formatPercentage((processedContent / totalContent) * 100);
      const flaggedRate = formatPercentage((processedResults.flaggedContent / processedContent) * 100);

      devLog.workflow(
        context,
        `Completed job ${jobId}: ${processedContent}/${totalContent} processed, ${processedResults.flaggedContent} flagged`,
      );

      return {
        flaggedRate,
        processingDuration,
        successRate,
      };
    });

    return {
      flaggedContent: processedResults.flaggedContent,
      jobId,
      processedContent: processedResults.processedItems.length,
      results: processedResults.processedItems,
      safeContent: processedResults.safeContent,
      summary,
      totalContent: content.length,
    };
  }, 'AI Content Pipeline', { jobId: config.jobId });
}

/**
 * Advanced AI Content Analysis Pipeline
 */
export async function processAdvancedContentAnalysis(
  context: WorkflowContext<any>,
  config: {
    jobId: string;
    content: {
      id: string;
      content: string;
      type: 'text' | 'image_url';
      metadata?: any;
    }[];
    analysisTypes: ('moderation' | 'sentiment' | 'classification' | 'extraction')[];
    customPrompts?: Record<string, string>;
    flowControl?: FlowControlConfig;
  },
): Promise<{
  jobId: string;
  results: Record<string, any>;
  summary: any;
}> {
  return withWorkflowErrorHandling(async () => {
    const { analysisTypes, content, customPrompts = {}, flowControl, jobId } = config;

    devLog.workflow(
      context,
      `Starting advanced analysis job ${jobId} with ${analysisTypes.length} analysis types`,
    );

    const anthropicConfig = createAnthropicConfigFromEnv();
    if (!anthropicConfig) {
      throw createWorkflowError.configuration('Anthropic API configuration not found');
    }

    const analysisResults: Record<string, any> = {};

    // Process each analysis type
    for (const analysisType of analysisTypes) {
      const stepName = `analyze-${analysisType}`;

      analysisResults[analysisType] = await runWithFlowControl(
        context,
        stepName,
        async () => {
          const batchRequest: BatchContentAnalysisRequest = {
            analysisType,
            contents: content,
            customPrompt: customPrompts[analysisType],
          };

          return batchAnalyzeContent(context, `batch-${analysisType}`, anthropicConfig, batchRequest);
        },
        flowControl ||
          createFlowControl({
            key: `ai-analysis-${jobId}-${analysisType}`,
            parallelism: 4,
            ratePerSecond: 8,
          }),
      );
    }

    // Generate summary
    const summary = await context.run('generate-analysis-summary', async () => {
      const totalItems = content.length;
      const analysisCount = analysisTypes.length;

      return {
        analysisTypes: analysisCount,
        completedAnalyses: Object.keys(analysisResults).length,
        successRate: formatPercentage((Object.keys(analysisResults).length / analysisCount) * 100),
        totalItems,
      };
    });

    return {
      jobId,
      results: analysisResults,
      summary,
    };
  }, 'Advanced Content Analysis', { jobId: config.jobId });
}