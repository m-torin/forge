"use client";

import { useGuestActions } from "@/contexts/GuestActionsContext";

// Convenience hook for responsive behavior
export function useResponsive() {
  const { device } = useGuestActions();
  return device;
}

// Hook for responsive grid layouts
export function useResponsiveGrid() {
  const { device } = useGuestActions();
  const { width: _width } = device.viewport;

  const columns = device.isMobile
    ? 1
    : device.isTablet
      ? 2
      : device.isDesktop
        ? 4
        : 3;
  const gap = device.isMobile ? 16 : device.isTablet ? 20 : 24;

  // Calculate items per page based on viewport
  const itemsPerPage =
    columns * (device.isMobile ? 6 : device.isTablet ? 4 : 3);

  return {
    gridClass: `grid grid-cols-${columns} gap-${gap}px`,
    columns,
    gap,
    itemsPerPage,
  };
}

// Hook for responsive product loading
export function useResponsiveProductLoad() {
  const { device, preferences } = useGuestActions();
  const { viewport: _viewport } = device;

  // Adjust based on viewport and view mode
  const isGridView = preferences.get("viewMode") === "grid";

  const productsPerRow = device.isMobile
    ? 1
    : device.isTablet
      ? isGridView
        ? 2
        : 1
      : isGridView
        ? 4
        : 2;

  const initialLoadCount = productsPerRow * 3; // Load 3 rows initially
  const loadMoreCount = productsPerRow * 2; // Load 2 more rows on scroll

  return {
    isGridView,
    initialLoadCount,
    loadMoreCount,
    productsPerRow,
  };
}

// Hook for responsive image sizes
export function useResponsiveImage() {
  const { device } = useGuestActions();

  const getImageSize = (base: number) => {
    if (device.isMobile) return base * 0.75;
    if (device.isTablet) return base * 0.85;
    return base;
  };

  const getSizes = () => {
    if (device.isMobile) return "100vw";
    if (device.isTablet) return "50vw";
    return "25vw";
  };

  return {
    getImageSize,
    getSizes,
    priority: device.isMobile ? false : true,
    quality: device.isMobile ? 75 : 90,
  };
}
