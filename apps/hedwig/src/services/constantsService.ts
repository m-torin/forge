import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export interface AppInfo {
  buildVersion: string;
  bundleIdentifier: string;
  expoVersion: string;
  name: string;
  projectId?: string;
  releaseChannel?: string;
  sdkVersion: string;
  slug: string;
  version: string;
}

export interface DeviceInfo {
  brand: string | null;
  deviceType: number | null;
  deviceYearClass: number | null;
  isDevice: boolean;
  manufacturer: string | null;
  modelId: string | null;
  modelName: string | null;
  osName: string | null;
  osVersion: string | null;
  totalMemory: number | null;
}

export interface SystemInfo {
  appOwnership: string | null;
  executionEnvironment: string;
  isRunningInExpoGo: boolean;
  platform: string;
  statusBarHeight: number;
}

export class ConstantsService {
  /**
   * Get comprehensive app information
   */
  static getAppInfo(): AppInfo {
    const manifest = Constants.expoConfig || Constants.manifest2?.extra?.expoClient?.extra || {};
    
    return {
      name: manifest.name || 'Hedwig',
      buildVersion: Constants.nativeAppVersion || '1',
      bundleIdentifier: manifest.ios?.bundleIdentifier || 'com.hedwig.app',
      expoVersion: Constants.expoVersion || 'Unknown',
      projectId: manifest.extra?.eas?.projectId || manifest.projectId,
      releaseChannel: manifest.releaseChannel,
      sdkVersion: manifest.sdkVersion || Constants.sdkVersion || 'Unknown',
      slug: manifest.slug || 'hedwig',
      version: manifest.version || '1.0.0',
    };
  }

  /**
   * Get device information
   */
  static getDeviceInfo(): DeviceInfo {
    return {
      brand: Device.brand,
      deviceType: Device.deviceType,
      deviceYearClass: Device.deviceYearClass,
      isDevice: Device.isDevice,
      manufacturer: Device.manufacturer,
      modelId: Device.modelId,
      modelName: Device.modelName,
      osName: Device.osName,
      osVersion: Device.osVersion,
      totalMemory: Device.totalMemory,
    };
  }

  /**
   * Get system information
   */
  static getSystemInfo(): SystemInfo {
    return {
      appOwnership: Constants.appOwnership,
      executionEnvironment: Constants.executionEnvironment,
      isRunningInExpoGo: Constants.appOwnership === 'expo',
      platform: Platform.OS,
      statusBarHeight: Constants.statusBarHeight,
    };
  }

  /**
   * Get all app metadata
   */
  static getAllMetadata(): {
    app: AppInfo;
    device: DeviceInfo;
    system: SystemInfo;
  } {
    return {
      app: this.getAppInfo(),
      device: this.getDeviceInfo(),
      system: this.getSystemInfo(),
    };
  }

  /**
   * Get debug information for troubleshooting
   */
  static getDebugInfo(): string {
    const metadata = this.getAllMetadata();
    
    return `
=== Hedwig Debug Information ===

APP INFO:
- Name: ${metadata.app.name}
- Version: ${metadata.app.version} (${metadata.app.buildVersion})
- Bundle ID: ${metadata.app.bundleIdentifier}
- Expo SDK: ${metadata.app.sdkVersion}
- Project ID: ${metadata.app.projectId || 'Not set'}

DEVICE INFO:
- Model: ${metadata.device.modelName} (${metadata.device.brand})
- OS: ${metadata.device.osName} ${metadata.device.osVersion}
- Memory: ${metadata.device.totalMemory ? `${(metadata.device.totalMemory / 1024 / 1024 / 1024).toFixed(2)} GB` : 'Unknown'}
- Year Class: ${metadata.device.deviceYearClass || 'Unknown'}
- Is Physical Device: ${metadata.device.isDevice}

SYSTEM INFO:
- Platform: ${metadata.system.platform}
- Status Bar Height: ${metadata.system.statusBarHeight}px
- Running in Expo Go: ${metadata.system.isRunningInExpoGo}
- Execution Environment: ${metadata.system.executionEnvironment}

Generated: ${new Date().toISOString()}
=================================
    `.trim();
  }

  /**
   * Get user agent string for API requests
   */
  static getUserAgent(): string {
    const app = this.getAppInfo();
    const device = this.getDeviceInfo();
    
    return `Hedwig/${app.version} (${device.osName} ${device.osVersion}; ${device.modelName})`;
  }

  /**
   * Check if running in development
   */
  static isDevelopment(): boolean {
    return __DEV__ || Constants.appOwnership === 'expo';
  }

  /**
   * Check if running in production
   */
  static isProduction(): boolean {
    return !this.isDevelopment() && Constants.appOwnership === 'standalone';
  }

  /**
   * Get API base URL based on environment
   */
  static getApiUrl(): string {
    const extra = Constants.expoConfig?.extra || {};
    
    if (this.isDevelopment()) {
      return extra.apiUrl || 'http://localhost:3400';
    }
    
    return extra.apiUrl || 'https://api.hedwig-app.com';
  }

  /**
   * Get environment-specific configuration
   */
  static getConfig<T extends Record<string, any>>(): T {
    const extra = Constants.expoConfig?.extra || {};
    return extra as T;
  }

  /**
   * Check if specific feature is enabled
   */
  static isFeatureEnabled(featureName: string): boolean {
    const features = Constants.expoConfig?.extra?.features || {};
    return features[featureName] === true;
  }

  /**
   * Get analytics metadata
   */
  static getAnalyticsMetadata(): Record<string, any> {
    const app = this.getAppInfo();
    const device = this.getDeviceInfo();
    const system = this.getSystemInfo();
    
    return {
      app_name: app.name,
      os_name: device.osName,
      app_build: app.buildVersion,
      app_version: app.version,
      device_brand: device.brand,
      device_model: device.modelName,
      environment: this.isDevelopment() ? 'development' : 'production',
      is_expo_go: system.isRunningInExpoGo,
      os_version: device.osVersion,
      platform: system.platform,
    };
  }

  /**
   * Log system information (for debugging)
   */
  static logSystemInfo(): void {
    if (!this.isDevelopment()) return;
    
    console.log('=== Hedwig System Information ===');
    console.log('App:', this.getAppInfo());
    console.log('Device:', this.getDeviceInfo());
    console.log('System:', this.getSystemInfo());
    console.log('API URL:', this.getApiUrl());
    console.log('================================');
  }
}