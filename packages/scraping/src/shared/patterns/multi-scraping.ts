/**
 * Multi-URL scraping pattern with concurrency control and progress tracking
 * Enhanced from the old package with better error handling and progress reporting
 */

import { ProviderRegistry, ScrapingConfig, SelectorMap } from '../types/scraping-types';
import { humanDelay } from '../utils/helpers';
import { createScrapingManager } from '../utils/scraping-manager';

import { MultiScrapeOptions, MultiScrapeResult } from './types';

/**
 * Scrape multiple URLs with concurrency control and progress tracking
 * Enhanced version of the old scrapeMultiple function
 */
export async function scrapeMultiple(
  urls: string[],
  selectors: SelectorMap,
  options: MultiScrapeOptions = {},
): Promise<MultiScrapeResult[]> {
  const {
    concurrent = 3,
    delayBetween = 0,
    onError,
    onProgress,
    provider = 'auto',
    retries = 3,
    timeout = 30000,
  } = options;

  if (urls.length === 0) {
    return [];
  }

  // Set up providers based on environment
  const providers: ProviderRegistry = {};

  if (typeof window !== 'undefined') {
    // Client environment
    const { FetchProvider } = await import('../../client/providers/fetch-provider');
    providers.fetch = (_config: any) => new FetchProvider();
  } else {
    // Server environment
    const { CheerioProvider } = await import('../../server/providers/cheerio-provider');
    const { PlaywrightProvider } = await import('../../server/providers/playwright-provider');

    providers.cheerio = (_config: any) => new CheerioProvider();
    providers.playwright = (_config: any) => new PlaywrightProvider();
  }

  const config: ScrapingConfig = {
    debug: false,
    providers: {
      [provider === 'auto' ? Object.keys(providers)[0] : provider]: {},
    },
  };

  const results: MultiScrapeResult[] = [];
  const errors: { error: Error; index: number; url: string }[] = [];

  // Process URLs in batches
  for (let i = 0; i < urls.length; i += concurrent) {
    const batch = urls.slice(i, i + concurrent);

    const batchPromises = batch.map(async (url, batchIndex: any) => {
      const globalIndex = i + batchIndex;
      const startTime = Date.now();

      const manager = createScrapingManager(config, providers);

      try {
        await manager.initialize();

        if (onProgress) {
          onProgress(url, globalIndex + 1, urls.length);
        }

        let result;
        let lastError: Error | undefined;

        // Retry logic
        for (let attempt = 0; attempt < retries; attempt++) {
          try {
            result = await manager.scrape(url, {
              extract: selectors,
              timeout,
            });
            break; // Success, exit retry loop
          } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            if (attempt < retries - 1) {
              // Wait before retry
              await humanDelay(1000 * (attempt + 1), 2000 * (attempt + 1));
            }
          }
        }

        if (!result) {
          throw lastError ?? new Error('All retry attempts failed');
        }

        const duration = Date.now() - startTime;

        return {
          data: result?.data,
          duration,
          index: globalIndex,
          url,
        };
      } catch (error) {
        const duration = Date.now() - startTime;
        const scrapeError = error instanceof Error ? error : new Error(String(error));

        errors.push({ error: scrapeError, index: globalIndex, url });

        if (onError) {
          onError(url, scrapeError, globalIndex + 1, urls.length);
        }

        return {
          duration,
          error: scrapeError.message,
          index: globalIndex,
          url,
        };
      } finally {
        await manager.dispose();
      }
    });

    // Wait for the batch to complete
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Add delay between batches if specified
    if (delayBetween > 0 && i + concurrent < urls.length) {
      await humanDelay(delayBetween, delayBetween * 1.2);
    }
  }

  return results;
}

/**
 * Scrape URLs from a list with smart batching
 * Automatically adjusts batch size based on performance
 */
