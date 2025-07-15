// Centralized communication service mocks for all tests in the monorepo
import { vi } from 'vitest';

// Mock Resend - Updated to match actual Resend API response format
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({
        data: {
          id: 'mock-email-id',
          from: 'noreply@example.com',
          to: ['user@example.com'],
          created_at: new Date().toISOString(),
        },
        error: null,
      }),
      get: vi.fn().mockResolvedValue({
        data: {
          id: 'mock-email-id',
          object: 'email',
          to: ['user@example.com'],
          from: 'noreply@example.com',
          created_at: new Date().toISOString(),
          subject: 'Test Email',
          html: '<p>Test</p>',
          text: 'Test',
          bcc: null,
          cc: null,
          reply_to: null,
          last_event: 'delivered',
        },
        error: null,
      }),
      create: vi.fn().mockResolvedValue({
        data: { id: 'mock-email-id' },
        error: null,
      }),
      update: vi.fn().mockResolvedValue({
        data: { id: 'mock-email-id', object: 'email' },
        error: null,
      }),
      list: vi.fn().mockResolvedValue({
        data: { data: [], next: null },
        error: null,
      }),
      cancel: vi.fn().mockResolvedValue({
        data: { id: 'mock-email-id', object: 'email' },
        error: null,
      }),
    },
    audiences: {
      create: vi.fn().mockResolvedValue({ id: 'mock-audience-id', object: 'audience' }),
      list: vi.fn().mockResolvedValue({ data: [], next: null }),
      get: vi.fn().mockResolvedValue({ id: 'mock-audience-id', object: 'audience' }),
      delete: vi
        .fn()
        .mockResolvedValue({ id: 'mock-audience-id', object: 'audience', deleted: true }),
    },
    contacts: {
      create: vi.fn().mockResolvedValue({ id: 'mock-contact-id', object: 'contact' }),
      update: vi.fn().mockResolvedValue({ id: 'mock-contact-id', object: 'contact' }),
      list: vi.fn().mockResolvedValue({ data: [], next: null }),
      get: vi.fn().mockResolvedValue({ id: 'mock-contact-id', object: 'contact' }),
      delete: vi
        .fn()
        .mockResolvedValue({ id: 'mock-contact-id', object: 'contact', deleted: true }),
    },
    domains: {
      create: vi.fn().mockResolvedValue({ id: 'mock-domain-id', object: 'domain' }),
      list: vi.fn().mockResolvedValue({ data: [], next: null }),
      get: vi.fn().mockResolvedValue({ id: 'mock-domain-id', object: 'domain' }),
      update: vi.fn().mockResolvedValue({ id: 'mock-domain-id', object: 'domain' }),
      delete: vi.fn().mockResolvedValue({ id: 'mock-domain-id', object: 'domain', deleted: true }),
      verify: vi.fn().mockResolvedValue({ object: 'domain', id: 'mock-domain-id' }),
    },
    apiKeys: {
      create: vi.fn().mockResolvedValue({ id: 'mock-api-key-id', token: 'mock-token' }),
      list: vi.fn().mockResolvedValue({ data: [] }),
      delete: vi.fn().mockResolvedValue({ id: 'mock-api-key-id', name: 'Mock Key' }),
    },
  })),
}));

// Mock React Email
vi.mock('@react-email/render', () => ({
  render: vi.fn().mockResolvedValue('<html><body>Rendered Email</body></html>'),
  renderAsync: vi.fn().mockResolvedValue('<html><body>Rendered Email</body></html>'),
}));

