import { WorkflowContext, Client } from '@upstash/workflow';
import {
  JrSitemapsWorkflowPayload,
  JrSitemapResult,
  JrSitemapsProcessingStats,
  JrSitemapsErrorDetail,
} from '@/workflows/jr-sitemaps/types';
import { JR_SITEMAPS_CONFIG } from '@/workflows/jr-sitemaps/config';
import {
  validateJrSitemapUrl,
  storeJrSitemapUrlBatch,
  checkJrSitemapChanged,
  updateJrSitemapMetadata,
} from '@/workflows/jr-sitemaps/actions';
import { env } from '../../../env';

/**
 * Child workflow for processing a batch of jr-sitemaps
 */
export async function processSitemapBatch(context: WorkflowContext<JrSitemapsWorkflowPayload>) {
  const {
    customSitemaps = [],
    batchIndex = 0,
    parentRunId,
    progressWebhook,
    isPriorityBatch = false,
  } = context.requestPayload;

  const results: JrSitemapResult[] = [];

  for (let i = 0; i < customSitemaps.length; i++) {
    const sitemapUrl = customSitemaps[i];
    const { isPriority } = await validateJrSitemapUrl(sitemapUrl);

    const result = await context.run(`process-sitemap-${i}`, async (): Promise<JrSitemapResult> => {
      return await processSingleJrSitemap(
        sitemapUrl,
        progressWebhook,
        context.workflowRunId,
        isPriority,
      );
    });

    results.push(result);

    // Rate limit between sitemaps
    if (i < customSitemaps.length - 1) {
      const delay = isPriorityBatch
        ? JR_SITEMAPS_CONFIG.delayBetweenPrioritySitemaps
        : JR_SITEMAPS_CONFIG.delayBetweenBatches;
      await context.sleep(`delay-after-sitemap-${i}`, delay as any);
    }
  }

  // Report back to parent
  if (parentRunId && progressWebhook) {
    await context.run('report-to-parent', async () => {
      await fetch(progressWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'batch-complete',
          parentRunId,
          batchIndex,
          isPriorityBatch,
          results,
        }),
      }).catch((error) => {
        console.error('Failed to report to parent', { error, parentRunId });
      });
    });
  }

  return {
    batchIndex,
    results,
    success: results.some((r) => r.success),
  };
}

/**
 * Main JR-Sitemaps workflow logic
 */
export async function mainJrSitemapsWorkflow(context: WorkflowContext<JrSitemapsWorkflowPayload>) {
  const startTime = Date.now();
  const errors: JrSitemapsErrorDetail[] = [];
  const warnings: string[] = [];

  const { customSitemaps, skipUnchanged = true, progressWebhook } = context.requestPayload;

  const sitemapsToProcess =
    customSitemaps ||
    JR_SITEMAPS_CONFIG.allowedDomains.map((domain) => `https://www.${domain}/sitemap_index.xml`);

  // Validate and categorize sitemaps
  const { prioritySitemaps, regularSitemaps } = await context.run(
    'validate-and-categorize',
    async () => {
      const priority: string[] = [];
      const regular: string[] = [];

      for (const url of sitemapsToProcess) {
        const validation = await validateJrSitemapUrl(url);

        if (!validation.valid) {
          errors.push({
            url,
            error: validation.error!,
            timestamp: new Date().toISOString(),
          });
          continue;
        }

        if (skipUnchanged) {
          const hasChanged = await checkJrSitemapChanged(url);
          if (!hasChanged) {
            warnings.push(`Skipping unchanged sitemap: ${url}`);
            continue;
          }
        }

        if (validation.isPriority) {
          priority.push(url);
        } else {
          regular.push(url);
        }
      }

      console.log('JR-Sitemaps categorization complete', {
        priority: priority.length,
        regular: regular.length,
        errors: errors.length,
      });

      return { prioritySitemaps: priority, regularSitemaps: regular };
    },
  );

  const totalSitemaps = prioritySitemaps.length + regularSitemaps.length;

  if (totalSitemaps === 0) {
    return createEmptyJrSitemapsStats(errors, warnings, startTime);
  }

  let allResults: JrSitemapResult[] = [];
  const childWorkflowIds: string[] = [];

  // Process priority sitemaps first
  if (prioritySitemaps.length > 0) {
    const priorityResults = await processPriorityJrSitemaps(
      context,
      prioritySitemaps,
      progressWebhook,
    );
    childWorkflowIds.push(...priorityResults.childIds);
    allResults.push(...priorityResults.results);
  }

  // Process regular sitemaps
  if (regularSitemaps.length > 0) {
    const regularResults = await processRegularJrSitemaps(
      context,
      regularSitemaps,
      progressWebhook,
    );
    childWorkflowIds.push(...regularResults.childIds);
    allResults.push(...regularResults.results);
  }

  // Wait for child workflows if any
  if (childWorkflowIds.length > 0) {
    await context.waitForEvent(`children-complete-${context.workflowRunId}`, '30m');
  }

  // Generate final statistics
  const finalStats = await context.run('generate-final-stats', async () => {
    return createFinalJrSitemapsStats(
      allResults,
      errors,
      warnings,
      startTime,
      childWorkflowIds,
      prioritySitemaps.length,
    );
  });

  // Send completion webhook
  if (progressWebhook) {
    await sendJrSitemapsCompletionWebhook(context, progressWebhook, finalStats);
  }

  return finalStats;
}

