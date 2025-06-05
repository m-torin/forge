/**
 * Shared TypeScript types for authentication
 */

import type { Session, User } from 'better-auth';
import type { Invitation, Member, Organization, Team, ApiKey } from '@repo/database/prisma';

// Re-export Better Auth types
export type { Session, User } from 'better-auth';

// Re-export database types
export type { Invitation, Member, Organization, Team, ApiKey } from '@repo/database/prisma';

// Auth configuration
export interface AuthConfig {
  secret: string;
  databaseUrl: string;
  appUrl: string;
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
  features: {
    organizations: boolean;
    apiKeys: boolean;
    admin: boolean;
    twoFactor: boolean;
    passkeys: boolean;
    magicLink: boolean;
  };
}

// Session data structure
export interface AuthSession {
  user: User;
  session: Session;
  activeOrganizationId?: string;
}

// Organization role types
export type OrganizationRole = 'owner' | 'admin' | 'member';

// Permission types
export interface Permission {
  resource: string;
  actions: string[];
}

// Auth context for React
export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Client auth methods
export interface AuthClientMethods {
  signIn: (credentials: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  signUp: (data: { email: string; password: string; name?: string }) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (token: string, password: string) => Promise<{ success: boolean; error?: string }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; error?: string }>;
}

// Server auth methods
export interface AuthServerMethods {
  getSession: (request?: Request) => Promise<AuthSession | null>;
  getCurrentUser: () => Promise<User | null>;
  validateSession: (sessionId: string) => Promise<boolean>;
  invalidateSession: (sessionId: string) => Promise<void>;
}

// Error types
export interface AuthError {
  code: string;
  message: string;
  details?: unknown;
}