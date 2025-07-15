import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock observability
vi.mock('@repo/observability/server/next', () => ({
  logError: vi.fn(),
  logWarn: vi.fn(),
}));

// Mock Next.js headers
vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

// Mock the server module
vi.mock('../src/server', () => ({
  constructEvent: vi.fn(),
  stripe: {},
}));

describe('payments Server Next.js Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('module exports', () => {
    test('should export createWebhookHandler', async () => {
      const { createWebhookHandler } = await import('../src/server-next');
      expect(typeof createWebhookHandler).toBe('function');
    });

    test('should export createPaymentIntentUtil', async () => {
      const { createPaymentIntentUtil } = await import('../src/server-next');
      expect(typeof createPaymentIntentUtil).toBe('function');
    });

    test('should export createCustomerUtil', async () => {
      const { createCustomerUtil } = await import('../src/server-next');
      expect(typeof createCustomerUtil).toBe('function');
    });

    test('should export createSubscriptionUtil', async () => {
      const { createSubscriptionUtil } = await import('../src/server-next');
      expect(typeof createSubscriptionUtil).toBe('function');
    });

    test('should re-export server utilities', async () => {
      const serverNext = await import('../src/server-next');
      expect(serverNext).toBeDefined();
    });
  });

  describe('createWebhookHandler', () => {
    test('should create a webhook handler function', async () => {
      const { createWebhookHandler } = await import('../src/server-next');
      const handlers = {
        'payment_intent.succeeded': vi.fn(),
      };

      const handler = createWebhookHandler(handlers);
      expect(typeof handler).toBe('function');
    });

    test('should process webhook with valid signature', async () => {
      const { headers } = await import('next/headers');
      const { constructEvent } = await import('../src/server');
      const { createWebhookHandler } = await import('../src/server-next');

      const mockEvent = {
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_123' } },
      };

      (headers as any).mockResolvedValue({
        get: vi.fn().mockReturnValue('test-signature'),
      });
      (constructEvent as any).mockReturnValue(mockEvent);

      const mockHandler = vi.fn();
      const handlers = {
        'payment_intent.succeeded': mockHandler,
      };

      const webhookHandler = createWebhookHandler(handlers);

      const mockRequest = {
        text: vi.fn().mockResolvedValue('webhook-body'),
      } as unknown as NextRequest;

      const response = await webhookHandler(mockRequest);

      expect(constructEvent).toHaveBeenCalledWith('webhook-body', 'test-signature');
      expect(mockHandler).toHaveBeenCalledWith({ id: 'pi_123' });

      const responseData = await response.json();
      expect(responseData).toEqual({ received: true });
    });

    test('should return error for missing signature', async () => {
      const { headers } = await import('next/headers');
      const { createWebhookHandler } = await import('../src/server-next');

      (headers as any).mockResolvedValue({
        get: vi.fn().mockReturnValue(null),
      });

      const handlers = {};
      const webhookHandler = createWebhookHandler(handlers);

      const mockRequest = {
        text: vi.fn().mockResolvedValue('webhook-body'),
      } as unknown as NextRequest;

      const response = await webhookHandler(mockRequest);

      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData).toEqual({ error: 'Missing stripe-signature header' });
    });

    test('should log warning for unhandled event types', async () => {
      const { headers } = await import('next/headers');
      const { constructEvent } = await import('../src/server');
      const { logWarn } = await import('@repo/observability/server/next');
      const { createWebhookHandler } = await import('../src/server-next');

      const mockEvent = {
        type: 'unhandled.event',
        data: { object: { id: 'obj_123' } },
      };

      (headers as any).mockResolvedValue({
        get: vi.fn().mockReturnValue('test-signature'),
      });
      (constructEvent as any).mockReturnValue(mockEvent);

      const handlers = {};
      const webhookHandler = createWebhookHandler(handlers);

      const mockRequest = {
        text: vi.fn().mockResolvedValue('webhook-body'),
      } as unknown as NextRequest;

      await webhookHandler(mockRequest);

      expect(logWarn).toHaveBeenCalledWith('Unhandled event type: unhandled.event', {
        eventType: 'unhandled.event',
      });
    });

    test('should handle errors gracefully', async () => {
      const { headers } = await import('next/headers');
      const { constructEvent } = await import('../src/server');
      const { logError } = await import('@repo/observability/server/next');
      const { createWebhookHandler } = await import('../src/server-next');

      (headers as any).mockResolvedValue({
        get: vi.fn().mockReturnValue('test-signature'),
      });
      (constructEvent as any).mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const handlers = {};
      const webhookHandler = createWebhookHandler(handlers);

      const mockRequest = {
        text: vi.fn().mockResolvedValue('webhook-body'),
      } as unknown as NextRequest;

      const response = await webhookHandler(mockRequest);

      expect(logError).toHaveBeenCalledWith('Webhook error', expect.any(Error), expect.any(Object));
      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData).toHaveProperty('error');
    });
  });

  describe('createPaymentIntentUtil', () => {
    test('should create payment intent successfully', async () => {
      const { stripe } = await import('../src/server');
      const { createPaymentIntentUtil } = await import('../src/server-next');

      const mockPaymentIntent = {
        id: 'pi_123',
        client_secret: 'pi_123_secret',
        status: 'requires_payment_method',
      };

      (stripe as any).paymentIntents = {
        create: vi.fn().mockResolvedValue(mockPaymentIntent),
      };

      const result = await createPaymentIntentUtil({
        amount: 1000,
        currency: 'usd',
        customer: 'cus_123',
        metadata: { orderId: '123' },
      });

      expect(stripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 1000,
        currency: 'usd',
        customer: 'cus_123',
        metadata: { orderId: '123' },
        payment_method_types: ['card'],
      });

      expect(result).toEqual({
        id: 'pi_123',
        client_secret: 'pi_123_secret',
        status: 'requires_payment_method',
      });
    });

    test('should use default currency when not provided', async () => {
      const { stripe } = await import('../src/server');
      const { createPaymentIntentUtil } = await import('../src/server-next');

      const mockPaymentIntent = {
        id: 'pi_123',
        client_secret: 'pi_123_secret',
        status: 'requires_payment_method',
      };

      (stripe as any).paymentIntents = {
        create: vi.fn().mockResolvedValue(mockPaymentIntent),
      };

      await createPaymentIntentUtil({ amount: 1000 });

      expect(stripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 1000,
        currency: 'usd',
        customer: undefined,
        metadata: undefined,
        payment_method_types: ['card'],
      });
    });

    test('should handle errors and log them', async () => {
      const { stripe } = await import('../src/server');
      const { logError } = await import('@repo/observability/server/next');
      const { createPaymentIntentUtil } = await import('../src/server-next');

      const error = new Error('Stripe error');
      (stripe as any).paymentIntents = {
        create: vi.fn().mockRejectedValue(error),
      };

      await expect(createPaymentIntentUtil({ amount: 1000 })).rejects.toThrow('Stripe error');

      expect(logError).toHaveBeenCalledWith('Error creating payment intent', error, {
        operation: 'createPaymentIntent',
      });
    });

    test('should handle non-Error objects', async () => {
      const { stripe } = await import('../src/server');
      const { logError } = await import('@repo/observability/server/next');
      const { createPaymentIntentUtil } = await import('../src/server-next');

      const errorMessage = 'String error';
      (stripe as any).paymentIntents = {
        create: vi.fn().mockRejectedValue(errorMessage),
      };

      await expect(createPaymentIntentUtil({ amount: 1000 })).rejects.toThrow('String error');

      expect(logError).toHaveBeenCalledWith('Error creating payment intent', expect.any(Error), {
        operation: 'createPaymentIntent',
      });
    });
  });

  describe('createCustomerUtil', () => {
    test('should create customer successfully', async () => {
      const { stripe } = await import('../src/server');
      const { createCustomerUtil } = await import('../src/server-next');

      const mockCustomer = {
        id: 'cus_123',
        email: 'test@example.com',
        name: 'Test User',
      };

      (stripe as any).customers = {
        create: vi.fn().mockResolvedValue(mockCustomer),
      };

      const result = await createCustomerUtil({
        email: 'test@example.com',
        name: 'Test User',
        metadata: { userId: '123' },
      });

      expect(stripe.customers.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
        metadata: { userId: '123' },
      });

      expect(result).toEqual({
        id: 'cus_123',
        email: 'test@example.com',
        name: 'Test User',
      });
    });

    test('should create customer with minimal params', async () => {
      const { stripe } = await import('../src/server');
      const { createCustomerUtil } = await import('../src/server-next');

      const mockCustomer = {
        id: 'cus_123',
        email: 'test@example.com',
        name: null,
      };

      (stripe as any).customers = {
        create: vi.fn().mockResolvedValue(mockCustomer),
      };

      const result = await createCustomerUtil({
        email: 'test@example.com',
      });

      expect(stripe.customers.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: undefined,
        metadata: undefined,
      });

      expect(result).toEqual({
        id: 'cus_123',
        email: 'test@example.com',
        name: null,
      });
    });

    test('should handle errors and log them', async () => {
      const { stripe } = await import('../src/server');
      const { logError } = await import('@repo/observability/server/next');
      const { createCustomerUtil } = await import('../src/server-next');

      const error = new Error('Customer creation failed');
      (stripe as any).customers = {
        create: vi.fn().mockRejectedValue(error),
      };

      await expect(createCustomerUtil({ email: 'test@example.com' })).rejects.toThrow(
        'Customer creation failed',
      );

      expect(logError).toHaveBeenCalledWith('Error creating customer', error, {
        operation: 'createCustomer',
      });
    });

    test('should handle non-Error objects', async () => {
      const { stripe } = await import('../src/server');
      const { logError } = await import('@repo/observability/server/next');
      const { createCustomerUtil } = await import('../src/server-next');

      const errorMessage = 'String error';
      (stripe as any).customers = {
        create: vi.fn().mockRejectedValue(errorMessage),
      };

      await expect(createCustomerUtil({ email: 'test@example.com' })).rejects.toThrow(
        'String error',
      );

      expect(logError).toHaveBeenCalledWith('Error creating customer', expect.any(Error), {
        operation: 'createCustomer',
      });
    });
  });

  describe('createSubscriptionUtil', () => {
    test('should create subscription successfully', async () => {
      const { stripe } = await import('../src/server');
      const { createSubscriptionUtil } = await import('../src/server-next');

      const mockSubscription = {
        id: 'sub_123',
        status: 'active',
        current_period_end: 1234567890,
        current_period_start: 1234567800,
      };

      (stripe as any).subscriptions = {
        create: vi.fn().mockResolvedValue(mockSubscription),
      };

      const result = await createSubscriptionUtil({
        customer: 'cus_123',
        priceId: 'price_123',
        metadata: { planId: '123' },
        trialPeriodDays: 14,
      });

      expect(stripe.subscriptions.create).toHaveBeenCalledWith({
        customer: 'cus_123',
        items: [{ price: 'price_123' }],
        metadata: { planId: '123' },
        trial_period_days: 14,
      });

      expect(result).toEqual({
        id: 'sub_123',
        status: 'active',
        current_period_end: 1234567890,
        current_period_start: 1234567800,
      });
    });

    test('should create subscription with minimal params', async () => {
      const { stripe } = await import('../src/server');
      const { createSubscriptionUtil } = await import('../src/server-next');

      const mockSubscription = {
        id: 'sub_123',
        status: 'trialing',
      };

      (stripe as any).subscriptions = {
        create: vi.fn().mockResolvedValue(mockSubscription),
      };

      const result = await createSubscriptionUtil({
        customer: 'cus_123',
        priceId: 'price_123',
      });

      expect(stripe.subscriptions.create).toHaveBeenCalledWith({
        customer: 'cus_123',
        items: [{ price: 'price_123' }],
        metadata: undefined,
        trial_period_days: undefined,
      });

      expect(result).toEqual({
        id: 'sub_123',
        status: 'trialing',
      });
    });

    test('should handle subscription without period dates', async () => {
      const { stripe } = await import('../src/server');
      const { createSubscriptionUtil } = await import('../src/server-next');

      const mockSubscription = {
        id: 'sub_123',
        status: 'incomplete',
        // No current_period_end or current_period_start
      };

      (stripe as any).subscriptions = {
        create: vi.fn().mockResolvedValue(mockSubscription),
      };

      const result = await createSubscriptionUtil({
        customer: 'cus_123',
        priceId: 'price_123',
      });

      expect(result).toEqual({
        id: 'sub_123',
        status: 'incomplete',
      });
    });
  });
});
