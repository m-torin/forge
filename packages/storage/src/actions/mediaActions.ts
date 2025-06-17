'use server';

import { getStorage, getMultiStorage } from '../server';
import type {
  StorageObject,
  UploadOptions,
  ListOptions,
  MediaActionResponse,
  BulkDeleteResponse,
  BulkMoveResponse,
} from '../../types';

//==============================================================================
// MEDIA STORAGE SERVER ACTIONS
//==============================================================================

/**
 * Upload a file to storage
 */
export async function uploadMediaAction(
  key: string,
  data: ArrayBuffer | Blob | Buffer | File | ReadableStream,
  options?: UploadOptions,
): Promise<MediaActionResponse<StorageObject>> {
  'use server';
  try {
    const result = await getStorage().upload(key, data, options);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload media',
    };
  }
}

/**
 * Get media file metadata
 */
export async function getMediaAction(
  key: string,
): Promise<MediaActionResponse<StorageObject>> {
  'use server';
  try {
    const metadata = await getStorage().getMetadata(key);
    return { success: true, data: metadata };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get media metadata',
    };
  }
}

/**
 * List media files
 */
export async function listMediaAction(
  options?: ListOptions,
): Promise<MediaActionResponse<StorageObject[]>> {
  'use server';
  try {
    const items = await getStorage().list(options);
    return { success: true, data: items };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list media',
    };
  }
}

/**
 * Delete a media file
 */
export async function deleteMediaAction(
  key: string,
): Promise<MediaActionResponse<void>> {
  'use server';
  try {
    await getStorage().delete(key);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete media',
    };
  }
}

/**
 * Check if a media file exists
 */
export async function existsMediaAction(
  key: string,
): Promise<MediaActionResponse<boolean>> {
  'use server';
  try {
    const exists = await getStorage().exists(key);
    return { success: true, data: exists };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check media existence',
    };
  }
}

/**
 * Get a URL for a media file (with automatic signed URL for product photos)
 */
export async function getMediaUrlAction(
  key: string,
  options?: { 
    expiresIn?: number; 
    context?: 'product' | 'user' | 'admin' | 'public';
    forceSign?: boolean;
  },
): Promise<MediaActionResponse<string>> {
  'use server';
  try {
    const storage = getStorage();
    
    // Product photos always need signed URLs for protection
    const isProductPhoto = options?.context === 'product' || key.includes('/products/');
    const shouldSign = isProductPhoto || options?.forceSign || options?.expiresIn;
    
    if (shouldSign) {
      const expiresIn = options?.expiresIn || (isProductPhoto ? 3600 : 1800); // 1 hour for products, 30 min default
      const signedUrl = await storage.getUrl(key, { expiresIn });
      return { success: true, data: signedUrl };
    }
    
    // For public content, return direct URL
    const url = await storage.getUrl(key);
    return { success: true, data: url };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get media URL',
    };
  }
}

/**
 * Get signed URLs for multiple product photos
 */
export async function getProductMediaUrlsAction(
  keys: string[],
  options?: { expiresIn?: number; variant?: string },
): Promise<MediaActionResponse<Array<{ key: string; url: string }>>> {
  'use server';
  try {
    const storage = getStorage();
    const expiresIn = options?.expiresIn || 3600; // 1 hour default for product photos
    
    const mediaWithSignedUrls = await Promise.all(
      keys.map(async (key) => {
        let finalKey = key;
        
        // For Cloudflare Images, append variant if specified
        if (options?.variant && key.includes('cloudflare-images')) {
          finalKey = `${key}/${options.variant}`;
        }
        
        const signedUrl = await storage.getUrl(finalKey, { expiresIn });
        
        return {
          key,
          url: signedUrl,
        };
      })
    );
    
    return {
      success: true,
      data: mediaWithSignedUrls,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get product media URLs',
    };
  }
}

/**
 * Get presigned upload URL for product photos (admin only)
 */
