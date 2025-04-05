import { StripeAgentToolkit } from "@stripe/agent-toolkit/ai-sdk";

import { keys } from "./keys";

// Get keys and ensure they're defined
const keysObj = keys();
const secretKey = keysObj?.STRIPE_SECRET_KEY || "sk_test_stripe_secret_key";

// Create the toolkit with the secret key
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
  secretKey,
});
