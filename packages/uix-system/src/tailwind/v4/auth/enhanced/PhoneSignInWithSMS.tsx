/**
 * Tailwind v4 RSC Phone Sign In with SMS
 * 100% React Server Component for SMS-based authentication
 */

"use client";

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import type { BaseProps, FormState } from "../types";
import { createInitialActionState } from "../types";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Input } from "../ui/Input";
import { cn } from "../utils/dark-mode";

interface PhoneSignInWithSMSProps extends BaseProps {
  title?: string;
  subtitle?: string;
  defaultCountryCode?: string;
  redirectTo?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onCodeSent?: (phoneNumber: string) => void;
}

const _initialState: FormState = { success: false };

// Common country codes
const COUNTRY_CODES = [
  { code: "+1", country: "US/CA", name: "United States / Canada" },
  { code: "+44", country: "GB", name: "United Kingdom" },
  { code: "+33", country: "FR", name: "France" },
  { code: "+49", country: "DE", name: "Germany" },
  { code: "+81", country: "JP", name: "Japan" },
  { code: "+86", country: "CN", name: "China" },
  { code: "+91", country: "IN", name: "India" },
  { code: "+61", country: "AU", name: "Australia" },
  { code: "+55", country: "BR", name: "Brazil" },
  { code: "+7", country: "RU", name: "Russia" },
];

// Phone number validation
function validatePhoneNumber(
  countryCode: string,
  phoneNumber: string,
): string | null {
  if (!countryCode || !phoneNumber) return "Phone number is required";

  const cleanPhone = phoneNumber.replace(/\D/g, "");
  if (cleanPhone.length < 7) return "Phone number is too short";
  if (cleanPhone.length > 15) return "Phone number is too long";

  return null;
}

// Server action for requesting SMS sign-in code
async function requestSMSSignInAction(
  prevState: any,
  formData: FormData,
): Promise<FormState> {
  "use server";

  try {
    const countryCode = formData.get("countryCode") as string;
    const phoneNumber = formData.get("phoneNumber") as string;

    // Validation
    const errors: Record<string, string[]> = {};

    if (!countryCode) errors.countryCode = ["Please select a country code"];
    if (!phoneNumber) errors.phoneNumber = ["Phone number is required"];

    if (countryCode && phoneNumber) {
      const phoneError = validatePhoneNumber(countryCode, phoneNumber);
      if (phoneError) errors.phoneNumber = [phoneError];
    }

    if (Object.keys(errors).length > 0) {
      return { success: false, errors };
    }

    // Clean and format phone number
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const fullPhoneNumber = `${countryCode}${cleanPhone}`;

    // Import Better Auth server action
    const { sendSMSSignInCodeAction } = await import(
      "@repo/auth/server-actions"
    );

    const result = await sendSMSSignInCodeAction(prevState, formData);

    if (result.success) {
      return {
        success: true,
        message: `Sign-in code sent to ${fullPhoneNumber}! Check your SMS messages.`,
        data: {
          phoneNumber: fullPhoneNumber,
          step: "verification",
        },
      };
    } else {
      return {
        success: false,
        error: result.error || "Failed to send sign-in code.",
      };
    }
  } catch (error: any) {
    // console.error('SMS sign-in request error:', error);

    if (error?.message?.includes("not found")) {
      return {
        success: false,
        error:
          "No account found with this phone number. Please sign up first or use a different sign-in method.",
      };
    }

    if (error?.message?.includes("not verified")) {
      return {
        success: false,
        error:
          "This phone number is not verified. Please verify it in your account settings first.",
      };
    }

    if (error?.message?.includes("rate limit")) {
      return {
        success: false,
        error:
          "Too many requests. Please wait a few minutes before trying again.",
      };
    }

    if (error?.message?.includes("carrier blocked")) {
      return {
        success: false,
        error:
          "SMS messages to this number are currently blocked. Please use a different sign-in method.",
      };
    }

    return {
      success: false,
      error:
        "An error occurred while sending the sign-in code. Please try again.",
    };
  }
}

