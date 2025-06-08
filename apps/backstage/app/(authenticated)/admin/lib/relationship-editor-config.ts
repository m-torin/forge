/**
 * Enhanced relationship editor configurations for complex many-to-many relationships
 * These configurations provide specialized UI components for managing junction tables
 */

export interface RelationshipEditorConfig {
  // Basic configuration
  name: string;
  description: string;
  junctionModel: string;
  primaryEntity: string;
  relatedEntity: string;
  
  // UI Configuration
  displayMode: 'table' | 'cards' | 'chips';
  allowMultiSelect: boolean;
  allowInlineCreate: boolean;
  
  // Junction table fields
  junctionFields?: Array<{
    name: string;
    label: string;
    type: string;
    required?: boolean;
    defaultValue?: any;
    options?: Array<{ value: string; label: string }>;
  }>;
  
  // Search and filtering
  searchable: boolean;
  filterFields?: string[];
  
  // Validation
  maxSelections?: number;
  minSelections?: number;
  
  // Custom components
  customRenderer?: string;
  customEditor?: string;
}

/**
 * Relationship editor configurations for all many-to-many relationships
 */
export const relationshipEditorConfigs: Record<string, RelationshipEditorConfig> = {
  
  // Product ↔ Brand (via PdpJoin)
  'product-brands': {
    name: 'Product Brands',
    description: 'Manage which brands sell this product',
    junctionModel: 'pdpJoin',
    primaryEntity: 'product',
    relatedEntity: 'brand',
    displayMode: 'chips',
    allowMultiSelect: true,
    allowInlineCreate: false,
    searchable: true,
    filterFields: ['type', 'status'],
    junctionFields: [
      {
        name: 'isPrimary',
        label: 'Primary Brand',
        type: 'checkbox',
        defaultValue: false,
      },
      {
        name: 'sellerType',
        label: 'Seller Type',
        type: 'select',
        options: [
          { value: 'authorized', label: 'Authorized Dealer' },
          { value: 'official', label: 'Official Store' },
          { value: 'reseller', label: 'Reseller' },
          { value: 'marketplace', label: 'Marketplace' },
        ],
      },
    ],
  },

  // User ↔ Product/Collection (via FavoriteJoin)
  'user-favorites': {
    name: 'User Favorites',
    description: 'Manage user favorite products and collections',
    junctionModel: 'favoriteJoin',
    primaryEntity: 'user',
    relatedEntity: 'mixed', // Can be product or collection
    displayMode: 'table',
    allowMultiSelect: true,
    allowInlineCreate: false,
    searchable: true,
    filterFields: ['type'],
    junctionFields: [
      {
        name: 'itemType',
        label: 'Item Type',
        type: 'select',
        required: true,
        options: [
          { value: 'product', label: 'Product' },
          { value: 'collection', label: 'Collection' },
        ],
      },
      {
        name: 'priority',
        label: 'Priority',
        type: 'number',
        defaultValue: 0,
      },
    ],
  },

  // Product ↔ Taxonomy (many-to-many)
  'product-taxonomies': {
    name: 'Product Taxonomies',
    description: 'Categorize products with taxonomies and tags',
    junctionModel: 'productToTaxonomy', // Virtual junction
    primaryEntity: 'product',
    relatedEntity: 'taxonomy',
    displayMode: 'chips',
    allowMultiSelect: true,
    allowInlineCreate: true,
    searchable: true,
    filterFields: ['type', 'status'],
    maxSelections: 20,
  },

  // Product ↔ Collection (many-to-many)
  'product-collections': {
    name: 'Product Collections',
    description: 'Add products to collections',
    junctionModel: 'productToCollection', // Virtual junction
    primaryEntity: 'product',
    relatedEntity: 'collection',
    displayMode: 'cards',
    allowMultiSelect: true,
    allowInlineCreate: false,
    searchable: true,
    filterFields: ['type', 'status'],
    maxSelections: 10,
  },

  // Collection ↔ Brand (many-to-many)
  'collection-brands': {
    name: 'Collection Brands',
    description: 'Associate brands with collections',
    junctionModel: 'brandToCollection', // Virtual junction
    primaryEntity: 'collection',
    relatedEntity: 'brand',
    displayMode: 'chips',
    allowMultiSelect: true,
    allowInlineCreate: false,
    searchable: true,
    filterFields: ['type', 'status'],
  },

  // Registry ↔ User (via RegistryUserJoin) 
  'registry-users': {
    name: 'Registry Users',
    description: 'Manage registry sharing and permissions',
    junctionModel: 'registryUserJoin',
    primaryEntity: 'registry',
    relatedEntity: 'user',
    displayMode: 'table',
    allowMultiSelect: true,
    allowInlineCreate: false,
    searchable: true,
    filterFields: ['role'],
    junctionFields: [
      {
        name: 'role',
        label: 'Access Level',
        type: 'select',
        required: true,
        defaultValue: 'VIEWER',
        options: [
          { value: 'OWNER', label: 'Owner (Full Access)' },
          { value: 'EDITOR', label: 'Editor (Can Modify)' },
          { value: 'VIEWER', label: 'Viewer (Read Only)' },
        ],
      },
      {
        name: 'canInviteOthers',
        label: 'Can Invite Others',
        type: 'checkbox',
        defaultValue: false,
      },
      {
        name: 'emailNotifications',
        label: 'Email Notifications',
        type: 'checkbox',
        defaultValue: true,
      },
    ],
  },

  // Team ↔ User (via TeamMember)
  'team-members': {
    name: 'Team Members',
    description: 'Manage team membership and roles',
    junctionModel: 'teamMember',
    primaryEntity: 'team',
    relatedEntity: 'user',
    displayMode: 'table',
    allowMultiSelect: true,
    allowInlineCreate: false,
    searchable: true,
    filterFields: ['role'],
    junctionFields: [
      {
        name: 'role',
        label: 'Team Role',
        type: 'select',
        required: true,
        defaultValue: 'member',
        options: [
          { value: 'lead', label: 'Team Lead' },
          { value: 'admin', label: 'Admin' },
          { value: 'member', label: 'Member' },
          { value: 'contributor', label: 'Contributor' },
        ],
      },
      {
        name: 'permissions',
        label: 'Permissions',
        type: 'multiselect',
        options: [
          { value: 'read', label: 'Read' },
          { value: 'write', label: 'Write' },
          { value: 'delete', label: 'Delete' },
          { value: 'admin', label: 'Admin' },
        ],
      },
    ],
  },

  // Review ↔ User (via ReviewVoteJoin)
  'review-votes': {
    name: 'Review Votes',
    description: 'Track helpful/unhelpful votes on reviews',
    junctionModel: 'reviewVoteJoin',
    primaryEntity: 'review',
    relatedEntity: 'user',
    displayMode: 'table',
    allowMultiSelect: false, // One vote per user per review
    allowInlineCreate: false,
    searchable: true,
    filterFields: ['voteType'],
    junctionFields: [
      {
        name: 'voteType',
        label: 'Vote Type',
        type: 'select',
        required: true,
        options: [
          { value: 'HELPFUL', label: '👍 Helpful' },
          { value: 'NOT_HELPFUL', label: '👎 Not Helpful' },
        ],
      },
    ],
  },

  // Registry ↔ Product/Collection (via RegistryItem)
  'registry-items': {
    name: 'Registry Items',
    description: 'Manage items in registries',
    junctionModel: 'registryItem',
    primaryEntity: 'registry',
    relatedEntity: 'mixed', // Can be product or collection
    displayMode: 'table',
    allowMultiSelect: true,
    allowInlineCreate: false,
    searchable: true,
    filterFields: ['priority', 'purchased'],
    junctionFields: [
      {
        name: 'quantity',
        label: 'Quantity',
        type: 'number',
        required: true,
        defaultValue: 1,
      },
      {
        name: 'priority',
        label: 'Priority',
        type: 'select',
        defaultValue: 0,
        options: [
          { value: 0, label: 'Normal' },
          { value: 1, label: 'High' },
          { value: 2, label: 'Urgent' },
        ],
      },
      {
        name: 'notes',
        label: 'Notes',
        type: 'textarea',
      },
      {
        name: 'purchased',
        label: 'Purchased',
        type: 'checkbox',
        defaultValue: false,
      },
    ],
  },
};

