import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { usePathname } from 'expo-router';
// React hooks
import { useEffect, useState } from 'react';
import { Linking, Platform } from 'react-native';

import { SentryService } from '../sentryService';

import { FirebaseAnalyticsService } from './analyticsService';

export interface DynamicLinkParams {
  barcode?: string;
  productId?: string;
  promoCode?: string;
  referralCode?: string;
  type: 'product' | 'scan' | 'share' | 'invite' | 'promo';
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
}

export interface DynamicLinkData {
  android?: {
    packageName: string;
    fallbackUrl?: string;
    minimumVersion?: number;
  };
  domainUriPrefix: string;
  ios?: {
    bundleId: string;
    appStoreId?: string;
    fallbackUrl?: string;
    minimumVersion?: string;
  };
  link: string;
  socialMeta?: {
    title?: string;
    description?: string;
    imageUrl?: string;
  };
}

export class FirebaseDynamicLinksService {
  private static readonly DOMAIN_PREFIX = 'https://hedwig.page.link';
  private static readonly IOS_BUNDLE_ID = 'com.hedwig.app';
  private static readonly ANDROID_PACKAGE_NAME = 'com.hedwig.app';
  private static readonly APP_STORE_ID = 'YOUR_APP_STORE_ID';
  private static pendingLink: string | null = null;

