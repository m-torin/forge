/**
 * Client-side API key helper functions
 */

import type { PermissionCheck } from '../../shared/api-keys/types';

/**
 * Minimal client-side permission checker - actual validation happens server-side
 * This is primarily for UI state management and should not be trusted for security
 */
export function hasPermission(_permissions: PermissionCheck): boolean {
  // Client-side permission checks are only for UI hints
  // Real validation must always happen server-side
  if (process.env.NODE_ENV === 'development') {
    console.warn('Client-side hasPermission called - actual validation requires server-side check');
  }

  return true; // Optimistic for UI purposes
}

/**
 * Creates properly formatted API key headers for requests
 */
export function createApiKeyHeaders(apiKey: string): Record<string, string> {
  return {
    'x-api-key': apiKey,
  };
}

/**
 * Creates Authorization header with Bearer token format
 */
export function createBearerHeaders(token: string): Record<string, string> {
  return {
    authorization: `Bearer ${token}`,
  };
}

/**
 * Validates API key format on the client side (basic format check only)
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
  // Basic format validation - adjust based on your API key format
  // This is just a client-side hint, not security validation
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }

  // Example: Check if it's at least 32 characters and alphanumeric
  const minLength = 32;
  const pattern = /^[a-zA-Z0-9_-]+$/;

  return apiKey.length >= minLength && pattern.test(apiKey);
}

/**
 * Masks an API key for display purposes (shows first 8 and last 4 characters)
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 12) {
    return '****';
  }

  const start = apiKey.substring(0, 8);
  const end = apiKey.substring(apiKey.length - 4);
  const middle = '*'.repeat(Math.max(0, apiKey.length - 12));

  return `${start}${middle}${end}`;
}

/**
 * Generates a random API key name for display purposes
 */
export function generateApiKeyName(): string {
  const adjectives = ['Quick', 'Secure', 'Fast', 'Smart', 'Auto', 'Main', 'Test', 'Dev'];
  const nouns = ['Access', 'Key', 'Token', 'Auth', 'API', 'Service', 'Client', 'App'];

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const suffix = Math.floor(Math.random() * 1000);

  return `${adjective} ${noun} ${suffix}`;
}

/**
 * Checks if an API key is expired (client-side check only)
 */
export function isApiKeyExpired(expiresAt?: Date): boolean {
  if (!expiresAt) {
    return false; // No expiration
  }

  return new Date() > expiresAt;
}

/**
 * Gets time until API key expires
 */
export function getTimeUntilExpiration(expiresAt?: Date): {
  expired: boolean;
  days?: number;
  hours?: number;
  minutes?: number;
} {
  if (!expiresAt) {
    return { expired: false };
  }

  const now = new Date();
  const expiry = new Date(expiresAt);

  if (now >= expiry) {
    return { expired: true };
  }

  const diffMs = expiry.getTime() - now.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return { days, expired: false, hours, minutes };
}

/**
 * Formats API key permissions for display
 */
export function formatPermissionsForDisplay(permissions: string[]): string[] {
  return permissions
    .map((permission) => {
      const [resource, action] = permission.split(':');
      return `${resource}: ${action}`;
    })
    .sort();
}

/**
 * Groups permissions by resource for better UI display
 */
export function groupPermissionsByResource(permissions: string[]): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};

  for (const permission of permissions) {
    const [resource, action] = permission.split(':');
    if (!grouped[resource]) {
      grouped[resource] = [];
    }
    grouped[resource].push(action);
  }

  // Sort actions within each resource
  for (const resource in grouped) {
    grouped[resource].sort();
  }

  return grouped;
}
