/**
 * Tailwind v4 RSC Organization Creation
 * 100% React Server Component with server actions
 */

import { useFormState } from 'react-dom';
import { createOrganizationAction } from '../actions';
import type { BaseProps, FormState } from '../types';
import { createInitialActionState } from '../types';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';

interface OrganizationCreationProps extends BaseProps {
  title?: string;
  subtitle?: string;
  redirectTo?: string;
  showPlanSelection?: boolean;
  availablePlans?: Array<{
    id: string;
    name: string;
    description: string;
    price: string;
    features: string[];
  }>;
}

const initialState: FormState = { success: false };

export function OrganizationCreation({
  title = 'Create Organization',
  subtitle = 'Start collaborating with your team by creating an organization.',
  redirectTo = '/dashboard',
  showPlanSelection = false,
  availablePlans = [],
  className = '',
}: OrganizationCreationProps) {
  const [formState, formAction] = useFormState(
    createOrganizationAction,
    createInitialActionState(),
  );

  return (
    <Card className={`mx-auto w-full max-w-2xl ${className}`}>
      <CardHeader>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-6 w-6 text-blue-600"
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
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
        </div>
      </CardHeader>

      <CardContent>
        {formState?.error && (
          <Alert variant="destructive" className="mb-4">
            {formState.error}
          </Alert>
        )}

        {formState?.success && (
          <Alert variant="success" className="mb-4">
            Organization created successfully! Redirecting...
          </Alert>
        )}

        <form action={formAction} className="space-y-6">
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <div className="space-y-4">
            <Input
              name="name"
              label="Organization Name"
              placeholder="Acme Corporation"
              required
              error={formState?.errors?.name?.[0]}
              description="This will be displayed to members across the platform"
            />

            <Input
              name="slug"
              label="Organization URL"
              placeholder="acme-corp"
              required
              error={formState?.errors?.slug?.[0]}
              description="Used in URLs and team identifiers. Only letters, numbers, and hyphens allowed."
            />

            <Input
              name="description"
              label="Description (Optional)"
              placeholder="Brief description of your organization"
              error={formState?.errors?.description?.[0]}
            />

            <Input
              name="website"
              type="url"
              label="Website (Optional)"
              placeholder="https://acme.com"
              error={formState?.errors?.website?.[0]}
            />
          </div>

          {showPlanSelection && availablePlans.length > 0 && (
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700">Select Plan</label>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {availablePlans.map(plan => (
                  <label
                    key={plan.id}
                    className="relative cursor-pointer rounded-lg border border-gray-300 bg-white p-4 shadow-sm hover:border-gray-400 focus:outline-none"
                  >
                    <input
                      type="radio"
                      name="planId"
                      value={plan.id}
                      className="sr-only"
                      defaultChecked={plan.id === 'free'}
                    />
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{plan.name}</p>
                        <p className="text-sm font-medium text-gray-900">{plan.price}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
                      <ul className="mt-2 space-y-1 text-xs text-gray-500">
                        {plan.features.map((feature, index) => (
                          <li key={index}>• {feature}</li>
                        ))}
                      </ul>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center">
              <input
                id="terms"
                name="acceptTerms"
                type="checkbox"
                required
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                I agree to the{' '}
                <a href="/terms" className="text-blue-600 hover:text-blue-500 hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-blue-600 hover:text-blue-500 hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={formState === undefined}
          >
            Create Organization
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
