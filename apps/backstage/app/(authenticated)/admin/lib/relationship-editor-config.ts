/**
 * Enhanced relationship editor configurations for complex many-to-many relationships
 * These configurations provide specialized UI components for managing junction tables
 */

export interface RelationshipEditorConfig {
  description: string;
  junctionModel: string;
  // Basic configuration
  name: string;
  primaryEntity: string;
  relatedEntity: string;

  allowInlineCreate: boolean;
  allowMultiSelect: boolean;
  // UI Configuration
  displayMode: 'table' | 'cards' | 'chips';

  // Junction table fields
  junctionFields?: {
    name: string;
    label: string;
    type: string;
    required?: boolean;
    defaultValue?: any;
    options?: { value: string; label: string }[];
  }[];

  filterFields?: string[];
  // Search and filtering
  searchable: boolean;

  // Validation
  maxSelections?: number;
  minSelections?: number;

  customEditor?: string;
  // Custom components
  customRenderer?: string;
}

/**
 * Relationship editor configurations for all many-to-many relationships
 */
export const relationshipEditorConfigs: Record<string, RelationshipEditorConfig> = {
  // Product ↔ Brand (via PdpJoin)
  'product-brands': {
    name: 'Product Brands',
    allowInlineCreate: false,
    allowMultiSelect: true,
    description: 'Manage which brands sell this product',
    displayMode: 'chips',
    filterFields: ['type', 'status'],
    junctionFields: [
      {
        name: 'isPrimary',
        type: 'checkbox',
        defaultValue: false,
        label: 'Primary Brand',
      },
      {
        name: 'sellerType',
        type: 'select',
        label: 'Seller Type',
        options: [
          { label: 'Authorized Dealer', value: 'authorized' },
          { label: 'Official Store', value: 'official' },
          { label: 'Reseller', value: 'reseller' },
          { label: 'Marketplace', value: 'marketplace' },
        ],
      },
    ],
    junctionModel: 'pdpJoin',
    primaryEntity: 'product',
    relatedEntity: 'brand',
    searchable: true,
  },

  // User ↔ Product/Collection (via FavoriteJoin)
  'user-favorites': {
    name: 'User Favorites',
    allowInlineCreate: false,
    allowMultiSelect: true,
    description: 'Manage user favorite products and collections',
    displayMode: 'table',
    filterFields: ['type'],
    junctionFields: [
      {
        name: 'itemType',
        type: 'select',
        label: 'Item Type',
        options: [
          { label: 'Product', value: 'product' },
          { label: 'Collection', value: 'collection' },
        ],
        required: true,
      },
      {
        name: 'priority',
        type: 'number',
        defaultValue: 0,
        label: 'Priority',
      },
    ],
    junctionModel: 'favoriteJoin',
    primaryEntity: 'user',
    relatedEntity: 'mixed', // Can be product or collection
    searchable: true,
  },

  // Product ↔ Taxonomy (many-to-many)
  'product-taxonomies': {
    name: 'Product Taxonomies',
    allowInlineCreate: true,
    allowMultiSelect: true,
    description: 'Categorize products with taxonomies and tags',
    displayMode: 'chips',
    filterFields: ['type', 'status'],
    junctionModel: 'productToTaxonomy', // Virtual junction
    maxSelections: 20,
    primaryEntity: 'product',
    relatedEntity: 'taxonomy',
    searchable: true,
  },

  // Product ↔ Collection (many-to-many)
  'product-collections': {
    name: 'Product Collections',
    allowInlineCreate: false,
    allowMultiSelect: true,
    description: 'Add products to collections',
    displayMode: 'cards',
    filterFields: ['type', 'status'],
    junctionModel: 'productToCollection', // Virtual junction
    maxSelections: 10,
    primaryEntity: 'product',
    relatedEntity: 'collection',
    searchable: true,
  },

  // Collection ↔ Brand (many-to-many)
  'collection-brands': {
    name: 'Collection Brands',
    allowInlineCreate: false,
    allowMultiSelect: true,
    description: 'Associate brands with collections',
    displayMode: 'chips',
    filterFields: ['type', 'status'],
    junctionModel: 'brandToCollection', // Virtual junction
    primaryEntity: 'collection',
    relatedEntity: 'brand',
    searchable: true,
  },

  // Registry ↔ User (via RegistryUserJoin)
  'registry-users': {
    name: 'Registry Users',
    allowInlineCreate: false,
    allowMultiSelect: true,
    description: 'Manage registry sharing and permissions',
    displayMode: 'table',
    filterFields: ['role'],
    junctionFields: [
      {
        name: 'role',
        type: 'select',
        defaultValue: 'VIEWER',
        label: 'Access Level',
        options: [
          { label: 'Owner (Full Access)', value: 'OWNER' },
          { label: 'Editor (Can Modify)', value: 'EDITOR' },
          { label: 'Viewer (Read Only)', value: 'VIEWER' },
        ],
        required: true,
      },
      {
        name: 'canInviteOthers',
        type: 'checkbox',
        defaultValue: false,
        label: 'Can Invite Others',
      },
      {
        name: 'emailNotifications',
        type: 'checkbox',
        defaultValue: true,
        label: 'Email Notifications',
      },
    ],
    junctionModel: 'registryUserJoin',
    primaryEntity: 'registry',
    relatedEntity: 'user',
    searchable: true,
  },

  // Team ↔ User (via TeamMember)
  'team-members': {
    name: 'Team Members',
    allowInlineCreate: false,
    allowMultiSelect: true,
    description: 'Manage team membership and roles',
    displayMode: 'table',
    filterFields: ['role'],
    junctionFields: [
      {
        name: 'role',
        type: 'select',
        defaultValue: 'member',
        label: 'Team Role',
        options: [
          { label: 'Team Lead', value: 'lead' },
          { label: 'Admin', value: 'admin' },
          { label: 'Member', value: 'member' },
          { label: 'Contributor', value: 'contributor' },
        ],
        required: true,
      },
      {
        name: 'permissions',
        type: 'multiselect',
        label: 'Permissions',
        options: [
          { label: 'Read', value: 'read' },
          { label: 'Write', value: 'write' },
          { label: 'Delete', value: 'delete' },
          { label: 'Admin', value: 'admin' },
        ],
      },
    ],
    junctionModel: 'teamMember',
    primaryEntity: 'team',
    relatedEntity: 'user',
    searchable: true,
  },

  // Review ↔ User (via ReviewVoteJoin)
  'review-votes': {
    name: 'Review Votes',
    allowInlineCreate: false,
    allowMultiSelect: false, // One vote per user per review
    description: 'Track helpful/unhelpful votes on reviews',
    displayMode: 'table',
    filterFields: ['voteType'],
    junctionFields: [
      {
        name: 'voteType',
        type: 'select',
        label: 'Vote Type',
        options: [
          { label: '👍 Helpful', value: 'HELPFUL' },
          { label: '👎 Not Helpful', value: 'NOT_HELPFUL' },
        ],
        required: true,
      },
    ],
    junctionModel: 'reviewVoteJoin',
    primaryEntity: 'review',
    relatedEntity: 'user',
    searchable: true,
  },

  // Registry ↔ Product/Collection (via RegistryItem)
  'registry-items': {
    name: 'Registry Items',
    allowInlineCreate: false,
    allowMultiSelect: true,
    description: 'Manage items in registries',
    displayMode: 'table',
    filterFields: ['priority', 'purchased'],
    junctionFields: [
      {
        name: 'quantity',
        type: 'number',
        defaultValue: 1,
        label: 'Quantity',
        required: true,
      },
      {
        name: 'priority',
        type: 'select',
        defaultValue: 0,
        label: 'Priority',
        options: [
          { label: 'Normal', value: 0 },
          { label: 'High', value: 1 },
          { label: 'Urgent', value: 2 },
        ],
      },
      {
        name: 'notes',
        type: 'textarea',
        label: 'Notes',
      },
      {
        name: 'purchased',
        type: 'checkbox',
        defaultValue: false,
        label: 'Purchased',
      },
    ],
    junctionModel: 'registryItem',
    primaryEntity: 'registry',
    relatedEntity: 'mixed', // Can be product or collection
    searchable: true,
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
    .filter((key) => key.startsWith(`${modelName}-`))
    .map((key) => key.replace(`${modelName}-`, ''));
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

  config.junctionFields.forEach((field) => {
    const value = junctionData[field.name];
    if (value && field.type === 'select') {
      const option = field.options?.find((opt) => opt.value === value);
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
