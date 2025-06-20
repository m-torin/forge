// Type mappings between web-template types and Prisma database types

import type {
  Product,
  Collection,
  Article,
  Media,
  Brand,
  ProductCategory,
  Review,
  User,
} from '@repo/database/prisma';

import type {
  TProductItem,
  TCardProduct,
  TCollection,
  TBlogPost,
  TProductImage,
  TReview,
} from './index';

// Database result types (what we get from Prisma actions)
// Note: These are basic product types without relations for now
// The database actions will need to be updated to include relations
export type DatabaseProduct = Product & {
  media?: Media[];
  collections?: Collection[];
  reviews?: Review[];
  favorites?: { userId: string }[];
  avgRating?: number;
  reviewCount?: number;
  favoriteCount?: number;
};

export type DatabaseCollection = Collection & {
  media?: Media[];
  products?: Product[];
  _count?: {
    products: number;
  };
};

export type DatabaseArticle = Article & {
  user?: User | null;
  media?: Media[];
};

export type DatabaseBrand = Brand & {
  media: Media[];
  _count?: {
    products: number;
  };
};

export type DatabaseCategory = ProductCategory & {
  media: Media[];
  _count?: {
    products: number;
    children: number;
  };
  children?: ProductCategory[];
  parent?: ProductCategory | null;
};

// Transformation functions to convert database types to web-template types

export function transformDatabaseProductToTProductItem(dbProduct: DatabaseProduct): TProductItem {
  const primaryImage = dbProduct.media?.find((m) => m.type === 'IMAGE');
  const images =
    dbProduct.media?.filter((m) => m.type === 'IMAGE').map(transformDatabaseMediaToTProductImage) ||
    [];

  return {
    id: dbProduct.id,
    handle: dbProduct.sku || dbProduct.id, // Use SKU as handle, fallback to ID
    title: dbProduct.name,
    description: (dbProduct.copy as any)?.description || undefined,
    featuredImage: primaryImage
      ? transformDatabaseMediaToTProductImage(primaryImage)
      : {
          id: 'default',
          src: '/placeholder.jpg',
          alt: dbProduct.name,
          width: 400,
          height: 400,
        },
    images,
    priceRange: {
      minVariantPrice: {
        amount: dbProduct.price?.toString() || '0',
        currencyCode: dbProduct.currency || 'USD',
      },
    },
    vendor: dbProduct.brand || undefined,
    variants: [], // TODO: Implement variants when added to schema
    options: [], // TODO: Implement options when added to schema
    tags: [], // TODO: Map from attributes or taxonomies
    category: dbProduct.category || undefined,
    rating: dbProduct.avgRating || undefined,
    reviewCount: dbProduct.reviewCount || undefined,
    reviewNumber: dbProduct.reviewCount || undefined, // Legacy field
    price: dbProduct.price || undefined,
    availableForSale: dbProduct.status === 'ACTIVE',
    status: dbProduct.status === 'ACTIVE' ? 'In Stock' : 'Out of Stock',
    selectedOptions: [], // TODO: Implement when product options are added
  };
}

export function transformDatabaseProductToTCardProduct(dbProduct: DatabaseProduct): TCardProduct {
  const primaryImage = dbProduct.media?.find((m) => m.type === 'IMAGE');

  return {
    id: dbProduct.id,
    handle: dbProduct.sku || dbProduct.id,
    title: dbProduct.name,
    featuredImage: primaryImage
      ? transformDatabaseMediaToTProductImage(primaryImage)
      : {
          id: 'default',
          src: '/placeholder.jpg',
          alt: dbProduct.name,
          width: 400,
          height: 400,
        },
    priceRange: {
      minVariantPrice: {
        amount: dbProduct.price?.toString() || '0',
        currencyCode: dbProduct.currency || 'USD',
      },
    },
    vendor: dbProduct.brand || undefined,
    price: dbProduct.price || undefined,
  };
}

export function transformDatabaseCollectionToTCollection(
  dbCollection: DatabaseCollection,
): TCollection {
  const primaryImage = dbCollection.media?.find((m) => m.type === 'IMAGE');

  return {
    id: dbCollection.id,
    handle: dbCollection.slug,
    title: dbCollection.name,
    description: typeof dbCollection.copy === 'string' ? dbCollection.copy : undefined,
    count: dbCollection._count?.products || 0,
    image: primaryImage ? transformDatabaseMediaToTProductImage(primaryImage) : undefined,
    products:
      dbCollection.products?.map((p) => {
        const cardProduct = transformDatabaseProductToTCardProduct(p as DatabaseProduct);
        // Convert TCardProduct to TProductItem for collection compatibility
        return {
          ...cardProduct,
          images: cardProduct.featuredImage ? [cardProduct.featuredImage] : [],
          variants: [],
          options: [],
          tags: [],
          availableForSale: true,
          description: '',
        };
      }) || [],
  };
}

export function transformDatabaseArticleToTBlogPost(dbArticle: DatabaseArticle): TBlogPost {
  const primaryImage = dbArticle.media?.find((m) => m.type === 'IMAGE');

  return {
    id: dbArticle.id,
    handle: dbArticle.slug,
    title: dbArticle.title,
    excerpt:
      typeof dbArticle.content === 'string'
        ? dbArticle.content.substring(0, 200) + '...'
        : undefined,
    content: typeof dbArticle.content === 'string' ? dbArticle.content : undefined,
    author: {
      name: dbArticle.user?.name || 'Unknown Author',
      image: dbArticle.user?.image || undefined,
      avatar: dbArticle.user?.image || undefined, // Legacy field
    },
    publishedAt: dbArticle.createdAt.toISOString(),
    date: dbArticle.createdAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    datetime: dbArticle.createdAt.toISOString(),
    featuredImage: primaryImage ? transformDatabaseMediaToTProductImage(primaryImage) : undefined,
    image: primaryImage ? transformDatabaseMediaToTProductImage(primaryImage) : undefined, // Legacy field
  };
}

export function transformDatabaseMediaToTProductImage(dbMedia: Media): TProductImage {
  // Extract storage key from metadata if available
  const storageKey =
    dbMedia.copy && typeof dbMedia.copy === 'object' ? (dbMedia.copy as any).storageKey : undefined;

  return {
    id: dbMedia.id,
    src: dbMedia.url,
    url: dbMedia.url, // Legacy field
    alt: dbMedia.altText || '',
    altText: dbMedia.altText || '', // Legacy field
    width: dbMedia.width || 400,
    height: dbMedia.height || 400,
    // Add media ID and storage key for signed URL support
    mediaId: dbMedia.id,
    storageKey,
  };
}

export function transformDatabaseReviewToTReview(dbReview: Review & { user?: User }): TReview {
  return {
    id: dbReview.id,
    rating: dbReview.rating,
    comment: dbReview.content,
    content: dbReview.content, // Legacy field
    author: dbReview.user
      ? {
          name: dbReview.user.name,
          image: dbReview.user.image || undefined,
        }
      : 'Anonymous',
    createdAt: dbReview.createdAt.toISOString(),
    date: dbReview.createdAt.toLocaleDateString(), // Legacy field
    datetime: dbReview.createdAt.toISOString(), // Legacy field
    title: dbReview.title || undefined,
    helpful: dbReview.helpfulCount || undefined,
  };
}

// Helper types for function parameters
export type ProductsResult = {
  products: DatabaseProduct[];
  total: number;
  hasMore: boolean;
};

export type CollectionsResult = {
  collections: DatabaseCollection[];
  total: number;
  hasMore: boolean;
};

export type ArticlesResult = {
  articles: DatabaseArticle[];
  total: number;
  hasMore: boolean;
};
