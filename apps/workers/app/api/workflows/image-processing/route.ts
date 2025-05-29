import { serve } from '@upstash/workflow/nextjs';

import {
  type ImageProcessingPayload,
  imageProcessingWorkflow,
  isDevelopment,
  withEnhancedContext,
} from '@repo/orchestration';

/**
 * Image Processing Workflow API Route
 *
 * This route serves the image processing workflow that demonstrates
 * parallel image processing capabilities including resizing, filtering,
 * and cloud storage integration.
 *
 * Perfect for: Image galleries, user avatars, content management systems,
 * e-commerce product images, social media platforms
 */
export const { POST } = serve<ImageProcessingPayload>(
  withEnhancedContext(imageProcessingWorkflow),
  {
    retries: isDevelopment() ? 1 : 3,
    verbose: isDevelopment() ? true : undefined,
  },
);
