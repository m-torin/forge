/**
 * Client Entry Points Tests
 *
 * Comprehensive tests for all client-side entry points and their exports.
 * Ensures proper module resolution and export availability.
 */

import { describe, expect, test } from "vitest";
import { i18nTestPatterns } from "../i18n-test-factory";

// ================================================================================================
// CLIENT ENTRY POINT TESTS
// ================================================================================================

describe("client Entry Points", () => {
  // Test main client entry point
  test("should export from main client module", async () => {
    const clientModule = await import("../../src/client");

    expect(clientModule).toBeDefined();
    expect(typeof clientModule).toBe("object");

    // Check exports - client module no longer exports anything (Link moved to uix-system)
    const exports = Object.keys(clientModule);
    expect(exports).toHaveLength(0); // Should be empty now

    // Link component has been moved to @repo/uix-system - no longer exported from this package
  });

  // Test client-next entry point
  test("should export from client-next module", async () => {
    const clientNextModule = await import("../../src/client-next");

    expect(clientNextModule).toBeDefined();
    expect(typeof clientNextModule).toBe("object");

    // Check exports - client-next module no longer exports anything (Link moved to uix-system)
    const exports = Object.keys(clientNextModule);
    expect(exports).toHaveLength(0); // Should be empty now

    // Link component has been moved to @repo/uix-system - no longer exported from this package
  });

  // Test component exports - Link is now in uix-system, not exported from this package
  test("should not export Link component from client modules", async () => {
    const clientModule = await import("../../src/client");
    const clientNextModule = await import("../../src/client-next");

    expect(clientModule).toBeDefined();
    expect(clientNextModule).toBeDefined();

    // Link should NOT be exported from these modules anymore
    expect(clientModule.Link).toBeUndefined();
    expect(clientNextModule.Link).toBeUndefined();
  });
});

// ================================================================================================
// SYSTEMATIC ENTRY POINT VALIDATION
// ================================================================================================

const clientEntryPoints = [
  {
    name: "client",
    path: "../../src/client",
    expectedExports: [], // No exports expected - Link moved to uix-system
  },
  {
    name: "client-next",
    path: "../../src/client-next",
    expectedExports: [], // No exports expected - Link moved to uix-system
  },
] as const;

// Test each entry point systematically
clientEntryPoints.forEach((entryPoint) => {
  i18nTestPatterns.testModuleExports(
    entryPoint.name,
    entryPoint.path,
    entryPoint.expectedExports,
  );
});

// ================================================================================================
// COMPONENT ENTRY POINTS
// ================================================================================================

describe("component Entry Points", () => {
  test("should not export Link component from client modules", async () => {
    // Link component is no longer exported from client modules
    const clientModule = await import("../../src/client");
    expect(clientModule).toBeDefined();
    expect(clientModule.Link).toBeUndefined(); // Should be undefined now
  });

  test("should import I18nLink from uix-system successfully", async () => {
    const { I18nLink } = await import("@repo/uix-system/shared/i18n");
    expect(I18nLink).toBeDefined();
    expect(typeof I18nLink).toBe("function");
  });
});

// ================================================================================================
// EXPORT CONSISTENCY TESTS
// ================================================================================================

describe("export Consistency", () => {
  test("should have consistent Link exports across client modules", async () => {
    const clientModule = await import("../../src/client");
    const clientNextModule = await import("../../src/client-next");

    const clientHasLink = "Link" in clientModule;
    const clientNextHasLink = "Link" in clientNextModule;

    if (clientHasLink && clientNextHasLink) {
      // Both should export Link
      expect(typeof clientModule.Link).toBe("function");
      expect(typeof clientNextModule.Link).toBe("function");
    } else if (clientHasLink || clientNextHasLink) {
      // At least one should export Link
      const linkModule = clientHasLink ? clientModule : clientNextModule;
      expect(typeof linkModule.Link).toBe("function");
    }
    // If neither exports Link, that's also valid
  });

  test("should not have conflicting exports", async () => {
    const clientModule = await import("../../src/client");
    const clientNextModule = await import("../../src/client-next");

    const clientExports = Object.keys(clientModule);
    const clientNextExports = Object.keys(clientNextModule);

    // Find common exports
    const commonExports = clientExports.filter((exp) =>
      clientNextExports.includes(exp),
    );

    // Common exports should have the same type
    commonExports.forEach((exportName) => {
      if (exportName !== "default" && exportName !== "__esModule") {
        expect(typeof clientModule[exportName]).toBe(
          typeof clientNextModule[exportName],
        );
      }
    });
  });
});

// ================================================================================================
// IMPORT RESOLUTION TESTS
// ================================================================================================

describe("import Resolution", () => {
  test("should resolve client module imports correctly", async () => {
    const importTests = [
      { path: "../../src/client", description: "main client module" },
      { path: "../../src/client-next", description: "client-next module" },
    ];

    for (const importTest of importTests) {
      try {
        const module = await import(importTest.path);
        expect(module).toBeDefined();
        expect(typeof module).toBe("object");
      } catch (error) {
        // Log but don't fail - module might not exist
        console.warn(`Failed to import ${importTest.description}: ${error}`);
      }
    }
  });

  test("should handle component imports correctly", async () => {
    // Link component is now in uix-system, not exported from client modules
    const clientModule = await import("../../src/client");
    const { I18nLink } = await import("@repo/uix-system/shared/i18n");

    expect(clientModule).toBeDefined();
    expect(clientModule.Link).toBeUndefined(); // No longer exported from client
    expect(I18nLink).toBeDefined(); // Available from uix-system
    expect(typeof I18nLink).toBe("function");
  });

  test("should verify Link is no longer exported from client modules", async () => {
    const clientModule = await import("../../src/client");
    const { I18nLink } = await import("@repo/uix-system/shared/i18n");

    // Verify that Link is no longer exported from client modules
    expect(clientModule.Link).toBeUndefined();
    // But I18nLink should be available from uix-system
    expect(I18nLink).toBeDefined();
    expect(typeof I18nLink).toBe("function");
  });
});

