import { WorkflowContext } from '@upstash/workflow';
import {
  JrImagesWorkflowPayload,
  FirestoreDocument,
  JrImagesProcessingResult,
  JrImagesWorkflowStats,
  JrImagesErrorDetail,
} from '@/workflows/jr-images/types';
import { JR_IMAGES_CONFIG } from '@/workflows/jr-images/config';
import {
  fetchJrImageUnmappedDocuments,
  updateJrImageProcessedDocuments,
} from '@/workflows/jr-images/actions';
import { categorizeJrImageDocumentsByPriority } from '@/workflows/jr-images/utils';
import { processDocumentJrImages } from '@/workflows/jr-images/processors';
import {
  trackJrImageWorkflowProgress,
  updateJrImageBatchStats,
  updateJrImageMetadata,
} from '@/workflows/jr-images/redis-tracker';
import { env } from '../../../env';

/**
 * Child workflow for processing a batch of JR-Images documents
 */
export async function processJrImageBatch(context: WorkflowContext<JrImagesWorkflowPayload>) {
  const {
    documentIds = [],
    parentRunId,
    batchIndex = 0,
    priorityBatch = false,
    progressWebhook,
  } = context.requestPayload;

  const results: JrImagesProcessingResult[] = [];
  const startTime = Date.now();

  console.log('Starting JR-Images child workflow batch', {
    workflowRunId: context.workflowRunId,
    documentCount: documentIds.length,
    batchIndex,
    priorityBatch,
  });

  for (let i = 0; i < documentIds.length; i++) {
    const documentId = documentIds[i];

    const result = await context.run(`process-jr-image-document-${i}`, async () => {
      return await processDocumentJrImagesResilient(documentId);
    });

    results.push(result);

    // Update progress for parent workflow
    if (parentRunId) {
      await trackJrImageWorkflowProgress(parentRunId, documentIds.length, i + 1, {
        batchIndex,
        priorityBatch,
      });
    }

    // Rate limit between documents
    if (i < documentIds.length - 1) {
      const delay = priorityBatch
        ? JR_IMAGES_CONFIG.priorityBatchDelay
        : JR_IMAGES_CONFIG.batchDelay;
      await context.sleep(`jr-image-doc-delay-${i}`, delay as any);
    }
  }

  // Update batch statistics
  await updateJrImageBatchStats(results);

  // Report back to parent if needed
  if (parentRunId && progressWebhook) {
    await context.run('report-jr-images-to-parent', async () => {
      await fetch(progressWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'jr-images-batch-complete',
          parentRunId,
          batchIndex,
          priorityBatch,
          results,
          processingTime: Date.now() - startTime,
        }),
      }).catch((error) => {
        console.error('Failed to report JR-Images to parent', { error, parentRunId });
      });
    });
  }

  return {
    batchIndex,
    results,
    success: results.some((r) => r.success),
    processingTime: Date.now() - startTime,
  };
}

/**
 * Main JR-Images workflow logic with hierarchical processing
 */
export async function mainJrImageWorkflow(context: WorkflowContext<JrImagesWorkflowPayload>) {
  const startTime = Date.now();
  const errors: JrImagesErrorDetail[] = [];
  const warnings: string[] = [];

  const { batchSize = JR_IMAGES_CONFIG.defaultBatchSize, progressWebhook } = context.requestPayload;

  console.log('Starting main JR-Images workflow', {
    workflowRunId: context.workflowRunId,
    batchSize,
  });

  // Step 1: Fetch unmapped documents
  const documents = await context.run('fetch-jr-image-documents', async () => {
    return await fetchJrImageUnmappedDocuments(batchSize);
  });

  if (documents.length === 0) {
    console.log('No unmapped JR-Images documents found');
    return createEmptyJrImageStats(startTime);
  }

  // Step 2: Categorize documents by priority
  const { highPriority, mediumPriority, lowPriority } = await context.run(
    'categorize-jr-image-documents',
    async () => {
      return categorizeJrImageDocumentsByPriority(documents);
    },
  );

  console.log('JR-Images document categorization complete', {
    highPriority: highPriority.length,
    mediumPriority: mediumPriority.length,
    lowPriority: lowPriority.length,
  });

  let allResults: JrImagesProcessingResult[] = [];
  const childWorkflowIds: string[] = [];

  // Step 3: Process high priority documents first
  if (highPriority.length > 0) {
    const priorityResults = await processPriorityJrImageDocuments(
      context,
      highPriority,
      progressWebhook,
    );
    childWorkflowIds.push(...priorityResults.childIds);
    allResults.push(...priorityResults.results);
  }

  // Step 4: Process medium and low priority documents
  const regularDocuments = [...mediumPriority, ...lowPriority];
  if (regularDocuments.length > 0) {
    const regularResults = await processRegularJrImageDocuments(
      context,
      regularDocuments,
      progressWebhook,
    );
    childWorkflowIds.push(...regularResults.childIds);
    allResults.push(...regularResults.results);
  }

  // Step 5: Wait for child workflows if any
  if (childWorkflowIds.length > 0) {
    await context.waitForEvent(
      `jr-images-children-complete-${context.workflowRunId}`,
      JR_IMAGES_CONFIG.childWorkflowTimeout,
    );
  }

  // Step 6: Update Firestore with results
  const updateResults = await context.run('update-jr-image-firestore', async () => {
    return await updateJrImageProcessedDocuments(allResults);
  });

  // Step 7: Generate final statistics
  const finalStats = await context.run('generate-jr-image-final-stats', async () => {
    return createFinalJrImageStats(
      allResults,
      errors,
      warnings,
      startTime,
      childWorkflowIds,
      highPriority.length,
      updateResults,
    );
  });

  // Step 8: Send completion webhook
  if (progressWebhook) {
    await sendJrImageCompletionWebhook(context, progressWebhook, finalStats);
  }

  console.log('JR-Images migration workflow completed', finalStats);

  return finalStats;
}

