import type { Page, Request, Route } from "@playwright/test";

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
    this.page.route("**/*", async (route: Route, request: Request) => {
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
        await this.handleMockedRequest(route, request, matchingRule);
      } else {
        // Continue with original request
        await route.continue();
      }
    });
  }

  private findMatchingRule(url: string, method: string): MockRule | null {
    for (const [key, rule] of this.rules) {
      const urlMatches = this.urlMatches(rule.url, url);
      const methodMatches =
        !rule.method || rule.method.toLowerCase() === method.toLowerCase();

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
    if (typeof pattern === "string") {
      return url.includes(pattern);
    }
    return pattern.test(url);
  }

  private async handleMockedRequest(
    route: Route,
    request: Request,
    rule: MockRule,
  ): Promise<void> {
    const { response } = rule;

    // Add delay if specified
    if (response.delay) {
      await new Promise((resolve) => setTimeout(resolve, response.delay));
    }

    const mockResponse = {
      body:
        typeof response.body === "string"
          ? response.body
          : JSON.stringify(response.body),
      headers: {
        "Content-Type": "application/json",
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
    const key = `${url.toString()}-${options?.method || "ANY"}-${Date.now()}`;

    this.rules.set(key, {
      url,
      method: options?.method,
      response,
      times: options?.times,
    });

    return key;
  }

  /**
   * Mock GET requests
   */
  get(url: string | RegExp, response: MockResponse, times?: number): string {
    return this.mock(url, response, { method: "GET", times });
  }

  /**
   * Mock POST requests
   */
  post(url: string | RegExp, response: MockResponse, times?: number): string {
    return this.mock(url, response, { method: "POST", times });
  }

  /**
   * Mock PUT requests
   */
  put(url: string | RegExp, response: MockResponse, times?: number): string {
    return this.mock(url, response, { method: "PUT", times });
  }

  /**
   * Mock DELETE requests
   */
  delete(url: string | RegExp, response: MockResponse, times?: number): string {
    return this.mock(url, response, { method: "DELETE", times });
  }

  /**
   * Mock API with common error responses
   */
  mockApiError(
    url: string | RegExp,
    errorType: "unauthorized" | "forbidden" | "not-found" | "server-error",
  ): string {
    const errorResponses = {
      forbidden: {
        body: { error: "Forbidden", message: "Access denied" },
        status: 403,
      },
      "not-found": {
        body: { error: "Not Found", message: "Resource not found" },
        status: 404,
      },
      "server-error": {
        body: {
          error: "Internal Server Error",
          message: "Something went wrong",
        },
        status: 500,
      },
      unauthorized: {
        body: { error: "Unauthorized", message: "Authentication required" },
        status: 401,
      },
    };

    return this.mock(url, errorResponses[errorType]);
  }

  /**
   * Mock slow API responses
   */
  mockSlowResponse(
    url: string | RegExp,
    response: MockResponse,
    delay: number,
  ): string {
    return this.mock(url, { ...response, delay });
  }

  /**
   * Mock authentication endpoints
   */
  mockAuth(options?: { loginSuccess?: boolean; signupSuccess?: boolean }) {
    const { loginSuccess = true, signupSuccess = true } = options || {};

    // Mock login
    this.post(
      "/api/auth/sign-in",
      loginSuccess
        ? {
            body: {
              success: true,
              user: { id: "test-user", email: "test@example.com" },
            },
            status: 200,
          }
        : { body: { error: "Invalid credentials" }, status: 401 },
    );

    // Mock signup
    this.post(
      "/api/auth/sign-up",
      signupSuccess
        ? {
            body: {
              success: true,
              user: { id: "test-user", email: "test@example.com" },
            },
            status: 201,
          }
        : { body: { error: "User already exists" }, status: 400 },
    );

    // Mock logout
    this.post("/api/auth/sign-out", { body: { success: true }, status: 200 });

    // Mock session check
    this.get(
      "/api/auth/session",
      loginSuccess
        ? {
            body: { user: { id: "test-user", email: "test@example.com" } },
            status: 200,
          }
        : { body: { error: "Not authenticated" }, status: 401 },
    );
  }

  /**
   * Mock e-commerce endpoints
   */
  mockEcommerce() {
    // Mock product endpoints
    this.get("/api/products", {
      body: {
        products: [
          { id: "1", name: "Test Product 1", price: 99.99 },
          { id: "2", name: "Test Product 2", price: 149.99 },
        ],
        total: 2,
      },
      status: 200,
    });

    this.get(/\/api\/products\/\d+/, {
      body: {
        id: "1",
        name: "Test Product",
        description: "A test product",
        price: 99.99,
      },
      status: 200,
    });

    // Mock cart endpoints
    this.get("/api/cart", {
      body: { items: [], total: 0 },
      status: 200,
    });

    this.post("/api/cart/add", {
      body: { message: "Item added to cart", success: true },
      status: 200,
    });

    // Mock checkout
    this.post("/api/checkout", {
      body: { orderId: "test-order-123", success: true },
      status: 200,
    });
  }

  /**
   * Mock analytics and tracking endpoints
   */
  mockAnalytics() {
    // Mock analytics endpoints to prevent real tracking during tests
    this.post("/api/analytics/track", { body: { success: true }, status: 200 });
    this.post("/api/analytics/page-view", {
      body: { success: true },
      status: 200,
    });
    this.post(/https:\/\/api\.segment\.io\/.*/, { body: {}, status: 200 });
    this.post(/https:\/\/www\.google-analytics\.com\/.*/, {
      body: {},
      status: 200,
    });
  }

  /**
   * Mock external services
   */
  mockExternalServices() {
    // Mock payment provider
    this.post(/https:\/\/api\.stripe\.com\/.*/, {
      body: { id: "test-payment-intent", status: "succeeded" },
      status: 200,
    });

    // Mock image CDN
    this.get(/https:\/\/.*\.cloudinary\.com\/.*/, {
      body: "mock-image-data",
      headers: { "Content-Type": "image/jpeg" },
      status: 200,
    });

    // Mock email service
    this.post(/https:\/\/api\.resend\.com\/.*/, {
      body: { id: "test-email-id" },
      status: 200,
    });
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
export async function createApiMocker(
  page: Page,
  scenario?: "auth" | "ecommerce" | "analytics" | "all",
): Promise<ApiMocker> {
  const mocker = new ApiMocker(page, { logRequests: true });

  switch (scenario) {
    case "auth":
      mocker.mockAuth();
      break;
    case "ecommerce":
      mocker.mockEcommerce();
      break;
    case "analytics":
      mocker.mockAnalytics();
      break;
    case "all":
      mocker.mockAuth();
      mocker.mockEcommerce();
      mocker.mockAnalytics();
      mocker.mockExternalServices();
      break;
  }

  return mocker;
}

/**
 * Helper to mock specific API states
 */
export const mockStates = {
  /**
   * Mock offline/network error state
   */
  offline: (mocker: ApiMocker) => {
    mocker.mock(/.*\/api\/.*/, {
      body: "Network error",
      status: 0, // Network error
    });
  },

  /**
   * Mock loading state with delays
   */
  slow: (mocker: ApiMocker, delay = 3000) => {
    mocker.mock(/.*\/api\/.*/, {
      body: { data: "slow response" },
      delay,
      status: 200,
    });
  },

  /**
   * Mock maintenance mode
   */
  maintenance: (mocker: ApiMocker) => {
    mocker.mock(/.*\/api\/.*/, {
      body: { error: "Service Unavailable", message: "Maintenance mode" },
      status: 503,
    });
  },
};
