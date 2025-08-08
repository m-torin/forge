/**
 * Centralized mock setup for auth package tests
 * Consolidates common mocking patterns to reduce duplication
 */

import { vi } from 'vitest';
import { createMockBetterAuthApi, createMockHeaders, createMockPrisma } from './factories';

/**
 * Global mock objects that can be reused across tests
 */
export const mockPrisma = createMockPrisma();
export const mockBetterAuthApi = createMockBetterAuthApi();
export const mockHeaders = vi.fn(() => createMockHeaders());

/**
 * Apply smart authentication behavior to auth API methods
 */
export const applySmartAuthBehavior = () => {
  // Make auth API methods smart - they check for session state
  const createAuthenticatedMock = (method: any, defaultResponse: any) => {
    return method.mockImplementation(async () => {
      // Get the current session mock
      const session = await mockBetterAuthApi.getSession();

      // If no session, throw unauthorized error
      if (!session) {
        throw new Error('Unauthorized');
      }

      // If session exists, return success response
      return defaultResponse;
    });
  };

  // Apply smart behavior to all auth API methods that require authentication
  createAuthenticatedMock(mockBetterAuthApi.updateUser, { success: true });
  createAuthenticatedMock(mockBetterAuthApi.deleteUser, { success: true });
  createAuthenticatedMock(mockBetterAuthApi.createOrganization, { success: true });
  createAuthenticatedMock(mockBetterAuthApi.updateOrganization, { success: true });
  createAuthenticatedMock(mockBetterAuthApi.deleteOrganization, { success: true });
  createAuthenticatedMock(mockBetterAuthApi.getFullOrganization, { success: true });
  createAuthenticatedMock(mockBetterAuthApi.setActiveOrganization, { success: true });
  createAuthenticatedMock(mockBetterAuthApi.inviteUser, { success: true });
  createAuthenticatedMock(mockBetterAuthApi.acceptInvitation, { success: true });
  createAuthenticatedMock(mockBetterAuthApi.declineInvitation, { success: true });
  createAuthenticatedMock(mockBetterAuthApi.rejectInvitation, { success: true });
  createAuthenticatedMock(mockBetterAuthApi.cancelInvitation, { success: true });
  createAuthenticatedMock(mockBetterAuthApi.listInvitations, { success: true });
  createAuthenticatedMock(mockBetterAuthApi.addMember, { success: true });
  createAuthenticatedMock(mockBetterAuthApi.removeMember, { success: true });
  createAuthenticatedMock(mockBetterAuthApi.updateMemberRole, { success: true });
  createAuthenticatedMock(mockBetterAuthApi.createTeam, { success: true });
  createAuthenticatedMock(mockBetterAuthApi.updateTeam, { success: true });
  createAuthenticatedMock(mockBetterAuthApi.deleteTeam, { success: true });
  createAuthenticatedMock(mockBetterAuthApi.getTeam, { success: true });
  createAuthenticatedMock(mockBetterAuthApi.removeTeam, { success: true });
};

/**
 * Sets up all common mocks for auth tests
 */
