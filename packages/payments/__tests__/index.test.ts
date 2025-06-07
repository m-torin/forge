import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock Stripe SDK
const mockStripe = {
  checkout: {
    sessions: {
      create: vi.fn(),
      list: vi.fn(),
      retrieve: vi.fn(),
    },
  },
  customers: {
    create: vi.fn(),
    del: vi.fn(),
    list: vi.fn(),
    retrieve: vi.fn(),
    update: vi.fn(),
  },
  invoices: {
    create: vi.fn(),
    del: vi.fn(),
    list: vi.fn(),
    retrieve: vi.fn(),
    update: vi.fn(),
  },
  paymentIntents: {
    cancel: vi.fn(),
    create: vi.fn(),
    list: vi.fn(),
    retrieve: vi.fn(),
    update: vi.fn(),
  },
  prices: {
    create: vi.fn(),
    del: vi.fn(),
    list: vi.fn(),
    retrieve: vi.fn(),
    update: vi.fn(),
  },
  products: {
    create: vi.fn(),
    del: vi.fn(),
    list: vi.fn(),
    retrieve: vi.fn(),
    update: vi.fn(),
  },
  subscriptions: {
    create: vi.fn(),
    del: vi.fn(),
    list: vi.fn(),
    retrieve: vi.fn(),
    update: vi.fn(),
  },
};

vi.mock('stripe', () => {
  return {
    default: vi.fn().mockImplementation(() => mockStripe),
  };
});

// Mock the keys module
const mockKeys = vi.fn();
vi.mock('../keys', () => ({
  keys: mockKeys,
}));

