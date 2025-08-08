'use server';

import type {
  BulkDeleteResponse,
  BulkMoveResponse,
  ListOptions,
  MediaActionResponse,
  StorageObject,
  UploadOptions,
} from '../../types';
import { getMultiStorage, getStorage } from '../server';

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
export async function getMediaAction(key: string): Promise<MediaActionResponse<StorageObject>> {
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
export async function deleteMediaAction(key: string): Promise<MediaActionResponse<void>> {
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
export async function existsMediaAction(key: string): Promise<MediaActionResponse<boolean>> {
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
      keys.map(async key => {
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
      }),
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
export async function downloadMediaAction(key: string): Promise<MediaActionResponse<Blob>> {
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
      keys.map(async key => {
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
// BULK IMPORT OPERATIONS
//==============================================================================

/**
 * Import media from external URLs (CDN, etc.) into our storage
 * Supports streaming for large files and automatic routing to appropriate storage
 */
export async function bulkImportFromUrlsAction(
  imports: Array<{
    sourceUrl: string;
    destinationKey?: string;
    metadata?: {
      altText?: string;
      productId?: string;
      userId?: string;
      type?: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    };
  }>,
  options?: {
    batchSize?: number;
    provider?: string;
    timeout?: number;
  },
): Promise<
  MediaActionResponse<{
    succeeded: Array<{
      sourceUrl: string;
      destinationKey: string;
      storageObject: StorageObject;
    }>;
    failed: Array<{
      sourceUrl: string;
      error: string;
    }>;
    totalProcessed: number;
  }>
> {
  'use server';

  const results = {
    succeeded: [] as Array<{
      sourceUrl: string;
      destinationKey: string;
      storageObject: StorageObject;
    }>,
    failed: [] as Array<{
      sourceUrl: string;
      error: string;
    }>,
    totalProcessed: 0,
  };

  const batchSize = options?.batchSize || 5; // Process 5 URLs concurrently
  const timeout = options?.timeout || 30000; // 30 second timeout per URL

  try {
    // Process imports in batches to avoid overwhelming the system
    for (let i = 0; i < imports.length; i += batchSize) {
      const batch = imports.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async importItem => {
          try {
            // Fetch with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(importItem.sourceUrl, {
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Get content type and determine storage provider
            const contentType = response.headers.get('content-type') || 'application/octet-stream';
            const isImage = contentType.startsWith('image/');

            // Generate destination key if not provided
            const destinationKey =
              importItem.destinationKey ||
              generateStorageKey(importItem.sourceUrl, importItem.metadata);

            // Stream the content to storage
            const storage = options?.provider
              ? getMultiStorage().getProvider(options.provider)
              : getStorage();

            if (!storage) {
              throw new Error('Storage provider not available');
            }

            // For images, use Cloudflare Images if configured
            if (isImage && !options?.provider) {
              const multiStorage = getMultiStorage();
              const imageProvider = multiStorage.getProvider('cloudflare-images');
              if (imageProvider) {
                // Stream to Cloudflare Images
                const blob = await response.blob();
                const result = await imageProvider.upload(destinationKey, blob, {
                  contentType,
                  metadata: importItem.metadata,
                });

                results.succeeded.push({
                  sourceUrl: importItem.sourceUrl,
                  destinationKey,
                  storageObject: result,
                });
                results.totalProcessed++;
                return;
              }
            }

            // Stream to default storage (R2 or local)
            const stream = response.body;
            if (!stream) {
              throw new Error('No response body available');
            }

            const result = await storage.upload(destinationKey, stream, {
              contentType,
              metadata: importItem.metadata,
            });

            results.succeeded.push({
              sourceUrl: importItem.sourceUrl,
              destinationKey,
              storageObject: result,
            });
            results.totalProcessed++;
          } catch (error) {
            results.failed.push({
              sourceUrl: importItem.sourceUrl,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
            results.totalProcessed++;
          }
        }),
      );
    }

    return {
      success: results.failed.length === 0,
      data: results,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bulk import operation failed',
      data: results,
    };
  }
}

/**
 * Import a single media item from URL with progress tracking
 */
export async function importFromUrlAction(
  sourceUrl: string,
  destinationKey?: string,
  options?: {
    metadata?: Record<string, any>;
    onProgress?: (progress: number) => void;
  },
): Promise<MediaActionResponse<StorageObject>> {
  'use server';

  try {
    const response = await fetch(sourceUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentLength = response.headers.get('content-length');

    // Generate key if not provided
    const key = destinationKey || generateStorageKey(sourceUrl);

    // For progress tracking, we need to read the stream manually
    if (options?.onProgress && contentLength && response.body) {
      const total = parseInt(contentLength);
      let loaded = 0;

      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        loaded += value.length;
        options.onProgress(loaded / total);
      }

      // Combine chunks into a single blob
      const blob = new Blob(
        chunks.map(
          chunk =>
            chunk.buffer.slice(
              chunk.byteOffset,
              chunk.byteOffset + chunk.byteLength,
            ) as ArrayBuffer,
        ),
        { type: contentType },
      );

      const storage = getStorage();
      const result = await storage.upload(key, blob, {
        contentType,
        metadata: options.metadata,
      });

      return { success: true, data: result };
    } else {
      // Simple stream without progress
      const storage = getStorage();
      const stream = response.body;

      if (!stream) {
        throw new Error('No response body available');
      }

      const result = await storage.upload(key, stream, {
        contentType,
        metadata: options?.metadata,
      });

      return { success: true, data: result };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to import from URL',
    };
  }
}

/**
 * Helper function to generate storage key from URL
 */
function generateStorageKey(sourceUrl: string, metadata?: Record<string, any>): string {
  try {
    const url = new URL(sourceUrl);
    const filename = url.pathname.split('/').pop() || 'imported-file';
    const timestamp = Date.now();

    // Determine prefix based on metadata
    let prefix = 'imports';
    if (metadata?.productId) {
      prefix = `products/${metadata.productId}`;
    } else if (metadata?.userId) {
      prefix = `users/${metadata.userId}`;
    } else if (metadata?.type === 'IMAGE') {
      prefix = 'images';
    } else if (metadata?.type === 'VIDEO') {
      prefix = 'videos';
    } else if (metadata?.type === 'DOCUMENT') {
      prefix = 'documents';
    }

    return `${prefix}/${timestamp}-${filename}`;
  } catch {
    // Fallback for invalid URLs
    return `imports/${Date.now()}-imported-file`;
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
