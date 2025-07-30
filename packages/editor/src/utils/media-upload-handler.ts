'use client';

// Import types only when needed to avoid server-side issues
interface UploadOptions {
  contentType?: string;
  public?: boolean;
  onProgress?: (progress: { loaded: number; total: number }) => void;
  provider?: string;
}

interface StorageObject {
  url: string;
  key: string;
  size: number;
  contentType?: string;
  lastModified?: Date;
}

export type MediaType = 'image' | 'video' | 'audio';

export interface MediaUploadConfig {
  /**
   * Maximum file size in bytes (defaults: image: 10MB, video: 100MB, audio: 50MB)
   */
  maxSize?: number;
  /**
   * Media type-specific size limits
   */
  maxSizes?: {
    image?: number;
    video?: number;
    audio?: number;
  };
  /**
   * Accepted file types (default: 'image/*')
   * Examples: 'image/*', 'video/*', 'audio/*', 'image/*,video/*', etc.
   */
  accept?: string;
  /**
   * Custom upload endpoint URL (if not using @repo/storage)
   */
  uploadUrl?: string;
  /**
   * Additional headers for upload requests
   */
  headers?: Record<string, string>;
  /**
   * Whether to use the storage package or custom upload
   */
  useStoragePackage?: boolean;
  /**
   * Storage provider to use (for multi-storage)
   */
  storageProvider?: string;
}

// Legacy support
export interface ImageUploadConfig extends MediaUploadConfig {}

/**
 * Create media upload handler with support for images, videos, and audio
 */
export async function createStorageUploadHandler(config: MediaUploadConfig = {}) {
  const {
    maxSize,
    maxSizes = {},
    accept = 'image/*',
    useStoragePackage = true,
    storageProvider,
  } = config;

  // Default size limits by media type
  const defaultSizes = {
    image: 10 * 1024 * 1024, // 10MB
    video: 100 * 1024 * 1024, // 100MB
    audio: 50 * 1024 * 1024, // 50MB
  };

  return async (
    file: File,
    onProgress?: (progress: number) => void,
    abortSignal?: AbortSignal,
  ): Promise<string> => {
    const mediaType = getMediaType(file.type);

    // Validate file type
    if (!isValidMediaFile(file, accept)) {
      throw new Error(`File type ${file.type} is not supported. Expected: ${accept}`);
    }

    // Determine size limit
    const sizeLimit = maxSize || maxSizes[mediaType] || defaultSizes[mediaType];

    // Validate file size
    if (file.size > sizeLimit) {
      throw new Error(
        `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum ${(sizeLimit / 1024 / 1024).toFixed(2)}MB for ${mediaType} files`,
      );
    }

    if (useStoragePackage) {
      return uploadWithStoragePackage(file, onProgress, abortSignal, storageProvider, mediaType);
    } else if (config.uploadUrl) {
      return uploadWithCustomEndpoint(file, config, onProgress, abortSignal);
    } else {
      throw new Error(
        'No upload method configured. Set useStoragePackage=true or provide uploadUrl',
      );
    }
  };
}

/**
 * Upload using @repo/storage package
 */
async function uploadWithStoragePackage(
  file: File,
  onProgress?: (progress: number) => void,
  abortSignal?: AbortSignal,
  provider?: string,
  mediaType?: MediaType,
): Promise<string> {
  try {
    // Import storage dynamically to avoid server-side issues
    let multiStorage: any, storage: any;
    try {
      // @ts-ignore - Dynamic import may fail if package not installed
      const storageModule = await import('@repo/storage/server');
      multiStorage = storageModule.multiStorage;
      storage = storageModule.storage;
    } catch (_importError) {
      throw new Error(
        'Storage package not available. Please install @repo/storage or use a custom upload handler.',
      );
    }

    // Generate unique key for the media file
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop() || getDefaultExtension(mediaType || 'image');
    const mediaFolder = `${mediaType || 'image'}s`; // images, videos, audios
    const key = `${mediaFolder}/editor/${timestamp}-${randomId}.${extension}`;

    const uploadOptions: UploadOptions = {
      contentType: file.type,
      public: true,
      onProgress: onProgress
        ? (progress: { loaded: number; total: number }) => {
            onProgress((progress.loaded / progress.total) * 100);
          }
        : undefined,
      provider, // Use specific provider if specified
    };

    // Add abort signal handling if provided
    if (abortSignal) {
      abortSignal.addEventListener('abort', () => {
        throw new Error('Upload cancelled');
      });
    }

    let result: StorageObject;

    if (provider) {
      // Use multi-storage with specific provider
      result = await multiStorage.upload(key, file, uploadOptions);
    } else {
      // Use default storage
      result = await storage.upload(key, file, uploadOptions);
    }

    return result.url;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to upload image');
  }
}

/**
 * Upload using custom endpoint
 */
