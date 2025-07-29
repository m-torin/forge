import type { Meta, StoryObj } from '@storybook/nextjs';
import { SessionsList, type Session } from './SessionsList';

const mockSessions: Session[] = [
  {
    id: '1',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    ipAddress: '192.168.1.1',
    location: 'San Francisco, CA',
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    isCurrent: true,
    device: {
      type: 'desktop',
      browser: 'Chrome',
      os: 'macOS',
    },
  },
  {
    id: '2',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    ipAddress: '10.0.0.2',
    location: 'New York, NY',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isCurrent: false,
    device: {
      type: 'mobile',
      browser: 'Safari',
      os: 'iOS',
    },
  },
  {
    id: '3',
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
    ipAddress: '172.16.0.1',
    location: 'London, UK',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastActiveAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isCurrent: false,
    device: {
      type: 'tablet',
      browser: 'Safari',
      os: 'iPadOS',
    },
  },
];

const meta: Meta<typeof SessionsList> = {
  title: 'Auth/Sessions/SessionsList',
  component: SessionsList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    loading: { control: 'boolean' },
    error: { control: 'text' },
    showSecurityNotice: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock handler
const mockRevoke = async (session: Session) => {
  console.log('Revoking session:', session.id);
  await new Promise(resolve => setTimeout(resolve, 1000));
  if (session.id === '2') {
    throw new Error('Failed to revoke session');
  }
};

const mockRevoked = () => {
  console.log('Session revoked successfully');
};

const mockError = (error: Error) => {
  console.error('Session error:', error.message);
};

export const Default: Story = {
  args: {
    sessions: mockSessions,
    onSessionRevoke: mockRevoke,
    onSessionRevoked: mockRevoked,
    onError: mockError,
  },
};

export const Loading: Story = {
  args: {
    sessions: mockSessions,
    loading: true,
    onSessionRevoke: mockRevoke,
    onSessionRevoked: mockRevoked,
    onError: mockError,
  },
};

export const WithError: Story = {
  args: {
    sessions: mockSessions,
    error: 'Failed to load sessions. Please try again.',
    onSessionRevoke: mockRevoke,
    onSessionRevoked: mockRevoked,
    onError: mockError,
  },
};

export const EmptyState: Story = {
  args: {
    sessions: [],
    onSessionRevoke: mockRevoke,
    onSessionRevoked: mockRevoked,
    onError: mockError,
  },
};

export const CustomTexts: Story = {
  args: {
    sessions: mockSessions,
    title: 'Device Sessions',
    subtitle: 'Monitor and control access to your account from different devices',
    emptyStateTitle: 'No devices connected',
    emptyStateDescription: 'You currently have no active device sessions',
    securityNoticeText:
      'Always review unfamiliar sessions and revoke suspicious access immediately.',
    currentSessionLabel: 'This Device',
    revokeButtonLabel: 'Remove Access',
    onSessionRevoke: mockRevoke,
    onSessionRevoked: mockRevoked,
    onError: mockError,
  },
};

export const NoSecurityNotice: Story = {
  args: {
    sessions: mockSessions,
    showSecurityNotice: false,
    onSessionRevoke: mockRevoke,
    onSessionRevoked: mockRevoked,
    onError: mockError,
  },
};

export const SingleCurrentSession: Story = {
  args: {
    sessions: [mockSessions[0]],
    onSessionRevoke: mockRevoke,
    onSessionRevoked: mockRevoked,
    onError: mockError,
  },
};

export const CustomDateFormat: Story = {
  args: {
    sessions: mockSessions,
    formatDate: (dateString: string) => {
      return `Last seen: ${new Date(dateString).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    },
    onSessionRevoke: mockRevoke,
    onSessionRevoked: mockRevoked,
    onError: mockError,
  },
};

export const ErrorDemo: Story = {
  args: {
    sessions: mockSessions,
    title: 'Sessions (Error Demo)',
    onSessionRevoke: mockRevoke,
    onSessionRevoked: mockRevoked,
    onError: mockError,
  },
  parameters: {
    docs: {
      description: {
        story:
          'This story demonstrates error handling. Try revoking the mobile session (ID: 2) to trigger a simulated error.',
      },
    },
  },
};
