import { Button, TextInput } from '@mantine/core';

import { AuthForm } from './auth-form';
import { AuthLayout } from './auth-layout';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof AuthLayout> = {
  argTypes: {
    showBranding: {
      control: 'boolean',
      description: 'Show the application branding',
    },
    subtitle: {
      control: 'text',
      description: 'Subtitle for additional context',
    },
    title: {
      control: 'text',
      description: 'Main title for the auth page',
    },
  },
  component: AuthLayout,
  parameters: {
    docs: {
      description: {
        component:
          'Full-page authentication layout with branding, titles, and alternative actions.',
      },
    },
    layout: 'fullscreen',
  },
  title: 'UIX/Auth/AuthLayout',
};

export default meta;
type Story = StoryObj<typeof AuthLayout>;

// Basic Layout Stories
export const SignInLayout: Story = {
  args: {
    alternativeAction: {
      href: '/sign-up',
      linkText: 'Sign up',
      text: "Don't have an account?",
    },
    children: (
      <AuthForm mode="signin">
        <TextInput placeholder="Enter your email" label="Email" required type="email" />
        <TextInput placeholder="Enter your password" label="Password" required type="password" />
        <Button fullWidth type="submit">
          Sign In
        </Button>
      </AuthForm>
    ),
    subtitle: 'Sign in to your account to continue',
    title: 'Welcome back',
  },
};

export const SignUpLayout: Story = {
  args: {
    alternativeAction: {
      href: '/sign-in',
      linkText: 'Sign in',
      text: 'Already have an account?',
    },
    children: (
      <AuthForm mode="signup">
        <TextInput placeholder="Enter your full name" label="Name" required />
        <TextInput placeholder="Enter your email" label="Email" required type="email" />
        <TextInput placeholder="Create a password" label="Password" required type="password" />
        <Button fullWidth type="submit">
          Create Account
        </Button>
      </AuthForm>
    ),
    subtitle: 'Join us and start building amazing things',
    title: 'Create your account',
  },
};

export const ForgotPasswordLayout: Story = {
  args: {
    alternativeAction: {
      href: '/sign-in',
      linkText: 'Sign in',
      text: 'Remember your password?',
    },
    children: (
      <AuthForm showSocialOptions={false}>
        <TextInput placeholder="Enter your email" label="Email" required type="email" />
        <Button fullWidth type="submit">
          Send Reset Link
        </Button>
      </AuthForm>
    ),
    subtitle: "Enter your email and we'll send you a reset link",
    title: 'Reset your password',
  },
};

// Layout Variations
export const WithoutBranding: Story = {
  args: {
    alternativeAction: {
      href: '/sign-up',
      linkText: 'Sign up',
      text: "Don't have an account?",
    },
    children: (
      <AuthForm mode="signin">
        <TextInput placeholder="Enter your email" label="Email" required type="email" />
        <TextInput placeholder="Enter your password" label="Password" required type="password" />
        <Button fullWidth type="submit">
          Sign In
        </Button>
      </AuthForm>
    ),
    showBranding: false,
    subtitle: 'Enter your credentials to continue',
    title: 'Sign In',
  },
};

export const WithoutSubtitle: Story = {
  args: {
    alternativeAction: {
      href: '/sign-up',
      linkText: 'Sign up',
      text: "Don't have an account?",
    },
    children: (
      <AuthForm mode="signin">
        <TextInput placeholder="Enter your email" label="Email" required type="email" />
        <TextInput placeholder="Enter your password" label="Password" required type="password" />
        <Button fullWidth type="submit">
          Sign In
        </Button>
      </AuthForm>
    ),
    title: 'Welcome back',
  },
};

export const WithoutAlternativeAction: Story = {
  args: {
    children: (
      <AuthForm mode="signin" showSocialOptions={false}>
        <TextInput placeholder="Enter your email" label="Email" required type="email" />
        <TextInput placeholder="Enter your password" label="Password" required type="password" />
        <Button fullWidth type="submit">
          Sign In
        </Button>
      </AuthForm>
    ),
    subtitle: 'Authorized personnel only',
    title: 'Admin Access',
  },
};

// Specialized Layouts
export const MagicLinkLayout: Story = {
  args: {
    alternativeAction: {
      href: '/sign-in',
      linkText: 'Sign in with password',
      text: 'Prefer using a password?',
    },
    children: (
      <AuthForm showMagicLink={false} showSocialOptions={false}>
        <TextInput placeholder="Enter your email" label="Email" required type="email" />
        <Button fullWidth type="submit">
          Send Magic Link
        </Button>
      </AuthForm>
    ),
    subtitle: "Enter your email and we'll send you a secure sign-in link",
    title: 'Sign in with Magic Link',
  },
};

export const TwoFactorLayout: Story = {
  args: {
    children: (
      <AuthForm showSocialOptions={false}>
        <TextInput
          placeholder="Enter 6-digit code"
          label="Verification Code"
          maxLength={6}
          required
        />
        <Button fullWidth type="submit">
          Verify
        </Button>
      </AuthForm>
    ),
    subtitle: 'Enter the verification code from your authenticator app',
    title: 'Two-Factor Authentication',
  },
};

export const InvitationLayout: Story = {
  args: {
    children: (
      <AuthForm showSocialOptions={false}>
        <TextInput placeholder="Enter your full name" label="Name" required />
        <TextInput placeholder="Create a password" label="Password" required type="password" />
        <Button fullWidth type="submit">
          Complete Setup
        </Button>
      </AuthForm>
    ),
    subtitle: 'Set up your account to join the organization',
    title: 'Complete your invitation',
  },
};

// Long Content Layout
export const LongFormLayout: Story = {
  args: {
    alternativeAction: {
      href: '/sign-in',
      linkText: 'Sign in',
      text: 'Already have an account?',
    },
    children: (
      <AuthForm showSocialOptions={false}>
        <TextInput placeholder="Enter your first name" label="First Name" required />
        <TextInput placeholder="Enter your last name" label="Last Name" required />
        <TextInput placeholder="Enter your email" label="Email" required type="email" />
        <TextInput placeholder="Enter your company name" label="Company" />
        <TextInput placeholder="Create a password" label="Password" required type="password" />
        <TextInput
          placeholder="Confirm your password"
          label="Confirm Password"
          required
          type="password"
        />
        <Button fullWidth type="submit">
          Create Account
        </Button>
      </AuthForm>
    ),
    subtitle: 'Please fill out all required information',
    title: 'Complete Registration',
  },
};

// Minimal Layout
export const MinimalLayout: Story = {
  args: {
    children: (
      <AuthForm showSocialOptions={false}>
        <TextInput placeholder="Email" label="Email" required type="email" />
        <TextInput placeholder="Password" label="Password" required type="password" />
        <Button fullWidth>Sign In</Button>
      </AuthForm>
    ),
    showBranding: false,
    title: 'Sign In',
  },
};
