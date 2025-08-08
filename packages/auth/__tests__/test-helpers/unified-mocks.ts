/**
 * Auth package test constants and utilities
 * Mock setup is now centralized in vitest.setup.ts using @repo/qa mocks
 */

/**
 * Standard environment variables for tests
 */
export const TEST_ENV = {
  NODE_ENV: 'test',
  CI: 'true',
  SKIP_ENV_VALIDATION: 'true',
  BETTER_AUTH_SECRET: 'test_auth_secret_key_1234567890',
  BETTER_AUTH_URL: 'http://localhost:3000',
  SESSION_MAX_AGE: '2592000',
  ORGANIZATION_INVITE_TTL: '86400',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/auth_test',
  RESEND_API_KEY: 're_test_1234567890',
  EMAIL_FROM: 'noreply@test.example.com',
  EMAIL_REPLY_TO: 'support@test.example.com',
  PACKAGE_NAME: 'auth',
  AUTH_TEST_MODE: 'true',
  ORGANIZATION_FEATURES_ENABLED: 'true',
  API_KEY_FEATURES_ENABLED: 'true',
  NEXT_PUBLIC_APP_NAME: 'Auth Package Tests',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  AUTH_FEATURES_ADMIN: 'true',
  AUTH_FEATURES_API_KEYS: 'true',
  AUTH_FEATURES_ORGANIZATIONS: 'true',
  AUTH_FEATURES_MAGIC_LINKS: 'true',
  AUTH_FEATURES_TWO_FACTOR: 'true',
  AUTH_FEATURES_TEAMS: 'true',
  AUTH_FEATURES_IMPERSONATION: 'true',
};

/**
 * DEPRECATED: Mock setup is now handled automatically by vitest.setup.ts
 *
 * All common mocks (Better Auth, Next.js, Prisma, Observability) are now
 * centralized using @repo/qa mocks. Individual tests should only mock
 * package-specific behavior that isn't covered by the centralized setup.
 *
 * @deprecated Use centralized mocks in vitest.setup.ts instead
 */
export const createUnifiedMockSetup = (
  options: {
    /** DEPRECATED: Mock the auth module */
    mockAuth?: boolean;
    /** Mock the database */
    mockDatabase?: boolean;
    /** Mock Next.js headers */
    mockHeaders?: boolean;
    /** Mock environment variables */
    mockEnv?: boolean;
    /** Mock Better Auth plugins */
    mockPlugins?: boolean;
    /** Custom environment overrides */
    envOverrides?: Record<string, string>;
    /** Custom session for auth mock */
    session?: any;
  } = {},
) => {
  const {
    mockAuth = true,
    mockDatabase = true,
    mockHeaders = true,
    mockEnv = true,
    mockPlugins = true,
    envOverrides = {},
    session = createMockSession(),
  } = options;

  const mockObjects = {
    auth: mockAuth ? createMockBetterAuthApi() : null,
    prisma: mockDatabase ? createMockPrisma() : null,
    headers: mockHeaders ? vi.fn(() => createMockHeaders()) : null,
    env: mockEnv ? { ...TEST_ENV, ...envOverrides } : null,
  };

  // Apply mocks based on options
  if (mockAuth) {
    vi.mock('../../src/shared/auth', () => ({
      auth: {
        api: mockObjects.auth,
      },
    }));
  }

  if (mockDatabase) {
    vi.mock('@repo/database', () => ({
      db: mockObjects.prisma,
    }));

    vi.mock('@repo/database/prisma', () => ({
      prisma: mockObjects.prisma,
    }));
  }

  if (mockHeaders) {
    vi.mock('next/headers', () => ({
      headers: mockObjects.headers,
      cookies: vi.fn(() => ({
        get: vi.fn(),
        getAll: vi.fn(() => []),
        has: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
      })),
    }));
  }

  if (mockEnv) {
    const envMock = mockObjects.env;
    vi.mock('../env', () => ({
      env: envMock,
      envError: null,
      safeEnv: () => envMock,
      safeServerEnv: () => envMock,
      safeClientEnv: () => ({
        NEXT_PUBLIC_APP_URL: envMock?.NEXT_PUBLIC_APP_URL,
        NEXT_PUBLIC_APP_NAME: envMock?.NEXT_PUBLIC_APP_NAME,
      }),
      setMockEnv: (newEnv: any) => {
        Object.assign(envMock!, newEnv);
      },
    }));
  }

  if (mockPlugins) {
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

    vi.mock('better-auth/client/plugins', () => ({
      organizationClient: vi.fn(() => ({})),
      adminClient: vi.fn(() => ({})),
      apiKeyClient: vi.fn(() => ({})),
      twoFactorClient: vi.fn(() => ({})),
      inferAdditionalFields: vi.fn(),
      magicLinkClient: vi.fn(() => ({})),
      passkeyClient: vi.fn(() => ({})),
      multiSessionClient: vi.fn(() => ({})),
      oneTapClient: vi.fn(() => ({})),
    }));
  }

  // Additional utility mocks
  vi.mock('server-only', () => ({}));

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

  vi.mock('@repo/email/server', () => ({
    sendEmail: vi.fn(),
    sendTemplatedEmail: vi.fn(),
    sendApiKeyCreatedEmail: vi.fn(),
    sendMagicLinkEmail: vi.fn(),
    sendOrganizationInvitationEmail: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
    sendTeamInvitationEmail: vi.fn().mockResolvedValue(true),
    sendVerificationEmail: vi.fn(),
    sendWelcomeEmail: vi.fn(),
  }));

  // Set up default session if auth is mocked
  if (mockAuth && session) {
    vi.mocked(mockObjects.auth!.getSession).mockResolvedValue(session);
  }

  return mockObjects;
};

