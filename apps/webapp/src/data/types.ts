import { Route } from 'next';

export interface CustomLink {
  label: string;
  href: Route;
  targetBlank?: boolean;
}

export type TwMainColor =
  | 'pink'
  | 'green'
  | 'yellow'
  | 'red'
  | 'indigo'
  | 'blue'
  | 'purple'
  | 'gray';

//

// Shared types for webapp data
// These types can be imported by both client and server components

export interface WebappProduct {
  id: string;
  handle: string;
  title: string;
  description?: string; // Made optional for static data compatibility
  price: number;
  currency?: string; // Made optional for static data compatibility
  status?: string;
  brand?: string;
  category?: string;
  type?: string;
  sizes?: string[]; // Made optional for static data compatibility
  allOfSizes?: string[]; // Made optional for static data compatibility
  colors?: any[]; // Made optional for static data compatibility
  featuredImage?: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  images: Array<{
    src: string;
    alt: string;
    width: number;
    height: number;
  }>;
  options?: any[];
  selectedOptions?: any[];
  reviewNumber?: number;
  rating?: number;
  // Additional fields for compatibility with static data
  createdAt?: string;
  vendor?: string;
}

export interface WebappCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
  featuredImage?: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  type?: string;
  status?: string;
  image?: any;
  color?: string;
  count?: number;
  products?: WebappProduct[];
  // Additional fields for compatibility with static data
  sortDescription?: string;
}

export interface WebappReview {
  id: string;
  title: string;
  rating: number;
  content: string;
  author: string;
  authorAvatar?: any;
  date: string;
  datetime: string;
}

export interface WebappBlogPost {
  id: string;
  title: string;
  handle: string;
  excerpt: string;
  content?: string; // Made optional since some posts might not have full content
  featuredImage?: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  date: string;
  datetime: string;
  category: { title: string; href: string };
  timeToRead: string;
  author: {
    name: string;
    avatar?: any;
    description: string;
  };
  // Additional fields for compatibility with static data
  tags?: string[];
}
