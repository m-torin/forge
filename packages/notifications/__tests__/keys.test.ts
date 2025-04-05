import { createEnv } from "@t3-oss/env-nextjs";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { keys } from "../keys";

// Import the mocked modules
vi.mock("@t3-oss/env-nextjs");

describe.skip("Notifications Keys", function () {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...originalEnv };

    // Mock createEnv to return a function that returns the environment variables
    (createEnv as any).mockImplementation(({ client, runtimeEnv, server }) => {
      const env = {};
      Object.keys(server).forEach((key) => {
        env[key] = runtimeEnv[key];
      });
      Object.keys(client).forEach((key) => {
        env[key] = runtimeEnv[key];
      });
      return () => env;
    });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("calls createEnv with the correct parameters", () => {
    keys();

    expect(createEnv).toHaveBeenCalledWith(
      expect.objectContaining({
        client: expect.objectContaining({
          NEXT_PUBLIC_KNOCK_API_KEY: expect.any(Object),
          NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: expect.any(Object),
        }),
        runtimeEnv: expect.objectContaining({
          KNOCK_SECRET_API_KEY: process.env.KNOCK_SECRET_API_KEY,
          NEXT_PUBLIC_KNOCK_API_KEY: process.env.NEXT_PUBLIC_KNOCK_API_KEY,
          NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID:
            process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID,
        }),
        server: expect.objectContaining({
          KNOCK_SECRET_API_KEY: expect.any(Object),
        }),
      }),
    );
  });

  it("returns the correct environment variables", () => {
    // Set up test environment variables
    process.env.KNOCK_SECRET_API_KEY = "test-knock-secret-api-key";
    process.env.NEXT_PUBLIC_KNOCK_API_KEY = "test-knock-public-api-key";
    process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID =
      "test-knock-feed-channel-id";

    // Use type assertion to avoid type errors
    const result = (keys() as any)();

    expect(result).toEqual({
      KNOCK_SECRET_API_KEY: "test-knock-secret-api-key",
      NEXT_PUBLIC_KNOCK_API_KEY: "test-knock-public-api-key",
      NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: "test-knock-feed-channel-id",
    });
  });

  it("handles missing optional environment variables", () => {
    // Clear all environment variables
    delete process.env.KNOCK_SECRET_API_KEY;
    delete process.env.NEXT_PUBLIC_KNOCK_API_KEY;
    delete process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID;

    // Use type assertion to avoid type errors
    const result = (keys() as any)();

    expect(result).toEqual({
      KNOCK_SECRET_API_KEY: undefined,
      NEXT_PUBLIC_KNOCK_API_KEY: undefined,
      NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: undefined,
    });
  });

  it("validates environment variables correctly", () => {
    // Mock createEnv to simulate validation
    (createEnv as any).mockImplementation(({ client, runtimeEnv, server }) => {
      // Simulate validation by checking if values are defined
      const validateValue = (schema: any, value: any) => {
        if (schema.min && (!value || value.length < schema.min)) {
          throw new Error(
            `Value must be at least ${schema.min} characters long`,
          );
        }
        return value;
      };

      const env = {};
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

      Object.keys(client).forEach((key) => {
        try {
          env[key] = validateValue(client[key], runtimeEnv[key]);
        } catch (error) {
          // If validation fails, set to undefined for optional fields
          if (client[key].optional) {
            env[key] = undefined;
          } else {
            throw error;
          }
        }
      });

      return () => env;
    });

    // Set valid values
    process.env.KNOCK_SECRET_API_KEY = "valid-key";
    process.env.NEXT_PUBLIC_KNOCK_API_KEY = "valid-key";
    process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = "valid-id";

    // Should not throw for valid values
    expect(() => keys()).not.toThrow();

    // Set empty values (should be allowed for optional fields)
    process.env.KNOCK_SECRET_API_KEY = "";
    process.env.NEXT_PUBLIC_KNOCK_API_KEY = "";
    process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = "";

    // Should not throw for empty values on optional fields
    expect(() => keys()).not.toThrow();
  });
});
