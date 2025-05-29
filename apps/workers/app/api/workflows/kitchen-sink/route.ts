import { serve } from '@upstash/workflow/nextjs';

import {
  isDevelopment,
  type KitchenSinkPayload,
  kitchenSinkWorkflow,
  withEnhancedContext,
} from '@repo/orchestration';

/**
 * Kitchen Sink Workflow API Route
 *
 * This route serves the comprehensive kitchen sink workflow that demonstrates
 * EVERY Upstash Workflow & QStash feature. The actual workflow logic is
 * imported from the orchestration package for reusability.
 *
 * This workflow can be triggered via:
 * - Webhook (POST request to this endpoint)
 * - Manual invocation
 * - Schedule (configured separately for daily execution)
 */

export const { POST } = serve<KitchenSinkPayload>(withEnhancedContext(kitchenSinkWorkflow), {
  retries: isDevelopment() ? 1 : 3,
  verbose: isDevelopment() ? true : undefined,
});
