import { expect, type BrowserContext, type Page } from "@playwright/test";

/**
 * Common E2E test patterns and utilities
 */

/**
 * Request modification interface
 */
export interface RequestModification {
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  postData?: string;
}

/**
 * Response modification interface
 */
export interface ResponseModification {
  status?: number;
  headers?: Record<string, string>;
  body?: string;
}

/**
 * Network interception handler interface
 */
export interface NetworkInterceptionHandler {
  modifyRequest?: (request: {
    url: string;
    method: string;
    headers: Record<string, string>;
    postData?: string;
  }) => RequestModification;
  modifyResponse?: (response: {
    status: number;
    headers: Record<string, string>;
    body: string;
  }) => ResponseModification;
  delay?: number;
}

/**
 * Network condition configurations
 */
export interface NetworkCondition {
  downloadThroughput?: number;
  uploadThroughput?: number;
  latency?: number;
  offline?: boolean;
}

/**
 * Retry utilities for flaky operations
 */
export class RetryUtils {
  /**
   * Retry an operation with exponential backoff
   */
  static async withBackoff<T>(
    operation: () => Promise<T>,
    options: {
      maxAttempts?: number;
      initialDelay?: number;
      maxDelay?: number;
      factor?: number;
    } = {},
  ): Promise<T> {
    const {
      factor = 2,
      initialDelay = 1000,
      maxAttempts = 3,
      maxDelay = 10000,
    } = options;

    let lastError: Error;
    let delay = initialDelay;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (attempt === maxAttempts) {
          throw lastError;
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(delay * factor, maxDelay);
      }
    }

    throw lastError!;
  }

  /**
   * Poll until condition is met
   */
  static async pollUntil<T>(
    condition: () => Promise<T | null>,
    options: {
      timeout?: number;
      interval?: number;
    } = {},
  ): Promise<T> {
    const { interval = 100, timeout = 30000 } = options;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const result = await condition();
      if (result !== null) {
        return result;
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    throw new Error(`Polling timeout after ${timeout}ms`);
  }
}

/**
 * Network utilities for intercepting and mocking
 */
export class NetworkUtils {
  constructor(private readonly page: Page) {}

  /**
   * Mock API endpoint
   */
  async mockEndpoint(
    pattern: string | RegExp,
    response: {
      status?: number;
      body?: any;
      headers?: Record<string, string>;
    },
  ) {
    await this.page.route(pattern, (route) => {
      route.fulfill({
        body: JSON.stringify(response.body || {}),
        headers: {
          "Content-Type": "application/json",
          ...response.headers,
        },
        status: response.status || 200,
      });
    });
  }

  /**
   * Intercept and log network requests
   */
  async logRequests(filter?: (url: string) => boolean) {
    const requests: {
      url: string;
      method: string;
      headers: Record<string, string>;
      timestamp: number;
    }[] = [];

    this.page.on("request", (request) => {
      if (!filter || filter(request.url())) {
        requests.push({
          url: request.url(),
          headers: request.headers(),
          method: request.method(),
          timestamp: Date.now(),
        });
      }
    });

    return requests;
  }

  /**
   * Wait for specific network idle state
   */
  async waitForNetworkIdle(options: { timeout?: number } = {}) {
    const { timeout = 30000 } = options;

    // Wait for no network activity for 500ms
    // eslint-disable-next-line playwright/no-networkidle
    await this.page.waitForLoadState("networkidle", { timeout });

    // Additional stability check
    await expect(this.page.locator("body")).toBeVisible();
  }

  /**
   * Block resources by type
   */
  async blockResources(types: ("image" | "stylesheet" | "font" | "script")[]) {
    await this.page.route("**/*", (route) => {
      if (types.includes(route.request().resourceType() as any)) {
        route.abort();
      } else {
        route.continue();
      }
    });
  }

  /**
   * Intercept and modify requests/responses
   */
  async interceptRequests(
    pattern: string | RegExp,
    handler: NetworkInterceptionHandler,
  ) {
    await this.page.route(pattern, async (route) => {
      let request = route.request();

      // Modify request if handler provided
      if (handler.modifyRequest) {
        const modifiedRequest = handler.modifyRequest({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          postData: request.postData() || undefined,
        });

        route.continue({
          url: modifiedRequest.url || request.url(),
          method: modifiedRequest.method || request.method(),
          headers: modifiedRequest.headers || request.headers(),
          postData: modifiedRequest.postData || request.postData(),
        });
        return;
      }

      // Continue with original request and potentially modify response
      const response = await route.fetch();

      if (handler.modifyResponse) {
        const body = await response.text();
        const modifiedResponse = handler.modifyResponse({
          status: response.status(),
          headers: response.headers(),
          body,
        });

        // Add delay if specified
        if (handler.delay) {
          await new Promise((resolve) => setTimeout(resolve, handler.delay));
        }

        route.fulfill({
          status: modifiedResponse.status || response.status(),
          headers: modifiedResponse.headers || response.headers(),
          body: modifiedResponse.body || body,
        });
      } else {
        // Add delay if specified
        if (handler.delay) {
          await new Promise((resolve) => setTimeout(resolve, handler.delay));
        }
        route.fulfill({ response });
      }
    });
  }

