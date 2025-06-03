import { Button, TextInput } from '@mantine/core';

import { AuthForm } from './auth-form';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof AuthForm> = {
  argTypes: {
    isLoading: {
      control: 'boolean',
      description: 'Loading state for the form',
    },
    mode: {
      control: 'select',
      description: 'Authentication mode',
      options: ['signin', 'signup'],
    },
    showMagicLink: {
      control: 'boolean',
      description: 'Show magic link authentication option',
    },
    showSocialOptions: {
      control: 'boolean',
      description: 'Show social authentication options',
    },
  },
  component: AuthForm,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Unified authentication form wrapper with social login options and error handling.',
      },
    },
    layout: 'centered',
  },
  title: 'UIX/Auth/AuthForm',
};

export default meta;
type Story = StoryObj<typeof AuthForm>;

// Sign In Stories
export const SignIn: Story = {
  args: {
    children: (
      <>
        <TextInput placeholder="Enter your email" label="Email" required type="email" />
        <TextInput placeholder="Enter your password" label="Password" required type="password" />
        <Button fullWidth type="submit">
          Sign In
        </Button>
      </>
    ),
    mode: 'signin',
    onSocialSignIn: (provider: string) => console.log('Social sign-in:', provider),
  },
};

export const SignUp: Story = {
  args: {
    children: (
      <>
        <TextInput placeholder="Enter your full name" label="Name" required />
        <TextInput placeholder="Enter your email" label="Email" required type="email" />
        <TextInput placeholder="Create a password" label="Password" required type="password" />
        <Button fullWidth type="submit">
          Create Account
        </Button>
      </>
    ),
    mode: 'signup',
    onSocialSignIn: (provider: string) => console.log('Social sign-up:', provider),
  },
};

// With Error States
export const WithError: Story = {
  args: {
    children: (
      <>
        <TextInput error placeholder="Enter your email" label="Email" required type="email" />
        <TextInput
          error
          placeholder="Enter your password"
          label="Password"
          required
          type="password"
        />
        <Button fullWidth type="submit">
          Sign In
        </Button>
      </>
    ),
    error: 'Invalid email or password. Please try again.',
    mode: 'signin',
    onSocialSignIn: (provider: string) => console.log('Social sign-in:', provider),
  },
};

export const SignUpWithError: Story = {
  args: {
    children: (
      <>
        <TextInput placeholder="Enter your full name" label="Name" required />
        <TextInput error placeholder="Enter your email" label="Email" required type="email" />
        <TextInput placeholder="Create a password" label="Password" required type="password" />
        <Button fullWidth type="submit">
          Create Account
        </Button>
      </>
    ),
    error: 'This email address is already registered.',
    mode: 'signup',
    onSocialSignIn: (provider: string) => console.log('Social sign-up:', provider),
  },
};

// Loading States
export const Loading: Story = {
  args: {
    children: (
      <>
        <TextInput placeholder="Enter your email" disabled label="Email" required type="email" />
        <TextInput
          placeholder="Enter your password"
          disabled
          label="Password"
          required
          type="password"
        />
        <Button fullWidth loading type="submit">
          Signing In...
        </Button>
      </>
    ),
    isLoading: true,
    mode: 'signin',
    onSocialSignIn: (provider: string) => console.log('Social sign-in:', provider),
  },
};

export const SocialLoading: Story = {
  args: {
    children: (
      <>
        <TextInput placeholder="Enter your email" label="Email" required type="email" />
        <TextInput placeholder="Enter your password" label="Password" required type="password" />
        <Button fullWidth type="submit">
          Sign In
        </Button>
      </>
    ),
    mode: 'signin',
    onSocialSignIn: (provider: string) => console.log('Social sign-in:', provider),
    socialLoading: 'google',
  },
};

// Social Options Configurations
export const GoogleOnly: Story = {
  args: {
    availableSocialMethods: { github: false, google: true },
    children: (
      <>
        <TextInput placeholder="Enter your email" label="Email" required type="email" />
        <TextInput placeholder="Enter your password" label="Password" required type="password" />
        <Button fullWidth type="submit">
          Sign In
        </Button>
      </>
    ),
    mode: 'signin',
    onSocialSignIn: (provider: string) => console.log('Google sign-in:', provider),
  },
};

export const GitHubOnly: Story = {
  args: {
    availableSocialMethods: { github: true, google: false },
    children: (
      <>
        <TextInput placeholder="Enter your email" label="Email" required type="email" />
        <TextInput placeholder="Enter your password" label="Password" required type="password" />
        <Button fullWidth type="submit">
          Sign In
        </Button>
      </>
    ),
    mode: 'signin',
    onSocialSignIn: (provider: string) => console.log('GitHub sign-in:', provider),
  },
};

export const NoSocialOptions: Story = {
  args: {
    children: (
      <>
        <TextInput placeholder="Enter your email" label="Email" required type="email" />
        <TextInput placeholder="Enter your password" label="Password" required type="password" />
        <Button fullWidth type="submit">
          Sign In
        </Button>
      </>
    ),
    mode: 'signin',
    showSocialOptions: false,
  },
};

export const NoMagicLink: Story = {
  args: {
    children: (
      <>
        <TextInput placeholder="Enter your email" label="Email" required type="email" />
        <TextInput placeholder="Enter your password" label="Password" required type="password" />
        <Button fullWidth type="submit">
          Sign In
        </Button>
      </>
    ),
    mode: 'signin',
    onSocialSignIn: (provider: string) => console.log('Social sign-in:', provider),
    showMagicLink: false,
  },
};

// Interactive Stories
export const InteractiveSignIn: Story = {
  args: {
    children: (
      <>
        <TextInput placeholder="Enter your email" label="Email" required type="email" />
        <TextInput placeholder="Enter your password" label="Password" required type="password" />
        <Button fullWidth type="submit">
          Sign In
        </Button>
      </>
    ),
    mode: 'signin',
    onSocialSignIn: (provider: string) => console.log('Social sign-in:', provider),
  },
};

// Reset Password Form
export const ResetPassword: Story = {
  args: {
    children: (
      <>
        <TextInput
          placeholder="Enter your email to reset password"
          label="Email"
          required
          type="email"
        />
        <Button fullWidth type="submit">
          Send Reset Link
        </Button>
      </>
    ),
    mode: 'signin',
    showSocialOptions: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Password reset form without social options.',
      },
    },
  },
};