/**
 * Helper function to get relationship editor config
 */
export function getRelationshipConfig(
  primaryModel: string,
  relationshipName: string,
): RelationshipEditorConfig | null {
  const configKey = `${primaryModel}-${relationshipName}`;
  return relationshipEditorConfigs[configKey] || null;
}

/**
 * Helper function to get all available relationship types for a model
 */
export function getModelRelationships(modelName: string): string[] {
  return Object.keys(relationshipEditorConfigs)
    .filter(key => key.startsWith(`${modelName}-`))
    .map(key => key.replace(`${modelName}-`, ''));
}

/**
 * Validation helper for relationship constraints
 */
export function validateRelationshipConstraints(
  config: RelationshipEditorConfig,
  selectedItems: any[],
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (config.minSelections && selectedItems.length < config.minSelections) {
    errors.push(`Minimum ${config.minSelections} selections required`);
  }

  if (config.maxSelections && selectedItems.length > config.maxSelections) {
    errors.push(`Maximum ${config.maxSelections} selections allowed`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Helper to determine display text for relationship items
 */
export function getRelationshipDisplayText(
  config: RelationshipEditorConfig,
  item: any,
  junctionData?: any,
): string {
  const baseText = item.name || item.title || item.slug || item.id;
  
  if (!junctionData || !config.junctionFields?.length) {
    return baseText;
  }

  // Add junction field info to display
  const additionalInfo: string[] = [];
  
  config.junctionFields.forEach(field => {
    const value = junctionData[field.name];
    if (value && field.type === 'select') {
      const option = field.options?.find(opt => opt.value === value);
      if (option) {
        additionalInfo.push(option.label);
      }
    } else if (value && field.type === 'checkbox' && value === true) {
      additionalInfo.push(field.label);
    }
  });

  if (additionalInfo.length > 0) {
    return `${baseText} (${additionalInfo.join(', ')})`;
  }

  return baseText;
}