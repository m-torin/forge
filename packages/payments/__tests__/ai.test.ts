import { describe, expect, it, vi, beforeEach } from 'vitest';
import { paymentsAgentToolkit } from '../ai';
import { StripeAgentToolkit } from '@stripe/agent-toolkit/ai-sdk';
import { keys } from '../keys';

// Import the mocked modules
vi.mock('@stripe/agent-toolkit/ai-sdk');
vi.mock('../keys');

describe.skip('Payments Agent Toolkit', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Mock keys to return a function that returns test values
    (keys as any).mockImplementation(() => ({
      STRIPE_SECRET_KEY: 'sk_test_stripe_secret_key',
    }));
  });

  it('initializes StripeAgentToolkit with the correct API key', () => {
    // The paymentsAgentToolkit is created when the module is imported,
    // so we need to verify that StripeAgentToolkit was called with the correct parameters
    expect(StripeAgentToolkit).toHaveBeenCalledWith({
      secretKey: 'sk_test_stripe_secret_key',
      configuration: {
        actions: {
          paymentLinks: {
            create: true,
          },
          products: {
            create: true,
          },
          prices: {
            create: true,
          },
        },
      },
    });
  });

  it('exports the paymentsAgentToolkit instance', () => {
    // Verify that the paymentsAgentToolkit instance is exported
    expect(paymentsAgentToolkit).toBeDefined();
  });

  it('configures the toolkit with the correct permissions', () => {
    // Verify that the toolkit is configured with the correct permissions
    expect(StripeAgentToolkit).toHaveBeenCalledWith(
      expect.objectContaining({
        configuration: {
          actions: {
            paymentLinks: {
              create: true,
            },
            products: {
              create: true,
            },
            prices: {
              create: true,
            },
          },
        },
      }),
    );
  });

  it('uses the API key from environment variables', () => {
    // Mock keys to return a function that returns a different API key
    (keys as any).mockImplementation(() => ({
      STRIPE_SECRET_KEY: 'sk_test_different_key',
    }));

    // Re-import the module to test with the new API key
    vi.isolateModules(() => {
      const { paymentsAgentToolkit: newToolkit } = require('../ai');

      // Verify that StripeAgentToolkit was called with the new API key
      expect(StripeAgentToolkit).toHaveBeenCalledWith(
        expect.objectContaining({
          secretKey: 'sk_test_different_key',
        }),
      );

      // Verify that the new toolkit instance is exported
      expect(newToolkit).toBeDefined();
    });
  });

  it('can create payment links', async () => {
    // Mock the createPaymentLink method
    const mockCreatePaymentLink = vi.fn().mockResolvedValue({
      url: 'https://test-payment-link.com',
    });

    // Set up the mock implementation
    (StripeAgentToolkit as any).mockImplementation(() => ({
      createPaymentLink: mockCreatePaymentLink,
    }));

    // Re-import the module to get the updated implementation
    vi.isolateModules(() => {
      const { paymentsAgentToolkit: toolkit } = require('../ai');

      // Call the method
      toolkit.createPaymentLink({
        name: 'Test Product',
        price: 1000,
      });

      // Verify that the method was called with the correct parameters
      expect(mockCreatePaymentLink).toHaveBeenCalledWith({
        name: 'Test Product',
        price: 1000,
      });
    });
  });

  it('can create products', async () => {
    // Mock the createProduct method
    const mockCreateProduct = vi.fn().mockResolvedValue({
      id: 'prod_test123',
    });

    // Set up the mock implementation
    (StripeAgentToolkit as any).mockImplementation(() => ({
      createProduct: mockCreateProduct,
    }));

    // Re-import the module to get the updated implementation
    vi.isolateModules(() => {
      const { paymentsAgentToolkit: toolkit } = require('../ai');

      // Call the method
      toolkit.createProduct({
        name: 'Test Product',
      });

      // Verify that the method was called with the correct parameters
      expect(mockCreateProduct).toHaveBeenCalledWith({
        name: 'Test Product',
      });
    });
  });

  it('can create prices', async () => {
    // Mock the createPrice method
    const mockCreatePrice = vi.fn().mockResolvedValue({
      id: 'price_test123',
    });

    // Set up the mock implementation
    (StripeAgentToolkit as any).mockImplementation(() => ({
      createPrice: mockCreatePrice,
    }));

    // Re-import the module to get the updated implementation
    vi.isolateModules(() => {
      const { paymentsAgentToolkit: toolkit } = require('../ai');

      // Call the method
      toolkit.createPrice({
        product: 'prod_test123',
        unit_amount: 1000,
        currency: 'usd',
      });

      // Verify that the method was called with the correct parameters
      expect(mockCreatePrice).toHaveBeenCalledWith({
        product: 'prod_test123',
        unit_amount: 1000,
        currency: 'usd',
      });
    });
  });
});
