/**
 * Better Auth RSC Component Types
 * All types for Tailwind v4 RSC Better Auth components
 */

// Base component props
export interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}

// Form validation states
export interface FormState {
  success?: boolean;
  error?: string;
  errors?: Record<string, string[]>;
}

// Authentication form types
export interface SignInFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpFormData {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
  token: string;
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Two-factor authentication
export interface TwoFactorSetupData {
  totpCode: string;
}

export interface TwoFactorVerificationData {
  code: string;
}

// OTP forms
export interface EmailOTPFormData {
  email: string;
  code?: string;
}

export interface PhoneVerificationFormData {
  phoneNumber: string;
  code?: string;
}

// Session management
export interface Session {
  id: string;
  userId: string;
  userAgent?: string;
  ipAddress?: string;
  location?: string;
  isCurrent: boolean;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

// Account management
export interface ProfileFormData {
  name: string;
  email: string;
  bio?: string;
  image?: string;
}

// Organization management
export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  role: string;
}

export interface OrganizationInviteData {
  email: string;
  role: string;
  organizationId: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedAt: Date;
  avatar?: string;
}

// API Key management
export interface APIKey {
  id: string;
  name: string;
  key: string; // Masked for display
  createdAt: Date;
  expiresAt?: Date;
  lastUsed?: Date;
  enabled: boolean;
}

export interface CreateAPIKeyData {
  name: string;
  expiresIn?: number;
  permissions?: string[];
}

// Admin types
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  createdAt: Date;
  lastSignIn?: Date;
  banned: boolean;
}

// Social login providers
export type SocialProvider = 'google' | 'github' | 'discord' | 'facebook' | 'microsoft';

// Form component props
export interface FormProps extends BaseProps {
  action: (formData: FormData) => Promise<FormState>;
  initialState?: FormState;
}

// Button variants for Tailwind v4
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

// Input types
export type InputType = 'text' | 'email' | 'password' | 'tel' | 'url' | 'search';

// Alert types
export type AlertType = 'info' | 'success' | 'warning' | 'error';

// Badge variants
export type BadgeVariant = 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
