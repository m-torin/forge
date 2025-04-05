import "server-only";
import Stripe from "stripe";

import { keys } from "./keys";

// Get keys and ensure they're defined
const keysObj = keys();
const secretKey = keysObj?.STRIPE_SECRET_KEY || "sk_test_stripe_secret_key";

// Create the Stripe client with the secret key
export const stripe = new Stripe(secretKey, {
  apiVersion: "2025-03-31.basil",
});

export type { Stripe } from "stripe";
