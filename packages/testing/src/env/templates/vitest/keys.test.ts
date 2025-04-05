/**
 * Vitest-specific template for testing environment variable validation
 *
 * This template provides a structure for testing environment variable validation
 * functions in Vitest tests. It can be adapted for different packages by replacing
 * the imports and test cases.
 */
import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";

// Import the core environment utilities
import { testEnvVars, validationPatterns } from "../../../env/test-env.ts";

// Import Vitest-specific utilities
import {
  mockEnvVars,
  setupAllTestEnvVars,
  setupConsoleMocks,
  mockDate,
  mockFetch,
} from "../../../vitest/env/index.ts";

/**
 * Example test suite for environment variables in Vitest
 *
 * This is a template that can be copied and adapted for specific packages.
 * Replace the comments with actual test code for your environment validation.
 */
export function createVitestEnvTests() {
  describe("Environment Keys", () => {
    const originalEnv = process.env;

    beforeEach(() => {
      vi.resetModules();
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    // Example test for required variables
    it("validates required environment variables", () => {
      // Set required environment variables using mockEnvVars
      const restore = mockEnvVars({
        REQUIRED_API_KEY: "valid-key",
      });

      // Call the keys function
      // const result = keys();

      // Check that the required variable is returned
      // expect(result.REQUIRED_API_KEY).toBe('valid-key');

      // Restore original environment
      restore();
    });

    // Example test for missing required variables
    it("throws an error when required variables are missing", () => {
      // Delete required environment variables
      delete process.env.REQUIRED_API_KEY;

      // Expect the keys function to throw an error
      // expect(() => keys()).toThrow();
    });

    // Example test for optional variables
    it("handles optional environment variables", () => {
      // Set optional environment variables
      const restore = mockEnvVars({
        OPTIONAL_API_KEY: "optional-key",
      });

      // Call the keys function
      // const result = keys();

      // Check that the optional variable is returned
      // expect(result.OPTIONAL_API_KEY).toBe('optional-key');

      // Restore original environment
      restore();
    });

    // Example test for missing optional variables
    it("returns undefined for missing optional variables", () => {
      // Delete optional environment variables
      delete process.env.OPTIONAL_API_KEY;

      // Call the keys function
      // const result = keys();

      // Check that the optional variable is undefined
      // expect(result.OPTIONAL_API_KEY).toBeUndefined();
    });

    // Example test for validation rules
    it("validates environment variable format", () => {
      // Set environment variables with invalid format
      const restore = mockEnvVars({
        REQUIRED_API_KEY: "invalid-format",
      });

      // Expect the keys function to throw an error due to validation
      // expect(() => keys()).toThrow();

      // Restore original environment
      restore();
    });

    // Example test for test environment handling
    it("relaxes validation in test environment", () => {
      // Ensure we're in test environment
      const restore = mockEnvVars({
        NODE_ENV: "test",
        REQUIRED_API_KEY: "test-key",
      });

      // Expect the keys function not to throw in test environment
      // expect(() => keys()).not.toThrow();

      // Restore original environment
      restore();
    });

    // Example test for setupAllTestEnvVars
    it("can setup all standard test environment variables", () => {
      // Setup all standard test environment variables
      const restore = setupAllTestEnvVars();

      // Verify standard test values
      expect(process.env.CLERK_SECRET_KEY).toBe(testEnvVars.CLERK_SECRET_KEY);
      expect(process.env.DATABASE_URL).toBe(testEnvVars.DATABASE_URL);

      // Restore original environment
      restore();
    });

    // Example test for setupConsoleMocks
    it("can mock console methods", () => {
      // Setup console mocks
      const restore = setupConsoleMocks();

      // Use console methods
      console.log("test");
      console.error("error");

      // Verify console was called
      expect(console.log).toHaveBeenCalledWith("test");
      expect(console.error).toHaveBeenCalledWith("error");

      // Restore original console methods
      restore();
    });

    // Example test for mockDate
    it("can mock the current date", () => {
      // Mock the current date
      const testDate = new Date("2025-01-01");
      const restore = mockDate(testDate);

      // Verify the date is mocked
      expect(new Date().getTime()).toBe(testDate.getTime());
      expect(Date.now()).toBe(testDate.getTime());

      // Restore original Date
      restore();
    });

    // Example test for mockFetch
    it("can mock fetch", async () => {
      // Mock fetch
      const mockResponse = { data: "test" };
      const fetchMock = mockFetch(mockResponse);

      // Use fetch
      const response = await fetch("https://example.com");
      const data = await response.json();

      // Verify fetch was called and returned the mock response
      expect(fetchMock).toHaveBeenCalledWith("https://example.com");
      expect(data).toEqual(mockResponse);
    });
  });
}

// Export the test suite creator
export default createVitestEnvTests;
