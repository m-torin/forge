import type { Meta, StoryObj } from '@storybook/nextjs';
import { SignUpForm } from './SignUpForm';

const meta: Meta<typeof SignUpForm> = {
  title: 'Auth/Forms/SignUpForm',
  component: SignUpForm,
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
    showTerms: { control: 'boolean' },
    showSignIn: { control: 'boolean' },
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
    error: 'Email address is already taken. Please try a different one.',
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
    title: 'Join Us',
    subtitle: 'Create your account to get started',
    submitButtonText: 'Create Account',
    signInText: 'Already have an account?',
    termsText: 'I agree to the Terms of Service and Privacy Policy',
    socialProviders: ['google', 'github'],
  },
};

export const NoTermsOrSignIn: Story = {
  args: {
    onSubmit: mockSubmit,
    onSocialLogin: mockSocialLogin,
    showTerms: false,
    showSignIn: false,
    socialProviders: ['google'],
  },
};
