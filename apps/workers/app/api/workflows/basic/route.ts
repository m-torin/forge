import { serve } from '@upstash/workflow/nextjs';

import {
  basicWorkflow,
  type BasicWorkflowPayload,
  isDevelopment,
  withEnhancedContext,
} from '@repo/orchestration';

/**
 * Basic Workflow API Route
 *
 * This route serves the enhanced basic workflow that demonstrates
 * core Upstash Workflow patterns. The actual workflow logic is
 * imported from the orchestration package for reusability.
 *
 * Perfect for: Task queues, background jobs, batch processing, simple order workflows
 */
export const { POST } = serve<BasicWorkflowPayload>(withEnhancedContext(basicWorkflow), {
  retries: isDevelopment() ? 1 : 3,
  verbose: isDevelopment() ? true : undefined,
});
