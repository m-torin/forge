import { shuffleArray } from '@/utils/shuffleArray';
import { logError } from '@repo/observability/server/next';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import 'server-only';

// Import shared types
import type { WebappBlogPost, WebappCollection, WebappProduct, WebappReview } from './types';

// Mock enums that don't exist in the current database schema
enum ContentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  DRAFT = 'DRAFT',
}

// Mock actions that don't exist in the current database schema
const mockActions = {
  findManyProductsAction: async (_params?: any) => [],
  findUniqueProductAction: async (_params?: any) => null,
  findManyCollectionsAction: async (_params?: any) => [],
  findUniqueCollectionAction: async (_params?: any) => null,
  getReviewsAction: async (_params?: any) => ({ data: [], total: 0 }),
  findManyArticlesAction: async (_params?: any) => [],
  findUniqueArticleAction: async (_params?: any) => null,
};

// Map database product to webapp product format
function mapProductToWebapp(product: any): WebappProduct {
  const media = product.media || [];
  const mainImage = media[0];
  const galleryImages = media.slice(0, 4);

  // Extract data from copy JSON field
  const copy = product.copy || {};
  const description = copy.description || copy.shortDescription || '';
  const sizes = copy.sizes || ['XS', 'S', 'M', 'L', 'XL'];
  const colors = copy.colors || [];
  const allOfSizes = copy.allOfSizes || sizes;

  return {
    id: product.id,
    handle: product.slug,
    title: product.name,
    description,
    price: product.price || 0,
    currency: product.currency || 'USD',
    status: product.status === ProductStatus.DRAFT ? 'sale' : undefined,
    brand: product.brand,
    category: product.category,
    type: product.type,
    sizes,
    allOfSizes,
    colors,
    featuredImage: mainImage
      ? {
          src: mainImage.url,
          alt: mainImage.altText || product.name,
          width: mainImage.width || 800,
          height: mainImage.height || 800,
        }
      : undefined,
    images: galleryImages.map((img: any) => ({
      src: img.url,
      alt: img.altText || product.name,
      width: img.width || 800,
      height: img.height || 800,
    })),
  };
}

// Map database collection to webapp collection format
function mapCollectionToWebapp(collection: any): WebappCollection {
  const media = collection.media?.[0];
  const copy = collection.copy || {};

  return {
    id: collection.id,
    handle: collection.slug,
    title: collection.name,
    description: copy.description || '',
    featuredImage: media
      ? {
          src: media.url,
          alt: media.altText || collection.name,
          width: media.width || 800,
          height: media.height || 600,
        }
      : undefined,
    type: collection.type,
    status: collection.status,
  };
}

