import { beforeEach, describe, expect, it } from "vitest";

import { mockStripeKeys } from "@repo/testing/shared";

import { paymentsAgentToolkit } from "../ai";
import { stripe } from "../index";
import { keys } from "../keys";

describe.skip("Payments with Mock Registry", function () {
  beforeEach(() => {
    // Reset mock values before each test
    mockStripeKeys.reset();
  });

  it("should use default mock values", () => {
    const keysObj = keys();
    expect(keysObj.STRIPE_SECRET_KEY).toBe("sk_test_stripe_secret_key");
    expect(keysObj.STRIPE_WEBHOOK_SECRET).toBe(
      "whsec_test_stripe_webhook_secret",
    );
  });

  it("should allow overriding mock values for specific tests", () => {
    // Override the Stripe secret key for this test
    mockStripeKeys.override(
      {
        secretKey: "sk_test_custom_key_for_this_test",
      },
      () => {
        const keysObj = keys();
        expect(keysObj.STRIPE_SECRET_KEY).toBe(
          "sk_test_custom_key_for_this_test",
        );

        // The webhook secret should still have the default value
        expect(keysObj.STRIPE_WEBHOOK_SECRET).toBe(
          "whsec_test_stripe_webhook_secret",
        );
      },
    );

    // After the override callback, values should be restored to defaults
    const keysObj = keys();
    expect(keysObj.STRIPE_SECRET_KEY).toBe("sk_test_stripe_secret_key");
  });

  it("should verify that stripe client is initialized with mock key", () => {
    // We can't directly check the API key used to initialize the Stripe client,
    // but we can verify that the client was initialized
    expect(stripe).toBeDefined();
    expect(stripe.customers).toBeDefined();
    expect(stripe.subscriptions).toBeDefined();
  });

  it("should verify that paymentsAgentToolkit is initialized with mock key", () => {
    // We can't directly check the API key used to initialize the toolkit,
    // but we can verify that the toolkit was initialized
    expect(paymentsAgentToolkit).toBeDefined();
  });

  it("demonstrates setting a custom mock value", () => {
    // Set a custom mock value
    mockStripeKeys.setSecretKey("sk_test_custom_key");

    // Verify that the custom value is used
    const keysObj = keys();
    expect(keysObj.STRIPE_SECRET_KEY).toBe("sk_test_custom_key");

    // Reset to default
    mockStripeKeys.reset();

    // Verify that the default value is restored
    const resetKeysObj = keys();
    expect(resetKeysObj.STRIPE_SECRET_KEY).toBe("sk_test_stripe_secret_key");
  });
});