  /**
   * Mock GraphQL endpoint with operation-specific responses
   */
  async mockGraphQL(endpoint: string, mocks: Record<string, any>) {
    await this.page.route(endpoint, (route) => {
      const postData = route.request().postData();
      if (!postData) {
        route.continue();
        return;
      }

      try {
        const { operationName, query } = JSON.parse(postData);
        const operationKey =
          operationName || this.extractOperationFromQuery(query);

        if (mocks[operationKey]) {
          route.fulfill({
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: mocks[operationKey] }),
          });
        } else {
          route.continue();
        }
      } catch {
        route.continue();
      }
    });
  }

  /**
   * Simulate network conditions (slow 3G, offline, etc.)
   */
  async simulateNetworkConditions(
    condition: "slow3G" | "fast3G" | "offline" | "custom",
    customOptions?: NetworkCondition,
  ): Promise<() => Promise<void>> {
    const conditions: Record<string, NetworkCondition> = {
      slow3G: {
        downloadThroughput: (500 * 1024) / 8,
        uploadThroughput: (500 * 1024) / 8,
        latency: 400,
      },
      fast3G: {
        downloadThroughput: (1.6 * 1024 * 1024) / 8,
        uploadThroughput: (750 * 1024) / 8,
        latency: 150,
      },
      offline: { offline: true },
      custom: customOptions || {},
    };

    const context = this.page.context();
    const selectedCondition = conditions[condition];

    // Set up route handler
    const routeHandler = (route: any) => {
      if (selectedCondition.offline) {
        route.abort();
        return;
      }

      const latency = selectedCondition.latency || 0;

      // Simulate latency with proper cleanup
      if (latency > 0) {
        const timeoutId = setTimeout(() => {
          route.continue();
        }, latency);

        // Store timeout for cleanup
        (route as any).timeoutId = timeoutId;
      } else {
        route.continue();
      }
    };

    await context.route("**/*", routeHandler);

    // Return cleanup function
    return async () => {
      await context.unroute("**/*", routeHandler);
    };
  }

  /**
   * Mock API with realistic delays and error rates
   */
  async mockAPIWithRealism(
    pattern: string | RegExp,
    responses: Array<{
      response: any;
      weight?: number;
      delay?: { min: number; max: number };
      errorRate?: number;
    }>,
  ) {
    await this.page.route(pattern, async (route) => {
      // Calculate weighted random response
      const totalWeight = responses.reduce(
        (sum, r) => sum + (r.weight || 1),
        0,
      );
      let random = Math.random() * totalWeight;

      let selectedResponse = responses[0];
      for (const response of responses) {
        random -= response.weight || 1;
        if (random <= 0) {
          selectedResponse = response;
          break;
        }
      }

      // Check for error simulation
      if (
        selectedResponse.errorRate &&
        Math.random() < selectedResponse.errorRate
      ) {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: "Simulated server error" }),
        });
        return;
      }

      // Add realistic delay
      if (selectedResponse.delay) {
        const delay =
          Math.random() *
            (selectedResponse.delay.max - selectedResponse.delay.min) +
          selectedResponse.delay.min;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      route.fulfill({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedResponse.response),
      });
    });
  }

  /**
   * Extract operation name from GraphQL query string
   */
  private extractOperationFromQuery(query: string): string {
    const match = query.match(/(?:query|mutation|subscription)\s+(\w+)/);
    return match ? match[1] : "unknown";
  }
}

/**
 * Browser context utilities
 */
export class ContextUtils {
  /**
   * Create authenticated context
   */
  static async createAuthenticatedContext(
    browser: any,
    authState: any,
  ): Promise<BrowserContext> {
    const context = await browser.newContext({
      storageState: authState,
    });
    return context;
  }

  /**
   * Create context with custom permissions
   */
  static async createContextWithPermissions(
    browser: any,
    permissions: string[],
  ): Promise<BrowserContext> {
    const context = await browser.newContext({
      permissions,
    });
    return context;
  }

