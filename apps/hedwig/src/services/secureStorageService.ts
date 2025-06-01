import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export class SecureStorageService {
  // Keys for different types of data
  static readonly KEYS = {
    // Authentication
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_ID: 'user_id',
    
    ANALYTICS_KEY: 'analytics_key',
    // API Keys
    API_KEY: 'api_key',
    
    SCAN_SETTINGS: 'scan_settings',
    // User Preferences (encrypted)
    USER_PREFERENCES: 'user_preferences',
    
    // Biometric/Security
    BIOMETRIC_ENABLED: 'biometric_enabled',
    PIN_HASH: 'pin_hash',
    
    DEVICE_ID: 'device_id',
    // Session Data
    LAST_SYNC: 'last_sync',
  } as const;

  // Storage options for SecureStore
  private static readonly SECURE_OPTIONS = {
    keychainService: 'hedwig-keychain',
    requireAuthentication: false, // Set to true for biometric protection
    sharedPreferencesName: 'hedwig-prefs',
  };

  /**
   * Securely store sensitive data
   * Uses SecureStore on native platforms, falls back to AsyncStorage on web
   */
  static async setSecureItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Web fallback - in production, consider additional encryption
        await AsyncStorage.setItem(`secure_${key}`, value);
      } else {
        await SecureStore.setItemAsync(key, value, this.SECURE_OPTIONS);
      }
    } catch (error) {
      console.error(`Error storing secure item ${key}:`, error);
      throw new Error(`Failed to store secure data: ${key}`);
    }
  }

  /**
   * Retrieve securely stored data
   */
  static async getSecureItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(`secure_${key}`);
      } else {
        return await SecureStore.getItemAsync(key, this.SECURE_OPTIONS);
      }
    } catch (error) {
      console.error(`Error retrieving secure item ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove securely stored data
   */
  static async removeSecureItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem(`secure_${key}`);
      } else {
        await SecureStore.deleteItemAsync(key, this.SECURE_OPTIONS);
      }
    } catch (error) {
      console.error(`Error removing secure item ${key}:`, error);
    }
  }

  /**
   * Store JSON data securely
   */
  static async setSecureJSON(key: string, value: any): Promise<void> {
    const jsonString = JSON.stringify(value);
    await this.setSecureItem(key, jsonString);
  }

  /**
   * Retrieve JSON data securely
   */
  static async getSecureJSON<T = any>(key: string): Promise<T | null> {
    const jsonString = await this.getSecureItem(key);
    if (!jsonString) return null;

    try {
      return JSON.parse(jsonString) as T;
    } catch (error) {
      console.error(`Error parsing JSON for key ${key}:`, error);
      return null;
    }
  }

  // Convenience methods for common operations

  /**
   * Authentication tokens
   */
  static async setAuthTokens(accessToken: string, refreshToken?: string): Promise<void> {
    await this.setSecureItem(this.KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) {
      await this.setSecureItem(this.KEYS.REFRESH_TOKEN, refreshToken);
    }
  }

  static async getAccessToken(): Promise<string | null> {
    return await this.getSecureItem(this.KEYS.ACCESS_TOKEN);
  }

  static async getRefreshToken(): Promise<string | null> {
    return await this.getSecureItem(this.KEYS.REFRESH_TOKEN);
  }

  static async clearAuthTokens(): Promise<void> {
    await Promise.all([
      this.removeSecureItem(this.KEYS.ACCESS_TOKEN),
      this.removeSecureItem(this.KEYS.REFRESH_TOKEN),
      this.removeSecureItem(this.KEYS.USER_ID),
    ]);
  }

  /**
   * API Keys
   */
  static async setAPIKey(apiKey: string): Promise<void> {
    await this.setSecureItem(this.KEYS.API_KEY, apiKey);
  }

  static async getAPIKey(): Promise<string | null> {
    return await this.getSecureItem(this.KEYS.API_KEY);
  }

  /**
   * User preferences (encrypted storage)
   */
  static async setUserPreferences(preferences: Record<string, any>): Promise<void> {
    await this.setSecureJSON(this.KEYS.USER_PREFERENCES, preferences);
  }

  static async getUserPreferences(): Promise<Record<string, any> | null> {
    return await this.getSecureJSON(this.KEYS.USER_PREFERENCES);
  }

  /**
   * Scanner settings
   */
  static async setScanSettings(settings: {
    autoFocus?: boolean;
    soundEnabled?: boolean;
    vibrationEnabled?: boolean;
    saveHistory?: boolean;
  }): Promise<void> {
    await this.setSecureJSON(this.KEYS.SCAN_SETTINGS, settings);
  }

  static async getScanSettings(): Promise<{
    autoFocus: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    saveHistory: boolean;
  }> {
    const settings = await this.getSecureJSON(this.KEYS.SCAN_SETTINGS);
    
    // Default settings
    return {
      autoFocus: true,
      saveHistory: true,
      soundEnabled: true,
      vibrationEnabled: true,
      ...settings,
    };
  }

  /**
   * Device and session data
   */
  static async setDeviceId(deviceId: string): Promise<void> {
    await this.setSecureItem(this.KEYS.DEVICE_ID, deviceId);
  }

  static async getDeviceId(): Promise<string | null> {
    return await this.getSecureItem(this.KEYS.DEVICE_ID);
  }

  static async setLastSync(timestamp: number): Promise<void> {
    await this.setSecureItem(this.KEYS.LAST_SYNC, timestamp.toString());
  }

  static async getLastSync(): Promise<number | null> {
    const timestamp = await this.getSecureItem(this.KEYS.LAST_SYNC);
    return timestamp ? parseInt(timestamp, 10) : null;
  }

  /**
   * Security settings
   */
  static async setBiometricEnabled(enabled: boolean): Promise<void> {
    await this.setSecureItem(this.KEYS.BIOMETRIC_ENABLED, enabled.toString());
  }

  static async isBiometricEnabled(): Promise<boolean> {
    const enabled = await this.getSecureItem(this.KEYS.BIOMETRIC_ENABLED);
    return enabled === 'true';
  }

  /**
   * Clear all secure data (logout/reset)
   */
  static async clearAllSecureData(): Promise<void> {
    const keys = Object.values(this.KEYS);
    
    await Promise.all(
      keys.map(key => this.removeSecureItem(key))
    );
  }

  /**
   * Check if SecureStore is available
   */
  static async isSecureStoreAvailable(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') return false;
      
      // Test if SecureStore is working
      const testKey = 'test_availability';
      await SecureStore.setItemAsync(testKey, 'test');
      await SecureStore.deleteItemAsync(testKey);
      return true;
    } catch (error) {
      console.warn('SecureStore not available:', error);
      return false;
    }
  }
}