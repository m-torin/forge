// Barrel exports for database actions

// Cart & Orders
export * from './cartActions';
export * from './cartItemActions';
export * from './orderActions';
export * from './orderItemActions';
export * from './transactionActions';
export * from './addressesActions';
export * from './inventoryActions';
export * from './inventoryTransactionActions';

// E-commerce Product Model Actions
export * from './productActions';
export * from './brandActions';
export * from './collectionActions';
export * from './mediaActions';
export * from './taxonomyActions';

// PDP Model Actions
export * from './pdpActions';

// Content Model Actions
export * from './castActions';
export * from './fandomActions';
export * from './locationActions';
export * from './storyActions';
export * from './articleActions';

// Registry Actions
export * from './registryActions';

// Workflow Actions
export * from './workflowActions';

// JollyRoger Model Actions
export * from './jollyRogerActions';

// Business Logic Actions (migrated from deprecated files)
export * from './validationActions';
export * from './softDeleteActions';
export * from './bulkOperationsActions';
export * from './hierarchyActions';
export * from './analyticsActions';
export * from './relationshipActions';
export * from './categoryActions';
export * from './guestActions';
export * from './userActions';

//==============================================================================
// TYPE MAPPINGS FOR JSON FIELDS
//==============================================================================

// Product with description mapped from copy field
export interface ProductWithRelations {
  id: string;
  name: string;
  sku: string;
  slug: string;
  copy: any;
  // Computed properties from copy field
  description?: string;
  [key: string]: any;
}

// Media with computed properties from copy field
export interface MediaWithProduct {
  id: string;
  url: string;
  altText?: string;
  type: string;
  copy: any;
  // Computed properties from copy field
  alt?: string;
  filename?: string;
  description?: string;
  size?: number;
  sortOrder?: number;
  product?: {
    id: string;
    name: string;
    sku: string;
  } | null;
  [key: string]: any;
}

// ProductAsset type alias
export interface ProductAssetWithProduct extends MediaWithProduct {
  // Legacy compatibility
  barcode?: string;
}

// ScanHistory type placeholders
export interface ScanHistory {
  id: string;
  barcode?: string;
  platform?: string;
  success?: boolean;
  scannedAt?: Date;
  [key: string]: any;
}

export interface ScanHistoryWithRelations extends ScanHistory {
  user?: {
    name: string;
    email: string;
  };
}

// AssetType enum
export enum AssetType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  OTHER = 'OTHER',
}

// Legacy deprecated files removed - functionality covered by individual action files