/**
 * Processes all images for a single document with resilient error handling
 */
async function processDocumentJrImagesResilient(
  documentId: string,
): Promise<JrImagesProcessingResult> {
  const startTime = Date.now();

  try {
    // Fetch document from Firestore
    const documents = await fetchJrImageUnmappedDocuments(1);
    const document = documents.find((d) => d.id === documentId);

    if (!document) {
      throw new Error(`JR-Images document not found: ${documentId}`);
    }

    if (!document.pdpImgs || document.pdpImgs.length === 0) {
      return {
        documentId: document.id,
        success: false,
        errors: ['No images found in document'],
        processingTime: Date.now() - startTime,
      };
    }

    // Process images using the processors
    const { processedImages, failedImages } = await processDocumentJrImages(
      document.id,
      document.pdpImgs,
      document.priority,
    );

    // Update metadata for processed images
    for (let i = 0; i < processedImages.length; i++) {
      const img = processedImages[i];
      await updateJrImageMetadata(img.originalUrl, document.id, i, img.r2Key, {
        r2Url: img.r2Url,
        size: img.size,
        format: img.format,
        width: img.width,
        height: img.height,
      });
    }

    // Determine success - at least one image processed successfully
    const success = processedImages.length > 0;
    const partialSuccess = success && failedImages.length > 0;

    return {
      documentId: document.id,
      success,
      processedImages: success ? processedImages : undefined,
      failedImages: failedImages.length > 0 ? failedImages : undefined,
      errors: failedImages.length > 0 ? failedImages.map((f) => f.error) : undefined,
      processingTime: Date.now() - startTime,
      partialSuccess,
    };
  } catch (error) {
    console.error('JR-Images document processing failed', {
      documentId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      documentId,
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      processingTime: Date.now() - startTime,
    };
  }
}

/**
 * Processes priority JR-Images documents using child workflows
 */
async function processPriorityJrImageDocuments(
  context: WorkflowContext<JrImagesWorkflowPayload>,
  documents: FirestoreDocument[],
  progressWebhook?: string,
): Promise<{ results: JrImagesProcessingResult[]; childIds: string[] }> {
  if (documents.length <= 5) {
    // Process directly for small batches
    const results = await context.run('process-jr-images-priority-direct', async () => {
      const batchResults: JrImagesProcessingResult[] = [];
      for (const doc of documents) {
        const result = await processDocumentJrImagesResilient(doc.id);
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

  const batchSize = Math.min(10, Math.ceil(documents.length / JR_IMAGES_CONFIG.maxChildWorkflows));
  const batches: string[][] = [];

  for (let i = 0; i < documents.length; i += batchSize) {
    batches.push(documents.slice(i, i + batchSize).map((doc) => doc.id));
  }

  const childIds = await context.run('spawn-jr-images-priority-workflows', async () => {
    const promises = batches.map(async (batch, index) => {
      const childRunId = `${context.workflowRunId}-jr-images-priority-${index}`;

      await client.trigger({
        url: `${env.NEXT_PUBLIC_APP_URL}/api/workflow/jr-images`,
        body: {
          trigger: 'child',
          documentIds: batch,
          batchIndex: index,
          parentRunId: context.workflowRunId,
          progressWebhook,
          priorityBatch: true,
        },
        workflowRunId: childRunId,
        retries: JR_IMAGES_CONFIG.maxRetries,
      });

      return childRunId;
    });

    return await Promise.all(promises);
  });

  return { results: [], childIds };
}

/**
 * Processes regular JR-Images documents using child workflows
 */
async function processRegularJrImageDocuments(
  context: WorkflowContext<JrImagesWorkflowPayload>,
  documents: FirestoreDocument[],
  progressWebhook?: string,
): Promise<{ results: JrImagesProcessingResult[]; childIds: string[] }> {
  if (documents.length <= 20) {
    // Process directly for smaller batches
    const results = await context.run('process-jr-images-regular-direct', async () => {
      const batchResults: JrImagesProcessingResult[] = [];
      for (const doc of documents) {
        const result = await processDocumentJrImagesResilient(doc.id);
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

  const batchSize = Math.ceil(documents.length / JR_IMAGES_CONFIG.maxChildWorkflows);
  const batches: string[][] = [];

  for (let i = 0; i < documents.length; i += batchSize) {
    batches.push(documents.slice(i, i + batchSize).map((doc) => doc.id));
  }

  const childIds = await context.run('spawn-jr-images-regular-workflows', async () => {
    const promises = batches.map(async (batch, index) => {
      const childRunId = `${context.workflowRunId}-jr-images-regular-${index}`;

      await client.trigger({
        url: `${env.NEXT_PUBLIC_APP_URL}/api/workflow/jr-images`,
        body: {
          trigger: 'child',
          documentIds: batch,
          batchIndex: index,
          parentRunId: context.workflowRunId,
          progressWebhook,
          priorityBatch: false,
        },
        workflowRunId: childRunId,
        retries: JR_IMAGES_CONFIG.maxRetries,
      });

      return childRunId;
    });

    return await Promise.all(promises);
  });

  return { results: [], childIds };
}

/**
 * Sends completion webhook with comprehensive stats
 */
async function sendJrImageCompletionWebhook(
  context: WorkflowContext<JrImagesWorkflowPayload>,
  webhook: string,
  stats: JrImagesWorkflowStats,
): Promise<void> {
  await context.run('send-jr-images-completion-webhook', async () => {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workflowRunId: context.workflowRunId,
        status: 'completed',
        workflow: 'jr-images',
        stats,
        timestamp: new Date().toISOString(),
      }),
    }).catch((error) => {
      console.error('Failed to send JR-Images completion webhook', { error });
    });
  });
}

/**
 * Creates empty statistics for workflows with no documents
 */
function createEmptyJrImageStats(startTime: number): JrImagesWorkflowStats {
  return {
    totalProcessed: 0,
    successfulDocuments: 0,
    failedDocuments: 0,
    partialSuccessDocuments: 0,
    totalImages: 0,
    totalImagesProcessed: 0,
    totalImagesFailed: 0,
    totalBytesProcessed: 0,
    averageCompressionRatio: 0,
    processingTimeMs: Date.now() - startTime,
    priorityDocumentsProcessed: 0,
  };
}

/**
 * Creates comprehensive final statistics
 */
function createFinalJrImageStats(
  results: JrImagesProcessingResult[],
  _errors: JrImagesErrorDetail[],
  _warnings: string[],
  startTime: number,
  childWorkflowIds: string[],
  priorityCount: number,
  _updateResults: { updated: number; failed: number; partialSuccess: number },
): JrImagesWorkflowStats {
  let totalImages = 0;
  let totalImagesProcessed = 0;
  let totalImagesFailed = 0;
  let totalBytesProcessed = 0;
  let successfulDocs = 0;
  let failedDocs = 0;
  let partialSuccessDocs = 0;

  results.forEach((result) => {
    if (result.success && result.processedImages) {
      successfulDocs++;
      result.processedImages.forEach((img) => {
        totalImagesProcessed++;
        totalBytesProcessed += img.size;
      });

      if (result.partialSuccess) {
        partialSuccessDocs++;
      }
    } else {
      failedDocs++;
    }

    // Count total images attempted
    totalImages += (result.processedImages?.length || 0) + (result.failedImages?.length || 0);
    totalImagesFailed += result.failedImages?.length || 0;
  });

  return {
    totalProcessed: results.length,
    successfulDocuments: successfulDocs,
    failedDocuments: failedDocs,
    partialSuccessDocuments: partialSuccessDocs,
    totalImages,
    totalImagesProcessed,
    totalImagesFailed,
    totalBytesProcessed,
    averageCompressionRatio: totalBytesProcessed > 0 ? 0.6 : 0, // Approximate for WebP
    processingTimeMs: Date.now() - startTime,
    childWorkflowIds,
    priorityDocumentsProcessed: priorityCount,
  };
}
