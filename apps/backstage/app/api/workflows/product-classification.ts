/**
 * Product Classification Workflow
 * AI-powered product categorization with training feedback loop
 */

import {
  createStep,
  createStepWithValidation,
  StepTemplates,
  withStepRetry,
  withStepMonitoring,
  compose,
} from '@repo/orchestration';
import { z } from 'zod';

// Input/Output schemas
const ProductClassificationInput = z.object({
  productId: z.string(),
  title: z.string(),
  description: z.string(),
  images: z.array(z.string()).optional(),
  attributes: z.record(z.any()).optional(),
});

const ClassificationOutput = z.object({
  productId: z.string(),
  primaryCategory: z.string(),
  secondaryCategories: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  suggestedTags: z.array(z.string()),
  needsReview: z.boolean(),
});

// Step 1: Fetch product data
export const fetchProductStep = createStepWithValidation(
  'fetch-product',
  async (input: { productId: string }) => {
    // Simulate fetching from database
    return {
      productId: input.productId,
      title: 'Nike Air Max 270',
      description: 'Comfortable running shoes with air cushioning',
      images: ['image1.jpg', 'image2.jpg'],
      attributes: {
        brand: 'Nike',
        color: 'Black/White',
        size: '10',
      },
    };
  },
  (input) => !!input.productId,
  (output) => !!output.title
);

// Step 2: Extract features using AI
export const extractFeaturesStep = compose(
  createStep('extract-features', async (product: any) => {
    // Simulate AI feature extraction
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    return {
      textFeatures: {
        brand: product.attributes?.brand || 'Unknown',
        productType: 'footwear',
        keywords: ['running', 'shoes', 'athletic', 'sports'],
      },
      visualFeatures: {
        dominantColors: ['black', 'white'],
        style: 'athletic',
        hasLogo: true,
      },
      confidence: 0.85,
    };
  }),
  (step) => withStepRetry(step, { maxAttempts: 3, backoff: 'exponential' }),
  (step) => withStepMonitoring(step, { enableDetailedLogging: true })
);

// Step 3: Classify using AI model
export const classifyProductStep = StepTemplates.http(
  'classify-product',
  'Call AI classification service',
  {
    defaultConfig: {
      method: 'POST',
      baseHeaders: {
        'Content-Type': 'application/json',
      },
    },
  }
);

// Step 4: Validate classification
export const validateClassificationStep = createStepWithValidation(
  'validate-classification',
  async (classification: any) => {
    const needsReview = classification.confidence < 0.7 || 
                       classification.primaryCategory === 'Other';
    
    return {
      ...classification,
      needsReview,
      validatedAt: new Date().toISOString(),
    };
  },
  (input) => input.confidence !== undefined,
  (output) => output.needsReview !== undefined
);

// Step 5: Store results
export const storeResultsStep = compose(
  StepTemplates.database('store-classification', 'Save classification to database'),
  (step) => withStepRetry(step, { maxAttempts: 2 })
);

// Step 6: Queue for training if needed
export const queueForTrainingStep = createStep(
  'queue-for-training',
  async (result: any) => {
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
  }
);

// Step 7: Send notification
export const notifyStep = StepTemplates.notification(
  'notify-classification',
  'Send classification complete notification',
  {
    channels: ['email', 'webhook'],
  }
);

// Main workflow definition
export const productClassificationWorkflow = {
  id: 'product-classification',
  name: 'Product Classification',
  description: 'AI-powered product categorization with training feedback',
  version: '1.0.0',
  steps: [
    fetchProductStep,
    extractFeaturesStep,
    classifyProductStep,
    validateClassificationStep,
    storeResultsStep,
    queueForTrainingStep,
    notifyStep,
  ],
  config: {
    maxDuration: 60000, // 1 minute
    retryPolicy: {
      maxAttempts: 3,
      backoff: 'exponential',
    },
  },
};