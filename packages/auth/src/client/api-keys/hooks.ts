/**
 * React hooks for API key management
 */

import { useCallback, useEffect, useState } from 'react';

import type {
  ApiKeyListItem,
  CreateApiKeyData,
  CreateApiKeyResult,
  ListApiKeysResult,
  RevokeApiKeyResult,
  UpdateApiKeyData,
  UpdateApiKeyResult,
} from '../../shared/api-keys/types';

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
      const response = await fetch('/api/auth/api-keys', {
        credentials: 'include',
        method: 'GET',
      });

      const result: ListApiKeysResult = await response.json();

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
        const response = await fetch('/api/auth/api-keys', {
          body: JSON.stringify(data),
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        });

        const result: CreateApiKeyResult = await response.json();

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
      const response = await fetch(`/api/auth/api-keys/${keyId}`, {
        credentials: 'include',
        method: 'DELETE',
      });

      const result: RevokeApiKeyResult = await response.json();

      if (result.success) {
        // Remove the key from local state
        setKeys((prev) => prev.filter((key) => key.id !== keyId));
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
        const response = await fetch(`/api/auth/api-keys/${keyId}`, {
          body: JSON.stringify(data),
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'PATCH',
        });

        const result: UpdateApiKeyResult = await response.json();

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
      const response = await fetch('/api/auth/api-keys', {
        body: JSON.stringify(data),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      const result: CreateApiKeyResult = await response.json();
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
      const response = await fetch('/api/auth/validate-api-key', {
        body: JSON.stringify({ test: true }),
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        method: 'POST',
      });

      if (response.ok) {
        setValidationResult({ isValid: true });
      } else {
        const error = await response.text();
        setValidationResult({ isValid: false, error });
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
