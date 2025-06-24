'use server';

import { revalidatePath } from 'next/cache';
import { Client } from '@upstash/workflow';
import { env } from '../../../env';
import { CustomerOnboardingInputSchema, TriggerWorkflowSchema } from './types';
import type { CustomerOnboardingInput, TriggerWorkflowInput } from './types';
import type { WorkflowExecution, WorkflowListResponse } from './client';

/**
 * Upstash Workflow client instance (created lazily to handle missing tokens during builds)
 */
function getWorkflowClient(): Client {
  if (!env.QSTASH_TOKEN) {
    throw new Error(
      'QSTASH_TOKEN is required for workflow operations. ' +
        'Please set this environment variable with your QStash token from https://console.upstash.com/qstash',
    );
  }

  return new Client({
    token: env.QSTASH_TOKEN,
    baseUrl: env.QSTASH_URL,
  });
}

/**
 * Get the base URL for workflow endpoints
 */
function getWorkflowBaseUrl(): string {
  return env.NEXT_PUBLIC_APP_URL || 'http://localhost:3303';
}

/**
 * Server action to trigger customer onboarding workflow
 */
export async function triggerCustomerOnboardingAction(
  input: CustomerOnboardingInput,
  options: TriggerWorkflowInput = { retries: 3 },
): Promise<{ success: boolean; workflowRunId?: string; error?: string }> {
  try {
    // Validate input
    const validatedInput = CustomerOnboardingInputSchema.parse(input);
    const validatedOptions = TriggerWorkflowSchema.parse(options);

    const baseUrl = getWorkflowBaseUrl();

    // Trigger the workflow
    const workflowClient = getWorkflowClient();
    const result = await workflowClient.trigger({
      url: `${baseUrl}/api/workflow/customer-onboarding`,
      body: validatedInput,
      workflowRunId: validatedOptions.workflowRunId,
      retries: validatedOptions.retries,
      delay: validatedOptions.delay as any, // Allow string delays
    });

    // Revalidate the workflows page to show the new workflow
    revalidatePath('/');

    return {
      success: true,
      workflowRunId: result.workflowRunId,
    };
  } catch (error: any) {
    console.error('Failed to trigger customer onboarding workflow:', error);

    return {
      success: false,
      error: error.message || 'Failed to trigger workflow',
    };
  }
}

/**
 * Server action to get workflow status
 */
export async function getWorkflowStatusAction(
  workflowRunId: string,
): Promise<{ success: boolean; execution?: WorkflowExecution; error?: string }> {
  try {
    if (!workflowRunId) {
      throw new Error('Workflow run ID is required');
    }

    const workflowClient = getWorkflowClient();
    const { runs } = await workflowClient.logs({
      workflowRunId,
      count: 1,
    });

    // Debug logging to understand QStash data structure
    console.log('QStash run data:', JSON.stringify(runs[0], null, 2));

    if (runs.length === 0) {
      return {
        success: false,
        error: 'Workflow not found',
      };
    }

    const run = runs[0];

    const execution: WorkflowExecution = {
      workflowRunId: run.workflowRunId,
      status: mapWorkflowState(run.workflowState),
      startedAt: new Date(run.workflowRunCreatedAt * 1000),
      completedAt: run.workflowRunCompletedAt
        ? new Date(run.workflowRunCompletedAt * 1000)
        : undefined,
      error: run.dlqId ? 'Workflow failed and moved to DLQ' : undefined,
      steps: mapSteps(run.steps),
    };

    return {
      success: true,
      execution,
    };
  } catch (error: any) {
    console.error('Failed to get workflow status:', error);

    return {
      success: false,
      error: error.message || 'Failed to get workflow status',
    };
  }
}

/**
 * Server action to list workflows
 */
