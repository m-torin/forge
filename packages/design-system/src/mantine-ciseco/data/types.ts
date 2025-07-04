import { type Route } from 'next';

export interface CustomLink {
  href: Route;
  label: string;
  targetBlank?: boolean;
}

export interface TBlogPost {
  author?: string | { avatar?: string; name: string };
  content?: string;
  date?: string;
  excerpt?: string;
  featuredImage?: TProductImage;
  handle: string;
  id: string;
  tags?: string[];
  timeToRead?: number;
  title: string;
}

// Data types needed by design system components
// These are minimal interfaces - actual data implementations are in apps

export interface TCardProduct {
  color?: string;
  handle?: string;
  id: string;
  image?: TProductImage;
  imageUrl?: string;
  inStock?: boolean;
  leadTime?: string;
  name?: string;
  price?: number;
  quantity?: number;
  size?: string;
  title?: string;
}

export interface TCollection {
  color?: string;
  count?: number;
  description?: string;
  handle: string;
  id: string;
  image?: TProductImage;
  sortDescription?: string;
  title: string;
}

export interface TCurrency {
  active?: boolean;
  href: string;
  icon: string;
  id: string;
  name: string;
}

export interface TDropdownCategory {
  description: string;
  handle: string;
  icon: string;
  name: string;
}

export interface TGroupCollection {
  collections: TCollection[];
  description?: string;
  handle: string;
  iconSvg: string;
  id: string;
  title: string;
}

export interface TLanguage {
  description: string;
  id: string;
  locale: string;
  name: string;
}

export interface TNavigationItem {
  children?: TNavigationItem[];
  href?: Route;
  id: string;
  isNew?: boolean;
  name: string;
  type?: 'dropdown' | 'mega-menu' | 'none';
}

export interface TOption {
  name: string;
  optionValues?: TOptionValue[];
}

export interface TOptionValue {
  name: string;
  swatch?: null | {
    color?: string;
    image?: string;
  };
  value: string;
}

// Additional types that components need
export interface TProductDetail extends TProductItem {
  description?: string;
  features?: string[];
  specifications?: Record<string, string>;
}

export interface TProductImage {
  alt?: string;
  height: number;
  src: string;
  width: number;
}

export interface TProductItem {
  createdAt?: string;
  featuredImage?: TProductImage;
  handle: string;
  id: string;
  images?: TProductImage[];
  options?: TOption[];
  price?: number;
  rating?: number;
  reviewNumber?: number;
  salePrice?: number;
  selectedOptions?: TSelectedOption[];
  status?: string;
  title?: string;
  vendor?: string;
}

export interface TReview {
  author?: string;
  authorAvatar?: string;
  content?: string;
  date?: string;
  id: string;
  rating?: number;
  title?: string;
}

export interface TSelectedOption {
  name: string;
  value: string;
}

export type TwMainColor =
  | 'blue'
  | 'gray'
  | 'green'
  | 'indigo'
  | 'pink'
  | 'purple'
  | 'red'
  | 'yellow';

// Placeholder exports for components that import functions
export const getGroupCollections = () => [];
export const getHeaderDropdownCategories = () => [];
export const getCurrencies = () => [];
export const getLanguages = () => [];
export const getNavigation = () => [];
export const getNavMegaMenu = () => ({ children: [], id: '1', name: 'Menu' });
export const getBlogPosts = () => [];
export const getCollections = () => [];
export const getProducts = () => [];
