/**
 * Auth client exports - Placeholder for future migration
 * This package is a skeleton for migrating authentication functionality
 */

// Placeholder auth client functions
export function createAuthClient(config?: any) {
  return {
    signIn: async () => ({ success: false, message: 'Not implemented' }),
    signOut: async () => ({ success: false, message: 'Not implemented' }),
    getUser: async () => null,
    isAuthenticated: () => false,
  };
}

// Placeholder auth types
export interface AuthConfig {
  providers?: string[];
  redirectUrl?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
}

// Placeholder hooks
export function useAuth() {
  return {
    user: null,
    isLoading: false,
    isAuthenticated: false,
    signIn: async () => {},
    signOut: async () => {},
  };
}

export const authClient = createAuthClient();
