'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Label, ButtonPrimary } from '@/components/ui';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';
import { authClient } from '@repo/auth/client/next';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

/**
 * Password change form using Better Auth's client-side API
 * This is the recommended approach as Better Auth provides
 * changePassword functionality on the client side
 */
export function PasswordFormBetterAuth() {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const form = useForm({
    validate: zodResolver(passwordSchema),
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleSubmit = async (values: z.infer<typeof passwordSchema>) => {
    setIsUpdating(true);
    try {
      // Use Better Auth's client-side changePassword method
      const result = await authClient.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: true, // Optional: revoke other sessions for security
      });

      if (result.error) {
        notifications.show({
          title: 'Error',
          message: (result.error as any)?.message || result.error || 'Failed to update password',
          color: 'red',
        });
      } else {
        notifications.show({
          title: 'Success',
          message: 'Your password has been updated successfully',
          color: 'green',
        });
        form.reset();

        // Optionally sign out and redirect to login
        // await authClient.signOut();
        // router.push(`/${locale}/login`);

        router.refresh();
      }
    } catch (_error) {
      notifications.show({
        title: 'Error',
        message:
          _error instanceof Error
            ? (_error as Error).message
            : 'An error occurred while updating your password',
        color: 'red',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <div className="flex max-w-xl flex-col gap-y-6">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Security Note:</strong> For your protection, changing your password will sign
            you out of all other devices.
          </p>
        </div>

        <div>
          <Label>Current password</Label>
          <Input className="mt-1.5" type="password" {...form.getInputProps('currentPassword')} />
          {form.errors.currentPassword && (
            <p className="mt-1 text-sm text-red-500">{form.errors.currentPassword}</p>
          )}
        </div>

        <div>
          <Label>New password</Label>
          <Input className="mt-1.5" type="password" {...form.getInputProps('newPassword')} />
          {form.errors.newPassword && (
            <p className="mt-1 text-sm text-red-500">{form.errors.newPassword}</p>
          )}
          <p className="mt-1 text-xs text-neutral-500">Must be at least 8 characters long</p>
        </div>

        <div>
          <Label>Confirm new password</Label>
          <Input className="mt-1.5" type="password" {...form.getInputProps('confirmPassword')} />
          {form.errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">{form.errors.confirmPassword}</p>
          )}
        </div>

        <div className="pt-2">
          <ButtonPrimary type="submit" loading={isUpdating}>
            Update password
          </ButtonPrimary>
        </div>
      </div>
    </form>
  );
}
