'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Label, ButtonPrimary } from '@/components/ui';
import { notifications } from '@mantine/notifications';
import { changePassword } from '@/actions/auth';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';

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

export function PasswordForm() {
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
      const result = await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Your password has been updated',
          color: 'green',
        });
        form.reset();
        router.refresh();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to update password',
          color: 'red',
        });
      }
    } catch (_error) {
      notifications.show({
        title: 'Error',
        message: 'An error occurred while updating your password',
        color: 'red',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <div className="flex max-w-xl flex-col gap-y-6">
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
        </div>
        <div>
          <Label>Confirm password</Label>
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
