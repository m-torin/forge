import { type APIRequestContext, type APIResponse } from "@playwright/test";

/**
 * API Testing utilities for Playwright
 */
export class APITestUtils {
  constructor(private readonly request: APIRequestContext) {}

  /**
   * Make authenticated API request
   */
  async authenticatedRequest(
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
    url: string,
    options?: {
      data?: any;
      headers?: Record<string, string>;
      token?: string;
    },
  ): Promise<APIResponse> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options?.headers,
    };

    if (options?.token) {
      headers.Authorization = `Bearer ${options.token}`;
    }

    const requestOptions: any = { headers };
    if (options?.data) {
      requestOptions.data = options.data;
    }

    switch (method) {
      case "GET":
        return this.request.get(url, requestOptions);
      case "POST":
        return this.request.post(url, requestOptions);
      case "PUT":
        return this.request.put(url, requestOptions);
      case "DELETE":
        return this.request.delete(url, requestOptions);
      case "PATCH":
        return this.request.patch(url, requestOptions);
    }
  }

  /**
   * Test health endpoints
   */
  async checkHealth(endpoint = "/api/health"): Promise<boolean> {
    const response = await this.request.get(endpoint);
    return response.ok();
  }

  /**
   * Get JSON response with type safety
   */
  async getJSON<T>(
    url: string,
    options?: { headers?: Record<string, string> },
  ): Promise<T> {
    const response = await this.request.get(url, options);
    if (!response.ok()) {
      throw new Error(
        `API request failed: ${response.status()} ${response.statusText()}`,
      );
    }
    return response.json();
  }

  /**
   * Post JSON data with type safety
   */
  async postJSON<T>(
    url: string,
    data: any,
    options?: { headers?: Record<string, string> },
  ): Promise<T> {
    const response = await this.request.post(url, {
      data,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
    if (!response.ok()) {
      throw new Error(
        `API request failed: ${response.status()} ${response.statusText()}`,
      );
    }
    return response.json();
  }

  /**
   * Create a mock API response
   */
  async mockResponse(
    page: import("@playwright/test").Page,
    pattern: string | RegExp,
    response: {
      status?: number;
      body?: any;
      headers?: Record<string, string>;
      delay?: number;
    },
  ) {
    await page.route(pattern, async (route) => {
      // Add realistic delay if specified
      if (response.delay) {
        await new Promise((resolve) => setTimeout(resolve, response.delay));
      }

      route.fulfill({
        status: response.status || 200,
        headers: {
          "Content-Type": "application/json",
          ...response.headers,
        },
        body:
          typeof response.body === "string"
            ? response.body
            : JSON.stringify(response.body || {}),
      });
    });
  }
}

/**
 * API Response assertion helpers
 */
export class APIAssertions {
  /**
   * Assert response status
   */
  static assertStatus(response: APIResponse, expectedStatus: number) {
    if (response.status() !== expectedStatus) {
      throw new Error(
        `Expected status ${expectedStatus}, got ${response.status()} ${response.statusText()}`,
      );
    }
  }

  /**
   * Assert response contains JSON with specific shape
   */
  static async assertJSON<T>(
    response: APIResponse,
    validator: (data: T) => boolean,
  ): Promise<T> {
    const data = await response.json();
    if (!validator(data)) {
      throw new Error("Response JSON validation failed");
    }
    return data;
  }

  /**
   * Assert response headers
   */
  static assertHeaders(
    response: APIResponse,
    expectedHeaders: Record<string, string | RegExp>,
  ) {
    for (const [key, value] of Object.entries(expectedHeaders)) {
      const actualValue = response.headers()[key.toLowerCase()];
      if (!actualValue) {
        throw new Error(`Expected header "${key}" not found`);
      }
      if (value instanceof RegExp) {
        // eslint-disable-next-line vitest/no-conditional-tests
        if (!value.test(actualValue)) {
          throw new Error(
            `Header "${key}" value "${actualValue}" does not match pattern ${value}`,
          );
        }
      } else if (actualValue !== value) {
        throw new Error(
          `Header "${key}" expected "${value}", got "${actualValue}"`,
        );
      }
    }
  }
}

/**
 * GraphQL testing utilities
 */
export class GraphQLTestUtils {
  constructor(
    private readonly request: APIRequestContext,
    private readonly endpoint = "/api/graphql",
  ) {}

  /**
   * Execute GraphQL query
   */
  async query<T>(
    query: string,
    variables?: Record<string, any>,
    options?: { headers?: Record<string, string> },
  ): Promise<T> {
    const response = await this.request.post(this.endpoint, {
      data: {
        query,
        variables,
      },
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok()) {
      throw new Error(
        `GraphQL request failed: ${response.status()} ${response.statusText()}`,
      );
    }

    const result = await response.json();
    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    return result.data;
  }

  /**
   * Execute GraphQL mutation
   */
  async mutate<T>(
    mutation: string,
    variables?: Record<string, any>,
    options?: { headers?: Record<string, string> },
  ): Promise<T> {
    return this.query<T>(mutation, variables, options);
  }
}
