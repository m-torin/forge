import {
  AIProductClassifier,
  ClassificationTrainingSystem,
} from '@repo/ai/providers/product-classification';

import {
  type CategoryHierarchy,
  type ClassificationResult,
  DEFAULT_PRODUCT_CATEGORIES,
  type ProductData,
  type TrainingFeedback,
  WorkflowProductClassification,
} from '../../utils/product-classification';

import type { WorkflowContext } from '@upstash/workflow';

/**
 * Product classification workflow input
 */
export interface ProductClassificationInput {
  options?: {
    useVector?: boolean;
    enhanceWithAI?: boolean;
    categories?: CategoryHierarchy[];
  };
  product: ProductData;
}

/**
 * Product classification workflow result
 */
export interface ProductClassificationResult {
  classification: ClassificationResult;
  metadata: {
    timestamp: string;
    version: string;
    method: 'hybrid' | 'ai-only' | 'vector-only';
  };
  vectorSimilarity?: ClassificationResult[];
}

/**
 * Main product classification workflow
 * Combines vector similarity search with AI-enhanced classification
 */
export async function productClassificationWorkflow(
  context: WorkflowContext<ProductClassificationInput>,
): Promise<ProductClassificationResult> {
  const { options = {}, product } = context.requestPayload;
  const categories = options.categories || DEFAULT_PRODUCT_CATEGORIES;

  // Initialize services
  const vectorStore = new WorkflowProductClassification(categories);
  const aiClassifier = new AIProductClassifier(categories);

  let vectorResults: ClassificationResult[] = [];
  let finalClassification: ClassificationResult;

  // Step 1: Vector similarity search (if enabled)
  if (options.useVector !== false) {
    vectorResults = await vectorStore.findSimilarProducts(
      context,
      'vector-similarity-search',
      product,
      5,
    );
  }

  // Step 2: AI classification
  if (options.enhanceWithAI !== false && vectorResults.length > 0) {
    // Use AI to enhance vector results
    finalClassification = await context.run('ai-enhanced-classification', async () => {
      return aiClassifier.enhanceClassification(product, vectorResults);
    });
  } else {
    // Pure AI classification
    finalClassification = await context.run('ai-classification', async () => {
      return aiClassifier.classifyProduct(product);
    });
  }

  // Step 3: Store the classified product (if high confidence)
  if (finalClassification.confidence > 0.8) {
    await vectorStore.upsertProduct(
      context,
      'store-classified-product',
      product,
      finalClassification.categoryId,
    );
  }

  // Return results
  return {
    classification: finalClassification,
    metadata: {
      method:
        vectorResults.length > 0
          ? options.enhanceWithAI !== false
            ? 'hybrid'
            : 'vector-only'
          : 'ai-only',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
    vectorSimilarity: vectorResults,
  };
}

/**
 * Training feedback workflow input
 */
export interface TrainingFeedbackInput {
  feedback: TrainingFeedback | TrainingFeedback[];
  options?: {
    updateVectorStore?: boolean;
    generateReport?: boolean;
  };
}

/**
 * Training feedback workflow result
 */
export interface TrainingFeedbackResult {
  metrics?: {
    overall: number;
    byCategory: Record<string, number>;
    confidenceAnalysis: {
      low: number;
      medium: number;
      high: number;
    };
  };
  processed: number;
  updated: number;
}

/**
 * Training feedback workflow
 * Processes user feedback to improve classification accuracy
 */
export async function trainingFeedbackWorkflow(
  context: WorkflowContext<TrainingFeedbackInput>,
): Promise<TrainingFeedbackResult> {
  const { feedback, options = {} } = context.requestPayload;
  const feedbackArray = Array.isArray(feedback) ? feedback : [feedback];

  const categories = DEFAULT_PRODUCT_CATEGORIES;
  const vectorStore = new WorkflowProductClassification(categories);
  const trainingSystem = new ClassificationTrainingSystem();

  let updated = 0;

  // Process each feedback item
  for (const item of feedbackArray) {
    // Add to training system
    await context.run(`add-feedback-${item.productId}`, async () => {
      trainingSystem.addFeedback(
        item.productId,
        item.predictedCategory,
        item.actualCategory,
        item.confidence,
      );
    });

    // Update vector store if correction needed
    if (options.updateVectorStore !== false && item.actualCategory !== item.predictedCategory) {
      await vectorStore.applyTrainingFeedback(context, `update-vector-${item.productId}`, item);
      updated++;
    }
  }

  // Generate metrics report if requested
  let metrics;
  if (options.generateReport) {
    metrics = await context.run('generate-metrics', async () => {
      const metricsData = trainingSystem.getAccuracyMetrics();
      return {
        confidenceAnalysis: metricsData.confidenceAnalysis,
        byCategory: Object.fromEntries(metricsData.byCategory),
        overall: metricsData.overall,
      };
    });
  }

  return {
    metrics,
    processed: feedbackArray.length,
    updated,
  };
}

/**
 * Batch product import workflow input
 */
export interface BatchProductImportInput {
  options?: {
    batchSize?: number;
    useVector?: boolean;
    enhanceWithAI?: boolean;
    categories?: CategoryHierarchy[];
    onProgress?: (progress: number) => void;
  };
  products: ProductData[];
}

/**
 * Batch product import workflow result
 */
export interface BatchProductImportResult {
  classifications: {
    productId: string;
    categoryId: string;
    confidence: number;
    error?: string;
  }[];
  failed: number;
  successful: number;
  total: number;
}

/**
 * Batch product import workflow
 * Processes multiple products in parallel batches
 */
export async function batchProductImportWorkflow(
  context: WorkflowContext<BatchProductImportInput>,
): Promise<BatchProductImportResult> {
  const { options = {}, products } = context.requestPayload;
  const batchSize = options.batchSize || 10;
  const categories = options.categories || DEFAULT_PRODUCT_CATEGORIES;

  const aiClassifier = new AIProductClassifier(categories);
  const vectorStore = new WorkflowProductClassification(categories);

  const results: BatchProductImportResult = {
    classifications: [],
    failed: 0,
    successful: 0,
    total: products.length,
  };

  // Process products in batches
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const batchIndex = Math.floor(i / batchSize);

    // Classify batch
    const batchResults = await context.run(`classify-batch-${batchIndex}`, async () => {
      return aiClassifier.batchClassifyProducts(batch);
    });

    // Process results
    for (const result of batchResults) {
      if (result.error) {
        results.failed++;
        results.classifications.push({
          confidence: 0,
          categoryId: 'unknown',
          error: result.error,
          productId: result.productId,
        });
      } else {
        results.successful++;
        results.classifications.push({
          confidence: result.result.confidence,
          categoryId: result.result.categoryId,
          productId: result.productId,
        });
      }
    }

    // Store successfully classified products
    const successfulProducts = batchResults
      .filter((r) => !r.error && r.result.confidence > 0.7)
      .map((r) => ({
        categoryId: r.result.categoryId,
        product: batch.find((p) => p.id === r.productId)!,
      }));

    if (successfulProducts.length > 0) {
      await vectorStore.batchUpsertProducts(
        context,
        `store-batch-${batchIndex}`,
        successfulProducts,
      );
    }

    // Report progress
    if (options.onProgress) {
      const progress = Math.min(100, ((i + batch.length) / products.length) * 100);
      await context.run(`report-progress-${batchIndex}`, async () => {
        options.onProgress!(progress);
      });
    }

    // Add small delay between batches to avoid rate limits
    if (i + batchSize < products.length) {
      await context.sleep('batch-delay', 1);
    }
  }

  return results;
}