export const setupCommonMocks = () => {
  // Mock server-only
  vi.mock('server-only', () => ({}));

  // Apply smart authentication behavior
  applySmartAuthBehavior();

  // Mock Better Auth core
  vi.mock('better-auth', () => ({
    betterAuth: vi.fn(() => ({
      api: mockBetterAuthApi,
      handler: vi.fn(),
      $Infer: {},
    })),
  }));

  // Mock Better Auth adapters
  vi.mock('better-auth/adapters/prisma', () => ({
    prismaAdapter: vi.fn(() => ({})),
  }));

  // Mock Better Auth plugins
  vi.mock('better-auth/plugins', () => ({
    admin: vi.fn(() => ({})),
    apiKey: vi.fn(() => ({})),
    bearer: vi.fn(() => ({})),
    csrf: vi.fn(() => ({})),
    customSession: vi.fn(() => ({})),
    emailOTP: vi.fn(() => ({})),
    genericOAuth: vi.fn(() => ({})),
    jwt: vi.fn(() => ({})),
    magicLink: vi.fn(() => ({})),
    multiSession: vi.fn(() => ({})),
    oneTap: vi.fn(() => ({})),
    openAPI: vi.fn(() => ({})),
    organization: vi.fn(() => ({})),
    passkey: vi.fn(() => ({})),
    phoneNumber: vi.fn(() => ({})),
    rateLimit: vi.fn(() => ({})),
    twoFactor: vi.fn(() => ({})),
    username: vi.fn(() => ({})),
  }));

  // Mock Better Auth client plugins
  vi.mock('better-auth/client/plugins', () => ({
    organizationClient: vi.fn(() => ({})),
    adminClient: vi.fn(() => ({})),
    apiKeyClient: vi.fn(() => ({})),
    twoFactorClient: vi.fn(() => ({})),
    inferAdditionalFields: vi.fn(() => ({})),
    magicLinkClient: vi.fn(() => ({})),
    passkeyClient: vi.fn(() => ({})),
    multiSessionClient: vi.fn(() => ({})),
    oneTapClient: vi.fn(() => ({})),
  }));

  // Mock Better Auth React client
  vi.mock('better-auth/react', () => ({
    createAuthClient: vi.fn(() => ({
      signIn: {
        email: vi.fn().mockResolvedValue({ success: true }),
        social: vi.fn().mockResolvedValue({ success: true }),
        passkey: vi.fn().mockResolvedValue({ success: true }),
      },
      signUp: {
        email: vi.fn().mockResolvedValue({ success: true }),
      },
      signOut: vi.fn().mockResolvedValue({ success: true }),
      useSession: vi.fn(),
      getSession: vi.fn(),
      forgetPassword: vi.fn().mockResolvedValue({ success: true }),
      resetPassword: vi.fn().mockResolvedValue({ success: true }),
      changePassword: vi.fn().mockResolvedValue({ success: true }),
      verifyEmail: vi.fn().mockResolvedValue({ success: true }),
      passkey: {
        addPasskey: vi.fn().mockResolvedValue({ success: true }),
        listUserPasskeys: vi.fn().mockResolvedValue({ success: true }),
        deletePasskey: vi.fn().mockResolvedValue({ success: true }),
      },
      organization: {
        create: vi.fn().mockResolvedValue({ success: true }),
        update: vi.fn().mockResolvedValue({ success: true }),
        delete: vi.fn().mockResolvedValue({ success: true }),
        inviteMember: vi.fn().mockResolvedValue({ success: true }),
        removeMember: vi.fn().mockResolvedValue({ success: true }),
        updateMemberRole: vi.fn().mockResolvedValue({ success: true }),
        leave: vi.fn().mockResolvedValue({ success: true }),
        getFullOrganization: vi.fn().mockResolvedValue({ success: true }),
        list: vi.fn().mockResolvedValue({ success: true }),
        listInvitations: vi.fn().mockResolvedValue({ success: true }),
        getInvitation: vi.fn().mockResolvedValue({ success: true }),
        acceptInvitation: vi.fn().mockResolvedValue({ success: true }),
        rejectInvitation: vi.fn().mockResolvedValue({ success: true }),
        cancelInvitation: vi.fn().mockResolvedValue({ success: true }),
        getActiveMember: vi.fn().mockResolvedValue({ success: true }),
        setActive: vi.fn().mockResolvedValue({ success: true }),
        checkSlug: vi.fn().mockResolvedValue({ success: true }),
        createTeam: vi.fn().mockResolvedValue({ success: true }),
        updateTeam: vi.fn().mockResolvedValue({ success: true }),
        removeTeam: vi.fn().mockResolvedValue({ success: true }),
        listTeams: vi.fn().mockResolvedValue({ success: true }),
        hasPermission: vi.fn().mockResolvedValue(true),
        checkRolePermission: vi.fn().mockResolvedValue(true),
      },
      apiKey: {
        create: vi.fn().mockResolvedValue({ success: true }),
        update: vi.fn().mockResolvedValue({ success: true }),
        delete: vi.fn().mockResolvedValue({ success: true }),
        list: vi.fn().mockResolvedValue({ success: true }),
      },
      admin: {
        createUser: vi.fn().mockResolvedValue({ success: true }),
        listUsers: vi.fn().mockResolvedValue({ success: true }),
        setRole: vi.fn().mockResolvedValue({ success: true }),
        banUser: vi.fn().mockResolvedValue({ success: true }),
        unbanUser: vi.fn().mockResolvedValue({ success: true }),
        listUserSessions: vi.fn().mockResolvedValue({ success: true }),
        revokeUserSessions: vi.fn().mockResolvedValue({ success: true }),
        impersonateUser: vi.fn().mockResolvedValue({ success: true }),
        stopImpersonating: vi.fn().mockResolvedValue({ success: true }),
        removeUser: vi.fn().mockResolvedValue({ success: true }),
        hasPermission: vi.fn().mockResolvedValue(true),
        checkRolePermission: vi.fn().mockResolvedValue(true),
      },
      twoFactor: {
        enable: vi.fn().mockResolvedValue({ success: true }),
        disable: vi.fn().mockResolvedValue({ success: true }),
        verify: vi.fn().mockResolvedValue({ success: true }),
        getQRCode: vi.fn().mockResolvedValue({ success: true }),
        getStatus: vi.fn().mockResolvedValue({ success: true }),
        getBackupCodes: vi.fn().mockResolvedValue({ success: true }),
        regenerateBackupCodes: vi.fn().mockResolvedValue({ success: true }),
        sendOtp: vi.fn().mockResolvedValue({ success: true }),
        verifyOtp: vi.fn().mockResolvedValue({ success: true }),
      },
      magicLink: {
        sendMagicLink: vi.fn().mockResolvedValue({ success: true }),
        verifyMagicLink: vi.fn().mockResolvedValue({ success: true }),
      },
      session: {
        revoke: vi.fn().mockResolvedValue({ success: true }),
      },
      multiSession: {
        listSessions: vi.fn().mockResolvedValue({ success: true, data: [] }),
      },
      $store: {},
      $Infer: {},
    })),
  }));

  // Mock Next.js headers
  vi.mock('next/headers', () => ({
    headers: mockHeaders,
    cookies: vi.fn(() => ({
      get: vi.fn(),
      getAll: vi.fn(() => []),
      has: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
    })),
  }));

  // Mock database
  vi.mock('@repo/database', () => ({
    db: mockPrisma,
  }));

  // Alternative database mock path
  vi.mock('@repo/database/prisma', () => ({
    prisma: mockPrisma,
  }));

  // Mock database server path
  vi.mock('@repo/database/prisma/server/next', () => ({
    prisma: mockPrisma,
  }));

  // Mock observability
  vi.mock('@repo/observability/server/next', () => ({
    logError: vi.fn(),
    logWarn: vi.fn(),
    logInfo: vi.fn(),
    logDebug: vi.fn(),
    createLogger: () => ({
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    }),
  }));

  // Mock analytics
  vi.mock('@repo/analytics/server', () => ({
    identify: vi.fn(),
    createServerAnalytics: vi.fn(() =>
      Promise.resolve({
        identify: vi.fn(),
        emit: vi.fn(),
        initialize: vi.fn().mockResolvedValue(undefined),
        track: vi.fn(),
      }),
    ),
    track: vi.fn(),
  }));

  // Mock email
  vi.mock('@repo/email/server', () => ({
    sendEmail: vi.fn(),
    sendTemplatedEmail: vi.fn(),
    createEmailTemplate: vi.fn(),
    sendApiKeyCreatedEmail: vi.fn(),
    sendMagicLinkEmail: vi.fn(),
    sendOrganizationInvitationEmail: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
    sendTeamInvitationEmail: vi.fn().mockResolvedValue(true),
    sendVerificationEmail: vi.fn(),
    sendWelcomeEmail: vi.fn(),
  }));

  // Mock client utils
  vi.mock('../../src/client/utils/logger', () => ({
    logger: {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    },
  }));

  // Mock auth client
  vi.mock('../../src/client/client', () => ({
    authClient: {
      signIn: {
        email: vi.fn().mockResolvedValue({ success: true }),
        social: vi.fn().mockResolvedValue({ success: true }),
        passkey: vi.fn().mockResolvedValue({ success: true }),
      },
      signUp: {
        email: vi.fn().mockResolvedValue({ success: true }),
      },
      signOut: vi.fn().mockResolvedValue({ success: true }),
      useSession: vi.fn(),
      getSession: vi.fn(),
      forgetPassword: vi.fn().mockResolvedValue({ success: true }),
      resetPassword: vi.fn().mockResolvedValue({ success: true }),
      changePassword: vi.fn().mockResolvedValue({ success: true }),
      verifyEmail: vi.fn().mockResolvedValue({ success: true }),
    },
  }));

  // Mock better-auth-harmony
  vi.mock('better-auth-harmony', () => ({
    emailHarmony: vi.fn(() => ({})),
    phoneHarmony: vi.fn(() => ({})),
  }));
};

