/**
 * Auth client exports - Placeholder for future migration
 * This package is a skeleton for migrating authentication functionality
 */

// Placeholder auth types
export interface AuthConfig {
  providers?: string[];
  redirectUrl?: string,
}

export interface AuthSession {
  token: string,
  user: AuthUser,
}

export interface AuthUser {
  email: string,
  id: string,
  name?: string,
}

// Placeholder auth client functions
export function createAuthClient(_config?: any) {
  return {
    getUser: async () => null,
    isAuthenticated: () => false,
    signIn: async () => ({ message: 'Not implemented', success: false }),
    signOut: async () => ({ message: 'Not implemented', success: false }),
  };
}

// Placeholder hooks
export function useAuth() {
  return {
    isAuthenticated: false,
    isLoading: false,
    signIn: async () => {},
    signOut: async () => {},
    user: null,
  };
}

export const authClient = createAuthClient();
