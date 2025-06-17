import { chromium, firefox, webkit, type Browser, type Page } from 'playwright';
import UserAgent from 'user-agents';
import type {
  CamoufoxClient,
  CamoufoxBrowser,
  CamoufoxPage,
  CamoufoxConfig,
  CamoufoxError,
  BrowserEngine,
  BrowserLaunchOptions,
  ScrapingRequest,
  ScrapingResult,
  PageTest,
  TestResult,
  StealthFeatures,
} from './types.js';
import {
  CamoufoxConfigSchema,
  BrowserLaunchOptionsSchema,
  ScrapingRequestSchema,
  ScrapingResultSchema,
  PageTestSchema,
  TestResultSchema,
  StealthFeaturesSchema,
} from './types.js';

export class CamoufoxPlaywrightClient implements CamoufoxClient {
  private browser?: Browser;
  private config: CamoufoxConfig;

  constructor(config: Partial<CamoufoxConfig> = {}) {
    this.config = CamoufoxConfigSchema.parse(config);
  }

  async launch(options?: BrowserLaunchOptions): Promise<CamoufoxBrowser> {
    const launchOptions = options
      ? BrowserLaunchOptionsSchema.parse(options)
      : {
          engine: 'chromium' as const,
          config: this.config,
        });

    const browserType = this.getBrowserType(launchOptions.engine);

    const launchArgs = [
      '--no-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=VizDisplayCompositor',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-background-networking',
      '--disable-background-mode',
      '--disable-component-extensions-with-background-pages',
      ...launchOptions.args,
    ];

    if (launchOptions.config.proxy) {
      launchArgs.push(`--proxy-server=${launchOptions.config.proxy}`);
    }

    this.browser = await browserType.launch({
      headless: launchOptions.config.headless,
      args: launchArgs,
      executablePath: launchOptions.executablePath,
      devtools: launchOptions.devtools,
    });

