/**
 * Shared API key types and interfaces
 */

export interface ApiKeyPermissions {
  actions: string[];
  resources: string[];
}

export interface ApiKeyValidationResult {
  error?: string;
  isValid: boolean;
  keyData?: {
    id: string;
    organizationId: string;
    permissions: ApiKeyPermissions;
    expiresAt?: Date;
    name: string;
    lastUsedAt?: Date;
  };
}

export interface CreateApiKeyData {
  expiresAt?: Date;
  name: string;
  organizationId?: string;
  permissions: string[];
}

export interface CreateApiKeyResult {
  apiKey?: string;
  error?: string;
  keyId?: string;
  success: boolean;
}

export interface ApiKeyListItem {
  createdAt: Date;
  expiresAt?: Date;
  id: string;
  isActive: boolean;
  lastUsedAt?: Date;
  name: string;
  permissions: string[];
}

export interface ListApiKeysResult {
  error?: string;
  keys?: ApiKeyListItem[];
  success: boolean;
  total?: number;
}

export interface RevokeApiKeyResult {
  error?: string;
  success: boolean;
}

export interface UpdateApiKeyData {
  expiresAt?: Date;
  name?: string;
  permissions?: string[];
}

export interface UpdateApiKeyResult {
  error?: string;
  success: boolean;
}

// Permission check types
export type PermissionCheck = Record<string, string[]>;

// Service-to-service authentication types
export interface ServiceAuthOptions {
  expiresIn?: string;
  permissions: string[];
  serviceId: string;
}

export interface ServiceAuthResult {
  error?: string;
  expiresAt?: Date;
  success: boolean;
  token?: string;
}

// Rate limiting types for API keys
export interface ApiKeyRateLimit {
  currentUsage: {
    minute: number;
    hour: number;
    day: number;
  };
  requestsPerDay: number;
  requestsPerHour: number;
  requestsPerMinute: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: Date;
}
