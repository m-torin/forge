import sharp from 'sharp';
import { ProcessedImage } from '@/workflows/jr-images/types';
import { JR_IMAGES_CONFIG, getJrImageProcessingRules } from '@/workflows/jr-images/config';

// Mock upload function for development
async function mockUpload(params: {
  key: string;
  body: Buffer;
  contentType: string;
  metadata: Record<string, string>;
}) {
  // Simulate upload delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Return mock URL
  return {
    url: `https://mock-r2-bucket.example.com/${params.key}`,
  };
}

/**
 * Validates image URL before processing with enhanced checks
 */
export function validateJrImageUrl(url: string): { valid: boolean; reason?: string } {
  try {
    const parsed = new URL(url);

    // Check protocol
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, reason: 'Invalid protocol' };
    }

    // Check for private IP addresses (SSRF protection)
    if (
      parsed.hostname === 'localhost' ||
      parsed.hostname.startsWith('127.') ||
      parsed.hostname.startsWith('192.168.') ||
      parsed.hostname.startsWith('10.') ||
      parsed.hostname.startsWith('172.')
    ) {
      return { valid: false, reason: 'Private IP address not allowed' };
    }

    // Check for common image extensions or patterns
    const pathname = parsed.pathname.toLowerCase();
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
    const hasImageExtension = imageExtensions.some((ext) => pathname.endsWith(ext));

    // Some CDNs don't use extensions, so also check for image paths
    const hasImagePath =
      pathname.includes('/image') ||
      pathname.includes('/img') ||
      pathname.includes('/photo') ||
      pathname.includes('/media') ||
      pathname.includes('/upload');

    // Check for data URLs
    const isDataUrl = url.startsWith('data:image/');

    if (!hasImageExtension && !hasImagePath && !isDataUrl) {
      return { valid: false, reason: 'URL does not appear to be an image' };
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: 'Invalid URL format' };
  }
}

/**
 * Downloads and processes an image with streaming to minimize memory usage
 */
