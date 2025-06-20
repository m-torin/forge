'use server';

import { prisma, type MediaType, type Prisma } from '@repo/database/prisma';
import { uploadMediaAction, getMediaUrlAction, deleteMediaAction } from './mediaActions';
// Using console logging until observability integration is fixed

interface UploadAndCreateMediaParams {
  file: File | ArrayBuffer | Blob | Buffer;
  type: MediaType;
  altText?: string;
  userId?: string;
  // Entity associations (only one should be set)
  productId?: string;
  brandId?: string;
  categoryId?: string;
  collectionId?: string;
  articleId?: string;
  taxonomyId?: string;
  reviewId?: string;
  // Additional metadata
  width?: number;
  height?: number;
  sortOrder?: number;
}

interface MediaActionDbResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Upload a file to storage and create a Media record in the database
 * This combines storage upload with database persistence
 */
export async function uploadAndCreateMediaAction(
  params: UploadAndCreateMediaParams,
): Promise<MediaActionDbResponse<{ media: any; url: string }>> {
  try {
    const {
      file,
      type,
      altText,
      userId,
      productId,
      brandId,
      categoryId,
      collectionId,
      articleId,
      taxonomyId,
      reviewId,
      width,
      height,
      sortOrder = 0,
    } = params;

    // Validate that only one entity association is provided
    const associations = [
      productId,
      brandId,
      categoryId,
      collectionId,
      articleId,
      taxonomyId,
      reviewId,
    ].filter(Boolean);

    if (associations.length > 1) {
      return {
        success: false,
        error: 'Media can only be associated with one entity at a time',
      };
    }

    // Generate storage key based on entity type and associations
    let folder = 'general';
    let entityId = null;

    if (productId) {
      folder = 'products';
      entityId = productId;
    } else if (brandId) {
      folder = 'brands';
      entityId = brandId;
    } else if (categoryId) {
      folder = 'categories';
      entityId = categoryId;
    } else if (collectionId) {
      folder = 'collections';
      entityId = collectionId;
    } else if (articleId) {
      folder = 'articles';
      entityId = articleId;
    } else if (taxonomyId) {
      folder = 'taxonomies';
      entityId = taxonomyId;
    } else if (reviewId) {
      folder = 'reviews';
      entityId = reviewId;
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    let filename = `${timestamp}-${randomString}`;

    // Add file extension if available
    if (file instanceof File) {
      const ext = file.name.split('.').pop();
      if (ext) filename += `.${ext}`;
    }

    const key = `media/${folder}/${entityId ? `${entityId}/` : ''}${filename}`;

    // Get file size and mime type
    let size = 0;
    let mimeType = '';

    if (file instanceof File) {
      size = file.size;
      mimeType = file.type;
    } else if (file instanceof Blob) {
      size = file.size;
      mimeType = file.type;
    } else if (file instanceof ArrayBuffer) {
      size = file.byteLength;
    } else if (Buffer.isBuffer(file)) {
      size = file.length;
    }

    // Upload to storage
    const uploadResult = await uploadMediaAction(key, file, {
      contentType: mimeType,
      metadata: {
        userId: userId || 'system',
        uploadedAt: new Date().toISOString(),
        entityType: folder,
        entityId: entityId || 'none',
      },
    });

    if (!uploadResult.success) {
      return {
        success: false,
        error: uploadResult.error || 'Failed to upload file',
      };
    }

    // Get signed URL for the uploaded file
    const isProductMedia = productId !== undefined;
    const urlResult = await getMediaUrlAction(key, {
      context: isProductMedia ? 'product' : 'admin',
      expiresIn: 7200, // 2 hours
    });

    if (!urlResult.success) {
      // Try to clean up the uploaded file
      await deleteMediaAction(key);
      return {
        success: false,
        error: urlResult.error || 'Failed to get media URL',
      };
    }

    // Create Media record in database
    const mediaData: Prisma.MediaCreateInput = {
      url: urlResult.data || '',
      type,
      altText,
      mimeType,
      size,
      width,
      height,
      sortOrder,
      copy: {
        storageKey: key,
        originalUrl: uploadResult.data?.url || '',
        metadata: (uploadResult.data as any)?.metadata || {},
      },
      // Entity associations
      product: productId ? { connect: { id: productId } } : undefined,
      brand: brandId ? { connect: { id: brandId } } : undefined,
      category: categoryId ? { connect: { id: categoryId } } : undefined,
      collection: collectionId ? { connect: { id: collectionId } } : undefined,
      article: articleId ? { connect: { id: articleId } } : undefined,
      taxonomy: taxonomyId ? { connect: { id: taxonomyId } } : undefined,
      review: reviewId ? { connect: { id: reviewId } } : undefined,
      user: userId ? { connect: { id: userId } } : undefined,
    };

    const media = await prisma.media.create({
      data: mediaData,
      include: {
        product: true,
        brand: true,
        category: true,
        collection: true,
        article: true,
        taxonomy: true,
        review: true,
        user: true,
      },
    });

    return {
      success: true,
      data: {
        media,
        url: urlResult.data || '',
      },
    };
  } catch (error) {
    const { storageLogger } = await import('../utils/logger');
    void storageLogger.error('Error in uploadAndCreateMedia', error as Error, {
      operation: 'uploadAndCreateMedia',
      provider: 'media-db',
      metadata: {
        entityType: 'unknown',
        entityId: 'none',
        userId: params.userId || 'system',
      },
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload and create media',
    };
  }
}

/**
 * Get a signed URL for a media record by ID
 * Automatically determines context based on associations
 */
export async function getMediaSignedUrlAction(
  mediaId: string,
  options?: {
    expiresIn?: number;
    forceRefresh?: boolean;
  },
): Promise<MediaActionDbResponse<string>> {
  try {
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      select: {
        copy: true,
        productId: true,
        url: true,
      },
    });

    if (!media) {
      return {
        success: false,
        error: 'Media not found',
      };
    }

    // Extract storage key from metadata
    const storageKey =
      media.copy && typeof media.copy === 'object' ? (media.copy as any).storageKey : null;

    if (!storageKey) {
      // No storage key, return existing URL
      return {
        success: true,
        data: media.url,
      };
    }

    // Determine context based on associations
    const context = media.productId ? 'product' : 'admin';

    // Get signed URL
    const urlResult = await getMediaUrlAction(storageKey, {
      context,
      expiresIn: options?.expiresIn || 7200,
    });

    if (!urlResult.success) {
      // Fall back to existing URL
      return {
        success: true,
        data: media.url,
      };
    }

    // Optionally update the URL in the database if it's different
    if (options?.forceRefresh && urlResult.data !== media.url) {
      await prisma.media.update({
        where: { id: mediaId },
        data: { url: urlResult.data },
      });
    }

    return {
      success: true,
      data: urlResult.data,
    };
  } catch (error) {
    const { storageLogger } = await import('../utils/logger');
    void storageLogger.error('Error getting media signed URL', error as Error, {
      operation: 'getMediaSignedUrl',
      provider: 'media-db',
      metadata: { mediaId },
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get signed URL',
    };
  }
}

/**
 * Delete a media record and its associated storage file
 */
export async function deleteMediaAndStorageAction(
  mediaId: string,
  userId?: string,
): Promise<MediaActionDbResponse<void>> {
  try {
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      select: {
        copy: true,
        deletedAt: true,
      },
    });

    if (!media) {
      return {
        success: false,
        error: 'Media not found',
      };
    }

    if (media.deletedAt) {
      return {
        success: false,
        error: 'Media already deleted',
      };
    }

    // Extract storage key from metadata
    const storageKey =
      media.copy && typeof media.copy === 'object' ? (media.copy as any).storageKey : null;

    // Soft delete the media record
    await prisma.media.update({
      where: { id: mediaId },
      data: {
        deletedAt: new Date(),
        deletedById: userId,
      },
    });

    // Delete from storage if key exists
    if (storageKey) {
      const deleteResult = await deleteMediaAction(storageKey);
      if (!deleteResult.success) {
        const { storageLogger } = await import('../utils/logger');
        void storageLogger.error(
          'Storage deletion failed',
          new Error(deleteResult.error || 'Storage deletion failed'),
          {
            operation: 'deleteFromStorage',
            key: storageKey,
            provider: 'media-db',
            metadata: { mediaId },
          },
        );
        // Don't fail the operation if storage deletion fails
        // The database record is already soft-deleted
      }
    }

    return { success: true };
  } catch (error) {
    const { storageLogger } = await import('../utils/logger');
    void storageLogger.error('Error deleting media and storage', error as Error, {
      operation: 'deleteMediaAndStorage',
      provider: 'media-db',
      metadata: { mediaId, userId },
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete media',
    };
  }
}

