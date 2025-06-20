'use server';

import { auth } from '@repo/auth/server/next';
import { prisma } from '@repo/database/prisma';
// @ts-expect-error - TypeScript can't resolve the path but it exists
import { uploadAndCreateMediaAction } from '@repo/storage/server/next';

import type { MediaType, Prisma } from '@repo/database/prisma';
import { extractFolderFromUrl, getFolderFromEntityType } from '@/utils/pim3/media-utils';

// Entity types supported by the Media model
export type MediaEntityType =
  | 'PRODUCT'
  | 'BRAND'
  | 'CATEGORY'
  | 'COLLECTION'
  | 'ARTICLE'
  | 'TAXONOMY'
  | 'REVIEW'
  | 'USER'
  | 'UNASSIGNED';

export interface MediaData {
  altText?: string;
  articleId?: string;
  brandId?: string;
  categoryId?: string;
  collectionId?: string;
  // Metadata
  description?: string;
  folder?: string;
  height?: number;
  mimeType?: string;
  // Entity associations
  productId?: string;
  reviewId?: string;
  size?: number;
  tags?: string[];
  taxonomyId?: string;
  type: MediaType;
  url: string;
  userId?: string;
  width?: number;
}

export interface MediaFilter {
  dateFrom?: string;
  dateTo?: string;
  entityType?: MediaEntityType[];
  folder?: string;
  hasAssociation?: boolean;
  maxSize?: number;
  minSize?: number;
  search?: string;
  tags?: string[];
  type?: MediaType[];
  userId?: string;
}

export interface MediaSort {
  direction: 'asc' | 'desc';
  field: 'createdAt' | 'updatedAt' | 'size' | 'type' | 'altText';
}

export interface MediaWithRelations {
  altText?: string | null;
  article?: {
    id: string;
    title: string;
  } | null;
  brand?: {
    id: string;
    name: string;
  } | null;
  category?: {
    id: string;
    name: string;
  } | null;
  collection?: {
    id: string;
    name: string;
  } | null;
  createdAt: Date;
  deletedAt?: Date | null;
  entityLabel?: string;
  // Computed fields
  entityType: MediaEntityType;
  folder?: string;
  height?: number | null;
  id: string;
  mimeType?: string | null;
  // Related entities
  product?: {
    id: string;
    name: string;
    sku: string;
  } | null;
  review?: {
    id: string;
    title?: string | null;
  } | null;
  size?: number | null;
  storageKey?: string; // Storage key for signed URLs
  tags?: string[];
  taxonomy?: {
    id: string;
    name: string;
  } | null;
  type: MediaType;
  updatedAt: Date;
  url: string;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
  width?: number | null;
}

// Virtual folder management
export const DEFAULT_FOLDERS = [
  'General',
  'Products',
  'Brands',
  'Categories',
  'Collections',
  'Articles',
  'Reviews',
  'Marketing',
  'Archive',
];