/**
 * Process a single sitemap with mock streaming
 */
async function processSingleJrSitemap(
  url: string,
  progressWebhook: string | undefined,
  workflowRunId: string,
  isPriority: boolean,
): Promise<JrSitemapResult> {
  let processedUrlCount = 0;
  let totalInserted = 0;
  let totalUpdated = 0;
  let skippedDuplicates = 0;
  const urlBatch: string[] = [];

  try {
    // Mock sitemap processing - in production would use actual sitemap parsing
    const mockUrls = generateMockSitemapUrls(url, isPriority ? 1000 : 500);

    for (const mockUrl of mockUrls) {
      processedUrlCount++;
      urlBatch.push(mockUrl);

      if (urlBatch.length >= JR_SITEMAPS_CONFIG.urlBatchSize) {
        const batch = urlBatch.splice(0, JR_SITEMAPS_CONFIG.urlBatchSize);
        const stats = await storeJrSitemapUrlBatch(batch, url);
        totalInserted += stats.inserted;
        totalUpdated += stats.updated;
        skippedDuplicates += stats.skipped;
      }

      if (processedUrlCount % JR_SITEMAPS_CONFIG.progressReportInterval === 0 && progressWebhook) {
        reportJrSitemapsProgress(
          progressWebhook,
          workflowRunId,
          url,
          processedUrlCount,
          isPriority,
        );
      }
    }

    // Process remaining URLs
    if (urlBatch.length > 0) {
      const stats = await storeJrSitemapUrlBatch(urlBatch, url);
      totalInserted += stats.inserted;
      totalUpdated += stats.updated;
      skippedDuplicates += stats.skipped;
    }

    await updateJrSitemapMetadata(url, processedUrlCount);

    return {
      url,
      success: true,
      urlsProcessed: processedUrlCount,
      inserted: totalInserted,
      updated: totalUpdated,
      skipped: skippedDuplicates,
      isPriority,
    };
  } catch (error) {
    console.error('JR-Sitemap processing error', { url, error });
    return {
      url,
      success: false,
      urlsProcessed: processedUrlCount,
      inserted: totalInserted,
      updated: totalUpdated,
      skipped: skippedDuplicates,
      isPriority,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Helper functions
function generateMockSitemapUrls(sitemapUrl: string, count: number): string[] {
  const baseUrl = new URL(sitemapUrl).origin;
  const urls: string[] = [];

  for (let i = 0; i < count; i++) {
    urls.push(`${baseUrl}/page-${i}`);
    urls.push(`${baseUrl}/product-${i}`);
    urls.push(`${baseUrl}/category-${i}`);
  }

  return urls;
}

function reportJrSitemapsProgress(
  webhook: string,
  workflowRunId: string,
  sitemap: string,
  processedUrls: number,
  isPriority: boolean,
): void {
  fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workflowRunId,
      sitemap,
      isPriority,
      progress: { processedUrls },
    }),
  }).catch(() => {});
}

async function processPriorityJrSitemaps(
  context: WorkflowContext<JrSitemapsWorkflowPayload>,
  sitemaps: string[],
  progressWebhook?: string,
): Promise<{ results: JrSitemapResult[]; childIds: string[] }> {
  if (!env.QSTASH_TOKEN) {
    throw new Error('QSTASH_TOKEN is required for child workflows');
  }

  const client = new Client({
    baseUrl: env.QSTASH_URL,
    token: env.QSTASH_TOKEN,
  });

  const batchSize = Math.min(5, sitemaps.length);
  const batches: string[][] = [];

  for (let i = 0; i < sitemaps.length; i += batchSize) {
    batches.push(sitemaps.slice(i, i + batchSize));
  }

  const childIds = await context.run('spawn-priority-jr-workflows', async () => {
    const promises = batches.map(async (batch, index) => {
      const childRunId = `${context.workflowRunId}-priority-${index}`;

      await client.trigger({
        url: `${env.NEXT_PUBLIC_APP_URL}/api/workflow/jr-sitemaps`,
        body: {
          trigger: 'child',
          customSitemaps: batch,
          batchIndex: index,
          parentRunId: context.workflowRunId,
          progressWebhook,
          isPriorityBatch: true,
        },
        workflowRunId: childRunId,
        retries: JR_SITEMAPS_CONFIG.maxRetries,
      });

      return childRunId;
    });

    return await Promise.all(promises);
  });

  return { results: [], childIds };
}

