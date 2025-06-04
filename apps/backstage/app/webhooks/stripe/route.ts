import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { analytics } from '@repo/analytics-legacy';
import { createPrismaAdapter } from '@repo/database/prisma';
import { parseError } from '@repo/observability/error';
import { log } from '@repo/observability/log';
import { stripe } from '@repo/payments';

import { env } from '../../../env';

import type { Stripe } from '@repo/payments';

const adapter = createPrismaAdapter();

const getUserFromCustomerId = async (customerId: string) => {
  // Using the adapter to access the database
  await adapter.initialize();
  const database = await adapter.raw('client', {});

  const user = await database.user.findFirst({
    where: {
      email: {
        contains: customerId, // Temporary solution - you may want to store stripeCustomerId in a different field
      },
    },
  });

  return user;
};

const handleCheckoutSessionCompleted = async (data: Stripe.Checkout.Session) => {
  if (!data.customer) {
    return;
  }

  const customerId = typeof data.customer === 'string' ? data.customer : data.customer.id;
  const user = await getUserFromCustomerId(customerId);

  if (!user) {
    return;
  }

  await analytics.capture('User Subscribed', {
    customerId,
    source: 'stripe-webhook',
    timestamp: new Date().toISOString(),
    userId: user.id,
  });
};

const handleSubscriptionScheduleCanceled = async (data: Stripe.SubscriptionSchedule) => {
  if (!data.customer) {
    return;
  }

  const customerId = typeof data.customer === 'string' ? data.customer : data.customer.id;
  const user = await getUserFromCustomerId(customerId);

  if (!user) {
    return;
  }

  await analytics.capture('User Unsubscribed', {
    customerId,
    source: 'stripe-webhook',
    timestamp: new Date().toISOString(),
    userId: user.id,
  });
};

export const POST = async (request: Request): Promise<Response> => {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ message: 'Not configured', ok: false });
  }

  try {
    const body = await request.text();
    const headerPayload = await headers();
    const signature = headerPayload.get('stripe-signature');

    if (!signature) {
      throw new Error('missing stripe-signature header');
    }

    const event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);

    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      }
      case 'subscription_schedule.canceled': {
        await handleSubscriptionScheduleCanceled(event.data.object);
        break;
      }
      default: {
        log.warn(`Unhandled event type ${event.type}`);
      }
    }

    // PostHog JS SDK auto-flushes, no manual flush needed

    return NextResponse.json({ ok: true, result: event });
  } catch (error) {
    const message = parseError(error);

    log.error(message);

    return NextResponse.json(
      {
        message: 'something went wrong',
        ok: false,
      },
      { status: 500 },
    );
  }
};
