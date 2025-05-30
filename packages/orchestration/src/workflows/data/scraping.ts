import { Redis } from '@upstash/redis';
import { serve } from '@upstash/workflow/nextjs';

import {
  errorHandlers,
  withRetryErrorHandling,
  WorkflowErrorType,
} from '../../utils/error-handling';
import {
  chunkArray,
  createErrorMessage,
  extractWithSelectors,
  generateSessionId,
  hashUrl,
  isDevelopment,
  isValidUrl,
} from '../../utils/helpers';
import { devLog } from '../../utils/observability';
import { CircuitBreaker, DomainRateLimiter } from '../../utils/resilience';
import {
  type ScrapingConfig,
  ScrapingConfigSchema,
  type ScrapingResult,
  type WorkflowContext,
} from '../../utils/types';

// Circuit breakers per domain
const circuitBreakers = new Map<string, CircuitBreaker>();

/**
 * Session management helper
 */
async function initializeSession(
  redis: Redis,
  sessionId: string,
  totalUrls: number,
  workflowRunId: string,
): Promise<void> {
  await redis.hset(`session:${sessionId}`, {
    createdAt: Date.now(),
    status: 'initializing',
    totalUrls,
    workflowRunId,
  });
}

/**
 * URL validation and deduplication helper
 */
async function processUrls(
  urls: string[],
  config: ScrapingConfig['config'],
  redis: Redis,
): Promise<string[]> {
  const uniqueUrls = [...new Set(urls)];
  const validated = uniqueUrls.filter(isValidUrl);

  if (!config.enableDeduplication) {
    return validated;
  }

  const deduped: string[] = [];
  for (const url of validated) {
    const exists = await redis.exists(`scraped:${hashUrl(url)}`);
    if (!exists) deduped.push(url);
  }
  return deduped;
}

/**
 * Approval workflow helper
 */
async function handleApprovalFlow(
  context: WorkflowContext<ScrapingConfig>,
  sessionId: string,
  validUrls: string[],
  redis: Redis,
): Promise<void> {
  await context.run('request-approval', async () => {
    await redis.hset(`approval:${sessionId}`, {
      urlCount: validUrls.length,
      requestedAt: Date.now(),
      sessionId,
      workflowRunId: context.workflowRunId,
    });
  });

  const { eventData, timeout } = await context.waitForEvent('scraping-approval', sessionId, {
    timeout: 3600,
  });

  if (timeout || !(eventData as any)?.approved) {
    await context.run('handle-rejection', async () => {
      await redis.hset(`session:${sessionId}`, {
        rejectedAt: Date.now(),
        status: 'rejected',
      });
    });
    throw new Error('Scraping was not approved or timed out');
  }
}

/**
 * Single URL scraping with error handling and retries
 */
async function scrapeUrl(
  context: WorkflowContext<ScrapingConfig>,
  url: string,
  config: ScrapingConfig['config'],
  selectors: ScrapingConfig['selectors'],
  rateLimiter: DomainRateLimiter,
  scrapingApiUrl: string,
  scrapingApiKey: string,
  redis: Redis,
): Promise<{ url: string; data?: unknown; error?: string; success: boolean }> {
  const domain = new URL(url).hostname;

  // Get or create circuit breaker for domain
  if (!circuitBreakers.has(domain)) {
    circuitBreakers.set(
      domain,
      new CircuitBreaker({
        failureThreshold: 5,
        recoveryTimeout: 300000, // 5 minutes
      }),
    );
  }

  const breaker = circuitBreakers.get(domain)!;

  try {
    return await breaker.execute(async () => {
      // Apply rate limiting
      await rateLimiter.waitForDomainSlot(url, config.rateLimitPerMinute);

      // Execute scraping with retries using error handling utilities
      const result = await withRetryErrorHandling(
        async () => {
          if (!scrapingApiKey) {
            throw new Error('Scraping API key not configured');
          }

          const response = await context.call('scrape-url', {
            url: scrapingApiUrl,
            body: {
              url,
              format: 'json',
              render_js: true,
            },
            headers: {
              Authorization: `Bearer ${scrapingApiKey}`,
              'Content-Type': 'application/json',
            },
            method: 'POST',
            timeout: 30000,
          });

          if (response.status !== 200) {
            throw new Error(`Scraping failed with status ${response.status}`);
          }

          return response.body;
        },
        `scraping ${url}`,
        {
          baseDelayMs: 1000,
          maxDelayMs: 60000,
          maxAttempts: 2,
          retryOn: [
            WorkflowErrorType.NETWORK,
            WorkflowErrorType.TIMEOUT,
            WorkflowErrorType.EXTERNAL_API,
            WorkflowErrorType.RATE_LIMIT,
          ] as any,
        },
        { url, domain },
      );

      // Handle scraping results
      const scrapedData = (result as any)?.data || result || {};

      // Extract data using selectors - ensure result is proper type
      const dataToExtract =
        typeof scrapedData === 'object' || typeof scrapedData === 'string' ? scrapedData : {};
      const extracted = extractWithSelectors(dataToExtract, selectors);

      // Cache successful results
      if (config.cacheResults) {
        await redis.setex(
          `scraped:${hashUrl(url)}`,
          3600, // 1 hour cache
          JSON.stringify(extracted),
        );
      }

      return { url, data: extracted, success: true };
    });
  } catch (error) {
    devLog.error(`Failed to scrape ${url}:`, String(error));
    return {
      url,
      error: createErrorMessage('Scraping failed', error),
      success: false,
    };
  }
}

/**
 * Progress update helper
 */
