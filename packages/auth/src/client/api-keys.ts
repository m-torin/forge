/**
 * Client-side API key functionality
 */

import { useCallback, useEffect, useState } from 'react';
import { logger } from './utils/logger';

import {
  createApiKeyAction,
  listApiKeysAction,
  revokeApiKeyAction,
  updateApiKeyAction,
  validateApiKeyAction,
} from '../server/actions';

import type {
  ApiKeyListItem,
  CreateApiKeyData,
  CreateApiKeyResult,
  PermissionCheck,
  RevokeApiKeyResult,
  UpdateApiKeyData,
  UpdateApiKeyResult,
} from '../shared/api-keys';

// ===== HELPER FUNCTIONS =====

/**
 * Minimal client-side permission checker - actual validation happens server-side
 * This is primarily for UI state management and should not be trusted for security
 */
export function hasPermission(_permissions: PermissionCheck): boolean {
  // Client-side permission checks are only for UI hints
  // Real validation must always happen server-side
  if (process.env.NODE_ENV === 'development') {
    logger.warn('Client-side hasPermission called - actual validation requires server-side check');
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

// Re-export shared utilities for backward compatibility
export {
  formatPermissionsForDisplay,
  generateApiKeyName,
  getTimeUntilExpiration,
  groupPermissionsByResource,
  isApiKeyExpired,
  isValidApiKeyFormat,
  maskApiKey,
} from '../shared/utils/api-keys';

// ===== REACT HOOKS =====

/**
 * Hook for managing API keys list
 */
export function useApiKeys() {
  const [keys, setKeys] = useState<ApiKeyListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await listApiKeysAction();

      if (result.success && result.keys) {
        setKeys(result.keys);
      } else {
        setError(result.error || 'Failed to fetch API keys');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch API keys');
    } finally {
      setLoading(false);
    }
  }, []);

  const createKey = useCallback(
    async (data: CreateApiKeyData): Promise<CreateApiKeyResult> => {
      setLoading(true);
      setError(null);

      try {
        // Convert Date to ISO string for server action
        const serverData = {
          ...data,
          expiresAt: data.expiresAt?.toISOString(),
        };
        const result = await createApiKeyAction(serverData);

        if (result.success) {
          // Refresh the keys list
          await fetchKeys();
        } else {
          setError(result.error || 'Failed to create API key');
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Failed to create API key';
        setError(error);
        return { error, success: false };
      } finally {
        setLoading(false);
      }
    },
    [fetchKeys],
  );

  const revokeKey = useCallback(async (keyId: string): Promise<RevokeApiKeyResult> => {
    setLoading(true);
    setError(null);

    try {
      const result = await revokeApiKeyAction(keyId);

      if (result.success) {
        // Remove the key from local state
        setKeys(prev => prev.filter(key => key.id !== keyId));
      } else {
        setError(result.error || 'Failed to revoke API key');
      }

      return result;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to revoke API key';
      setError(error);
      return { error, success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateKey = useCallback(
    async (keyId: string, data: UpdateApiKeyData): Promise<UpdateApiKeyResult> => {
      setLoading(true);
      setError(null);

      try {
        const result = await updateApiKeyAction({ keyId, ...data });

        if (result.success) {
          // Refresh the keys list
          await fetchKeys();
        } else {
          setError(result.error || 'Failed to update API key');
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Failed to update API key';
        setError(error);
        return { error, success: false };
      } finally {
        setLoading(false);
      }
    },
    [fetchKeys],
  );

  // Fetch keys on mount
  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  return {
    createKey,
    error,
    fetchKeys,
    keys,
    loading,
    revokeKey,
    updateKey,
  };
}

/**
 * Hook for creating a single API key with state management
 */
export function useCreateApiKey() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateApiKeyResult | null>(null);

  const createKey = useCallback(async (data: CreateApiKeyData) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Convert Date to ISO string for server action
      const serverData = {
        ...data,
        expiresAt: data.expiresAt?.toISOString(),
      };
      const result = await createApiKeyAction(serverData);
      setResult(result);

      if (!result.success) {
        setError(result.error || 'Failed to create API key');
      }

      return result;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to create API key';
      setError(error);
      const failResult = { error, success: false };
      setResult(failResult);
      return failResult;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setResult(null);
  }, []);

  return {
    createKey,
    error,
    loading,
    reset,
    result,
  };
}

/**
 * Hook for API key validation and testing
 */
export function useApiKeyValidation() {
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    error?: string;
  } | null>(null);

  const validateKey = useCallback(async (apiKey: string) => {
    setValidating(true);
    setValidationResult(null);

    try {
      const result = await validateApiKeyAction(apiKey);

      if (result.success) {
        setValidationResult({ isValid: true });
      } else {
        setValidationResult({ isValid: false, error: result.error || 'Validation failed' });
      }
    } catch (err) {
      setValidationResult({
        isValid: false,
        error: err instanceof Error ? err.message : 'Validation failed',
      });
    } finally {
      setValidating(false);
    }
  }, []);

  return {
    validateKey,
    validating,
    validationResult,
  };
}

// Export aliases for backwards compatibility with tests
export async function createApiKey(data: CreateApiKeyData): Promise<CreateApiKeyResult> {
  // Convert Date to ISO string for server action
  const serverData = {
    ...data,
    expiresAt: data.expiresAt?.toISOString(),
  };
  return createApiKeyAction(serverData);
}

export async function listApiKeys(): Promise<ApiKeyListItem[]> {
  const result = await listApiKeysAction();
  return result.success ? result.keys || [] : [];
}

export async function deleteApiKey(keyId: string): Promise<RevokeApiKeyResult> {
  return revokeApiKeyAction(keyId);
}