// Map database review to webapp review format
function mapReviewToWebapp(review: any): WebappReview {
  const user = review.user || {};

  return {
    id: review.id,
    title: review.title || '',
    rating: review.rating || 5,
    content: review.comment || '',
    author: user.name || 'Anonymous',
    authorAvatar: undefined, // We'll use default avatars
    date: new Date(review.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    datetime: review.createdAt,
  };
}

// Map database article to webapp blog post format
function mapArticleToWebapp(article: any): WebappBlogPost {
  const media = article.media?.[0];
  const copy = article.copy || {};
  const user = article.user || {};

  return {
    id: article.id,
    title: article.title,
    handle: article.slug,
    excerpt: copy.excerpt || copy.description || '',
    content: copy.content || '',
    featuredImage: media
      ? {
          src: media.url,
          alt: media.altText || article.title,
          width: media.width || 1200,
          height: media.height || 800,
        }
      : undefined,
    date: new Date(article.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    datetime: article.createdAt,
    category: { title: copy.category || 'General', href: '#' },
    timeToRead: copy.readTime || '3 min read',
    author: {
      name: user.name || 'Guest Author',
      avatar: undefined, // We'll use default avatars
      description: copy.authorBio || '',
    },
  };
}

// Get products from database with Next.js 15 caching
export const getProducts = unstable_cache(
  async (): Promise<WebappProduct[]> => {
    try {
      const products = await mockActions.findManyProductsAction({
        where: {
          status: ProductStatus.ACTIVE,
          deletedAt: null,
        },
        include: {
          media: {
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50, // Limit for performance
      });

      return shuffleArray(products.map(mapProductToWebapp));
    } catch (error) {
      logError('Error fetching products', error);
      return [];
    }
  },
  ['products'], // cache key
  {
    revalidate: 3600, // revalidate every hour
    tags: ['products', 'catalog'],
  },
);

// Get product by handle with React cache for request deduplication
export const getProductByHandle = cache(async (handle: string): Promise<WebappProduct | null> => {
  try {
    const product = await mockActions.findUniqueProductAction({
      where: { slug: handle },
      include: {
        media: {
          orderBy: { sortOrder: 'asc' },
        },
        taxonomies: true,
      },
    });

    if (!product) return null;

    return mapProductToWebapp(product);
  } catch (error) {
    logError('Error fetching product', error);
    return null;
  }
});

// Get collections from database with Next.js 15 caching
export const getCollections = unstable_cache(
  async (): Promise<WebappCollection[]> => {
    try {
      const collections = await mockActions.findManyCollectionsAction({
        where: {
          status: ContentStatus.PUBLISHED,
          deletedAt: null,
          // Only get non-parent collections (those without children)
          parentId: null,
        },
        include: {
          media: {
            take: 1,
            orderBy: { sortOrder: 'asc' },
          },
          _count: {
            select: { products: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      return collections.map(mapCollectionToWebapp);
    } catch (error) {
      logError('Error fetching collections', error);
      return [];
    }
  },
  ['collections'], // cache key
  {
    revalidate: 3600, // revalidate every hour
    tags: ['collections', 'catalog'],
  },
);

// Get group collections (for navigation) with Next.js 15 caching
export const getGroupCollections = unstable_cache(
  async (): Promise<Array<{ name: string; collections: WebappCollection[] }>> => {
    try {
      const groupCollections = await mockActions.findManyCollectionsAction({
        where: {
          status: ContentStatus.PUBLISHED,
          deletedAt: null,
          // Get parent collections (those with children)
          children: {
            some: {},
          },
        },
        include: {
          children: {
            where: {
              status: ContentStatus.PUBLISHED,
              deletedAt: null,
            },
            include: {
              media: {
                take: 1,
                orderBy: { sortOrder: 'asc' },
              },
            },
          },
        },
        orderBy: { name: 'asc' },
      });

      return groupCollections.map((group: any) => ({
        name: group.name,
        collections: group.children.map(mapCollectionToWebapp),
      }));
    } catch (error) {
      logError('Error fetching group collections', error);
      return [];
    }
  },
  ['group-collections'], // cache key
  {
    revalidate: 3600, // revalidate every hour
    tags: ['collections', 'navigation'],
  },
);

// Get collection by handle with React cache for request deduplication
export const getCollectionByHandle = cache(
  async (handle: string): Promise<WebappCollection | null> => {
    try {
      const collection = await mockActions.findUniqueCollectionAction({
        where: { slug: handle },
        include: {
          media: {
            orderBy: { sortOrder: 'asc' },
          },
          products: {
            where: {
              status: ProductStatus.ACTIVE,
              deletedAt: null,
            },
            include: {
              media: {
                take: 1,
                orderBy: { sortOrder: 'asc' },
              },
            },
          },
        },
      });

      if (!collection) return null;

      const mappedCollection = mapCollectionToWebapp(collection);

      // Check if products exist on the collection
      const products = (collection as any).products || [];

      return {
        ...mappedCollection,
        products: products.map(mapProductToWebapp),
      };
    } catch (error) {
      logError('Error fetching collection', error);
      return null;
    }
  },
);

// Get product reviews with React cache for request deduplication
export const getProductReviews = cache(async (handle: string): Promise<WebappReview[]> => {
  try {
    // First get the product
    const product = await mockActions.findUniqueProductAction({
      where: { slug: handle },
      select: { id: true },
    });

    if (!product) return [];

    // Then get reviews for this product
    const reviewsResponse = await mockActions.getReviewsAction({
      productId: (product as any)?.id,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    // Handle response structure - might be {data: reviews} or {reviews}
    const reviews = (reviewsResponse as any).data || (reviewsResponse as any).reviews || [];

    return reviews.map(mapReviewToWebapp);
  } catch (error) {
    logError('Error fetching reviews', error);
    return [];
  }
});

// Get blog posts with Next.js 15 caching
export const getBlogPosts = unstable_cache(
  async (): Promise<WebappBlogPost[]> => {
    try {
      const articles = await mockActions.findManyArticlesAction({
        where: {
          status: ContentStatus.PUBLISHED,
          deletedAt: null,
        },
        include: {
          media: {
            take: 1,
            orderBy: { sortOrder: 'asc' },
          },
          user: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      return articles.map(mapArticleToWebapp);
    } catch (error) {
      logError('Error fetching blog posts', error);
      return [];
    }
  },
  ['blog-posts'], // cache key
  {
    revalidate: 1800, // revalidate every 30 minutes
    tags: ['blog', 'articles'],
  },
);

// Get blog post by handle with React cache for request deduplication
export const getBlogPostByHandle = cache(async (handle: string): Promise<WebappBlogPost | null> => {
  try {
    const article = await mockActions.findUniqueArticleAction({
      where: { slug: handle },
      include: {
        media: {
          orderBy: { sortOrder: 'asc' },
        },
        user: {
          select: { name: true },
        },
      },
    });

    if (!article) return null;

    return mapArticleToWebapp(article);
  } catch (error) {
    logError('Error fetching blog post', error);
    return null;
  }
});
