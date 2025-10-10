/**
 * Tailwind v4 RSC Account Deletion Flow
 * 100% React Server Component for secure account deletion with confirmations
 */

import { useState } from "react";
import { useFormState } from "react-dom";
import type { BaseProps, FormState } from "../types";
import { createInitialActionState } from "../types";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Input } from "../ui/Input";

import {
  cancelAccountDeletionAction,
  confirmAccountDeletionAction,
  initiateAccountDeletionAction,
} from "./actions";

interface AccountDeletionFlowProps extends BaseProps {
  userEmail: string;
  userName?: string;
  organizationCount?: number;
  hasActiveSubscriptions?: boolean;
  title?: string;
  subtitle?: string;
  onDeletionComplete?: () => void;
  onCancel?: () => void;
}

interface DeletionStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
}

const _initialState: FormState = { success: false };

export function AccountDeletionFlow({
  userEmail,
  userName,
  organizationCount = 0,
  hasActiveSubscriptions = false,
  title = "Delete Account",
  subtitle = "Permanently delete your account and all associated data",
  onDeletionComplete: _onDeletionComplete,
  onCancel,
  className = "",
}: AccountDeletionFlowProps) {
  const [currentStep, setCurrentStep] = useState<
    "warning" | "confirmation" | "token"
  >("warning");
  const [confirmEmailInput, setConfirmEmailInput] = useState("");
  const [confirmTextInput, setConfirmTextInput] = useState("");

  const [initiateState, initiateAction] = useFormState(
    initiateAccountDeletionAction,
    createInitialActionState(),
  );
  const [confirmState, confirmAction] = useFormState(
    confirmAccountDeletionAction,
    createInitialActionState(),
  );
  const [cancelState, cancelAction] = useFormState(
    cancelAccountDeletionAction,
    createInitialActionState(),
  );

  const deletionSteps: DeletionStep[] = [
    {
      id: "backup",
      title: "Backup Your Data",
      description: "Download any important data before deletion",
      completed: false,
      required: false,
    },
    {
      id: "subscriptions",
      title: "Cancel Subscriptions",
      description: "Cancel all active subscriptions and memberships",
      completed: !hasActiveSubscriptions,
      required: hasActiveSubscriptions,
    },
    {
      id: "organizations",
      title: "Transfer Organizations",
      description: "Transfer ownership or leave organizations",
      completed: organizationCount === 0,
      required: organizationCount > 0,
    },
    {
      id: "confirm",
      title: "Final Confirmation",
      description: "Confirm permanent account deletion",
      completed: false,
      required: true,
    },
  ];

  const canProceed = deletionSteps
    .filter((step) => step.required)
    .every((step) => step.completed);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-6 w-6 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
      </div>

      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-start">
            <svg
              className="mr-3 mt-0.5 h-5 w-5 text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-red-800">
              <h4 className="mb-2 font-medium">
                ⚠️ This Action Cannot Be Undone
              </h4>
              <p className="mb-2">Deleting your account will permanently:</p>
              <ul className="list-inside list-disc space-y-1">
                <li>Delete all your personal data and account information</li>
                <li>Remove you from all organizations and teams</li>
                <li>Cancel all active sessions and API keys</li>
                <li>Delete all your content, files, and settings</li>
                <li>Make your username available for others to use</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {(initiateState?.error || confirmState?.error || cancelState?.error) && (
        <Alert variant="destructive">
          {initiateState?.error || confirmState?.error || cancelState?.error}
        </Alert>
      )}

      {(initiateState?.success ||
        confirmState?.success ||
        cancelState?.success) && (
        <Alert variant="success">
          {initiateState?.message ||
            confirmState?.message ||
            cancelState?.message}
        </Alert>
      )}

      {currentStep === "warning" && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">
              Before You Delete Your Account
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deletionSteps.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-start space-x-3 rounded-lg border p-3 ${
                    step.completed
                      ? "border-green-200 bg-green-50"
                      : step.required
                        ? "border-red-200 bg-red-50"
                        : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full ${
                      step.completed
                        ? "bg-green-100"
                        : step.required
                          ? "bg-red-100"
                          : "bg-gray-100"
                    }`}
                  >
                    {step.completed ? (
                      <svg
                        className="h-3 w-3 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className={`h-3 w-3 ${step.required ? "text-red-600" : "text-gray-400"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`text-sm font-medium ${
                        step.completed
                          ? "text-green-800"
                          : step.required
                            ? "text-red-800"
                            : "text-gray-700"
                      }`}
                    >
                      {step.title}
                      {step.required && !step.completed && (
                        <span className="ml-1 text-red-600">*</span>
                      )}
                    </h3>
                    <p
                      className={`text-sm ${
                        step.completed
                          ? "text-green-700"
                          : step.required
                            ? "text-red-700"
                            : "text-gray-600"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                onClick={() => setCurrentStep("confirmation")}
                variant="destructive"
                disabled={!canProceed}
              >
                I Understand, Continue with Deletion
              </Button>
              {onCancel && (
                <Button onClick={onCancel} variant="outline">
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === "confirmation" && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">
              Confirm Account Deletion
            </h2>
          </CardHeader>
          <CardContent>
            <form action={initiateAction} className="space-y-4">
              <div className="mb-4 rounded-lg bg-gray-50 p-4">
                <p className="mb-2 text-sm text-gray-700">
                  <strong>Account:</strong> {userEmail}
                </p>
                {userName && (
                  <p className="text-sm text-gray-700">
                    <strong>Name:</strong> {userName}
                  </p>
                )}
              </div>

              <Input
                name="password"
                type="password"
                label="Current Password"
                placeholder="Enter your current password"
                required
                autoComplete="current-password"
                error={initiateState?.errors?.password?.[0]}
                description="Required to verify your identity"
              />

              <Input
                name="confirmEmail"
                type="email"
                label="Confirm Email Address"
                placeholder="Type your email address"
                required
                value={confirmEmailInput}
                onChange={(e) => setConfirmEmailInput(e.target.value)}
                error={initiateState?.errors?.confirmEmail?.[0]}
                description={`Type "${userEmail}" to confirm`}
              />

              <Input
                name="confirmText"
                type="text"
                label='Type "DELETE MY ACCOUNT"'
                placeholder="DELETE MY ACCOUNT"
                required
                value={confirmTextInput}
                onChange={(e) => setConfirmTextInput(e.target.value)}
                error={initiateState?.errors?.confirmText?.[0]}
                description="Type exactly: DELETE MY ACCOUNT"
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Reason for Deletion (Optional)
                </label>
                <textarea
                  name="reason"
                  rows={3}
                  placeholder="Help us improve by telling us why you're leaving..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex items-start">
                  <svg
                    className="mr-3 mt-0.5 h-5 w-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="text-sm text-yellow-800">
                    <p className="mb-1 font-medium">Final Warning</p>
                    <p>
                      This will send a confirmation email to {userEmail}. You'll
                      have 24 hours to complete the deletion process.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={
                    initiateState === undefined ||
                    confirmEmailInput !== userEmail ||
                    confirmTextInput !== "DELETE MY ACCOUNT"
                  }
                >
                  {initiateState === undefined
                    ? "Processing..."
                    : "Send Deletion Confirmation"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep("warning")}
                >
                  Back
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {currentStep === "token" && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">
              Complete Account Deletion
            </h2>
          </CardHeader>
          <CardContent>
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                We've sent a confirmation email to <strong>{userEmail}</strong>.
                Click the link in the email or enter the deletion token below.
              </p>
            </div>

            <form action={confirmAction} className="space-y-4">
              <Input
                name="token"
                type="text"
                label="Deletion Token"
                placeholder="Enter the token from your email"
                required
                error={confirmState?.errors?.token?.[0]}
                description="Copy the deletion token from the confirmation email"
              />

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="finalConfirmation"
                  name="finalConfirmation"
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <label
                  htmlFor="finalConfirmation"
                  className="text-sm text-gray-700"
                >
                  I understand that this action is{" "}
                  <strong>permanent and irreversible</strong>. My account and
                  all associated data will be permanently deleted.
                </label>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={confirmState === undefined}
                >
                  {confirmState === undefined
                    ? "Deleting Account..."
                    : "Permanently Delete Account"}
                </Button>
                <form action={cancelAction} className="inline">
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={cancelState === undefined}
                  >
                    Cancel Deletion
                  </Button>
                </form>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <h4 className="mb-2 text-sm font-medium text-gray-900">Need Help?</h4>
          <div className="space-y-1 text-xs text-gray-600">
            <p>
              • If you're having trouble with your account, try reaching out to
              support first
            </p>
            <p>
              • Account deletion is permanent - consider deactivating instead
            </p>
            <p>
              • You have 24 hours from confirmation email to complete deletion
            </p>
            <p>
              • Contact support if you need to recover a recently deleted
              account
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
