# @repo/payments

- _Can build:_ **NO**

- _Exports:_
  - **Core**: `./client`, `./server`, `./client/next`, `./server/next`
  - **Utilities**: `./shared`, `./types`, `./webhooks`

- _AI Hints:_

  ```typescript
  // Primary: Stripe integration with webhook handling
  import { stripe, webhooks } from "@repo/payments/server/next";
  // Client: import { useStripe } from "@repo/payments/client/next"
  // ❌ NEVER: Handle payments in client-only code or expose secret keys
  ```

- _Key Features:_
  - **Server-Only Implementation**: Secure server-side Stripe SDK wrapper
  - **Graceful Degradation**: Works without configuration for development (mock
    mode)
  - **AI Agent Toolkit**: Stripe AI SDK for automated payment operations
  - **Webhook Handling**: Built-in webhook verification and type-safe handlers
  - **React Hooks**: Client-side hooks for payment intent and customer
    management

- _Environment Variables:_

  ```bash
  # Development (optional - uses mocks if missing)
  STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
  STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
  
  # Production (required)
  STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
  STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
  ```

- _Quick Examples:_

  ```typescript
  // Server operations
  import { stripe } from "@repo/payments/server";
  const customer = await stripe.customers.create({ email: "user@example.com" });

  // Webhook handler
  import { createWebhookHandler } from "@repo/payments/server/next";
  export const POST = createWebhookHandler({
    "payment_intent.succeeded": async (paymentIntent) => {
      console.log("Payment succeeded:", paymentIntent.id);
    }
  });
  ```

- _Documentation:_ **[Payments Package](../../apps/docs/packages/payments.mdx)**
