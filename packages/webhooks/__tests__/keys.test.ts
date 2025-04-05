import { createEnv } from "@t3-oss/env-nextjs";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { keys } from "../keys";

// Import the mocked modules
vi.mock("@t3-oss/env-nextjs");

describe("Webhooks Keys", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...originalEnv };

    // Mock createEnv to return a function that returns the environment variables
    (createEnv as any).mockImplementation(
      ({
        runtimeEnv,
        server,
      }: {
        server: Record<string, any>;
        runtimeEnv: Record<string, any>;
      }) => {
        const env: Record<string, any> = {};
        Object.keys(server).forEach((key) => {
          env[key] = runtimeEnv[key];
        });
        return () => env;
      },
    );
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("calls createEnv with the correct parameters", () => {
    keys();

    expect(createEnv).toHaveBeenCalledWith(
      expect.objectContaining({
        runtimeEnv: expect.objectContaining({
          SVIX_TOKEN: process.env.SVIX_TOKEN,
        }),
        server: expect.objectContaining({
          SVIX_TOKEN: expect.any(Object),
        }),
      }),
    );
  });

  it("returns the correct environment variables", () => {
    // Set up test environment variables
    process.env.SVIX_TOKEN = "sk_test_svix_token";

    const result = keys();

    expect(result).toEqual({
      SVIX_TOKEN: "sk_test_svix_token",
    });
  });

  it("handles missing optional environment variables", () => {
    // Clear all environment variables
    delete process.env.SVIX_TOKEN;

    const result = keys();

    expect(result).toEqual({
      SVIX_TOKEN: undefined,
    });
  });

  it("validates SVIX_TOKEN format", () => {
    // Mock createEnv to simulate validation
    (createEnv as any).mockImplementation(
      ({
        runtimeEnv,
        server,
      }: {
        server: Record<string, any>;
        runtimeEnv: Record<string, any>;
      }) => {
        // Simulate validation by checking if values match the expected format
        const validateValue = (schema: any, value: any) => {
          if (schema.startsWith && value) {
            const validPrefixes = Array.isArray(schema.startsWith)
              ? schema.startsWith
              : [schema.startsWith];

            const isValid = validPrefixes.some((prefix: string) =>
              value.startsWith(prefix),
            );

            if (!isValid) {
              throw new Error(
                `Value must start with one of: ${validPrefixes.join(", ")}`,
              );
            }
          }

          if (schema.min && (!value || value.length < schema.min)) {
            throw new Error(
              `Value must be at least ${schema.min} characters long`,
            );
          }

          return value;
        };

        const env: Record<string, any> = {};
        Object.keys(server).forEach((key) => {
          try {
            // For the union type, we need to handle it specially
            if (key === "SVIX_TOKEN") {
              // Check if it starts with sk_ or testsk_
              const value = runtimeEnv[key];
              if (
                value &&
                !value.startsWith("sk_") &&
                !value.startsWith("testsk_")
              ) {
                if (server[key].optional) {
                  env[key] = undefined;
                } else {
                  throw new Error("SVIX_TOKEN must start with sk_ or testsk_");
                }
              } else {
                env[key] = value;
              }
            } else {
              env[key] = validateValue(server[key], runtimeEnv[key]);
            }
          } catch (error) {
            // If validation fails, set to undefined for optional fields
            if (server[key].optional) {
              env[key] = undefined;
            } else {
              throw error;
            }
          }
        });

        return () => env;
      },
    );

    // Set valid SVIX_TOKEN with sk_ prefix
    process.env.SVIX_TOKEN = "sk_valid_token";
    expect(() => keys()).not.toThrow();

    // Set valid SVIX_TOKEN with testsk_ prefix
    process.env.SVIX_TOKEN = "testsk_valid_token";
    expect(() => keys()).not.toThrow();

    // Set invalid SVIX_TOKEN
    process.env.SVIX_TOKEN = "invalid_token";
    expect(() => keys()).toThrow();
  });

  it("allows undefined SVIX_TOKEN because it is optional", () => {
    // Mock createEnv to simulate validation
    (createEnv as any).mockImplementation(
      ({
        runtimeEnv,
        server,
      }: {
        server: Record<string, any>;
        runtimeEnv: Record<string, any>;
      }) => {
        // Simulate validation by checking if values are defined
        const validateValue = (schema: any, value: any) => {
          if (!schema.optional && value === undefined) {
            throw new Error("Value is required");
          }

          return value;
        };

        const env: Record<string, any> = {};
        Object.keys(server).forEach((key) => {
          try {
            env[key] = validateValue(server[key], runtimeEnv[key]);
          } catch (error) {
            // If validation fails, set to undefined for optional fields
            if (server[key].optional) {
              env[key] = undefined;
            } else {
              throw error;
            }
          }
        });

        return () => env;
      },
    );

    // Clear SVIX_TOKEN
    delete process.env.SVIX_TOKEN;

    // Should not throw because SVIX_TOKEN is optional
    expect(() => keys()).not.toThrow();

    // Result should have undefined SVIX_TOKEN
    expect(keys()).toEqual({
      SVIX_TOKEN: undefined,
    });
  });
});
