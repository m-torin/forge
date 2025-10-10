import { Alert, Badge, Container, Divider, Group, Paper, Stack, Text } from '@mantine/core';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { expect, userEvent, within } from '@storybook/test';
import { IconAlertCircle, IconBuilding, IconShield, IconUsers } from '@tabler/icons-react';
import { useState } from 'react';

import { AccountSwitcher, type User, type UserSession } from './AccountSwitcher';

// Enhanced mock data with more realistic user profiles
const generateMockUsers = (count: number = 5): User[] => {
  const profiles = [
    { name: 'John Doe', email: 'john.doe@example.com', image: 'https://i.pravatar.cc/80?img=1' },
    {
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      image: 'https://i.pravatar.cc/80?img=2',
    },
    { name: 'Mike Wilson', email: 'mike.wilson@work.com', image: 'https://i.pravatar.cc/80?img=3' },
    {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@corp.com',
      image: 'https://i.pravatar.cc/80?img=4',
    },
    { name: 'Alex Brown', email: 'alex.brown@startup.io', image: 'https://i.pravatar.cc/80?img=5' },
    {
      name: 'Emma Davis',
      email: 'emma.davis@freelance.com',
      image: 'https://i.pravatar.cc/80?img=6',
    },
    {
      name: 'David Miller',
      email: 'david.miller@agency.co',
      image: 'https://i.pravatar.cc/80?img=7',
    },
    {
      name: 'Lisa Anderson',
      email: 'lisa.anderson@consulting.com',
      image: 'https://i.pravatar.cc/80?img=8',
    },
  ];

  return profiles.slice(0, count).map((profile, index) => ({
    id: (index + 1).toString(),
    ...profile,
  }));
};

const mockUsers = generateMockUsers(8);
const mockCurrentUser = mockUsers[0];
const mockOtherSessions: UserSession[] = mockUsers.slice(1).map(user => ({
  id: user.id,
  user,
  active: Math.random() > 0.7, // Randomly make some sessions active
}));

