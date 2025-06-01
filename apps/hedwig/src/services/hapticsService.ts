import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type HapticFeedbackType = 
  | 'light'
  | 'medium' 
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'selection';

export class HapticsService {
  // Check if haptics are supported on the device
  static isSupported(): boolean {
    // Haptics are supported on iOS only (no Android support)
    return Platform.OS === 'ios';
  }

  /**
   * Provide light haptic feedback
   * Used for: UI interactions, button taps
   */
  static async light(): Promise<void> {
    try {
      if (!this.isSupported()) return;
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.warn('Light haptic feedback failed:', error);
    }
  }

  /**
   * Provide medium haptic feedback
   * Used for: Moderate interactions, swipes
   */
  static async medium(): Promise<void> {
    try {
      if (!this.isSupported()) return;
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.warn('Medium haptic feedback failed:', error);
    }
  }

  /**
   * Provide heavy haptic feedback
   * Used for: Important actions, confirmations
   */
  static async heavy(): Promise<void> {
    try {
      if (!this.isSupported()) return;
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.warn('Heavy haptic feedback failed:', error);
    }
  }

  /**
   * Provide success haptic feedback
   * Used for: Successful scan, completed actions
   */
  static async success(): Promise<void> {
    try {
      if (!this.isSupported()) return;
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.warn('Success haptic feedback failed:', error);
    }
  }

  /**
   * Provide warning haptic feedback
   * Used for: Warnings, non-critical errors
   */
  static async warning(): Promise<void> {
    try {
      if (!this.isSupported()) return;
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      console.warn('Warning haptic feedback failed:', error);
    }
  }

  /**
   * Provide error haptic feedback
   * Used for: Failed scans, critical errors
   */
  static async error(): Promise<void> {
    try {
      if (!this.isSupported()) return;
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.warn('Error haptic feedback failed:', error);
    }
  }

  /**
   * Provide selection haptic feedback
   * Used for: Picker selections, list item selections
   */
  static async selection(): Promise<void> {
    try {
      if (!this.isSupported()) return;
      await Haptics.selectionAsync();
    } catch (error) {
      console.warn('Selection haptic feedback failed:', error);
    }
  }

  /**
   * Generic haptic feedback based on type
   */
  static async trigger(type: HapticFeedbackType): Promise<void> {
    switch (type) {
      case 'light':
        await this.light();
        break;
      case 'medium':
        await this.medium();
        break;
      case 'heavy':
        await this.heavy();
        break;
      case 'success':
        await this.success();
        break;
      case 'warning':
        await this.warning();
        break;
      case 'error':
        await this.error();
        break;
      case 'selection':
        await this.selection();
        break;
      default:
        console.warn(`Unknown haptic feedback type: ${type}`);
    }
  }

  // Scanner-specific haptic feedback methods

  /**
   * Haptic feedback for successful barcode scan
   */
  static async scanSuccess(): Promise<void> {
    try {
      // Double success pattern for scan success
      await this.success();
      setTimeout(async () => {
        await this.light();
      }, 100);
    } catch (error) {
      console.warn('Scan success haptic failed:', error);
    }
  }

  /**
   * Haptic feedback for failed barcode scan
   */
  static async scanError(): Promise<void> {
    try {
      // Error followed by light vibration
      await this.error();
      setTimeout(async () => {
        await this.light();
      }, 150);
    } catch (error) {
      console.warn('Scan error haptic failed:', error);
    }
  }

  /**
   * Haptic feedback when scanner is focusing
   */
  static async scanFocus(): Promise<void> {
    await this.light();
  }

  /**
   * Haptic feedback for camera permission granted
   */
  static async permissionGranted(): Promise<void> {
    await this.success();
  }

  /**
   * Haptic feedback for camera permission denied
   */
  static async permissionDenied(): Promise<void> {
    await this.error();
  }

  /**
   * Haptic feedback for product found
   */
  static async productFound(): Promise<void> {
    try {
      // Triple light pattern for product found
      await this.light();
      setTimeout(async () => {
        await this.light();
      }, 80);
      setTimeout(async () => {
        await this.light();
      }, 160);
    } catch (error) {
      console.warn('Product found haptic failed:', error);
    }
  }

  /**
   * Haptic feedback for product not found
   */
  static async productNotFound(): Promise<void> {
    await this.warning();
  }

  /**
   * Haptic feedback for export/share actions
   */
  static async exportSuccess(): Promise<void> {
    await this.success();
  }

  /**
   * Haptic feedback for data sync
   */
  static async syncSuccess(): Promise<void> {
    try {
      // Light pattern for sync
      await this.light();
      setTimeout(async () => {
        await this.light();
      }, 100);
    } catch (error) {
      console.warn('Sync success haptic failed:', error);
    }
  }

  /**
   * Haptic feedback for app startup/ready
   */
  static async appReady(): Promise<void> {
    await this.medium();
  }

  /**
   * Haptic feedback for navigation
   */
  static async navigation(): Promise<void> {
    await this.selection();
  }

  /**
   * Haptic feedback for form submission
   */
  static async formSubmit(): Promise<void> {
    await this.medium();
  }

  /**
   * Haptic feedback for settings change
   */
  static async settingsChange(): Promise<void> {
    await this.light();
  }

  /**
   * Haptic feedback for pull-to-refresh
   */
  static async pullRefresh(): Promise<void> {
    await this.light();
  }

  /**
   * Haptic feedback for long press actions
   */
  static async longPress(): Promise<void> {
    await this.medium();
  }

  /**
   * Custom haptic pattern for app notifications
   */
  static async notificationReceived(): Promise<void> {
    try {
      // Custom pattern: medium-light-light
      await this.medium();
      setTimeout(async () => {
        await this.light();
      }, 100);
      setTimeout(async () => {
        await this.light();
      }, 200);
    } catch (error) {
      console.warn('Notification haptic failed:', error);
    }
  }

  /**
   * Haptic feedback for critical alerts
   */
  static async criticalAlert(): Promise<void> {
    try {
      // Strong pattern for critical alerts
      await this.heavy();
      setTimeout(async () => {
        await this.heavy();
      }, 200);
      setTimeout(async () => {
        await this.error();
      }, 400);
    } catch (error) {
      console.warn('Critical alert haptic failed:', error);
    }
  }

  /**
   * Test all haptic feedback types (for settings/demo)
   */
  static async testAllHaptics(): Promise<void> {
    const hapticTypes: HapticFeedbackType[] = [
      'light', 'medium', 'heavy', 'success', 'warning', 'error', 'selection'
    ];

    for (let i = 0; i < hapticTypes.length; i++) {
      setTimeout(async () => {
        console.log(`Testing haptic: ${hapticTypes[i]}`);
        await this.trigger(hapticTypes[i]);
      }, i * 500);
    }
  }
}