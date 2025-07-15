/**
 * Client-side utilities for storage operations
 * These work with server-side APIs to enable client uploads without exposing credentials
 */

export interface PresignedUploadUrl {
  url: string;
  fields?: Record<string, string>;
  key: string;
  expiresAt: Date;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

/**
 * Upload a file using a presigned URL (works with R2, S3, etc.)
 */
export async function uploadWithPresignedUrl(
  presignedData: PresignedUploadUrl,
  file: File | Blob,
  options?: {
    onProgress?: (progress: UploadProgress) => void;
  },
): Promise<void> {
  const formData = new FormData();

  // Add any required fields first (for POST uploads)
  if (presignedData.fields) {
    Object.entries(presignedData.fields).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }

  // Add the file last
  formData.append('file', file);

  // For progress tracking, we need XMLHttpRequest
  if (options?.onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', event => {
        if (event.lengthComputable && options.onProgress) {
          options.onProgress({
            loaded: event.loaded,
            total: event.total,
            percent: (event.loaded / event.total) * 100,
          });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', presignedData.url);
      xhr.send(formData);
    });
  }

  // Simple fetch for no progress tracking
  const response = await fetch(presignedData.url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }
}

/**
 * Upload directly to a URL (PUT method, typically for presigned PUT URLs)
 */
export async function uploadDirectToUrl(
  url: string,
  file: File | Blob,
  options?: {
    headers?: Record<string, string>;
    onProgress?: (progress: UploadProgress) => void;
  },
): Promise<void> {
  // For progress tracking, we need XMLHttpRequest
  if (options?.onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', event => {
        if (event.lengthComputable && options.onProgress) {
          options.onProgress({
            loaded: event.loaded,
            total: event.total,
            percent: (event.loaded / event.total) * 100,
          });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('PUT', url);

      // Set headers
      if (options?.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });
      }

      xhr.send(file);
    });
  }

  // Simple fetch for no progress tracking
  const response = await fetch(url, {
    method: 'PUT',
    body: file,
    headers: options?.headers,
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }
}

/**
 * Client-side multipart upload coordinator
 * Works with server-side APIs to manage multipart uploads
 */
export class ClientMultipartUpload {
  private uploadId: string;
  private key: string;
  private parts: Array<{ PartNumber: number; ETag: string }> = [];

  constructor(uploadId: string, key: string) {
    this.uploadId = uploadId;
    this.key = key;
  }

  async uploadPart(
    partNumber: number,
    presignedUrl: string,
    data: Blob,
    _onProgress?: (progress: UploadProgress) => void,
  ): Promise<void> {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: data,
    });

    if (!response.ok) {
      throw new Error(`Part upload failed with status ${response.status}`);
    }

    const etag = response.headers.get('ETag') || '';
    this.parts.push({ PartNumber: partNumber, ETag: etag });
  }

  getParts() {
    return this.parts.sort((a, b) => a.PartNumber - b.PartNumber);
  }

  getUploadId() {
    return this.uploadId;
  }

  getKey() {
    return this.key;
  }
}

/**
 * Split a file into chunks for multipart upload
 */
export async function* splitFileIntoChunks(
  file: File | Blob,
  chunkSize: number = 5 * 1024 * 1024, // 5MB default
): AsyncGenerator<{ chunk: Blob; partNumber: number; start: number; end: number }> {
  const totalSize = file.size;
  let partNumber = 1;

  for (let start = 0; start < totalSize; start += chunkSize) {
    const end = Math.min(start + chunkSize, totalSize);
    const chunk = file.slice(start, end);

    yield {
      chunk,
      partNumber,
      start,
      end,
    };

    partNumber++;
  }
}

/**
 * Download a file from a URL with progress tracking
 */
export async function downloadFromUrl(
  url: string,
  options?: {
    onProgress?: (progress: UploadProgress) => void;
  },
): Promise<Blob> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Download failed with status ${response.status}`);
  }

  // If no progress tracking needed, just return blob
  if (!options?.onProgress || !response.body) {
    return response.blob();
  }

  // Stream with progress tracking
  const contentLength = response.headers.get('content-length');
  const total = contentLength ? parseInt(contentLength, 10) : 0;

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    chunks.push(value);
    loaded += value.length;

    if (total > 0) {
      options.onProgress({
        loaded,
        total,
        percent: (loaded / total) * 100,
      });
    }
  }

  const blob = new Blob(chunks, {
    type: response.headers.get('content-type') || 'application/octet-stream',
  });

  return blob;
}
