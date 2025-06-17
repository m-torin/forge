/**
 * Service account management for organizations
 */

import 'server-only';
import { headers } from 'next/headers';

import { auth } from '../auth';

import { checkPermission } from './permissions';

import type { ServiceAuthResult } from '../../shared/api-keys/types';

/**
 * Creates a service account for an organization using better-auth API key metadata
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
        error: 'Insufficient permissions to create service accounts',
        success: false,
      };
    }

    // Use better-auth native createApiKey with service account metadata
    const result = await auth.api.createApiKey({
      body: {
        name: data.name,
        organizationId: data.organizationId,
        permissions: data.permissions,
        expiresIn: data.expiresIn,
        metadata: {
          type: 'service-account',
          description: data.description,
          serviceId: `${data.organizationId}-${data.name}`,
          createdAt: new Date().toISOString(),
        },
      },
      headers: await headers(),
    });

    if (!result?.key) {
      return {
        error: 'Failed to create service account',
        success: false,
      };
    }

    return {
      success: true,
      token: result.key,
      expiresAt: result.expiresAt ? new Date(result.expiresAt) : undefined,
      serviceAccountId: result.id,
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
 * Lists service accounts for an organization using better-auth API key methods
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

    // Use better-auth native listApiKeys method
    const apiKeys = await auth.api.listApiKeys({
      headers: await headers(),
    });

    // Filter for service accounts in this organization
    const serviceAccountKeys = (apiKeys || []).filter(
      (key: any) =>
        key.organizationId === organizationId && key.metadata?.type === 'service-account',
    );

    const serviceAccounts = serviceAccountKeys.map((key: any) => ({
      id: key.id,
      name: key.name,
      createdAt: new Date(key.createdAt),
      description: key.metadata?.description,
      expiresAt: key.expiresAt ? new Date(key.expiresAt) : undefined,
      isActive: !key.expiresAt || new Date(key.expiresAt) > new Date(),
      permissions: Array.isArray(key.permissions)
        ? key.permissions
        : key.permissions
          ? Object.values(key.permissions).flat()
          : [],
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
 * Updates a service account using better-auth API key methods
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

    // Prepare update data for better-auth
    const updateData: any = {
      keyId: data.serviceAccountId,
    };

    if (data.name) {
      updateData.name = data.name;
    }

    if (data.permissions) {
      updateData.permissions = data.permissions;
    }

    if (data.description !== undefined) {
      updateData.metadata = {
        type: 'service-account',
        description: data.description,
        serviceId: `${data.organizationId}-${data.name || 'service'}`,
      };
    }

    // Use better-auth native updateApiKey method
    await auth.api.updateApiKey({
      body: updateData,
      headers: await headers(),
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
 * Revokes a service account using better-auth API key methods
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

    // Use better-auth native deleteApiKey method
    await auth.api.deleteApiKey({
      body: {
        keyId: data.serviceAccountId,
      },
      headers: await headers(),
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
 * Gets service account details using better-auth API key methods
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

    // Use better-auth native listApiKeys to find the specific key
    const apiKeys = await auth.api.listApiKeys({
      headers: await headers(),
    });

    const apiKey = (apiKeys || []).find(
      (key: any) =>
        key.id === data.serviceAccountId &&
        key.organizationId === data.organizationId &&
        key.metadata?.type === 'service-account',
    );

    if (!apiKey) {
      return {
        error: 'Service account not found',
        success: false,
      };
    }

    const serviceAccount = {
      id: apiKey.id,
      name: apiKey.name,
      createdAt: new Date(apiKey.createdAt),
      description: apiKey.metadata?.description,
      expiresAt: apiKey.expiresAt ? new Date(apiKey.expiresAt) : undefined,
      isActive: !apiKey.expiresAt || new Date(apiKey.expiresAt) > new Date(),
      lastUsedAt: apiKey.lastUsedAt ? new Date(apiKey.lastUsedAt) : undefined,
      permissions: Array.isArray(apiKey.permissions)
        ? apiKey.permissions
        : apiKey.permissions
          ? Object.values(apiKey.permissions).flat()
          : [],
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
 * Regenerates service account token using better-auth API key methods
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

    // Get current service account details using better-auth
    const apiKeys = await auth.api.listApiKeys({
      headers: await headers(),
    });

    const currentAccount = (apiKeys || []).find(
      (key: any) =>
        key.id === data.serviceAccountId &&
        key.organizationId === data.organizationId &&
        key.metadata?.type === 'service-account',
    );

    if (!currentAccount) {
      return {
        error: 'Service account not found',
        success: false,
      };
    }

    // Delete the old API key
    await auth.api.deleteApiKey({
      body: { keyId: data.serviceAccountId },
      headers: await headers(),
    });

    // Create a new API key with the same metadata but new token
    const result = await auth.api.createApiKey({
      body: {
        name: currentAccount.name,
        organizationId: data.organizationId,
        expiresIn: data.expiresIn,
        permissions: Array.isArray(currentAccount.permissions)
          ? currentAccount.permissions
          : currentAccount.permissions
            ? Object.values(currentAccount.permissions).flat()
            : [],
        metadata: {
          ...currentAccount.metadata,
          type: 'service-account',
          regeneratedAt: new Date().toISOString(),
        },
      },
      headers: await headers(),
    });

    if (!result?.key) {
      return {
        error: 'Failed to regenerate service account token',
        success: false,
      };
    }

    return {
      success: true,
      token: result.key,
      expiresAt: result.expiresAt ? new Date(result.expiresAt) : undefined,
    };
  } catch (error) {
    console.error('Regenerate service account token error:', error);
    return {
      error: 'Failed to regenerate service account token',
      success: false,
    };
  }
}