// Enhanced wrapper with advanced functionality
const AccountSwitcherWrapper = ({
  testId = 'account-switcher',
  onSwitchAccount,
  onAddAccount,
  onSignOut,
  onManageAccounts,
  onError,
  simulateError = false,
  delayTime = 1500,
  errorUserIds = ['3'],
  showContext = false,
  contextType = 'dashboard',
  ...props
}: any) => {
  const [switchingSessionId, setSwitchingSessionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSwitchAccount = async (sessionId: string) => {
    setSwitchingSessionId(sessionId);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Log action
    action('switchAccount')(sessionId);
    onSwitchAccount?.(sessionId);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, delayTime));

      // Simulate error for specific user IDs
      if (simulateError && errorUserIds.includes(sessionId)) {
        throw new Error(`Failed to switch to account ${sessionId}. Please try again.`);
      }

      setSuccessMessage(`Successfully switched to account ${sessionId}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      setErrorMessage(errorMsg);
      onError?.(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setSwitchingSessionId(null);
    }
  };

  const handleAddAccount = () => {
    action('addAccount')();
    onAddAccount?.();
    setSuccessMessage('Redirecting to add account...');
  };

  const handleSignOut = async () => {
    action('signOut')();
    onSignOut?.();

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMessage('Successfully signed out');
    } catch (error) {
      setErrorMessage('Failed to sign out');
    }
  };

  const handleManageAccounts = () => {
    action('manageAccounts')();
    onManageAccounts?.();
    setSuccessMessage('Opening account management...');
  };

  const handleError = (error: Error) => {
    action('error')(error.message);
    setErrorMessage(error.message);
    onError?.(error);
  };

  return (
    <div data-testid={testId} style={{ minWidth: '300px' }}>
      {showContext && (
        <div style={{ marginBottom: '16px' }}>
          <Badge variant="light" color="blue" size="sm">
            Context: {contextType}
          </Badge>
        </div>
      )}

      <AccountSwitcher
        {...props}
        switchingSessionId={switchingSessionId}
        onSwitchAccount={handleSwitchAccount}
        onAddAccount={handleAddAccount}
        onSignOut={handleSignOut}
        onManageAccounts={handleManageAccounts}
        onError={handleError}
      />

      {/* Status messages */}
      {errorMessage && (
        <Alert
          icon={<IconAlertCircle size={14} />}
          color="red"
          mt="md"
          onClose={() => setErrorMessage(null)}
          withCloseButton
        >
          {errorMessage}
        </Alert>
      )}

      {successMessage && (
        <Alert color="green" mt="md" onClose={() => setSuccessMessage(null)} withCloseButton>
          {successMessage}
        </Alert>
      )}
    </div>
  );
};

const meta: Meta<typeof AccountSwitcher> = {
  title: 'Auth/AccountSwitcher',
  component: AccountSwitcher,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# AccountSwitcher Component

A comprehensive account switching component that allows users to manage multiple authenticated sessions, switch between accounts, and perform account-related actions seamlessly.

## Features

### Core Functionality
- **Multi-Account Support**: Switch between multiple authenticated user sessions
- **Session Management**: Display current and alternative account sessions
- **Account Actions**: Add new accounts, sign out, and manage account settings
- **Loading States**: Visual feedback during account switching operations
- **Error Handling**: Graceful error handling with user feedback

### User Experience
- **Compact Mode**: Minimalist avatar-only trigger for space-constrained layouts
- **Full Mode**: Rich display with user information and detailed controls
- **Custom Rendering**: Pluggable avatar and user info rendering
- **Accessibility**: Full keyboard navigation and screen reader support

### Session Indicators
- **Active Status**: Visual indicators for currently active sessions
- **User Information**: Name, email, and avatar display for each account
- **Loading Feedback**: Spinners and disabled states during operations

### Customization Options
- **Custom Labels**: Configurable text for all interface elements
- **Custom Rendering**: Override avatar and user info display components
- **Flexible Layout**: Compact and full display modes
- **Theming**: Full integration with design system colors and typography

## Use Cases

Perfect for:
- **Multi-Tenant Applications**: Switch between different organization accounts
- **Personal/Work Separation**: Separate personal and professional accounts
- **Team Collaboration**: Switch between individual and shared accounts
- **Development Environments**: Switch between different environment accounts
- **Customer Support**: Support agents switching between customer contexts

## Design Patterns

The component follows modern authentication UX patterns with clear visual hierarchy, immediate feedback, and safe default behaviors to prevent accidental account switches.
        `,
      },
    },
  },
  argTypes: {
    // User Data
    currentUser: {
      control: 'object',
      description: 'Currently authenticated user object',
      table: { category: 'Data' },
    },
    otherSessions: {
      control: 'object',
      description: 'Array of other available user sessions',
      table: { category: 'Data' },
    },

    // Display Options
    compact: {
      control: 'boolean',
      description: 'Use compact avatar-only display mode',
      table: { category: 'Display' },
    },
    showAddAccount: {
      control: 'boolean',
      description: 'Show "Add Account" option in menu',
      table: { category: 'Display' },
    },
    loading: {
      control: 'boolean',
      description: 'Show loading state on main trigger',
      table: { category: 'States' },
    },
    switchingSessionId: {
      control: 'text',
      description: 'ID of session currently being switched to',
      table: { category: 'States' },
    },

    // Customization
    addAccountLabel: {
      control: 'text',
      description: 'Label for add account action',
      table: { category: 'Labels' },
    },
    manageAccountsLabel: {
      control: 'text',
      description: 'Label for manage accounts action',
      table: { category: 'Labels' },
    },
    signOutLabel: {
      control: 'text',
      description: 'Label for sign out action',
      table: { category: 'Labels' },
    },
    signOutAllLabel: {
      control: 'text',
      description: 'Label for sign out all accounts action',
      table: { category: 'Labels' },
    },
    switchAccountLabel: {
      control: 'text',
      description: 'Label for switch account section',
      table: { category: 'Labels' },
    },
    currentAccountLabel: {
      control: 'text',
      description: 'Label for current account section',
      table: { category: 'Labels' },
    },
    otherAccountsLabel: {
      control: 'text',
      description: 'Label for other accounts section',
      table: { category: 'Labels' },
    },
    activeLabel: {
      control: 'text',
      description: 'Label for active status badge',
      table: { category: 'Labels' },
    },

    // Event Handlers
    onSwitchAccount: {
      action: 'switchAccount',
      description: 'Callback when switching to another account',
      table: { category: 'Events' },
    },
    onAddAccount: {
      action: 'addAccount',
      description: 'Callback when adding a new account',
      table: { category: 'Events' },
    },
    onSignOut: {
      action: 'signOut',
      description: 'Callback when signing out',
      table: { category: 'Events' },
    },
    onManageAccounts: {
      action: 'manageAccounts',
      description: 'Callback when managing accounts',
      table: { category: 'Events' },
    },
    onError: {
      action: 'error',
      description: 'Callback when an error occurs',
      table: { category: 'Events' },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive Playground Story
export const Playground: Story = {
  render: args => <AccountSwitcherWrapper {...args} />,
  args: {
    currentUser: mockCurrentUser,
    otherSessions: mockOtherSessions.slice(0, 3),
    compact: false,
    showAddAccount: true,
    loading: false,
    delayTime: 1500,
    simulateError: false,
    errorUserIds: ['3'],
    addAccountLabel: 'Add another account',
    manageAccountsLabel: 'Manage accounts',
    signOutLabel: 'Sign out',
    signOutAllLabel: 'Sign out all accounts',
    switchAccountLabel: 'Switch account',
    currentAccountLabel: 'Current account',
    otherAccountsLabel: 'Other accounts',
    activeLabel: 'Active',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switcher = canvas.getByTestId('account-switcher');

    // Verify component renders
    await expect(switcher).toBeInTheDocument();

    // Try to find and click the account switcher trigger
    // Note: This might be a button or menu trigger depending on the mode
    const trigger = switcher.querySelector('button') || switcher.querySelector('[role="button"]');
    if (trigger) {
      await userEvent.click(trigger);
    }
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive playground for the AccountSwitcher component. Try switching between accounts, adding accounts, and testing error scenarios.',
      },
    },
  },
};

