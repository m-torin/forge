// Main SEO Generation Workflow Logic
// Hierarchical processing with parent-child workflows

import { WorkflowContext } from '@upstash/workflow';
import {
  SeoWorkflowPayload,
  ProductWithSeo,
  SeoGenerationResult,
  WorkflowStats,
  ErrorDetail,
  SeoStrategy,
} from './types';
import { SEO_CONFIG } from './config';
import { fetchProductsForSeo, updateProductSeoEnhanced, shouldSkipSeoGeneration } from './actions';
import { categorizeProductsBySeoStrategy } from './utils';
import { validateProductForSeo, processSeoWithRetry } from './processors';
import { trackSeoWorkflowProgress, updateSeoBatchStats } from './redis-tracker';
import { env } from '../../../env';

/**
 * Child workflow for processing a batch of SEO generation
 */
export async function processSeoGenerationBatch(context: WorkflowContext<SeoWorkflowPayload>) {
  const {
    productIds = [],
    parentRunId,
    batchIndex = 0,
    priorityBatch = false,
    seoStrategy = 'conversion',
    progressWebhook,
  } = context.requestPayload;

  const results: SeoGenerationResult[] = [];
  const startTime = Date.now();

  console.log('Starting SEO generation child workflow batch', {
    workflowRunId: context.workflowRunId,
    productCount: productIds.length,
    batchIndex,
    priorityBatch,
    seoStrategy,
  });

  for (let i = 0; i < productIds.length; i++) {
    const productId = productIds[i];

    const result = await context.run(`generate-seo-${i}`, async () => {
      return await generateSeoForProductEnhanced(productId, seoStrategy);
    });

    results.push(result);

    // Update progress for parent workflow
    if (parentRunId) {
      await trackSeoWorkflowProgress(parentRunId, productIds.length, i + 1, {
        strategy: seoStrategy,
        priorityBatch,
        tokensUsed: result.tokensUsed || 0,
        avgConfidence: result.confidence || 0,
      });
    }

    // Rate limit between products - stricter for AI workflows
    if (i < productIds.length - 1) {
      const delay = priorityBatch
        ? SEO_CONFIG.delays.priorityBatchDelay
        : SEO_CONFIG.delays.batchDelay;
      await context.sleep(`product-delay-${i}`, delay as any);
    }
  }

  // Update batch statistics
  await updateSeoBatchStats(results);

  // Report back to parent if needed
  if (parentRunId && progressWebhook) {
    await context.run('report-seo-to-parent', async () => {
      await fetch(progressWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'seo-batch-complete',
          parentRunId,
          batchIndex,
          priorityBatch,
          seoStrategy,
          results,
          processingTime: Date.now() - startTime,
        }),
      }).catch((error) => {
        console.error('Failed to report SEO batch to parent', { error, parentRunId });
      });
    });
  }

  return {
    batchIndex,
    results,
    success: results.some((r) => r.success),
    processingTime: Date.now() - startTime,
    totalTokensUsed: results.reduce((sum, r) => sum + (r.tokensUsed || 0), 0),
  };
}

/**
 * Enhanced main SEO workflow logic with hierarchical processing
 */
export async function mainSeoWorkflow(context: WorkflowContext<SeoWorkflowPayload>) {
  const startTime = Date.now();
  const errors: ErrorDetail[] = [];
  const warnings: string[] = [];

  const {
    productIds,
    limit = SEO_CONFIG.defaultBatchSize,
    onlyMissing = true,
    regenerate = false,
    categoryFilter,
    brandFilter,
    seoStrategy = 'conversion',
    progressWebhook,
  } = context.requestPayload;

  console.log('Starting enhanced main SEO workflow', {
    workflowRunId: context.workflowRunId,
    limit,
    seoStrategy,
    categoryFilter,
    brandFilter,
  });

  // Step 1: Fetch products that need SEO with enhanced filtering
  const products = await context.run('fetch-products', async () => {
    return await fetchProductsForSeo({
      productIds,
      limit,
      onlyMissing: !regenerate && onlyMissing,
      categoryFilter,
      brandFilter,
    });
  });

  if (products.length === 0) {
    console.log('No products found for SEO generation');
    return createEmptyStats(startTime);
  }

  // Step 2: Categorize products by priority for strategic processing
  const { highPriority, mediumPriority, lowPriority } = await context.run(
    'categorize-products',
    async () => {
      return categorizeProductsBySeoStrategy(products);
    },
  );

  console.log('Product categorization complete', {
    highPriority: highPriority.length,
    mediumPriority: mediumPriority.length,
    lowPriority: lowPriority.length,
    strategy: seoStrategy,
  });

  let allResults: SeoGenerationResult[] = [];
  const childWorkflowIds: string[] = [];

  // Step 3: Process high priority products first
  if (highPriority.length > 0) {
    const priorityResults = await processPriorityProducts(
      context,
      highPriority,
      seoStrategy,
      progressWebhook,
    );
    childWorkflowIds.push(...priorityResults.childIds);
    allResults.push(...priorityResults.results);
  }

  // Step 4: Process medium and low priority products
  const regularProducts = [...mediumPriority, ...lowPriority];
  if (regularProducts.length > 0) {
    const regularResults = await processRegularProducts(
      context,
      regularProducts,
      seoStrategy,
      progressWebhook,
    );
    childWorkflowIds.push(...regularResults.childIds);
    allResults.push(...regularResults.results);
  }

  // Step 5: Wait for child workflows if any
  if (childWorkflowIds.length > 0) {
    await context.waitForEvent(
      `seo-children-complete-${context.workflowRunId}`,
      SEO_CONFIG.childWorkflowTimeout,
    );
  }

  // Step 6: Generate final comprehensive statistics
  const finalStats = await context.run('generate-final-stats', async () => {
    return createFinalStats(
      allResults,
      errors,
      warnings,
      startTime,
      childWorkflowIds,
      highPriority.length,
      seoStrategy,
    );
  });

  // Step 7: Send completion webhook if configured
  if (progressWebhook) {
    await sendSeoCompletionWebhook(context, progressWebhook, finalStats);
  }

  console.log('Enhanced SEO generation workflow completed', finalStats);

  return finalStats;
}

