import { database } from '@repo/database/prisma';

// Map of model names to their display field preferences
const MODEL_DISPLAY_FIELDS: Record<string, string[]> = {
  apiKey: ['name', 'prefix'],
  organization: ['name', 'slug'],
  product: ['name', 'sku', 'brand'],
  productAsset: ['name', 'type'],
  productBarcode: ['barcode', 'type'],
  team: ['name'],
  user: ['name', 'email'],
  workflowConfig: ['name', 'type'],
};

// Map of relationships that need special handling
export const RELATIONSHIP_MAP: Record<
  string,
  {
    model: string;
    displayField?: string[];
    where?: Record<string, any>;
    orderBy?: Record<string, any>;
  }
> = {
  barcodeId: {
    model: 'productBarcode',
    orderBy: { barcode: 'asc' },
  },
  createdById: {
    displayField: ['name', 'email'],
    model: 'user',
  },
  organizationId: {
    model: 'organization',
    orderBy: { name: 'asc' },
  },
  productId: {
    model: 'product',
    orderBy: { name: 'asc' },
    where: { status: 'ACTIVE' },
  },
  teamId: {
    model: 'team',
    orderBy: { name: 'asc' },
  },
  userId: {
    model: 'user',
    orderBy: { name: 'asc' },
  },
  workflowId: {
    model: 'workflowConfig',
    orderBy: { name: 'asc' },
    where: { isActive: true },
  },
};

// Get display value for a record
export function getRecordDisplayValue(record: any, modelName: string): string {
  if (!record) return 'Unknown';

  const displayFields = MODEL_DISPLAY_FIELDS[modelName] || ['name', 'title', 'email', 'id'];

  for (const field of displayFields) {
    if (record[field]) {
      // For compound displays (like "name - sku")
      if (displayFields.length > 1 && field !== 'id') {
        const values = displayFields.filter((f) => record[f] && f !== 'id').map((f) => record[f]);
        return values.join(' - ');
      }
      return String(record[field]);
    }
  }

  return record.id || 'Unknown';
}

// Fetch options for a relationship field
export async function fetchRelationshipOptions(fieldName: string, currentValue?: string) {
  const config = RELATIONSHIP_MAP[fieldName];
  if (!config) {
    // Try to infer from field name
    if (fieldName.endsWith('Id')) {
      const modelName = fieldName.slice(0, -2);
      return fetchModelOptions(modelName, {}, currentValue);
    }
    return [];
  }

  return fetchModelOptions(
    config.model,
    {
      orderBy: config.orderBy,
      where: config.where,
    },
    currentValue,
  );
}

// Fetch options for a specific model
async function fetchModelOptions(
  modelName: string,
  options: { where?: any; orderBy?: any } = {},
  currentValue?: string,
) {
  try {
    const delegate = (database as any)[modelName];
    if (!delegate) return [];

    // Fetch records with a reasonable limit
    const records = await delegate.findMany({
      orderBy: options.orderBy || { createdAt: 'desc' },
      take: 100,
      where: options.where,
    });

    // If current value is not in the list, fetch it separately
    if (currentValue && !records.find((r: any) => r.id === currentValue)) {
      try {
        const currentRecord = await delegate.findUnique({
          where: { id: currentValue },
        });
        if (currentRecord) {
          records.unshift(currentRecord);
        }
      } catch {
        // Current record might be deleted
      }
    }

    return records.map((record: any) => ({
      label: getRecordDisplayValue(record, modelName),
      value: record.id,
    }));
  } catch (error) {
    console.error(`Failed to fetch options for ${modelName}:`, error);
    return [];
  }
}

// Get cascade information for a model
export async function getCascadeInfo(modelName: string, recordId: string) {
  const cascadeInfo: {
    model: string;
    count: number;
    action: 'delete' | 'nullify' | 'restrict';
  }[] = [];

  // Define cascade relationships based on Prisma schema
  const cascadeRelationships: Record<
    string,
    {
      model: string;
      field: string;
      action: 'delete' | 'nullify' | 'restrict';
    }[]
  > = {
    organization: [
      { action: 'delete', field: 'organizationId', model: 'member' },
      { action: 'delete', field: 'organizationId', model: 'team' },
      { action: 'delete', field: 'organizationId', model: 'invitation' },
      { action: 'delete', field: 'organizationId', model: 'apiKey' },
    ],
    product: [
      { action: 'delete', field: 'productId', model: 'productBarcode' },
      { action: 'delete', field: 'productId', model: 'productAsset' },
      { action: 'nullify', field: 'productId', model: 'scanHistory' },
    ],
    team: [
      { action: 'delete', field: 'teamId', model: 'teamMember' },
      { action: 'nullify', field: 'teamId', model: 'member' },
    ],
    user: [
      { action: 'delete', field: 'userId', model: 'session' },
      { action: 'delete', field: 'userId', model: 'account' },
      { action: 'delete', field: 'userId', model: 'member' },
      { action: 'delete', field: 'userId', model: 'apiKey' },
    ],
    workflowConfig: [
      { action: 'delete', field: 'workflowId', model: 'workflowExecution' },
      { action: 'delete', field: 'workflowId', model: 'workflowSchedule' },
    ],
  };

  const relationships = cascadeRelationships[modelName] || [];

  for (const rel of relationships) {
    try {
      const delegate = (database as any)[rel.model];
      if (delegate) {
        const count = await delegate.count({
          where: { [rel.field]: recordId },
        });

        if (count > 0) {
          cascadeInfo.push({
            action: rel.action,
            count,
            model: rel.model,
          });
        }
      }
    } catch {
      // Skip if model doesn't exist
    }
  }

  return cascadeInfo;
}
