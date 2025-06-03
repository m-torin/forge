"use client";

import { useEffect } from "react";

import { analytics } from "@repo/analytics";
import { AuthLayout, ForgotPasswordForm } from "@repo/design-system/uix";

export default function ForgotPasswordPage() {
  useEffect(() => {
    // Track page view
    analytics.capture("page_viewed", {
      page: "forgot-password",
      title: "Forgot Password",
    });
  }, []);

  return (
    <AuthLayout
      alternativeAction={{
        href: "/sign-in",
        linkText: "Sign in here",
        text: "Remember your password?",
      }}
      subtitle="No worries, we'll send you reset instructions"
      title="Forgot your password?"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
