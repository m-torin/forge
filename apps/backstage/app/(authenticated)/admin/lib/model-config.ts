import type { FormField } from '../components/ModelForm';
import { prismaModelConfigs } from './prisma-model-config';

export interface ModelConfig {
  name: string;
  pluralName: string;
  fields: FormField[];
  listColumns: Array<{
    key: string;
    label: string;
    width?: number | string;
    render?: (value: any, record: any) => React.ReactNode;
    type?: string;
    editable?: boolean;
    required?: boolean;
    options?: any[];
    sortable?: boolean;
    priority?: 'high' | 'medium' | 'low';
    hiddenBelow?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  }>;
  searchKeys: string[];
  includes?: Record<string, any>;
  defaultOrderBy?: Record<string, 'asc' | 'desc'>;
}

// Merge existing configs with Prisma model configs
export const modelConfigs: Record<string, ModelConfig> = {
  // Use all Prisma model configurations
  ...prismaModelConfigs,

  // Override or add any custom configurations here
  productBarcode: {
    name: 'Product Barcode',
    pluralName: 'Product Barcodes',
    fields: [
      {
        name: 'barcode',
        label: 'Barcode',
        type: 'text',
        required: true,
        placeholder: 'Enter barcode value',
        validation: (value: string) => {
          if (value && value.length < 8) {
            return 'Barcode must be at least 8 characters';
          }
          return null;
        },
      },
      {
        name: 'type',
        label: 'Barcode Type',
        type: 'select',
        required: true,
        defaultValue: 'EAN_13',
        options: [
          { value: 'UPC_A', label: 'UPC-A' },
          { value: 'UPC_E', label: 'UPC-E' },
          { value: 'EAN_13', label: 'EAN-13' },
          { value: 'EAN_8', label: 'EAN-8' },
          { value: 'CODE_128', label: 'Code 128' },
          { value: 'CODE_39', label: 'Code 39' },
          { value: 'ITF', label: 'ITF' },
          { value: 'QR_CODE', label: 'QR Code' },
          { value: 'DATA_MATRIX', label: 'Data Matrix' },
          { value: 'OTHER', label: 'Other' },
        ],
      },
      {
        name: 'productId',
        label: 'Product',
        type: 'select',
        required: true,
        options: [], // Will be populated dynamically
      },
      {
        name: 'isPrimary',
        label: 'Primary Barcode',
        type: 'switch',
        description: 'Set as the primary barcode for this product',
      },
    ],
    listColumns: [
      { key: 'barcode', label: 'Barcode', width: '30%' },
      { key: 'type', label: 'Type', width: '15%' },
      { key: 'product', label: 'Product', width: '25%' },
      { key: 'isPrimary', label: 'Primary', width: '10%' },
      { key: 'createdAt', label: 'Created', width: '20%' },
    ],
    searchKeys: ['barcode'],
    includes: { product: true },
    defaultOrderBy: { createdAt: 'desc' },
  },

  productAsset: {
    name: 'Product Asset',
    pluralName: 'Product Assets',
    fields: [
      {
        name: 'name',
        label: 'Asset Name',
        type: 'text',
        required: true,
        placeholder: 'Enter asset name',
      },
      {
        name: 'type',
        label: 'Asset Type',
        type: 'select',
        required: true,
        defaultValue: 'IMAGE',
        options: [
          { value: 'IMAGE', label: 'Image' },
          { value: 'VIDEO', label: 'Video' },
          { value: 'DOCUMENT', label: 'Document' },
          { value: 'MANUAL', label: 'Manual' },
          { value: 'CERTIFICATE', label: 'Certificate' },
          { value: 'OTHER', label: 'Other' },
        ],
      },
      {
        name: 'url',
        label: 'Asset URL',
        type: 'text',
        required: true,
        placeholder: 'https://example.com/asset.jpg',
        validation: (value: string) => {
          if (value && !value.match(/^https?:\/\/.+/)) {
            return 'Please enter a valid URL';
          }
          return null;
        },
      },
      {
        name: 'productId',
        label: 'Product',
        type: 'select',
        required: true,
        options: [], // Will be populated dynamically
      },
      {
        name: 'sortOrder',
        label: 'Sort Order',
        type: 'number',
        defaultValue: 0,
        min: 0,
        description: 'Lower numbers appear first',
      },
    ],
    listColumns: [
      { key: 'name', label: 'Name', width: '25%' },
      { key: 'type', label: 'Type', width: '15%' },
      { key: 'product', label: 'Product', width: '25%' },
      { key: 'sortOrder', label: 'Order', width: '10%' },
      { key: 'url', label: 'URL', width: '25%' },
    ],
    searchKeys: ['name', 'url'],
    includes: { product: true },
    defaultOrderBy: { sortOrder: 'asc' },
  },

  scanHistory: {
    name: 'Scan History',
    pluralName: 'Scan History',
    fields: [], // Scan history is typically read-only
    listColumns: [
      { key: 'product', label: 'Product', width: '20%' },
      { key: 'barcode', label: 'Barcode', width: '15%' },
      { key: 'platform', label: 'Platform', width: '10%' },
      { key: 'location', label: 'Location', width: '20%' },
      { key: 'ipAddress', label: 'IP Address', width: '15%' },
      { key: 'createdAt', label: 'Scanned', width: '20%' },
    ],
    searchKeys: ['ipAddress', 'userAgent'],
    includes: {
      product: true,
      barcode: true,
    },
    defaultOrderBy: { createdAt: 'desc' },
  },

  user: {
    name: 'User',
    pluralName: 'Users',
    fields: [
      {
        name: 'name',
        label: 'Name',
        type: 'text',
        required: true,
        placeholder: 'Enter user name',
      },
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        required: true,
        placeholder: 'Enter email address',
      },
      {
        name: 'emailVerified',
        label: 'Email Verified',
        type: 'switch',
        description: 'Whether the email has been verified',
      },
    ],
    listColumns: [
      { key: 'name', label: 'Name', width: '25%' },
      { key: 'email', label: 'Email', width: '30%' },
      { key: 'emailVerified', label: 'Verified', width: '15%' },
      { key: 'createdAt', label: 'Created', width: '15%' },
      { key: 'updatedAt', label: 'Updated', width: '15%' },
    ],
    searchKeys: ['name', 'email'],
    includes: {
      _count: {
        select: {
          sessions: true,
          organizations: true,
        },
      },
    },
    defaultOrderBy: { createdAt: 'desc' },
  },

  organization: {
    name: 'Organization',
    pluralName: 'Organizations',
    fields: [
      {
        name: 'name',
        label: 'Organization Name',
        type: 'text',
        required: true,
        placeholder: 'Enter organization name',
      },
      {
        name: 'slug',
        label: 'Slug',
        type: 'text',
        required: true,
        placeholder: 'organization-slug',
        description: 'URL-friendly identifier',
      },
      {
        name: 'planId',
        label: 'Plan ID',
        type: 'text',
        placeholder: 'Enter plan ID',
      },
    ],
    listColumns: [
      { key: 'name', label: 'Name', width: '30%' },
      { key: 'slug', label: 'Slug', width: '25%' },
      { key: 'planId', label: 'Plan', width: '15%' },
      { key: 'memberCount', label: 'Members', width: '15%' },
      { key: 'createdAt', label: 'Created', width: '15%' },
    ],
    searchKeys: ['name', 'slug'],
    includes: {
      _count: {
        select: {
          members: true,
          teams: true,
        },
      },
    },
    defaultOrderBy: { createdAt: 'desc' },
  },

  apiKey: {
    name: 'API Key',
    pluralName: 'API Keys',
    fields: [
      {
        name: 'name',
        label: 'Key Name',
        type: 'text',
        required: true,
        placeholder: 'Enter API key name',
      },
      {
        name: 'scopes',
        label: 'Scopes',
        type: 'multiselect',
        options: [
          { value: 'read:products', label: 'Read Products' },
          { value: 'write:products', label: 'Write Products' },
          { value: 'read:scans', label: 'Read Scans' },
          { value: 'write:scans', label: 'Write Scans' },
          { value: 'admin', label: 'Admin Access' },
        ],
      },
      {
        name: 'expiresAt',
        label: 'Expiration Date',
        type: 'datetime',
        description: 'Optional expiration date',
      },
    ],
    listColumns: [
      { key: 'name', label: 'Name', width: '25%' },
      { key: 'prefix', label: 'Key Prefix', width: '20%' },
      { key: 'lastUsedAt', label: 'Last Used', width: '20%' },
      { key: 'expiresAt', label: 'Expires', width: '20%' },
      { key: 'createdAt', label: 'Created', width: '15%' },
    ],
    searchKeys: ['name', 'prefix'],
    includes: {
      user: true,
      organization: true,
    },
    defaultOrderBy: { createdAt: 'desc' },
  },

  workflowConfig: {
    name: 'Workflow Config',
    pluralName: 'Workflow Configs',
    fields: [
      {
        name: 'name',
        label: 'Workflow Name',
        type: 'text',
        required: true,
        placeholder: 'Enter workflow name',
      },
      {
        name: 'type',
        label: 'Workflow Type',
        type: 'text',
        required: true,
        placeholder: 'Enter workflow type',
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Enter workflow description',
        rows: 3,
      },
      {
        name: 'isActive',
        label: 'Active',
        type: 'switch',
        description: 'Enable or disable this workflow',
      },
      {
        name: 'config',
        label: 'Configuration',
        type: 'json',
        placeholder: '{}',
        description: 'JSON configuration for the workflow',
      },
    ],
    listColumns: [
      { key: 'name', label: 'Name', width: '25%' },
      { key: 'type', label: 'Type', width: '20%' },
      { key: 'isActive', label: 'Active', width: '10%' },
      { key: 'version', label: 'Version', width: '10%' },
      { key: 'executionCount', label: 'Executions', width: '15%' },
      { key: 'updatedAt', label: 'Updated', width: '20%' },
    ],
    searchKeys: ['name', 'type', 'description'],
    includes: {
      _count: {
        select: {
          executions: true,
          schedules: true,
        },
      },
    },
    defaultOrderBy: { updatedAt: 'desc' },
  },

  workflowExecution: {
    name: 'Workflow Execution',
    pluralName: 'Workflow Executions',
    fields: [], // Executions are typically read-only
    listColumns: [
      { key: 'workflow', label: 'Workflow', width: '25%' },
      { key: 'status', label: 'Status', width: '15%' },
      { key: 'executionId', label: 'Execution ID', width: '20%' },
      { key: 'duration', label: 'Duration', width: '15%' },
      { key: 'startedAt', label: 'Started', width: '25%' },
    ],
    searchKeys: ['executionId'],
    includes: {
      workflow: true,
    },
    defaultOrderBy: { startedAt: 'desc' },
  },
};

// Helper function to get model config
export function getModelConfig(modelName: string): ModelConfig | undefined {
  return modelConfigs[modelName];
}
