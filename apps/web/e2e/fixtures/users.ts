
export interface TestUser {
  email: string;
  emailVerified: boolean;
  id: string;
  name: string;
  organizationId?: string;
  password: string;
  role: string;
}

export interface TestSession {
  expiresAt: Date;
  id: string;
  token: string;
  userId: string;
}

export const TEST_USERS: Record<string, TestUser> = {
  admin: {
    id: "test-admin-001",
    name: "Test Admin",
    email: "admin@test.example.com",
    emailVerified: true,
    organizationId: "test-org-001",
    password: "AdminPass123!",
    role: "admin",
  },
  banned: {
    id: "test-user-003",
    name: "Banned User",
    email: "banned@test.example.com",
    emailVerified: true,
    password: "BannedPass123!",
    role: "user",
  },
  regular: {
    id: "test-user-001",
    name: "Regular User",
    email: "user@test.example.com",
    emailVerified: true,
    organizationId: "test-org-001",
    password: "UserPass123!",
    role: "user",
  },
  unverified: {
    id: "test-user-002",
    name: "Unverified User",
    email: "unverified@test.example.com",
    emailVerified: false,
    password: "UnverifiedPass123!",
    role: "user",
  },
};

export const TEST_SESSIONS: Record<string, TestSession> = {
  adminSession: {
    id: "test-session-admin-001",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    token: "test-token-admin-001",
    userId: TEST_USERS.admin.id,
  },
  expiredSession: {
    id: "test-session-expired-001",
    expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Expired 1 day ago
    token: "test-token-expired-001",
    userId: TEST_USERS.regular.id,
  },
  userSession: {
    id: "test-session-user-001",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    token: "test-token-user-001",
    userId: TEST_USERS.regular.id,
  },
};

export function createTestUser(overrides?: Partial<TestUser>): TestUser {
  const id = overrides?.id || `test-user-${Date.now()}`;
  return {
    id,
    name: "Test User",
    email: `test-${Date.now()}@example.com`,
    emailVerified: true,
    password: "TestPass123!",
    role: "user",
    ...overrides,
  };
}

export function createTestSession(
  userId: string,
  overrides?: Partial<TestSession>,
): TestSession {
  const id = overrides?.id || `test-session-${Date.now()}`;
  return {
    id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    token: `test-token-${Date.now()}`,
    userId,
    ...overrides,
  };
}
