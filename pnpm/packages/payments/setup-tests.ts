import '@repo/testing/src/vitest/core/setup';
import { vi } from 'vitest';

// Mock environment variables
process.env.STRIPE_SECRET_KEY = 'sk_test_stripe_secret_key';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_stripe_webhook_secret';
process.env.NODE_ENV = 'test';

// Mock Stripe
vi.mock('stripe', () => {
  const mockStripe = vi.fn().mockImplementation(() => ({
    customers: {
      create: vi.fn().mockResolvedValue({ id: 'cus_test123' }),
      list: vi.fn().mockResolvedValue({ data: [] }),
    },
    subscriptions: {
      create: vi.fn().mockResolvedValue({ id: 'sub_test123' }),
      list: vi.fn().mockResolvedValue({ data: [] }),
    },
    products: {
      create: vi.fn().mockResolvedValue({ id: 'prod_test123' }),
      list: vi.fn().mockResolvedValue({ data: [] }),
    },
    prices: {
      create: vi.fn().mockResolvedValue({ id: 'price_test123' }),
      list: vi.fn().mockResolvedValue({ data: [] }),
    },
    paymentLinks: {
      create: vi.fn().mockResolvedValue({
        id: 'plink_test123',
        url: 'https://test-payment-link.com',
      }),
      list: vi.fn().mockResolvedValue({ data: [] }),
    },
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({
          id: 'cs_test123',
          url: 'https://test-checkout-session.com',
        }),
        list: vi.fn().mockResolvedValue({ data: [] }),
      },
    },
    webhooks: {
      constructEvent: vi
        .fn()
        .mockReturnValue({ type: 'test.event', data: { object: {} } }),
    },
  }));

  return { default: mockStripe };
});

// Mock @stripe/agent-toolkit
vi.mock('@stripe/agent-toolkit/ai-sdk', () => {
  const mockStripeAgentToolkit = vi.fn().mockImplementation(() => ({
    createPaymentLink: vi
      .fn()
      .mockResolvedValue({ url: 'https://test-payment-link.com' }),
    createProduct: vi.fn().mockResolvedValue({ id: 'prod_test123' }),
    createPrice: vi.fn().mockResolvedValue({ id: 'price_test123' }),
  }));

  return { StripeAgentToolkit: mockStripeAgentToolkit };
});

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock @t3-oss/env-nextjs
vi.mock('@t3-oss/env-nextjs', () => ({
  createEnv: vi.fn().mockImplementation(({ server, runtimeEnv }) => {
    const env = {};
    Object.keys(server).forEach((key) => {
      env[key] = runtimeEnv[key];
    });
    return () => env;
  }),
}));
