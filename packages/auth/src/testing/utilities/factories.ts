/**
 * Test data factories for creating mock objects
 */

import { vi } from 'vitest';

import type { 
  User, 
  Session, 
  AuthSession,
  Organization,
  Team,
  Member,
  ApiKey,
  OrganizationRole,
} from '../../shared/types';

/**
 * Creates a mock user with optional overrides
 */
export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: `user-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Test User',
    email: 'test@example.com',
    emailVerified: true,
    image: 'https://example.com/avatar.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Creates a mock session with optional overrides
 */
export function createMockSessionObject(overrides: Partial<Session> = {}): Session {
  const userId = overrides.userId || `user-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id: `session-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    createdAt: new Date(),
    updatedAt: new Date(),
    token: `token-${Math.random().toString(36).substr(2, 16)}`,
    ipAddress: '127.0.0.1',
    userAgent: 'Test User Agent',
    ...overrides,
  } as Session;
}

/**
 * Creates a mock auth session with optional overrides
 */
export function createMockAuthSession(
  userOverrides: Partial<User> = {},
  sessionOverrides: Partial<Session> = {}
): AuthSession {
  const user = createMockUser(userOverrides);
  const session = createMockSessionObject({
    userId: user.id,
    ...sessionOverrides,
  });

  return {
    user,
    session,
    activeOrganizationId: (session as any).activeOrganizationId || `org-${Math.random().toString(36).substr(2, 9)}`,
  };
}

/**
 * Creates a mock organization with optional overrides
 */
export function createMockOrganization(overrides: Partial<Organization> = {}): Organization {
  const name = overrides.name || 'Test Organization';
  const slug = overrides.slug || name.toLowerCase().replace(/\s+/g, '-');

  return {
    id: `org-${Math.random().toString(36).substr(2, 9)}`,
    name,
    slug,
    logo: null,
    metadata: {},
    createdAt: new Date(),
    updatedAt: null,
    ...overrides,
  } as Organization;
}

/**
 * Creates a mock team with optional overrides
 */
export function createMockTeam(overrides: Partial<Team> = {}): Team {
  return {
    id: `team-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Test Team',
    organizationId: `org-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    updatedAt: null,
    ...overrides,
  } as Team;
}

/**
 * Creates a mock team member with optional overrides
 */
export function createMockTeamMember(overrides: Partial<Member> = {}): Member {
  const user = createMockUser();
  
  return {
    id: `member-${Math.random().toString(36).substr(2, 9)}`,
    userId: user.id,
    organizationId: `org-${Math.random().toString(36).substr(2, 9)}`,
    role: 'member',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Member;
}

/**
 * Creates a mock API key with optional overrides
 */
export function createMockApiKey(overrides: Partial<ApiKey> = {}): ApiKey {
  return {
    id: `key-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Test API Key',
    organizationId: `org-${Math.random().toString(36).substr(2, 9)}`,
    permissions: JSON.stringify(['read']) as any,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    lastUsedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    key: `forge_${Math.random().toString(36).substr(2, 32)}`,
    userId: null,
    scopes: null,
    revokedAt: null,
    metadata: null,
    ...overrides,
  } as ApiKey;
}

/**
 * Creates multiple mock users with different roles
 */
export function createMockUsersWithRoles(): Record<OrganizationRole, User> {
  return {
    owner: createMockUser({
      name: 'Owner User',
      email: 'owner@example.com',
    }),
    admin: createMockUser({
      name: 'Admin User',
      email: 'admin@example.com',
    }),
    member: createMockUser({
      name: 'Member User',
      email: 'member@example.com',
    }),
  };
}

/**
 * Creates a complete organization structure with users, teams, etc.
 */
export function createMockOrganizationStructure() {
  const organization = createMockOrganization();
  const users = createMockUsersWithRoles();
  
  const teams = [
    createMockTeam({
      name: 'Development Team',
      organizationId: organization.id,
    }),
    createMockTeam({
      name: 'Marketing Team',
      organizationId: organization.id,
    }),
  ];

  const members = Object.entries(users).map(([role, user]) =>
    createMockTeamMember({
      userId: user.id,
      teamId: teams[0].id,
      role,
      user,
    })
  );

  const apiKeys = [
    createMockApiKey({
      name: 'Development API Key',
      organizationId: organization.id,
      permissions: JSON.stringify(['read', 'write']) as any,
    }),
    createMockApiKey({
      name: 'Read-only API Key',
      organizationId: organization.id,
      permissions: JSON.stringify(['read']) as any,
    }),
  ];

  return {
    organization,
    users,
    teams,
    members,
    apiKeys,
  };
}

/**
 * Helper to create multiple items with a factory function
 */
export function createMany<T>(
  factory: () => T,
  count: number,
  overridesFn?: (index: number) => Partial<T>
): T[] {
  return Array.from({ length: count }, (_, index) => {
    const item = factory();
    const overrides = overridesFn ? overridesFn(index) : {};
    return { ...item, ...overrides };
  });
}

/**
 * Mock fetch implementation for testing API calls
 */
export function createMockFetch(responses: Record<string, any> = {}) {
  return vi.fn().mockImplementation((url: string, options?: RequestInit) => {
    const method = options?.method || 'GET';
    const key = `${method} ${url}`;
    
    const response = responses[key] || responses[url] || { success: true };
    
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    });
  });
}

/**
 * Setup global fetch mock for tests
 */
export function setupMockFetch(responses: Record<string, any> = {}) {
  const mockFetch = createMockFetch(responses);
  global.fetch = mockFetch as any;
  return mockFetch;
}

/**
 * Creates mock environment variables for testing
 */
export function createMockEnv(overrides: Record<string, string> = {}) {
  return {
    BETTER_AUTH_SECRET: 'test-secret',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    GITHUB_CLIENT_ID: 'test-github-client-id',
    GITHUB_CLIENT_SECRET: 'test-github-client-secret',
    GOOGLE_CLIENT_ID: 'test-google-client-id',
    GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
    ...overrides,
  };
}

/**
 * Restore original global functions after tests
 */
export function restoreGlobals() {
  if (vi.isMockFunction(global.fetch)) {
    vi.restoreAllMocks();
  }
}