import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';
import { mockStripeKeys } from '@repo/testing/shared';

export const keys = () => {
  const isTestEnv = process.env.NODE_ENV === 'test';

  // Return mock values in test environment
  if (isTestEnv) {
    return {
      STRIPE_SECRET_KEY: mockStripeKeys.getSecretKey(),
      STRIPE_WEBHOOK_SECRET: mockStripeKeys.getWebhookSecret(),
    };
  }

  return createEnv({
    server: {
      STRIPE_SECRET_KEY: z.string().min(1).startsWith('sk_'),
      STRIPE_WEBHOOK_SECRET: z.string().min(1).startsWith('whsec_').optional(),
    },
    runtimeEnv: {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    },
  });
};