async function processRegularJrSitemaps(
  context: WorkflowContext<JrSitemapsWorkflowPayload>,
  sitemaps: string[],
  progressWebhook?: string,
): Promise<{ results: JrSitemapResult[]; childIds: string[] }> {
  if (sitemaps.length <= JR_SITEMAPS_CONFIG.sitemapsPerStep) {
    const results = await context.run('process-regular-jr-direct', async () => {
      const batchResults: JrSitemapResult[] = [];
      for (const url of sitemaps) {
        const result = await processSingleJrSitemap(
          url,
          progressWebhook,
          context.workflowRunId,
          false,
        );
        batchResults.push(result);
      }
      return batchResults;
    });

    return { results, childIds: [] };
  }

  // Use child workflows for larger batches
  if (!env.QSTASH_TOKEN) {
    throw new Error('QSTASH_TOKEN is required for child workflows');
  }

  const client = new Client({
    baseUrl: env.QSTASH_URL,
    token: env.QSTASH_TOKEN,
  });

  const batchSize = Math.ceil(sitemaps.length / JR_SITEMAPS_CONFIG.maxChildWorkflows);
  const batches: string[][] = [];

  for (let i = 0; i < sitemaps.length; i += batchSize) {
    batches.push(sitemaps.slice(i, i + batchSize));
  }

  const childIds = await context.run('spawn-regular-jr-workflows', async () => {
    const promises = batches.map(async (batch, index) => {
      const childRunId = `${context.workflowRunId}-regular-${index}`;

      await client.trigger({
        url: `${env.NEXT_PUBLIC_APP_URL}/api/workflow/jr-sitemaps`,
        body: {
          trigger: 'child',
          customSitemaps: batch,
          batchIndex: index,
          parentRunId: context.workflowRunId,
          progressWebhook,
          isPriorityBatch: false,
        },
        workflowRunId: childRunId,
        retries: JR_SITEMAPS_CONFIG.maxRetries,
      });

      return childRunId;
    });

    return await Promise.all(promises);
  });

  return { results: [], childIds };
}

async function sendJrSitemapsCompletionWebhook(
  context: WorkflowContext<JrSitemapsWorkflowPayload>,
  webhook: string,
  stats: JrSitemapsProcessingStats,
): Promise<void> {
  await context.run('send-jr-completion-webhook', async () => {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workflowRunId: context.workflowRunId,
        status: 'completed',
        stats,
      }),
    }).catch((error) => {
      console.error('Failed to send JR-Sitemaps completion webhook', { error });
    });
  });
}

function createEmptyJrSitemapsStats(
  errors: JrSitemapsErrorDetail[],
  warnings: string[],
  startTime: number,
): JrSitemapsProcessingStats {
  return {
    totalSitemapsProcessed: 0,
    totalUrlsFound: 0,
    totalUrlsInserted: 0,
    totalUrlsUpdated: 0,
    skippedDueToDuplicates: 0,
    prioritySitemapsProcessed: 0,
    failedSitemaps: [],
    errors,
    warnings,
    processingTimeMs: Date.now() - startTime,
  };
}

function createFinalJrSitemapsStats(
  results: JrSitemapResult[],
  errors: JrSitemapsErrorDetail[],
  warnings: string[],
  startTime: number,
  childWorkflowIds: string[],
  priorityCount: number,
): JrSitemapsProcessingStats {
  let totalUrlsFound = 0;
  let totalUrlsInserted = 0;
  let totalUrlsUpdated = 0;
  let totalSkipped = 0;
  const failedSitemaps: string[] = [];

  results.forEach((result) => {
    totalUrlsFound += result.urlsProcessed;
    totalUrlsInserted += result.inserted;
    totalUrlsUpdated += result.updated;
    totalSkipped += result.skipped;

    if (!result.success) {
      failedSitemaps.push(result.url);
      if (result.error) {
        errors.push({
          url: result.url,
          error: result.error,
          timestamp: new Date().toISOString(),
        });
      }
    }
  });

  return {
    totalSitemapsProcessed: results.filter((r) => r.success).length,
    totalUrlsFound,
    totalUrlsInserted,
    totalUrlsUpdated,
    skippedDueToDuplicates: totalSkipped,
    prioritySitemapsProcessed: priorityCount,
    failedSitemaps,
    errors,
    warnings,
    processingTimeMs: Date.now() - startTime,
    childWorkflowIds,
  };
}
