/**
 * Type definitions for Tailwind v4 RSC Auth Components
 */

export interface BaseProps {
  children?: React.ReactNode;
  className?: string;
}

export interface FormState {
  success: boolean;
  error?: string;
  errors?: Record<string, string[]>;
  message?: string;
  data?: any;
  count?: number;
  invitationsSent?: number;
}

// Common server action return types
export type ServerActionState =
  | { success: false; errors: Record<string, string[]>; message?: undefined; error?: undefined }
  | { success: true; message: string; errors?: undefined; error?: undefined }
  | { success: false; error: string; errors?: undefined; message?: undefined };

// Helper to create proper initial states for useFormState
export const createInitialActionState = (): any => ({ success: false, error: '' });

// Button component types
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'default';
export type ButtonSize = 'sm' | 'md' | 'lg';

// Input component types
export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'date'
  | 'datetime-local'
  | 'time'
  | 'month'
  | 'week';

// Alert component types - using 'variant' for consistency
export type AlertVariant = 'default' | 'destructive' | 'success' | 'warning';

// Legacy type for backward compatibility
export type AlertType = 'info' | 'success' | 'warning' | 'error';

// Form field types
export interface FormField {
  name: string;
  label?: string;
  type?: InputType;
  placeholder?: string;
  required?: boolean;
  error?: string;
  description?: string;
}

// Auth flow types
export type AuthStep = 'signin' | 'signup' | 'verify' | 'reset' | 'success';
export type AuthProvider = 'google' | 'github' | 'microsoft' | 'apple' | 'facebook';

// Organization types
export interface Organization {
  id: string;
  name: string;
  slug: string;
  role: 'owner' | 'admin' | 'member';
  memberCount: number;
  plan?: string;
  image?: string;
}

// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  role?: string;
  banned?: boolean;
}

// Session types
export interface Session {
  id: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

// Team types
export interface Team {
  id: string;
  name: string;
  description?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

// API Key types
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  scopes: string[];
  expiresAt?: string;
  createdAt: string;
  lastUsedAt?: string;
}
