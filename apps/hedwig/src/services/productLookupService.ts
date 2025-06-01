import AsyncStorage from '@react-native-async-storage/async-storage';
// React hooks
import { useCallback, useEffect, useState } from 'react';

import { FirebaseAnalyticsService, FirebaseFirestoreService, FirebasePerformanceService, FirebaseRealtimeDbService, FirebaseStorageService } from './firebase';
import { SentryService } from './sentryService';

export interface Product {
  allergens?: string[];
  barcode: string;
  brand?: string;
  category?: string;
  description?: string;
  id: string;
  imageUrl?: string;
  ingredients?: string[];
  inStock?: boolean;
  lastUpdated: Date;
  name: string;
  nutritionInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
  price?: {
    amount: number;
    currency: string;
  };
  rating?: number;
  reviewCount?: number;
}

export class ProductLookupService {
  private static readonly CACHE_KEY_PREFIX = 'product_';
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Look up product by barcode
   */
  static async lookupProduct(barcode: string): Promise<Product | null> {
    return FirebasePerformanceService.traceProductLookup(
      async () => {
        try {
          // Check local cache first
          const cached = await this.getCachedProduct(barcode);
          if (cached) {
            FirebaseAnalyticsService.logProductViewed(
              cached.id,
              barcode,
              'search',
              cached.name
            );
            return cached;
          }

          // Check Firestore
          const firestoreProduct = await this.getProductFromFirestore(barcode);
          if (firestoreProduct) {
            await this.cacheProduct(firestoreProduct);
            FirebaseAnalyticsService.logProductViewed(
              firestoreProduct.id,
              barcode,
              'search',
              firestoreProduct.name
            );
            return firestoreProduct;
          }

          // Check Realtime Database
          const realtimeProduct = await this.getProductFromRealtimeDb(barcode);
          if (realtimeProduct) {
            await this.cacheProduct(realtimeProduct);
            FirebaseAnalyticsService.logProductViewed(
              realtimeProduct.id,
              barcode,
              'search',
              realtimeProduct.name
            );
            return realtimeProduct;
          }

          // Try external API
          const apiProduct = await this.getProductFromAPI(barcode);
          if (apiProduct) {
            // Save to Firebase for future use
            await this.saveProductToFirebase(apiProduct);
            await this.cacheProduct(apiProduct);
            FirebaseAnalyticsService.logProductViewed(
              apiProduct.id,
              barcode,
              'search',
              apiProduct.name
            );
            return apiProduct;
          }

          // Product not found
          FirebaseAnalyticsService.logProductNotFound(barcode, 'api');
          return null;
        } catch (error) {
          SentryService.trackProductLookupError(error as Error, barcode);
          throw error;
        }
      },
      { barcode }
    );
  }