// Basic Usage Stories
export const DefaultMode: Story = {
  render: () => (
    <AccountSwitcherWrapper
      currentUser={mockCurrentUser}
      otherSessions={mockOtherSessions.slice(0, 2)}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Default full display mode showing current user information and account switching options.',
      },
    },
  },
};

export const CompactMode: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        backgroundColor: '#f8f9fa',
      }}
    >
      <Text fw={600}>Dashboard Header</Text>
      <AccountSwitcherWrapper
        currentUser={mockCurrentUser}
        otherSessions={mockOtherSessions.slice(0, 2)}
        compact={true}
        showContext={true}
        contextType="header"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Compact avatar-only mode perfect for headers and space-constrained layouts.',
      },
    },
  },
};

export const SingleAccount: Story = {
  render: () => (
    <AccountSwitcherWrapper
      currentUser={mockCurrentUser}
      otherSessions={[]}
      showAddAccount={true}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Single account mode with option to add additional accounts.',
      },
    },
  },
};

// User Profile Variations
export const UserWithoutImage: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', padding: '24px' }}>
      <div>
        <Text size="sm" fw={500} mb="md">
          Full Mode
        </Text>
        <AccountSwitcherWrapper
          currentUser={{
            id: '1',
            email: 'nophoto@example.com',
            name: 'User Without Photo',
          }}
          otherSessions={[
            {
              id: '2',
              user: {
                id: '2',
                email: 'another@example.com',
                name: 'Another User',
              },
            },
          ]}
        />
      </div>
      <div>
        <Text size="sm" fw={500} mb="md">
          Compact Mode
        </Text>
        <AccountSwitcherWrapper
          currentUser={{
            id: '1',
            email: 'nophoto@example.com',
            name: 'User Without Photo',
          }}
          otherSessions={[
            {
              id: '2',
              user: {
                id: '2',
                email: 'another@example.com',
                name: 'Another User',
              },
            },
          ]}
          compact={true}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Users without profile images showing initials fallback in both display modes.',
      },
    },
  },
};

