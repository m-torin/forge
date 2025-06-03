import { serve } from '@upstash/workflow/nextjs';

import { trainingFeedbackWorkflow } from '@repo/orchestration/workflows/ai/product-classification';

export const { POST } = serve(trainingFeedbackWorkflow, {
  retries: 3,
});