async function uploadWithCustomEndpoint(
  file: File,
  config: ImageUploadConfig,
  onProgress?: (progress: number) => void,
  abortSignal?: AbortSignal,
): Promise<string> {
  if (!config.uploadUrl) {
    throw new Error('Upload URL is required for custom endpoint');
  }

  const uploadUrl = config.uploadUrl;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);

    // Handle progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', event => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });
    }

    // Handle abort signal
    if (abortSignal) {
      abortSignal.addEventListener('abort', () => {
        xhr.abort();
        reject(new Error('Upload cancelled'));
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.url) {
            resolve(response.url);
          } else {
            reject(new Error('No URL returned from upload endpoint'));
          }
        } catch (_error) {
          reject(new Error('Invalid response from upload endpoint'));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelled'));
    });

    xhr.open('POST', uploadUrl);

    // Add custom headers
    if (config.headers) {
      Object.entries(config.headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
    }

    xhr.send(formData);
  });
}

/**
 * Create a mock upload handler for development/testing
 */
export function createMockUploadHandler(delay: number = 1000) {
  return async (
    file: File,
    onProgress?: (progress: number) => void,
    abortSignal?: AbortSignal,
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      let cancelled = false;

      // Handle abort signal
      if (abortSignal) {
        abortSignal.addEventListener('abort', () => {
          cancelled = true;
          reject(new Error('Upload cancelled'));
        });
      }

      // Simulate progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        if (cancelled) {
          clearInterval(progressInterval);
          return;
        }

        progress += Math.random() * 20;
        if (progress > 95) progress = 95;

        if (onProgress) {
          onProgress(progress);
        }
      }, delay / 10);

      // Complete upload after delay
      setTimeout(() => {
        if (cancelled) return;

        clearInterval(progressInterval);

        if (onProgress) {
          onProgress(100);
        }

        // Generate mock URL based on media type
        const mediaType = getMediaType(file.type);
        const domain =
          mediaType === 'image' ? 'images' : mediaType === 'video' ? 'videos' : 'audio';
        const mockUrl = `https://${domain}.example.com/uploads/${Date.now()}-${file.name}`;
        resolve(mockUrl);
      }, delay);
    });
  };
}

/**
 * Media file type constants
 */
export const MEDIA_FILE_TYPES = {
  // Images
  JPEG: 'image/jpeg',
  PNG: 'image/png',
  GIF: 'image/gif',
  WEBP: 'image/webp',
  SVG: 'image/svg+xml',

  // Videos
  MP4: 'video/mp4',
  WEBM: 'video/webm',
  AVI: 'video/x-msvideo',
  MOV: 'video/quicktime',
  MKV: 'video/x-matroska',

  // Audio
  MP3: 'audio/mpeg',
  WAV: 'audio/wav',
  OGG: 'audio/ogg',
  M4A: 'audio/mp4',
  FLAC: 'audio/flac',
} as const;

export const IMAGE_TYPES = [
  MEDIA_FILE_TYPES.JPEG,
  MEDIA_FILE_TYPES.PNG,
  MEDIA_FILE_TYPES.GIF,
  MEDIA_FILE_TYPES.WEBP,
].join(',');

export const VIDEO_TYPES = [MEDIA_FILE_TYPES.MP4, MEDIA_FILE_TYPES.WEBM, MEDIA_FILE_TYPES.MOV].join(
  ',',
);

export const AUDIO_TYPES = [
  MEDIA_FILE_TYPES.MP3,
  MEDIA_FILE_TYPES.WAV,
  MEDIA_FILE_TYPES.OGG,
  MEDIA_FILE_TYPES.M4A,
].join(',');

export const ALL_MEDIA_TYPES = [IMAGE_TYPES, VIDEO_TYPES, AUDIO_TYPES].join(',');

// Legacy export
export const DEFAULT_ACCEPTED_TYPES = IMAGE_TYPES;

/**
 * Get media type from MIME type
 */
export function getMediaType(mimeType: string): MediaType {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'image'; // default fallback
}

/**
 * Get default file extension for media type
 */
export function getDefaultExtension(mediaType: MediaType): string {
  switch (mediaType) {
    case 'image':
      return 'jpg';
    case 'video':
      return 'mp4';
    case 'audio':
      return 'mp3';
    default:
      return 'jpg';
  }
}

/**
 * Check if a file is a valid media file
 */
export function isValidMediaFile(file: File, acceptedTypes: string = 'image/*'): boolean {
  if (acceptedTypes.includes('*')) {
    // Handle wildcard patterns like "image/*", "video/*", etc.
    const patterns = acceptedTypes.split(',').map(type => type.trim());
    return patterns.some(pattern => {
      if (pattern.endsWith('/*')) {
        return file.type.startsWith(pattern.replace('/*', '/'));
      }
      return file.type === pattern;
    });
  }

  const types = acceptedTypes.split(',').map(type => type.trim());
  return types.includes(file.type);
}

/**
 * Utility to check if a file is a valid image (legacy support)
 */
export function isValidImageFile(file: File, acceptedTypes: string = 'image/*'): boolean {
  return isValidMediaFile(file, acceptedTypes);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
