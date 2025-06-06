/**
 * Service account management for organizations
 */

import 'server-only';
import { headers } from 'next/headers';

import { prisma as database } from '@repo/database/prisma';

import { createServiceAuth } from '../api-keys/service-auth';
import { auth } from '../auth';

import { checkPermission } from './permissions';

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
    // Get current session to check permissions and get user ID
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        error: 'Authentication required',
        success: false,
      };
    }

    // Check if user has permission to create service accounts
    const hasPermission = await checkPermission('api-keys:create', data.organizationId);

    if (!hasPermission) {
      return {
        error: 'Insufficient permissions to create service accounts',
        success: false,
      };
    }

    // Create service authentication
    const serviceOptions: ServiceAuthOptions = {
      expiresIn: data.expiresIn,
      permissions: data.permissions,
      serviceId: `${data.organizationId}-${data.name}`,
    };

    const authResult = await createServiceAuth(serviceOptions);

    if (!authResult.success) {
      return authResult;
    }

    // Store service account metadata
    const serviceAccount = await database.apiKey.create({
      data: {
        id: `apikey_${Math.random().toString(36).substr(2, 9)}`,
        name: data.name,
        createdAt: new Date(),
        expiresAt: authResult.expiresAt,
        key: authResult.token || '',
        metadata: {
          type: 'service-account',
          description: data.description,
          serviceId: serviceOptions.serviceId,
        },
        organizationId: data.organizationId,
        permissions: JSON.stringify(data.permissions),
        updatedAt: new Date(),
        userId: session.user.id, // User who created the service account
      },
    });

    return {
      ...authResult,
      serviceAccountId: serviceAccount.id,
    };
  } catch (error) {
    console.error('Create service account error:', error);
    return {
      error: 'Failed to create service account',
      success: false,
    };
  }
}

/**
 * Lists service accounts for an organization
 */
export async function listServiceAccounts(organizationId: string): Promise<{
  success: boolean;
  serviceAccounts?: {
    id: string;
    name: string;
    description?: string;
    permissions: string[];
    expiresAt?: Date;
    createdAt: Date;
    isActive: boolean;
  }[];
  error?: string;
}> {
  try {
    // Check if user has permission to list service accounts
    const hasPermission = await checkPermission('api-keys:read', organizationId);

    if (!hasPermission) {
      return {
        error: 'Insufficient permissions to list service accounts',
        success: false,
      };
    }

    const apiKeys = await database.apiKey.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        metadata: {
          equals: 'service-account',
          path: ['type'],
        },
        organizationId,
      },
    });

    const serviceAccounts = apiKeys.map((key: any) => ({
      id: key.id,
      name: key.name,
      createdAt: key.createdAt,
      description: (key.metadata as any)?.description,
      expiresAt: key.expiresAt,
      isActive: !key.expiresAt || key.expiresAt > new Date(),
      permissions: key.permissions ? JSON.parse(key.permissions) : [],
    }));

    return {
      serviceAccounts,
      success: true,
    };
  } catch (error) {
    console.error('List service accounts error:', error);
    return {
      error: 'Failed to list service accounts',
      success: false,
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
        error: 'Insufficient permissions to update service accounts',
        success: false,
      };
    }

    // Update the service account metadata
    await database.apiKey.update({
      data: {
        ...(data.name && { name: data.name }),
        ...(data.permissions && { permissions: JSON.stringify(data.permissions) }),
        ...(data.description !== undefined && {
          metadata: {
            type: 'service-account',
            description: data.description,
          },
        }),
      },
      where: {
        id: data.serviceAccountId,
        organizationId: data.organizationId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Update service account error:', error);
    return {
      error: 'Failed to update service account',
      success: false,
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
        error: 'Insufficient permissions to revoke service accounts',
        success: false,
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
      error: 'Failed to revoke service account',
      success: false,
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
        error: 'Insufficient permissions to access service account',
        success: false,
      };
    }

    const apiKey = await database.apiKey.findFirst({
      where: {
        id: data.serviceAccountId,
        metadata: {
          equals: 'service-account',
          path: ['type'],
        },
        organizationId: data.organizationId,
      },
    });

    if (!apiKey) {
      return {
        error: 'Service account not found',
        success: false,
      };
    }

    const serviceAccount = {
      id: apiKey.id,
      name: apiKey.name,
      createdAt: apiKey.createdAt,
      description: (apiKey.metadata as any)?.description,
      expiresAt: apiKey.expiresAt || undefined,
      isActive: !apiKey.expiresAt || apiKey.expiresAt > new Date(),
      lastUsedAt: apiKey.lastUsedAt || undefined,
      permissions: apiKey.permissions ? JSON.parse(apiKey.permissions) : [],
    };

    return {
      serviceAccount,
      success: true,
    };
  } catch (error) {
    console.error('Get service account error:', error);
    return {
      error: 'Failed to get service account',
      success: false,
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
        error: 'Insufficient permissions to regenerate service account token',
        success: false,
      };
    }

    // Get current service account
    const currentAccount = await database.apiKey.findFirst({
      where: {
        id: data.serviceAccountId,
        metadata: {
          equals: 'service-account',
          path: ['type'],
        },
        organizationId: data.organizationId,
      },
    });

    if (!currentAccount) {
      return {
        error: 'Service account not found',
        success: false,
      };
    }

    // Create new service authentication
    const serviceOptions: ServiceAuthOptions = {
      expiresIn: data.expiresIn,
      permissions: currentAccount.permissions ? JSON.parse(currentAccount.permissions) : [],
      serviceId:
        (currentAccount.metadata as any)?.serviceId ||
        `${data.organizationId}-${currentAccount.name}`,
    };

    const authResult = await createServiceAuth(serviceOptions);

    if (!authResult.success) {
      return authResult;
    }

    // Update the service account with new expiration
    await database.apiKey.update({
      data: {
        expiresAt: authResult.expiresAt,
      },
      where: { id: data.serviceAccountId },
    });

    return authResult;
  } catch (error) {
    console.error('Regenerate service account token error:', error);
    return {
      error: 'Failed to regenerate service account token',
      success: false,
    };
  }
}
