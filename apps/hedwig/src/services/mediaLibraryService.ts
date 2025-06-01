import * as MediaLibrary from 'expo-media-library';
// React hooks
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { FirebaseAnalyticsService, FirebaseStorageService } from './firebase';
import { SentryService } from './sentryService';

export interface MediaAsset {
  albumId?: string;
  creationTime: number;
  duration: number;
  filename: string;
  height: number;
  id: string;
  mediaType: MediaLibrary.MediaTypeValue;
  modificationTime: number;
  uri: string;
  width: number;
}

export interface Album {
  assetCount: number;
  id: string;
  title: string;
  type?: string;
}

export class MediaLibraryService {
  private static hasPermission = false;

  /**
   * Request media library permissions
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      FirebaseAnalyticsService.logPermissionRequest('mediaLibrary');
      
      const { status } = await MediaLibrary.requestPermissionsAsync();
      this.hasPermission = status === 'granted';
      
      FirebaseAnalyticsService.logPermissionResult('mediaLibrary', this.hasPermission);
      
      return this.hasPermission;
    } catch (error) {
      SentryService.trackPermissionError('mediaLibrary', error as Error);
      return false;
    }
  }

  /**
   * Check media library permissions
   */
  static async checkPermissions(): Promise<boolean> {
    try {
      const { status } = await MediaLibrary.getPermissionsAsync();
      this.hasPermission = status === 'granted';
      return this.hasPermission;
    } catch (error) {
      return false;
    }
  }

  /**
   * Save image to media library
   */
  static async saveImage(
    uri: string,
    albumName?: string
  ): Promise<MediaLibrary.Asset | null> {
    try {
      if (!this.hasPermission && !(await this.requestPermissions())) {
        throw new Error('Media library permission denied');
      }

      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(uri);
      
      // Add to album if specified
      if (albumName) {
        const album = await this.getOrCreateAlbum(albumName);
        if (album) {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }
      }

      // Log analytics
      FirebaseAnalyticsService.logEvent('feature_used', {
        feature_name: 'save_to_media_library',
        feature_category: 'media',
      });

      return asset;
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'media-library-save');
      throw error;
    }
  }

  /**
   * Save product image with metadata
   */
  static async saveProductImage(
    imageUri: string,
    productName: string,
    barcode: string
  ): Promise<MediaLibrary.Asset | null> {
    try {
      // Process image with watermark/metadata
      const processedUri = await this.addProductMetadata(imageUri, productName, barcode);
      
      // Save to Hedwig album
      const asset = await this.saveImage(processedUri, 'Hedwig Scans');
      
      return asset;
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'media-library-save-product');
      throw error;
    }
  }

  /**
   * Get albums
   */
  static async getAlbums(): Promise<Album[]> {
    try {
      if (!this.hasPermission && !(await this.requestPermissions())) {
        return [];
      }

      const albums = await MediaLibrary.getAlbumsAsync();
      
      return albums.map(album => ({
        id: album.id,
        type: album.type,
        assetCount: album.assetCount || 0,
        title: album.title,
      }));
    } catch (error) {
      console.error('Failed to get albums:', error);
      return [];
    }
  }

  /**
   * Get or create album
   */
  static async getOrCreateAlbum(
    albumName: string
  ): Promise<MediaLibrary.Album | null> {
    try {
      const albums = await MediaLibrary.getAlbumsAsync();
      let album = albums.find(a => a.title === albumName);
      
      if (!album && Platform.OS === 'ios') {
        // Create album on iOS
        const tempAsset = await MediaLibrary.createAssetAsync(
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
        );
        album = await MediaLibrary.createAlbumAsync(albumName, tempAsset, false);
        await MediaLibrary.deleteAssetsAsync([tempAsset]);
      }
      
      return album || null;
    } catch (error) {
      console.error('Failed to get/create album:', error);
      return null;
    }
  }

  /**
   * Get assets from album
   */
  static async getAssetsFromAlbum(
    albumId: string,
    options?: {
      first?: number;
      mediaType?: MediaLibrary.MediaTypeValue[];
      sortBy?: MediaLibrary.SortBy[];
    }
  ): Promise<MediaAsset[]> {
    try {
      if (!this.hasPermission && !(await this.requestPermissions())) {
        return [];
      }

      const assets = await MediaLibrary.getAssetsAsync({
        album: albumId,
        first: options?.first || 20,
        mediaType: options?.mediaType,
        sortBy: options?.sortBy || [MediaLibrary.SortBy.creationTime],
      });

      return assets.assets.map(this.mapAsset);
    } catch (error) {
      console.error('Failed to get assets:', error);
      return [];
    }
  }

  /**
   * Get recent scanned images
   */
  static async getRecentScannedImages(limit = 10): Promise<MediaAsset[]> {
    try {
      const album = await this.getOrCreateAlbum('Hedwig Scans');
      if (!album) return [];

      return await this.getAssetsFromAlbum(album.id, {
        first: limit,
        mediaType: [MediaLibrary.MediaTypeValue.photo],
        sortBy: [MediaLibrary.SortBy.creationTime],
      });
    } catch (error) {
      return [];
    }
  }

  /**
   * Delete assets
   */
  static async deleteAssets(assetIds: string[]): Promise<boolean> {
    try {
      if (!this.hasPermission && !(await this.requestPermissions())) {
        return false;
      }

      return await MediaLibrary.deleteAssetsAsync(assetIds);
    } catch (error) {
      console.error('Failed to delete assets:', error);
      return false;
    }
  }

  /**
   * Export scan history as images
   */
  static async exportScanHistory(
    scans: {
      barcode: string;
      productName: string;
      imageUrl?: string;
      timestamp: Date;
    }[]
  ): Promise<number> {
    try {
      let savedCount = 0;
      
      for (const scan of scans) {
        try {
          if (scan.imageUrl) {
            // Download image
            const localUri = await FirebaseStorageService.downloadFile(
              scan.imageUrl
            );
            
            // Save with metadata
            await this.saveProductImage(
              localUri,
              scan.productName,
              scan.barcode
            );
            
            savedCount++;
          }
        } catch (error) {
          console.error('Failed to export scan:', error);
        }
      }

      // Log analytics
      FirebaseAnalyticsService.logEvent('feature_used', {
        feature_name: 'export_scan_history',
        feature_category: 'media',
      });

      return savedCount;
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'media-library-export');
      throw error;
    }
  }

  /**
   * Add product metadata to image
   */
  private static async addProductMetadata(
    imageUri: string,
    productName: string,
    barcode: string
  ): Promise<string> {
    try {
      // For now, just return the original URI
      // In a real implementation, you would add watermark or metadata
      return imageUri;
    } catch (error) {
      console.error('Failed to add metadata:', error);
      return imageUri;
    }
  }

  /**
   * Map MediaLibrary asset to our format
   */
  private static mapAsset(asset: MediaLibrary.Asset): MediaAsset {
    return {
      id: asset.id,
      width: asset.width,
      filename: asset.filename,
      albumId: asset.albumId,
      creationTime: asset.creationTime,
      duration: asset.duration,
      height: asset.height,
      mediaType: asset.mediaType,
      modificationTime: asset.modificationTime,
      uri: asset.uri,
    };
  }

  /**
   * Get storage info
   */
  static async getStorageInfo(): Promise<{
    totalSpace: number;
    freeSpace: number;
    usedSpace: number;
  } | null> {
    try {
      // This would require a native module
      // For now, return null
      return null;
    } catch (error) {
      return null;
    }
  }
}

