/**
 * Next.js server utilities for scraping
 */

import { logError } from '@repo/observability/server/next';
import { NextRequest } from 'next/server';

import { createServerScraping } from '../server';
import { ScrapingError, ScrapingErrorCode } from '../shared/errors';
import {
  ScrapeOptions,
  ScrapingConfig,
  ScrapingManager,
  SelectorMap,
} from '../shared/types/scraping-types';

// Utility function to escape regex special characters
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Utility function to create safe regex patterns for ID selectors
function createIdRegex(id: string): RegExp {
  const escapedId = escapeRegex(id);
  // eslint-disable-next-line security/detect-non-literal-regexp
  return new RegExp(`<[^>]*id=["']${escapedId}["'][^>]*>([^<]*)<`, 'i');
}

// Utility function to create safe regex patterns for class selectors
function createClassRegex(selector: string): RegExp {
  const escapedSelector = escapeRegex(selector);
  // eslint-disable-next-line security/detect-non-literal-regexp
  return new RegExp(`<[^>]*${escapedSelector}[^>]*>([^<]*)<`, 'i');
}

// Global manager instance for reuse
let globalManager: null | ScrapingManager = null;

/**
 * Create API route handlers with consistent error handling
 */
export function createScrapingAPI() {
  return {
    extract: withRateLimit(handleExtractRequest, { requests: 50, window: 60000 }),
    multiScrape: withRateLimit(handleMultiScrapeRequest, { requests: 5, window: 60000 }),
    scrape: withRateLimit(handleScrapeRequest, { requests: 30, window: 60000 }),
    status: handleStatusRequest,
  };
}

/**
 * Edge-compatible scraping function for simple use cases
 */
