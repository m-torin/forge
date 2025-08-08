import type { Meta, StoryObj } from '@storybook/nextjs';
import { SocialLoginButtons } from './SocialLoginButtons';

const meta: Meta<typeof SocialLoginButtons> = {
  title: 'Auth/Social/SocialLoginButtons',
  component: SocialLoginButtons,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    providers: {
      control: 'check',
      options: ['google', 'github', 'microsoft', 'facebook', 'discord'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    variant: {
      control: 'select',
      options: ['default', 'light', 'outline', 'subtle', 'filled'],
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock handler
const mockProviderClick = (provider: string) => {
  // console.log('Provider clicked:', provider);
};

export const Default: Story = {
  args: {
    providers: ['google', 'github'],
    onProviderClick: mockProviderClick,
  },
};

export const AllProviders: Story = {
  args: {
    providers: ['google', 'github', 'microsoft', 'facebook', 'discord'],
    onProviderClick: mockProviderClick,
  },
};

export const SingleProvider: Story = {
  args: {
    providers: ['google'],
    onProviderClick: mockProviderClick,
  },
};

export const Loading: Story = {
  args: {
    providers: ['google', 'github'],
    onProviderClick: mockProviderClick,
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    providers: ['google', 'github', 'microsoft'],
    onProviderClick: mockProviderClick,
    disabled: true,
  },
};

export const VerticalLayout: Story = {
  args: {
    providers: ['google', 'github', 'microsoft'],
    onProviderClick: mockProviderClick,
    orientation: 'vertical',
  },
};

export const LargeSize: Story = {
  args: {
    providers: ['google', 'github'],
    onProviderClick: mockProviderClick,
    size: 'lg',
  },
};

export const SmallSize: Story = {
  args: {
    providers: ['google', 'github', 'microsoft'],
    onProviderClick: mockProviderClick,
    size: 'sm',
  },
};

export const OutlineVariant: Story = {
  args: {
    providers: ['google', 'github'],
    onProviderClick: mockProviderClick,
    variant: 'outline',
  },
};

export const LightVariant: Story = {
  args: {
    providers: ['google', 'github', 'microsoft'],
    onProviderClick: mockProviderClick,
    variant: 'light',
  },
};

export const WithCustomText: Story = {
  args: {
    providers: ['google', 'github'],
    onProviderClick: mockProviderClick,
    continueText: 'Sign up with',
  },
};

export const NoText: Story = {
  args: {
    providers: ['google', 'github', 'microsoft'],
    onProviderClick: mockProviderClick,
    showText: false,
  },
};

export const CustomSpacing: Story = {
  args: {
    providers: ['google', 'github', 'microsoft', 'facebook'],
    onProviderClick: mockProviderClick,
    spacing: 'xl',
  },
};

export const EnterpriseProviders: Story = {
  args: {
    providers: ['microsoft', 'google'],
    onProviderClick: mockProviderClick,
    continueText: 'Continue with',
    size: 'md',
    variant: 'outline',
  },
};

export const GamersChoice: Story = {
  args: {
    providers: ['discord', 'github'],
    onProviderClick: mockProviderClick,
    continueText: 'Join with',
    variant: 'filled',
  },
};
