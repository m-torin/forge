"use server";

import { env } from "@/env";

// Import centralized database actions
import {
  getProducts as getProductsAction,
  getProductByHandle as getProductByHandleAction,
  searchProducts,
  getCollections as getCollectionsAction,
  getCollectionByHandle as getCollectionByHandleAction,
  getBrands as getBrandsAction,
  getBrandByHandle as getBrandByHandleAction,
} from "@repo/database/prisma/actions";
import {
  getBlogPosts as getHardcodedBlogPosts,
  getBlogPostsByHandle as getHardcodedBlogPostsByHandle,
  getCart as getHardcodedCart,
  getCollectionByHandle as getHardcodedCollectionByHandle,
  getCollections as getHardcodedCollections,
  getGroupCollections as getHardcodedGroupCollections,
  getOrder as getHardcodedOrder,
  getOrders as getHardcodedOrders,
  getProductByHandle as getHardcodedProductByHandle,
  getProductDetailByHandle as getHardcodedProductDetailByHandle,
  getProductReviews as getHardcodedProductReviews,
  getProducts as getHardcodedProducts,
  type TBlogPost,
  type TCardProduct,
  type TCollection,
  type TProductItem,
  type TReview,
} from "@/data/hardcoded-data";
import {
  getCurrencies as getHardcodedCurrencies,
  getHeaderDropdownCategories as getHardcodedHeaderDropdownCategories,
  getLanguages as getHardcodedLanguages,
  getNavigation as getHardcodedNavigation,
  getNavMegaMenu as getHardcodedNavMegaMenu,
  type TNavigationItem,
} from "@/data/navigation";

// Define brand type based on database schema
export interface TBrand {
  description?: string;
  id: string;
  name: string;
  productCount?: number;
  slug: string;
}

// Define cart type based on hardcoded data structure
export interface TCart {
  id: string;
  cost: {
    discount: number;
    shipping: number;
    subtotal: number;
    tax: number;
    total: number;
  };
  createdAt: string;
  lines: TCardProduct[];
  note?: string;
  totalQuantity: number;
}

// Re-export types for convenience
export type {
  TBlogPost,
  TCardProduct,
  TCollection,
  TNavigationItem,
  TProductItem,
  TReview,
};

// Demo mode flag - when true, skip database and use hardcoded data
const isDemoMode = env.DEMO_MODE;

/**
 * Fetches products from database with fallback to hardcoded data
 */
export async function getProducts(): Promise<TProductItem[]> {
  // If demo mode is enabled, skip database and use hardcoded data
  if (isDemoMode) {
    console.log("Demo mode enabled - using hardcoded products");
    return getHardcodedProducts();
  }

  try {
    // Use centralized action to fetch products
    const result = await getProductsAction({ limit: 100 });
    
    if (!result.success || !result.data) {
      console.log("Failed to fetch products from database");
      return getHardcodedProducts();
    }

    // Transform database products to the expected format
    return result.data.map((product) => ({
      id: product.id,
      createdAt: product.createdAt.toISOString(),
      featuredImage: product.media?.[0]
        ? {
            width: product.media[0]?.width || 400,
            alt: product.media[0]?.altText || product.name,
            height: product.media[0]?.height || 400,
            src: product.media[0]?.url || '',
          }
        : undefined,
      handle: product.slug || product.id, // Use slug if available, fallback to id
      images:
        product.media?.map((img) => ({
          width: img.width || 400,
          alt: img.altText || product.name,
          height: img.height || 400,
          src: img.url,
        })) || [],
      options: [],
      price: product.price ? Number(product.price) : 0,
      rating: 4.5, // Default rating
      reviewNumber: 0, // Default reviews
      salePrice: undefined, // No salePrice in schema
      selectedOptions: [],
      status: (product.status as any) || "In Stock",
      title: product.name,
      vendor: product.brand || "Default Vendor",
    }));
  } catch (error) {
    console.error("Database query failed:", error);
    
    // Only fall back to hardcoded data if there's a connection error
    // Don't fallback for empty results - that's a valid state
    if (error instanceof Error && (
      error.message.includes('connect') || 
      error.message.includes('timeout') ||
      error.message.includes('ECONNREFUSED')
    )) {
      console.log("Database connection failed, using hardcoded data as fallback");
      return getHardcodedProducts();
    }
    
    // For other errors, return empty array to show zero state
    console.log("Database query failed but connection OK, returning empty array");
    return [];
  }
}

/**
 * Fetches collections from database with fallback to hardcoded data
 */