export async function listWorkflowsAction(
  options: {
    count?: number;
    cursor?: string;
    state?: string;
  } = {},
): Promise<{ success: boolean; data?: WorkflowListResponse; error?: string }> {
  try {
    const baseUrl = getWorkflowBaseUrl();

    const workflowClient = getWorkflowClient();
    const { runs, cursor } = await workflowClient.logs({
      count: options.count || 10,
      cursor: options.cursor,
      state: options.state as any,
      workflowUrl: `${baseUrl}/api/workflow/customer-onboarding`,
    });

    const workflows: WorkflowExecution[] = runs.map((run) => ({
      workflowRunId: run.workflowRunId,
      status: mapWorkflowState(run.workflowState),
      startedAt: new Date(run.workflowRunCreatedAt * 1000),
      completedAt: run.workflowRunCompletedAt
        ? new Date(run.workflowRunCompletedAt * 1000)
        : undefined,
      error: run.dlqId ? 'Workflow failed and moved to DLQ' : undefined,
      steps: mapSteps(run.steps),
    }));

    const result: WorkflowListResponse = {
      workflows,
      total: workflows.length,
      hasMore: !!cursor,
    };

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error('Failed to list workflows:', error);

    return {
      success: false,
      error: error.message || 'Failed to list workflows',
    };
  }
}

/**
 * Server action to cancel a workflow
 */
export async function cancelWorkflowAction(
  workflowRunId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!workflowRunId) {
      throw new Error('Workflow run ID is required');
    }

    const workflowClient = getWorkflowClient();
    await workflowClient.cancel({
      ids: [workflowRunId],
    });

    // Revalidate the workflows page to show the updated status
    revalidatePath('/');

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Failed to cancel workflow:', error);

    return {
      success: false,
      error: error.message || 'Failed to cancel workflow',
    };
  }
}

/**
 * Helper functions for mapping Upstash data to our types
 */

/**
 * Map Upstash workflow state to our WorkflowStatus type
 */
function mapWorkflowState(state: string): import('./client').WorkflowStatus {
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
function mapSteps(steps?: any[]): import('./client').WorkflowStep[] {
  if (!steps || !Array.isArray(steps)) {
    return [];
  }

  const allSteps: import('./client').WorkflowStep[] = [];

  steps.forEach((stepItem, index) => {
    // Handle different QStash step formats
    if (stepItem.type === 'sequential' && stepItem.steps) {
      // Handle sequential step groups
      stepItem.steps.forEach((step: any, stepIndex: number) => {
        allSteps.push(mapSingleStep(step, `${index}-${stepIndex}`));
      });
    } else if (stepItem.type === 'single' && stepItem.steps) {
      // Handle single step groups
      stepItem.steps.forEach((step: any, stepIndex: number) => {
        allSteps.push(mapSingleStep(step, `${index}-${stepIndex}`));
      });
    } else if (stepItem.stepId || stepItem.stepName || stepItem.stepType) {
      // Handle direct step objects (the format we're seeing in logs)
      allSteps.push(mapSingleStep(stepItem, index.toString()));
    } else {
      // Fallback for unknown formats
      allSteps.push(mapSingleStep(stepItem, index.toString()));
    }
  });

  // If no steps were mapped but we have data, create basic steps
  if (allSteps.length === 0 && steps.length > 0) {
    steps.forEach((step, index) => {
      allSteps.push(mapSingleStep(step, index.toString()));
    });
  }

  return allSteps;
}

/**
 * Map a single step to our format
 */
function mapSingleStep(step: any, fallbackId: string): import('./client').WorkflowStep {
  // Handle the actual QStash step format
  const stepId = step.stepId || step.stepName || fallbackId;
  const stepName = step.stepName || step.stepType || step.type || 'Unknown Step';

  // Determine status based on QStash step structure
  let status: import('./client').WorkflowStatus = 'pending';
  if (step.out !== undefined || step.stepResponse !== undefined) {
    status = 'completed';
  } else if (step.stepStatus) {
    status = mapStepStatus(step.stepStatus);
  } else if (step.stepError) {
    status = 'failed';
  }

  // Parse output if it's a string
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
  };
}

/**
 * Map step status to our WorkflowStatus type
 */
function mapStepStatus(status?: string): import('./client').WorkflowStatus {
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
