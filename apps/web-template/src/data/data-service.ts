'use server';

// For now, we'll use hardcoded data directly
// In a real app, this would connect to a database
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
} from '@/data/hardcoded-data';
import {
  getCurrencies as getHardcodedCurrencies,
  getHeaderDropdownCategories as getHardcodedHeaderDropdownCategories,
  getLanguages as getHardcodedLanguages,
  getNavigation as getHardcodedNavigation,
  getNavMegaMenu as getHardcodedNavMegaMenu,
} from '@/data/navigation';
import { TNavigationItem } from '@/types';

// Define brand type based on database schema
export interface TBrand {
  description?: string;
  id: string;
  name: string;
  productCount?: number;
  slug: string;
}

export interface TCart {
  checkoutUrl: string;
  cost: {
    subtotalAmount: {
      amount: string;
      currencyCode: string;
    };
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
    totalTaxAmount?: {
      amount: string;
      currencyCode: string;
    };
  };
  id: string;
  lines: any[]; // Make lines more flexible to handle different cart item formats
  totalQuantity: number;
  createdAt?: string;
  note?: string;
}

export interface TOrder {
  email: string;
  financialStatus: string;
  fulfillmentStatus: string;
  id: string;
  name: string;
  orderNumber: number;
  processedAt: string;
  statusUrl: string;
  totalPrice: {
    amount: string;
    currencyCode: string;
    total: number;
  };
  createdAt: string;
  lines: any[]; // Make lines more flexible to handle different order item formats
  note?: string;
  totalQuantity: number;
  // Legacy fields for backward compatibility
  number?: string;
  status?: string;
  date?: string;
  products?: any[];
  cost?: {
    discount: number;
    shipping: number;
    subtotal: number;
    tax: number;
    total: number;
  };
  invoiceHref?: string;
}

// Re-export types for convenience
export type { TBlogPost, TCardProduct, TCollection, TNavigationItem, TProductItem, TReview };

/**
 * Fetches products - uses hardcoded data for demo
 */
export async function getProducts(): Promise<TProductItem[]> {
  const products = await getHardcodedProducts();
  return products.map((product: any) => ({
    ...product,
    variants: product.variants || [],
    tags: product.tags || [],
    priceRange: product.priceRange || {
      minVariantPrice: {
        amount: String(product.price || 0),
        currencyCode: 'USD',
      },
    },
    featuredImage: {
      ...product.featuredImage,
      id: `${product.id}-featured`,
    },
    images: product.images.map((image: any, index: number) => ({
      ...image,
      id: `${product.id}-img-${index}`,
    })),
    options: product.options.map((option: any, index: number) => ({
      id: `${product.id}-option-${index}`,
      name: option.name,
      values: option.optionValues.map((val: any) => val.value),
    })),
  }));
}

/**
 * Fetches a single product by handle
 */
export async function getProductByHandle(handle: string): Promise<TProductItem | undefined> {
  const product = await getHardcodedProductByHandle(handle);
  if (!product) return undefined;

  return {
    ...product,
    variants: (product as any).variants || [],
    tags: (product as any).tags || [],
    priceRange: (product as any).priceRange || {
      minVariantPrice: {
        amount: String((product as any).price || 0),
        currencyCode: 'USD',
      },
    },
    featuredImage: {
      ...product.featuredImage,
      id: `${product.id}-featured`,
    },
    images: product.images.map((image, index: any) => ({
      ...image,
      id: `${product.id}-img-${index}`,
    })),
    options: product.options.map((option: any, index: number) => ({
      id: `${product.id}-option-${index}`,
      name: option.name,
      values: option.optionValues.map((val: any) => val.value),
    })),
  };
}

/**
 * Fetches product detail by handle with reviews
 */
export async function getProductDetailByHandle(handle: string) {
  return getHardcodedProductDetailByHandle(handle);
}

/**
 * Searches products by query
 */