// Server action for verifying SMS sign-in code
async function verifySMSSignInAction(
  prevState: any,
  formData: FormData,
): Promise<FormState> {
  "use server";

  try {
    const phoneNumber = formData.get("phoneNumber") as string;
    const code = formData.get("code") as string;
    const redirectTo = formData.get("redirectTo") as string;

    // Validation
    const errors: Record<string, string[]> = {};

    if (!phoneNumber) errors.phoneNumber = ["Phone number is required"];
    if (!code) errors.code = ["Verification code is required"];
    if (code && !/^\d{6}$/.test(code)) {
      errors.code = ["Verification code must be 6 digits"];
    }

    if (Object.keys(errors).length > 0) {
      return { success: false, errors };
    }

    // Import Better Auth server action
    const { verifySMSCodeAction } = await import("@repo/auth/server-actions");

    const result = await verifySMSCodeAction(prevState, formData);

    if (result.success) {
      return {
        success: true,
        message: "Successfully signed in! Redirecting...",
        data: { redirectTo: redirectTo || "/dashboard" },
      };
    } else {
      return {
        success: false,
        error: result.error || "Invalid verification code. Please try again.",
      };
    }
  } catch (error: any) {
    // console.error('SMS sign-in verification error:', error);

    if (error?.message?.includes("invalid code")) {
      return {
        success: false,
        errors: {
          code: ["Invalid verification code. Please check and try again."],
        },
      };
    }

    if (error?.message?.includes("expired")) {
      return {
        success: false,
        error: "Verification code has expired. Please request a new code.",
      };
    }

    if (error?.message?.includes("too many attempts")) {
      return {
        success: false,
        error:
          "Too many failed attempts. Please wait 15 minutes before trying again.",
      };
    }

    return {
      success: false,
      error: "An error occurred during sign-in. Please try again.",
    };
  }
}

