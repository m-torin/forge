import { devLog } from '../../utils/observability';

import type { WorkflowContext } from '@upstash/workflow';

/**
 * Chart Sitemaps Workflow
 * 
 * A workflow for processing chart sitemaps
 */
export interface ChartSitemapsPayload {
  message?: string;
}

export async function chartSitemapsWorkflow(
  context: WorkflowContext<ChartSitemapsPayload>
) {
  const { message = 'Hello World' } = context.requestPayload || {};

  // Log the start of the workflow
  devLog.workflow(context, 'Starting chart sitemaps workflow', { message });

  // Step 1: Print Hello World
  const result = await context.run('print-message', async () => {
    console.log(message);
    return {
      message,
      timestamp: new Date().toISOString(),
      workflowRunId: context.workflowRunId,
    };
  });

  // Return the result
  return {
    status: 'success' as const,
    data: result,
    metadata: {
      workflowRunId: context.workflowRunId,
      timestamp: new Date().toISOString(),
    },
  };
}