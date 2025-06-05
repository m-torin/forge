/**
 * Service account management for organizations
 */

import 'server-only';
import { prisma as database } from '@repo/database/prisma';
import { auth } from '../auth';
import { checkPermission } from './permissions';
import { createServiceAuth } from '../api-keys/service-auth';

import type { ServiceAuthOptions, ServiceAuthResult } from '../../shared/api-keys/types';

/**
 * Creates a service account for an organization
 */
export async function createServiceAccount(data: {
  organizationId: string;
  name: string;
  description?: string;
  permissions: string[];
  expiresIn?: string;
}): Promise<ServiceAuthResult & { serviceAccountId?: string }> {
  try {
    // Check if user has permission to create service accounts
    const hasPermission = await checkPermission('api-keys:create', data.organizationId);
    
    if (!hasPermission) {
      return {
        success: false,
        error: 'Insufficient permissions to create service accounts',
      };
    }

    // Create service authentication
    const serviceOptions: ServiceAuthOptions = {
      serviceId: `${data.organizationId}-${data.name}`,
      permissions: data.permissions,
      expiresIn: data.expiresIn,
    };

    const authResult = await createServiceAuth(serviceOptions);

    if (!authResult.success) {
      return authResult;
    }

    // Store service account metadata
    const serviceAccount = await database.apiKey.create({
      data: {
        name: data.name,
        organizationId: data.organizationId,
        permissions: data.permissions,
        expiresAt: authResult.expiresAt,
        metadata: {
          type: 'service-account',
          description: data.description,
          serviceId: serviceOptions.serviceId,
        },
      },
    });

    return {
      ...authResult,
      serviceAccountId: serviceAccount.id,
    };
  } catch (error) {
    console.error('Create service account error:', error);
    return {
      success: false,
      error: 'Failed to create service account',
    };
  }
}

/**
 * Lists service accounts for an organization
 */
export async function listServiceAccounts(organizationId: string): Promise<{
  success: boolean;
  serviceAccounts?: Array<{
    id: string;
    name: string;
    description?: string;
    permissions: string[];
    expiresAt?: Date;
    createdAt: Date;
    isActive: boolean;
  }>;
  error?: string;
}> {
  try {
    // Check if user has permission to list service accounts
    const hasPermission = await checkPermission('api-keys:read', organizationId);
    
    if (!hasPermission) {
      return {
        success: false,
        error: 'Insufficient permissions to list service accounts',
      };
    }

    const apiKeys = await database.apiKey.findMany({
      where: {
        organizationId,
        metadata: {
          path: ['type'],
          equals: 'service-account',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const serviceAccounts = apiKeys.map((key: any) => ({
      id: key.id,
      name: key.name,
      description: key.metadata?.description,
      permissions: key.permissions,
      expiresAt: key.expiresAt,
      createdAt: key.createdAt,
      isActive: !key.expiresAt || key.expiresAt > new Date(),
    }));

    return {
      success: true,
      serviceAccounts,
    };
  } catch (error) {
    console.error('List service accounts error:', error);
    return {
      success: false,
      error: 'Failed to list service accounts',
    };
  }
}

/**
 * Updates a service account
 */
export async function updateServiceAccount(data: {
  serviceAccountId: string;
  organizationId: string;
  name?: string;
  description?: string;
  permissions?: string[];
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Check if user has permission to update service accounts
    const hasPermission = await checkPermission('api-keys:write', data.organizationId);
    
    if (!hasPermission) {
      return {
        success: false,
        error: 'Insufficient permissions to update service accounts',
      };
    }

    // Update the service account metadata
    await database.apiKey.update({
      where: {
        id: data.serviceAccountId,
        organizationId: data.organizationId,
      },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.permissions && { permissions: data.permissions }),
        ...(data.description !== undefined && {
          metadata: {
            type: 'service-account',
            description: data.description,
          },
        }),
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Update service account error:', error);
    return {
      success: false,
      error: 'Failed to update service account',
    };
  }
}

/**
 * Revokes a service account
 */
export async function revokeServiceAccount(data: {
  serviceAccountId: string;
  organizationId: string;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Check if user has permission to revoke service accounts
    const hasPermission = await checkPermission('api-keys:revoke', data.organizationId);
    
    if (!hasPermission) {
      return {
        success: false,
        error: 'Insufficient permissions to revoke service accounts',
      };
    }

    // Delete the service account
    await database.apiKey.delete({
      where: {
        id: data.serviceAccountId,
        organizationId: data.organizationId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Revoke service account error:', error);
    return {
      success: false,
      error: 'Failed to revoke service account',
    };
  }
}

/**
 * Gets service account details
 */
export async function getServiceAccount(data: {
  serviceAccountId: string;
  organizationId: string;
}): Promise<{
  success: boolean;
  serviceAccount?: {
    id: string;
    name: string;
    description?: string;
    permissions: string[];
    expiresAt?: Date;
    createdAt: Date;
    lastUsedAt?: Date;
    isActive: boolean;
  };
  error?: string;
}> {
  try {
    // Check if user has permission to read service accounts
    const hasPermission = await checkPermission('api-keys:read', data.organizationId);
    
    if (!hasPermission) {
      return {
        success: false,
        error: 'Insufficient permissions to access service account',
      };
    }

    const apiKey = await database.apiKey.findFirst({
      where: {
        id: data.serviceAccountId,
        organizationId: data.organizationId,
        metadata: {
          path: ['type'],
          equals: 'service-account',
        },
      },
    });

    if (!apiKey) {
      return {
        success: false,
        error: 'Service account not found',
      };
    }

    const serviceAccount = {
      id: apiKey.id,
      name: apiKey.name,
      description: apiKey.metadata?.description,
      permissions: apiKey.permissions,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
      lastUsedAt: apiKey.lastUsedAt,
      isActive: !apiKey.expiresAt || apiKey.expiresAt > new Date(),
    };

    return {
      success: true,
      serviceAccount,
    };
  } catch (error) {
    console.error('Get service account error:', error);
    return {
      success: false,
      error: 'Failed to get service account',
    };
  }
}

/**
 * Regenerates service account token
 */
export async function regenerateServiceAccountToken(data: {
  serviceAccountId: string;
  organizationId: string;
  expiresIn?: string;
}): Promise<ServiceAuthResult> {
  try {
    // Check if user has permission to manage service accounts
    const hasPermission = await checkPermission('api-keys:write', data.organizationId);
    
    if (!hasPermission) {
      return {
        success: false,
        error: 'Insufficient permissions to regenerate service account token',
      };
    }

    // Get current service account
    const currentAccount = await database.apiKey.findFirst({
      where: {
        id: data.serviceAccountId,
        organizationId: data.organizationId,
        metadata: {
          path: ['type'],
          equals: 'service-account',
        },
      },
    });

    if (!currentAccount) {
      return {
        success: false,
        error: 'Service account not found',
      };
    }

    // Create new service authentication
    const serviceOptions: ServiceAuthOptions = {
      serviceId: currentAccount.metadata?.serviceId || `${data.organizationId}-${currentAccount.name}`,
      permissions: currentAccount.permissions,
      expiresIn: data.expiresIn,
    };

    const authResult = await createServiceAuth(serviceOptions);

    if (!authResult.success) {
      return authResult;
    }

    // Update the service account with new expiration
    await database.apiKey.update({
      where: { id: data.serviceAccountId },
      data: {
        expiresAt: authResult.expiresAt,
      },
    });

    return authResult;
  } catch (error) {
    console.error('Regenerate service account token error:', error);
    return {
      success: false,
      error: 'Failed to regenerate service account token',
    };
  }
}