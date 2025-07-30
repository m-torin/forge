/**
 * Auth Types
 * All types are properly inferred from Better Auth
 */

import type { authClient } from './client/client';
import type { auth } from './shared/auth';

/**
 * Server-side session type inferred from Better Auth configuration
 */
export type Session = typeof auth.$Infer.Session;

/**
 * Server-side user type inferred from Better Auth configuration
 * TODO: Fix Better Auth type inference - typeof auth.$Infer.User;
 */
export type User = any;

/**
 * Organization type inferred from Better Auth configuration
 */
export type Organization = typeof auth.$Infer.Organization;

/**
 * API key type inferred from Better Auth configuration
 */
export type ApiKey = typeof auth.$Infer.ApiKey;

/**
 * Client-side session type matching server session
 */
export type ClientSession = typeof authClient.$Infer.Session;

/**
 * Client-side user type matching server user
 * TODO: Fix Better Auth type inference - typeof authClient.$Infer.User;
 */
export type ClientUser = any;

/**
 * Extended authentication session interface for backward compatibility
 */
export interface AuthSession {
  user: User;
  session: Session['session'];
  activeOrganizationId?: string;
}

/**
 * Standard API response wrapper interface
 */
export interface AuthResponse<T = any> {
  data: T | null;
  error?: string;
  success: boolean;
}

/**
 * User role levels for system-wide permissions
 */
export type UserRole = 'user' | 'admin' | 'super-admin';

/**
 * Organization role levels for organization-specific permissions
 */
export type OrganizationRole = 'owner' | 'admin' | 'member' | 'guest';

/**
 * Team role levels for team-specific permissions
 */
export type TeamRole = 'owner' | 'admin' | 'member';

/**
 * OAuth account linking information
 */
export interface Account {
  id: string;
  accountId: string;
  providerId: string;
  userId: string;
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
  accessTokenExpiresAt?: Date;
  refreshTokenExpiresAt?: Date;
  scope?: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data structure for updating user profile information
 */
export interface UpdateUserData {
  name?: string;
  image?: string;
  bio?: string;
  locale?: string;
  timezone?: string;
}

/**
 * Data structure for changing user email address
 */
export interface ChangeEmailData {
  newEmail: string;
  callbackURL?: string;
}

/**
 * Data structure for changing user password with verification
 */
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions?: boolean;
}

/**
 * Data structure for setting new password (without current password)
 */
export interface SetPasswordData {
  newPassword: string;
}

export interface DeleteUserData {
  callbackURL?: string;
  password?: string;
  token?: string;
}

export interface LinkSocialData {
  provider: string;
  callbackURL?: string;
  scopes?: string[];
}

export interface UnlinkAccountData {
  providerId: string;
  accountId?: string;
}

/**
 * Configuration options for authentication middleware
 */
export interface MiddlewareOptions {
  enabled?: boolean;
  skipPaths?: string[];
  redirectTo?: string;
  publicPaths?: string[];
  enableRateLimit?: boolean;
  requireAuth?: boolean;
  enableSessionCache?: boolean;
  [key: string]: any; // Allow additional properties for flexibility
}

/**
 * Main authentication configuration interface
 */
export interface AuthConfig {
  baseURL?: string;
  secret?: string;
  providers?: any;
  session?: any;
  database?: any;
  features?: any;
  middleware?: any;
  [key: string]: any; // Allow additional properties for flexibility
}

export interface AuthContextType {
  user: any;
  session: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (credentials: any) => Promise<any>;
  signOut: () => Promise<void>;
  requireAuth: () => any;
}

export interface AuthClientMethods {
  signIn: (credentials: any) => Promise<any>;
  signUp: (data: any) => Promise<any>;
  signOut: () => Promise<void>;
  getSession: () => Promise<any>;
  forgotPassword?: (email: any) => Promise<any>;
  resetPassword?: (token: any, password: any) => Promise<any>;
  verifyEmail?: (token: any) => Promise<any>;
}

export interface ConditionalAuthMethods<_T = any> {
  [key: string]: any;
}

export interface ConditionalMiddleware<_T = any> {
  [key: string]: any;
}

export interface ConditionalPluginConfig<_T = any> {
  [key: string]: any;
}

// Better Auth compatibility types
export interface ValidateConfig<_T = any> {
  [key: string]: any;
}

/**
 * Organization member information
 */
export interface Member {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Team information within an organization
 */
export interface Team {
  id: string;
  name: string;
  organizationId: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
