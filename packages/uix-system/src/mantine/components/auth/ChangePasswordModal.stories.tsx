import { Button } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { ChangePasswordModal, type ChangePasswordFormValues } from './ChangePasswordModal';

const ChangePasswordModalWrapper = (props: any) => {
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: ChangePasswordFormValues) => {
    setLoading(true);
    setError(null);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (values.currentPassword === 'wrong') {
      throw new Error('Current password is incorrect');
    }

    console.log('Password changed:', values);
    setLoading(false);
  };

  const handleSuccess = () => {
    console.log('Password changed successfully');
  };

  return (
    <>
      <Button onClick={() => setOpened(true)}>Open Change Password Modal</Button>
      <ChangePasswordModal
        {...props}
        opened={opened}
        onClose={() => setOpened(false)}
        onSubmit={handleSubmit}
        onSuccess={handleSuccess}
        loading={loading}
        error={error}
        onErrorDismiss={() => setError(null)}
      />
    </>
  );
};

const meta: Meta<typeof ChangePasswordModal> = {
  title: 'Auth/Modals/ChangePasswordModal',
  component: ChangePasswordModalWrapper,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    showPasswordStrength: { control: 'boolean' },
    showPasswordRequirements: { control: 'boolean' },
    showRevokeSessionsOption: { control: 'boolean' },
    defaultRevokeOtherSessions: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const CustomTexts: Story = {
  args: {
    title: 'Update Password',
    currentPasswordLabel: 'Enter current password',
    currentPasswordPlaceholder: 'Your current password',
    newPasswordLabel: 'Choose new password',
    newPasswordPlaceholder: 'Create a strong password',
    confirmPasswordLabel: 'Verify new password',
    confirmPasswordPlaceholder: 'Re-enter new password',
    submitButtonText: 'Update Password',
    cancelButtonText: 'Dismiss',
  },
};

export const NoPasswordStrength: Story = {
  args: {
    showPasswordStrength: false,
    showPasswordRequirements: false,
  },
};

export const NoRevokeSessionsOption: Story = {
  args: {
    showRevokeSessionsOption: false,
  },
};

export const DefaultKeepSessions: Story = {
  args: {
    defaultRevokeOtherSessions: false,
    revokeSessionsLabel: 'Sign out other devices',
    revokeSessionsDescription: 'Recommended for security if you suspect unauthorized access',
  },
};

export const LargeSize: Story = {
  args: {
    size: 'lg',
    title: 'Change Account Password',
    revokeSessionsLabel: 'Log out all other sessions',
    revokeSessionsDescription:
      'This will require you to sign in again on all other devices and browsers',
  },
};

export const SmallSize: Story = {
  args: {
    size: 'sm',
    title: 'Update Password',
  },
};

export const ErrorDemo: Story = {
  args: {
    title: 'Change Password (Error Demo)',
  },
  parameters: {
    docs: {
      description: {
        story:
          'This story demonstrates error handling. Enter "wrong" as the current password to trigger a simulated error.',
      },
    },
  },
};
