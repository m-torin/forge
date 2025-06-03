import { serve } from '@upstash/workflow/nextjs';

import { batchProductImportWorkflow } from '@repo/orchestration/workflows/ai/product-classification';

export const { POST } = serve(batchProductImportWorkflow, {
  retries: 3,
});
