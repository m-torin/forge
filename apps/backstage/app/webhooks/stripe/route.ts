import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { Analytics } from '@repo/analytics/server';
import { createPrismaAdapter } from '@repo/database/prisma';
import { parseError } from '@repo/observability/error';
import { log } from '@repo/observability/log';
import { stripe } from '@repo/payments';

import { env } from '../../../env';

import type { Stripe } from '@repo/payments';

const adapter = createPrismaAdapter();

// Initialize analytics with environment-based providers
const analytics = new Analytics({
  providers: {
    posthog: process.env.NEXT_PUBLIC_POSTHOG_KEY ? {
      apiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
      config: {
        apiHost: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      }
    } : undefined,
    segment: process.env.SEGMENT_WRITE_KEY ? {
      writeKey: process.env.SEGMENT_WRITE_KEY,
    } : undefined,
    googleAnalytics: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? {
      measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    } : undefined,
  },
  debug: process.env.NODE_ENV === 'development',
});

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

  await analytics.track('User Subscribed', {
    userId: user.id,
    customerId,
    timestamp: new Date().toISOString(),
    source: 'stripe-webhook',
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

  await analytics.track('User Unsubscribed', {
    userId: user.id,
    customerId,
    timestamp: new Date().toISOString(),
    source: 'stripe-webhook',
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

    await analytics.flush();

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
