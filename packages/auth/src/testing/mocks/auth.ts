/**
 * Mock authentication functions for testing
 */

import { vi } from 'vitest';

import type { AuthSession, OrganizationRole, Session, User } from '../../shared/types';

/**
 * Mock user data
 */
export const mockUsers = {
  admin: {
    id: 'user-admin-1',
    name: 'Admin User',
    createdAt: new Date('2023-01-02'),
    email: 'admin@example.com',
    emailVerified: true,
    image: 'https://example.com/avatar-admin.jpg',
    updatedAt: new Date('2023-01-02'),
    role: 'admin',
    phoneNumber: '+1234567890',
    phoneNumberVerified: true,
    bio: 'Administrator user for testing',
  },
  guest: {
    id: 'user-guest-1',
    name: 'Guest User',
    createdAt: new Date('2023-01-04'),
    email: 'guest@example.com',
    emailVerified: false,
    image: 'https://example.com/avatar-guest.jpg',
    updatedAt: new Date('2023-01-04'),
    role: 'user',
    phoneNumberVerified: false,
    bio: 'Guest user for testing',
  },
  member: {
    id: 'user-member-1',
    name: 'Member User',
    createdAt: new Date('2023-01-03'),
    email: 'member@example.com',
    emailVerified: true,
    image: 'https://example.com/avatar-member.jpg',
    updatedAt: new Date('2023-01-03'),
    role: 'user',
    phoneNumber: '+1234567891',
    phoneNumberVerified: true,
    bio: 'Member user for testing',
  },
  owner: {
    id: 'user-owner-1',
    name: 'Owner User',
    createdAt: new Date('2023-01-01'),
    email: 'owner@example.com',
    emailVerified: true,
    image: 'https://example.com/avatar-owner.jpg',
    updatedAt: new Date('2023-01-01'),
    role: 'admin',
    phoneNumber: '+1234567892',
    phoneNumberVerified: true,
    bio: 'Owner user for testing',
  },
} as const;

/**
 * Mock organizations
 */
export const mockOrganizations = {
  primary: {
    id: 'org-primary-1',
    name: 'Primary Organization',
    createdAt: new Date('2023-01-01'),
    description: 'Primary test organization',
    slug: 'primary-org',
    updatedAt: new Date('2023-01-01'),
  },
  secondary: {
    id: 'org-secondary-1',
    name: 'Secondary Organization',
    createdAt: new Date('2023-01-02'),
    description: 'Secondary test organization',
    slug: 'secondary-org',
    updatedAt: new Date('2023-01-02'),
  },
} as const;

/**
 * Mock teams
 */
export const mockTeams = {
  development: {
    id: 'team-dev-1',
    name: 'Development Team',
    createdAt: new Date('2023-01-01'),
    description: 'Software development team',
    organizationId: mockOrganizations.primary.id,
    updatedAt: new Date('2023-01-01'),
  },
  marketing: {
    id: 'team-marketing-1',
    name: 'Marketing Team',
    createdAt: new Date('2023-01-02'),
    description: 'Marketing and growth team',
    organizationId: mockOrganizations.primary.id,
    updatedAt: new Date('2023-01-02'),
  },
} as const;

/**
 * Creates a mock session for testing
 */
export function createMockSession(
  user: User = mockUsers.member,
  organizationId?: string,
  _role?: OrganizationRole,
): AuthSession {
  const session: Session = {
    id: `session-${user.id}`,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    ipAddress: '127.0.0.1',
    token: `mock-token-${user.id}`,
    updatedAt: new Date(),
    userAgent: 'Mock User Agent',
    userId: user.id,
  };

  return {
    activeOrganizationId: organizationId || mockOrganizations.primary.id,
    session,
    user,
  };
}

/**
 * Mock authentication state manager
 */
export class MockAuthState {
  private currentSession: AuthSession | null = null;
  private authenticatedState = false;