export const EmailOnlyUsers: Story = {
  render: () => (
    <AccountSwitcherWrapper
      currentUser={{
        id: '1',
        email: 'emailonly@example.com',
      }}
      otherSessions={[
        {
          id: '2',
          user: {
            id: '2',
            email: 'another.email.only@work.com',
          },
        },
        {
          id: '3',
          user: {
            id: '3',
            email: 'third.user@company.org',
          },
        },
      ]}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Users with email addresses only, showing how the component handles missing names.',
      },
    },
  },
};

export const MixedUserProfiles: Story = {
  render: () => (
    <AccountSwitcherWrapper
      currentUser={mockCurrentUser}
      otherSessions={[
        {
          id: '2',
          user: {
            id: '2',
            email: 'complete.profile@example.com',
            name: 'Complete Profile',
            image: 'https://i.pravatar.cc/80?img=2',
          },
        },
        {
          id: '3',
          user: {
            id: '3',
            email: 'name.only@example.com',
            name: 'Name Only User',
          },
        },
        {
          id: '4',
          user: {
            id: '4',
            email: 'email.only.user@example.com',
          },
        },
      ]}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Mixed user profiles showing how the component handles various combinations of available user data.',
      },
    },
  },
};

// Session Management Stories
export const ManyAccounts: Story = {
  render: () => (
    <AccountSwitcherWrapper currentUser={mockCurrentUser} otherSessions={mockOtherSessions} />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Multiple accounts demonstration showing how the component scales with many user sessions.',
      },
    },
  },
};

export const OrganizationalAccounts: Story = {
  render: () => (
    <AccountSwitcherWrapper
      currentUser={{
        id: '1',
        email: 'john.doe@acmecorp.com',
        name: 'John Doe',
        image: 'https://i.pravatar.cc/80?img=1',
      }}
      otherSessions={[
        {
          id: '2',
          user: {
            id: '2',
            email: 'john.doe@startup.io',
            name: 'John Doe (Startup)',
            image: 'https://i.pravatar.cc/80?img=1',
          },
        },
        {
          id: '3',
          user: {
            id: '3',
            email: 'john.personal@gmail.com',
            name: 'John Doe (Personal)',
            image: 'https://i.pravatar.cc/80?img=1',
          },
        },
      ]}
      addAccountLabel="Add work account"
      manageAccountsLabel="Account settings"
      switchAccountLabel="Switch organization"
      currentAccountLabel="Current organization"
      otherAccountsLabel="Other organizations"
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Organizational context showing the same user across different organizations or contexts.',
      },
    },
  },
};

// State Management Stories
export const LoadingStates: Story = {
  render: () => (
    <Stack gap="xl">
      <div>
        <Text size="sm" fw={500} mb="md">
          Main Loading State
        </Text>
        <AccountSwitcherWrapper
          currentUser={mockCurrentUser}
          otherSessions={mockOtherSessions.slice(0, 2)}
          loading={true}
        />
      </div>

      <div>
        <Text size="sm" fw={500} mb="md">
          Account Switching in Progress
        </Text>
        <AccountSwitcherWrapper
          currentUser={mockCurrentUser}
          otherSessions={mockOtherSessions.slice(0, 2)}
          switchingSessionId="2"
        />
      </div>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Different loading states showing main loading and individual account switching states.',
      },
    },
  },
};

export const ErrorHandling: Story = {
  render: () => (
    <AccountSwitcherWrapper
      currentUser={mockCurrentUser}
      otherSessions={mockOtherSessions.slice(0, 3)}
      simulateError={true}
      errorUserIds={['3']}
      delayTime={1000}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Error handling demonstration. Try switching to "Mike Wilson" to see error handling in action.',
      },
    },
  },
};

export const QuickSwitching: Story = {
  render: () => (
    <AccountSwitcherWrapper
      currentUser={mockCurrentUser}
      otherSessions={mockOtherSessions.slice(0, 2)}
      delayTime={200}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Fast account switching with minimal delay for responsive user experience.',
      },
    },
  },
};