export async function processJrImageStream(
  originalUrl: string,
  r2Key: string,
  documentId: string,
  imageIndex: number,
  options: {
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
  } = {},
): Promise<ProcessedImage> {
  const startTime = Date.now();
  let originalSize = 0;

  try {
    // Get processing rules for this image source
    const rules = getJrImageProcessingRules(originalUrl);
    const mergedOptions = { ...rules, ...options };

    // Download image with timeout and size limits
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      mergedOptions.timeout || JR_IMAGES_CONFIG.downloadTimeout,
    );

    const response = await fetch(originalUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'JR-ImageBot/1.0 (Next.js)',
        Accept: 'image/*',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Check content length
    const contentLength = parseInt(response.headers.get('content-length') || '0');
    if (contentLength > JR_IMAGES_CONFIG.maxImageSize) {
      throw new Error(`Image too large: ${contentLength} bytes`);
    }

    originalSize = contentLength;

    // Create transform streams (commented for development)
    // const sharpTransform = sharp()
    //   .rotate() // Auto-rotate based on EXIF
    //   .resize({
    //     width: mergedOptions.maxWidth,
    //     height: mergedOptions.maxHeight,
    //     fit: 'inside',
    //     withoutEnlargement: true,
    //   })
    //   .webp({
    //     quality: mergedOptions.quality,
    //     effort: 4, // Balance between compression and speed
    //   });

    // Process the image to buffer
    if (!response.body) {
      throw new Error('No response body');
    }

    // Convert response to buffer
    const responseBuffer = await response.arrayBuffer();
    const inputBuffer = Buffer.from(responseBuffer);

    // Process with Sharp
    const processedBuffer = await sharp(inputBuffer)
      .rotate() // Auto-rotate based on EXIF
      .resize({
        width: mergedOptions.maxWidth,
        height: mergedOptions.maxHeight,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({
        quality: mergedOptions.quality,
        effort: 4, // Balance between compression and speed
      })
      .toBuffer();

    // Get processed image metadata
    const processedMetadata = await sharp(processedBuffer).metadata();

    // Upload to R2 using mock upload function
    const uploadResult = await mockUpload({
      key: r2Key,
      body: processedBuffer,
      contentType: 'image/webp',
      metadata: {
        documentId,
        imageIndex: String(imageIndex),
        originalUrl,
        processedAt: new Date().toISOString(),
        originalSize: String(originalSize),
        processedSize: String(processedBuffer.length),
      },
    });

    const result: ProcessedImage = {
      originalUrl,
      r2Url: uploadResult.url,
      r2Key,
      size: processedBuffer.length,
      width: processedMetadata.width || 0,
      height: processedMetadata.height || 0,
      format: 'webp',
    };

    console.log('JR-Image processed successfully', {
      originalUrl,
      documentId,
      imageIndex,
      originalSize,
      processedSize: processedBuffer.length,
      compressionRatio: (processedBuffer.length / originalSize).toFixed(2),
      processingTime: Date.now() - startTime,
    });

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error('JR-Image processing failed', {
      originalUrl,
      documentId,
      imageIndex,
      error: errorMessage,
      processingTime: Date.now() - startTime,
    });

    throw error;
  }
}

/**
 * Processes image with retry logic and fallback
 */
export async function processJrImageWithRetry(
  originalUrl: string,
  r2Key: string,
  documentId: string,
  imageIndex: number,
  maxRetries: number = JR_IMAGES_CONFIG.maxRetries,
): Promise<ProcessedImage> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await processJrImageStream(originalUrl, r2Key, documentId, imageIndex);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      if (attempt < maxRetries) {
        const delay = JR_IMAGES_CONFIG.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
        console.warn(`JR-Image processing attempt ${attempt} failed, retrying in ${delay}ms`, {
          originalUrl,
          documentId,
          imageIndex,
          error: lastError.message,
        });

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

/**
 * Checks if image already exists in storage
 */
export async function checkJrImageExists(_r2Key: string): Promise<boolean> {
  try {
    // This would use the storage package to check if file exists
    // For now, return false to always process
    return false;
  } catch {
    return false;
  }
}

/**
 * Batch processes multiple images for a document
 */
export async function processDocumentJrImages(
  documentId: string,
  imageUrls: string[],
  priority: 'high' | 'medium' | 'low' = 'low',
): Promise<{
  processedImages: ProcessedImage[];
  failedImages: Array<{
    index: number;
    originalUrl: string;
    error: string;
    timestamp: string;
  }>;
}> {
  const processedImages: ProcessedImage[] = [];
  const failedImages: Array<{
    index: number;
    originalUrl: string;
    error: string;
    timestamp: string;
  }> = [];

  // Process images with Promise.allSettled for resilient handling
  const imagePromises = imageUrls.map(async (imageUrl, index) => {
    try {
      // Validate URL
      const validation = validateJrImageUrl(imageUrl);
      if (!validation.valid) {
        throw new Error(`Invalid image URL: ${validation.reason}`);
      }

      // Generate R2 key
      const r2Key = `jr-images/${priority}/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}/${documentId}/${index}.webp`;

      // Check if image should be skipped
      const exists = await checkJrImageExists(r2Key);
      if (exists) {
        console.log('JR-Image already exists', {
          documentId,
          imageIndex: index,
          r2Key,
        });
        return null; // Skip this image
      }

      // Process image with retry logic
      const processedImage = await processJrImageWithRetry(imageUrl, r2Key, documentId, index);

      return { index, result: processedImage };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('JR-Image processing failed', {
        documentId,
        imageIndex: index,
        imageUrl,
        error: errorMsg,
      });

      return {
        index,
        error: {
          index,
          originalUrl: imageUrl,
          error: errorMsg,
          timestamp: new Date().toISOString(),
        },
      };
    }
  });

  // Wait for all image processing to complete
  const results = await Promise.allSettled(imagePromises);

  // Separate successful and failed results
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value) {
      if ('result' in result.value && result.value.result) {
        processedImages.push(result.value.result);
      } else if ('error' in result.value) {
        failedImages.push(result.value.error);
      }
      // Skip null results (images that were skipped)
    } else if (result.status === 'rejected') {
      failedImages.push({
        index,
        originalUrl: imageUrls[index],
        error: result.reason?.message || 'Processing failed',
        timestamp: new Date().toISOString(),
      });
    }
  });

  return { processedImages, failedImages };
}