/**
 * Creates a lightweight mock setup for simple tests
 */
export const createLightweightMockSetup = (customSession?: any) => {
  return createUnifiedMockSetup({
    mockAuth: true,
    mockDatabase: false,
    mockHeaders: true,
    mockEnv: true,
    mockPlugins: false,
    session: customSession,
  });
};

/**
 * Creates a full mock setup for comprehensive tests
 */
export const createFullMockSetup = (
  options: {
    session?: any;
    envOverrides?: Record<string, string>;
  } = {},
) => {
  return createUnifiedMockSetup({
    mockAuth: true,
    mockDatabase: true,
    mockHeaders: true,
    mockEnv: true,
    mockPlugins: true,
    ...options,
  });
};

/**
 * Creates a client-side mock setup for React component tests
 */
export const createClientMockSetup = () => {
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

  // Mock Better Auth client
  vi.mock('better-auth/react', () => ({
    createAuthClient: vi.fn(() => createMockBetterAuthApi()),
  }));

  // Mock React Testing Library
  vi.mock('@testing-library/jest-dom');

  const React = require('react');
  global.React = React;
};

/**
 * Reset all mocks to initial state
 */
export const resetUnifiedMocks = () => {
  vi.clearAllMocks();
  vi.resetModules();
};

/**
 * Cleanup all mocks
 */
export const cleanupUnifiedMocks = () => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
};

/**
 * Common mock configurations for different test scenarios
 */
export const mockConfigurations = {
  /** For server action tests */
  serverActions: () =>
    createUnifiedMockSetup({
      mockAuth: true,
      mockDatabase: true,
      mockHeaders: true,
      mockEnv: true,
      mockPlugins: false,
    }),

  /** For client component tests */
  clientComponents: () => {
    createClientMockSetup();
    return createUnifiedMockSetup({
      mockAuth: true,
      mockDatabase: false,
      mockHeaders: false,
      mockEnv: true,
      mockPlugins: true,
    });
  },

  /** For integration tests */
  integration: () => createFullMockSetup(),

  /** For unit tests */
  unit: () => createLightweightMockSetup(),

  /** For permission tests */
  permissions: (userRole: string) =>
    createUnifiedMockSetup({
      session: createMockSession({
        user: { role: userRole },
      }),
    }),

  /** For unauthenticated tests */
  unauthenticated: () =>
    createUnifiedMockSetup({
      session: null,
    }),

  /** For admin tests */
  admin: () =>
    createUnifiedMockSetup({
      session: createMockSession({
        user: {
          role: 'admin',
          email: 'admin@example.com',
          name: 'Admin User',
        },
      }),
    }),
};