// Mock Knock
vi.mock('@knocklabs/node', () => ({
  Knock: vi.fn().mockImplementation(() => ({
    notify: vi.fn().mockResolvedValue({
      workflow_run_id: 'mock-workflow-run-id',
    }),
    workflows: {
      trigger: vi.fn().mockResolvedValue({
        workflow_run_id: 'mock-workflow-run-id',
      }),
      cancel: vi.fn().mockResolvedValue({ status: 'canceled' }),
    },
    users: {
      identify: vi.fn().mockResolvedValue({ id: 'mock-user-id' }),
      get: vi.fn().mockResolvedValue({ id: 'mock-user-id', email: 'user@example.com' }),
      delete: vi.fn().mockResolvedValue({ id: 'mock-user-id' }),
      merge: vi.fn().mockResolvedValue({ id: 'mock-user-id' }),
      setChannelData: vi.fn().mockResolvedValue({ id: 'mock-user-id' }),
      getChannelData: vi.fn().mockResolvedValue({ channel_id: 'mock-channel', data: {} }),
      unsetChannelData: vi.fn().mockResolvedValue({ id: 'mock-user-id' }),
    },
    preferences: {
      set: vi.fn().mockResolvedValue({ preferences: {} }),
      get: vi.fn().mockResolvedValue({ preferences: {} }),
      update: vi.fn().mockResolvedValue({ preferences: {} }),
    },
    messages: {
      list: vi.fn().mockResolvedValue({ items: [], page_info: {} }),
      get: vi.fn().mockResolvedValue({ id: 'mock-message-id' }),
      updateStatus: vi.fn().mockResolvedValue({ id: 'mock-message-id' }),
      batchUpdateStatus: vi.fn().mockResolvedValue({ ids: [] }),
      deleteMessage: vi.fn().mockResolvedValue({ id: 'mock-message-id' }),
    },
    feeds: {
      get: vi.fn().mockResolvedValue({ entries: [], page_info: {} }),
    },
    objects: {
      set: vi.fn().mockResolvedValue({ id: 'mock-object-id' }),
      get: vi.fn().mockResolvedValue({ id: 'mock-object-id', collection: 'mock-collection' }),
      delete: vi.fn().mockResolvedValue({ id: 'mock-object-id' }),
      bulkSet: vi.fn().mockResolvedValue({ objects: [] }),
      bulkDelete: vi.fn().mockResolvedValue({ objects: [] }),
    },
  })),
}));

// Conditionally import React only if available
let React: any;
try {
  React = require('react');
} catch {
  // Create a minimal React substitute for non-React environments
  React = {
    createElement: (type: any, props: any, ...children: any[]) => ({
      type,
      props: { ...props, children: children.length === 1 ? children[0] : children },
    }),
  };
}

// Mock Knock React
vi.mock('@knocklabs/react', () => ({
  KnockProvider: ({ children, 'data-testid': testId, ...props }: any) =>
    React.createElement(
      'div',
      {
        ...props,
        'data-testid': testId || 'knock-provider',
      },
      children,
    ),
  useKnockClient: vi.fn(() => ({
    authenticate: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: vi.fn(() => true),
  })),
  useNotifications: vi.fn(() => ({
    items: [],
    metadata: {
      unread_count: 0,
      unseen_count: 0,
      total_count: 0,
    },
    isLoading: false,
    error: null,
    refresh: vi.fn(),
    markAsRead: vi.fn(),
    markAsSeen: vi.fn(),
    markAsArchived: vi.fn(),
  })),
  useNotificationStore: vi.fn(() => ({
    items: [],
    unreadCount: 0,
    unseenCount: 0,
    totalCount: 0,
    networkStatus: 'idle',
  })),
  NotificationFeedPopover: ({ children, 'data-testid': testId, ...props }: any) =>
    React.createElement(
      'div',
      {
        ...props,
        'data-testid': testId || 'notification-feed-popover',
      },
      children,
    ),
  NotificationIconButton: ({ 'data-testid': testId, ...props }: any) =>
    React.createElement('button', {
      ...props,
      'data-testid': testId || 'notification-icon-button',
    }),
}));

// Export helper functions
export const mockEmailPayload = (overrides = {}) => ({
  from: 'noreply@example.com',
  to: ['user@example.com'],
  subject: 'Test Email',
  html: '<p>Test email content</p>',
  text: 'Test email content',
  ...overrides,
});

export const mockKnockNotification = (overrides = {}) => ({
  id: 'mock-notification-id',
  channel_id: 'in-app',
  recipient: {
    id: 'mock-user-id',
    email: 'user@example.com',
  },
  workflow: 'test-workflow',
  tenant: null,
  status: 'unread',
  read_at: null,
  seen_at: null,
  archived_at: null,
  inserted_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  source: {},
  data: {},
  ...overrides,
});

