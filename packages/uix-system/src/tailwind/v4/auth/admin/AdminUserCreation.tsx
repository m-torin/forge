/**
 * AdminUserCreation - Create new users with roles
 * Comprehensive user creation interface for administrators
 */

import { useState, useTransition } from 'react';
import { bulkInviteUsersAction, createUserAction } from '../actions';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';

interface AdminUserCreationProps {
  onUserCreated: (user: any) => void;
  onCancel: () => void;
  className?: string;
}

type CreationMode = 'single' | 'bulk' | 'invite';

const initialFormState = { success: false, error: '' };

export function AdminUserCreation({
  onUserCreated,
  onCancel,
  className = '',
}: AdminUserCreationProps) {
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<CreationMode>('single');
  const [generatePassword, setGeneratePassword] = useState(true);
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);

  // Single user form state
  const [singleUserForm, setSingleUserForm] = useState({
    email: '',
    name: '',
    password: '',
    role: 'user',
    emailVerified: false,
    twoFactorEnabled: false,
  });

  // Bulk creation form state
  const [bulkEmails, setBulkEmails] = useState('');
  const [bulkRole, setBulkRole] = useState('user');
  const [bulkOrganization, setBulkOrganization] = useState('');

  // Form states for different actions
  const [createState, setCreateState] = useState(initialFormState);
  const [bulkState, setBulkState] = useState(initialFormState);

  const handleSingleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('email', singleUserForm.email);
    formData.append('name', singleUserForm.name);
    formData.append('role', singleUserForm.role);

    if (!generatePassword && singleUserForm.password) {
      formData.append('password', singleUserForm.password);
    }

    formData.append('emailVerified', singleUserForm.emailVerified.toString());
    formData.append('sendWelcomeEmail', sendWelcomeEmail.toString());

    startTransition(async () => {
      try {
        const result = await createUserAction({
          email: singleUserForm.email,
          name: singleUserForm.name,
          role: singleUserForm.role,
          password: generatePassword ? undefined : singleUserForm.password,
        });

        setCreateState({ success: true, error: '' });
        onUserCreated(result);
        // Reset form
        setSingleUserForm({
          email: '',
          name: '',
          password: '',
          role: 'user',
          emailVerified: false,
          twoFactorEnabled: false,
        });
      } catch (error) {
        setCreateState({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create user',
        });
      }
    });
  };

  const handleBulkInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emails = bulkEmails
      .split('\n')
      .map(email => email.trim())
      .filter(email => email && email.includes('@'));

    if (emails.length === 0) {
      return;
    }

    const formData = new FormData();
    formData.append('emails', JSON.stringify(emails));
    formData.append('role', bulkRole);
    if (bulkOrganization) {
      formData.append('organizationId', bulkOrganization);
    }

    startTransition(async () => {
      try {
        const _result = await bulkInviteUsersAction({
          emails,
          role: bulkRole,
          organizationId: bulkOrganization || undefined,
        });

        setBulkState({ success: true, error: '' });
        onUserCreated({ type: 'bulk', count: emails.length });
        // Reset form
        setBulkEmails('');
        setBulkRole('user');
        setBulkOrganization('');
      } catch (error) {
        setBulkState({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to invite users',
        });
      }
    });
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSingleUserForm({ ...singleUserForm, password });
  };

  const emailCount = bulkEmails
    .split('\n')
    .map(email => email.trim())
    .filter(email => email && email.includes('@')).length;

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Create New Users</h2>
          <p className="mt-1 text-sm text-gray-600">
            Add new users to the system with appropriate roles and permissions
          </p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Creation Mode:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setMode('single')}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  mode === 'single'
                    ? 'border border-blue-200 bg-blue-100 text-blue-700'
                    : 'border border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Single User
              </button>
              <button
                onClick={() => setMode('bulk')}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  mode === 'bulk'
                    ? 'border border-blue-200 bg-blue-100 text-blue-700'
                    : 'border border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Bulk Invite
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {(createState.error || bulkState.error) && (
        <Alert variant="destructive">{createState.error || bulkState.error}</Alert>
      )}

      {(createState.success || bulkState.success) && (
        <Alert variant="default">
          {mode === 'single' ? 'User created successfully!' : 'Bulk invitations sent successfully!'}
        </Alert>
      )}

      {mode === 'single' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Create Single User</h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSingleUserSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    required
                    value={singleUserForm.email}
                    onChange={e => setSingleUserForm({ ...singleUserForm, email: e.target.value })}
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Full Name</label>
                  <Input
                    type="text"
                    value={singleUserForm.name}
                    onChange={e => setSingleUserForm({ ...singleUserForm, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">User Role</label>
                <select
                  value={singleUserForm.role}
                  onChange={e => setSingleUserForm({ ...singleUserForm, role: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {singleUserForm.role === 'admin' &&
                    'Full system access including user management'}
                  {singleUserForm.role === 'moderator' &&
                    'Limited admin access for content moderation'}
                  {singleUserForm.role === 'user' && 'Standard user access'}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="generatePassword"
                    checked={generatePassword}
                    onChange={e => setGeneratePassword(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="generatePassword" className="text-sm font-medium text-gray-700">
                    Generate random password
                  </label>
                </div>

                {!generatePassword && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
                    <div className="flex space-x-2">
                      <Input
                        type="password"
                        value={singleUserForm.password}
                        onChange={e =>
                          setSingleUserForm({ ...singleUserForm, password: e.target.value })
                        }
                        placeholder="Enter password"
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" onClick={generateRandomPassword}>
                        Generate
                      </Button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Minimum 8 characters with mixed case, numbers, and symbols
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="emailVerified"
                    checked={singleUserForm.emailVerified}
                    onChange={e =>
                      setSingleUserForm({ ...singleUserForm, emailVerified: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="emailVerified" className="text-sm font-medium text-gray-700">
                    Mark email as verified
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="sendWelcomeEmail"
                    checked={sendWelcomeEmail}
                    onChange={e => setSendWelcomeEmail(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="sendWelcomeEmail" className="text-sm font-medium text-gray-700">
                    Send welcome email with login instructions
                  </label>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Creating User...' : 'Create User'}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {mode === 'bulk' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Bulk User Invitation</h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBulkInviteSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email Addresses *
                </label>
                <textarea
                  required
                  value={bulkEmails}
                  onChange={e => setBulkEmails(e.target.value)}
                  placeholder="Enter email addresses, one per line:&#10;user1@example.com&#10;user2@example.com&#10;user3@example.com"
                  rows={8}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {emailCount > 0
                    ? `${emailCount} valid email${emailCount !== 1 ? 's' : ''} detected`
                    : 'Enter one email address per line'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Default Role
                  </label>
                  <select
                    value={bulkRole}
                    onChange={e => setBulkRole(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Organization (Optional)
                  </label>
                  <Input
                    type="text"
                    value={bulkOrganization}
                    onChange={e => setBulkOrganization(e.target.value)}
                    placeholder="Organization ID or name"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h4 className="mb-2 text-sm font-medium text-blue-900">Bulk Invitation Process</h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• Users will receive invitation emails with setup instructions</li>
                  <li>• They must complete registration by setting their password</li>
                  <li>• Email verification will be required during setup</li>
                  <li>• Invalid email addresses will be automatically filtered out</li>
                </ul>
              </div>

              {emailCount > 0 && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h4 className="mb-2 text-sm font-medium text-gray-900">Invitation Preview</h4>
                  <div className="text-sm text-gray-700">
                    <p>
                      <strong>{emailCount}</strong> users will be invited with{' '}
                      <strong>{bulkRole}</strong> role
                    </p>
                    {bulkOrganization && (
                      <p>
                        They will be added to organization: <strong>{bulkOrganization}</strong>
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <Button type="submit" disabled={isPending || emailCount === 0}>
                  {isPending
                    ? 'Sending Invitations...'
                    : `Send ${emailCount} Invitation${emailCount !== 1 ? 's' : ''}`}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">User Creation Guidelines</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-800">Single User Creation</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Users created with generated passwords will receive email instructions</li>
              <li>• Admin users have full system access including user management</li>
              <li>• Moderators have limited admin access for content moderation</li>
              <li>• Email verification can be bypassed for trusted users</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-800">Bulk Invitations</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Ideal for onboarding teams or large groups</li>
              <li>• Users must complete registration themselves</li>
              <li>• Invalid emails are automatically filtered out</li>
              <li>• Can assign users to organizations during invitation</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-800">Security Best Practices</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Use strong passwords or enable password generation</li>
              <li>• Verify email addresses for security-sensitive roles</li>
              <li>• Assign minimal required permissions initially</li>
              <li>• Review and audit user roles regularly</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
