"use client";

import { useEffect } from "react";

import { analytics } from "@repo/analytics";
import { AuthLayout, UnifiedSignUp } from "@repo/design-system/uix";

export default function SignUpPage() {
  useEffect(() => {
    // Track page view
    analytics.capture("page_viewed", {
      page: "sign-up",
      title: "Sign Up",
    });
  }, []);

  return (
    <AuthLayout
      alternativeAction={{
        href: "/sign-in",
        linkText: "Sign in here",
        text: "Already have an account?",
      }}
      subtitle="Join thousands of users building amazing products"
      title="Create your account"
    >
      <UnifiedSignUp />
    </AuthLayout>
  );
}
