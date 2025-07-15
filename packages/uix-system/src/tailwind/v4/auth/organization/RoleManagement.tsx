/**
 * Tailwind v4 RSC Role Management
 * 100% React Server Component with server actions
 */

import { useFormState } from 'react-dom';
import { updatePermissionsAction } from '../actions';
import type { BaseProps, FormState } from '../types';
import { createInitialActionState } from '../types';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'organization' | 'members' | 'settings' | 'billing';
}

interface Role {
  id: string;
  name: 'owner' | 'admin' | 'member';
  permissions: string[];
  memberCount: number;
  isSystemRole: boolean;
}

interface RoleManagementProps extends BaseProps {
  roles: Role[];
  permissions: Permission[];
  organizationId: string;
  canManageRoles?: boolean;
}

const initialState: FormState = { success: false };

const permissionCategories = {
  organization: 'Organization',
  members: 'Members',
  settings: 'Settings',
  billing: 'Billing',
};

export function RoleManagement({
  roles,
  permissions,
  organizationId,
  canManageRoles = false,
  className = '',
}: RoleManagementProps) {
  const [formState, formAction] = useFormState(updatePermissionsAction, createInitialActionState());

  const groupedPermissions = permissions.reduce(
    (acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    },
    {} as Record<string, Permission[]>,
  );

  return (
    <Card className={className}>
      <CardHeader>
        <h3 className="text-lg font-medium text-gray-900">Role Management</h3>
        <p className="text-sm text-gray-600">
          Configure permissions for different roles in your organization
        </p>
      </CardHeader>

      <CardContent>
        {formState?.error && (
          <Alert variant="destructive" className="mb-4">
            {formState.error}
          </Alert>
        )}

        {formState?.success && (
          <Alert variant="success" className="mb-4">
            Role permissions updated successfully!
          </Alert>
        )}

        <div className="space-y-6">
          {roles.map(role => (
            <div key={role.id} className="rounded-lg border border-gray-200 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium capitalize text-gray-900">
                    {role.name} ({role.memberCount} members)
                  </h4>
                  {role.isSystemRole && (
                    <p className="text-xs text-gray-500">
                      System role - some permissions cannot be modified
                    </p>
                  )}
                </div>
                {canManageRoles && !role.isSystemRole && (
                  <form action={formAction}>
                    <input type="hidden" name="organizationId" value={organizationId} />
                    <input type="hidden" name="roleId" value={role.id} />
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      loading={formState === undefined}
                    >
                      Update Permissions
                    </Button>
                  </form>
                )}
              </div>

              <div className="space-y-4">
                {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                  <div key={category}>
                    <h5 className="mb-2 text-sm font-medium text-gray-700">
                      {permissionCategories[category as keyof typeof permissionCategories]}
                    </h5>
                    <div className="ml-4 space-y-2">
                      {categoryPermissions.map(permission => {
                        const hasPermission = role.permissions.includes(permission.id);
                        const isDisabled = !canManageRoles || role.isSystemRole;

                        return (
                          <div key={permission.id} className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              id={`${role.id}-${permission.id}`}
                              name={`permissions[${role.id}][]`}
                              value={permission.id}
                              defaultChecked={hasPermission}
                              disabled={isDisabled}
                              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                            />
                            <div className="flex-1">
                              <label
                                htmlFor={`${role.id}-${permission.id}`}
                                className={`text-sm font-medium ${
                                  isDisabled ? 'text-gray-400' : 'text-gray-900'
                                }`}
                              >
                                {permission.name}
                              </label>
                              <p
                                className={`text-xs ${
                                  isDisabled ? 'text-gray-300' : 'text-gray-600'
                                }`}
                              >
                                {permission.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {!canManageRoles && (
          <Alert variant="default" className="mt-4">
            You don't have permission to manage roles. Contact an organization owner for access.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
