/**
 * Tailwind v4 RSC Sessions List
 * 100% React Server Component with server actions
 */

import { useFormState } from 'react-dom';
import { revokeSessionAction } from '../actions';
import type { BaseProps, FormState } from '../types';
import { createInitialActionState } from '../types';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';

interface Session {
  id: string;
  deviceName: string;
  browser: string;
  os: string;
  location?: string;
  ipAddress: string;
  isCurrent: boolean;
  lastActive: string;
  createdAt: string;
}

interface SessionsListProps extends BaseProps {
  sessions: Session[];
  currentSessionId?: string;
}

const _initialState: FormState = { success: false };

export function SessionsList({
  sessions,
  currentSessionId: _currentSessionId,
  className = '',
}: SessionsListProps) {
  const [formState, formAction] = useFormState(revokeSessionAction, createInitialActionState());

  return (
    <Card className={className}>
      <CardHeader>
        <h3 className="text-lg font-medium text-gray-900">Active Sessions ({sessions.length})</h3>
        <p className="text-sm text-gray-600">Manage your active sessions across devices</p>
      </CardHeader>

      <CardContent>
        {formState?.error && (
          <Alert type="error" className="mb-4">
            {formState.error}
          </Alert>
        )}

        {formState?.success && (
          <Alert type="success" className="mb-4">
            Session revoked successfully!
          </Alert>
        )}

        <div className="space-y-4">
          {sessions.map(session => (
            <div
              key={session.id}
              className={`flex items-center justify-between rounded-lg border p-4 ${
                session.isCurrent ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
                    <svg
                      className="h-5 w-5 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25"
                      />
                    </svg>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900">{session.deviceName}</p>
                    {session.isCurrent && (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {session.browser} on {session.os}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{session.ipAddress}</span>
                    {session.location && (
                      <>
                        <span>•</span>
                        <span>{session.location}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>Last active {new Date(session.lastActive).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {!session.isCurrent && (
                <form action={formAction}>
                  <input type="hidden" name="sessionId" value={session.id} />
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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
