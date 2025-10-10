/**
 * Cheerio-based scraping provider
 * Fast HTML parsing without browser overhead
 * New implementation for lightweight scraping
 */

import { ScrapingError, ScrapingErrorCode } from '../../shared/errors';
import {
  ProviderConfig,
  ScrapeOptions,
  ScrapeResult,
  ScrapingProvider,
  type ExtractionResult,
  type SelectorMap,
} from '../../shared/types/scraping-types';
import { detectCaptcha, getRandomUserAgent, retryWithBackoff } from '../../shared/utils/helpers';

/**
 * Cheerio scraping provider for fast HTML parsing
 * Uses Node.js fetch + Cheerio for server-side scraping
 */
export class CheerioProvider implements ScrapingProvider {
  readonly name = 'cheerio';
  readonly type = 'html' as const;

  private cheerio?: any;
  private config: {
    timeout?: number;
    userAgent?: string;
    maxRedirects?: number;
    retryAttempts?: number;
    retryDelay?: number;
    headers?: Record<string, string>;
  } = {};

  async initialize(config: ProviderConfig): Promise<void> {
    this.config = {
      timeout: config.timeout || 10000,
      userAgent: getRandomUserAgent(),
      maxRedirects: 5,
      retryAttempts: 3,
      retryDelay: 1000,
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        DNT: '1',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      ...config.options,
    };

    // Load Cheerio
    try {
      this.cheerio = await import('cheerio').catch(() => {
        throw new ScrapingError(
          'Cheerio is not installed. Run: npm install cheerio',
          ScrapingErrorCode.PROVIDER_ERROR,
        );
      });
    } catch (error) {
      throw new ScrapingError(
        'Failed to load Cheerio',
        ScrapingErrorCode.PROVIDER_ERROR,
        undefined,
        error instanceof Error ? error : undefined,
      );
    }
  }

  async scrape(url: string, options: ScrapeOptions = {}): Promise<ScrapeResult> {
    const startTime = Date.now();

    try {
      // Fetch HTML content with retry
      const { html, response } = await retryWithBackoff(
        async () => {
          const fetchOptions = {
            method: 'GET',
            headers: {
              'User-Agent': options.userAgent || this.config.userAgent || 'Mozilla/5.0',
              ...this.config.headers,
              ...options.headers,
            } as HeadersInit,
            redirect: 'follow' as RequestRedirect,
            signal: AbortSignal.timeout(options.timeout || this.config.timeout || 10000),
          };

          const response = await fetch(url, fetchOptions);

          if (!response.ok) {
            throw new ScrapingError(
              `HTTP ${response.status}: ${response.statusText}`,
              ScrapingErrorCode.NETWORK_ERROR,
            );
          }

          const html = await response.text();
          return { html, response };
        },
        {
          attempts: this.config.retryAttempts || 3,
          delay: this.config.retryDelay || 1000,
        },
      );

      // Check for CAPTCHA
      if (detectCaptcha(html)) {
        throw new ScrapingError('CAPTCHA detected on page', ScrapingErrorCode.CAPTCHA_DETECTED);
      }

      // Load HTML into Cheerio
      const $ = this.cheerio.load(html);

      // Extract data if selectors provided
      let data: Record<string, any> | undefined;
      if (options.extract) {
        data = await this.extract(html, options.extract, $);
      }

      // Get page metadata
      const title = $('title').text().trim();
      const description =
        $('meta[name="description"]').attr('content') ||
        $('meta[property="og:description"]').attr('content') ||
        undefined;

      const endTime = Date.now();

      return {
        url,
        html,
        data,
        provider: this.name,
        metadata: {
          title,
          description,
          statusCode: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          timing: {
            start: startTime,
            end: endTime,
            duration: endTime - startTime,
          },
        },
      };
    } catch (error) {
      if (error instanceof ScrapingError) {
        throw error;
      }

      throw new ScrapingError(
        error instanceof Error
          ? (error as Error)?.message || 'Unknown error'
          : 'Unknown error during scraping',
        ScrapingErrorCode.SCRAPING_FAILED,
        { url },
        error instanceof Error ? error : undefined,
      );
    }
  }