describe('Stripe Payment Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset the module cache to get fresh imports
    vi.resetModules();

    // Reset warning state
    (global as any).hasLoggedWarning = false;

    // Clear console.warn spy
    vi.clearAllMocks();
  });

  describe('with valid Stripe key', () => {
    beforeEach(() => {
      mockKeys.mockReturnValue({
        STRIPE_SECRET_KEY: 'sk_test_123456789',
        STRIPE_WEBHOOK_SECRET: 'whsec_123456789',
      });
    });

    it('should initialize Stripe instance when key is available', async () => {
      const { stripe } = await import('../index');

      // Access a property to trigger initialization
      const customers = stripe.customers;

      expect(customers).toBe(mockStripe.customers);
    });

    it('should reuse same Stripe instance on subsequent access', async () => {
      const { stripe } = await import('../index');

      const customers1 = stripe.customers;
      const customers2 = stripe.customers;

      expect(customers1).toBe(customers2);
    });

    it('should provide access to all Stripe resources', async () => {
      const { stripe } = await import('../index');

      expect(stripe.customers).toBe(mockStripe.customers);
      expect(stripe.products).toBe(mockStripe.products);
      expect(stripe.prices).toBe(mockStripe.prices);
      expect(stripe.paymentIntents).toBe(mockStripe.paymentIntents);
      expect(stripe.subscriptions).toBe(mockStripe.subscriptions);
      expect(stripe.invoices).toBe(mockStripe.invoices);
      expect(stripe.checkout).toBe(mockStripe.checkout);
    });

    it('should support creating customers', async () => {
      const { stripe } = await import('../index');

      const customerData = {
        name: 'Test Customer',
        email: 'test@example.com',
      };

      const mockCustomer = { id: 'cus_123', ...customerData };
      mockStripe.customers.create.mockResolvedValue(mockCustomer);

      const result = await stripe.customers.create(customerData);

      expect(mockStripe.customers.create).toHaveBeenCalledWith(customerData);
      expect(result).toEqual(mockCustomer);
    });

    it('should support creating payment intents', async () => {
      const { stripe } = await import('../index');

      const paymentData = {
        amount: 2000,
        currency: 'usd',
        customer: 'cus_123',
      };

      const mockPaymentIntent = {
        id: 'pi_123',
        status: 'requires_payment_method',
        ...paymentData,
      };

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

      const result = await stripe.paymentIntents.create(paymentData);

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(paymentData);
      expect(result).toEqual(mockPaymentIntent);
    });

    it('should support creating products', async () => {
      const { stripe } = await import('../index');

      const productData = {
        name: 'Test Product',
        description: 'A test product',
      };

      const mockProduct = { id: 'prod_123', ...productData };
      mockStripe.products.create.mockResolvedValue(mockProduct);

      const result = await stripe.products.create(productData);

      expect(mockStripe.products.create).toHaveBeenCalledWith(productData);
      expect(result).toEqual(mockProduct);
    });

    it('should support creating subscriptions', async () => {
      const { stripe } = await import('../index');

      const subscriptionData = {
        customer: 'cus_123',
        items: [{ price: 'price_123' }],
      };

      const mockSubscription = {
        id: 'sub_123',
        status: 'active',
        ...subscriptionData,
      };

      mockStripe.subscriptions.create.mockResolvedValue(mockSubscription);

      const result = await stripe.subscriptions.create(subscriptionData);

      expect(mockStripe.subscriptions.create).toHaveBeenCalledWith(subscriptionData);
      expect(result).toEqual(mockSubscription);
    });
  });

  describe('without Stripe key', () => {
    beforeEach(() => {
      mockKeys.mockReturnValue({
        STRIPE_SECRET_KEY: undefined,
        STRIPE_WEBHOOK_SECRET: undefined,
      });
    });

    it('should log warning once when key is missing', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const { stripe } = await import('../index');

      // Access a property to trigger the warning
      stripe.customers;
      stripe.customers; // Second access should not log again

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Stripe payment service is disabled: Missing STRIPE_SECRET_KEY',
      );

      consoleSpy.mockRestore();
    });

    it('should return mock objects for supported resources', async () => {
      const { stripe } = await import('../index');

      const customers = stripe.customers;
      const products = stripe.products;
      const prices = stripe.prices;
      const paymentIntents = stripe.paymentIntents;
      const subscriptions = stripe.subscriptions;
      const invoices = stripe.invoices;
      const checkout = stripe.checkout;

      expect(customers).toBeDefined();
      expect(products).toBeDefined();
      expect(prices).toBeDefined();
      expect(paymentIntents).toBeDefined();
      expect(subscriptions).toBeDefined();
      expect(invoices).toBeDefined();
      expect(checkout).toBeDefined();
    });

    it('should return undefined for unsupported properties', async () => {
      const { stripe } = await import('../index');

      const unsupportedProperty = (stripe as any).unsupportedProperty;

      expect(unsupportedProperty).toBeUndefined();
    });

    it('should return mock create method for supported resources', async () => {
      const { stripe } = await import('../index');

      const result = await stripe.customers.create({
        email: 'test@example.com',
      });

      expect(result).toEqual({ id: 'mock_customers_id' });
    });

    it('should return mock delete method for supported resources', async () => {
      const { stripe } = await import('../index');

      const result = await stripe.customers.del('cus_123');

      expect(result).toEqual({ id: 'mock_customers_id', deleted: true });
    });

    it('should return mock list method for supported resources', async () => {
      const { stripe } = await import('../index');

      const result = await stripe.customers.list();

      expect(result).toEqual({ data: [], has_more: false });
    });

    it('should return mock retrieve method for supported resources', async () => {
      const { stripe } = await import('../index');

      const result = await stripe.customers.retrieve('cus_123');

      expect(result).toEqual({ id: 'mock_customers_id' });
    });

    it('should return mock update method for supported resources', async () => {
      const { stripe } = await import('../index');

      const result = await stripe.customers.update('cus_123', {
        name: 'Updated Name',
      });

      expect(result).toEqual({ id: 'mock_customers_id' });
    });

    it('should handle all mock operations for different resources', async () => {
      const { stripe } = await import('../index');

      // Test different resources
      const resources = [
        'customers',
        'products',
        'prices',
        'paymentIntents',
        'subscriptions',
        'invoices',
        'checkout',
      ];

      for (const resource of resources) {
        const mockResource = (stripe as any)[resource];
        expect(mockResource).toBeDefined();

        if (mockResource.create) {
          const created = await mockResource.create({});
          expect(created.id).toBe(`mock_${resource}_id`);
        }
      }
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      mockKeys.mockReturnValue({
        STRIPE_SECRET_KEY: 'sk_test_123456789',
        STRIPE_WEBHOOK_SECRET: 'whsec_123456789',
      });
    });

    it('should propagate Stripe API errors', async () => {
      const { stripe } = await import('../index');

      const error = new Error('Invalid customer ID');
      mockStripe.customers.retrieve.mockRejectedValue(error);

      await expect(stripe.customers.retrieve('invalid_id')).rejects.toThrow('Invalid customer ID');
    });

    it('should handle network errors', async () => {
      const { stripe } = await import('../index');

      const networkError = new Error('Network timeout');
      mockStripe.customers.create.mockRejectedValue(networkError);

      await expect(stripe.customers.create({ email: 'test@example.com' })).rejects.toThrow(
        'Network timeout',
      );
    });
  });

  describe('type exports', () => {
    it('should export Stripe types', async () => {
      const module = await import('../index');

      // Check that the module exports exist
      expect(module.stripe).toBeDefined();
      expect(typeof module.stripe).toBe('object');
    });
  });

  describe('proxy behavior', () => {
    beforeEach(() => {
      mockKeys.mockReturnValue({
        STRIPE_SECRET_KEY: 'sk_test_123456789',
        STRIPE_WEBHOOK_SECRET: 'whsec_123456789',
      });
    });

    it('should lazily initialize Stripe instance', async () => {
      const Stripe = (await import('stripe')).default;

      const { stripe } = await import('../index');

      // Stripe should not be called until we access a property
      expect(Stripe).not.toHaveBeenCalled();

      // Access a property to trigger initialization
      stripe.customers;

      expect(Stripe).toHaveBeenCalledWith('sk_test_123456789', {
        apiVersion: '2025-05-28.basil',
      });
    });

    it('should only initialize Stripe once', async () => {
      const Stripe = (await import('stripe')).default;

      const { stripe } = await import('../index');

      // Access multiple properties
      stripe.customers;
      stripe.products;
      stripe.paymentIntents;

      expect(Stripe).toHaveBeenCalledTimes(1);
    });
  });
});
