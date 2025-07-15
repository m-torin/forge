/**
 * Tailwind v4 RSC API Keys List
 * 100% React Server Component with server actions
 */

import { useFormState } from 'react-dom';
import { revokeAPIKeyAction } from '../actions';
import type { BaseProps } from '../types';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';

interface APIKey {
  id: string;
  name: string;
  keyPreview: string; // Only first 8 chars + '...'
  permissions: string[];
  createdAt: string;
  lastUsed?: string;
  expiresAt?: string;
  status: 'active' | 'expired' | 'revoked';
  requestCount: number;
}

interface APIKeysListProps extends BaseProps {
  apiKeys: APIKey[];
  canCreateKeys?: boolean;
  canRevokeKeys?: boolean;
  onCreateClick?: () => void;
}

type RevokeAPIKeyState =
  | { success: false; errors: { keyId: string[] } }
  | { success: true; message: string }
  | { success: false; error: string };

const initialRevokeAPIKeyState: RevokeAPIKeyState = { success: false, error: '' };

const statusColors = {
  active: 'bg-green-100 text-green-800',
  expired: 'bg-red-100 text-red-800',
  revoked: 'bg-gray-100 text-gray-600',
};

export function APIKeysList({
  apiKeys,
  canCreateKeys = true,
  canRevokeKeys = true,
  onCreateClick,
  className = '',
}: APIKeysListProps) {
  const [formState, formAction] = useFormState(revokeAPIKeyAction, initialRevokeAPIKeyState);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">API Keys ({apiKeys.length})</h3>
            <p className="text-sm text-gray-600">Manage API keys for programmatic access</p>
          </div>
          {canCreateKeys && (
            <Button variant="primary" onClick={onCreateClick}>
              Create API Key
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {formState?.error && (
          <Alert type="error" className="mb-4">
            {formState.error}
          </Alert>
        )}

        {formState?.success && (
          <Alert type="success" className="mb-4">
            API key revoked successfully!
          </Alert>
        )}

        {apiKeys.length === 0 ? (
          <div className="py-8 text-center">
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
            <h4 className="mt-2 text-sm font-medium text-gray-900">No API keys</h4>
            <p className="mt-1 text-sm text-gray-500">
              Create your first API key to start building with our API.
            </p>
            {canCreateKeys && (
              <Button variant="primary" className="mt-4" onClick={onCreateClick}>
                Create your first API key
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {apiKeys.map(apiKey => (
              <div
                key={apiKey.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center space-x-3">
                    <h4 className="truncate text-sm font-medium text-gray-900">{apiKey.name}</h4>

                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusColors[apiKey.status]}`}
                    >
                      {apiKey.status}
                    </span>

                    <div className="flex items-center space-x-1">
                      <svg
                        className="h-4 w-4 text-gray-400"
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
                      <code className="font-mono text-xs text-gray-600">{apiKey.keyPreview}</code>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Created {new Date(apiKey.createdAt).toLocaleDateString()}</span>

                    {apiKey.expiresAt && (
                      <span>Expires {new Date(apiKey.expiresAt).toLocaleDateString()}</span>
                    )}

                    {apiKey.lastUsed && (
                      <span>Last used {new Date(apiKey.lastUsed).toLocaleDateString()}</span>
                    )}

                    <span>{apiKey.requestCount.toLocaleString()} requests</span>
                  </div>

                  {apiKey.permissions.length > 0 && (
                    <div className="mt-2 flex items-center space-x-1">
                      <span className="text-xs text-gray-500">Permissions:</span>
                      <div className="flex flex-wrap gap-1">
                        {apiKey.permissions.slice(0, 3).map(permission => (
                          <span
                            key={permission}
                            className="inline-flex items-center rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
                          >
                            {permission}
                          </span>
                        ))}
                        {apiKey.permissions.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{apiKey.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="ml-4 flex items-center space-x-2">
                  {apiKey.status === 'active' && canRevokeKeys && (
                    <form action={formAction}>
                      <input type="hidden" name="keyId" value={apiKey.id} />
                      <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        loading={formState === undefined}
                      >
                        Revoke
                      </Button>
                    </form>
                  )}

                  <Button variant="ghost" size="sm">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
