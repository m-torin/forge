/**
 * Tailwind v4 RSC Create API Key Form
 * 100% React Server Component with server actions
 */

import { useFormState } from 'react-dom';
import { createAPIKeyAction } from '../actions';
import type { BaseProps } from '../types';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface CreateAPIKeyFormProps extends BaseProps {
  permissions: Permission[];
  maxExpirationDays?: number;
}

type CreateAPIKeyState =
  | { success: false; errors: { name: string[] } }
  | { success: true; message: string; data: any }
  | { success: false; error: string };

const initialCreateAPIKeyState: CreateAPIKeyState = { success: false, error: '' };

export function CreateAPIKeyForm({
  permissions,
  maxExpirationDays: _maxExpirationDays = 365,
  className = '',
}: CreateAPIKeyFormProps) {
  const [formState, formAction] = useFormState(createAPIKeyAction, initialCreateAPIKeyState);

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
    <Card className={`w-full max-w-2xl ${className}`}>
      <CardHeader>
        <h3 className="text-lg font-medium text-gray-900">Create API Key</h3>
        <p className="text-sm text-gray-600">Generate a new API key for programmatic access</p>
      </CardHeader>

      <CardContent>
        {formState?.error && (
          <Alert type="error" className="mb-4">
            {formState.error}
          </Alert>
        )}

        {formState?.success && (
          <Alert type="success" className="mb-4">
            API key created successfully! Make sure to copy it now - you won't see it again.
          </Alert>
        )}

        <form action={formAction} className="space-y-6">
          <Input
            name="name"
            label="API Key Name"
            placeholder="My Integration"
            required
            error={formState?.errors?.name?.[0]}
            description="A descriptive name to help you identify this key"
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Expiration</label>
            <select
              name="expirationDays"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Never expires</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="180">180 days</option>
              <option value="365">1 year</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              For security, consider setting an expiration date
            </p>
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700">Permissions</label>
            <div className="space-y-4">
              {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                <div key={category} className="rounded-lg border border-gray-200 p-4">
                  <h4 className="mb-2 text-sm font-medium capitalize text-gray-900">{category}</h4>
                  <div className="space-y-2">
                    {categoryPermissions.map(permission => (
                      <div key={permission.id} className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id={permission.id}
                          name="permissions"
                          value={permission.id}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={permission.id}
                            className="text-sm font-medium text-gray-900"
                          >
                            {permission.name}
                          </label>
                          <p className="text-xs text-gray-600">{permission.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={formState === undefined}>
              Create API Key
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
