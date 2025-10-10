/**
 * Shared API key utility functions
 */

/**
 * Masks an API key for safe display
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
  const nouns = ['Access', 'Key', 'Token', 'Auth', 'Api', 'Service', 'Client', 'App'];

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const suffix = Math.floor(Math.random() * 1000);

  return `${adjective} ${noun} ${suffix}`;
}

/**
 * Checks if an API key is expired
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
    .map(permission => {
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

/**
 * Validates API key format (basic client-side validation)
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }

  // Basic format validation
  // Should be at least 20 characters and contain only alphanumeric chars and hyphens
  return /^[a-zA-Z0-9_-]{20,}$/.test(apiKey);
}
