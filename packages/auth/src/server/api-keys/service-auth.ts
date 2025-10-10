/**
 * Service-to-service authentication using API keys
 */

import { logError } from '@repo/observability';
import { headers } from 'next/headers';
import 'server-only';

import { auth } from '../../shared/auth';

import type { ServiceAuthOptions, ServiceAuthResult } from '../../shared/api-keys';

/**
 * Creates a service-to-service authentication token
 */
export async function createServiceAuth(options: ServiceAuthOptions): Promise<ServiceAuthResult> {
  try {
    const { expiresIn = '30d', permissions: _permissions, serviceId } = options;

    // Calculate expiration date
    const expiresAt = new Date();

    if (typeof expiresIn === 'number') {
      // If it's a number, treat as days
      expiresAt.setDate(expiresAt.getDate() + expiresIn);
    } else {
      // If it's a string, parse the format like "30d", "24h", "60m"
      const match = expiresIn.match(/^(\d+)([dhm])$/);

      if (match) {
        const [, amount, unit] = match;
        const value = parseInt(amount, 10);

        switch (unit) {
          case 'd':
            expiresAt.setDate(expiresAt.getDate() + value);
            break;
          case 'h':
            expiresAt.setHours(expiresAt.getHours() + value);
            break;
          case 'm':
            expiresAt.setMinutes(expiresAt.getMinutes() + value);
            break;
        }
      } else {
        // Default to 30 days
        expiresAt.setDate(expiresAt.getDate() + 30);
      }
    }

    // Create API key for service authentication using better-auth API
    const result = await auth.api.createApiKey({
      body: {
        name: `Service: ${serviceId}`,
        metadata: {
          type: 'service',
          createdAt: new Date().toISOString(),
          serviceId,
        },
      },
      headers: await headers(),
    });

    if (!result.key) {
      return {
        error: 'Failed to create service authentication',
        success: false,
      };
    }

    return {
      expiresAt,
      success: true,
      token: result.key,
    };
  } catch (error) {
    logError(
      'Service auth creation error:',
      error instanceof Error ? error : new Error(String(error)),
    );
    return {
      error: 'Failed to create service authentication',
      success: false,
    };
  }
}

/**
 * Validates a service authentication token
 */
export async function validateServiceAuth(token: string): Promise<{
  isValid: boolean;
  serviceId?: string;
  permissions?: string[];
  error?: string;
}> {
  try {
    // Verify API key using better-auth API
    const result = await auth.api.verifyApiKey({
      body: { key: token },
    });

    if (!result.valid || !result.key) {
      return {
        isValid: false,
        error:
          result?.error && (result.error as any).message
            ? (result.error as any).message
            : 'Token validation failed',
      };
    }

    const metadata = result.key.metadata as any;

    if (metadata?.type !== 'service') {
      return {
        isValid: false,
        error: 'Token is not a service authentication token',
      };
    }

    // Get permissions from the key (better-auth returns permissions as Record<string, string[]>)
    // Only accept array values; ignore non-array entries
    const keyPermissions = (result.key as any).permissions || {};
    const permissions = Object.values(keyPermissions).flatMap(v =>
      Array.isArray(v) ? v : [],
    ) as string[];

    return {
      isValid: true,
      permissions,
      serviceId: metadata.serviceId,
    };
  } catch (error) {
    logError(
      'Service auth validation error:',
      error instanceof Error ? error : new Error(String(error)),
    );
    return {
      isValid: false,
      error: 'Failed to validate service authentication',
    };
  }
}

/**
 * Revokes a service authentication token
 */
