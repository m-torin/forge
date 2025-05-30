import {
  type AnthropicConfig,
  type BatchContentAnalysisRequest,
  type ContentModerationRequest,
  type ContentModerationResult,
  createAnthropicClient,
} from '@repo/ai/providers/anthropic';

import type { WorkflowContext } from '@upstash/workflow';

/**
 * Workflow wrapper for Anthropic content moderation
 */
export async function moderateContent(
  context: WorkflowContext<any>,
  stepName: string,
  config: AnthropicConfig,
  request: ContentModerationRequest,
): Promise<ContentModerationResult> {
  return context.run(stepName, async () => {
    const client = createAnthropicClient(config);
    if (!client) {
      throw new Error('Failed to create Anthropic client');
    }
    return client.moderateContent(request);
  });
}

/**
 * Workflow wrapper for Anthropic batch content analysis
 */
export async function batchAnalyzeContent(
  context: WorkflowContext<any>,
  stepName: string,
  config: AnthropicConfig,
  request: BatchContentAnalysisRequest,
): Promise<{ id: string; result: any; error?: string }[]> {
  return context.run(stepName, async () => {
    const client = createAnthropicClient(config);
    if (!client) {
      throw new Error('Failed to create Anthropic client');
    }
    return client.batchAnalyzeContent(request);
  });
}
