'use client';

import { logger } from '@/lib/logger';
import { useEffect, useState } from 'react';

import { LayoutSwitcher } from './layout-switcher';
import { ChildrenLayout } from './layouts/children';
import { GalleryLayout } from './layouts/gallery';
import { MinimalLayout } from './layouts/minimal';
import { ShowcaseLayout } from './layouts/showcase';
import { StandardLayout } from './layouts/standard';
import { type LayoutType } from './types';

interface ClientWrapperProps {
  dict: any;
  locale: string;
  product: any;
  relatedProducts: any[];
  reviews: any[];
}

export function ClientWrapper({
  dict,
  locale,
  product,
  relatedProducts,
  reviews,
}: ClientWrapperProps) {
  const [layoutType, setLayoutType] = useState<LayoutType>('standard');

  // Track product view on mount
  useEffect(() => {
    if (product?.id) {
      logger.track('Product Viewed', {
        url: window.location.href,
        brand: 'Your Brand Name',
        category: 'general',
        currency: 'USD',
        imageUrl: product.featuredImage?.src,
        locale,
        price: product.price || 0,
        productId: product.id,
        productName: product.title || '',
        value: product.price || 0,
      });
    }
  }, [product, locale]);

  const handleLayoutChange = (type: LayoutType) => {
    setLayoutType(type);

    // Layout change tracking would go here if needed
    // For now, we're focusing on core analytics events
  };

  const layoutProps = {
    dict,
    locale,
    product,
    relatedProducts,
    reviews,
  };

  return (
    <>
      <LayoutSwitcher layoutType={layoutType} setLayoutType={handleLayoutChange} />
      {layoutType === 'standard' && <StandardLayout {...layoutProps} />}
      {layoutType === 'gallery' && <GalleryLayout {...layoutProps} />}
      {layoutType === 'minimal' && <MinimalLayout {...layoutProps} />}
      {layoutType === 'children' && <ChildrenLayout {...layoutProps} />}
      {layoutType === 'showcase' && <ShowcaseLayout {...layoutProps} />}
    </>
  );
}
