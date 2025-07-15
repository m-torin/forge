/**
 * Node Fetch provider - Server-side provider using Node.js fetch
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
function createIdRegex(id: string, attribute?: string): RegExp {
  const escapedId = escapeRegex(id);
  if (attribute === 'text' || !attribute) {
    // eslint-disable-next-line security/detect-non-literal-regexp
    return new RegExp(`<[^>]*id=["']${escapedId}["'][^>]*>([^<]*)<`, 'gi');
  } else {
    // eslint-disable-next-line security/detect-non-literal-regexp
    return new RegExp(`<[^>]*id=["']${escapedId}["'][^>]*${attribute}=["']([^"']*?)["']`, 'gi');
  }
}

// Utility function to create safe regex patterns for class selectors
function createClassRegex(className: string, attribute?: string): RegExp {
  const escapedClassName = escapeRegex(className);
  if (attribute === 'text' || !attribute) {
    // eslint-disable-next-line security/detect-non-literal-regexp
    return new RegExp(`<[^>]*class=["'][^"']*${escapedClassName}[^"']*["'][^>]*>([^<]*)<`, 'gi');
  } else {
    // eslint-disable-next-line security/detect-non-literal-regexp
    return new RegExp(
      `<[^>]*class=["'][^"']*${escapedClassName}[^"']*["'][^>]*${attribute}=["']([^"']*?)["']`,
      'gi',
    );
  }
}

// Utility function to create safe regex patterns for tag selectors
function createTagRegex(selector: string, attribute?: string): RegExp {
  const escapedSelector = escapeRegex(selector);
  if (attribute === 'text' || !attribute) {
    // eslint-disable-next-line security/detect-non-literal-regexp
    return new RegExp(`<${escapedSelector}[^>]*>([^<]*)</${escapedSelector}>`, 'gi');
  } else {
    // eslint-disable-next-line security/detect-non-literal-regexp
    return new RegExp(`<${escapedSelector}[^>]*${attribute}=["']([^"']*?)["']`, 'gi');
  }
}

export class NodeFetchProvider implements ScrapingProvider {
  readonly name = 'node-fetch';
  readonly type = 'html' as const;

  async initialize(_config: ProviderConfig): Promise<void> {
    // Node.js 18+ has built-in fetch
    if (typeof fetch === 'undefined') {
      throw new Error(
        'Fetch API not available. Node.js 18+ required or install node-fetch polyfill',
      );
    }
  }

  async scrape(url: string, options: ScrapeOptions = {}): Promise<ScrapeResult> {
    const headers: Record<string, string> = {
      'User-Agent': options.userAgent || 'Mozilla/5.0 (compatible; NodeFetchProvider/1.0)',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      ...options.headers,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeout || 30000);

    try {
      const startTime = Date.now();
      const response = await fetch(url, {
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const endTime = Date.now();

      // Basic title extraction
      const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : undefined;

      // Extract data if selectors provided
      let data: any;
      if (options.extract) {
        data = await this.extract(html, options.extract);
      }

      return {
        url,
        html,
        data,
        metadata: {
          title,
          statusCode: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          contentType: response.headers.get('content-type') || undefined,
          contentLength: parseInt(response.headers.get('content-length') || '0', 10) || html.length,
          timing: {
            start: startTime,
            end: endTime,
            duration: endTime - startTime,
          },
        },
        provider: this.name,
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  async extract(html: string, selectors: SelectorMap): Promise<ExtractedData> {
    const data: ExtractedData = {};

    // Enhanced regex-based extraction for server-side
    for (const [key, config] of Object.entries(selectors)) {
      const selector = typeof config === 'string' ? config : config.selector;
      const attribute = typeof config === 'object' ? config.attribute : undefined;
      const multiple = typeof config === 'object' ? config.multiple : false;

      try {
        if (selector.startsWith('#')) {
          // ID selector
          const id = selector.slice(1);
          const pattern = createIdRegex(id, attribute);

          if (multiple) {
            const matches = Array.from(html.matchAll(pattern));
            data[key] = matches.map((m: any) => m[1].trim());
          } else {
            const match = pattern.exec(html);
            if (match) data[key] = match[1].trim();
          }
        } else if (selector.startsWith('.')) {
          // Class selector
          const className = selector.slice(1);
          const pattern = createClassRegex(className, attribute);

          if (multiple) {
            const matches = Array.from(html.matchAll(pattern));
            data[key] = matches.map((m: any) => m[1].trim());
          } else {
            const match = pattern.exec(html);
            if (match) data[key] = match[1].trim();
          }
        } else {
          // Tag selector
          const pattern = createTagRegex(selector, attribute);

          if (multiple) {
            const matches = Array.from(html.matchAll(pattern));
            data[key] = matches.map((m: any) => m[1].trim());
          } else {
            const match = pattern.exec(html);
            if (match) data[key] = match[1].trim();
          }
        }
      } catch (error) {
        // Re-throw extraction errors so they can be handled upstream
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to extract data for selector "${selector}": ${errorMessage}`);
      }
    }

    return data;
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Health check by testing fetch
      const response = await fetch('data:text/html,<html></html>');
      return response.ok;
    } catch {
      // Health check failures should return false but not throw
      return false;
    }
  }
}
