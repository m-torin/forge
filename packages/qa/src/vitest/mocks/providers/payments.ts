// Centralized payment service mocks for all tests in the monorepo
import { vi } from 'vitest';

// Create a comprehensive Stripe mock SDK for testing
export const mockStripeSdk = {
  customers: {
    create: vi.fn().mockResolvedValue({ id: 'mock_customers_id' }),
    retrieve: vi.fn().mockResolvedValue({ id: 'mock_customers_id' }),
    update: vi.fn().mockResolvedValue({ id: 'mock_customers_id' }),
    del: vi.fn().mockResolvedValue({ id: 'mock_customers_id', deleted: true }),
    list: vi.fn().mockResolvedValue({ data: [], has_more: false }),
  },
  products: {
    create: vi.fn().mockResolvedValue({ id: 'mock_products_id' }),
    retrieve: vi.fn().mockResolvedValue({ id: 'mock_products_id' }),
    update: vi.fn().mockResolvedValue({ id: 'mock_products_id' }),
    del: vi.fn().mockResolvedValue({ id: 'mock_products_id', deleted: true }),
    list: vi.fn().mockResolvedValue({ data: [], has_more: false }),
  },
  prices: {
    create: vi.fn().mockResolvedValue({ id: 'mock_prices_id' }),
    retrieve: vi.fn().mockResolvedValue({ id: 'mock_prices_id' }),
    update: vi.fn().mockResolvedValue({ id: 'mock_prices_id' }),
    del: vi.fn().mockResolvedValue({ id: 'mock_prices_id', deleted: true }),
    list: vi.fn().mockResolvedValue({ data: [], has_more: false }),
  },
  paymentIntents: {
    create: vi.fn().mockResolvedValue({
      id: 'mock_paymentIntents_id',
      client_secret: 'mock_client_secret',
      status: 'requires_payment_method',
    }),
    retrieve: vi.fn().mockResolvedValue({ id: 'mock_paymentIntents_id' }),
    update: vi.fn().mockResolvedValue({ id: 'mock_paymentIntents_id' }),
    confirm: vi.fn().mockResolvedValue({ id: 'mock_paymentIntents_id' }),
    cancel: vi.fn().mockResolvedValue({ id: 'mock_paymentIntents_id' }),
  },
  subscriptions: {
    create: vi.fn().mockResolvedValue({ id: 'mock_subscriptions_id' }),
    retrieve: vi.fn().mockResolvedValue({ id: 'mock_subscriptions_id' }),
    update: vi.fn().mockResolvedValue({ id: 'mock_subscriptions_id' }),
    cancel: vi.fn().mockResolvedValue({ id: 'mock_subscriptions_id' }),
    list: vi.fn().mockResolvedValue({ data: [], has_more: false }),
  },
  invoices: {
    create: vi.fn().mockResolvedValue({ id: 'mock_invoices_id' }),
    retrieve: vi.fn().mockResolvedValue({ id: 'mock_invoices_id' }),
    update: vi.fn().mockResolvedValue({ id: 'mock_invoices_id' }),
    list: vi.fn().mockResolvedValue({ data: [], has_more: false }),
  },
  checkout: {
    sessions: {
      create: vi.fn().mockResolvedValue({ id: 'mock_checkout_id' }),
      retrieve: vi.fn().mockResolvedValue({ id: 'mock_checkout_id' }),
    },
  },
  webhooks: {
    constructEvent: vi.fn().mockReturnValue({
      type: 'payment_intent.succeeded',
      data: { object: { id: 'mock_event_id' } },
    }),
  },
};

