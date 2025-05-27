import { StripeAgentToolkit } from '@stripe/agent-toolkit/ai-sdk';

import { keys } from './keys';

export const paymentsAgentToolkit = new StripeAgentToolkit({
  configuration: {
    actions: {
      paymentLinks: {
        create: true,
      },
      prices: {
        create: true,
      },
      products: {
        create: true,
      },
    },
  },
  secretKey: keys().STRIPE_SECRET_KEY,
});
