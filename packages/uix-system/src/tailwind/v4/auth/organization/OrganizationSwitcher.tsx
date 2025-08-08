/**
 * Tailwind v4 RSC Organization Switcher
 * 100% React Server Component with server actions
 */

import { useFormState } from 'react-dom';
import { switchOrganizationAction } from '../actions';
import type { BaseProps, FormState } from '../types';
import { createInitialActionState } from '../types';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';

interface Organization {
  id: string;
  name: string;
  slug: string;
  role: 'owner' | 'admin' | 'member';
  memberCount: number;
  plan?: string;
  image?: string;
}

interface OrganizationSwitcherProps extends BaseProps {
  organizations: Organization[];
  currentOrganizationId?: string;
  showCreateButton?: boolean;
  createOrganizationHref?: string;
}

const _initialState: FormState = { success: false };

export function OrganizationSwitcher({
  organizations,
  currentOrganizationId,
  showCreateButton = true,
  createOrganizationHref = '/organizations/create',
  className = '',
}: OrganizationSwitcherProps) {
  const [formState, formAction] = useFormState(
    switchOrganizationAction,
    createInitialActionState(),
  );

  if (organizations.length === 0) {
    return (
      <Card className={`w-full max-w-md ${className}`}>
        <CardContent className="p-6 text-center">
          <div className="mb-4">
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
                d="M3.75 21h16.5M4.5 3h15l-.75 18H5.25L4.5 3ZM9 9h6m-6 3h6m-6 3h6"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">No Organizations</h3>
          <p className="mb-4 text-sm text-gray-600">You don't belong to any organizations yet.</p>
          {showCreateButton && (
            <Button variant="primary">
              <a href={createOrganizationHref} className="block w-full">
                Create Organization
              </a>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const currentOrg = organizations.find(org => org.id === currentOrganizationId);

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Switch Organization</h3>
          {showCreateButton && (
            <Button variant="outline" size="sm">
              <a href={createOrganizationHref}>Create New</a>
            </Button>
          )}
        </div>
        {currentOrg && (
          <p className="text-sm text-gray-600">
            Currently in <span className="font-medium">{currentOrg.name}</span> as {currentOrg.role}
          </p>
        )}
      </CardHeader>

      <CardContent>
        {formState?.error && (
          <Alert variant="destructive" className="mb-4">
            {formState.error}
          </Alert>
        )}

        {formState?.success && (
          <Alert variant="success" className="mb-4">
            Organization switched successfully!
          </Alert>
        )}

        <div className="space-y-2">
          {organizations.map(org => {
            const isCurrent = org.id === currentOrganizationId;

            return (
              <form key={org.id} action={formAction}>
                <input type="hidden" name="organizationId" value={org.id} />
                <button
                  type="submit"
                  disabled={isCurrent || formState === undefined}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    isCurrent
                      ? 'border-blue-200 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  } ${formState === undefined ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {org.image ? (
                        <img src={org.image} alt={org.name} className="h-8 w-8 rounded-full" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
                          <span className="text-sm font-medium text-gray-700">
                            {org.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-medium text-gray-900">{org.name}</p>
                        {isCurrent && (
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                            Current
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          {org.role} • {org.memberCount} members
                        </p>
                        {org.plan && (
                          <span className="text-xs capitalize text-gray-500">{org.plan}</span>
                        )}
                      </div>
                    </div>

                    {!isCurrent && (
                      <div className="flex-shrink-0">
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
                            d="M8.25 4.5l7.5 7.5-7.5 7.5"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              </form>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
