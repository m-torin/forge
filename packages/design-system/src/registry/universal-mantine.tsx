'use client';

import { Skeleton } from '@mantine/core';
import { forwardRef, Suspense, useMemo } from 'react';

import {
  type ComponentMetadata,
  getComponent,
  getComponentWithMetadata,
} from './mantine-ciseco-registry';

import type { ForwardRefExoticComponent, ReactElement, RefAttributes } from 'react';

interface UniversalMantineComponentProps {
  /**
   * The name of the component from the mantine-ciseco registry
   */
  is: string;

  /**
   * Whether to show loading skeleton
   */
  skeleton?: boolean;

  /**
   * Custom loading component
   */
  loader?: ReactElement;

  /**
   * Component props - passed through to the resolved component
   */
  [key: string]: any;
}

/**
 * Universal Mantine Component
 *
 * Dynamically renders any mantine-ciseco component from the registry.
 * Handles lazy loading, error boundaries, and provides metadata access.
 *
 * @example
 * ```tsx
 * // Simple usage
 * <UC is="Button" variant="primary">Click me</UC>
 *
 * // Product card with full props
 * <UC is="ProductCard" product={productData} layout="grid" />
 *
 * // With custom loading
 * <UC is="SectionHero" loader={<MyCustomLoader />} {...heroProps} />
 * ```
 */
export const UC: ForwardRefExoticComponent<UniversalMantineComponentProps & RefAttributes<any>> =
  forwardRef<any, UniversalMantineComponentProps>(
    ({ is, loader, skeleton = true, ...props }, ref) => {
      const Component = getComponent(is);

      if (!Component) {
        console.error(`[UniversalMantine] Component "${is}" not found in registry`);
        return (
          <div
            style={{
              backgroundColor: '#fee',
              border: '2px dashed #ff6b6b',
              borderRadius: '8px',
              color: '#c92a2a',
              padding: '1rem',
            }}
          >
            ⚠️ Component not found: <strong>{is}</strong>
          </div>
        );
      }

      const loadingComponent = useMemo(() => {
        if (loader) return loader;
        if (skeleton) {
          // Intelligent skeleton based on component type
          const metadata = getComponentWithMetadata(is)?.metadata;
          return <ComponentSkeleton metadata={metadata} />;
        }
        return null;
      }, [loader, skeleton, is]);

      return (
        <Suspense fallback={loadingComponent}>
          <Component ref={ref} {...props} />
        </Suspense>
      );
    },
  );

UC.displayName = 'UniversalMantineComponent';

/**
 * Intelligent skeleton loader based on component metadata
 */
function ComponentSkeleton({ metadata }: { metadata?: ComponentMetadata }) {
  if (!metadata) {
    return <Skeleton animate height={100} radius="md" />;
  }

  // Custom skeletons based on component category
  switch (metadata.category) {
    case 'product':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Skeleton height={200} radius="md" />
          <Skeleton width="70%" height={20} />
          <Skeleton width="30%" height={16} />
        </div>
      );

    case 'navigation':
      return <Skeleton width="100%" height={60} />;

    case 'section':
      return <Skeleton width="100%" height={400} radius="md" />;

    case 'blog':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Skeleton height={160} radius="md" />
          <Skeleton width="80%" height={24} />
          <Skeleton width="100%" height={16} />
          <Skeleton width="90%" height={16} />
        </div>
      );

    default:
      return <Skeleton animate height={100} radius="md" />;
  }
}

/**
 * Create typed component factories
 *
 * @example
 * ```tsx
 * // Create typed components
 * export const Button = createComponent<ButtonProps>('Button');
 * export const ProductCard = createComponent<ProductCardProps>('ProductCard');
 *
 * // Use with full type safety
 * <Button variant="primary" onClick={handleClick}>Click</Button>
 * <ProductCard product={product} showQuickView />
 * ```
 */
export function createComponent<P = any>(componentName: string) {
  return forwardRef<any, P>((props, ref) => (
    <UC ref={ref} is={componentName} {...props} />
  )) as ForwardRefExoticComponent<P & RefAttributes<any>>;
}

/**
 * Hook to use component metadata
 */
export function useComponentMetadata(componentName: string): ComponentMetadata | undefined {
  return useMemo(() => {
    return getComponentWithMetadata(componentName)?.metadata;
  }, [componentName]);
}

/**
 * Batch component creator for common components
 */
export const Components = {
  Divider: createComponent('Divider'),
  // Core UI
  AccordionInfo: createComponent('AccordionInfo'),
  AddToCartButton: createComponent('AddToCartButton'),
  BagIcon: createComponent('BagIcon'),
  Heading: createComponent('Heading'),
  Label: createComponent('Label'),
  Link: createComponent('Link'),
  MySwitch: createComponent('MySwitch'),
  NcInputNumber: createComponent('NcInputNumber'),
  Prices: createComponent('Prices'),
  ProgressiveImage: createComponent('ProgressiveImage'),
  VerifyIcon: createComponent('VerifyIcon'),

  LikeButton: createComponent('LikeButton'),
  LikeSaveBtns: createComponent('LikeSaveBtns'),
  // Product Components
  ProductCard: createComponent('ProductCard'),
  ProductCardLarge: createComponent('ProductCardLarge'),
  ProductQuickView: createComponent('ProductQuickView'),
  ProductStatus: createComponent('ProductStatus'),

  // Collection Components
  CollectionCard1: createComponent('CollectionCard1'),
  CollectionCard2: createComponent('CollectionCard2'),
  CollectionCard3: createComponent('CollectionCard3'),
  CollectionCard4: createComponent('CollectionCard4'),
  CollectionCard6: createComponent('CollectionCard6'),

  AvatarDropdown: createComponent('AvatarDropdown'),
  CartBtn: createComponent('CartBtn'),
  // Navigation Components
  Header: createComponent('Header'),
  Header2: createComponent('Header2'),
  Navigation: createComponent('Navigation'),

  // Section Components
  SectionHero: createComponent('SectionHero'),
  SectionHero2: createComponent('SectionHero2'),
  SectionHero3: createComponent('SectionHero3'),
  SectionPromo1: createComponent('SectionPromo1'),
  SectionPromo2: createComponent('SectionPromo2'),
  SectionPromo3: createComponent('SectionPromo3'),

  SidebarFilters: createComponent('SidebarFilters'),
  // Filter Components
  ArchiveFilterListBox: createComponent('ArchiveFilterListBox'),
  HeaderFilterSection: createComponent('HeaderFilterSection'),
  SortOrderFilter: createComponent('SortOrderFilter'),
  TabFilters: createComponent('TabFilters'),

  // Blog Components
  PostCard1: createComponent('PostCard1'),
  PostCard2: createComponent('PostCard2'),
  PostCardMeta: createComponent('PostCardMeta'),

  // Gallery Components
  ListingImageGallery: createComponent('ListingImageGallery'),

  // Shared Components
  Alert: createComponent('Alert'),
  Avatar: createComponent('Avatar'),
  Badge: createComponent('Badge'),
  Button: createComponent('Button'),
  ButtonPrimary: createComponent('ButtonPrimary'),
  ButtonSecondary: createComponent('ButtonSecondary'),
  Checkbox: createComponent('Checkbox'),
  Input: createComponent('Input'),
  Radio: createComponent('Radio'),
  Select: createComponent('Select'),
  Textarea: createComponent('Textarea'),

  // Add all other components...
} as const;

/**
 * Component discovery helper
 */
export {
  getAllComponents,
  getComponentsByCategory,
  getComponentsByTag,
  searchComponents,
} from './mantine-ciseco-registry';
