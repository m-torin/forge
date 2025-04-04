import { describe, expect, it, vi, beforeEach, afterAll } from 'vitest';
import { keys } from '../keys';
import { createEnv } from '@t3-oss/env-nextjs';
import { vercel } from '@t3-oss/env-core/presets-zod';

// Import the mocked modules
vi.mock('@t3-oss/env-nextjs');
vi.mock('@t3-oss/env-core/presets-zod');

describe('Next Config Keys', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...originalEnv };

    // Mock createEnv to return a function that returns the environment variables
    (createEnv as any).mockImplementation(({ server, client, runtimeEnv }) => {
      const env = {};
      Object.keys(server).forEach((key) => {
        env[key] = runtimeEnv[key];
      });
      Object.keys(client).forEach((key) => {
        env[key] = runtimeEnv[key];
      });
      return () => env;
    });

    // Mock vercel to return an object with Vercel environment variables
    (vercel as any).mockReturnValue({
      VERCEL_URL: vi.fn(),
      VERCEL_ENV: vi.fn(),
      VERCEL_REGION: vi.fn(),
    });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('calls createEnv with the correct parameters', () => {
    keys();

    expect(createEnv).toHaveBeenCalledWith(
      expect.objectContaining({
        extends: expect.any(Array),
        server: expect.objectContaining({
          ANALYZE: expect.any(Object),
          NEXT_RUNTIME: expect.any(Object),
        }),
        client: expect.objectContaining({
          NEXT_PUBLIC_APP_URL: expect.any(Object),
          NEXT_PUBLIC_WEB_URL: expect.any(Object),
          NEXT_PUBLIC_API_URL: expect.any(Object),
          NEXT_PUBLIC_DOCS_URL: expect.any(Object),
        }),
        runtimeEnv: expect.objectContaining({
          ANALYZE: process.env.ANALYZE,
          NEXT_RUNTIME: process.env.NEXT_RUNTIME,
          NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
          NEXT_PUBLIC_WEB_URL: process.env.NEXT_PUBLIC_WEB_URL,
          NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
          NEXT_PUBLIC_DOCS_URL: process.env.NEXT_PUBLIC_DOCS_URL,
        }),
      }),
    );
  });

  it('extends the Vercel preset', () => {
    keys();

    expect(vercel).toHaveBeenCalled();
    expect(createEnv).toHaveBeenCalledWith(
      expect.objectContaining({
        extends: expect.arrayContaining([
          expect.objectContaining({
            VERCEL_URL: expect.any(Function),
            VERCEL_ENV: expect.any(Function),
            VERCEL_REGION: expect.any(Function),
          }),
        ]),
      }),
    );
  });

  it('returns the correct environment variables', () => {
    // Set up test environment variables
    process.env.ANALYZE = 'true';
    process.env.NEXT_RUNTIME = 'nodejs';
    process.env.NEXT_PUBLIC_APP_URL = 'https://app.example.com';
    process.env.NEXT_PUBLIC_WEB_URL = 'https://example.com';
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
    process.env.NEXT_PUBLIC_DOCS_URL = 'https://docs.example.com';

    const keysFunction = keys();
    const result = keysFunction();

    expect(result).toEqual({
      ANALYZE: 'true',
      NEXT_RUNTIME: 'nodejs',
      NEXT_PUBLIC_APP_URL: 'https://app.example.com',
      NEXT_PUBLIC_WEB_URL: 'https://example.com',
      NEXT_PUBLIC_API_URL: 'https://api.example.com',
      NEXT_PUBLIC_DOCS_URL: 'https://docs.example.com',
    });
  });

  it('handles missing optional environment variables', () => {
    // Set only required environment variables
    process.env.NEXT_PUBLIC_APP_URL = 'https://app.example.com';
    process.env.NEXT_PUBLIC_WEB_URL = 'https://example.com';
    delete process.env.ANALYZE;
    delete process.env.NEXT_RUNTIME;
    delete process.env.NEXT_PUBLIC_API_URL;
    delete process.env.NEXT_PUBLIC_DOCS_URL;

    const keysFunction = keys();
    const result = keysFunction();

    expect(result).toEqual({
      ANALYZE: undefined,
      NEXT_RUNTIME: undefined,
      NEXT_PUBLIC_APP_URL: 'https://app.example.com',
      NEXT_PUBLIC_WEB_URL: 'https://example.com',
      NEXT_PUBLIC_API_URL: undefined,
      NEXT_PUBLIC_DOCS_URL: undefined,
    });
  });
});
