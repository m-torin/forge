import {
  IconBuilding,
  IconCategory,
  IconFolders,
  IconPhoto,
  IconShoppingCart,
  IconTag,
  IconClipboardList,
  IconLocation,
  IconStar,
  IconArticle,
} from '@tabler/icons-react';

// Simple model definitions for navigation and basic features
// Each model can have custom UI implementations when needed

export interface PimModel {
  name: string;
  path: string;
  icon: React.ComponentType<{ size?: number | string }>;
  description: string;
  features: {
    hierarchical?: boolean;
    searchable?: boolean;
    bulkActions?: boolean;
    import?: boolean;
    export?: boolean;
  };
}

export const pimModels = [
  {
    name: 'Products',
    path: '/pim3/products',
    icon: IconShoppingCart,
    description: 'Manage your product catalog and variants',
    features: {
      hierarchical: true, // For variants
      searchable: true,
      bulkActions: true,
      import: true,
      export: true,
    },
  },
  {
    name: 'Brands',
    path: '/pim3/brands',
    icon: IconBuilding,
    description: 'Manage brand hierarchy and relationships',
    features: {
      hierarchical: true,
      searchable: true,
      bulkActions: true,
      import: true,
      export: true,
    },
  },
  {
    name: 'Categories',
    path: '/pim3/categories',
    icon: IconCategory,
    description: 'Organize products into hierarchical categories',
    features: {
      hierarchical: true,
      searchable: true,
      bulkActions: true,
      import: true,
      export: true,
    },
  },
  {
    name: 'Collections',
    path: '/pim3/collections',
    icon: IconFolders,
    description: 'Curated groups of products and content',
    features: {
      hierarchical: true,
      searchable: true,
      bulkActions: true,
      import: true,
      export: true,
    },
  },
  {
    name: 'Media',
    path: '/pim3/media',
    icon: IconPhoto,
    description: 'Manage images, videos, and other media assets',
    features: {
      searchable: true,
      bulkActions: true,
      import: true,
    },
  },
  {
    name: 'Taxonomies',
    path: '/pim3/taxonomies',
    icon: IconTag,
    description: 'Tags, attributes, and other classification systems',
    features: {
      searchable: true,
      bulkActions: true,
      import: true,
      export: true,
    },
  },
  {
    name: 'Reviews',
    path: '/pim3/reviews',
    icon: IconStar,
    description: 'Moderate and manage product reviews',
    features: {
      searchable: true,
      bulkActions: true,
      export: true,
    },
  },
  {
    name: 'Articles',
    path: '/pim3/articles',
    icon: IconArticle,
    description: 'Manage blog posts and content marketing',
    features: {
      searchable: true,
      bulkActions: true,
      export: true,
    },
  },
  {
    name: 'Registries',
    path: '/pim3/registries',
    icon: IconClipboardList,
    description: 'Manage user wishlists and registries',
    features: {
      searchable: true,
      bulkActions: true,
      export: true,
    },
  },
  {
    name: 'Locations',
    path: '/pim3/locations',
    icon: IconLocation,
    description: 'Store locations and venue management',
    features: {
      hierarchical: true,
      searchable: true,
      bulkActions: true,
    },
  },
] as const satisfies readonly PimModel[];

// Helper functions
export function getModelByPath(path: string): PimModel | undefined {
  return pimModels.find((model) => model.path === path);
}

export function getModelByName(name: string): PimModel | undefined {
  return pimModels.find((model) => model.name.toLowerCase() === name.toLowerCase());
}

export function getHierarchicalModels(): PimModel[] {
  return pimModels.filter(
    (model) => 'hierarchical' in model.features && model.features.hierarchical,
  );
}

export function getSearchableModels(): PimModel[] {
  return pimModels.filter((model) => model.features.searchable);
}