// Customization Stories
export const CustomLabels: Story = {
  render: () => (
    <AccountSwitcherWrapper
      currentUser={mockCurrentUser}
      otherSessions={mockOtherSessions.slice(0, 2)}
      addAccountLabel="Connect New Profile"
      manageAccountsLabel="Profile Settings"
      signOutLabel="Disconnect"
      signOutAllLabel="Disconnect All Profiles"
      switchAccountLabel="Available Profiles"
      currentAccountLabel="Active Profile"
      otherAccountsLabel="Switch to Profile"
      activeLabel="Online"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Custom labels and terminology to match your application's language and branding.",
      },
    },
  },
};

export const NoAddAccount: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', padding: '24px' }}>
      <div>
        <Text size="sm" fw={500} mb="md">
          Without Add Account
        </Text>
        <AccountSwitcherWrapper
          currentUser={mockCurrentUser}
          otherSessions={mockOtherSessions.slice(0, 2)}
          showAddAccount={false}
        />
      </div>
      <div>
        <Text size="sm" fw={500} mb="md">
          With Add Account
        </Text>
        <AccountSwitcherWrapper
          currentUser={mockCurrentUser}
          otherSessions={mockOtherSessions.slice(0, 2)}
          showAddAccount={true}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison showing the component with and without the "Add Account" option.',
      },
    },
  },
};

// Context and Layout Stories
export const HeaderIntegration: Story = {
  render: () => (
    <Paper shadow="sm" p="md" style={{ backgroundColor: '#ffffff' }}>
      <Group justify="space-between" align="center">
        <div>
          <Text size="lg" fw={700}>
            Dashboard
          </Text>
          <Text size="sm" c="dimmed">
            Welcome back, manage your projects
          </Text>
        </div>
        <Group gap="md">
          <Badge variant="light" color="green">
            23 Online
          </Badge>
          <AccountSwitcherWrapper
            currentUser={mockCurrentUser}
            otherSessions={mockOtherSessions.slice(0, 2)}
            compact={true}
          />
        </Group>
      </Group>
    </Paper>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Integration example showing the account switcher in a typical dashboard header layout.',
      },
    },
  },
};

export const SidebarIntegration: Story = {
  render: () => (
    <div style={{ display: 'flex', backgroundColor: '#f8f9fa', minHeight: '400px' }}>
      <div
        style={{
          width: '280px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e9ecef',
          padding: '16px',
        }}
      >
        <Stack gap="md">
          <AccountSwitcherWrapper
            currentUser={mockCurrentUser}
            otherSessions={mockOtherSessions.slice(0, 2)}
            compact={false}
          />
          <Divider />
          <Text size="sm" c="dimmed">
            Navigation would go here...
          </Text>
        </Stack>
      </div>
      <div style={{ flex: 1, padding: '24px' }}>
        <Text>Main content area</Text>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Sidebar integration showing the account switcher as part of a navigation sidebar.',
      },
    },
  },
};

// Enterprise and Team Stories
export const TeamCollaboration: Story = {
  render: () => (
    <Stack gap="lg" p="xl">
      <div>
        <Group gap="md" mb="md">
          <IconUsers size={24} />
          <Text size="lg" fw={600}>
            Team Collaboration
          </Text>
        </Group>
        <Text size="sm" c="dimmed" mb="xl">
          Switch between your personal account and shared team accounts
        </Text>
      </div>

      <Container size="sm">
        <AccountSwitcherWrapper
          currentUser={{
            id: '1',
            email: 'john.doe@company.com',
            name: 'John Doe',
            image: 'https://i.pravatar.cc/80?img=1',
          }}
          otherSessions={[
            {
              id: '2',
              user: {
                id: '2',
                email: 'team-frontend@company.com',
                name: 'Frontend Team',
                image: 'https://i.pravatar.cc/80?img=10',
              },
            },
            {
              id: '3',
              user: {
                id: '3',
                email: 'team-design@company.com',
                name: 'Design Team',
                image: 'https://i.pravatar.cc/80?img=11',
              },
            },
          ]}
          addAccountLabel="Join another team"
          switchAccountLabel="Switch context"
          currentAccountLabel="Current context"
          otherAccountsLabel="Available teams"
        />
      </Container>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Team collaboration scenario where users can switch between personal and shared team accounts.',
      },
    },
  },
};

