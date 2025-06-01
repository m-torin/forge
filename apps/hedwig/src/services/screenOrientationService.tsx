import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useState } from 'react';

export class ScreenOrientationService {
  private static lockedOrientation: ScreenOrientation.OrientationLock | null = null;

  /**
   * Lock orientation to portrait
   */
  static async lockPortrait(): Promise<void> {
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      this.lockedOrientation = ScreenOrientation.OrientationLock.PORTRAIT_UP;
      console.log('Locked to portrait orientation');
    } catch (error) {
      console.error('Failed to lock portrait orientation:', error);
    }
  }

  /**
   * Lock orientation to landscape
   */
  static async lockLandscape(): Promise<void> {
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      this.lockedOrientation = ScreenOrientation.OrientationLock.LANDSCAPE;
      console.log('Locked to landscape orientation');
    } catch (error) {
      console.error('Failed to lock landscape orientation:', error);
    }
  }

  /**
   * Lock to specific orientation
   */
  static async lockToOrientation(
    orientation: ScreenOrientation.OrientationLock
  ): Promise<void> {
    try {
      await ScreenOrientation.lockAsync(orientation);
      this.lockedOrientation = orientation;
      console.log(`Locked to orientation: ${orientation}`);
    } catch (error) {
      console.error('Failed to lock orientation:', error);
    }
  }

  /**
   * Unlock orientation (allow all)
   */
  static async unlock(): Promise<void> {
    try {
      await ScreenOrientation.unlockAsync();
      this.lockedOrientation = null;
      console.log('Unlocked orientation');
    } catch (error) {
      console.error('Failed to unlock orientation:', error);
    }
  }

  /**
   * Get current orientation
   */
  static async getCurrentOrientation(): Promise<ScreenOrientation.Orientation> {
    try {
      const orientation = await ScreenOrientation.getOrientationAsync();
      return orientation;
    } catch (error) {
      console.error('Failed to get orientation:', error);
      return ScreenOrientation.Orientation.UNKNOWN;
    }
  }

  /**
   * Check if portrait
   */
  static async isPortrait(): Promise<boolean> {
    const orientation = await this.getCurrentOrientation();
    return (
      orientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
      orientation === ScreenOrientation.Orientation.PORTRAIT_DOWN
    );
  }

  /**
   * Check if landscape
   */
  static async isLandscape(): Promise<boolean> {
    const orientation = await this.getCurrentOrientation();
    return (
      orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
      orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
    );
  }

  /**
   * Lock for scanner (portrait only)
   */
  static async lockForScanning(): Promise<void> {
    await this.lockPortrait();
  }

  /**
   * Unlock after scanning
   */
  static async unlockAfterScanning(): Promise<void> {
    await this.unlock();
  }

  /**
   * Add orientation change listener
   */
  static addOrientationListener(
    callback: (event: ScreenOrientation.OrientationChangeEvent) => void
  ): ScreenOrientation.Subscription {
    return ScreenOrientation.addOrientationChangeListener(callback);
  }

  /**
   * Remove orientation listener
   */
  static removeOrientationListener(subscription: ScreenOrientation.Subscription): void {
    subscription.remove();
  }

  /**
   * Get orientation as string
   */
  static getOrientationString(orientation: ScreenOrientation.Orientation): string {
    switch (orientation) {
      case ScreenOrientation.Orientation.PORTRAIT_UP:
        return 'Portrait Up';
      case ScreenOrientation.Orientation.PORTRAIT_DOWN:
        return 'Portrait Down';
      case ScreenOrientation.Orientation.LANDSCAPE_LEFT:
        return 'Landscape Left';
      case ScreenOrientation.Orientation.LANDSCAPE_RIGHT:
        return 'Landscape Right';
      default:
        return 'Unknown';
    }
  }

  /**
   * Supports auto-rotate
   */
  static async supportsAutoRotate(): Promise<boolean> {
    try {
      const platformInfo = await ScreenOrientation.getPlatformOrientationLockAsync();
      return platformInfo === ScreenOrientation.OrientationLock.ALL;
    } catch (error) {
      console.error('Failed to check auto-rotate support:', error);
      return false;
    }
  }
}

// Export orientation constants
export { Orientation, OrientationLock } from 'expo-screen-orientation';

// React hook for orientation

export function useScreenOrientation() {
  const [orientation, setOrientation] = useState<ScreenOrientation.Orientation>(
    ScreenOrientation.Orientation.UNKNOWN
  );

  useEffect(() => {
    // Get initial orientation
    ScreenOrientationService.getCurrentOrientation().then(setOrientation);

    // Listen for changes
    const subscription = ScreenOrientationService.addOrientationListener((event) => {
      setOrientation(event.orientationInfo.orientation);
    });

    return () => subscription.remove();
  }, []);

  return {
    isLandscape:
      orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
      orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT,
    isPortrait: 
      orientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
      orientation === ScreenOrientation.Orientation.PORTRAIT_DOWN,
    orientation,
  };
}

// HOC for orientation-aware components
export function withScreenOrientation<P extends object>(
  Component: React.ComponentType<P & { orientation: ReturnType<typeof useScreenOrientation> }>
): React.ComponentType<P> {
  return (props: P) => {
    const orientation = useScreenOrientation();
    return <Component {...props} orientation={orientation} />;
  };
}