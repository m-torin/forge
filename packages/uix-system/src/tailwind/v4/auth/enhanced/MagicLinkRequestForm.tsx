/**
 * Tailwind v4 RSC Magic Link Request Form
 * 100% React Server Component for passwordless authentication via magic links
 */

import { useFormState } from "react-dom";
import type { BaseProps, FormState } from "../types";
import { createInitialActionState } from "../types";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Input } from "../ui/Input";
import { cn } from "../utils/dark-mode";

// Import real server action from the auth package
import { requestMagicLinkAction } from "@repo/auth/server-actions";

interface MagicLinkRequestFormProps extends BaseProps {
  title?: string;
  subtitle?: string;
  allowSignUp?: boolean;
  redirectTo?: string;
  onSuccess?: (email: string) => void;
  onError?: (error: string) => void;
}

const _initialState: FormState = { success: false };

export function MagicLinkRequestForm({
  title = "Sign in with Magic Link",
  subtitle = "Enter your email to receive a passwordless sign-in link",
  allowSignUp = true,
  redirectTo,
  onSuccess,
  onError,
  className = "",
}: MagicLinkRequestFormProps) {
  const [state, action] = useFormState(
    requestMagicLinkAction,
    createInitialActionState(),
  );

  // Handle success/error callbacks
  if (state?.success && state?.data?.email && onSuccess) {
    onSuccess(state.data.email);
  }

  if (state?.error && onError) {
    onError(state.error);
  }

  return (
    <Card className={cn("mx-auto w-full max-w-md", className)}>
      <CardHeader>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
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
                d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 21.75 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
              />
            </svg>
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

            <div
              className={cn(
                "rounded-lg border border-blue-200 bg-blue-50 p-4",
                "dark:border-blue-800 dark:bg-blue-900/20",
              )}
            >
              <div className="flex items-start">
                <svg
                  className={cn(
                    "mr-3 mt-0.5 h-5 w-5 text-blue-400",
                    "dark:text-blue-400",
                  )}
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
                  <h4 className="mb-1 font-medium">Check your email</h4>
                  <p className="mb-2">
                    We sent a magic link to <strong>{state.data?.email}</strong>
                  </p>
                  <ul className="list-inside list-disc space-y-1 text-xs">
                    <li>Click the link in your email to sign in instantly</li>
                    <li>The link will expire in 5 minutes for security</li>
                    <li>Check your spam folder if you don't see it</li>
                  </ul>
                </div>
              </div>
            </div>

            <form action={action}>
              <input type="hidden" name="email" value={state.data?.email} />
              <input type="hidden" name="redirectTo" value={redirectTo} />
              {allowSignUp && <input type="hidden" name="signUp" value="on" />}

              <Button
                type="submit"
                variant="outline"
                className="w-full"
                disabled={state === undefined}
              >
                {state === undefined ? "Resending..." : "Resend Magic Link"}
              </Button>
            </form>
          </div>
        )}

        {!state?.success && (
          <form action={action} className="space-y-4">
            {state?.error && <Alert variant="destructive">{state.error}</Alert>}

            <Input
              name="email"
              type="email"
              label="Email Address"
              placeholder="Enter your email address"
              required
              autoComplete="email"
              error={state?.errors?.email?.[0]}
              description="We'll send you a secure sign-in link"
            />

            <input type="hidden" name="redirectTo" value={redirectTo} />

            {allowSignUp && (
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="signUp"
                  name="signUp"
                  className={cn(
                    "mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500",
                    "dark:border-gray-600 dark:focus:ring-blue-500",
                  )}
                  defaultChecked={true}
                />
                <label
                  htmlFor="signUp"
                  className={cn("text-sm text-gray-700", "dark:text-gray-300")}
                >
                  Create account if email doesn't exist
                </label>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={state === undefined}
            >
              {state === undefined
                ? "Sending Magic Link..."
                : "Send Magic Link"}
            </Button>
          </form>
        )}

        <div
          className={cn("mt-6 rounded-lg bg-gray-50 p-4", "dark:bg-gray-800")}
        >
          <h4
            className={cn(
              "mb-2 text-sm font-medium text-gray-900",
              "dark:text-gray-100",
            )}
          >
            How Magic Links Work
          </h4>
          <div
            className={cn(
              "space-y-1 text-xs text-gray-600",
              "dark:text-gray-400",
            )}
          >
            <p>• No password required - just click the link in your email</p>
            <p>• Links expire after 5 minutes for security</p>
            <p>• Each link can only be used once</p>
            <p>
              • Works on any device - click the link where you want to sign in
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className={cn("text-sm text-gray-600", "dark:text-gray-400")}>
            Prefer a different method?{" "}
            <a
              href="/auth/signin"
              className={cn(
                "text-blue-600 hover:text-blue-500",
                "dark:text-blue-400 dark:hover:text-blue-300",
              )}
            >
              Sign in with password
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
