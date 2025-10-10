/**
 * Centralized auth test factories for the entire monorepo
 * Provides reusable mock objects and data generators for auth functionality
 *
 * Previously scattered across individual packages, now centralized for consistency
 */

import { vi } from "vitest";

/**
 * Type definitions for auth-related objects
 * Using generic interfaces to avoid importing specific package types
 */
export interface MockUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  banned: boolean;
  [key: string]: any;
}

export interface MockOrganization {
  id: string;
  name: string;
  createdAt: Date;
  description: string | null;
  logo: string | null;
  metadata: Record<string, any>;
  slug: string;
  updatedAt: Date | null;
  [key: string]: any;
}

export interface MockSession {
  session: {
    id: string;
    activeOrganizationId: string;
    expiresAt: Date;
    token: string;
    userId: string;
    [key: string]: any;
  };
  user: MockUser;
}

/**
 * Creates a mock auth client with all standard methods
 */
export const createMockAuthClient = (overrides = {}) => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  changePassword: vi.fn(),
  verifyEmail: vi.fn(),
  resendEmailVerification: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  useSession: vi.fn(),
  ...overrides,
});

/**
 * Creates a mock auth context for client-side tests
 */
export const createMockAuthContext = (overrides = {}) => ({
  user: { id: "1", name: "Test User", email: "test@example.com" },
  isAuthenticated: true,
  isLoading: false,
  requireAuth: vi.fn(),
  ...overrides,
});

/**
 * Creates a mock session object for server-side tests
 */
export const createMockAuthSession = (
  overrides: { session?: any; user?: any } = {},
): MockSession => ({
  session: {
    id: "session-123",
    activeOrganizationId: "org-123",
    expiresAt: new Date(Date.now() + 86400000),
    token: "mock-token",
    userId: "user-123",
    ...overrides.session,
  },
  user: {
    id: "user-123",
    name: "Test User",
    createdAt: new Date(),
    email: "test@example.com",
    updatedAt: new Date(),
    banned: false,
    ...overrides.user,
  },
});

/**
 * Creates a mock organization object
 */
export const createMockAuthOrganization = (
  overrides = {},
): MockOrganization => ({
  id: "org-123",
  name: "Test Organization",
  createdAt: new Date("2023-01-01"),
  description: null,
  logo: null,
  metadata: {},
  slug: "test-org",
  updatedAt: null,
  ...overrides,
});

/**
 * Creates a mock user object
 */
export const createMockAuthUser = (overrides = {}): MockUser => ({
  id: "user-123",
  name: "Test User",
  email: "test@example.com",
  createdAt: new Date(),
  updatedAt: new Date(),
  banned: false,
  ...overrides,
});

/**
 * Creates a mock organization member
 */
export const createMockMember = (overrides = {}) => ({
  id: "member-123",
  organizationId: "org-123",
  userId: "user-123",
  role: "member",
  createdAt: new Date(),
  updatedAt: new Date(),
  user: createMockAuthUser(),
  ...overrides,
});

/**
 * Creates a mock invitation object
 */
export const createMockInvitation = (overrides = {}) => ({
  id: "inv-123",
  email: "test@example.com",
  organizationId: "org-123",
  role: "member",
  status: "pending",
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 86400000),
  ...overrides,
});

/**
 * Creates a mock API key object
 */
export const createMockApiKey = (overrides = {}) => ({
  id: "key-123",
  name: "Test API Key",
  keyHash: "hashed-key",
  keyPrefix: "ak_test",
  userId: "user-123",
  organizationId: "org-123",
  permissions: ["read", "write"],
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 86400000),
  lastUsedAt: null,
  ...overrides,
});

/**
 * Creates a mock team object
 */
export const createMockTeam = (overrides = {}) => ({
  id: "team-123",
  name: "Test Team",
  organizationId: "org-123",
  description: "Test team description",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Creates a mock headers object for testing
 */
export const createMockAuthHeaders = (
  headers: Record<string, string> = {},
): Headers => {
  const mockHeaders = new Headers();
  Object.entries(headers).forEach(([key, value]) => {
    mockHeaders.set(key, value);
  });
  return mockHeaders;
};

/**
 * Creates a mock Prisma client with all auth-related models
 */
export const createMockPrisma = () => {
  const mockMethods = {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
    upsert: vi.fn(),
  };

  return {
    user: { ...mockMethods },
    session: { ...mockMethods },
    account: { ...mockMethods },
    verification: { ...mockMethods },
    apiKey: { ...mockMethods },
    organization: { ...mockMethods },
    organizationMember: { ...mockMethods },
    invitation: { ...mockMethods },
    team: { ...mockMethods },
    member: { ...mockMethods },
    $transaction: vi.fn(),
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  };
};

/**
 * Creates a mock Better Auth API with all standard methods
 */
export const createMockBetterAuthApi = () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  listUsers: vi.fn(),
  verifyApiKey: vi.fn(),
  createApiKey: vi.fn(),
  deleteApiKey: vi.fn(),
  listApiKeys: vi.fn(),
  createOrganization: vi.fn(),
  updateOrganization: vi.fn(),
  deleteOrganization: vi.fn(),
  getFullOrganization: vi.fn(),
  setActiveOrganization: vi.fn(),
  inviteUser: vi.fn(),
  acceptInvitation: vi.fn(),
  declineInvitation: vi.fn(),
  rejectInvitation: vi.fn(),
  cancelInvitation: vi.fn(),
  listInvitations: vi.fn(),
  addMember: vi.fn(),
  removeMember: vi.fn(),
  updateMemberRole: vi.fn(),
  listTeams: vi.fn(),
  createTeam: vi.fn(),
  updateTeam: vi.fn(),
  deleteTeam: vi.fn(),
  getTeam: vi.fn(),
  removeTeam: vi.fn(),
});

