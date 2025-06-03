import { serve } from '@upstash/workflow/nextjs';

import { productClassificationWorkflow } from '@repo/orchestration/workflows/ai/product-classification';

export const { POST } = serve(productClassificationWorkflow, {
  retries: 3,
});