    return new CamoufoxPlaywrightBrowser(this.browser, launchOptions.config, launchOptions.stealth);
  }

  async scrape(request: ScrapingRequest, options?: BrowserLaunchOptions): Promise<ScrapingResult> {
    const validatedRequest = ScrapingRequestSchema.parse(request);
    const browser = await this.launch(options);
    const startTime = Date.now();

    try {
      const page = await browser.newPage();
      await page.goto(validatedRequest.url);

      // Wait for content if specified
      if (validatedRequest.waitFor) {
        if (typeof validatedRequest.waitFor === 'string') {
          await page.waitForSelector(validatedRequest.waitFor);
        } else if (typeof validatedRequest.waitFor === 'number') {
          await new Promise((resolve) => setTimeout(resolve, validatedRequest.waitFor as number));
        } else if (typeof validatedRequest.waitFor === 'object') {
          if (validatedRequest.waitFor.selector) {
            await page.waitForSelector(validatedRequest.waitFor.selector, {
              timeout: validatedRequest.waitFor.timeout,
            });
          }
          if (validatedRequest.waitFor.networkIdle) {
            await page.waitForLoadState('networkidle');
          }
        }
      }

      // Execute actions
      for (const action of validatedRequest.actions) {
        await this.executeAction(page, action);
      }

      // Extract data
      let extractedData: Record<string, unknown> = {};
      if (validatedRequest.extract) {
        extractedData = await this.extractPageData(page, validatedRequest.extract);
      }

      // Capture artifacts
      let screenshot: string | undefined;
      let pdf: string | undefined;
      let source: string | undefined;

      if (validatedRequest.screenshot) {
        const screenshotBuffer = await page.screenshot({ fullPage: true });
        screenshot = screenshotBuffer.toString('base64');
      }

      if (validatedRequest.pdf) {
        const pdfBuffer = await page.pdf({ format: 'A4' });
        pdf = pdfBuffer.toString('base64');
      }

      if (validatedRequest.source) {
        source = await page.content();
      }

      const loadTime = Date.now() - startTime;
      const title = await page.title();
      const finalUrl = page.url();
      const userAgent = await page.evaluate(() => navigator.userAgent);

      await page.close();
      await browser.close();

      const result: ScrapingResult = {
        id: this.generateId(),
        timestamp: new Date().toISOString(),
        url: validatedRequest.url,
        success: true,
        data: extractedData,
        screenshot,
        pdf,
        source,
        metadata: {
          title,
          loadTime,
          userAgent,
          finalUrl,
        },
        errors: [],
      };

      return ScrapingResultSchema.parse(result);
    } catch (error) {
      await browser.close();
      throw this.handleError(error, validatedRequest.url);
    }
  }

  async test(pageTest: PageTest, options?: BrowserLaunchOptions): Promise<TestResult> {
    const validatedTest = PageTestSchema.parse(pageTest);
    const browser = await this.launch(options);
    const startTime = Date.now();

    try {
      const page = await browser.newPage();
      await page.goto(validatedTest.url);

      const results = [];
      let passed = 0;
      let failed = 0;

      // Execute beforeEach actions
      for (const action of validatedTest.beforeEach) {
        await this.executeBeforeEachAction(page, action);
      }

      // Run tests
      for (const test of validatedTest.tests) {
        const testStart = Date.now();
        try {
          const success = await this.executeTest(page, test);
          const duration = Date.now() - testStart;

          results.push({
            name: test.name,
            passed: success,
            duration,
          });

          if (success) passed++;
          else failed++;
        } catch (error) {
          const duration = Date.now() - testStart;
          results.push({
            name: test.name,
            passed: false,
            duration,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          failed++;
        }
      }

      // Take screenshot of final state
      const screenshotBuffer = await page.screenshot({ fullPage: true });
      const screenshot = screenshotBuffer.toString('base64');

      const totalDuration = Date.now() - startTime;

      await page.close();
      await browser.close();

      const result: TestResult = {
        id: this.generateId(),
        timestamp: new Date().toISOString(),
        url: validatedTest.url,
        results,
        summary: {
          total: validatedTest.tests.length,
          passed,
          failed,
          duration: totalDuration,
        },
        screenshot,
      };

      return TestResultSchema.parse(result);
    } catch (error) {
      await browser.close();
      throw this.handleError(error, validatedTest.url);
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = undefined;
    }
  }

  private getBrowserType(engine: BrowserEngine) {
    switch (engine) {
      case 'firefox':
        return firefox;
      case 'webkit': return webkit,
      default:
        return chromium;
    }
  }

  private async executeAction(page: CamoufoxPage, action: any): Promise<void> {
    switch (action.type) {
      case 'click':
        if (action.selector) {
          await page.click(action.selector, { timeout: action.timeout });
        }
        break;
      case 'type':
        if (action.selector && action.value) {
          await page.type(action.selector, action.value);
        }
        break;
      case 'select':
        if (action.selector && action.value) {
          await page.select(action.selector, action.value);
        }
        break;
      case 'hover':
        if (action.selector) {
          await page.evaluate((sel) => {
            const element = document.querySelector(sel);
            if (element) {
              const event = new MouseEvent('mouseover', { bubbles: true });
              element.dispatchEvent(event);
            }
          }, action.selector);
        }
        break;
      case 'scroll':
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
        break;
      case 'wait':
        if (action.value) {
          await page.waitForSelector(action.value, { timeout: action.timeout });
        } else if (action.timeout) {
          await new Promise((resolve) => setTimeout(resolve, action.timeout));
        }
        break;
      case 'screenshot':
        await page.screenshot({ fullPage: true });
        break;
    }
  }

  private async executeBeforeEachAction(page: CamoufoxPage, action: any): Promise<void> {
    switch (action.type) {
      case 'click':
        if (action.selector) {
          await page.click(action.selector);
        }
        break;
      case 'type':
        if (action.selector && action.value) {
          await page.type(action.selector, action.value);
        }
        break;
      case 'wait':
        if (action.value) {
          await page.waitForSelector(action.value);
        } else {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        break;
      case 'navigate':
        if (action.value) {
          await page.goto(action.value);
        }
        break;
    }
  }

  private async executeTest(page: CamoufoxPage, test: any): Promise<boolean> {
    switch (test.type) {
      case 'element-exists':
        if (test.selector) {
          const element = await page.evaluate((sel) => {
            return document.querySelector(sel) !== null;
          }, test.selector);
          return element;
        }
        return false;

      case 'element-visible':
        if (test.selector) {
          const visible = await page.evaluate((sel) => {
            const element = document.querySelector(sel);
            if (!element) return false;
            const style = window.getComputedStyle(element);
            return style.display !== 'none' && style.visibility !== 'hidden';
          }, test.selector);
          return visible;
        }
        return false;

      case 'text-contains':
        if (test.selector && test.expected) {
          const text = await page.evaluate((sel) => {
            const element = document.querySelector(sel);
            return element ? element.textContent || '' : '',
          }, test.selector);
          return text.includes(test.expected);
        }
        return false;

      case 'attribute-equals':
        if (test.selector && test.expected) {
          const [attr, expectedValue] = test.expected.split('=');
          if (attr && expectedValue) {
            const actualValue = await page.evaluate(
              (sel, attribute) => {
                const element = document.querySelector(sel);
                return element ? element.getAttribute(attribute) : null,
              },
              test.selector,
              attr,
            );
            return actualValue === expectedValue;
          }
        }
        return false;

      default: return true,
    }
  }

  private async extractPageData(
    page: CamoufoxPage,
    extract: any,
  ): Promise<Record<string, unknown>> {
    const data: Record<string, unknown> = {});

    if (extract.selectors) {
      data.selectors = await page.extractData(extract.selectors);
    }

    if (extract.attributes) {
      const attributes: Record<string, string> = {};
      for (const [key, selector] of Object.entries(extract.attributes)) {
        const value = await page.evaluate((sel) => {
          const element = document.querySelector(sel as string);
          return element ? element.getAttribute('value') || element.textContent || '' : '',
        }, selector);
        attributes[key] = value as string;
      }
      data.attributes = attributes;
    }

    if (extract.text) {
      const texts: string[] = [];
      for (const selector of extract.text) {
        const text = await page.evaluate((sel) => {
          const element = document.querySelector(sel);
          return element ? element.textContent || '' : '',
        }, selector);
        texts.push(text);
      }
      data.text = texts;
    }

    if (extract.links) {
      const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]')).map((a) => ({
          text: a.textContent?.trim(),
          href: (a as HTMLAnchorElement).href,
        }));
      });
      data.links = links;
    }

    if (extract.images) {
      const images = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('img[src]')).map((img) => ({
          alt: (img as HTMLImageElement).alt,
          src: (img as HTMLImageElement).src,
        }));
      });
      data.images = images;
    }

    return data;
  }

  private generateId(): string {
    return `camoufox_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleError(error: unknown, url?: string): CamoufoxError {
    const camoufoxError: CamoufoxError = new Error(
      `Camoufox operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );

    if (error instanceof Error) {
      camoufoxError.code = 'CAMOUFOX_ERROR';
      camoufoxError.stack = error.stack;
    }

    if (url) {
      camoufoxError.url = url;
    }

    return camoufoxError;
  }
}

