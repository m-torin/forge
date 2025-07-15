import { beforeEach, describe, expect, vi } from 'vitest';

// Mock Stripe Agent Toolkit
const mockStripeAgentToolkit = {
  configuration: {
    actions: {
      paymentLinks: { create: true },
      prices: { create: true },
      products: { create: true },
    },
  },
  getTools: vi.fn(),
  invoke: vi.fn(),
};

const MockStripeAgentToolkit = vi.fn().mockImplementation(config => ({
  ...mockStripeAgentToolkit,
  configuration: config.configuration,
  secretKey: config.secretKey,
}));

vi.mock('@stripe/agent-toolkit/ai-sdk', () => ({
  StripeAgentToolkit: MockStripeAgentToolkit,
}));

// Mock the env module
const mockSafeEnv = vi.fn();
vi.mock('../env', () => ({
  safeEnv: mockSafeEnv,
}));

describe('stripe AI Agent Toolkit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('with valid Stripe key', () => {
    beforeEach(() => {
      mockSafeEnv.mockReturnValue({
        STRIPE_SECRET_KEY: 'sk_test_123456789',
        STRIPE_WEBHOOK_SECRET: 'whsec_123456789',
      });
    });

    test('should create StripeAgentToolkit when secret key is available', async () => {
      const { paymentsAgentToolkit } = await import('../src/ai');

      expect(MockStripeAgentToolkit).toHaveBeenCalledWith({
        configuration: {
          actions: {
            paymentLinks: {
              create: true,
            },
            prices: {
              create: true,
            },
            products: {
              create: true,
            },
          },
        },
        secretKey: 'sk_test_123456789',
      });

      expect(paymentsAgentToolkit).toBeDefined();
      expect(paymentsAgentToolkit).not.toBeNull();
    });

    test('should configure toolkit with correct actions', async () => {
      await import('../src/ai');

      const toolkitCall = MockStripeAgentToolkit.mock.calls[0][0];

      expect(toolkitCall.configuration.actions).toStrictEqual({
        paymentLinks: {
          create: true,
        },
        prices: {
          create: true,
        },
        products: {
          create: true,
        },
      });
    });

    test('should pass secret key to toolkit', async () => {
      await import('../src/ai');

      const toolkitCall = MockStripeAgentToolkit.mock.calls[0][0];
      expect(toolkitCall.secretKey).toBe('sk_test_123456789');
    });

    test('should support payment link creation action', async () => {
      await import('../src/ai');

      const toolkitCall = MockStripeAgentToolkit.mock.calls[0][0];
      expect(toolkitCall.configuration.actions.paymentLinks.create).toBeTruthy();
    });

    test('should support price creation action', async () => {
      await import('../src/ai');

      const toolkitCall = MockStripeAgentToolkit.mock.calls[0][0];
      expect(toolkitCall.configuration.actions.prices.create).toBeTruthy();
    });

    test('should support product creation action', async () => {
      await import('../src/ai');

      const toolkitCall = MockStripeAgentToolkit.mock.calls[0][0];
      expect(toolkitCall.configuration.actions.products.create).toBeTruthy();
    });
  });

  describe('without Stripe key', () => {
    beforeEach(() => {
      mockSafeEnv.mockReturnValue({
        STRIPE_SECRET_KEY: undefined,
        STRIPE_WEBHOOK_SECRET: undefined,
      });
    });

    test('should return null when secret key is not available', async () => {
      const { paymentsAgentToolkit } = await import('../src/ai');

      expect(MockStripeAgentToolkit).not.toHaveBeenCalled();
      expect(paymentsAgentToolkit).toBeNull();
    });

    test('should not create toolkit instance when key is missing', async () => {
      const { paymentsAgentToolkit } = await import('../src/ai');

      expect(paymentsAgentToolkit).toBeNull();
      expect(MockStripeAgentToolkit).not.toHaveBeenCalled();
    });
  });

  describe('with empty string key', () => {
    beforeEach(() => {
      mockSafeEnv.mockReturnValue({
        STRIPE_SECRET_KEY: '',
        STRIPE_WEBHOOK_SECRET: 'whsec_123456789',
      });
    });

    test('should return null when secret key is empty string', async () => {
      const { paymentsAgentToolkit } = await import('../src/ai');

      expect(MockStripeAgentToolkit).not.toHaveBeenCalled();
      expect(paymentsAgentToolkit).toBeNull();
    });
  });

  describe('key validation behavior', () => {
    test('should handle truthy string values', async () => {
      mockSafeEnv.mockReturnValue({
        STRIPE_SECRET_KEY: 'sk_live_valid_key',
        STRIPE_WEBHOOK_SECRET: 'whsec_123456789',
      });

      const { paymentsAgentToolkit } = await import('../src/ai');

      expect(paymentsAgentToolkit).not.toBeNull();
      expect(MockStripeAgentToolkit).toHaveBeenCalledWith({
        configuration: {
          actions: {
            paymentLinks: { create: true },
            prices: { create: true },
            products: { create: true },
          },
        },
        secretKey: 'sk_live_valid_key',
      });
    });

    test('should handle false values correctly', async () => {
      mockSafeEnv.mockReturnValue({
        STRIPE_SECRET_KEY: false,
        STRIPE_WEBHOOK_SECRET: 'whsec_123456789',
      });

      const { paymentsAgentToolkit } = await import('../src/ai');

      expect(paymentsAgentToolkit).toBeNull();
      expect(MockStripeAgentToolkit).not.toHaveBeenCalled();
    });

    test('should handle null values correctly', async () => {
      mockSafeEnv.mockReturnValue({
        STRIPE_SECRET_KEY: null,
        STRIPE_WEBHOOK_SECRET: 'whsec_123456789',
      });

      const { paymentsAgentToolkit } = await import('../src/ai');

      expect(paymentsAgentToolkit).toBeNull();
      expect(MockStripeAgentToolkit).not.toHaveBeenCalled();
    });
  });

  describe('toolkit configuration', () => {
    beforeEach(() => {
      mockSafeEnv.mockReturnValue({
        STRIPE_SECRET_KEY: 'sk_test_123456789',
        STRIPE_WEBHOOK_SECRET: 'whsec_123456789',
      });
    });

    test('should have correct configuration structure', async () => {
      await import('../src/ai');

      const expectedConfig = {
        configuration: {
          actions: {
            paymentLinks: {
              create: true,
            },
            prices: {
              create: true,
            },
            products: {
              create: true,
            },
          },
        },
        secretKey: 'sk_test_123456789',
      };

      expect(MockStripeAgentToolkit).toHaveBeenCalledWith(expectedConfig);
    });

    test('should only enable create actions', async () => {
      await import('../src/ai');

      const toolkitCall = MockStripeAgentToolkit.mock.calls[0][0];
      const actions = toolkitCall.configuration.actions;

      // Check that only create actions are enabled
      expect(actions.paymentLinks.create).toBeTruthy();
      expect(actions.prices.create).toBeTruthy();
      expect(actions.products.create).toBeTruthy();

      // Verify no other actions are defined
      expect(Object.keys(actions.paymentLinks)).toStrictEqual(['create']);
      expect(Object.keys(actions.prices)).toStrictEqual(['create']);
      expect(Object.keys(actions.products)).toStrictEqual(['create']);
    });

    test('should not include other Stripe resource actions', async () => {
      await import('../src/ai');

      const toolkitCall = MockStripeAgentToolkit.mock.calls[0][0];
      const actions = toolkitCall.configuration.actions;

      // Should only have the three specified resources
      expect(Object.keys(actions)).toStrictEqual(['paymentLinks', 'prices', 'products']);

      // Should not include other common Stripe resources
      expect(actions.customers).toBeUndefined();
      expect(actions.subscriptions).toBeUndefined();
      expect(actions.invoices).toBeUndefined();
      expect(actions.paymentIntents).toBeUndefined();
    });
  });

  describe('integration with keys module', () => {
    test('should call keys function to get secret key', async () => {
      // Setup mock before importing to avoid undefined access
      mockSafeEnv.mockReturnValue({
        STRIPE_SECRET_KEY: 'sk_test_123456789',
        STRIPE_WEBHOOK_SECRET: 'whsec_123456789',
      });

      await import('../src/ai');

      expect(mockSafeEnv).toHaveBeenCalledWith();
    });

    test('should use the exact key returned from keys function', async () => {
      const testKey = 'sk_test_very_specific_key_12345';
      mockSafeEnv.mockReturnValue({
        STRIPE_SECRET_KEY: testKey,
        STRIPE_WEBHOOK_SECRET: 'whsec_123456789',
      });

      await import('../src/ai');

      const toolkitCall = MockStripeAgentToolkit.mock.calls[0][0];
      expect(toolkitCall.secretKey).toBe(testKey);
    });
  });

  describe('error handling', () => {
    test('should handle keys function throwing error', async () => {
      mockSafeEnv.mockImplementation(() => {
        throw new Error('Keys configuration error');
      });

      await expect(import('../src/ai')).rejects.toThrow('Keys configuration error');
    });

    test('should handle StripeAgentToolkit constructor throwing error', async () => {
      mockSafeEnv.mockReturnValue({
        STRIPE_SECRET_KEY: 'sk_test_123456789',
        STRIPE_WEBHOOK_SECRET: 'whsec_123456789',
      });

      MockStripeAgentToolkit.mockImplementation(() => {
        throw new Error('Toolkit initialization failed');
      });

      await expect(import('../src/ai')).rejects.toThrow('Toolkit initialization failed');
    });
  });

  describe('module exports', () => {
    beforeEach(() => {
      // Reset the mock to default behavior for module export tests
      MockStripeAgentToolkit.mockImplementation(config => ({
        ...mockStripeAgentToolkit,
        configuration: config.configuration,
        secretKey: config.secretKey,
      }));
    });

    test('should export paymentsAgentToolkit', async () => {
      mockSafeEnv.mockReturnValue({
        STRIPE_SECRET_KEY: 'sk_test_123456789',
        STRIPE_WEBHOOK_SECRET: 'whsec_123456789',
      });

      const module = await import('../src/ai');

      expect(module).toHaveProperty('paymentsAgentToolkit');
    });

    test('should be the only export', async () => {
      mockSafeEnv.mockReturnValue({
        STRIPE_SECRET_KEY: 'sk_test_123456789',
        STRIPE_WEBHOOK_SECRET: 'whsec_123456789',
      });

      const module = await import('../src/ai');

      expect(Object.keys(module)).toStrictEqual(['paymentsAgentToolkit']);
    });
  });
});
