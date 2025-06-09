import { prismaModelConfigs } from './prisma-model-config';

import type { FormField } from '../components/ModelForm';

export interface ModelConfig {
  defaultOrderBy?: Record<string, 'asc' | 'desc'>;
  fields: FormField[];
  includes?: Record<string, any>;
  listColumns: {
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
  }[];
  name: string;
  pluralName: string;
  searchKeys: string[];
}

// Merge existing configs with Prisma model configs
export const modelConfigs: Record<string, ModelConfig> = {
  // Use all Prisma model configurations
  ...prismaModelConfigs,

  // Override or add any custom configurations here
  productBarcode: {
    name: 'Product Barcode',
    defaultOrderBy: { createdAt: 'desc' },
    fields: [
      {
        validation: (value: string) => {
          if (value && value.length < 8) {
            return 'Barcode must be at least 8 characters';
          }
          return null;
        },
        name: 'barcode',
        type: 'text',
        label: 'Barcode',
        placeholder: 'Enter barcode value',
        required: true,
      },
      {
        name: 'type',
        type: 'select',
        defaultValue: 'EAN_13',
        label: 'Barcode Type',
        options: [
          { label: 'UPC-A', value: 'UPC_A' },
          { label: 'UPC-E', value: 'UPC_E' },
          { label: 'EAN-13', value: 'EAN_13' },
          { label: 'EAN-8', value: 'EAN_8' },
          { label: 'Code 128', value: 'CODE_128' },
          { label: 'Code 39', value: 'CODE_39' },
          { label: 'ITF', value: 'ITF' },
          { label: 'QR Code', value: 'QR_CODE' },
          { label: 'Data Matrix', value: 'DATA_MATRIX' },
          { label: 'Other', value: 'OTHER' },
        ],
        required: true,
      },
      {
        name: 'productId',
        type: 'select',
        label: 'Product',
        options: [], // Will be populated dynamically
        required: true,
      },
      {
        name: 'isPrimary',
        type: 'switch',
        description: 'Set as the primary barcode for this product',
        label: 'Primary Barcode',
      },
    ],
    includes: { product: true },
    listColumns: [
      { width: '30%', key: 'barcode', label: 'Barcode' },
      { width: '15%', key: 'type', label: 'Type' },
      { width: '25%', key: 'product', label: 'Product' },
      { width: '10%', key: 'isPrimary', label: 'Primary' },
      { width: '20%', key: 'createdAt', label: 'Created' },
    ],
    pluralName: 'Product Barcodes',
    searchKeys: ['barcode'],
  },

  productAsset: {
    name: 'Product Asset',
    defaultOrderBy: { sortOrder: 'asc' },
    fields: [
      {
        name: 'name',
        type: 'text',
        label: 'Asset Name',
        placeholder: 'Enter asset name',
        required: true,
      },
      {
        name: 'type',
        type: 'select',
        defaultValue: 'IMAGE',
        label: 'Asset Type',
        options: [
          { label: 'Image', value: 'IMAGE' },
          { label: 'Video', value: 'VIDEO' },
          { label: 'Document', value: 'DOCUMENT' },
          { label: 'Manual', value: 'MANUAL' },
          { label: 'Certificate', value: 'CERTIFICATE' },
          { label: 'Other', value: 'OTHER' },
        ],
        required: true,
      },
      {
        validation: (value: string) => {
          if (value && !value.match(/^https?:\/\/.+/)) {
            return 'Please enter a valid URL';
          }
          return null;
        },
        name: 'url',
        type: 'text',
        label: 'Asset URL',
        placeholder: 'https://example.com/asset.jpg',
        required: true,
      },
      {
        name: 'productId',
        type: 'select',
        label: 'Product',
        options: [], // Will be populated dynamically
        required: true,
      },
      {
        name: 'sortOrder',
        type: 'number',
        defaultValue: 0,
        description: 'Lower numbers appear first',
        label: 'Sort Order',
        min: 0,
      },
    ],
    includes: { product: true },
    listColumns: [
      { width: '25%', key: 'name', label: 'Name' },
      { width: '15%', key: 'type', label: 'Type' },
      { width: '25%', key: 'product', label: 'Product' },
      { width: '10%', key: 'sortOrder', label: 'Order' },
      { width: '25%', key: 'url', label: 'URL' },
    ],
    pluralName: 'Product Assets',
    searchKeys: ['name', 'url'],
  },

  scanHistory: {
    name: 'Scan History',
    defaultOrderBy: { createdAt: 'desc' },
    fields: [], // Scan history is typically read-only
    includes: {
      barcode: true,
      product: true,
    },
    listColumns: [
      { width: '20%', key: 'product', label: 'Product' },
      { width: '15%', key: 'barcode', label: 'Barcode' },
      { width: '10%', key: 'platform', label: 'Platform' },
      { width: '20%', key: 'location', label: 'Location' },
      { width: '15%', key: 'ipAddress', label: 'IP Address' },
      { width: '20%', key: 'createdAt', label: 'Scanned' },
    ],
    pluralName: 'Scan History',
    searchKeys: ['ipAddress', 'userAgent'],
  },

  user: {
    name: 'User',
    defaultOrderBy: { createdAt: 'desc' },
    fields: [
      {
        name: 'name',
        type: 'text',
        label: 'Name',
        placeholder: 'Enter user name',
        required: true,
      },
      {
        name: 'email',
        type: 'email',
        label: 'Email',
        placeholder: 'Enter email address',
        required: true,
      },
      {
        name: 'emailVerified',
        type: 'switch',
        description: 'Whether the email has been verified',
        label: 'Email Verified',
      },
    ],
    includes: {
      _count: {
        select: {
          organizations: true,
          sessions: true,
        },
      },
    },
    listColumns: [
      { width: '25%', key: 'name', label: 'Name' },
      { width: '30%', key: 'email', label: 'Email' },
      { width: '15%', key: 'emailVerified', label: 'Verified' },
      { width: '15%', key: 'createdAt', label: 'Created' },
      { width: '15%', key: 'updatedAt', label: 'Updated' },
    ],
    pluralName: 'Users',
    searchKeys: ['name', 'email'],
  },

  organization: {
    name: 'Organization',
    defaultOrderBy: { createdAt: 'desc' },
    fields: [
      {
        name: 'name',
        type: 'text',
        label: 'Organization Name',
        placeholder: 'Enter organization name',
        required: true,
      },
      {
        name: 'slug',
        type: 'text',
        description: 'URL-friendly identifier',
        label: 'Slug',
        placeholder: 'organization-slug',
        required: true,
      },
      {
        name: 'planId',
        type: 'text',
        label: 'Plan ID',
        placeholder: 'Enter plan ID',
      },
    ],
    includes: {
      _count: {
        select: {
          members: true,
          teams: true,
        },
      },
    },
    listColumns: [
      { width: '30%', key: 'name', label: 'Name' },
      { width: '25%', key: 'slug', label: 'Slug' },
      { width: '15%', key: 'planId', label: 'Plan' },
      { width: '15%', key: 'memberCount', label: 'Members' },
      { width: '15%', key: 'createdAt', label: 'Created' },
    ],
    pluralName: 'Organizations',
    searchKeys: ['name', 'slug'],
  },

  apiKey: {
    name: 'API Key',
    defaultOrderBy: { createdAt: 'desc' },
    fields: [
      {
        name: 'name',
        type: 'text',
        label: 'Key Name',
        placeholder: 'Enter API key name',
        required: true,
      },
      {
        name: 'scopes',
        type: 'multiselect',
        label: 'Scopes',
        options: [
          { label: 'Read Products', value: 'read:products' },
          { label: 'Write Products', value: 'write:products' },
          { label: 'Read Scans', value: 'read:scans' },
          { label: 'Write Scans', value: 'write:scans' },
          { label: 'Admin Access', value: 'admin' },
        ],
      },
      {
        name: 'expiresAt',
        type: 'datetime',
        description: 'Optional expiration date',
        label: 'Expiration Date',
      },
    ],
    includes: {
      organization: true,
      user: true,
    },
    listColumns: [
      { width: '25%', key: 'name', label: 'Name' },
      { width: '20%', key: 'prefix', label: 'Key Prefix' },
      { width: '20%', key: 'lastUsedAt', label: 'Last Used' },
      { width: '20%', key: 'expiresAt', label: 'Expires' },
      { width: '15%', key: 'createdAt', label: 'Created' },
    ],
    pluralName: 'API Keys',
    searchKeys: ['name', 'prefix'],
  },

  workflowConfig: {
    name: 'Workflow Config',
    defaultOrderBy: { updatedAt: 'desc' },
    fields: [
      {
        name: 'name',
        type: 'text',
        label: 'Workflow Name',
        placeholder: 'Enter workflow name',
        required: true,
      },
      {
        name: 'type',
        type: 'text',
        label: 'Workflow Type',
        placeholder: 'Enter workflow type',
        required: true,
      },
      {
        name: 'description',
        type: 'textarea',
        label: 'Description',
        placeholder: 'Enter workflow description',
        rows: 3,
      },
      {
        name: 'isActive',
        type: 'switch',
        description: 'Enable or disable this workflow',
        label: 'Active',
      },
      {
        name: 'config',
        type: 'json',
        description: 'JSON configuration for the workflow',
        label: 'Configuration',
        placeholder: '{}',
      },
    ],
    includes: {
      _count: {
        select: {
          executions: true,
          schedules: true,
        },
      },
    },
    listColumns: [
      { width: '25%', key: 'name', label: 'Name' },
      { width: '20%', key: 'type', label: 'Type' },
      { width: '10%', key: 'isActive', label: 'Active' },
      { width: '10%', key: 'version', label: 'Version' },
      { width: '15%', key: 'executionCount', label: 'Executions' },
      { width: '20%', key: 'updatedAt', label: 'Updated' },
    ],
    pluralName: 'Workflow Configs',
    searchKeys: ['name', 'type', 'description'],
  },

  workflowExecution: {
    name: 'Workflow Execution',
    defaultOrderBy: { startedAt: 'desc' },
    fields: [], // Executions are typically read-only
    includes: {
      workflow: true,
    },
    listColumns: [
      { width: '25%', key: 'workflow', label: 'Workflow' },
      { width: '15%', key: 'status', label: 'Status' },
      { width: '20%', key: 'executionId', label: 'Execution ID' },
      { width: '15%', key: 'duration', label: 'Duration' },
      { width: '25%', key: 'startedAt', label: 'Started' },
    ],
    pluralName: 'Workflow Executions',
    searchKeys: ['executionId'],
  },
};

// Helper function to get model config
export function getModelConfig(modelName: string): ModelConfig | undefined {
  return modelConfigs[modelName];
}