  /**
   * Create mobile context
   */
  static async createMobileContext(
    browser: any,
    device: "iPhone 12" | "Pixel 5" | "Galaxy S21",
  ): Promise<BrowserContext> {
    const devices = {
      "Galaxy S21": {
        deviceScaleFactor: 3,
        hasTouch: true,
        isMobile: true,
        userAgent: "Mozilla/5.0 (Linux; Android 11; Samsung Galaxy S21)",
        viewport: { width: 360, height: 800 },
      },
      "iPhone 12": {
        deviceScaleFactor: 3,
        hasTouch: true,
        isMobile: true,
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
        viewport: { width: 390, height: 844 },
      },
      "Pixel 5": {
        deviceScaleFactor: 2.75,
        hasTouch: true,
        isMobile: true,
        userAgent: "Mozilla/5.0 (Linux; Android 11; Pixel 5)",
        viewport: { width: 393, height: 851 },
      },
    };

    return browser.newContext(devices[device]);
  }
}

/**
 * Performance testing utilities
 */
export class PerformanceUtils {
  constructor(private readonly page: Page) {}

  /**
   * Measure page load performance
   */
  async measurePageLoad() {
    const metrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded:
          navigation.domContentLoadedEventEnd -
          navigation.domContentLoadedEventStart,
        firstContentfulPaint:
          performance.getEntriesByName("first-contentful-paint")[0]
            ?.startTime || 0,
        firstPaint:
          performance.getEntriesByName("first-paint")[0]?.startTime || 0,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      };
    });
    return metrics;
  }

  /**
   * Measure Core Web Vitals for real user experience metrics
   */
  async measureWebVitals() {
    return this.page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals: Record<string, number> = {};
        let vitalsCollected = 0;
        const expectedVitals = 3; // LCP, FID, CLS

        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === "largest-contentful-paint") {
              vitals.lcp = entry.startTime;
              vitalsCollected++;
            }
            if (entry.entryType === "first-input") {
              vitals.fid = (entry as any).processingStart - entry.startTime;
              vitalsCollected++;
            }
            if (
              entry.entryType === "layout-shift" &&
              !(entry as any).hadRecentInput
            ) {
              vitals.cls = (vitals.cls || 0) + (entry as any).value;
              if (!vitals.clsReported) {
                vitals.clsReported = 1;
                vitalsCollected++;
              }
            }

            if (vitalsCollected >= expectedVitals) {
              observer.disconnect();
              resolve(vitals);
            }
          });
        });

        observer.observe({
          entryTypes: [
            "largest-contentful-paint",
            "first-input",
            "layout-shift",
          ],
        });

        // Fallback timeout to ensure promise resolves
        setTimeout(() => {
          observer.disconnect();
          resolve(vitals);
        }, 10000);
      });
    });
  }

  /**
   * Analyze resource loading performance and bundle sizes
   */
  async analyzeResourceLoading() {
    return this.page.evaluate(() => {
      const resources = performance.getEntriesByType(
        "resource",
      ) as PerformanceResourceTiming[];
      const analysis = {
        totalResources: resources.length,
        totalSize: 0,
        totalDuration: 0,
        slowResources: [] as Array<{
          name: string;
          duration: number;
          size: number;
        }>,
        largeResources: [] as Array<{
          name: string;
          size: number;
          type: string;
        }>,
        resourcesByType: {} as Record<
          string,
          { count: number; totalSize: number }
        >,
      };

      resources.forEach((resource) => {
        const size = resource.transferSize || 0;
        const duration = resource.responseEnd - resource.requestStart;
        const type = resource.initiatorType || "other";
        const name = resource.name.split("/").pop() || resource.name;

        analysis.totalSize += size;
        analysis.totalDuration += duration;

        // Track slow resources (>1s)
        if (duration > 1000) {
          analysis.slowResources.push({ name, duration, size });
        }

        // Track large resources (>500KB)
        if (size > 500000) {
          analysis.largeResources.push({ name, size, type });
        }

        // Group by type
        if (!analysis.resourcesByType[type]) {
          analysis.resourcesByType[type] = { count: 0, totalSize: 0 };
        }
        analysis.resourcesByType[type].count++;
        analysis.resourcesByType[type].totalSize += size;
      });

      return analysis;
    });
  }

  /**
   * Enhanced memory leak detection with time-based tracking
   */
  async detectMemoryLeaks(duration = 30000) {
    const measurements = [];
    const interval = 5000; // Measure every 5 seconds
    const iterations = Math.floor(duration / interval);

    for (let i = 0; i < iterations; i++) {
      const memory = await this.page.evaluate(() => {
        if ("memory" in performance) {
          const mem = (performance as any).memory;
          return {
            usedJSHeapSize: mem.usedJSHeapSize,
            totalJSHeapSize: mem.totalJSHeapSize,
            jsHeapSizeLimit: mem.jsHeapSizeLimit,
            timestamp: Date.now(),
          };
        }
        return null;
      });

      if (memory) {
        measurements.push(memory);
      }

      // Wait between measurements
      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    // Analyze trend
    if (measurements.length < 2) return { hasLeak: false, measurements };

    const first = measurements[0];
    const last = measurements[measurements.length - 1];
    const growth = last.usedJSHeapSize - first.usedJSHeapSize;
    const growthPercentage = (growth / first.usedJSHeapSize) * 100;

    return {
      hasLeak: growthPercentage > 50, // >50% growth indicates potential leak
      growth,
      growthPercentage,
      measurements,
    };
  }

  /**
   * Measure Time to Interactive and other interactivity metrics
   */
  async measureInteractivity() {
    return this.page.evaluate(() => {
      return new Promise((resolve) => {
        const metrics: Record<string, number> = {};

        // Time to Interactive approximation
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.name === "first-contentful-paint") {
              metrics.fcp = entry.startTime;
            }
            if (entry.entryType === "navigation") {
              const nav = entry as PerformanceNavigationTiming;
              metrics.domInteractive = nav.domInteractive;
              metrics.domComplete = nav.domComplete;
            }
          });
        });

        observer.observe({ entryTypes: ["paint", "navigation"] });

        // Measure input responsiveness
        let inputCount = 0;
        let totalInputDelay = 0;

        const inputHandler = (event: Event) => {
          const startTime = performance.now();
          setTimeout(() => {
            inputCount++;
            totalInputDelay += performance.now() - startTime;
            metrics.averageInputDelay = totalInputDelay / inputCount;
          }, 0);
        };

        document.addEventListener("click", inputHandler);
        document.addEventListener("keydown", inputHandler);

        setTimeout(() => {
          observer.disconnect();
          document.removeEventListener("click", inputHandler);
          document.removeEventListener("keydown", inputHandler);
          resolve(metrics);
        }, 5000);
      });
    });
  }

  /**
   * Measure operation duration
   */
  async measureDuration<T>(
    operation: () => Promise<T>,
  ): Promise<{ result: T; duration: number }> {
    const start = Date.now();
    const result = await operation();
    const duration = Date.now() - start;
    return { duration, result };
  }

  /**
   * Check for memory leaks
   */
  async checkMemoryUsage() {
    return this.page.evaluate(() => {
      if ("memory" in performance) {
        return (performance as any).memory;
      }
      return null;
    });
  }
}