export async function getMedia(
  filter: MediaFilter = {},
  sort: MediaSort = { direction: 'desc', field: 'createdAt' },
  page = 1,
  limit = 50,
): Promise<{
  media: MediaWithRelations[];
  total: number;
  hasMore: boolean;
  folders: string[];
}> {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  const where: Prisma.MediaWhereInput = {
    deletedAt: null,
  };

  // Search filter
  if (filter.search) {
    where.OR = [
      { altText: { contains: filter.search, mode: 'insensitive' } },
      { url: { contains: filter.search, mode: 'insensitive' } },
      { product: { name: { contains: filter.search, mode: 'insensitive' } } },
      { brand: { name: { contains: filter.search, mode: 'insensitive' } } },
      { collection: { name: { contains: filter.search, mode: 'insensitive' } } },
      { category: { name: { contains: filter.search, mode: 'insensitive' } } },
      { article: { title: { contains: filter.search, mode: 'insensitive' } } },
      { taxonomy: { name: { contains: filter.search, mode: 'insensitive' } } },
    ];
  }

  // Type filter
  if (filter.type && filter.type.length > 0) {
    where.type = { in: filter.type };
  }

  // Entity type filter
  if (filter.entityType && filter.entityType.length > 0) {
    const entityConditions: Prisma.MediaWhereInput[] = [];

    if (filter.entityType.includes('PRODUCT')) {
      entityConditions.push({ productId: { not: null } });
    }
    if (filter.entityType.includes('BRAND')) {
      entityConditions.push({ brandId: { not: null } });
    }
    if (filter.entityType.includes('CATEGORY')) {
      entityConditions.push({ categoryId: { not: null } });
    }
    if (filter.entityType.includes('COLLECTION')) {
      entityConditions.push({ collectionId: { not: null } });
    }
    if (filter.entityType.includes('ARTICLE')) {
      entityConditions.push({ articleId: { not: null } });
    }
    if (filter.entityType.includes('TAXONOMY')) {
      entityConditions.push({ taxonomyId: { not: null } });
    }
    if (filter.entityType.includes('REVIEW')) {
      entityConditions.push({ reviewId: { not: null } });
    }
    if (filter.entityType.includes('USER')) {
      entityConditions.push({
        AND: [
          { userId: { not: null } },
          { productId: null },
          { brandId: null },
          { categoryId: null },
          { collectionId: null },
          { articleId: null },
          { taxonomyId: null },
          { reviewId: null },
        ],
      });
    }
    if (filter.entityType.includes('UNASSIGNED')) {
      entityConditions.push({
        AND: [
          { productId: null },
          { brandId: null },
          { categoryId: null },
          { collectionId: null },
          { articleId: null },
          { taxonomyId: null },
          { reviewId: null },
        ],
      });
    }

    if (entityConditions.length > 0) {
      where.OR = where.OR ? [...(where.OR as any[]), ...entityConditions] : entityConditions;
    }
  }

  // Date filters
  if (filter.dateFrom) {
    where.createdAt = { ...((where.createdAt as any) || {}), gte: new Date(filter.dateFrom) };
  }
  if (filter.dateTo) {
    where.createdAt = { ...((where.createdAt as any) || {}), lte: new Date(filter.dateTo) };
  }

  // Size filters
  if (filter.minSize) {
    where.size = { ...((where.size as any) || {}), gte: filter.minSize };
  }
  if (filter.maxSize) {
    where.size = { ...((where.size as any) || {}), lte: filter.maxSize };
  }

  // User filter
  if (filter.userId) {
    where.userId = filter.userId;
  }

  // Association filter
  if (filter.hasAssociation !== undefined) {
    if (filter.hasAssociation) {
      where.OR = [
        { productId: { not: null } },
        { brandId: { not: null } },
        { categoryId: { not: null } },
        { collectionId: { not: null } },
        { articleId: { not: null } },
        { taxonomyId: { not: null } },
        { reviewId: { not: null } },
      ];
    } else {
      where.AND = [
        { productId: null },
        { brandId: null },
        { categoryId: null },
        { collectionId: null },
        { articleId: null },
        { taxonomyId: null },
        { reviewId: null },
      ];
    }
  }

  // Build orderBy
  const orderBy: Prisma.MediaOrderByWithRelationInput = {
    [sort.field]: sort.direction,
  };

  const [media, total] = await Promise.all([
    prisma.media.findMany({
      include: {
        article: { select: { id: true, title: true } },
        brand: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        collection: { select: { id: true, name: true } },
        product: { select: { id: true, name: true, sku: true } },
        review: { select: { id: true, title: true } },
        taxonomy: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      where,
    }),
    prisma.media.count({ where }),
  ]);

  // Map to MediaWithRelations and add computed fields
  const enrichedMedia: MediaWithRelations[] = media.map((item) => {
    let entityType: MediaEntityType = 'UNASSIGNED';
    let entityLabel: string | undefined;

    if (item.productId && item.product) {
      entityType = 'PRODUCT';
      entityLabel = `${item.product.name} (${item.product.sku})`;
    } else if (item.brandId && item.brand) {
      entityType = 'BRAND';
      entityLabel = item.brand.name;
    } else if (item.categoryId && item.category) {
      entityType = 'CATEGORY';
      entityLabel = item.category.name;
    } else if (item.collectionId && item.collection) {
      entityType = 'COLLECTION';
      entityLabel = item.collection.name;
    } else if (item.articleId && item.article) {
      entityType = 'ARTICLE';
      entityLabel = item.article.title;
    } else if (item.taxonomyId && item.taxonomy) {
      entityType = 'TAXONOMY';
      entityLabel = item.taxonomy.name;
    } else if (item.reviewId && item.review) {
      entityType = 'REVIEW';
      entityLabel = item.review.title || 'Review';
    } else if (item.userId) {
      entityType = 'USER';
      entityLabel = 'User Upload';
    }

    // Extract folder from URL path or use entity-based organization
    let folder = extractFolderFromUrl(item.url);

    // Use entity type as folder if no explicit folder found
    if (folder === 'General' && entityType !== 'UNASSIGNED') {
      folder = getFolderFromEntityType(entityType);
    }

    // Extract storage key from metadata if available
    const storageKey =
      item.copy && typeof item.copy === 'object' ? (item.copy as any).storageKey : undefined;

    return {
      ...item,
      entityLabel,
      entityType,
      folder,
      storageKey,
      tags: [], // TODO: Implement tags system from metadata
    };
  });

  // Filter by folder if specified
  const filteredMedia = filter.folder
    ? enrichedMedia.filter((item) => item.folder === filter.folder)
    : enrichedMedia;

  // Get unique folders from all media
  const folders = Array.from(
    new Set(
      enrichedMedia
        .map((item) => item.folder)
        .filter((folder): folder is string => Boolean(folder)),
    ),
  ).sort();

  return {
    folders,
    hasMore: filter.folder ? false : page * limit < total,
    media: filteredMedia,
    total: filter.folder ? filteredMedia.length : total,
  };
}

export async function createMedia(data: MediaData) {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  // Validate that only one entity association is set
  const associations = [
    data.productId,
    data.brandId,
    data.categoryId,
    data.collectionId,
    data.articleId,
    data.taxonomyId,
    data.reviewId,
  ].filter(Boolean);

  if (associations.length > 1) {
    throw new Error('Media can only be associated with one entity at a time');
  }

  // Extract entity fields that are optional
  const {
    articleId,
    brandId,
    categoryId,
    collectionId,
    productId,
    reviewId,
    taxonomyId,
    userId,
    ...rest
  } = data;

  // Only include defined entity IDs
  const entityData: any = {
    ...rest,
    userId: userId || session.user.id,
  };

  if (articleId !== undefined) entityData.articleId = articleId;
  if (brandId !== undefined) entityData.brandId = brandId;
  if (categoryId !== undefined) entityData.categoryId = categoryId;
  if (collectionId !== undefined) entityData.collectionId = collectionId;
  if (productId !== undefined) entityData.productId = productId;
  if (reviewId !== undefined) entityData.reviewId = reviewId;
  if (taxonomyId !== undefined) entityData.taxonomyId = taxonomyId;

  return await prisma.media.create({
    data: entityData,
    include: {
      article: { select: { id: true, title: true } },
      brand: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
      collection: { select: { id: true, name: true } },
      product: { select: { id: true, name: true, sku: true } },
      review: { select: { id: true, title: true } },
      taxonomy: { select: { id: true, name: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function updateMedia(id: string, data: Partial<MediaData>) {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  // Validate that only one entity association is set
  const associations = [
    data.productId,
    data.brandId,
    data.categoryId,
    data.collectionId,
    data.articleId,
    data.taxonomyId,
    data.reviewId,
  ].filter(Boolean);

  if (associations.length > 1) {
    throw new Error('Media can only be associated with one entity at a time');
  }

  return await prisma.media.update({
    data,
    include: {
      article: { select: { id: true, title: true } },
      brand: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
      collection: { select: { id: true, name: true } },
      product: { select: { id: true, name: true, sku: true } },
      review: { select: { id: true, title: true } },
      taxonomy: { select: { id: true, name: true } },
      user: { select: { id: true, name: true, email: true } },
    },
    where: { id },
  });
}

export async function deleteMedia(id: string) {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  await prisma.media.update({
    data: {
      deletedAt: new Date(),
      deletedById: session.user.id,
    },
    where: { id },
  });
}

export async function bulkDeleteMedia(ids: string[]) {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  await prisma.media.updateMany({
    data: {
      deletedAt: new Date(),
      deletedById: session.user.id,
    },
    where: {
      id: { in: ids },
      deletedAt: null,
    },
  });

  return { deleted: ids.length };
}

export async function bulkUpdateMediaAssociation(
  ids: string[],
  association: {
    entityType: MediaEntityType;
    entityId: string | null;
  },
) {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  // Clear all associations first
  const clearData = {
    articleId: null as string | null,
    brandId: null as string | null,
    categoryId: null as string | null,
    collectionId: null as string | null,
    productId: null as string | null,
    reviewId: null as string | null,
    taxonomyId: null as string | null,
  };

  // Set the new association if provided
  if (association.entityId) {
    switch (association.entityType) {
      case 'PRODUCT':
        clearData.productId = association.entityId;
        break;
      case 'BRAND':
        clearData.brandId = association.entityId;
        break;
      case 'CATEGORY':
        clearData.categoryId = association.entityId;
        break;
      case 'COLLECTION':
        clearData.collectionId = association.entityId;
        break;
      case 'ARTICLE':
        clearData.articleId = association.entityId;
        break;
      case 'TAXONOMY':
        clearData.taxonomyId = association.entityId;
        break;
      case 'REVIEW':
        clearData.reviewId = association.entityId;
        break;
    }
  }

  await prisma.media.updateMany({
    data: clearData,
    where: {
      id: { in: ids },
      deletedAt: null,
    },
  });

  return { updated: ids.length };
}

export async function getMediaUsage(id: string) {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  const media = await prisma.media.findUnique({
    include: {
      article: { select: { id: true, title: true } },
      brand: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
      collection: { select: { id: true, name: true } },
      product: { select: { id: true, name: true, sku: true } },
      review: { select: { id: true, title: true } },
      taxonomy: { select: { id: true, name: true } },
    },
    where: { id },
  });

  if (!media) {
    throw new Error('Media not found');
  }

  const usage = [];
  if (media.product)
    usage.push({ id: media.product.id, name: media.product.name, type: 'Product' });
  if (media.brand) usage.push({ id: media.brand.id, name: media.brand.name, type: 'Brand' });
  if (media.category)
    usage.push({ id: media.category.id, name: media.category.name, type: 'Category' });
  if (media.collection)
    usage.push({ id: media.collection.id, name: media.collection.name, type: 'Collection' });
  if (media.article)
    usage.push({ id: media.article.id, name: media.article.title, type: 'Article' });
  if (media.taxonomy)
    usage.push({ id: media.taxonomy.id, name: media.taxonomy.name, type: 'Taxonomy' });
  if (media.review)
    usage.push({ id: media.review.id, name: media.review.title || 'Review', type: 'Review' });

  return usage;
}

export async function getEntityOptions(entityType: MediaEntityType) {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  switch (entityType) {
    case 'PRODUCT':
      return await prisma.product.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true, sku: true },
        take: 100,
        where: { deletedAt: null },
      });

    case 'BRAND':
      return await prisma.brand.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true },
        take: 100,
        where: { deletedAt: null },
      });

    case 'CATEGORY':
      return await prisma.productCategory.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true },
        take: 100,
        where: { deletedAt: null },
      });

    case 'COLLECTION':
      return await prisma.collection.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true },
        take: 100,
        where: { deletedAt: null },
      });

    case 'ARTICLE':
      return await prisma.article.findMany({
        orderBy: { title: 'asc' },
        select: { id: true, title: true },
        take: 100,
        where: { deletedAt: null },
      });

    case 'TAXONOMY':
      return await prisma.taxonomy.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true },
        take: 100,
        where: { deletedAt: null },
      });

    case 'REVIEW':
      return await prisma.review.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true },
        take: 100,
        where: { deletedAt: null },
      });

    default:
      return [];
  }
}

