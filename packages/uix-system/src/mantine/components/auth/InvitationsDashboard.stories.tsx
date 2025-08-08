import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { InvitationsDashboard } from './InvitationsDashboard';
import { Invitation } from './OrganizationInvitation';

const mockInvitations: Invitation[] = [
  {
    id: 'invitation-1',
    email: 'user@example.com',
    role: 'member',
    status: 'pending',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    organizationId: 'org-1',
    organization: {
      id: 'org-1',
      name: 'Acme Corporation',
      slug: 'acme-corp',
      memberCount: 42,
    },
    inviter: {
      id: 'user-1',
      name: 'John Smith',
      email: 'john.smith@acme.com',
      image: 'https://avatars.githubusercontent.com/u/1?v=4',
    },
  },
  {
    id: 'invitation-2',
    email: 'user@example.com',
    role: 'admin',
    status: 'pending',
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    organizationId: 'org-2',
    organization: {
      id: 'org-2',
      name: 'Tech Startup Inc.',
      slug: 'tech-startup',
      memberCount: 15,
    },
    inviter: {
      id: 'user-2',
      name: 'Sarah Johnson',
      email: 'sarah@techstartup.com',
    },
  },
  {
    id: 'invitation-3',
    email: 'user@example.com',
    role: 'designer',
    status: 'pending',
    expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    organizationId: 'org-3',
    organization: {
      id: 'org-3',
      name: 'Design Agency',
      slug: 'design-agency',
      memberCount: 8,
    },
    inviter: {
      id: 'user-3',
      name: 'Mike Wilson',
      email: 'mike@designagency.com',
      image: 'https://avatars.githubusercontent.com/u/3?v=4',
    },
  },
];

const InvitationsDashboardWrapper = (props: any) => {
  const [invitations, setInvitations] = useState<Invitation[]>(props.invitations || []);
  const [loading, setLoading] = useState(false);

  const handleLoadInvitations = async (organizationId?: string): Promise<Invitation[]> => {
    // console.log('Loading invitations for organization:', organizationId);
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    setLoading(false);
    return mockInvitations;
  };

  const handleAcceptInvitation = async (invitation: Invitation) => {
    // console.log('Accepting invitation:', invitation.id);

    await new Promise(resolve => setTimeout(resolve, 1500));

    if (invitation.id === 'invitation-2') {
      throw new Error('Failed to accept invitation');
    }

    // console.log('Invitation accepted successfully');
  };

  const handleRejectInvitation = async (invitation: Invitation) => {
    // console.log('Rejecting invitation:', invitation.id);

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (invitation.id === 'invitation-2') {
      throw new Error('Failed to reject invitation');
    }

    // console.log('Invitation rejected successfully');
  };

  const handleInvitationUpdate = () => {
    // console.log('Invitation updated, refreshing data...');
  };

  const handleError = (error: Error) => {
    // console.error('Dashboard error:', error.message);
  };

  return (
    <InvitationsDashboard
      {...props}
      invitations={invitations}
      loading={loading}
      onLoadInvitations={handleLoadInvitations}
      onAcceptInvitation={handleAcceptInvitation}
      onRejectInvitation={handleRejectInvitation}
      onInvitationUpdate={handleInvitationUpdate}
      onError={handleError}
    />
  );
};

const meta: Meta<typeof InvitationsDashboard> = {
  title: 'Auth/Organizations/InvitationsDashboard',
  component: InvitationsDashboardWrapper,
  parameters: {
    layout: 'centered',
    viewport: {
      defaultViewport: 'responsive',
    },
  },
  tags: ['autodocs'],
  argTypes: {
    loading: { control: 'boolean' },
    error: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    invitations: mockInvitations,
  },
};

export const Loading: Story = {
  args: {
    invitations: mockInvitations,
    loading: true,
  },
};

export const EmptyState: Story = {
  args: {
    invitations: [],
  },
};

export const SingleInvitation: Story = {
  args: {
    invitations: [mockInvitations[0]],
  },
};

export const CustomTexts: Story = {
  args: {
    invitations: mockInvitations,
    title: 'Team Invitations',
    subtitle: 'Review and respond to team invitations',
    emptyStateTitle: 'No team invitations',
    emptyStateSubtitle: 'You currently have no pending team invitations.',
    acceptButtonText: 'Join Team',
    rejectButtonText: 'Pass',
    refreshLabel: 'Refresh invitations',
  },
};

export const WithOrganizationFilter: Story = {
  args: {
    invitations: mockInvitations.slice(0, 1), // Only show invitations for one org
    organizationId: 'org-1',
    title: 'Acme Corporation Invitations',
    subtitle: 'Invitations for this specific organization',
  },
};

export const ManyInvitations: Story = {
  args: {
    invitations: [
      ...mockInvitations,
      ...mockInvitations.map((inv, index) => ({
        ...inv,
        id: `invitation-${index + 4}`,
        organization: {
          ...inv.organization,
          id: `org-${index + 4}`,
          name: `Organization ${index + 4}`,
        },
      })),
    ],
  },
};

export const InvitationsWithoutImages: Story = {
  args: {
    invitations: mockInvitations.map(inv => ({
      ...inv,
      inviter: {
        ...inv.inviter,
        image: undefined,
      },
    })),
  },
};

export const ExpiringInvitations: Story = {
  args: {
    invitations: [
      {
        ...mockInvitations[0],
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
      },
      {
        ...mockInvitations[1],
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows invitations that are expiring soon (within hours).',
      },
    },
  },
};

export const CustomFormatting: Story = {
  args: {
    invitations: mockInvitations,
    formatExpirationDate: (expiresAt: string) => {
      const date = new Date(expiresAt);
      return `Until ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
    },
    getInitials: (name?: string, email?: string) => {
      if (name) {
        return name
          .split('')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 3);
      }
      return email?.slice(0, 2).toUpperCase() || '??';
    },
  },
};

export const ErrorDemo: Story = {
  args: {
    invitations: mockInvitations,
    title: 'Invitations (Error Demo)',
    subtitle: 'Try accepting or rejecting the "Tech Startup Inc." invitation to see error handling',
  },
  parameters: {
    docs: {
      description: {
        story:
          'This story demonstrates error handling. Try accepting or rejecting the "Tech Startup Inc." invitation (ID: invitation-2) to trigger a simulated error.',
      },
    },
  },
};

export const LoadFromAPI: Story = {
  args: {
    // Don't provide invitations prop - will trigger API load
    organizationId: 'org-123',
    title: 'API Loaded Invitations',
    subtitle: 'These invitations are loaded from a mock API call',
  },
  parameters: {
    docs: {
      description: {
        story:
          'This story demonstrates loading invitations from an API. The component will call onLoadInvitations when mounted.',
      },
    },
  },
};
