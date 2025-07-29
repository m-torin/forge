import type { Meta, StoryObj } from '@storybook/nextjs';
import { AuthLoading } from './AuthLoading';

const meta: Meta<typeof AuthLoading> = {
  title: 'Auth/States/AuthLoading',
  component: AuthLoading,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    variant: {
      control: 'select',
      options: ['oval', 'dots', 'bars'],
    },
    showMessage: { control: 'boolean' },
    centered: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const CustomMessage: Story = {
  args: {
    message: 'Verifying your credentials...',
  },
};

export const LargeSize: Story = {
  args: {
    size: 'lg',
    message: 'Loading your dashboard...',
  },
};

export const SmallSize: Story = {
  args: {
    size: 'sm',
    message: 'Please wait',
  },
};

export const DotsVariant: Story = {
  args: {
    variant: 'dots',
    message: 'Processing authentication...',
  },
};

export const BarsVariant: Story = {
  args: {
    variant: 'bars',
    message: 'Signing you in...',
  },
};

export const NoMessage: Story = {
  args: {
    showMessage: false,
  },
};

export const NotCentered: Story = {
  args: {
    centered: false,
    message: 'Loading content...',
  },
};

export const SignInLoading: Story = {
  args: {
    message: 'Signing you in...',
    size: 'md',
  },
};

export const SignUpLoading: Story = {
  args: {
    message: 'Creating your account...',
    size: 'md',
  },
};

export const SessionLoading: Story = {
  args: {
    message: 'Restoring your session...',
    size: 'sm',
  },
};

export const TwoFactorLoading: Story = {
  args: {
    message: 'Verifying two-factor code...',
    variant: 'dots',
  },
};