class CamoufoxPlaywrightBrowser implements CamoufoxBrowser {
  constructor(
    private browser: Browser,
    private config: CamoufoxConfig,
    private stealthFeatures?: StealthFeatures,
  ) {}

  async newPage(): Promise<CamoufoxPage> {
    const page = await this.browser.newPage({
      viewport: this.config.viewport,
      locale: this.config.locale,
      timezoneId: this.config.timezone,
      geolocation: this.config.geolocation,
      extraHTTPHeaders: this.config.headers,
    });

    // Set user agent
    const userAgent = this.config.userAgent || new UserAgent().toString();
    await page.setUserAgent(userAgent);

    // Set cookies
    if (this.config.cookies.length > 0) {
      await page.context().addCookies(
        this.config.cookies.map((cookie) => ({
          ...cookie,
          url: `https://${cookie.domain}`,
        })),
      );
    }

    // Apply stealth features
    if (this.config.stealth && this.stealthFeatures) {
      await this.applyStealthFeatures(page, this.stealthFeatures);
    }

    return new CamoufoxPlaywrightPage(page);
  }

  async close(): Promise<void> {
    await this.browser.close();
  }

  isConnected(): boolean {
    return this.browser.isConnected();
  }

  private async applyStealthFeatures(page: Page, features: StealthFeatures): Promise<void> {
    if (features.webdriver) {
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        });
      });
    }

    if (features.navigator) {
      await page.addInitScript(() => {
        // Override navigator.plugins
        Object.defineProperty(navigator, 'plugins', {
          get: () => [1, 2, 3, 4, 5],
        });
      });
    }

    if (features.permissions) {
      await page.addInitScript(() => {
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters) =>
          parameters.name === 'notifications'
            ? Promise.resolve({ state: Notification.permission })
            : originalQuery(parameters),
      });
    }

    if (features.canvas) {
      await page.addInitScript(() => {
        const getImageData = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (contextType, ...args) {
          const context = getImageData.apply(this, [contextType, ...args]);
          if (contextType === '2d') {
            const imageData = context.getImageData;
            context.getImageData = function (...args) {
              const data = imageData.apply(this, args);
              // Add slight noise to canvas fingerprinting
              for (let i = 0; i < data.data.length; i += 4) {
                data.data[i] = data.data[i] + Math.floor(Math.random() * 3) - 1;
              }
              return data;
            };
          }
          return context;
        };
      });
    }
  }
}