export async function revokeServiceAuth(serviceId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Get all API keys using better-auth API
    const keys = await auth.api.listApiKeys();

    // Filter service keys for this serviceId
    const serviceKeys = keys.filter((key: any) => {
      const metadata = key.metadata;
      return metadata?.type === 'service' && metadata?.serviceId === serviceId && key.enabled;
    });

    if (serviceKeys.length === 0) {
      return {
        success: true, // No keys to revoke is considered success
      };
    }

    // Revoke all matching service keys using better-auth API
    const revokePromises = serviceKeys.map((key: any) =>
      auth.api.updateApiKey({
        body: {
          keyId: key.id,
          enabled: false,
        },
      }),
    );

    const results = await Promise.allSettled(revokePromises);
    const successCount = results.filter(
      (result: any) => result.status === 'fulfilled' && result.value,
    ).length;

    if (successCount === 0 && serviceKeys.length > 0) {
      return {
        error: 'Failed to revoke any service keys',
        success: false,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    logError(
      'Service auth revocation error:',
      error instanceof Error ? error : new Error(String(error)),
    );
    return {
      error: 'Failed to revoke service authentication',
      success: false,
    };
  }
}

/**
 * Lists all service authentication tokens
 */
export async function listServiceAuth(): Promise<{
  success: boolean;
  services?: {
    serviceId: string;
    tokenId: string;
    permissions: string[];
    expiresAt?: Date;
    createdAt: Date;
  }[];
  error?: string;
}> {
  try {
    const keys = await auth.api.listApiKeys();

    const serviceTokens = keys
      .filter((key: any) => key.metadata?.type === 'service')
      .map((key: any) => {
        // Convert permissions from Record<string, string[]> to string[]
        const permissions: string[] = key.permissions
          ? Object.values(key.permissions)
              .flat()
              .filter((p): p is string => typeof p === 'string')
          : [];

        return {
          createdAt: new Date(key.createdAt),
          expiresAt: key.expiresAt ? new Date(key.expiresAt) : undefined,
          permissions,
          serviceId: key.metadata?.serviceId || '',
          tokenId: key.id || '',
        };
      });

    return {
      services: serviceTokens,
      success: true,
    };
  } catch (error) {
    logError(
      'Service auth listing error:',
      error instanceof Error ? error : new Error(String(error)),
    );
    return {
      error: 'Failed to list service authentications',
      success: false,
    };
  }
}

/**
 * Parses a service token from headers
 */
export function parseServiceToken(headers: Headers): string | null {
  // Validate headers interface
  if (!headers || typeof (headers as any).get !== 'function') {
    return null;
  }
  // Check Authorization header first
  const authHeader = headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // Check x-api-key header
  const apiKey = headers.get('x-api-key');
  if (apiKey) {
    return apiKey;
  }

  return null;
}

/**
 * Verifies a service authentication token
 * Can accept either a string token or Headers object
 */
export async function verifyServiceAuth(tokenOrHeaders: string | Headers) {
  let token: string | null;

  if (typeof tokenOrHeaders === 'string') {
    token = tokenOrHeaders;
  } else {
    token = parseServiceToken(tokenOrHeaders);
    if (!token) {
      return {
        isValid: false,
        error: 'No service token provided',
      };
    }
  }

  return validateServiceAuth(token);
}

/**
 * Create multiple API keys for an organization
 */
export async function bulkCreateApiKeys(data: {
  keys: Array<{
    name: string;
    permissions?: string[];
    expiresAt?: string;
    metadata?: any;
  }>;
  organizationId?: string;
}): Promise<{
  success: boolean;
  results?: Array<{
    name: string;
    success: boolean;
    apiKey?: string;
    keyId?: string;
    error?: string;
  }>;
  error?: string;
}> {
  try {
    const results = await Promise.allSettled(
      data.keys.map(async keyData => {
        const result = await auth.api.createApiKey({
          body: {
            name: keyData.name,
            ...(keyData.permissions && { permissions: keyData.permissions }),
            ...(keyData.expiresAt && { expiresAt: keyData.expiresAt }),
            ...(keyData.metadata && { metadata: keyData.metadata }),
            ...(data.organizationId && { organizationId: data.organizationId }),
          },
        });
        return result;
      }),
    );

    const mappedResults = results.map((result, index) => ({
      name: data.keys[index].name,
      success: result.status === 'fulfilled' ? !!result.value.key : false,
      apiKey: result.status === 'fulfilled' ? result.value.key : undefined,
      keyId: result.status === 'fulfilled' ? result.value.id : undefined,
      error:
        result.status === 'fulfilled'
          ? undefined
          : result.status === 'rejected'
            ? result.reason?.message || 'Failed to create key'
            : 'Unknown error',
    }));

    const successCount = mappedResults.filter(r => r.success).length;

    return {
      success: successCount > 0,
      results: mappedResults,
    };
  } catch (error) {
    logError(
      'Bulk create API keys error:',
      error instanceof Error ? error : new Error(String(error)),
    );
    return {
      error: 'Failed to bulk create API keys',
      success: false,
    };
  }
}

/**
 * Revoke multiple API keys
 */
export async function bulkRevokeApiKeys(keyIds: string[]): Promise<{
  success: boolean;
  results?: Array<{
    keyId: string;
    success: boolean;
    error?: string;
  }>;
  error?: string;
}> {
  try {
    const results = await Promise.allSettled(
      keyIds.map(keyId => auth.api.deleteApiKey({ body: { keyId } })),
    );

    const mappedResults = results.map((result, index) => ({
      keyId: keyIds[index],
      success: result.status === 'fulfilled' ? !!result.value : false,
      error:
        result.status === 'fulfilled'
          ? undefined
          : result.status === 'rejected'
            ? result.reason?.message || 'Failed to delete key'
            : 'Unknown error',
    }));

    const successCount = mappedResults.filter(r => r.success).length;

    return {
      success: successCount > 0,
      results: mappedResults,
    };
  } catch (error) {
    logError(
      'Bulk revoke API keys error:',
      error instanceof Error ? error : new Error(String(error)),
    );
    return {
      error: 'Failed to bulk revoke API keys',
      success: false,
    };
  }
}

/**
 * Update multiple API keys with new settings
 */
export async function bulkUpdateApiKeys(
  updates: Array<{
    keyId: string;
    name?: string;
    enabled?: boolean;
    permissions?: string[];
  }>,
): Promise<{
  success: boolean;
  results?: Array<{
    keyId: string;
    success: boolean;
    error?: string;
  }>;
  error?: string;
}> {
  try {
    const results = await Promise.allSettled(
      updates.map(update => {
        const updateData: any = {
          keyId: update.keyId,
        };

        if (update.name) updateData.name = update.name;
        if (update.enabled !== undefined) updateData.enabled = update.enabled;
        // Skip permissions for now as the format may not match better-auth expectations

        return auth.api.updateApiKey({ body: updateData });
      }),
    );

    const mappedResults = results.map((result, index) => ({
      keyId: updates[index].keyId,
      success: result.status === 'fulfilled' ? !!result.value : false,
      error:
        result.status === 'fulfilled'
          ? undefined
          : result.status === 'rejected'
            ? result.reason?.message || 'Failed to update key'
            : 'Unknown error',
    }));

    const successCount = mappedResults.filter(r => r.success).length;

    return {
      success: successCount > 0,
      results: mappedResults,
    };
  } catch (error) {
    logError(
      'Bulk update API keys error:',
      error instanceof Error ? error : new Error(String(error)),
    );
    return {
      error: 'Failed to bulk update API keys',
      success: false,
    };
  }
}

/**
 * Get API key usage statistics
 */
export async function getApiKeyStatistics(): Promise<{
  success: boolean;
  data?: {
    totalKeys: number;
    activeKeys: number;
    expiredKeys: number;
    serviceKeys: number;
    userKeys: number;
    keysByPermission: Record<string, number>;
  };
  error?: string;
}> {
  try {
    // Get all API keys using better-auth API
    const keys = await auth.api.listApiKeys();
    const now = new Date();

    const totalKeys = keys.length;
    const activeKeys = keys.filter((key: any) => key.enabled).length;
    const expiredKeys = keys.filter(
      (key: any) => key.expiresAt && new Date(key.expiresAt) < now,
    ).length;
    const serviceKeys = keys.filter((key: any) => key.metadata?.type === 'service').length;
    const userKeys = keys.filter(
      (key: any) => !key.metadata?.type || key.metadata.type === 'user',
    ).length;

    // Count keys by permission (convert from Record<string, string[]> to flat array)
    const keysByPermission = keys.reduce((acc: Record<string, number>, key: any) => {
      const permissions = key.permissions
        ? Object.values(key.permissions)
            .flat()
            .filter((p): p is string => typeof p === 'string')
        : [];
      permissions.forEach((permission: string) => {
        acc[permission] = (acc[permission] || 0) + 1;
      });
      return acc;
    }, {});

    return {
      success: true,
      data: {
        totalKeys,
        activeKeys,
        expiredKeys,
        serviceKeys,
        userKeys,
        keysByPermission,
      },
    };
  } catch (error) {
    logError(
      'Get API key statistics error:',
      error instanceof Error ? error : new Error(String(error)),
    );
    return {
      error: 'Failed to get API key statistics',
      success: false,
    };
  }
}
