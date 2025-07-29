import type { Meta, StoryObj } from '@storybook/nextjs';
import { ForgotPasswordForm } from './ForgotPasswordForm';

const meta: Meta<typeof ForgotPasswordForm> = {
  title: 'Auth/Forms/ForgotPasswordForm',
  component: ForgotPasswordForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    loading: { control: 'boolean' },
    error: { control: 'text' },
    success: { control: 'boolean' },
    showBackToLogin: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock handlers
const mockSubmit = (values: any) => console.log('Form submitted:', values);
const mockBackToLogin = () => console.log('Back to login clicked');

export const Default: Story = {
  args: {
    onSubmit: mockSubmit,
    onBackToLogin: mockBackToLogin,
  },
};

export const WithError: Story = {
  args: {
    onSubmit: mockSubmit,
    onBackToLogin: mockBackToLogin,
    error: 'Email address not found. Please check and try again.',
  },
};

export const Loading: Story = {
  args: {
    onSubmit: mockSubmit,
    onBackToLogin: mockBackToLogin,
    loading: true,
  },
};

export const Success: Story = {
  args: {
    onSubmit: mockSubmit,
    onBackToLogin: mockBackToLogin,
    success: true,
  },
};

export const CustomTexts: Story = {
  args: {
    onSubmit: mockSubmit,
    onBackToLogin: mockBackToLogin,
    title: 'Reset Your Password',
    subtitle: "Enter your email address and we'll send you a reset link",
    submitButtonText: 'Send Reset Email',
    backToLoginText: 'Return to Sign In',
    successTitle: 'Check Your Email',
    successMessage: "We've sent password reset instructions to your email address.",
  },
};

export const NoBackToLogin: Story = {
  args: {
    onSubmit: mockSubmit,
    showBackToLogin: false,
  },
};
