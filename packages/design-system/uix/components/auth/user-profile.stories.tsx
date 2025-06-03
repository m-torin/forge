import * as React from 'react';

import { SessionManagement, UserProfile } from './user-profile';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof UserProfile> = {
  component: UserProfile,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'User profile management components with account settings, social connections, and session management.',
      },
    },
    layout: 'centered',
  },
  title: 'UIX/Auth/User Profile',
};

export default meta;
type Story = StoryObj<typeof UserProfile>;

// Mock user data
const mockUser = {
  id: '1',
  name: 'John Doe',
  createdAt: '2024-01-01T00:00:00Z',
  email: 'john.doe@example.com',
  emailVerified: true,
  image: 'https://avatar.vercel.sh/john',
};

const mockUnverifiedUser = {
  ...mockUser,
  emailVerified: false,
};

// UserProfile Stories
export const Default: Story = {
  args: {
    onDeleteAccount: () => console.log('Delete account clicked'),
    showDangerZone: true,
    showSocialAccounts: true,
  },
};

export const WithoutDangerZone: Story = {
  args: {
    onDeleteAccount: () => console.log('Delete account clicked'),
    showDangerZone: false,
    showSocialAccounts: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'User profile without the danger zone section (for restricted environments).',
      },
    },
  },
};

export const WithoutSocialAccounts: Story = {
  args: {
    onDeleteAccount: () => console.log('Delete account clicked'),
    showDangerZone: true,
    showSocialAccounts: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'User profile without social account connections (for enterprise environments).',
      },
    },
  },
};

export const MinimalProfile: Story = {
  args: {
    showDangerZone: false,
    showSocialAccounts: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimal user profile with only basic account information.',
      },
    },
  },
};

export const BackstageProfile: Story = {
  args: {
    onDeleteAccount: () => console.log('Admin delete account'),
    showDangerZone: true,
    showSocialAccounts: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'User profile configured for admin/backstage use with danger zone but no social accounts.',
      },
    },
  },
};

export const ConsumerProfile: Story = {
  args: {
    onDeleteAccount: () => console.log('Consumer delete account'),
    showDangerZone: false,
    showSocialAccounts: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'User profile configured for consumer use with social accounts but no danger zone.',
      },
    },
  },
};

export const InteractiveProfile: Story = {
  args: {
    onDeleteAccount: () => console.log('Delete account clicked'),
    showDangerZone: true,
    showSocialAccounts: true,
  },
};

// SessionManagement Stories
export const Sessions: StoryObj<typeof SessionManagement> = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Session management component showing active user sessions.',
      },
    },
  },
  render: (args) => <SessionManagement {...args} />,
};

export const SessionsInteractive: StoryObj<typeof SessionManagement> = {
  args: {},
  render: (args) => <SessionManagement {...args} />,
};

// Profile with Different States
export const ProfileStates: Story = {
  parameters: {
    docs: {
      description: {
        story: 'User profiles in different verification states.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <div>
        <h3>Verified User Profile</h3>
        <UserProfile
          onDeleteAccount={() => console.log('Verified user delete')}
          showDangerZone={true}
          showSocialAccounts={true}
        />
      </div>

      <div>
        <h3>Unverified User Profile</h3>
        <UserProfile
          onDeleteAccount={() => console.log('Unverified user delete')}
          showDangerZone={false}
          showSocialAccounts={true}
        />
      </div>
    </div>
  ),
};

// Social Account Connection Flow
export const SocialAccountFlow: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Interactive social account connection and disconnection flow.',
      },
    },
  },
  render: () => {
    const [connectedAccounts, setConnectedAccounts] = React.useState<string[]>([]);

    const handleConnect = (provider: string) => {
      setConnectedAccounts((prev) => [...prev, provider]);
      console.log(`Connected ${provider}`);
    };

    const handleDisconnect = (provider: string) => {
      setConnectedAccounts((prev) => prev.filter((p) => p !== provider));
      console.log(`Disconnected ${provider}`);
    };

    return (
      <UserProfile
        onDeleteAccount={() => console.log('Delete account')}
        showDangerZone={false}
        showSocialAccounts={true}
      />
    );
  },
};

// Profile Form Validation
export const ProfileFormValidation: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Profile form with validation and update functionality.',
      },
    },
  },
  render: () => {
    const [formData, setFormData] = React.useState({
      name: '',
      email: '',
    });

    return (
      <UserProfile
        onDeleteAccount={() => console.log('Delete account')}
        showDangerZone={true}
        showSocialAccounts={true}
      />
    );
  },
};

// Complete Profile and Session Management
export const CompleteProfileFlow: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Complete user profile and session management interface.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <UserProfile
        onDeleteAccount={() => {
          if (window.confirm('Are you sure you want to delete your account?')) {
            console.log('Account deletion confirmed');
          }
        }}
        showDangerZone={true}
        showSocialAccounts={true}
      />

      <SessionManagement />
    </div>
  ),
};

// Mobile-Optimized Profile
export const MobileProfile: Story = {
  args: {
    onDeleteAccount: () => console.log('Mobile delete account'),
    showDangerZone: true,
    showSocialAccounts: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'User profile optimized for mobile viewing.',
      },
    },
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: (args) => <UserProfile {...args} />,
};

// Profile with Loading States
export const ProfileLoadingStates: Story = {
  parameters: {
    docs: {
      description: {
        story: 'User profile with various loading states for async operations.',
      },
    },
  },
  render: () => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);

    return (
      <UserProfile
        onDeleteAccount={() => console.log('Delete account')}
        showDangerZone={true}
        showSocialAccounts={true}
      />
    );
  },
};
