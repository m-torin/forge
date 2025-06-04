import {
  getProductInventory,
  getProductPricing,
  trackProductView,
} from "@/actions/products";
import { Suspense } from "react";

// Loading skeletons
export function PriceSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-24 bg-neutral-200 rounded dark:bg-neutral-700" />
    </div>
  );
}

export function InventorySkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-6 w-32 bg-neutral-200 rounded dark:bg-neutral-700" />
    </div>
  );
}

// Dynamic pricing component - streams in after static shell
export async function DynamicProductPrice({
  basePrice,
  customerGroup,
  productId,
}: {
  productId: string;
  basePrice: number;
  customerGroup?: string;
}) {
  const pricing = await getProductPricing(productId, { customerGroup });

  return (
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        ${pricing.finalPrice.toFixed(2)}
      </span>
      {pricing.discount > 0 && (
        <>
          <span className="text-lg text-neutral-500 line-through">
            ${pricing.basePrice.toFixed(2)}
          </span>
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            {(pricing.discount * 100).toFixed(0)}% off
          </span>
        </>
      )}
    </div>
  );
}

// Dynamic inventory component
export async function DynamicProductInventory({
  productId,
}: {
  productId: string;
}) {
  const inventory = await getProductInventory(productId);

  const isLowStock = inventory.available < 10;
  const isOutOfStock = inventory.available === 0;

  return (
    <div className="flex items-center gap-2">
      <div
        className={`h-2 w-2 rounded-full ${
          isOutOfStock
            ? "bg-red-500"
            : isLowStock
              ? "bg-yellow-500"
              : "bg-green-500"
        }`}
      />
      <span
        className={`text-sm font-medium ${
          isOutOfStock
            ? "text-red-600 dark:text-red-400"
            : isLowStock
              ? "text-yellow-600 dark:text-yellow-400"
              : "text-green-600 dark:text-green-400"
        }`}
      >
        {isOutOfStock
          ? "Out of stock"
          : isLowStock
            ? `Only ${inventory.available} left`
            : "In stock"}
      </span>
    </div>
  );
}

// Product view tracker - fires and forgets
export async function ProductViewTracker({ productId }: { productId: string }) {
  // Fire and forget - don't block rendering
  trackProductView(productId).catch(console.error);
  return null;
}

// Wrapper component for PPR
export function ProductPriceSection({
  basePrice,
  productId,
}: {
  productId: string;
  basePrice: number;
}) {
  return (
    <Suspense fallback={<PriceSkeleton />}>
      <DynamicProductPrice productId={productId} basePrice={basePrice} />
    </Suspense>
  );
}

export function ProductInventorySection({ productId }: { productId: string }) {
  return (
    <Suspense fallback={<InventorySkeleton />}>
      <DynamicProductInventory productId={productId} />
    </Suspense>
  );
}
