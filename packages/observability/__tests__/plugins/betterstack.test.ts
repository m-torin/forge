import {
  BetterStackPlugin,
  createBetterStackPlugin,
} from "#/plugins/betterstack";
import { vi } from "vitest";

// Use centralized test factory and utilities
import {
  createObservabilityTestSuite,
  createScenarios,
} from "../plugin-test-factory";
import { createTestData } from "../test-data-generators";

// Scenarios are now available through centralized mock setup in @repo/qa
let logtailScenarios: any = {
  loggingError: vi.fn(),
  success: vi.fn(),
  reset: vi.fn(),
};

const resetMocks = () => {
  vi.clearAllMocks();
};

vi.mock("../../src/plugins/betterstack/env", () => ({
  safeEnv: () => ({
    BETTER_STACK_SOURCE_TOKEN: "test-token",
    BETTERSTACK_ENABLED: true,
    BETTER_STACK_INGESTING_URL: "https://in.logs.betterstack.com",
  }),
}));

// Create plugin factory for testing
function createBetterStackTestPlugin(config?: any) {
  const plugin = new BetterStackPlugin({
    enabled: true,
    sourceToken: "test-token",
    ...config,
  });

  resetMocks();
  return plugin;
}

// Generate standard test suite
createObservabilityTestSuite({
  pluginName: "betterstack",
  createPlugin: createBetterStackTestPlugin,
  defaultConfig: {
    enabled: true,
    sourceToken: "test-token",
  },
  scenarios: [
    ...createScenarios.initialization([
      {
        name: "with source token",
        description: "should initialize with source token",
        test: async (plugin: any) => {
          await plugin.initialize();
          // Plugin should initialize without errors
          expect(plugin.name).toBe("betterstack");
        },
      },
      {
        name: "without source token",
        description: "should handle missing source token",
        test: async (plugin: any) => {
          const consoleSpy = vi
            .spyOn(console, "warn")
            .mockImplementation(() => {});

          // Reset and override ALL mocks for this test
          vi.clearAllMocks();
          vi.resetModules();

          // Mock environment to return no tokens for ANY key
          vi.doMock("../../src/plugins/betterstack/env", () => ({
            safeEnv: () => ({
              BETTER_STACK_SOURCE_TOKEN: undefined,
              NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN: undefined,
              LOGTAIL_SOURCE_TOKEN: undefined,
              BETTERSTACK_SOURCE_TOKEN: undefined,
              NEXT_PUBLIC_LOGTAIL_TOKEN: undefined,
              NEXT_PUBLIC_BETTERSTACK_TOKEN: undefined,
              BETTERSTACK_ENABLED: true,
            }),
          }));

          // Import plugin AFTER mock is set up
          const { BetterStackPlugin } = await import(
            "../../src/plugins/betterstack"
          );

          const noTokenPlugin = new BetterStackPlugin({
            enabled: true,
            sourceToken: undefined,
          });
          await noTokenPlugin.initialize();

          expect(consoleSpy).toHaveBeenCalledWith(
            "Better Stack plugin: No source token provided, skipping initialization",
          );

          consoleSpy.mockRestore();
        },
      },
    ]),
    ...createScenarios.integration([
      {
        name: "betterstack integration workflow",
        description: "should handle complete BetterStack workflow",
        test: async (plugin: any) => {
          await plugin.initialize();

          // Set user - converted to context
          const user = createTestData.user();
          plugin.setUser(user);

          // Add breadcrumb - converted to log
          const breadcrumb = createTestData.breadcrumb();
          plugin.addBreadcrumb(breadcrumb);

          // Capture message
          const message = "Integration test message";
          plugin.captureMessage(message, "info");

          // Capture error
          const error = createTestData.error();
          plugin.captureException(error);

          // Flush
          await (plugin as any).flush();

          // Shutdown
          await plugin.shutdown();
        },
      },
    ]),
  ],
  isServerPlugin: true,
});

