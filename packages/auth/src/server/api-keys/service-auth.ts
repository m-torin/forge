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