export async function getCollections(): Promise<TCollection[]> {
  // If demo mode is enabled, skip database and use hardcoded data
  if (isDemoMode) {
    console.log("Demo mode enabled - using hardcoded collections");
    return getHardcodedCollections();
  }

  try {
    // Use centralized action to fetch collections
    const result = await getCollectionsAction({ limit: 50 });
    
    if (!result.success || !result.data) {
      console.log("Failed to fetch collections from database");
      return getHardcodedCollections();
    }

    // Transform database collections to the expected format
    return result.data.map((collection, index) => ({
      id: collection.id,
      count: collection._count?.products || 0,
      description: ((collection.copy as any)?.description || "") as string,
      handle: collection.slug || collection.id || `collection-${index}`,
      image: collection.media?.[0]?.url || undefined,
      title: collection.name,
    }));
  } catch (error) {
    console.error("Database query failed:", error);
    
    // Only fall back to hardcoded data if there's a connection error
    if (error instanceof Error && (
      error.message.includes('connect') || 
      error.message.includes('timeout') ||
      error.message.includes('ECONNREFUSED')
    )) {
      console.log("Database connection failed, using hardcoded data as fallback");
      return getHardcodedCollections();
    }
    
    // For other errors, return empty array to show zero state
    console.log("Database query failed but connection OK, returning empty array");
    return [];
  }
}

/**
 * Fetches group collections from database with fallback to hardcoded data
 */
export async function getGroupCollections() {
  // Group collections are always hardcoded for now
  return getHardcodedGroupCollections();
}

/**
 * Fetches brands from database with fallback to hardcoded data
 */
export async function getBrands(): Promise<TBrand[]> {
  // If demo mode is enabled, return hardcoded brands
  if (isDemoMode) {
    console.log("Demo mode enabled - using hardcoded brands");
    return [
      {
        id: "1",
        name: "Nike",
        description: "Just Do It",
        productCount: 1250,
        slug: "nike",
      },
      {
        id: "2", 
        name: "Adidas",
        description: "Impossible is Nothing",
        productCount: 980,
        slug: "adidas",
      },
      {
        id: "3",
        name: "Puma", 
        description: "Forever Faster",
        productCount: 650,
        slug: "puma",
      },
    ];
  }

  try {
    // Use centralized action to fetch brands
    const result = await getBrandsAction({ limit: 50 });
    
    if (!result.success || !result.data) {
      console.log("Failed to fetch brands from database");
      return [];
    }

    // Transform database brands to the expected format
    return result.data.map((brand) => ({
      id: brand.id,
      name: brand.name,
      description: ((brand.copy as any)?.description || undefined) as string | undefined,
      productCount: brand._count?.products || 0,
      slug: brand.slug || brand.id,
    }));
  } catch (error) {
    console.error("Database query failed:", error);
    
    // Only fall back to hardcoded data if there's a connection error
    if (error instanceof Error && (
      error.message.includes('connect') || 
      error.message.includes('timeout') ||
      error.message.includes('ECONNREFUSED')
    )) {
      console.log("Database connection failed, using hardcoded data as fallback");
      return [
        {
          id: "1",
          name: "Nike",
          description: "Just Do It",
          productCount: 1250,
          slug: "nike",
        },
        {
          id: "2", 
          name: "Adidas",
          description: "Impossible is Nothing",
          productCount: 980,
          slug: "adidas",
        },
        {
          id: "3",
          name: "Puma", 
          description: "Forever Faster",
          productCount: 650,
          slug: "puma",
        },
      ];
    }
    
    // For other errors, return empty array to show zero state
    console.log("Database query failed but connection OK, returning empty array");
    return [];
  }
}

/**
 * Fetches a single brand by slug from database with fallback to hardcoded data
 */
export async function getBrandBySlug(slug: string): Promise<TBrand | undefined> {
  // If demo mode is enabled, use hardcoded brands
  if (isDemoMode) {
    console.log("Demo mode enabled - using hardcoded brand");
    const brands = {
      adidas: {
        id: "2", 
        name: "Adidas",
        description: "Impossible is Nothing",
        productCount: 980,
        slug: "adidas",
      },
      nike: {
        id: "1",
        name: "Nike",
        description: "Just Do It",
        productCount: 1250,
        slug: "nike",
      },
      puma: {
        id: "3",
        name: "Puma", 
        description: "Forever Faster",
        productCount: 650,
        slug: "puma",
      },
    };
    return brands[slug as keyof typeof brands];
  }

  try {
    // Use centralized action to fetch brand
    const result = await getBrandByHandleAction(slug);
    
    if (!result.success || !result.data) {
      console.log("Brand not found in database");
      return undefined;
    }

    // Transform and return
    return {
      id: result.data.id,
      name: result.data.name,
      description: ((result.data.copy as any)?.description || undefined) as string | undefined,
      productCount: result.data._count?.products || 0,
      slug: result.data.slug || result.data.id,
    };
  } catch (error) {
    console.error("Database query failed:", error);
    
    // Only fall back to hardcoded data if there's a connection error
    if (error instanceof Error && (
      error.message.includes('connect') || 
      error.message.includes('timeout') ||
      error.message.includes('ECONNREFUSED')
    )) {
      console.log("Database connection failed, using hardcoded data as fallback");
      const brands = {
        adidas: {
          id: "2", 
          name: "Adidas",
          description: "Impossible is Nothing",
          productCount: 980,
          slug: "adidas",
        },
        nike: {
          id: "1",
          name: "Nike",
          description: "Just Do It",
          productCount: 1250,
          slug: "nike",
        },
        puma: {
          id: "3",
          name: "Puma", 
          description: "Forever Faster",
          productCount: 650,
          slug: "puma",
        },
      };
      return brands[slug as keyof typeof brands];
    }
    
    // For other errors, return undefined (brand not found)
    console.log("Database query failed but connection OK, brand not found");
    return undefined;
  }
}

