import { Alert } from './Alert'

import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Alert> = {
  argTypes: {
    type: {
      control: 'select',
      description: 'Alert type/variant',
      options: ['default', 'info', 'success', 'warning', 'error'],
    },
    children: {
      control: 'text',
      description: 'Alert content',
    },
    containerClassName: {
      control: 'text',
      description: 'Additional CSS classes for the container',
    },
  },
  component: Alert,
  parameters: {
    docs: {
      description: {
        component: 'An alert component with different types for displaying notifications and messages.',
      },
    },
    layout: 'centered',
  },
  title: 'Ciseco/Shared/Alert',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    type: 'default',
    children: 'This is a default alert message.',
  },
}

export const Info: Story = {
  args: {
    type: 'info',
    children: 'This is an informational alert message.',
  },
}

export const Success: Story = {
  args: {
    type: 'success',
    children: 'This is a success alert message.',
  },
}

export const Warning: Story = {
  args: {
    type: 'warning',
    children: 'This is a warning alert message.',
  },
}

export const Error: Story = {
  args: {
    type: 'error',
    children: 'This is an error alert message.',
  },
}

export const LongMessage: Story = {
  args: {
    type: 'info',
    children:
      'This is a longer alert message that contains more detailed information about what the user needs to know. It might span multiple lines and provide comprehensive context.',
  },
}

export const WithHTML: Story = {
  args: {
    type: 'warning',
    children: (
      <div>
        <strong>Important:</strong> Please review your{' '}
        <button className="cursor-pointer border-none bg-transparent underline" type="button">
          settings
        </button>{' '}
        before continuing.
      </div>
    ),
  },
}

export const AllTypes: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <Alert type="default">Default alert message</Alert>
      <Alert type="info">Information alert message</Alert>
      <Alert type="success">Success alert message</Alert>
      <Alert type="warning">Warning alert message</Alert>
      <Alert type="error">Error alert message</Alert>
    </div>
  ),
}

export const SystemMessages: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <Alert type="success">Your account has been created successfully!</Alert>
      <Alert type="info">Your order #12345 is being processed.</Alert>
      <Alert type="warning">Your session will expire in 5 minutes.</Alert>
      <Alert type="error">Failed to save changes. Please try again.</Alert>
    </div>
  ),
}

export const NotificationCenter: Story = {
  render: () => (
    <div className="w-96 space-y-3">
      <h3 className="mb-4 text-lg font-semibold">Notifications</h3>
      <Alert type="success">Payment processed successfully</Alert>
      <Alert type="info">2 new messages in your inbox</Alert>
      <Alert type="warning">Your subscription expires in 3 days</Alert>
      <Alert type="error">Unable to sync data</Alert>
    </div>
  ),
}

export const FormValidation: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium">Email</label>
        <input
          placeholder="Enter your email"
          className="w-full rounded-lg border border-red-300 px-3 py-2 focus:ring-2 focus:ring-red-200"
          type="email"
        />
        <Alert type="error">Please enter a valid email address</Alert>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Password</label>
        <input
          placeholder="Enter your password"
          className="w-full rounded-lg border border-green-300 px-3 py-2 focus:ring-2 focus:ring-green-200"
          type="password"
        />
        <Alert type="success">Password meets all requirements</Alert>
      </div>
    </div>
  ),
}

export const CustomStyling: Story = {
  args: {
    type: 'info',
    children: 'Custom styled alert with additional classes',
    containerClassName: 'border-l-4 border-blue-500 shadow-lg',
  },
}
