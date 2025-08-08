import { beforeEach, describe, expect, test, vi } from 'vitest';

/**
 * Custom Providers Tests
 *
 * Uses environment variables to control testing mode:
 * - INTEGRATION_TEST=true: Test with real provider functionality
 * - INTEGRATION_TEST=false/undefined: Use mocks (default)
 */

const IS_INTEGRATION_TEST = process.env.INTEGRATION_TEST === 'true';
const TEST_TIMEOUT = IS_INTEGRATION_TEST ? 30000 : 5000;

// Mock setup for unit tests
if (!IS_INTEGRATION_TEST) {
  vi.mock('@repo/observability', () => ({
    logInfo: vi.fn(),
    logWarn: vi.fn(),
    logError: vi.fn(),
  }));

  // Mock AI SDK
  vi.mock('ai', () => ({
    generateText: vi.fn(),
    customProvider: vi.fn(),
  }));
}

describe('custom Providers', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    if (IS_INTEGRATION_TEST) {
      console.log('🔗 Integration test mode - testing with real custom providers');
    } else {
      console.log('🤖 Mock test mode - using simulated custom providers');
    }
  });

  test('should import custom providers successfully', async () => {
    const customProviders = await import('../../../src/server/providers/custom-providers');
    expect(customProviders).toBeDefined();

    console.log(
      IS_INTEGRATION_TEST
        ? '✅ Integration: Custom providers imported'
        : '✅ Mock: Custom providers imported',
    );
  });

  test(
    'should create custom providers',
    async () => {
      const { createCustomProvider } = await import(
        '../../../src/server/providers/custom-providers'
      );

      const providerConfig = {
        name: 'test-provider',
        baseUrl: IS_INTEGRATION_TEST ? 'https://api.test.com' : 'mock://api',
        apiKey: IS_INTEGRATION_TEST ? process.env.TEST_API_KEY : 'mock-key',
      };

      const provider = createCustomProvider(providerConfig);
      expect(provider).toBeDefined();

      console.log(
        IS_INTEGRATION_TEST
          ? '✅ Integration: Custom provider created'
          : '✅ Mock: Custom provider created',
      );
    },
    TEST_TIMEOUT,
  );
});
