import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import {
  deleteObject,
  type FullMetadata,
  getDownloadURL,
  getMetadata,
  getStorage,
  list,
  listAll,
  type ListOptions,
  ref,
  type StorageReference,
  updateMetadata,
  uploadBytesResumable,
  type UploadMetadata,
  uploadString,
  type UploadTask,
} from 'firebase/storage';
// React hooks
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';

import { app } from '../../config/firebase';
import { SentryService } from '../sentryService';

import { FirebaseAuthService } from './authService';

export interface UploadProgress {
  bytesTransferred: number;
  progress: number; // 0-100
  state: 'running' | 'paused' | 'success' | 'canceled' | 'error';
  totalBytes: number;
}

export interface StorageFile {
  contentType: string;
  customMetadata?: Record<string, string>;
  downloadURL?: string;
  fullPath: string;
  name: string;
  size: number;
  timeCreated: string;
  updated: string;
}

export interface ImageUploadOptions {
  compress?: boolean;
  format?: SaveFormat;
  maxHeight?: number;
  maxWidth?: number;
  quality?: number; // 0-1
}

export class FirebaseStorageService {
  private static storage = getStorage(app);
  private static uploadTasks = new Map<string, UploadTask>();

  /**
   * Upload file from URI
   */
  static async uploadFile(
    filePath: string,
    fileUri: string,
    metadata?: UploadMetadata,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    try {
      // Read file as blob
      const response = await fetch(fileUri);
      const blob = await response.blob();

      // Create storage reference
      const storageRef = ref(this.storage, filePath);

      // Create upload task
      const uploadTask = uploadBytesResumable(storageRef, blob, metadata);
      const taskId = `${Date.now()}_${Math.random()}`;
      this.uploadTasks.set(taskId, uploadTask);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            
            onProgress?.({
              bytesTransferred: snapshot.bytesTransferred,
              progress,
              state: snapshot.state as any,
              totalBytes: snapshot.totalBytes,
            });
          },
          (error) => {
            this.uploadTasks.delete(taskId);
            SentryService.trackNetworkError(error, 'firebase-storage-upload');
            reject(error);
          },
          async () => {
            this.uploadTasks.delete(taskId);
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-storage-upload-init');
      throw error;
    }
  }

  /**
   * Upload image with optimization
   */
  static async uploadImage(
    filePath: string,
    imageUri: string,
    options?: ImageUploadOptions,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    try {
      let processedUri = imageUri;

      // Process image if options provided
      if (options && (options.compress || options.maxWidth || options.maxHeight)) {
        const manipulations = [];

        // Resize if needed
        if (options.maxWidth || options.maxHeight) {
          manipulations.push({
            resize: {
              width: options.maxWidth,
              height: options.maxHeight,
            },
          });
        }

        const result = await manipulateAsync(
          imageUri,
          manipulations,
          {
            compress: options.quality || 0.8,
            format: options.format || SaveFormat.JPEG,
          }
        );

        processedUri = result.uri;
      }

      // Determine content type
      const contentType = options?.format === SaveFormat.PNG 
        ? 'image/png' 
        : 'image/jpeg';

      return await this.uploadFile(
        filePath,
        processedUri,
        { contentType },
        onProgress
      );
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-storage-upload-image');
      throw error;
    }
  }

  /**
   * Upload base64 string
   */
  static async uploadBase64(
    filePath: string,
    base64String: string,
    metadata?: UploadMetadata
  ): Promise<string> {
    try {
      const storageRef = ref(this.storage, filePath);
      const snapshot = await uploadString(storageRef, base64String, 'base64', metadata);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-storage-upload-base64');
      throw error;
    }
  }

  /**
   * Upload data URL
   */
  static async uploadDataUrl(
    filePath: string,
    dataUrl: string,
    metadata?: UploadMetadata
  ): Promise<string> {
    try {
      const storageRef = ref(this.storage, filePath);
      const snapshot = await uploadString(storageRef, dataUrl, 'data_url', metadata);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-storage-upload-dataurl');
      throw error;
    }
  }

  /**
   * Download file to local storage
   */
  static async downloadFile(
    storagePath: string,
    localPath?: string
  ): Promise<string> {
    try {
      const url = await this.getDownloadURL(storagePath);
      
      if (Platform.OS === 'web') {
        // For web, just return the URL
        return url;
      }

      // For native, download to local file system
      const localUri = localPath || 
        `${FileSystem.documentDirectory}${storagePath.split('/').pop()}`;

      const downloadResult = await FileSystem.downloadAsync(url, localUri);
      
      if (downloadResult.status !== 200) {
        throw new Error(`Download failed with status ${downloadResult.status}`);
      }

      return downloadResult.uri;
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-storage-download');
      throw error;
    }
  }

  /**
   * Get download URL
   */
  static async getDownloadURL(storagePath: string): Promise<string> {
    try {
      const storageRef = ref(this.storage, storagePath);
      return await getDownloadURL(storageRef);
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-storage-get-url');
      throw error;
    }
  }

  /**
   * Delete file
   */
  static async deleteFile(storagePath: string): Promise<void> {
    try {
      const storageRef = ref(this.storage, storagePath);
      await deleteObject(storageRef);
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-storage-delete');
      throw error;
    }
  }

  /**
   * List files in a directory
   */
  static async listFiles(
    directoryPath: string,
    options?: ListOptions
  ): Promise<StorageFile[]> {
    try {
      const storageRef = ref(this.storage, directoryPath);
      const result = options 
        ? await list(storageRef, options)
        : await listAll(storageRef);

      const files = await Promise.all(
        result.items.map(async (itemRef) => {
          const metadata = await getMetadata(itemRef);
          return this.mapMetadataToFile(itemRef, metadata);
        })
      );

      return files;
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-storage-list');
      throw error;
    }
  }