  /**
   * Get product from Firestore
   */
  private static async getProductFromFirestore(barcode: string): Promise<Product | null> {
    try {
      const products = await FirebaseFirestoreService.queryDocuments<Product>(
        'products',
        {
          limit: 1,
          where: [{
            field: 'barcode',
            operator: '==',
            value: barcode,
          }],
        }
      );

      if (products.length > 0) {
        return {
          ...products[0],
          lastUpdated: new Date(products[0].lastUpdated),
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching from Firestore:', error);
      return null;
    }
  }

  /**
   * Get product from Realtime Database
   */
  private static async getProductFromRealtimeDb(barcode: string): Promise<Product | null> {
    try {
      const product = await FirebaseRealtimeDbService.read<Product>(
        `products/${barcode}`
      );

      if (product) {
        return {
          ...product,
          id: barcode,
          lastUpdated: new Date(product.lastUpdated),
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching from Realtime DB:', error);
      return null;
    }
  }

  /**
   * Get product from external API
   */
  private static async getProductFromAPI(barcode: string): Promise<Product | null> {
    try {
      // This is where you would call your external barcode API
      // For example: Open Food Facts, UPC Database, etc.
      
      // Placeholder implementation
      const response = await fetch(`https://api.example.com/products/${barcode}`);
      
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      return {
        id: data.id || barcode,
        name: data.product_name || 'Unknown Product',
        allergens: data.allergens,
        barcode,
        brand: data.brand,
        category: data.category,
        description: data.description,
        imageUrl: data.image_url,
        ingredients: data.ingredients,
        inStock: true,
        lastUpdated: new Date(),
        nutritionInfo: data.nutrition,
        price: data.price,
        rating: data.rating,
        reviewCount: data.review_count,
      };
    } catch (error) {
      console.error('Error fetching from API:', error);
      return null;
    }
  }

  /**
   * Save product to Firebase
   */
  private static async saveProductToFirebase(product: Product): Promise<void> {
    try {
      // Save to Firestore
      await FirebaseFirestoreService.setDocument(
        'products',
        product.id,
        {
          ...product,
          lastUpdated: FirebaseFirestoreService.serverTimestamp(),
        }
      );

      // Also save to Realtime Database for redundancy
      await FirebaseRealtimeDbService.write(
        `products/${product.barcode}`,
        {
          ...product,
          lastUpdated: FirebaseRealtimeDbService.getServerTimestamp(),
        }
      );
    } catch (error) {
      console.error('Error saving product to Firebase:', error);
    }
  }

  /**
   * Get cached product
   */
  private static async getCachedProduct(barcode: string): Promise<Product | null> {
    try {
      const cached = await AsyncStorage.getItem(`${this.CACHE_KEY_PREFIX}${barcode}`);
      if (!cached) return null;

      const product = JSON.parse(cached) as Product;
      
      // Check if cache is still valid
      const cacheAge = Date.now() - new Date(product.lastUpdated).getTime();
      if (cacheAge > this.CACHE_DURATION) {
        // Cache expired
        await AsyncStorage.removeItem(`${this.CACHE_KEY_PREFIX}${barcode}`);
        return null;
      }

      return product;
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  }

  /**
   * Cache product
   */
  private static async cacheProduct(product: Product): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `${this.CACHE_KEY_PREFIX}${product.barcode}`,
        JSON.stringify(product)
      );
    } catch (error) {
      console.error('Error caching product:', error);
    }
  }

  /**
   * Search products by name
   */
  static async searchProducts(query: string): Promise<Product[]> {
    try {
      const normalizedQuery = query.toLowerCase().trim();
      
      // Search in Firestore
      const products = await FirebaseFirestoreService.queryDocuments<Product>(
        'products',
        {
          limit: 20,
          where: [{
            field: 'name',
            operator: '>=',
            value: normalizedQuery,
          }, {
            field: 'name',
            operator: '<=',
            value: normalizedQuery + '\uf8ff',
          }],
        }
      );

      // Log search event
      FirebaseAnalyticsService.logSearch(query);

      return products.map(p => ({
        ...p,
        lastUpdated: new Date(p.lastUpdated),
      }));
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'product-search');
      throw error;
    }
  }

  /**
   * Get product recommendations
   */
  static async getRecommendations(productId: string): Promise<Product[]> {
    try {
      // Get product details
      const product = await FirebaseFirestoreService.getDocument<Product>(
        'products',
        productId
      );

      if (!product || !product.category) {
        return [];
      }

      // Get similar products from same category
      const recommendations = await FirebaseFirestoreService.queryDocuments<Product>(
        'products',
        {
          limit: 10,
          where: [{
            field: 'category',
            operator: '==',
            value: product.category,
          }],
        }
      );

      // Filter out the current product
      return recommendations
        .filter(p => p.id !== productId)
        .map(p => ({
          ...p,
          lastUpdated: new Date(p.lastUpdated),
        }));
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  /**
   * Submit product update
   */
  static async submitProductUpdate(
    productId: string,
    updates: Partial<Product>
  ): Promise<void> {
    try {
      await FirebaseFirestoreService.updateDocument(
        'products',
        productId,
        {
          ...updates,
          lastUpdated: FirebaseFirestoreService.serverTimestamp(),
        }
      );

      // Clear cache
      const product = await FirebaseFirestoreService.getDocument<Product>(
        'products',
        productId
      );
      if (product) {
        await AsyncStorage.removeItem(`${this.CACHE_KEY_PREFIX}${product.barcode}`);
      }
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'product-update');
      throw error;
    }
  }

  /**
   * Upload product image
   */
  static async uploadProductImage(
    productId: string,
    imageUri: string
  ): Promise<string> {
    try {
      const imagePath = `products/${productId}/image_${Date.now()}.jpg`;
      
      const downloadUrl = await FirebaseStorageService.uploadImage(
        imagePath,
        imageUri,
        {
          maxWidth: 800,
          compress: true,
          maxHeight: 800,
          quality: 0.8,
        }
      );

      // Update product with new image
      await this.submitProductUpdate(productId, {
        imageUrl: downloadUrl,
      });

      return downloadUrl;
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'product-image-upload');
      throw error;
    }
  }
}

export function useProduct(barcode: string | null) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!barcode) {
      setProduct(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await ProductLookupService.lookupProduct(barcode);
      setProduct(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [barcode]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return { error, loading, product, refetch: fetchProduct };
}

export function useProductSearch() {
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const products = await ProductLookupService.searchProducts(query);
      setResults(products);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { error, loading, results, search };
}