/**
 * Fetches blog posts from database with fallback to hardcoded data
 */
export async function getBlogPosts(): Promise<TBlogPost[]> {
  // Blog posts are always hardcoded for now (no blog table in schema)
  return getHardcodedBlogPosts();
}

/**
 * Fetches a single product by handle from database with fallback to hardcoded data
 */
export async function getProductByHandle(
  handle: string,
): Promise<TProductItem | undefined> {
  // If demo mode is enabled, skip database and use hardcoded data
  if (isDemoMode) {
    console.log("Demo mode enabled - using hardcoded product");
    return getHardcodedProductByHandle(handle);
  }

  try {
    // Use centralized action to fetch product
    const result = await getProductByHandleAction(handle);
    
    if (!result.success || !result.data) {
      console.log("Product not found in database, trying hardcoded data");
      return getHardcodedProductByHandle(handle);
    }

    // Transform and return
    return {
      id: result.data.id,
      createdAt: result.data.createdAt.toISOString(),
      featuredImage: result.data.media?.[0]
        ? {
            width: result.data.media[0]?.width || 400,
            alt: result.data.media[0]?.altText || result.data.name,
            height: result.data.media[0]?.height || 400,
            src: result.data.media[0]?.url || '',
          }
        : undefined,
      handle: result.data.slug || result.data.id,
      images:
        result.data.media?.map((img) => ({
          width: img.width || 400,
          alt: img.altText || result.data.name,
          height: img.height || 400,
          src: img.url,
        })) || [],
      options: [],
      price: result.data.price ? Number(result.data.price) : 0,
      rating: 4.5, // Default rating
      reviewNumber: 0, // Default reviews
      salePrice: undefined, // No salePrice in schema
      selectedOptions: [],
      status: (result.data.status as any) || "In Stock",
      title: result.data.name,
      vendor: result.data.brand || "Default Vendor",
    };
  } catch (error) {
    console.error("Database query failed:", error);
    
    // Only fall back to hardcoded data if there's a connection error
    if (error instanceof Error && (
      error.message.includes('connect') || 
      error.message.includes('timeout') ||
      error.message.includes('ECONNREFUSED')
    )) {
      console.log("Database connection failed, using hardcoded data as fallback");
      return getHardcodedProductByHandle(handle);
    }
    
    // For other errors, return undefined (product not found)
    console.log("Database query failed but connection OK, product not found");
    return undefined;
  }
}

/**
 * Fetches product detail by handle from database with fallback to hardcoded data
 */
export async function getProductDetailByHandle(handle: string): Promise<any> {
  // Reuse getProductByHandle as they return the same data
  const product = await getProductByHandle(handle);
  if (product) {
    return product;
  }

  // Fall back to hardcoded data
  return getHardcodedProductDetailByHandle(handle);
}

/**
 * Fetches a collection by handle from database with fallback to hardcoded data
 */
export async function getCollectionByHandle(
  handle: string,
): Promise<TCollection | undefined> {
  // If demo mode is enabled, skip database and use hardcoded data
  if (isDemoMode) {
    console.log("Demo mode enabled - using hardcoded collection");
    return getHardcodedCollectionByHandle(handle);
  }

  try {
    // Use centralized action to fetch collection
    const result = await getCollectionByHandleAction(handle);
    
    if (!result.success || !result.data) {
      console.log("Collection not found in database, checking hardcoded data");
      return getHardcodedCollectionByHandle(handle);
    }

    // Transform and return
    return {
      id: result.data.id,
      count: result.data._count?.products || 0,
      description: ((result.data.copy as any)?.description || "") as string,
      handle: result.data.slug || result.data.id,
      image: result.data.media?.[0]?.url || undefined,
      title: result.data.name,
    };
  } catch (error) {
    console.error("Database query failed:", error);
    
    // Always fall back to hardcoded data for collection queries
    // This ensures the 'all' collection and other hardcoded collections are always available
    console.log("Database query failed, using hardcoded data as fallback");
    return getHardcodedCollectionByHandle(handle);
  }
}

