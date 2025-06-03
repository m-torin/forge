import React from 'react';

import { TwoFactorManage, TwoFactorSetup, TwoFactorStatus } from './two-factor-setup';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof TwoFactorSetup> = {
  component: TwoFactorSetup,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '500px', width: '100%' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Two-factor authentication setup and management components for enhanced security.',
      },
    },
    layout: 'centered',
  },
  title: 'UIX/Auth/Two-Factor Authentication',
};

export default meta;
type Story = StoryObj<typeof TwoFactorSetup>;

// TwoFactorSetup Stories
export const Setup: Story = {
  args: {
    onCancel: () => console.log('2FA setup cancelled'),
    onComplete: () => console.log('2FA setup completed'),
  },
};

export const SetupWithCustomActions: Story = {
  args: {
    onCancel: () => console.log('Custom cancel handler'),
    onComplete: () => console.log('Custom complete handler'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Two-factor authentication setup with custom completion and cancellation handlers.',
      },
    },
  },
};

export const SetupInteractive: Story = {
  args: {
    onCancel: () => console.log('2FA setup cancelled'),
    onComplete: () => console.log('2FA setup completed'),
  },
};

// TwoFactorManage Stories
export const Manage: StoryObj<typeof TwoFactorManage> = {
  args: {
    onDisabled: () => console.log('2FA disabled'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Two-factor authentication management interface for users with 2FA already enabled.',
      },
    },
  },
  render: (args) => <TwoFactorManage {...args} />,
};

export const ManageWithBackupCodes: StoryObj<typeof TwoFactorManage> = {
  args: {
    onDisabled: () => console.log('2FA disabled'),
  },
  render: (args) => <TwoFactorManage {...args} />,
};

// TwoFactorStatus Stories
export const StatusEnabled: StoryObj<typeof TwoFactorStatus> = {
  args: {
    onManageClick: () => console.log('Manage 2FA clicked'),
    onSetupClick: () => console.log('Setup 2FA clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Two-factor authentication status display when 2FA is enabled.',
      },
    },
  },
  render: (args) => <TwoFactorStatus {...args} />,
};

export const StatusDisabled: StoryObj<typeof TwoFactorStatus> = {
  args: {
    onManageClick: () => console.log('Manage 2FA clicked'),
    onSetupClick: () => console.log('Setup 2FA clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Two-factor authentication status display when 2FA is disabled.',
      },
    },
  },
  render: (args) => <TwoFactorStatus {...args} />,
};

export const StatusLoading: StoryObj<typeof TwoFactorStatus> = {
  args: {
    onManageClick: () => console.log('Manage 2FA clicked'),
    onSetupClick: () => console.log('Setup 2FA clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Two-factor authentication status display while loading.',
      },
    },
  },
  render: (args) => <TwoFactorStatus {...args} />,
};

// Combined Story showing the complete flow
export const CompleteFlow: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Complete two-factor authentication flow from status check to setup to management.',
      },
    },
  },
  render: () => {
    const [enabled, setEnabled] = React.useState(false);
    const [showSetup, setShowSetup] = React.useState(false);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <TwoFactorStatus
          onManageClick={() => console.log('Manage clicked')}
          onSetupClick={() => setShowSetup(true)}
        />

        {showSetup && (
          <TwoFactorSetup
            onCancel={() => {
              setShowSetup(false);
              console.log('Setup cancelled');
            }}
            onComplete={() => {
              setEnabled(true);
              setShowSetup(false);
              console.log('2FA enabled');
            }}
          />
        )}

        {enabled && (
          <TwoFactorManage
            onDisabled={() => {
              setEnabled(false);
              console.log('2FA disabled');
            }}
          />
        )}
      </div>
    );
  },
};