export function useMediaLibrary() {
  const [hasPermission, setHasPermission] = useState(false);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    MediaLibraryService.checkPermissions().then(setHasPermission);
  }, []);

  const requestPermission = useCallback(async () => {
    const granted = await MediaLibraryService.requestPermissions();
    setHasPermission(granted);
    return granted;
  }, []);

  const loadAlbums = useCallback(async () => {
    if (!hasPermission) return;
    
    setIsLoading(true);
    try {
      const albumList = await MediaLibraryService.getAlbums();
      setAlbums(albumList);
    } finally {
      setIsLoading(false);
    }
  }, [hasPermission]);

  const saveImage = useCallback(async (
    uri: string,
    albumName?: string
  ) => {
    if (!hasPermission && !(await requestPermission())) {
      throw new Error('Permission denied');
    }
    
    return await MediaLibraryService.saveImage(uri, albumName);
  }, [hasPermission, requestPermission]);

  const saveProductImage = useCallback(async (
    imageUri: string,
    productName: string,
    barcode: string
  ) => {
    if (!hasPermission && !(await requestPermission())) {
      throw new Error('Permission denied');
    }
    
    return await MediaLibraryService.saveProductImage(imageUri, productName, barcode);
  }, [hasPermission, requestPermission]);

  return {
    albums,
    hasPermission,
    isLoading,
    loadAlbums,
    requestPermission,
    saveImage,
    saveProductImage,
  };
}

export function useMediaAssets(
  albumId?: string,
  options?: {
    first?: number;
    mediaType?: MediaLibrary.MediaTypeValue[];
  }
) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadAssets = useCallback(async () => {
    if (!albumId) return;
    
    setIsLoading(true);
    try {
      const assetList = await MediaLibraryService.getAssetsFromAlbum(
        albumId,
        options
      );
      setAssets(assetList);
      setHasMore(assetList.length === (options?.first || 20));
    } finally {
      setIsLoading(false);
    }
  }, [albumId, options]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const deleteAssets = useCallback(async (assetIds: string[]) => {
    const success = await MediaLibraryService.deleteAssets(assetIds);
    if (success) {
      setAssets(prev => prev.filter(asset => !assetIds.includes(asset.id)));
    }
    return success;
  }, []);

  return {
    assets,
    deleteAssets,
    hasMore,
    isLoading,
    loadAssets,
  };
}