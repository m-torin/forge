/**
 * Service-to-service authentication using API keys
 */

import 'server-only';

import { DEFAULT_API_PERMISSIONS } from '../../shared/api-keys/permissions';
import { auth } from '../auth';

import type { ServiceAuthOptions, ServiceAuthResult } from '../../shared/api-keys/types';

/**
 * Creates a service-to-service authentication token
 */
export async function createServiceAuth(options: ServiceAuthOptions): Promise<ServiceAuthResult> {
  try {
    const { expiresIn = '30d', permissions, serviceId } = options;

    // Calculate expiration date
    const expiresAt = new Date();
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

    // Create API key for service authentication
    const result = await auth.api.createApiKey({
      body: {
        name: `Service: ${serviceId}`,
        expiresAt: expiresAt.toISOString(),
        metadata: {
          type: 'service',
          createdAt: new Date().toISOString(),
          serviceId,
        },
        permissions: permissions.length > 0 ? permissions : DEFAULT_API_PERMISSIONS.service,
      },
    });

    if (!result.success) {
      return {
        error: result.error?.message || 'Failed to create service authentication',
        success: false,
      };
    }

    return {
      expiresAt,
      success: true,
      token: result.apiKey,
    };
  } catch (error) {
    console.error('Service auth creation error:', error);
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
    const result = await auth.api.verifyApiKey({
      body: { key: token },
    });

    if (!result.valid) {
      return {
        isValid: false,
        error: result.error?.message || 'Invalid service token',
      };
    }

    const metadata = result.key?.metadata;

    if (metadata?.type !== 'service') {
      return {
        isValid: false,
        error: 'Token is not a service authentication token',
      };
    }

    return {
      isValid: true,
      permissions: result.key?.permissions || [],
      serviceId: metadata.serviceId,
    };
  } catch (error) {
    console.error('Service auth validation error:', error);
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
    // List all API keys and find service keys for this service
    const keys = await auth.api.listApiKeys();

    if (!keys.success) {
      return {
        error: 'Failed to list API keys',
        success: false,
      };
    }

    // Find service keys for this serviceId
    const serviceKeys =
      keys.apiKeys?.filter(
        (key: any) => key.metadata?.type === 'service' && key.metadata?.serviceId === serviceId,
      ) || [];

    // Revoke all service keys for this service
    const revokePromises = serviceKeys.map((key: any) =>
      auth.api.revokeApiKey({ body: { keyId: key.id } }),
    );

    const results = await Promise.all(revokePromises);

    const failed = results.filter((result) => !result.success);

    if (failed.length > 0) {
      return {
        error: `Failed to revoke ${failed.length} service tokens`,
        success: false,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Service auth revocation error:', error);
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

    if (!keys.success) {
      return {
        error: 'Failed to list API keys',
        success: false,
      };
    }

    const serviceTokens =
      keys.apiKeys
        ?.filter((key: any) => key.metadata?.type === 'service')
        .map((key: any) => ({
          createdAt: new Date(key.createdAt),
          expiresAt: key.expiresAt ? new Date(key.expiresAt) : undefined,
          permissions: key.permissions || [],
          serviceId: key.metadata.serviceId,
          tokenId: key.id,
        })) || [];

    return {
      services: serviceTokens,
      success: true,
    };
  } catch (error) {
    console.error('Service auth listing error:', error);
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
  // Check Authorization header first
  const authHeader = headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
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
      data.keys.map(async (keyData) => {
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
      })
    );

    const mappedResults = results.map((result, index) => ({
      name: data.keys[index].name,
      success: result.status === 'fulfilled' ? result.value.success : false,
      apiKey: result.status === 'fulfilled' ? result.value.apiKey : undefined,
      keyId: result.status === 'fulfilled' ? result.value.keyId : undefined,
      error: result.status === 'fulfilled' ? result.value.error?.message : 
             result.status === 'rejected' ? result.reason?.message : 'Unknown error',
    }));

    const successCount = mappedResults.filter(r => r.success).length;

    return {
      success: successCount > 0,
      results: mappedResults,
    };
  } catch (error) {
    console.error('Bulk create API keys error:', error);
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
      keyIds.map(keyId =>
        auth.api.revokeApiKey({ body: { keyId } })
      )
    );

    const mappedResults = results.map((result, index) => ({
      keyId: keyIds[index],
      success: result.status === 'fulfilled' ? result.value.success : false,
      error: result.status === 'fulfilled' ? result.value.error?.message : 
             result.status === 'rejected' ? result.reason?.message : 'Unknown error',
    }));

    const successCount = mappedResults.filter(r => r.success).length;

    return {
      success: successCount > 0,
      results: mappedResults,
    };
  } catch (error) {
    console.error('Bulk revoke API keys error:', error);
    return {
      error: 'Failed to bulk revoke API keys',
      success: false,
    };
  }
}

/**
 * Update multiple API keys with new settings
 */
export async function bulkUpdateApiKeys(updates: Array<{
  keyId: string;
  name?: string;
  enabled?: boolean;
  permissions?: string[];
}>): Promise<{
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
      updates.map(update =>
        auth.api.updateApiKey({
          body: {
            keyId: update.keyId,
            ...(update.name && { name: update.name }),
            ...(update.enabled !== undefined && { enabled: update.enabled }),
            ...(update.permissions && { permissions: update.permissions }),
          },
        })
      )
    );

    const mappedResults = results.map((result, index) => ({
      keyId: updates[index].keyId,
      success: result.status === 'fulfilled' ? result.value.success : false,
      error: result.status === 'fulfilled' ? result.value.error?.message : 
             result.status === 'rejected' ? result.reason?.message : 'Unknown error',
    }));

    const successCount = mappedResults.filter(r => r.success).length;

    return {
      success: successCount > 0,
      results: mappedResults,
    };
  } catch (error) {
    console.error('Bulk update API keys error:', error);
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
    const result = await auth.api.listApiKeys();

    if (!result.success) {
      return {
        error: result.error?.message || 'Failed to get API keys',
        success: false,
      };
    }

    const keys = result.apiKeys || [];
    const now = new Date();

    const totalKeys = keys.length;
    const activeKeys = keys.filter((key: any) => key.enabled).length;
    const expiredKeys = keys.filter((key: any) => 
      key.expiresAt && new Date(key.expiresAt) < now
    ).length;
    const serviceKeys = keys.filter((key: any) => 
      key.metadata?.type === 'service'
    ).length;
    const userKeys = keys.filter((key: any) => 
      !key.metadata?.type || key.metadata.type === 'user'
    ).length;

    // Count keys by permission
    const keysByPermission = keys.reduce((acc: Record<string, number>, key: any) => {
      const permissions = key.permissions || [];
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
    console.error('Get API key statistics error:', error);
    return {
      error: 'Failed to get API key statistics',
      success: false,
    };
  }
}