/**
 * Multi-tab testing utilities
 */
export class MultiTabUtils {
  constructor(private readonly context: BrowserContext) {}

  /**
   * Open new tab and return page
   */
  async openNewTab(url?: string): Promise<Page> {
    const page = await this.context.newPage();
    if (url) {
      await page.goto(url);
    }
    return page;
  }

  /**
   * Switch between tabs
   */
  async switchToTab(index: number): Promise<Page> {
    const pages = this.context.pages();
    if (index >= 0 && index < pages.length) {
      await pages[index].bringToFront();
      return pages[index];
    }
    throw new Error(`Tab index ${index} out of range`);
  }

  /**
   * Close all tabs except one
   */
  async closeOtherTabs(keepPage: Page) {
    const pages = this.context.pages();
    for (const page of pages) {
      if (page !== keepPage) {
        await page.close();
      }
    }
  }
}

/**
 * File upload/download utilities
 */
export class FileUtils {
  constructor(private readonly page: Page) {}

  /**
   * Upload file
   */
  async uploadFile(selector: string, filePath: string) {
    const fileInput = this.page.locator(selector);
    await fileInput.setInputFiles(filePath);
  }

  /**
   * Download file and return path
   */
  async downloadFile(triggerSelector: string): Promise<string> {
    const [download] = await Promise.all([
      this.page.waitForEvent("download"),
      this.page.click(triggerSelector),
    ]);

    const path = await download.path();
    return path || "";
  }

  /**
   * Wait for download to complete
   */
  async waitForDownload(action: () => Promise<void>) {
    const downloadPromise = this.page.waitForEvent("download");
    await action();
    const download = await downloadPromise;
    await download.saveAs(`./test-downloads/${download.suggestedFilename()}`);
    return download;
  }
}
