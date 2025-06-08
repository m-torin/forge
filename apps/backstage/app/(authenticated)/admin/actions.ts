'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { 
  filterSensitiveData, 
  validateSecureFields, 
  checkRateLimit,
  auditFieldAccess 
} from './lib/security-middleware';
import { getModelSecurityConfig } from './lib/security-config';

import type { Prisma } from '@prisma/client';

// Generic types for CRUD operations
type ModelName = Prisma.ModelName;
interface PrismaDelegate {
  count: (args?: any) => Promise<number>;
  create: (args: any) => Promise<any>;
  delete: (args: any) => Promise<any>;
  findMany: (args?: any) => Promise<any[]>;
  findUnique: (args: any) => Promise<any>;
  update: (args: any) => Promise<any>;
}

// Map model names to their Prisma delegates
const modelDelegates: Record<string, PrismaDelegate> = {
  // Content Models
  productCategory: database.productCategory as any,
  article: database.article as any,
  brand: database.brand as any,
  collection: database.collection as any,
  taxonomy: database.taxonomy as any,
  review: database.review as any,
  registry: database.registry as any,
  registryItem: database.registryItem as any,
  registryPurchaseJoin: database.registryPurchaseJoin as any,
  media: database.media as any,
  
  // Junction Models
  pdpJoin: database.pdpJoin as any,
  favoriteJoin: database.favoriteJoin as any,
  reviewVoteJoin: database.reviewVoteJoin as any,
  registryUserJoin: database.registryUserJoin as any,
  
  // Authentication & Organization Models
  user: database.user as any,
  session: database.session as any,
  account: database.account as any,
  verification: database.verification as any,
  organization: database.organization as any,
  member: database.member as any,
  team: database.team as any,
  teamMember: database.teamMember as any,
  invitation: database.invitation as any,
  
  // Security Models
  apiKey: database.apiKey as any,
  twoFactor: database.twoFactor as any,
  backupCode: database.backupCode as any,
  passkey: database.passkey as any,
  
  // Product & PIM Models
  product: database.product as any,
  productBarcode: database.productBarcode as any,
  productAsset: database.productAsset as any,
  scanHistory: database.scanHistory as any,
  
  // Workflow Models
  workflowConfig: database.workflowConfig as any,
  workflowExecution: database.workflowExecution as any,
  workflowSchedule: database.workflowSchedule as any,
};

// Generic list action with pagination and filtering (with security)
export async function listRecords(
  modelName: string,
  options: {
    page?: number;
    limit?: number;
    orderBy?: Record<string, 'asc' | 'desc'>;
    where?: Record<string, any>;
    include?: Record<string, boolean>;
  } = {},
) {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  // Check rate limiting for sensitive models
  const modelConfig = getModelSecurityConfig(modelName);
  if (modelConfig) {
    const rateLimit = checkRateLimit(session.user.id, `list_${modelName}`, 100, 60000);
    if (!rateLimit.allowed) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
  }

  const { include, limit = 20, orderBy = { createdAt: 'desc' }, page = 1, where = {} } = options;
  const skip = (page - 1) * limit;

  const delegate = modelDelegates[modelName];
  if (!delegate) throw new Error(`Model ${modelName} not found`);

  const [records, total] = await Promise.all([
    delegate.findMany({
      include,
      orderBy,
      skip,
      take: limit,
      where,
    }),
    delegate.count({ where }),
  ]);

  // Create security context
  const securityContext = {
    userId: session.user.id,
    userRole: session.user.role || 'user',
    permissions: [
      session.user.role,
      ...(session.user.role === 'admin' ? ['admin', 'manage_api_keys', 'manage_security', 'manage_accounts'] : []),
    ],
    sessionId: session.session.id,
  };

  // Filter sensitive data from records
  const filteredRecords = filterSensitiveData(records, modelName, securityContext);

  return {
    limit,
    page,
    pages: Math.ceil(total / limit),
    records: filteredRecords,
    total,
  };
}

// Generic get single record action
export async function getRecord(modelName: string, id: string, include?: Record<string, boolean>) {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  const delegate = modelDelegates[modelName];
  if (!delegate) throw new Error(`Model ${modelName} not found`);

  const record = await delegate.findUnique({
    include,
    where: { id },
  });

  if (!record) throw new Error('Record not found');

  return record;
}

