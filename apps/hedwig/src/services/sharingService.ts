import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { FileSystemService } from './fileSystemService';
import { LinkingService } from './linkingService';

export interface ShareData {
  message?: string;
  mimeType?: string;
  title?: string;
  url?: string;
}

export class SharingService {
  /**
   * Check if sharing is available on the platform
   */
  static async isAvailable(): Promise<boolean> {
    try {
      return await Sharing.isAvailableAsync();
    } catch (error) {
      console.error('Error checking sharing availability:', error);
      return false;
    }
  }

  /**
   * Share file using native sharing
   */
  static async shareFile(
    fileUri: string, 
    options?: {
      mimeType?: string;
      dialogTitle?: string;
      UTI?: string;
    }
  ): Promise<void> {
    try {
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        throw new Error('Sharing is not available on this platform');
      }

      await Sharing.shareAsync(fileUri, {
        dialogTitle: options?.dialogTitle || 'Share File',
        mimeType: options?.mimeType || 'text/plain',
        UTI: options?.UTI,
      });
    } catch (error) {
      console.error('Error sharing file:', error);
      throw new Error('Failed to share file');
    }
  }

  /**
   * Share text content
   */
  static async shareText(text: string, title?: string): Promise<void> {
    try {
      // Create temporary text file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `shared-text-${timestamp}.txt`;
      const filePath = `${FileSystemService.DIRECTORIES.TEMP}${filename}`;

      await FileSystemService.ensureDirectoryExists(FileSystemService.DIRECTORIES.TEMP);
      await FileSystemService.writeFile(filePath, text);

      await this.shareFile(filePath, {
        dialogTitle: title || 'Share Text',
        mimeType: 'text/plain',
      });

      // Clean up temporary file after a delay
      setTimeout(async () => {
        await FileSystemService.deleteFile(filePath);
      }, 5000);
    } catch (error) {
      console.error('Error sharing text:', error);
      throw new Error('Failed to share text');
    }
  }

  /**
   * Share scan result with details
   */
  static async shareScanResult(scanData: {
    barcode: string;
    productName?: string;
    description?: string;
    timestamp: number;
    imageUri?: string;
  }): Promise<void> {
    try {
      const shareText = this.formatScanResult(scanData);
      
      if (scanData.imageUri) {
        // If there's an image, share the image with text
        await this.shareFile(scanData.imageUri, {
          dialogTitle: 'Share Scan Result',
          mimeType: 'image/jpeg',
        });
      } else {
        // Share as text only
        await this.shareText(shareText, 'Scan Result');
      }
    } catch (error) {
      console.error('Error sharing scan result:', error);
      throw new Error('Failed to share scan result');
    }
  }

  /**
   * Share scan history export
   */
  static async shareScanHistory(scans: any[], format: 'json' | 'csv' = 'json'): Promise<void> {
    try {
      const filePath = await FileSystemService.exportScanHistory(scans, format);
      
      await this.shareFile(filePath, {
        dialogTitle: 'Share Scan History',
        mimeType: format === 'json' ? 'application/json' : 'text/csv',
      });
    } catch (error) {
      console.error('Error sharing scan history:', error);
      throw new Error('Failed to share scan history');
    }
  }

  /**
   * Share deep link to specific content
   */
  static async shareDeepLink(route: string, params?: Record<string, string>, customMessage?: string): Promise<void> {
    try {
      const deepLink = LinkingService.createDeepLink(route, params);
      const message = customMessage || `Check this out in Hedwig: ${deepLink}`;
      
      await this.shareText(message, 'Share Hedwig Link');
    } catch (error) {
      console.error('Error sharing deep link:', error);
      throw new Error('Failed to share link');
    }
  }

  /**
   * Share product information
   */
  static async shareProduct(productData: {
    name: string;
    barcode: string;
    description?: string;
    price?: string;
    category?: string;
    imageUri?: string;
  }): Promise<void> {
    try {
      const shareText = this.formatProductInfo(productData);
      
      if (productData.imageUri) {
        // Create a combined share with image and text
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `product-info-${timestamp}.txt`;
        const textFilePath = `${FileSystemService.DIRECTORIES.TEMP}${filename}`;
        
        await FileSystemService.ensureDirectoryExists(FileSystemService.DIRECTORIES.TEMP);
        await FileSystemService.writeFile(textFilePath, shareText);
        
        // Share the image first, then the text file
        await this.shareFile(productData.imageUri, {
          dialogTitle: 'Share Product Image',
          mimeType: 'image/jpeg',
        });
        
        // Clean up
        setTimeout(async () => {
          await FileSystemService.deleteFile(textFilePath);
        }, 5000);
      } else {
        await this.shareText(shareText, 'Product Information');
      }
    } catch (error) {
      console.error('Error sharing product:', error);
      throw new Error('Failed to share product information');
    }
  }

  /**
   * Share app recommendation
   */
  static async shareApp(): Promise<void> {
    try {
      const message = `Check out Hedwig - the ultimate barcode scanning app! 📱✨

🔍 Fast & accurate barcode scanning
📊 Product information lookup
📋 Scan history tracking
🔄 Export & share capabilities

Download: ${LinkingService.createDeepLink('/')}`; // Replace with actual app store links

      await this.shareText(message, 'Share Hedwig App');
    } catch (error) {
      console.error('Error sharing app:', error);
      throw new Error('Failed to share app');
    }
  }

  /**
   * Emergency share for troubleshooting (logs, etc.)
   */
  static async shareDebugInfo(): Promise<void> {
    try {
      const debugInfo = await this.generateDebugInfo();
      await this.shareText(debugInfo, 'Debug Information');
    } catch (error) {
      console.error('Error sharing debug info:', error);
      throw new Error('Failed to share debug information');
    }
  }

  // Helper methods for formatting content

  private static formatScanResult(scanData: {
    barcode: string;
    productName?: string;
    description?: string;
    timestamp: number;
  }): string {
    const date = new Date(scanData.timestamp).toLocaleString();
    
    return `🔍 Hedwig Scan Result

📦 Product: ${scanData.productName || 'Unknown Product'}
🏷️ Barcode: ${scanData.barcode}
📅 Scanned: ${date}
${scanData.description ? `📝 Description: ${scanData.description}` : ''}

Generated by Hedwig - Barcode Scanner`;
  }

  private static formatProductInfo(productData: {
    name: string;
    barcode: string;
    description?: string;
    price?: string;
    category?: string;
  }): string {
    return `📦 Product Information

🏷️ Name: ${productData.name}
🔢 Barcode: ${productData.barcode}
${productData.price ? `💰 Price: ${productData.price}` : ''}
${productData.category ? `📂 Category: ${productData.category}` : ''}
${productData.description ? `📝 Description: ${productData.description}` : ''}

Shared from Hedwig - Barcode Scanner`;
  }

  private static async generateDebugInfo(): Promise<string> {
    try {
      const storageStats = await FileSystemService.getStorageStats();
      
      return `🔧 Hedwig Debug Information

📱 Platform: ${Platform.OS} ${Platform.Version}
📊 Storage Usage:
  • Total Size: ${(storageStats.totalSize / 1024 / 1024).toFixed(2)} MB
  • File Count: ${storageStats.fileCount}
  • Scans: ${(storageStats.scansSize / 1024).toFixed(2)} KB
  • Exports: ${(storageStats.exportsSize / 1024).toFixed(2)} KB

🕐 Generated: ${new Date().toISOString()}

This information can help with troubleshooting issues.`;
    } catch (error) {
      return `🔧 Hedwig Debug Information

❌ Error generating debug info: ${error}
🕐 Generated: ${new Date().toISOString()}`;
    }
  }
}