'use server';

import { revalidatePath } from 'next/cache';
import { Client } from '@upstash/workflow';
import { env } from '../../../env';
import { JrImagesWorkflowInput, JrImagesTriggerWorkflowInput } from '@/workflows/jr-images/types';
import { JR_IMAGES_CONFIG } from '@/workflows/jr-images/config';

/**
 * Upstash Workflow client instance for JR-Images
 */
function getJrImagesWorkflowClient(): Client {
  if (!env.QSTASH_TOKEN) {
    throw new Error(
      'QSTASH_TOKEN is required for JR-Images workflow operations. ' +
        'Please set this environment variable with your QStash token from https://console.upstash.com/qstash',
    );
  }

  return new Client({
    token: env.QSTASH_TOKEN,
    baseUrl: env.QSTASH_URL,
  });
}

/**
 * Get the base URL for JR-Images workflow endpoints
 */
function getJrImagesWorkflowBaseUrl(): string {
  return env.NEXT_PUBLIC_APP_URL || 'http://localhost:3303';
}

/**
 * Server action to trigger JR-Images workflow
 */
export async function triggerJrImagesWorkflowAction(
  input: JrImagesWorkflowInput,
  options: JrImagesTriggerWorkflowInput = { retries: 3 },
): Promise<{ success: boolean; workflowRunId?: string; error?: string }> {
  try {
    const baseUrl = getJrImagesWorkflowBaseUrl();

    // Trigger the workflow
    const workflowClient = getJrImagesWorkflowClient();
    const result = await workflowClient.trigger({
      url: `${baseUrl}/api/workflow/jr-images`,
      body: {
        trigger: 'manual' as const,
        batchSize: input.batchSize || JR_IMAGES_CONFIG.defaultBatchSize,
        compressionQuality: input.compressionQuality || JR_IMAGES_CONFIG.compression.quality,
        maxWidth: input.maxWidth || JR_IMAGES_CONFIG.compression.maxWidth,
        maxHeight: input.maxHeight || JR_IMAGES_CONFIG.compression.maxHeight,
        progressWebhook: input.progressWebhook,
      },
      workflowRunId: options.workflowRunId,
      retries: options.retries,
      delay: options.delay as any,
    });

    // Revalidate the workflows page to show the new workflow
    revalidatePath('/');

    return {
      success: true,
      workflowRunId: result.workflowRunId,
    };
  } catch (error: any) {
    console.error('Failed to trigger JR-Images workflow:', error);

    return {
      success: false,
      error: error.message || 'Failed to trigger JR-Images workflow',
    };
  }
}

/**
 * Server action to get JR-Images workflow status
 */
export async function getJrImagesWorkflowStatusAction(
  workflowRunId: string,
): Promise<{ success: boolean; execution?: any; error?: string }> {
  try {
    if (!workflowRunId) {
      throw new Error('Workflow run ID is required');
    }

    const workflowClient = getJrImagesWorkflowClient();
    const { runs } = await workflowClient.logs({
      workflowRunId,
      count: 1,
    });

    if (runs.length === 0) {
      return {
        success: false,
        error: 'JR-Images workflow not found',
      };
    }

    const run = runs[0];

    const execution = {
      workflowRunId: run.workflowRunId,
      status: mapJrImagesWorkflowState(run.workflowState),
      startedAt: new Date(run.workflowRunCreatedAt * 1000),
      completedAt: run.workflowRunCompletedAt
        ? new Date(run.workflowRunCompletedAt * 1000)
        : undefined,
      error: run.dlqId ? 'JR-Images workflow failed and moved to DLQ' : undefined,
      steps: mapJrImagesSteps(run.steps),
    };

    return {
      success: true,
      execution,
    };
  } catch (error: any) {
    console.error('Failed to get JR-Images workflow status:', error);

    return {
      success: false,
      error: error.message || 'Failed to get JR-Images workflow status',
    };
  }
}

/**
 * Server action to list JR-Images workflows
 */
export async function listJrImagesWorkflowsAction(
  options: {
    count?: number;
    cursor?: string;
    state?: string;
  } = {},
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const baseUrl = getJrImagesWorkflowBaseUrl();

    const workflowClient = getJrImagesWorkflowClient();
    const { runs, cursor } = await workflowClient.logs({
      count: options.count || 10,
      cursor: options.cursor,
      state: options.state as any,
      workflowUrl: `${baseUrl}/api/workflow/jr-images`,
    });

    const workflows = runs.map((run) => ({
      workflowRunId: run.workflowRunId,
      status: mapJrImagesWorkflowState(run.workflowState),
      startedAt: new Date(run.workflowRunCreatedAt * 1000),
      completedAt: run.workflowRunCompletedAt
        ? new Date(run.workflowRunCompletedAt * 1000)
        : undefined,
      error: run.dlqId ? 'JR-Images workflow failed and moved to DLQ' : undefined,
      steps: mapJrImagesSteps(run.steps),
    }));

    const result = {
      workflows,
      total: workflows.length,
      hasMore: !!cursor,
    };

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error('Failed to list JR-Images workflows:', error);

    return {
      success: false,
      error: error.message || 'Failed to list JR-Images workflows',
    };
  }
}

