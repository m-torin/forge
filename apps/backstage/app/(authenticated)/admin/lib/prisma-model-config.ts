import { type ModelConfig } from './model-config';

// Define configurations for all Prisma models
export const prismaModelConfigs: Record<string, ModelConfig> = {
  // Content Models
  productCategory: {
    name: 'Product Category',
    defaultOrderBy: { displayOrder: 'asc' },
    fields: [
      { name: 'name', type: 'text', label: 'Name', required: true },
      { name: 'slug', type: 'text', label: 'Slug', required: true },
      {
        name: 'status',
        type: 'select',
        label: 'Status',
        options: [
          { label: 'Draft', value: 'DRAFT' },
          { label: 'Published', value: 'PUBLISHED' },
          { label: 'Archived', value: 'ARCHIVED' },
        ],
        required: true,
      },
      { name: 'description', type: 'textarea', label: 'Description' },
      { name: 'parentId', type: 'select', label: 'Parent Category' },
      { name: 'displayOrder', type: 'number', defaultValue: 0, label: 'Display Order' },
      { name: 'metaTitle', type: 'text', label: 'Meta Title' },
      { name: 'metaDescription', type: 'textarea', label: 'Meta Description' },
      { name: 'metaKeywords', type: 'text', label: 'Meta Keywords' },
      { name: 'copy', type: 'json', label: 'Content (JSON)' },
    ],
    includes: {
      _count: {
        select: {
          children: true,
          products: true,
        },
      },
      children: true,
      deletedBy: true,
      parent: true,
    },
    listColumns: [
      {
        key: 'name',
        label: 'Name',
        render: (value: string, record: any) => {
          const level = record.parentId ? '└─ ' : '';
          return `${level}${value}`;
        },
        sortable: true,
      },
      {
        key: 'slug',
        label: 'Slug',
        sortable: true,
      },
      {
        key: 'status',
        label: 'Status',
        render: (value: string) =>
          ({
            ARCHIVED: '📦 Archived',
            DRAFT: '📝 Draft',
            PUBLISHED: '✅ Published',
          })[value] || value,
        sortable: true,
      },
      {
        type: 'number',
        key: 'displayOrder',
        label: 'Order',
        sortable: true,
      },
      {
        key: '_count.products',
        label: 'Products',
        render: (value: any, record: any) => record._count?.products || 0,
      },
      {
        key: '_count.children',
        label: 'Subcategories',
        render: (value: any, record: any) => record._count?.children || 0,
      },
    ],
    pluralName: 'Product Categories',
    searchKeys: ['name', 'slug', 'description'],
  },

  article: {
    name: 'Article',
    defaultOrderBy: { createdAt: 'desc' },
    fields: [
      { name: 'title', type: 'text', label: 'Title', required: true },
      { name: 'slug', type: 'text', label: 'Slug', required: true },
      {
        name: 'status',
        type: 'select',
        label: 'Status',
        options: [
          { label: 'Draft', value: 'DRAFT' },
          { label: 'Published', value: 'PUBLISHED' },
          { label: 'Archived', value: 'ARCHIVED' },
        ],
        required: true,
      },
      { name: 'content', type: 'json', label: 'Content (JSON)', required: true },
      { name: 'userId', type: 'select', label: 'Author' },

      // Relationship fields
      {
        name: 'media',
        type: 'relation',
        label: 'Media Assets',
        relationModel: 'media',
        relationType: 'hasMany',
      },
    ],
    includes: {
      _count: {
        select: {
          media: true,
        },
      },
      deletedBy: true,
      user: true,
    },
    listColumns: [
      {
        key: 'title',
        label: 'Title',
        sortable: true,
      },
      {
        key: 'slug',
        label: 'Slug',
        sortable: true,
      },
      {
        key: 'status',
        label: 'Status',
        render: (value: string) =>
          ({
            ARCHIVED: '📦 Archived',
            DRAFT: '📝 Draft',
            PUBLISHED: '✅ Published',
          })[value] || value,
        sortable: true,
      },
      {
        key: 'user.name',
        label: 'Author',
        render: (value: any, record: any) => record.user?.name || 'Anonymous',
      },
      {
        key: '_count.media',
        label: 'Media',
        render: (value: any, record: any) => record._count?.media || 0,
      },
      {
        key: 'createdAt',
        label: 'Created',
        render: (value: string) => new Date(value).toLocaleDateString(),
        sortable: true,
      },
    ],
    pluralName: 'Articles',
    searchKeys: ['title', 'slug'],
  },

  brand: {
    name: 'Brand',
    defaultOrderBy: { displayOrder: 'asc' },
    fields: [
      { name: 'name', type: 'text', label: 'Name', required: true },
      { name: 'slug', type: 'text', label: 'Slug', required: true },
      {
        name: 'type',
        type: 'select',
        label: 'Type',
        options: [
          { label: 'Manufacturer', value: 'MANUFACTURER' },
          { label: 'Retailer', value: 'RETAILER' },
          { label: 'Marketplace', value: 'MARKETPLACE' },
          { label: 'Service', value: 'SERVICE' },
          { label: 'Other', value: 'OTHER' },
        ],
        required: true,
      },
      {
        name: 'status',
        type: 'select',
        label: 'Status',
        options: [
          { label: 'Draft', value: 'DRAFT' },
          { label: 'Published', value: 'PUBLISHED' },
          { label: 'Archived', value: 'ARCHIVED' },
        ],
        required: true,
      },
      { name: 'baseUrl', type: 'text', label: 'Website URL' },
      { name: 'parentId', type: 'select', label: 'Parent Brand' },
      { name: 'displayOrder', type: 'number', defaultValue: 0, label: 'Display Order' },
      { name: 'copy', type: 'json', label: 'Content (JSON)' },

      // Relationship fields
      {
        name: 'products',
        type: 'relation',
        label: 'Products',
        relationModel: 'pdpJoin',
        relationType: 'hasMany',
      },
      {
        name: 'collections',
        type: 'relation',
        label: 'Collections',
        relationModel: 'collection',
        relationType: 'manyToMany',
      },
      {
        name: 'media',
        type: 'relation',
        label: 'Media Assets',
        relationModel: 'media',
        relationType: 'hasMany',
      },
    ],
    includes: {
      _count: {
        select: {
          children: true,
          collections: true,
          products: true,
        },
      },
      deletedBy: true,
      parent: true,
    },
    listColumns: [
      {
        key: 'name',
        label: 'Name',
        render: (value: string, record: any) => {
          const level = record.parentId ? '└─ ' : '';
          return `${level}${value}`;
        },
        sortable: true,
      },
      {
        key: 'slug',
        label: 'Slug',
        sortable: true,
      },
      {
        key: 'type',
        label: 'Type',
        sortable: true,
      },
      {
        key: 'status',
        label: 'Status',
        render: (value: string) =>
          ({
            ARCHIVED: '📦 Archived',
            DRAFT: '📝 Draft',
            PUBLISHED: '✅ Published',
          })[value] || value,
        sortable: true,
      },
      {
        key: 'baseUrl',
        label: 'Website',
        render: (value: string) => (value ? '🔗' : '—'),
      },
      {
        key: '_count.products',
        label: 'Products',
        render: (value: any, record: any) => record._count?.products || 0,
      },
    ],
    pluralName: 'Brands',
    searchKeys: ['name', 'slug', 'baseUrl'],
  },

  collection: {
    name: 'Collection',
    defaultOrderBy: { createdAt: 'desc' },
    fields: [
      { name: 'name', type: 'text', label: 'Name', required: true },
      { name: 'slug', type: 'text', label: 'Slug', required: true },
      {
        name: 'type',
        type: 'select',
        label: 'Type',
        options: [
          { label: 'Seasonal', value: 'SEASONAL' },
          { label: 'Thematic', value: 'THEMATIC' },
          { label: 'Product Line', value: 'PRODUCT_LINE' },
          { label: 'Featured', value: 'FEATURED' },
          { label: 'Promotional', value: 'PROMOTIONAL' },
          { label: 'Other', value: 'OTHER' },
        ],
        required: true,
      },
      {
        name: 'status',
        type: 'select',
        label: 'Status',
        options: [
          { label: 'Draft', value: 'DRAFT' },
          { label: 'Published', value: 'PUBLISHED' },
          { label: 'Archived', value: 'ARCHIVED' },
        ],
        required: true,
      },
      { name: 'copy', type: 'json', label: 'Content (JSON)' },
      { name: 'userId', type: 'select', label: 'Owner' },

      // Relationship fields
      {
        name: 'products',
        type: 'relation',
        label: 'Products',
        relationModel: 'product',
        relationType: 'manyToMany',
      },
      {
        name: 'brands',
        type: 'relation',
        label: 'Brands',
        relationModel: 'brand',
        relationType: 'manyToMany',
      },
      {
        name: 'taxonomies',
        type: 'relation',
        label: 'Taxonomies',
        relationModel: 'taxonomy',
        relationType: 'manyToMany',
      },
      {
        name: 'categories',
        type: 'relation',
        label: 'Categories',
        relationModel: 'productCategory',
        relationType: 'manyToMany',
      },
      {
        name: 'media',
        type: 'relation',
        label: 'Media Assets',
        relationModel: 'media',
        relationType: 'hasMany',
      },
      {
        name: 'favorites',
        type: 'relation',
        label: 'User Favorites',
        relationModel: 'favoriteJoin',
        relationType: 'hasMany',
      },
      {
        name: 'registries',
        type: 'relation',
        label: 'Registry Items',
        relationModel: 'registryItem',
        relationType: 'hasMany',
      },
    ],
    includes: {
      _count: {
        select: {
          brands: true,
          favorites: true,
          media: true,
          products: true,
        },
      },
      deletedBy: true,
      user: true,
    },
    listColumns: [
      {
        key: 'name',
        label: 'Name',
        sortable: true,
      },
      {
        key: 'slug',
        label: 'Slug',
        sortable: true,
      },
      {
        key: 'type',
        label: 'Type',
        sortable: true,
      },
      {
        key: 'status',
        label: 'Status',
        render: (value: string) =>
          ({
            ARCHIVED: '📦 Archived',
            DRAFT: '📝 Draft',
            PUBLISHED: '✅ Published',
          })[value] || value,
        sortable: true,
      },
      {
        key: '_count.products',
        label: 'Products',
        render: (value: any, record: any) => record._count?.products || 0,
      },
      {
        key: '_count.favorites',
        label: 'Favorites',
        render: (value: any, record: any) => record._count?.favorites || 0,
      },
    ],
    pluralName: 'Collections',
    searchKeys: ['name', 'slug'],
  },

  product: {
    name: 'Product',
    defaultOrderBy: { createdAt: 'desc' },
    fields: [
      { name: 'name', type: 'text', label: 'Product Name', required: true },
      { name: 'sku', type: 'text', label: 'SKU', required: true },
      { name: 'description', type: 'textarea', label: 'Description' },
      { name: 'category', type: 'text', label: 'Category', required: true },
      { name: 'brand', type: 'text', label: 'Brand' },
      { name: 'price', type: 'number', label: 'Price', step: 0.01 },
      { name: 'currency', type: 'text', defaultValue: 'USD', label: 'Currency' },
      {
        name: 'type',
        type: 'select',
        defaultValue: 'PHYSICAL',
        label: 'Product Type',
        options: [
          { label: 'Physical Product', value: 'PHYSICAL' },
          { label: 'Digital Product', value: 'DIGITAL' },
          { label: 'Service', value: 'SERVICE' },
          { label: 'Subscription', value: 'SUBSCRIPTION' },
          { label: 'Product Bundle', value: 'BUNDLE' },
          { label: 'Product Variant', value: 'VARIANT' },
          { label: 'Other', value: 'OTHER' },
        ],
      },
      {
        name: 'status',
        type: 'select',
        defaultValue: 'DRAFT',
        label: 'Status',
        options: [
          { label: 'Draft', value: 'DRAFT' },
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Archived', value: 'ARCHIVED' },
          { label: 'Discontinued', value: 'DISCONTINUED' },
        ],
      },
      { name: 'canonicalUrl', type: 'text', label: 'Canonical URL' },
      { name: 'parentId', type: 'select', label: 'Parent Product' },
      { name: 'copy', type: 'json', label: 'Content (JSON)' },
      { name: 'attributes', type: 'json', label: 'Product Attributes (JSON)' },
      { name: 'aiGenerated', type: 'checkbox', label: 'AI Generated' },
      {
        name: 'aiConfidence',
        type: 'number',
        label: 'AI Confidence (0-1)',
        max: 1,
        min: 0,
        step: 0.01,
      },
      { name: 'aiSources', type: 'tags', label: 'AI Sources' },
      { name: 'createdBy', type: 'select', label: 'Created By' },
      { name: 'organizationId', type: 'select', label: 'Organization' },

      // Relationship fields
      {
        name: 'categories',
        type: 'relation',
        label: 'Product Categories',
        relationModel: 'productCategory',
        relationType: 'hasMany',
      },
      {
        name: 'taxonomies',
        type: 'relation',
        label: 'Taxonomies',
        relationModel: 'taxonomy',
        relationType: 'manyToMany',
      },
      {
        name: 'collections',
        type: 'relation',
        label: 'Collections',
        relationModel: 'collection',
        relationType: 'manyToMany',
      },
      {
        name: 'soldBy',
        type: 'relation',
        label: 'Sold By (Brands)',
        relationModel: 'pdpJoin',
        relationType: 'hasMany',
      },
      {
        name: 'barcodes',
        type: 'relation',
        label: 'Barcodes',
        relationModel: 'productBarcode',
        relationType: 'hasMany',
      },
      {
        name: 'digitalAssets',
        type: 'relation',
        label: 'Digital Assets',
        relationModel: 'productAsset',
        relationType: 'hasMany',
      },
      {
        name: 'favorites',
        type: 'relation',
        label: 'User Favorites',
        relationModel: 'favoriteJoin',
        relationType: 'hasMany',
      },
      {
        name: 'reviews',
        type: 'relation',
        label: 'Product Reviews',
        relationModel: 'review',
        relationType: 'hasMany',
      },
      {
        name: 'registries',
        type: 'relation',
        label: 'Registry Items',
        relationModel: 'registryItem',
        relationType: 'hasMany',
      },
      {
        name: 'media',
        type: 'relation',
        label: 'Product Media',
        relationModel: 'media',
        relationType: 'hasMany',
      },
      {
        name: 'scanHistory',
        type: 'relation',
        label: 'Scan History',
        relationModel: 'scanHistory',
        relationType: 'hasMany',
      },
    ],
    includes: {
      _count: {
        select: {
          barcodes: true,
          children: true,
          collections: true,
          digitalAssets: true,
          favorites: true,
          media: true,
          reviews: true,
          soldBy: true,
        },
      },
      barcodes: true,
      deletedBy: true,
      digitalAssets: true,
      parent: true,
    },
    listColumns: [
      {
        key: 'name',
        label: 'Name',
        render: (value: string, record: any) => {
          const level = record.parentId ? '└─ ' : '';
          const aiIcon = record.aiGenerated ? ' 🤖' : '';
          return `${level}${value}${aiIcon}`;
        },
        sortable: true,
      },
      {
        key: 'sku',
        label: 'SKU',
        sortable: true,
      },
      {
        key: 'type',
        label: 'Type',
        sortable: true,
      },
      {
        key: 'status',
        label: 'Status',
        render: (value: string) =>
          ({
            ACTIVE: '✅ Active',
            ARCHIVED: '📦 Archived',
            DISCONTINUED: '🚫 Discontinued',
            DRAFT: '📝 Draft',
          })[value] || value,
        sortable: true,
      },
      {
        key: 'brand',
        label: 'Brand',
        render: (value: string) => value || '—',
        sortable: true,
      },
      {
        key: 'price',
        label: 'Price',
        render: (value: number, record: any) => {
          if (!value) return '—';
          const currency = record.currency || 'USD';
          return `${currency} ${value.toFixed(2)}`;
        },
      },
      {
        key: 'aiConfidence',
        label: 'AI Confidence',
        render: (value: number, record: any) => {
          if (!record.aiGenerated || !value) return '—';
          return `${(value * 100).toFixed(1)}%`;
        },
      },
      {
        key: '_count.reviews',
        label: 'Reviews',
        render: (value: any, record: any) => record._count?.reviews || 0,
      },
      {
        key: '_count.children',
        label: 'Variants',
        render: (value: any, record: any) => record._count?.children || 0,
      },
    ],
    pluralName: 'Products',
    searchKeys: ['name', 'sku', 'description', 'brand', 'canonicalUrl'],
  },

  taxonomy: {
    name: 'Taxonomy',
    defaultOrderBy: { name: 'asc' },
    fields: [
      { name: 'name', type: 'text', label: 'Name', required: true },
      { name: 'slug', type: 'text', label: 'Slug', required: true },
      {
        name: 'type',
        type: 'select',
        label: 'Type',
        options: [
          { label: 'Category', value: 'CATEGORY' },
          { label: 'Tag', value: 'TAG' },
          { label: 'Attribute', value: 'ATTRIBUTE' },
          { label: 'Department', value: 'DEPARTMENT' },
          { label: 'Collection', value: 'COLLECTION' },
          { label: 'Other', value: 'OTHER' },
        ],
        required: true,
      },
      {
        name: 'status',
        type: 'select',
        label: 'Status',
        options: [
          { label: 'Draft', value: 'DRAFT' },
          { label: 'Published', value: 'PUBLISHED' },
          { label: 'Archived', value: 'ARCHIVED' },
        ],
        required: true,
      },
      { name: 'copy', type: 'json', label: 'Content (JSON)' },

      // Relationship fields
      {
        name: 'products',
        type: 'relation',
        label: 'Products',
        relationModel: 'product',
        relationType: 'manyToMany',
      },
      {
        name: 'collections',
        type: 'relation',
        label: 'Collections',
        relationModel: 'collection',
        relationType: 'manyToMany',
      },
      {
        name: 'media',
        type: 'relation',
        label: 'Media Assets',
        relationModel: 'media',
        relationType: 'hasMany',
      },
    ],
    includes: {
      _count: {
        select: {
          collections: true,
          products: true,
        },
      },
      deletedBy: true,
    },
    listColumns: [
      {
        key: 'name',
        label: 'Name',
        sortable: true,
      },
      {
        key: 'slug',
        label: 'Slug',
        sortable: true,
      },
      {
        key: 'type',
        label: 'Type',
        sortable: true,
      },
      {
        key: 'status',
        label: 'Status',
        render: (value: string) =>
          ({
            ARCHIVED: '📦 Archived',
            DRAFT: '📝 Draft',
            PUBLISHED: '✅ Published',
          })[value] || value,
        sortable: true,
      },
      {
        key: '_count.products',
        label: 'Products',
        render: (value: any, record: any) => record._count?.products || 0,
      },
      {
        key: '_count.collections',
        label: 'Collections',
        render: (value: any, record: any) => record._count?.collections || 0,
      },
    ],
    pluralName: 'Taxonomies',
    searchKeys: ['name', 'slug'],
  },

  review: {
    name: 'Review',
    defaultOrderBy: { createdAt: 'desc' },
    fields: [
      { name: 'title', type: 'text', label: 'Title' },
      { name: 'content', type: 'textarea', label: 'Content', required: true },
      { name: 'rating', type: 'number', label: 'Rating (1-5)', max: 5, min: 1, required: true },
      {
        name: 'status',
        type: 'select',
        label: 'Status',
        options: [
          { label: 'Draft', value: 'DRAFT' },
          { label: 'Published', value: 'PUBLISHED' },
          { label: 'Archived', value: 'ARCHIVED' },
        ],
        required: true,
      },
      { name: 'verified', type: 'checkbox', label: 'Verified Purchase' },
      {
        name: 'type',
        type: 'select',
        label: 'Type',
        options: [
          { label: 'Imported', value: 'IMPORTED' },
          { label: 'Dedicated', value: 'DEDICATED' },
        ],
        required: true,
      },
      { name: 'source', type: 'text', label: 'Source' },
      { name: 'sourceId', type: 'text', label: 'Source ID' },
      { name: 'userId', type: 'select', label: 'User', required: true },
      { name: 'productId', type: 'select', label: 'Product' },

      // Relationship fields
      {
        name: 'media',
        type: 'relation',
        label: 'Media Attachments',
        relationModel: 'media',
        relationType: 'hasMany',
      },
      {
        name: 'votes',
        type: 'relation',
        label: 'Review Votes',
        relationModel: 'reviewVoteJoin',
        relationType: 'hasMany',
      },
    ],
    includes: {
      _count: {
        select: {
          media: true,
          votes: true,
        },
      },
      deletedBy: true,
      product: true,
      user: true,
    },
    listColumns: [
      {
        key: 'title',
        label: 'Title',
        render: (value: string) => value || 'Untitled Review',
        sortable: true,
      },
      {
        type: 'number',
        key: 'rating',
        label: 'Rating',
        render: (value: number) => '⭐'.repeat(value),
        sortable: true,
      },
      {
        key: 'user.name',
        label: 'Author',
        render: (value: any, record: any) => record.user?.name || 'Anonymous',
      },
      {
        key: 'product.name',
        label: 'Product',
        render: (value: any, record: any) => record.product?.name || '—',
      },
      {
        type: 'boolean',
        key: 'verified',
        label: 'Verified',
        render: (value: boolean) => (value ? '✅' : '❌'),
        sortable: true,
      },
      {
        key: 'type',
        label: 'Type',
        sortable: true,
      },
      {
        type: 'number',
        key: 'helpfulCount',
        label: 'Helpful',
        sortable: true,
      },
    ],
    pluralName: 'Reviews',
    searchKeys: ['title', 'content', 'source'],
  },

  registry: {
    name: 'Registry',
    defaultOrderBy: { createdAt: 'desc' },
    fields: [
      { name: 'title', type: 'text', label: 'Title', required: true },
      { name: 'description', type: 'textarea', label: 'Description' },
      {
        name: 'type',
        type: 'select',
        label: 'Type',
        options: [
          { label: 'Wishlist', value: 'WISHLIST' },
          { label: 'Gift Registry', value: 'GIFT' },
          { label: 'Wedding', value: 'WEDDING' },
          { label: 'Baby', value: 'BABY' },
          { label: 'Birthday', value: 'BIRTHDAY' },
          { label: 'Holiday', value: 'HOLIDAY' },
          { label: 'Other', value: 'OTHER' },
        ],
        required: true,
      },
      { name: 'isPublic', type: 'checkbox', label: 'Make Public' },
      { name: 'eventDate', type: 'date', label: 'Event Date' },
      { name: 'createdByUserId', type: 'select', label: 'Created By' },

      // Relationship fields
      {
        name: 'items',
        type: 'relation',
        label: 'Registry Items',
        relationModel: 'registryItem',
        relationType: 'hasMany',
      },
      {
        name: 'users',
        type: 'relation',
        label: 'Shared Users',
        relationModel: 'registryUserJoin',
        relationType: 'hasMany',
      },
    ],
    includes: {
      _count: {
        select: {
          items: true,
          users: true,
        },
      },
      createdByUser: true,
      deletedBy: true,
    },
    listColumns: [
      {
        key: 'title',
        label: 'Title',
        sortable: true,
      },
      {
        key: 'type',
        label: 'Type',
        sortable: true,
      },
      {
        type: 'boolean',
        key: 'isPublic',
        label: 'Public',
        render: (value: boolean) => (value ? '🌐' : '🔒'),
        sortable: true,
      },
      {
        key: 'eventDate',
        label: 'Event Date',
        render: (value: string) => (value ? new Date(value).toLocaleDateString() : '—'),
        sortable: true,
      },
      {
        key: 'createdByUser.name',
        label: 'Created By',
        render: (value: any, record: any) => record.createdByUser?.name || 'Anonymous',
      },
      {
        key: '_count.items',
        label: 'Items',
        render: (value: any, record: any) => record._count?.items || 0,
      },
      {
        key: '_count.users',
        label: 'Shared With',
        render: (value: any, record: any) => record._count?.users || 0,
      },
    ],
    pluralName: 'Registries',
    searchKeys: ['title', 'description'],
  },

  media: {
    name: 'Media',
    defaultOrderBy: { createdAt: 'desc' },
    fields: [
      { name: 'url', type: 'text', label: 'URL', required: true },
      { name: 'altText', type: 'text', label: 'Alt Text' },
      {
        name: 'type',
        type: 'select',
        label: 'Type',
        options: [
          { label: 'Image', value: 'IMAGE' },
          { label: 'Video', value: 'VIDEO' },
          { label: 'Document', value: 'DOCUMENT' },
          { label: 'Audio', value: 'AUDIO' },
        ],
        required: true,
      },
      { name: 'mimeType', type: 'text', label: 'MIME Type' },
      { name: 'width', type: 'number', label: 'Width (px)' },
      { name: 'height', type: 'number', label: 'Height (px)' },
      { name: 'size', type: 'number', label: 'Size (bytes)' },
      { name: 'userId', type: 'select', label: 'Uploaded By' },
      { name: 'articleId', type: 'select', label: 'Article' },
      { name: 'brandId', type: 'select', label: 'Brand' },
      { name: 'collectionId', type: 'select', label: 'Collection' },
      { name: 'productId', type: 'select', label: 'Product' },
      { name: 'taxonomyId', type: 'select', label: 'Taxonomy' },
      { name: 'reviewId', type: 'select', label: 'Review' },
      { name: 'categoryId', type: 'select', label: 'Category' },
    ],
    includes: {
      article: true,
      brand: true,
      category: true,
      collection: true,
      deletedBy: true,
      product: true,
      review: true,
      taxonomy: true,
      user: true,
    },
    listColumns: [
      {
        key: 'url',
        label: 'Preview',
        render: (value: string, record: any) => {
          if (record.type === 'IMAGE') {
            return '🖼️';
          } else if (record.type === 'VIDEO') {
            return '🎥';
          } else if (record.type === 'DOCUMENT') {
            return '📄';
          } else if (record.type === 'AUDIO') {
            return '🎵';
          }
          return '📎';
        },
      },
      {
        key: 'altText',
        label: 'Alt Text',
        render: (value: string) => value || '—',
        sortable: true,
      },
      {
        key: 'type',
        label: 'Type',
        sortable: true,
      },
      {
        key: 'mimeType',
        label: 'MIME Type',
        render: (value: string) => value || '—',
      },
      {
        key: 'size',
        label: 'Size',
        render: (value: number) => {
          if (!value) return '—';
          const kb = value / 1024;
          const mb = kb / 1024;
          if (mb > 1) return `${mb.toFixed(2)} MB`;
          return `${kb.toFixed(2)} KB`;
        },
      },
      {
        key: 'dimensions',
        label: 'Dimensions',
        render: (value: any, record: any) => {
          if (record.width && record.height) {
            return `${record.width}×${record.height}`;
          }
          return '—';
        },
      },
    ],
    pluralName: 'Media',
    searchKeys: ['url', 'altText', 'mimeType'],
  },

  // Authentication Models - Enhanced
  user: {
    name: 'User',
    defaultOrderBy: { createdAt: 'desc' },
    fields: [
      { name: 'name', type: 'text', label: 'Full Name', required: true },
      { name: 'email', type: 'email', label: 'Email Address', required: true },
      { name: 'emailVerified', type: 'checkbox', label: 'Email Verified' },
      { name: 'image', type: 'text', label: 'Profile Image URL' },
      { name: 'phoneNumber', type: 'text', label: 'Phone Number' },
      {
        name: 'role',
        type: 'select',
        defaultValue: 'user',
        label: 'User Role',
        options: [
          { label: 'Administrator', value: 'admin' },
          { label: 'Moderator', value: 'moderator' },
          { label: 'Regular User', value: 'user' },
        ],
      },
      { name: 'banned', type: 'checkbox', label: 'Banned' },
      { name: 'banReason', type: 'textarea', label: 'Ban Reason' },
      { name: 'banExpires', type: 'datetime', label: 'Ban Expires' },
      { name: 'bio', type: 'textarea', label: 'Biography' },
      { name: 'expertise', type: 'tags', label: 'Areas of Expertise' },
      { name: 'isVerifiedAuthor', type: 'checkbox', label: 'Verified Author' },
      { name: 'authorSince', type: 'date', label: 'Author Since' },
      { name: 'isSuspended', type: 'checkbox', label: 'Suspended' },
      { name: 'suspensionDetails', type: 'json', label: 'Suspension Details (JSON)' },
      { name: 'preferences', type: 'json', label: 'User Preferences (JSON)' },

      // Relationship fields
      {
        name: 'sessions',
        type: 'relation',
        label: 'Sessions',
        relationModel: 'session',
        relationType: 'hasMany',
      },
      {
        name: 'accounts',
        type: 'relation',
        label: 'Connected Accounts',
        relationModel: 'account',
        relationType: 'hasMany',
      },
      {
        name: 'members',
        type: 'relation',
        label: 'Organization Memberships',
        relationModel: 'member',
        relationType: 'hasMany',
      },
      {
        name: 'teamMemberships',
        type: 'relation',
        label: 'Team Memberships',
        relationModel: 'teamMember',
        relationType: 'hasMany',
      },
      {
        name: 'invitationsSent',
        type: 'relation',
        label: 'Invitations Sent',
        relationModel: 'invitation',
        relationType: 'hasMany',
      },
      {
        name: 'apiKeys',
        type: 'relation',
        label: 'API Keys',
        relationModel: 'apiKey',
        relationType: 'hasMany',
      },
      {
        name: 'twoFactor',
        type: 'relation',
        label: 'Two-Factor Authentication',
        relationModel: 'twoFactor',
        relationType: 'hasOne',
      },
      {
        name: 'passkeys',
        type: 'relation',
        label: 'Passkeys',
        relationModel: 'passkey',
        relationType: 'hasMany',
      },
    ],
    includes: {
      _count: {
        select: {
          accounts: true,
          articles: true,
          collections: true,
          favorites: true,
          registries: true,
          reviews: true,
          scanHistory: true,
          sessions: true,
        },
      },
    },
    listColumns: [
      {
        key: 'name',
        label: 'Name',
        render: (value: string) => value || 'Anonymous',
        sortable: true,
      },
      {
        key: 'email',
        label: 'Email',
        sortable: true,
      },
      {
        key: 'emailVerified',
        label: 'Verified',
        render: (value: boolean) => (value ? '✅' : '❌'),
        sortable: true,
      },
      {
        type: 'boolean',
        key: 'isVerifiedAuthor',
        label: 'Author',
        render: (value: boolean) => (value ? '✍️' : '—'),
        sortable: true,
      },
      {
        key: 'isSuspended',
        label: 'Status',
        render: (value: boolean, record: any) => {
          if (value) return '🚫 Suspended';
          if (record.banned) return '🚷 Banned';
          return '✅ Active';
        },
        sortable: true,
      },
      {
        key: 'role',
        label: 'Role',
        render: (value: string) => {
          const roles: Record<string, string> = {
            admin: '🛡️ Admin',
            moderator: '⚖️ Moderator',
            user: '👤 User',
          };
          return roles[value] || `🏷️ ${value}`;
        },
        sortable: true,
      },
      {
        key: '_count.sessions',
        label: 'Sessions',
        render: (value: any, record: any) => record._count?.sessions || 0,
      },
      {
        key: '_count.articles',
        label: 'Articles',
        render: (value: any, record: any) => record._count?.articles || 0,
      },
      {
        key: '_count.reviews',
        label: 'Reviews',
        render: (value: any, record: any) => record._count?.reviews || 0,
      },
    ],
    pluralName: 'Users',
    searchKeys: ['name', 'email', 'bio', 'expertise'],
  },

  // Junction Models
  pdpJoin: {
    name: 'Product-Brand Link',
    defaultOrderBy: { createdAt: 'desc' },
    fields: [
      { name: 'productId', type: 'select', label: 'Product', required: true },
      { name: 'brandId', type: 'select', label: 'Brand', required: true },
    ],
    includes: {
      brand: true,
      product: true,
    },
    listColumns: [
      {
        key: 'product.name',
        label: 'Product',
        render: (value: any, record: any) => record.product?.name || '—',
      },
      {
        key: 'brand.name',
        label: 'Brand',
        render: (value: any, record: any) => record.brand?.name || '—',
      },
      {
        key: 'createdAt',
        label: 'Created',
        render: (value: string) => new Date(value).toLocaleDateString(),
        sortable: true,
      },
    ],
    pluralName: 'Product-Brand Links',
    searchKeys: [],
  },

  favoriteJoin: {
    name: 'Favorite',
    defaultOrderBy: { createdAt: 'desc' },
    fields: [
      { name: 'userId', type: 'select', label: 'User', required: true },
      { name: 'productId', type: 'select', label: 'Product' },
      { name: 'collectionId', type: 'select', label: 'Collection' },
    ],
    includes: {
      collection: true,
      product: true,
      user: true,
    },
    listColumns: [
      {
        key: 'user.name',
        label: 'User',
        render: (value: any, record: any) => record.user?.name || record.user?.email || 'Anonymous',
      },
      {
        key: 'item',
        label: 'Item',
        render: (value: any, record: any) => {
          if (record.product) return `Product: ${record.product.name}`;
          if (record.collection) return `Collection: ${record.collection.name}`;
          return '—';
        },
      },
      {
        key: 'createdAt',
        label: 'Favorited',
        render: (value: string) => new Date(value).toLocaleDateString(),
        sortable: true,
      },
    ],
    pluralName: 'Favorites',
    searchKeys: [],
  },

  registryItem: {
    name: 'Registry Item',
    defaultOrderBy: { priority: 'desc' },
    fields: [
      { name: 'registryId', type: 'select', label: 'Registry', required: true },
      { name: 'productId', type: 'select', label: 'Product' },
      { name: 'collectionId', type: 'select', label: 'Collection' },
      { name: 'quantity', type: 'number', defaultValue: 1, label: 'Quantity', required: true },
      {
        name: 'priority',
        type: 'number',
        defaultValue: 0,
        label: 'Priority (0-5)',
        max: 5,
        min: 0,
      },
      { name: 'notes', type: 'textarea', label: 'Notes' },
      { name: 'purchased', type: 'checkbox', label: 'Purchased' },
    ],
    includes: {
      _count: {
        select: {
          purchases: true,
        },
      },
      collection: true,
      deletedBy: true,
      product: true,
      registry: true,
    },
    listColumns: [
      {
        key: 'registry.title',
        label: 'Registry',
        render: (value: any, record: any) => record.registry?.title || '—',
      },
      {
        key: 'item',
        label: 'Item',
        render: (value: any, record: any) => {
          if (record.product) return `Product: ${record.product.name}`;
          if (record.collection) return `Collection: ${record.collection.name}`;
          return '—';
        },
      },
      {
        type: 'number',
        key: 'quantity',
        label: 'Quantity',
        sortable: true,
      },
      {
        type: 'number',
        key: 'priority',
        label: 'Priority',
        render: (value: number) => '⭐'.repeat(Math.min(value, 5)),
        sortable: true,
      },
      {
        type: 'boolean',
        key: 'purchased',
        label: 'Purchased',
        render: (value: boolean) => (value ? '✅' : '⏳'),
        sortable: true,
      },
      {
        key: '_count.purchases',
        label: 'Purchases',
        render: (value: any, record: any) => record._count?.purchases || 0,
      },
    ],
    pluralName: 'Registry Items',
    searchKeys: ['notes'],
  },

  // Authentication Models
  session: {
    name: 'Session',
    defaultOrderBy: { createdAt: 'desc' },
    fields: [
      { name: 'userId', type: 'select', label: 'User', required: true },
      { name: 'expiresAt', type: 'datetime', label: 'Expires At', required: true },
      { name: 'ipAddress', type: 'text', label: 'IP Address' },
      { name: 'userAgent', type: 'textarea', label: 'User Agent' },
      { name: 'activeOrganizationId', type: 'select', label: 'Active Organization' },
      { name: 'impersonatedBy', type: 'select', label: 'Impersonated By' },
    ],
    includes: {
      user: true,
    },
    listColumns: [
      {
        key: 'user.name',
        label: 'User',
        render: (value: any, record: any) => record.user?.name || record.user?.email || 'Anonymous',
      },
      {
        key: 'ipAddress',
        label: 'IP Address',
        sortable: true,
      },
      {
        key: 'userAgent',
        label: 'User Agent',
        render: (value: string) => {
          if (!value) return '—';
          // Extract browser info
          const browser = value.includes('Chrome')
            ? '🌐 Chrome'
            : value.includes('Firefox')
              ? '🦊 Firefox'
              : value.includes('Safari')
                ? '🧭 Safari'
                : '🖥️ Other';
          return browser;
        },
      },
      {
        key: 'activeOrganizationId',
        label: 'Active Org',
        render: (value: string) => (value ? '🏢' : '👤'),
      },
      {
        key: 'impersonatedBy',
        label: 'Impersonated',
        render: (value: string) => (value ? '🎭 Yes' : '—'),
      },
      {
        key: 'expiresAt',
        label: 'Expires',
        render: (value: string) => {
          const date = new Date(value);
          const now = new Date();
          const isExpired = date < now;
          return `${date.toLocaleDateString()} ${isExpired ? '⚠️' : '✅'}`;
        },
        sortable: true,
      },
      {
        key: 'createdAt',
        label: 'Created',
        render: (value: string) => new Date(value).toLocaleDateString(),
        sortable: true,
      },
    ],
    pluralName: 'Sessions',
    searchKeys: ['ipAddress', 'userAgent'],
  },

  account: {
    name: 'Account',
    defaultOrderBy: { createdAt: 'desc' },
    fields: [
      { name: 'userId', type: 'select', label: 'User', required: true },
      { name: 'providerId', type: 'text', label: 'Provider ID', required: true },
      { name: 'accountId', type: 'text', label: 'Account ID', required: true },
      { name: 'scope', type: 'text', label: 'Scopes' },
      { name: 'accessTokenExpiresAt', type: 'datetime', label: 'Access Token Expires' },
      { name: 'refreshTokenExpiresAt', type: 'datetime', label: 'Refresh Token Expires' },

      // Sensitive OAuth tokens - extremely sensitive
      {
        name: 'accessToken',
        type: 'password',
        label: 'Access Token',
        requiresPermission: 'admin',
        sensitive: true,
      },
      {
        name: 'refreshToken',
        type: 'password',
        label: 'Refresh Token',
        requiresPermission: 'admin',
        sensitive: true,
      },
      {
        name: 'idToken',
        type: 'password',
        label: 'ID Token',
        requiresPermission: 'admin',
        sensitive: true,
      },
      {
        name: 'password',
        type: 'password',
        label: 'Password Hash',
        requiresPermission: 'admin',
        sensitive: true,
      },
    ],
    includes: {
      user: true,
    },
    listColumns: [
      {
        key: 'user.name',
        label: 'User',
        render: (value: any, record: any) => record.user?.name || record.user?.email || 'Anonymous',
      },
      {
        key: 'providerId',
        label: 'Provider',
        render: (value: string) => {
          const providers: Record<string, string> = {
            apple: '🍎 Apple',
            discord: '💬 Discord',
            facebook: '📘 Facebook',
            github: '🐙 GitHub',
            google: '🔍 Google',
            microsoft: '🏢 Microsoft',
            twitter: '🐦 Twitter',
          };
          return providers[value.toLowerCase()] || `🔗 ${value}`;
        },
        sortable: true,
      },
      {
        key: 'accountId',
        label: 'Account ID',
        render: (value: string) => value.substring(0, 12) + '...',
      },
      {
        key: 'accessTokenExpiresAt',
        label: 'Token Status',
        render: (value: string) => {
          if (!value) return '🔄 No Token';
          const date = new Date(value);
          const now = new Date();
          const isExpired = date < now;
          return isExpired ? '⚠️ Expired' : '✅ Valid';
        },
      },
      {
        key: 'createdAt',
        label: 'Connected',
        render: (value: string) => new Date(value).toLocaleDateString(),
        sortable: true,
      },
    ],
    pluralName: 'Accounts',
    searchKeys: ['providerId', 'accountId'],
  },

  verification: {
    name: 'Verification',
    defaultOrderBy: { createdAt: 'desc' },
    fields: [
      { name: 'identifier', type: 'text', label: 'Identifier (email/phone)', required: true },
      { name: 'value', type: 'text', label: 'Verification Code', required: true },
      { name: 'expiresAt', type: 'datetime', label: 'Expires At', required: true },
    ],
    includes: {},
    listColumns: [
      {
        key: 'identifier',
        label: 'Identifier',
        render: (value: string) => {
          // Mask email addresses for privacy
          if (value.includes('@')) {
            const [local, domain] = value.split('@');
            const maskedLocal = local.substring(0, 2) + '***';
            return `${maskedLocal}@${domain}`;
          }
          return value;
        },
        sortable: true,
      },
      {
        key: 'value',
        label: 'Code',
        render: (value: string) => '••••••',
      },
      {
        key: 'expiresAt',
        label: 'Expires',
        render: (value: string) => {
          const date = new Date(value);
          const now = new Date();
          const isExpired = date < now;
          return `${date.toLocaleDateString()} ${isExpired ? '⚠️' : '✅'}`;
        },
        sortable: true,
      },
      {
        key: 'createdAt',
        label: 'Created',
        render: (value: string) => new Date(value).toLocaleDateString(),
        sortable: true,
      },
    ],
    pluralName: 'Verifications',
    searchKeys: ['identifier', 'value'],
  },

  // Security Models
  twoFactor: {
    name: 'Two Factor',
    defaultOrderBy: { createdAt: 'desc' },
    fields: [
      { name: 'userId', type: 'select', label: 'User', required: true },
      { name: 'enabled', type: 'checkbox', label: 'Enabled' },
      { name: 'verified', type: 'checkbox', label: 'Verified' },
    ],
    includes: {
      _count: {
        select: {
          backupCodes: true,
        },
      },
      user: true,
    },
    listColumns: [
      {
        key: 'user.name',
        label: 'User',
        render: (value: any, record: any) => record.user?.name || record.user?.email || 'Anonymous',
      },
      {
        key: 'enabled',
        label: 'Status',
        render: (value: boolean, record: any) => {
          if (!value) return '❌ Disabled';
          return record.verified ? '✅ Active' : '⚠️ Pending';
        },
        sortable: true,
      },
      {
        type: 'boolean',
        key: 'verified',
        label: 'Verified',
        render: (value: boolean) => (value ? '✅' : '❌'),
        sortable: true,
      },
      {
        key: '_count.backupCodes',
        label: 'Backup Codes',
        render: (value: any, record: any) => {
          const total = record._count?.backupCodes || 0;
          return `${total} codes`;
        },
      },
      {
        key: 'createdAt',
        label: 'Setup Date',
        render: (value: string) => new Date(value).toLocaleDateString(),
        sortable: true,
      },
    ],
    pluralName: 'Two Factor Authentication',
    searchKeys: [],
  },

  backupCode: {
    name: 'Backup Code',
    defaultOrderBy: { createdAt: 'desc' },
    fields: [
      { name: 'twoFactorId', type: 'select', label: 'Two Factor Auth', required: true },
      { name: 'code', type: 'text', label: 'Backup Code', required: true },
      { name: 'used', type: 'checkbox', label: 'Used' },
      { name: 'usedAt', type: 'datetime', label: 'Used At' },
    ],
    includes: {
      twoFactor: {
        include: {
          user: true,
        },
      },
    },
    listColumns: [
      {
        key: 'twoFactor.user.name',
        label: 'User',
        render: (value: any, record: any) => record.twoFactor?.user?.name || 'Anonymous',
      },
      {
        key: 'code',
        label: 'Code',
        render: () => '••••••••',
      },
      {
        key: 'used',
        label: 'Status',
        render: (value: boolean, record: any) => {
          if (value) {
            const usedDate = new Date(record.usedAt).toLocaleDateString();
            return `✅ Used (${usedDate})`;
          }
          return '⏳ Available';
        },
        sortable: true,
      },
      {
        key: 'createdAt',
        label: 'Created',
        render: (value: string) => new Date(value).toLocaleDateString(),
        sortable: true,
      },
    ],
    pluralName: 'Backup Codes',
    searchKeys: [],
  },

  passkey: {
    name: 'Passkey',
    defaultOrderBy: { createdAt: 'desc' },
    fields: [
      { name: 'userId', type: 'select', label: 'User', required: true },
      { name: 'name', type: 'text', label: 'Passkey Name' },
      { name: 'credentialId', type: 'text', label: 'Credential ID', required: true },
      {
        name: 'deviceType',
        type: 'select',
        label: 'Device Type',
        options: [
          { label: 'Platform Authenticator', value: 'platform' },
          { label: 'Cross-platform Authenticator', value: 'cross-platform' },
          { label: 'Multi-device Authenticator', value: 'multidevice' },
        ],
        required: true,
      },
      { name: 'backedUp', type: 'checkbox', label: 'Backed Up' },
      { name: 'transports', type: 'tags', label: 'Transports' },
    ],
    includes: {
      user: true,
    },
    listColumns: [
      {
        key: 'user.name',
        label: 'User',
        render: (value: any, record: any) => record.user?.name || record.user?.email || 'Anonymous',
      },
      {
        key: 'name',
        label: 'Name',
        render: (value: string) => value || 'Unnamed Passkey',
        sortable: true,
      },
      {
        key: 'deviceType',
        label: 'Device Type',
        render: (value: string) => {
          const types: Record<string, string> = {
            multidevice: '🌐 Multi-device',
            'cross-platform': '🔑 Security Key',
            platform: '📱 Platform',
          };
          return types[value] || `🔐 ${value}`;
        },
        sortable: true,
      },
      {
        type: 'boolean',
        key: 'backedUp',
        label: 'Backed Up',
        render: (value: boolean) => (value ? '☁️ Yes' : '📱 Local'),
        sortable: true,
      },
      {
        key: 'lastUsedAt',
        label: 'Last Used',
        render: (value: string) => (value ? new Date(value).toLocaleDateString() : 'Never'),
      },
      {
        key: 'createdAt',
        label: 'Added',
        render: (value: string) => new Date(value).toLocaleDateString(),
        sortable: true,
      },
    ],
    pluralName: 'Passkeys',
    searchKeys: ['name', 'deviceType'],
  },

  // Team Management Models
  member: {
    name: 'Member',
    defaultOrderBy: { createdAt: 'desc' },
    fields: [
      { name: 'userId', type: 'select', label: 'User', required: true },
      { name: 'organizationId', type: 'select', label: 'Organization', required: true },
      {
        name: 'role',
        type: 'select',
        label: 'Role',
        options: [
          { label: 'Owner', value: 'owner' },
          { label: 'Admin', value: 'admin' },
          { label: 'Member', value: 'member' },
          { label: 'Viewer', value: 'viewer' },
        ],
        required: true,
      },
    ],
    includes: {
      organization: true,
      user: true,
    },
    listColumns: [
      {
        key: 'user.name',
        label: 'User',
        render: (value: any, record: any) => record.user?.name || record.user?.email || 'Anonymous',
      },
      {
        key: 'user.email',
        label: 'Email',
        render: (value: any, record: any) => record.user?.email || '—',
      },
      {
        key: 'organization.name',
        label: 'Organization',
        render: (value: any, record: any) => record.organization?.name || '—',
      },
      {
        key: 'role',
        label: 'Role',
        render: (value: string) => {
          const roles: Record<string, string> = {
            admin: '🛡️ Admin',
            member: '👤 Member',
            owner: '👑 Owner',
            viewer: '👁️ Viewer',
          };
          return roles[value] || `🏷️ ${value}`;
        },
        sortable: true,
      },
      {
        key: 'createdAt',
        label: 'Joined',
        render: (value: string) => new Date(value).toLocaleDateString(),
        sortable: true,
      },
      {
        key: 'updatedAt',
        label: 'Updated',
        render: (value: string) => (value ? new Date(value).toLocaleDateString() : '—'),
      },
    ],
    pluralName: 'Members',
    searchKeys: ['role'],
  },

  team: {
    name: 'Team',
    defaultOrderBy: { createdAt: 'desc' },
    fields: [
      { name: 'name', type: 'text', label: 'Team Name', required: true },
      { name: 'description', type: 'textarea', label: 'Description' },
      { name: 'organizationId', type: 'select', label: 'Organization', required: true },
    ],
    includes: {
      _count: {
        select: {
          invitations: true,
          teamMembers: true,
        },
      },
      organization: true,
    },
    listColumns: [
      {
        key: 'name',
        label: 'Name',
        sortable: true,
      },
      {
        key: 'description',
        label: 'Description',
        render: (value: string) => value || '—',
      },
      {
        key: 'organization.name',
        label: 'Organization',
        render: (value: any, record: any) => record.organization?.name || '—',
      },
      {
        key: '_count.teamMembers',
        label: 'Members',
        render: (value: any, record: any) => record._count?.teamMembers || 0,
      },
      {
        key: '_count.invitations',
        label: 'Pending Invites',
        render: (value: any, record: any) => record._count?.invitations || 0,
      },
      {
        key: 'createdAt',
        label: 'Created',
        render: (value: string) => new Date(value).toLocaleDateString(),
        sortable: true,
      },
    ],
    pluralName: 'Teams',
    searchKeys: ['name', 'description'],
  },

  teamMember: {
    name: 'Team Member',
    defaultOrderBy: { createdAt: 'desc' },
    fields: [
      { name: 'userId', type: 'select', label: 'User', required: true },
      { name: 'teamId', type: 'select', label: 'Team', required: true },
      {
        name: 'role',
        type: 'select',
        defaultValue: 'member',
        label: 'Role',
        options: [
          { label: 'Team Lead', value: 'lead' },
          { label: 'Admin', value: 'admin' },
          { label: 'Member', value: 'member' },
          { label: 'Contributor', value: 'contributor' },
        ],
      },
    ],
    includes: {
      team: {
        include: {
          organization: true,
        },
      },
      user: true,
    },
    listColumns: [
      {
        key: 'user.name',
        label: 'User',
        render: (value: any, record: any) => record.user?.name || record.user?.email || 'Anonymous',
      },
      {
        key: 'team.name',
        label: 'Team',
        render: (value: any, record: any) => record.team?.name || '—',
      },
      {
        key: 'team.organization.name',
        label: 'Organization',
        render: (value: any, record: any) => record.team?.organization?.name || '—',
      },
      {
        key: 'role',
        label: 'Role',
        render: (value: string) => {
          const roles: Record<string, string> = {
            admin: '🛡️ Admin',
            contributor: '✏️ Contributor',
            lead: '🎯 Lead',
            member: '👤 Member',
          };
          return roles[value] || `🏷️ ${value}`;
        },
        sortable: true,
      },
      {
        key: 'createdAt',
        label: 'Joined',
        render: (value: string) => new Date(value).toLocaleDateString(),
        sortable: true,
      },
    ],
    pluralName: 'Team Members',
    searchKeys: ['role'],
  },

  invitation: {
    name: 'Invitation',
    defaultOrderBy: { createdAt: 'desc' },
    fields: [
      { name: 'email', type: 'email', label: 'Email Address', required: true },
      { name: 'organizationId', type: 'select', label: 'Organization', required: true },
      { name: 'teamId', type: 'select', label: 'Team (Optional)' },
      {
        name: 'role',
        type: 'select',
        label: 'Role',
        options: [
          { label: 'Owner', value: 'owner' },
          { label: 'Admin', value: 'admin' },
          { label: 'Member', value: 'member' },
          { label: 'Viewer', value: 'viewer' },
        ],
        required: true,
      },
      {
        name: 'status',
        type: 'select',
        defaultValue: 'pending',
        label: 'Status',
        options: [
          { label: 'Pending', value: 'pending' },
          { label: 'Accepted', value: 'accepted' },
          { label: 'Declined', value: 'declined' },
          { label: 'Expired', value: 'expired' },
        ],
      },
      { name: 'expiresAt', type: 'datetime', label: 'Expires At', required: true },
      { name: 'invitedById', type: 'select', label: 'Invited By', required: true },
    ],
    includes: {
      invitedBy: true,
      organization: true,
      team: true,
    },
    listColumns: [
      {
        key: 'email',
        label: 'Email',
        sortable: true,
      },
      {
        key: 'organization.name',
        label: 'Organization',
        render: (value: any, record: any) => record.organization?.name || '—',
      },
      {
        key: 'team.name',
        label: 'Team',
        render: (value: any, record: any) => record.team?.name || 'Organization Only',
      },
      {
        key: 'role',
        label: 'Role',
        render: (value: string) => {
          const roles: Record<string, string> = {
            admin: '🛡️ Admin',
            member: '👤 Member',
            owner: '👑 Owner',
            viewer: '👁️ Viewer',
          };
          return roles[value] || `🏷️ ${value}`;
        },
        sortable: true,
      },
      {
        key: 'status',
        label: 'Status',
        render: (value: string) => {
          const statuses: Record<string, string> = {
            accepted: '✅ Accepted',
            declined: '❌ Declined',
            expired: '⏰ Expired',
            pending: '⏳ Pending',
          };
          return statuses[value] || value;
        },
        sortable: true,
      },
      {
        key: 'invitedBy.name',
        label: 'Invited By',
        render: (value: any, record: any) => record.invitedBy?.name || 'System',
      },
      {
        key: 'expiresAt',
        label: 'Expires',
        render: (value: string) => {
          const date = new Date(value);
          const now = new Date();
          const isExpired = date < now;
          return `${date.toLocaleDateString()} ${isExpired ? '⚠️' : '✅'}`;
        },
        sortable: true,
      },
    ],
    pluralName: 'Invitations',
    searchKeys: ['email', 'role', 'status'],
  },

  // Registry Advanced Models
  registryPurchaseJoin: {
    name: 'Registry Purchase',
    defaultOrderBy: { purchaseDate: 'desc' },
    fields: [
      { name: 'registryItemId', type: 'select', label: 'Registry Item', required: true },
      { name: 'purchaserId', type: 'select', label: 'Purchaser', required: true },
      { name: 'quantity', type: 'number', defaultValue: 1, label: 'Quantity', required: true },
      { name: 'price', type: 'number', label: 'Price', step: 0.01 },
      { name: 'currency', type: 'text', defaultValue: 'USD', label: 'Currency' },
      {
        name: 'status',
        type: 'select',
        defaultValue: 'PENDING',
        label: 'Status',
        options: [
          { label: 'Pending', value: 'PENDING' },
          { label: 'Confirmed', value: 'CONFIRMED' },
          { label: 'Shipped', value: 'SHIPPED' },
          { label: 'Delivered', value: 'DELIVERED' },
          { label: 'Cancelled', value: 'CANCELLED' },
          { label: 'Returned', value: 'RETURNED' },
        ],
      },
      { name: 'transactionId', type: 'text', label: 'Transaction ID' },
      { name: 'orderNumber', type: 'text', label: 'Order Number' },
      { name: 'trackingNumber', type: 'text', label: 'Tracking Number' },
      { name: 'trackingUrl', type: 'text', label: 'Tracking URL' },
      { name: 'isGift', type: 'checkbox', label: 'Is Gift' },
      { name: 'giftMessage', type: 'textarea', label: 'Gift Message' },
      { name: 'giftWrapped', type: 'checkbox', label: 'Gift Wrapped' },
      { name: 'estimatedDelivery', type: 'date', label: 'Estimated Delivery' },
      { name: 'actualDelivery', type: 'date', label: 'Actual Delivery' },
      { name: 'notes', type: 'textarea', label: 'Notes' },
    ],
    includes: {
      purchaser: true,
      registryItem: {
        include: {
          collection: true,
          product: true,
          registry: true,
        },
      },
    },
    listColumns: [
      {
        key: 'registryItem.registry.title',
        label: 'Registry',
        render: (value: any, record: any) => record.registryItem?.registry?.title || '—',
      },
      {
        key: 'item',
        label: 'Item',
        render: (value: any, record: any) => {
          const item = record.registryItem;
          if (item?.product) return `Product: ${item.product.name}`;
          if (item?.collection) return `Collection: ${item.collection.name}`;
          return '—';
        },
      },
      {
        key: 'purchaser.name',
        label: 'Purchased By',
        render: (value: any, record: any) =>
          record.purchaser?.name || record.purchaser?.email || 'Anonymous',
      },
      {
        type: 'number',
        key: 'quantity',
        label: 'Quantity',
        sortable: true,
      },
      {
        key: 'price',
        label: 'Price',
        render: (value: number, record: any) => {
          if (!value) return '—';
          const currency = record.currency || 'USD';
          return `${currency} ${value.toFixed(2)}`;
        },
      },
      {
        key: 'status',
        label: 'Status',
        render: (value: string) => {
          const statuses: Record<string, string> = {
            CANCELLED: '❌ Cancelled',
            CONFIRMED: '✅ Confirmed',
            DELIVERED: '🎉 Delivered',
            PENDING: '⏳ Pending',
            RETURNED: '↩️ Returned',
            SHIPPED: '📦 Shipped',
          };
          return statuses[value] || value;
        },
        sortable: true,
      },
      {
        key: 'isGift',
        label: 'Gift',
        render: (value: boolean) => (value ? '🎁' : '🛒'),
      },
      {
        key: 'purchaseDate',
        label: 'Purchase Date',
        render: (value: string) => new Date(value).toLocaleDateString(),
        sortable: true,
      },
    ],
    pluralName: 'Registry Purchases',
    searchKeys: ['orderNumber', 'transactionId', 'trackingNumber'],
  },

  registryUserJoin: {
    name: 'Registry User',
    defaultOrderBy: { createdAt: 'desc' },
    fields: [
      { name: 'userId', type: 'select', label: 'User', required: true },
      { name: 'registryId', type: 'select', label: 'Registry', required: true },
      {
        name: 'role',
        type: 'select',
        defaultValue: 'VIEWER',
        label: 'Role',
        options: [
          { label: 'Owner', value: 'OWNER' },
          { label: 'Editor', value: 'EDITOR' },
          { label: 'Viewer', value: 'VIEWER' },
        ],
      },
    ],
    includes: {
      registry: true,
      user: true,
    },
    listColumns: [
      {
        key: 'user.name',
        label: 'User',
        render: (value: any, record: any) => record.user?.name || record.user?.email || 'Anonymous',
      },
      {
        key: 'registry.title',
        label: 'Registry',
        render: (value: any, record: any) => record.registry?.title || '—',
      },
      {
        key: 'registry.type',
        label: 'Registry Type',
        render: (value: any, record: any) => record.registry?.type || '—',
      },
      {
        key: 'role',
        label: 'Role',
        render: (value: string) => {
          const roles: Record<string, string> = {
            EDITOR: '✏️ Editor',
            OWNER: '👑 Owner',
            VIEWER: '👁️ Viewer',
          };
          return roles[value] || value;
        },
        sortable: true,
      },
      {
        key: 'createdAt',
        label: 'Added',
        render: (value: string) => new Date(value).toLocaleDateString(),
        sortable: true,
      },
    ],
    pluralName: 'Registry Users',
    searchKeys: ['role'],
  },

  // Review Enhancement
  reviewVoteJoin: {
    name: 'Review Vote',
    defaultOrderBy: { createdAt: 'desc' },
    fields: [
      { name: 'userId', type: 'select', label: 'User', required: true },
      { name: 'reviewId', type: 'select', label: 'Review', required: true },
      {
        name: 'voteType',
        type: 'select',
        label: 'Vote Type',
        options: [
          { label: 'Helpful', value: 'HELPFUL' },
          { label: 'Not Helpful', value: 'NOT_HELPFUL' },
        ],
        required: true,
      },
    ],
    includes: {
      review: {
        include: {
          product: true,
          user: true,
        },
      },
      user: true,
    },
    listColumns: [
      {
        key: 'user.name',
        label: 'Voter',
        render: (value: any, record: any) => record.user?.name || record.user?.email || 'Anonymous',
      },
      {
        key: 'review.title',
        label: 'Review',
        render: (value: any, record: any) => record.review?.title || 'Untitled Review',
      },
      {
        key: 'review.user.name',
        label: 'Review Author',
        render: (value: any, record: any) => record.review?.user?.name || 'Anonymous',
      },
      {
        key: 'review.product.name',
        label: 'Product',
        render: (value: any, record: any) => record.review?.product?.name || '—',
      },
      {
        key: 'voteType',
        label: 'Vote',
        render: (value: string) => {
          return value === 'HELPFUL' ? '👍 Helpful' : '👎 Not Helpful';
        },
        sortable: true,
      },
      {
        key: 'createdAt',
        label: 'Voted',
        render: (value: string) => new Date(value).toLocaleDateString(),
        sortable: true,
      },
    ],
    pluralName: 'Review Votes',
    searchKeys: [],
  },

  // Workflow Enhancement
  workflowSchedule: {
    name: 'Workflow Schedule',
    defaultOrderBy: { nextRunAt: 'asc' },
    fields: [
      { name: 'configId', type: 'select', label: 'Workflow Config', required: true },
      { name: 'name', type: 'text', label: 'Schedule Name', required: true },
      { name: 'description', type: 'textarea', label: 'Description' },
      { name: 'cronExpression', type: 'text', label: 'Cron Expression', required: true },
      { name: 'timezone', type: 'text', defaultValue: 'UTC', label: 'Timezone' },
      { name: 'isActive', type: 'checkbox', defaultValue: true, label: 'Active' },
      { name: 'payload', type: 'json', label: 'Payload (JSON)', required: true },
      { name: 'validFrom', type: 'datetime', label: 'Valid From' },
      { name: 'validUntil', type: 'datetime', label: 'Valid Until' },
      { name: 'createdBy', type: 'select', label: 'Created By' },
    ],
    includes: {
      config: {
        include: {
          _count: {
            select: {
              schedules: true,
            },
          },
        },
      },
    },
    listColumns: [
      {
        key: 'name',
        label: 'Name',
        sortable: true,
      },
      {
        key: 'config.workflowSlug',
        label: 'Workflow',
        render: (value: any, record: any) => record.config?.workflowSlug || '—',
      },
      {
        key: 'cronExpression',
        label: 'Schedule',
        render: (value: string) => `⏰ ${value}`,
      },
      {
        key: 'isActive',
        label: 'Status',
        render: (value: boolean) => (value ? '✅ Active' : '⏸️ Paused'),
        sortable: true,
      },
      {
        key: 'nextRunAt',
        label: 'Next Run',
        render: (value: string) => {
          if (!value) return '—';
          const date = new Date(value);
          const now = new Date();
          const isPast = date < now;
          return `${date.toLocaleString()} ${isPast ? '⚠️' : '⏰'}`;
        },
        sortable: true,
      },
      {
        key: 'lastRunStatus',
        label: 'Last Status',
        render: (value: string) => {
          if (!value) return 'Never run';
          const statuses: Record<string, string> = {
            cancelled: '⏹️ Cancelled',
            failed: '❌ Failed',
            running: '🔄 Running',
            success: '✅ Success',
          };
          return statuses[value] || value;
        },
      },
      {
        key: 'stats',
        label: 'Success Rate',
        render: (value: any, record: any) => {
          const total = record.totalRuns || 0;
          const successful = record.successfulRuns || 0;
          if (total === 0) return '—';
          const rate = ((successful / total) * 100).toFixed(1);
          return `${rate}% (${successful}/${total})`;
        },
      },
    ],
    pluralName: 'Workflow Schedules',
    searchKeys: ['name', 'description', 'cronExpression'],
  },

  // MISSING MODEL CONFIGURATIONS - Adding the 7 critical models

  // Enhanced Organization Model (was missing)
  organization: {
    name: 'Organization',
    defaultOrderBy: { createdAt: 'desc' },
    fields: [
      { name: 'name', type: 'text', label: 'Organization Name', required: true },
      { name: 'slug', type: 'text', label: 'URL Slug', required: true },
      { name: 'description', type: 'textarea', label: 'Description' },
      { name: 'logo', type: 'text', label: 'Logo URL' },
      { name: 'metadata', type: 'json', label: 'Metadata (JSON)' },

      // Relationship fields
      {
        name: 'members',
        type: 'relation',
        label: 'Organization Members',
        relationModel: 'member',
        relationType: 'hasMany',
      },
      {
        name: 'teams',
        type: 'relation',
        label: 'Teams',
        relationModel: 'team',
        relationType: 'hasMany',
      },
      {
        name: 'invitations',
        type: 'relation',
        label: 'Pending Invitations',
        relationModel: 'invitation',
        relationType: 'hasMany',
      },
    ],
    includes: {
      _count: {
        select: {
          invitations: true,
          members: true,
          teams: true,
        },
      },
    },
    listColumns: [
      {
        key: 'name',
        label: 'Name',
        sortable: true,
      },
      {
        key: 'slug',
        label: 'Slug',
        sortable: true,
      },
      {
        key: 'description',
        label: 'Description',
        render: (value: string) => value || '—',
      },
      {
        key: '_count.members',
        label: 'Members',
        render: (value: any, record: any) => record._count?.members || 0,
      },
      {
        key: '_count.teams',
        label: 'Teams',
        render: (value: any, record: any) => record._count?.teams || 0,
      },
      {
        key: '_count.invitations',
        label: 'Pending Invites',
        render: (value: any, record: any) => record._count?.invitations || 0,
      },
      {
        key: 'createdAt',
        label: 'Created',
        render: (value: string) => new Date(value).toLocaleDateString(),
        sortable: true,
      },
    ],
    pluralName: 'Organizations',
    searchKeys: ['name', 'slug', 'description'],
  },

  // Enhanced API Key Model (was missing)
  apiKey: {
    name: 'API Key',
    defaultOrderBy: { createdAt: 'desc' },
    fields: [
      { name: 'name', type: 'text', label: 'API Key Name', required: true },
      { name: 'userId', type: 'select', label: 'Owner', required: true },
      { name: 'organizationId', type: 'select', label: 'Organization' },
      { name: 'enabled', type: 'checkbox', defaultValue: true, label: 'Enabled' },
      { name: 'expiresAt', type: 'datetime', label: 'Expiration Date' },
      { name: 'rateLimitEnabled', type: 'checkbox', defaultValue: true, label: 'Rate Limiting' },
      { name: 'rateLimitMax', type: 'number', label: 'Rate Limit (requests)' },
      { name: 'rateLimitTimeWindow', type: 'number', label: 'Time Window (seconds)' },
      { name: 'permissions', type: 'json', label: 'Permissions (JSON)' },
      { name: 'metadata', type: 'json', label: 'Metadata (JSON)' },

      // Sensitive fields - handled with special security
      {
        name: 'key',
        type: 'password',
        label: 'API Key (Full)',
        requiresPermission: 'admin',
        sensitive: true,
      },
      { name: 'keyHash', type: 'text', label: 'Key Hash', readonly: true, sensitive: true },
      { name: 'start', type: 'text', label: 'Key Prefix', readonly: true },
      { name: 'prefix', type: 'text', label: 'Key Identifier', readonly: true },
    ],
    includes: {
      user: true,
    },
    listColumns: [
      {
        key: 'name',
        label: 'Name',
        sortable: true,
      },
      {
        key: 'prefix',
        label: 'Key Prefix',
        render: (value: string) => (value ? `${value}...` : '—'),
      },
      {
        key: 'user.name',
        label: 'Owner',
        render: (value: any, record: any) => record.user?.name || record.user?.email || 'System',
      },
      {
        key: 'enabled',
        label: 'Status',
        render: (value: boolean, record: any) => {
          if (!value) return '🔴 Disabled';
          const expired = record.expiresAt && new Date(record.expiresAt) < new Date();
          if (expired) return '⚠️ Expired';
          return '✅ Active';
        },
        sortable: true,
      },
      {
        key: 'lastUsedAt',
        label: 'Last Used',
        render: (value: string) => (value ? new Date(value).toLocaleDateString() : 'Never'),
      },
      {
        key: 'expiresAt',
        label: 'Expires',
        render: (value: string) => {
          if (!value) return 'Never';
          const date = new Date(value);
          const isExpired = date < new Date();
          return `${date.toLocaleDateString()} ${isExpired ? '⚠️' : ''}`;
        },
      },
      {
        key: 'requestCount',
        label: 'Requests',
        render: (value: number) => value?.toLocaleString() || '0',
        sortable: true,
      },
    ],
    pluralName: 'API Keys',
    searchKeys: ['name', 'prefix'],
  },

  // Enhanced Workflow Config Model (was missing)
  workflowConfig: {
    name: 'Workflow Config',
    defaultOrderBy: { updatedAt: 'desc' },
    fields: [
      { name: 'workflowSlug', type: 'text', label: 'Workflow Slug', required: true },
      { name: 'organizationId', type: 'select', label: 'Organization' },
      { name: 'userId', type: 'select', label: 'User' },
      { name: 'isEnabled', type: 'checkbox', defaultValue: true, label: 'Enabled' },
      { name: 'displayName', type: 'text', label: 'Display Name' },
      { name: 'description', type: 'textarea', label: 'Description' },
      { name: 'category', type: 'text', label: 'Category' },
      { name: 'tags', type: 'tags', label: 'Tags' },
      { name: 'notifyOnStart', type: 'checkbox', label: 'Notify on Start' },
      { name: 'notifyOnComplete', type: 'checkbox', label: 'Notify on Complete' },
      { name: 'notifyOnFailure', type: 'checkbox', defaultValue: true, label: 'Notify on Failure' },
      { name: 'notifyOnApproval', type: 'checkbox', label: 'Notify on Approval' },
      { name: 'notificationEmail', type: 'email', label: 'Notification Email' },
      { name: 'maxRetries', type: 'number', label: 'Max Retries' },
      { name: 'timeoutSeconds', type: 'number', label: 'Timeout (seconds)' },
      { name: 'rateLimitPerHour', type: 'number', label: 'Rate Limit (per hour)' },
      { name: 'maxConcurrent', type: 'number', label: 'Max Concurrent' },
      {
        name: 'priority',
        type: 'number',
        defaultValue: 5,
        label: 'Priority (1-10)',
        max: 10,
        min: 1,
      },
      { name: 'customPayload', type: 'json', label: 'Custom Payload (JSON)' },
      { name: 'metadata', type: 'json', label: 'Metadata (JSON)' },
      { name: 'createdBy', type: 'select', label: 'Created By' },

      // Relationship fields
      {
        name: 'schedules',
        type: 'relation',
        label: 'Workflow Schedules',
        relationModel: 'workflowSchedule',
        relationType: 'hasMany',
      },
    ],
    includes: {
      _count: {
        select: {
          schedules: true,
        },
      },
    },
    listColumns: [
      {
        key: 'workflowSlug',
        label: 'Workflow',
        sortable: true,
      },
      {
        key: 'displayName',
        label: 'Display Name',
        render: (value: string, record: any) => value || record.workflowSlug,
      },
      {
        key: 'description',
        label: 'Description',
        render: (value: string) => value || '—',
      },
      {
        key: 'isEnabled',
        label: 'Status',
        render: (value: boolean) => (value ? '✅ Enabled' : '⏸️ Disabled'),
        sortable: true,
      },
      {
        key: 'category',
        label: 'Category',
        render: (value: string) => value || 'General',
        sortable: true,
      },
      {
        key: '_count.schedules',
        label: 'Schedules',
        render: (value: any, record: any) => record._count?.schedules || 0,
      },
      {
        key: 'priority',
        label: 'Priority',
        render: (value: number) => '⭐'.repeat(value || 5),
        sortable: true,
      },
    ],
    pluralName: 'Workflow Configs',
    searchKeys: ['workflowSlug', 'displayName', 'description'],
  },

  // Enhanced Workflow Execution Model (was missing)
  workflowExecution: {
    name: 'Workflow Execution',
    defaultOrderBy: { startedAt: 'desc' },
    fields: [
      // Executions are typically read-only, but adding key fields for viewing
      { name: 'workflowSlug', type: 'text', label: 'Workflow', required: true },
      { name: 'userId', type: 'select', label: 'User' },
      { name: 'organizationId', type: 'select', label: 'Organization' },
      {
        name: 'status',
        type: 'select',
        label: 'Status',
        options: [
          { label: 'Pending', value: 'pending' },
          { label: 'Running', value: 'running' },
          { label: 'Completed', value: 'completed' },
          { label: 'Failed', value: 'failed' },
          { label: 'Cancelled', value: 'cancelled' },
        ],
      },
      {
        name: 'triggeredBy',
        type: 'select',
        label: 'Triggered By',
        options: [
          { label: 'API', value: 'api' },
          { label: 'Schedule', value: 'schedule' },
          { label: 'Webhook', value: 'webhook' },
          { label: 'Manual', value: 'manual' },
          { label: 'Chained', value: 'chained' },
        ],
      },
      { name: 'triggerSource', type: 'text', label: 'Trigger Source' },
      { name: 'parentExecutionId', type: 'select', label: 'Parent Execution' },
      { name: 'error', type: 'textarea', label: 'Error Message' },
      { name: 'errorType', type: 'text', label: 'Error Type' },
      { name: 'tags', type: 'tags', label: 'Tags' },
    ],
    includes: {},
    listColumns: [
      {
        key: 'workflowRunId',
        label: 'Run ID',
        render: (value: string) => value.substring(0, 8) + '...',
      },
      {
        key: 'workflowSlug',
        label: 'Workflow',
        sortable: true,
      },
      {
        key: 'status',
        label: 'Status',
        render: (value: string) => {
          const statuses: Record<string, string> = {
            cancelled: '⏹️ Cancelled',
            completed: '✅ Completed',
            failed: '❌ Failed',
            pending: '⏳ Pending',
            running: '🔄 Running',
          };
          return statuses[value] || value;
        },
        sortable: true,
      },
      {
        key: 'duration',
        label: 'Duration',
        render: (value: number) => {
          if (!value) return '—';
          const seconds = Math.floor(value / 1000);
          if (seconds < 60) return `${seconds}s`;
          const minutes = Math.floor(seconds / 60);
          return `${minutes}m ${seconds % 60}s`;
        },
      },
      {
        key: 'stepCount',
        label: 'Steps',
        render: (value: number, record: any) => {
          const completed = record.completedSteps || 0;
          const total = value || 0;
          return `${completed}/${total}`;
        },
      },
      {
        key: 'retryCount',
        label: 'Retries',
        sortable: true,
      },
      {
        key: 'triggeredBy',
        label: 'Trigger',
        render: (value: string) => {
          const triggers: Record<string, string> = {
            api: '🔗 API',
            chained: '🔗 Chained',
            manual: '👤 Manual',
            schedule: '⏰ Schedule',
            webhook: '🪝 Webhook',
          };
          return triggers[value] || value;
        },
        sortable: true,
      },
      {
        key: 'startedAt',
        label: 'Started',
        render: (value: string) => new Date(value).toLocaleString(),
        sortable: true,
      },
    ],
    pluralName: 'Workflow Executions',
    searchKeys: ['workflowRunId', 'workflowSlug'],
  },

  // Enhanced Product Barcode Model (was missing)
  productBarcode: {
    name: 'Product Barcode',
    defaultOrderBy: { createdAt: 'desc' },
    fields: [
      { name: 'barcode', type: 'text', label: 'Barcode Value', required: true },
      {
        name: 'type',
        type: 'select',
        label: 'Barcode Type',
        options: [
          { label: 'UPC-A', value: 'UPC_A' },
          { label: 'UPC-E', value: 'UPC_E' },
          { label: 'EAN-13', value: 'EAN_13' },
          { label: 'EAN-8', value: 'EAN_8' },
          { label: 'Code 128', value: 'CODE_128' },
          { label: 'Code 39', value: 'CODE_39' },
          { label: 'QR Code', value: 'QR_CODE' },
          { label: 'PDF417', value: 'PDF417' },
          { label: 'Aztec', value: 'AZTEC' },
          { label: 'Data Matrix', value: 'DATA_MATRIX' },
          { label: 'ITF-14', value: 'ITF14' },
          { label: 'Codabar', value: 'CODABAR' },
          { label: 'Other', value: 'OTHER' },
        ],
        required: true,
      },
      { name: 'productId', type: 'select', label: 'Product', required: true },
      { name: 'isPrimary', type: 'checkbox', label: 'Primary Barcode' },
    ],
    includes: {
      product: true,
    },
    listColumns: [
      {
        key: 'barcode',
        label: 'Barcode',
        sortable: true,
      },
      {
        key: 'type',
        label: 'Type',
        render: (value: string) => {
          const types: Record<string, string> = {
            CODE_39: '📊 Code 39',
            CODE_128: '📊 Code 128',
            DATA_MATRIX: '⚏ Data Matrix',
            EAN_8: '🏷️ EAN-8',
            EAN_13: '🏷️ EAN-13',
            PDF417: '📄 PDF417',
            QR_CODE: '📱 QR Code',
            UPC_A: '🏷️ UPC-A',
            UPC_E: '🏷️ UPC-E',
          };
          return types[value] || value;
        },
        sortable: true,
      },
      {
        key: 'product.name',
        label: 'Product',
        render: (value: any, record: any) => record.product?.name || '—',
      },
      {
        key: 'product.sku',
        label: 'SKU',
        render: (value: any, record: any) => record.product?.sku || '—',
      },
      {
        key: 'isPrimary',
        label: 'Primary',
        render: (value: boolean) => (value ? '⭐ Yes' : '—'),
        sortable: true,
      },
      {
        key: 'createdAt',
        label: 'Created',
        render: (value: string) => new Date(value).toLocaleDateString(),
        sortable: true,
      },
    ],
    pluralName: 'Product Barcodes',
    searchKeys: ['barcode'],
  },

  // Enhanced Product Asset Model (was missing)
  productAsset: {
    name: 'Product Asset',
    defaultOrderBy: { sortOrder: 'asc' },
    fields: [
      {
        name: 'type',
        type: 'select',
        label: 'Asset Type',
        options: [
          { label: 'Image', value: 'IMAGE' },
          { label: 'Video', value: 'VIDEO' },
          { label: 'Document', value: 'DOCUMENT' },
          { label: 'Manual', value: 'MANUAL' },
          { label: 'Specification', value: 'SPECIFICATION' },
          { label: 'Certificate', value: 'CERTIFICATE' },
          { label: 'Other', value: 'OTHER' },
        ],
        required: true,
      },
      { name: 'url', type: 'text', label: 'Asset URL', required: true },
      { name: 'filename', type: 'text', label: 'Filename', required: true },
      { name: 'productId', type: 'select', label: 'Product', required: true },
      { name: 'mimeType', type: 'text', label: 'MIME Type' },
      { name: 'size', type: 'number', label: 'File Size (bytes)' },
      { name: 'alt', type: 'text', label: 'Alt Text' },
      { name: 'description', type: 'textarea', label: 'Description' },
      { name: 'sortOrder', type: 'number', defaultValue: 0, label: 'Sort Order' },
    ],
    includes: {
      product: true,
    },
    listColumns: [
      {
        key: 'filename',
        label: 'File',
        sortable: true,
      },
      {
        key: 'type',
        label: 'Type',
        render: (value: string) => {
          const types: Record<string, string> = {
            CERTIFICATE: '🏆 Certificate',
            DOCUMENT: '📄 Document',
            IMAGE: '🖼️ Image',
            MANUAL: '📖 Manual',
            OTHER: '📎 Other',
            SPECIFICATION: '📋 Spec',
            VIDEO: '🎥 Video',
          };
          return types[value] || value;
        },
        sortable: true,
      },
      {
        key: 'product.name',
        label: 'Product',
        render: (value: any, record: any) => record.product?.name || '—',
      },
      {
        key: 'size',
        label: 'Size',
        render: (value: number) => {
          if (!value) return '—';
          const kb = value / 1024;
          const mb = kb / 1024;
          if (mb > 1) return `${mb.toFixed(2)} MB`;
          return `${kb.toFixed(2)} KB`;
        },
      },
      {
        key: 'sortOrder',
        label: 'Order',
        sortable: true,
      },
      {
        key: 'createdAt',
        label: 'Created',
        render: (value: string) => new Date(value).toLocaleDateString(),
        sortable: true,
      },
    ],
    pluralName: 'Product Assets',
    searchKeys: ['filename', 'alt', 'description'],
  },

  // Enhanced Scan History Model (was missing)
  scanHistory: {
    name: 'Scan History',
    defaultOrderBy: { scannedAt: 'desc' },
    fields: [
      { name: 'barcode', type: 'text', label: 'Barcode', required: true },
      { name: 'type', type: 'text', label: 'Barcode Type', required: true },
      { name: 'productId', type: 'select', label: 'Product' },
      { name: 'userId', type: 'select', label: 'User' },
      { name: 'sessionId', type: 'text', label: 'Session ID' },
      {
        name: 'platform',
        type: 'select',
        label: 'Platform',
        options: [
          { label: 'iOS', value: 'ios' },
          { label: 'Android', value: 'android' },
          { label: 'Web', value: 'web' },
        ],
      },
      { name: 'userAgent', type: 'textarea', label: 'User Agent' },
      { name: 'ipAddress', type: 'text', label: 'IP Address' },
      { name: 'success', type: 'checkbox', defaultValue: true, label: 'Successful Scan' },
      { name: 'rawData', type: 'text', label: 'Raw Scan Data', required: true },
      { name: 'note', type: 'textarea', label: 'Notes' },
    ],
    includes: {
      product: true,
      user: true,
    },
    listColumns: [
      {
        key: 'barcode',
        label: 'Barcode',
        sortable: true,
      },
      {
        key: 'type',
        label: 'Type',
        sortable: true,
      },
      {
        key: 'product.name',
        label: 'Product',
        render: (value: any, record: any) => record.product?.name || 'Unknown Product',
      },
      {
        key: 'user.name',
        label: 'Scanned By',
        render: (value: any, record: any) => record.user?.name || 'Anonymous',
      },
      {
        key: 'platform',
        label: 'Platform',
        render: (value: string) => {
          const platforms: Record<string, string> = {
            android: '🤖 Android',
            ios: '📱 iOS',
            web: '🌐 Web',
          };
          return platforms[value] || value || '—';
        },
      },
      {
        key: 'success',
        label: 'Status',
        render: (value: boolean) => (value ? '✅ Success' : '❌ Failed'),
        sortable: true,
      },
      {
        key: 'scannedAt',
        label: 'Scanned',
        render: (value: string) => new Date(value).toLocaleString(),
        sortable: true,
      },
    ],
    pluralName: 'Scan History',
    searchKeys: ['barcode', 'rawData', 'note'],
  },
};

// Re-export as modelConfigs for backward compatibility
export const modelConfigs = prismaModelConfigs;
