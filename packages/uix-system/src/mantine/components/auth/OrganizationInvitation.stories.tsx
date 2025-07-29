import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import {
  OrganizationInvitation,
  OrganizationInvitationAlert,
  type Invitation,
  type InvitationAlert,
} from './OrganizationInvitation';

const mockInvitation: Invitation = {
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
    logo: 'https://via.placeholder.com/64',
    memberCount: 42,
  },
  inviter: {
    id: 'user-1',
    name: 'John Smith',
    email: 'john.smith@acme.com',
    image: 'https://avatars.githubusercontent.com/u/1?v=4',
  },
};

const mockExpiredInvitation: Invitation = {
  ...mockInvitation,
  id: 'invitation-expired',
  expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
};

const OrganizationInvitationWrapper = (props: any) => {
  const [status, setStatus] = useState<'loading' | 'found' | 'error' | 'accepted' | 'rejected'>(
    props.status || 'found',
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoadInvitation = async (invitationId: string): Promise<Invitation> => {
    console.log('Loading invitation:', invitationId);
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (invitationId === 'invalid') {
      throw new Error('Invitation not found');
    }

    setLoading(false);
    return mockInvitation;
  };

  const handleAccept = async (invitation: Invitation) => {
    console.log('Accepting invitation:', invitation.id);
    setLoading(true);
    setError(null);

    await new Promise(resolve => setTimeout(resolve, 1500));

    if (invitation.id === 'invitation-error') {
      throw new Error('Failed to accept invitation');
    }

    setStatus('accepted');
    setLoading(false);
  };

  const handleReject = async (invitation: Invitation) => {
    console.log('Rejecting invitation:', invitation.id);
    setLoading(true);
    setError(null);

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (invitation.id === 'invitation-error') {
      throw new Error('Failed to reject invitation');
    }

    setStatus('rejected');
    setLoading(false);
  };

  const handleError = (error: Error) => {
    console.error('Invitation error:', error.message);
    setError(error.message);
  };

  const handleNavigate = (path: string) => {
    console.log('Navigating to:', path);
  };

  return (
    <OrganizationInvitation
      {...props}
      status={status}
      loading={loading}
      error={error}
      onLoadInvitation={handleLoadInvitation}
      onAccept={handleAccept}
      onReject={handleReject}
      onError={handleError}
      onNavigate={handleNavigate}
    />
  );
};

const meta: Meta<typeof OrganizationInvitation> = {
  title: 'Auth/Organizations/OrganizationInvitation',
  component: OrganizationInvitationWrapper,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['loading', 'found', 'error', 'accepted', 'rejected'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    invitation: mockInvitation,
    status: 'found',
  },
};

export const Loading: Story = {
  args: {
    status: 'loading',
  },
};

export const Accepted: Story = {
  args: {
    invitation: mockInvitation,
    status: 'accepted',
  },
};

export const Rejected: Story = {
  args: {
    invitation: mockInvitation,
    status: 'rejected',
  },
};

export const Error: Story = {
  args: {
    status: 'error',
    error: 'This invitation link is invalid or has expired',
  },
};

export const ExpiredInvitation: Story = {
  args: {
    invitation: mockExpiredInvitation,
    status: 'found',
  },
};

export const CustomTexts: Story = {
  args: {
    invitation: mockInvitation,
    status: 'found',
    invitationTitle: 'Join Our Team',
    acceptButtonText: 'Join Now',
    rejectButtonText: 'No Thanks',
    loadingTitle: 'Fetching invitation details...',
    acceptedTitle: 'Welcome aboard {{organizationName}}!',
    rejectedTitle: 'Maybe next time',
  },
};

export const WithoutMemberCount: Story = {
  args: {
    invitation: {
      ...mockInvitation,
      organization: {
        ...mockInvitation.organization,
        memberCount: undefined,
      },
    },
    status: 'found',
  },
};

export const AdminRole: Story = {
  args: {
    invitation: {
      ...mockInvitation,
      role: 'admin',
    },
    status: 'found',
  },
};

export const NoInviterName: Story = {
  args: {
    invitation: {
      ...mockInvitation,
      inviter: {
        ...mockInvitation.inviter,
        name: undefined,
      },
    },
    status: 'found',
  },
};

export const ErrorDemo: Story = {
  args: {
    invitation: {
      ...mockInvitation,
      id: 'invitation-error',
    },
    status: 'found',
  },
  parameters: {
    docs: {
      description: {
        story:
          'This story demonstrates error handling. Try accepting or rejecting the invitation to trigger a simulated error.',
      },
    },
  },
};

// Alert component stories
const mockAlerts: InvitationAlert[] = [
  {
    id: 'alert-1',
    organizationName: 'Tech Startup Inc.',
    inviterName: 'Sarah Johnson',
    role: 'developer',
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'alert-2',
    organizationName: 'Design Agency',
    role: 'designer',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
];

const AlertWrapper = (props: any) => {
  const [alerts, setAlerts] = useState<InvitationAlert[]>(props.invitations || []);

  const handleViewInvitation = (invitationId: string) => {
    console.log('Viewing invitation:', invitationId);
  };

  const handleDismiss = (invitationId: string) => {
    console.log('Dismissing invitation:', invitationId);
    setAlerts(prev => prev.filter(alert => alert.id !== invitationId));
  };

  return (
    <OrganizationInvitationAlert
      {...props}
      invitations={alerts}
      onViewInvitation={handleViewInvitation}
      onDismiss={handleDismiss}
    />
  );
};

export const InvitationAlerts: Story = {
  render: () => <AlertWrapper invitations={mockAlerts} />,
  parameters: {
    docs: {
      description: {
        story: 'Alert component for showing pending invitations in a notification style.',
      },
    },
  },
};

export const SingleAlert: Story = {
  render: () => <AlertWrapper invitations={[mockAlerts[0]]} />,
};

export const AlertWithoutDismiss: Story = {
  render: () => (
    <OrganizationInvitationAlert
      invitations={mockAlerts}
      onViewInvitation={id => console.log('View:', id)}
    />
  ),
};

export const EmptyAlerts: Story = {
  render: () => (
    <OrganizationInvitationAlert
      invitations={[]}
      onViewInvitation={id => console.log('View:', id)}
      onDismiss={id => console.log('Dismiss:', id)}
    />
  ),
};
