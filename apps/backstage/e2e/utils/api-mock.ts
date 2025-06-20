import { Page, Route } from '@playwright/test';

export interface MockResponse {
  body?: any;
  delay?: number;
  headers?: Record<string, string>;
  status?: number;
}

export interface MockRule {
  method?: string;
  response: MockResponse;
  times?: number; // Number of times to use this mock (infinite if not specified)
  url: string | RegExp;
}

export interface ApiMockOptions {
  baseUrl?: string;
  enabled?: boolean;
  logRequests?: boolean;
}

export class ApiMocker {
  private page: Page;
  private options: ApiMockOptions;
  private rules = new Map<string, MockRule>();
  private requestLog: { url: string; method: string; timestamp: Date }[] = [];
  private usageCount = new Map<string, number>();

  constructor(page: Page, options: ApiMockOptions = {}) {
    this.page = page;
    this.options = {
      enabled: true,
      logRequests: false,
      ...options,
    };

    if (this.options.enabled) {
      this.setupInterception();
    }
  }

  private setupInterception(): void {
    this.page.route('**/*', async (route: Route, request: any) => {
      const url = request.url();
      const method = request.method();

      if (this.options.logRequests) {
        this.requestLog.push({
          url,
          method,
          timestamp: new Date(),
        });
      }

      const matchingRule = this.findMatchingRule(url, method);

      if (matchingRule) {
        await this.handleMockedNextRequest(route, request, matchingRule);
      } else {
        // Continue with original request
        await route.continue();
      }
    });
  }

  private findMatchingRule(url: string, method: string): MockRule | null {
    for (const [key, rule] of this.rules) {
      const urlMatches = this.urlMatches(rule.url, url);
      const methodMatches = !rule.method || rule.method.toLowerCase() === method.toLowerCase();

      if (urlMatches && methodMatches) {
        // Check usage count
        const currentUsage = this.usageCount.get(key) || 0;
        if (!rule.times || currentUsage < rule.times) {
          this.usageCount.set(key, currentUsage + 1);
          return rule;
        }
      }
    }
    return null;
  }

  private urlMatches(pattern: string | RegExp, url: string): boolean {
    if (typeof pattern === 'string') {
      return url.includes(pattern);
    }
    return pattern.test(url);
  }

  private async handleMockedNextRequest(route: Route, request: any, rule: MockRule): Promise<void> {
    const { response } = rule;

    // Add delay if specified
    if (response.delay) {
      await new Promise((resolve: any) => setTimeout(resolve, response.delay));
    }

    const mockResponse = {
      body: typeof response.body === 'string' ? response.body : JSON.stringify(response.body),
      headers: {
        'Content-Type': 'application/json',
        ...response.headers,
      },
      status: response.status || 200,
    };

    await route.fulfill(mockResponse);
  }

  /**
   * Add a mock rule
   */
  mock(
    url: string | RegExp,
    response: MockResponse,
    options?: { method?: string; times?: number },
  ): string {
    const key = `${url.toString()}-${options?.method || 'ANY'}-${Date.now()}`;

    this.rules.set(key, {
      url,
      method: options?.method,
      response,
      times: options?.times,
    });

    return key;
  }

  /**
   * Mock specific endpoint with method and response
   */
  mockEndpoint(
    url: string | RegExp,
    options: { method: string; response: any; status?: number },
  ): string {
    return this.mock(
      url,
      { body: options.response, status: options.status || 200 },
      { method: options.method },
    );
  }

  /**
   * Mock GET requests
   */
  get(url: string | RegExp, response: MockResponse, times?: number): string {
    return this.mock(url, response, { method: 'GET', times });
  }

  /**
   * Mock POST requests
   */
  post(url: string | RegExp, response: MockResponse, times?: number): string {
    return this.mock(url, response, { method: 'POST', times });
  }

  /**
   * Mock PUT requests
   */
  put(url: string | RegExp, response: MockResponse, times?: number): string {
    return this.mock(url, response, { method: 'PUT', times });
  }

  /**
   * Mock DELETE requests
   */
  delete(url: string | RegExp, response: MockResponse, times?: number): string {
    return this.mock(url, response, { method: 'DELETE', times });
  }

  /**
   * Mock API with common error responses
   */
  mockApiError(
    url: string | RegExp,
    errorType: 'unauthorized' | 'forbidden' | 'not-found' | 'server-error',
  ): string {
    const errorResponses = {
      forbidden: {
        body: { error: 'Forbidden', message: 'Access denied' },
        status: 403,
      },
      'not-found': {
        body: { error: 'Not Found', message: 'Resource not found' },
        status: 404,
      },
      'server-error': {
        body: {
          error: 'Internal Server Error',
          message: 'Something went wrong',
        },
        status: 500,
      },
      unauthorized: {
        body: { error: 'Unauthorized', message: 'Authentication required' },
        status: 401,
      },
    };

    return this.mock(url, errorResponses[errorType]);
  }

  /**
   * Get intercepted requests for verification
   */
  getInterceptedRequests(): { url: string; method: string; timestamp: Date }[] {
    return [...this.requestLog];
  }

  /**
   * Remove a specific mock rule
   */
  removeMock(key: string): void {
    this.rules.delete(key);
    this.usageCount.delete(key);
  }

  /**
   * Clear all mock rules
   */
  clearMocks(): void {
    this.rules.clear();
    this.usageCount.clear();
  }

  /**
   * Get request log
   */
  getRequestLog(): { url: string; method: string; timestamp: Date }[] {
    return [...this.requestLog];
  }

  /**
   * Clear request log
   */
  clearRequestLog(): void {
    this.requestLog = [];
  }

  /**
   * Enable/disable mocking
   */
  setEnabled(enabled: boolean): void {
    this.options.enabled = enabled;
  }

  /**
   * Get mock usage statistics
   */
  getUsageStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const [key, count] of this.usageCount) {
      stats[key] = count;
    }
    return stats;
  }
}

/**
 * Create an API mocker for common test scenarios
 */
export async function createApiMocker(page: Page): Promise<ApiMocker> {
  return new ApiMocker(page, { logRequests: true });
}