/**
 * Sets up environment mocks
 */
export const setupEnvironmentMocks = () => {
  // Set up test environment
  // Set NODE_ENV directly without defineProperty
  process.env.NODE_ENV = 'test';
  process.env.CI = 'true';
  process.env.SKIP_ENV_VALIDATION = 'true';

  // Auth package environment
  process.env.BETTER_AUTH_SECRET = 'test_auth_secret_key_1234567890';
  process.env.BETTER_AUTH_URL = 'http://localhost:3000';
  process.env.SESSION_MAX_AGE = '2592000';
  process.env.ORGANIZATION_INVITE_TTL = '86400';

  // Database environment
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/auth_test';

  // Email environment
  process.env.RESEND_API_KEY = 're_test_1234567890';
  process.env.EMAIL_FROM = 'noreply@test.example.com';
  process.env.EMAIL_REPLY_TO = 'support@test.example.com';

  // Auth features
  process.env.PACKAGE_NAME = 'auth';
  process.env.AUTH_TEST_MODE = 'true';
  process.env.ORGANIZATION_FEATURES_ENABLED = 'true';
  process.env.API_KEY_FEATURES_ENABLED = 'true';
  process.env.NEXT_PUBLIC_APP_NAME = 'Auth Package Tests';
};

/**
 * Sets up environment variable mocks
 */
