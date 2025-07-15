import { StripeAgentToolkit } from '@stripe/agent-toolkit/ai-sdk';

import { safeEnv } from '../env';

// Get the secret key
const stripeSecretKey = safeEnv().STRIPE_SECRET_KEY;

// Only export the toolkit if the secret key is available
export const paymentsAgentToolkit = stripeSecretKey
  ? new StripeAgentToolkit({
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
      secretKey: stripeSecretKey,
    })
  : null;
