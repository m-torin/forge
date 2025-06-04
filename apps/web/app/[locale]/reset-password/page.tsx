"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

import { analytics } from "@repo/analytics-legacy";
import { AuthLayout, ResetPasswordForm } from "@repo/design-system/uix";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    // Track page view
    analytics.capture("page_viewed", {
      hasToken: !!token,
      page: "reset-password",
      title: "Reset Password",
    });
  }, [token]);

  return <ResetPasswordForm token={token} />;
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      alternativeAction={{
        href: "/sign-in",
        linkText: "Sign in here",
        text: "Remember your password?",
      }}
      subtitle="Choose a strong password for your account"
      title="Reset your password"
    >
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </AuthLayout>
  );
}