  setSession(session: AuthSession | null) {
    this.currentSession = session;
    this.authenticatedState = !!session;
  }

  getSession(): AuthSession | null {
    return this.currentSession;
  }

  isAuthenticated(): boolean {
    return this.authenticatedState;
  }

  getCurrentUser(): User | null {
    return this.currentSession?.user || null;
  }

  getCurrentOrganizationId(): string | null {
    return this.currentSession?.activeOrganizationId || null;
  }

  setActiveOrganization(organizationId: string) {
    if (this.currentSession) {
      this.currentSession.activeOrganizationId = organizationId;
      this.currentSession.session.activeOrganizationId = organizationId;
    }
  }

  signOut() {
    this.currentSession = null;
    this.authenticatedState = false;
  }

  reset() {
    this.signOut();
  }
}

/**
 * Global mock auth state instance
 */
export const mockAuthState = new MockAuthState();

/**
 * Mock auth functions
 */
export const mockAuth = {
  api: {
    addMember: vi.fn().mockResolvedValue({ success: true }),
    createApiKey: vi.fn().mockResolvedValue({
      apiKey: 'mock-api-key-12345',
      success: true,
    }),
    createOrganization: vi.fn().mockResolvedValue({
      organization: mockOrganizations.primary,
      success: true,
    }),
    forgotPassword: vi.fn().mockResolvedValue({ success: true }),
    getSession: vi.fn().mockImplementation(() => mockAuthState.getSession()),
    hasPermission: vi.fn().mockResolvedValue({ hasPermission: true }),
    listApiKeys: vi.fn().mockResolvedValue({
      apiKeys: [],
      success: true,
    }),
    listOrganizations: vi.fn().mockResolvedValue([mockOrganizations.primary]),
    removeMember: vi.fn().mockResolvedValue({ success: true }),
    resetPassword: vi.fn().mockResolvedValue({ success: true }),
    revokeApiKey: vi.fn().mockResolvedValue({ success: true }),
    setActiveOrganization: vi.fn().mockImplementation(({ body }) => {
      mockAuthState.setActiveOrganization(body.organizationId);
      return Promise.resolve({ success: true });
    }),
    signIn: vi.fn().mockResolvedValue({ success: true }),
    signOut: vi.fn().mockImplementation(() => {
      mockAuthState.signOut();
      return Promise.resolve();
    }),
    signUp: vi.fn().mockResolvedValue({ success: true }),
    updateMemberRole: vi.fn().mockResolvedValue({ success: true }),
    verifyApiKey: vi.fn().mockResolvedValue({
      valid: true,
      key: { id: 'mock-key-1', permissions: ['read'] },
    }),
    verifyEmail: vi.fn().mockResolvedValue({ success: true }),
  },
};

/**
 * Mock client auth methods
 */
export const mockClientAuth = {
  forgotPassword: vi.fn().mockResolvedValue({ success: true }),
  resetPassword: vi.fn().mockResolvedValue({ success: true }),
  signIn: vi.fn().mockResolvedValue({ success: true }),
  signOut: vi.fn().mockImplementation(() => {
    mockAuthState.signOut();
    return Promise.resolve();
  }),
  signUp: vi.fn().mockResolvedValue({ success: true }),
  verifyEmail: vi.fn().mockResolvedValue({ success: true }),
};

/**
 * Setup mock authenticated user for tests
 */
export function setupMockAuthenticatedUser(
  userType: keyof typeof mockUsers = 'member',
  organizationId?: string,
  role: OrganizationRole = 'member',
) {
  const user = mockUsers[userType];
  const session = createMockSession(user, organizationId, role);
  mockAuthState.setSession(session);
  return session;
}

/**
 * Setup mock unauthenticated state for tests
 */
export function setupMockUnauthenticated() {
  mockAuthState.reset();
}

/**
 * Reset all mocks
 */
export function resetMocks() {
  vi.clearAllMocks();
  mockAuthState.reset();
}
