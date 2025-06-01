import * as Clipboard from 'expo-clipboard';
import { Alert, Platform } from 'react-native';

import { HapticsService } from './hapticsService';
import { NotificationService } from './notificationService';

export interface ClipboardData {
  source?: string;
  text: string;
  timestamp: number;
}

export class ClipboardService {
  private static lastCopiedData: ClipboardData | null = null;

  /**
   * Copy text to clipboard
   */
  static async copyToClipboard(
    text: string, 
    options?: {
      showNotification?: boolean;
      hapticFeedback?: boolean;
      source?: string;
    }
  ): Promise<boolean> {
    try {
      await Clipboard.setStringAsync(text);
      
      // Store last copied data
      this.lastCopiedData = {
        source: options?.source,
        text,
        timestamp: Date.now(),
      };

      // Provide feedback
      if (options?.hapticFeedback !== false) {
        await HapticsService.success();
      }

      if (options?.showNotification !== false) {
        if (Platform.OS === 'web') {
          Alert.alert('Copied', 'Text copied to clipboard');
        } else {
          await NotificationService.scheduleLocalNotification({
            body: `${text.substring(0, 30)}${text.length > 30 ? '...' : ''}`,
            title: '📋 Copied to Clipboard',
          });
        }
      }

      console.log('Copied to clipboard:', text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  /**
   * Get text from clipboard
   */
  static async getFromClipboard(): Promise<string | null> {
    try {
      const text = await Clipboard.getStringAsync();
      return text || null;
    } catch (error) {
      console.error('Failed to get clipboard content:', error);
      return null;
    }
  }

  /**
   * Check if clipboard has text
   */
  static async hasString(): Promise<boolean> {
    try {
      const hasString = await Clipboard.hasStringAsync();
      return hasString;
    } catch (error) {
      console.error('Failed to check clipboard:', error);
      return false;
    }
  }

  /**
   * Get last copied data (from this app)
   */
  static getLastCopiedData(): ClipboardData | null {
    return this.lastCopiedData;
  }

  /**
   * Copy barcode to clipboard
   */
  static async copyBarcode(
    barcode: string, 
    type?: string
  ): Promise<boolean> {
    const formattedText = type ? `${type}: ${barcode}` : barcode;
    
    return this.copyToClipboard(formattedText, {
      hapticFeedback: true,
      showNotification: true,
      source: 'barcode-scan',
    });
  }

  /**
   * Copy product information
   */
  static async copyProductInfo(product: {
    name: string;
    barcode: string;
    price?: string;
    description?: string;
  }): Promise<boolean> {
    const lines = [
      `Product: ${product.name}`,
      `Barcode: ${product.barcode}`,
    ];

    if (product.price) {
      lines.push(`Price: ${product.price}`);
    }

    if (product.description) {
      lines.push(`Description: ${product.description}`);
    }

    const text = lines.join('\n');
    
    return this.copyToClipboard(text, {
      hapticFeedback: true,
      showNotification: true,
      source: 'product-info',
    });
  }

  /**
   * Copy scan history
   */
  static async copyScanHistory(scans: {
    barcode: string;
    timestamp: number;
    productName?: string;
  }[]): Promise<boolean> {
    const lines = ['Scan History:'];
    
    scans.forEach((scan, index) => {
      const date = new Date(scan.timestamp).toLocaleString();
      const name = scan.productName || 'Unknown Product';
      lines.push(`${index + 1}. ${scan.barcode} - ${name} (${date})`);
    });

    const text = lines.join('\n');
    
    return this.copyToClipboard(text, {
      hapticFeedback: true,
      showNotification: true,
      source: 'scan-history',
    });
  }

  /**
   * Copy QR code content
   */
  static async copyQRContent(
    content: string, 
    type = 'QR Code'
  ): Promise<boolean> {
    return this.copyToClipboard(content, {
      hapticFeedback: true,
      showNotification: true,
      source: 'qr-scan',
    });
  }

  /**
   * Copy debug information
   */
  static async copyDebugInfo(debugInfo: string): Promise<boolean> {
    return this.copyToClipboard(debugInfo, {
      hapticFeedback: true,
      showNotification: true,
      source: 'debug-info',
    });
  }

  /**
   * Paste barcode from clipboard (if valid)
   */
  static async pasteBarcode(): Promise<string | null> {
    try {
      const text = await this.getFromClipboard();
      if (!text) return null;

      // Basic barcode validation (numeric or alphanumeric)
      const barcodeRegex = /^[A-Z0-9]+$/i;
      const cleanText = text.trim();

      if (barcodeRegex.test(cleanText) && cleanText.length >= 8 && cleanText.length <= 20) {
        return cleanText;
      }

      // Try to extract barcode from formatted text
      const matches = text.match(/(?:barcode|code|ean|upc|isbn):\s*([A-Z0-9]+)/i);
      if (matches && matches[1]) {
        return matches[1];
      }

      return null;
    } catch (error) {
      console.error('Failed to paste barcode:', error);
      return null;
    }
  }

  /**
   * Copy with confirmation
   */
  static async copyWithConfirmation(
    text: string, 
    title = 'Copy to Clipboard'
  ): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        title,
        `Copy "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}" to clipboard?`,
        [
          {
            onPress: () => resolve(false),
            style: 'cancel',
            text: 'Cancel',
          },
          {
            onPress: async () => {
              const success = await this.copyToClipboard(text);
              resolve(success);
            },
            text: 'Copy',
          },
        ]
      );
    });
  }

  /**
   * Clear clipboard (security feature)
   */
  static async clearClipboard(): Promise<void> {
    try {
      await Clipboard.setStringAsync('');
      this.lastCopiedData = null;
      console.log('Clipboard cleared');
    } catch (error) {
      console.error('Failed to clear clipboard:', error);
    }
  }

  /**
   * Monitor clipboard for barcodes (iOS only)
   */
  static async monitorClipboardForBarcodes(
    callback: (barcode: string) => void
  ): Promise<() => void> {
    let isMonitoring = true;
    let lastCheckedText = '';

    const checkClipboard = async () => {
      if (!isMonitoring) return;

      try {
        const text = await this.getFromClipboard();
        if (text && text !== lastCheckedText) {
          lastCheckedText = text;
          
          // Check if it's a barcode
          const barcode = await this.pasteBarcode();
          if (barcode) {
            callback(barcode);
          }
        }
      } catch (error) {
        console.error('Clipboard monitoring error:', error);
      }

      // Check again after delay
      if (isMonitoring) {
        setTimeout(checkClipboard, 2000); // Check every 2 seconds
      }
    };

    // Start monitoring
    checkClipboard();

    // Return cleanup function
    return () => {
      isMonitoring = false;
    };
  }
}