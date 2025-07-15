/**
 * Storybook mock for @repo/auth/client
 * This provides mock authentication functionality for Storybook stories
 */

import { vi } from 'vitest';

// Mock user data for Storybook
const mockUser = {
  id: 'storybook-user-1',
  email: 'user@storybook.local',
  name: 'Storybook User',
  image: 'https://avatars.githubusercontent.com/u/1?v=4',
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockSession = {
  user: mockUser,
  expires: '2025-12-31',
};

// Mock auth client
export const authClient = {
  signIn: vi.fn().mockResolvedValue({ data: mockSession }),
  signOut: vi.fn().mockResolvedValue({ data: null }),
  signUp: vi.fn().mockResolvedValue({ data: mockSession }),
  getSession: vi.fn().mockResolvedValue({ data: mockSession }),
  useSession: vi.fn().mockReturnValue({ data: mockSession, status: 'authenticated' }),
};

// Mock hooks
export const useAuth = vi.fn().mockReturnValue({
  user: mockUser,
  session: mockSession,
  isAuthenticated: true,
  isLoading: false,
  signIn: authClient.signIn,
  signOut: authClient.signOut,
});

export const useUser = vi.fn().mockReturnValue(mockUser);

export const useIsAuthenticated = vi.fn().mockReturnValue(true);

export const useRequireAuth = vi.fn().mockReturnValue({
  user: mockUser,
  session: mockSession,
  isAuthenticated: true,
  isLoading: false,
});

export const useAuthGuard = vi.fn().mockReturnValue({
  user: mockUser,
  session: mockSession,
  isAuthenticated: true,
  isLoading: false,
});

export const useSession = vi.fn().mockReturnValue({
  data: mockSession,
  status: 'authenticated',
});

// Mock auth methods
export const signIn = vi.fn().mockResolvedValue({ data: mockSession });
export const signOut = vi.fn().mockResolvedValue({ data: null });
export const signUp = vi.fn().mockResolvedValue({ data: mockSession });

// Mock admin methods (conditionally available)
export const createUser = vi.fn().mockResolvedValue({ data: mockUser });
export const listUsers = vi.fn().mockResolvedValue({ data: [mockUser] });
export const deleteUser = vi.fn().mockResolvedValue({ data: null });

// Mock API key methods (conditionally available)
export const createApiKey = vi.fn().mockResolvedValue({ data: { key: 'storybook-api-key' } });
export const listApiKeys = vi.fn().mockResolvedValue({ data: [] });
export const deleteApiKey = vi.fn().mockResolvedValue({ data: null });

// Mock organization methods (conditionally available)
export const createOrganization = vi
  .fn()
  .mockResolvedValue({ data: { id: 'org-1', name: 'Storybook Org' } });
export const listOrganizations = vi.fn().mockResolvedValue({ data: [] });
export const deleteOrganization = vi.fn().mockResolvedValue({ data: null });

// Default export for convenience
export default {
  authClient,
  useAuth,
  useUser,
  useIsAuthenticated,
  useRequireAuth,
  useAuthGuard,
  useSession,
  signIn,
  signOut,
  signUp,
  createUser,
  listUsers,
  deleteUser,
  createApiKey,
  listApiKeys,
  deleteApiKey,
  createOrganization,
  listOrganizations,
  deleteOrganization,
};
