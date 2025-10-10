// Common server test setup
import { vi } from 'vitest';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock better-auth and all its plugins
vi.mock('better-auth', () => ({
  betterAuth: vi.fn(() => ({
    api: {
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      updateUser: vi.fn(),
      deleteUser: vi.fn(),
      listUsers: vi.fn(),
      verifyApiKey: vi.fn(),
    },
    handler: vi.fn(),
    $Infer: {},
  })),
}));

vi.mock('better-auth/adapters/prisma', () => ({
  prismaAdapter: vi.fn(() => ({})),
}));

vi.mock('better-auth/plugins', () => ({
  admin: vi.fn(() => ({})),
  anonymous: vi.fn(() => ({})),
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

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn(() => new Headers()),
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
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

// Mock database
vi.mock('@repo/db-prisma', () => ({
  db: {
    $transaction: vi.fn(),
    apiKey: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    organization: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Mock env
vi.mock('../../env', () => ({
  env: {
    BETTER_AUTH_SECRET: 'test-secret',
    BETTER_AUTH_URL: 'http://localhost:3000',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    NEXT_PUBLIC_APP_NAME: 'Test App',
    AUTH_FEATURES_ADMIN: true,
    AUTH_FEATURES_API_KEYS: true,
    AUTH_FEATURES_ORGANIZATIONS: true,
    AUTH_FEATURES_TEAMS: true,
    AUTH_FEATURES_IMPERSONATION: true,
    AUTH_FEATURES_MAGIC_LINKS: true,
    AUTH_FEATURES_TWO_FACTOR: true,
  },
  envError: null,
  safeEnv: () => ({
    BETTER_AUTH_SECRET: 'test-secret',
    BETTER_AUTH_URL: 'http://localhost:3000',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    NEXT_PUBLIC_APP_NAME: 'Test App',
    AUTH_FEATURES_ADMIN: true,
    AUTH_FEATURES_API_KEYS: true,
    AUTH_FEATURES_ORGANIZATIONS: true,
    AUTH_FEATURES_TEAMS: true,
    AUTH_FEATURES_IMPERSONATION: true,
    AUTH_FEATURES_MAGIC_LINKS: true,
    AUTH_FEATURES_TWO_FACTOR: true,
  }),
  safeServerEnv: () => ({
    BETTER_AUTH_SECRET: 'test-secret',
    BETTER_AUTH_URL: 'http://localhost:3000',
    AUTH_FEATURES_ADMIN: true,
    AUTH_FEATURES_API_KEYS: true,
    AUTH_FEATURES_ORGANIZATIONS: true,
    AUTH_FEATURES_TEAMS: true,
    AUTH_FEATURES_IMPERSONATION: true,
    AUTH_FEATURES_MAGIC_LINKS: true,
    AUTH_FEATURES_TWO_FACTOR: true,
  }),
  safeClientEnv: () => ({
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    NEXT_PUBLIC_APP_NAME: 'Test App',
  }),
}));
