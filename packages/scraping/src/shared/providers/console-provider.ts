/**
 * Console provider - Debug/development provider that logs scraping actions
 */

import {
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

  async dispose(): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(`[ConsoleProvider] Disposed`);
  }

  async extract(html: string, selectors: SelectorMap): Promise<ExtractedData> {
    // eslint-disable-next-line no-console
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
    // eslint-disable-next-line no-console
    console.log(`[ConsoleProvider] Health check: OK`);
    return true;
  }

  async initialize(config: ProviderConfig): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(`[ConsoleProvider] Initialized with config: `, config);
  }

  async scrape(url: string, options: ScrapeOptions = {}): Promise<ScrapeResult> {
    // eslint-disable-next-line no-console
    console.log(`[ConsoleProvider] Scraping: ${url}`, options);

    // Simulate scraping delay
    await new Promise((resolve: any) => setTimeout(resolve, 100));

    return {
      html: `<html><head><title>Console Provider - ${url}</title></head><body><h1>Scraped via Console Provider</h1><p>URL: ${url}</p></body></html>`,
      metadata: {
        statusCode: 200,
        timing: { duration: 100, end: Date.now(), start: Date.now() },
        title: `Console Provider - ${url}`,
      },
      provider: this.name,
      url,
    };
  }
}
