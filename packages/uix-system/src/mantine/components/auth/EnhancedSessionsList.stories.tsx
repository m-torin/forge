import type { Meta, StoryObj } from '@storybook/nextjs';
import { EnhancedSessionsList } from './EnhancedSessionsList';
import { BulkActionResult, EnhancedSession } from './types/session';

const mockEnhancedSessions: EnhancedSession[] = [
  {
    id: '1',
    userId: 'user-1',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    isCurrent: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    device: {
      type: 'desktop',
      browser: 'Chrome',
      browserVersion: '120.0',
      os: 'macOS',
      osVersion: '14.0',
    },
    location: {
      ip: '192.168.1.1',
      country: 'United States',
      region: 'California',
      city: 'San Francisco',
      timezone: 'PST',
    },
    security: {
      riskLevel: 'low',
      riskScore: 15,
      riskFactors: [],
      isFirstTimeLocation: false,
      isUnusualTime: false,
      hasSecureConnection: true,
      isTrustedDevice: true,
      failedLoginAttempts: 0,
    },
    metrics: {
      duration: 3600,
      pageViews: 50,
      requestCount: 200,
      dataTransferred: 1024 * 1024,
      idleTime: 300,
      activityLevel: 'high',
    },
    recentActivity: [],
    metadata: {},
  },
  {
    id: '2',
    userId: 'user-1',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    isCurrent: false,
    isActive: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    device: {
      type: 'mobile',
      browser: 'Safari',
      browserVersion: '14.0',
      os: 'iOS',
      osVersion: '17.0',
    },
    location: {
      ip: '10.0.0.2',
      country: 'Canada',
      region: 'Ontario',
      city: 'Toronto',
      timezone: 'EST',
    },
    security: {
      riskLevel: 'medium',
      riskScore: 45,
      riskFactors: ['New location'],
      isFirstTimeLocation: true,
      isUnusualTime: false,
      hasSecureConnection: true,
      isTrustedDevice: true,
      failedLoginAttempts: 0,
    },
    metrics: {
      duration: 7200,
      pageViews: 100,
      requestCount: 400,
      dataTransferred: 2 * 1024 * 1024,
      idleTime: 600,
      activityLevel: 'medium',
    },
    recentActivity: [],
    metadata: {},
  },
  {
    id: '3',
    userId: 'user-1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    isCurrent: false,
    isActive: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastActiveAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    device: {
      type: 'desktop',
      browser: 'Firefox',
      browserVersion: '118.0',
      os: 'Windows',
      osVersion: '11',
    },
    location: {
      ip: '172.16.0.1',
      country: 'United Kingdom',
      region: 'London',
      city: 'London',
      timezone: 'GMT',
    },
    security: {
      riskLevel: 'high',
      riskScore: 75,
      riskFactors: ['New location', 'Unusual time'],
      isFirstTimeLocation: true,
      isUnusualTime: true,
      hasSecureConnection: true,
      isTrustedDevice: false,
      failedLoginAttempts: 2,
    },
    metrics: {
      duration: 10800,
      pageViews: 150,
      requestCount: 600,
      dataTransferred: 3 * 1024 * 1024,
      idleTime: 900,
      activityLevel: 'low',
    },
    recentActivity: [],
    metadata: {},
  },
];

