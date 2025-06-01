import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { type HistoryItem, type ScanResult } from '../../scanner/types/scanner';

import { FirebaseAnalyticsService } from '../../../services/firebase/analyticsService';

const STORAGE_KEY = 'hedwig_scan_history';

// Platform-specific storage implementation
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return AsyncStorage.getItem(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    return AsyncStorage.setItem(key, value);
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    return AsyncStorage.removeItem(key);
  },
};

export class ScanHistoryService {
  static async saveScan(scanResult: ScanResult): Promise<void> {
    try {
      // Save to local storage for offline access
      const existingHistory = await this.getHistory();
      const newHistory = [scanResult, ...existingHistory];

      // Keep only the last 1000 scans to prevent storage bloat
      const trimmedHistory = newHistory.slice(0, 1000);

      await storage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));

      // Also save to database if online (non-blocking)
      this.syncToDatabase(scanResult).catch(error => {
        console.error('Failed to sync scan to database:', error);
        FirebaseAnalyticsService.logEvent('scan_error', { error_type: 'scan_sync', error_message: (error as Error).message });
      });
    } catch (error) {
      console.error('Failed to save scan:', error);
      throw new Error('Failed to save scan to history');
    }
  }

  static async getHistory(): Promise<ScanResult[]> {
    try {
      const historyJson = await storage.getItem(STORAGE_KEY);
      if (!historyJson) return [];

      return JSON.parse(historyJson) as ScanResult[];
    } catch (error) {
      console.error('Failed to load scan history:', error);
      return [];
    }
  }

  static async getHistoryWithFormatting(): Promise<HistoryItem[]> {
    const history = await this.getHistory();
    return history.map((item) => ({
      ...item,
      formattedDate: new Date(item.timestamp).toLocaleString(),
    }));
  }

  static async deleteScan(scanId: string): Promise<void> {
    try {
      const history = await this.getHistory();
      const filteredHistory = history.filter((scan) => scan.id !== scanId);
      await storage.setItem(STORAGE_KEY, JSON.stringify(filteredHistory));
    } catch (error) {
      console.error('Failed to delete scan:', error);
      throw new Error('Failed to delete scan from history');
    }
  }

  static async clearHistory(): Promise<void> {
    try {
      await storage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear history:', error);
      throw new Error('Failed to clear scan history');
    }
  }

  static async searchHistory(query: string): Promise<HistoryItem[]> {
    const history = await this.getHistoryWithFormatting();
    const lowercaseQuery = query.toLowerCase();

    return history.filter(
      (item) =>
        item.data.toLowerCase().includes(lowercaseQuery) ||
        item.type.toLowerCase().includes(lowercaseQuery) ||
        (item.note && item.note.toLowerCase().includes(lowercaseQuery)),
    );
  }

  static generateScanId(): string {
    return `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sync scan to database (non-blocking)
   */
  private static async syncToDatabase(scanResult: ScanResult): Promise<void> {
    try {
      // Only sync if we have a product ID or need to create a scan history entry
      if (scanResult.type === 'barcode' && scanResult.data) {
        await fetch('/api/scan-history', {
          body: JSON.stringify({
            type: scanResult.barcodeType || 'UNKNOWN',
            barcode: scanResult.data,
            productId: scanResult.productData?.id,
          }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST'
        });
      }
    } catch (error) {
      // Don't throw - this is a non-blocking operation
      console.error('Database sync failed:', error);
    }
  }

  static formatBarcodeType(type: string): string {
    const typeMap: Record<string, string> = {
      aztec: 'Aztec',
      codabar: 'Codabar',
      code39: 'Code 39',
      code93: 'Code 93',
      code128: 'Code 128',
      ean8: 'EAN-8',
      ean13: 'EAN-13',
      itf: 'ITF',
      pdf417: 'PDF417',
      qr: 'QR Code',
      rss14: 'RSS-14',
      rssexpanded: 'RSS Expanded',
      upc_a: 'UPC-A',
      upc_e: 'UPC-E',
    };

    return typeMap[type.toLowerCase()] || type.toUpperCase();
  }
}
