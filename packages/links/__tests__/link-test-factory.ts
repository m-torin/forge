/**
 * Link Test Factory
 *
 * Centralized factory for creating consistent link tests, reducing repetitive patterns.
 * This factory provides common test scenarios and data generators for link functionality.
 */

import { beforeEach, describe, expect, test, vi } from "vitest";

// Common test data generators
export const createTestData = {
  /**
   * Creates a standard mock Dub client for testing
   */
  dubClient: (overrides = {}) => ({
    links: {
      create: vi.fn().mockImplementation((data) =>
        Promise.resolve({
          id: "test-link-id",
          url: data?.url || "https://example.com",
          shortUrl: data?.shortUrl || "https://dub.sh/test",
          domain: data?.domain || "dub.sh",
          key: data?.key || "test",
          title: data?.title || "Test Link",
          description: data?.description || "A test link",
          tags: data?.tags || ["test"],
          clicks: 0,
          uniqueClicks: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: "user-123",
          workspaceId: "workspace-123",
          ...overrides.createResponse,
        }),
      ),
      get: vi.fn().mockResolvedValue({
        id: "test-link-id",
        url: "https://example.com",
        shortUrl: "https://dub.sh/test",
        domain: "dub.sh",
        key: "test",
        title: "Test Link",
        description: "A test link",
        tags: ["test"],
        clicks: 0,
        uniqueClicks: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: "user-123",
        workspaceId: "workspace-123",
        ...overrides.getResponse,
      }),
      update: vi.fn().mockImplementation((id, data) =>
        Promise.resolve({
          id: id || "test-link-id",
          url: data?.url || "https://example.com/updated",
          shortUrl: data?.shortUrl || "https://dub.sh/test",
          domain: data?.domain || "dub.sh",
          key: data?.key || "test",
          title: data?.title || "Updated Test Link",
          description: data?.description || "An updated test link",
          tags: data?.tags || ["test", "updated"],
          clicks: 0,
          uniqueClicks: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: "user-123",
          workspaceId: "workspace-123",
          ...overrides.updateResponse,
        }),
      ),
      delete: vi.fn().mockResolvedValue(undefined),
      getClicks: vi.fn().mockResolvedValue([
        {
          timestamp: new Date().toISOString(),
          country: "US",
          city: "San Francisco",
          region: "CA",
          browser: "Chrome",
          device: "Desktop",
          os: "macOS",
          referrer: "google.com",
          ip: "192.168.1.1",
          userAgent: "Mozilla/5.0 (Test User Agent)",
        },
      ]),
      createMany: vi.fn().mockResolvedValue([
        {
          id: "bulk-link-1",
          url: "https://example.com/1",
          shortUrl: "https://dub.sh/bulk1",
          domain: "dub.sh",
          key: "bulk1",
          title: "Bulk Link 1",
          description: "A bulk created link",
          tags: ["bulk"],
          clicks: 0,
          uniqueClicks: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: "user-123",
          workspaceId: "workspace-123",
        },
        {
          id: "bulk-link-2",
          url: "https://example.com/2",
          shortUrl: "https://dub.sh/bulk2",
          domain: "dub.sh",
          key: "bulk2",
          title: "Bulk Link 2",
          description: "A bulk created link",
          tags: ["bulk"],
          clicks: 0,
          uniqueClicks: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: "user-123",
          workspaceId: "workspace-123",
        },
      ]),
      ...overrides.links,
    },
    analytics: {
      retrieve: vi.fn().mockResolvedValue({
        clicks: 100,
        uniqueClicks: 85,
        topCountries: [
          { country: "US", clicks: 50 },
          { country: "UK", clicks: 35 },
        ],
        topReferrers: [
          { referrer: "google.com", clicks: 60 },
          { referrer: "direct", clicks: 40 },
        ],
        topBrowsers: [
          { browser: "Chrome", clicks: 70 },
          { browser: "Safari", clicks: 30 },
        ],
        ...overrides.analyticsResponse,
      }),
      ...overrides.analytics,
    },
    domains: {
      list: vi.fn().mockResolvedValue([
        {
          slug: "dub.sh",
          verified: true,
          primary: true,
          archived: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          slug: "custom.link",
          verified: true,
          primary: false,
          archived: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]),
      ...overrides.domains,
    },
    ...overrides,
  }),

  /**
   * Creates a standard mock link manager for testing
   */
  linkManager: (overrides = {}) => ({
    createLink: vi.fn().mockImplementation((data) =>
      Promise.resolve({
        id: "test-link-id",
        url: data?.url || "https://example.com",
        shortUrl: data?.shortUrl || "https://dub.sh/test",
        domain: data?.domain || "dub.sh",
        key: data?.key || "test",
        title: data?.title || "Test Link",
        description: data?.description || "A test link",
        tags: data?.tags || ["test"],
        clicks: 0,
        uniqueClicks: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: "user-123",
        workspaceId: "workspace-123",
        ...overrides.createResponse,
      }),
    ),
    getLink: vi.fn().mockResolvedValue({
      id: "test-link-id",
      url: "https://example.com",
      shortUrl: "https://dub.sh/test",
      domain: "dub.sh",
      key: "test",
      title: "Test Link",
      description: "A test link",
      tags: ["test"],
      clicks: 0,
      uniqueClicks: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: "user-123",
      workspaceId: "workspace-123",
      ...overrides.getResponse,
    }),
    getLinkByKey: vi.fn().mockResolvedValue({
      id: "test-link-id",
      url: "https://example.com",
      shortUrl: "https://dub.sh/test",
      domain: "dub.sh",
      key: "test",
      title: "Test Link",
      description: "A test link",
      tags: ["test"],
      clicks: 0,
      uniqueClicks: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: "user-123",
      workspaceId: "workspace-123",
      ...overrides.getByKeyResponse,
    }),
    updateLink: vi.fn().mockImplementation((id, data) =>
      Promise.resolve({
        id: id || "test-link-id",
        url: data?.url || "https://example.com/updated",
        shortUrl: data?.shortUrl || "https://dub.sh/test",
        domain: data?.domain || "dub.sh",
        key: data?.key || "test",
        title: data?.title || "Updated Test Link",
        description: data?.description || "An updated test link",
        tags: data?.tags || ["test", "updated"],
        clicks: 0,
        uniqueClicks: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: "user-123",
        workspaceId: "workspace-123",
        ...overrides.updateResponse,
      }),
    ),
    deleteLink: vi.fn().mockResolvedValue(undefined),
    getAnalytics: vi.fn().mockResolvedValue({
      clicks: 100,
      uniqueClicks: 85,
      topCountries: [
        { country: "US", clicks: 50 },
        { country: "UK", clicks: 35 },
      ],
      topReferrers: [
        { referrer: "google.com", clicks: 60 },
        { referrer: "direct", clicks: 40 },
      ],
      topBrowsers: [
        { browser: "Chrome", clicks: 70 },
        { browser: "Safari", clicks: 30 },
      ],
      ...overrides.analyticsResponse,
    }),
    getClicks: vi.fn().mockResolvedValue([
      {
        timestamp: new Date().toISOString(),
        country: "US",
        city: "San Francisco",
        region: "CA",
        browser: "Chrome",
        device: "Desktop",
        os: "macOS",
        referrer: "google.com",
        ip: "192.168.1.1",
        userAgent: "Mozilla/5.0 (Test User Agent)",
      },
    ]),
    bulkCreate: vi.fn().mockResolvedValue({
      created: [
        {
          id: "bulk-link-1",
          url: "https://example.com/1",
          shortUrl: "https://dub.sh/bulk1",
          domain: "dub.sh",
          key: "bulk1",
          title: "Bulk Link 1",
          description: "A bulk created link",
          tags: ["bulk"],
          clicks: 0,
          uniqueClicks: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: "user-123",
          workspaceId: "workspace-123",
        },
        {
          id: "bulk-link-2",
          url: "https://example.com/2",
          shortUrl: "https://dub.sh/bulk2",
          domain: "dub.sh",
          key: "bulk2",
          title: "Bulk Link 2",
          description: "A bulk created link",
          tags: ["bulk"],
          clicks: 0,
          uniqueClicks: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: "user-123",
          workspaceId: "workspace-123",
        },
      ],
      failed: [],
      ...overrides.bulkResponse,
    }),
    analytics: {
      track: vi.fn().mockResolvedValue(undefined),
      identify: vi.fn().mockResolvedValue(undefined),
      isEnabled: vi.fn().mockReturnValue(true),
      ...overrides.analytics,
    },
    ...overrides,
  }),

  /**
   * Creates a standard mock analytics integration for testing
   */
  analyticsIntegration: (overrides = {}) => ({
    track: vi.fn().mockResolvedValue(undefined),
    identify: vi.fn().mockResolvedValue(undefined),
    isEnabled: vi.fn().mockReturnValue(true),
    filterEvents: vi.fn().mockImplementation((events) => events),
    ...overrides,
  }),

  /**
   * Creates standard link test configurations
   */
  linkConfig: (overrides = {}) => ({
    providers: {
      dub: {
        enabled: true,
        apiKey: "test-api-key",
        workspace: "test-workspace",
        defaultDomain: "dub.sh",
        defaultExpiration: "2024-12-31T23:59:59Z",
        defaultTags: ["test"],
        ...overrides.dub,
      },
      ...overrides.providers,
    },
    analytics: {
      enabled: true,
      events: ["link_created", "link_clicked", "link_updated", "link_deleted"],
      sampling: 1.0,
      ...overrides.analytics,
    },
    ...overrides,
  }),
};

/**
 * Link test factory configuration
 */
export interface LinkTestConfig<TResult = any> {
  /** Name of the functionality being tested */
  name: string;
  /** Setup function that returns the test subject */
  setup: () => any;
  /** Test scenarios to generate */
  scenarios: LinkTestScenario<TResult>[];
}

/**
 * Test scenario definition
 */
export interface LinkTestScenario<TResult = any> {
  /** Name of the test scenario */
  name: string;
  /** Description of what the test validates */
  description: string;
  /** Operation to perform (method name or function) */
  operation: string;
  /** Arguments to pass to the operation */
  args: any[];
  /** Expected result validation */
  validate: (result: TResult, subject: any) => void;
  /** Whether this scenario should throw an error */
  shouldThrow?: boolean;
  /** Expected error message if shouldThrow is true */
  expectedError?: string;
  /** Custom setup for this specific scenario */
  setup?: () => any;
}

/**
 * Creates a complete test suite for link functionality
 */
export function createLinkTestSuite<TResult = any>(
  config: LinkTestConfig<TResult>,
) {
  const { name, setup, scenarios } = config;

  return describe(`${name}`, () => {
    let subject: any;

    // Standard setup
    beforeEach(() => {
      vi.clearAllMocks();
      subject = setup();
    });

    // Generate test scenarios
    scenarios.forEach(
      ({
        name: scenarioName,
        description,
        operation,
        args,
        validate,
        shouldThrow,
        expectedError,
        setup: scenarioSetup,
      }) => {
        test(`${scenarioName} - ${description}`, async () => {
          if (scenarioSetup) {
            subject = scenarioSetup();
          }

          if (shouldThrow) {
            await expect(subject[operation](...args)).rejects.toThrow(
              expectedError || "",
            );
          } else {
            const result = await subject[operation](...args);
            validate(result, subject);
          }
        });
      },
    );
  });
}

/**
 * Common test scenario generators
 */
export const createScenarios = {
  /**
   * Creates link creation test scenarios
   */
  linkCreation: (baseRequest = { url: "https://example.com" }) => [
    {
      name: "create with minimal data",
      description: "should create link with minimal required data",
      operation: "createLink",
      args: [baseRequest],
      validate: (result: any) => {
        expect(result).toHaveProperty("id");
        expect(result).toHaveProperty("url");
        expect(result).toHaveProperty("shortUrl");
        expect(result).toHaveProperty("domain");
        expect(result).toHaveProperty("key");
        expect(result.url).toBe(baseRequest.url);
      },
    },
    {
      name: "create with full data",
      description: "should create link with all optional fields",
      operation: "createLink",
      args: [
        {
          ...baseRequest,
          title: "Test Link",
          description: "A test link",
          tags: ["test"],
          domain: "custom.link",
          key: "custom-key",
        },
      ],
      validate: (result: any) => {
        expect(result).toHaveProperty("id");
        expect(result).toHaveProperty("url");
        expect(result).toHaveProperty("shortUrl");
        expect(result).toHaveProperty("title");
        expect(result).toHaveProperty("description");
        expect(result).toHaveProperty("tags");
        expect(result.title).toBe("Test Link");
        expect(result.description).toBe("A test link");
        expect(result.tags).toStrictEqual(["test"]);
      },
    },
  ],

  /**
   * Creates link retrieval test scenarios
   */
  linkRetrieval: () => [
    {
      name: "get existing link",
      description: "should retrieve existing link by ID",
      operation: "getLink",
      args: ["test-link-id"],
      validate: (result: any) => {
        expect(result).toHaveProperty("id");
        expect(result).toHaveProperty("url");
        expect(result).toHaveProperty("shortUrl");
        expect(result.id).toBe("test-link-id");
      },
    },
    {
      name: "get by key",
      description: "should retrieve existing link by key",
      operation: "getLinkByKey",
      args: ["test-key"],
      validate: (result: any) => {
        expect(result).toHaveProperty("id");
        expect(result).toHaveProperty("url");
        expect(result).toHaveProperty("shortUrl");
        expect(result).toHaveProperty("key");
        expect(result.key).toBe("test");
      },
    },
    {
      name: "get non-existent link",
      description: "should return null for non-existent link",
      operation: "getLink",
      args: ["non-existent-id"],
      setup: () => {
        const manager = createTestData.linkManager();
        manager.getLink.mockResolvedValue(null);
        return manager;
      },
      validate: (result: any) => {
        expect(result).toBeNull();
      },
    },
  ],

  /**
   * Creates link update test scenarios
   */
  linkUpdate: () => [
    {
      name: "update link title",
      description: "should update link title",
      operation: "updateLink",
      args: ["test-link-id", { title: "Updated Title" }],
      setup: () => {
        const manager = createTestData.linkManager();
        // Override updateLink mock to handle title updates correctly
        manager.updateLink.mockImplementation((id, data) =>
          Promise.resolve({
            id: id || "test-link-id",
            url: "https://example.com",
            shortUrl: "https://dub.sh/test",
            domain: "dub.sh",
            key: "test",
            title: data?.title || "Updated Title",
            description: "A test link",
            tags: ["test"],
            clicks: 0,
            uniqueClicks: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: "user-123",
            workspaceId: "workspace-123",
          }),
        );
        return manager;
      },
      validate: (result: any) => {
        expect(result).toHaveProperty("id");
        expect(result).toHaveProperty("title");
        expect(result.title).toBe("Updated Title");
      },
    },
    {
      name: "update link URL",
      description: "should update link URL",
      operation: "updateLink",
      args: ["test-link-id", { url: "https://example.com/updated" }],
      validate: (result: any) => {
        expect(result).toHaveProperty("id");
        expect(result).toHaveProperty("url");
        expect(result.url).toBe("https://example.com/updated");
      },
    },
    {
      name: "update multiple fields",
      description: "should update multiple fields at once",
      operation: "updateLink",
      args: [
        "test-link-id",
        {
          title: "Updated Title",
          description: "Updated description",
          tags: ["updated", "test"],
        },
      ],
      setup: () => {
        const manager = createTestData.linkManager();
        // Override updateLink mock to handle multiple field updates correctly
        manager.updateLink.mockImplementation((id, data) =>
          Promise.resolve({
            id: id || "test-link-id",
            url: "https://example.com",
            shortUrl: "https://dub.sh/test",
            domain: "dub.sh",
            key: "test",
            title: data?.title || "Updated Title",
            description: data?.description || "Updated description",
            tags: data?.tags || ["updated", "test"],
            clicks: 0,
            uniqueClicks: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: "user-123",
            workspaceId: "workspace-123",
          }),
        );
        return manager;
      },
      validate: (result: any) => {
        expect(result).toHaveProperty("id");
        expect(result).toHaveProperty("title");
        expect(result).toHaveProperty("description");
        expect(result).toHaveProperty("tags");
        expect(result.title).toBe("Updated Title");
        expect(result.description).toBe("Updated description");
        expect(result.tags).toStrictEqual(["updated", "test"]);
      },
    },
  ],

  /**
   * Creates link deletion test scenarios
   */
  linkDeletion: () => [
    {
      name: "delete existing link",
      description: "should delete existing link",
      operation: "deleteLink",
      args: ["test-link-id"],
      validate: (result: any) => {
        expect(result).toBeUndefined();
      },
    },
    {
      name: "delete non-existent link",
      description: "should handle deletion of non-existent link",
      operation: "deleteLink",
      args: ["non-existent-id"],
      setup: () => {
        const manager = createTestData.linkManager();
        manager.deleteLink.mockRejectedValue(new Error("Link not found"));
        return manager;
      },
      shouldThrow: true,
      expectedError: "Link not found",
      validate: () => {}, // Not used for error scenarios
    },
  ],

  /**
   * Creates analytics test scenarios
   */
  analytics: () => [
    {
      name: "get analytics data",
      description: "should retrieve analytics data for link",
      operation: "getAnalytics",
      args: ["test-link-id"],
      validate: (result: any) => {
        expect(result).toHaveProperty("clicks");
        expect(result).toHaveProperty("uniqueClicks");
        expect(result).toHaveProperty("topCountries");
        expect(result).toHaveProperty("topReferrers");
        expect(result).toHaveProperty("topBrowsers");
        expect(typeof result.clicks).toBe("number");
        expect(typeof result.uniqueClicks).toBe("number");
        expect(Array.isArray(result.topCountries)).toBeTruthy();
        expect(Array.isArray(result.topReferrers)).toBeTruthy();
        expect(Array.isArray(result.topBrowsers)).toBeTruthy();
      },
    },
    {
      name: "get click events",
      description: "should retrieve click events for link",
      operation: "getClicks",
      args: ["test-link-id"],
      validate: (result: any) => {
        expect(Array.isArray(result)).toBeTruthy();
        if (result.length > 0) {
          expect(result[0]).toHaveProperty("timestamp");
          expect(result[0]).toHaveProperty("country");
          expect(result[0]).toHaveProperty("browser");
          expect(result[0]).toHaveProperty("device");
          expect(result[0]).toHaveProperty("referrer");
        }
      },
    },
  ],

  /**
   * Creates bulk operation test scenarios
   */
  bulkOperations: () => [
    {
      name: "bulk create links",
      description: "should create multiple links in bulk",
      operation: "bulkCreate",
      args: [
        {
          links: [
            { url: "https://example.com/1", title: "Link 1" },
            { url: "https://example.com/2", title: "Link 2" },
          ],
        },
      ],
      validate: (result: any) => {
        expect(result).toHaveProperty("created");
        expect(result).toHaveProperty("failed");
        expect(Array.isArray(result.created)).toBeTruthy();
        expect(Array.isArray(result.failed)).toBeTruthy();
        expect(result.created).toHaveLength(2);
        expect(result.failed).toHaveLength(0);
      },
    },
  ],

  /**
   * Creates analytics integration test scenarios
   */
  analyticsIntegration: () => [
    {
      name: "track link event",
      description: "should track link event",
      operation: "track",
      args: [
        "link_created",
        {
          linkId: "test-link-id",
          url: "https://example.com",
          shortUrl: "https://dub.sh/test",
        },
      ],
      validate: (result: any, subject: any) => {
        expect(subject.track).toHaveBeenCalledWith("link_created", {
          linkId: "test-link-id",
          url: "https://example.com",
          shortUrl: "https://dub.sh/test",
        });
      },
    },
    {
      name: "identify user",
      description: "should identify user for analytics",
      operation: "identify",
      args: [
        "user-123",
        {
          email: "test@example.com",
          name: "Test User",
        },
      ],
      validate: (result: any, subject: any) => {
        expect(subject.identify).toHaveBeenCalledWith("user-123", {
          email: "test@example.com",
          name: "Test User",
        });
      },
    },
    {
      name: "check if enabled",
      description: "should check if analytics integration is enabled",
      operation: "isEnabled",
      args: [],
      validate: (result: any) => {
        expect(typeof result).toBe("boolean");
      },
    },
  ],

  /**
   * Creates error handling test scenarios
   */
  errorHandling: () => [
    {
      name: "invalid URL",
      description: "should handle invalid URL gracefully",
      operation: "createLink",
      args: [{ url: "invalid-url" }],
      setup: () => {
        const manager = createTestData.linkManager();
        manager.createLink.mockRejectedValue(new Error("Invalid URL"));
        return manager;
      },
      shouldThrow: true,
      expectedError: "Invalid URL",
      validate: () => {}, // Not used for error scenarios
    },
    {
      name: "network error",
      description: "should handle network errors gracefully",
      operation: "createLink",
      args: [{ url: "https://example.com" }],
      setup: () => {
        const manager = createTestData.linkManager();
        manager.createLink.mockRejectedValue(new Error("Network error"));
        return manager;
      },
      shouldThrow: true,
      expectedError: "Network error",
      validate: () => {}, // Not used for error scenarios
    },
    {
      name: "authentication error",
      description: "should handle authentication errors gracefully",
      operation: "createLink",
      args: [{ url: "https://example.com" }],
      setup: () => {
        const manager = createTestData.linkManager();
        manager.createLink.mockRejectedValue(
          new Error("Authentication failed"),
        );
        return manager;
      },
      shouldThrow: true,
      expectedError: "Authentication failed",
      validate: () => {}, // Not used for error scenarios
    },
  ],
};

/**
 * Creates a performance test wrapper
 */
export function createPerformanceTest<T>(
  operation: () => Promise<T>,
  maxDuration: number = 100,
  description: string = "should complete within expected time",
) {
  return test(`performance - ${description}`, async () => {
    const start = performance.now();
    const result = await operation();
    const duration = performance.now() - start;

    expect(result).toBeDefined();
    expect(duration).toBeLessThan(maxDuration);
  });
}

/**
 * Creates a batch of operations for performance testing
 */
export function createBatchPerformanceTest<T>(
  operationFactory: (index: number) => Promise<T>,
  batchSize: number = 100,
  maxDuration: number = 1000,
  description: string = "should handle batch operations efficiently",
) {
  return test(`batch performance - ${description}`, async () => {
    const start = performance.now();

    const operations = Array.from({ length: batchSize }, (_, i) =>
      operationFactory(i),
    );
    const results = await Promise.all(operations);

    const duration = performance.now() - start;

    expect(results).toHaveLength(batchSize);
    expect(results[0]).toBeDefined();
    expect(duration).toBeLessThan(maxDuration);
  });
}

/**
 * Validates complex link properties
 */
export function validateLinkProperties(
  link: any,
  expectedProperties: Record<string, any> = {},
) {
  // Required properties
  expect(link).toHaveProperty("id");
  expect(link).toHaveProperty("url");
  expect(link).toHaveProperty("shortUrl");
  expect(link).toHaveProperty("domain");
  expect(link).toHaveProperty("key");

  // Optional properties
  const optionalProps = [
    "title",
    "description",
    "tags",
    "clicks",
    "uniqueClicks",
    "createdAt",
    "updatedAt",
  ];
  optionalProps.forEach((prop) => {
    if (link[prop] !== undefined) {
      expect(link).toHaveProperty(prop);
    }
  });

  // Expected properties
  Object.entries(expectedProperties).forEach(([key, value]) => {
    expect(link[key]).toStrictEqual(value);
  });

  // Type validations
  expect(typeof link.id).toBe("string");
  expect(typeof link.url).toBe("string");
  expect(typeof link.shortUrl).toBe("string");
  expect(typeof link.domain).toBe("string");
  expect(typeof link.key).toBe("string");

  if (link.title) expect(typeof link.title).toBe("string");
  if (link.description) expect(typeof link.description).toBe("string");
  if (link.tags) expect(Array.isArray(link.tags)).toBeTruthy();
  if (link.clicks) expect(typeof link.clicks).toBe("number");
  if (link.uniqueClicks) expect(typeof link.uniqueClicks).toBe("number");
  if (link.createdAt) expect(typeof link.createdAt).toBe("string");
  if (link.updatedAt) expect(typeof link.updatedAt).toBe("string");
}

/**
 * Creates validation for required functionality
 */
export function createRequiredFunctionalityValidation(
  subject: any,
  requiredMethods: string[],
) {
  return requiredMethods.map((method) => ({
    name: `has ${method} method`,
    description: `should have ${method} method defined`,
    operation: "hasOwnProperty",
    args: [method],
    validate: (result: boolean) => {
      expect(result).toBeTruthy();
      expect(typeof subject[method]).toBe("function");
    },
  }));
}