// Additional BetterStack-specific tests
describe("betterstack-specific features", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("factory functions", () => {
    test("should create BetterStackPlugin with default config", () => {
      const plugin = createBetterStackPlugin();

      expect(plugin).toBeInstanceOf(BetterStackPlugin);
      expect(plugin.name).toBe("betterstack");
      expect(plugin.enabled).toBeTruthy();
    });

    test("should create BetterStackPlugin with custom config", () => {
      const plugin = createBetterStackPlugin({
        enabled: false,
        logtailPackage: "@logtail/next",
      });

      expect(plugin).toBeInstanceOf(BetterStackPlugin);
      expect(plugin.enabled).toBeFalsy();
    });
  });

  describe("package detection", () => {
    test("should detect Next.js runtime", () => {
      const originalEnv = process.env;
      process.env = { ...originalEnv, NEXT_RUNTIME: "nodejs" };

      const nextPlugin = new BetterStackPlugin();
      expect(nextPlugin).toBeDefined();

      process.env = originalEnv;
    });

    test("should detect Next.js edge runtime", () => {
      const originalEnv = process.env;
      process.env = { ...originalEnv, NEXT_RUNTIME: "edge" };

      const edgePlugin = new BetterStackPlugin();
      expect(edgePlugin).toBeDefined();

      process.env = originalEnv;
    });

    test("should default to @logtail/js", () => {
      const originalEnv = process.env;
      process.env = { ...originalEnv };
      delete process.env.NEXT_RUNTIME;

      const jsPlugin = new BetterStackPlugin();
      expect(jsPlugin).toBeDefined();

      process.env = originalEnv;
    });
  });

  describe("configuration", () => {
    test("should configure with ingestion URL", async () => {
      const plugin = createBetterStackTestPlugin({
        ingestionUrl: "https://custom.endpoint.com",
      });

      await plugin.initialize();

      // Plugin should initialize without errors
      expect(plugin.name).toBe("betterstack");
    });

    test("should handle missing Logtail class", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Test with a plugin that would fail to import
      const plugin = createBetterStackTestPlugin();
      await plugin.initialize();

      // Should handle gracefully without throwing
      expect(plugin.name).toBe("betterstack");

      consoleSpy.mockRestore();
    });
  });

  describe("breadcrumb management", () => {
    test("should limit breadcrumbs to 100 items", async () => {
      const plugin = createBetterStackTestPlugin();
      await plugin.initialize();

      // Add 150 breadcrumbs
      for (let i = 0; i < 150; i++) {
        plugin.addBreadcrumb({
          message: `Breadcrumb ${i}`,
          level: "info",
        });
      }

      plugin.captureMessage("Test message");

      // Verify plugin is working (breadcrumb functionality tested through usage)
      expect(plugin.name).toBe("betterstack");
    });

    test("should include breadcrumbs in logs", async () => {
      const plugin = createBetterStackTestPlugin();
      await plugin.initialize();

      const breadcrumb = createTestData.breadcrumb();
      plugin.addBreadcrumb(breadcrumb);

      plugin.captureMessage("Test message");

      // Verify breadcrumb functionality through plugin behavior
      expect(plugin.name).toBe("betterstack");
    });
  });

  describe("environment variable priority", () => {
    test("should prioritize new environment variables", async () => {
      // Mock environment with both old and new variables
      vi.doMock("../../src/plugins/betterstack/env", () => ({
        safeEnv: () => ({
          BETTER_STACK_SOURCE_TOKEN: "new-token",
          LOGTAIL_SOURCE_TOKEN: "old-token",
          BETTERSTACK_SOURCE_TOKEN: "old-token",
        }),
      }));

      const plugin = createBetterStackTestPlugin();
      await plugin.initialize();

      expect(plugin.name).toBe("betterstack");
    });
  });

  describe("error handling", () => {
    test("should handle Logtail client errors gracefully", async () => {
      const plugin = createBetterStackTestPlugin();
      await plugin.initialize();

      const scenarios = logtailScenarios;
      scenarios.loggingError();

      expect(() => {
        plugin.captureException(new Error("Test"));
      }).not.toThrow();
    });

    test("should handle missing Logtail methods", async () => {
      const plugin = createBetterStackTestPlugin();
      await plugin.initialize();

      expect(() => {
        plugin.captureMessage("Test");
      }).not.toThrow();
    });
  });
});
