/**
 * Shared API key types and interfaces
 */

export interface ApiKeyPermissions {
  actions: string[];
  resources: string[];
}

export interface ApiKeyValidationResult {
  isValid: boolean;
  keyData?: {
    id: string;
    organizationId: string;
    permissions: ApiKeyPermissions;
    expiresAt?: Date;
    name: string;
    lastUsedAt?: Date;
  };
  error?: string;
}

export interface CreateApiKeyData {
  name: string;
  permissions: string[];
  expiresAt?: Date;
  organizationId?: string;
}

export interface CreateApiKeyResult {
  success: boolean;
  apiKey?: string;
  keyId?: string;
  error?: string;
}

export interface ApiKeyListItem {
  id: string;
  name: string;
  permissions: string[];
  expiresAt?: Date;
  lastUsedAt?: Date;
  createdAt: Date;
  isActive: boolean;
}

export interface ListApiKeysResult {
  success: boolean;
  keys?: ApiKeyListItem[];
  total?: number;
  error?: string;
}

export interface RevokeApiKeyResult {
  success: boolean;
  error?: string;
}

export interface UpdateApiKeyData {
  name?: string;
  permissions?: string[];
  expiresAt?: Date;
}

export interface UpdateApiKeyResult {
  success: boolean;
  error?: string;
}

// Permission check types
export type PermissionCheck = Record<string, string[]>;

// Service-to-service authentication types
export interface ServiceAuthOptions {
  serviceId: string;
  permissions: string[];
  expiresIn?: string;
}

export interface ServiceAuthResult {
  success: boolean;
  token?: string;
  expiresAt?: Date;
  error?: string;
}

// Rate limiting types for API keys
export interface ApiKeyRateLimit {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  currentUsage: {
    minute: number;
    hour: number;
    day: number;
  };
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  limit: number;
}