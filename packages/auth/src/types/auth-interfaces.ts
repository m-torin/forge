/**
 * Properly typed authentication interfaces
 * Replaces any types with specific, secure interfaces
 */

/**
 * User credentials for email/password authentication
 */
export interface EmailCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * OAuth credentials
 */
export interface OAuthCredentials {
  provider: "github" | "google" | "facebook" | "discord" | "microsoft";
  redirectTo?: string;
  scopes?: string[];
}

/**
 * Phone number credentials
 */
export interface PhoneCredentials {
  phoneNumber: string;
  code?: string;
}

/**
 * Magic link credentials
 */
export interface MagicLinkCredentials {
  email: string;
  redirectTo?: string;
}

/**
 * Anonymous session credentials
 */
export interface AnonymousCredentials {
  sessionData?: Record<string, unknown>;
}

/**
 * User registration data
 */
export interface UserRegistrationData {
  email: string;
  password: string;
  name?: string;
  phoneNumber?: string;
  acceptTerms?: boolean;
  marketingConsent?: boolean;
}

/**
 * User profile data
 */
export interface UserProfile {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null;
  bio?: string | null;
  role: string;
  phoneNumber?: string | null;
  phoneNumberVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Session data structure
 */
export interface SessionData {
  id: string;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress?: string;
  userAgent?: string;
  activeOrganizationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Authentication result
 */
export interface AuthResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  user?: UserProfile;
  session?: SessionData;
}

/**
 * Organization configuration
 */
export interface OrganizationConfig {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
  clientId: string;
  clientSecret: string;
  scope?: string[];
  authorizationParams?: Record<string, string>;
  enabled?: boolean;
}

/**
 * Session configuration
 */
export interface SessionConfig {
  expiresIn: number;
  updateAge: number;
  cookieCache: {
    enabled: boolean;
    maxAge: number;
  };
  storeSessionInDatabase: boolean;
}

/**
 * Database configuration
 */
export interface DatabaseConfig {
  adapter: "prisma" | "drizzle" | "kysely";
  provider: "postgresql" | "mysql" | "sqlite";
  url?: string;
}

/**
 * Feature flags configuration
 */
export interface FeatureConfig {
  rateLimiting?: boolean;
  analytics?: boolean;
  phoneAuth?: boolean;
  emailOTP?: boolean;
  anonymousSessions?: boolean;
  accountSecurity?: boolean;
  apiKeys?: boolean;
  twoFactor?: boolean;
  organizations?: boolean;
  admin?: boolean;
  teams?: boolean;
  magicLink?: boolean;
  passkeys?: boolean;
  sessionCaching?: boolean;
  impersonation?: boolean;
  // Additional feature flags found in tests
  advancedMiddleware?: boolean;
  organizationInvitations?: boolean;
  serviceToService?: boolean;
}

/**
 * Middleware configuration
 */
export interface MiddlewareConfig {
  enabled: boolean;
  skipPaths: string[];
  redirectTo: string;
  publicPaths: string[];
  enableRateLimit: boolean;
  requireAuth: boolean;
  enableSessionCache: boolean;
  corsOrigins?: string[];
  enableApiMiddleware?: boolean;
  enableNodeMiddleware?: boolean;
  enableWebMiddleware?: boolean;
  allowedRoles?: string[];
  sessionRequired?: boolean;
}

/**
 * Complete authentication configuration
 */
export interface AuthConfiguration {
  baseURL: string;
  secret: string;
  providers: {
    github?: ProviderConfig;
    google?: ProviderConfig;
    facebook?: ProviderConfig;
    discord?: ProviderConfig;
    microsoft?: ProviderConfig;
  };
  session: SessionConfig;
  database: DatabaseConfig;
  features: FeatureConfig;
  middleware: MiddlewareConfig;
  trustedOrigins: string[];
  appName: string;
}

/**
 * Authentication context type with proper typing
 */
export interface AuthContext {
  user: UserProfile | null;
  session: SessionData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (
    credentials:
      | EmailCredentials
      | OAuthCredentials
      | PhoneCredentials
      | MagicLinkCredentials,
  ) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  requireAuth: () => UserProfile;
}

/**
 * Authentication client methods with proper typing
 */
export interface TypedAuthClientMethods {
  signIn: (
    credentials: EmailCredentials,
  ) => Promise<AuthResult<{ user: UserProfile; session: SessionData }>>;
  signUp: (
    data: UserRegistrationData,
  ) => Promise<AuthResult<{ user: UserProfile; session: SessionData }>>;
  signOut: () => Promise<void>;
  getSession: () => Promise<
    AuthResult<{ user: UserProfile; session: SessionData }>
  >;
  forgotPassword: (email: string) => Promise<AuthResult<{ message: string }>>;
  resetPassword: (
    token: string,
    password: string,
  ) => Promise<AuthResult<{ message: string }>>;
  verifyEmail: (token: string) => Promise<AuthResult<{ message: string }>>;
  signInWithOAuth: (credentials: OAuthCredentials) => Promise<AuthResult>;
  signInWithPhone: (credentials: PhoneCredentials) => Promise<AuthResult>;
  signInWithMagicLink: (
    credentials: MagicLinkCredentials,
  ) => Promise<AuthResult>;
  createAnonymousSession: (
    credentials?: AnonymousCredentials,
  ) => Promise<AuthResult>;
}

/**
 * OTP verification data
 */
export interface OTPVerificationData {
  identifier: string; // email or phone
  code: string;
  type: "email" | "sms" | "totp";
}

/**
 * Two-factor authentication data
 */
export interface TwoFactorData {
  secret?: string;
  backupCodes?: string[];
  enabled: boolean;
  method: "totp" | "sms" | "email";
}

/**
 * API Key data
 */
export interface ApiKeyData {
  id: string;
  name: string;
  key: string;
  expiresAt?: Date;
  permissions: string[];
  lastUsedAt?: Date;
  createdAt: Date;
}

/**
 * Rate limit information
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Security event data
 */
export interface SecurityEvent {
  type:
    | "login"
    | "logout"
    | "password_change"
    | "email_change"
    | "suspicious_activity";
  userId: string;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

/**
 * Organization member with proper typing
 */
export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: "owner" | "admin" | "member" | "guest";
  permissions: string[];
  joinedAt: Date;
  user: UserProfile;
}

/**
 * Invitation data
 */
export interface InvitationData {
  id: string;
  email: string;
  organizationId: string;
  role: "admin" | "member" | "guest";
  expiresAt: Date;
  token: string;
  invitedBy: string;
  createdAt: Date;
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    requestId?: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Success response structure
 */
export interface SuccessResponse<T = unknown> {
  data: T;
  message?: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
}
