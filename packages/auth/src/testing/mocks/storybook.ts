/**
 * Storybook-specific mocks for auth components
 */

import { vi } from 'vitest';

import { createMockSession, mockOrganizations, mockUsers } from './auth';

import type { AuthContextType, OrganizationRole } from '../../shared/types';

/**
 * Mock Auth Context for Storybook
 */
export function createMockAuthContext(
  authenticated = true,
  userType: keyof typeof mockUsers = 'member',
  organizationId?: string,
  role: OrganizationRole = 'member',
): AuthContextType {
  if (!authenticated) {
    return {
      isAuthenticated: false,
      isLoading: false,
      session: null,
      user: null,
      signIn: async () => ({ success: false, error: 'Not authenticated' }),
      signOut: async () => {},
      requireAuth: () => {
        throw new Error('Authentication required');
      },
    };
  }

  const user = mockUsers[userType];
  const session = createMockSession(user, organizationId, role);

  return {
    isAuthenticated: true,
    isLoading: false,
    session: session.session,
    user: session.user,
    signIn: async () => ({ success: true, data: { user: session.user, session: session.session } }),
    signOut: async () => {},
    requireAuth: () => session.user,
  };
}

/**
 * Storybook decorators for auth state
 */
export const authDecorators = {
  /**
   * Authenticated user decorator
   */
  authenticated:
    (userType: keyof typeof mockUsers = 'member') =>
    (Story: any) => {
      const mockContext = createMockAuthContext(true, userType);

      // Mock useAuth hook
      vi.doMock('../../client/hooks', () => ({
        useAuth: () => mockContext,
      }));

      return Story();
    },

  /**
   * Unauthenticated user decorator
   */
  unauthenticated: () => (Story: any) => {
    const mockContext = createMockAuthContext(false);

    // Mock useAuth hook
    vi.doMock('../../client/hooks', () => ({
      useAuth: () => mockContext,
    }));

    return Story();
  },

  /**
   * Loading state decorator
   */
  loading: () => (Story: any) => {
    const mockContext: AuthContextType = {
      isAuthenticated: false,
      isLoading: true,
      session: null,
      user: null,
      signIn: async () => ({ success: false, error: 'Loading' }),
      signOut: async () => {},
      requireAuth: () => {
        throw new Error('Authentication required');
      },
    };

    // Mock useAuth hook
    vi.doMock('../../client/hooks', () => ({
      useAuth: () => mockContext,
    }));

    return Story();
  },

  /**
   * Organization owner decorator
   */
  owner: () => (Story: any) => {
    const mockContext = createMockAuthContext(true, 'owner', undefined, 'owner');

    // Mock useAuth hook and organization methods
    vi.doMock('../../client/hooks', () => ({
      useAuth: () => mockContext,
      useOrganization: () => ({
        currentOrganization: mockOrganizations.primary,
        error: null,
        isLoading: false,
        userRole: 'owner',
      }),
    }));

    return Story();
  },

  /**
   * Organization admin decorator
   */
  admin: () => (Story: any) => {
    const mockContext = createMockAuthContext(true, 'admin', undefined, 'admin');

    // Mock useAuth hook and organization methods
    vi.doMock('../../client/hooks', () => ({
      useAuth: () => mockContext,
      useOrganization: () => ({
        currentOrganization: mockOrganizations.primary,
        error: null,
        isLoading: false,
        userRole: 'admin',
      }),
    }));

    return Story();
  },
};

/**
 * Mock API responses for Storybook
 */
export const storybookApiMocks = {
  '/api/auth/session': {
    GET: createMockSession(),
  },
  // Auth endpoints
  '/api/auth/sign-in': {
    POST: { success: true },
  },
  '/api/auth/sign-out': {
    POST: { success: true },
  },
  '/api/auth/sign-up': {
    POST: { success: true },
  },

  '/api/auth/organizations/:id': {
    DELETE: { success: true },
    GET: { organization: mockOrganizations.primary, success: true },
    PATCH: { organization: mockOrganizations.primary, success: true },
  },
  // Organization endpoints
  '/api/auth/organizations': {
    GET: { organizations: [mockOrganizations.primary], success: true },
    POST: { organization: mockOrganizations.primary, success: true },
  },

  '/api/auth/teams/:id': {
    DELETE: { success: true },
    GET: { success: true, team: { id: 'mock-team-1', name: 'Mock Team' } },
    PATCH: { success: true, team: { id: 'mock-team-1', name: 'Updated Team' } },
  },
  // Team endpoints
  '/api/auth/teams': {
    GET: { success: true, teams: [] },
    POST: { success: true, team: { id: 'mock-team-1', name: 'Mock Team' } },
  },

  '/api/auth/api-keys/:id': {
    DELETE: { success: true },
    PATCH: { success: true },
  },
  // API Key endpoints
  '/api/auth/api-keys': {
    GET: { keys: [], success: true },
    POST: { apiKey: 'mock-api-key-12345', success: true },
  },
};

/**
 * Setup MSW handlers for Storybook
 */
export function createStorybookHandlers() {
  const handlers: any[] = [];

  Object.entries(storybookApiMocks).forEach(() => {
    // This would be used with MSW (Mock Service Worker)
    // handlers.push(
    //   rest[method.toLowerCase()](path, (req, res, ctx) => {
    //     return res(ctx.json(response));
    //   })
    // );
  });

  return handlers;
}

/**
 * Mock implementations for common auth hooks in Storybook
 */
export const storybookMockImplementations = {
  useAuth: (state: 'authenticated' | 'unauthenticated' | 'loading' = 'authenticated') => {
    switch (state) {
      case 'loading':
        return {
          isAuthenticated: false,
          isLoading: true,
          session: null,
          user: null,
          signIn: async () => ({}),
          signOut: async () => {},
          requireAuth: () => null,
        };
      case 'unauthenticated':
        return {
          isAuthenticated: false,
          isLoading: false,
          session: null,
          user: null,
          signIn: async () => ({}),
          signOut: async () => {},
          requireAuth: () => null,
        };
      default:
        return createMockAuthContext(true, 'member');
    }
  },

  useOrganization: () => ({
    currentOrganization: mockOrganizations.primary,
    error: null,
    isLoading: false,
    switchOrganization: vi.fn(),
    userRole: 'member' as OrganizationRole,
  }),

  useTeams: () => ({
    createTeam: vi.fn().mockResolvedValue({ success: true }),
    deleteTeam: vi.fn().mockResolvedValue({ success: true }),
    error: null,
    fetchTeams: vi.fn(),
    loading: false,
    teams: [],
    updateTeam: vi.fn().mockResolvedValue({ success: true }),
  }),

  useApiKeys: () => ({
    createKey: vi.fn().mockResolvedValue({ apiKey: 'mock-key', success: true }),
    error: null,
    fetchKeys: vi.fn(),
    keys: [],
    loading: false,
    revokeKey: vi.fn().mockResolvedValue({ success: true }),
    updateKey: vi.fn().mockResolvedValue({ success: true }),
  }),
};