export async function edgeScrape(
  url: string,
  options: ScrapeOptions = {},
): Promise<{ data?: any; html: string; title?: string }> {
  // For edge runtime, use fetch-based scraping
  const headers: Record<string, string> = {
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'User-Agent': options.userAgent ?? 'Mozilla/5.0 (compatible; EdgeScraper/1.0)',
    ...options.headers,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeout ?? 30000);

  try {
    const response = await fetch(url, {
      headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Basic title extraction
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : undefined;

    // Basic extraction if selectors provided
    let data: any;
    if (options.extract) {
      // Simple regex-based extraction for edge runtime
      data = {};
      for (const [key, config] of Object.entries(options.extract)) {
        const selector = typeof config === 'string' ? config : config.selector;

        // Very basic CSS selector to regex conversion
        if (selector.startsWith('#')) {
          const id = selector.slice(1);
          const match = html.match(createIdRegex(id));
          if (match) data[key] = match[1].trim();
        } else if (selector.includes('class=')) {
          // Basic class matching
          const match = html.match(createClassRegex(selector));
          if (match) data[key] = match[1].trim();
        }
      }
    }

    return { data, html, title };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Get or create a global scraping manager instance
 */
export async function getScrapingManager(
  config?: Partial<ScrapingConfig>,
): Promise<ScrapingManager> {
  if (!globalManager) {
    const defaultConfig: ScrapingConfig = {
      debug: false,
      defaults: {
        timeout: 30000,
      },
      providers: {
        console: {},
        'node-fetch': { timeout: 30000 },
      },
      ...config,
    };

    globalManager = await createServerScraping(defaultConfig);

    // Clean up on process exit
    process.on('beforeExit', () => {
      void (async () => {
        if (globalManager) {
          await globalManager.dispose();
          globalManager = null;
        }
      })();
    });
  }

  return globalManager;
}

/**
 * API route handler for HTML extraction
 */
export async function handleExtractNextNextRequest(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const {
      html,
      provider,
      selectors,
    }: { html: string; provider?: string; selectors: SelectorMap } = body;

    if (!html || !selectors) {
      return Response.json({ error: 'HTML and selectors are required' }, { status: 400 });
    }

    const manager = await getScrapingManager();
    const result = await manager.extract(html, selectors, provider);

    return Response.json(result);
  } catch (error) {
    logError('Extract request failed', error instanceof Error ? error : new Error(String(error)));

    if (error instanceof ScrapingError) {
      return Response.json(
        {
          code: error.code,
          details: error.details,
          error: (error as Error)?.message || 'Unknown error',
        },
        { status: 500 },
      );
    }

    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * API route handler for multiple URL scraping with streaming
 */
export async function handleMultiScrapeNextNextRequest(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const {
      concurrent,
      options,
      urls,
    }: { concurrent?: number; options?: ScrapeOptions; urls: string[] } = body;

    if (!urls || !Array.isArray(urls)) {
      return Response.json({ error: 'URLs array is required' }, { status: 400 });
    }

    const manager = await getScrapingManager();

    // Create a ReadableStream for streaming results
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let index = 0;

          for await (const result of manager.scrapeStream(urls, {
            ...options,
            concurrent: concurrent ?? 5,
          })) {
            const data =
              JSON.stringify({
                index,
                result,
                type: 'result',
              }) + '\n';

            controller.enqueue(new TextEncoder().encode(data));
            index++;
          }

          controller.close();
        } catch (error) {
          const errorData =
            JSON.stringify({
              message: (error as Error)?.message || 'Unknown error',
              type: 'error',
            }) + '\n';

          controller.enqueue(new TextEncoder().encode(errorData));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    logError(
      'Multi-scrape request failed',
      error instanceof Error ? error : new Error(String(error)),
    );

    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * API route handler for single URL scraping
 */
export async function handleScrapeNextNextRequest(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const { options, url }: { options?: ScrapeOptions; url: string } = body;

    if (!url) {
      return Response.json({ error: 'URL is required' }, { status: 400 });
    }

    const manager = await getScrapingManager();
    const result = await manager.scrape(url, options);

    return Response.json(result);
  } catch (error) {
    logError('Scrape request failed', error instanceof Error ? error : new Error(String(error)));

    if (error instanceof ScrapingError) {
      return Response.json(
        {
          code: error.code,
          details: error.details,
          error: (error as Error)?.message || 'Unknown error',
        },
        { status: error.code === ScrapingErrorCode.TIMEOUT ? 408 : 500 },
      );
    }

    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * API route handler for scraping status
 */
export async function handleStatusNextNextRequest(): Promise<Response> {
  try {
    const manager = await getScrapingManager();
    const health = await manager.healthCheck();
    const metrics = await manager.getMetrics();

    const status = {
      isActive: Object.values(health).some(Boolean),
      metrics,
      providers: health,
      timestamp: new Date().toISOString(),
    };

    return Response.json(status);
  } catch (error) {
    logError('Status request failed', error instanceof Error ? error : new Error(String(error)));

    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Export aliases for backward compatibility
export const handleExtractRequest = handleExtractNextNextRequest;
export const handleMultiScrapeRequest = handleMultiScrapeNextNextRequest;
export const handleScrapeRequest = handleScrapeNextNextRequest;
export const handleStatusRequest = handleStatusNextNextRequest;

/**
 * Rate limiting middleware for scraping APIs
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<Response>,
  options: {
    keyGenerator?: (request: NextRequest) => string;
    requests: number;
    window: number; // milliseconds
  } = { requests: 10, window: 60000 },
) {
  const requests = new Map<string, number[]>();

  return async (request: NextRequest): Promise<Response> => {
    const key = options.keyGenerator
      ? options.keyGenerator(request)
      : (request.headers.get('x-forwarded-for') ?? 'unknown');

    const now = Date.now();
    const windowStart = now - options.window;

    // Get existing requests for this key
    const userRequests = requests.get(key) ?? [];

    // Filter out old requests
    const recentRequests = userRequests.filter((time: any) => time > windowStart);

    // Check if rate limit exceeded
    if (recentRequests.length >= options.requests) {
      return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Add current request
    recentRequests.push(now);
    requests.set(key, recentRequests);

    // Call the handler
    return handler(request);
  };
}
