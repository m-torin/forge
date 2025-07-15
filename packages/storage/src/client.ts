/**
 * Client-side storage exports (non-Next.js)
 *
 * This file provides client-side storage functionality for non-Next.js environments.
 * For Next.js applications, use '@repo/storage/client/next' instead.
 *
 * Note: R2 and other server-side storage providers require server-side operations
 * to generate presigned URLs. Use the client utilities with server-side APIs.
 */

// Re-export Vercel Blob client utilities for browser environments
export * from '@vercel/blob/client';

// Export client-side utilities for working with presigned URLs (R2, S3, etc.)
export * from './client-utils';

// Export types that are safe for client-side use
export type {
  CloudflareImagesBatchToken,
  CloudflareImagesListOptions,
  CloudflareImagesTransformOptions,
  CloudflareImagesVariant,
  DirectUploadResponse,
  ListOptions,
  StorageObject,
  UploadOptions,
  UploadProgress,
} from '../types';
