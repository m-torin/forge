import * as SystemUI from 'expo-system-ui';
import React, { useEffect } from 'react';

export class SystemUIService {
  private static originalBackgroundColor: string | null = null;

  /**
   * Set root view background color
   */
  static async setBackgroundColor(color: string): Promise<void> {
    try {
      if (this.originalBackgroundColor === null) {
        this.originalBackgroundColor = await this.getBackgroundColor();
      }
      await SystemUI.setBackgroundColorAsync(color);
      console.log(`Set background color to: ${color}`);
    } catch (error) {
      console.error('Failed to set background color:', error);
    }
  }

  /**
   * Get current background color
   */
  static async getBackgroundColor(): Promise<string | null> {
    try {
      const color = await SystemUI.getBackgroundColorAsync();
      return color;
    } catch (error) {
      console.error('Failed to get background color:', error);
      return null;
    }
  }

  /**
   * Reset to original background color
   */
  static async resetBackgroundColor(): Promise<void> {
    if (this.originalBackgroundColor) {
      await this.setBackgroundColor(this.originalBackgroundColor);
    }
  }

  /**
   * Set scanner UI mode (dark background)
   */
  static async setScannerMode(): Promise<void> {
    await this.setBackgroundColor('#000000');
  }

  /**
   * Set default UI mode
   */
  static async setDefaultMode(): Promise<void> {
    await this.setBackgroundColor('#ffffff');
  }

  /**
   * Set immersive mode colors
   */
  static async setImmersiveMode(color = '#000000'): Promise<void> {
    await this.setBackgroundColor(color);
  }

  /**
   * Apply brand colors to system UI
   */
  static async applyBrandColors(): Promise<void> {
    // Hedwig brand blue
    await this.setBackgroundColor('#1976d2');
  }

  /**
   * Set dark mode UI
   */
  static async setDarkMode(): Promise<void> {
    await this.setBackgroundColor('#121212');
  }

  /**
   * Set light mode UI
   */
  static async setLightMode(): Promise<void> {
    await this.setBackgroundColor('#ffffff');
  }

  /**
   * Flash background color (for feedback)
   */
  static async flashColor(
    color: string, 
    duration = 200
  ): Promise<void> {
    const originalColor = await this.getBackgroundColor();
    if (!originalColor) return;

    await this.setBackgroundColor(color);
    
    setTimeout(async () => {
      await this.setBackgroundColor(originalColor);
    }, duration);
  }

  /**
   * Success flash (green)
   */
  static async flashSuccess(): Promise<void> {
    await this.flashColor('#4caf50', 200);
  }

  /**
   * Error flash (red)
   */
  static async flashError(): Promise<void> {
    await this.flashColor('#f44336', 300);
  }

  /**
   * Warning flash (orange)
   */
  static async flashWarning(): Promise<void> {
    await this.flashColor('#ff9800', 250);
  }

  /**
   * Pulse effect
   */
  static async pulseEffect(
    color1: string,
    color2: string,
    times = 3,
    interval = 150
  ): Promise<void> {
    for (let i = 0; i < times; i++) {
      await this.setBackgroundColor(color1);
      await new Promise(resolve => setTimeout(resolve, interval));
      await this.setBackgroundColor(color2);
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }

  /**
   * Create gradient effect (simulated)
   */
  static async gradientTransition(
    fromColor: string,
    toColor: string,
    steps = 10,
    duration = 1000
  ): Promise<void> {
    // This is a simplified version - real gradient would need color interpolation
    const stepDuration = duration / steps;
    
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      // Simple interpolation (would need proper RGB interpolation in production)
      const color = ratio > 0.5 ? toColor : fromColor;
      await this.setBackgroundColor(color);
      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }
  }
}

// React hook for system UI

export function useSystemUIColor(color: string) {
  useEffect(() => {
    SystemUIService.setBackgroundColor(color);
    
    return () => {
      SystemUIService.resetBackgroundColor();
    };
  }, [color]);
}

// HOC for components with custom system UI
export function withSystemUI<P extends object>(
  Component: React.ComponentType<P>,
  color: string
): React.ComponentType<P> {
  return (props: P) => {
    useSystemUIColor(color);
    return <Component {...props} />;
  };
}

// Scanner-specific system UI hook
export function useScannerSystemUI() {
  useEffect(() => {
    SystemUIService.setScannerMode();
    
    return () => {
      SystemUIService.setDefaultMode();
    };
  }, []);
}