  /**
   * Initialize Dynamic Links
   */
  static async initialize(): Promise<void> {
    try {
      // Handle initial URL (app was closed)
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        await this.handleDynamicLink(initialUrl);
      }

      // Listen for new URLs (app is open)
      Linking.addEventListener('url', this.handleUrlEvent);

      console.log('Dynamic Links initialized');
    } catch (error) {
      SentryService.captureException(error as Error);
      console.error('Failed to initialize Dynamic Links:', error);
    }
  }

  /**
   * Create dynamic link
   */
  static async createDynamicLink(
    params: DynamicLinkParams,
    options?: {
      shortLink?: boolean;
      socialMeta?: DynamicLinkData['socialMeta'];
    }
  ): Promise<string> {
    try {
      const deepLink = this.buildDeepLink(params);
      
      if (Platform.OS === 'web') {
        // For web, just return the deep link
        return deepLink;
      }

      // Build dynamic link parameters
      const dynamicLinkData: DynamicLinkData = {
        android: {
          fallbackUrl: 'https://play.google.com/store/apps/details?id=' + this.ANDROID_PACKAGE_NAME,
          packageName: this.ANDROID_PACKAGE_NAME,
        },
        domainUriPrefix: this.DOMAIN_PREFIX,
        ios: {
          appStoreId: this.APP_STORE_ID,
          bundleId: this.IOS_BUNDLE_ID,
          fallbackUrl: 'https://apps.apple.com/app/id' + this.APP_STORE_ID,
        },
        link: deepLink,
        socialMeta: options?.socialMeta,
      };

      // In a real implementation, you would call Firebase Dynamic Links API
      // For now, we'll create a simple URL
      const dynamicLink = this.buildManualDynamicLink(dynamicLinkData);

      // Log analytics
      FirebaseAnalyticsService.logEvent('feature_used', {
        feature_name: 'dynamic_link_created',
        feature_category: 'sharing',
      });

      return dynamicLink;
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'dynamic-links-create');
      throw error;
    }
  }

  /**
   * Build deep link URL
   */
  private static buildDeepLink(params: DynamicLinkParams): string {
    const baseUrl = 'hedwig://';
    const queryParams = new URLSearchParams();

    // Add type
    queryParams.append('type', params.type);

    // Add specific parameters
    if (params.productId) {
      queryParams.append('productId', params.productId);
    }
    if (params.barcode) {
      queryParams.append('barcode', params.barcode);
    }
    if (params.referralCode) {
      queryParams.append('referralCode', params.referralCode);
    }
    if (params.promoCode) {
      queryParams.append('promoCode', params.promoCode);
    }

    // Add UTM parameters
    if (params.utm) {
      if (params.utm.source) queryParams.append('utm_source', params.utm.source);
      if (params.utm.medium) queryParams.append('utm_medium', params.utm.medium);
      if (params.utm.campaign) queryParams.append('utm_campaign', params.utm.campaign);
    }

    return `${baseUrl}?${queryParams.toString()}`;
  }

  /**
   * Build manual dynamic link (without Firebase API)
   */
  private static buildManualDynamicLink(data: DynamicLinkData): string {
    const params = new URLSearchParams({
      apn: data.android?.packageName || this.ANDROID_PACKAGE_NAME,
      ibi: data.ios?.bundleId || this.IOS_BUNDLE_ID,
      isi: data.ios?.appStoreId || this.APP_STORE_ID,
      link: data.link,
    });

    if (data.ios?.fallbackUrl) {
      params.append('ifl', data.ios.fallbackUrl);
    }
    if (data.android?.fallbackUrl) {
      params.append('afl', data.android.fallbackUrl);
    }
    if (data.socialMeta?.title) {
      params.append('st', data.socialMeta.title);
    }
    if (data.socialMeta?.description) {
      params.append('sd', data.socialMeta.description);
    }
    if (data.socialMeta?.imageUrl) {
      params.append('si', data.socialMeta.imageUrl);
    }

    return `${this.DOMAIN_PREFIX}/?${params.toString()}`;
  }

  /**
   * Handle URL event
   */
  private static handleUrlEvent = ({ url }: { url: string }) => {
    this.handleDynamicLink(url);
  };

  /**
   * Handle dynamic link
   */
  static async handleDynamicLink(url: string): Promise<void> {
    try {
      console.log('Handling dynamic link:', url);

      // Parse the URL
      const params = this.parseDynamicLink(url);
      if (!params) return;

      // Store pending link if app is not ready
      if (!this.isAppReady()) {
        this.pendingLink = url;
        await AsyncStorage.setItem('pendingDynamicLink', url);
        return;
      }

      // Handle based on type
      switch (params.type) {
        case 'product':
          await this.handleProductLink(params);
          break;
        case 'scan':
          await this.handleScanLink(params);
          break;
        case 'share':
          await this.handleShareLink(params);
          break;
        case 'invite':
          await this.handleInviteLink(params);
          break;
        case 'promo':
          await this.handlePromoLink(params);
          break;
      }

      // Log analytics
      FirebaseAnalyticsService.logEvent('feature_used', {
        feature_name: 'dynamic_link_opened',
        feature_category: 'deeplink',
      });

      // Clear pending link
      this.pendingLink = null;
      await AsyncStorage.removeItem('pendingDynamicLink');
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'dynamic-links-handle');
      console.error('Failed to handle dynamic link:', error);
    }
  }

  /**
   * Parse dynamic link
   */
  private static parseDynamicLink(url: string): DynamicLinkParams | null {
    try {
      const parsed = Linking.parse(url);
      const queryParams = parsed.queryParams || {};

      if (!queryParams.type) {
        return null;
      }

      return {
        type: queryParams.type as DynamicLinkParams['type'],
        barcode: queryParams.barcode as string,
        productId: queryParams.productId as string,
        promoCode: queryParams.promoCode as string,
        referralCode: queryParams.referralCode as string,
        utm: {
          campaign: queryParams.utm_campaign as string,
          medium: queryParams.utm_medium as string,
          source: queryParams.utm_source as string,
        },
      };
    } catch (error) {
      console.error('Failed to parse dynamic link:', error);
      return null;
    }
  }

  /**
   * Check if app is ready
   */
  private static isAppReady(): boolean {
    // You would implement your app readiness check here
    // For example, check if navigation is ready, user is loaded, etc.
    return true;
  }

  /**
   * Handle product link
   */
  private static async handleProductLink(params: DynamicLinkParams): Promise<void> {
    if (!params.productId && !params.barcode) return;

    // Navigate to product page
    // You would implement navigation here
    console.log('Navigate to product:', params.productId || params.barcode);
  }

  /**
   * Handle scan link
   */
  private static async handleScanLink(params: DynamicLinkParams): Promise<void> {
    if (!params.barcode) return;

    // Open scanner with pre-filled barcode
    // You would implement navigation here
    console.log('Open scanner with barcode:', params.barcode);
  }

  /**
   * Handle share link
   */
  private static async handleShareLink(params: DynamicLinkParams): Promise<void> {
    // Handle shared content
    console.log('Handle share link:', params);
  }

  /**
   * Handle invite link
   */
  private static async handleInviteLink(params: DynamicLinkParams): Promise<void> {
    if (!params.referralCode) return;

    // Store referral code
    await AsyncStorage.setItem('referralCode', params.referralCode);
    
    // Apply referral benefits
    console.log('Apply referral code:', params.referralCode);
  }

  /**
   * Handle promo link
   */
  private static async handlePromoLink(params: DynamicLinkParams): Promise<void> {
    if (!params.promoCode) return;

    // Store promo code
    await AsyncStorage.setItem('promoCode', params.promoCode);
    
    // Apply promo
    console.log('Apply promo code:', params.promoCode);
  }

  /**
   * Get pending dynamic link
   */
  static async getPendingDynamicLink(): Promise<string | null> {
    if (this.pendingLink) {
      return this.pendingLink;
    }

    const stored = await AsyncStorage.getItem('pendingDynamicLink');
    return stored;
  }

  /**
   * Create product share link
   */
  static async createProductShareLink(
    productId: string,
    productName: string,
    imageUrl?: string
  ): Promise<string> {
    return this.createDynamicLink(
      {
        type: 'product',
        productId,
      },
      {
        shortLink: true,
        socialMeta: {
          description: 'Scan barcodes and discover product information instantly',
          imageUrl,
          title: `Check out ${productName} on Hedwig`,
        },
      }
    );
  }

  /**
   * Create referral link
   */
  static async createReferralLink(referralCode: string): Promise<string> {
    return this.createDynamicLink(
      {
        type: 'invite',
        referralCode,
      },
      {
        shortLink: true,
        socialMeta: {
          description: 'Get instant product information by scanning barcodes',
          title: 'Join me on Hedwig!',
        },
      }
    );
  }

  /**
   * Cleanup
   */
  static cleanup(): void {
    Linking.removeAllListeners('url');
  }
}

export function useDynamicLinks(
  onLinkReceived?: (params: DynamicLinkParams) => void
) {
  const [pendingLink, setPendingLink] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Check for pending links when app becomes ready
    FirebaseDynamicLinksService.getPendingDynamicLink().then((link) => {
      if (link) {
        setPendingLink(link);
        FirebaseDynamicLinksService.handleDynamicLink(link);
      }
    });

    // Set up listener
    const subscription = Linking.addEventListener('url', ({ url }) => {
      const params = FirebaseDynamicLinksService['parseDynamicLink'](url);
      if (params && onLinkReceived) {
        onLinkReceived(params);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [onLinkReceived]);

  const createShareLink = async (
    type: DynamicLinkParams['type'],
    data: Omit<DynamicLinkParams, 'type'>
  ): Promise<string> => {
    return FirebaseDynamicLinksService.createDynamicLink({
      type,
      ...data,
    });
  };

  return {
    createShareLink,
    pendingLink,
  };
}