  /**
   * Get file metadata
   */
  static async getFileMetadata(storagePath: string): Promise<StorageFile> {
    try {
      const storageRef = ref(this.storage, storagePath);
      const metadata = await getMetadata(storageRef);
      return this.mapMetadataToFile(storageRef, metadata);
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-storage-metadata');
      throw error;
    }
  }

  /**
   * Update file metadata
   */
  static async updateFileMetadata(
    storagePath: string,
    metadata: Partial<UploadMetadata>
  ): Promise<void> {
    try {
      const storageRef = ref(this.storage, storagePath);
      await updateMetadata(storageRef, metadata);
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-storage-update-metadata');
      throw error;
    }
  }

  /**
   * Cancel upload
   */
  static cancelUpload(taskId: string): boolean {
    const task = this.uploadTasks.get(taskId);
    if (task) {
      task.cancel();
      this.uploadTasks.delete(taskId);
      return true;
    }
    return false;
  }

  /**
   * Pause upload
   */
  static pauseUpload(taskId: string): boolean {
    const task = this.uploadTasks.get(taskId);
    if (task) {
      task.pause();
      return true;
    }
    return false;
  }

  /**
   * Resume upload
   */
  static resumeUpload(taskId: string): boolean {
    const task = this.uploadTasks.get(taskId);
    if (task) {
      task.resume();
      return true;
    }
    return false;
  }

  /**
   * Map metadata to StorageFile
   */
  private static mapMetadataToFile(
    ref: StorageReference,
    metadata: FullMetadata
  ): StorageFile {
    return {
      name: metadata.name,
      contentType: metadata.contentType || 'application/octet-stream',
      customMetadata: metadata.customMetadata,
      fullPath: metadata.fullPath,
      size: metadata.size,
      timeCreated: metadata.timeCreated,
      updated: metadata.updated,
    };
  }

  // User-specific methods

  private static getCurrentUserId(): string | null {
    const user = FirebaseAuthService.getCurrentUser();
    return user?.uid || null;
  }

  /**
   * Upload user file
   */
  static async uploadUserFile(
    subPath: string,
    fileUri: string,
    metadata?: UploadMetadata,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    const userId = this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const filePath = `users/${userId}/${subPath}`;
    return await this.uploadFile(filePath, fileUri, metadata, onProgress);
  }

  /**
   * Upload user image
   */
  static async uploadUserImage(
    subPath: string,
    imageUri: string,
    options?: ImageUploadOptions,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    const userId = this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const filePath = `users/${userId}/${subPath}`;
    return await this.uploadImage(filePath, imageUri, options, onProgress);
  }

  /**
   * List user files
   */
  static async listUserFiles(
    subPath: string,
    options?: ListOptions
  ): Promise<StorageFile[]> {
    const userId = this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const directoryPath = `users/${userId}/${subPath}`;
    return await this.listFiles(directoryPath, options);
  }

  /**
   * Delete user file
   */
  static async deleteUserFile(subPath: string): Promise<void> {
    const userId = this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const filePath = `users/${userId}/${subPath}`;
    return await this.deleteFile(filePath);
  }

  // Utility methods

  /**
   * Generate unique filename
   */
  static generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const extension = originalName.split('.').pop();
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    
    return `${nameWithoutExt}_${timestamp}_${random}.${extension}`;
  }

  /**
   * Get file extension from URI
   */
  static getFileExtension(uri: string): string {
    const match = uri.match(/\.([^.]+)$/);
    return match ? match[1] : 'unknown';
  }

  /**
   * Get MIME type from extension
   */
  static getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      gif: 'image/gif',
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      mp3: 'audio/mpeg',
      mp4: 'video/mp4',
      pdf: 'application/pdf',
      png: 'image/png',
    };

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }
}

export function useStorageUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const uploadFile = useCallback(async (
    filePath: string,
    fileUri: string,
    metadata?: UploadMetadata
  ): Promise<string | null> => {
    setUploading(true);
    setError(null);
    setProgress(null);

    try {
      const url = await FirebaseStorageService.uploadFile(
        filePath,
        fileUri,
        metadata,
        setProgress
      );
      setUploading(false);
      return url;
    } catch (err) {
      setError(err as Error);
      setUploading(false);
      return null;
    }
  }, []);

  const uploadImage = useCallback(async (
    filePath: string,
    imageUri: string,
    options?: ImageUploadOptions
  ): Promise<string | null> => {
    setUploading(true);
    setError(null);
    setProgress(null);

    try {
      const url = await FirebaseStorageService.uploadImage(
        filePath,
        imageUri,
        options,
        setProgress
      );
      setUploading(false);
      return url;
    } catch (err) {
      setError(err as Error);
      setUploading(false);
      return null;
    }
  }, []);

  return {
    error,
    progress,
    uploadFile,
    uploadImage,
    uploading,
  };
}

export function useStorageDownload() {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const downloadFile = useCallback(async (
    storagePath: string,
    localPath?: string
  ): Promise<string | null> => {
    setDownloading(true);
    setError(null);

    try {
      const localUri = await FirebaseStorageService.downloadFile(storagePath, localPath);
      setDownloading(false);
      return localUri;
    } catch (err) {
      setError(err as Error);
      setDownloading(false);
      return null;
    }
  }, []);

  const getDownloadURL = useCallback(async (
    storagePath: string
  ): Promise<string | null> => {
    setDownloading(true);
    setError(null);

    try {
      const url = await FirebaseStorageService.getDownloadURL(storagePath);
      setDownloading(false);
      return url;
    } catch (err) {
      setError(err as Error);
      setDownloading(false);
      return null;
    }
  }, []);

  return {
    downloadFile,
    downloading,
    error,
    getDownloadURL,
  };
}