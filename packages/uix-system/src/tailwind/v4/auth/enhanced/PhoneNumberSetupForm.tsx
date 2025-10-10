/**
 * Tailwind v4 RSC Phone Number Setup Form
 * 100% React Server Component for registering and verifying phone numbers
 */

import { useFormState } from "react-dom";
import type { BaseProps, FormState } from "../types";
import { createInitialActionState } from "../types";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Input } from "../ui/Input";
import { cn } from "../utils/dark-mode";

interface PhoneNumberSetupFormProps extends BaseProps {
  title?: string;
  subtitle?: string;
  defaultCountryCode?: string;
  requireVerification?: boolean;
  onSuccess?: (phoneNumber: string) => void;
  onError?: (error: string) => void;
  onVerificationSent?: (phoneNumber: string) => void;
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

  // Remove any non-digit characters from phone number
  const cleanPhone = phoneNumber.replace(/\D/g, "");

  if (cleanPhone.length < 7) return "Phone number is too short";
  if (cleanPhone.length > 15) return "Phone number is too long";

  // Basic validation for common country codes
  switch (countryCode) {
    case "+1": // US/Canada
      if (cleanPhone.length !== 10)
        return "US/Canada phone numbers must be 10 digits";
      break;
    case "+44": // UK
      if (cleanPhone.length < 10 || cleanPhone.length > 11)
        return "UK phone numbers must be 10-11 digits";
      break;
    case "+33": // France
      if (cleanPhone.length !== 9)
        return "French phone numbers must be 9 digits";
      break;
  }

  return null;
}

// Server action for phone number setup
async function setupPhoneNumberAction(
  prevState: any,
  formData: FormData,
): Promise<FormState> {
  "use server";

  try {
    const countryCode = formData.get("countryCode") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const requireVerification = formData.get("requireVerification") === "true";

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
    const { setupPhoneNumberAction: authSetupPhone } = await import(
      "@repo/auth/server-actions"
    );

    const result = await authSetupPhone(prevState, formData);

    if (result.success) {
      if (requireVerification) {
        return {
          success: true,
          message: `Verification code sent to ${fullPhoneNumber}! Please check your SMS messages.`,
          data: {
            phoneNumber: fullPhoneNumber,
            requiresVerification: true,
          },
        };
      } else {
        return {
          success: true,
          message: `Phone number ${fullPhoneNumber} has been added to your account!`,
          data: {
            phoneNumber: fullPhoneNumber,
            requiresVerification: false,
          },
        };
      }
    } else {
      return {
        success: false,
        error: result.error || "Failed to setup phone number.",
      };
    }
  } catch (error: any) {
    // console.error('Phone number setup error:', error);

    if (error?.message?.includes("already exists")) {
      return {
        success: false,
        error: "This phone number is already registered to another account.",
      };
    }

    if (error?.message?.includes("invalid phone")) {
      return {
        success: false,
        errors: { phoneNumber: ["Please enter a valid phone number"] },
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
          "SMS messages to this number are currently blocked. Please try a different number.",
      };
    }

    return {
      success: false,
      error:
        "An error occurred while setting up your phone number. Please try again.",
    };
  }
}