export async function scrapeMultipleSmart(
  urls: string[],
  selectors: SelectorMap,
  options: Omit<MultiScrapeOptions, 'concurrent'> & {
    maxConcurrent?: number;
    minConcurrent?: number;
    targetDuration?: number; // Target duration per batch in ms
  } = {},
): Promise<MultiScrapeResult[]> {
  const {
    maxConcurrent = 10,
    minConcurrent = 1,
    targetDuration = 10000, // 10 seconds per batch
    ...restOptions
  } = options;

  if (urls.length === 0) {
    return [];
  }

  let concurrent = Math.min(3, maxConcurrent); // Start with 3
  const results: MultiScrapeResult[] = [];
  let processed = 0;

  while (processed < urls.length) {
    const batchUrls = urls.slice(processed, processed + concurrent);
    const batchStartTime = Date.now();

    const batchResults = await scrapeMultiple(batchUrls, selectors, {
      ...restOptions,
      concurrent,
    });

    results.push(...batchResults);
    processed += batchUrls.length;

    const batchDuration = Date.now() - batchStartTime;

    // Adjust concurrency based on performance
    if (batchDuration < targetDuration / 2 && concurrent < maxConcurrent) {
      concurrent = Math.min(concurrent + 1, maxConcurrent);
    } else if (batchDuration > targetDuration * 1.5 && concurrent > minConcurrent) {
      concurrent = Math.max(concurrent - 1, minConcurrent);
    }
  }

  return results;
}

/**
 * Scrape multiple URLs with streaming results
 * Yields results as they complete for better memory usage
 */
export async function* scrapeMultipleStream(
  urls: string[],
  selectors: SelectorMap,
  options: MultiScrapeOptions = {},
): AsyncGenerator<MultiScrapeResult, void, unknown> {
  const { concurrent = 3, onError, onProgress, provider = 'auto', timeout = 30000 } = options;

  if (urls.length === 0) {
    return;
  }

  // Set up providers (same logic as scrapeMultiple)
  const providers: ProviderRegistry = {};

  if (typeof window !== 'undefined') {
    const { FetchProvider } = await import('../../client/providers/fetch-provider');
    providers.fetch = (_config: any) => new FetchProvider();
  } else {
    const { CheerioProvider } = await import('../../server/providers/cheerio-provider');
    const { PlaywrightProvider } = await import('../../server/providers/playwright-provider');

    providers.cheerio = (_config: any) => new CheerioProvider();
    providers.playwright = (_config: any) => new PlaywrightProvider();
  }

  const config: ScrapingConfig = {
    debug: false,
    providers: {
      [provider === 'auto' ? Object.keys(providers)[0] : provider]: {},
    },
  };

  // Create a pool of workers
  const workers: Promise<MultiScrapeResult>[] = [];
  let urlIndex = 0;

  const createWorker = async (url: string, index: number): Promise<MultiScrapeResult> => {
    const startTime = Date.now();
    const manager = createScrapingManager(config, providers);

    try {
      await manager.initialize();

      if (onProgress) {
        onProgress(url, index + 1, urls.length);
      }

      const result = await manager.scrape(url, {
        extract: selectors,
        timeout,
      });

      const duration = Date.now() - startTime;

      return {
        data: result?.data,
        duration,
        index,
        url,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const scrapeError = error instanceof Error ? error : new Error(String(error));

      if (onError) {
        onError(url, scrapeError, index + 1, urls.length);
      }

      return {
        duration,
        error: scrapeError.message,
        index,
        url,
      };
    } finally {
      await manager.dispose();
    }
  };

  // Start initial workers
  while (workers.length < concurrent && urlIndex < urls.length) {
    workers.push(createWorker(urls[urlIndex], urlIndex));
    urlIndex++;
  }

  // Process results as they complete
  while (workers.length > 0) {
    const result = await Promise.race(workers);

    // Remove completed worker
    const completedIndex = workers.findIndex(async (worker: any) => {
      const workerResult = await worker;
      return workerResult.url === result.url;
    });

    if (completedIndex !== -1) {
      void workers.splice(completedIndex, 1);
    }

    // Start new worker if more URLs available
    if (urlIndex < urls.length) {
      workers.push(createWorker(urls[urlIndex], urlIndex));
      urlIndex++;
    }

    yield result;
  }
}
