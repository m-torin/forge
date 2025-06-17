'use server';

import { prisma } from '@repo/database/prisma';
import { uploadMediaAction, getMediaUrlAction, deleteMediaAction } from './mediaActions';
import type { MediaType, Prisma } from '@repo/database/prisma';

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
  params: UploadAndCreateMediaParams
): Promise<MediaActionDbResponse<{ media: any; url: string }>> {
  'use server';
  
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
      url: urlResult.data,
      type,
      altText,
      mimeType,
      size,
      width,
      height,
      sortOrder,
      copy: {
        storageKey: key,
        originalUrl: uploadResult.data.url,
        metadata: uploadResult.data.metadata,
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
        url: urlResult.data,
      },
    };
  } catch (error) {
    console.error('Error in uploadAndCreateMediaAction:', error);
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
  }
): Promise<MediaActionDbResponse<string>> {
  'use server';
  
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
    const storageKey = media.copy && typeof media.copy === 'object' 
      ? (media.copy as any).storageKey 
      : null;

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
    console.error('Error in getMediaSignedUrlAction:', error);
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
  userId?: string
): Promise<MediaActionDbResponse<void>> {
  'use server';
  
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
    const storageKey = media.copy && typeof media.copy === 'object' 
      ? (media.copy as any).storageKey 
      : null;

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
        console.error('Failed to delete from storage:', deleteResult.error);
        // Don't fail the operation if storage deletion fails
        // The database record is already soft-deleted
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteMediaAndStorageAction:', error);
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
  }
): Promise<MediaActionDbResponse<Record<string, string>>> {
  'use server';
  
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
      mediaRecords.map(async (media) => {
        const storageKey = media.copy && typeof media.copy === 'object' 
          ? (media.copy as any).storageKey 
          : null;

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
          urls[media.id] = urlResult.data;
          if (urlResult.data !== media.url) {
            updates.push({ id: media.id, url: urlResult.data });
          }
        } else {
          urls[media.id] = media.url; // Fall back to existing URL
        }
      })
    );

    // Batch update URLs in database
    if (updates.length > 0) {
      await Promise.all(
        updates.map((update) =>
          prisma.media.update({
            where: { id: update.id },
            data: { url: update.url },
          })
        )
      );
    }

    return {
      success: true,
      data: urls,
    };
  } catch (error) {
    console.error('Error in bulkRefreshMediaUrlsAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to refresh URLs',
    };
  }
}