export async function getMediaStats() {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  const [total, byType, byEntityType, recentUploads] = await Promise.all([
    // Total count
    prisma.media.count({ where: { deletedAt: null } }),

    // Count by media type
    prisma.media.groupBy({
      _count: { type: true },
      by: ['type'],
      where: { deletedAt: null },
    }),

    // Count by entity type (complex aggregation)
    Promise.all([
      prisma.media.count({ where: { deletedAt: null, productId: { not: null } } }),
      prisma.media.count({ where: { brandId: { not: null }, deletedAt: null } }),
      prisma.media.count({ where: { categoryId: { not: null }, deletedAt: null } }),
      prisma.media.count({ where: { collectionId: { not: null }, deletedAt: null } }),
      prisma.media.count({ where: { articleId: { not: null }, deletedAt: null } }),
      prisma.media.count({ where: { deletedAt: null, taxonomyId: { not: null } } }),
      prisma.media.count({ where: { deletedAt: null, reviewId: { not: null } } }),
      prisma.media.count({
        where: {
          articleId: null,
          brandId: null,
          categoryId: null,
          collectionId: null,
          deletedAt: null,
          productId: null,
          reviewId: null,
          taxonomyId: null,
        },
      }),
    ]),

    // Recent uploads
    prisma.media.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        deletedAt: null,
      },
    }),
  ]);

  const [products, brands, categories, collections, articles, taxonomies, reviews, unassigned] =
    byEntityType;

  return {
    byEntityType: {
      ARTICLE: articles,
      BRAND: brands,
      CATEGORY: categories,
      COLLECTION: collections,
      PRODUCT: products,
      REVIEW: reviews,
      TAXONOMY: taxonomies,
      UNASSIGNED: unassigned,
      USER: 0, // Users don't have media associations in current schema
    },
    byType: byType.reduce(
      (acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      },
      {} as Record<MediaType, number>,
    ),
    recentUploads,
    total,
  };
}

