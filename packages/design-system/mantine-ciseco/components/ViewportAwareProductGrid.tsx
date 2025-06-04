'use client';

import { useWindowScroll, useViewportSize, useInViewport, useDocumentVisibility } from '@mantine/hooks';
import { useMemo, useEffect, useState } from 'react';
import clsx from 'clsx';

import { type TProductItem } from '../data/data';
import ProductCard from './ProductCard';

interface ViewportAwareProductGridProps {
  products: TProductItem[];
  itemHeight?: number;
  bufferItems?: number;
  className?: string;
  onNearEnd?: () => void;
}

export function ViewportAwareProductGrid({
  products,
  itemHeight = 400,
  bufferItems = 3,
  className,
  onNearEnd,
}: ViewportAwareProductGridProps) {
  const [scroll] = useWindowScroll();
  const { height: viewportHeight } = useViewportSize();
  const documentVisibility = useDocumentVisibility();
  const { ref: endRef, inViewport: nearEnd } = useInViewport();
  
  // Track which items have been visible (for preloading)
  const [seenItems, setSeenItems] = useState(new Set<number>());
  
  // Calculate visible range with buffer
  const visibleRange = useMemo(() => {
    const scrollTop = scroll.y;
    const itemsPerRow = 4; // Adjust based on your grid
    const rowHeight = itemHeight;
    
    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - bufferItems);
    const endRow = Math.ceil((scrollTop + viewportHeight) / rowHeight) + bufferItems;
    
    const start = startRow * itemsPerRow;
    const end = Math.min(products.length, endRow * itemsPerRow);
    
    return { start, end };
  }, [scroll.y, viewportHeight, itemHeight, bufferItems, products.length]);
  
  // Preload next batch when near end
  useEffect(() => {
    if (nearEnd && onNearEnd) {
      onNearEnd();
    }
  }, [nearEnd, onNearEnd]);
  
  // Track seen items for intelligent preloading
  useEffect(() => {
    if (documentVisibility === 'visible') {
      const newSeenItems = new Set(seenItems);
      for (let i = visibleRange.start; i < visibleRange.end; i++) {
        newSeenItems.add(i);
      }
      setSeenItems(newSeenItems);
    }
  }, [visibleRange, documentVisibility]);
  
  // Render virtualized grid
  return (
    <div className={clsx('relative', className)}>
      {/* Virtual spacer for scroll height */}
      <div 
        style={{ 
          height: Math.ceil(products.length / 4) * itemHeight 
        }} 
      />
      
      {/* Rendered items */}
      <div className="absolute inset-x-0 top-0 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.slice(visibleRange.start, visibleRange.end).map((product, index) => {
          const actualIndex = visibleRange.start + index;
          const hasBeenSeen = seenItems.has(actualIndex);
          
          return (
            <div
              key={product.id}
              style={{
                transform: `translateY(${Math.floor(actualIndex / 4) * itemHeight}px)`,
              }}
              className="absolute w-full"
            >
              <ProductCard
                data={product}
                loading={!hasBeenSeen ? 'lazy' : 'eager'}
                priority={actualIndex < 8} // First 8 items
              />
            </div>
          );
        })}
      </div>
      
      {/* Intersection observer target for infinite scroll */}
      <div ref={endRef} className="absolute bottom-0 h-px w-full" />
    </div>
  );
}

// Hook for progressive data loading
export function useProgressiveProducts(
  initialProducts: TProductItem[],
  loadMore: () => Promise<TProductItem[]>
) {
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const loadNextBatch = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const newProducts = await loadMore();
      if (newProducts.length === 0) {
        setHasMore(false);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return { products, loading, hasMore, loadNextBatch };
}