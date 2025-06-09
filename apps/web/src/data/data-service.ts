"use server";

import { env } from "@/env";

// Import ORM functions
import {
  findFirstBrand,
  findFirstCollection,
  findFirstProduct,
  findManyBrands,
  findManyCollections,
  findManyProducts,
} from "@repo/database/prisma/orm";
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
    // Use ORM function to fetch products
    const dbProducts = await findManyProducts({
      include: {
        categories: true,
        media: true,
      },
      take: 100, // Limit for performance
    });

    // Transform database products to the expected format
    return dbProducts.map((product) => ({
      id: product.id,
      createdAt: product.createdAt.toISOString(),
      featuredImage: product.media?.[0]
        ? {
            width: 400,
            alt: product.name,
            height: 400,
            src: product.media[0].url,
          }
        : undefined,
      handle: product.slug || product.id,
      images:
        product.media?.map((img) => ({
          width: img.width || 400,
          alt: img.alt || product.name,
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
    // Use ORM function to fetch collections
    const dbCollections = await findManyCollections({
      include: {
        products: {
          take: 4, // Include a few products for preview
        },
      },
      take: 50, // Limit for performance
    });

    // Transform database collections to the expected format
    return dbCollections.map((collection, index) => ({
      id: collection.id,
      count: collection.products?.length || 0,
      description: collection.copy?.description || "",
      handle: collection.slug || collection.id || `collection-${index}`,
      image: undefined, // No image field in schema
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
    // Use ORM function to fetch brands
    const dbBrands = await findManyBrands({
      include: {
        products: {
          select: { id: true }, // Just count products
        },
      },
      take: 50, // Limit for performance
    });

    // Transform database brands to the expected format
    return dbBrands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      description: brand.copy?.description || undefined,
      productCount: brand.products?.length || 0,
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
    // Use ORM function to fetch brand
    const dbBrand = await findFirstBrand({
      include: {
        products: {
          select: { id: true }, // Just count products
        },
      },
      where: {
        OR: [{ slug: slug }, { id: slug }],
      },
    });

    // If found in database, transform and return
    if (dbBrand) {
      return {
        id: dbBrand.id,
        name: dbBrand.name,
        description: dbBrand.copy?.description || undefined,
        productCount: dbBrand.products?.length || 0,
        slug: dbBrand.slug || dbBrand.id,
      };
    }
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
    // Use ORM function to fetch product
    const dbProduct = await findFirstProduct({
      include: {
        categories: true,
        media: true,
      },
      where: {
        OR: [{ slug: handle }, { id: handle }],
      },
    });

    // If found in database, transform and return
    if (dbProduct) {
      return {
        id: dbProduct.id,
        createdAt: dbProduct.createdAt.toISOString(),
        featuredImage: dbProduct.media?.[0]
          ? {
              width: 400,
              alt: dbProduct.name,
              height: 400,
              src: dbProduct.media[0].url,
            }
          : undefined,
        handle: dbProduct.slug || dbProduct.id,
        images:
          dbProduct.media?.map((img) => ({
            width: img.width || 400,
            alt: img.alt || dbProduct.name,
            height: img.height || 400,
            src: img.url,
          })) || [],
        options: [],
        price: dbProduct.price ? Number(dbProduct.price) : 0,
        rating: 4.5, // Default rating
        reviewNumber: 0, // Default reviews
        salePrice: undefined, // No salePrice in schema
        selectedOptions: [],
        status: (dbProduct.status as any) || "In Stock",
        title: dbProduct.name,
        vendor: dbProduct.brand || "Default Vendor",
      };
    }
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
export async function getProductDetailByHandle(handle: string) {
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
    // Use ORM function to fetch collection
    const dbCollection = await findFirstCollection({
      include: {
        products: true,
      },
      where: {
        OR: [{ slug: handle }, { id: handle }],
      },
    });

    // If found in database, transform and return
    if (dbCollection) {
      return {
        id: dbCollection.id,
        count: dbCollection.products?.length || 0,
        description: dbCollection.copy?.description || "",
        handle: dbCollection.slug || dbCollection.id,
        image: undefined, // No image field in schema
        title: dbCollection.name,
      };
    }
  } catch (error) {
    console.error("Database query failed:", error);
    
    // Always fall back to hardcoded data for collection queries
    // This ensures the 'all' collection and other hardcoded collections are always available
    console.log("Database query failed, using hardcoded data as fallback");
    return getHardcodedCollectionByHandle(handle);
  }
  
  // If no database result found but no error, still check hardcoded data
  // This handles cases where collection exists in hardcoded data but not in database
  console.log("Collection not found in database, checking hardcoded data");
  return getHardcodedCollectionByHandle(handle);
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
    // Use ORM function to fetch collection with products
    const dbCollection = await findFirstCollection({
      include: {
        products: {
          include: {
            categories: true,
            media: true,
          },
        },
      },
      where: {
        OR: [{ slug: handle }, { id: handle }],
      },
    });

    // If found in database, transform products and return
    if (dbCollection && dbCollection.products) {
      return dbCollection.products.map((product) => ({
        id: product.id,
        createdAt: product.createdAt.toISOString(),
        featuredImage: product.media?.[0]
          ? {
              width: 400,
              alt: product.name,
              height: 400,
              src: product.media[0].url,
            }
          : undefined,
        handle: product.slug || product.id,
        images:
          product.media?.map((img) => ({
            width: img.width || 400,
            alt: img.alt || product.name,
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
    }
  } catch (error) {
    console.error("Database query failed:", error);
  }
  
  // Fall back to hardcoded data for this collection
  try {
    // For now, return empty array for unknown collections or use all products for 'all' collection
    if (handle === 'all') {
      return await getHardcodedProducts();
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
export async function getCart(id: string): Promise<TCardProduct | undefined> {
  return getHardcodedCart(id);
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