/**
 * Bulk refresh signed URLs for multiple media records
 * Useful for refreshing URLs before they expire
 */
export async function bulkRefreshMediaUrlsAction(
  mediaIds: string[],
  options?: {
    expiresIn?: number;
  },
): Promise<MediaActionDbResponse<Record<string, string>>> {
  try {
    const mediaRecords = await prisma.media.findMany({
      where: {
        id: { in: mediaIds },
        deletedAt: null,
      },
      select: {
        id: true,
        copy: true,
        productId: true,
        url: true,
      },
    });

    const urls: Record<string, string> = {};
    const updates: Array<{ id: string; url: string }> = [];

    // Process each media record
    await Promise.all(
      mediaRecords.map(async (media: any) => {
        const storageKey =
          media.copy && typeof media.copy === 'object' ? (media.copy as any).storageKey : null;

        if (!storageKey) {
          urls[media.id] = media.url;
          return;
        }

        const context = media.productId ? 'product' : 'admin';
        const urlResult = await getMediaUrlAction(storageKey, {
          context,
          expiresIn: options?.expiresIn || 7200,
        });

        if (urlResult.success) {
          urls[media.id] = urlResult.data || '';
          if (urlResult.data !== media.url) {
            updates.push({ id: media.id, url: urlResult.data || '' });
          }
        } else {
          urls[media.id] = media.url; // Fall back to existing URL
        }
      }),
    );

    // Batch update URLs in database
    if (updates.length > 0) {
      await Promise.all(
        updates.map((update) =>
          prisma.media.update({
            where: { id: update.id },
            data: { url: update.url },
          }),
        ),
      );
    }

    return {
      success: true,
      data: urls,
    };
  } catch (error) {
    const { storageLogger } = await import('../utils/logger');
    void storageLogger.error('Error in bulk refresh media URLs', error as Error, {
      operation: 'bulkRefreshMediaUrls',
      provider: 'media-db',
      metadata: { mediaIdCount: mediaIds.length },
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to refresh URLs',
    };
  }
}

/**
 * Import product photos from external URLs (CDN, vendor sites, etc.)
 * Creates Media records and uploads to appropriate storage
 */
export async function importProductPhotosAction(
  productId: string,
  photoUrls: string[],
  userId: string,
  options?: {
    sortOrderStart?: number;
    skipDuplicates?: boolean;
  },
): Promise<
  MediaActionDbResponse<{
    imported: Array<{
      url: string;
      mediaId: string;
      storageKey: string;
    }>;
    failed: Array<{
      url: string;
      error: string;
    }>;
    skipped: string[];
  }>
> {
  try {
    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true },
    });

    if (!product) {
      return {
        success: false,
        error: 'Product not found',
      };
    }

    const results = {
      imported: [] as Array<{ url: string; mediaId: string; storageKey: string }>,
      failed: [] as Array<{ url: string; error: string }>,
      skipped: [] as string[],
    };

    // Check for duplicates if requested
    let existingUrls: Set<string> = new Set();
    if (options?.skipDuplicates) {
      const existingMedia = await prisma.media.findMany({
        where: {
          productId,
          deletedAt: null,
        },
        select: { url: true },
      });
      existingUrls = new Set(existingMedia.map((m: any) => m.url));
    }

    // Process URLs in batches
    const batchSize = 3;
    let sortOrder = options?.sortOrderStart ?? 0;

    for (let i = 0; i < photoUrls.length; i += batchSize) {
      const batch = photoUrls.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (url, index) => {
          // Skip if duplicate
          if (existingUrls.has(url)) {
            results.skipped.push(url);
            return;
          }

          try {
            // Import the image
            const { importFromUrlAction } = await import('./mediaActions');
            const importResult = await importFromUrlAction(url, undefined, {
              metadata: {
                productId,
                userId,
                type: 'IMAGE',
              },
            });

            if (!importResult.success || !importResult.data) {
              throw new Error(importResult.error || 'Import failed');
            }

            const { key: storageKey, url: storageUrl, size, contentType } = importResult.data;

            // Extract image dimensions if possible
            let width: number | undefined;
            let height: number | undefined;

            // For Cloudflare Images, dimensions might be in metadata
            if (importResult.data.metadata && typeof importResult.data.metadata === 'object') {
              const meta = importResult.data.metadata as Record<string, any>;
              if (meta.width) {
                width = Number(meta.width);
                height = Number(meta.height);
              }
            }

            // Create Media record
            const media = await prisma.media.create({
              data: {
                url: storageUrl,
                type: 'IMAGE',
                productId,
                userId,
                altText: `${product.name} - Image ${sortOrder + index + 1}`,
                sortOrder: sortOrder + index,
                width,
                height,
                copy: {
                  storageKey,
                  originalUrl: url,
                  importedAt: new Date().toISOString(),
                  size,
                  contentType,
                },
              },
            });

            results.imported.push({
              url,
              mediaId: media.id,
              storageKey,
            });
          } catch (error) {
            results.failed.push({
              url,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }),
      );

      sortOrder += batch.length;
    }

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to import product photos',
    };
  }
}