/**
 * Creates commonly used test data sets
 */
export const createTestDataSets = () => ({
  // Standard user for most tests
  standardUser: createMockAuthUser(),

  // Admin user with elevated permissions
  adminUser: createMockAuthUser({
    id: "admin-123",
    name: "Admin User",
    email: "admin@example.com",
  }),

  // Standard organization
  standardOrganization: createMockAuthOrganization(),

  // Enterprise organization
  enterpriseOrganization: createMockAuthOrganization({
    id: "enterprise-org",
    name: "Enterprise Organization",
    slug: "enterprise-org",
    metadata: { plan: "enterprise" },
  }),

  // Standard session
  standardSession: createMockAuthSession(),

  // Admin session
  adminSession: createMockAuthSession({
    user: {
      id: "admin-123",
      name: "Admin User",
      email: "admin@example.com",
    },
  }),

  // Standard API key
  standardApiKey: createMockApiKey(),

  // Read-only API key
  readOnlyApiKey: createMockApiKey({
    id: "readonly-key",
    name: "Read Only Key",
    permissions: ["read"],
  }),

  // Standard team
  standardTeam: createMockTeam(),

  // Standard invitation
  standardInvitation: createMockInvitation(),
});

/**
 * Helper to create bulk test data
 */
export const createBulkTestData = {
  users: (count: number) =>
    Array.from({ length: count }, (_, i) =>
      createMockAuthUser({
        id: `user-${i}`,
        name: `User ${i}`,
        email: `user${i}@example.com`,
      }),
    ),

  organizations: (count: number) =>
    Array.from({ length: count }, (_, i) =>
      createMockAuthOrganization({
        id: `org-${i}`,
        name: `Organization ${i}`,
        slug: `org-${i}`,
      }),
    ),

  members: (count: number) =>
    Array.from({ length: count }, (_, i) =>
      createMockMember({
        id: `member-${i}`,
        userId: `user-${i}`,
        role: i === 0 ? "owner" : i === 1 ? "admin" : "member",
      }),
    ),

  invitations: (count: number) =>
    Array.from({ length: count }, (_, i) =>
      createMockInvitation({
        id: `inv-${i}`,
        email: `invite${i}@example.com`,
        status: i % 2 === 0 ? "pending" : "accepted",
      }),
    ),
};

/**
 * Creates a mock environment for testing
 */
export const createMockEnvironment = () => {
  let mockEnv = {
    BETTER_AUTH_SECRET: "test-secret",
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    NEXT_PUBLIC_APP_NAME: "Test App",
    AUTH_FEATURES_ADMIN: true,
    AUTH_FEATURES_API_KEYS: true,
    AUTH_FEATURES_ORGANIZATIONS: true,
    AUTH_FEATURES_MAGIC_LINKS: true,
    AUTH_FEATURES_TWO_FACTOR: true,
    AUTH_FEATURES_TEAMS: true,
    AUTH_FEATURES_IMPERSONATION: true,
  };

  return {
    env: mockEnv,
    envError: null,
    safeEnv: () => mockEnv,
    setMockEnv: (newEnv: any) => {
      // Convert string 'true'/'false' to boolean for feature flags
      const processedEnv = { ...newEnv };
      Object.keys(processedEnv).forEach((key) => {
        if (key.startsWith("AUTH_FEATURES_")) {
          if (processedEnv[key] === "true") {
            processedEnv[key] = true;
          } else if (processedEnv[key] === "false") {
            processedEnv[key] = false;
          }
        }
      });
      mockEnv = { ...mockEnv, ...processedEnv };
    },
  };
};

/**
 * Pre-configured test scenarios for common auth testing patterns
 */
export const authTestScenarios = {
  // Authentication scenarios
  signIn: {
    success: {
      input: { email: "test@example.com", password: "password123" },
      expected: createMockAuthSession(),
    },
    invalidCredentials: {
      input: { email: "wrong@example.com", password: "wrongpass" },
      shouldThrow: true,
      error: "Invalid credentials",
    },
    bannedUser: {
      input: { email: "banned@example.com", password: "password123" },
      shouldThrow: true,
      error: "Account banned",
    },
  },

  // Organization scenarios
  createOrganization: {
    success: {
      input: { name: "Test Org", slug: "test-org" },
      expected: createMockAuthOrganization(),
    },
    duplicateSlug: {
      input: { name: "Test Org", slug: "existing-slug" },
      shouldThrow: true,
      error: "Slug already exists",
    },
  },

  // API key scenarios
  createApiKey: {
    success: {
      input: { name: "Test Key", permissions: ["read"] },
      expected: createMockApiKey(),
    },
    invalidPermissions: {
      input: { name: "Test Key", permissions: ["invalid"] },
      shouldThrow: true,
      error: "Invalid permissions",
    },
  },
};
