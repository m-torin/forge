/**
 * Fetch provider - Client-side provider using browser fetch API
 */

import {
  ExtractedData,
  ProviderConfig,
  ScrapeOptions,
  ScrapeResult,
  ScrapingProvider,
  SelectorMap,
} from '../../shared/types/scraping-types';

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

// Utility function to create safe regex patterns for tag selectors
function createTagRegex(selector: string): RegExp {
  const escapedSelector = escapeRegex(selector);
  // eslint-disable-next-line security/detect-non-literal-regexp
  return new RegExp(`<${escapedSelector}[^>]*>([^<]*)</${escapedSelector}>`, 'i');
}

export class FetchProvider implements ScrapingProvider {
  readonly name = 'fetch';
  readonly type = 'html' as const;

  async extract(html: string, selectors: SelectorMap): Promise<ExtractedData> {
    const data: ExtractedData = {};

    // Simple regex-based extraction for client-side
    for (const [key, config] of Object.entries(selectors)) {
      const selector = typeof config === 'string' ? config : config.selector;

      // Very basic CSS selector to regex conversion
      if (selector.startsWith('#')) {
        const id = selector.slice(1);
        const match = html.match(createIdRegex(id));
        if (match) data[key] = match[1].trim();
      } else if (selector.includes('title')) {
        const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
        if (match) data[key] = match[1].trim();
      } else if (selector.includes('class=')) {
        // Basic class matching
        const match = html.match(createClassRegex(selector));
        if (match) data[key] = match[1].trim();
      } else {
        // Generic tag matching
        const match = html.match(createTagRegex(selector));
        if (match) data[key] = match[1].trim();
      }
    }

    return data;
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Simple health check by trying to fetch a known URL
      const response = await fetch('data:text/html,<html></html>');
      return response.ok;
    } catch {
      return false;
    }
  }

  async initialize(_config: ProviderConfig): Promise<void> {
    // Check if fetch is available
    if (typeof fetch === 'undefined') {
      throw new Error('Fetch API not available in this environment');
    }
  }

  async scrape(url: string, options: ScrapeOptions = {}): Promise<ScrapeResult> {
    const headers: Record<string, string> = {
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'User-Agent': options.userAgent ?? 'Mozilla/5.0 (compatible; FetchProvider/1.0)',
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

      // Extract data if selectors provided
      let data: any;
      if (options.extract) {
        data = await this.extract(html, options.extract);
      }

      return {
        data,
        html,
        metadata: {
          contentType: response.headers.get('content-type') ?? undefined,
          headers: Object.fromEntries(response.headers.entries()),
          statusCode: response.status,
          timing: { duration: 0, end: Date.now(), start: Date.now() },
          title,
        },
        provider: this.name,
        url,
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}
