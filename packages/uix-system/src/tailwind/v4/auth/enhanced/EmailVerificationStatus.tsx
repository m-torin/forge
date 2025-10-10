/**
 * Tailwind v4 RSC Email Verification Status
 * 100% React Server Component for displaying email verification status
 */

"use client";

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import type { BaseProps, FormState } from "../types";
import { createInitialActionState } from "../types";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { cn } from "../utils/dark-mode";

// Import real server actions from the auth package
import {
  resendVerificationEmailAction,
  verifyEmailAction,
} from "@repo/auth/server-actions";

type VerificationStatus =
  | "pending"
  | "verified"
  | "expired"
  | "error"
  | "processing";

interface EmailVerificationStatusProps extends BaseProps {
  userEmail: string;
  initialStatus?: VerificationStatus;
  token?: string;
  onStatusChange?: (status: VerificationStatus) => void;
  onVerified?: () => void;
  allowResend?: boolean;
}

const _initialState: FormState = { success: false };

export function EmailVerificationStatus({
  userEmail,
  initialStatus = "pending",
  token,
  onStatusChange,
  onVerified,
  allowResend = true,
  className = "",
}: EmailVerificationStatusProps) {
  const [status, setStatus] = useState<VerificationStatus>(initialStatus);
  const [verifyState, verifyAction] = useFormState(
    verifyEmailAction,
    createInitialActionState(),
  );
  const [resendState, resendAction] = useFormState(
    resendVerificationEmailAction,
    createInitialActionState(),
  );

  // Auto-verify if token is provided
  useEffect(() => {
    if (token && status === "pending") {
      setStatus("processing");
      // Auto-submit verification
      const form = new FormData();
      form.append("token", token);
      verifyAction(form);
    }
  }, [token, status, verifyAction]);

  // Handle verification result
  useEffect(() => {
    if (verifyState?.success) {
      setStatus("verified");
      if (onVerified) {
        onVerified();
      }
    } else if (verifyState?.error) {
      if (verifyState.error.includes("expired")) {
        setStatus("expired");
      } else {
        setStatus("error");
      }
    }
  }, [verifyState, onVerified]);

  // Handle status changes
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(status);
    }
  }, [status, onStatusChange]);

  const getStatusIcon = () => {
    switch (status) {
      case "processing":
        return (
          <svg
            className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        );
      case "verified":
        return (
          <svg
            className="h-8 w-8 text-green-600 dark:text-green-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "expired":
        return (
          <svg
            className="h-8 w-8 text-yellow-600 dark:text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "error":
        return (
          <svg
            className="h-8 w-8 text-red-600 dark:text-red-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      default: // pending
        return (
          <svg
            className="h-8 w-8 text-yellow-600 dark:text-yellow-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 21.75 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
            />
          </svg>
        );
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case "processing":
        return {
          title: "Verifying Your Email",
          description: "Please wait while we verify your email address...",
          variant: "default" as const,
        };
      case "verified":
        return {
          title: "Email Verified Successfully!",
          description:
            "Your email address has been verified. Your account is now fully activated.",
          variant: "success" as const,
        };
      case "expired":
        return {
          title: "Verification Link Expired",
          description:
            "This verification link has expired. Please request a new verification email.",
          variant: "warning" as const,
        };
      case "error":
        return {
          title: "Verification Failed",
          description:
            "We couldn't verify your email address. The link may be invalid or expired.",
          variant: "destructive" as const,
        };
      default: // pending
        return {
          title: "Email Verification Pending",
          description:
            "Please check your email and click the verification link to activate your account.",
          variant: "warning" as const,
        };
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <Card className={cn("mx-auto w-full max-w-md", className)}>
      <CardHeader>
        <div className="text-center">
          <div
            className={cn(
              "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full",
              status === "verified"
                ? "bg-green-100 dark:bg-green-900/20"
                : status === "expired"
                  ? "bg-yellow-100 dark:bg-yellow-900/20"
                  : status === "error"
                    ? "bg-red-100 dark:bg-red-900/20"
                    : "bg-blue-100 dark:bg-blue-900/20",
            )}
          >
            {getStatusIcon()}
          </div>
          <h2
            className={cn(
              "text-xl font-bold text-gray-900",
              "dark:text-gray-100",
            )}
          >
            {statusMessage.title}
          </h2>
          <p className={cn("mt-2 text-sm text-gray-600", "dark:text-gray-400")}>
            {statusMessage.description}
          </p>
        </div>
      </CardHeader>

      <CardContent>
        {/* Status Alert */}
        <Alert variant={statusMessage.variant} className="mb-4">
          {verifyState?.message || statusMessage.description}
        </Alert>

        {/* Email Display */}
        <div
          className={cn("mb-4 rounded-lg bg-gray-50 p-4", "dark:bg-gray-800")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={cn(
                  "text-sm font-medium text-gray-700",
                  "dark:text-gray-300",
                )}
              >
                Email Address
              </p>
              <p className={cn("text-lg text-gray-900", "dark:text-gray-100")}>
                {userEmail}
              </p>
            </div>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                status === "verified"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200",
              )}
            >
              {status === "verified" ? "Verified" : "Unverified"}
            </span>
          </div>
        </div>

        {/* Resend Error/Success */}
        {resendState?.error && (
          <Alert variant="destructive" className="mb-4">
            {resendState.error}
          </Alert>
        )}

        {resendState?.success && (
          <Alert variant="success" className="mb-4">
            {resendState.message}
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Manual verification with token */}
          {status === "pending" && token && (
            <form action={verifyAction}>
              <input type="hidden" name="token" value={token} />
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={verifyState === undefined}
              >
                {verifyState === undefined
                  ? "Verifying..."
                  : "Verify Email Now"}
              </Button>
            </form>
          )}

          {/* Resend verification email */}
          {allowResend &&
            (status === "pending" ||
              status === "expired" ||
              status === "error") && (
              <form action={resendAction}>
                <input type="hidden" name="email" value={userEmail} />
                <Button
                  type="submit"
                  variant={status === "pending" ? "outline" : "primary"}
                  className="w-full"
                  disabled={resendState === undefined}
                >
                  {resendState === undefined
                    ? "Sending..."
                    : status === "pending"
                      ? "Resend Verification Email"
                      : "Send New Verification Email"}
                </Button>
              </form>
            )}

          {/* Continue to dashboard (verified) */}
          {status === "verified" && (
            <Button
              variant="primary"
              className="w-full"
              onClick={() => {
                window.location.href = "/dashboard";
              }}
            >
              Continue to Dashboard
            </Button>
          )}

          {/* Change email */}
          <div className="text-center">
            <a
              href="/account/settings"
              className={cn(
                "text-sm text-gray-600 hover:text-gray-500",
                "dark:text-gray-400 dark:hover:text-gray-300",
              )}
            >
              Need to change your email address?
            </a>
          </div>
        </div>

        {/* Verification Benefits (for pending status) */}
        {status === "pending" && (
          <div
            className={cn(
              "mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4",
              "dark:border-blue-800 dark:bg-blue-900/20",
            )}
          >
            <div className="flex items-start">
              <svg
                className="mr-3 mt-0.5 h-5 w-5 text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div
                className={cn("text-sm text-blue-800", "dark:text-blue-200")}
              >
                <h4 className="mb-1 font-medium">
                  Complete your verification to:
                </h4>
                <ul className="list-inside list-disc space-y-1 text-xs">
                  <li>Secure your account with password recovery</li>
                  <li>Receive important security notifications</li>
                  <li>Access all platform features</li>
                  <li>Enable email-based authentication methods</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Help Information */}
        <div
          className={cn("mt-6 rounded-lg bg-gray-50 p-4", "dark:bg-gray-800")}
        >
          <h4
            className={cn(
              "mb-2 text-sm font-medium text-gray-900",
              "dark:text-gray-100",
            )}
          >
            Need Help?
          </h4>
          <div
            className={cn(
              "space-y-1 text-xs text-gray-600",
              "dark:text-gray-400",
            )}
          >
            <p>• Check your spam folder for the verification email</p>
            <p>• Verification links expire after 24 hours</p>
            <p>• Make sure you're clicking the link from the same device</p>
            <p>• Contact support if you continue having issues</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