/**
 * Enhanced SEO generation for a single product with comprehensive error handling
 */
async function generateSeoForProductEnhanced(
  productId: string,
  strategy: SeoStrategy = 'conversion',
): Promise<SeoGenerationResult> {
  const startTime = Date.now();

  try {
    // Fetch product details
    const products = await fetchProductsForSeo({ productIds: [productId] });
    if (products.length === 0) {
      throw new Error('Product not found');
    }

    const product = products[0];

    // Validate product data
    const validation = validateProductForSeo(product);
    if (!validation.valid) {
      throw new Error(`Product validation failed: ${validation.reason}`);
    }

    // Check if we should skip this product
    const skipCheck = await shouldSkipSeoGeneration(productId, false);
    if (skipCheck.skip) {
      return {
        productId,
        success: false,
        skipped: true,
        skipReason: skipCheck.reason,
        processingTime: Date.now() - startTime,
      };
    }

    // Process SEO generation with retry logic
    const result = await processSeoWithRetry(product, strategy);

    // Update product record with enhanced SEO content
    await updateProductSeoEnhanced(productId, result.seoContent, result.metadata);

    return {
      productId,
      success: true,
      seoContent: result.seoContent,
      processingTime: result.metadata.processingTime,
      strategy: result.metadata.strategy,
      confidence: result.metadata.confidence,
      tokensUsed: result.metadata.totalTokensUsed,
    };
  } catch (error) {
    console.error('Enhanced SEO generation failed for product', {
      productId,
      strategy,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      productId,
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      processingTime: Date.now() - startTime,
      strategy,
    };
  }
}

/**
 * Processes priority products using child workflows for parallel execution
 */
async function processPriorityProducts(
  context: WorkflowContext<SeoWorkflowPayload>,
  products: ProductWithSeo[],
  strategy: SeoStrategy,
  progressWebhook?: string,
): Promise<{ results: SeoGenerationResult[]; childIds: string[] }> {
  if (products.length <= 5) {
    // Process directly for small batches
    const results = await context.run('process-priority-direct', async () => {
      const batchResults: SeoGenerationResult[] = [];
      for (const product of products) {
        const result = await generateSeoForProductEnhanced(product.id, strategy);
        batchResults.push(result);
      }
      return batchResults;
    });

    return { results, childIds: [] };
  }

  // Use child workflows for larger batches
  const { Client } = await import('@upstash/workflow');
  const client = new Client({
    baseUrl: env.QSTASH_URL,
    token: env.QSTASH_TOKEN!,
  });

  const batchSize = Math.min(8, Math.ceil(products.length / SEO_CONFIG.maxChildWorkflows));
  const batches: string[][] = [];

  for (let i = 0; i < products.length; i += batchSize) {
    batches.push(products.slice(i, i + batchSize).map((product) => product.id));
  }

  const childIds = await context.run('spawn-priority-seo-workflows', async () => {
    const promises = batches.map(async (batch, index) => {
      const childRunId = `${context.workflowRunId}-seo-priority-${index}`;

      await client.trigger({
        url: `${env.NEXT_PUBLIC_APP_URL}/api/workflow/seo-generation`,
        body: {
          trigger: 'child',
          productIds: batch,
          batchIndex: index,
          parentRunId: context.workflowRunId,
          priorityBatch: true,
          seoStrategy: strategy,
          progressWebhook,
        },
        workflowRunId: childRunId,
        retries: SEO_CONFIG.maxRetries,
      });

      return childRunId;
    });

    return await Promise.all(promises);
  });

  return { results: [], childIds };
}

/**
 * Processes regular products using child workflows
 */
async function processRegularProducts(
  context: WorkflowContext<SeoWorkflowPayload>,
  products: ProductWithSeo[],
  strategy: SeoStrategy,
  progressWebhook?: string,
): Promise<{ results: SeoGenerationResult[]; childIds: string[] }> {
  if (products.length <= 10) {
    // Process directly for smaller batches
    const results = await context.run('process-regular-direct', async () => {
      const batchResults: SeoGenerationResult[] = [];
      for (const product of products) {
        const result = await generateSeoForProductEnhanced(product.id, strategy);
        batchResults.push(result);
      }
      return batchResults;
    });

    return { results, childIds: [] };
  }

  // Use child workflows for larger batches
  const { Client } = await import('@upstash/workflow');
  const client = new Client({
    baseUrl: env.QSTASH_URL,
    token: env.QSTASH_TOKEN!,
  });

  const batchSize = Math.ceil(products.length / SEO_CONFIG.maxChildWorkflows);
  const batches: string[][] = [];

  for (let i = 0; i < products.length; i += batchSize) {
    batches.push(products.slice(i, i + batchSize).map((product) => product.id));
  }

  const childIds = await context.run('spawn-regular-seo-workflows', async () => {
    const promises = batches.map(async (batch, index) => {
      const childRunId = `${context.workflowRunId}-seo-regular-${index}`;

      await client.trigger({
        url: `${env.NEXT_PUBLIC_APP_URL}/api/workflow/seo-generation`,
        body: {
          trigger: 'child',
          productIds: batch,
          batchIndex: index,
          parentRunId: context.workflowRunId,
          priorityBatch: false,
          seoStrategy: strategy,
          progressWebhook,
        },
        workflowRunId: childRunId,
        retries: SEO_CONFIG.maxRetries,
      });

      return childRunId;
    });

    return await Promise.all(promises);
  });

  return { results: [], childIds };
}

/**
 * Sends completion webhook with comprehensive SEO workflow stats
 */
async function sendSeoCompletionWebhook(
  context: WorkflowContext<SeoWorkflowPayload>,
  webhook: string,
  stats: WorkflowStats,
): Promise<void> {
  await context.run('send-seo-completion-webhook', async () => {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workflowRunId: context.workflowRunId,
        status: 'completed',
        workflowType: 'seo-generation',
        stats,
        timestamp: new Date().toISOString(),
        version: '2.0',
      }),
    }).catch((error) => {
      console.error('Failed to send SEO completion webhook', { error });
    });
  });
}