class CamoufoxPlaywrightPage implements CamoufoxPage {
  constructor(private page: Page) {}

  async goto(url: string, options?: { waitUntil?: string; timeout?: number }): Promise<void> {
    await this.page.goto(url, {
      waitUntil: (options?.waitUntil as any) || 'domcontentloaded',
      timeout: options?.timeout,
    });
  }

  async waitForSelector(selector: string, options?: { timeout?: number }): Promise<void> {
    await this.page.waitForSelector(selector, options);
  }

  async click(selector: string, options?: { timeout?: number }): Promise<void> {
    await this.page.click(selector, options);
  }

  async type(selector: string, text: string, options?: { delay?: number }): Promise<void> {
    await this.page.type(selector, text, options);
  }

  async select(selector: string, value: string): Promise<void> {
    await this.page.selectOption(selector, value);
  }

  async screenshot(options?: { fullPage?: boolean; quality?: number }): Promise<Buffer> {
    return await this.page.screenshot({
      fullPage: options?.fullPage,
      quality: options?.quality,
    });
  }

  async pdf(options?: { format?: string; margin?: object }): Promise<Buffer> {
    return await this.page.pdf({
      format: (options?.format as any) || 'A4',
      margin: options?.margin,
    });
  }

  async content(): Promise<string> {
    return await this.page.content();
  }

  async evaluate<T>(fn: string | ((...args: any[]) => T), ...args: any[]): Promise<T> {
    return await this.page.evaluate(fn as any, ...args);
  }

  async extractData(selectors: Record<string, string>): Promise<Record<string, string>> {
    const data: Record<string, string> = {});

    for (const [key, selector] of Object.entries(selectors)) {
      try {
        const element = await this.page.$(selector);
        if (element) {
          const text = await element.textContent();
          data[key] = text?.trim() || '';
        } else {
          data[key] = '';
        }
      } catch {
        data[key] = '';
      }
    }

    return data;
  }

  url(): string {
    return this.page.url();
  }

  async title(): Promise<string> {
    return await this.page.title();
  }

  async waitForLoadState(state?: 'load' | 'domcontentloaded' | 'networkidle'): Promise<void> {
    await this.page.waitForLoadState(state || 'domcontentloaded');
  }

  async close(): Promise<void> {
    await this.page.close();
  }
}

export function createCamoufoxClient(config?: Partial<CamoufoxConfig>): CamoufoxClient {
  return new CamoufoxPlaywrightClient(config);
}
