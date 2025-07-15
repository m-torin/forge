/**
 * Auth Types
 * All types are properly inferred from Better Auth with proper TypeScript interfaces
 */

import type { authClient } from './client/client';
import type { auth } from './shared/auth';
import type {
  AuthResult,
  DatabaseConfig,
  EmailCredentials,
  FeatureConfig,
  MiddlewareConfig,
  ProviderConfig,
  SessionConfig,
  SessionData,
  UserProfile,
  UserRegistrationData,
} from './types/auth-interfaces';

// Import properly typed interfaces
export * from './types/auth-interfaces';

/**
 * Server-side session type inferred from Better Auth configuration
 */
export type Session = typeof auth.$Infer.Session;

/**
 * Server-side user type inferred from Better Auth configuration
 */
export type User = UserProfile;

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
 */
export type ClientUser = UserProfile;

/**
 * Extended authentication session interface for backward compatibility
 */
export interface AuthSession {
  user: UserProfile;
  session: SessionData;
  activeOrganizationId?: string;
}

/**
 * Standard API response wrapper interface (deprecated - use AuthResult instead)
 * @deprecated Use AuthResult<T> for better type safety
 */
export interface AuthResponse<T = unknown> {
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
 * @deprecated Use MiddlewareConfig instead for better type safety
 */
export interface MiddlewareOptions {
  enabled?: boolean;
  skipPaths?: string[];
  redirectTo?: string;
  publicPaths?: string[];
  enableRateLimit?: boolean;
  requireAuth?: boolean;
  enableSessionCache?: boolean;
  corsOrigins?: string[];
  allowedRoles?: string[];
  sessionRequired?: boolean;
  additionalConfig?: Record<string, unknown>;
}

/**
 * Main authentication configuration interface
 * @deprecated Use AuthConfiguration instead for better type safety
 */
export interface AuthConfig {
  baseURL?: string;
  secret?: string;
  providers?: Record<string, ProviderConfig>;
  session?: SessionConfig;
  database?: DatabaseConfig;
  features?: Partial<FeatureConfig>;
  middleware?: MiddlewareConfig;
  additionalSettings?: Record<string, unknown>;
  // Legacy test properties
  appUrl?: string;
  databaseUrl?: string;
  apiKeys?: {
    defaultPermissions?: string[];
    enableServiceAuth?: boolean;
    expirationDays?: number;
    rateLimiting?: {
      enabled?: boolean;
      requestsPerMinute?: number;
    };
  };
  teams?: {
    enableInvitations?: boolean;
    defaultPermissions?: string[];
    maxTeamsPerOrganization?: number;
  };
}

/**
 * @deprecated Use AuthContext instead for better type safety
 */
export interface AuthContextType {
  user: UserProfile | null;
  session: SessionData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (credentials: EmailCredentials) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  requireAuth: () => UserProfile;
}

/**
 * @deprecated Use TypedAuthClientMethods instead for better type safety
 */
export interface AuthClientMethods {
  signIn: (credentials: EmailCredentials) => Promise<AuthResult>;
  signUp: (data: UserRegistrationData) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  getSession: () => Promise<AuthResult<{ user: UserProfile; session: SessionData }>>;
  forgotPassword?: (email: string) => Promise<AuthResult>;
  resetPassword?: (token: string, password: string) => Promise<AuthResult>;
  verifyEmail?: (token: string) => Promise<AuthResult>;
}

/**
 * @deprecated Legacy interface for conditional auth methods
 */
export interface ConditionalAuthMethods<T = Record<string, unknown>> {
  [key: string]: T | ((...args: unknown[]) => unknown);
}

/**
 * @deprecated Legacy interface for conditional middleware
 */
export interface ConditionalMiddleware<T = Record<string, unknown>> {
  [key: string]: T | ((...args: unknown[]) => unknown);
}

/**
 * @deprecated Legacy interface for conditional plugin config
 */
export interface ConditionalPluginConfig<T = Record<string, unknown>> {
  [key: string]: T;
}

/**
 * @deprecated Better Auth compatibility types - use specific interfaces instead
 */
export interface ValidateConfig<T = Record<string, unknown>> {
  [key: string]: T;
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
