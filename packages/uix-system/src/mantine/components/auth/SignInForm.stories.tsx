import type { Meta, StoryObj } from '@storybook/nextjs';
import { SignInForm } from './SignInForm';

const meta: Meta<typeof SignInForm> = {
  title: 'Auth/Forms/SignInForm',
  component: SignInForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    loading: { control: 'boolean' },
    error: { control: 'text' },
    socialProviders: {
      control: 'check',
      options: ['google', 'github', 'microsoft', 'facebook', 'discord'],
    },
    showRememberMe: { control: 'boolean' },
    showForgotPassword: { control: 'boolean' },
    showSignUp: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock handlers
const mockSubmit = (values: any) => console.log('Form submitted:', values);
const mockSocialLogin = (provider: string) => console.log('Social login:', provider);

export const Default: Story = {
  args: {
    onSubmit: mockSubmit,
    onSocialLogin: mockSocialLogin,
    socialProviders: ['google', 'github'],
  },
};

export const WithError: Story = {
  args: {
    onSubmit: mockSubmit,
    onSocialLogin: mockSocialLogin,
    error: 'Invalid email or password. Please try again.',
    socialProviders: ['google', 'github'],
  },
};

export const Loading: Story = {
  args: {
    onSubmit: mockSubmit,
    onSocialLogin: mockSocialLogin,
    loading: true,
    socialProviders: ['google', 'github'],
  },
};

export const AllSocialProviders: Story = {
  args: {
    onSubmit: mockSubmit,
    onSocialLogin: mockSocialLogin,
    socialProviders: ['google', 'github', 'microsoft', 'facebook', 'discord'],
  },
};

export const NoSocialProviders: Story = {
  args: {
    onSubmit: mockSubmit,
    socialProviders: [],
  },
};

export const CustomTexts: Story = {
  args: {
    onSubmit: mockSubmit,
    onSocialLogin: mockSocialLogin,
    title: 'Welcome Back',
    subtitle: 'Sign in to your account to continue',
    submitButtonText: 'Sign In',
    forgotPasswordText: 'Reset password?',
    signUpText: 'Create new account',
    socialProviders: ['google', 'github'],
  },
};

export const MinimalOptions: Story = {
  args: {
    onSubmit: mockSubmit,
    showRememberMe: false,
    showForgotPassword: false,
    showSignUp: false,
    socialProviders: [],
  },
};
