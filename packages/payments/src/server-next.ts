import 'server-only';

// Next.js specific server utilities
import { logError, logWarn } from '@repo/observability/server/next';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { constructEvent, stripe } from './server';

// Re-export all server utilities
export * from './server';

/**
 * Next.js specific webhook handler utility
 * Handles the common pattern of webhook verification and processing
 */
export const createWebhookHandler = (
  handlers: Record<string, (event: any) => Promise<void> | void>,
) => {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const body = await request.text();
      const headersList = await headers();
      const signature = headersList.get('stripe-signature');

      if (!signature) {
        return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
      }

      const event = constructEvent(body, signature);

      const handler = handlers[event.type];
      if (handler) {
        await handler(event.data.object);
      } else {
        logWarn(`Unhandled event type: ${event.type}`, { eventType: event.type });
      }

      return NextResponse.json({ received: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logError('Webhook error', error instanceof Error ? error : new Error(message), {
        operation: 'webhook',
      });

      return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
    }
  };
};

/**
 * Server action for creating a payment intent
 * Following CLAUDE.md conventions - would need 'use server' directive if this was an action
 */
export const createPaymentIntentUtil = async (params: {
  amount: number;
  currency?: string;
  customer?: string;
  metadata?: Record<string, string>;
}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: params.amount,
      currency: params.currency || 'usd',
      customer: params.customer,
      metadata: params.metadata,
      payment_method_types: ['card'],
    });

    return {
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      status: paymentIntent.status,
    };
  } catch (error) {
    logError(
      'Error creating payment intent',
      error instanceof Error ? error : new Error(String(error)),
      { operation: 'createPaymentIntent' },
    );
    throw error;
  }
};

/**
 * Server action for creating a customer
 * Following CLAUDE.md conventions - would need 'use server' directive if this was an action
 */
export const createCustomerUtil = async (params: {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}) => {
  try {
    const customer = await stripe.customers.create({
      email: params.email,
      name: params.name,
      metadata: params.metadata,
    });

    return {
      id: customer.id,
      email: customer.email,
      name: customer.name,
    };
  } catch (error) {
    logError('Error creating customer', error instanceof Error ? error : new Error(String(error)), {
      operation: 'createCustomer',
    });
    throw error;
  }
};

/**
 * Server action for creating a subscription
 */
export const createSubscriptionUtil = async (params: {
  customer: string;
  priceId: string;
  metadata?: Record<string, string>;
  trialPeriodDays?: number;
}) => {
  const subscription = await stripe.subscriptions.create({
    customer: params.customer,
    items: [{ price: params.priceId }],
    metadata: params.metadata,
    trial_period_days: params.trialPeriodDays,
  });

  return {
    id: subscription.id,
    status: subscription.status,
    // Note: current_period_end and current_period_start are only available on active subscriptions
    // For type safety, we'll use any available properties or provide defaults
    ...((subscription as any).current_period_end && {
      current_period_end: (subscription as any).current_period_end,
    }),
    ...((subscription as any).current_period_start && {
      current_period_start: (subscription as any).current_period_start,
    }),
  };
};