/**
 * Bulk import media from external URLs with database integration
 * Supports various entity types and automatic organization
 */
export async function bulkImportMediaWithDbAction(
  imports: Array<{
    url: string;
    type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    entityType?: 'product' | 'collection' | 'brand' | 'article' | 'user';
    entityId?: string;
    altText?: string;
    metadata?: Record<string, any>;
  }>,
  userId: string,
  options?: {
    batchSize?: number;
    skipExisting?: boolean;
    autoGenerateAltText?: boolean;
  },
): Promise<
  MediaActionDbResponse<{
    created: Array<{
      url: string;
      mediaId: string;
      storageKey: string;
    }>;
    failed: Array<{
      url: string;
      error: string;
    }>;
    skipped: string[];
    stats: {
      total: number;
      succeeded: number;
      failed: number;
      skipped: number;
    };
  }>
> {
  try {
    const results = {
      created: [] as Array<{ url: string; mediaId: string; storageKey: string }>,
      failed: [] as Array<{ url: string; error: string }>,
      skipped: [] as string[],
    };

    // Check for existing URLs if requested
    let existingUrls: Set<string> = new Set();
    if (options?.skipExisting) {
      const existingMedia = await prisma.media.findMany({
        where: {
          url: { in: imports.map((i) => i.url) },
          deletedAt: null,
        },
        select: { url: true },
      });
      existingUrls = new Set(existingMedia.map((m: any) => m.url));
    }

    // Import the URLs using the bulk import action
    const { bulkImportFromUrlsAction } = await import('./mediaActions');
    const importResult = await bulkImportFromUrlsAction(
      imports
        .filter((i) => !existingUrls.has(i.url))
        .map((i) => ({
          sourceUrl: i.url,
          metadata: {
            ...i.metadata,
            type: i.type,
            entityType: i.entityType,
            entityId: i.entityId,
            userId,
          },
        })),
      {
        batchSize: options?.batchSize || 5,
      },
    );

    if (!importResult.success || !importResult.data) {
      return {
        success: false,
        error: importResult.error || 'Bulk import failed',
      };
    }

    // Create Media records for successful imports
    for (const imported of importResult.data.succeeded) {
      try {
        const importMetadata = imports.find((i) => i.url === imported.sourceUrl);
        if (!importMetadata) continue;

        // Prepare entity relationships
        const entityRelations: any = {};
        if (importMetadata.entityType && importMetadata.entityId) {
          switch (importMetadata.entityType) {
            case 'product':
              entityRelations.productId = importMetadata.entityId;
              break;
            case 'collection':
              entityRelations.collectionId = importMetadata.entityId;
              break;
            case 'brand':
              entityRelations.brandId = importMetadata.entityId;
              break;
            case 'article':
              entityRelations.articleId = importMetadata.entityId;
              break;
            case 'user':
              entityRelations.userId = importMetadata.entityId;
              break;
          }
        }

        // Generate alt text if requested and not provided
        let altText = importMetadata.altText;
        if (!altText && options?.autoGenerateAltText) {
          const filename = imported.sourceUrl.split('/').pop()?.split('.')[0] || 'image';
          altText = filename.replace(/[-_]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
        }

        const media = await prisma.media.create({
          data: {
            url: imported.storageObject.url,
            type: importMetadata.type,
            altText,
            userId,
            width:
              imported.storageObject.metadata && typeof imported.storageObject.metadata === 'object'
                ? Number((imported.storageObject.metadata as Record<string, any>).width) ||
                  undefined
                : undefined,
            height:
              imported.storageObject.metadata && typeof imported.storageObject.metadata === 'object'
                ? Number((imported.storageObject.metadata as Record<string, any>).height) ||
                  undefined
                : undefined,
            copy: {
              storageKey: imported.storageObject.key,
              originalUrl: imported.sourceUrl,
              importedAt: new Date().toISOString(),
              size: imported.storageObject.size,
              contentType: imported.storageObject.contentType,
              ...importMetadata.metadata,
            },
            ...entityRelations,
          },
        });

        results.created.push({
          url: imported.sourceUrl,
          mediaId: media.id,
          storageKey: imported.storageObject.key,
        });
      } catch (error) {
        results.failed.push({
          url: imported.sourceUrl,
          error: `Database error: ${error instanceof Error ? error.message : 'Unknown'}`,
        });
      }
    }

    // Add import failures to results
    for (const failed of importResult.data.failed) {
      results.failed.push({
        url: failed.sourceUrl,
        error: failed.error,
      });
    }

    // Add skipped URLs
    results.skipped = Array.from(existingUrls);

    const stats = {
      total: imports.length,
      succeeded: results.created.length,
      failed: results.failed.length,
      skipped: results.skipped.length,
    };

    return {
      success: true,
      data: {
        ...results,
        stats,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bulk import with database failed',
    };
  }
}
