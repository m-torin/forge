/**
 * Tailwind v4 RSC Organization Members List
 * 100% React Server Component with server actions
 */

import { useFormState } from 'react-dom';
import { removeMemberAction, updateMemberRoleAction } from '../actions';
import type { BaseProps, FormState } from '../types';
import { createInitialActionState } from '../types';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';

interface Member {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  lastActive?: string;
  status: 'active' | 'pending' | 'inactive';
  twoFactorEnabled: boolean;
}

interface MembersListProps extends BaseProps {
  members: Member[];
  organizationId: string;
  currentUserId?: string;
  canManageMembers?: boolean;
  showInviteButton?: boolean;
  onInviteClick?: () => void;
}

const initialState: FormState = { success: false };

const roleColors = {
  owner: 'bg-purple-100 text-purple-800',
  admin: 'bg-blue-100 text-blue-800',
  member: 'bg-gray-100 text-gray-800',
};

const statusColors = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  inactive: 'bg-gray-100 text-gray-600',
};

export function MembersList({
  members,
  organizationId,
  currentUserId,
  canManageMembers = false,
  showInviteButton = true,
  onInviteClick,
  className = '',
}: MembersListProps) {
  const [roleState, roleAction] = useFormState(updateMemberRoleAction, createInitialActionState());
  const [removeState, removeAction] = useFormState(removeMemberAction, createInitialActionState());

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Members ({members.length})</h3>
            <p className="text-sm text-gray-600">Manage organization members and their roles</p>
          </div>
          {showInviteButton && (
            <Button variant="primary" onClick={onInviteClick}>
              Invite Members
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {roleState?.error && (
          <Alert variant="destructive" className="mb-4">
            {roleState.error}
          </Alert>
        )}

        {removeState?.error && (
          <Alert variant="destructive" className="mb-4">
            {removeState.error}
          </Alert>
        )}

        {(roleState?.success || removeState?.success) && (
          <Alert variant="success" className="mb-4">
            {roleState?.success
              ? 'Member role updated successfully!'
              : 'Member removed successfully!'}
          </Alert>
        )}

        {members.length === 0 ? (
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
                d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
              />
            </svg>
            <h4 className="mt-2 text-sm font-medium text-gray-900">No members yet</h4>
            <p className="mt-1 text-sm text-gray-500">
              Get started by inviting team members to your organization.
            </p>
            {showInviteButton && (
              <Button variant="primary" className="mt-4" onClick={onInviteClick}>
                Send your first invite
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {members.map(member => {
              const isCurrentUser = member.id === currentUserId;
              const canModifyMember = canManageMembers && !isCurrentUser && member.role !== 'owner';

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
                          <span className="text-sm font-medium text-gray-700">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {member.name}
                          {isCurrentUser && (
                            <span className="ml-1 text-xs text-gray-500">(You)</span>
                          )}
                        </p>

                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${roleColors[member.role]}`}
                        >
                          {member.role}
                        </span>

                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusColors[member.status]}`}
                        >
                          {member.status}
                        </span>

                        {member.twoFactorEnabled && (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                            2FA
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex items-center text-xs text-gray-500">
                        <span>{member.email}</span>
                        <span className="mx-2">•</span>
                        <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                        {member.lastActive && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Active {new Date(member.lastActive).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {canModifyMember && (
                    <div className="flex items-center space-x-2">
                      <form action={roleAction} className="inline">
                        <input type="hidden" name="organizationId" value={organizationId} />
                        <input type="hidden" name="memberId" value={member.id} />
                        <select
                          name="role"
                          defaultValue={member.role}
                          className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                          onChange={e => {
                            const form = e.target.closest('form') as HTMLFormElement;
                            form.requestSubmit();
                          }}
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                      </form>

                      <form action={removeAction} className="inline">
                        <input type="hidden" name="organizationId" value={organizationId} />
                        <input type="hidden" name="memberId" value={member.id} />
                        <Button
                          type="submit"
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          loading={removeState === undefined}
                        >
                          Remove
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
