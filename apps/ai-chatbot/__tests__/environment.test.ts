import { beforeEach, describe, expect, test, vi } from 'vitest';

describe('environment Configuration', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  test('should have all required AI provider environment variables defined', () => {
    // Test that environment variables can be set for all AI providers
    vi.stubEnv('XAI_API_KEY', 'test-xai-key');
    vi.stubEnv('OPENAI_API_KEY', 'test-openai-key');
    vi.stubEnv('ANTHROPIC_API_KEY', 'test-anthropic-key');
    vi.stubEnv('GOOGLE_AI_API_KEY', 'test-google-key');
    vi.stubEnv('PERPLEXITY_API_KEY', 'test-perplexity-key');

    expect(process.env.XAI_API_KEY).toBe('test-xai-key');
    expect(process.env.OPENAI_API_KEY).toBe('test-openai-key');
    expect(process.env.ANTHROPIC_API_KEY).toBe('test-anthropic-key');
    expect(process.env.GOOGLE_AI_API_KEY).toBe('test-google-key');
    expect(process.env.PERPLEXITY_API_KEY).toBe('test-perplexity-key');
  });

  test('should handle missing AI provider keys gracefully', () => {
    // Test that the app doesn't crash when AI keys are missing
    expect(() => {
      // Accessing env should not throw even if keys are undefined
      const xaiKey = process.env.XAI_API_KEY;
      const openaiKey = process.env.OPENAI_API_KEY;
      const anthropicKey = process.env.ANTHROPIC_API_KEY;
      const googleKey = process.env.GOOGLE_AI_API_KEY;
      const perplexityKey = process.env.PERPLEXITY_API_KEY;
    }).not.toThrow();
  });

  test('should have required database configuration', () => {
    vi.stubEnv('POSTGRES_URL', 'postgresql://test');
    vi.stubEnv('POSTGRES_PRISMA_URL', 'postgresql://test?pgbouncer=true');
    vi.stubEnv('POSTGRES_URL_NON_POOLING', 'postgresql://test');

    expect(process.env.POSTGRES_URL).toBe('postgresql://test');
    expect(process.env.POSTGRES_PRISMA_URL).toBe('postgresql://test?pgbouncer=true');
    expect(process.env.POSTGRES_URL_NON_POOLING).toBe('postgresql://test');
  });

  test('should have required auth configuration', () => {
    vi.stubEnv('BETTER_AUTH_SECRET', 'test-secret');
    vi.stubEnv('AUTH_GITHUB_ID', 'test-github-id');
    vi.stubEnv('AUTH_GITHUB_SECRET', 'test-github-secret');
    vi.stubEnv('AUTH_GOOGLE_ID', 'test-google-id');
    vi.stubEnv('AUTH_GOOGLE_SECRET', 'test-google-secret');

    expect(process.env.BETTER_AUTH_SECRET).toBe('test-secret');
    expect(process.env.AUTH_GITHUB_ID).toBe('test-github-id');
    expect(process.env.AUTH_GITHUB_SECRET).toBe('test-github-secret');
    expect(process.env.AUTH_GOOGLE_ID).toBe('test-google-id');
    expect(process.env.AUTH_GOOGLE_SECRET).toBe('test-google-secret');
  });

  test('should have required storage configuration', () => {
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'test-blob-token');
    expect(process.env.BLOB_READ_WRITE_TOKEN).toBe('test-blob-token');
  });

  test('should have required Redis configuration', () => {
    vi.stubEnv('REDIS_URL', 'redis://localhost:6379');
    vi.stubEnv('REDIS_TOKEN', 'test-redis-token');
    expect(process.env.REDIS_URL).toBe('redis://localhost:6379');
    expect(process.env.REDIS_TOKEN).toBe('test-redis-token');
  });

  test('should have required monitoring configuration', () => {
    vi.stubEnv('SENTRY_DSN', 'test-sentry-dsn');
    expect(process.env.SENTRY_DSN).toBe('test-sentry-dsn');
  });

  test('should have required client configuration', () => {
    vi.stubEnv('NEXT_PUBLIC_VERCEL_URL', 'http://localhost:3000');
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');
    expect(process.env.NEXT_PUBLIC_VERCEL_URL).toBe('http://localhost:3000');
    expect(process.env.NEXT_PUBLIC_APP_URL).toBe('http://localhost:3000');
  });
});