export async function getProductUploadUrlAction(
  filename: string,
  productId: string,
  options?: { 
    expiresIn?: number; 
    contentType?: string;
    maxSizeBytes?: number;
  },
): Promise<MediaActionResponse<{ uploadUrl: string; key: string }>> {
  'use server';
  try {
    const storage = getStorage();
    const key = `products/${productId}/${Date.now()}-${filename}`;
    
    // Get presigned upload URL (this would depend on the storage provider)
    // For now, return a structure that indicates what should be implemented
    const uploadUrl = await storage.getUrl(key, {
      expiresIn: options?.expiresIn || 1800, // 30 minutes for uploads
    });
    
    return {
      success: true,
      data: {
        uploadUrl,
        key,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get product upload URL',
    };
  }
}

/**
 * Download a media file
 */
export async function downloadMediaAction(
  key: string,
): Promise<MediaActionResponse<Blob>> {
  'use server';
  try {
    const blob = await getStorage().download(key);
    return { success: true, data: blob };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to download media',
    };
  }
}

//==============================================================================
// BULK OPERATIONS
//==============================================================================

/**
 * Delete multiple media files
 */
export async function bulkDeleteMediaAction(
  keys: string[],
): Promise<MediaActionResponse<BulkDeleteResponse>> {
  'use server';
  const results = {
    succeeded: [] as string[],
    failed: [] as { key: string; error: string }[],
  };

  try {
    // Process deletions in parallel with error handling for each
    await Promise.all(
      keys.map(async (key) => {
        try {
          await getStorage().delete(key);
          results.succeeded.push(key);
        } catch (error) {
          results.failed.push({
            key,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }),
    );

    return {
      success: results.failed.length === 0,
      data: results,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bulk delete operation failed',
    };
  }
}

/**
 * Move/rename multiple media files
 */
export async function bulkMoveMediaAction(
  operations: Array<{ sourceKey: string; destinationKey: string }>,
): Promise<MediaActionResponse<BulkMoveResponse>> {
  'use server';
  const results = {
    succeeded: [] as { sourceKey: string; destinationKey: string }[],
    failed: [] as { sourceKey: string; destinationKey: string; error: string }[],
  };

  try {
    // Process moves in parallel
    await Promise.all(
      operations.map(async ({ sourceKey, destinationKey }) => {
        try {
          // Download the file
          const blob = await getStorage().download(sourceKey);
          
          // Get metadata from source
          const metadata = await getStorage().getMetadata(sourceKey);
          
          // Upload to new location
          await getStorage().upload(destinationKey, blob, {
            contentType: metadata.contentType,
          });
          
          // Delete the source
          await getStorage().delete(sourceKey);
          
          results.succeeded.push({ sourceKey, destinationKey });
        } catch (error) {
          results.failed.push({
            sourceKey,
            destinationKey,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }),
    );

    return {
      success: results.failed.length === 0,
      data: results,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bulk move operation failed',
    };
  }
}

//==============================================================================
// MULTI-STORAGE OPERATIONS
//==============================================================================

/**
 * Upload to a specific storage provider
 */
export async function uploadToProviderAction(
  providerName: string,
  key: string,
  data: ArrayBuffer | Blob | Buffer | File | ReadableStream,
  options?: UploadOptions,
): Promise<MediaActionResponse<StorageObject>> {
  'use server';
  try {
    const provider = getMultiStorage().getProvider(providerName);
    if (!provider) {
      throw new Error(`Provider '${providerName}' not found`);
    }
    const result = await provider.upload(key, data, options);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload to provider',
    };
  }
}

/**
 * List available storage providers
 */
export async function listProvidersAction(): Promise<MediaActionResponse<string[]>> {
  'use server';
  try {
    const providers = getMultiStorage().getProviderNames();
    return { success: true, data: providers };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list providers',
    };
  }
}

/**
 * Copy media between providers
 */
export async function copyBetweenProvidersAction(
  sourceProvider: string,
  destinationProvider: string,
  key: string,
  options?: UploadOptions,
): Promise<MediaActionResponse<StorageObject>> {
  'use server';
  try {
    const multiStorage = getMultiStorage();
    const source = multiStorage.getProvider(sourceProvider);
    const destination = multiStorage.getProvider(destinationProvider);
    
    if (!source) {
      throw new Error(`Source provider '${sourceProvider}' not found`);
    }
    if (!destination) {
      throw new Error(`Destination provider '${destinationProvider}' not found`);
    }
    
    // Download from source
    const blob = await source.download(key);
    const metadata = await source.getMetadata(key);
    
    // Upload to destination
    const result = await destination.upload(key, blob, {
      contentType: metadata.contentType,
      ...options,
    });
    
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to copy between providers',
    };
  }
}