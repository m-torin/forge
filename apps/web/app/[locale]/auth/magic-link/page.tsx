"use client";

import { Alert, Anchor, Button, Stack, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconKey, IconMail } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { analytics } from "@repo/analytics-legacy";
import { FLAGS, getAuthFlags, useFlag } from "@repo/analytics-legacy";
import { sendMagicLink } from "@repo/auth/client";
import { AuthForm, AuthLayout } from "@repo/design-system/uix";

export default function MagicLinkPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authFlags, setAuthFlags] = useState<any>(null);

  // Feature flag hooks
  const magicLinkEnabled = useFlag(FLAGS.auth.magicLink);
  const emailMagicLinkEnabled = useFlag(FLAGS.email.magicLink);

  const form = useForm({
    validate: {
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : "Invalid email address",
    },
    initialValues: {
      email: "",
    },
  });

  useEffect(() => {
    // Load auth flags and track page view
    const loadAuthFlags = async () => {
      try {
        const flags = await getAuthFlags();
        setAuthFlags(flags);

        // Track page view with feature flag context
        analytics.capture("page_viewed", {
          emailMagicLinkEnabled,
          featureFlagsLoaded: true,
          magicLinkEnabled: flags.magicLinkEnabled,
          page: "magic-link",
          title: "Magic Link Sign In",
        });

        // Redirect if magic link is disabled
        if (!flags.magicLinkEnabled || !emailMagicLinkEnabled) {
          analytics.capture("magic_link_access_blocked", {
            authMagicLinkEnabled: flags.magicLinkEnabled,
            emailMagicLinkEnabled,
            reason: "feature_flag_disabled",
          });
          setError("Magic link sign-in is currently unavailable");
        }
      } catch (error) {
        console.error("Failed to load auth flags:", error);
        analytics.capture("page_viewed", {
          error: "Failed to load feature flags",
          featureFlagsLoaded: false,
          page: "magic-link",
          title: "Magic Link Sign In",
        });
      }
    };

    loadAuthFlags();
  }, [emailMagicLinkEnabled]);

  const handleSubmit = async (values: typeof form.values) => {
    // Double-check feature flags before sending
    if (!magicLinkEnabled || !emailMagicLinkEnabled) {
      analytics.capture("magic_link_blocked", {
        authMagicLinkEnabled: magicLinkEnabled,
        email: values.email,
        emailMagicLinkEnabled,
        reason: "feature_flag_disabled",
        source: "magic_link_page",
      });
      setError("Magic link sign-in is currently unavailable");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await sendMagicLink?.({ email: values.email });

      // Track magic link request with feature flag context
      analytics.capture("magic_link_requested", {
        email: values.email,
        emailMagicLinkEnabled,
        featureFlagsLoaded: !!authFlags,
        magicLinkEnabled,
        source: "magic_link_page",
      });

      setEmailSent(true);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send magic link";
      setError(errorMessage);

      analytics.capture("magic_link_failed", {
        email: values.email,
        emailMagicLinkEnabled,
        error: errorMessage,
        magicLinkEnabled,
        source: "magic_link_page",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <AuthLayout
        showBranding={false}
        subtitle={`We've sent a magic link to ${form.values.email}`}
        title="Check your email"
      >
        <AuthForm showMagicLink={false} showSocialOptions={false}>
          <Stack gap="md">
            <IconMail
              color="var(--mantine-color-blue-6)"
              style={{ margin: "0 auto" }}
              size={48}
            />

            <Alert color="blue" variant="light">
              Click the link in your email to sign in. The link will expire in
              20 minutes.
            </Alert>

            <Text c="dimmed" size="sm" ta="center">
              Didn't receive the email? Check your spam folder.
            </Text>

            <Stack gap="xs">
              <Button
                fullWidth
                onClick={() => {
                  setEmailSent(false);
                  form.reset();
                  setError(null);
                }}
                variant="outline"
              >
                Send to different email
              </Button>

              <Text size="sm" ta="center">
                <Anchor href={"/sign-in" as any} component={Link}>
                  Back to Sign In
                </Anchor>
              </Text>
            </Stack>
          </Stack>
        </AuthForm>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      alternativeAction={{
        href: "/sign-in",
        linkText: "Sign in here",
        text: "Prefer using a password?",
      }}
      subtitle="Enter your email and we'll send you a secure sign-in link"
      title="Sign in with Magic Link"
    >
      <AuthForm
        error={error}
        isLoading={isLoading}
        showMagicLink={false}
        showSocialOptions={false}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <IconKey
              color="var(--mantine-color-blue-6)"
              style={{ margin: "0 auto 16px" }}
              size={48}
            />

            <TextInput
              leftSection={<IconMail size={16} />}
              placeholder="Enter your email"
              label="Email address"
              required
              {...form.getInputProps("email")}
            />

            <Button fullWidth loading={isLoading} size="md" type="submit">
              Send Magic Link
            </Button>

            <Alert color="blue" variant="light">
              Magic links are secure and expire after 20 minutes. You can only
              use them once.
            </Alert>
          </Stack>
        </form>
      </AuthForm>
    </AuthLayout>
  );
}
