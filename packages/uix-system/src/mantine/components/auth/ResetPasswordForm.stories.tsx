import type { Meta, StoryObj } from '@storybook/nextjs';
import { ResetPasswordForm, type ResetPasswordFormValues } from './ResetPasswordForm';

const meta: Meta<typeof ResetPasswordForm> = {
  title: 'Auth/Forms/ResetPasswordForm',
  component: ResetPasswordForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    loading: { control: 'boolean' },
    error: { control: 'text' },
    disabled: { control: 'boolean' },
    showPasswordStrength: { control: 'boolean' },
    showPasswordRequirements: { control: 'boolean' },
    withBorder: { control: 'boolean' },
    withShadow: { control: 'boolean' },
    radius: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock handler
const mockSubmit = async (values: ResetPasswordFormValues) => {
  // console.log('Password reset:', values);
  await new Promise(resolve => setTimeout(resolve, 1000));
};

const mockSuccess = () => {
  // console.log('Password reset successful');
};

export const Default: Story = {
  args: {
    onSubmit: mockSubmit,
    onSuccess: mockSuccess,
    token: 'valid-reset-token',
  },
};

export const WithError: Story = {
  args: {
    onSubmit: mockSubmit,
    onSuccess: mockSuccess,
    token: 'valid-reset-token',
    error: 'The reset token has expired. Please request a new password reset.',
  },
};

export const Loading: Story = {
  args: {
    onSubmit: mockSubmit,
    onSuccess: mockSuccess,
    token: 'valid-reset-token',
    loading: true,
  },
};

export const NoToken: Story = {
  args: {
    onSubmit: mockSubmit,
    onSuccess: mockSuccess,
    token: undefined,
  },
};

export const CustomTexts: Story = {
  args: {
    onSubmit: mockSubmit,
    onSuccess: mockSuccess,
    token: 'valid-reset-token',
    title: 'Create New Password',
    subtitle: 'Your new password must be different from your previous password',
    passwordLabel: 'Choose new password',
    passwordPlaceholder: 'Enter a secure password',
    confirmPasswordLabel: 'Verify new password',
    confirmPasswordPlaceholder: 'Re-enter your password',
    submitButtonText: 'Update Password',
  },
};

export const NoPasswordStrength: Story = {
  args: {
    onSubmit: mockSubmit,
    onSuccess: mockSuccess,
    token: 'valid-reset-token',
    showPasswordStrength: false,
    showPasswordRequirements: false,
  },
};

export const MinimalStyling: Story = {
  args: {
    onSubmit: mockSubmit,
    onSuccess: mockSuccess,
    token: 'valid-reset-token',
    withBorder: false,
    withShadow: false,
    padding: 20,
    radius: 'xs',
  },
};

export const LargePadding: Story = {
  args: {
    onSubmit: mockSubmit,
    onSuccess: mockSuccess,
    token: 'valid-reset-token',
    padding: 50,
    radius: 'xl',
    title: 'Reset Your Password',
    subtitle: 'Create a strong, unique password for your account',
  },
};
