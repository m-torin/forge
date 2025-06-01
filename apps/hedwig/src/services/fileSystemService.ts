import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export interface ExportData {
  data: any;
  filename: string;
  format: 'json' | 'csv' | 'txt';
}

export interface FileInfo {
  exists: boolean;
  modificationTime: number;
  size: number;
  uri: string;
}

export class FileSystemService {
  // Directory paths
  static readonly DIRECTORIES = {
    CACHE: FileSystem.cacheDirectory,
    DOCUMENTS: FileSystem.documentDirectory,
    EXPORTS: `${FileSystem.documentDirectory}exports/`,
    LOGS: `${FileSystem.documentDirectory}logs/`,
    SCANS: `${FileSystem.documentDirectory}scans/`,
    TEMP: `${FileSystem.cacheDirectory}temp/`,
  } as const;

  /**
   * Ensure directory exists, create if not
   */
  static async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(dirPath);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
      }
    } catch (error) {
      console.error(`Error creating directory ${dirPath}:`, error);
      throw new Error(`Failed to create directory: ${dirPath}`);
    }
  }

  /**
   * Write data to file
   */
  static async writeFile(filePath: string, content: string): Promise<void> {
    try {
      // Ensure parent directory exists
      const parentDir = filePath.substring(0, filePath.lastIndexOf('/'));
      await this.ensureDirectoryExists(parentDir);

      await FileSystem.writeAsStringAsync(filePath, content);
    } catch (error) {
      console.error(`Error writing file ${filePath}:`, error);
      throw new Error(`Failed to write file: ${filePath}`);
    }
  }

  /**
   * Read file content
   */
  static async readFile(filePath: string): Promise<string | null> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (!fileInfo.exists) {
        return null;
      }

      return await FileSystem.readAsStringAsync(filePath);
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Delete file
   */
  static async deleteFile(filePath: string): Promise<boolean> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
      return false;
    }
  }

  /**
   * Get file information
   */
  static async getFileInfo(filePath: string): Promise<FileInfo> {
    try {
      const info = await FileSystem.getInfoAsync(filePath, { md5: false, size: true });
      return {
        exists: info.exists,
        modificationTime: info.modificationTime || 0,
        size: info.size || 0,
        uri: filePath,
      };
    } catch (error) {
      console.error(`Error getting file info ${filePath}:`, error);
      return {
        exists: false,
        modificationTime: 0,
        size: 0,
        uri: filePath,
      };
    }
  }

  /**
   * List files in directory
   */
  static async listFiles(dirPath: string): Promise<string[]> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(dirPath);
      if (!dirInfo.exists) {
        return [];
      }

      return await FileSystem.readDirectoryAsync(dirPath);
    } catch (error) {
      console.error(`Error listing files in ${dirPath}:`, error);
      return [];
    }
  }

  /**
   * Export scan history to file
   */
  static async exportScanHistory(scans: any[], format: 'json' | 'csv' = 'json'): Promise<string> {
    try {
      await this.ensureDirectoryExists(this.DIRECTORIES.EXPORTS);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `scan-history-${timestamp}.${format}`;
      const filePath = `${this.DIRECTORIES.EXPORTS}${filename}`;

      let content: string;

      if (format === 'json') {
        content = JSON.stringify(scans, null, 2);
      } else {
        // CSV format
        if (scans.length === 0) {
          content = 'No scan data available';
        } else {
          const headers = Object.keys(scans[0]).join(',');
          const rows = scans.map(scan => 
            Object.values(scan)
              .map(value => `"${String(value).replace(/"/g, '""')}"`)
              .join(',')
          );
          content = [headers, ...rows].join('\n');
        }
      }

      await this.writeFile(filePath, content);
      return filePath;
    } catch (error) {
      console.error('Error exporting scan history:', error);
      throw new Error('Failed to export scan history');
    }
  }

  /**
   * Save scan result with image (if available)
   */
  static async saveScanResult(scanData: {
    id: string;
    barcode: string;
    timestamp: number;
    productData?: any;
    imageUri?: string;
  }): Promise<string> {
    try {
      await this.ensureDirectoryExists(this.DIRECTORIES.SCANS);

      const filename = `scan-${scanData.id}.json`;
      const filePath = `${this.DIRECTORIES.SCANS}${filename}`;

      // If there's an image, copy it to scans directory
      if (scanData.imageUri) {
        const imageExtension = scanData.imageUri.split('.').pop() || 'jpg';
        const imagePath = `${this.DIRECTORIES.SCANS}scan-${scanData.id}.${imageExtension}`;
        
        try {
          await FileSystem.copyAsync({
            from: scanData.imageUri,
            to: imagePath,
          });
          scanData.imageUri = imagePath; // Update to local path
        } catch (imageError) {
          console.warn('Failed to save scan image:', imageError);
        }
      }

      const content = JSON.stringify(scanData, null, 2);
      await this.writeFile(filePath, content);
      
      return filePath;
    } catch (error) {
      console.error('Error saving scan result:', error);
      throw new Error('Failed to save scan result');
    }
  }

  /**
   * Load scan results from storage
   */
  static async loadScanResults(): Promise<any[]> {
    try {
      const files = await this.listFiles(this.DIRECTORIES.SCANS);
      const scanFiles = files.filter(file => file.endsWith('.json'));

      const scans = await Promise.all(
        scanFiles.map(async (file) => {
          const filePath = `${this.DIRECTORIES.SCANS}${file}`;
          const content = await this.readFile(filePath);
          return content ? JSON.parse(content) : null;
        })
      );

      return scans.filter(scan => scan !== null);
    } catch (error) {
      console.error('Error loading scan results:', error);
      return [];
    }
  }

  /**
   * Clean up old temporary files
   */
  static async cleanupTempFiles(olderThanHours = 24): Promise<void> {
    try {
      const tempDir = this.DIRECTORIES.TEMP;
      await this.ensureDirectoryExists(tempDir);

      const files = await this.listFiles(tempDir);
      const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);

      for (const file of files) {
        const filePath = `${tempDir}${file}`;
        const fileInfo = await this.getFileInfo(filePath);

        if (fileInfo.exists && fileInfo.modificationTime < cutoffTime) {
          await this.deleteFile(filePath);
        }
      }
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
  }

  /**
   * Get storage usage statistics
   */
  static async getStorageStats(): Promise<{
    totalSize: number;
    scansSize: number;
    exportsSize: number;
    logsSize: number;
    fileCount: number;
  }> {
    try {
      const directories = [
        this.DIRECTORIES.SCANS,
        this.DIRECTORIES.EXPORTS,
        this.DIRECTORIES.LOGS,
      ];

      let totalSize = 0;
      let scansSize = 0;
      let exportsSize = 0;
      let logsSize = 0;
      let fileCount = 0;

      for (const dir of directories) {
        try {
          const files = await this.listFiles(dir);
          fileCount += files.length;

          for (const file of files) {
            const filePath = `${dir}${file}`;
            const fileInfo = await this.getFileInfo(filePath);
            
            totalSize += fileInfo.size;
            
            if (dir === this.DIRECTORIES.SCANS) {
              scansSize += fileInfo.size;
            } else if (dir === this.DIRECTORIES.EXPORTS) {
              exportsSize += fileInfo.size;
            } else if (dir === this.DIRECTORIES.LOGS) {
              logsSize += fileInfo.size;
            }
          }
        } catch (dirError) {
          console.warn(`Error reading directory ${dir}:`, dirError);
        }
      }

      return {
        exportsSize,
        fileCount,
        logsSize,
        scansSize,
        totalSize,
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        exportsSize: 0,
        fileCount: 0,
        logsSize: 0,
        scansSize: 0,
        totalSize: 0,
      };
    }
  }

  /**
   * Create app log file
   */
  static async writeLog(level: 'info' | 'warn' | 'error', message: string, data?: any): Promise<void> {
    try {
      await this.ensureDirectoryExists(this.DIRECTORIES.LOGS);

      const timestamp = new Date().toISOString();
      const logEntry = {
        data,
        level,
        message,
        platform: Platform.OS,
        timestamp,
      };

      const dateStr = new Date().toISOString().split('T')[0];
      const logFile = `${this.DIRECTORIES.LOGS}app-${dateStr}.log`;

      const logLine = JSON.stringify(logEntry) + '\n';
      
      // Append to existing log file
      const existingContent = await this.readFile(logFile) || '';
      await this.writeFile(logFile, existingContent + logLine);
    } catch (error) {
      console.error('Error writing log:', error);
    }
  }
}