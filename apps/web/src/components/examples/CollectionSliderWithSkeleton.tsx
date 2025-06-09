/**
 * Example: Collection Slider with Skeleton Loading
 * 
 * This example shows how to integrate skeleton loading states
 * into collection slider components.
 */

"use client";

import { CollectionSliderSkeleton } from "@/components/LoadingSkeletons";
import { SkeletonWrapper } from "@/components/SkeletonWrapper";

import { CollectionCard1 } from "@repo/design-system/mantine-ciseco";

import type { TCollection } from "@/lib/data-service";

interface CollectionSliderWithSkeletonProps {
  className?: string;
  collections?: TCollection[];
  count?: number;
  isLoading?: boolean;
}

export function CollectionSliderWithSkeleton({
  className = "",
  collections = [],
  count = 4,
  isLoading = false,
}: CollectionSliderWithSkeletonProps) {
  return (
    <SkeletonWrapper
      isLoading={isLoading}
      skeleton={<CollectionSliderSkeleton count={count} />}
      className={className}
      fallback={
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
            No collections available
          </h3>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Collections will appear here when available.
          </p>
        </div>
      }
    >
      {collections.length > 0 && (
        <div className="flex gap-6 overflow-x-auto pb-4">
          {collections.map((collection) => (
            <div key={collection.id} className="min-w-[300px] flex-shrink-0">
              <CollectionCard1 data={collection} />
            </div>
          ))}
        </div>
      )}
    </SkeletonWrapper>
  );
}