export function PhoneNumberSetupForm({
  title = "Add Phone Number",
  subtitle = "Add a phone number to your account for enhanced security and SMS notifications",
  defaultCountryCode = "+1",
  requireVerification = true,
  onSuccess,
  onError,
  onVerificationSent,
  className = "",
}: PhoneNumberSetupFormProps) {
  const [state, action] = useFormState(
    setupPhoneNumberAction,
    createInitialActionState(),
  );

  // Handle callbacks
  if (state?.success && state?.data?.phoneNumber) {
    if (state.data.requiresVerification && onVerificationSent) {
      onVerificationSent(state.data.phoneNumber);
    } else if (!state.data.requiresVerification && onSuccess) {
      onSuccess(state.data.phoneNumber);
    }
  }

  if (state?.error && onError) {
    onError(state.error);
  }

  return (
    <Card className={cn("mx-auto w-full max-w-md", className)}>
      <CardHeader>
        <div className="text-center">
          <div
            className={cn(
              "mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full",
              state?.success
                ? "bg-green-100 dark:bg-green-900/20"
                : "bg-blue-100 dark:bg-blue-900/20",
            )}
          >
            {state?.success ? (
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
        {state?.success && (
          <div className="space-y-4">
            <Alert variant="success">{state.message}</Alert>

            {state.data?.requiresVerification ? (
              <div
                className={cn(
                  "rounded-lg border border-blue-200 bg-blue-50 p-4",
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
                    className={cn(
                      "text-sm text-blue-800",
                      "dark:text-blue-200",
                    )}
                  >
                    <h4 className="mb-1 font-medium">
                      Verification code sent!
                    </h4>
                    <p className="mb-2">
                      Check your SMS messages for a verification code
                    </p>
                    <ul className="list-inside list-disc space-y-1 text-xs">
                      <li>Enter the 6-digit code in the verification form</li>
                      <li>The code will expire in 10 minutes</li>
                      <li>You can request a new code if needed</li>
                      <li>Check that your phone can receive SMS messages</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
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
                    <h4 className="mb-1 font-medium">
                      Phone number added successfully!
                    </h4>
                    <p className="mb-2">
                      Your phone number is now linked to your account
                    </p>
                    <ul className="list-inside list-disc space-y-1 text-xs">
                      <li>You can use SMS for two-factor authentication</li>
                      <li>Receive security notifications via SMS</li>
                      <li>Use phone number for account recovery</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  if (state.data?.requiresVerification) {
                    window.location.href = "/auth/verify-phone";
                  } else {
                    window.location.href = "/account/settings";
                  }
                }}
              >
                {state.data?.requiresVerification
                  ? "Continue to Verification"
                  : "Back to Account Settings"}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  window.location.reload();
                }}
              >
                Add Another Phone Number
              </Button>
            </div>
          </div>
        )}

        {!state?.success && (
          <form action={action} className="space-y-4">
            {state?.error && <Alert variant="destructive">{state.error}</Alert>}

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
                  state?.errors?.countryCode
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
              {state?.errors?.countryCode && (
                <p className={cn("text-sm text-red-600", "dark:text-red-400")}>
                  {state.errors.countryCode[0]}
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
              error={state?.errors?.phoneNumber?.[0]}
              description="Enter your phone number without the country code"
            />

            {requireVerification && (
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="requireVerification"
                  name="requireVerification"
                  className={cn(
                    "mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500",
                    "dark:border-gray-600 dark:focus:ring-blue-500",
                  )}
                  defaultChecked={true}
                />
                <label
                  htmlFor="requireVerification"
                  className={cn("text-sm text-gray-700", "dark:text-gray-300")}
                >
                  Send verification code via SMS (recommended)
                </label>
              </div>
            )}

            <input
              type="hidden"
              name="requireVerification"
              value={requireVerification.toString()}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={state === undefined}
            >
              {state === undefined
                ? "Setting up phone number..."
                : "Add Phone Number"}
            </Button>
          </form>
        )}

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
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            <div className={cn("text-sm text-blue-800", "dark:text-blue-200")}>
              <h4 className="mb-1 font-medium">Why add a phone number?</h4>
              <ul className="list-inside list-disc space-y-1 text-xs">
                <li>Enable two-factor authentication via SMS</li>
                <li>Receive important security alerts</li>
                <li>Recover your account if you lose access</li>
                <li>Alternative sign-in method</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="text-center">
            <a
              href="/account/settings"
              className={cn(
                "text-sm text-gray-600 hover:text-gray-500",
                "dark:text-gray-400 dark:hover:text-gray-300",
              )}
            >
              Cancel and return to settings
            </a>
          </div>

          <div className="text-center">
            <p className={cn("text-xs text-gray-500", "dark:text-gray-500")}>
              Standard SMS rates may apply. We will never share your phone
              number.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
