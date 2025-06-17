import { createCamoufoxClient } from './client.js';
import type {
  CamoufoxClient,
  CamoufoxConfig,
  ScrapingRequest,
  ScrapingResult,
  PageTest,
  TestResult,
  BrowserLaunchOptions,
} from './types.js';

export class CamoufoxServer {
  private client: CamoufoxClient;

  constructor(config?: Partial<CamoufoxConfig>) {
    this.client = createCamoufoxClient(config);
  }

  async scrapeUrl(
    request: ScrapingRequest,
    options?: BrowserLaunchOptions,
  ): Promise<ScrapingResult> {
    return this.client.scrape(request, options);
  }

  async testPage(pageTest: PageTest, options?: BrowserLaunchOptions): Promise<TestResult> {
    return this.client.test(pageTest, options);
  }

  async fetchCode(
    url: string,
    codeSelector?: string,
  ): Promise<{ code: string; language?: string, success: boolean }> {
    const request: ScrapingRequest = {
      url,
      waitFor: codeSelector || 'pre, code, .highlight',
      extract: {
        selectors: {
          code: codeSelector || 'pre code, .highlight code, pre, code',
        },
        attributes: {
          language: '[class*="language-"], [data-lang], [class*="lang-"]',
        },
      },
      source: true,
    };

    try {
      const result = await this.scrapeUrl(request);

      if (result.success && result.data?.selectors) {
        const codeData = result.data.selectors as Record<string, string>;
        const languageData = result.data.attributes as Record<string, string>;

        return {
          code: codeData.code || '',
          language: this.extractLanguage(languageData.language || ''),
          success: true,
        };
      }

      return { code: '', success: false };
    } catch (error) {
      console.error('Failed to fetch code:', error);
      return { code: '', success: false };
    }
  }

  async scrapeMultipleUrls(
    urls: string[],
    baseRequest: Omit<ScrapingRequest, 'url'>,
    options?: BrowserLaunchOptions,
  ): Promise<ScrapingResult[]> {
    const results: ScrapingResult[] = [];

    for (const url of urls) {
      try {
        const request: ScrapingRequest = {
          ...baseRequest,
          url,
        });

        const result = await this.scrapeUrl(request, options);
        results.push(result);

        // Add delay between requests to be respectful
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.warn(`Failed to scrape ${url}:`, error);
        results.push({
          id: `failed_${Date.now()}`,
          timestamp: new Date().toISOString(),
          url,
          success: false,
          metadata: {
            loadTime: 0,
            userAgent: '',
            finalUrl: url,
          },
          errors: [error instanceof Error ? error.message : 'Unknown error'],
        });
      }
    }

    return results;
  }

  async health(): Promise<{ status: 'ok' | 'error', timestamp: string; browser?: string }> {
    try {
      const browser = await this.client.launch({
        engine: 'chromium',
        config: { headless: true },
      });

      await browser.close();

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        browser: 'chromium',
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async close(): Promise<void> {
    await this.client.close();
  }

  private extractLanguage(classString: string): string | undefined {
    if (!classString) return undefined;

    // Extract language from class names like "language-javascript", "lang-js", etc.
    const languageMatch = classString.match(/(?:language-|lang-)([a-zA-Z0-9]+)/);
    if (languageMatch) {
      return this.normalizeLanguage(languageMatch[1]);
    }

    return undefined;
  }

  private normalizeLanguage(lang: string): string {
    const languageMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      rb: 'ruby',
      cs: 'csharp',
      cpp: 'cpp',
      cc: 'cpp',
      cxx: 'cpp',
      h: 'c',
      hpp: 'cpp',
      sh: 'bash',
      zsh: 'bash',
      fish: 'bash',
    });

    return languageMap[lang.toLowerCase()] || lang.toLowerCase();
  }
}

export function createCamoufoxServer(config?: Partial<CamoufoxConfig>): CamoufoxServer {
  return new CamoufoxServer(config);
}
