/**
 * Quick scrape pattern for simple, one-off scraping tasks
 * Migrated and enhanced from the old package
 */

import { ScrapingError, ScrapingErrorCode } from '../errors';
import { ProviderRegistry, ScrapingConfig, SelectorMap } from '../types/scraping-types';
import { retryWithBackoff } from '../utils/helpers';
import { createScrapingManager } from '../utils/scraping-manager';

import { QuickScrapeOptions } from './types';

/**
 * Quick extract function for extracting data from existing HTML
 */
export async function extractFromHtml(
  html: string,
  selectors: SelectorMap,
): Promise<Record<string, any>> {
  // Use Cheerio for HTML parsing if available
  try {
    const { CheerioProvider } = await import('../../server/providers/cheerio-provider');
    const provider = new CheerioProvider();
    await provider.initialize({ options: {} });

    return provider.extract(html, selectors);
  } catch {
    // Fallback to basic extraction if Cheerio provider fails
    return basicHtmlExtraction(html, selectors);
  }
}

/**
 * Quick extract function for extracting data from a URL
 */
export async function extractFromUrl(
  url: string,
  selectors: SelectorMap,
  options: QuickScrapeOptions = {},
): Promise<Record<string, any>> {
  const result = await quickScrape(url, selectors, options);
  return result?.data;
}

/**
 * Quick scrape function for simple use cases
 * Automatically selects the best provider and handles cleanup
 */
export async function quickScrape(
  url: string,
  selectors: SelectorMap,
  options: QuickScrapeOptions = {},
): Promise<{
  data: Record<string, any>;
  metadata?: any;
  screenshot?: Buffer;
  title: string;
}> {
  // Determine provider based on options or use smart defaults
  const provider = options.provider ?? 'auto';

  // Create basic provider registry for quick scraping
  const providers: ProviderRegistry = {};

  // Auto-select provider based on environment
  if (typeof window !== 'undefined') {
    // Client environment
    const { FetchProvider } = await import('../../client/providers/fetch-provider');
    providers.fetch = (_config: any) => new FetchProvider();
  } else {
    // Server environment - import providers dynamically
    const { CheerioProvider } = await import('../../server/providers/cheerio-provider');
    const { PlaywrightProvider } = await import('../../server/providers/playwright-provider');
    const { NodeFetchProvider } = await import('../../server/providers/node-fetch-provider');

    providers.cheerio = (_config: any) => new CheerioProvider();
    providers.playwright = (_config: any) => new PlaywrightProvider();
    providers['node-fetch'] = (_config: any) => new NodeFetchProvider();
  }

  const config: ScrapingConfig = {
    debug: false,
    providers: {
      [provider === 'auto' ? Object.keys(providers)[0] : provider]: {},
    },
  };

  const manager = createScrapingManager(config, providers);

  try {
    await manager.initialize();

    const result = await retryWithBackoff(
      async () => {
        return manager.scrape(url, {
          ...options,
          extract: selectors,
        });
      },
      {
        attempts: options.retries ?? 3,
        delay: 1000,
      },
    );

    return {
      data: result?.data ?? {},
      metadata: result.metadata,
      screenshot: result.screenshot,
      title: result.metadata.title ?? '',
    };
  } catch (error) {
    throw new ScrapingError(
      `Quick scrape failed for ${url}: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error'}`,
      ScrapingErrorCode.SCRAPING_FAILED,
      { options: options, selectors, url },
      error instanceof Error ? error : undefined,
    );
  } finally {
    await manager.dispose();
  }
}

/**
 * Basic HTML extraction fallback
 */
function basicHtmlExtraction(html: string, selectors: SelectorMap): Record<string, any> {
  const result: Record<string, any> = {};

  // This is a simplified implementation
  // In production, this would use a proper HTML parser
  for (const [key, selectorOrConfig] of Object.entries(selectors)) {
    try {
      if (typeof selectorOrConfig === 'string') {
        // Simple text extraction
        result[key] = extractTextFromHtml(html, selectorOrConfig);
      } else {
        // Complex extraction with config
        if (selectorOrConfig.multiple) {
          result[key] = extractMultipleFromHtml(html, selectorOrConfig.selector);
        } else {
          result[key] = extractTextFromHtml(html, selectorOrConfig.selector);
        }
      }
    } catch {
      // For basic extraction fallback, set null on error instead of throwing
      result[key] = null;
    }
  }

  return result;
}

function extractMultipleFromHtml(_html: string, _selector: string): string[] {
  // Basic regex-based extraction (simplified)
  // This would be replaced with proper DOM parsing in production
  return [];
}

function extractTextFromHtml(html: string, selector: string): null | string {
  // Basic regex-based extraction (simplified)
  // This would be replaced with proper DOM parsing in production

  if (selector === 'title') {
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : null;
  }

  // Handle basic HTML tags like h1, h2, p, etc.
  if (/^[a-zA-Z][a-zA-Z0-9]*$/.test(selector)) {
    // Escape the selector to prevent regex injection
    const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Use a safe regex pattern with escaped selector
    const safePattern = `<${escapedSelector}[^>]*>([^<]*)</${escapedSelector}>`;
    // eslint-disable-next-line security/detect-non-literal-regexp
    const tagMatch = html.match(new RegExp(safePattern, 'i'));
    return tagMatch ? tagMatch[1].trim() : null;
  }

  // For other selectors, return null (would need proper parser)
  return null;
}
