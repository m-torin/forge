import type { Meta, StoryObj } from '@storybook/nextjs';
import { AuthLayout } from './AuthLayout';
import { SignInForm } from './SignInForm';

const meta: Meta<typeof AuthLayout> = {
  title: 'Auth/Layout/AuthLayout',
  component: AuthLayout,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    showThemeToggle: { control: 'boolean' },
    showLogo: { control: 'boolean' },
    fullHeight: { control: 'boolean' },
    centered: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockSubmit = (values: any) => {
  // console.log('Form submitted:', values);
};
const mockSocialLogin = (provider: string) => {
  // console.log('Social login:', provider);
};

const SampleForm = () => (
  <SignInForm
    onSubmit={mockSubmit}
    onSocialLogin={mockSocialLogin}
    socialProviders={['google', 'github']}
  />
);

export const Default: Story = {
  args: {
    children: <SampleForm />,
  },
};

export const CustomTitle: Story = {
  args: {
    title: 'Welcome to Our Platform',
    children: <SampleForm />,
  },
};

export const WithCustomLogo: Story = {
  args: {
    logoSrc: '/logo.png',
    logoAlt: 'Company Logo',
    title: 'Secure Login',
    children: <SampleForm />,
  },
};

export const NoLogo: Story = {
  args: {
    showLogo: false,
    title: 'Authentication',
    children: <SampleForm />,
  },
};

export const NoThemeToggle: Story = {
  args: {
    showThemeToggle: false,
    children: <SampleForm />,
  },
};

export const NotCentered: Story = {
  args: {
    centered: false,
    children: <SampleForm />,
  },
};

export const CustomHeight: Story = {
  args: {
    fullHeight: false,
    children: <SampleForm />,
  },
};

export const MinimalLayout: Story = {
  args: {
    showLogo: false,
    showThemeToggle: false,
    title: 'Sign In',
    children: <SampleForm />,
  },
};
