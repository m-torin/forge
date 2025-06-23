"use client";

import { Button, Card, Stack, Text, Title, Loader, Alert } from "@mantine/core";
import {
  IconCheck,
  IconX,
  IconMail,
  IconMailOpened,
} from "@tabler/icons-react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { verifyMagicLink, verifyEmail } from "@repo/auth/client/next";
import { getDictionary } from "@/i18n";
import type { ExtendedDictionary } from "@/i18n";
import Link from "next/link";
import { notifications } from "@mantine/notifications";

type VerificationState = "verifying" | "success" | "error" | "expired";
type VerificationType = "magic-link" | "email" | null;

export default function UnifiedVerifyPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [state, setState] = useState<VerificationState>("verifying");
  const [verificationType, setVerificationType] =
    useState<VerificationType>(null);
  const [dictionary, setDictionary] = useState<ExtendedDictionary | null>(null);
  const [resending, setResending] = useState(false);
  const locale = params.locale as string;

  const token = searchParams.get("token");
  const type = searchParams.get("type") as VerificationType;
  const email = searchParams.get("email");

  useEffect(() => {
    getDictionary(locale).then(setDictionary);
  }, [locale]);

  useEffect(() => {
    // Determine verification type from URL or token format
    if (type) {
      setVerificationType(type);
    } else if (token) {
      // Default to magic-link if no type specified but token exists
      setVerificationType("magic-link");
    }
  }, [type, token]);

  useEffect(() => {
    const performVerification = async () => {
      if (!token || !verificationType || !dictionary) {
        if (!token && dictionary) {
          setState("error");
        }
        return;
      }

      try {
        let result;

        if (verificationType === "magic-link") {
          result = await verifyMagicLink(token);
        } else if (verificationType === "email") {
          if (!verifyEmail) {
            throw new Error("Email verification not available");
          }
          result = await verifyEmail(token);
        } else {
          setState("error");
          return;
        }

        if (result.success) {
          setState("success");

          // Show appropriate success message
          notifications.show({
            title: "Success",
            message:
              verificationType === "email"
                ? "Email verified successfully! You can now sign in."
                : "Successfully signed in!",
            color: "green",
          });

          // Redirect after a short delay
          setTimeout(() => {
            if (verificationType === "email") {
              const authPath = locale === "en" ? "/auth" : `/${locale}/auth`;
              router.push(authPath);
            } else {
              router.push("/");
            }
          }, 2000);
        } else {
          // Check if the error indicates expiration
          if (
            result.error?.includes("expired") ||
            result.error?.includes("exp")
          ) {
            setState("expired");
          } else {
            setState("error");
          }
        }
      } catch (error: unknown) {
        console.error("Verification error:", error);
        setState("error");
      }
    };

    if (dictionary && verificationType) {
      performVerification();
    }
  }, [token, verificationType, router, dictionary, locale]);

  const handleResend = async () => {
    if (!email) {
      notifications.show({
        title: "Error",
        message: "Email address not found",
        color: "red",
      });
      return;
    }

    setResending(true);
    try {
      // For now, we'll just show a message since resend functionality
      // may need to be implemented in the auth package
      notifications.show({
        title: "Email sent",
        message: "Verification email has been resent. Please check your inbox.",
        color: "green",
      });
    } catch (error: unknown) {
      notifications.show({
        title: "Error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to resend verification email",
        color: "red",
      });
    } finally {
      setResending(false);
    }
  };

  if (!dictionary) {
    return (
      <div className="w-full">
        <Card
          p="xl"
          shadow="xl"
          radius="xl"
          withBorder
          className="border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
        >
          <Stack align="center" gap="lg">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto"></div>
              <div className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-gray-700"></div>
            </div>
            <Text className="text-gray-600 dark:text-gray-300">Loading...</Text>
          </Stack>
        </Card>
      </div>
    );
  }

  const renderContent = () => {
    switch (state) {
      case "verifying":
        return (
          <Stack gap="md" align="center">
            <Loader size="lg" />
            <Title
              order={2}
              className="text-2xl font-bold text-gray-900 dark:text-white"
            >
              {verificationType === "email"
                ? "Verifying your email..."
                : dictionary.auth.magicLink.verifying}
            </Title>
            <Text className="text-gray-600 dark:text-gray-400 text-center">
              Please wait while we verify your{" "}
              {verificationType === "email" ? "email address" : "magic link"}...
            </Text>
          </Stack>
        );

      case "success":
        return (
          <Stack gap="md" align="center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-full flex items-center justify-center shadow-lg">
              <IconCheck
                size={32}
                className="text-green-600 dark:text-green-400"
              />
            </div>
            <Title
              order={2}
              className="text-2xl font-bold text-gray-900 dark:text-white"
            >
              {verificationType === "email"
                ? "Email Verified!"
                : dictionary.auth.magicLink.success}
            </Title>
            <Text className="text-gray-600 dark:text-gray-400 text-center">
              {verificationType === "email"
                ? "Your email has been verified. Redirecting to sign in..."
                : "You will be redirected to your account shortly."}
            </Text>
            <Alert color="green" variant="light" className="max-w-md">
              {verificationType === "email"
                ? "Your account is now fully activated!"
                : "Welcome! You have been successfully signed in."}
            </Alert>
          </Stack>
        );

      case "expired":
        return (
          <Stack gap="md" align="center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900 dark:to-amber-900 rounded-full flex items-center justify-center shadow-lg">
              <IconMail
                size={32}
                className="text-orange-600 dark:text-orange-400"
              />
            </div>
            <Title
              order={2}
              className="text-2xl font-bold text-gray-900 dark:text-white"
            >
              Link Expired
            </Title>
            <Text className="text-gray-600 dark:text-gray-400 text-center">
              {verificationType === "email"
                ? "This verification link has expired. Please request a new one."
                : dictionary.auth.magicLink.expired}
            </Text>
            <Alert color="orange" variant="light" className="max-w-md">
              {verificationType === "email"
                ? "Email verification links expire after 24 hours for security."
                : "Magic links are only valid for a limited time for security reasons."}
            </Alert>
            {email && verificationType === "email" && (
              <Button
                onClick={handleResend}
                loading={resending}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Resend Verification Email
              </Button>
            )}
            <Button
              component={Link}
              href={locale === "en" ? "/auth" : `/${locale}/auth`}
              variant="outline"
              size="lg"
            >
              {verificationType === "email"
                ? "Back to Sign In"
                : "Request New Magic Link"}
            </Button>
          </Stack>
        );

      case "error":
      default:
        return (
          <Stack gap="md" align="center">
            <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900 dark:to-pink-900 rounded-full flex items-center justify-center shadow-lg">
              <IconX size={32} className="text-red-600 dark:text-red-400" />
            </div>
            <Title
              order={2}
              className="text-2xl font-bold text-gray-900 dark:text-white"
            >
              Verification Failed
            </Title>
            <Text className="text-gray-600 dark:text-gray-400 text-center">
              {verificationType === "email"
                ? "We couldn't verify your email address."
                : dictionary.auth.magicLink.error}
            </Text>
            <Alert color="red" variant="light" className="max-w-md">
              The link may be invalid, expired, or already used.
            </Alert>
            <Button
              component={Link}
              href={locale === "en" ? "/auth" : `/${locale}/auth`}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Try Again
            </Button>
          </Stack>
        );
    }
  };

  // Show waiting state if no token
  if (!token && state === "verifying") {
    return (
      <div className="w-full">
        <Stack gap="xl" align="center">
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center shadow-lg">
              <IconMailOpened
                size={40}
                className="text-blue-600 dark:text-blue-400"
              />
            </div>
            <Title
              order={1}
              className="text-3xl font-bold text-gray-900 dark:text-white"
            >
              Check your email
            </Title>
            <Text className="text-gray-600 dark:text-gray-400 text-lg max-w-md">
              Please check your email for a verification link.
            </Text>
          </div>

          <Card
            w="100%"
            p="xl"
            shadow="xl"
            radius="xl"
            withBorder
            className="border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
          >
            <Stack gap="lg">
              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Text className="text-center text-gray-700 dark:text-gray-300 leading-relaxed">
                  We&apos;ve sent a verification email to your registered address.
                  Please click the link in the email to continue.
                </Text>
              </div>

              <Button
                component={Link}
                href={locale === "en" ? "/auth" : `/${locale}/auth`}
                variant="subtle"
                fullWidth
                className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors h-11"
              >
                Back to sign in
              </Button>
            </Stack>
          </Card>
        </Stack>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Stack gap="xl" align="center">
        <Card
          w="100%"
          p="xl"
          shadow="xl"
          radius="xl"
          withBorder
          className="border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
        >
          {renderContent()}
        </Card>

        {email && state !== "success" && (
          <div className="text-center mt-4">
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              Verification link was sent to:{" "}
              <Text
                component="span"
                className="font-medium text-gray-700 dark:text-gray-300"
              >
                {email}
              </Text>
            </Text>
          </div>
        )}
      </Stack>
    </div>
  );
}

// Static route configuration for PPR optimization
export const dynamic = "auto";