export const resetCommunicationMocks = () => {
  vi.clearAllMocks();
};

// Email test scenario helpers for @repo/email package
export const createEmailTestScenarios = () => ({
  /**
   * Configure successful email sending by ensuring valid environment
   */
  emailSendingSuccess: () => {
    // Ensure environment variables are set for successful operation
    vi.stubEnv('RESEND_TOKEN', 'test-resend-token');
    vi.stubEnv('RESEND_FROM', 'noreply@example.com');
  },

  /**
   * Configure email sending failure by setting invalid API token
   */
  emailSendingFailure: (errorMessage = 'Email sending failed') => {
    // Mock environment to have invalid token to trigger failure paths
    vi.stubEnv('RESEND_TOKEN', '');
    vi.stubEnv('RESEND_FROM', 'noreply@example.com');
  },

  /**
   * Configure template rendering failure by setting invalid email data
   */
  templateRenderingFailure: (errorMessage = 'Template rendering failed') => {
    // Mock environment to have invalid email format to trigger template failure paths
    vi.stubEnv('RESEND_FROM', 'invalid-email');
  },

  /**
   * Configure missing environment variables
   */
  missingEnvironmentVariables: () => {
    // Use vi.stubEnv for more reliable environment variable mocking
    vi.stubEnv('RESEND_FROM', '');
    vi.stubEnv('RESEND_TOKEN', '');
  },

  /**
   * Configure partial environment variables
   */
  partialEnvironmentVariables: (config: { RESEND_FROM?: string; RESEND_TOKEN?: string }) => {
    // Use vi.stubEnv for more reliable environment variable mocking
    if (config.RESEND_FROM) {
      vi.stubEnv('RESEND_FROM', config.RESEND_FROM);
    }
    if (config.RESEND_TOKEN !== undefined) {
      vi.stubEnv('RESEND_TOKEN', config.RESEND_TOKEN);
    }
  },

  /**
   * Configure rate limiting scenario by setting invalid token
   */
  rateLimitExceeded: () => {
    // Mock environment to trigger rate limit error paths
    vi.stubEnv('RESEND_TOKEN', '');
  },

  /**
   * Configure authentication failure by setting invalid token
   */
  authenticationFailure: () => {
    // Mock environment to trigger authentication error paths
    vi.stubEnv('RESEND_TOKEN', '');
  },

  /**
   * Configure network timeout by setting invalid token
   */
  networkTimeout: () => {
    // Mock environment to trigger network timeout error paths
    vi.stubEnv('RESEND_TOKEN', '');
  },
});

// Email test data generators
export const createEmailTestData = () => ({
  /**
   * Creates valid mock data for different email types
   */
  createValidMockData: (type: string, overrides: any = {}) => {
    const baseData = {
      email: 'test@example.com',
      name: 'Test User',
      ...overrides,
    };

    switch (type) {
      case 'magicLink':
        return {
          ...baseData,
          expiresIn: '30 minutes',
          magicLink: 'https://example.com/magic?token=abc123',
        };
      case 'verification':
        return {
          ...baseData,
          verificationLink: 'https://example.com/verify?token=abc123',
        };
      case 'passwordReset':
        return {
          ...baseData,
          resetLink: 'https://example.com/reset?token=abc123',
        };
      case 'otp':
        return {
          ...baseData,
          otp: '123456',
          purpose: 'login verification',
        };
      case 'contact':
        return {
          ...baseData,
          message: 'Test message',
          to: 'support@example.com',
        };
      case 'organizationInvitation':
        return {
          ...baseData,
          expiresIn: '72 hours',
          inviteLink: 'https://example.com/invite?token=abc123',
          inviterEmail: 'admin@example.com',
          inviterName: 'Admin User',
          organizationName: 'Test Org',
        };
      case 'welcome':
        return {
          ...baseData,
          dashboardUrl: 'https://app.example.com/dashboard',
          organizationName: 'Test Org',
        };
      case 'apiKeyCreated':
        return {
          ...baseData,
          apiKeyId: 'ak_123456789',
          apiKeyName: 'Test API Key',
          dashboardUrl: 'https://app.example.com/api-keys',
        };
      default:
        return baseData;
    }
  },
});
