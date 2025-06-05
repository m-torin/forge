/**
 * Storybook-specific mocks for auth components
 */

import { vi } from 'vitest';
import { createMockSession, mockUsers, mockOrganizations } from './auth';

import type { 
  AuthContextType,
  AuthSession,
  OrganizationRole,
} from '../../shared/types';

/**
 * Mock Auth Context for Storybook
 */
export function createMockAuthContext(
  authenticated = true,
  userType: keyof typeof mockUsers = 'member',
  organizationId?: string,
  role: OrganizationRole = 'member'
): AuthContextType {
  if (!authenticated) {
    return {
      isAuthenticated: false,
      isLoading: false,
      session: null,
      user: null,
    };
  }

  const user = mockUsers[userType];
  const session = createMockSession(user, organizationId, role);

  return {
    isAuthenticated: true,
    isLoading: false,
    session: session.session,
    user: session.user,
  };
}

/**
 * Storybook decorators for auth state
 */
export const authDecorators = {
  /**
   * Authenticated user decorator
   */
  authenticated: (userType: keyof typeof mockUsers = 'member') => (Story: any) => {
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
        userRole: 'owner',
        isLoading: false,
        error: null,
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
        userRole: 'admin',
        isLoading: false,
        error: null,
      }),
    }));

    return Story();
  },
};

/**
 * Mock API responses for Storybook
 */
export const storybookApiMocks = {
  // Auth endpoints
  '/api/auth/sign-in': {
    POST: { success: true },
  },
  '/api/auth/sign-up': {
    POST: { success: true },
  },
  '/api/auth/sign-out': {
    POST: { success: true },
  },
  '/api/auth/session': {
    GET: createMockSession(),
  },

  // Organization endpoints
  '/api/auth/organizations': {
    GET: { success: true, organizations: [mockOrganizations.primary] },
    POST: { success: true, organization: mockOrganizations.primary },
  },
  '/api/auth/organizations/:id': {
    GET: { success: true, organization: mockOrganizations.primary },
    PATCH: { success: true, organization: mockOrganizations.primary },
    DELETE: { success: true },
  },

  // Team endpoints
  '/api/auth/teams': {
    GET: { success: true, teams: [] },
    POST: { success: true, team: { id: 'mock-team-1', name: 'Mock Team' } },
  },
  '/api/auth/teams/:id': {
    GET: { success: true, team: { id: 'mock-team-1', name: 'Mock Team' } },
    PATCH: { success: true, team: { id: 'mock-team-1', name: 'Updated Team' } },
    DELETE: { success: true },
  },

  // API Key endpoints
  '/api/auth/api-keys': {
    GET: { success: true, keys: [] },
    POST: { success: true, apiKey: 'mock-api-key-12345' },
  },
  '/api/auth/api-keys/:id': {
    DELETE: { success: true },
    PATCH: { success: true },
  },
};

/**
 * Setup MSW handlers for Storybook
 */
export function createStorybookHandlers() {
  const handlers: any[] = [];

  Object.entries(storybookApiMocks).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, response]) => {
      // This would be used with MSW (Mock Service Worker)
      // handlers.push(
      //   rest[method.toLowerCase()](path, (req, res, ctx) => {
      //     return res(ctx.json(response));
      //   })
      // );
    });
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
        };
      case 'unauthenticated':
        return {
          isAuthenticated: false,
          isLoading: false,
          session: null,
          user: null,
        };
      default:
        return createMockAuthContext(true, 'member');
    }
  },

  useOrganization: () => ({
    currentOrganization: mockOrganizations.primary,
    userRole: 'member' as OrganizationRole,
    isLoading: false,
    error: null,
    switchOrganization: vi.fn(),
  }),

  useTeams: () => ({
    teams: [],
    loading: false,
    error: null,
    fetchTeams: vi.fn(),
    createTeam: vi.fn().mockResolvedValue({ success: true }),
    updateTeam: vi.fn().mockResolvedValue({ success: true }),
    deleteTeam: vi.fn().mockResolvedValue({ success: true }),
  }),

  useApiKeys: () => ({
    keys: [],
    loading: false,
    error: null,
    fetchKeys: vi.fn(),
    createKey: vi.fn().mockResolvedValue({ success: true, apiKey: 'mock-key' }),
    revokeKey: vi.fn().mockResolvedValue({ success: true }),
    updateKey: vi.fn().mockResolvedValue({ success: true }),
  }),
};