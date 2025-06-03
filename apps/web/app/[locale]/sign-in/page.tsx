"use client";

import { useEffect } from "react";

import { analytics } from "@repo/analytics";
import { AuthLayout, UnifiedSignIn } from "@repo/design-system/uix";

export default function SignInPage() {
  useEffect(() => {
    // Track page view
    analytics.capture("page_viewed", {
      page: "sign-in",
      title: "Sign In",
    });
  }, []);

  return (
    <AuthLayout
      alternativeAction={{
        href: "/sign-up",
        linkText: "Create one here",
        text: "Don't have an account?",
      }}
      subtitle="Sign in to your account to continue"
      title="Welcome back"
    >
      <UnifiedSignIn />
    </AuthLayout>
  );
}
