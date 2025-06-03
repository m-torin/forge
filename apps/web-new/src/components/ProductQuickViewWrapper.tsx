"use client";

import { useAppLayout } from "@/components/AppLayout";
import { Portal } from "@mantine/core";
import { useEffect } from "react";

import { useAside } from "@repo/design-system/ciseco/components/aside";
import ProductQuickView from "@repo/design-system/ciseco/components/ProductQuickView";

const ProductQuickViewWrapper = () => {
  const {
    type: asideType,
    close: closeAside,
    productQuickViewHandle,
  } = useAside();
  const {
    asideOpened,
    setAside,
    setAsideEnabled,
    setAsideWidth,
    isMobile,
    isTablet,
  } = useAppLayout();

  // Watch for ciseco aside product-quick-view events and redirect to AppLayout aside
  useEffect(() => {
    if (asideType === "product-quick-view" && productQuickViewHandle) {
      // Close the ciseco aside
      closeAside();

      // Set aside width to 800px for product quick view
      setAsideWidth(800);

      // Enable and open AppLayout aside
      setAsideEnabled(true);
      setAside(true);
    }
  }, [
    asideType,
    productQuickViewHandle,
    closeAside,
    setAsideEnabled,
    setAside,
    setAsideWidth,
    isMobile,
    isTablet,
  ]);

  // Only render content when AppLayout aside is open and we have a product handle
  const shouldShowQuickView = asideOpened && productQuickViewHandle;

  if (!shouldShowQuickView) {
    return null;
  }

  const handleClose = () => {
    setAside(false);
  };

  return (
    <Portal target="#aside-portal-target">
      <div className="flex h-full flex-col -m-4">
        {" "}
        {/* Negative margin to counteract AppLayout padding */}
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700 flex-shrink-0">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Product Details
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
            aria-label="Close"
            type="button"
          >
            <svg
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="w-5 h-5 text-neutral-500 dark:text-neutral-400"
              fill="none"
            >
              <path
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-4">
            <ProductQuickView />
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default ProductQuickViewWrapper;