export function PhoneSignInWithSMS({
  title = "Sign in with SMS",
  subtitle = "Sign in to your account using your phone number",
  defaultCountryCode = "+1",
  redirectTo,
  onSuccess,
  onError,
  onCodeSent,
  className = "",
}: PhoneSignInWithSMSProps) {
  const [requestState, requestAction] = useFormState(
    requestSMSSignInAction,
    createInitialActionState(),
  );
  const [verifyState, verifyAction] = useFormState(
    verifySMSSignInAction,
    createInitialActionState(),
  );
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "verification">("phone");

  // Handle step transitions
  useEffect(() => {
    if (requestState?.success && requestState?.data?.step === "verification") {
      setStep("verification");
      if (onCodeSent && requestState.data.phoneNumber) {
        onCodeSent(requestState.data.phoneNumber);
      }
    }
  }, [requestState?.success, requestState?.data, onCodeSent]);

  // Handle successful sign-in
  useEffect(() => {
    if (verifyState?.success) {
      if (onSuccess) {
        onSuccess();
      }

      // Redirect if specified
      if (verifyState.data?.redirectTo) {
        setTimeout(() => {
          window.location.href = verifyState.data.redirectTo;
        }, 1000);
      }
    }
  }, [verifyState?.success, verifyState?.data, onSuccess]);

  // Handle errors
  if (requestState?.error && onError) {
    onError(requestState.error);
  }
  if (verifyState?.error && onError) {
    onError(verifyState.error);
  }

  // Auto-submit when code is complete
  useEffect(() => {
    if (step === "verification" && code.length === 6 && /^\d+$/.test(code)) {
      const form = new FormData();
      form.append("phoneNumber", requestState?.data?.phoneNumber || "");
      form.append("code", code);
      form.append("redirectTo", redirectTo || "");
      verifyAction(form);
    }
  }, [code, step, requestState?.data?.phoneNumber, redirectTo, verifyAction]);

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith("+1") && phone.length === 12) {
      return `${phone.slice(0, 2)} (${phone.slice(2, 5)}) ${phone.slice(5, 8)}-${phone.slice(8)}`;
    }
    return phone;
  };

  return (
    <Card className={cn("mx-auto w-full max-w-md", className)}>
      <CardHeader>
        <div className="text-center">
          <div
            className={cn(
              "mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full",
              verifyState?.success
                ? "bg-green-100 dark:bg-green-900/20"
                : "bg-blue-100 dark:bg-blue-900/20",
            )}
          >
            {verifyState?.success ? (
              <svg
                className="h-6 w-6 text-green-600 dark:text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                />
              </svg>
            )}
          </div>
          <h1
            className={cn(
              "text-2xl font-bold text-gray-900",
              "dark:text-gray-100",
            )}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className={cn("mt-2 text-sm text-gray-600", "dark:text-gray-400")}
            >
              {subtitle}
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {verifyState?.success && (
          <div className="space-y-4">
            <Alert variant="success">{verifyState.message}</Alert>

            <div
              className={cn(
                "rounded-lg border border-green-200 bg-green-50 p-4",
                "dark:border-green-800 dark:bg-green-900/20",
              )}
            >
              <div className="flex items-start">
                <svg
                  className="mr-3 mt-0.5 h-5 w-5 text-green-400"
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
                  className={cn(
                    "text-sm text-green-800",
                    "dark:text-green-200",
                  )}
                >
                  <h4 className="mb-1 font-medium">Welcome back!</h4>
                  <p>You have been successfully signed in to your account.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === "phone" && !verifyState?.success && (
          <form action={requestAction} className="space-y-4">
            {requestState?.error && (
              <Alert variant="destructive">{requestState.error}</Alert>
            )}

            <div className="space-y-2">
              <label
                className={cn(
                  "block text-sm font-medium text-gray-700",
                  "dark:text-gray-300",
                )}
              >
                Country / Region
              </label>
              <select
                name="countryCode"
                defaultValue={defaultCountryCode}
                className={cn(
                  "block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm",
                  "focus:border-blue-500 focus:outline-none focus:ring-blue-500",
                  "dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100",
                  "dark:focus:border-blue-400 dark:focus:ring-blue-400",
                  requestState?.errors?.countryCode
                    ? "border-red-500 dark:border-red-400"
                    : "",
                )}
                required
              >
                {COUNTRY_CODES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.code} - {country.name}
                  </option>
                ))}
              </select>
              {requestState?.errors?.countryCode && (
                <p className={cn("text-sm text-red-600", "dark:text-red-400")}>
                  {requestState.errors.countryCode[0]}
                </p>
              )}
            </div>

            <Input
              name="phoneNumber"
              type="tel"
              label="Phone Number"
              placeholder="Enter your phone number"
              required
              autoComplete="tel"
              error={requestState?.errors?.phoneNumber?.[0]}
              description="Enter the phone number associated with your account"
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={requestState === undefined}
            >
              {requestState === undefined
                ? "Sending code..."
                : "Send Sign-in Code"}
            </Button>
          </form>
        )}

        {step === "verification" && !verifyState?.success && (
          <div className="space-y-4">
            {requestState?.success && (
              <Alert variant="success">{requestState.message}</Alert>
            )}

            {verifyState?.error && (
              <Alert variant="destructive">{verifyState.error}</Alert>
            )}

            <div
              className={cn("rounded-lg bg-gray-50 p-4", "dark:bg-gray-800")}
            >
              <div className="text-center">
                <p
                  className={cn(
                    "text-sm font-medium text-gray-700",
                    "dark:text-gray-300",
                  )}
                >
                  Sign-in code sent to:
                </p>
                <p
                  className={cn(
                    "font-mono text-lg text-gray-900",
                    "dark:text-gray-100",
                  )}
                >
                  {formatPhoneNumber(requestState?.data?.phoneNumber || "")}
                </p>
              </div>
            </div>

            <form action={verifyAction} className="space-y-4">
              <input
                type="hidden"
                name="phoneNumber"
                value={requestState?.data?.phoneNumber || ""}
              />
              <input type="hidden" name="redirectTo" value={redirectTo || ""} />

              <div className="space-y-2">
                <label
                  className={cn(
                    "block text-sm font-medium text-gray-700",
                    "dark:text-gray-300",
                  )}
                >
                  Sign-in Code
                </label>
                <div className="flex justify-center">
                  <input
                    name="code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={code}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setCode(value);
                    }}
                    className={cn(
                      "w-full px-4 py-3 text-center font-mono text-2xl",
                      "rounded-md border border-gray-300 shadow-sm",
                      "focus:border-blue-500 focus:outline-none focus:ring-blue-500",
                      "dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100",
                      "dark:focus:border-blue-400 dark:focus:ring-blue-400",
                      verifyState?.errors?.code
                        ? "border-red-500 dark:border-red-400"
                        : "",
                    )}
                    placeholder="000000"
                    autoComplete="one-time-code"
                    required
                  />
                </div>
                {verifyState?.errors?.code && (
                  <p
                    className={cn(
                      "text-center text-sm text-red-600",
                      "dark:text-red-400",
                    )}
                  >
                    {verifyState.errors.code[0]}
                  </p>
                )}
                <p
                  className={cn(
                    "text-center text-xs text-gray-600",
                    "dark:text-gray-400",
                  )}
                >
                  Enter the 6-digit code sent to your phone
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={verifyState === undefined || code.length !== 6}
              >
                {verifyState === undefined ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="text-center">
              <p
                className={cn(
                  "mb-2 text-sm text-gray-600",
                  "dark:text-gray-400",
                )}
              >
                Didn't receive the code?
              </p>
              <form action={requestAction}>
                <input
                  type="hidden"
                  name="countryCode"
                  value={
                    requestState?.data?.phoneNumber?.split(/\d/)[0] ||
                    defaultCountryCode
                  }
                />
                <input
                  type="hidden"
                  name="phoneNumber"
                  value={
                    requestState?.data?.phoneNumber?.replace(/^\+\d+/, "") || ""
                  }
                />
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full"
                  disabled={requestState === undefined}
                >
                  {requestState === undefined ? "Resending..." : "Resend Code"}
                </Button>
              </form>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setCode("");
                }}
                className={cn(
                  "text-sm text-gray-600 hover:text-gray-500",
                  "dark:text-gray-400 dark:hover:text-gray-300",
                )}
              >
                Use a different phone number
              </button>
            </div>
          </div>
        )}

        {!verifyState?.success && (
          <div
            className={cn("mt-6 rounded-lg bg-gray-50 p-4", "dark:bg-gray-800")}
          >
            <h4
              className={cn(
                "mb-2 text-sm font-medium text-gray-900",
                "dark:text-gray-100",
              )}
            >
              {step === "phone" ? "SMS Sign-in" : "Having trouble?"}
            </h4>
            <div
              className={cn(
                "space-y-1 text-xs text-gray-600",
                "dark:text-gray-400",
              )}
            >
              {step === "phone" ? (
                <>
                  <p>• Sign in using your verified phone number</p>
                  <p>• A 6-digit code will be sent via SMS</p>
                  <p>• Make sure your phone can receive text messages</p>
                  <p>• Standard SMS rates may apply</p>
                </>
              ) : (
                <>
                  <p>• Make sure your phone can receive SMS messages</p>
                  <p>• Check that the phone number is correct</p>
                  <p>• Sign-in codes expire after 10 minutes</p>
                  <p>• Try resending the code if you don't receive it</p>
                </>
              )}
            </div>
          </div>
        )}

        {!verifyState?.success && (
          <div className="mt-6 text-center">
            <p className={cn("text-sm text-gray-600", "dark:text-gray-400")}>
              Prefer a different method?{" "}
              <a
                href="/auth/signin"
                className={cn(
                  "text-blue-600 hover:text-blue-500",
                  "dark:text-blue-400 dark:hover:text-blue-300",
                )}
              >
                Sign in with email
              </a>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
