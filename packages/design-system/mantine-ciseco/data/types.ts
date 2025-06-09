import { type Route } from 'next';

export interface CustomLink {
  href: Route;
  label: string;
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

// Data types needed by design system components
// These are minimal interfaces - actual data implementations are in apps

export interface TProductImage {
  alt?: string;
  height: number;
  src: string;
  width: number;
}

export interface TOptionValue {
  name: string;
  swatch?: {
    color?: string;
    image?: string;
  } | null;
  value: string;
}

export interface TOption {
  name: string;
  optionValues?: TOptionValue[];
}

export interface TSelectedOption {
  name: string;
  value: string;
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

export interface TBlogPost {
  author?: string | { name: string; avatar?: string };
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

export interface TReview {
  author?: string;
  authorAvatar?: string;
  content?: string;
  date?: string;
  id: string;
  rating?: number;
  title?: string;
}

export interface TCardProduct {
  color?: string;
  id: string;
  imageUrl?: string;
  price?: number;
  quantity?: number;
  size?: string;
  title?: string;
}

export interface TNavigationItem {
  children?: TNavigationItem[];
  href?: Route;
  id: string;
  isNew?: boolean;
  name: string;
  type?: 'dropdown' | 'megaMenu' | 'none';
}

// Additional types that components need
export interface TProductDetail extends TProductItem {
  description?: string;
  features?: string[];
  specifications?: Record<string, string>;
}

// Placeholder exports for components that import functions
export const getGroupCollections = () => [];
export const getHeaderDropdownCategories = () => [];
export const getCurrencies = () => [];
export const getLanguages = () => [];
export const getNavigation = () => [];
export const getNavMegaMenu = () => ({ id: '1', name: 'Menu', children: [] });
export const getBlogPosts = () => [];
export const getCollections = () => [];
export const getProducts = () => [];
