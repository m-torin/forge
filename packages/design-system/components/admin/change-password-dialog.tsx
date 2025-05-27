'use client';

import { Button, Group, Modal, PasswordInput, Stack, Text, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
// import { setPassword } from '@repo/auth/client'; // Not available in admin API
import { IconKey } from '@tabler/icons-react';
import React, { useState } from 'react';

interface ChangePasswordDialogProps {
  onSuccess?: () => void;
  userId: string;
  userName: string;
}

export function ChangePasswordDialog({ onSuccess, userId, userName }: ChangePasswordDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    validate: {
      confirmPassword: (value, values) => {
        if (!value) return 'Please confirm your password';
        if (value !== values.password) return 'Passwords do not match';
        return null;
      },
      password: (value) => {
        if (!value) return 'Please enter a password';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return null;
      },
    },
    initialValues: {
      confirmPassword: '',
      password: '',
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);

      // TODO: Implement password change when API is available
      // await setPassword({
      //   userId: userId,
      //   newPassword: values.password,
      // } as any);
      throw new Error('Password change not yet implemented');

      notifications.show({
        color: 'green',
        message: 'Password changed successfully',
        title: 'Success',
      });
      setIsOpen(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Failed to change password:', error);
      notifications.show({
        color: 'red',
        message: 'Failed to change password',
        title: 'Error',
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let newPassword = '';
    for (let i = 0; i < 16; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setValues({
      confirmPassword: newPassword,
      password: newPassword,
    });
  };

  return (
    <>
      <Button
        leftSection={<IconKey size={16} />}
        onClick={() => setIsOpen(true)}
        size="sm"
        variant="outline"
      >
        Change Password
      </Button>

      <Modal
        onClose={() => {
          setIsOpen(false);
          form.reset();
        }}
        opened={isOpen}
        size="md"
        title={<Title order={4}>Change Password</Title>}
      >
        <Text c="dimmed" mb="lg" size="sm">
          Set a new password for {userName}
        </Text>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <div>
              <Group gap="xs" mb="xs">
                <PasswordInput
                  placeholder="Enter new password"
                  style={{ flex: 1 }}
                  label="New Password"
                  {...form.getInputProps('password')}
                />
                <Button
                  onClick={generatePassword}
                  style={{ marginTop: '1.5rem' }}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  Generate
                </Button>
              </Group>
            </div>
            <PasswordInput
              placeholder="Confirm new password"
              label="Confirm Password"
              {...form.getInputProps('confirmPassword')}
            />
          </Stack>

          <Group justify="flex-end" mt="xl">
            <Button
              onClick={() => {
                setIsOpen(false);
                form.reset();
              }}
              type="button"
              variant="subtle"
            >
              Cancel
            </Button>
            <Button loading={loading} type="submit">
              Change Password
            </Button>
          </Group>
        </form>
      </Modal>
    </>
  );
}
