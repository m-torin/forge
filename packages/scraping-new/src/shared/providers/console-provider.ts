/**
 * Console provider - Debug/development provider that logs scraping actions
 */

import type {
  ExtractedData,
  ProviderConfig,
  ScrapeOptions,
  ScrapeResult,
  ScrapingProvider,
  SelectorMap,
} from '../types/scraping-types';

export class ConsoleProvider implements ScrapingProvider {
  readonly name = 'console';
  readonly type = 'custom' as const;

  async initialize(config: ProviderConfig): Promise<void> {
    console.log(`[ConsoleProvider] Initialized with config:`, config);
  }

  async scrape(url: string, options: ScrapeOptions = {}): Promise<ScrapeResult> {
    console.log(`[ConsoleProvider] Scraping: ${url}`, options);

    // Simulate scraping delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      provider: this.name,
      url,
      html: `<html><head><title>Console Provider - ${url}</title></head><body><h1>Scraped via Console Provider</h1><p>URL: ${url}</p></body></html>`,
      metadata: {
        statusCode: 200,
        timing: { duration: 100, end: Date.now(), start: Date.now() },
        title: `Console Provider - ${url}`,
      },
    };
  }

  async extract(html: string, selectors: SelectorMap): Promise<ExtractedData> {
    console.log(`[ConsoleProvider] Extracting from HTML (${html.length} chars):`, selectors);

    const data: ExtractedData = {};

    // Simple extraction simulation
    for (const [key, config] of Object.entries(selectors)) {
      const selector = typeof config === 'string' ? config : config.selector;

      // Basic title extraction
      if (selector.includes('title') || key === 'title') {
        const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
        data[key] = titleMatch ? titleMatch[1].trim() : 'No title found';
      } else {
        data[key] = `Extracted: ${selector} (console simulation)`;
      }
    }

    return data;
  }

  async healthCheck(): Promise<boolean> {
    console.log(`[ConsoleProvider] Health check: OK`);
    return true;
  }

  async dispose(): Promise<void> {
    console.log(`[ConsoleProvider] Disposed`);
  }
}
