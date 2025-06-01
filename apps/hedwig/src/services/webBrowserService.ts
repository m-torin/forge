import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

export interface WebBrowserOptions {
  browserPackage?: string;
  controlsColor?: string;
  dismissButtonStyle?: 'done' | 'close' | 'cancel';
  enableBarCollapsing?: boolean;
  enableDefaultBackButton?: boolean;
  enableDefaultShare?: boolean;
  enableUrlBarHiding?: boolean;
  forceCloseOnRedirection?: boolean;
  hasBackgroundColor?: boolean;
  navigationBarColor?: string;
  preferredBarTintColor?: string;
  preferredControlTintColor?: string;
  readerMode?: boolean;
  secondaryToolbarColor?: string;
  showDefaultShareMenuItem?: boolean;
  showInRecents?: boolean;
  showTitle?: boolean;
  toolbarColor?: string;
}

export interface WebBrowserResult {
  type: 'cancel' | 'dismiss' | 'opened' | 'locked';
  url?: string;
}

export class WebBrowserService {
  // Default configuration for the in-app browser
  private static readonly DEFAULT_OPTIONS: WebBrowserOptions = {
    enableUrlBarHiding: true,
    controlsColor: '#1976d2',
    dismissButtonStyle: 'done',
    enableBarCollapsing: true,
    enableDefaultBackButton: true,
    enableDefaultShare: true,
    forceCloseOnRedirection: false,
    hasBackgroundColor: true,
    navigationBarColor: '#1976d2',
    preferredBarTintColor: '#ffffff',
    preferredControlTintColor: '#1976d2',
    readerMode: false,
    secondaryToolbarColor: '#ffffff',
    showDefaultShareMenuItem: true,
    showInRecents: true,
    showTitle: true,
    toolbarColor: '#1976d2',
  };

  /**
   * Check if WebBrowser is available on the platform
   */
  static async isAvailable(): Promise<boolean> {
    try {
      // Web browser is available on iOS and web, but not meaningful on web
      return Platform.OS === 'ios';
    } catch (error) {
      console.error('Error checking WebBrowser availability:', error);
      return false;
    }
  }

  /**
   * Open URL in in-app browser with custom options
   */
  static async openBrowser(
    url: string, 
    options?: Partial<WebBrowserOptions>
  ): Promise<WebBrowserResult> {
    try {
      if (!await this.isAvailable()) {
        console.warn('WebBrowser not available, falling back to external browser');
        // Fallback for platforms where in-app browser isn't available
        return { type: 'opened' };
      }

      // Validate URL
      if (!this.isValidUrl(url)) {
        throw new Error(`Invalid URL: ${url}`);
      }

      const mergedOptions = { ...this.DEFAULT_OPTIONS, ...options };

      const result = await WebBrowser.openBrowserAsync(url, mergedOptions);
      
      console.log('WebBrowser result:', result);
      return result;
    } catch (error) {
      console.error('Error opening in-app browser:', error);
      throw new Error(`Failed to open URL in browser: ${error}`);
    }
  }

  /**
   * Open URL with authentication flow support
   */
  static async openAuthSession(
    url: string,
    redirectUrl: string,
    options?: Partial<WebBrowserOptions>
  ): Promise<WebBrowserResult> {
    try {
      if (!await this.isAvailable()) {
        throw new Error('Auth session not available on this platform');
      }

      const mergedOptions = {
        ...this.DEFAULT_OPTIONS,
        ...options,
        forceCloseOnRedirection: true,
      };

      const result = await WebBrowser.openAuthSessionAsync(url, redirectUrl, mergedOptions);
      return result;
    } catch (error) {
      console.error('Error opening auth session:', error);
      throw new Error(`Failed to open auth session: ${error}`);
    }
  }

  /**
   * Warm up the browser for faster loading
   */
  static async warmUp(): Promise<void> {
    try {
      if (!await this.isAvailable()) return;
      
      await WebBrowser.warmUpAsync();
      console.log('WebBrowser warmed up');
    } catch (error) {
      console.warn('WebBrowser warm up failed:', error);
    }
  }

  /**
   * Cool down the browser to free resources
   */
  static async coolDown(): Promise<void> {
    try {
      if (!await this.isAvailable()) return;
      
      await WebBrowser.coolDownAsync();
      console.log('WebBrowser cooled down');
    } catch (error) {
      console.warn('WebBrowser cool down failed:', error);
    }
  }

