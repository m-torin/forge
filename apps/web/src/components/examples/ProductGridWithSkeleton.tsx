/**
 * Example: ProductGrid with Skeleton Loading
 * 
 * This example shows how to integrate skeleton loading states
 * into a product grid component using the SkeletonWrapper pattern.
 */

"use client";

import { ProductGridSkeleton } from "@/components/LoadingSkeletons";
import { SkeletonWrapper } from "@/components/SkeletonWrapper";
import { useEffect, useState } from "react";

import { ProductCard } from "@repo/design-system/mantine-ciseco";

import type { TCardProduct } from "@/data/data-service";

interface ProductGridWithSkeletonProps {
  className?: string;
  count?: number;
  isLoading?: boolean;
  products?: TCardProduct[];
}

export function ProductGridWithSkeleton({
  className = "",
  count = 8,
  isLoading = false,
  products = [],
}: ProductGridWithSkeletonProps) {
  return (
    <SkeletonWrapper
      isLoading={isLoading}
      skeleton={<ProductGridSkeleton count={count} />}
      className={className}
      fallback={
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
            No products found
          </h3>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      }
    >
      {products.length > 0 && (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} data={product} />
          ))}
        </div>
      )}
    </SkeletonWrapper>
  );
}

/**
 * Example: Async Product Grid Hook
 * 
 * Shows how to manage async data loading with skeleton states
 */
export function useProductsWithSkeleton() {
  const [products, setProducts] = useState<TCardProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Import data service
        const { getProducts } = await import("@/data/data-service");
        const productsData = await getProducts();
        
        setProducts(productsData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch products'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return { error, isLoading, products };
}

/**
 * Example: Complete Product Grid Page Component
 */
export function ProductGridPage() {
  const { error, isLoading, products } = useProductsWithSkeleton();

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-red-600">Error loading products</h3>
        <p className="mt-2 text-neutral-600">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          All Products
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Discover our complete collection
        </p>
      </div>
      
      <ProductGridWithSkeleton 
        count={12}
        isLoading={isLoading}
        products={products}
      />
    </div>
  );
}