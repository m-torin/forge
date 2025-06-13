// Taxonomy types
export enum TaxonomyType {
  ATTRIBUTES = 'attributes',
  BRANDS = 'brands',
  CATEGORIES = 'categories',
  COLLECTIONS = 'collections',
  TAGS = 'tags',
}

export interface TaxonomyItem {
  children?: TaxonomyItem[];
  count?: number;
  description?: string;
  id: string;
  name: string;
  parent?: string;
  slug: string;
  type: TaxonomyType;
}

// Placeholder types for AppLayout
export interface TCollection {
  description?: string;
  handle: string;
  id: string;
  title: string;
  count?: number;
}

export interface TNavigationItem {
  children?: TNavigationItem[];
  href: string;
  id: string;
  name: string;
}

// Product and data types
export interface TProductImage {
  alt?: string;
  height: number;
  id: string;
  src: string;
  width: number;
}

export interface TCardProduct {
  id: string;
  handle: string;
  title: string;
  featuredImage: TProductImage;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  vendor?: string;
  quantity?: number;
  selectedVariant?: {
    id: string;
    title: string;
    price: {
      amount: string;
      currencyCode: string;
    };
  };
}

export interface TProductItem extends TCardProduct {
  description?: string;
  images: TProductImage[];
  variants: Array<{
    id: string;
    title: string;
    availableForSale: boolean;
    price: {
      amount: string;
      currencyCode: string;
    };
    selectedOptions: Array<{
      name: string;
      value: string;
    }>;
  }>;
  options: Array<{
    id: string;
    name: string;
    values: string[];
  }>;
  tags: string[];
  category?: string;
  rating?: number;
  reviewCount?: number;
  price?: number; // Legacy field for compatibility
}

export interface TBlogPost {
  id: string;
  handle: string;
  title: string;
  excerpt?: string;
  content?: string;
  author: {
    name: string;
    image?: string;
    avatar?: string; // Legacy field
  };
  publishedAt?: string;
  date: string;
  datetime: string;
  image?: TProductImage;
  featuredImage?: TProductImage;
  tags?: string[];
  timeToRead?: number;
  category?: {
    href: string;
    title: string;
  };
}

export interface TReview {
  id: string;
  rating: number;
  comment?: string;
  author:
    | {
        name: string;
        image?: string;
      }
    | string; // Allow both new format and legacy string format
  createdAt?: string;
  helpful?: number;
  // Legacy fields for compatibility
  content?: string;
  date?: string;
  datetime?: string;
  title?: string;
  authorAvatar?: any;
}

export interface TGroupCollection {
  id: string;
  name: string;
  collections: TCollection[];
}

export interface TProductDetail extends TProductItem {
  relatedProducts?: TProductItem[];
  reviews?: TReview[];
  specifications?: Record<string, string>;
}
