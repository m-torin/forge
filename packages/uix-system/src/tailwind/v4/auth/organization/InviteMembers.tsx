/**
 * Tailwind v4 RSC Invite Members
 * 100% React Server Component with server actions
 */

import { useFormState } from 'react-dom';
import { inviteMembersAction } from '../actions';
import type { BaseProps, FormState } from '../types';
import { createInitialActionState } from '../types';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';

interface InviteMembersProps extends BaseProps {
  organizationId: string;
  allowedRoles?: Array<'admin' | 'member'>;
  maxInvites?: number;
}

const _initialState: FormState = { success: false };

export function InviteMembers({
  organizationId,
  allowedRoles = ['member', 'admin'],
  maxInvites = 10,
  className = '',
}: InviteMembersProps) {
  const [formState, formAction] = useFormState(inviteMembersAction, createInitialActionState());

  return (
    <Card className={className}>
      <CardHeader>
        <h3 className="text-lg font-medium text-gray-900">Invite Members</h3>
        <p className="text-sm text-gray-600">Send invitations to join your organization</p>
      </CardHeader>

      <CardContent>
        {formState?.error && (
          <Alert variant="destructive" className="mb-4">
            {formState.error}
          </Alert>
        )}

        {formState?.success && (
          <Alert variant="success" className="mb-4">
            Invitations sent successfully!
          </Alert>
        )}

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="organizationId" value={organizationId} />

          <Input
            name="emails"
            label="Email Addresses"
            placeholder="user1@example.com, user2@example.com"
            required
            error={undefined}
            description={`Enter up to ${maxInvites} email addresses separated by commas`}
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
            <select
              name="role"
              defaultValue="member"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {allowedRoles.includes('member') && <option value="member">Member</option>}
              {allowedRoles.includes('admin') && <option value="admin">Admin</option>}
            </select>
          </div>

          <Input
            name="message"
            label="Personal Message (Optional)"
            placeholder="Join our team to collaborate on exciting projects!"
            error={undefined}
            description="Add a personal touch to your invitation"
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={formState === undefined}
          >
            Send Invitations
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
