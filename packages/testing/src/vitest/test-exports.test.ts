/**
 * Test file to verify the export structure
 *
 * This file imports from the vitest index.ts to ensure that all exports are working correctly.
 */

// Import React testing utilities directly
import {
  // React testing utilities
  render,
  renderHook,
  screen,
  within,
  fireEvent,
  waitFor,
  createReactConfig,
  MockAuthProvider,

  // Vitest functions
  vi,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from "./index.ts";

// Import server testing utilities from server module
import {
  createServerConfig,
  mockRequest,
  mockResponse,
  mockNext,
} from "./frameworks/server/index.ts";

// Import shared utilities from shared module
import {
  mockEnvVars,
  setupConsoleMocks,
  mockDate,
  // @ts-ignore - mockFetch is defined in the shared module
  mockFetch,
  // @ts-ignore - testEnvVars is defined in the env module
  testEnvVars,
} from "../shared/index.ts";

// Import directly from env module for test
import { testEnvVars as testEnvVarsFromEnv } from "../env/index.ts";

// Import configuration helpers from generators
import {
  generateBaseConfig as getConfig,
  generateReactConfig,
  generateNodeConfig,
} from "../generators/vitest.config.js";

// Create a test to verify the imports
describe("Export structure", () => {
  it("should import React testing utilities", () => {
    expect(render).toBeDefined();
    expect(screen).toBeDefined();
    expect(within).toBeDefined();
    expect(fireEvent).toBeDefined();
    expect(waitFor).toBeDefined();
    expect(createReactConfig).toBeDefined();
    expect(MockAuthProvider).toBeDefined();
  });

  it("should import Server testing utilities", () => {
    expect(createServerConfig).toBeDefined();
    expect(mockRequest).toBeDefined();
    expect(mockResponse).toBeDefined();
    expect(mockNext).toBeDefined();
  });

  it("should import Shared utilities", () => {
    expect(mockEnvVars).toBeDefined();
    expect(setupConsoleMocks).toBeDefined();
    expect(mockDate).toBeDefined();
    expect(mockFetch).toBeDefined();
    expect(testEnvVarsFromEnv).toBeDefined();
  });

  it("should import Vitest functions", () => {
    expect(vi).toBeDefined();
    expect(describe).toBeDefined();
    expect(it).toBeDefined();
    expect(expect).toBeDefined();
    expect(beforeEach).toBeDefined();
    expect(afterEach).toBeDefined();
  });

  it("should import Configuration helpers", () => {
    expect(getConfig).toBeDefined();
    expect(generateReactConfig).toBeDefined();
    expect(generateNodeConfig).toBeDefined();
  });
});
