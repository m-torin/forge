/**
 * Auth Types
 * All types are properly inferred from Better Auth
 */

import type { authClient } from './client/client';
import type { auth } from './shared/auth';

// Server-inferred types (source of truth)
export type Session = typeof auth.$Infer.Session;
export type User = any; // TODO: Fix Better Auth type inference - typeof auth.$Infer.User;
export type Organization = typeof auth.$Infer.Organization;
export type ApiKey = typeof auth.$Infer.ApiKey;

// Client types should match server
export type ClientSession = typeof authClient.$Infer.Session;
export type ClientUser = any; // TODO: Fix Better Auth type inference - typeof authClient.$Infer.User;

// Extended types for backward compatibility
export interface AuthSession {
  user: User;
  session: Session['session'];
  activeOrganizationId?: string;
}

export interface AuthResponse<T = any> {
  data: T | null;
  error?: string;
  success: boolean;
}

// Role types
export type UserRole = 'user' | 'admin' | 'super-admin';
export type OrganizationRole = 'owner' | 'admin' | 'member' | 'guest';
export type TeamRole = 'owner' | 'admin' | 'member';

// Account types
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

// Additional types for user management
export interface UpdateUserData {
  name?: string;
  image?: string;
  bio?: string;
  locale?: string;
  timezone?: string;
}

export interface ChangeEmailData {
  newEmail: string;
  callbackURL?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions?: boolean;
}

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

// Middleware and configuration types
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

// Team and Member types
export interface Member {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  organizationId: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
