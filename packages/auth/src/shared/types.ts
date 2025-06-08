/**
 * Shared TypeScript types for authentication
 */

import type { ApiKeyValidationResult } from './api-keys/types';
// Import types needed internally
import type { ApiKey, Organization, Team } from '@repo/database/prisma';
import type { Session, User } from 'better-auth';

// Re-export Better Auth types
export type { Session, User } from 'better-auth';

// Re-export database types
export type {
  ApiKey,
  Invitation,
  Member,
  Organization,
  Team,
  TeamMember,
} from '@repo/database/prisma';

// Auth configuration
export interface AuthConfig {
  apiKeys?: {
    enableServiceAuth?: boolean;
    defaultPermissions?: string[];
    expirationDays?: number;
    rateLimiting?: {
      enabled: boolean;
      requestsPerMinute: number;
    };
  };
  appUrl: string;
  databaseUrl: string;
  features: {
    organizations: boolean;
    apiKeys: boolean;
    admin: boolean;
    twoFactor: boolean;
    passkeys: boolean;
    magicLink: boolean;
    teams: boolean;
    advancedMiddleware: boolean;
    serviceToService: boolean;
    impersonation: boolean;
    organizationInvitations: boolean;
    sessionCaching: boolean;
  };
  middleware?: {
    enableApiMiddleware?: boolean;
    enableNodeMiddleware?: boolean;
    enableWebMiddleware?: boolean;
    requireAuthentication?: boolean;
    redirectTo?: string;
    publicPaths?: string[];
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
  teams?: {
    enableInvitations?: boolean;
    defaultPermissions?: string[];
    maxTeamsPerOrganization?: number;
  };
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

// Team types (basic - extended types in teams module)
export interface TeamInvitation {
  email: string;
  expiresAt: Date;
  id: string;
  invitedBy: string;
  role: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  teamId: string;
}

// Alias for compatibility (Member is already exported above)
export type { Member as OrganizationMember } from '@repo/database/prisma';

// Organization types
export interface OrganizationWithMembers {
  id: string;
  members: {
    id: string;
    userId: string;
    role: OrganizationRole;
    user: User;
  }[];
  name: string;
  slug: string;
}

// Middleware types
export interface MiddlewareOptions {
  enableRateLimit?: boolean;
  enableSessionCache?: boolean;
  publicPaths?: string[];
  redirectTo?: string;
  requireAuth?: boolean;
}

// Service-to-service auth types
export interface ServiceAuthOptions {
  expiresIn?: string;
  permissions: string[];
  serviceId: string;
}

// Impersonation types
export interface ImpersonationContext {
  expiresAt?: Date;
  impersonatorId: string;
  permissions: string[];
  startedAt: Date;
  targetUserId: string;
}

// Conditional types for feature-based method exposure
export type ConditionalAuthMethods<TConfig extends AuthConfig> =
  (TConfig['features']['teams'] extends true ? TeamMethods : {}) &
    (TConfig['features']['apiKeys'] extends true ? ApiKeyMethods : {}) &
    (TConfig['features']['impersonation'] extends true ? ImpersonationMethods : {}) &
    (TConfig['features']['organizations'] extends true ? OrganizationMethods : {});

// Enhanced conditional types for middleware
export type ConditionalMiddleware<TConfig extends AuthConfig> =
  (TConfig['features']['advancedMiddleware'] extends true
    ? {
        createApiMiddleware: typeof import('../middleware/api').createApiMiddleware;
        createNodeMiddleware: typeof import('../middleware/node').createNodeMiddleware;
        createWebMiddleware: typeof import('../middleware/web').createWebMiddleware;
        createAdvancedMiddleware: typeof import('../middleware/factory').createAdvancedMiddleware;
      }
    : {}) & {
    createAuthMiddleware: typeof import('../middleware').createAuthMiddleware;
  };

// Type-safe configuration validation
export type ValidateConfig<T extends Partial<AuthConfig>> = T & {
  features: T['features'] extends undefined
    ? AuthConfig['features']
    : T['features'] & AuthConfig['features'];
};

// Utility type to extract enabled features
export type EnabledFeatures<TConfig extends AuthConfig> = {
  [K in keyof TConfig['features']]: TConfig['features'][K] extends true ? K : never;
}[keyof TConfig['features']];

// Type for conditional plugin configuration
export interface ConditionalPluginConfig<TConfig extends AuthConfig> {
  admin: TConfig['features']['admin'] extends true ? boolean : false;
  apiKeys: TConfig['features']['apiKeys'] extends true ? boolean : false;
  impersonation: TConfig['features']['impersonation'] extends true ? boolean : false;
  magicLink: TConfig['features']['magicLink'] extends true ? boolean : false;
  organizations: TConfig['features']['organizations'] extends true ? boolean : false;
  passkeys: TConfig['features']['passkeys'] extends true ? boolean : false;
  sessionCaching: TConfig['features']['sessionCaching'] extends true ? boolean : false;
  teams: TConfig['features']['teams'] extends true ? boolean : false;
  twoFactor: TConfig['features']['twoFactor'] extends true ? boolean : false;
}

// Feature-specific method interfaces
export interface TeamMethods {
  createTeam: (data: {
    name: string;
    description?: string;
  }) => Promise<{ success: boolean; team?: Team; error?: string }>;
  inviteToTeam: (
    teamId: string,
    email: string,
    role: string,
  ) => Promise<{ success: boolean; error?: string }>;
  removeFromTeam: (teamId: string, userId: string) => Promise<{ success: boolean; error?: string }>;
  updateTeamRole: (
    teamId: string,
    userId: string,
    role: string,
  ) => Promise<{ success: boolean; error?: string }>;
}

export interface ApiKeyMethods {
  createApiKey: (data: {
    name: string;
    permissions: string[];
    expiresAt?: Date;
  }) => Promise<{ success: boolean; apiKey?: string; error?: string }>;
  listApiKeys: () => Promise<{ success: boolean; keys?: ApiKey[]; error?: string }>;
  revokeApiKey: (keyId: string) => Promise<{ success: boolean; error?: string }>;
  validateApiKey: (key: string) => Promise<ApiKeyValidationResult>;
}

export interface ImpersonationMethods {
  getImpersonationContext: () => Promise<ImpersonationContext | null>;
  startImpersonation: (targetUserId: string) => Promise<{ success: boolean; error?: string }>;
  stopImpersonation: () => Promise<{ success: boolean; error?: string }>;
}

export interface OrganizationMethods {
  checkPermission: (permission: string, organizationId?: string) => Promise<boolean>;
  getCurrentOrganization: () => Promise<Organization | null>;
  getOrganizationBySlug: (slug: string) => Promise<Organization | null>;
  switchOrganization: (organizationId: string) => Promise<{ success: boolean; error?: string }>;
}