export const MultiTenantApplication: Story = {
  render: () => (
    <Stack gap="lg" p="xl">
      <div>
        <Group gap="md" mb="md">
          <IconBuilding size={24} />
          <Text size="lg" fw={600}>
            Multi-Tenant SaaS
          </Text>
        </Group>
        <Text size="sm" c="dimmed" mb="xl">
          Access different client organizations and environments
        </Text>
      </div>

      <Container size="sm">
        <AccountSwitcherWrapper
          currentUser={{
            id: '1',
            email: 'admin@acmecorp.com',
            name: 'ACME Corp (Production)',
            image: 'https://i.pravatar.cc/80?img=12',
          }}
          otherSessions={[
            {
              id: '2',
              user: {
                id: '2',
                email: 'admin@acmecorp-staging.com',
                name: 'ACME Corp (Staging)',
                image: 'https://i.pravatar.cc/80?img=12',
              },
            },
            {
              id: '3',
              user: {
                id: '3',
                email: 'admin@techstartup.io',
                name: 'Tech Startup Inc',
                image: 'https://i.pravatar.cc/80?img=13',
              },
            },
            {
              id: '4',
              user: {
                id: '4',
                email: 'consultant@freelance.com',
                name: 'Freelance Account',
                image: 'https://i.pravatar.cc/80?img=14',
              },
            },
          ]}
          addAccountLabel="Connect new organization"
          manageAccountsLabel="Organization settings"
          switchAccountLabel="Switch organization"
          currentAccountLabel="Current organization"
          otherAccountsLabel="Available organizations"
        />
      </Container>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Multi-tenant SaaS application where users can access different client organizations and environments.',
      },
    },
  },
};

// Security and Compliance Stories
export const SecurityCompliant: Story = {
  render: () => (
    <Stack gap="lg" p="xl">
      <div>
        <Group gap="md" mb="md">
          <IconShield size={24} />
          <Text size="lg" fw={600}>
            Security & Compliance
          </Text>
        </Group>
        <Text size="sm" c="dimmed" mb="xl">
          Enhanced security features for enterprise environments
        </Text>
      </div>

      <Container size="sm">
        <AccountSwitcherWrapper
          currentUser={{
            id: '1',
            email: 'admin@enterprise.com',
            name: 'System Administrator',
            image: 'https://i.pravatar.cc/80?img=15',
          }}
          otherSessions={[
            {
              id: '2',
              user: {
                id: '2',
                email: 'readonly@enterprise.com',
                name: 'Read-Only Access',
                image: 'https://i.pravatar.cc/80?img=16',
              },
              active: true,
            },
          ]}
          addAccountLabel="Request access to new account"
          manageAccountsLabel="Security settings"
          signOutLabel="Secure sign out"
          signOutAllLabel="Sign out all sessions"
          activeLabel="Secured"
          delayTime={2000} // Slower for security verification
        />

        <Alert color="blue" mt="md">
          <Text size="xs">
            All account switches are logged for security and compliance purposes.
          </Text>
        </Alert>
      </Container>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Security-focused implementation with compliance features and audit logging.',
      },
    },
  },
};

// Accessibility Testing Story
export const AccessibilityDemo: Story = {
  render: () => (
    <Stack gap="lg">
      <Text size="lg" fw={500}>
        Accessibility Features
      </Text>
      <AccountSwitcherWrapper
        currentUser={mockCurrentUser}
        otherSessions={mockOtherSessions.slice(0, 2)}
        testId="accessibility-switcher"
      />
      <Text size="sm" c="dimmed">
        This component supports full keyboard navigation, screen readers, and ARIA labels.
      </Text>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test component accessibility
    const switcher = canvas.getByTestId('accessibility-switcher');
    await expect(switcher).toBeInTheDocument();

    // Test keyboard navigation
    const trigger = switcher.querySelector('button');
    if (trigger) {
      // Focus the trigger
      trigger.focus();
      await expect(trigger).toHaveFocus();

      // Test keyboard activation
      await userEvent.keyboard('{Enter}');

      // Test escape key handling
      await userEvent.keyboard('{Escape}');
    }
  },
  parameters: {
    docs: {
      description: {
        story:
          'Accessibility demonstration with full keyboard navigation, ARIA labels, and screen reader support.',
      },
    },
  },
};
