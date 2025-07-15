/**
 * API Key actions - server actions for API key management
 */

'use server';

import { headers } from 'next/headers';
import { auth } from '../../shared/auth';

/**
 * Create a new API key
 */
export async function createApiKeyAction(data: {
  name: string;
  permissions?: string[];
  expiresAt?: string;
  metadata?: any;
}) {
  return auth.api.createApiKey({
    body: data,
    headers: await headers(),
  });
}

/**
 * List all API keys for current user/organization
 */
export async function listApiKeysAction() {
  return auth.api.listApiKeys({
    headers: await headers(),
  });
}

/**
 * Revoke an API key
 */
export async function revokeApiKeyAction(keyId: string) {
  return auth.api.deleteApiKey({
    body: { keyId },
    headers: await headers(),
  });
}

/**
 * Validate an API key
 */
export async function validateApiKeyAction(key: string) {
  return auth.api.verifyApiKey({
    body: { key },
  });
}

/**
 * Get a specific API key
 */
export async function getApiKeyAction(keyId: string) {
  return auth.api.getApiKey({
    query: { keyId },
    headers: await headers(),
  });
}

/**
 * Update an API key
 */
export async function updateApiKeyAction(data: {
  keyId: string;
  name?: string;
  enabled?: boolean;
  permissions?: string[];
}) {
  return auth.api.updateApiKey({
    body: data,
    headers: await headers(),
  });
}

/**
 * Regenerate an API key
 */
export async function regenerateApiKeyAction(keyId: string) {
  return auth.api.regenerateApiKey({
    body: { keyId },
    headers: await headers(),
  });
}
