import { ModelConfig } from './model-config';
import { maskSensitiveData, getFieldSecurityRule, isFieldSensitive } from './security-config';

// Define configurations for all Prisma models
export const prismaModelConfigs: Record<string, ModelConfig> = {
  // Content Models
  productCategory: {
    name: 'Product Category',
    pluralName: 'Product Categories',
    searchKeys: ['name', 'slug', 'description'],
    defaultOrderBy: { displayOrder: 'asc' },
    includes: {
      parent: true,
      children: true,
      deletedBy: true,
      _count: {
        select: {
          products: true,
          children: true,
        },
      },
    },
    listColumns: [
      {
        key: 'name',
        label: 'Name',
        sortable: true,
        render: (value: string, record: any) => {
          const level = record.parentId ? '└─ ' : '';
          return `${level}${value}`;
        },
      },
      {
        key: 'slug',
        label: 'Slug',
        sortable: true,
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (value: string) =>
          ({
            DRAFT: '📝 Draft',
            PUBLISHED: '✅ Published',
            ARCHIVED: '📦 Archived',
          })[value] || value,
      },
      {
        key: 'displayOrder',
        label: 'Order',
        sortable: true,
        type: 'number',
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
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        options: [
          { value: 'DRAFT', label: 'Draft' },
          { value: 'PUBLISHED', label: 'Published' },
          { value: 'ARCHIVED', label: 'Archived' },
        ],
      },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'parentId', label: 'Parent Category', type: 'select' },
      { name: 'displayOrder', label: 'Display Order', type: 'number', defaultValue: 0 },
      { name: 'metaTitle', label: 'Meta Title', type: 'text' },
      { name: 'metaDescription', label: 'Meta Description', type: 'textarea' },
      { name: 'metaKeywords', label: 'Meta Keywords', type: 'text' },
      { name: 'copy', label: 'Content (JSON)', type: 'json' },
    ],
  },

  article: {
    name: 'Article',
    pluralName: 'Articles',
    searchKeys: ['title', 'slug'],
    defaultOrderBy: { createdAt: 'desc' },
    includes: {
      user: true,
      deletedBy: true,
      _count: {
        select: {
          media: true,
        },
      },
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
        sortable: true,
        render: (value: string) =>
          ({
            DRAFT: '📝 Draft',
            PUBLISHED: '✅ Published',
            ARCHIVED: '📦 Archived',
          })[value] || value,
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
        sortable: true,
        render: (value: string) => new Date(value).toLocaleDateString(),
      },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        options: [
          { value: 'DRAFT', label: 'Draft' },
          { value: 'PUBLISHED', label: 'Published' },
          { value: 'ARCHIVED', label: 'Archived' },
        ],
      },
      { name: 'content', label: 'Content (JSON)', type: 'json', required: true },
      { name: 'userId', label: 'Author', type: 'select' },
      
      // Relationship fields
      { name: 'media', label: 'Media Assets', type: 'relation', relationModel: 'media', relationType: 'hasMany' },
    ],
  },

  brand: {
    name: 'Brand',
    pluralName: 'Brands',
    searchKeys: ['name', 'slug', 'baseUrl'],
    defaultOrderBy: { displayOrder: 'asc' },
    includes: {
      parent: true,
      deletedBy: true,
      _count: {
        select: {
          products: true,
          collections: true,
          children: true,
        },
      },
    },
    listColumns: [
      {
        key: 'name',
        label: 'Name',
        sortable: true,
        render: (value: string, record: any) => {
          const level = record.parentId ? '└─ ' : '';
          return `${level}${value}`;
        },
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
        sortable: true,
        render: (value: string) =>
          ({
            DRAFT: '📝 Draft',
            PUBLISHED: '✅ Published',
            ARCHIVED: '📦 Archived',
          })[value] || value,
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
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      {
        name: 'type',
        label: 'Type',
        type: 'select',
        required: true,
        options: [
          { value: 'MANUFACTURER', label: 'Manufacturer' },
          { value: 'RETAILER', label: 'Retailer' },
          { value: 'MARKETPLACE', label: 'Marketplace' },
          { value: 'SERVICE', label: 'Service' },
          { value: 'OTHER', label: 'Other' },
        ],
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        options: [
          { value: 'DRAFT', label: 'Draft' },
          { value: 'PUBLISHED', label: 'Published' },
          { value: 'ARCHIVED', label: 'Archived' },
        ],
      },
      { name: 'baseUrl', label: 'Website URL', type: 'text' },
      { name: 'parentId', label: 'Parent Brand', type: 'select' },
      { name: 'displayOrder', label: 'Display Order', type: 'number', defaultValue: 0 },
      { name: 'copy', label: 'Content (JSON)', type: 'json' },
      
      // Relationship fields
      { name: 'products', label: 'Products', type: 'relation', relationModel: 'pdpJoin', relationType: 'hasMany' },
      { name: 'collections', label: 'Collections', type: 'relation', relationModel: 'collection', relationType: 'manyToMany' },
      { name: 'media', label: 'Media Assets', type: 'relation', relationModel: 'media', relationType: 'hasMany' },
    ],
  },

  collection: {
    name: 'Collection',
    pluralName: 'Collections',
    searchKeys: ['name', 'slug'],
    defaultOrderBy: { createdAt: 'desc' },
    includes: {
      user: true,
      deletedBy: true,
      _count: {
        select: {
          products: true,
          brands: true,
          media: true,
          favorites: true,
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
        key: 'type',
        label: 'Type',
        sortable: true,
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (value: string) =>
          ({
            DRAFT: '📝 Draft',
            PUBLISHED: '✅ Published',
            ARCHIVED: '📦 Archived',
          })[value] || value,
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
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      {
        name: 'type',
        label: 'Type',
        type: 'select',
        required: true,
        options: [
          { value: 'SEASONAL', label: 'Seasonal' },
          { value: 'THEMATIC', label: 'Thematic' },
          { value: 'PRODUCT_LINE', label: 'Product Line' },
          { value: 'FEATURED', label: 'Featured' },
          { value: 'PROMOTIONAL', label: 'Promotional' },
          { value: 'OTHER', label: 'Other' },
        ],
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        options: [
          { value: 'DRAFT', label: 'Draft' },
          { value: 'PUBLISHED', label: 'Published' },
          { value: 'ARCHIVED', label: 'Archived' },
        ],
      },
      { name: 'copy', label: 'Content (JSON)', type: 'json' },
      { name: 'userId', label: 'Owner', type: 'select' },
      
      // Relationship fields
      { name: 'products', label: 'Products', type: 'relation', relationModel: 'product', relationType: 'manyToMany' },
      { name: 'brands', label: 'Brands', type: 'relation', relationModel: 'brand', relationType: 'manyToMany' },
      { name: 'taxonomies', label: 'Taxonomies', type: 'relation', relationModel: 'taxonomy', relationType: 'manyToMany' },
      { name: 'categories', label: 'Categories', type: 'relation', relationModel: 'productCategory', relationType: 'manyToMany' },
      { name: 'media', label: 'Media Assets', type: 'relation', relationModel: 'media', relationType: 'hasMany' },
      { name: 'favorites', label: 'User Favorites', type: 'relation', relationModel: 'favoriteJoin', relationType: 'hasMany' },
      { name: 'registries', label: 'Registry Items', type: 'relation', relationModel: 'registryItem', relationType: 'hasMany' },
    ],
  },

  product: {
    name: 'Product',
    pluralName: 'Products',
    searchKeys: ['name', 'sku', 'description', 'brand', 'canonicalUrl'],
    defaultOrderBy: { createdAt: 'desc' },
    includes: {
      parent: true,
      deletedBy: true,
      barcodes: true,
      digitalAssets: true,
      _count: {
        select: {
          children: true,
          soldBy: true,
          collections: true,
          reviews: true,
          favorites: true,
          media: true,
          barcodes: true,
          digitalAssets: true,
        },
      },
    },
    listColumns: [
      {
        key: 'name',
        label: 'Name',
        sortable: true,
        render: (value: string, record: any) => {
          const level = record.parentId ? '└─ ' : '';
          const aiIcon = record.aiGenerated ? ' 🤖' : '';
          return `${level}${value}${aiIcon}`;
        },
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
        sortable: true,
        render: (value: string) =>
          ({
            DRAFT: '📝 Draft',
            ACTIVE: '✅ Active',
            ARCHIVED: '📦 Archived',
            DISCONTINUED: '🚫 Discontinued',
          })[value] || value,
      },
      {
        key: 'brand',
        label: 'Brand',
        sortable: true,
        render: (value: string) => value || '—',
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
    fields: [
      { name: 'name', label: 'Product Name', type: 'text', required: true },
      { name: 'sku', label: 'SKU', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'category', label: 'Category', type: 'text', required: true },
      { name: 'brand', label: 'Brand', type: 'text' },
      { name: 'price', label: 'Price', type: 'number', step: 0.01 },
      { name: 'currency', label: 'Currency', type: 'text', defaultValue: 'USD' },
      {
        name: 'type',
        label: 'Product Type',
        type: 'select',
        defaultValue: 'PHYSICAL',
        options: [
          { value: 'PHYSICAL', label: 'Physical Product' },
          { value: 'DIGITAL', label: 'Digital Product' },
          { value: 'SERVICE', label: 'Service' },
          { value: 'SUBSCRIPTION', label: 'Subscription' },
          { value: 'BUNDLE', label: 'Product Bundle' },
          { value: 'VARIANT', label: 'Product Variant' },
          { value: 'OTHER', label: 'Other' },
        ],
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        defaultValue: 'DRAFT',
        options: [
          { value: 'DRAFT', label: 'Draft' },
          { value: 'ACTIVE', label: 'Active' },
          { value: 'ARCHIVED', label: 'Archived' },
          { value: 'DISCONTINUED', label: 'Discontinued' },
        ],
      },
      { name: 'canonicalUrl', label: 'Canonical URL', type: 'text' },
      { name: 'parentId', label: 'Parent Product', type: 'select' },
      { name: 'copy', label: 'Content (JSON)', type: 'json' },
      { name: 'attributes', label: 'Product Attributes (JSON)', type: 'json' },
      { name: 'aiGenerated', label: 'AI Generated', type: 'checkbox' },
      {
        name: 'aiConfidence',
        label: 'AI Confidence (0-1)',
        type: 'number',
        step: 0.01,
        min: 0,
        max: 1,
      },
      { name: 'aiSources', label: 'AI Sources', type: 'tags' },
      { name: 'createdBy', label: 'Created By', type: 'select' },
      { name: 'organizationId', label: 'Organization', type: 'select' },
      
      // Relationship fields
      { name: 'categories', label: 'Product Categories', type: 'relation', relationModel: 'productCategory', relationType: 'hasMany' },
      { name: 'taxonomies', label: 'Taxonomies', type: 'relation', relationModel: 'taxonomy', relationType: 'manyToMany' },
      { name: 'collections', label: 'Collections', type: 'relation', relationModel: 'collection', relationType: 'manyToMany' },
      { name: 'soldBy', label: 'Sold By (Brands)', type: 'relation', relationModel: 'pdpJoin', relationType: 'hasMany' },
      { name: 'barcodes', label: 'Barcodes', type: 'relation', relationModel: 'productBarcode', relationType: 'hasMany' },
      { name: 'digitalAssets', label: 'Digital Assets', type: 'relation', relationModel: 'productAsset', relationType: 'hasMany' },
      { name: 'favorites', label: 'User Favorites', type: 'relation', relationModel: 'favoriteJoin', relationType: 'hasMany' },
      { name: 'reviews', label: 'Product Reviews', type: 'relation', relationModel: 'review', relationType: 'hasMany' },
      { name: 'registries', label: 'Registry Items', type: 'relation', relationModel: 'registryItem', relationType: 'hasMany' },
      { name: 'media', label: 'Product Media', type: 'relation', relationModel: 'media', relationType: 'hasMany' },
      { name: 'scanHistory', label: 'Scan History', type: 'relation', relationModel: 'scanHistory', relationType: 'hasMany' },
    ],
  },

  taxonomy: {
    name: 'Taxonomy',
    pluralName: 'Taxonomies',
    searchKeys: ['name', 'slug'],
    defaultOrderBy: { name: 'asc' },
    includes: {
      deletedBy: true,
      _count: {
        select: {
          products: true,
          collections: true,
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
        key: 'type',
        label: 'Type',
        sortable: true,
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (value: string) =>
          ({
            DRAFT: '📝 Draft',
            PUBLISHED: '✅ Published',
            ARCHIVED: '📦 Archived',
          })[value] || value,
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
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      {
        name: 'type',
        label: 'Type',
        type: 'select',
        required: true,
        options: [
          { value: 'CATEGORY', label: 'Category' },
          { value: 'TAG', label: 'Tag' },
          { value: 'ATTRIBUTE', label: 'Attribute' },
          { value: 'DEPARTMENT', label: 'Department' },
          { value: 'COLLECTION', label: 'Collection' },
          { value: 'OTHER', label: 'Other' },
        ],
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        options: [
          { value: 'DRAFT', label: 'Draft' },
          { value: 'PUBLISHED', label: 'Published' },
          { value: 'ARCHIVED', label: 'Archived' },
        ],
      },
      { name: 'copy', label: 'Content (JSON)', type: 'json' },
      
      // Relationship fields
      { name: 'products', label: 'Products', type: 'relation', relationModel: 'product', relationType: 'manyToMany' },
      { name: 'collections', label: 'Collections', type: 'relation', relationModel: 'collection', relationType: 'manyToMany' },
      { name: 'media', label: 'Media Assets', type: 'relation', relationModel: 'media', relationType: 'hasMany' },
    ],
  },

  review: {
    name: 'Review',
    pluralName: 'Reviews',
    searchKeys: ['title', 'content', 'source'],
    defaultOrderBy: { createdAt: 'desc' },
    includes: {
      user: true,
      product: true,
      deletedBy: true,
      _count: {
        select: {
          votes: true,
          media: true,
        },
      },
    },
    listColumns: [
      {
        key: 'title',
        label: 'Title',
        sortable: true,
        render: (value: string) => value || 'Untitled Review',
      },
      {
        key: 'rating',
        label: 'Rating',
        sortable: true,
        type: 'number',
        render: (value: number) => '⭐'.repeat(value),
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
        key: 'verified',
        label: 'Verified',
        sortable: true,
        type: 'boolean',
        render: (value: boolean) => (value ? '✅' : '❌'),
      },
      {
        key: 'type',
        label: 'Type',
        sortable: true,
      },
      {
        key: 'helpfulCount',
        label: 'Helpful',
        sortable: true,
        type: 'number',
      },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'content', label: 'Content', type: 'textarea', required: true },
      { name: 'rating', label: 'Rating (1-5)', type: 'number', required: true, min: 1, max: 5 },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        options: [
          { value: 'DRAFT', label: 'Draft' },
          { value: 'PUBLISHED', label: 'Published' },
          { value: 'ARCHIVED', label: 'Archived' },
        ],
      },
      { name: 'verified', label: 'Verified Purchase', type: 'checkbox' },
      {
        name: 'type',
        label: 'Type',
        type: 'select',
        required: true,
        options: [
          { value: 'IMPORTED', label: 'Imported' },
          { value: 'DEDICATED', label: 'Dedicated' },
        ],
      },
      { name: 'source', label: 'Source', type: 'text' },
      { name: 'sourceId', label: 'Source ID', type: 'text' },
      { name: 'userId', label: 'User', type: 'select', required: true },
      { name: 'productId', label: 'Product', type: 'select' },
      
      // Relationship fields
      { name: 'media', label: 'Media Attachments', type: 'relation', relationModel: 'media', relationType: 'hasMany' },
      { name: 'votes', label: 'Review Votes', type: 'relation', relationModel: 'reviewVoteJoin', relationType: 'hasMany' },
    ],
  },

  registry: {
    name: 'Registry',
    pluralName: 'Registries',
    searchKeys: ['title', 'description'],
    defaultOrderBy: { createdAt: 'desc' },
    includes: {
      createdByUser: true,
      deletedBy: true,
      _count: {
        select: {
          items: true,
          users: true,
        },
      },
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
        key: 'isPublic',
        label: 'Public',
        sortable: true,
        type: 'boolean',
        render: (value: boolean) => (value ? '🌐' : '🔒'),
      },
      {
        key: 'eventDate',
        label: 'Event Date',
        sortable: true,
        render: (value: string) => (value ? new Date(value).toLocaleDateString() : '—'),
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
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      {
        name: 'type',
        label: 'Type',
        type: 'select',
        required: true,
        options: [
          { value: 'WISHLIST', label: 'Wishlist' },
          { value: 'GIFT', label: 'Gift Registry' },
          { value: 'WEDDING', label: 'Wedding' },
          { value: 'BABY', label: 'Baby' },
          { value: 'BIRTHDAY', label: 'Birthday' },
          { value: 'HOLIDAY', label: 'Holiday' },
          { value: 'OTHER', label: 'Other' },
        ],
      },
      { name: 'isPublic', label: 'Make Public', type: 'checkbox' },
      { name: 'eventDate', label: 'Event Date', type: 'date' },
      { name: 'createdByUserId', label: 'Created By', type: 'select' },
      
      // Relationship fields
      { name: 'items', label: 'Registry Items', type: 'relation', relationModel: 'registryItem', relationType: 'hasMany' },
      { name: 'users', label: 'Shared Users', type: 'relation', relationModel: 'registryUserJoin', relationType: 'hasMany' },
    ],
  },

  media: {
    name: 'Media',
    pluralName: 'Media',
    searchKeys: ['url', 'altText', 'mimeType'],
    defaultOrderBy: { createdAt: 'desc' },
    includes: {
      user: true,
      deletedBy: true,
      article: true,
      brand: true,
      collection: true,
      product: true,
      taxonomy: true,
      review: true,
      category: true,
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
        sortable: true,
        render: (value: string) => value || '—',
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
    fields: [
      { name: 'url', label: 'URL', type: 'text', required: true },
      { name: 'altText', label: 'Alt Text', type: 'text' },
      {
        name: 'type',
        label: 'Type',
        type: 'select',
        required: true,
        options: [
          { value: 'IMAGE', label: 'Image' },
          { value: 'VIDEO', label: 'Video' },
          { value: 'DOCUMENT', label: 'Document' },
          { value: 'AUDIO', label: 'Audio' },
        ],
      },
      { name: 'mimeType', label: 'MIME Type', type: 'text' },
      { name: 'width', label: 'Width (px)', type: 'number' },
      { name: 'height', label: 'Height (px)', type: 'number' },
      { name: 'size', label: 'Size (bytes)', type: 'number' },
      { name: 'userId', label: 'Uploaded By', type: 'select' },
      { name: 'articleId', label: 'Article', type: 'select' },
      { name: 'brandId', label: 'Brand', type: 'select' },
      { name: 'collectionId', label: 'Collection', type: 'select' },
      { name: 'productId', label: 'Product', type: 'select' },
      { name: 'taxonomyId', label: 'Taxonomy', type: 'select' },
      { name: 'reviewId', label: 'Review', type: 'select' },
      { name: 'categoryId', label: 'Category', type: 'select' },
    ],
  },

  // Authentication Models - Enhanced
  user: {
    name: 'User',
    pluralName: 'Users',
    searchKeys: ['name', 'email', 'bio', 'expertise'],
    defaultOrderBy: { createdAt: 'desc' },
    includes: {
      _count: {
        select: {
          articles: true,
          collections: true,
          reviews: true,
          favorites: true,
          registries: true,
          sessions: true,
          accounts: true,
          scanHistory: true,
        },
      },
    },
    listColumns: [
      {
        key: 'name',
        label: 'Name',
        sortable: true,
        render: (value: string) => value || 'Anonymous',
      },
      {
        key: 'email',
        label: 'Email',
        sortable: true,
      },
      {
        key: 'emailVerified',
        label: 'Verified',
        sortable: true,
        render: (value: boolean) => (value ? '✅' : '❌'),
      },
      {
        key: 'isVerifiedAuthor',
        label: 'Author',
        sortable: true,
        type: 'boolean',
        render: (value: boolean) => (value ? '✍️' : '—'),
      },
      {
        key: 'isSuspended',
        label: 'Status',
        sortable: true,
        render: (value: boolean, record: any) => {
          if (value) return '🚫 Suspended';
          if (record.banned) return '🚷 Banned';
          return '✅ Active';
        },
      },
      {
        key: 'role',
        label: 'Role',
        sortable: true,
        render: (value: string) => {
          const roles: Record<string, string> = {
            admin: '🛡️ Admin',
            moderator: '⚖️ Moderator',
            user: '👤 User',
          };
          return roles[value] || `🏷️ ${value}`;
        },
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
    fields: [
      { name: 'name', label: 'Full Name', type: 'text', required: true },
      { name: 'email', label: 'Email Address', type: 'email', required: true },
      { name: 'emailVerified', label: 'Email Verified', type: 'checkbox' },
      { name: 'image', label: 'Profile Image URL', type: 'text' },
      { name: 'phoneNumber', label: 'Phone Number', type: 'text' },
      {
        name: 'role',
        label: 'User Role',
        type: 'select',
        defaultValue: 'user',
        options: [
          { value: 'admin', label: 'Administrator' },
          { value: 'moderator', label: 'Moderator' },
          { value: 'user', label: 'Regular User' },
        ],
      },
      { name: 'banned', label: 'Banned', type: 'checkbox' },
      { name: 'banReason', label: 'Ban Reason', type: 'textarea' },
      { name: 'banExpires', label: 'Ban Expires', type: 'datetime' },
      { name: 'bio', label: 'Biography', type: 'textarea' },
      { name: 'expertise', label: 'Areas of Expertise', type: 'tags' },
      { name: 'isVerifiedAuthor', label: 'Verified Author', type: 'checkbox' },
      { name: 'authorSince', label: 'Author Since', type: 'date' },
      { name: 'isSuspended', label: 'Suspended', type: 'checkbox' },
      { name: 'suspensionDetails', label: 'Suspension Details (JSON)', type: 'json' },
      { name: 'preferences', label: 'User Preferences (JSON)', type: 'json' },
      
      // Relationship fields
      { name: 'sessions', label: 'Sessions', type: 'relation', relationModel: 'session', relationType: 'hasMany' },
      { name: 'accounts', label: 'Connected Accounts', type: 'relation', relationModel: 'account', relationType: 'hasMany' },
      { name: 'members', label: 'Organization Memberships', type: 'relation', relationModel: 'member', relationType: 'hasMany' },
      { name: 'teamMemberships', label: 'Team Memberships', type: 'relation', relationModel: 'teamMember', relationType: 'hasMany' },
      { name: 'invitationsSent', label: 'Invitations Sent', type: 'relation', relationModel: 'invitation', relationType: 'hasMany' },
      { name: 'apiKeys', label: 'API Keys', type: 'relation', relationModel: 'apiKey', relationType: 'hasMany' },
      { name: 'twoFactor', label: 'Two-Factor Authentication', type: 'relation', relationModel: 'twoFactor', relationType: 'hasOne' },
      { name: 'passkeys', label: 'Passkeys', type: 'relation', relationModel: 'passkey', relationType: 'hasMany' },
    ],
  },

  // Junction Models
  pdpJoin: {
    name: 'Product-Brand Link',
    pluralName: 'Product-Brand Links',
    searchKeys: [],
    defaultOrderBy: { createdAt: 'desc' },
    includes: {
      product: true,
      brand: true,
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
        sortable: true,
        render: (value: string) => new Date(value).toLocaleDateString(),
      },
    ],
    fields: [
      { name: 'productId', label: 'Product', type: 'select', required: true },
      { name: 'brandId', label: 'Brand', type: 'select', required: true },
    ],
  },

  favoriteJoin: {
    name: 'Favorite',
    pluralName: 'Favorites',
    searchKeys: [],
    defaultOrderBy: { createdAt: 'desc' },
    includes: {
      user: true,
      product: true,
      collection: true,
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
        sortable: true,
        render: (value: string) => new Date(value).toLocaleDateString(),
      },
    ],
    fields: [
      { name: 'userId', label: 'User', type: 'select', required: true },
      { name: 'productId', label: 'Product', type: 'select' },
      { name: 'collectionId', label: 'Collection', type: 'select' },
    ],
  },

  registryItem: {
    name: 'Registry Item',
    pluralName: 'Registry Items',
    searchKeys: ['notes'],
    defaultOrderBy: { priority: 'desc' },
    includes: {
      registry: true,
      product: true,
      collection: true,
      deletedBy: true,
      _count: {
        select: {
          purchases: true,
        },
      },
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
        key: 'quantity',
        label: 'Quantity',
        sortable: true,
        type: 'number',
      },
      {
        key: 'priority',
        label: 'Priority',
        sortable: true,
        type: 'number',
        render: (value: number) => '⭐'.repeat(Math.min(value, 5)),
      },
      {
        key: 'purchased',
        label: 'Purchased',
        sortable: true,
        type: 'boolean',
        render: (value: boolean) => (value ? '✅' : '⏳'),
      },
      {
        key: '_count.purchases',
        label: 'Purchases',
        render: (value: any, record: any) => record._count?.purchases || 0,
      },
    ],
    fields: [
      { name: 'registryId', label: 'Registry', type: 'select', required: true },
      { name: 'productId', label: 'Product', type: 'select' },
      { name: 'collectionId', label: 'Collection', type: 'select' },
      { name: 'quantity', label: 'Quantity', type: 'number', required: true, defaultValue: 1 },
      {
        name: 'priority',
        label: 'Priority (0-5)',
        type: 'number',
        defaultValue: 0,
        min: 0,
        max: 5,
      },
      { name: 'notes', label: 'Notes', type: 'textarea' },
      { name: 'purchased', label: 'Purchased', type: 'checkbox' },
    ],
  },

  // Authentication Models
  session: {
    name: 'Session',
    pluralName: 'Sessions',
    searchKeys: ['ipAddress', 'userAgent'],
    defaultOrderBy: { createdAt: 'desc' },
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
        sortable: true,
        render: (value: string) => {
          const date = new Date(value);
          const now = new Date();
          const isExpired = date < now;
          return `${date.toLocaleDateString()} ${isExpired ? '⚠️' : '✅'}`;
        },
      },
      {
        key: 'createdAt',
        label: 'Created',
        sortable: true,
        render: (value: string) => new Date(value).toLocaleDateString(),
      },
    ],
    fields: [
      { name: 'userId', label: 'User', type: 'select', required: true },
      { name: 'expiresAt', label: 'Expires At', type: 'datetime', required: true },
      { name: 'ipAddress', label: 'IP Address', type: 'text' },
      { name: 'userAgent', label: 'User Agent', type: 'textarea' },
      { name: 'activeOrganizationId', label: 'Active Organization', type: 'select' },
      { name: 'impersonatedBy', label: 'Impersonated By', type: 'select' },
    ],
  },

  account: {
    name: 'Account',
    pluralName: 'Accounts',
    searchKeys: ['providerId', 'accountId'],
    defaultOrderBy: { createdAt: 'desc' },
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
        sortable: true,
        render: (value: string) => {
          const providers: Record<string, string> = {
            google: '🔍 Google',
            github: '🐙 GitHub',
            discord: '💬 Discord',
            apple: '🍎 Apple',
            microsoft: '🏢 Microsoft',
            facebook: '📘 Facebook',
            twitter: '🐦 Twitter',
          };
          return providers[value.toLowerCase()] || `🔗 ${value}`;
        },
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
        sortable: true,
        render: (value: string) => new Date(value).toLocaleDateString(),
      },
    ],
    fields: [
      { name: 'userId', label: 'User', type: 'select', required: true },
      { name: 'providerId', label: 'Provider ID', type: 'text', required: true },
      { name: 'accountId', label: 'Account ID', type: 'text', required: true },
      { name: 'scope', label: 'Scopes', type: 'text' },
      { name: 'accessTokenExpiresAt', label: 'Access Token Expires', type: 'datetime' },
      { name: 'refreshTokenExpiresAt', label: 'Refresh Token Expires', type: 'datetime' },
      
      // Sensitive OAuth tokens - extremely sensitive
      { name: 'accessToken', label: 'Access Token', type: 'password', sensitive: true, requiresPermission: 'admin' },
      { name: 'refreshToken', label: 'Refresh Token', type: 'password', sensitive: true, requiresPermission: 'admin' },
      { name: 'idToken', label: 'ID Token', type: 'password', sensitive: true, requiresPermission: 'admin' },
      { name: 'password', label: 'Password Hash', type: 'password', sensitive: true, requiresPermission: 'admin' },
    ],
  },

  verification: {
    name: 'Verification',
    pluralName: 'Verifications',
    searchKeys: ['identifier', 'value'],
    defaultOrderBy: { createdAt: 'desc' },
    includes: {},
    listColumns: [
      {
        key: 'identifier',
        label: 'Identifier',
        sortable: true,
        render: (value: string) => {
          // Mask email addresses for privacy
          if (value.includes('@')) {
            const [local, domain] = value.split('@');
            const maskedLocal = local.substring(0, 2) + '***';
            return `${maskedLocal}@${domain}`;
          }
          return value;
        },
      },
      {
        key: 'value',
        label: 'Code',
        render: (value: string) => '••••••',
      },
      {
        key: 'expiresAt',
        label: 'Expires',
        sortable: true,
        render: (value: string) => {
          const date = new Date(value);
          const now = new Date();
          const isExpired = date < now;
          return `${date.toLocaleDateString()} ${isExpired ? '⚠️' : '✅'}`;
        },
      },
      {
        key: 'createdAt',
        label: 'Created',
        sortable: true,
        render: (value: string) => new Date(value).toLocaleDateString(),
      },
    ],
    fields: [
      { name: 'identifier', label: 'Identifier (email/phone)', type: 'text', required: true },
      { name: 'value', label: 'Verification Code', type: 'text', required: true },
      { name: 'expiresAt', label: 'Expires At', type: 'datetime', required: true },
    ],
  },

  // Security Models
  twoFactor: {
    name: 'Two Factor',
    pluralName: 'Two Factor Authentication',
    searchKeys: [],
    defaultOrderBy: { createdAt: 'desc' },
    includes: {
      user: true,
      _count: {
        select: {
          backupCodes: true,
        },
      },
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
        sortable: true,
        render: (value: boolean, record: any) => {
          if (!value) return '❌ Disabled';
          return record.verified ? '✅ Active' : '⚠️ Pending';
        },
      },
      {
        key: 'verified',
        label: 'Verified',
        sortable: true,
        type: 'boolean',
        render: (value: boolean) => (value ? '✅' : '❌'),
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
        sortable: true,
        render: (value: string) => new Date(value).toLocaleDateString(),
      },
    ],
    fields: [
      { name: 'userId', label: 'User', type: 'select', required: true },
      { name: 'enabled', label: 'Enabled', type: 'checkbox' },
      { name: 'verified', label: 'Verified', type: 'checkbox' },
    ],
  },

  backupCode: {
    name: 'Backup Code',
    pluralName: 'Backup Codes',
    searchKeys: [],
    defaultOrderBy: { createdAt: 'desc' },
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
        sortable: true,
        render: (value: boolean, record: any) => {
          if (value) {
            const usedDate = new Date(record.usedAt).toLocaleDateString();
            return `✅ Used (${usedDate})`;
          }
          return '⏳ Available';
        },
      },
      {
        key: 'createdAt',
        label: 'Created',
        sortable: true,
        render: (value: string) => new Date(value).toLocaleDateString(),
      },
    ],
    fields: [
      { name: 'twoFactorId', label: 'Two Factor Auth', type: 'select', required: true },
      { name: 'code', label: 'Backup Code', type: 'text', required: true },
      { name: 'used', label: 'Used', type: 'checkbox' },
      { name: 'usedAt', label: 'Used At', type: 'datetime' },
    ],
  },

  passkey: {
    name: 'Passkey',
    pluralName: 'Passkeys',
    searchKeys: ['name', 'deviceType'],
    defaultOrderBy: { createdAt: 'desc' },
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
        sortable: true,
        render: (value: string) => value || 'Unnamed Passkey',
      },
      {
        key: 'deviceType',
        label: 'Device Type',
        sortable: true,
        render: (value: string) => {
          const types: Record<string, string> = {
            platform: '📱 Platform',
            'cross-platform': '🔑 Security Key',
            multidevice: '🌐 Multi-device',
          };
          return types[value] || `🔐 ${value}`;
        },
      },
      {
        key: 'backedUp',
        label: 'Backed Up',
        sortable: true,
        type: 'boolean',
        render: (value: boolean) => (value ? '☁️ Yes' : '📱 Local'),
      },
      {
        key: 'lastUsedAt',
        label: 'Last Used',
        render: (value: string) => (value ? new Date(value).toLocaleDateString() : 'Never'),
      },
      {
        key: 'createdAt',
        label: 'Added',
        sortable: true,
        render: (value: string) => new Date(value).toLocaleDateString(),
      },
    ],
    fields: [
      { name: 'userId', label: 'User', type: 'select', required: true },
      { name: 'name', label: 'Passkey Name', type: 'text' },
      { name: 'credentialId', label: 'Credential ID', type: 'text', required: true },
      {
        name: 'deviceType',
        label: 'Device Type',
        type: 'select',
        required: true,
        options: [
          { value: 'platform', label: 'Platform Authenticator' },
          { value: 'cross-platform', label: 'Cross-platform Authenticator' },
          { value: 'multidevice', label: 'Multi-device Authenticator' },
        ],
      },
      { name: 'backedUp', label: 'Backed Up', type: 'checkbox' },
      { name: 'transports', label: 'Transports', type: 'tags' },
    ],
  },

  // Team Management Models
  member: {
    name: 'Member',
    pluralName: 'Members',
    searchKeys: ['role'],
    defaultOrderBy: { createdAt: 'desc' },
    includes: {
      user: true,
      organization: true,
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
        sortable: true,
        render: (value: string) => {
          const roles: Record<string, string> = {
            owner: '👑 Owner',
            admin: '🛡️ Admin',
            member: '👤 Member',
            viewer: '👁️ Viewer',
          };
          return roles[value] || `🏷️ ${value}`;
        },
      },
      {
        key: 'createdAt',
        label: 'Joined',
        sortable: true,
        render: (value: string) => new Date(value).toLocaleDateString(),
      },
      {
        key: 'updatedAt',
        label: 'Updated',
        render: (value: string) => (value ? new Date(value).toLocaleDateString() : '—'),
      },
    ],
    fields: [
      { name: 'userId', label: 'User', type: 'select', required: true },
      { name: 'organizationId', label: 'Organization', type: 'select', required: true },
      {
        name: 'role',
        label: 'Role',
        type: 'select',
        required: true,
        options: [
          { value: 'owner', label: 'Owner' },
          { value: 'admin', label: 'Admin' },
          { value: 'member', label: 'Member' },
          { value: 'viewer', label: 'Viewer' },
        ],
      },
    ],
  },

  team: {
    name: 'Team',
    pluralName: 'Teams',
    searchKeys: ['name', 'description'],
    defaultOrderBy: { createdAt: 'desc' },
    includes: {
      organization: true,
      _count: {
        select: {
          teamMembers: true,
          invitations: true,
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
        sortable: true,
        render: (value: string) => new Date(value).toLocaleDateString(),
      },
    ],
    fields: [
      { name: 'name', label: 'Team Name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'organizationId', label: 'Organization', type: 'select', required: true },
    ],
  },

  teamMember: {
    name: 'Team Member',
    pluralName: 'Team Members',
    searchKeys: ['role'],
    defaultOrderBy: { createdAt: 'desc' },
    includes: {
      user: true,
      team: {
        include: {
          organization: true,
        },
      },
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
        sortable: true,
        render: (value: string) => {
          const roles: Record<string, string> = {
            lead: '🎯 Lead',
            admin: '🛡️ Admin',
            member: '👤 Member',
            contributor: '✏️ Contributor',
          };
          return roles[value] || `🏷️ ${value}`;
        },
      },
      {
        key: 'createdAt',
        label: 'Joined',
        sortable: true,
        render: (value: string) => new Date(value).toLocaleDateString(),
      },
    ],
    fields: [
      { name: 'userId', label: 'User', type: 'select', required: true },
      { name: 'teamId', label: 'Team', type: 'select', required: true },
      {
        name: 'role',
        label: 'Role',
        type: 'select',
        defaultValue: 'member',
        options: [
          { value: 'lead', label: 'Team Lead' },
          { value: 'admin', label: 'Admin' },
          { value: 'member', label: 'Member' },
          { value: 'contributor', label: 'Contributor' },
        ],
      },
    ],
  },

  invitation: {
    name: 'Invitation',
    pluralName: 'Invitations',
    searchKeys: ['email', 'role', 'status'],
    defaultOrderBy: { createdAt: 'desc' },
    includes: {
      organization: true,
      team: true,
      invitedBy: true,
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
        sortable: true,
        render: (value: string) => {
          const roles: Record<string, string> = {
            owner: '👑 Owner',
            admin: '🛡️ Admin',
            member: '👤 Member',
            viewer: '👁️ Viewer',
          };
          return roles[value] || `🏷️ ${value}`;
        },
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (value: string) => {
          const statuses: Record<string, string> = {
            pending: '⏳ Pending',
            accepted: '✅ Accepted',
            declined: '❌ Declined',
            expired: '⏰ Expired',
          };
          return statuses[value] || value;
        },
      },
      {
        key: 'invitedBy.name',
        label: 'Invited By',
        render: (value: any, record: any) => record.invitedBy?.name || 'System',
      },
      {
        key: 'expiresAt',
        label: 'Expires',
        sortable: true,
        render: (value: string) => {
          const date = new Date(value);
          const now = new Date();
          const isExpired = date < now;
          return `${date.toLocaleDateString()} ${isExpired ? '⚠️' : '✅'}`;
        },
      },
    ],
    fields: [
      { name: 'email', label: 'Email Address', type: 'email', required: true },
      { name: 'organizationId', label: 'Organization', type: 'select', required: true },
      { name: 'teamId', label: 'Team (Optional)', type: 'select' },
      {
        name: 'role',
        label: 'Role',
        type: 'select',
        required: true,
        options: [
          { value: 'owner', label: 'Owner' },
          { value: 'admin', label: 'Admin' },
          { value: 'member', label: 'Member' },
          { value: 'viewer', label: 'Viewer' },
        ],
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        defaultValue: 'pending',
        options: [
          { value: 'pending', label: 'Pending' },
          { value: 'accepted', label: 'Accepted' },
          { value: 'declined', label: 'Declined' },
          { value: 'expired', label: 'Expired' },
        ],
      },
      { name: 'expiresAt', label: 'Expires At', type: 'datetime', required: true },
      { name: 'invitedById', label: 'Invited By', type: 'select', required: true },
    ],
  },

  // Registry Advanced Models
  registryPurchaseJoin: {
    name: 'Registry Purchase',
    pluralName: 'Registry Purchases',
    searchKeys: ['orderNumber', 'transactionId', 'trackingNumber'],
    defaultOrderBy: { purchaseDate: 'desc' },
    includes: {
      purchaser: true,
      registryItem: {
        include: {
          registry: true,
          product: true,
          collection: true,
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
        key: 'quantity',
        label: 'Quantity',
        sortable: true,
        type: 'number',
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
        sortable: true,
        render: (value: string) => {
          const statuses: Record<string, string> = {
            PENDING: '⏳ Pending',
            CONFIRMED: '✅ Confirmed',
            SHIPPED: '📦 Shipped',
            DELIVERED: '🎉 Delivered',
            CANCELLED: '❌ Cancelled',
            RETURNED: '↩️ Returned',
          };
          return statuses[value] || value;
        },
      },
      {
        key: 'isGift',
        label: 'Gift',
        render: (value: boolean) => (value ? '🎁' : '🛒'),
      },
      {
        key: 'purchaseDate',
        label: 'Purchase Date',
        sortable: true,
        render: (value: string) => new Date(value).toLocaleDateString(),
      },
    ],
    fields: [
      { name: 'registryItemId', label: 'Registry Item', type: 'select', required: true },
      { name: 'purchaserId', label: 'Purchaser', type: 'select', required: true },
      { name: 'quantity', label: 'Quantity', type: 'number', required: true, defaultValue: 1 },
      { name: 'price', label: 'Price', type: 'number', step: 0.01 },
      { name: 'currency', label: 'Currency', type: 'text', defaultValue: 'USD' },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        defaultValue: 'PENDING',
        options: [
          { value: 'PENDING', label: 'Pending' },
          { value: 'CONFIRMED', label: 'Confirmed' },
          { value: 'SHIPPED', label: 'Shipped' },
          { value: 'DELIVERED', label: 'Delivered' },
          { value: 'CANCELLED', label: 'Cancelled' },
          { value: 'RETURNED', label: 'Returned' },
        ],
      },
      { name: 'transactionId', label: 'Transaction ID', type: 'text' },
      { name: 'orderNumber', label: 'Order Number', type: 'text' },
      { name: 'trackingNumber', label: 'Tracking Number', type: 'text' },
      { name: 'trackingUrl', label: 'Tracking URL', type: 'text' },
      { name: 'isGift', label: 'Is Gift', type: 'checkbox' },
      { name: 'giftMessage', label: 'Gift Message', type: 'textarea' },
      { name: 'giftWrapped', label: 'Gift Wrapped', type: 'checkbox' },
      { name: 'estimatedDelivery', label: 'Estimated Delivery', type: 'date' },
      { name: 'actualDelivery', label: 'Actual Delivery', type: 'date' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },

  registryUserJoin: {
    name: 'Registry User',
    pluralName: 'Registry Users',
    searchKeys: ['role'],
    defaultOrderBy: { createdAt: 'desc' },
    includes: {
      user: true,
      registry: true,
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
        sortable: true,
        render: (value: string) => {
          const roles: Record<string, string> = {
            OWNER: '👑 Owner',
            EDITOR: '✏️ Editor',
            VIEWER: '👁️ Viewer',
          };
          return roles[value] || value;
        },
      },
      {
        key: 'createdAt',
        label: 'Added',
        sortable: true,
        render: (value: string) => new Date(value).toLocaleDateString(),
      },
    ],
    fields: [
      { name: 'userId', label: 'User', type: 'select', required: true },
      { name: 'registryId', label: 'Registry', type: 'select', required: true },
      {
        name: 'role',
        label: 'Role',
        type: 'select',
        defaultValue: 'VIEWER',
        options: [
          { value: 'OWNER', label: 'Owner' },
          { value: 'EDITOR', label: 'Editor' },
          { value: 'VIEWER', label: 'Viewer' },
        ],
      },
    ],
  },

  // Review Enhancement
  reviewVoteJoin: {
    name: 'Review Vote',
    pluralName: 'Review Votes',
    searchKeys: [],
    defaultOrderBy: { createdAt: 'desc' },
    includes: {
      user: true,
      review: {
        include: {
          product: true,
          user: true,
        },
      },
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
        sortable: true,
        render: (value: string) => {
          return value === 'HELPFUL' ? '👍 Helpful' : '👎 Not Helpful';
        },
      },
      {
        key: 'createdAt',
        label: 'Voted',
        sortable: true,
        render: (value: string) => new Date(value).toLocaleDateString(),
      },
    ],
    fields: [
      { name: 'userId', label: 'User', type: 'select', required: true },
      { name: 'reviewId', label: 'Review', type: 'select', required: true },
      {
        name: 'voteType',
        label: 'Vote Type',
        type: 'select',
        required: true,
        options: [
          { value: 'HELPFUL', label: 'Helpful' },
          { value: 'NOT_HELPFUL', label: 'Not Helpful' },
        ],
      },
    ],
  },

  // Workflow Enhancement
  workflowSchedule: {
    name: 'Workflow Schedule',
    pluralName: 'Workflow Schedules',
    searchKeys: ['name', 'description', 'cronExpression'],
    defaultOrderBy: { nextRunAt: 'asc' },
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
        sortable: true,
        render: (value: boolean) => (value ? '✅ Active' : '⏸️ Paused'),
      },
      {
        key: 'nextRunAt',
        label: 'Next Run',
        sortable: true,
        render: (value: string) => {
          if (!value) return '—';
          const date = new Date(value);
          const now = new Date();
          const isPast = date < now;
          return `${date.toLocaleString()} ${isPast ? '⚠️' : '⏰'}`;
        },
      },
      {
        key: 'lastRunStatus',
        label: 'Last Status',
        render: (value: string) => {
          if (!value) return 'Never run';
          const statuses: Record<string, string> = {
            success: '✅ Success',
            failed: '❌ Failed',
            running: '🔄 Running',
            cancelled: '⏹️ Cancelled',
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
    fields: [
      { name: 'configId', label: 'Workflow Config', type: 'select', required: true },
      { name: 'name', label: 'Schedule Name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'cronExpression', label: 'Cron Expression', type: 'text', required: true },
      { name: 'timezone', label: 'Timezone', type: 'text', defaultValue: 'UTC' },
      { name: 'isActive', label: 'Active', type: 'checkbox', defaultValue: true },
      { name: 'payload', label: 'Payload (JSON)', type: 'json', required: true },
      { name: 'validFrom', label: 'Valid From', type: 'datetime' },
      { name: 'validUntil', label: 'Valid Until', type: 'datetime' },
      { name: 'createdBy', label: 'Created By', type: 'select' },
    ],
  },

  // MISSING MODEL CONFIGURATIONS - Adding the 7 critical models

  // Enhanced Organization Model (was missing)
  organization: {
    name: 'Organization',
    pluralName: 'Organizations',
    searchKeys: ['name', 'slug', 'description'],
    defaultOrderBy: { createdAt: 'desc' },
    includes: {
      _count: {
        select: {
          members: true,
          teams: true,
          invitations: true,
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
        sortable: true,
        render: (value: string) => new Date(value).toLocaleDateString(),
      },
    ],
    fields: [
      { name: 'name', label: 'Organization Name', type: 'text', required: true },
      { name: 'slug', label: 'URL Slug', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'logo', label: 'Logo URL', type: 'text' },
      { name: 'metadata', label: 'Metadata (JSON)', type: 'json' },
      
      // Relationship fields
      { name: 'members', label: 'Organization Members', type: 'relation', relationModel: 'member', relationType: 'hasMany' },
      { name: 'teams', label: 'Teams', type: 'relation', relationModel: 'team', relationType: 'hasMany' },
      { name: 'invitations', label: 'Pending Invitations', type: 'relation', relationModel: 'invitation', relationType: 'hasMany' },
    ],
  },

  // Enhanced API Key Model (was missing)
  apiKey: {
    name: 'API Key',
    pluralName: 'API Keys',
    searchKeys: ['name', 'prefix'],
    defaultOrderBy: { createdAt: 'desc' },
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
        sortable: true,
        render: (value: boolean, record: any) => {
          if (!value) return '🔴 Disabled';
          const expired = record.expiresAt && new Date(record.expiresAt) < new Date();
          if (expired) return '⚠️ Expired';
          return '✅ Active';
        },
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
        sortable: true,
        render: (value: number) => value?.toLocaleString() || '0',
      },
    ],
    fields: [
      { name: 'name', label: 'API Key Name', type: 'text', required: true },
      { name: 'userId', label: 'Owner', type: 'select', required: true },
      { name: 'organizationId', label: 'Organization', type: 'select' },
      { name: 'enabled', label: 'Enabled', type: 'checkbox', defaultValue: true },
      { name: 'expiresAt', label: 'Expiration Date', type: 'datetime' },
      { name: 'rateLimitEnabled', label: 'Rate Limiting', type: 'checkbox', defaultValue: true },
      { name: 'rateLimitMax', label: 'Rate Limit (requests)', type: 'number' },
      { name: 'rateLimitTimeWindow', label: 'Time Window (seconds)', type: 'number' },
      { name: 'permissions', label: 'Permissions (JSON)', type: 'json' },
      { name: 'metadata', label: 'Metadata (JSON)', type: 'json' },
      
      // Sensitive fields - handled with special security
      { name: 'key', label: 'API Key (Full)', type: 'password', sensitive: true, requiresPermission: 'admin' },
      { name: 'keyHash', label: 'Key Hash', type: 'text', sensitive: true, readonly: true },
      { name: 'start', label: 'Key Prefix', type: 'text', readonly: true },
      { name: 'prefix', label: 'Key Identifier', type: 'text', readonly: true },
    ],
  },

  // Enhanced Workflow Config Model (was missing)
  workflowConfig: {
    name: 'Workflow Config',
    pluralName: 'Workflow Configs',
    searchKeys: ['workflowSlug', 'displayName', 'description'],
    defaultOrderBy: { updatedAt: 'desc' },
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
        sortable: true,
        render: (value: boolean) => (value ? '✅ Enabled' : '⏸️ Disabled'),
      },
      {
        key: 'category',
        label: 'Category',
        sortable: true,
        render: (value: string) => value || 'General',
      },
      {
        key: '_count.schedules',
        label: 'Schedules',
        render: (value: any, record: any) => record._count?.schedules || 0,
      },
      {
        key: 'priority',
        label: 'Priority',
        sortable: true,
        render: (value: number) => '⭐'.repeat(value || 5),
      },
    ],
    fields: [
      { name: 'workflowSlug', label: 'Workflow Slug', type: 'text', required: true },
      { name: 'organizationId', label: 'Organization', type: 'select' },
      { name: 'userId', label: 'User', type: 'select' },
      { name: 'isEnabled', label: 'Enabled', type: 'checkbox', defaultValue: true },
      { name: 'displayName', label: 'Display Name', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'tags', label: 'Tags', type: 'tags' },
      { name: 'notifyOnStart', label: 'Notify on Start', type: 'checkbox' },
      { name: 'notifyOnComplete', label: 'Notify on Complete', type: 'checkbox' },
      { name: 'notifyOnFailure', label: 'Notify on Failure', type: 'checkbox', defaultValue: true },
      { name: 'notifyOnApproval', label: 'Notify on Approval', type: 'checkbox' },
      { name: 'notificationEmail', label: 'Notification Email', type: 'email' },
      { name: 'maxRetries', label: 'Max Retries', type: 'number' },
      { name: 'timeoutSeconds', label: 'Timeout (seconds)', type: 'number' },
      { name: 'rateLimitPerHour', label: 'Rate Limit (per hour)', type: 'number' },
      { name: 'maxConcurrent', label: 'Max Concurrent', type: 'number' },
      {
        name: 'priority',
        label: 'Priority (1-10)',
        type: 'number',
        min: 1,
        max: 10,
        defaultValue: 5,
      },
      { name: 'customPayload', label: 'Custom Payload (JSON)', type: 'json' },
      { name: 'metadata', label: 'Metadata (JSON)', type: 'json' },
      { name: 'createdBy', label: 'Created By', type: 'select' },
      
      // Relationship fields
      { name: 'schedules', label: 'Workflow Schedules', type: 'relation', relationModel: 'workflowSchedule', relationType: 'hasMany' },
    ],
  },

  // Enhanced Workflow Execution Model (was missing)
  workflowExecution: {
    name: 'Workflow Execution',
    pluralName: 'Workflow Executions',
    searchKeys: ['workflowRunId', 'workflowSlug'],
    defaultOrderBy: { startedAt: 'desc' },
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
        sortable: true,
        render: (value: string) => {
          const statuses: Record<string, string> = {
            pending: '⏳ Pending',
            running: '🔄 Running',
            completed: '✅ Completed',
            failed: '❌ Failed',
            cancelled: '⏹️ Cancelled',
          };
          return statuses[value] || value;
        },
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
        sortable: true,
        render: (value: string) => {
          const triggers: Record<string, string> = {
            api: '🔗 API',
            schedule: '⏰ Schedule',
            webhook: '🪝 Webhook',
            manual: '👤 Manual',
            chained: '🔗 Chained',
          };
          return triggers[value] || value;
        },
      },
      {
        key: 'startedAt',
        label: 'Started',
        sortable: true,
        render: (value: string) => new Date(value).toLocaleString(),
      },
    ],
    fields: [
      // Executions are typically read-only, but adding key fields for viewing
      { name: 'workflowSlug', label: 'Workflow', type: 'text', required: true },
      { name: 'userId', label: 'User', type: 'select' },
      { name: 'organizationId', label: 'Organization', type: 'select' },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'pending', label: 'Pending' },
          { value: 'running', label: 'Running' },
          { value: 'completed', label: 'Completed' },
          { value: 'failed', label: 'Failed' },
          { value: 'cancelled', label: 'Cancelled' },
        ],
      },
      {
        name: 'triggeredBy',
        label: 'Triggered By',
        type: 'select',
        options: [
          { value: 'api', label: 'API' },
          { value: 'schedule', label: 'Schedule' },
          { value: 'webhook', label: 'Webhook' },
          { value: 'manual', label: 'Manual' },
          { value: 'chained', label: 'Chained' },
        ],
      },
      { name: 'triggerSource', label: 'Trigger Source', type: 'text' },
      { name: 'parentExecutionId', label: 'Parent Execution', type: 'select' },
      { name: 'error', label: 'Error Message', type: 'textarea' },
      { name: 'errorType', label: 'Error Type', type: 'text' },
      { name: 'tags', label: 'Tags', type: 'tags' },
    ],
  },

  // Enhanced Product Barcode Model (was missing)
  productBarcode: {
    name: 'Product Barcode',
    pluralName: 'Product Barcodes',
    searchKeys: ['barcode'],
    defaultOrderBy: { createdAt: 'desc' },
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
        sortable: true,
        render: (value: string) => {
          const types: Record<string, string> = {
            UPC_A: '🏷️ UPC-A',
            UPC_E: '🏷️ UPC-E',
            EAN_13: '🏷️ EAN-13',
            EAN_8: '🏷️ EAN-8',
            CODE_128: '📊 Code 128',
            CODE_39: '📊 Code 39',
            QR_CODE: '📱 QR Code',
            PDF417: '📄 PDF417',
            DATA_MATRIX: '⚏ Data Matrix',
          };
          return types[value] || value;
        },
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
        sortable: true,
        render: (value: boolean) => (value ? '⭐ Yes' : '—'),
      },
      {
        key: 'createdAt',
        label: 'Created',
        sortable: true,
        render: (value: string) => new Date(value).toLocaleDateString(),
      },
    ],
    fields: [
      { name: 'barcode', label: 'Barcode Value', type: 'text', required: true },
      {
        name: 'type',
        label: 'Barcode Type',
        type: 'select',
        required: true,
        options: [
          { value: 'UPC_A', label: 'UPC-A' },
          { value: 'UPC_E', label: 'UPC-E' },
          { value: 'EAN_13', label: 'EAN-13' },
          { value: 'EAN_8', label: 'EAN-8' },
          { value: 'CODE_128', label: 'Code 128' },
          { value: 'CODE_39', label: 'Code 39' },
          { value: 'QR_CODE', label: 'QR Code' },
          { value: 'PDF417', label: 'PDF417' },
          { value: 'AZTEC', label: 'Aztec' },
          { value: 'DATA_MATRIX', label: 'Data Matrix' },
          { value: 'ITF14', label: 'ITF-14' },
          { value: 'CODABAR', label: 'Codabar' },
          { value: 'OTHER', label: 'Other' },
        ],
      },
      { name: 'productId', label: 'Product', type: 'select', required: true },
      { name: 'isPrimary', label: 'Primary Barcode', type: 'checkbox' },
    ],
  },

  // Enhanced Product Asset Model (was missing)
  productAsset: {
    name: 'Product Asset',
    pluralName: 'Product Assets',
    searchKeys: ['filename', 'alt', 'description'],
    defaultOrderBy: { sortOrder: 'asc' },
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
        sortable: true,
        render: (value: string) => {
          const types: Record<string, string> = {
            IMAGE: '🖼️ Image',
            VIDEO: '🎥 Video',
            DOCUMENT: '📄 Document',
            MANUAL: '📖 Manual',
            SPECIFICATION: '📋 Spec',
            CERTIFICATE: '🏆 Certificate',
            OTHER: '📎 Other',
          };
          return types[value] || value;
        },
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
        sortable: true,
        render: (value: string) => new Date(value).toLocaleDateString(),
      },
    ],
    fields: [
      {
        name: 'type',
        label: 'Asset Type',
        type: 'select',
        required: true,
        options: [
          { value: 'IMAGE', label: 'Image' },
          { value: 'VIDEO', label: 'Video' },
          { value: 'DOCUMENT', label: 'Document' },
          { value: 'MANUAL', label: 'Manual' },
          { value: 'SPECIFICATION', label: 'Specification' },
          { value: 'CERTIFICATE', label: 'Certificate' },
          { value: 'OTHER', label: 'Other' },
        ],
      },
      { name: 'url', label: 'Asset URL', type: 'text', required: true },
      { name: 'filename', label: 'Filename', type: 'text', required: true },
      { name: 'productId', label: 'Product', type: 'select', required: true },
      { name: 'mimeType', label: 'MIME Type', type: 'text' },
      { name: 'size', label: 'File Size (bytes)', type: 'number' },
      { name: 'alt', label: 'Alt Text', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'sortOrder', label: 'Sort Order', type: 'number', defaultValue: 0 },
    ],
  },

  // Enhanced Scan History Model (was missing)
  scanHistory: {
    name: 'Scan History',
    pluralName: 'Scan History',
    searchKeys: ['barcode', 'rawData', 'note'],
    defaultOrderBy: { scannedAt: 'desc' },
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
            ios: '📱 iOS',
            android: '🤖 Android',
            web: '🌐 Web',
          };
          return platforms[value] || value || '—';
        },
      },
      {
        key: 'success',
        label: 'Status',
        sortable: true,
        render: (value: boolean) => (value ? '✅ Success' : '❌ Failed'),
      },
      {
        key: 'scannedAt',
        label: 'Scanned',
        sortable: true,
        render: (value: string) => new Date(value).toLocaleString(),
      },
    ],
    fields: [
      { name: 'barcode', label: 'Barcode', type: 'text', required: true },
      { name: 'type', label: 'Barcode Type', type: 'text', required: true },
      { name: 'productId', label: 'Product', type: 'select' },
      { name: 'userId', label: 'User', type: 'select' },
      { name: 'sessionId', label: 'Session ID', type: 'text' },
      {
        name: 'platform',
        label: 'Platform',
        type: 'select',
        options: [
          { value: 'ios', label: 'iOS' },
          { value: 'android', label: 'Android' },
          { value: 'web', label: 'Web' },
        ],
      },
      { name: 'userAgent', label: 'User Agent', type: 'textarea' },
      { name: 'ipAddress', label: 'IP Address', type: 'text' },
      { name: 'success', label: 'Successful Scan', type: 'checkbox', defaultValue: true },
      { name: 'rawData', label: 'Raw Scan Data', type: 'text', required: true },
      { name: 'note', label: 'Notes', type: 'textarea' },
    ],
  },
};
