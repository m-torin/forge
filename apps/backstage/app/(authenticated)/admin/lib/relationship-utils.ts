import { database } from '@repo/database';

// Map of model names to their display field preferences
const MODEL_DISPLAY_FIELDS: Record<string, string[]> = {
  product: ['name', 'sku', 'brand'],
  user: ['name', 'email'],
  organization: ['name', 'slug'],
  team: ['name'],
  apiKey: ['name', 'prefix'],
  workflowConfig: ['name', 'type'],
  productBarcode: ['barcode', 'type'],
  productAsset: ['name', 'type'],
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
  productId: {
    model: 'product',
    where: { status: 'ACTIVE' },
    orderBy: { name: 'asc' },
  },
  userId: {
    model: 'user',
    orderBy: { name: 'asc' },
  },
  organizationId: {
    model: 'organization',
    orderBy: { name: 'asc' },
  },
  teamId: {
    model: 'team',
    orderBy: { name: 'asc' },
  },
  createdById: {
    model: 'user',
    displayField: ['name', 'email'],
  },
  workflowId: {
    model: 'workflowConfig',
    where: { isActive: true },
    orderBy: { name: 'asc' },
  },
  barcodeId: {
    model: 'productBarcode',
    orderBy: { barcode: 'asc' },
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
      where: config.where,
      orderBy: config.orderBy,
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
      where: options.where,
      orderBy: options.orderBy || { createdAt: 'desc' },
      take: 100,
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
      value: record.id,
      label: getRecordDisplayValue(record, modelName),
    }));
  } catch (error) {
    console.error(`Failed to fetch options for ${modelName}:`, error);
    return [];
  }
}

// Get cascade information for a model
export async function getCascadeInfo(modelName: string, recordId: string) {
  const cascadeInfo: Array<{
    model: string;
    count: number;
    action: 'delete' | 'nullify' | 'restrict';
  }> = [];

  // Define cascade relationships based on Prisma schema
  const cascadeRelationships: Record<
    string,
    Array<{
      model: string;
      field: string;
      action: 'delete' | 'nullify' | 'restrict';
    }>
  > = {
    product: [
      { model: 'productBarcode', field: 'productId', action: 'delete' },
      { model: 'productAsset', field: 'productId', action: 'delete' },
      { model: 'scanHistory', field: 'productId', action: 'nullify' },
    ],
    organization: [
      { model: 'member', field: 'organizationId', action: 'delete' },
      { model: 'team', field: 'organizationId', action: 'delete' },
      { model: 'invitation', field: 'organizationId', action: 'delete' },
      { model: 'apiKey', field: 'organizationId', action: 'delete' },
    ],
    user: [
      { model: 'session', field: 'userId', action: 'delete' },
      { model: 'account', field: 'userId', action: 'delete' },
      { model: 'member', field: 'userId', action: 'delete' },
      { model: 'apiKey', field: 'userId', action: 'delete' },
    ],
    team: [
      { model: 'teamMember', field: 'teamId', action: 'delete' },
      { model: 'member', field: 'teamId', action: 'nullify' },
    ],
    workflowConfig: [
      { model: 'workflowExecution', field: 'workflowId', action: 'delete' },
      { model: 'workflowSchedule', field: 'workflowId', action: 'delete' },
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
            model: rel.model,
            count,
            action: rel.action,
          });
        }
      }
    } catch {
      // Skip if model doesn't exist
    }
  }

  return cascadeInfo;
}
