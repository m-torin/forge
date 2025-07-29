// Barrel exports for database actions

// Cart & Orders
export * from './addressesActions';
export * from './cartActions';
export * from './cartItemActions';
export * from './inventoryActions';
export * from './inventoryTransactionActions';
export * from './orderActions';
export * from './orderItemActions';
export * from './transactionActions';

// E-commerce Product Model Actions
export * from './brandActions';
export * from './collectionActions';
export * from './mediaActions';
export * from './productActions';
export * from './productCategoryActions';
export * from './taxonomyActions';

// PDP Model Actions
export * from './pdpActions';

// Content Model Actions
export * from './articleActions';
export * from './castActions';
export * from './fandomActions';
export * from './locationActions';
export * from './seriesActions';
export * from './storyActions';

// Registry Actions
export * from './registryActions';

// Workflow Actions
export * from './workflowActions';

// JollyRoger Model Actions
export * from './jollyRogerActions';

// Business Logic Actions (migrated from deprecated files)
export * from './analyticsActions';
export * from './bulkOperationsActions';
export * from './categoryActions';
export * from './guestActions';
export * from './hierarchyActions';
export * from './relationshipActions';
export * from './softDeleteActions';
export * from './userActions';
export * from './validationActions';

//==============================================================================
// TYPE MAPPINGS FOR JSON FIELDS
//==============================================================================

// Product with description mapped from copy field
export interface ProductWithRelations {
  id: string;
  name: string;
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
