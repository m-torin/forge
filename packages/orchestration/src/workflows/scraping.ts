import { Redis } from '@upstash/redis';
import { serve } from '@upstash/workflow/nextjs';

import { ScrapingConfigSchema } from '../types';
import {
  calculateBackoff,
  chunkArray,
  extractWithSelectors,
  generateSessionId,
  hashUrl,
  isValidUrl,
  sleep,
} from '../utils';
import { CircuitBreaker, DomainRateLimiter } from '../utils';

import type { ScrapingConfig, ScrapingResult } from '../types';
import type { WorkflowContext } from '@upstash/workflow';

// Circuit breakers per domain
const circuitBreakers = new Map<string, CircuitBreaker>();

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
    verbose = process.env.NODE_ENV === 'development',
  } = options;

  const rateLimiter = new DomainRateLimiter(redis);

  return serve<ScrapingConfig>(
    async (context: WorkflowContext<ScrapingConfig>) => {
      // Validate payload
      const validatedPayload = ScrapingConfigSchema.parse(context.requestPayload);
      const { urls, config, selectors } = validatedPayload;

      // Step 1: Initialize session
      const sessionId = await context.run('init-session', async () => {
        const id = generateSessionId('scrape');
        await redis.hset(`session:${id}`, {
          createdAt: Date.now(),
          status: 'initializing',
          totalUrls: urls.length,
          workflowRunId: context.workflowRunId,
        });
        return id;
      });

      // Step 2: Validate and deduplicate URLs
      const validUrls = await context.run('validate-urls', async () => {
        const uniqueUrls = [...new Set(urls)];
        const validated = uniqueUrls.filter(isValidUrl);

        if (config.enableDeduplication) {
          const deduped: string[] = [];
          for (const url of validated) {
            const exists = await redis.exists(`scraped:${hashUrl(url)}`);
            if (!exists) deduped.push(url);
          }
          return deduped;
        }

        return validated;
      });

      // Step 3: Handle approval if required
      if (config.waitForApproval) {
        await context.run('request-approval', async () => {
          // Send approval notification
          await redis.hset(`approval:${sessionId}`, {
            urlCount: validUrls.length,
            requestedAt: Date.now(),
            sessionId,
            workflowRunId: context.workflowRunId,
          });
        });

        // Wait for approval (1 hour timeout)
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

      // Step 4: Execute scraping with controlled concurrency
      const batches = chunkArray(validUrls, config.maxConcurrency || maxConcurrency);
      const allResults: { url: string; data?: unknown; error?: string; success: boolean }[] = [];

      for (const [batchIndex, batch] of batches.entries()) {
        const batchResults = await Promise.all(
          batch.map((url, urlIndex) =>
            context.run(`scrape-${batchIndex}-${urlIndex}`, async () => {
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

                  // Execute scraping with retries
                  let result: any;
                  let lastError: any;
                  for (let attempt = 0; attempt < config.retryAttempts; attempt++) {
                    try {
                      if (!scrapingApiKey) {
                        throw new Error('Scraping API key not configured');
                      }

                      const response = await context.call(`scrape-${url}`, {
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

                      result = response.body;
                      break; // Success, exit retry loop
                    } catch (error) {
                      lastError = error;
                      if (attempt < config.retryAttempts - 1) {
                        await sleep(calculateBackoff(attempt));
                      }
                    }
                  }

                  if (!result) {
                    throw lastError || new Error('Scraping failed after retries');
                  }

                  // Extract data using selectors
                  const extracted = extractWithSelectors(result, selectors);

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
                return {
                  url,
                  error: error instanceof Error ? error.message : 'Unknown error',
                  success: false,
                };
              }
            }),
          ),
        );

        allResults.push(...batchResults);

        // Update progress
        const progress = Math.round(((batchIndex + 1) / batches.length) * 100);
        await context.run(`update-progress-${batchIndex}`, async () => {
          await redis.hset(`session:${sessionId}`, {
            lastUpdated: Date.now(),
            processedUrls: allResults.length,
            progress,
          });

          if (onProgress) {
            await onProgress(sessionId, progress);
          }
        });

        // Add delay between batches
        if (batchIndex < batches.length - 1) {
          await context.sleep(`batch-delay-${batchIndex}`, 2);
        }
      }

      // Step 5: Finalize results
      const finalResult = await context.run('finalize-results', async () => {
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

        const result: ScrapingResult = {
          results: allResults,
          sessionId,
          summary: {
            deduplicated: urls.length - validUrls.length,
            failed: failed.length,
            processed: allResults.length,
            successful: successful.length,
            total: urls.length,
          },
        };

        return result;
      });

      return finalResult;
    },
    {
      failureFunction: async ({ context, failHeaders, failResponse, failStatus }) => {
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

        // Log failure details
        console.error('Scraping workflow failed:', {
          response: failResponse,
          status: failStatus,
          workflowRunId: context.workflowRunId,
        });
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