  async extract(html: string, selectors: SelectorMap, $?: any): Promise<ExtractionResult> {
    // Use provided Cheerio instance or create new one
    const cheerio = $ || this.cheerio?.load(html);

    if (!cheerio) {
      throw new ScrapingError(
        'Cheerio not available for extraction',
        ScrapingErrorCode.PROVIDER_ERROR,
      );
    }

    const results: ExtractionResult = {};

    for (const [key, configOrSelector] of Object.entries(selectors)) {
      try {
        const config =
          typeof configOrSelector === 'string' ? { selector: configOrSelector } : configOrSelector;

        if (config.multiple) {
          const elements = cheerio(config.selector);
          const values: (string | null)[] = [];

          elements.each((_index: number, element: any) => {
            let value: string | null = null;

            if (config.attribute) {
              value = cheerio(element).attr(config.attribute) || null;
            } else {
              value = cheerio(element).text().trim() || null;
            }

            // Apply transform if provided
            if (config.transform && value !== null) {
              if (typeof config.transform === 'function') {
                value = config.transform(value);
              } else {
                // Handle string transforms
                switch (config.transform) {
                  case 'text':
                    value = cheerio(element).text().trim();
                    break;
                  case 'html':
                    value = cheerio(element).html();
                    break;
                  case 'href':
                    value = cheerio(element).attr('href');
                    break;
                  case 'src':
                    value = cheerio(element).attr('src');
                    break;
                  case 'value':
                    value = cheerio(element).attr('value') || cheerio(element).val();
                    break;
                }
              }
            }

            values.push(value);
          });

          results[key] = values.filter((v): v is string => v !== null);
        } else {
          const element = cheerio(config.selector).first();
          let value: string | null = null;

          if (element.length > 0) {
            if (config.attribute) {
              value = element.attr(config.attribute) || null;
            } else {
              value = element.text().trim() || null;
            }

            // Apply transform if provided
            if (config.transform && value !== null) {
              if (typeof config.transform === 'function') {
                value = config.transform(value);
              } else {
                // Handle string transforms
                switch (config.transform) {
                  case 'text':
                    value = element.text().trim();
                    break;
                  case 'html':
                    value = element.html();
                    break;
                  case 'href':
                    value = element.attr('href');
                    break;
                  case 'src':
                    value = element.attr('src');
                    break;
                  case 'value':
                    value = element.attr('value') || element.val();
                    break;
                }
              }
            }
          }

          results[key] = value;
        }
      } catch (error) {
        // Re-throw extraction errors so they can be handled upstream
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to extract data for key "${key}": ${errorMessage}`);
      }
    }

    return results;
  }

  async healthCheck(): Promise<boolean> {
    // Cheerio is always healthy if loaded
    return !!this.cheerio;
  }

  async dispose(): Promise<void> {
    // Cheerio doesn't require cleanup
    this.cheerio = undefined;
  }

  // Cheerio-specific utility methods
  parseHtml(html: string): any {
    if (!this.cheerio) {
      throw new ScrapingError('Cheerio not initialized', ScrapingErrorCode.PROVIDER_ERROR);
    }
    return this.cheerio.load(html);
  }

  extractLinks(html: string, baseUrl?: string): string[] {
    const $ = this.parseHtml(html);
    const links: string[] = [];

    $('a[href]').each((_index: number, element: any) => {
      const href = $(element).attr('href');
      if (href) {
        try {
          const url = baseUrl ? new URL(href, baseUrl).href : href;
          links.push(url);
        } catch {
          // Skip invalid URLs
        }
      }
    });

    return [...new Set(links)]; // Remove duplicates
  }

  extractImages(
    html: string,
    baseUrl?: string,
  ): Array<{ src: string; alt?: string; title?: string }> {
    const $ = this.parseHtml(html);
    const images: Array<{ src: string; alt?: string; title?: string }> = [];

    $('img[src]').each((_index: number, element: any) => {
      const src = $(element).attr('src');
      if (src) {
        try {
          const fullSrc = baseUrl ? new URL(src, baseUrl).href : src;
          images.push({
            src: fullSrc,
            alt: $(element).attr('alt'),
            title: $(element).attr('title'),
          });
        } catch {
          // Skip invalid URLs
        }
      }
    });

    return images;
  }

  extractMetadata(html: string): Record<string, string> {
    const $ = this.parseHtml(html);
    const metadata: Record<string, string> = {};

    // Extract common meta tags
    $('meta').each((_index: number, element: any) => {
      const name = $(element).attr('name') || $(element).attr('property');
      const content = $(element).attr('content');

      if (name && content) {
        metadata[name] = content;
      }
    });

    // Extract title
    const title = $('title').text().trim();
    if (title) {
      metadata.title = title;
    }

    return metadata;
  }

  getText(html: string, selector?: string): string {
    const $ = this.parseHtml(html);

    if (selector) {
      return $(selector).text().trim();
    }

    // Extract all text content
    return $.text().trim();
  }

  getHtml(html: string, selector?: string): string {
    const $ = this.parseHtml(html);

    if (selector) {
      return $(selector).html() || '';
    }

    return html;
  }
}

/**
 * Factory function to create a Cheerio provider
 */
function createCheerioProvider(_config?: ProviderConfig): CheerioProvider {
  return new CheerioProvider();
}

/**
 * Quick scrape function using Cheerio
 */
async function _scrapeWithCheerio(
  url: string,
  selectors?: SelectorMap,
  options?: ScrapeOptions,
): Promise<ScrapeResult> {
  const provider = createCheerioProvider();

  try {
    await provider.initialize({ options: options || {} });

    const scrapeOptions: ScrapeOptions = {
      ...options,
      extract: selectors,
    };

    return await provider.scrape(url, scrapeOptions);
  } finally {
    await provider.dispose();
  }
}
