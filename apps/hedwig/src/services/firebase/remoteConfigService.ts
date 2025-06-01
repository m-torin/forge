import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  activate,
  ensureInitialized,
  fetchAndActivate,
  fetchConfig,
  getBoolean,
  getNumber,
  getRemoteConfig,
  getString,
  getValue,
  type RemoteConfig,
  setLogLevel,
} from 'firebase/remote-config';
// React hooks
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { app } from '../../config/firebase';
import { SentryService } from '../sentryService';

// Remote config keys for Hedwig app
export interface HedwigRemoteConfig {
  enable_advanced_scanner: boolean;
  // Feature flags
  enable_ai_search: boolean;
  enable_barcode_history: boolean;
  enable_multi_scan: boolean;
  enable_nutrition_info: boolean;
  enable_offline_mode: boolean;
  enable_price_comparison: boolean;
  enable_product_sharing: boolean;
  
  // API configuration
  api_base_url: string;
  api_timeout_ms: number;
  cache_duration_hours: number;
  max_retry_attempts: number;
  
  scanner_auto_focus_interval_ms: number;
  // Scanner configuration
  scanner_confidence_threshold: number;
  scanner_max_resolution: string;
  scanner_torch_auto_enable: boolean;
  
  onboarding_version: number;
  show_onboarding: boolean;
  // UI configuration
  theme_primary_color: string;
  theme_secondary_color: string;
  
  image_upload_max_size_mb: number;
  max_history_items: number;
  max_offline_products: number;
  // Limits and quotas
  max_scans_per_day: number;
  
  feature_announcement: string;
  // Messages
  maintenance_message: string;
  update_available_message: string;
  
  // A/B testing
  experiment_group: string;
  show_new_ui: boolean;
  use_new_scanner_algorithm: boolean;
}

// Default values
const DEFAULT_CONFIG: HedwigRemoteConfig = {
  enable_advanced_scanner: false,
  // Feature flags
  enable_ai_search: true,
  enable_barcode_history: true,
  enable_multi_scan: false,
  enable_nutrition_info: true,
  enable_offline_mode: true,
  enable_price_comparison: false,
  enable_product_sharing: true,
  
  // API configuration
  api_base_url: 'https://api.hedwig.app',
  api_timeout_ms: 30000,
  cache_duration_hours: 24,
  max_retry_attempts: 3,
  
  // Scanner configuration
  scanner_confidence_threshold: 0.8,
  scanner_auto_focus_interval_ms: 2000,
  scanner_max_resolution: '1920x1080',
  scanner_torch_auto_enable: false,
  
  onboarding_version: 1,
  show_onboarding: true,
  // UI configuration
  theme_primary_color: '#1976d2',
  theme_secondary_color: '#dc004e',
  
  image_upload_max_size_mb: 10,
  max_history_items: 500,
  max_offline_products: 100,
  // Limits and quotas
  max_scans_per_day: 100,
  
  feature_announcement: '',
  // Messages
  maintenance_message: '',
  update_available_message: '',
  
  // A/B testing
  experiment_group: 'control',
  show_new_ui: false,
  use_new_scanner_algorithm: false,
};

export class FirebaseRemoteConfigService {
  private static remoteConfig: RemoteConfig | null = null;
  private static isInitialized = false;
  private static cachedConfig: Partial<HedwigRemoteConfig> = {};
  private static listeners = new Set<(config: HedwigRemoteConfig) => void>();

  /**
   * Initialize Remote Config
   */
  static async initialize(): Promise<void> {
    try {
      if (Platform.OS !== 'web') {
        console.log('Firebase Remote Config not available for React Native in web SDK');
        // Load cached config
        await this.loadCachedConfig();
        return;
      }

      this.remoteConfig = getRemoteConfig(app);
      
      // Set minimum fetch interval (in seconds)
      this.remoteConfig.settings.minimumFetchIntervalMillis = __DEV__ ? 0 : 3600000; // 1 hour in production
      
      // Set default config
      this.remoteConfig.defaultConfig = DEFAULT_CONFIG;
      
      // Enable debug mode in development
      if (__DEV__) {
        setLogLevel('debug');
      }
      
      // Ensure initialized
      await ensureInitialized(this.remoteConfig);
      
      // Fetch and activate
      await this.fetchAndActivate();
      
      this.isInitialized = true;
      console.log('Firebase Remote Config initialized');
    } catch (error) {
      SentryService.captureException(error as Error);
      console.error('Failed to initialize Remote Config:', error);
      // Fall back to defaults
      await this.loadCachedConfig();
    }
  }

