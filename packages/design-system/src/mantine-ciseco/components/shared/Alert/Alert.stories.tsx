import { Meta, StoryObj } from '@storybook/react';

import { Alert } from './Alert';

const meta: Meta<typeof Alert> = {
  argTypes: {
    children: {
      control: 'text',
      description: 'Alert content',
    },
    containerClassName: {
      control: 'text',
      description: 'Additional CSS classes for the container',
    },
    type: {
      control: 'select',
      description: 'Alert type/variant',
      options: ['default', 'info', 'success', 'warning', 'error'],
    },
  },
  component: Alert,
  parameters: {
    docs: {
      description: {
        component:
          'An alert component with different types for displaying notifications and messages.',
      },
    },
    layout: 'centered',
  },
  title: 'Ciseco/Shared/Alert',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'This is a default alert message.',
    type: 'default',
  },
};

export const Info: Story = {
  args: {
    children: 'This is an informational alert message.',
    type: 'info',
  },
};

export const Success: Story = {
  args: {
    children: 'This is a success alert message.',
    type: 'success',
  },
};

export const Warning: Story = {
  args: {
    children: 'This is a warning alert message.',
    type: 'warning',
  },
};

export const Error: Story = {
  args: {
    children: 'This is an error alert message.',
    type: 'error',
  },
};

export const LongMessage: Story = {
  args: {
    children:
      'This is a longer alert message that contains more detailed information about what the user needs to know. It might span multiple lines and provide comprehensive context.',
    type: 'info',
  },
};

export const WithHTML: Story = {
  args: {
    children: (
      <div>
        <strong>Important:</strong> Please review your{' '}
        <button className="underline bg-transparent border-none cursor-pointer" type="button">
          settings
        </button>{' '}
        before continuing.
      </div>
    ),
    type: 'warning',
  },
};

export const AllTypes: Story = {
  render: () => (
    <div className="space-y-4 w-96">
      <Alert type="default">Default alert message</Alert>
      <Alert type="info">Information alert message</Alert>
      <Alert type="success">Success alert message</Alert>
      <Alert type="warning">Warning alert message</Alert>
      <Alert type="error">Error alert message</Alert>
    </div>
  ),
};

export const SystemMessages: Story = {
  render: () => (
    <div className="space-y-4 w-96">
      <Alert type="success">Your account has been created successfully!</Alert>
      <Alert type="info">Your order #12345 is being processed.</Alert>
      <Alert type="warning">Your session will expire in 5 minutes.</Alert>
      <Alert type="error">Failed to save changes. Please try again.</Alert>
    </div>
  ),
};

export const NotificationCenter: Story = {
  render: () => (
    <div className="space-y-3 w-96">
      <h3 className="text-lg font-semibold mb-4">Notifications</h3>
      <Alert type="success">Payment processed successfully</Alert>
      <Alert type="info">2 new messages in your inbox</Alert>
      <Alert type="warning">Your subscription expires in 3 days</Alert>
      <Alert type="error">Unable to sync data</Alert>
    </div>
  ),
};

export const FormValidation: Story = {
  render: () => (
    <div className="space-y-4 w-96">
      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-200"
          placeholder="Enter your email"
          type="email"
        />
        <Alert type="error">Please enter a valid email address</Alert>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Password</label>
        <input
          className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-200"
          placeholder="Enter your password"
          type="password"
        />
        <Alert type="success">Password meets all requirements</Alert>
      </div>
    </div>
  ),
};

export const CustomStyling: Story = {
  args: {
    children: 'Custom styled alert with additional classes',
    containerClassName: 'border-l-4 border-blue-500 shadow-lg',
    type: 'info',
  },
};