export async function searchProducts(query: string): Promise<TProductItem[]> {
  const allProducts = await getProducts();
  const searchTerm = query.toLowerCase();

  return allProducts.filter(
    (product: any) =>
      product.title?.toLowerCase().includes(searchTerm) ||
      product.vendor?.toLowerCase().includes(searchTerm),
  );
}

/**
 * Fetches collections
 */
export async function getCollections(): Promise<TCollection[]> {
  return getHardcodedCollections();
}

/**
 * Fetches a single collection by handle
 */
export async function getCollectionByHandle(handle: string): Promise<TCollection | undefined> {
  return getHardcodedCollectionByHandle(handle);
}

/**
 * Fetches group collections
 */
export async function getGroupCollections() {
  return getHardcodedGroupCollections();
}

/**
 * Fetches brands
 */
export async function getBrands(): Promise<TBrand[]> {
  return [
    {
      id: '1',
      name: 'Nike',
      description: 'Just Do It',
      productCount: 1250,
      slug: 'nike',
    },
    {
      id: '2',
      name: 'Adidas',
      description: 'Impossible is Nothing',
      productCount: 980,
      slug: 'adidas',
    },
    {
      id: '3',
      name: 'Puma',
      description: 'Forever Faster',
      productCount: 650,
      slug: 'puma',
    },
  ];
}

/**
 * Fetches a single brand by slug
 */
export async function getBrandBySlug(slug: string): Promise<TBrand | undefined> {
  const brands = await getBrands();
  return brands.find((brand: any) => brand.slug === slug);
}

/**
 * Fetches blog posts
 */
export async function getBlogPosts(): Promise<TBlogPost[]> {
  const posts = await getHardcodedBlogPosts();
  return posts.map((post: any) => ({
    ...post,
    featuredImage: post.featuredImage
      ? {
          ...post.featuredImage,
          id: post.featuredImage.id || `img-${post.id}`,
        }
      : undefined,
  }));
}

/**
 * Fetches a single blog post by handle
 */
export async function getBlogPostByHandle(handle: string): Promise<TBlogPost | undefined> {
  const post = await getHardcodedBlogPostsByHandle(handle);
  if (!post) return undefined;

  return {
    ...post,
    featuredImage: post.featuredImage
      ? {
          ...post.featuredImage,
          id: `${post.id}-featured`,
        }
      : undefined,
  };
}

/**
 * Fetches cart data
 */
export async function getCart(): Promise<TCart> {
  return getHardcodedCart();
}

/**
 * Fetches orders
 */
export async function getOrders(): Promise<TOrder[]> {
  return getHardcodedOrders();
}

/**
 * Fetches a single order by number
 */
export async function getOrderByNumber(orderNumber: string): Promise<TOrder | undefined> {
  return getHardcodedOrder(orderNumber);
}

/**
 * Fetches product reviews
 */
export async function getProductReviews(productId: string): Promise<TReview[]> {
  return getHardcodedProductReviews(productId);
}

/**
 * Fetches products by collection handle
 */
export async function getProductsByCollection(handle: string): Promise<TProductItem[]> {
  // For demo purposes, return all products
  // In a real app, this would filter by collection
  const allProducts = await getProducts();
  return allProducts.slice(0, 8); // Return first 8 products as demo
}

/**
 * Fetches navigation menu items
 */
export async function getNavigation(): Promise<TNavigationItem[]> {
  return getHardcodedNavigation();
}

/**
 * Fetches mega menu items
 */
export async function getNavMegaMenu() {
  return getHardcodedNavMegaMenu();
}

/**
 * Fetches header dropdown categories
 */
export async function getHeaderDropdownCategories() {
  return getHardcodedHeaderDropdownCategories();
}

/**
 * Fetches available currencies
 */
export async function getCurrencies() {
  return getHardcodedCurrencies();
}

/**
 * Fetches available languages
 */
export async function getLanguages() {
  return getHardcodedLanguages();
}
