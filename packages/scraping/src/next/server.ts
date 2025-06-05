/**
 * Next.js server utilities for scraping
 */

import { createServerScraping } from '../server';

import type { ScrapingManager } from '../shared/types/scraping-types';
import type { ScrapeOptions, ScrapingConfig, SelectorMap } from '../shared/types/scraping-types';
import type { NextRequest } from 'next/server';

// Simple error types for Next.js
export class ScrapingError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any,
  ) {
    super(message);
    this.name = 'ScrapingError';
  }
}

export const ScrapingErrorCode = {
  BLOCKED: 'BLOCKED',
  CAPTCHA_DETECTED: 'CAPTCHA_DETECTED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  PROVIDER_ERROR: 'PROVIDER_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  TIMEOUT: 'TIMEOUT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

// Global manager instance for reuse
let globalManager: ScrapingManager | null = null;

/**
 * Get or create a global scraping manager instance
 */
export async function getScrapingManager(
  config?: Partial<ScrapingConfig>,
): Promise<ScrapingManager> {
  if (!globalManager) {
    const defaultConfig: ScrapingConfig = {
      providers: {
        console: {},
        'node-fetch': { timeout: 30000 },
      },
      debug: false,
      defaults: {
        timeout: 30000,
      },
      ...config,
    };

    globalManager = await createServerScraping(defaultConfig);

    // Clean up on process exit
    process.on('beforeExit', async () => {
      if (globalManager) {
        await globalManager.dispose();
        globalManager = null;
      }
    });
  }

  return globalManager;
}

/**
 * API route handler for single URL scraping
 */
export async function handleScrapeRequest(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const { url, options }: { url: string; options?: ScrapeOptions } = body;

    if (!url) {
      return Response.json({ error: 'URL is required' }, { status: 400 });
    }

    const manager = await getScrapingManager();
    const result = await manager.scrape(url, options);

    return Response.json(result);
  } catch (error) {
    console.error('Scrape request failed:', error);

    if (error instanceof ScrapingError) {
      return Response.json(
        { code: error.code, details: error.details, error: error.message },
        { status: error.code === ScrapingErrorCode.TIMEOUT ? 408 : 500 },
      );
    }

    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * API route handler for HTML extraction
 */
export async function handleExtractRequest(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const {
      provider,
      html,
      selectors,
    }: {
      html: string;
      selectors: SelectorMap;
      provider?: string;
    } = body;

    if (!html || !selectors) {
      return Response.json({ error: 'HTML and selectors are required' }, { status: 400 });
    }

    const manager = await getScrapingManager();
    const result = await manager.extract(html, selectors, provider);

    return Response.json(result);
  } catch (error) {
    console.error('Extract request failed:', error);

    if (error instanceof ScrapingError) {
      return Response.json(
        { code: error.code, details: error.details, error: error.message },
        { status: 500 },
      );
    }

    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * API route handler for multiple URL scraping with streaming
 */
export async function handleMultiScrapeRequest(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const {
      urls,
      concurrent,
      options,
    }: {
      urls: string[];
      options?: ScrapeOptions;
      concurrent?: number;
    } = body;

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
            concurrent: concurrent || 5,
          })) {
            const data =
              JSON.stringify({
                type: 'result',
                index,
                result,
              }) + '\n';

            controller.enqueue(new TextEncoder().encode(data));
            index++;
          }

          controller.close();
        } catch (error) {
          const errorData =
            JSON.stringify({
              type: 'error',
              message: (error as Error).message,
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
    console.error('Multi-scrape request failed:', error);

    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * API route handler for scraping status
 */
export async function handleStatusRequest(): Promise<Response> {
  try {
    const manager = await getScrapingManager();
    const health = await manager.healthCheck();
    const metrics = await manager.getMetrics();

    const status = {
      providers: health,
      isActive: Object.values(health).some(Boolean),
      metrics,
      timestamp: new Date().toISOString(),
    };

    return Response.json(status);
  } catch (error) {
    console.error('Status request failed:', error);

    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Edge-compatible scraping function for simple use cases
 */
export async function edgeScrape(
  url: string,
  options: ScrapeOptions = {},
): Promise<{ html: string; data?: any; title?: string }> {
  // For edge runtime, use fetch-based scraping
  const headers: Record<string, string> = {
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'User-Agent': options.userAgent || 'Mozilla/5.0 (compatible; EdgeScraper/1.0)',
    ...options.headers,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeout || 30000);

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
          const match = html.match(new RegExp(`<[^>]*id=["']${id}["'][^>]*>([^<]*)<`, 'i'));
          if (match) data[key] = match[1].trim();
        } else if (selector.includes('class=')) {
          // Basic class matching
          const match = html.match(new RegExp(`<[^>]*${selector}[^>]*>([^<]*)<`, 'i'));
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
 * Rate limiting middleware for scraping APIs
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<Response>,
  options: {
    requests: number;
    window: number; // milliseconds
    keyGenerator?: (request: NextRequest) => string;
  } = { requests: 10, window: 60000 },
) {
  const requests = new Map<string, number[]>();

  return async (request: NextRequest): Promise<Response> => {
    const key = options.keyGenerator
      ? options.keyGenerator(request)
      : request.headers.get('x-forwarded-for') || 'unknown';

    const now = Date.now();
    const windowStart = now - options.window;

    // Get existing requests for this key
    const userRequests = requests.get(key) || [];

    // Filter out old requests
    const recentRequests = userRequests.filter((time) => time > windowStart);

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
