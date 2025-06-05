/**
 * Shared TypeScript types for authentication
 */

import type { Session, User } from 'better-auth';

// Re-export Better Auth types
export type { Session, User } from 'better-auth';

// Re-export database types
export type { ApiKey, Invitation, Member, Organization, Team } from '@repo/database/prisma';

// Auth configuration
export interface AuthConfig {
  appUrl: string;
  databaseUrl: string;
  features: {
    organizations: boolean;
    apiKeys: boolean;
    admin: boolean;
    twoFactor: boolean;
    passkeys: boolean;
    magicLink: boolean;
  };
  providers: {
    github?: {
      clientId: string;
      clientSecret: string;
    };
    google?: {
      clientId: string;
      clientSecret: string;
    };
  };
  secret: string;
}

// Session data structure
export interface AuthSession {
  activeOrganizationId?: string;
  session: Session;
  user: User;
}

// Organization role types
export type OrganizationRole = 'owner' | 'admin' | 'member';

// Permission types
export interface Permission {
  actions: string[];
  resource: string;
}

// Auth context for React
export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  session: Session | null;
  user: User | null;
}

// Client auth methods
export interface AuthClientMethods {
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (token: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (credentials: {
    email: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  signUp: (data: {
    email: string;
    password: string;
    name?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; error?: string }>;
}

// Server auth methods
export interface AuthServerMethods {
  getCurrentUser: () => Promise<User | null>;
  getSession: (request?: Request) => Promise<AuthSession | null>;
  invalidateSession: (sessionId: string) => Promise<void>;
  validateSession: (sessionId: string) => Promise<boolean>;
}

// Error types
export interface AuthError {
  code: string;
  details?: unknown;
  message: string;
}
