/**
 * Tailwind v4 RSC Profile Form
 * 100% React Server Component with server actions
 */

import { useFormState } from 'react-dom';
import { updateProfileAction } from '../actions';
import type { BaseProps, FormState } from '../types';
import { createInitialActionState } from '../types';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  bio?: string;
  website?: string;
  location?: string;
  timezone?: string;
}

interface ProfileFormProps extends BaseProps {
  profile: UserProfile;
  canEdit?: boolean;
}

const _initialState: FormState = { success: false };

export function ProfileForm({ profile, canEdit = true, className = '' }: ProfileFormProps) {
  const [formState, formAction] = useFormState(updateProfileAction, createInitialActionState());

  return (
    <Card className={className}>
      <CardHeader>
        <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
        <p className="text-sm text-gray-600">
          Update your personal information and profile settings
        </p>
      </CardHeader>

      <CardContent>
        {formState?.error && (
          <Alert type="error" className="mb-4">
            {formState.error}
          </Alert>
        )}

        {formState?.success && (
          <Alert type="success" className="mb-4">
            Profile updated successfully!
          </Alert>
        )}

        <form action={formAction} className="space-y-4">
          <div className="mb-6 flex items-center space-x-4">
            <div className="flex-shrink-0">
              {profile.image ? (
                <img src={profile.image} alt={profile.name} className="h-16 w-16 rounded-full" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-300">
                  <span className="text-xl font-medium text-gray-700">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            {canEdit && (
              <div>
                <Button type="button" variant="outline" size="sm">
                  Change Avatar
                </Button>
                <p className="mt-1 text-xs text-gray-500">JPG, GIF or PNG. Max size 2MB.</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              name="name"
              label="Full Name"
              defaultValue={profile.name}
              required
              disabled={!canEdit}
              error={undefined}
            />

            <Input
              name="email"
              type="email"
              label="Email Address"
              defaultValue={profile.email}
              required
              disabled={!canEdit}
              error={undefined}
            />
          </div>

          <Input
            name="bio"
            label="Bio"
            defaultValue={profile.bio}
            disabled={!canEdit}
            error={undefined}
            description="Brief description about yourself"
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              name="website"
              type="url"
              label="Website"
              defaultValue={profile.website}
              disabled={!canEdit}
              error={undefined}
              placeholder="https://example.com"
            />

            <Input
              name="location"
              label="Location"
              defaultValue={profile.location}
              disabled={!canEdit}
              error={undefined}
              placeholder="City, Country"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Timezone</label>
            <select
              name="timezone"
              defaultValue={profile.timezone || 'UTC'}
              disabled={!canEdit}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
            </select>
          </div>

          {canEdit && (
            <div className="flex justify-end">
              <Button type="submit" variant="primary" loading={formState === undefined}>
                Save Changes
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
