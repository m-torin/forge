/**
 * Mock authentication functions for testing
 */

import { vi } from 'vitest';

import type { 
  AuthSession, 
  User, 
  Session,
  OrganizationRole,
} from '../../shared/types';

/**
 * Mock user data
 */
export const mockUsers = {
  owner: {
    id: 'user-owner-1',
    name: 'Owner User',
    email: 'owner@example.com',
    emailVerified: true,
    image: 'https://example.com/avatar-owner.jpg',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  admin: {
    id: 'user-admin-1',
    name: 'Admin User',
    email: 'admin@example.com',
    emailVerified: true,
    image: 'https://example.com/avatar-admin.jpg',
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
  },
  member: {
    id: 'user-member-1',
    name: 'Member User',
    email: 'member@example.com',
    emailVerified: true,
    image: 'https://example.com/avatar-member.jpg',
    createdAt: new Date('2023-01-03'),
    updatedAt: new Date('2023-01-03'),
  },
  guest: {
    id: 'user-guest-1',
    name: 'Guest User',
    email: 'guest@example.com',
    emailVerified: false,
    image: 'https://example.com/avatar-guest.jpg',
    createdAt: new Date('2023-01-04'),
    updatedAt: new Date('2023-01-04'),
  },
} as const;

/**
 * Mock organizations
 */
export const mockOrganizations = {
  primary: {
    id: 'org-primary-1',
    name: 'Primary Organization',
    slug: 'primary-org',
    description: 'Primary test organization',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  secondary: {
    id: 'org-secondary-1',
    name: 'Secondary Organization',
    slug: 'secondary-org',
    description: 'Secondary test organization',
    createdAt: new Date('2023-01-02'),
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
    description: 'Software development team',
    organizationId: mockOrganizations.primary.id,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  marketing: {
    id: 'team-marketing-1',
    name: 'Marketing Team',
    description: 'Marketing and growth team',
    organizationId: mockOrganizations.primary.id,
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
  },
} as const;

/**
 * Creates a mock session for testing
 */
export function createMockSession(
  user: User = mockUsers.member,
  organizationId?: string,
  role: OrganizationRole = 'member'
): AuthSession {
  const session: Session = {
    id: `session-${user.id}`,
    userId: user.id,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    createdAt: new Date(),
    updatedAt: new Date(),
    token: `mock-token-${user.id}`,
    ipAddress: '127.0.0.1',
    userAgent: 'Mock User Agent',
  };

  return {
    session,
    user,
    activeOrganizationId: organizationId || mockOrganizations.primary.id,
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
      (this.currentSession.session as any).activeOrganizationId = organizationId;
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
    getSession: vi.fn().mockImplementation(() => mockAuthState.getSession()),
    signIn: vi.fn().mockResolvedValue({ success: true }),
    signOut: vi.fn().mockImplementation(() => {
      mockAuthState.signOut();
      return Promise.resolve();
    }),
    signUp: vi.fn().mockResolvedValue({ success: true }),
    forgotPassword: vi.fn().mockResolvedValue({ success: true }),
    resetPassword: vi.fn().mockResolvedValue({ success: true }),
    verifyEmail: vi.fn().mockResolvedValue({ success: true }),
    createApiKey: vi.fn().mockResolvedValue({ 
      success: true, 
      apiKey: 'mock-api-key-12345' 
    }),
    verifyApiKey: vi.fn().mockResolvedValue({ 
      valid: true, 
      key: { id: 'mock-key-1', permissions: ['read'] } 
    }),
    revokeApiKey: vi.fn().mockResolvedValue({ success: true }),
    listApiKeys: vi.fn().mockResolvedValue({ 
      success: true, 
      apiKeys: [] 
    }),
    createOrganization: vi.fn().mockResolvedValue({ 
      success: true, 
      organization: mockOrganizations.primary 
    }),
    listOrganizations: vi.fn().mockResolvedValue([mockOrganizations.primary]),
    setActiveOrganization: vi.fn().mockImplementation(({ body }) => {
      mockAuthState.setActiveOrganization(body.organizationId);
      return Promise.resolve({ success: true });
    }),
    addMember: vi.fn().mockResolvedValue({ success: true }),
    removeMember: vi.fn().mockResolvedValue({ success: true }),
    updateMemberRole: vi.fn().mockResolvedValue({ success: true }),
    hasPermission: vi.fn().mockResolvedValue({ hasPermission: true }),
  },
};

/**
 * Mock client auth methods
 */
export const mockClientAuth = {
  signIn: vi.fn().mockResolvedValue({ success: true }),
  signOut: vi.fn().mockImplementation(() => {
    mockAuthState.signOut();
    return Promise.resolve();
  }),
  signUp: vi.fn().mockResolvedValue({ success: true }),
  forgotPassword: vi.fn().mockResolvedValue({ success: true }),
  resetPassword: vi.fn().mockResolvedValue({ success: true }),
  verifyEmail: vi.fn().mockResolvedValue({ success: true }),
};

/**
 * Setup mock authenticated user for tests
 */
export function setupMockAuthenticatedUser(
  userType: keyof typeof mockUsers = 'member',
  organizationId?: string,
  role: OrganizationRole = 'member'
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