  /**
   * Fetch and activate config
   */
  static async fetchAndActivate(): Promise<boolean> {
    if (!this.remoteConfig) return false;

    try {
      const activated = await fetchAndActivate(this.remoteConfig);
      
      if (activated) {
        // Update cached config
        await this.updateCachedConfig();
        // Notify listeners
        this.notifyListeners();
      }
      
      return activated;
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'remote-config-fetch');
      console.error('Failed to fetch remote config:', error);
      return false;
    }
  }

  /**
   * Get string value
   */
  static getString<K extends keyof HedwigRemoteConfig>(
    key: K
  ): HedwigRemoteConfig[K] extends string ? string : never {
    if (!this.remoteConfig) {
      return (this.cachedConfig[key] ?? DEFAULT_CONFIG[key]) as any;
    }

    try {
      const value = getString(this.remoteConfig, key as string);
      return value as any;
    } catch (error) {
      return DEFAULT_CONFIG[key] as any;
    }
  }

  /**
   * Get number value
   */
  static getNumber<K extends keyof HedwigRemoteConfig>(
    key: K
  ): HedwigRemoteConfig[K] extends number ? number : never {
    if (!this.remoteConfig) {
      return (this.cachedConfig[key] ?? DEFAULT_CONFIG[key]) as any;
    }

    try {
      const value = getNumber(this.remoteConfig, key as string);
      return value as any;
    } catch (error) {
      return DEFAULT_CONFIG[key] as any;
    }
  }

  /**
   * Get boolean value
   */
  static getBoolean<K extends keyof HedwigRemoteConfig>(
    key: K
  ): HedwigRemoteConfig[K] extends boolean ? boolean : never {
    if (!this.remoteConfig) {
      return (this.cachedConfig[key] ?? DEFAULT_CONFIG[key]) as any;
    }

    try {
      const value = getBoolean(this.remoteConfig, key as string);
      return value as any;
    } catch (error) {
      return DEFAULT_CONFIG[key] as any;
    }
  }

  /**
   * Get all config values
   */
  static getAllConfig(): HedwigRemoteConfig {
    if (!this.remoteConfig) {
      return { ...DEFAULT_CONFIG, ...this.cachedConfig };
    }

    const config: any = {};
    
    Object.keys(DEFAULT_CONFIG).forEach((key) => {
      const value = getValue(this.remoteConfig!, key);
      
      if (value.getSource() !== 'static') {
        // Parse value based on type
        const defaultValue = DEFAULT_CONFIG[key as keyof HedwigRemoteConfig];
        
        if (typeof defaultValue === 'boolean') {
          config[key] = value.asBoolean();
        } else if (typeof defaultValue === 'number') {
          config[key] = value.asNumber();
        } else {
          config[key] = value.asString();
        }
      } else {
        config[key] = defaultValue;
      }
    });

    return config as HedwigRemoteConfig;
  }

  /**
   * Add config change listener
   */
  static addListener(
    listener: (config: HedwigRemoteConfig) => void
  ): () => void {
    this.listeners.add(listener);
    
    // Call immediately with current config
    listener(this.getAllConfig());
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private static notifyListeners(): void {
    const config = this.getAllConfig();
    this.listeners.forEach(listener => listener(config));
  }

  /**
   * Update cached config
   */
  private static async updateCachedConfig(): Promise<void> {
    const config = this.getAllConfig();
    this.cachedConfig = config;
    
    try {
      await AsyncStorage.setItem('remoteConfig', JSON.stringify(config));
    } catch (error) {
      console.error('Failed to cache config:', error);
    }
  }

  /**
   * Load cached config
   */
  private static async loadCachedConfig(): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem('remoteConfig');
      if (cached) {
        this.cachedConfig = JSON.parse(cached);
      }
    } catch (error) {
      console.error('Failed to load cached config:', error);
    }
  }

  /**
   * Force refresh config
   */
  static async refresh(): Promise<boolean> {
    if (!this.remoteConfig) return false;

    try {
      // Fetch with cache bypass
      await fetchConfig(this.remoteConfig);
      const activated = await activate(this.remoteConfig);
      
      if (activated) {
        await this.updateCachedConfig();
        this.notifyListeners();
      }
      
      return activated;
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'remote-config-refresh');
      return false;
    }
  }

  // Convenience methods

  static isFeatureEnabled(feature: keyof HedwigRemoteConfig): boolean {
    const value = this.getAllConfig()[feature];
    return typeof value === 'boolean' ? value : false;
  }

  static getApiConfig() {
    const config = this.getAllConfig();
    return {
      baseUrl: config.api_base_url,
      cacheDuration: config.cache_duration_hours,
      maxRetries: config.max_retry_attempts,
      timeout: config.api_timeout_ms,
    };
  }

  static getScannerConfig() {
    const config = this.getAllConfig();
    return {
      confidenceThreshold: config.scanner_confidence_threshold,
      autoFocusInterval: config.scanner_auto_focus_interval_ms,
      maxResolution: config.scanner_max_resolution,
      torchAutoEnable: config.scanner_torch_auto_enable,
    };
  }

  static getThemeConfig() {
    const config = this.getAllConfig();
    return {
      primaryColor: config.theme_primary_color,
      secondaryColor: config.theme_secondary_color,
    };
  }

  static getLimits() {
    const config = this.getAllConfig();
    return {
      imageUploadMaxSizeMB: config.image_upload_max_size_mb,
      maxHistoryItems: config.max_history_items,
      maxOfflineProducts: config.max_offline_products,
      maxScansPerDay: config.max_scans_per_day,
    };
  }

  static getMessages() {
    const config = this.getAllConfig();
    return {
      featureAnnouncement: config.feature_announcement,
      maintenance: config.maintenance_message,
      updateAvailable: config.update_available_message,
    };
  }
}

export function useRemoteConfig<K extends keyof HedwigRemoteConfig>(
  key: K
): HedwigRemoteConfig[K] {
  const [value, setValue] = useState<HedwigRemoteConfig[K]>(
    DEFAULT_CONFIG[key]
  );

  useEffect(() => {
    // Get initial value
    const config = FirebaseRemoteConfigService.getAllConfig();
    setValue(config[key]);

    // Listen for changes
    const unsubscribe = FirebaseRemoteConfigService.addListener((newConfig) => {
      setValue(newConfig[key]);
    });

    return unsubscribe;
  }, [key]);

  return value;
}

export function useRemoteConfigAll(): HedwigRemoteConfig {
  const [config, setConfig] = useState<HedwigRemoteConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    // Get initial config
    setConfig(FirebaseRemoteConfigService.getAllConfig());

    // Listen for changes
    const unsubscribe = FirebaseRemoteConfigService.addListener(setConfig);

    return unsubscribe;
  }, []);

  return config;
}

export function useFeatureFlag(
  feature: keyof HedwigRemoteConfig
): boolean {
  return useRemoteConfig(feature) as boolean;
}