/**
 * Pagination scraping pattern for multi-page data extraction
 * Enhanced from the old package with better error handling and flexibility
 */

import { ScrapingError, ScrapingErrorCode } from '../errors';
import {
  ProviderRegistry,
  ScrapeOptions,
  ScrapingConfig,
  SelectorMap,
} from '../types/scraping-types';
import { humanDelay, retryWithBackoff } from '../utils/helpers';
import { createScrapingManager } from '../utils/scraping-manager';

import { PaginationOptions, PaginationResult } from './types';

/**
 * Scrape with infinite scroll pagination
 * Requires browser automation
 */
async function _scrapeWithInfiniteScroll(
  url: string,
  selectors: SelectorMap,
  options: ScrapeOptions & {
    loadMoreSelector?: string;
    maxScrolls?: number;
    onScroll?: (scroll: number, data: any) => void;
    scrollDelay?: number;
    stopCondition?: (scroll: number, data: any) => boolean;
  } = {},
): Promise<PaginationResult[]> {
  const {
    loadMoreSelector,
    maxScrolls = 10,
    onScroll,
    provider = 'playwright',
    scrollDelay = 2000,
    stopCondition,
    ...scrapeOptions
  } = options;

  // Only server-side browsers support infinite scroll
  if (typeof window !== 'undefined') {
    throw new ScrapingError(
      'Infinite scroll scraping requires server-side browser automation',
      ScrapingErrorCode.PROVIDER_ERROR,
    );
  }

  const { PlaywrightProvider } = await import('../../server/providers/playwright-provider');

  const providers: ProviderRegistry = {
    playwright: (_config: any) => new PlaywrightProvider(),
  };

  const config: ScrapingConfig = {
    debug: false,
    providers: { [provider]: {} },
  };

  const manager = createScrapingManager(config, providers);
  const results: PaginationResult[] = [];

  try {
    await manager.initialize();

    // Initial page load
    await manager.scrape(url, scrapeOptions);

    for (let scroll = 1; scroll <= maxScrolls; scroll++) {
      try {
        // Scroll to bottom or click load more button
        if (loadMoreSelector) {
          // Click load more button if available
          // Note: This would need to be implemented in the provider
          // await manager.click(loadMoreSelector);
        } else {
          // Scroll to bottom
          // Note: This would need to be implemented in the provider
          // await manager.scrollToBottom();
        }

        // Wait for content to load
        await humanDelay(scrollDelay, scrollDelay * 1.2);

        // Extract data from current state
        const result = await manager.scrape(url, {
          ...scrapeOptions,
          extract: selectors,
        });

        const scrollResult: PaginationResult = {
          data: result?.data ?? {},
          page: scroll,
          url,
        };

        results.push(scrollResult);

        if (onScroll) {
          onScroll(scroll, scrollResult.data);
        }

        // Check stop condition
        if (stopCondition?.(scroll, scrollResult.data)) {
          break;
        }
      } catch (error) {
        throw new ScrapingError(
          `Failed at scroll ${scroll}: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error'}`,
          ScrapingErrorCode.SCRAPING_FAILED,
          { scroll, url },
          error instanceof Error ? error : undefined,
        );
      }
    }

    return results;
  } finally {
    await manager.dispose();
  }
}

/**
 * Scrape with numeric pagination (page=1, page=2, etc.)
 */
async function _scrapeWithNumericPagination(
  baseUrl: string,
  selectors: SelectorMap,
  options: ScrapeOptions & {
    delay?: number;
    maxPages?: number;
    onPageComplete?: (page: number, data: any) => void;
    pageParam?: string;
    startPage?: number;
    stopCondition?: (page: number, data: any) => boolean;
  } = {},
): Promise<PaginationResult[]> {
  const {
    delay = 1000,
    maxPages = 10,
    onPageComplete,
    pageParam = 'page',
    provider = 'auto',
    startPage = 1,
    stopCondition,
    ...scrapeOptions
  } = options;

  // Set up providers
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

  const manager = createScrapingManager(config, providers);
  const results: PaginationResult[] = [];

  try {
    await manager.initialize();

    for (let page = startPage; page <= startPage + maxPages - 1; page++) {
      // Build URL with page parameter
      const url = new URL(baseUrl);
      url.searchParams.set(pageParam, page.toString());
      const pageUrl = url.href;

      try {
        const result = await retryWithBackoff(
          async () => {
            return manager.scrape(pageUrl, {
              ...scrapeOptions,
              extract: selectors,
            });
          },
          { attempts: 3, delay: 1000 },
        );

        const pageResult: PaginationResult = {
          data: result?.data ?? {},
          page,
          url: pageUrl,
        };

        // Check if page has any data (stop if empty)
        const hasData = Object.values(pageResult.data).some(
          (value: any) =>
            value !== null &&
            value !== undefined &&
            (Array.isArray(value) ? value.length > 0 : true),
        );

        if (!hasData) {
          break; // No more data, stop pagination
        }

        results.push(pageResult);

        if (onPageComplete) {
          onPageComplete(page, pageResult.data);
        }

        // Check stop condition
        if (stopCondition?.(page, pageResult.data)) {
          break;
        }

        // Add delay between pages
        if (delay > 0 && page < startPage + maxPages - 1) {
          await humanDelay(delay, delay * 1.2);
        }
      } catch (error) {
        throw new ScrapingError(
          `Failed to scrape page ${page}: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error'}`,
          ScrapingErrorCode.SCRAPING_FAILED,
          { page, url: pageUrl },
          error instanceof Error ? error : undefined,
        );
      }
    }

    return results;
  } finally {
    await manager.dispose();
  }
}

