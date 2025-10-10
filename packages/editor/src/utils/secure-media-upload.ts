import { fileTypeFromBuffer } from 'file-type';
import sanitizeFilename from 'sanitize-filename';

interface SecureUploadConfig {
  allowedTypes: string[];
  maxSize: number;
  maxSizes?: {
    image?: number;
    video?: number;
    audio?: number;
  };
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitizedName?: string;
}

export async function validateFile(
  file: File,
  config: SecureUploadConfig,
): Promise<ValidationResult> {
  // 1. File size validation
  if (file.size > config.maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${formatBytes(config.maxSize)}`,
    };
  }

  // 2. Binary-based MIME type detection
  const buffer = await file.arrayBuffer();
  const fileType = await fileTypeFromBuffer(buffer);

  if (!fileType || !config.allowedTypes.includes(fileType.mime)) {
    return {
      valid: false,
      error: `File type ${fileType?.mime || 'unknown'} not allowed. Allowed types: ${config.allowedTypes.join(', ')}`,
    };
  }

  // 3. Filename sanitization
  const sanitizedName = sanitizeFilename(file.name, { replacement: '_' });

  if (!sanitizedName || sanitizedName.length === 0) {
    return {
      valid: false,
      error: 'Invalid filename',
    };
  }

  // 4. Additional size limits per type
  if (config.maxSizes) {
    const typeCategory = getMediaCategory(fileType.mime);
    const typeLimit = config.maxSizes[typeCategory];
    if (typeLimit && file.size > typeLimit) {
      return {
        valid: false,
        error: `${typeCategory} files cannot exceed ${formatBytes(typeLimit)}`,
      };
    }
  }

  return { valid: true, sanitizedName };
}

function getMediaCategory(mimeType: string): 'image' | 'video' | 'audio' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'image'; // default fallback
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const SAFE_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;

const _SAFE_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'] as const;

const _SAFE_AUDIO_TYPES = [
  'audio/mp3',
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
  'audio/webm',
] as const;

export const DEFAULT_SECURE_CONFIG: SecureUploadConfig = {
  allowedTypes: [...SAFE_IMAGE_TYPES],
  maxSize: 5 * 1024 * 1024, // 5MB
  maxSizes: {
    image: 5 * 1024 * 1024, // 5MB
    video: 50 * 1024 * 1024, // 50MB
    audio: 10 * 1024 * 1024, // 10MB
  },
};

export function createSecureUploadHandler(
  config: Partial<SecureUploadConfig> = {},
): (
  file: File,
  onProgress?: (progress: number) => void,
  abortSignal?: AbortSignal,
) => Promise<string> {
  const finalConfig = { ...DEFAULT_SECURE_CONFIG, ...config };

  return async (
    file: File,
    onProgress?: (progress: number) => void,
    abortSignal?: AbortSignal,
  ): Promise<string> => {
    // Validate file first
    const validation = await validateFile(file, finalConfig);

    if (!validation.valid) {
      throw new Error(validation.error || 'File validation failed');
    }

    // Check for abort signal
    if (abortSignal?.aborted) {
      throw new Error('Upload aborted');
    }

    // Mock upload implementation - replace with your actual upload logic
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        if (abortSignal?.aborted) {
          reject(new Error('Upload aborted'));
          return;
        }

        // Return a mock URL - replace with actual uploaded URL
        resolve(`https://example.com/uploads/${validation.sanitizedName}`);
      }, 1000);

      // Handle abort signal
      abortSignal?.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        reject(new Error('Upload aborted'));
      });

      // Simulate progress
      if (onProgress) {
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 10;
          onProgress(progress);
          if (progress >= 100) {
            clearInterval(progressInterval);
          }
        }, 100);
      }
    });
  };
}
