/**
 * Product Classification Workflow
 * AI-powered product categorization with training feedback loop
 */

import { z } from 'zod';

import {
  compose,
  createStep,
  createStepWithValidation,
  StepTemplates,
  withStepMonitoring,
  withStepRetry,
} from '@repo/orchestration/server/next';

// Input/Output schemas
const ProductClassificationInput = z.object({
  attributes: z.record(z.any()).optional(),
  description: z.string(),
  images: z.array(z.string()).optional(),
  productId: z.string(),
  title: z.string(),
});

const ClassificationOutput = z.object({
  confidence: z.number().min(0).max(1),
  needsReview: z.boolean(),
  primaryCategory: z.string(),
  productId: z.string(),
  secondaryCategories: z.array(z.string()),
  suggestedTags: z.array(z.string()),
});

// Step 1: Fetch product data
export const fetchProductStep = createStepWithValidation(
  'fetch-product',
  async (input: { productId: string }) => {
    // Simulate fetching from database
    return {
      attributes: {
        brand: 'Nike',
        color: 'Black/White',
        size: '10',
      },
      description: 'Comfortable running shoes with air cushioning',
      images: ['image1.jpg', 'image2.jpg'],
      productId: input.productId,
      title: 'Nike Air Max 270',
    };
  },
  (input) => !!input.productId,
  (output) => !!output.title,
);

// Step 2: Extract features using AI
export const extractFeaturesStep = compose(
  createStep('extract-features', async (product: any) => {
    // Simulate AI feature extraction
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      confidence: 0.85,
      textFeatures: {
        brand: product.attributes?.brand || 'Unknown',
        keywords: ['running', 'shoes', 'athletic', 'sports'],
        productType: 'footwear',
      },
      visualFeatures: {
        dominantColors: ['black', 'white'],
        hasLogo: true,
        style: 'athletic',
      },
    };
  }),
  (step: any) => withStepRetry(step, { backoff: true, maxRetries: 3 }),
  (step: any) => withStepMonitoring(step),
);

// Step 3: Classify using AI model
export const classifyProductStep = createStep('classify-product', async (data: any) => {
  // Call AI classification service
  const response = await fetch('https://api.classification.example.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return await response.json();
});

// Step 4: Validate classification
export const validateClassificationStep = createStepWithValidation(
  'validate-classification',
  async (classification: any) => {
    const needsReview =
      classification.confidence < 0.7 || classification.primaryCategory === 'Other';

    return {
      ...classification,
      validatedAt: new Date().toISOString(),
      needsReview,
    };
  },
  (input) => input.confidence !== undefined,
  (output) => output.needsReview !== undefined,
);

// Step 5: Store results
export const storeResultsStep = compose(
  StepTemplates.database('store-classification', 'Save classification to database'),
  (step: any) => withStepRetry(step, { maxRetries: 2 }),
);

// Step 6: Queue for training if needed
export const queueForTrainingStep = createStep('queue-for-training', async (result: any) => {
  if (result.needsReview || result.confidence < 0.8) {
    // Add to training queue
    console.log('Adding to training queue:', result.productId);
    return {
      queued: true,
      queueId: `training-${Date.now()}`,
      reason: result.needsReview ? 'manual-review' : 'low-confidence',
    };
  }
  return { queued: false };
});

// Step 7: Send notification
export const notifyStep = StepTemplates.notification('notify-classification', 'info');

// Main workflow definition
export const productClassificationWorkflow = {
  id: 'product-classification',
  name: 'Product Classification',
  config: {
    maxDuration: 60000, // 1 minute
    retryPolicy: {
      backoff: true,
      maxRetries: 3,
    },
  },
  description: 'AI-powered product categorization with training feedback',
  steps: [
    fetchProductStep,
    extractFeaturesStep,
    classifyProductStep,
    validateClassificationStep,
    storeResultsStep,
    queueForTrainingStep,
    notifyStep,
  ],
  version: '1.0.0',
};