/**
 * Server action to cancel a JR-Images workflow
 */
export async function cancelJrImagesWorkflowAction(
  workflowRunId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!workflowRunId) {
      throw new Error('Workflow run ID is required');
    }

    const workflowClient = getJrImagesWorkflowClient();
    await workflowClient.cancel({
      ids: [workflowRunId],
    });

    // Revalidate the workflows page to show the updated status
    revalidatePath('/');

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Failed to cancel JR-Images workflow:', error);

    return {
      success: false,
      error: error.message || 'Failed to cancel JR-Images workflow',
    };
  }
}

/**
 * Helper functions for mapping Upstash data to our types
 */

/**
 * Map Upstash workflow state to our JrImagesWorkflowStatus type
 */
function mapJrImagesWorkflowState(
  state: string,
): 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' {
  switch (state) {
    case 'RUN_STARTED':
      return 'running';
    case 'RUN_SUCCESS':
      return 'completed';
    case 'RUN_FAILED':
      return 'failed';
    case 'RUN_CANCELED':
      return 'cancelled';
    default:
      return 'pending';
  }
}

/**
 * Map steps from Upstash format to our format
 */
function mapJrImagesSteps(steps?: any[]): any[] {
  if (!steps || !Array.isArray(steps)) {
    return [];
  }

  const allSteps: any[] = [];

  steps.forEach((stepItem, index) => {
    // Handle different QStash step formats for JR-Images
    if (stepItem.type === 'sequential' && stepItem.steps) {
      stepItem.steps.forEach((step: any, stepIndex: number) => {
        allSteps.push(mapSingleJrImagesStep(step, `${index}-${stepIndex}`));
      });
    } else if (stepItem.type === 'single' && stepItem.steps) {
      stepItem.steps.forEach((step: any, stepIndex: number) => {
        allSteps.push(mapSingleJrImagesStep(step, `${index}-${stepIndex}`));
      });
    } else if (stepItem.stepId || stepItem.stepName || stepItem.stepType) {
      allSteps.push(mapSingleJrImagesStep(stepItem, index.toString()));
    } else {
      allSteps.push(mapSingleJrImagesStep(stepItem, index.toString()));
    }
  });

  if (allSteps.length === 0 && steps.length > 0) {
    steps.forEach((step, index) => {
      allSteps.push(mapSingleJrImagesStep(step, index.toString()));
    });
  }

  return allSteps;
}

/**
 * Map a single step to our format
 */
function mapSingleJrImagesStep(step: any, fallbackId: string): any {
  const stepId = step.stepId || step.stepName || fallbackId;
  const stepName = step.stepName || step.stepType || step.type || 'JR-Images Step';

  let status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' = 'pending';
  if (step.out !== undefined || step.stepResponse !== undefined) {
    status = 'completed';
  } else if (step.stepStatus) {
    status = mapJrImagesStepStatus(step.stepStatus);
  } else if (step.stepError) {
    status = 'failed';
  }

  let output = step.out || step.stepResponse;
  if (typeof output === 'string') {
    try {
      output = JSON.parse(output);
    } catch {
      // Keep as string if parsing fails
    }
  }

  return {
    id: stepId.toString(),
    name: stepName,
    status,
    startedAt: step.stepCreatedAt ? new Date(step.stepCreatedAt * 1000) : undefined,
    completedAt: step.stepCompletedAt ? new Date(step.stepCompletedAt * 1000) : undefined,
    duration:
      step.stepCompletedAt && step.stepCreatedAt
        ? step.stepCompletedAt - step.stepCreatedAt
        : undefined,
    error: step.stepError,
    output,
    documentId: output?.documentId,
    imagesProcessed: output?.imagesProcessed,
    isPriority: output?.isPriority,
  };
}

/**
 * Map step status to our WorkflowStatus type
 */
function mapJrImagesStepStatus(
  status?: string,
): 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' {
  if (!status) return 'pending';

  switch (status.toUpperCase()) {
    case 'RUNNING':
      return 'running';
    case 'SUCCESS':
    case 'COMPLETED':
      return 'completed';
    case 'FAILED':
    case 'ERROR':
      return 'failed';
    case 'CANCELED':
    case 'CANCELLED':
      return 'cancelled';
    default:
      return 'pending';
  }
}
