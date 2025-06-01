import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { Platform } from 'react-native';

import { WebBrowserService } from './webBrowserService';

export interface DeepLinkData {
  path: string;
  queryParams: Record<string, string>;
  url: string;
}

export class LinkingService {
  // URL scheme configuration
  static readonly SCHEME = 'hedwig';
  static readonly HOSTNAME = 'app';

  // Define supported deep link routes
  static readonly ROUTES = {
    DASHBOARD: '/dashboard',
    HISTORY: '/history',
    HOME: '/',
    PRODUCT: '/product',
    SCAN_RESULT: '/scan-result',
    SCANNER: '/scanner',
    SEARCH: '/search',
  } as const;

  // Initialize deep linking
  static initialize(): void {
    // Listen for incoming links when app is already running
    const subscription = Linking.addEventListener('url', (event) => {
      this.handleIncomingLink(event.url);
    });

    // Handle initial link if app was opened via deep link
    this.handleInitialLink();

    // Return cleanup function
    return () => subscription?.remove();
  }

  // Handle link when app is opened from cold start
  static async handleInitialLink(): Promise<void> {
    try {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        this.handleIncomingLink(initialUrl);
      }
    } catch (error) {
      console.error('Error getting initial URL:', error);
    }
  }

  // Parse and handle incoming deep links
  static handleIncomingLink(url: string): void {
    try {
      const linkData = this.parseDeepLink(url);
      console.log('Handling deep link:', linkData);

      this.navigateToRoute(linkData);
    } catch (error) {
      console.error('Error handling deep link:', error);
    }
  }

  // Parse deep link URL into structured data
  static parseDeepLink(url: string): DeepLinkData {
    const parsed = Linking.parse(url);
    
    return {
      url,
      path: parsed.path || '/',
      queryParams: parsed.queryParams || {},
    };
  }

  // Navigate to appropriate route based on deep link
  static navigateToRoute(linkData: DeepLinkData): void {
    const { path, queryParams } = linkData;

    switch (path) {
      case this.ROUTES.HOME:
        router.push('/');
        break;

      case this.ROUTES.SCANNER:
        router.push('/scanner');
        break;

      case this.ROUTES.HISTORY:
        router.push('/history');
        break;

      case this.ROUTES.PRODUCT:
        if (queryParams.id) {
          router.push(`/product?id=${queryParams.id}`);
        } else {
          router.push('/pim');
        }
        break;

      case this.ROUTES.SCAN_RESULT:
        if (queryParams.barcode) {
          router.push(`/scan-result?barcode=${queryParams.barcode}`);
        } else {
          router.push('/scanner');
        }
        break;

      case this.ROUTES.DASHBOARD:
        router.push('/dashboard');
        break;

      case this.ROUTES.SEARCH:
        if (queryParams.q) {
          router.push(`/search?q=${queryParams.q}`);
        } else {
          router.push('/search');
        }
        break;

      default:
        console.warn(`Unknown deep link path: ${path}`);
        router.push('/');
    }
  }

  // Generate deep link URLs
  static createDeepLink(route: string, params?: Record<string, string>): string {
    const baseUrl = `${this.SCHEME}://${this.HOSTNAME}${route}`;
    
    if (params && Object.keys(params).length > 0) {
      const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
      return `${baseUrl}?${queryString}`;
    }
    
    return baseUrl;
  }

  // Convenience methods for creating specific deep links
  static createProductLink(productId: string): string {
    return this.createDeepLink(this.ROUTES.PRODUCT, { id: productId });
  }

  static createScanResultLink(barcode: string): string {
    return this.createDeepLink(this.ROUTES.SCAN_RESULT, { barcode });
  }

  static createSearchLink(query: string): string {
    return this.createDeepLink(this.ROUTES.SEARCH, { q: query });
  }

  // Share deep link via native sharing
  static async shareDeepLink(route: string, params?: Record<string, string>): Promise<void> {
    try {
      const url = this.createDeepLink(route, params);
      
      // Check if sharing is available
      if (await Linking.canOpenURL(url)) {
        await Linking.openURL(`mailto:?subject=Check this out&body=${encodeURIComponent(url)}`);
      }
    } catch (error) {
      console.error('Error sharing deep link:', error);
    }
  }

  // Open external URLs in in-app browser
  static async openExternalURL(url: string, useInAppBrowser = true): Promise<void> {
    try {
      if (useInAppBrowser && await WebBrowserService.isAvailable()) {
        // Use in-app browser for better UX
        await WebBrowserService.openExternalSite(url);
      } else {
        // Fallback to external browser
        const supported = await Linking.canOpenURL(url);
        
        if (supported) {
          await Linking.openURL(url);
        } else {
          console.warn(`Cannot open URL: ${url}`);
        }
      }
    } catch (error) {
      console.error('Error opening external URL:', error);
    }
  }

  // Common external links with in-app browser
  static async openWebsite(): Promise<void> {
    await WebBrowserService.openExternalSite('https://hedwig-app.com', 'Hedwig Website');
  }

  static async openSupport(): Promise<void> {
    // Email links should open externally
    await this.openExternalURL('mailto:support@hedwig-app.com', false);
  }

  static async openAppStore(): Promise<void> {
    // iOS only - no Android support
    const iosUrl = 'https://apps.apple.com/app/hedwig/id123456789';
    
    if (Platform.OS === 'ios') {
      await WebBrowserService.openAppStore(iosUrl);
    } else {
      console.warn('App Store link only available on iOS');
    }
  }

  // New methods for product/barcode related URLs
  static async openProductURL(productUrl: string, productName?: string): Promise<void> {
    try {
      console.log(`Opening product URL: ${productName || productUrl}`);
      await WebBrowserService.openProductInfo(productUrl);
    } catch (error) {
      console.error('Error opening product URL:', error);
      // Fallback to external browser
      await this.openExternalURL(productUrl, false);
    }
  }

  static async openBarcodeInfo(barcode: string, lookupUrl?: string): Promise<void> {
    try {
      const url = lookupUrl || `https://www.barcodelookup.com/${barcode}`;
      await WebBrowserService.openProductLookup(url, barcode);
    } catch (error) {
      console.error('Error opening barcode info:', error);
      // Fallback to external browser
      await this.openExternalURL(url, false);
    }
  }

  static async openQRCodeURL(qrUrl: string): Promise<void> {
    try {
      if (WebBrowserService.isValidUrl && !WebBrowserService.isValidUrl(qrUrl)) {
        console.warn('Invalid QR code URL:', qrUrl);
        return;
      }

      await WebBrowserService.openQRContent(qrUrl);
    } catch (error) {
      console.error('Error opening QR code URL:', error);
      // Fallback to external browser
      await this.openExternalURL(qrUrl, false);
    }
  }

  static async openHelpDocumentation(helpUrl?: string): Promise<void> {
    const url = helpUrl || 'https://hedwig-app.com/help';
    await WebBrowserService.openSupport(url);
  }

  static async openPrivacyPolicy(): Promise<void> {
    await WebBrowserService.openLegal('https://hedwig-app.com/privacy');
  }

  static async openTermsOfService(): Promise<void> {
    await WebBrowserService.openLegal('https://hedwig-app.com/terms');
  }
}