/**
 * Scrape with pagination support
 * Enhanced version with better URL handling and error recovery
 */
export async function scrapeWithPagination(
  startUrl: string,
  selectors: SelectorMap & {
    nextPageSelector?: string;
  },
  options: PaginationOptions & ScrapeOptions = {},
): Promise<PaginationResult[]> {
  const {
    delay = 2000,
    maxPages = 10,
    onPageComplete,
    provider = 'auto',
    stopCondition,
    ...scrapeOptions
  } = options;

  // Set up providers based on environment
  const providers: ProviderRegistry = {};

  if (typeof window !== 'undefined') {
    // Client environment - limited pagination support
    const { FetchProvider } = await import('../../client/providers/fetch-provider');
    providers.fetch = (_config: any) => new FetchProvider();
  } else {
    // Server environment - full browser support needed for pagination
    const { PlaywrightProvider } = await import('../../server/providers/playwright-provider');
    const { PuppeteerProvider } = await import('../../server/providers/puppeteer-provider');
    const { CheerioProvider } = await import('../../server/providers/cheerio-provider');

    providers.playwright = (_config: any) => new PlaywrightProvider();
    providers.puppeteer = (_config: any) => new PuppeteerProvider();
    providers.cheerio = (_config: any) => new CheerioProvider();
  }

  const config: ScrapingConfig = {
    debug: false,
    providers: {
      [provider === 'auto' ? 'playwright' : provider]: {},
    },
  };

  const manager = createScrapingManager(config, providers);
  const results: PaginationResult[] = [];

  try {
    await manager.initialize();

    let currentUrl = startUrl;
    let pageNum = 1;

    while (pageNum <= maxPages) {
      try {
        // Use pageSelectors without nextPageSelector for extraction
        const pageSelectors = { ...selectors };
        delete pageSelectors.nextPageSelector;
        const currentNextPageSelector = selectors.nextPageSelector;

        const result = await retryWithBackoff(
          async () => {
            return manager.scrape(currentUrl, {
              ...scrapeOptions,
              extract: pageSelectors,
            });
          },
          { attempts: 3, delay: 1000 },
        );

        const pageResult: PaginationResult = {
          data: result?.data ?? {},
          page: pageNum,
          url: currentUrl,
        };

        results.push(pageResult);

        if (onPageComplete) {
          onPageComplete(pageNum, pageResult.data);
        }

        // Check stop condition
        if (stopCondition?.(pageNum, pageResult.data)) {
          break;
        }

        // Look for next page link
        if (currentNextPageSelector && pageNum < maxPages) {
          const nextPageUrl = await findNextPageUrl(
            manager,
            currentUrl,
            currentNextPageSelector,
            scrapeOptions,
          );

          if (!nextPageUrl) {
            break; // No more pages
          }

          currentUrl = nextPageUrl;
          pageNum++;

          // Add delay between pages
          if (delay > 0) {
            await humanDelay(delay, delay * 1.2);
          }
        } else {
          break; // No pagination selector or reached max pages
        }
      } catch (error) {
        throw new ScrapingError(
          `Failed to scrape page ${pageNum}: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error'}`,
          ScrapingErrorCode.SCRAPING_FAILED,
          { page: pageNum, url: currentUrl },
          error instanceof Error ? error : undefined,
        );
      }
    }

    return results;
  } finally {
    await manager.dispose();
  }
}

/**
 * Find the next page URL using various strategies
 */
async function findNextPageUrl(
  manager: any,
  currentUrl: string,
  nextPageSelector: string,
  scrapeOptions: ScrapeOptions,
): Promise<null | string> {
  try {
    // Try to extract the next page URL
    const result = await manager.scrape(currentUrl, {
      ...scrapeOptions,
      extract: {
        nextPageUrl: {
          attribute: 'href',
          selector: nextPageSelector,
        },
      },
    });

    const nextPageUrl = result?.data?.nextPageUrl;

    if (!nextPageUrl) {
      return null;
    }

    // Handle relative URLs
    try {
      return new URL(nextPageUrl, currentUrl).href;
    } catch {
      // If URL parsing fails, return as-is
      return nextPageUrl;
    }
  } catch {
    return null;
  }
}