const meta: Meta<typeof EnhancedSessionsList> = {
  title: 'Auth/Sessions/EnhancedSessionsList',
  component: EnhancedSessionsList,
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
    showBulkActions: { control: 'boolean' },
    pageSize: { control: 'number', min: 5, max: 50 },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock handlers
const mockSessionRevoke = async (session: EnhancedSession) => {
  // console.log('Revoking session:', session.id);
  await new Promise(resolve => setTimeout(resolve, 1000));
  if (session.id === '2') {
    throw new Error('Failed to revoke session');
  }
};

const mockBulkRevoke = async (sessionIds: string[]): Promise<BulkActionResult> => {
  // console.log('Bulk revoking sessions:', sessionIds);
  await new Promise(resolve => setTimeout(resolve, 2000));

  return {
    total: sessionIds.length,
    succeeded: sessionIds.length - 1,
    failed: 1,
    errors: sessionIds.includes('2')
      ? [{ sessionId: '2', error: 'Session could not be revoked' }]
      : [],
  };
};

const mockRevokeAllOthers = async (): Promise<BulkActionResult> => {
  // console.log('Revoking all other sessions');
  await new Promise(resolve => setTimeout(resolve, 1500));

  return {
    total: 2,
    succeeded: 2,
    failed: 0,
  };
};

const mockSessionsLoad = async (): Promise<EnhancedSession[]> => {
  // console.log('Loading sessions');
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockEnhancedSessions;
};

const mockSessionRevoked = () => {
  // console.log('Session revoked successfully');
};

const mockError = (error: Error) => {
  // console.error('Enhanced sessions error:', error.message);
};

export const Default: Story = {
  args: {
    sessions: mockEnhancedSessions,
    onSessionRevoke: mockSessionRevoke,
    onBulkRevoke: mockBulkRevoke,
    onRevokeAllOthers: mockRevokeAllOthers,
    onSessionsLoad: mockSessionsLoad,
    onSessionRevoked: mockSessionRevoked,
    onError: mockError,
  },
};

export const Loading: Story = {
  args: {
    sessions: mockEnhancedSessions,
    loading: true,
    onSessionRevoke: mockSessionRevoke,
    onBulkRevoke: mockBulkRevoke,
    onRevokeAllOthers: mockRevokeAllOthers,
    onSessionsLoad: mockSessionsLoad,
    onSessionRevoked: mockSessionRevoked,
    onError: mockError,
  },
};

export const WithError: Story = {
  args: {
    sessions: mockEnhancedSessions,
    error: 'Failed to load sessions. Please check your connection and try again.',
    onSessionRevoke: mockSessionRevoke,
    onBulkRevoke: mockBulkRevoke,
    onRevokeAllOthers: mockRevokeAllOthers,
    onSessionsLoad: mockSessionsLoad,
    onSessionRevoked: mockSessionRevoked,
    onError: mockError,
  },
};

export const EmptyState: Story = {
  args: {
    sessions: [],
    onSessionRevoke: mockSessionRevoke,
    onBulkRevoke: mockBulkRevoke,
    onRevokeAllOthers: mockRevokeAllOthers,
    onSessionsLoad: mockSessionsLoad,
    onSessionRevoked: mockSessionRevoked,
    onError: mockError,
  },
};

export const NoBulkActions: Story = {
  args: {
    sessions: mockEnhancedSessions,
    showBulkActions: false,
    onSessionRevoke: mockSessionRevoke,
    onBulkRevoke: mockBulkRevoke,
    onRevokeAllOthers: mockRevokeAllOthers,
    onSessionsLoad: mockSessionsLoad,
    onSessionRevoked: mockSessionRevoked,
    onError: mockError,
  },
};

export const SmallPageSize: Story = {
  args: {
    sessions: mockEnhancedSessions,
    pageSize: 2,
    onSessionRevoke: mockSessionRevoke,
    onBulkRevoke: mockBulkRevoke,
    onRevokeAllOthers: mockRevokeAllOthers,
    onSessionsLoad: mockSessionsLoad,
    onSessionRevoked: mockSessionRevoked,
    onError: mockError,
  },
};

export const CustomTexts: Story = {
  args: {
    sessions: mockEnhancedSessions,
    title: 'Device Management',
    subtitle: 'Monitor and control all connected devices',
    emptyStateTitle: 'No devices found',
    emptyStateDescription: 'No devices match your current filters',
    filtersTitle: 'Device Filters',
    sessionDetailsTitle: 'Device Information',
    selectAllLabel: 'Select all devices',
    clearSelectionLabel: 'Clear selection',
    revokeSelectedLabel: 'Remove selected',
    revokeAllOthersLabel: 'Remove all other devices',
    actionsLabel: 'Device Actions',
    refreshLabel: 'Refresh devices',
    filtersLabel: 'Filter devices',
    onSessionRevoke: mockSessionRevoke,
    onBulkRevoke: mockBulkRevoke,
    onRevokeAllOthers: mockRevokeAllOthers,
    onSessionsLoad: mockSessionsLoad,
    onSessionRevoked: mockSessionRevoked,
    onError: mockError,
  },
};

export const CustomFormatting: Story = {
  args: {
    sessions: mockEnhancedSessions,
    formatDate: (dateString: string) => {
      const date = new Date(dateString);
      return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
    },
    getRiskColor: (level: string) => {
      switch (level) {
        case 'low':
          return 'blue';
        case 'medium':
          return 'orange';
        case 'high':
          return 'pink';
        case 'critical':
          return 'dark';
        default:
          return 'gray';
      }
    },
    onSessionRevoke: mockSessionRevoke,
    onBulkRevoke: mockBulkRevoke,
    onRevokeAllOthers: mockRevokeAllOthers,
    onSessionsLoad: mockSessionsLoad,
    onSessionRevoked: mockSessionRevoked,
    onError: mockError,
  },
};

export const HighRiskSession: Story = {
  args: {
    sessions: [
      {
        ...mockEnhancedSessions[0],
        isCurrent: true,
      },
      {
        ...mockEnhancedSessions[2],
        security: {
          ...mockEnhancedSessions[2].security,
          riskLevel: 'critical' as const,
          riskScore: 95,
          riskFactors: [
            'Suspicious activity',
            'Multiple failed logins',
            'VPN detected',
            'Unknown device',
          ],
        },
      },
    ],
    onSessionRevoke: mockSessionRevoke,
    onBulkRevoke: mockBulkRevoke,
    onRevokeAllOthers: mockRevokeAllOthers,
    onSessionsLoad: mockSessionsLoad,
    onSessionRevoked: mockSessionRevoked,
    onError: mockError,
  },
};

export const ErrorDemo: Story = {
  args: {
    sessions: mockEnhancedSessions,
    title: 'Sessions (Error Demo)',
    subtitle: 'Try revoking the mobile session or bulk actions to see error handling',
    onSessionRevoke: mockSessionRevoke,
    onBulkRevoke: mockBulkRevoke,
    onRevokeAllOthers: mockRevokeAllOthers,
    onSessionsLoad: mockSessionsLoad,
    onSessionRevoked: mockSessionRevoked,
    onError: mockError,
  },
  parameters: {
    docs: {
      description: {
        story:
          'This story demonstrates error handling. Try revoking the mobile session (ID: 2) or selecting it for bulk actions to trigger simulated errors.',
      },
    },
  },
};
