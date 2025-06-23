import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { findFirstUserOrm } from '@repo/database/prisma';
import { stripe } from '@repo/payments/server/next';

import { env } from '../../../env';

import type { Stripe } from '@repo/payments/server/next';

export const dynamic = 'force-dynamic';

const getUserFromCustomerId = async (customerId: string) => {
  const user = await findFirstUserOrm({
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

  console.log('User Subscribed', {
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

  console.log('User Unsubscribed', {
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
        console.warn(`Unhandled event type ${event.type}`);
      }
    }

    // PostHog JS SDK auto-flushes, no manual flush needed

    return NextResponse.json({ ok: true, result: event });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    console.error(message, { error });

    return NextResponse.json(
      {
        message: 'something went wrong',
        ok: false,
      },
      { status: 500 },
    );
  }
};