export const setupEnvMocks = () => {
  const mockEnv = {
    // Server variables
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    AUTH_SECRET: process.env.AUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    TRUSTED_ORIGINS: process.env.TRUSTED_ORIGINS,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    AUTH_FEATURES_ADMIN: process.env.AUTH_FEATURES_ADMIN,
    AUTH_FEATURES_API_KEYS: process.env.AUTH_FEATURES_API_KEYS,
    AUTH_FEATURES_ORGANIZATIONS: process.env.AUTH_FEATURES_ORGANIZATIONS,
    AUTH_FEATURES_MAGIC_LINKS: process.env.AUTH_FEATURES_MAGIC_LINKS,
    AUTH_FEATURES_TWO_FACTOR: process.env.AUTH_FEATURES_TWO_FACTOR,
    // Client variables
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  };

  vi.mock('../../env', () => {
    const mockEnv = {
      // Server variables
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
      AUTH_SECRET: process.env.AUTH_SECRET,
      DATABASE_URL: process.env.DATABASE_URL,
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
      TRUSTED_ORIGINS: process.env.TRUSTED_ORIGINS,
      GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
      GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      AUTH_FEATURES_ADMIN: process.env.AUTH_FEATURES_ADMIN,
      AUTH_FEATURES_API_KEYS: process.env.AUTH_FEATURES_API_KEYS,
      AUTH_FEATURES_ORGANIZATIONS: process.env.AUTH_FEATURES_ORGANIZATIONS,
      AUTH_FEATURES_MAGIC_LINKS: process.env.AUTH_FEATURES_MAGIC_LINKS,
      AUTH_FEATURES_TWO_FACTOR: process.env.AUTH_FEATURES_TWO_FACTOR,
      // Client variables
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    };

    return {
      env: mockEnv,
      envError: null,
      safeEnv: () => mockEnv,
      safeServerEnv: () => ({
        BETTER_AUTH_SECRET: mockEnv.BETTER_AUTH_SECRET,
        AUTH_SECRET: mockEnv.AUTH_SECRET,
        DATABASE_URL: mockEnv.DATABASE_URL,
        BETTER_AUTH_URL: mockEnv.BETTER_AUTH_URL,
        NEXT_PUBLIC_APP_NAME: mockEnv.NEXT_PUBLIC_APP_NAME,
        TRUSTED_ORIGINS: mockEnv.TRUSTED_ORIGINS,
        GITHUB_CLIENT_ID: mockEnv.GITHUB_CLIENT_ID,
        GITHUB_CLIENT_SECRET: mockEnv.GITHUB_CLIENT_SECRET,
        GOOGLE_CLIENT_ID: mockEnv.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: mockEnv.GOOGLE_CLIENT_SECRET,
        AUTH_FEATURES_ADMIN: mockEnv.AUTH_FEATURES_ADMIN,
        AUTH_FEATURES_API_KEYS: mockEnv.AUTH_FEATURES_API_KEYS,
        AUTH_FEATURES_ORGANIZATIONS: mockEnv.AUTH_FEATURES_ORGANIZATIONS,
        AUTH_FEATURES_MAGIC_LINKS: mockEnv.AUTH_FEATURES_MAGIC_LINKS,
        AUTH_FEATURES_TWO_FACTOR: mockEnv.AUTH_FEATURES_TWO_FACTOR,
      }),
      safeClientEnv: () => ({
        NEXT_PUBLIC_APP_URL: mockEnv.NEXT_PUBLIC_APP_URL,
        NEXT_PUBLIC_APP_NAME: mockEnv.NEXT_PUBLIC_APP_NAME,
        AUTH_FEATURES_ADMIN: mockEnv.AUTH_FEATURES_ADMIN,
        AUTH_FEATURES_API_KEYS: mockEnv.AUTH_FEATURES_API_KEYS,
        AUTH_FEATURES_ORGANIZATIONS: mockEnv.AUTH_FEATURES_ORGANIZATIONS,
        AUTH_FEATURES_MAGIC_LINKS: mockEnv.AUTH_FEATURES_MAGIC_LINKS,
        AUTH_FEATURES_TWO_FACTOR: mockEnv.AUTH_FEATURES_TWO_FACTOR,
      }),
      setMockEnv: (newEnv: any) => {
        Object.assign(mockEnv, newEnv);
      },
    };
  });
};

