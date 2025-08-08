/**
 * Tailwind v4 RSC Organization Settings
 * 100% React Server Component with server actions
 */

import { useFormState } from 'react-dom';
import { deleteOrganizationAction, updateOrganizationAction } from '../actions';
import type { BaseProps, FormState } from '../types';
import { createInitialActionState } from '../types';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';

interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  image?: string;
  memberCount: number;
  plan: string;
  billingEmail?: string;
  createdAt: string;
  settings: {
    allowMemberInvites: boolean;
    requireTwoFactor: boolean;
    allowedDomains?: string[];
  };
}

interface OrganizationSettingsProps extends BaseProps {
  organization: Organization;
  canEdit?: boolean;
  canDelete?: boolean;
}

const _initialState: FormState = { success: false };

export function OrganizationSettings({
  organization,
  canEdit = true,
  canDelete = false,
  className = '',
}: OrganizationSettingsProps) {
  const [updateState, updateAction] = useFormState(
    updateOrganizationAction,
    createInitialActionState(),
  );
  const [deleteState, deleteAction] = useFormState(
    deleteOrganizationAction,
    createInitialActionState(),
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Organization Information</h3>
          <p className="text-sm text-gray-600">
            Basic details about your organization that are visible to members.
          </p>
        </CardHeader>

        <CardContent>
          {updateState?.error && (
            <Alert variant="destructive" className="mb-4">
              {updateState.error}
            </Alert>
          )}

          {updateState?.success && (
            <Alert variant="success" className="mb-4">
              Organization settings updated successfully!
            </Alert>
          )}

          <form action={updateAction} className="space-y-4">
            <input type="hidden" name="organizationId" value={organization.id} />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                name="name"
                label="Organization Name"
                defaultValue={organization.name}
                required
                disabled={!canEdit}
                error={updateState?.errors?.name?.[0]}
              />

              <Input
                name="slug"
                label="URL Slug"
                defaultValue={organization.slug}
                required
                disabled={!canEdit}
                error={updateState?.errors?.slug?.[0]}
                description="Used in URLs and team identifiers"
              />
            </div>

            <Input
              name="description"
              label="Description"
              defaultValue={organization.description}
              disabled={!canEdit}
              error={updateState?.errors?.description?.[0]}
              description="Optional description of your organization"
            />

            <Input
              name="website"
              type="url"
              label="Website"
              defaultValue={organization.website}
              disabled={!canEdit}
              error={updateState?.errors?.website?.[0]}
              placeholder="https://example.com"
            />

            <Input
              name="billingEmail"
              type="email"
              label="Billing Email"
              defaultValue={organization.billingEmail}
              disabled={!canEdit}
              error={updateState?.errors?.billingEmail?.[0]}
              description="Email for billing and important notifications"
            />

            {canEdit && (
              <div className="flex justify-end">
                <Button type="submit" variant="primary" loading={updateState === undefined}>
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
          <p className="text-sm text-gray-600">
            Configure security policies for your organization.
          </p>
        </CardHeader>

        <CardContent>
          <form action={updateAction} className="space-y-4">
            <input type="hidden" name="organizationId" value={organization.id} />
            <input type="hidden" name="action" value="updateSecurity" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Allow Member Invites</label>
                  <p className="text-sm text-gray-600">
                    Allow organization members to invite new members
                  </p>
                </div>
                <input
                  type="checkbox"
                  name="allowMemberInvites"
                  defaultChecked={organization.settings.allowMemberInvites}
                  disabled={!canEdit}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">
                    Require Two-Factor Authentication
                  </label>
                  <p className="text-sm text-gray-600">Require all members to enable 2FA</p>
                </div>
                <input
                  type="checkbox"
                  name="requireTwoFactor"
                  defaultChecked={organization.settings.requireTwoFactor}
                  disabled={!canEdit}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <Input
                name="allowedDomains"
                label="Allowed Email Domains"
                defaultValue={organization.settings.allowedDomains?.join(', ')}
                disabled={!canEdit}
                placeholder="example.com, company.com"
                description="Comma-separated list of domains allowed to join (optional)"
              />
            </div>

            {canEdit && (
              <div className="flex justify-end">
                <Button type="submit" variant="primary" loading={updateState === undefined}>
                  Update Security
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Organization Stats */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Organization Overview</h3>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{organization.memberCount}</p>
              <p className="text-sm text-gray-600">Members</p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-2xl font-bold capitalize text-gray-900">{organization.plan}</p>
              <p className="text-sm text-gray-600">Plan</p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-sm font-medium text-gray-900">
                {new Date(organization.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">Created</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      {canDelete && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-red-900">Danger Zone</h3>
            <p className="text-sm text-red-600">Irreversible and destructive actions.</p>
          </CardHeader>

          <CardContent>
            {deleteState?.error && (
              <Alert variant="destructive" className="mb-4">
                {deleteState.error}
              </Alert>
            )}

            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-red-900">Delete Organization</h4>
                  <p className="text-sm text-red-700">
                    This will permanently delete the organization and all its data. This action
                    cannot be undone.
                  </p>
                </div>
                <form action={deleteAction}>
                  <input type="hidden" name="organizationId" value={organization.id} />
                  <Button type="submit" variant="destructive" loading={deleteState === undefined}>
                    Delete Organization
                  </Button>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
