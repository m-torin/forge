/**
 * AdminImpersonation - User impersonation interface
 * Allows administrators to impersonate users for support and debugging
 */

import { useState, useTransition } from 'react';
import { useFormState } from 'react-dom';
import { impersonateUserAction, listUsersAction, stopImpersonatingAction } from '../actions';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  banned?: boolean;
  emailVerified?: boolean;
  image?: string;
  createdAt: string;
  lastSignInAt?: string;
  _count?: {
    sessions: number;
    accounts: number;
  };
}

interface ImpersonationSession {
  id: string;
  adminUserId: string;
  adminUserEmail: string;
  targetUserId: string;
  targetUserEmail: string;
  targetUserName?: string;
  startedAt: string;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}

interface AdminImpersonationProps {
  currentImpersonation?: ImpersonationSession;
  recentImpersonations: ImpersonationSession[];
  onImpersonationStart: (session: ImpersonationSession) => void;
  onImpersonationEnd: () => void;
  className?: string;
}

const initialFormState = { success: false, error: '' };

export function AdminImpersonation({
  currentImpersonation,
  recentImpersonations,
  onImpersonationStart,
  onImpersonationEnd,
  className = '',
}: AdminImpersonationProps) {
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [impersonationReason, setImpersonationReason] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Form state
  const [impersonateState, setImpersonateState] = useState(initialFormState);
  const [stopState, stopAction] = useFormState(stopImpersonatingAction, initialFormState);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    startTransition(async () => {
      try {
        const results = await listUsersAction({
          search: searchQuery,
          limit: 10,
        });
        if (results.success && results.data) {
          setSearchResults(results.data.filter((user: any) => !user.banned) as unknown as User[]);
        }
      } catch (error) {
        console.error('Search failed:', error);
      }
    });
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setShowConfirmation(true);
  };

  const handleImpersonateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const formData = new FormData();
    formData.append('userId', selectedUser.id);
    formData.append('reason', impersonationReason);

    startTransition(async () => {
      try {
        const result = await impersonateUserAction(selectedUser.id);
        if (result) {
          const session: ImpersonationSession = {
            id: crypto.randomUUID(),
            adminUserId: 'current-admin-id',
            adminUserEmail: 'current-admin@example.com',
            targetUserId: selectedUser.id,
            targetUserEmail: selectedUser.email,
            targetUserName: selectedUser.name,
            startedAt: new Date().toISOString(),
            reason: impersonationReason,
          };
          onImpersonationStart(session);

          // Reset form
          setSelectedUser(null);
          setImpersonationReason('');
          setShowConfirmation(false);
          setSearchQuery('');
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Impersonation failed:', error);
      }
    });
  };

  const handleStopImpersonation = async () => {
    startTransition(async () => {
      const result = await stopImpersonatingAction();
      if (result && !result.error) {
        onImpersonationEnd();
      }
    });
  };

  const formatDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`;
    }
    return `${diffMins}m`;
  };

  const getRoleColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'moderator':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'user':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">User Impersonation</h2>
          <p className="mt-1 text-sm text-gray-600">
            Impersonate users for support and debugging purposes
          </p>
        </div>
        {currentImpersonation && (
          <Button onClick={handleStopImpersonation} variant="destructive" disabled={isPending}>
            {isPending ? 'Stopping...' : 'Stop Impersonation'}
          </Button>
        )}
      </div>

      {/* Current Impersonation Status */}
      {currentImpersonation ? (
        <Alert>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">👤</span>
              <div>
                <h4 className="font-medium">Currently Impersonating</h4>
                <p className="text-sm">
                  <strong>{currentImpersonation.targetUserName || 'No name'}</strong> (
                  {currentImpersonation.targetUserEmail})
                </p>
                <p className="text-xs text-gray-600">
                  Started {formatDuration(currentImpersonation.startedAt)} ago
                  {currentImpersonation.reason && ` • Reason: ${currentImpersonation.reason}`}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={() => window.open('/', '_blank')}>
                Open in New Tab
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleStopImpersonation}
                disabled={isPending}
              >
                Stop
              </Button>
            </div>
          </div>
        </Alert>
      ) : (
        <Alert variant="default">
          <div className="flex items-center">
            <span className="mr-3 text-lg text-green-600">✅</span>
            <div>
              <h4 className="font-medium">No Active Impersonation</h4>
              <p className="text-sm">You are currently operating as yourself</p>
            </div>
          </div>
        </Alert>
      )}

      {/* Error/Success Messages */}
      {(impersonateState.error || stopState.error) && (
        <Alert variant="destructive">{impersonateState.error || stopState.error}</Alert>
      )}

      {(impersonateState.success || stopState.success) && (
        <Alert variant="default">
          {impersonateState.success
            ? 'Impersonation started successfully!'
            : 'Impersonation stopped successfully!'}
        </Alert>
      )}

      {/* User Search */}
      {!currentImpersonation && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Find User to Impersonate</h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by email, name, or ID..."
                  className="flex-1"
                />
                <Button type="submit" disabled={isPending || !searchQuery.trim()}>
                  {isPending ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </form>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-6">
                <h4 className="mb-3 text-sm font-medium text-gray-700">Search Results</h4>
                <div className="space-y-3">
                  {searchResults.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        {user.image ? (
                          <img className="h-10 w-10 rounded-full" src={user.image} alt="" />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
                            <span className="text-sm font-medium text-gray-700">
                              {user.name?.[0] || user.email[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">
                              {user.name || 'No name'}
                            </span>
                            <span
                              className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getRoleColor(user.role)}`}
                            >
                              {user.role || 'user'}
                            </span>
                            {!user.emailVerified && (
                              <span className="inline-flex rounded-full border border-yellow-200 bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                                Unverified
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                          <div className="text-xs text-gray-500">
                            ID: {user.id.slice(0, 8)}... • Created:{' '}
                            {new Date(user.createdAt).toLocaleDateString()}
                            {user.lastSignInAt && (
                              <>
                                {' '}
                                • Last sign in: {new Date(user.lastSignInAt).toLocaleDateString()}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right text-sm text-gray-500">
                          <div>{user._count?.sessions || 0} sessions</div>
                          <div>{user._count?.accounts || 0} accounts</div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleUserSelect(user)}
                          disabled={user.banned}
                        >
                          {user.banned ? 'Banned' : 'Impersonate'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchQuery && searchResults.length === 0 && !isPending && (
              <div className="mt-6 py-8 text-center">
                <div className="mb-2 text-gray-400">
                  <svg
                    className="mx-auto h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900">No users found</h3>
                <p className="text-sm text-gray-500">Try adjusting your search terms</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Impersonation Confirmation */}
      {showConfirmation && selectedUser && (
        <Card className="border-blue-200">
          <CardHeader className="bg-blue-50">
            <h3 className="text-lg font-medium text-blue-900">Confirm Impersonation</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4 rounded-lg border border-gray-200 bg-white p-4">
              {selectedUser.image ? (
                <img className="h-12 w-12 rounded-full" src={selectedUser.image} alt="" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-300">
                  <span className="text-lg font-medium text-gray-700">
                    {selectedUser.name?.[0] || selectedUser.email[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h4 className="font-medium text-gray-900">{selectedUser.name || 'No name'}</h4>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
                <div className="mt-1 flex items-center space-x-2">
                  <span
                    className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getRoleColor(selectedUser.role)}`}
                  >
                    {selectedUser.role || 'user'}
                  </span>
                  <span className="text-xs text-gray-500">ID: {selectedUser.id}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleImpersonateSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Reason for Impersonation (Required)
                </label>
                <textarea
                  required
                  value={impersonationReason}
                  onChange={e => setImpersonationReason(e.target.value)}
                  placeholder="Provide a clear reason for impersonating this user (e.g., debugging reported issue, providing support, investigating security concern)"
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  This reason will be logged for audit purposes
                </p>
              </div>

              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex items-start">
                  <span className="mr-2 text-lg text-yellow-600">⚠️</span>
                  <div className="text-sm text-yellow-800">
                    <p className="mb-1 font-medium">Important Impersonation Guidelines:</p>
                    <ul className="list-inside list-disc space-y-1">
                      <li>Only use impersonation for legitimate support and debugging purposes</li>
                      <li>All actions performed during impersonation are logged and auditable</li>
                      <li>Respect user privacy and only access necessary information</li>
                      <li>End the impersonation session as soon as your task is complete</li>
                      <li>Never share or misuse information accessed during impersonation</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button type="submit" disabled={isPending || !impersonationReason.trim()}>
                  {isPending ? 'Starting Impersonation...' : 'Start Impersonation'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowConfirmation(false);
                    setSelectedUser(null);
                    setImpersonationReason('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Recent Impersonations */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Recent Impersonations</h3>
        </CardHeader>
        <CardContent>
          {recentImpersonations.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mb-2 text-gray-400">
                <svg
                  className="mx-auto h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h4 className="text-sm font-medium text-gray-900">No Recent Impersonations</h4>
              <p className="text-sm text-gray-500">Your impersonation history will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentImpersonations.slice(0, 10).map(session => (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
                      <span className="text-xs font-medium text-gray-700">
                        {session.targetUserName?.[0] || session.targetUserEmail[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {session.targetUserName || 'No name'}
                      </div>
                      <div className="text-sm text-gray-600">{session.targetUserEmail}</div>
                      {session.reason && (
                        <div className="text-xs text-gray-500">Reason: {session.reason}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>{new Date(session.startedAt).toLocaleString()}</div>
                    <div className="text-xs">by {session.adminUserEmail}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-start">
            <span className="mr-3 text-lg text-red-600">🔒</span>
            <div className="text-sm text-red-800">
              <h4 className="mb-2 font-medium">Security & Compliance Notice</h4>
              <p>
                All impersonation activities are logged and monitored for security and compliance
                purposes. Misuse of impersonation capabilities may result in account suspension or
                termination. Only use this feature for legitimate administrative and support
                purposes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