  /**
   * Dismiss the currently open browser
   */
  static async dismiss(): Promise<void> {
    try {
      if (!await this.isAvailable()) return;
      
      await WebBrowser.dismissBrowser();
      console.log('WebBrowser dismissed');
    } catch (error) {
      console.warn('WebBrowser dismiss failed:', error);
    }
  }

  /**
   * Get browser packages available for custom browsers
   */
  static async getCustomTabsSupportingBrowsers(): Promise<string[]> {
    try {
      if (Platform.OS !== 'ios') return [];
      
      return await WebBrowser.getCustomTabsSupportingBrowsersAsync();
    } catch (error) {
      console.warn('Error getting custom tabs browsers:', error);
      return [];
    }
  }

  // Convenience methods for common use cases

  /**
   * Open product information URL
   */
  static async openProductInfo(productUrl: string): Promise<WebBrowserResult> {
    return this.openBrowser(productUrl, {
      controlsColor: '#2196f3',
      preferredBarTintColor: '#f5f5f5',
      readerMode: true, // Enable reader mode for product pages
      showTitle: true,
    });
  }

  /**
   * Open support/help documentation
   */
  static async openSupport(supportUrl: string): Promise<WebBrowserResult> {
    return this.openBrowser(supportUrl, {
      controlsColor: '#4caf50',
      dismissButtonStyle: 'done',
      enableDefaultShare: true,
      showTitle: true,
    });
  }

  /**
   * Open terms of service or privacy policy
   */
  static async openLegal(legalUrl: string): Promise<WebBrowserResult> {
    return this.openBrowser(legalUrl, {
      controlsColor: '#757575',
      dismissButtonStyle: 'done',
      enableDefaultShare: false,
      readerMode: true,
      showTitle: true,
    });
  }

  /**
   * Open external website with tracking
   */
  static async openExternalSite(
    url: string, 
    siteName?: string
  ): Promise<WebBrowserResult> {
    console.log(`Opening external site: ${siteName || url}`);
    
    return this.openBrowser(url, {
      enableUrlBarHiding: false, // Keep URL visible for external sites
      controlsColor: '#ff9800',
      enableDefaultShare: true,
      showTitle: true,
    });
  }

  /**
   * Open barcode/product lookup results
   */
  static async openProductLookup(
    lookupUrl: string, 
    barcode: string
  ): Promise<WebBrowserResult> {
    console.log(`Opening product lookup for barcode: ${barcode}`);
    
    return this.openBrowser(lookupUrl, {
      controlsColor: '#e91e63',
      enableDefaultShare: true,
      preferredBarTintColor: '#ffffff',
      readerMode: false,
      showTitle: true,
    });
  }

  /**
   * Open QR code content (if it's a URL)
   */
  static async openQRContent(qrUrl: string): Promise<WebBrowserResult> {
    console.log(`Opening QR code content: ${qrUrl}`);
    
    return this.openBrowser(qrUrl, {
      controlsColor: '#9c27b0',
      dismissButtonStyle: 'close',
      enableDefaultShare: true,
      showTitle: true,
    });
  }

  /**
   * Open app store page (for app recommendations)
   */
  static async openAppStore(appUrl: string): Promise<WebBrowserResult> {
    return this.openBrowser(appUrl, {
      controlsColor: '#007aff',
      dismissButtonStyle: 'done',
      enableDefaultShare: false,
      showTitle: false, // App Store handles its own title
    });
  }

  /**
   * Open social media sharing
   */
  static async openSocialShare(shareUrl: string): Promise<WebBrowserResult> {
    return this.openBrowser(shareUrl, {
      dismissButtonStyle: 'cancel',
      enableDefaultShare: false, // Sharing happens within the social platform
      forceCloseOnRedirection: true,
      showTitle: true,
    });
  }

  // Utility methods

  /**
   * Validate if string is a proper URL
   */
  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if URL is HTTPS (recommended for security)
   */
  static isSecureUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Extract domain from URL for display purposes
   */
  static getDomainFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  }

  /**
   * Create a URL with tracking parameters
   */
  static addTrackingParams(
    url: string, 
    source = 'hedwig-app',
    medium = 'mobile'
  ): string {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('utm_source', source);
      urlObj.searchParams.set('utm_medium', medium);
      urlObj.searchParams.set('utm_campaign', 'barcode-scan');
      return urlObj.toString();
    } catch {
      return url;
    }
  }
}