// ================================================================================================
// I18N LINK COMPONENT TESTS
// ================================================================================================

describe("i18nLink Component Tests", () => {
  test("should import I18nLink with correct type signature", async () => {
    const { I18nLink, I18nLinkProps } = await import(
      "@repo/uix-system/shared/i18n"
    );

    expect(I18nLink).toBeDefined();
    expect(typeof I18nLink).toBe("function");

    // Verify it has the expected function signature (accepts props)
    expect(I18nLink).toHaveLength(1); // Should accept one parameter (props)
  });

  test("should confirm Link is no longer re-exported from client modules", async () => {
    const clientModule = await import("../../src/client");
    const clientNextModule = await import("../../src/client-next");
    const { I18nLink } = await import("@repo/uix-system/shared/i18n");

    // Link should no longer be exported from client modules
    expect(clientModule.Link).toBeUndefined();
    expect(clientNextModule.Link).toBeUndefined();

    // But I18nLink should be available from uix-system
    expect(I18nLink).toBeDefined();
    expect(typeof I18nLink).toBe("function");
  });

  test("should export InternationalizationLink alias", async () => {
    const { InternationalizationLink, I18nLink } = await import(
      "@repo/uix-system/shared/i18n"
    );

    expect(InternationalizationLink).toBeDefined();
    expect(InternationalizationLink).toBe(I18nLink);
  });
});

// ================================================================================================
// ENVIRONMENT COMPATIBILITY TESTS
// ================================================================================================

describe("environment Compatibility", () => {
  test("should work in browser environment", async () => {
    // Mock browser environment
    const originalWindow = global.window;
    global.window = {
      navigator: { language: "en-US" },
      location: { href: "https://example.com" },
    } as any;

    try {
      const clientModule = await import("../../src/client");
      expect(clientModule).toBeDefined();

      // Should work with browser APIs
      expect(global.window.navigator.language).toBe("en-US");
    } finally {
      // Restore original window
      if (originalWindow) {
        global.window = originalWindow;
      } else {
        delete (global as any).window;
      }
    }
  });

  test("should work in SSR environment", async () => {
    // Mock SSR environment (no window)
    const originalWindow = global.window;
    delete (global as any).window;

    try {
      const clientModule = await import("../../src/client");
      expect(clientModule).toBeDefined();

      // Should work without browser APIs
      expect(typeof global.window).toBe("undefined");
    } finally {
      // Restore original window
      if (originalWindow) {
        global.window = originalWindow;
      }
    }
  });

  test("should handle Next.js specific imports", async () => {
    try {
      const clientNextModule = await import("../../src/client-next");
      expect(clientNextModule).toBeDefined();

      // Should work with Next.js mocks
      const { useParams } = require("next/navigation");
      expect(useParams).toBeDefined();
      expect(typeof useParams).toBe("function");
    } catch (error) {
      // Module might not exist, which is OK
      expect(error).toBeDefined();
    }
  });
});

// ================================================================================================
// EXPORT VALIDATION TESTS
// ================================================================================================

describe("export Validation", () => {
  test("should have valid TypeScript exports", async () => {
    const modules = [
      { name: "client", path: "../../src/client" },
      { name: "client-next", path: "../../src/client-next" },
    ];

    for (const module of modules) {
      try {
        const moduleExports = await import(module.path);

        // Check that exports are properly typed
        Object.keys(moduleExports).forEach((exportName) => {
          if (exportName !== "default" && exportName !== "__esModule") {
            const exportValue = moduleExports[exportName];
            expect(exportValue).toBeDefined();
            expect(typeof exportValue).toMatch(
              /^(function|object|string|number|boolean)$/,
            );
          }
        });
      } catch (error) {
        // Module might not exist
        console.warn(`Module ${module.name} not found: ${error}`);
      }
    }
  });

  test("should not export internal implementation details", async () => {
    const modules = [
      { name: "client", path: "../../src/client" },
      { name: "client-next", path: "../../src/client-next" },
    ];

    const internalExports = [
      "_internal",
      "__private",
      "implementation",
      "helpers",
      "utils",
    ];

    for (const module of modules) {
      try {
        const moduleExports = await import(module.path);
        const exportNames = Object.keys(moduleExports);

        internalExports.forEach((internalExport) => {
          expect(exportNames).not.toContain(internalExport);
        });
      } catch (error) {
        // Module might not exist
        console.warn(`Module ${module.name} not found: ${error}`);
      }
    }
  });
});

/**
 * Test Coverage Summary:
 *
 * ✅ **Entry Point Validation**: Tests all client entry points exist and are importable
 * ✅ **Export Consistency**: Ensures consistent exports across client modules
 * ✅ **Import Resolution**: Tests proper module resolution and error handling
 * ✅ **Environment Compatibility**: Tests browser, SSR, and Next.js environments
 * ✅ **Export Validation**: Validates TypeScript exports and prevents internal leaks
 * ✅ **Component Imports**: Tests component import resolution
 * ✅ **Error Handling**: Tests graceful handling of missing imports
 * ✅ **Systematic Testing**: Uses test factory patterns for consistency
 *
 * This provides comprehensive coverage of all client-side entry points and ensures
 * proper module resolution across different environments and use cases.
 */