export async function getFolders() {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  // Get all media and extract unique folders
  const media = await prisma.media.findMany({
    select: { url: true },
    where: { deletedAt: null },
  });

  const folders = new Set(DEFAULT_FOLDERS);

  media.forEach((item) => {
    const folder = extractFolderFromUrl(item.url);
    folders.add(folder);
  });

  return Array.from(folders).sort();
}

interface UploadMediaWithStorageParams {
  file: File;
  type: MediaType;
  altText: string;
  entityType?: MediaEntityType;
  entityId?: string;
}

export async function uploadMediaWithStorage(params: UploadMediaWithStorageParams) {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  const { file, type, altText, entityType, entityId } = params;

  try {
    // Build params for the database-integrated upload action
    const uploadParams: any = {
      file,
      type,
      altText,
      userId: session.user.id,
    };

    // Add entity association
    if (entityType && entityId) {
      switch (entityType) {
        case 'PRODUCT':
          uploadParams.productId = entityId;
          break;
        case 'BRAND':
          uploadParams.brandId = entityId;
          break;
        case 'CATEGORY':
          uploadParams.categoryId = entityId;
          break;
        case 'COLLECTION':
          uploadParams.collectionId = entityId;
          break;
        case 'ARTICLE':
          uploadParams.articleId = entityId;
          break;
        case 'TAXONOMY':
          uploadParams.taxonomyId = entityId;
          break;
        case 'REVIEW':
          uploadParams.reviewId = entityId;
          break;
      }
    }

    // Use the new database-integrated upload action
    const result = await uploadAndCreateMediaAction(uploadParams);

    if (result.success) {
      // Transform to match expected return format
      return {
        success: true,
        data: result.data.media,
      };
    } else {
      throw new Error(result.error || 'Upload failed');
    }
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}
