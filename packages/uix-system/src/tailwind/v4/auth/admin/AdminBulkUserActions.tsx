/**
 * AdminBulkUserActions - Bulk user operations
 * Interface for performing actions on multiple users simultaneously
 */

import { useState, useTransition } from 'react';
import { useFormState } from 'react-dom';
import {
  adminDeleteUserAction,
  banUserAction,
  revokeUserSessionsAction,
  setUserRoleAction,
  unbanUserAction,
} from '../actions';
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
  _count?: {
    sessions: number;
    accounts: number;
  };
}

interface AdminBulkUserActionsProps {
  selectedUsers: User[];
  onActionComplete: (action: string, results: any) => void;
  onClearSelection: () => void;
  className?: string;
}

type BulkAction = 'ban' | 'unban' | 'delete' | 'role-change' | 'revoke-sessions' | 'send-emails';

const initialFormState = { success: false, error: '' };

export function AdminBulkUserActions({
  selectedUsers,
  onActionComplete,
  onClearSelection,
  className = '',
}: AdminBulkUserActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedAction, setSelectedAction] = useState<BulkAction | ''>('');
  const [newRole, setNewRole] = useState('user');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [confirmationText, setConfirmationText] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Form states
  const [actionState, _actionAction] = useFormState(
    async (__prevState: any, formData: FormData) => {
      const action = formData.get('action') as BulkAction;
      return await executeBulkAction(action, formData);
    },
    initialFormState,
  );

  const executeBulkAction = async (action: BulkAction, _formData?: FormData) => {
    const userIds = selectedUsers.map(user => user.id);
    let results: any = { success: 0, failed: 0, errors: [] };

    try {
      switch (action) {
        case 'ban':
          results = await Promise.allSettled(userIds.map(userId => banUserAction(userId)));
          break;

        case 'unban':
          results = await Promise.allSettled(userIds.map(userId => unbanUserAction(userId)));
          break;

        case 'delete':
          if (confirmationText !== 'DELETE') {
            throw new Error('Please type DELETE to confirm deletion');
          }
          results = await Promise.allSettled(userIds.map(userId => adminDeleteUserAction(userId)));
          break;

        case 'role-change':
          results = await Promise.allSettled(
            userIds.map(userId => setUserRoleAction(userId, newRole)),
          );
          break;

        case 'revoke-sessions':
          results = await Promise.allSettled(
            userIds.map(userId => revokeUserSessionsAction(userId)),
          );
          break;

        case 'send-emails':
          // This would integrate with an email sending service
          // For now, we'll simulate the action
          results = { success: userIds.length, failed: 0, errors: [] };
          break;
      }

      // Process results
      const processedResults = Array.isArray(results)
        ? {
            success: results.filter(r => r.status === 'fulfilled').length,
            failed: results.filter(r => r.status === 'rejected').length,
            errors: results
              .filter(r => r.status === 'rejected')
              .map((r: any) => r.reason?.message || 'Unknown error'),
          }
        : results;

      onActionComplete(action, processedResults);
      setShowConfirmation(false);
      setConfirmationText('');

      return { success: true, message: `${action} completed successfully` };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Action failed',
      };
    }
  };

  const handleActionSelect = (action: BulkAction) => {
    setSelectedAction(action);

    // Show confirmation for destructive actions
    if (['ban', 'delete', 'revoke-sessions'].includes(action)) {
      setShowConfirmation(true);
    } else {
      setShowConfirmation(false);
    }
  };

  const handleExecuteAction = async () => {
    if (!selectedAction) return;

    startTransition(async () => {
      await executeBulkAction(selectedAction);
    });
  };

  const getActionDescription = (action: BulkAction) => {
    switch (action) {
      case 'ban':
        return `Ban ${selectedUsers.length} user${selectedUsers.length !== 1 ? 's' : ''}`;
      case 'unban':
        return `Unban ${selectedUsers.length} user${selectedUsers.length !== 1 ? 's' : ''}`;
      case 'delete':
        return `Permanently delete ${selectedUsers.length} user${selectedUsers.length !== 1 ? 's' : ''}`;
      case 'role-change':
        return `Change role to "${newRole}" for ${selectedUsers.length} user${selectedUsers.length !== 1 ? 's' : ''}`;
      case 'revoke-sessions':
        return `Revoke all sessions for ${selectedUsers.length} user${selectedUsers.length !== 1 ? 's' : ''}`;
      case 'send-emails':
        return `Send email to ${selectedUsers.length} user${selectedUsers.length !== 1 ? 's' : ''}`;
      default:
        return '';
    }
  };

  const getActionVariant = (action: BulkAction) => {
    if (['ban', 'delete'].includes(action)) return 'destructive';
    return 'default';
  };

  const isDestructiveAction = (action: BulkAction) => {
    return ['ban', 'delete', 'revoke-sessions'].includes(action);
  };

  const canExecuteAction = () => {
    if (!selectedAction) return false;
    if (selectedAction === 'delete' && confirmationText !== 'DELETE') return false;
    if (selectedAction === 'send-emails' && (!emailSubject || !emailMessage)) return false;
    return true;
  };

  if (selectedUsers.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="mb-4 text-gray-400">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">No Users Selected</h3>
          <p className="text-gray-600">Select users from the list to perform bulk actions</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Bulk User Actions</h3>
              <p className="mt-1 text-sm text-gray-600">
                {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
              </p>
            </div>
            <Button variant="outline" onClick={onClearSelection}>
              Clear Selection
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-gray-50 p-4">
            <h4 className="mb-3 text-sm font-medium text-gray-700">Selected Users</h4>
            <div className="max-h-32 space-y-2 overflow-y-auto">
              {selectedUsers.slice(0, 10).map(user => (
                <div key={user.id} className="flex items-center space-x-3 text-sm">
                  {user.image ? (
                    <img className="h-6 w-6 rounded-full" src={user.image} alt="" />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-300">
                      <span className="text-xs text-gray-600">
                        {user.name?.[0] || user.email[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-gray-900">{user.name || 'No name'}</span>
                  <span className="text-gray-500">({user.email})</span>
                  {user.banned && (
                    <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                      Banned
                    </span>
                  )}
                </div>
              ))}
              {selectedUsers.length > 10 && (
                <div className="text-sm text-gray-500">
                  ... and {selectedUsers.length - 10} more users
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Select Action</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <Button
              variant={selectedAction === 'ban' ? 'destructive' : 'outline'}
              onClick={() => handleActionSelect('ban')}
              disabled={selectedUsers.every(u => u.banned)}
              className="flex h-auto flex-col items-center py-4"
            >
              <span className="mb-1 text-lg">🚫</span>
              <span className="text-sm">Ban Users</span>
            </Button>

            <Button
              variant={selectedAction === 'unban' ? 'default' : 'outline'}
              onClick={() => handleActionSelect('unban')}
              disabled={selectedUsers.every(u => !u.banned)}
              className="flex h-auto flex-col items-center py-4"
            >
              <span className="mb-1 text-lg">✅</span>
              <span className="text-sm">Unban Users</span>
            </Button>

            <Button
              variant={selectedAction === 'role-change' ? 'default' : 'outline'}
              onClick={() => handleActionSelect('role-change')}
              className="flex h-auto flex-col items-center py-4"
            >
              <span className="mb-1 text-lg">👤</span>
              <span className="text-sm">Change Role</span>
            </Button>

            <Button
              variant={selectedAction === 'revoke-sessions' ? 'destructive' : 'outline'}
              onClick={() => handleActionSelect('revoke-sessions')}
              className="flex h-auto flex-col items-center py-4"
            >
              <span className="mb-1 text-lg">🔐</span>
              <span className="text-sm">Revoke Sessions</span>
            </Button>

            <Button
              variant={selectedAction === 'send-emails' ? 'default' : 'outline'}
              onClick={() => handleActionSelect('send-emails')}
              className="flex h-auto flex-col items-center py-4"
            >
              <span className="mb-1 text-lg">📧</span>
              <span className="text-sm">Send Email</span>
            </Button>

            <Button
              variant={selectedAction === 'delete' ? 'destructive' : 'outline'}
              onClick={() => handleActionSelect('delete')}
              className="flex h-auto flex-col items-center py-4"
            >
              <span className="mb-1 text-lg">🗑️</span>
              <span className="text-sm">Delete Users</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedAction && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Configure Action</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedAction === 'role-change' && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">New Role</label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}

            {selectedAction === 'send-emails' && (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email Subject
                  </label>
                  <Input
                    type="text"
                    value={emailSubject}
                    onChange={e => setEmailSubject(e.target.value)}
                    placeholder="Enter email subject"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email Message
                  </label>
                  <textarea
                    value={emailMessage}
                    onChange={e => setEmailMessage(e.target.value)}
                    placeholder="Enter email message"
                    rows={6}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {showConfirmation && isDestructiveAction(selectedAction) && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="mb-3 flex items-center">
                  <span className="mr-2 text-lg text-red-600">⚠️</span>
                  <h4 className="text-sm font-medium text-red-900">Confirmation Required</h4>
                </div>
                <p className="mb-4 text-sm text-red-800">
                  {selectedAction === 'delete' &&
                    'This will permanently delete the selected users and all their data. This action cannot be undone.'}
                  {selectedAction === 'ban' &&
                    'This will ban the selected users from accessing the system.'}
                  {selectedAction === 'revoke-sessions' &&
                    'This will immediately log out all selected users from all their devices.'}
                </p>

                {selectedAction === 'delete' && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-red-900">
                      Type "DELETE" to confirm:
                    </label>
                    <Input
                      type="text"
                      value={confirmationText}
                      onChange={e => setConfirmationText(e.target.value)}
                      placeholder="DELETE"
                      className="border-red-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h4 className="mb-2 text-sm font-medium text-blue-900">Action Summary</h4>
              <p className="text-sm text-blue-800">{getActionDescription(selectedAction)}</p>
              {selectedAction === 'role-change' && (
                <p className="mt-1 text-xs text-blue-700">
                  Current roles will be overwritten with the new role
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {actionState.error && <Alert variant="destructive">{actionState.error}</Alert>}

      {actionState.success && <Alert variant="default">{actionState.message}</Alert>}

      {selectedAction && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Ready to execute: {getActionDescription(selectedAction)}
                </p>
                <p className="text-xs text-gray-500">
                  This action will affect {selectedUsers.length} user
                  {selectedUsers.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedAction('');
                    setShowConfirmation(false);
                    setConfirmationText('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant={getActionVariant(selectedAction)}
                  onClick={handleExecuteAction}
                  disabled={isPending || !canExecuteAction()}
                >
                  {isPending ? 'Processing...' : 'Execute Action'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