// Mock Stripe
vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    customers: {
      create: vi.fn().mockResolvedValue({
        id: 'cus_mock',
        email: 'customer@example.com',
        created: Date.now() / 1000,
      }),
      retrieve: vi.fn().mockResolvedValue({
        id: 'cus_mock',
        email: 'customer@example.com',
      }),
      update: vi.fn().mockResolvedValue({
        id: 'cus_mock',
        email: 'updated@example.com',
      }),
      del: vi.fn().mockResolvedValue({
        id: 'cus_mock',
        deleted: true,
      }),
      list: vi.fn().mockResolvedValue({
        data: [],
        has_more: false,
      }),
    },
    products: {
      create: vi.fn().mockResolvedValue({
        id: 'prod_mock',
        name: 'Test Product',
        active: true,
      }),
      retrieve: vi.fn().mockResolvedValue({
        id: 'prod_mock',
        name: 'Test Product',
      }),
      update: vi.fn().mockResolvedValue({
        id: 'prod_mock',
        name: 'Updated Product',
      }),
      list: vi.fn().mockResolvedValue({
        data: [],
        has_more: false,
      }),
    },
    prices: {
      create: vi.fn().mockResolvedValue({
        id: 'price_mock',
        unit_amount: 1000,
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
      }),
      retrieve: vi.fn().mockResolvedValue({
        id: 'price_mock',
        unit_amount: 1000,
        currency: 'usd',
      }),
      update: vi.fn().mockResolvedValue({
        id: 'price_mock',
        active: false,
      }),
      list: vi.fn().mockResolvedValue({
        data: [],
        has_more: false,
      }),
    },
    subscriptions: {
      create: vi.fn().mockResolvedValue({
        id: 'sub_mock',
        customer: 'cus_mock',
        status: 'active',
        current_period_end: Math.floor(Date.now() / 1000) + 2592000, // 30 days
      }),
      retrieve: vi.fn().mockResolvedValue({
        id: 'sub_mock',
        customer: 'cus_mock',
        status: 'active',
      }),
      update: vi.fn().mockResolvedValue({
        id: 'sub_mock',
        cancel_at_period_end: true,
      }),
      cancel: vi.fn().mockResolvedValue({
        id: 'sub_mock',
        status: 'canceled',
      }),
      list: vi.fn().mockResolvedValue({
        data: [],
        has_more: false,
      }),
    },
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({
          id: 'cs_mock',
          url: 'https://checkout.stripe.com/pay/cs_mock',
          payment_status: 'unpaid',
        }),
        retrieve: vi.fn().mockResolvedValue({
          id: 'cs_mock',
          payment_status: 'paid',
        }),
        expire: vi.fn().mockResolvedValue({
          id: 'cs_mock',
          status: 'expired',
        }),
        listLineItems: vi.fn().mockResolvedValue({
          data: [],
          has_more: false,
        }),
      },
    },
    paymentIntents: {
      create: vi.fn().mockResolvedValue({
        id: 'pi_mock',
        amount: 1000,
        currency: 'usd',
        status: 'requires_payment_method',
        client_secret: 'pi_mock_secret',
      }),
      retrieve: vi.fn().mockResolvedValue({
        id: 'pi_mock',
        status: 'succeeded',
      }),
      update: vi.fn().mockResolvedValue({
        id: 'pi_mock',
        amount: 2000,
      }),
      confirm: vi.fn().mockResolvedValue({
        id: 'pi_mock',
        status: 'succeeded',
      }),
      cancel: vi.fn().mockResolvedValue({
        id: 'pi_mock',
        status: 'canceled',
      }),
    },
    paymentMethods: {
      create: vi.fn().mockResolvedValue({
        id: 'pm_mock',
        type: 'card',
        card: {
          brand: 'visa',
          last4: '4242',
        },
      }),
      retrieve: vi.fn().mockResolvedValue({
        id: 'pm_mock',
        type: 'card',
      }),
      update: vi.fn().mockResolvedValue({
        id: 'pm_mock',
        billing_details: {
          email: 'updated@example.com',
        },
      }),
      attach: vi.fn().mockResolvedValue({
        id: 'pm_mock',
        customer: 'cus_mock',
      }),
      detach: vi.fn().mockResolvedValue({
        id: 'pm_mock',
        customer: null,
      }),
      list: vi.fn().mockResolvedValue({
        data: [],
        has_more: false,
      }),
    },
    invoices: {
      create: vi.fn().mockResolvedValue({
        id: 'in_mock',
        amount_due: 1000,
        status: 'draft',
      }),
      retrieve: vi.fn().mockResolvedValue({
        id: 'in_mock',
        status: 'paid',
      }),
      update: vi.fn().mockResolvedValue({
        id: 'in_mock',
        description: 'Updated invoice',
      }),
      finalizeInvoice: vi.fn().mockResolvedValue({
        id: 'in_mock',
        status: 'open',
      }),
      pay: vi.fn().mockResolvedValue({
        id: 'in_mock',
        status: 'paid',
      }),
      sendInvoice: vi.fn().mockResolvedValue({
        id: 'in_mock',
      }),
      voidInvoice: vi.fn().mockResolvedValue({
        id: 'in_mock',
        status: 'void',
      }),
      list: vi.fn().mockResolvedValue({
        data: [],
        has_more: false,
      }),
    },
    webhookEndpoints: {
      create: vi.fn().mockResolvedValue({
        id: 'we_mock',
        url: 'https://example.com/webhook',
        enabled_events: ['*'],
        secret: 'whsec_mock',
      }),
      retrieve: vi.fn().mockResolvedValue({
        id: 'we_mock',
        url: 'https://example.com/webhook',
      }),
      update: vi.fn().mockResolvedValue({
        id: 'we_mock',
        enabled_events: ['payment_intent.succeeded'],
      }),
      del: vi.fn().mockResolvedValue({
        id: 'we_mock',
        deleted: true,
      }),
      list: vi.fn().mockResolvedValue({
        data: [],
        has_more: false,
      }),
    },
    webhooks: {
      constructEvent: vi.fn((_payload, _header, _secret) => {
        // Mock webhook event construction
        return {
          id: 'evt_mock',
          type: 'payment_intent.succeeded',
          data: {
            object: {
              id: 'pi_mock',
              amount: 1000,
            },
          },
        };
      }),
    },
    billingPortal: {
      sessions: {
        create: vi.fn().mockResolvedValue({
          id: 'bps_mock',
          url: 'https://billing.stripe.com/session/bps_mock',
        }),
      },
    },
  })),
  Stripe: vi.fn().mockImplementation(() => ({
    // Same implementation as default export
  })),
}));