async function updateProgress(
  context: WorkflowContext<ScrapingConfig>,
  sessionId: string,
  batchIndex: number,
  totalBatches: number,
  processedCount: number,
  redis: Redis,
  onProgress?: (sessionId: string, progress: number) => Promise<void>,
): Promise<void> {
  const progress = Math.round(((batchIndex + 1) / totalBatches) * 100);

  await context.run('update-progress', async () => {
    await redis.hset(`session:${sessionId}`, {
      lastUpdated: Date.now(),
      processedUrls: processedCount,
      progress,
    });

    if (onProgress) {
      await onProgress(sessionId, progress);
    }
  });
}

/**
 * Results finalization helper
 */
async function finalizeResults(
  context: WorkflowContext<ScrapingConfig>,
  sessionId: string,
  allResults: { url: string; data?: unknown; error?: string; success: boolean }[],
  totalUrls: number,
  validUrls: string[],
  redis: Redis,
): Promise<ScrapingResult> {
  return await context.run('finalize-results', async () => {
    const successful = allResults.filter((r) => r.success);
    const failed = allResults.filter((r) => !r.success);

    await redis.hset(`session:${sessionId}`, {
      completedAt: Date.now(),
      failureCount: failed.length,
      status: 'completed',
      successCount: successful.length,
    });

    // Store full results
    await redis.setex(
      `results:${sessionId}`,
      86400, // 24 hours
      JSON.stringify(allResults),
    );

    return {
      results: allResults,
      sessionId,
      summary: {
        deduplicated: totalUrls - validUrls.length,
        failed: failed.length,
        processed: allResults.length,
        successful: successful.length,
        total: totalUrls,
      },
    };
  });
}

/**
 * Failure handler with proper logging
 */
async function handleWorkflowFailure(
  context: WorkflowContext<ScrapingConfig>,
  failHeaders: Record<string, string> | undefined,
  failResponse: unknown,
  failStatus: number,
  redis: Redis,
): Promise<void> {
  await redis.lpush(
    'failed-workflows',
    JSON.stringify({
      failHeaders,
      failResponse,
      failStatus,
      timestamp: Date.now(),
      workflowRunId: context.workflowRunId,
    }),
  );

  // Use devLog instead of console.error
  devLog.error('Scraping workflow failed', {
    response: failResponse,
    status: failStatus,
    workflowRunId: context.workflowRunId,
  });
}

/**
 * Create a scraping workflow handler
 */
export function createScrapingWorkflow(options: {
  redis?: Redis;
  scrapingApiUrl?: string;
  scrapingApiKey?: string;
  maxConcurrency?: number;
  onProgress?: (sessionId: string, progress: number) => Promise<void>;
  failureWebhook?: string;
  verbose?: boolean;
}) {
  const {
    failureWebhook,
    maxConcurrency = 5,
    onProgress,
    redis = Redis.fromEnv(),
    scrapingApiKey = process.env.SCRAPING_API_KEY,
    scrapingApiUrl = process.env.SCRAPING_API_URL || 'https://api.scrapfly.io/scrape',
    verbose = isDevelopment(),
  } = options;

  const rateLimiter = new DomainRateLimiter(redis);

  return serve<ScrapingConfig>(
    async (context: WorkflowContext<ScrapingConfig>) => {
      try {
        // Validate payload
        const validatedPayload = ScrapingConfigSchema.parse(context.requestPayload);
        const { urls, config, selectors } = validatedPayload;

        // Step 1: Initialize session
        const sessionId = await context.run('init-session', async () => {
          const id = generateSessionId('scrape');
          await initializeSession(redis, id, urls.length, context.workflowRunId);
          return id;
        });

        // Step 2: Validate and deduplicate URLs
        const validUrls = await context.run('validate-urls', async () => {
          return await processUrls(urls, config, redis);
        });

        // Step 3: Handle approval if required
        if (config.waitForApproval) {
          await handleApprovalFlow(context, sessionId, validUrls, redis);
        }

        // Step 4: Execute scraping with controlled concurrency
        const batches = chunkArray(validUrls, config.maxConcurrency || maxConcurrency);
        const allResults: { url: string; data?: unknown; error?: string; success: boolean }[] = [];

        for (const [batchIndex, batch] of batches.entries()) {
          const batchResults = await context.run('scrape-batch', async () => {
            // Process all URLs in this batch concurrently within a single step
            return await Promise.all(
              batch.map(async (url, _urlIndex) => {
                return await scrapeUrl(
                  context,
                  url,
                  config,
                  selectors,
                  rateLimiter,
                  scrapingApiUrl,
                  scrapingApiKey!,
                  redis,
                );
              }),
            );
          });

          allResults.push(...batchResults);

          // Update progress
          await updateProgress(
            context,
            sessionId,
            batchIndex,
            batches.length,
            allResults.length,
            redis,
            onProgress,
          );

          // Add delay between batches
          if (batchIndex < batches.length - 1) {
            await context.sleep('batch-delay', 2);
          }
        }

        // Step 5: Finalize results
        const finalResult = await finalizeResults(
          context,
          sessionId,
          allResults,
          urls.length,
          validUrls,
          redis,
        );

        return finalResult;
      } catch (error) {
        devLog.error('Workflow execution failed', error);
        throw errorHandlers.handleApiError(error, 'scraping-workflow');
      }
    },
    {
      failureFunction: async ({ context, failHeaders, failResponse, failStatus }) => {
        await handleWorkflowFailure(
          context as any,
          failHeaders as any,
          failResponse,
          failStatus,
          redis,
        );
      },
      failureUrl: failureWebhook,
      flowControl: {
        key: 'main-scraping-workflow',
        parallelism: 5,
        period: '1m',
        rate: 10,
      },
      retries: 2,
      verbose: verbose ? true : undefined,
    },
  );
}