/**
 * Creates empty statistics for workflows with no products
 */
function createEmptyStats(startTime: number): WorkflowStats {
  return {
    totalProcessed: 0,
    successful: 0,
    failed: 0,
    skipped: 0,
    averageProcessingTime: 0,
    totalTokensUsed: 0,
    averageConfidence: 0,
    processingTimeMs: Date.now() - startTime,
    priorityProductsProcessed: 0,
  };
}

/**
 * Creates comprehensive final statistics for SEO workflow
 */
function createFinalStats(
  results: SeoGenerationResult[],
  _errors: ErrorDetail[],
  _warnings: string[],
  startTime: number,
  childWorkflowIds: string[],
  priorityCount: number,
  _strategy: SeoStrategy,
): WorkflowStats {
  let successful = 0;
  let failed = 0;
  let skipped = 0;
  let totalTokens = 0;
  let totalConfidence = 0;
  let confidenceCount = 0;
  let totalProcessingTime = 0;

  results.forEach((result) => {
    totalProcessingTime += result.processingTime;

    if (result.skipped) {
      skipped++;
    } else if (result.success) {
      successful++;
      if (result.tokensUsed) totalTokens += result.tokensUsed;
      if (result.confidence) {
        totalConfidence += result.confidence;
        confidenceCount++;
      }
    } else {
      failed++;
    }
  });

  const averageProcessingTime =
    results.length > 0 ? Math.round(totalProcessingTime / results.length) : 0;

  const averageConfidence = confidenceCount > 0 ? Math.round(totalConfidence / confidenceCount) : 0;

  return {
    totalProcessed: results.length,
    successful,
    failed,
    skipped,
    averageProcessingTime,
    totalTokensUsed: totalTokens,
    averageConfidence,
    processingTimeMs: Date.now() - startTime,
    childWorkflowIds,
    priorityProductsProcessed: priorityCount,
  };
}
