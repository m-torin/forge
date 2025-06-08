import { beforeEach, describe, expect, it, vi } from 'vitest';

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

const MockStripeAgentToolkit = vi.fn().mockImplementation((config) => ({
  ...mockStripeAgentToolkit,
  configuration: config.configuration,
  secretKey: config.secretKey,
}));

vi.mock('@stripe/agent-toolkit/ai-sdk', () => ({
  StripeAgentToolkit: MockStripeAgentToolkit,
}));

// Mock the keys module
const mockKeys = vi.fn();
vi.mock('../keys', () => ({
  keys: mockKeys,
}));

describe('Stripe AI Agent Toolkit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('with valid Stripe key', () => {
    beforeEach(() => {
      mockKeys.mockReturnValue({
        STRIPE_SECRET_KEY: 'sk_test_123456789',
        STRIPE_WEBHOOK_SECRET: 'whsec_123456789',
      });
    });

    it('should create StripeAgentToolkit when secret key is available', async () => {
      const { paymentsAgentToolkit: _paymentsAgentToolkit } = await import('../ai');

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

      expect(_paymentsAgentToolkit).toBeDefined();
      expect(_paymentsAgentToolkit).not.toBeNull();
    });

    it('should configure toolkit with correct actions', async () => {
      const { paymentsAgentToolkit: _paymentsAgentToolkit } = await import('../ai');

      const toolkitCall = MockStripeAgentToolkit.mock.calls[0][0];

      expect(toolkitCall.configuration.actions).toEqual({
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

    it('should pass secret key to toolkit', async () => {
      const { paymentsAgentToolkit: _paymentsAgentToolkit } = await import('../ai');

      const toolkitCall = MockStripeAgentToolkit.mock.calls[0][0];
      expect(toolkitCall.secretKey).toBe('sk_test_123456789');
    });

    it('should support payment link creation action', async () => {
      const { paymentsAgentToolkit: _paymentsAgentToolkit } = await import('../ai');

      const toolkitCall = MockStripeAgentToolkit.mock.calls[0][0];
      expect(toolkitCall.configuration.actions.paymentLinks.create).toBe(true);
    });

    it('should support price creation action', async () => {
      const { paymentsAgentToolkit: _paymentsAgentToolkit } = await import('../ai');

      const toolkitCall = MockStripeAgentToolkit.mock.calls[0][0];
      expect(toolkitCall.configuration.actions.prices.create).toBe(true);
    });

    it('should support product creation action', async () => {
      const { paymentsAgentToolkit: _paymentsAgentToolkit } = await import('../ai');

      const toolkitCall = MockStripeAgentToolkit.mock.calls[0][0];
      expect(toolkitCall.configuration.actions.products.create).toBe(true);
    });
  });

  describe('without Stripe key', () => {
    beforeEach(() => {
      mockKeys.mockReturnValue({
        STRIPE_SECRET_KEY: undefined,
        STRIPE_WEBHOOK_SECRET: undefined,
      });
    });

    it('should return null when secret key is not available', async () => {
      const { paymentsAgentToolkit: _paymentsAgentToolkit } = await import('../ai');

      expect(MockStripeAgentToolkit).not.toHaveBeenCalled();
      expect(_paymentsAgentToolkit).toBeNull();
    });

    it('should not create toolkit instance when key is missing', async () => {
      const { paymentsAgentToolkit: _paymentsAgentToolkit } = await import('../ai');

      expect(_paymentsAgentToolkit).toBeNull();
      expect(MockStripeAgentToolkit).not.toHaveBeenCalled();
    });
  });

  describe('with empty string key', () => {
    beforeEach(() => {
      mockKeys.mockReturnValue({
        STRIPE_SECRET_KEY: '',
        STRIPE_WEBHOOK_SECRET: 'whsec_123456789',
      });
    });

    it('should return null when secret key is empty string', async () => {
      const { paymentsAgentToolkit: _paymentsAgentToolkit } = await import('../ai');

      expect(MockStripeAgentToolkit).not.toHaveBeenCalled();
      expect(_paymentsAgentToolkit).toBeNull();
    });
  });

  describe('key validation behavior', () => {
    it('should handle truthy string values', async () => {
      mockKeys.mockReturnValue({
        STRIPE_SECRET_KEY: 'sk_live_valid_key',
        STRIPE_WEBHOOK_SECRET: 'whsec_123456789',
      });

      const { paymentsAgentToolkit: _paymentsAgentToolkit } = await import('../ai');

      expect(_paymentsAgentToolkit).not.toBeNull();
      expect(MockStripeAgentToolkit).toHaveBeenCalled();
    });

    it('should handle false values correctly', async () => {
      mockKeys.mockReturnValue({
        STRIPE_SECRET_KEY: false,
        STRIPE_WEBHOOK_SECRET: 'whsec_123456789',
      });

      const { paymentsAgentToolkit: _paymentsAgentToolkit } = await import('../ai');

      expect(_paymentsAgentToolkit).toBeNull();
      expect(MockStripeAgentToolkit).not.toHaveBeenCalled();
    });

    it('should handle null values correctly', async () => {
      mockKeys.mockReturnValue({
        STRIPE_SECRET_KEY: null,
        STRIPE_WEBHOOK_SECRET: 'whsec_123456789',
      });

      const { paymentsAgentToolkit: _paymentsAgentToolkit } = await import('../ai');

      expect(_paymentsAgentToolkit).toBeNull();
      expect(MockStripeAgentToolkit).not.toHaveBeenCalled();
    });
  });

  describe('toolkit configuration', () => {
    beforeEach(() => {
      mockKeys.mockReturnValue({
        STRIPE_SECRET_KEY: 'sk_test_123456789',
        STRIPE_WEBHOOK_SECRET: 'whsec_123456789',
      });
    });

    it('should have correct configuration structure', async () => {
      const { paymentsAgentToolkit: _paymentsAgentToolkit } = await import('../ai');

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

    it('should only enable create actions', async () => {
      const { paymentsAgentToolkit: _paymentsAgentToolkit } = await import('../ai');

      const toolkitCall = MockStripeAgentToolkit.mock.calls[0][0];
      const actions = toolkitCall.configuration.actions;

      // Check that only create actions are enabled
      expect(actions.paymentLinks.create).toBe(true);
      expect(actions.prices.create).toBe(true);
      expect(actions.products.create).toBe(true);

      // Verify no other actions are defined
      expect(Object.keys(actions.paymentLinks)).toEqual(['create']);
      expect(Object.keys(actions.prices)).toEqual(['create']);
      expect(Object.keys(actions.products)).toEqual(['create']);
    });

    it('should not include other Stripe resource actions', async () => {
      const { paymentsAgentToolkit: _paymentsAgentToolkit } = await import('../ai');

      const toolkitCall = MockStripeAgentToolkit.mock.calls[0][0];
      const actions = toolkitCall.configuration.actions;

      // Should only have the three specified resources
      expect(Object.keys(actions)).toEqual(['paymentLinks', 'prices', 'products']);

      // Should not include other common Stripe resources
      expect(actions.customers).toBeUndefined();
      expect(actions.subscriptions).toBeUndefined();
      expect(actions.invoices).toBeUndefined();
      expect(actions.paymentIntents).toBeUndefined();
    });
  });

  describe('integration with keys module', () => {
    it('should call keys function to get secret key', async () => {
      mockKeys.mockReturnValue({
        STRIPE_SECRET_KEY: 'sk_test_123456789',
        STRIPE_WEBHOOK_SECRET: 'whsec_123456789',
      });

      await import('../ai');

      expect(mockKeys).toHaveBeenCalledTimes(1);
    });

    it('should use the exact key returned from keys function', async () => {
      const testKey = 'sk_test_very_specific_key_12345';
      mockKeys.mockReturnValue({
        STRIPE_SECRET_KEY: testKey,
        STRIPE_WEBHOOK_SECRET: 'whsec_123456789',
      });

      const { paymentsAgentToolkit: _paymentsAgentToolkit } = await import('../ai');

      const toolkitCall = MockStripeAgentToolkit.mock.calls[0][0];
      expect(toolkitCall.secretKey).toBe(testKey);
    });
  });

  describe('error handling', () => {
    it('should handle keys function throwing error', async () => {
      mockKeys.mockImplementation(() => {
        throw new Error('Keys configuration error');
      });

      await expect(import('../ai')).rejects.toThrow('Keys configuration error');
    });

    it('should handle StripeAgentToolkit constructor throwing error', async () => {
      mockKeys.mockReturnValue({
        STRIPE_SECRET_KEY: 'sk_test_123456789',
        STRIPE_WEBHOOK_SECRET: 'whsec_123456789',
      });

      MockStripeAgentToolkit.mockImplementation(() => {
        throw new Error('Toolkit initialization failed');
      });

      await expect(import('../ai')).rejects.toThrow('Toolkit initialization failed');
    });
  });

  describe('module exports', () => {
    beforeEach(() => {
      // Reset the mock to default behavior for module export tests
      MockStripeAgentToolkit.mockImplementation((config) => ({
        ...mockStripeAgentToolkit,
        configuration: config.configuration,
        secretKey: config.secretKey,
      }));
    });

    it('should export paymentsAgentToolkit', async () => {
      mockKeys.mockReturnValue({
        STRIPE_SECRET_KEY: 'sk_test_123456789',
        STRIPE_WEBHOOK_SECRET: 'whsec_123456789',
      });

      const module = await import('../ai');

      expect(module).toHaveProperty('paymentsAgentToolkit');
    });

    it('should be the only export', async () => {
      mockKeys.mockReturnValue({
        STRIPE_SECRET_KEY: 'sk_test_123456789',
        STRIPE_WEBHOOK_SECRET: 'whsec_123456789',
      });

      const module = await import('../ai');

      expect(Object.keys(module)).toEqual(['paymentsAgentToolkit']);
    });
  });
});
