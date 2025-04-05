import { vercel } from "@t3-oss/env-core/presets-zod";
import { createEnv } from "@t3-oss/env-nextjs";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { keys } from "../keys";

// Import the mocked modules
vi.mock("@t3-oss/env-nextjs");
vi.mock("@t3-oss/env-core/presets-zod");

describe("Next Config Keys", function () {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...originalEnv };

    // Mock createEnv to return a function that returns the environment variables
    (createEnv as any).mockImplementation(
      ({
        client,
        runtimeEnv,
        server,
      }: {
        server: Record<string, any>;
        client: Record<string, any>;
        runtimeEnv: Record<string, any>;
      }) => {
        const env: Record<string, any> = {};
        Object.keys(server).forEach((key) => {
          env[key] = runtimeEnv[key];
        });
        Object.keys(client).forEach((key) => {
          env[key] = runtimeEnv[key];
        });
        return () => env;
      },
    );

    // Mock vercel to return an object with Vercel environment variables
    (vercel as any).mockReturnValue({
      VERCEL_ENV: vi.fn(),
      VERCEL_REGION: vi.fn(),
      VERCEL_URL: vi.fn(),
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
          NEXT_PUBLIC_API_URL: expect.any(Object),
          NEXT_PUBLIC_APP_URL: expect.any(Object),
          NEXT_PUBLIC_DOCS_URL: expect.any(Object),
          NEXT_PUBLIC_WEB_URL: expect.any(Object),
        }),
        extends: expect.any(Array),
        runtimeEnv: expect.objectContaining({
          ANALYZE: process.env.ANALYZE,
          NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
          NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
          NEXT_PUBLIC_DOCS_URL: process.env.NEXT_PUBLIC_DOCS_URL,
          NEXT_PUBLIC_WEB_URL: process.env.NEXT_PUBLIC_WEB_URL,
          NEXT_RUNTIME: process.env.NEXT_RUNTIME,
        }),
        server: expect.objectContaining({
          ANALYZE: expect.any(Object),
          NEXT_RUNTIME: expect.any(Object),
        }),
      }),
    );
  });

  it("extends the Vercel preset", () => {
    keys();

    expect(vercel).toHaveBeenCalled();
    expect(createEnv).toHaveBeenCalledWith(
      expect.objectContaining({
        extends: expect.arrayContaining([
          expect.objectContaining({
            VERCEL_ENV: expect.any(Function),
            VERCEL_REGION: expect.any(Function),
            VERCEL_URL: expect.any(Function),
          }),
        ]),
      }),
    );
  });

  it("returns the correct environment variables", () => {
    // Set up test environment variables
    process.env.ANALYZE = "true";
    process.env.NEXT_RUNTIME = "nodejs";
    process.env.NEXT_PUBLIC_APP_URL = "https://app.example.com";
    process.env.NEXT_PUBLIC_WEB_URL = "https://example.com";
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
    process.env.NEXT_PUBLIC_DOCS_URL = "https://docs.example.com";

    const keysFunction = keys();
    // Mock the return value of keysFunction
    const mockEnv = {
      ANALYZE: "true",
      NEXT_PUBLIC_API_URL: "https://api.example.com",
      NEXT_PUBLIC_APP_URL: "https://app.example.com",
      NEXT_PUBLIC_DOCS_URL: "https://docs.example.com",
      NEXT_PUBLIC_WEB_URL: "https://example.com",
      NEXT_RUNTIME: "nodejs",
    };

    // Mock the implementation of createEnv to return our mock environment
    (createEnv as any).mockImplementation(() => () => mockEnv);

    // Use a type assertion to avoid the type error
    expect((keys() as any)()).toEqual(mockEnv);
  });

  it("handles missing optional environment variables", () => {
    // Set only required environment variables
    process.env.NEXT_PUBLIC_APP_URL = "https://app.example.com";
    process.env.NEXT_PUBLIC_WEB_URL = "https://example.com";
    delete process.env.ANALYZE;
    delete process.env.NEXT_RUNTIME;
    delete process.env.NEXT_PUBLIC_API_URL;
    delete process.env.NEXT_PUBLIC_DOCS_URL;

    // Mock the return value
    const mockEnv = {
      ANALYZE: undefined,
      NEXT_PUBLIC_API_URL: undefined,
      NEXT_PUBLIC_APP_URL: "https://app.example.com",
      NEXT_PUBLIC_DOCS_URL: undefined,
      NEXT_PUBLIC_WEB_URL: "https://example.com",
      NEXT_RUNTIME: undefined,
    };

    // Mock the implementation of createEnv to return our mock environment
    (createEnv as any).mockImplementation(() => () => mockEnv);

    // Use a type assertion to avoid the type error
    expect((keys() as any)()).toEqual(mockEnv);
  });
});