/**
 * Fetches products by collection handle from database with fallback to hardcoded data
 */
export async function getProductsByCollection(handle: string): Promise<TProductItem[]> {
  try {
    // If demo mode is enabled, skip database and use hardcoded data
    if (isDemoMode) {
      console.log("Demo mode enabled - using hardcoded products for collection");
      // For demo mode, return all products for 'all' collection, empty for others
      if (handle === 'all') {
        return await getHardcodedProducts();
      }
      return [];
    }
  } catch (error) {
    console.error("Error in demo mode check:", error);
    return [];
  }

  try {
    // First, try to get the collection
    const collectionResult = await getCollectionByHandleAction(handle);
    
    if (!collectionResult.success || !collectionResult.data) {
      console.log("Collection not found, returning empty array");
      
      // Special case for 'all' collection
      if (handle === 'all') {
        return await getProducts();
      }
      return [];
    }

    // Now search for products in this collection
    const productsResult = await searchProducts({
      collectionId: collectionResult.data.id,
      limit: 100,
    });

    if (!productsResult.success || !productsResult.data) {
      console.log("No products found for collection");
      return [];
    }

    // Transform products and return
    return productsResult.data.map((product) => ({
      id: product.id,
      createdAt: product.createdAt.toISOString(),
      featuredImage: product.media?.[0]
        ? {
            width: product.media[0]?.width || 400,
            alt: product.media[0]?.altText || product.name,
            height: product.media[0]?.height || 400,
            src: product.media[0]?.url || '',
          }
        : undefined,
      handle: product.slug || product.id,
      images:
        product.media?.map((img) => ({
          width: img.width || 400,
          alt: img.altText || product.name,
          height: img.height || 400,
          src: img.url,
        })) || [],
      options: [],
      price: product.price ? Number(product.price) : 0,
      rating: 4.5,
      reviewNumber: 0,
      salePrice: undefined,
      selectedOptions: [],
      status: (product.status as any) || "In Stock",
      title: product.name,
      vendor: product.brand || "Default Vendor",
    }));
  } catch (error) {
    console.error("Database query failed:", error);
  }
  
  // Fall back to hardcoded data for this collection
  try {
    // For now, return empty array for unknown collections or use all products for 'all' collection
    if (handle === 'all') {
      return await getHardcodedProducts() as TProductItem[];
    }
    // For other collections that don't exist in database, return empty array to show zero state
    return [];
  } catch (error) {
    console.error("Error in fallback:", error);
    return [];
  }
}

/**
 * Fetches navigation menu - currently just returns hardcoded data
 * In the future, this could be stored in a CMS or database
 */
export async function getNavigation(): Promise<TNavigationItem[]> {
  // Navigation is always hardcoded for now
  return getHardcodedNavigation();
}

/**
 * Fetches mega menu - currently just returns hardcoded data
 */
export async function getNavMegaMenu(): Promise<TNavigationItem> {
  return getHardcodedNavMegaMenu();
}

/**
 * Fetches available languages - currently just returns hardcoded data
 */
export async function getLanguages() {
  return getHardcodedLanguages();
}

/**
 * Fetches available currencies - currently just returns hardcoded data
 */
export async function getCurrencies() {
  return getHardcodedCurrencies();
}

/**
 * Fetches header dropdown categories - currently just returns hardcoded data
 */
export async function getHeaderDropdownCategories() {
  return getHardcodedHeaderDropdownCategories();
}

/**
 * Fetches cart by ID - currently just returns hardcoded data
 */
export async function getCart(id: string): Promise<TCart | undefined> {
  return getHardcodedCart(id) as TCart;
}

/**
 * Fetches product reviews by handle - currently just returns hardcoded data
 */
export async function getProductReviews(handle: string): Promise<TReview[]> {
  // In the future, this could fetch from database
  return getHardcodedProductReviews(handle);
}

/**
 * Fetches orders - currently just returns hardcoded data
 */
export async function getOrders() {
  // In the future, this could fetch from database
  return getHardcodedOrders();
}

/**
 * Fetches a single order by number - currently just returns hardcoded data
 */
export async function getOrder(number: string) {
  // In the future, this could fetch from database
  return getHardcodedOrder(number);
}

/**
 * Fetches a blog post by handle - currently just returns hardcoded data
 */
export async function getBlogPostsByHandle(handle: string) {
  // In the future, this could fetch from database/CMS
  return getHardcodedBlogPostsByHandle(handle);
}
