/**
 * Tailwind v4 RSC Passkey Setup
 * 100% React Server Component with server actions
 */

import { useFormState } from "react-dom";
import { createPasskeyAction, deletePasskeyAction } from "../actions";
import type { BaseProps, FormState } from "../types";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Input } from "../ui/Input";

interface PasskeySetupProps extends BaseProps {
  existingPasskeys?: Array<{
    id: string;
    name: string;
    createdAt: string;
    lastUsed?: string;
  }>;
}

const _initialState: FormState = { success: false };

type CreatePasskeyState =
  | { success: false; errors: { name: string[] } }
  | { success: true; message: string }
  | { success: false; error: string };

type DeletePasskeyState =
  | { success: false; errors: { passkeyId: string[] } }
  | { success: true; message: string }
  | { success: false; error: string };

const initialCreateState: CreatePasskeyState = { success: false, error: "" };
const initialDeleteState: DeletePasskeyState = { success: false, error: "" };

export function PasskeySetup({
  className = "",
  existingPasskeys = [],
}: PasskeySetupProps) {
  const [createState, createAction] = useFormState(
    createPasskeyAction,
    initialCreateState,
  );
  const [deleteState, deleteAction] = useFormState(
    deletePasskeyAction,
    initialDeleteState,
  );

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
              <svg
                className="h-5 w-5 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 5.25a3 3 0 0 1 3 3m0 0a3 3 0 0 1-3 3H12M6.75 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 0H8.25m2.25 0H12m0 0h2.25M12 13.5V9m0 0a3 3 0 1 1 6 0c0 .75-.274 1.433-.722 1.957L12 13.5Z"
                />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Passkeys</h3>
            <p className="text-sm text-gray-500">
              Secure, passwordless authentication using biometrics or security
              keys
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">
                  About Passkeys
                </h4>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-inside list-disc space-y-1">
                    <li>Sign in with Face ID, Touch ID, or security keys</li>
                    <li>More secure than passwords - no phishing attacks</li>
                    <li>Works across all your devices automatically</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {createState?.error && (
            <Alert type="error">{createState.error}</Alert>
          )}

          {createState?.success && (
            <Alert type="success">
              Passkey created successfully! You can now use it to sign in.
            </Alert>
          )}

          {deleteState?.error && (
            <Alert type="error">{deleteState.error}</Alert>
          )}

          {deleteState?.success && (
            <Alert type="success">Passkey deleted successfully.</Alert>
          )}

          <div>
            <h4 className="mb-3 text-sm font-medium text-gray-900">
              Create New Passkey
            </h4>
            <form action={createAction} className="space-y-4">
              <Input
                name="name"
                type="text"
                label="Passkey Name"
                placeholder="My iPhone, Work Laptop, etc."
                required
                error={createState?.errors?.name?.[0]}
                description="Give your passkey a memorable name"
              />

              <Button
                type="submit"
                variant="primary"
                loading={createState === undefined}
              >
                Create Passkey
              </Button>
            </form>
          </div>

          {existingPasskeys.length > 0 && (
            <div>
              <h4 className="mb-3 text-sm font-medium text-gray-900">
                Your Passkeys ({existingPasskeys.length})
              </h4>
              <div className="space-y-3">
                {existingPasskeys.map((passkey) => (
                  <div
                    key={passkey.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                          <svg
                            className="h-4 w-4 text-purple-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 5.25a3 3 0 0 1 3 3m0 0a3 3 0 0 1-3 3H12M6.75 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 0H8.25m2.25 0H12m0 0h2.25M12 13.5V9m0 0a3 3 0 1 1 6 0c0 .75-.274 1.433-.722 1.957L12 13.5Z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {passkey.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Created{" "}
                          {new Date(passkey.createdAt).toLocaleDateString()}
                          {passkey.lastUsed && (
                            <>
                              {" "}
                              • Last used{" "}
                              {new Date(passkey.lastUsed).toLocaleDateString()}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <form action={deleteAction}>
                      <input
                        type="hidden"
                        name="passkeyId"
                        value={passkey.id}
                      />
                      <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          )}

          {existingPasskeys.length === 0 && (
            <div className="py-6 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 5.25a3 3 0 0 1 3 3m0 0a3 3 0 0 1-3 3H12M6.75 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 0H8.25m2.25 0H12m0 0h2.25M12 13.5V9m0 0a3 3 0 1 1 6 0c0 .75-.274 1.433-.722 1.957L12 13.5Z"
                />
              </svg>
              <h4 className="mt-2 text-sm font-medium text-gray-900">
                No passkeys yet
              </h4>
              <p className="mt-1 text-sm text-gray-500">
                Create your first passkey to enable secure, passwordless
                sign-in.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
