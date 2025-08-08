import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { AccountSwitcher, type User, type UserSession } from './AccountSwitcher';

const mockCurrentUser: User = {
  id: '1',
  email: 'john.doe@example.com',
  name: 'John Doe',
  image: 'https://avatars.githubusercontent.com/u/1?v=4',
};

const mockOtherSessions: UserSession[] = [
  {
    id: '2',
    user: {
      id: '2',
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      image: 'https://avatars.githubusercontent.com/u/2?v=4',
    },
    active: false,
  },
  {
    id: '3',
    user: {
      id: '3',
      email: 'mike.wilson@work.com',
      name: 'Mike Wilson',
    },
    active: false,
  },
];

const AccountSwitcherWrapper = (props: any) => {
  const [switchingSessionId, setSwitchingSessionId] = useState<string | null>(null);

  const handleSwitchAccount = async (sessionId: string) => {
    setSwitchingSessionId(sessionId);
    // console.log('Switching to account:', sessionId);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (sessionId === '3') {
      throw new Error('Failed to switch account');
    }

    // console.log('Account switched successfully');
    setSwitchingSessionId(null);
  };

  const handleAddAccount = () => {
    // console.log('Adding new account');
  };

  const handleSignOut = async () => {
    // console.log('Signing out');
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleManageAccounts = () => {
    // console.log('Managing accounts');
  };

  const handleError = (error: Error) => {
    // console.error('Account switcher error:', error.message);
    setSwitchingSessionId(null);
  };

  return (
    <AccountSwitcher
      {...props}
      switchingSessionId={switchingSessionId}
      onSwitchAccount={handleSwitchAccount}
      onAddAccount={handleAddAccount}
      onSignOut={handleSignOut}
      onManageAccounts={handleManageAccounts}
      onError={handleError}
    />
  );
};

const meta: Meta<typeof AccountSwitcher> = {
  title: 'Auth/Sessions/AccountSwitcher',
  component: AccountSwitcherWrapper,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    compact: { control: 'boolean' },
    showAddAccount: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentUser: mockCurrentUser,
    otherSessions: mockOtherSessions,
  },
};

export const Compact: Story = {
  args: {
    currentUser: mockCurrentUser,
    otherSessions: mockOtherSessions,
    compact: true,
  },
};

export const NoOtherSessions: Story = {
  args: {
    currentUser: mockCurrentUser,
    otherSessions: [],
  },
};

export const NoAddAccount: Story = {
  args: {
    currentUser: mockCurrentUser,
    otherSessions: mockOtherSessions,
    showAddAccount: false,
  },
};

export const Loading: Story = {
  args: {
    currentUser: mockCurrentUser,
    otherSessions: mockOtherSessions,
    loading: true,
  },
};

export const UserWithoutImage: Story = {
  args: {
    currentUser: {
      id: '1',
      email: 'user@example.com',
      name: 'Test User',
    },
    otherSessions: [
      {
        id: '2',
        user: {
          id: '2',
          email: 'other@example.com',
          name: 'Other User',
        },
      },
    ],
  },
};

export const UserWithoutName: Story = {
  args: {
    currentUser: {
      id: '1',
      email: 'emailonly@example.com',
    },
    otherSessions: [
      {
        id: '2',
        user: {
          id: '2',
          email: 'another@example.com',
        },
      },
    ],
  },
};

export const CustomLabels: Story = {
  args: {
    currentUser: mockCurrentUser,
    otherSessions: mockOtherSessions,
    addAccountLabel: 'Add New Profile',
    manageAccountsLabel: 'Profile Settings',
    signOutLabel: 'Logout',
    signOutAllLabel: 'Logout All Profiles',
    switchAccountLabel: 'Switch Profile',
    currentAccountLabel: 'Active Profile',
    otherAccountsLabel: 'Available Profiles',
    activeLabel: 'Online',
  },
};

export const ManyAccounts: Story = {
  args: {
    currentUser: mockCurrentUser,
    otherSessions: [
      ...mockOtherSessions,
      {
        id: '4',
        user: {
          id: '4',
          email: 'sarah.johnson@company.com',
          name: 'Sarah Johnson',
          image: 'https://avatars.githubusercontent.com/u/4?v=4',
        },
      },
      {
        id: '5',
        user: {
          id: '5',
          email: 'alex.brown@startup.io',
          name: 'Alex Brown',
        },
      },
    ],
  },
};

export const ErrorDemo: Story = {
  args: {
    currentUser: mockCurrentUser,
    otherSessions: mockOtherSessions,
  },
  parameters: {
    docs: {
      description: {
        story:
          'This story demonstrates error handling. Try switching to "Mike Wilson" (ID: 3) to trigger a simulated error.',
      },
    },
  },
};
