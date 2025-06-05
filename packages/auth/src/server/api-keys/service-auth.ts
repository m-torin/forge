/**
 * Service-to-service authentication using API keys
 */

import 'server-only';
import { auth } from '../auth';
import { DEFAULT_API_PERMISSIONS } from '../../shared/api-keys/permissions';

import type { 
  ServiceAuthOptions, 
  ServiceAuthResult,
  CreateApiKeyResult,
} from '../../shared/api-keys/types';

/**
 * Creates a service-to-service authentication token
 */
export async function createServiceAuth(
  options: ServiceAuthOptions
): Promise<ServiceAuthResult> {
  try {
    const { serviceId, permissions, expiresIn = '30d' } = options;

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
        permissions: permissions.length > 0 ? permissions : DEFAULT_API_PERMISSIONS.service,
        expiresAt: expiresAt.toISOString(),
        metadata: {
          type: 'service',
          serviceId,
          createdAt: new Date().toISOString(),
        },
      },
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error?.message || 'Failed to create service authentication',
      };
    }

    return {
      success: true,
      token: result.apiKey,
      expiresAt,
    };
  } catch (error) {
    console.error('Service auth creation error:', error);
    return {
      success: false,
      error: 'Failed to create service authentication',
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
      serviceId: metadata.serviceId,
      permissions: result.key?.permissions || [],
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
        success: false,
        error: 'Failed to list API keys',
      };
    }

    // Find service keys for this serviceId
    const serviceKeys = keys.apiKeys?.filter((key: any) => 
      key.metadata?.type === 'service' && 
      key.metadata?.serviceId === serviceId
    ) || [];

    // Revoke all service keys for this service
    const revokePromises = serviceKeys.map((key: any) =>
      auth.api.revokeApiKey({ body: { keyId: key.id } })
    );

    const results = await Promise.all(revokePromises);
    
    const failed = results.filter(result => !result.success);
    
    if (failed.length > 0) {
      return {
        success: false,
        error: `Failed to revoke ${failed.length} service tokens`,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Service auth revocation error:', error);
    return {
      success: false,
      error: 'Failed to revoke service authentication',
    };
  }
}

/**
 * Lists all service authentication tokens
 */
export async function listServiceAuth(): Promise<{
  success: boolean;
  services?: Array<{
    serviceId: string;
    tokenId: string;
    permissions: string[];
    expiresAt?: Date;
    createdAt: Date;
  }>;
  error?: string;
}> {
  try {
    const keys = await auth.api.listApiKeys();

    if (!keys.success) {
      return {
        success: false,
        error: 'Failed to list API keys',
      };
    }

    const serviceTokens = keys.apiKeys
      ?.filter((key: any) => key.metadata?.type === 'service')
      .map((key: any) => ({
        serviceId: key.metadata.serviceId,
        tokenId: key.id,
        permissions: key.permissions || [],
        expiresAt: key.expiresAt ? new Date(key.expiresAt) : undefined,
        createdAt: new Date(key.createdAt),
      })) || [];

    return {
      success: true,
      services: serviceTokens,
    };
  } catch (error) {
    console.error('Service auth listing error:', error);
    return {
      success: false,
      error: 'Failed to list service authentications',
    };
  }
}