/**
 * Mock Registry
 *
 * This module provides a global registry for managing mock values in tests.
 * It allows tests to override default values temporarily and ensures
 * consistent mock values across the test suite.
 */

// Export the registry
export * from "./registry.ts";

// Export service-specific helpers
export * from "./services/index.ts";

// Re-export for convenience
import { mockRegistry } from "./registry.ts";
export default mockRegistry;