// Generic create action (with security validation)
export async function createRecord(
  modelName: string,
  data: Record<string, any>,
  revalidatePaths?: string[],
) {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  // Create security context
  const securityContext = {
    userId: session.user.id,
    userRole: session.user.role || 'user',
    permissions: [
      session.user.role,
      ...(session.user.role === 'admin' ? ['admin', 'manage_api_keys', 'manage_security', 'manage_accounts'] : []),
    ],
    sessionId: session.session.id,
  };

  // Check rate limiting for sensitive models
  const modelConfig = getModelSecurityConfig(modelName);
  if (modelConfig) {
    const rateLimit = checkRateLimit(session.user.id, `create_${modelName}`, 50, 60000);
    if (!rateLimit.allowed) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
  }

  // Validate secure fields
  const validation = await validateSecureFields(modelName, data, securityContext);
  if (!validation.valid) {
    throw new Error(`Security validation failed: ${validation.errors.join(', ')}`);
  }

  const delegate = modelDelegates[modelName];
  if (!delegate) throw new Error(`Model ${modelName} not found`);

  // Validate foreign key relationships
  for (const [key, value] of Object.entries(validation.sanitizedData)) {
    if (key.endsWith('Id') && value) {
      const relatedModel = key.slice(0, -2);
      const relatedDelegate = modelDelegates[relatedModel];

      if (relatedDelegate) {
        const exists = await relatedDelegate.findUnique({
          where: { id: value },
        });

        if (!exists) {
          throw new Error(`Invalid ${relatedModel}: Record with ID ${value} not found`);
        }
      }
    }
  }

  // Add common fields based on model
  const enrichedData = { ...validation.sanitizedData };

  // Add organization context for models that need it
  if (
    'organizationId' in data ||
    modelName === 'product' ||
    modelName === 'team' ||
    modelName === 'apiKey'
  ) {
    enrichedData.organizationId = data.organizationId || session.session.activeOrganizationId;
  }

  // Add user context for models that track creator
  if ('createdById' in data || modelName === 'product') {
    enrichedData.createdById = data.createdById || session.user.id;
  }

  // Add user context for models that need it
  if ('userId' in data || modelName === 'apiKey' || modelName === 'session') {
    enrichedData.userId = data.userId || session.user.id;
  }

  const record = await delegate.create({
    data: enrichedData,
  });

  // Filter sensitive data from response
  const filteredRecord = filterSensitiveData(record, modelName, securityContext);

  // Revalidate paths
  if (revalidatePaths) {
    revalidatePaths.forEach((path) => revalidatePath(path));
  } else {
    revalidatePath(`/admin/${modelName.toLowerCase()}s`);
    revalidatePath(`/admin/${modelName}`);
  }

  return filteredRecord;
}

// Generic update action (with security validation)
export async function updateRecord(
  modelName: string,
  id: string,
  data: Record<string, any>,
  revalidatePaths?: string[],
) {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  // Create security context
  const securityContext = {
    userId: session.user.id,
    userRole: session.user.role || 'user',
    permissions: [
      session.user.role,
      ...(session.user.role === 'admin' ? ['admin', 'manage_api_keys', 'manage_security', 'manage_accounts'] : []),
    ],
    sessionId: session.session.id,
  };

  // Check rate limiting for sensitive models
  const modelConfig = getModelSecurityConfig(modelName);
  if (modelConfig) {
    const rateLimit = checkRateLimit(session.user.id, `update_${modelName}`, 50, 60000);
    if (!rateLimit.allowed) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
  }

  // Validate secure fields
  const validation = await validateSecureFields(modelName, data, securityContext, id);
  if (!validation.valid) {
    throw new Error(`Security validation failed: ${validation.errors.join(', ')}`);
  }

  const delegate = modelDelegates[modelName];
  if (!delegate) throw new Error(`Model ${modelName} not found`);

  const record = await delegate.update({
    data: validation.sanitizedData,
    where: { id },
  });

  // Filter sensitive data from response
  const filteredRecord = filterSensitiveData(record, modelName, securityContext);

  // Revalidate paths
  if (revalidatePaths) {
    revalidatePaths.forEach((path) => revalidatePath(path));
  } else {
    revalidatePath(`/admin/${modelName.toLowerCase()}s`);
  }

  return filteredRecord;
}

// Generic delete action
export async function deleteRecord(modelName: string, id: string, revalidatePaths?: string[]) {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  const delegate = modelDelegates[modelName];
  if (!delegate) throw new Error(`Model ${modelName} not found`);

  await delegate.delete({
    where: { id },
  });

  // Revalidate paths
  if (revalidatePaths) {
    revalidatePaths.forEach((path) => revalidatePath(path));
  } else {
    revalidatePath(`/admin/${modelName.toLowerCase()}s`);
  }

  return { success: true };
}

// Bulk operations
export async function bulkDeleteRecords(
  modelName: string,
  ids: string[],
  revalidatePaths?: string[],
) {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  const delegate = modelDelegates[modelName];
  if (!delegate) throw new Error(`Model ${modelName} not found`);

  await (delegate as any).deleteMany({
    where: {
      id: { in: ids },
    },
  });

  // Revalidate paths
  if (revalidatePaths) {
    revalidatePaths.forEach((path) => revalidatePath(path));
  } else {
    revalidatePath(`/admin/${modelName.toLowerCase()}s`);
  }

  return { count: ids.length, success: true };
}

// Export data action
export async function exportRecords(
  modelName: string,
  format: 'json' | 'csv',
  where?: Record<string, any>,
) {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  const delegate = modelDelegates[modelName];
  if (!delegate) throw new Error(`Model ${modelName} not found`);

  const records = await delegate.findMany({ where });

  let content: string;
  let mimeType: string;
  let filename: string;

  if (format === 'json') {
    content = JSON.stringify(records, null, 2);
    mimeType = 'application/json';
    filename = `${modelName}-export-${new Date().toISOString().split('T')[0]}.json`;
  } else {
    // CSV export
    if (records.length === 0) {
      content = '';
    } else {
      const headers = Object.keys(records[0]);
      const csvHeaders = headers.join(',');
      const csvRows = records.map((record) =>
        headers
          .map((header) => {
            const value = record[header];
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') return JSON.stringify(value);
            const stringValue = value.toString();
            // Escape quotes and wrap in quotes if contains comma, newline, or quotes
            if (
              stringValue.includes(',') ||
              stringValue.includes('\n') ||
              stringValue.includes('"')
            ) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          })
          .join(','),
      );
      content = [csvHeaders, ...csvRows].join('\n');
    }
    mimeType = 'text/csv';
    filename = `${modelName}-export-${new Date().toISOString().split('T')[0]}.csv`;
  }

  return {
    content,
    mimeType,
    filename,
  };
}