/**
 * Sets up client-side mocks
 */
export const setupClientMocks = () => {
  // Mock window for client-side tests
  Object.defineProperty(window, 'location', {
    value: {
      href: '',
      assign: vi.fn(),
      replace: vi.fn(),
      reload: vi.fn(),
    },
    writable: true,
  });

  // Mock document
  Object.defineProperty(document, 'cookie', {
    value: '',
    writable: true,
  });

  // Mock fetch
  vi.spyOn(global, 'fetch').mockResolvedValue(new Response());

  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    },
    writable: true,
  });
};

/**
 * Sets up React Testing Library mocks
 */
export const setupReactTestingMocks = () => {
  // Mock @testing-library/jest-dom
  vi.mock('@testing-library/jest-dom');

  // Ensure React is available globally
  const React = require('react');
  global.React = React;
};

/**
 * Comprehensive setup function that sets up all mocks
 */
export const setupAllMocks = () => {
  setupEnvironmentMocks();
  setupCommonMocks();
  setupEnvMocks();
  setupClientMocks();
  setupReactTestingMocks();
};

/**
 * Resets all mocks to their initial state
 */
export const resetAllMocks = () => {
  vi.clearAllMocks();

  // Reset specific mock implementations
  Object.values(mockBetterAuthApi).forEach(mock => {
    if (typeof mock === 'function') {
      mock.mockReset();
    }
  });

  Object.values(mockPrisma).forEach(model => {
    if (typeof model === 'object' && model !== null) {
      Object.values(model).forEach(method => {
        if (typeof method === 'function') {
          method.mockReset();
        }
      });
    }
  });

  mockHeaders.mockReset();

  // Reapply smart authentication behavior
  applySmartAuthBehavior();
};

/**
 * Cleanup function for test teardown
 */
export const cleanupMocks = () => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
};