// Export helper functions
export const mockStripeCustomer = (overrides = {}) => ({
  id: 'cus_mock',
  object: 'customer',
  created: Math.floor(Date.now() / 1000),
  email: 'customer@example.com',
  name: 'Test Customer',
  description: null,
  metadata: {},
  ...overrides,
});

export const mockStripeSubscription = (overrides = {}) => ({
  id: 'sub_mock',
  object: 'subscription',
  customer: 'cus_mock',
  status: 'active',
  current_period_start: Math.floor(Date.now() / 1000),
  current_period_end: Math.floor(Date.now() / 1000) + 2592000, // 30 days
  items: {
    data: [
      {
        id: 'si_mock',
        price: {
          id: 'price_mock',
          unit_amount: 1000,
          currency: 'usd',
          recurring: {
            interval: 'month',
          },
        },
      },
    ],
  },
  ...overrides,
});

export const mockStripePaymentIntent = (overrides = {}) => ({
  id: 'pi_mock',
  object: 'payment_intent',
  amount: 1000,
  currency: 'usd',
  status: 'succeeded',
  customer: 'cus_mock',
  created: Math.floor(Date.now() / 1000),
  metadata: {},
  ...overrides,
});

export const mockStripeWebhookEvent = (type: string, data: any) => ({
  id: 'evt_mock',
  object: 'event',
  created: Math.floor(Date.now() / 1000),
  type,
  data: {
    object: data,
  },
  livemode: false,
  pending_webhooks: 0,
  request: {
    id: null,
    idempotency_key: null,
  },
});

export const resetPaymentMocks = () => {
  vi.clearAllMocks();
};
